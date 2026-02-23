import {
  Element,
  MAGIC_TRIANGLE_DAMAGE_BONUS,
  MAGIC_TRIANGLE_HIT_BONUS,
  WEAPON_TRIANGLE_DAMAGE_BONUS,
  WEAPON_TRIANGLE_HIT_BONUS,
  WeaponType,
} from '../shared/types';

const PHYSICAL_TRIANGLE: Partial<Record<WeaponType, WeaponType>> = {
  [WeaponType.Sword]: WeaponType.Axe,
  [WeaponType.Axe]: WeaponType.Lance,
  [WeaponType.Lance]: WeaponType.Sword,
};

const MAGIC_TRIANGLE: Partial<Record<Element, Element>> = {
  [Element.Fire]: Element.Wind,
  [Element.Wind]: Element.Thunder,
  [Element.Thunder]: Element.Fire,
};

function isPhysicalTriangleWeapon(weaponType: WeaponType): boolean {
  return weaponType in PHYSICAL_TRIANGLE;
}

export function getWeaponTriangleBonus(
  attackerWeapon: WeaponType,
  defenderWeapon: WeaponType,
): { hitBonus: number; damageBonus: number } {
  if (!isPhysicalTriangleWeapon(attackerWeapon) || !isPhysicalTriangleWeapon(defenderWeapon)) {
    return { hitBonus: 0, damageBonus: 0 };
  }

  if (PHYSICAL_TRIANGLE[attackerWeapon] === defenderWeapon) {
    return {
      hitBonus: WEAPON_TRIANGLE_HIT_BONUS,
      damageBonus: WEAPON_TRIANGLE_DAMAGE_BONUS,
    };
  }

  if (PHYSICAL_TRIANGLE[defenderWeapon] === attackerWeapon) {
    return {
      hitBonus: -WEAPON_TRIANGLE_HIT_BONUS,
      damageBonus: -WEAPON_TRIANGLE_DAMAGE_BONUS,
    };
  }

  return { hitBonus: 0, damageBonus: 0 };
}

export function getMagicTriangleBonus(
  attackerElement: Element,
  defenderElement: Element,
): { hitBonus: number; damageBonus: number } {
  if (
    (attackerElement === Element.Dark && defenderElement === Element.Light)
    || (attackerElement === Element.Light && defenderElement === Element.Dark)
  ) {
    return {
      hitBonus: MAGIC_TRIANGLE_HIT_BONUS,
      damageBonus: MAGIC_TRIANGLE_DAMAGE_BONUS,
    };
  }

  if (MAGIC_TRIANGLE[attackerElement] === defenderElement) {
    return {
      hitBonus: MAGIC_TRIANGLE_HIT_BONUS,
      damageBonus: MAGIC_TRIANGLE_DAMAGE_BONUS,
    };
  }

  if (MAGIC_TRIANGLE[defenderElement] === attackerElement) {
    return {
      hitBonus: -MAGIC_TRIANGLE_HIT_BONUS,
      damageBonus: -MAGIC_TRIANGLE_DAMAGE_BONUS,
    };
  }

  return { hitBonus: 0, damageBonus: 0 };
}
