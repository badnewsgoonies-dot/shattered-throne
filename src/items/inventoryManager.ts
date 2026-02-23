import {
  Unit,
  ItemInstance,
  MAX_INVENTORY_SLOTS,
  ArmorSlot,
} from '../shared/types';

export function addToInventory(
  unit: Unit,
  item: ItemInstance
): { unit: Unit; success: boolean } {
  const slots = unit.inventory.items;
  const emptyIndex = slots.findIndex((s: ItemInstance | null) => s === null);
  if (emptyIndex === -1) {
    return { unit, success: false };
  }
  const newItems = [...slots];
  newItems[emptyIndex] = item;
  return {
    unit: {
      ...unit,
      inventory: { ...unit.inventory, items: newItems },
    },
    success: true,
  };
}

export function removeFromInventory(
  unit: Unit,
  itemIndex: number
): { unit: Unit; item: ItemInstance | null } {
  const slots = unit.inventory.items;
  if (itemIndex < 0 || itemIndex >= MAX_INVENTORY_SLOTS || slots[itemIndex] === null) {
    return { unit, item: null };
  }
  const item = slots[itemIndex]!;
  const newItems = [...slots];
  newItems[itemIndex] = null;

  let equippedWeaponIndex = unit.inventory.equippedWeaponIndex;
  const equippedArmor = { ...unit.inventory.equippedArmor };

  // Unequip if this was the equipped weapon
  if (equippedWeaponIndex === itemIndex) {
    equippedWeaponIndex = null;
  }

  // Unequip if this was equipped armor
  for (const slot of [ArmorSlot.Head, ArmorSlot.Chest, ArmorSlot.Boots, ArmorSlot.Accessory]) {
    if (equippedArmor[slot] === itemIndex) {
      equippedArmor[slot] = null;
    }
  }

  return {
    unit: {
      ...unit,
      inventory: {
        ...unit.inventory,
        items: newItems,
        equippedWeaponIndex,
        equippedArmor,
      },
    },
    item,
  };
}
