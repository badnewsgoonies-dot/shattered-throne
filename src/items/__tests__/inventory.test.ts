import { describe, it, expect } from 'vitest';
import { addToInventory, removeFromInventory } from '../inventoryManager';
import { makeUnit, makeItemInstance, makeInventory } from './helpers';
import { ArmorSlot } from '../../shared/types';

describe('Inventory Manager', () => {
  describe('addToInventory', () => {
    it('should add an item to the first empty slot', () => {
      const unit = makeUnit();
      const item = makeItemInstance({ dataId: 'iron-sword' });
      const result = addToInventory(unit, item);
      expect(result.success).toBe(true);
      expect(result.unit.inventory.items[0]).toEqual(item);
    });

    it('should add to second slot if first is occupied', () => {
      const existing = makeItemInstance({ instanceId: 'existing' });
      const unit = makeUnit({ inventory: makeInventory([existing]) });
      const newItem = makeItemInstance({ instanceId: 'new' });
      const result = addToInventory(unit, newItem);
      expect(result.success).toBe(true);
      expect(result.unit.inventory.items[0]?.instanceId).toBe('existing');
      expect(result.unit.inventory.items[1]?.instanceId).toBe('new');
    });

    it('should fail when inventory is full', () => {
      const items = Array(5).fill(null).map((_, i) => makeItemInstance({ instanceId: `item-${i}` }));
      const unit = makeUnit({ inventory: makeInventory(items) });
      const newItem = makeItemInstance({ instanceId: 'overflow' });
      const result = addToInventory(unit, newItem);
      expect(result.success).toBe(false);
      expect(result.unit).toBe(unit);
    });

    it('should add item to a gap in the middle', () => {
      const items: any[] = [
        makeItemInstance({ instanceId: 'a' }),
        null,
        makeItemInstance({ instanceId: 'c' }),
      ];
      const unit = makeUnit({ inventory: makeInventory(items) });
      const newItem = makeItemInstance({ instanceId: 'b' });
      const result = addToInventory(unit, newItem);
      expect(result.success).toBe(true);
      expect(result.unit.inventory.items[1]?.instanceId).toBe('b');
    });

    it('should return a new unit object (immutable)', () => {
      const unit = makeUnit();
      const item = makeItemInstance();
      const result = addToInventory(unit, item);
      expect(result.unit).not.toBe(unit);
      expect(result.unit.inventory).not.toBe(unit.inventory);
    });

    it('should not mutate the original unit', () => {
      const unit = makeUnit();
      const item = makeItemInstance();
      addToInventory(unit, item);
      expect(unit.inventory.items[0]).toBeNull();
    });

    it('should fill all 5 slots sequentially', () => {
      let unit = makeUnit();
      for (let i = 0; i < 5; i++) {
        const result = addToInventory(unit, makeItemInstance({ instanceId: `item-${i}` }));
        expect(result.success).toBe(true);
        unit = result.unit;
      }
      expect(unit.inventory.items.every(s => s !== null)).toBe(true);
    });

    it('should reject after filling all 5 slots', () => {
      let unit = makeUnit();
      for (let i = 0; i < 5; i++) {
        const result = addToInventory(unit, makeItemInstance({ instanceId: `item-${i}` }));
        unit = result.unit;
      }
      const result = addToInventory(unit, makeItemInstance({ instanceId: 'overflow' }));
      expect(result.success).toBe(false);
    });
  });

  describe('removeFromInventory', () => {
    it('should remove an item from a slot', () => {
      const item = makeItemInstance({ instanceId: 'to-remove' });
      const unit = makeUnit({ inventory: makeInventory([item]) });
      const result = removeFromInventory(unit, 0);
      expect(result.item?.instanceId).toBe('to-remove');
      expect(result.unit.inventory.items[0]).toBeNull();
    });

    it('should return null for empty slot', () => {
      const unit = makeUnit();
      const result = removeFromInventory(unit, 0);
      expect(result.item).toBeNull();
      expect(result.unit).toBe(unit);
    });

    it('should return null for out-of-bounds index', () => {
      const unit = makeUnit();
      expect(removeFromInventory(unit, -1).item).toBeNull();
      expect(removeFromInventory(unit, 5).item).toBeNull();
      expect(removeFromInventory(unit, 99).item).toBeNull();
    });

    it('should unequip weapon when removed', () => {
      const item = makeItemInstance({ instanceId: 'weapon' });
      const inv = makeInventory([item]);
      inv.equippedWeaponIndex = 0;
      const unit = makeUnit({ inventory: inv });
      const result = removeFromInventory(unit, 0);
      expect(result.unit.inventory.equippedWeaponIndex).toBeNull();
    });

    it('should unequip armor when removed', () => {
      const item = makeItemInstance({ instanceId: 'armor', dataId: 'leather-armor' });
      const inv = makeInventory([item]);
      inv.equippedArmor[ArmorSlot.Chest] = 0;
      const unit = makeUnit({ inventory: inv });
      const result = removeFromInventory(unit, 0);
      expect(result.unit.inventory.equippedArmor[ArmorSlot.Chest]).toBeNull();
    });

    it('should not affect other slots when removing', () => {
      const items = [
        makeItemInstance({ instanceId: 'a' }),
        makeItemInstance({ instanceId: 'b' }),
      ];
      const unit = makeUnit({ inventory: makeInventory(items) });
      const result = removeFromInventory(unit, 0);
      expect(result.unit.inventory.items[1]?.instanceId).toBe('b');
    });

    it('should be immutable', () => {
      const item = makeItemInstance();
      const unit = makeUnit({ inventory: makeInventory([item]) });
      const result = removeFromInventory(unit, 0);
      expect(result.unit).not.toBe(unit);
      expect(unit.inventory.items[0]).not.toBeNull();
    });
  });
});
