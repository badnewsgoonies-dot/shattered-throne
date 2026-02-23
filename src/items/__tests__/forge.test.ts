import { describe, it, expect } from 'vitest';
import { forgeWeapon } from '../forgeSystem';
import { makeItemInstance } from './helpers';

describe('Forge System', () => {
  it('should add might bonus', () => {
    const item = makeItemInstance({ currentDurability: 45 });
    const result = forgeWeapon(item, { might: 2, hit: 0, crit: 0 }, 500);
    expect(result.item.forgeBonuses!.might).toBe(2);
    expect(result.cost).toBe(500);
  });

  it('should add hit bonus', () => {
    const item = makeItemInstance();
    const result = forgeWeapon(item, { might: 0, hit: 10, crit: 0 }, 300);
    expect(result.item.forgeBonuses!.hit).toBe(10);
  });

  it('should add crit bonus', () => {
    const item = makeItemInstance();
    const result = forgeWeapon(item, { might: 0, hit: 0, crit: 5 }, 400);
    expect(result.item.forgeBonuses!.crit).toBe(5);
  });

  it('should add all bonuses at once', () => {
    const item = makeItemInstance();
    const result = forgeWeapon(item, { might: 3, hit: 15, crit: 7 }, 1000);
    expect(result.item.forgeBonuses).toEqual({ might: 3, hit: 15, crit: 7 });
  });

  it('should cap might at 5', () => {
    const item = makeItemInstance();
    const result = forgeWeapon(item, { might: 10, hit: 0, crit: 0 }, 500);
    expect(result.item.forgeBonuses!.might).toBe(5);
  });

  it('should cap hit at 20', () => {
    const item = makeItemInstance();
    const result = forgeWeapon(item, { might: 0, hit: 30, crit: 0 }, 500);
    expect(result.item.forgeBonuses!.hit).toBe(20);
  });

  it('should cap crit at 10', () => {
    const item = makeItemInstance();
    const result = forgeWeapon(item, { might: 0, hit: 0, crit: 15 }, 500);
    expect(result.item.forgeBonuses!.crit).toBe(10);
  });

  it('should stack with existing forge bonuses', () => {
    const item = makeItemInstance({ forgeBonuses: { might: 2, hit: 5, crit: 3 } });
    const result = forgeWeapon(item, { might: 2, hit: 5, crit: 3 }, 500);
    expect(result.item.forgeBonuses).toEqual({ might: 4, hit: 10, crit: 6 });
  });

  it('should cap stacked bonuses', () => {
    const item = makeItemInstance({ forgeBonuses: { might: 4, hit: 15, crit: 8 } });
    const result = forgeWeapon(item, { might: 3, hit: 10, crit: 5 }, 500);
    expect(result.item.forgeBonuses).toEqual({ might: 5, hit: 20, crit: 10 });
  });

  it('should handle zero bonuses', () => {
    const item = makeItemInstance();
    const result = forgeWeapon(item, { might: 0, hit: 0, crit: 0 }, 0);
    expect(result.item.forgeBonuses).toEqual({ might: 0, hit: 0, crit: 0 });
    expect(result.cost).toBe(0);
  });

  it('should preserve the gold cost', () => {
    const item = makeItemInstance();
    const result = forgeWeapon(item, { might: 1, hit: 1, crit: 1 }, 1234);
    expect(result.cost).toBe(1234);
  });

  it('should be immutable', () => {
    const item = makeItemInstance({ forgeBonuses: { might: 1, hit: 0, crit: 0 } });
    const result = forgeWeapon(item, { might: 1, hit: 0, crit: 0 }, 500);
    expect(result.item).not.toBe(item);
    expect(item.forgeBonuses!.might).toBe(1);
  });

  it('should initialize forgeBonuses if undefined', () => {
    const item: any = makeItemInstance();
    delete item.forgeBonuses;
    const result = forgeWeapon(item, { might: 1, hit: 2, crit: 3 }, 100);
    expect(result.item.forgeBonuses).toEqual({ might: 1, hit: 2, crit: 3 });
  });
});
