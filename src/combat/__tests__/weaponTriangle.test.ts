import { describe, expect, it } from 'vitest';
import {
  Element,
  MAGIC_TRIANGLE_DAMAGE_BONUS,
  MAGIC_TRIANGLE_HIT_BONUS,
  WEAPON_TRIANGLE_DAMAGE_BONUS,
  WEAPON_TRIANGLE_HIT_BONUS,
  WeaponType,
} from '../../shared/types';
import { getMagicTriangleBonus, getWeaponTriangleBonus } from '../weaponTriangle';

describe('weaponTriangle.getWeaponTriangleBonus', () => {
  it.each([
    [WeaponType.Sword, WeaponType.Axe],
    [WeaponType.Axe, WeaponType.Lance],
    [WeaponType.Lance, WeaponType.Sword],
  ])('grants physical advantage for %s over %s', (attackerWeapon, defenderWeapon) => {
    expect(getWeaponTriangleBonus(attackerWeapon, defenderWeapon)).toEqual({
      hitBonus: WEAPON_TRIANGLE_HIT_BONUS,
      damageBonus: WEAPON_TRIANGLE_DAMAGE_BONUS,
    });
  });

  it.each([
    [WeaponType.Axe, WeaponType.Sword],
    [WeaponType.Lance, WeaponType.Axe],
    [WeaponType.Sword, WeaponType.Lance],
  ])('applies physical disadvantage for %s into %s', (attackerWeapon, defenderWeapon) => {
    expect(getWeaponTriangleBonus(attackerWeapon, defenderWeapon)).toEqual({
      hitBonus: -WEAPON_TRIANGLE_HIT_BONUS,
      damageBonus: -WEAPON_TRIANGLE_DAMAGE_BONUS,
    });
  });

  it.each([
    [WeaponType.Sword, WeaponType.Sword],
    [WeaponType.Axe, WeaponType.Axe],
    [WeaponType.Lance, WeaponType.Lance],
    [WeaponType.Bow, WeaponType.Sword],
    [WeaponType.Bow, WeaponType.Axe],
    [WeaponType.Bow, WeaponType.Bow],
    [WeaponType.FireTome, WeaponType.Axe],
    [WeaponType.Staff, WeaponType.Lance],
  ])('returns neutral for non-triangle matchup %s vs %s', (attackerWeapon, defenderWeapon) => {
    expect(getWeaponTriangleBonus(attackerWeapon, defenderWeapon)).toEqual({ hitBonus: 0, damageBonus: 0 });
  });
});

describe('weaponTriangle.getMagicTriangleBonus', () => {
  it.each([
    [Element.Fire, Element.Wind],
    [Element.Wind, Element.Thunder],
    [Element.Thunder, Element.Fire],
  ])('grants magic advantage for %s over %s', (attackerElement, defenderElement) => {
    expect(getMagicTriangleBonus(attackerElement, defenderElement)).toEqual({
      hitBonus: MAGIC_TRIANGLE_HIT_BONUS,
      damageBonus: MAGIC_TRIANGLE_DAMAGE_BONUS,
    });
  });

  it.each([
    [Element.Wind, Element.Fire],
    [Element.Thunder, Element.Wind],
    [Element.Fire, Element.Thunder],
  ])('applies magic disadvantage for %s into %s', (attackerElement, defenderElement) => {
    expect(getMagicTriangleBonus(attackerElement, defenderElement)).toEqual({
      hitBonus: -MAGIC_TRIANGLE_HIT_BONUS,
      damageBonus: -MAGIC_TRIANGLE_DAMAGE_BONUS,
    });
  });

  it.each([
    [Element.Dark, Element.Light],
    [Element.Light, Element.Dark],
  ])('grants mutual advantage for dark and light (%s vs %s)', (attackerElement, defenderElement) => {
    expect(getMagicTriangleBonus(attackerElement, defenderElement)).toEqual({
      hitBonus: MAGIC_TRIANGLE_HIT_BONUS,
      damageBonus: MAGIC_TRIANGLE_DAMAGE_BONUS,
    });
  });

  it.each([
    [Element.Fire, Element.Fire],
    [Element.Wind, Element.Wind],
    [Element.Thunder, Element.Thunder],
    [Element.Light, Element.Light],
    [Element.Dark, Element.Dark],
  ])('returns neutral for same-element or neutral matchup %s vs %s', (attackerElement, defenderElement) => {
    expect(getMagicTriangleBonus(attackerElement, defenderElement)).toEqual({ hitBonus: 0, damageBonus: 0 });
  });
});
