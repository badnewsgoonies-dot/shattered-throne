import { describe, it, expect } from 'vitest';
import { getWeaponTriangleBonus, getMagicTriangleBonus } from '../weaponTriangle';
import {
  WeaponType,
  Element,
  WEAPON_TRIANGLE_HIT_BONUS,
  WEAPON_TRIANGLE_DAMAGE_BONUS,
  MAGIC_TRIANGLE_HIT_BONUS,
  MAGIC_TRIANGLE_DAMAGE_BONUS,
} from '../../shared/types';

describe('weaponTriangle', () => {
  describe('getWeaponTriangleBonus', () => {
    it('Sword > Axe gives advantage', () => {
      const bonus = getWeaponTriangleBonus(WeaponType.Sword, WeaponType.Axe);
      expect(bonus.hitBonus).toBe(WEAPON_TRIANGLE_HIT_BONUS);
      expect(bonus.damageBonus).toBe(WEAPON_TRIANGLE_DAMAGE_BONUS);
    });

    it('Axe > Lance gives advantage', () => {
      const bonus = getWeaponTriangleBonus(WeaponType.Axe, WeaponType.Lance);
      expect(bonus.hitBonus).toBe(WEAPON_TRIANGLE_HIT_BONUS);
      expect(bonus.damageBonus).toBe(WEAPON_TRIANGLE_DAMAGE_BONUS);
    });

    it('Lance > Sword gives advantage', () => {
      const bonus = getWeaponTriangleBonus(WeaponType.Lance, WeaponType.Sword);
      expect(bonus.hitBonus).toBe(WEAPON_TRIANGLE_HIT_BONUS);
      expect(bonus.damageBonus).toBe(WEAPON_TRIANGLE_DAMAGE_BONUS);
    });

    it('Axe vs Sword gives disadvantage', () => {
      const bonus = getWeaponTriangleBonus(WeaponType.Axe, WeaponType.Sword);
      expect(bonus.hitBonus).toBe(-WEAPON_TRIANGLE_HIT_BONUS);
      expect(bonus.damageBonus).toBe(-WEAPON_TRIANGLE_DAMAGE_BONUS);
    });

    it('Lance vs Axe gives disadvantage', () => {
      const bonus = getWeaponTriangleBonus(WeaponType.Lance, WeaponType.Axe);
      expect(bonus.hitBonus).toBe(-WEAPON_TRIANGLE_HIT_BONUS);
      expect(bonus.damageBonus).toBe(-WEAPON_TRIANGLE_DAMAGE_BONUS);
    });

    it('Sword vs Lance gives disadvantage', () => {
      const bonus = getWeaponTriangleBonus(WeaponType.Sword, WeaponType.Lance);
      expect(bonus.hitBonus).toBe(-WEAPON_TRIANGLE_HIT_BONUS);
      expect(bonus.damageBonus).toBe(-WEAPON_TRIANGLE_DAMAGE_BONUS);
    });

    it('same weapon type is neutral', () => {
      const bonus = getWeaponTriangleBonus(WeaponType.Sword, WeaponType.Sword);
      expect(bonus.hitBonus).toBe(0);
      expect(bonus.damageBonus).toBe(0);
    });

    it('bow is neutral vs sword', () => {
      const bonus = getWeaponTriangleBonus(WeaponType.Bow, WeaponType.Sword);
      expect(bonus.hitBonus).toBe(0);
      expect(bonus.damageBonus).toBe(0);
    });

    it('tome vs melee is neutral', () => {
      const bonus = getWeaponTriangleBonus(WeaponType.FireTome, WeaponType.Sword);
      expect(bonus.hitBonus).toBe(0);
      expect(bonus.damageBonus).toBe(0);
    });

    it('staff vs anything is neutral', () => {
      const bonus = getWeaponTriangleBonus(WeaponType.Staff, WeaponType.Sword);
      expect(bonus.hitBonus).toBe(0);
      expect(bonus.damageBonus).toBe(0);
    });

    it('axe vs axe is neutral', () => {
      const bonus = getWeaponTriangleBonus(WeaponType.Axe, WeaponType.Axe);
      expect(bonus.hitBonus).toBe(0);
      expect(bonus.damageBonus).toBe(0);
    });

    it('lance vs lance is neutral', () => {
      const bonus = getWeaponTriangleBonus(WeaponType.Lance, WeaponType.Lance);
      expect(bonus.hitBonus).toBe(0);
      expect(bonus.damageBonus).toBe(0);
    });
  });

  describe('getMagicTriangleBonus', () => {
    it('Fire > Wind gives advantage', () => {
      const bonus = getMagicTriangleBonus(Element.Fire, Element.Wind);
      expect(bonus.hitBonus).toBe(MAGIC_TRIANGLE_HIT_BONUS);
      expect(bonus.damageBonus).toBe(MAGIC_TRIANGLE_DAMAGE_BONUS);
    });

    it('Wind > Thunder gives advantage', () => {
      const bonus = getMagicTriangleBonus(Element.Wind, Element.Thunder);
      expect(bonus.hitBonus).toBe(MAGIC_TRIANGLE_HIT_BONUS);
      expect(bonus.damageBonus).toBe(MAGIC_TRIANGLE_DAMAGE_BONUS);
    });

    it('Thunder > Fire gives advantage', () => {
      const bonus = getMagicTriangleBonus(Element.Thunder, Element.Fire);
      expect(bonus.hitBonus).toBe(MAGIC_TRIANGLE_HIT_BONUS);
      expect(bonus.damageBonus).toBe(MAGIC_TRIANGLE_DAMAGE_BONUS);
    });

    it('Wind vs Fire gives disadvantage', () => {
      const bonus = getMagicTriangleBonus(Element.Wind, Element.Fire);
      expect(bonus.hitBonus).toBe(-MAGIC_TRIANGLE_HIT_BONUS);
      expect(bonus.damageBonus).toBe(-MAGIC_TRIANGLE_DAMAGE_BONUS);
    });

    it('Thunder vs Wind gives disadvantage', () => {
      const bonus = getMagicTriangleBonus(Element.Thunder, Element.Wind);
      expect(bonus.hitBonus).toBe(-MAGIC_TRIANGLE_HIT_BONUS);
      expect(bonus.damageBonus).toBe(-MAGIC_TRIANGLE_DAMAGE_BONUS);
    });

    it('Fire vs Thunder gives disadvantage', () => {
      const bonus = getMagicTriangleBonus(Element.Fire, Element.Thunder);
      expect(bonus.hitBonus).toBe(-MAGIC_TRIANGLE_HIT_BONUS);
      expect(bonus.damageBonus).toBe(-MAGIC_TRIANGLE_DAMAGE_BONUS);
    });

    it('Dark vs Light gives mutual advantage', () => {
      const bonus = getMagicTriangleBonus(Element.Dark, Element.Light);
      expect(bonus.hitBonus).toBe(MAGIC_TRIANGLE_HIT_BONUS);
      expect(bonus.damageBonus).toBe(MAGIC_TRIANGLE_DAMAGE_BONUS);
    });

    it('Light vs Dark gives mutual advantage', () => {
      const bonus = getMagicTriangleBonus(Element.Light, Element.Dark);
      expect(bonus.hitBonus).toBe(MAGIC_TRIANGLE_HIT_BONUS);
      expect(bonus.damageBonus).toBe(MAGIC_TRIANGLE_DAMAGE_BONUS);
    });

    it('same element is neutral', () => {
      const bonus = getMagicTriangleBonus(Element.Fire, Element.Fire);
      expect(bonus.hitBonus).toBe(0);
      expect(bonus.damageBonus).toBe(0);
    });

    it('Dark vs Dark is neutral', () => {
      const bonus = getMagicTriangleBonus(Element.Dark, Element.Dark);
      expect(bonus.hitBonus).toBe(0);
      expect(bonus.damageBonus).toBe(0);
    });

    it('Light vs Light is neutral', () => {
      const bonus = getMagicTriangleBonus(Element.Light, Element.Light);
      expect(bonus.hitBonus).toBe(0);
      expect(bonus.damageBonus).toBe(0);
    });

    it('Dark vs Fire is neutral', () => {
      const bonus = getMagicTriangleBonus(Element.Dark, Element.Fire);
      expect(bonus.hitBonus).toBe(0);
      expect(bonus.damageBonus).toBe(0);
    });

    it('Light vs Wind is neutral', () => {
      const bonus = getMagicTriangleBonus(Element.Light, Element.Wind);
      expect(bonus.hitBonus).toBe(0);
      expect(bonus.damageBonus).toBe(0);
    });
  });
});
