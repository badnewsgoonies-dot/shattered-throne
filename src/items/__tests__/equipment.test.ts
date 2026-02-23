import { describe, it, expect } from 'vitest';
import { equipWeapon, equipArmor } from '../equipmentManager';
import { makeUnit, makeItemInstance, makeInventory, makeMockDataProvider, warriorClass, archerClass } from './helpers';
import { ArmorSlot } from '../../shared/types';

const data = makeMockDataProvider();

describe('Equipment Manager', () => {
  describe('equipWeapon', () => {
    it('should equip a valid weapon', () => {
      const item = makeItemInstance({ dataId: 'iron-sword' });
      const unit = makeUnit({ inventory: makeInventory([item]) });
      const result = equipWeapon(unit, 0, data, warriorClass);
      expect(result.inventory.equippedWeaponIndex).toBe(0);
    });

    it('should not equip weapon from empty slot', () => {
      const unit = makeUnit();
      const result = equipWeapon(unit, 0, data, warriorClass);
      expect(result.inventory.equippedWeaponIndex).toBeNull();
    });

    it('should not equip non-weapon items as weapon', () => {
      const item = makeItemInstance({ dataId: 'leather-armor' });
      const unit = makeUnit({ inventory: makeInventory([item]) });
      const result = equipWeapon(unit, 0, data, warriorClass);
      expect(result.inventory.equippedWeaponIndex).toBeNull();
    });

    it('should not equip weapon if class cannot use it', () => {
      const item = makeItemInstance({ dataId: 'iron-bow' });
      const unit = makeUnit({ inventory: makeInventory([item]) });
      const result = equipWeapon(unit, 0, data, warriorClass);
      expect(result.inventory.equippedWeaponIndex).toBeNull();
    });

    it('should allow archer to equip bow', () => {
      const item = makeItemInstance({ dataId: 'iron-bow' });
      const unit = makeUnit({ inventory: makeInventory([item]) });
      const result = equipWeapon(unit, 0, data, archerClass);
      expect(result.inventory.equippedWeaponIndex).toBe(0);
    });

    it('should change equipped weapon index when equipping different slot', () => {
      const items = [
        makeItemInstance({ dataId: 'iron-sword' }),
        makeItemInstance({ dataId: 'steel-sword' }),
      ];
      let unit = makeUnit({ inventory: makeInventory(items) });
      unit = equipWeapon(unit, 0, data, warriorClass);
      expect(unit.inventory.equippedWeaponIndex).toBe(0);
      unit = equipWeapon(unit, 1, data, warriorClass);
      expect(unit.inventory.equippedWeaponIndex).toBe(1);
    });

    it('should return new unit object (immutable)', () => {
      const item = makeItemInstance({ dataId: 'iron-sword' });
      const unit = makeUnit({ inventory: makeInventory([item]) });
      const result = equipWeapon(unit, 0, data, warriorClass);
      expect(result).not.toBe(unit);
    });

    it('should not equip unknown item', () => {
      const item = makeItemInstance({ dataId: 'nonexistent-item' });
      const unit = makeUnit({ inventory: makeInventory([item]) });
      const result = equipWeapon(unit, 0, data, warriorClass);
      expect(result.inventory.equippedWeaponIndex).toBeNull();
    });
  });

  describe('equipArmor', () => {
    it('should equip armor in the correct slot', () => {
      const item = makeItemInstance({ dataId: 'leather-armor' });
      const unit = makeUnit({ inventory: makeInventory([item]) });
      const result = equipArmor(unit, 0, data);
      expect(result.inventory.equippedArmor[ArmorSlot.Chest]).toBe(0);
    });

    it('should equip head armor in head slot', () => {
      const item = makeItemInstance({ dataId: 'iron-helm' });
      const unit = makeUnit({ inventory: makeInventory([item]) });
      const result = equipArmor(unit, 0, data);
      expect(result.inventory.equippedArmor[ArmorSlot.Head]).toBe(0);
    });

    it('should not equip non-armor items', () => {
      const item = makeItemInstance({ dataId: 'iron-sword' });
      const unit = makeUnit({ inventory: makeInventory([item]) });
      const result = equipArmor(unit, 0, data);
      expect(result.inventory.equippedArmor[ArmorSlot.Chest]).toBeNull();
    });

    it('should not equip from empty slot', () => {
      const unit = makeUnit();
      const result = equipArmor(unit, 0, data);
      expect(result.inventory.equippedArmor[ArmorSlot.Chest]).toBeNull();
    });

    it('should replace previous armor in same slot', () => {
      const items = [
        makeItemInstance({ dataId: 'leather-armor', instanceId: 'a' }),
        makeItemInstance({ dataId: 'leather-armor', instanceId: 'b' }),
      ];
      let unit = makeUnit({ inventory: makeInventory(items) });
      unit = equipArmor(unit, 0, data);
      expect(unit.inventory.equippedArmor[ArmorSlot.Chest]).toBe(0);
      unit = equipArmor(unit, 1, data);
      expect(unit.inventory.equippedArmor[ArmorSlot.Chest]).toBe(1);
    });

    it('should be immutable', () => {
      const item = makeItemInstance({ dataId: 'leather-armor' });
      const unit = makeUnit({ inventory: makeInventory([item]) });
      const result = equipArmor(unit, 0, data);
      expect(result).not.toBe(unit);
      expect(unit.inventory.equippedArmor[ArmorSlot.Chest]).toBeNull();
    });
  });
});
