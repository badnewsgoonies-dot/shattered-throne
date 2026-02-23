import { ArmorSlot, ItemInstance, MAX_INVENTORY_SLOTS, Unit } from '../shared/types';

export function addToInventory(unit: Unit, item: ItemInstance): { unit: Unit; success: boolean } {
  const items = [...unit.inventory.items];
  const emptyIndex = items.findIndex((inventoryItem) => inventoryItem === null);

  if (emptyIndex === -1) {
    return { unit, success: false };
  }

  items[emptyIndex] = item;

  return {
    unit: {
      ...unit,
      inventory: {
        ...unit.inventory,
        items,
      },
    },
    success: true,
  };
}

export function removeFromInventory(unit: Unit, itemIndex: number): { unit: Unit; item: ItemInstance | null } {
  if (itemIndex < 0 || itemIndex >= MAX_INVENTORY_SLOTS) {
    return { unit, item: null };
  }

  const items = [...unit.inventory.items];
  const removed = items[itemIndex];
  items[itemIndex] = null;

  let equippedWeaponIndex = unit.inventory.equippedWeaponIndex;
  if (equippedWeaponIndex === itemIndex) {
    equippedWeaponIndex = null;
  }

  const equippedArmor = { ...unit.inventory.equippedArmor };
  for (const slot of Object.values(ArmorSlot) as ArmorSlot[]) {
    if (equippedArmor[slot] === itemIndex) {
      equippedArmor[slot] = null;
    }
  }

  return {
    unit: {
      ...unit,
      inventory: {
        ...unit.inventory,
        items,
        equippedWeaponIndex,
        equippedArmor,
      },
    },
    item: removed,
  };
}
