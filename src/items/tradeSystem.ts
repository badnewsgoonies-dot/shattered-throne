import { Unit, ArmorSlot } from '../shared/types';

export function tradeItems(
  unitA: Unit,
  unitB: Unit,
  indexA: number,
  indexB: number
): { unitA: Unit; unitB: Unit } {
  const itemsA = [...unitA.inventory.items];
  const itemsB = [...unitB.inventory.items];
  const temp = itemsA[indexA];
  itemsA[indexA] = itemsB[indexB];
  itemsB[indexB] = temp;

  // Fix equipment references for unit A
  let weaponA = unitA.inventory.equippedWeaponIndex;
  const armorA = { ...unitA.inventory.equippedArmor };
  if (weaponA === indexA) weaponA = null;
  for (const slot of [ArmorSlot.Head, ArmorSlot.Chest, ArmorSlot.Boots, ArmorSlot.Accessory]) {
    if (armorA[slot] === indexA) armorA[slot] = null;
  }

  // Fix equipment references for unit B
  let weaponB = unitB.inventory.equippedWeaponIndex;
  const armorB = { ...unitB.inventory.equippedArmor };
  if (weaponB === indexB) weaponB = null;
  for (const slot of [ArmorSlot.Head, ArmorSlot.Chest, ArmorSlot.Boots, ArmorSlot.Accessory]) {
    if (armorB[slot] === indexB) armorB[slot] = null;
  }

  return {
    unitA: {
      ...unitA,
      inventory: {
        ...unitA.inventory,
        items: itemsA,
        equippedWeaponIndex: weaponA,
        equippedArmor: armorA,
      },
    },
    unitB: {
      ...unitB,
      inventory: {
        ...unitB.inventory,
        items: itemsB,
        equippedWeaponIndex: weaponB,
        equippedArmor: armorB,
      },
    },
  };
}
