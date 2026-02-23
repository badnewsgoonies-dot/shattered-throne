import {
  CRIT_MULTIPLIER,
  DOUBLE_ATTACK_SPEED_THRESHOLD,
  Element,
  HEIGHT_ADVANTAGE_HIT_BONUS,
  HEIGHT_DISADVANTAGE_HIT_PENALTY,
  ICombatEngine,
  SUPPORT_HIT_EVADE_BONUS_PER_ALLY,
  TerrainData,
  Unit,
  WeaponData,
  WeaponType,
} from '../shared/types';
import { calculateDamage as calculateDamageInternal } from './damageCalculator';
import { calculateExpGain as calculateExpGainInternal } from './expCalculator';
import { calculateCritRate as calculateCritRateInternal, calculateHitRate as calculateHitRateInternal } from './hitCalculator';
import { executeSkill as executeSkillInternal } from './skillExecutor';
import { checkDefeatConditions as checkDefeatConditionsInternal, checkVictoryConditions as checkVictoryConditionsInternal } from './victoryConditions';
import { getMagicTriangleBonus, getWeaponTriangleBonus } from './weaponTriangle';

const MAGIC_WEAPON_TYPES: WeaponType[] = [
  WeaponType.FireTome,
  WeaponType.WindTome,
  WeaponType.ThunderTome,
  WeaponType.DarkTome,
  WeaponType.LightTome,
  WeaponType.Staff,
];

