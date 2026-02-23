import {
  ArmorSlot,
  ClassDefinition,
  ConsumableData,
  IDataProvider,
  IItemSystem,
  ItemCategory,
  ItemData,
  ItemInstance,
  Stats,
  Unit,
  WeaponData,
} from '../shared/types';
import { addToConvoy, removeFromConvoy } from './convoyManager';
import { reduceDurability } from './durabilityManager';
import { canUnitUseItem, equipArmor, equipWeapon } from './equipmentManager';
import { forgeWeapon } from './forgeSystem';
import { addToInventory, removeFromInventory } from './inventoryManager';
import { getShopInventory } from './shopSystem';
import { tradeItems } from './tradeSystem';

function applyPermanentStatBoost(currentStats: Stats, statBoost: Partial<Stats>): Stats {
  const nextStats: Stats = { ...currentStats };

  for (const [statKey, value] of Object.entries(statBoost) as Array<[keyof Stats, number | undefined]>) {
    if (value !== undefined) {
      nextStats[statKey] += value;
    }
  }

  return nextStats;
}

export function createItemSystem(data: IDataProvider): IItemSystem {
  return {
    getItemData(itemId: string): ItemData | null {
      return data.getItem(itemId);
    },

    createItemInstance(dataId: string): ItemInstance {
      const itemData = data.getItem(dataId);

      const instance: ItemInstance = {
        instanceId: `inst_${dataId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        dataId,
      };

      if (!itemData) {
        return instance;
      }

      if (itemData.category === ItemCategory.Weapon) {
        const weaponData = itemData as WeaponData;
        instance.currentDurability = weaponData.maxDurability;
        if (weaponData.forgeBonuses) {
          instance.forgeBonuses = {
            might: weaponData.forgeBonuses.might,
            hit: weaponData.forgeBonuses.hit,
            crit: weaponData.forgeBonuses.crit,
          };
        }
      } else if (itemData.category === ItemCategory.Consumable) {
        instance.currentDurability = (itemData as ConsumableData).uses;
      }

      return instance;
    },

    equipWeapon(unit: Unit, itemIndex: number): Unit {
      if (itemIndex < 0 || itemIndex >= unit.inventory.items.length) {
        return unit;
      }

      const itemInstance = unit.inventory.items[itemIndex];
      if (!itemInstance) {
        return unit;
      }

      const itemData = data.getItem(itemInstance.dataId);
      if (!itemData || itemData.category !== ItemCategory.Weapon) {
        return unit;
      }

      const classDef: ClassDefinition = data.getClassDefinition(unit.className);
      if (!canUnitUseItem(unit, itemData, classDef)) {
        return unit;
      }

      return equipWeapon(unit, itemIndex);
    },

    equipArmor(unit: Unit, itemIndex: number): Unit {
      if (itemIndex < 0 || itemIndex >= unit.inventory.items.length) {
        return unit;
      }

      const itemInstance = unit.inventory.items[itemIndex];
      if (!itemInstance) {
        return unit;
      }

      const itemData = data.getItem(itemInstance.dataId);
      if (!itemData || itemData.category !== ItemCategory.Armor) {
        return unit;
      }

      return equipArmor(unit, itemIndex, itemData);
    },

    useConsumable(unit: Unit, itemIndex: number): { unit: Unit; consumed: boolean } {
      if (itemIndex < 0 || itemIndex >= unit.inventory.items.length) {
        return { unit, consumed: false };
      }

      const itemInstance = unit.inventory.items[itemIndex];
      if (!itemInstance) {
        return { unit, consumed: false };
      }

      const itemData = data.getItem(itemInstance.dataId);
      if (!itemData || itemData.category !== ItemCategory.Consumable) {
        return { unit, consumed: false };
      }

      let nextUnit = unit;
      const effect = itemData.effect;

      if (effect.type === 'heal') {
        const healedHP = effect.fullHeal
          ? nextUnit.maxHP
          : Math.min(nextUnit.maxHP, nextUnit.currentHP + Math.max(0, effect.healAmount ?? 0));

        nextUnit = {
          ...nextUnit,
          currentHP: healedHP,
        };
      } else if (effect.type === 'cureStatus' && effect.cureStatus !== undefined) {
        nextUnit = {
          ...nextUnit,
          activeStatusEffects: nextUnit.activeStatusEffects.filter((status) => status.type !== effect.cureStatus),
        };
      } else if (effect.type === 'statBoost' && effect.statBoost && effect.permanent) {
        nextUnit = {
          ...nextUnit,
          currentStats: applyPermanentStatBoost(nextUnit.currentStats, effect.statBoost),
        };
      }

      const reducedItem = reduceDurability(itemInstance);
      const items = [...nextUnit.inventory.items];
      let equippedWeaponIndex = nextUnit.inventory.equippedWeaponIndex;
      const equippedArmor = { ...nextUnit.inventory.equippedArmor };

      if (reducedItem === null) {
        items[itemIndex] = null;

        if (equippedWeaponIndex === itemIndex) {
          equippedWeaponIndex = null;
        }

        for (const slot of Object.values(ArmorSlot) as ArmorSlot[]) {
          if (equippedArmor[slot] === itemIndex) {
            equippedArmor[slot] = null;
          }
        }
      } else {
        items[itemIndex] = reducedItem;
      }

      nextUnit = {
        ...nextUnit,
        inventory: {
          ...nextUnit.inventory,
          items,
          equippedWeaponIndex,
          equippedArmor,
        },
      };

      return { unit: nextUnit, consumed: true };
    },

    addToInventory,
    removeFromInventory,
    tradeItems,
    addToConvoy,
    removeFromConvoy,
    reduceDurability,
    forgeWeapon,
    getShopInventory(chapterId: string): ItemData[] {
      return getShopInventory(chapterId, data);
    },
    canUnitUseItem,
  };
}
