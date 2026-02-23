import { describe, it, expect } from 'vitest';
import { tradeItems } from '../tradeSystem';
import { makeUnit, makeItemInstance, makeInventory } from './helpers';
import { ArmorSlot } from '../../shared/types';

describe('Trade System', () => {
  it('should swap items between two units', () => {
    const itemA = makeItemInstance({ instanceId: 'sword', dataId: 'iron-sword' });
    const itemB = makeItemInstance({ instanceId: 'lance', dataId: 'iron-lance' });
    const unitA = makeUnit({ id: 'a', inventory: makeInventory([itemA]) });
    const unitB = makeUnit({ id: 'b', inventory: makeInventory([itemB]) });

    const result = tradeItems(unitA, unitB, 0, 0);
    expect(result.unitA.inventory.items[0]?.instanceId).toBe('lance');
    expect(result.unitB.inventory.items[0]?.instanceId).toBe('sword');
  });

  it('should handle null-to-item swap (give item)', () => {
    const itemB = makeItemInstance({ instanceId: 'lance' });
    const unitA = makeUnit({ id: 'a', inventory: makeInventory([]) });
    const unitB = makeUnit({ id: 'b', inventory: makeInventory([itemB]) });

    const result = tradeItems(unitA, unitB, 0, 0);
    expect(result.unitA.inventory.items[0]?.instanceId).toBe('lance');
    expect(result.unitB.inventory.items[0]).toBeNull();
  });

  it('should handle item-to-null swap (take item)', () => {
    const itemA = makeItemInstance({ instanceId: 'sword' });
    const unitA = makeUnit({ id: 'a', inventory: makeInventory([itemA]) });
    const unitB = makeUnit({ id: 'b', inventory: makeInventory([]) });

    const result = tradeItems(unitA, unitB, 0, 0);
    expect(result.unitA.inventory.items[0]).toBeNull();
    expect(result.unitB.inventory.items[0]?.instanceId).toBe('sword');
  });

  it('should handle null-to-null swap', () => {
    const unitA = makeUnit({ id: 'a' });
    const unitB = makeUnit({ id: 'b' });

    const result = tradeItems(unitA, unitB, 0, 0);
    expect(result.unitA.inventory.items[0]).toBeNull();
    expect(result.unitB.inventory.items[0]).toBeNull();
  });

  it('should unequip weapon of unitA if traded item was equipped', () => {
    const item = makeItemInstance({ instanceId: 'sword', dataId: 'iron-sword' });
    const inv = makeInventory([item]);
    inv.equippedWeaponIndex = 0;
    const unitA = makeUnit({ id: 'a', inventory: inv });
    const unitB = makeUnit({ id: 'b', inventory: makeInventory([makeItemInstance({ instanceId: 'lance' })]) });

    const result = tradeItems(unitA, unitB, 0, 0);
    expect(result.unitA.inventory.equippedWeaponIndex).toBeNull();
  });

  it('should unequip armor of unitB if traded item was equipped', () => {
    const itemA = makeItemInstance({ instanceId: 'sword' });
    const itemB = makeItemInstance({ instanceId: 'armor', dataId: 'leather-armor' });
    const invB = makeInventory([itemB]);
    invB.equippedArmor[ArmorSlot.Chest] = 0;
    const unitA = makeUnit({ id: 'a', inventory: makeInventory([itemA]) });
    const unitB = makeUnit({ id: 'b', inventory: invB });

    const result = tradeItems(unitA, unitB, 0, 0);
    expect(result.unitB.inventory.equippedArmor[ArmorSlot.Chest]).toBeNull();
  });

  it('should swap items at different indices', () => {
    const items = [
      makeItemInstance({ instanceId: 'a0' }),
      makeItemInstance({ instanceId: 'a1' }),
    ];
    const unitA = makeUnit({ id: 'a', inventory: makeInventory(items) });
    const unitB = makeUnit({ id: 'b', inventory: makeInventory([null, makeItemInstance({ instanceId: 'b1' })]) });

    const result = tradeItems(unitA, unitB, 1, 1);
    expect(result.unitA.inventory.items[1]?.instanceId).toBe('b1');
    expect(result.unitB.inventory.items[1]?.instanceId).toBe('a1');
    // Index 0 should be unchanged
    expect(result.unitA.inventory.items[0]?.instanceId).toBe('a0');
  });

  it('should be immutable', () => {
    const itemA = makeItemInstance({ instanceId: 'sword' });
    const itemB = makeItemInstance({ instanceId: 'lance' });
    const unitA = makeUnit({ id: 'a', inventory: makeInventory([itemA]) });
    const unitB = makeUnit({ id: 'b', inventory: makeInventory([itemB]) });

    const result = tradeItems(unitA, unitB, 0, 0);
    expect(result.unitA).not.toBe(unitA);
    expect(result.unitB).not.toBe(unitB);
    expect(unitA.inventory.items[0]?.instanceId).toBe('sword');
    expect(unitB.inventory.items[0]?.instanceId).toBe('lance');
  });

  it('should not affect non-traded equipment', () => {
    const items = [
      makeItemInstance({ instanceId: 'sword', dataId: 'iron-sword' }),
      makeItemInstance({ instanceId: 'traded' }),
    ];
    const inv = makeInventory(items);
    inv.equippedWeaponIndex = 0;
    const unitA = makeUnit({ id: 'a', inventory: inv });
    const unitB = makeUnit({ id: 'b', inventory: makeInventory([makeItemInstance({ instanceId: 'other' })]) });

    const result = tradeItems(unitA, unitB, 1, 0);
    // Weapon at index 0 should remain equipped
    expect(result.unitA.inventory.equippedWeaponIndex).toBe(0);
  });
});
