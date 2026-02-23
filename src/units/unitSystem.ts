import {
  ArmorData,
  ArmorSlot,
  ClassDefinition,
  IUnitSystem,
  ItemCategory,
  ItemData,
  Unit,
  WeaponData,
} from '../shared/types';
import {
  createEnemyUnit,
  createUnit,
} from './unitFactory';
import { getEffectiveStats } from './statCalculator';
import {
  applyStatusEffect,
  tickStatusEffects,
} from './statusEffects';
import { calculateAIAction } from './aiSystem';
import {
  deserializeUnit,
  serializeUnit,
} from './unitSerializer';

const ARMOR_SLOTS: ArmorSlot[] = [
  ArmorSlot.Head,
  ArmorSlot.Chest,
  ArmorSlot.Boots,
  ArmorSlot.Accessory,
];

function isWeaponData(item: ItemData): item is WeaponData {
  return item.category === ItemCategory.Weapon;
}

function isArmorData(item: ItemData): item is ArmorData {
  return item.category === ItemCategory.Armor;
}

export function createUnitSystem(): IUnitSystem {
  return {
    createUnit,
    createEnemyUnit,
    getEffectiveStats,
    applyDamage(unit: Unit, damage: number): Unit {
      const appliedDamage = Math.max(0, damage);
      const nextHP = unit.currentHP - appliedDamage;

      if (nextHP <= 0) {
        return {
          ...unit,
          currentHP: 0,
          isAlive: false,
        };
      }

      return {
        ...unit,
        currentHP: nextHP,
      };
    },
    applyHealing(unit: Unit, amount: number): Unit {
      const appliedHealing = Math.max(0, amount);
      return {
        ...unit,
        currentHP: Math.min(unit.maxHP, unit.currentHP + appliedHealing),
      };
    },
    applyStatusEffect,
    tickStatusEffects,
    resetTurnState(unit: Unit): Unit {
      return {
        ...unit,
        hasMoved: false,
        hasActed: false,
      };
    },
    getEquippedWeapon(unit: Unit, items: ItemData[]): WeaponData | null {
      const weaponIndex = unit.inventory.equippedWeaponIndex;

      if (weaponIndex === null) {
        return null;
      }

      const itemInstance = unit.inventory.items[weaponIndex];

      if (!itemInstance) {
        return null;
      }

      const weapon = items.find(
        (item): item is WeaponData => item.id === itemInstance.dataId && isWeaponData(item),
      );

      return weapon ?? null;
    },
    getEquippedArmor(unit: Unit, items: ItemData[]): ArmorData[] {
      const equippedArmor: ArmorData[] = [];

      for (const slot of ARMOR_SLOTS) {
        const armorIndex = unit.inventory.equippedArmor[slot];

        if (armorIndex === null) {
          continue;
        }

        const itemInstance = unit.inventory.items[armorIndex];

        if (!itemInstance) {
          continue;
        }

        const armor = items.find(
          (item): item is ArmorData => item.id === itemInstance.dataId && isArmorData(item),
        );

        if (armor) {
          equippedArmor.push(armor);
        }
      }

      return equippedArmor;
    },
    canUseWeapon(_unit: Unit, weapon: WeaponData, classDef: ClassDefinition): boolean {
      return classDef.weaponTypes.includes(weapon.weaponType);
    },
    calculateAIAction,
    serializeUnit,
    deserializeUnit,
  };
}
