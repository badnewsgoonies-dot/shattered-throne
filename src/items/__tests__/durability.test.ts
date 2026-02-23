import { describe, expect, it } from 'vitest';
import { reduceDurability } from '../durabilityManager';
import { makeItemInstance } from './testUtils';

describe('durabilityManager.reduceDurability', () => {
  it('reduces durability by one when durability is present', () => {
    const item = makeItemInstance('test_sword', { currentDurability: 10 });

    const result = reduceDurability(item);

    expect(result).not.toBeNull();
    expect(result?.currentDurability).toBe(9);
  });

  it('returns null when durability reaches zero', () => {
    const item = makeItemInstance('test_sword', { currentDurability: 1 });

    const result = reduceDurability(item);

    expect(result).toBeNull();
  });

  it('returns null when durability starts at zero', () => {
    const item = makeItemInstance('test_sword', { currentDurability: 0 });

    const result = reduceDurability(item);

    expect(result).toBeNull();
  });

  it('returns same instance when durability field is missing', () => {
    const item = makeItemInstance('test_sword');

    const result = reduceDurability(item);

    expect(result).toBe(item);
  });

  it('returns null when durability is negative', () => {
    const item = makeItemInstance('test_sword', { currentDurability: -3 });

    const result = reduceDurability(item);

    expect(result).toBeNull();
  });

  it('returns a new object when durability decreases', () => {
    const item = makeItemInstance('test_sword', { currentDurability: 5 });

    const result = reduceDurability(item);

    expect(result).not.toBe(item);
    expect(item.currentDurability).toBe(5);
  });

  it('preserves forge bonuses while reducing durability', () => {
    const item = makeItemInstance('test_sword', {
      currentDurability: 5,
      forgeBonuses: { might: 2, hit: 5, crit: 1 },
    });

    const result = reduceDurability(item);

    expect(result?.forgeBonuses).toEqual({ might: 2, hit: 5, crit: 1 });
  });

  it('handles high durability values', () => {
    const item = makeItemInstance('test_sword', { currentDurability: 99 });

    const result = reduceDurability(item);

    expect(result?.currentDurability).toBe(98);
  });
});
