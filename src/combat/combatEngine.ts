import {
  Unit,
  WeaponData,
  TerrainData,
  WeaponType,
  Element,
  SkillDefinition,
  GridMap,
  BattleForecast,
  CombatResult,
  CombatRound,
  VictoryConditionDef,
  DefeatConditionDef,
  ICombatEngine,
  DOUBLE_ATTACK_SPEED_THRESHOLD,
} from '../../shared/types';
import { calculateDamageWithHeight, applyCritical } from './damageCalculator';
import { calculateHitRate, calculateCritRate } from './hitCalculator';
import { getWeaponTriangleBonus, getMagicTriangleBonus } from './weaponTriangle';
import { calculateExpGain as calcExp } from './expCalculator';
import { checkVictoryConditions as checkVictory, checkDefeatConditions as checkDefeat } from './victoryConditions';
import { executeSkill as execSkill } from './skillExecutor';

function canCounter(
  defenderWeapon: WeaponData | null,
  distance: number,
): boolean {
  if (!defenderWeapon) return false;
  return distance >= defenderWeapon.range.min && distance <= defenderWeapon.range.max;
}

function canDouble(attackerSpeed: number, defenderSpeed: number): boolean {
  return attackerSpeed - defenderSpeed > DOUBLE_ATTACK_SPEED_THRESHOLD;
}

// Simple deterministic "random" based on a seed for testability
let rngSeed = 42;

export function setRngSeed(seed: number): void {
  rngSeed = seed;
}

function nextRandom(): number {
  // Simple LCG
  rngSeed = (rngSeed * 1103515245 + 12345) & 0x7fffffff;
  return (rngSeed % 100);
}

