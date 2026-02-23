import { describe, it, expect } from 'vitest';
import { reduceDurability } from '../durabilityManager';
import { makeItemInstance } from './helpers';

describe('Durability Manager', () => {
  it('should decrement durability by 1', () => {
    const item = makeItemInstance({ currentDurability: 45 });
    const result = reduceDurability(item);
    expect(result).not.toBeNull();
    expect(result!.currentDurability).toBe(44);
  });

  it('should return null when durability reaches 0', () => {
    const item = makeItemInstance({ currentDurability: 1 });
    const result = reduceDurability(item);
    expect(result).toBeNull();
  });

  it('should return item unchanged if no durability field', () => {
    const item = makeItemInstance({});
    delete (item as any).currentDurability;
    const result = reduceDurability({ instanceId: item.instanceId, dataId: item.dataId });
    expect(result).toEqual({ instanceId: item.instanceId, dataId: item.dataId });
  });

  it('should handle durability of 2 correctly', () => {
    const item = makeItemInstance({ currentDurability: 2 });
    const result = reduceDurability(item);
    expect(result).not.toBeNull();
    expect(result!.currentDurability).toBe(1);
  });

  it('should be immutable', () => {
    const item = makeItemInstance({ currentDurability: 10 });
    const result = reduceDurability(item);
    expect(result).not.toBe(item);
    expect(item.currentDurability).toBe(10);
  });

  it('should handle high durability values', () => {
    const item = makeItemInstance({ currentDurability: 999 });
    const result = reduceDurability(item);
    expect(result!.currentDurability).toBe(998);
  });

  it('should chain multiple reductions', () => {
    let item: ReturnType<typeof reduceDurability> = makeItemInstance({ currentDurability: 3 });
    item = reduceDurability(item!);
    expect(item!.currentDurability).toBe(2);
    item = reduceDurability(item!);
    expect(item!.currentDurability).toBe(1);
    item = reduceDurability(item!);
    expect(item).toBeNull();
  });

  it('should preserve other item fields', () => {
    const item = makeItemInstance({
      currentDurability: 10,
      forgeBonuses: { might: 1, hit: 5, crit: 2 },
    });
    const result = reduceDurability(item);
    expect(result!.forgeBonuses).toEqual({ might: 1, hit: 5, crit: 2 });
    expect(result!.dataId).toBe(item.dataId);
    expect(result!.instanceId).toBe(item.instanceId);
  });
});