function isMagicWeapon(weaponType: WeaponType): boolean {
  return MAGIC_WEAPON_TYPES.includes(weaponType);
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function getElementFromWeaponType(weaponType: WeaponType): Element | null {
  switch (weaponType) {
    case WeaponType.FireTome:
      return Element.Fire;
    case WeaponType.WindTome:
      return Element.Wind;
    case WeaponType.ThunderTome:
      return Element.Thunder;
    case WeaponType.DarkTome:
      return Element.Dark;
    case WeaponType.LightTome:
      return Element.Light;
    default:
      return null;
  }
}

function getTriangleHitBonus(attackerWeapon: WeaponData, defenderWeapon: WeaponData | null): number {
  if (!defenderWeapon) {
    return 0;
  }

  const attackerElement = attackerWeapon.element ?? getElementFromWeaponType(attackerWeapon.weaponType);
  const defenderElement = defenderWeapon.element ?? getElementFromWeaponType(defenderWeapon.weaponType);

  if (attackerElement && defenderElement) {
    return getMagicTriangleBonus(attackerElement, defenderElement).hitBonus;
  }

  return getWeaponTriangleBonus(attackerWeapon.weaponType, defenderWeapon.weaponType).hitBonus;
}

function getHeightHitModifier(attackerTerrain: TerrainData, defenderTerrain: TerrainData): number {
  if (attackerTerrain.heightLevel > defenderTerrain.heightLevel) {
    return HEIGHT_ADVANTAGE_HIT_BONUS;
  }

  if (attackerTerrain.heightLevel < defenderTerrain.heightLevel) {
    return -HEIGHT_DISADVANTAGE_HIT_PENALTY;
  }

  return 0;
}

function canCounter(distance: number, weapon: WeaponData | null): boolean {
  if (!weapon) {
    return false;
  }

  return distance >= weapon.range.min && distance <= weapon.range.max;
}

function computeFinalHitRate(
  attacker: Unit,
  defender: Unit,
  attackerWeapon: WeaponData,
  defenderWeapon: WeaponData | null,
  attackerTerrain: TerrainData,
  defenderTerrain: TerrainData,
  attackerAllies: number,
  defenderAllies: number,
): number {
  const baseHit = calculateHitRateInternal(attacker, defender, attackerWeapon, defenderTerrain, attackerAllies);
  const triangleBonus = getTriangleHitBonus(attackerWeapon, defenderWeapon);
  const heightBonus = getHeightHitModifier(attackerTerrain, defenderTerrain);
  const defenderSupportEvasion = defenderAllies * SUPPORT_HIT_EVADE_BONUS_PER_ALLY;

  return clampPercent(baseHit + triangleBonus + heightBonus - defenderSupportEvasion);
}

function performSingleAttack(
  attacker: Unit,
  defender: Unit,
  attackerWeapon: WeaponData,
  defenderWeapon: WeaponData | null,
  attackerTerrain: TerrainData,
  defenderTerrain: TerrainData,
  distance: number,
): {
  damageDealt: number;
  hit: boolean;
  crit: boolean;
  attackerHPAfter: number;
  defenderHPAfter: number;
} {
  const baseDamage = calculateDamageInternal(attacker, defender, attackerWeapon, defenderWeapon, defenderTerrain, distance);
  const hitRate = computeFinalHitRate(
    attacker,
    defender,
    attackerWeapon,
    defenderWeapon,
    attackerTerrain,
    defenderTerrain,
    0,
    0,
  );

  const hit = Math.random() * 100 < hitRate;
  let crit = false;
  let damageDealt = 0;

  if (hit) {
    const critRate = calculateCritRateInternal(attacker, defender, attackerWeapon);
    crit = Math.random() * 100 < critRate;
    damageDealt = crit ? baseDamage * CRIT_MULTIPLIER : baseDamage;

    defender.currentHP = Math.max(0, defender.currentHP - damageDealt);
    defender.isAlive = defender.currentHP > 0;
  }

  return {
    damageDealt,
    hit,
    crit,
    attackerHPAfter: attacker.currentHP,
    defenderHPAfter: defender.currentHP,
  };
}

export function createCombatEngine(): ICombatEngine {
  return {
    calculateDamage(
      attacker: Unit,
      defender: Unit,
      attackerWeapon: WeaponData,
      defenderWeapon: WeaponData | null,
      terrain: TerrainData,
      distance: number,
    ): number {
      return calculateDamageInternal(attacker, defender, attackerWeapon, defenderWeapon, terrain, distance);
    },

    calculateHitRate(
      attacker: Unit,
      defender: Unit,
      attackerWeapon: WeaponData,
      terrain: TerrainData,
      adjacentAllies: number,
    ): number {
      return calculateHitRateInternal(attacker, defender, attackerWeapon, terrain, adjacentAllies);
    },

    calculateCritRate(
      attacker: Unit,
      defender: Unit,
      attackerWeapon: WeaponData,
    ): number {
      return calculateCritRateInternal(attacker, defender, attackerWeapon);
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
    ) {
      const defenderCanCounter = canCounter(distance, defenderWeapon);

      const attackerDamage = calculateDamageInternal(
        attacker,
        defender,
        attackerWeapon,
        defenderWeapon,
        defenderTerrain,
        distance,
      );

      const attackerHit = computeFinalHitRate(
        attacker,
        defender,
        attackerWeapon,
        defenderWeapon,
        attackerTerrain,
        defenderTerrain,
        attackerAllies,
        defenderAllies,
      );

      const attackerCrit = calculateCritRateInternal(attacker, defender, attackerWeapon);
      const attackerDoubles = attacker.currentStats.speed - defender.currentStats.speed > DOUBLE_ATTACK_SPEED_THRESHOLD;

      const defenderDamage = defenderCanCounter && defenderWeapon
        ? calculateDamageInternal(defender, attacker, defenderWeapon, attackerWeapon, attackerTerrain, distance)
        : 0;

      const defenderHit = defenderCanCounter && defenderWeapon
        ? computeFinalHitRate(
          defender,
          attacker,
          defenderWeapon,
          attackerWeapon,
          defenderTerrain,
          attackerTerrain,
          defenderAllies,
          attackerAllies,
        )
        : 0;

      const defenderCrit = defenderCanCounter && defenderWeapon
        ? calculateCritRateInternal(defender, attacker, defenderWeapon)
        : 0;

      const defenderDoubles = defenderCanCounter
        && defender.currentStats.speed - attacker.currentStats.speed > DOUBLE_ATTACK_SPEED_THRESHOLD;

      return {
        attackerDamage,
        attackerHit,
        attackerCrit,
        attackerDoubles,
        defenderDamage,
        defenderHit,
        defenderCrit,
        defenderDoubles,
        defenderCanCounter,
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
    ) {
      const rounds = [];
      const forecast = this.getBattleForecast(
        attacker,
        defender,
        attackerWeapon,
        defenderWeapon,
        attackerTerrain,
        defenderTerrain,
        distance,
        0,
        0,
      );

      if (attacker.isAlive && defender.isAlive) {
        const attackerStrike = performSingleAttack(
          attacker,
          defender,
          attackerWeapon,
          defenderWeapon,
          attackerTerrain,
          defenderTerrain,
          distance,
        );

        rounds.push({
          attacker: attacker.id,
          damage: attackerStrike.damageDealt,
          hit: attackerStrike.hit,
          crit: attackerStrike.crit,
          attackerHPAfter: attackerStrike.attackerHPAfter,
          defenderHPAfter: attackerStrike.defenderHPAfter,
        });
      }

      if (defender.isAlive && forecast.defenderCanCounter && defenderWeapon) {
        const defenderStrike = performSingleAttack(
          defender,
          attacker,
          defenderWeapon,
          attackerWeapon,
          defenderTerrain,
          attackerTerrain,
          distance,
        );

        rounds.push({
          attacker: defender.id,
          damage: defenderStrike.damageDealt,
          hit: defenderStrike.hit,
          crit: defenderStrike.crit,
          attackerHPAfter: defenderStrike.attackerHPAfter,
          defenderHPAfter: defenderStrike.defenderHPAfter,
        });
      }

      if (attacker.isAlive && defender.isAlive && forecast.attackerDoubles) {
        const attackerFollowUp = performSingleAttack(
          attacker,
          defender,
          attackerWeapon,
          defenderWeapon,
          attackerTerrain,
          defenderTerrain,
          distance,
        );

        rounds.push({
          attacker: attacker.id,
          damage: attackerFollowUp.damageDealt,
          hit: attackerFollowUp.hit,
          crit: attackerFollowUp.crit,
          attackerHPAfter: attackerFollowUp.attackerHPAfter,
          defenderHPAfter: attackerFollowUp.defenderHPAfter,
        });
      }

      if (
        attacker.isAlive
        && defender.isAlive
        && forecast.defenderCanCounter
        && forecast.defenderDoubles
        && defenderWeapon
      ) {
        const defenderFollowUp = performSingleAttack(
          defender,
          attacker,
          defenderWeapon,
          attackerWeapon,
          defenderTerrain,
          attackerTerrain,
          distance,
        );

        rounds.push({
          attacker: defender.id,
          damage: defenderFollowUp.damageDealt,
          hit: defenderFollowUp.hit,
          crit: defenderFollowUp.crit,
          attackerHPAfter: defenderFollowUp.attackerHPAfter,
          defenderHPAfter: defenderFollowUp.defenderHPAfter,
        });
      }

      const attackerDamageDealt = rounds
        .filter((round) => round.attacker === attacker.id)
        .reduce((sum, round) => sum + round.damage, 0);

      const defenderDamageDealt = rounds
        .filter((round) => round.attacker === defender.id)
        .reduce((sum, round) => sum + round.damage, 0);

      if (!defender.isAlive && attackerDamageDealt > 0) {
        attacker.killCount += 1;
      }

      if (!attacker.isAlive && defenderDamageDealt > 0) {
        defender.killCount += 1;
      }

      const attackerExpGained = calculateExpGainInternal(
        attacker,
        defender,
        attackerDamageDealt,
        !defender.isAlive,
      );

      const defenderExpGained = rounds.some((round) => round.attacker === defender.id)
        ? calculateExpGainInternal(defender, attacker, defenderDamageDealt, !attacker.isAlive)
        : 0;

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

    executeSkill(user, skill, targets, map) {
      return executeSkillInternal(user, skill, targets, map);
    },

    getWeaponTriangleBonus(attackerWeapon: WeaponType, defenderWeapon: WeaponType): { hitBonus: number; damageBonus: number } {
      return getWeaponTriangleBonus(attackerWeapon, defenderWeapon);
    },

    getMagicTriangleBonus(attackerElement: Element, defenderElement: Element): { hitBonus: number; damageBonus: number } {
      return getMagicTriangleBonus(attackerElement, defenderElement);
    },

    checkVictoryConditions(conditions, units, turnNumber): boolean {
      return checkVictoryConditionsInternal(conditions, units, turnNumber);
    },

    checkDefeatConditions(conditions, units, turnNumber): boolean {
      return checkDefeatConditionsInternal(conditions, units, turnNumber);
    },

    calculateExpGain(attacker: Unit, defender: Unit, damageDealt: number, killed: boolean): number {
      return calculateExpGainInternal(attacker, defender, damageDealt, killed);
    },
  };
}