function createCombatEngineImpl(): ICombatEngine {
  return {
    calculateDamage(
      attacker: Unit,
      defender: Unit,
      attackerWeapon: WeaponData,
      defenderWeapon: WeaponData | null,
      terrain: TerrainData,
      distance: number,
    ): number {
      // When called with single terrain, use it as both attacker and defender terrain
      // with equal height (no height advantage)
      const neutralTerrain: TerrainData = { ...terrain, heightLevel: terrain.heightLevel };
      return calculateDamageWithHeight(
        attacker,
        defender,
        attackerWeapon,
        defenderWeapon,
        neutralTerrain,
        terrain,
        distance,
      );
    },

    calculateHitRate(
      attacker: Unit,
      defender: Unit,
      attackerWeapon: WeaponData,
      terrain: TerrainData,
      adjacentAllies: number,
    ): number {
      return calculateHitRate(attacker, defender, attackerWeapon, terrain, adjacentAllies);
    },

    calculateCritRate(
      attacker: Unit,
      defender: Unit,
      attackerWeapon: WeaponData,
    ): number {
      return calculateCritRate(attacker, defender, attackerWeapon);
    },

    getBattleForecast(
      attacker: Unit,
      defender: Unit,
      attackerWeapon: WeaponData,
      defenderWeapon: WeaponData | null,
      attackerTerrain: TerrainData,
      defenderTerrain: TerrainData,
      distance: number,
      attackerAllies: number,
      defenderAllies: number,
    ): BattleForecast {
      // Get triangle bonuses for hit
      let atkTriangleHit = 0;
      let defTriangleHit = 0;
      if (defenderWeapon) {
        const atkTriangle = getWeaponTriangleBonus(attackerWeapon.weaponType, defenderWeapon.weaponType);
        const defTriangle = getWeaponTriangleBonus(defenderWeapon.weaponType, attackerWeapon.weaponType);
        atkTriangleHit = atkTriangle.hitBonus;
        defTriangleHit = defTriangle.hitBonus;
      }

      const attackerDamage = calculateDamageWithHeight(
        attacker,
        defender,
        attackerWeapon,
        defenderWeapon,
        attackerTerrain,
        defenderTerrain,
        distance,
      );
      const attackerHit = calculateHitRate(
        attacker,
        defender,
        attackerWeapon,
        defenderTerrain,
        attackerAllies,
        atkTriangleHit,
        attackerTerrain,
        defenderAllies,
      );
      const attackerCrit = calculateCritRate(attacker, defender, attackerWeapon);
      const attackerDoubles = canDouble(attacker.currentStats.speed, defender.currentStats.speed);

      const defenderCanCounterAttack = canCounter(defenderWeapon, distance);

      let defenderDamage = 0;
      let defenderHit = 0;
      let defenderCrit = 0;
      let defenderDoubles = false;

      if (defenderCanCounterAttack && defenderWeapon) {
        defenderDamage = calculateDamageWithHeight(
          defender,
          attacker,
          defenderWeapon,
          attackerWeapon,
          defenderTerrain,
          attackerTerrain,
          distance,
        );
        defenderHit = calculateHitRate(
          defender,
          attacker,
          defenderWeapon,
          attackerTerrain,
          defenderAllies,
          defTriangleHit,
          defenderTerrain,
          attackerAllies,
        );
        defenderCrit = calculateCritRate(defender, attacker, defenderWeapon);
        defenderDoubles = canDouble(defender.currentStats.speed, attacker.currentStats.speed);
      }

      return {
        attackerDamage,
        attackerHit,
        attackerCrit,
        attackerDoubles,
        defenderDamage,
        defenderHit,
        defenderCrit,
        defenderDoubles,
        defenderCanCounter: defenderCanCounterAttack,
      };
    },

    resolveCombat(
      attacker: Unit,
      defender: Unit,
      attackerWeapon: WeaponData,
      defenderWeapon: WeaponData | null,
      attackerTerrain: TerrainData,
      defenderTerrain: TerrainData,
      distance: number,
    ): CombatResult {
      const rounds: CombatRound[] = [];
      let atkHP = attacker.currentHP;
      let defHP = defender.currentHP;
      let totalDamageToDefender = 0;

      const atkDmg = calculateDamageWithHeight(
        attacker, defender, attackerWeapon, defenderWeapon,
        attackerTerrain, defenderTerrain, distance,
      );
      const defDmg = defenderWeapon
        ? calculateDamageWithHeight(
            defender, attacker, defenderWeapon, attackerWeapon,
            defenderTerrain, attackerTerrain, distance,
          )
        : 0;

      // Get triangle hit bonuses
      let atkTriangleHit = 0;
      let defTriangleHit = 0;
      if (defenderWeapon) {
        atkTriangleHit = getWeaponTriangleBonus(attackerWeapon.weaponType, defenderWeapon.weaponType).hitBonus;
        defTriangleHit = getWeaponTriangleBonus(defenderWeapon.weaponType, attackerWeapon.weaponType).hitBonus;
      }

      const atkHitRate = calculateHitRate(
        attacker, defender, attackerWeapon, defenderTerrain, 0,
        atkTriangleHit, attackerTerrain, 0,
      );
      const defHitRate = defenderWeapon
        ? calculateHitRate(
            defender, attacker, defenderWeapon, attackerTerrain, 0,
            defTriangleHit, defenderTerrain, 0,
          )
        : 0;

      const atkCritRate = calculateCritRate(attacker, defender, attackerWeapon);
      const defCritRate = defenderWeapon
        ? calculateCritRate(defender, attacker, defenderWeapon)
        : 0;

      const defCanCounter = canCounter(defenderWeapon, distance);
      const atkDoubles = canDouble(attacker.currentStats.speed, defender.currentStats.speed);
      const defDoubles = defCanCounter && canDouble(defender.currentStats.speed, attacker.currentStats.speed);

      function doAttack(
        attackerId: string,
        damage: number,
        hitRate: number,
        critRate: number,
        isAttacker: boolean,
      ): CombatRound {
        const hitRoll = nextRandom();
        const isHit = hitRoll < hitRate;
        let actualDamage = 0;
        let isCrit = false;

        if (isHit) {
          const critRoll = nextRandom();
          isCrit = critRoll < critRate;
          actualDamage = isCrit ? applyCritical(damage) : damage;

          if (isAttacker) {
            defHP = Math.max(0, defHP - actualDamage);
            totalDamageToDefender += actualDamage;
          } else {
            atkHP = Math.max(0, atkHP - actualDamage);
          }
        }

        return {
          attacker: attackerId,
          damage: actualDamage,
          hit: isHit,
          crit: isCrit,
          attackerHPAfter: atkHP,
          defenderHPAfter: defHP,
        };
      }

      // 1. Attacker attacks
      rounds.push(doAttack(attacker.id, atkDmg, atkHitRate, atkCritRate, true));

      // 2. Defender counters (if alive and can counter)
      if (defHP > 0 && defCanCounter && defenderWeapon) {
        rounds.push(doAttack(defender.id, defDmg, defHitRate, defCritRate, false));
      }

      // 3. Attacker doubles (if alive and fast enough)
      if (atkHP > 0 && defHP > 0 && atkDoubles) {
        rounds.push(doAttack(attacker.id, atkDmg, atkHitRate, atkCritRate, true));
      }

      // 4. Defender doubles counter (if alive, can counter, and fast enough)
      if (atkHP > 0 && defHP > 0 && defDoubles && defenderWeapon) {
        rounds.push(doAttack(defender.id, defDmg, defHitRate, defCritRate, false));
      }

      const defenderKilled = defHP <= 0;
      const attackerExpGained = calcExp(attacker, defender, totalDamageToDefender, defenderKilled);
      const defenderExpGained = 0;

      return {
        attackerId: attacker.id,
        defenderId: defender.id,
        rounds,
        attackerExpGained,
        defenderExpGained,
        attackerLevelUp: null,
        defenderLevelUp: null,
      };
    },

    executeSkill(
      user: Unit,
      skill: SkillDefinition,
      targets: Unit[],
      map: GridMap,
    ): CombatResult {
      return execSkill(user, skill, targets, map);
    },

    getWeaponTriangleBonus(
      attackerWeapon: WeaponType,
      defenderWeapon: WeaponType,
    ): { hitBonus: number; damageBonus: number } {
      return getWeaponTriangleBonus(attackerWeapon, defenderWeapon);
    },

    getMagicTriangleBonus(
      attackerElement: Element,
      defenderElement: Element,
    ): { hitBonus: number; damageBonus: number } {
      return getMagicTriangleBonus(attackerElement, defenderElement);
    },

    checkVictoryConditions(
      conditions: VictoryConditionDef[],
      units: Unit[],
      turnNumber: number,
    ): boolean {
      return checkVictory(conditions, units, turnNumber);
    },

    checkDefeatConditions(
      conditions: DefeatConditionDef[],
      units: Unit[],
      turnNumber: number,
    ): boolean {
      return checkDefeat(conditions, units, turnNumber);
    },

    calculateExpGain(
      attacker: Unit,
      defender: Unit,
      damageDealt: number,
      killed: boolean,
    ): number {
      return calcExp(attacker, defender, damageDealt, killed);
    },
  };
}

export function createCombatEngine(): ICombatEngine {
  return createCombatEngineImpl();
}
