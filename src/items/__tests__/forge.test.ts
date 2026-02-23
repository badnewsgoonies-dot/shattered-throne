import { describe, expect, it } from 'vitest';
import { forgeWeapon } from '../forgeSystem';
import { makeItemInstance } from './testUtils';

describe('forgeSystem.forgeWeapon', () => {
  it('adds forge bonuses to an unmodified item', () => {
    const item = makeItemInstance('test_sword');

    const result = forgeWeapon(item, { might: 1, hit: 5, crit: 2 }, 1000);

    expect(result.item.forgeBonuses).toEqual({ might: 1, hit: 5, crit: 2 });
  });

  it('stacks forge bonuses on existing bonuses', () => {
    const item = makeItemInstance('test_sword', {
      forgeBonuses: { might: 2, hit: 3, crit: 1 },
    });

    const result = forgeWeapon(item, { might: 1, hit: 5, crit: 2 }, 1200);

    expect(result.item.forgeBonuses).toEqual({ might: 3, hit: 8, crit: 3 });
  });

  it('caps might bonus at +5', () => {
    const item = makeItemInstance('test_sword', {
      forgeBonuses: { might: 4, hit: 0, crit: 0 },
    });

    const result = forgeWeapon(item, { might: 3, hit: 0, crit: 0 }, 500);

    expect(result.item.forgeBonuses?.might).toBe(5);
  });

  it('caps hit bonus at +20', () => {
    const item = makeItemInstance('test_sword', {
      forgeBonuses: { might: 0, hit: 18, crit: 0 },
    });

    const result = forgeWeapon(item, { might: 0, hit: 5, crit: 0 }, 500);

    expect(result.item.forgeBonuses?.hit).toBe(20);
  });

  it('caps crit bonus at +10', () => {
    const item = makeItemInstance('test_sword', {
      forgeBonuses: { might: 0, hit: 0, crit: 9 },
    });

    const result = forgeWeapon(item, { might: 0, hit: 0, crit: 4 }, 500);

    expect(result.item.forgeBonuses?.crit).toBe(10);
  });

  it('does not allow bonuses to go below zero', () => {
    const item = makeItemInstance('test_sword', {
      forgeBonuses: { might: 1, hit: 1, crit: 1 },
    });

    const result = forgeWeapon(item, { might: -3, hit: -10, crit: -2 }, 300);

    expect(result.item.forgeBonuses).toEqual({ might: 0, hit: 0, crit: 0 });
  });

  it('returns the provided gold cost', () => {
    const item = makeItemInstance('test_sword');

    const result = forgeWeapon(item, { might: 1, hit: 0, crit: 0 }, 777);

    expect(result.cost).toBe(777);
  });

  it('does not mutate original item', () => {
    const item = makeItemInstance('test_sword', {
      forgeBonuses: { might: 1, hit: 2, crit: 3 },
    });

    const result = forgeWeapon(item, { might: 1, hit: 1, crit: 1 }, 100);

    expect(result.item).not.toBe(item);
    expect(item.forgeBonuses).toEqual({ might: 1, hit: 2, crit: 3 });
  });
});
