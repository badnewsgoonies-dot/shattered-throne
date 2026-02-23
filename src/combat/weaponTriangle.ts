import {
  WeaponType,
  Element,
  WEAPON_TRIANGLE_HIT_BONUS,
  WEAPON_TRIANGLE_DAMAGE_BONUS,
  MAGIC_TRIANGLE_HIT_BONUS,
  MAGIC_TRIANGLE_DAMAGE_BONUS,
} from '../../shared/types';

export interface TriangleBonus {
  hitBonus: number;
  damageBonus: number;
}

const PHYSICAL_ADVANTAGE: Record<string, WeaponType> = {
  [WeaponType.Sword]: WeaponType.Axe,
  [WeaponType.Axe]: WeaponType.Lance,
  [WeaponType.Lance]: WeaponType.Sword,
};

const MAGIC_ADVANTAGE: Record<string, Element> = {
  [Element.Fire]: Element.Wind,
  [Element.Wind]: Element.Thunder,
  [Element.Thunder]: Element.Fire,
};

export function getWeaponTriangleBonus(
  attackerWeapon: WeaponType,
  defenderWeapon: WeaponType,
): TriangleBonus {
  if (PHYSICAL_ADVANTAGE[attackerWeapon] === defenderWeapon) {
    return { hitBonus: WEAPON_TRIANGLE_HIT_BONUS, damageBonus: WEAPON_TRIANGLE_DAMAGE_BONUS };
  }
  if (PHYSICAL_ADVANTAGE[defenderWeapon] === attackerWeapon) {
    return { hitBonus: -WEAPON_TRIANGLE_HIT_BONUS, damageBonus: -WEAPON_TRIANGLE_DAMAGE_BONUS };
  }
  return { hitBonus: 0, damageBonus: 0 };
}

export function getMagicTriangleBonus(
  attackerElement: Element,
  defenderElement: Element,
): TriangleBonus {
  // Dark <> Light: mutual advantage
  if (
    (attackerElement === Element.Dark && defenderElement === Element.Light) ||
    (attackerElement === Element.Light && defenderElement === Element.Dark)
  ) {
    return { hitBonus: MAGIC_TRIANGLE_HIT_BONUS, damageBonus: MAGIC_TRIANGLE_DAMAGE_BONUS };
  }

  if (MAGIC_ADVANTAGE[attackerElement] === defenderElement) {
    return { hitBonus: MAGIC_TRIANGLE_HIT_BONUS, damageBonus: MAGIC_TRIANGLE_DAMAGE_BONUS };
  }
  if (MAGIC_ADVANTAGE[defenderElement] === attackerElement) {
    return { hitBonus: -MAGIC_TRIANGLE_HIT_BONUS, damageBonus: -MAGIC_TRIANGLE_DAMAGE_BONUS };
  }
  return { hitBonus: 0, damageBonus: 0 };
}
