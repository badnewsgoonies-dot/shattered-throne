import {
  SUPPORT_HIT_EVADE_BONUS_PER_ALLY,
  TerrainData,
  Unit,
  UnitClassName,
  WeaponData,
} from '../shared/types';

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function getClassCritBonus(className: UnitClassName): number {
  switch (className) {
    case UnitClassName.Berserker:
      return 10;
    case UnitClassName.Assassin:
      return 15;
    case UnitClassName.Sniper:
      return 10;
    case UnitClassName.Thief:
      return 5;
    default:
      return 0;
  }
}

export function calculateHitRate(
  attacker: Unit,
  defender: Unit,
  attackerWeapon: WeaponData,
  terrain: TerrainData,
  adjacentAllies: number,
): number {
  const supportBonus = adjacentAllies * SUPPORT_HIT_EVADE_BONUS_PER_ALLY;
  const forgeHitBonus = attackerWeapon.forgeBonuses?.hit ?? 0;

  const hitRate = (attacker.currentStats.skill * 2 + attacker.currentStats.luck)
    + attackerWeapon.hit
    + forgeHitBonus
    - (defender.currentStats.speed * 2 + defender.currentStats.luck)
    - terrain.evasionBonus
    + supportBonus;

  return clampPercent(hitRate);
}

export function calculateCritRate(
  attacker: Unit,
  defender: Unit,
  attackerWeapon: WeaponData,
): number {
  const classBonus = getClassCritBonus(attacker.className);
  const forgeCritBonus = attackerWeapon.forgeBonuses?.crit ?? 0;

  const critRate = attacker.currentStats.skill / 2
    + attackerWeapon.crit
    + forgeCritBonus
    + classBonus
    - defender.currentStats.luck;

  return clampPercent(critRate);
}
