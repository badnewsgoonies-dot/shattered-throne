import {
  ArmorData,
  ClassDefinition,
  ItemCategory,
  ItemData,
  PromotionItemData,
  Unit,
  WeaponData,
} from '../shared/types';

export function equipWeapon(unit: Unit, itemIndex: number): Unit {
  if (itemIndex < 0 || itemIndex >= unit.inventory.items.length) {
    return unit;
  }

  if (unit.inventory.items[itemIndex] === null) {
    return unit;
  }

  return {
    ...unit,
    inventory: {
      ...unit.inventory,
      equippedWeaponIndex: itemIndex,
    },
  };
}

export function equipArmor(unit: Unit, itemIndex: number, armorData: ArmorData): Unit {
  if (itemIndex < 0 || itemIndex >= unit.inventory.items.length) {
    return unit;
  }

  if (unit.inventory.items[itemIndex] === null) {
    return unit;
  }

  const equippedArmor = { ...unit.inventory.equippedArmor };
  equippedArmor[armorData.slot] = itemIndex;

  return {
    ...unit,
    inventory: {
      ...unit.inventory,
      equippedArmor,
    },
  };
}

export function canUnitUseItem(_unit: Unit, item: ItemData, classDef: ClassDefinition): boolean {
  if (item.category === ItemCategory.Weapon) {
    return classDef.weaponTypes.includes((item as WeaponData).weaponType);
  }

  if (item.category === ItemCategory.PromotionItem) {
    return (item as PromotionItemData).validClasses.includes(classDef.name);
  }

  return true;
}
