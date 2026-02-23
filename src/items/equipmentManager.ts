import {
  Unit,
  ItemData,
  ItemCategory,
  WeaponData,
  ArmorData,
  ClassDefinition,
  IDataProvider,
  ArmorSlot,
} from '../shared/types';

export function equipWeapon(
  unit: Unit,
  itemIndex: number,
  data: IDataProvider,
  classDef: ClassDefinition
): Unit {
  const slot = unit.inventory.items[itemIndex];
  if (!slot) return unit;

  const itemData = data.getItem(slot.dataId);
  if (!itemData || itemData.category !== ItemCategory.Weapon) return unit;

  const weapon = itemData as WeaponData;
  if (!classDef.weaponTypes.includes(weapon.weaponType)) return unit;

  return {
    ...unit,
    inventory: {
      ...unit.inventory,
      equippedWeaponIndex: itemIndex,
    },
  };
}

export function equipArmor(
  unit: Unit,
  itemIndex: number,
  data: IDataProvider
): Unit {
  const slot = unit.inventory.items[itemIndex];
  if (!slot) return unit;

  const itemData = data.getItem(slot.dataId);
  if (!itemData || itemData.category !== ItemCategory.Armor) return unit;

  const armor = itemData as ArmorData;
  return {
    ...unit,
    inventory: {
      ...unit.inventory,
      equippedArmor: {
        ...unit.inventory.equippedArmor,
        [armor.slot]: itemIndex,
      },
    },
  };
}

export function canUnitUseItem(
  unit: Unit,
  item: ItemData,
  classDef: ClassDefinition
): boolean {
  switch (item.category) {
    case ItemCategory.Weapon: {
      const weapon = item as WeaponData;
      return classDef.weaponTypes.includes(weapon.weaponType);
    }
    case ItemCategory.Armor:
      return true;
    case ItemCategory.Consumable:
      return true;
    case ItemCategory.PromotionItem: {
      return (item as { validClasses: string[] }).validClasses.includes(classDef.name);
    }
    default:
      return false;
  }
}
