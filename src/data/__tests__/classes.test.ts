import { describe, expect, it } from 'vitest';
import { CLASS_DEFINITIONS } from '../classes';
import { UnitClassName } from '../../shared/types';

const classDefs = Object.values(CLASS_DEFINITIONS);

describe('classes data', () => {
  it('has exactly 19 class definitions', () => {
    expect(classDefs).toHaveLength(19);
  });

  it('contains all enum class entries', () => {
    for (const className of Object.values(UnitClassName)) {
      expect(CLASS_DEFINITIONS[className]).toBeDefined();
    }
  });

  it('has 6 base classes and 13 promoted classes', () => {
    const promoted = classDefs.filter((entry) => entry.isPromoted);
    const base = classDefs.filter((entry) => !entry.isPromoted);
    expect(base).toHaveLength(6);
    expect(promoted).toHaveLength(13);
  });

  it('warrior base stats match the spec', () => {
    const warrior = CLASS_DEFINITIONS[UnitClassName.Warrior];
    expect(warrior.baseStats).toMatchObject({
      hp: 20,
      strength: 7,
      magic: 0,
      skill: 5,
      speed: 5,
      luck: 3,
      defense: 6,
      resistance: 1,
      movement: 5,
    });
  });

  it('knight base stats match the spec', () => {
    const knight = CLASS_DEFINITIONS[UnitClassName.Knight];
    expect(knight.baseStats).toMatchObject({
      hp: 18,
      strength: 6,
      magic: 0,
      skill: 5,
      speed: 7,
      luck: 4,
      defense: 5,
      resistance: 1,
      movement: 7,
    });
  });

  it('archer base stats match the spec', () => {
    const archer = CLASS_DEFINITIONS[UnitClassName.Archer];
    expect(archer.baseStats).toMatchObject({
      hp: 17,
      strength: 5,
      magic: 0,
      skill: 7,
      speed: 6,
      luck: 4,
      defense: 3,
      resistance: 2,
      movement: 5,
    });
  });

  it('mage base stats match the spec', () => {
    const mage = CLASS_DEFINITIONS[UnitClassName.Mage];
    expect(mage.baseStats).toMatchObject({
      hp: 16,
      strength: 0,
      magic: 7,
      skill: 5,
      speed: 5,
      luck: 4,
      defense: 2,
      resistance: 6,
      movement: 5,
    });
  });

  it('cleric base stats match the spec', () => {
    const cleric = CLASS_DEFINITIONS[UnitClassName.Cleric];
    expect(cleric.baseStats).toMatchObject({
      hp: 16,
      strength: 0,
      magic: 5,
      skill: 4,
      speed: 5,
      luck: 6,
      defense: 2,
      resistance: 7,
      movement: 5,
    });
  });

  it('thief base stats match the spec', () => {
    const thief = CLASS_DEFINITIONS[UnitClassName.Thief];
    expect(thief.baseStats).toMatchObject({
      hp: 17,
      strength: 4,
      magic: 0,
      skill: 8,
      speed: 9,
      luck: 7,
      defense: 3,
      resistance: 2,
      movement: 6,
    });
  });

  it('all growth rates are in 0..100', () => {
    for (const classDef of classDefs) {
      for (const value of Object.values(classDef.growthRates)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
    }
  });

  it('promoted class growth rates are between 50 and 80', () => {
    const promoted = classDefs.filter((entry) => entry.isPromoted);
    for (const classDef of promoted) {
      for (const value of Object.values(classDef.growthRates)) {
        expect(value).toBeGreaterThanOrEqual(50);
        expect(value).toBeLessThanOrEqual(80);
      }
    }
  });

  it('base classes have promotion options', () => {
    const base = classDefs.filter((entry) => !entry.isPromoted);
    for (const classDef of base) {
      expect(classDef.promotionOptions.length).toBeGreaterThan(0);
    }
  });

  it('promoted classes have no promotion options', () => {
    const promoted = classDefs.filter((entry) => entry.isPromoted);
    for (const classDef of promoted) {
      expect(classDef.promotionOptions).toHaveLength(0);
    }
  });

  it('dancer is marked promoted with no options', () => {
    const dancer = CLASS_DEFINITIONS[UnitClassName.Dancer];
    expect(dancer.isPromoted).toBe(true);
    expect(dancer.promotionOptions).toHaveLength(0);
  });

  it('all class skill tables contain at least 2 skills', () => {
    for (const classDef of classDefs) {
      expect(classDef.skills.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('all classes have at least one weapon type', () => {
    for (const classDef of classDefs) {
      expect(classDef.weaponTypes.length).toBeGreaterThan(0);
    }
  });

  it('promotion options always point to promoted classes', () => {
    for (const classDef of classDefs.filter((entry) => !entry.isPromoted)) {
      for (const option of classDef.promotionOptions) {
        expect(CLASS_DEFINITIONS[option].isPromoted).toBe(true);
      }
    }
  });

  it('all stat caps are at least base stats for each class', () => {
    for (const classDef of classDefs) {
      expect(classDef.statCaps.hp).toBeGreaterThanOrEqual(classDef.baseStats.hp);
      expect(classDef.statCaps.strength).toBeGreaterThanOrEqual(classDef.baseStats.strength);
      expect(classDef.statCaps.magic).toBeGreaterThanOrEqual(classDef.baseStats.magic);
      expect(classDef.statCaps.skill).toBeGreaterThanOrEqual(classDef.baseStats.skill);
      expect(classDef.statCaps.speed).toBeGreaterThanOrEqual(classDef.baseStats.speed);
      expect(classDef.statCaps.luck).toBeGreaterThanOrEqual(classDef.baseStats.luck);
      expect(classDef.statCaps.defense).toBeGreaterThanOrEqual(classDef.baseStats.defense);
      expect(classDef.statCaps.resistance).toBeGreaterThanOrEqual(classDef.baseStats.resistance);
      expect(classDef.statCaps.movement).toBeGreaterThanOrEqual(classDef.baseStats.movement);
    }
  });
});
