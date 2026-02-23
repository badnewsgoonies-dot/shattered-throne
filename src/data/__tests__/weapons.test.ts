import { describe, it, expect } from 'vitest';
import { weapons } from '../weapons';
import { ItemCategory, WeaponType } from '../../shared/types';

describe('Weapons', () => {
  it('should have 80+ weapons', () => {
    expect(weapons.length).toBeGreaterThanOrEqual(80);
  });

  it('should have no duplicate IDs', () => {
    const ids = weapons.map(w => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should all have weapon category', () => {
    for (const w of weapons) {
      expect(w.category).toBe(ItemCategory.Weapon);
    }
  });

  it('should have valid weapon types', () => {
    const validTypes = Object.values(WeaponType);
    for (const w of weapons) {
      expect(validTypes).toContain(w.weaponType);
    }
  });

  it('should have non-negative might', () => {
    for (const w of weapons) {
      expect(w.might).toBeGreaterThanOrEqual(0);
    }
  });

  it('should have hit between 0 and 100', () => {
    for (const w of weapons) {
      expect(w.hit).toBeGreaterThanOrEqual(0);
      expect(w.hit).toBeLessThanOrEqual(100);
    }
  });

  it('should have crit between 0 and 100', () => {
    for (const w of weapons) {
      expect(w.crit).toBeGreaterThanOrEqual(0);
      expect(w.crit).toBeLessThanOrEqual(100);
    }
  });

  it('should have valid range (min <= max, both > 0)', () => {
    for (const w of weapons) {
      expect(w.range.min).toBeGreaterThanOrEqual(1);
      expect(w.range.max).toBeGreaterThanOrEqual(w.range.min);
    }
  });

  it('should have positive weight', () => {
    for (const w of weapons) {
      expect(w.weight).toBeGreaterThan(0);
    }
  });

  it('should have positive durability', () => {
    for (const w of weapons) {
      expect(w.maxDurability).toBeGreaterThan(0);
    }
  });

  it('should have non-negative cost', () => {
    for (const w of weapons) {
      expect(w.cost).toBeGreaterThanOrEqual(0);
    }
  });

  it('should include swords', () => {
    const swords = weapons.filter(w => w.weaponType === WeaponType.Sword);
    expect(swords.length).toBeGreaterThanOrEqual(10);
  });

  it('should include lances', () => {
    const lances = weapons.filter(w => w.weaponType === WeaponType.Lance);
    expect(lances.length).toBeGreaterThanOrEqual(10);
  });

  it('should include axes', () => {
    const axes = weapons.filter(w => w.weaponType === WeaponType.Axe);
    expect(axes.length).toBeGreaterThanOrEqual(10);
  });

  it('should include bows', () => {
    const bows = weapons.filter(w => w.weaponType === WeaponType.Bow);
    expect(bows.length).toBeGreaterThanOrEqual(8);
  });

  it('should include tomes', () => {
    const tomes = weapons.filter(w => [WeaponType.FireTome, WeaponType.WindTome, WeaponType.ThunderTome, WeaponType.DarkTome, WeaponType.LightTome].includes(w.weaponType));
    expect(tomes.length).toBeGreaterThanOrEqual(15);
  });

  it('should include staves', () => {
    const staves = weapons.filter(w => w.weaponType === WeaponType.Staff);
    expect(staves.length).toBeGreaterThanOrEqual(10);
  });

  it('should have names and descriptions', () => {
    for (const w of weapons) {
      expect(w.name).toBeTruthy();
      expect(w.description).toBeTruthy();
    }
  });

  it('should have a rank string', () => {
    for (const w of weapons) {
      expect(w.rank).toBeTruthy();
    }
  });
});
