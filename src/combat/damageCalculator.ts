import {
  Element,
  TerrainData,
  Unit,
  WeaponData,
  WeaponType,
} from '../shared/types';
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

function getTriangleDamageBonus(attackerWeapon: WeaponData, defenderWeapon: WeaponData | null): number {
  if (!defenderWeapon) {
    return 0;
  }

  if (isMagicWeapon(attackerWeapon.weaponType)) {
    const attackerElement = attackerWeapon.element ?? getElementFromWeaponType(attackerWeapon.weaponType);
    const defenderElement = defenderWeapon.element ?? getElementFromWeaponType(defenderWeapon.weaponType);

    if (!attackerElement || !defenderElement) {
      return 0;
    }

    return getMagicTriangleBonus(attackerElement, defenderElement).damageBonus;
  }

  return getWeaponTriangleBonus(attackerWeapon.weaponType, defenderWeapon.weaponType).damageBonus;
}

export function calculateDamage(
  attacker: Unit,
  defender: Unit,
  attackerWeapon: WeaponData,
  defenderWeapon: WeaponData | null,
  terrain: TerrainData,
  distance: number,
): number {
  void distance;

  const isMagic = isMagicWeapon(attackerWeapon.weaponType);
  const triangleDamageBonus = getTriangleDamageBonus(attackerWeapon, defenderWeapon);

  let baseDamage: number;
  if (isMagic) {
    baseDamage = attacker.currentStats.magic + attackerWeapon.might + triangleDamageBonus - defender.currentStats.resistance;
  } else {
    baseDamage = attacker.currentStats.strength + attackerWeapon.might + triangleDamageBonus - defender.currentStats.defense;
  }

  baseDamage -= terrain.defenseBonus;

  if (attackerWeapon.effectiveAgainst?.includes(defender.movementType)) {
    baseDamage += attackerWeapon.might * 2;
  }

  return Math.max(0, baseDamage);
}
