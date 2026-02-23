import { describe, expect, it } from 'vitest';
import { ArmorSlot, MAX_INVENTORY_SLOTS } from '../../shared/types';
import { addToInventory, removeFromInventory } from '../inventoryManager';
import { makeItemInstance, makeUnit } from './testUtils';

describe('inventoryManager', () => {
  it('adds an item to the first empty slot', () => {
    const unit = makeUnit();
    const item = makeItemInstance('test_sword');

    const result = addToInventory(unit, item);

    expect(result.success).toBe(true);
    expect(result.unit.inventory.items[0]).toEqual(item);
  });

  it('adds an item to the first available gap', () => {
    const itemA = makeItemInstance('test_sword');
    const itemB = makeItemInstance('test_bow');
    const unit = makeUnit({ inventory: { items: [itemA, null, itemB, null, null] } });
    const incoming = makeItemInstance('test_staff');

    const result = addToInventory(unit, incoming);

    expect(result.success).toBe(true);
    expect(result.unit.inventory.items[1]).toEqual(incoming);
    expect(result.unit.inventory.items[3]).toBeNull();
  });

  it('rejects adding when inventory is full', () => {
    const fullItems = Array.from({ length: MAX_INVENTORY_SLOTS }, (_, index) =>
      makeItemInstance(`item_${index}`),
    );
    const unit = makeUnit({ inventory: { items: fullItems } });

    const result = addToInventory(unit, makeItemInstance('new_item'));

    expect(result.success).toBe(false);
    expect(result.unit).toBe(unit);
  });

  it('does not mutate original inventory when adding', () => {
    const unit = makeUnit();
    const originalItems = [...unit.inventory.items];

    const result = addToInventory(unit, makeItemInstance('test_sword'));

    expect(result.unit.inventory.items).not.toBe(unit.inventory.items);
    expect(unit.inventory.items).toEqual(originalItems);
  });

  it('removes an item at the given index and returns it', () => {
    const item = makeItemInstance('test_sword');
    const unit = makeUnit({ inventory: { items: [item, null, null, null, null] } });

    const result = removeFromInventory(unit, 0);

    expect(result.item).toEqual(item);
    expect(result.unit.inventory.items[0]).toBeNull();
  });

  it('returns null when removing an already empty slot', () => {
    const unit = makeUnit();

    const result = removeFromInventory(unit, 2);

    expect(result.item).toBeNull();
    expect(result.unit.inventory.items[2]).toBeNull();
  });

  it('returns unchanged unit for negative index removal', () => {
    const unit = makeUnit({ inventory: { items: [makeItemInstance('test_sword'), null, null, null, null] } });

    const result = removeFromInventory(unit, -1);

    expect(result.item).toBeNull();
    expect(result.unit).toBe(unit);
  });

  it('returns unchanged unit for out-of-range removal index', () => {
    const unit = makeUnit();

    const result = removeFromInventory(unit, MAX_INVENTORY_SLOTS);

    expect(result.item).toBeNull();
    expect(result.unit).toBe(unit);
  });

  it('unequips weapon when removing equipped weapon index', () => {
    const weapon = makeItemInstance('test_sword');
    const unit = makeUnit({
      inventory: {
        items: [weapon, null, null, null, null],
        equippedWeaponIndex: 0,
      },
    });

    const result = removeFromInventory(unit, 0);

    expect(result.unit.inventory.equippedWeaponIndex).toBeNull();
  });

  it('keeps equipped weapon index when removing a different slot', () => {
    const weapon = makeItemInstance('test_sword');
    const other = makeItemInstance('test_staff');
    const unit = makeUnit({
      inventory: {
        items: [weapon, other, null, null, null],
        equippedWeaponIndex: 0,
      },
    });

    const result = removeFromInventory(unit, 1);

    expect(result.unit.inventory.equippedWeaponIndex).toBe(0);
  });

  it('unequips armor slot when removing equipped armor piece', () => {
    const armor = makeItemInstance('test_helm');
    const unit = makeUnit({
      inventory: {
        items: [null, armor, null, null, null],
        equippedArmor: {
          [ArmorSlot.Head]: 1,
          [ArmorSlot.Chest]: null,
          [ArmorSlot.Boots]: null,
          [ArmorSlot.Accessory]: null,
        },
      },
    });

    const result = removeFromInventory(unit, 1);

    expect(result.unit.inventory.equippedArmor[ArmorSlot.Head]).toBeNull();
  });

  it('clears all armor slots that reference the removed index', () => {
    const armor = makeItemInstance('weird_multi_slot_armor');
    const unit = makeUnit({
      inventory: {
        items: [null, null, armor, null, null],
        equippedArmor: {
          [ArmorSlot.Head]: 2,
          [ArmorSlot.Chest]: 2,
          [ArmorSlot.Boots]: null,
          [ArmorSlot.Accessory]: null,
        },
      },
    });

    const result = removeFromInventory(unit, 2);

    expect(result.unit.inventory.equippedArmor[ArmorSlot.Head]).toBeNull();
    expect(result.unit.inventory.equippedArmor[ArmorSlot.Chest]).toBeNull();
  });
});
