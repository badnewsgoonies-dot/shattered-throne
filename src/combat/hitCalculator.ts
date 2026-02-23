import {
  Unit,
  WeaponData,
  TerrainData,
  UnitClassName,
  HEIGHT_ADVANTAGE_HIT_BONUS,
  HEIGHT_DISADVANTAGE_HIT_PENALTY,
  SUPPORT_HIT_EVADE_BONUS_PER_ALLY,
} from '../shared/types';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function calculateHitRate(
  attacker: Unit,
  defender: Unit,
  attackerWeapon: WeaponData,
  terrain: TerrainData,
  adjacentAllies: number,
  weaponTriangleHitBonus: number = 0,
  attackerTerrain?: TerrainData,
  defenderAllies: number = 0,
): number {
  const forgeHit = attackerWeapon.forgeBonuses?.hit ?? 0;

  let hitRate =
    attacker.currentStats.skill * 2 +
    attacker.currentStats.luck +
    attackerWeapon.hit +
    forgeHit +
    weaponTriangleHitBonus;

  // Defender evasion
  hitRate -= defender.currentStats.speed * 2 + defender.currentStats.luck;

  // Terrain evasion bonus (defender's terrain)
  hitRate -= terrain.evasionBonus;

  // Support bonus: attacker gains hit per adjacent ally
  hitRate += adjacentAllies * SUPPORT_HIT_EVADE_BONUS_PER_ALLY;

  // Defender support evasion
  hitRate -= defenderAllies * SUPPORT_HIT_EVADE_BONUS_PER_ALLY;

  // Height bonuses
  if (attackerTerrain) {
    if (attackerTerrain.heightLevel > terrain.heightLevel) {
      hitRate += HEIGHT_ADVANTAGE_HIT_BONUS;
    } else if (attackerTerrain.heightLevel < terrain.heightLevel) {
      hitRate -= HEIGHT_DISADVANTAGE_HIT_PENALTY;
    }
  }

  return clamp(hitRate, 0, 100);
}

const CLASS_CRIT_BONUS: Partial<Record<UnitClassName, number>> = {
  [UnitClassName.Berserker]: 10,
  [UnitClassName.Assassin]: 15,
  [UnitClassName.Sniper]: 10,
  [UnitClassName.Thief]: 5,
};

export function calculateCritRate(
  attacker: Unit,
  defender: Unit,
  attackerWeapon: WeaponData,
): number {
  const forgeCrit = attackerWeapon.forgeBonuses?.crit ?? 0;
  const classBonus = CLASS_CRIT_BONUS[attacker.className] ?? 0;

  const critRate =
    Math.floor(attacker.currentStats.skill / 2) +
    attackerWeapon.crit +
    forgeCrit +
    classBonus -
    defender.currentStats.luck;

  return clamp(critRate, 0, 100);
}
