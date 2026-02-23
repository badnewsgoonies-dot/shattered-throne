import {
  ArmorData,
  BERSERK_ATTACK_BONUS_PERCENT,
  StatusEffectType,
  Stats,
  Unit,
  WeaponData,
} from '../shared/types';

export function getEffectiveStats(unit: Unit, equippedWeapon: WeaponData | null, equippedArmor: ArmorData[]): Stats {
  const effectiveStats: Stats = { ...unit.currentStats };

  if (equippedWeapon) {
    const weaponSpeedPenalty = Math.max(0, equippedWeapon.weight - unit.currentStats.strength);
    effectiveStats.speed = Math.max(0, effectiveStats.speed - weaponSpeedPenalty);
  }

  for (const armorPiece of equippedArmor) {
    effectiveStats.defense += armorPiece.defense;
    effectiveStats.resistance += armorPiece.resistance;
    effectiveStats.speed = Math.max(0, effectiveStats.speed - armorPiece.speedPenalty);
  }

  const hasBerserk = unit.activeStatusEffects.some((effect) => effect.type === StatusEffectType.Berserk);

  if (hasBerserk) {
    effectiveStats.strength = Math.round(effectiveStats.strength * (1 + BERSERK_ATTACK_BONUS_PERCENT / 100));
  }

  return effectiveStats;
}
