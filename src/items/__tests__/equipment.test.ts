import { describe, expect, it } from 'vitest';
import { ArmorSlot, UnitClassName } from '../../shared/types';
import { createItemSystem } from '../itemSystem';
import {
  archerClassDef,
  clericClassDef,
  createMockDataProvider,
  makeItemInstance,
  makeUnit,
  warriorClassDef,
} from './testUtils';

describe('equipment and equipping behaviors', () => {
  const provider = createMockDataProvider({
    classes: [warriorClassDef, archerClassDef, clericClassDef],
  });
  const itemSystem = createItemSystem(provider);

  it('equips a valid weapon index', () => {
    const unit = makeUnit({
      inventory: {
        items: [makeItemInstance('test_sword'), null, null, null, null],
      },
    });

    const result = itemSystem.equipWeapon(unit, 0);

    expect(result.inventory.equippedWeaponIndex).toBe(0);
  });

  it('does not equip weapon from an empty slot', () => {
    const unit = makeUnit();

    const result = itemSystem.equipWeapon(unit, 0);

    expect(result).toBe(unit);
    expect(result.inventory.equippedWeaponIndex).toBeNull();
  });

  it('does not equip weapon when item is not a weapon', () => {
    const unit = makeUnit({
      inventory: {
        items: [makeItemInstance('test_helm'), null, null, null, null],
      },
    });

    const result = itemSystem.equipWeapon(unit, 0);

    expect(result.inventory.equippedWeaponIndex).toBeNull();
  });

  it('does not equip weapon when class cannot use that weapon type', () => {
    const unit = makeUnit({
      className: UnitClassName.Warrior,
      inventory: {
        items: [makeItemInstance('test_bow'), null, null, null, null],
      },
    });

    const result = itemSystem.equipWeapon(unit, 0);

    expect(result.inventory.equippedWeaponIndex).toBeNull();
  });

  it('equips bow when archer class can use it', () => {
    const unit = makeUnit({
      className: UnitClassName.Archer,
      inventory: {
        items: [makeItemInstance('test_bow'), null, null, null, null],
      },
    });

    const result = itemSystem.equipWeapon(unit, 0);

    expect(result.inventory.equippedWeaponIndex).toBe(0);
  });

  it('equips staff when cleric class can use it', () => {
    const unit = makeUnit({
      className: UnitClassName.Cleric,
      inventory: {
        items: [makeItemInstance('test_staff'), null, null, null, null],
      },
    });

    const result = itemSystem.equipWeapon(unit, 0);

    expect(result.inventory.equippedWeaponIndex).toBe(0);
  });

  it('does not equip weapon for invalid index', () => {
    const unit = makeUnit({
      inventory: {
        items: [makeItemInstance('test_sword'), null, null, null, null],
      },
    });

    const result = itemSystem.equipWeapon(unit, 9);

    expect(result).toBe(unit);
  });

  it('equips head armor into head slot', () => {
    const unit = makeUnit({
      inventory: {
        items: [makeItemInstance('test_helm'), null, null, null, null],
      },
    });

    const result = itemSystem.equipArmor(unit, 0);

    expect(result.inventory.equippedArmor[ArmorSlot.Head]).toBe(0);
  });

  it('equips chest armor into chest slot', () => {
    const unit = makeUnit({
      inventory: {
        items: [makeItemInstance('test_chest'), null, null, null, null],
      },
    });

    const result = itemSystem.equipArmor(unit, 0);

    expect(result.inventory.equippedArmor[ArmorSlot.Chest]).toBe(0);
  });

  it('replaces existing armor in same slot with new index', () => {
    const unit = makeUnit({
      inventory: {
        items: [makeItemInstance('test_helm'), null, makeItemInstance('test_helm'), null, null],
        equippedArmor: {
          [ArmorSlot.Head]: 0,
          [ArmorSlot.Chest]: null,
          [ArmorSlot.Boots]: null,
          [ArmorSlot.Accessory]: null,
        },
      },
    });

    const result = itemSystem.equipArmor(unit, 2);

    expect(result.inventory.equippedArmor[ArmorSlot.Head]).toBe(2);
  });

  it('does not equip armor when index points to non-armor item', () => {
    const unit = makeUnit({
      inventory: {
        items: [makeItemInstance('test_sword'), null, null, null, null],
      },
    });

    const result = itemSystem.equipArmor(unit, 0);

    expect(result.inventory.equippedArmor[ArmorSlot.Head]).toBeNull();
  });

  it('does not equip armor for invalid index', () => {
    const unit = makeUnit({
      inventory: {
        items: [makeItemInstance('test_helm'), null, null, null, null],
      },
    });

    const result = itemSystem.equipArmor(unit, -1);

    expect(result).toBe(unit);
  });

  it('unequips weapon when equipped weapon is removed', () => {
    const unit = makeUnit({
      inventory: {
        items: [makeItemInstance('test_sword'), null, null, null, null],
        equippedWeaponIndex: 0,
      },
    });

    const removed = itemSystem.removeFromInventory(unit, 0);

    expect(removed.unit.inventory.equippedWeaponIndex).toBeNull();
  });

  it('unequips armor when equipped armor is removed', () => {
    const unit = makeUnit({
      inventory: {
        items: [makeItemInstance('test_helm'), null, null, null, null],
        equippedArmor: {
          [ArmorSlot.Head]: 0,
          [ArmorSlot.Chest]: null,
          [ArmorSlot.Boots]: null,
          [ArmorSlot.Accessory]: null,
        },
      },
    });

    const removed = itemSystem.removeFromInventory(unit, 0);

    expect(removed.unit.inventory.equippedArmor[ArmorSlot.Head]).toBeNull();
  });
});
