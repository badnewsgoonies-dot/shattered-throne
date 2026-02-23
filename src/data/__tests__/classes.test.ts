import { describe, it, expect } from 'vitest';
import { classDefinitions } from '../classes';
import { UnitClassName, MovementType } from '../../shared/types';

describe('Class Definitions', () => {
  it('should define all 19 classes', () => {
    expect(classDefinitions.length).toBe(19);
  });

  it('should have unique class names', () => {
    const names = classDefinitions.map(c => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('should include all UnitClassName enum values', () => {
    const names = new Set(classDefinitions.map(c => c.name));
    for (const cn of Object.values(UnitClassName)) {
      expect(names.has(cn)).toBe(true);
    }
  });

  it('should have valid base stats (non-negative)', () => {
    for (const cls of classDefinitions) {
      expect(cls.baseStats.hp).toBeGreaterThanOrEqual(0);
      expect(cls.baseStats.strength).toBeGreaterThanOrEqual(0);
      expect(cls.baseStats.magic).toBeGreaterThanOrEqual(0);
      expect(cls.baseStats.skill).toBeGreaterThanOrEqual(0);
      expect(cls.baseStats.speed).toBeGreaterThanOrEqual(0);
      expect(cls.baseStats.luck).toBeGreaterThanOrEqual(0);
      expect(cls.baseStats.defense).toBeGreaterThanOrEqual(0);
      expect(cls.baseStats.resistance).toBeGreaterThanOrEqual(0);
      expect(cls.baseStats.movement).toBeGreaterThanOrEqual(0);
    }
  });

  it('should have growth rates between 0 and 100', () => {
    for (const cls of classDefinitions) {
      for (const val of Object.values(cls.growthRates)) {
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(100);
      }
    }
  });

  it('should have stat caps greater than base stats', () => {
    for (const cls of classDefinitions) {
      expect(cls.statCaps.hp).toBeGreaterThanOrEqual(cls.baseStats.hp);
      expect(cls.statCaps.strength).toBeGreaterThanOrEqual(cls.baseStats.strength);
      expect(cls.statCaps.defense).toBeGreaterThanOrEqual(cls.baseStats.defense);
    }
  });

  it('should have valid movement types', () => {
    const validTypes = Object.values(MovementType);
    for (const cls of classDefinitions) {
      expect(validTypes).toContain(cls.movementType);
    }
  });

  it('should have at least one weapon type per class', () => {
    for (const cls of classDefinitions) {
      expect(cls.weaponTypes.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should have promotion options only for base classes', () => {
    const baseClasses = classDefinitions.filter(c => !c.isPromoted);
    for (const cls of baseClasses) {
      if (cls.name !== UnitClassName.Dancer) {
        expect(cls.promotionOptions.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have promotion targets that are promoted classes', () => {
    const classMap = new Map(classDefinitions.map(c => [c.name, c]));
    for (const cls of classDefinitions) {
      for (const promo of cls.promotionOptions) {
        const target = classMap.get(promo);
        expect(target).toBeDefined();
        expect(target!.isPromoted).toBe(true);
      }
    }
  });

  it('should have correct promoted status', () => {
    const promoted = classDefinitions.filter(c => c.isPromoted);
    expect(promoted.length).toBe(12);
    const base = classDefinitions.filter(c => !c.isPromoted);
    expect(base.length).toBe(7);
  });

  it('should have display names for all classes', () => {
    for (const cls of classDefinitions) {
      expect(cls.displayName).toBeTruthy();
      expect(cls.displayName.length).toBeGreaterThan(0);
    }
  });

  it('Dancer should have no promotion options', () => {
    const dancer = classDefinitions.find(c => c.name === UnitClassName.Dancer);
    expect(dancer).toBeDefined();
    expect(dancer!.promotionOptions).toEqual([]);
    expect(dancer!.isPromoted).toBe(false);
  });
});
