import {
  IItemSystem,
  IDataProvider,
  ItemData,
  ItemInstance,
  Unit,
  ClassDefinition,
  ItemCategory,
  WeaponData,
  ConsumableData,
  MAX_INVENTORY_SLOTS,
} from '../shared/types';
import { addToInventory, removeFromInventory } from './inventoryManager';
import { equipWeapon as doEquipWeapon, equipArmor as doEquipArmor, canUnitUseItem as doCanUnitUseItem } from './equipmentManager';
import { reduceDurability as doReduceDurability } from './durabilityManager';
import { addToConvoy as doAddToConvoy, removeFromConvoy as doRemoveFromConvoy } from './convoyManager';
import { tradeItems as doTradeItems } from './tradeSystem';
import { forgeWeapon as doForgeWeapon } from './forgeSystem';
import { getShopInventory as doGetShopInventory } from './shopSystem';

let instanceCounter = 0;

function generateInstanceId(): string {
  return `item-${Date.now()}-${++instanceCounter}`;
}

export function createItemSystem(data: IDataProvider): IItemSystem {
  return {
    getItemData(itemId: string): ItemData | null {
      return data.getItem(itemId);
    },

    createItemInstance(dataId: string): ItemInstance {
      const itemData = data.getItem(dataId);
      let durability: number | undefined;
      if (itemData) {
        if (itemData.category === ItemCategory.Weapon) {
          durability = (itemData as WeaponData).maxDurability;
        } else if (itemData.category === ItemCategory.Consumable) {
          durability = (itemData as ConsumableData).uses;
        }
      }
      return {
        instanceId: generateInstanceId(),
        dataId,
        currentDurability: durability,
      };
    },

    equipWeapon(unit: Unit, itemIndex: number): Unit {
      const slot = unit.inventory.items[itemIndex];
      if (!slot) return unit;
      const itemData = data.getItem(slot.dataId);
      if (!itemData || itemData.category !== ItemCategory.Weapon) return unit;
      const classDef = data.getClassDefinition(unit.className);
      return doEquipWeapon(unit, itemIndex, data, classDef);
    },

    equipArmor(unit: Unit, itemIndex: number): Unit {
      return doEquipArmor(unit, itemIndex, data);
    },

    useConsumable(unit: Unit, itemIndex: number): { unit: Unit; consumed: boolean } {
      const slot = unit.inventory.items[itemIndex];
      if (!slot) return { unit, consumed: false };

      const itemData = data.getItem(slot.dataId);
      if (!itemData || itemData.category !== ItemCategory.Consumable) {
        return { unit, consumed: false };
      }

      const consumable = itemData as ConsumableData;
      let updatedUnit = { ...unit, currentStats: { ...unit.currentStats } };

      // Apply effect
      const effect = consumable.effect;
      switch (effect.type) {
        case 'heal':
          if (effect.fullHeal) {
            updatedUnit = { ...updatedUnit, currentHP: updatedUnit.maxHP };
          } else if (effect.healAmount) {
            updatedUnit = {
              ...updatedUnit,
              currentHP: Math.min(updatedUnit.currentHP + effect.healAmount, updatedUnit.maxHP),
            };
          }
          break;
        case 'cureStatus':
          if (effect.cureStatus !== undefined) {
            const statusToRemove = effect.cureStatus;
            updatedUnit = {
              ...updatedUnit,
              activeStatusEffects: updatedUnit.activeStatusEffects.filter(
                (s) => s.type !== statusToRemove
              ),
            };
          }
          break;
        case 'statBoost':
          if (effect.permanent && effect.statBoost) {
            const stats = { ...updatedUnit.currentStats };
            const boost = effect.statBoost;
            for (const key of Object.keys(boost) as (keyof typeof boost)[]) {
              const val = boost[key];
              if (val !== undefined) {
                (stats as Record<string, number>)[key] += val;
              }
            }
            updatedUnit = { ...updatedUnit, currentStats: stats };
          }
          break;
        case 'key':
        case 'special':
          break;
      }

      // Reduce durability
      const newItem = doReduceDurability(slot);
      const newItems = [...updatedUnit.inventory.items];
      newItems[itemIndex] = newItem;

      updatedUnit = {
        ...updatedUnit,
        inventory: { ...updatedUnit.inventory, items: newItems },
      };

      return { unit: updatedUnit, consumed: true };
    },

    addToInventory(unit: Unit, item: ItemInstance): { unit: Unit; success: boolean } {
      return addToInventory(unit, item);
    },

    removeFromInventory(unit: Unit, itemIndex: number): { unit: Unit; item: ItemInstance | null } {
      return removeFromInventory(unit, itemIndex);
    },

    tradeItems(unitA: Unit, unitB: Unit, indexA: number, indexB: number): { unitA: Unit; unitB: Unit } {
      return doTradeItems(unitA, unitB, indexA, indexB);
    },

    addToConvoy(convoy: ItemInstance[], item: ItemInstance): ItemInstance[] {
      return doAddToConvoy(convoy, item);
    },

    removeFromConvoy(convoy: ItemInstance[], instanceId: string): { convoy: ItemInstance[]; item: ItemInstance | null } {
      return doRemoveFromConvoy(convoy, instanceId);
    },

    reduceDurability(item: ItemInstance): ItemInstance | null {
      return doReduceDurability(item);
    },

    forgeWeapon(
      item: ItemInstance,
      bonuses: { might: number; hit: number; crit: number },
      goldCost: number
    ): { item: ItemInstance; cost: number } {
      return doForgeWeapon(item, bonuses, goldCost);
    },

    getShopInventory(chapterId: string): ItemData[] {
      return doGetShopInventory(chapterId, data);
    },

    canUnitUseItem(unit: Unit, item: ItemData, classDef: ClassDefinition): boolean {
      return doCanUnitUseItem(unit, item, classDef);
    },
  };
}
