import {
  Unit,
  WeaponData,
  TerrainData,
  WeaponType,
  CRIT_MULTIPLIER,
} from '../../shared/types';
import { getWeaponTriangleBonus, getMagicTriangleBonus } from './weaponTriangle';

const MAGIC_WEAPON_TYPES = new Set([
  WeaponType.FireTome,
  WeaponType.WindTome,
  WeaponType.ThunderTome,
  WeaponType.DarkTome,
  WeaponType.LightTome,
  WeaponType.Staff,
]);

function isMagicWeapon(weaponType: WeaponType): boolean {
  return MAGIC_WEAPON_TYPES.has(weaponType);
}

export function calculateDamage(
  attacker: Unit,
  defender: Unit,
  attackerWeapon: WeaponData,
  defenderWeapon: WeaponData | null,
  terrain: TerrainData,
  distance: number,
): number {
  const magic = isMagicWeapon(attackerWeapon.weaponType);

  let weaponMight = attackerWeapon.might;

  // Forge bonuses
  const forgeMight = attackerWeapon.forgeBonuses?.might ?? 0;
  weaponMight += forgeMight;

  // Effectiveness bonus: 3x weapon might (base, before forge)
  if (
    attackerWeapon.effectiveAgainst &&
    attackerWeapon.effectiveAgainst.includes(defender.movementType)
  ) {
    weaponMight = attackerWeapon.might * 3 + forgeMight;
  }

  // Triangle bonuses
  let triangleDmgBonus = 0;
  if (defenderWeapon) {
    if (!magic && !isMagicWeapon(defenderWeapon.weaponType)) {
      triangleDmgBonus = getWeaponTriangleBonus(attackerWeapon.weaponType, defenderWeapon.weaponType).damageBonus;
    } else if (magic && isMagicWeapon(defenderWeapon.weaponType) && attackerWeapon.element && defenderWeapon.element) {
      triangleDmgBonus = getMagicTriangleBonus(attackerWeapon.element, defenderWeapon.element).damageBonus;
    }
  }

  const atkStat = magic ? attacker.currentStats.magic : attacker.currentStats.strength;
  const defStat = magic ? defender.currentStats.resistance : defender.currentStats.defense;

  let baseDamage = atkStat + weaponMight + triangleDmgBonus - defStat;

  // Terrain defense bonus
  baseDamage -= terrain.defenseBonus;

  // Height advantage: +15% damage if attacker height > defender height
  // We use the terrain heightLevel for the defender; attacker height is implicitly from their terrain
  // The spec says "if attacker height > defender height", but we only get defender terrain.
  // We'll interpret distance param as not height related, and use terrain.heightLevel for defender.
  // Since we only receive defender terrain, we skip height advantage in damage calc here
  // and handle it at a higher level if needed. Actually, re-reading the spec,
  // let's check: the spec says to apply height advantage if attacker height > defender height.
  // We don't have attacker terrain in this function. The interface only passes one terrain (defender's).
  // We'll treat the passed terrain as the defender's terrain. Height advantage would need attacker terrain too.
  // For now, we handle height advantage in the combatEngine where both terrains are available.

  return Math.max(0, baseDamage);
}

export function calculateDamageWithHeight(
  attacker: Unit,
  defender: Unit,
  attackerWeapon: WeaponData,
  defenderWeapon: WeaponData | null,
  attackerTerrain: TerrainData,
  defenderTerrain: TerrainData,
  distance: number,
): number {
  let damage = calculateDamage(attacker, defender, attackerWeapon, defenderWeapon, defenderTerrain, distance);

  // Height advantage: +15% damage
  if (attackerTerrain.heightLevel > defenderTerrain.heightLevel) {
    damage = Math.floor(damage * 1.15);
  }

  return damage;
}

export function applyCritical(damage: number): number {
  return damage * CRIT_MULTIPLIER;
}
