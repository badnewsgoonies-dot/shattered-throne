import { describe, it, expect } from 'vitest';
import { consumables } from '../consumables';
import { ItemCategory } from '../../shared/types';

describe('Consumables', () => {
  it('should have 20+ consumables', () => {
    expect(consumables.length).toBeGreaterThanOrEqual(20);
  });

  it('should have no duplicate IDs', () => {
    const ids = consumables.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should all have consumable category', () => {
    for (const c of consumables) {
      expect(c.category).toBe(ItemCategory.Consumable);
    }
  });

  it('should have positive uses', () => {
    for (const c of consumables) {
      expect(c.uses).toBeGreaterThan(0);
    }
  });

  it('should have non-negative cost', () => {
    for (const c of consumables) {
      expect(c.cost).toBeGreaterThanOrEqual(0);
    }
  });

  it('should have valid effect types', () => {
    const validTypes = ['heal', 'cureStatus', 'statBoost', 'key', 'special'];
    for (const c of consumables) {
      expect(validTypes).toContain(c.effect.type);
    }
  });

  it('should have names and descriptions', () => {
    for (const c of consumables) {
      expect(c.name).toBeTruthy();
      expect(c.description).toBeTruthy();
    }
  });

  it('should include healing items', () => {
    const heals = consumables.filter(c => c.effect.type === 'heal');
    expect(heals.length).toBeGreaterThanOrEqual(3);
  });

  it('should include stat boosters', () => {
    const boosters = consumables.filter(c => c.effect.type === 'statBoost' && c.effect.permanent);
    expect(boosters.length).toBeGreaterThanOrEqual(8);
  });

  it('should include keys', () => {
    const keys = consumables.filter(c => c.effect.type === 'key');
    expect(keys.length).toBeGreaterThanOrEqual(2);
  });
});
