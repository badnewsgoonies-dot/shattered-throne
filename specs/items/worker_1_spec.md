# Equipment & Items — Full Domain Implementation

You are implementing the Items domain for Shattered Throne, a tactical RPG.

## CRITICAL RULES
- ONLY create/modify files under `src/items/`
- Import types ONLY from `../../shared/types`
- Do NOT import from any other domain
- The file `src/shared/types.ts` already exists — do NOT modify it

## Files to Create

### 1. `src/items/inventoryManager.ts`

```typescript
import { Unit, ItemInstance, MAX_INVENTORY_SLOTS, ArmorSlot } from '../../shared/types';

export function addToInventory(unit: Unit, item: ItemInstance): { unit: Unit; success: boolean } {
  const items = [...unit.inventory.items];
  const emptyIndex = items.findIndex(i => i === null);
  if (emptyIndex === -1) return { unit, success: false };
  items[emptyIndex] = item;
  return { unit: { ...unit, inventory: { ...unit.inventory, items } }, success: true };
}

export function removeFromInventory(unit: Unit, itemIndex: number): { unit: Unit; item: ItemInstance | null } {
  if (itemIndex < 0 || itemIndex >= MAX_INVENTORY_SLOTS) return { unit, item: null };
  const items = [...unit.inventory.items];
  const removed = items[itemIndex];
  items[itemIndex] = null;
  // If this was equipped weapon, unequip
  let equippedWeaponIndex = unit.inventory.equippedWeaponIndex;
  if (equippedWeaponIndex === itemIndex) equippedWeaponIndex = null;
  // If this was equipped armor, unequip
  const equippedArmor = { ...unit.inventory.equippedArmor };
  for (const slot of Object.values(ArmorSlot)) {
    if (equippedArmor[slot] === itemIndex) equippedArmor[slot] = null;
  }
  return { unit: { ...unit, inventory: { ...unit.inventory, items, equippedWeaponIndex, equippedArmor } }, item: removed };
}
```

### 2. `src/items/equipmentManager.ts`

```typescript
import { Unit, ItemData, WeaponData, ArmorData, ClassDefinition, ItemCategory, ArmorSlot } from '../../shared/types';

export function equipWeapon(unit: Unit, itemIndex: number): Unit {
  // Validate index has an item, validate it's a weapon (by checking the dataId lookup externally)
  // Set equippedWeaponIndex = itemIndex
  return { ...unit, inventory: { ...unit.inventory, equippedWeaponIndex: itemIndex } };
}

export function equipArmor(unit: Unit, itemIndex: number, armorData: ArmorData): Unit {
  const equippedArmor = { ...unit.inventory.equippedArmor };
  equippedArmor[armorData.slot] = itemIndex;
  return { ...unit, inventory: { ...unit.inventory, equippedArmor } };
}

export function canUnitUseItem(unit: Unit, item: ItemData, classDef: ClassDefinition): boolean {
  if (item.category === ItemCategory.Weapon) {
    return classDef.weaponTypes.includes((item as WeaponData).weaponType);
  }
  if (item.category === ItemCategory.PromotionItem) {
    return (item as any).validClasses.includes(classDef.name);
  }
  return true; // Armor and consumables always usable
}
```

### 3. `src/items/durabilityManager.ts`

```typescript
import { ItemInstance } from '../../shared/types';

export function reduceDurability(item: ItemInstance): ItemInstance | null {
  if (item.currentDurability === undefined) return item;
  const newDur = item.currentDurability - 1;
  if (newDur <= 0) return null; // Item broken
  return { ...item, currentDurability: newDur };
}
```

### 4. `src/items/convoyManager.ts`

```typescript
import { ItemInstance } from '../../shared/types';

export function addToConvoy(convoy: ItemInstance[], item: ItemInstance): ItemInstance[] {
  return [...convoy, item];
}

export function removeFromConvoy(convoy: ItemInstance[], instanceId: string): { convoy: ItemInstance[]; item: ItemInstance | null } {
  const index = convoy.findIndex(i => i.instanceId === instanceId);
  if (index === -1) return { convoy, item: null };
  const item = convoy[index];
  const newConvoy = [...convoy.slice(0, index), ...convoy.slice(index + 1)];
  return { convoy: newConvoy, item };
}
```

### 5. `src/items/tradeSystem.ts`

```typescript
import { Unit } from '../../shared/types';

export function tradeItems(unitA: Unit, unitB: Unit, indexA: number, indexB: number): { unitA: Unit; unitB: Unit } {
  const itemsA = [...unitA.inventory.items];
  const itemsB = [...unitB.inventory.items];
  const temp = itemsA[indexA];
  itemsA[indexA] = itemsB[indexB];
  itemsB[indexB] = temp;
  return {
    unitA: { ...unitA, inventory: { ...unitA.inventory, items: itemsA } },
    unitB: { ...unitB, inventory: { ...unitB.inventory, items: itemsB } },
  };
}
```

### 6. `src/items/forgeSystem.ts`

```typescript
import { ItemInstance } from '../../shared/types';

export function forgeWeapon(
  item: ItemInstance,
  bonuses: { might: number; hit: number; crit: number },
  goldCost: number
): { item: ItemInstance; cost: number } {
  const current = item.forgeBonuses ?? { might: 0, hit: 0, crit: 0 };
  const newBonuses = {
    might: Math.min(current.might + bonuses.might, 5),
    hit: Math.min(current.hit + bonuses.hit, 20),
    crit: Math.min(current.crit + bonuses.crit, 10),
  };
  return { item: { ...item, forgeBonuses: newBonuses }, cost: goldCost };
}
```

### 7. `src/items/shopSystem.ts`

```typescript
import { ItemData, IDataProvider } from '../../shared/types';

// Shop inventories by chapter tier
const EARLY_ITEMS = ['iron_sword', 'iron_lance', 'iron_axe', 'iron_bow', 'fire', 'heal_staff', 'vulnerary', 'iron_helm', 'iron_plate'];
const MID_ITEMS = [...EARLY_ITEMS, 'steel_sword', 'steel_lance', 'steel_axe', 'steel_bow', 'elfire', 'mend_staff', 'concoction', 'steel_helm', 'steel_plate', 'antidote'];
const LATE_ITEMS = [...MID_ITEMS, 'silver_sword', 'silver_lance', 'silver_axe', 'silver_bow', 'arcfire', 'recover_staff', 'elixir', 'silver_helm', 'silver_plate', 'master_seal'];

export function getShopInventory(chapterId: string, dataProvider: IDataProvider): ItemData[] {
  // Parse chapter number from ID (e.g., 'ch_1' -> 1)
  const num = parseInt(chapterId.replace(/\D/g, ''), 10) || 1;
  let itemIds: string[];
  if (num <= 5) itemIds = EARLY_ITEMS;
  else if (num <= 15) itemIds = MID_ITEMS;
  else itemIds = LATE_ITEMS;

  return itemIds.map(id => dataProvider.getItem(id)).filter((i): i is ItemData => i !== null);
}
```

### 8. `src/items/itemSystem.ts`

Factory function `createItemSystem(data: IDataProvider): IItemSystem`.

```typescript
import { IItemSystem, IDataProvider, ItemData, ItemInstance, Unit, ClassDefinition, ItemCategory, ConsumableData, WeaponData, ArmorData } from '../../shared/types';

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
      if (itemData) {
        if (itemData.category === ItemCategory.Weapon) {
          instance.currentDurability = (itemData as WeaponData).maxDurability;
        } else if (itemData.category === ItemCategory.Consumable) {
          instance.currentDurability = (itemData as ConsumableData).uses;
        }
      }
      return instance;
    },

    equipWeapon(unit, itemIndex) { /* delegate to equipmentManager */ },
    equipArmor(unit, itemIndex) { /* delegate to equipmentManager, look up armor data */ },
    useConsumable(unit, itemIndex) {
      // Look up item data, apply effect (heal, cureStatus, statBoost, key)
      // Decrement durability, remove if 0
    },
    addToInventory(unit, item) { /* delegate */ },
    removeFromInventory(unit, itemIndex) { /* delegate */ },
    tradeItems(unitA, unitB, indexA, indexB) { /* delegate */ },
    addToConvoy(convoy, item) { /* delegate */ },
    removeFromConvoy(convoy, instanceId) { /* delegate */ },
    reduceDurability(item) { /* delegate */ },
    forgeWeapon(item, bonuses, goldCost) { /* delegate */ },
    getShopInventory(chapterId) { return getShopInventory(chapterId, data); },
    canUnitUseItem(unit, item, classDef) { /* delegate */ },
  };
}
```

### 9. `src/items/index.ts`
```typescript
export { createItemSystem } from './itemSystem';
```

### 10. Tests — `src/items/__tests__/`

For tests, create a mock IDataProvider that returns test item data:
```typescript
const mockWeapon: WeaponData = {
  id: 'test_sword', name: 'Test Sword', description: 'A test sword',
  category: ItemCategory.Weapon, weaponType: WeaponType.Sword,
  might: 5, hit: 90, crit: 0, range: { min: 1, max: 1 },
  weight: 5, maxDurability: 45, cost: 500, rank: 'E'
};
// Similarly for armor, consumables, etc.
```

**inventory.test.ts** (~12 tests): Add items to inventory, full inventory rejection, remove items, slot management, unequip on remove.

**equipment.test.ts** (~12 tests): Equip weapon, equip armor slots, class restriction, unequip.

**consumables.test.ts** (~10 tests): Heal effect, cure status, stat boost, full heal, durability.

**durability.test.ts** (~8 tests): Reduce durability, breakage at 0, no durability field.

**convoy.test.ts** (~8 tests): Add to convoy, remove by ID, not found.

**trade.test.ts** (~8 tests): Swap items, null handling.

**forge.test.ts** (~8 tests): Add bonuses, cap enforcement, stacking.

**shop.test.ts** (~8 tests): Early/mid/late shop inventories.

**canUseItem.test.ts** (~8 tests): Weapon type restrictions, promotion item restrictions, always-usable items.

TOTAL: 80+ tests

## Import Pattern
```typescript
import {
  IItemSystem, IDataProvider, ItemData, ItemInstance, Unit, WeaponData, ArmorData,
  ConsumableData, PromotionItemData, ClassDefinition, ItemCategory, WeaponType,
  ArmorSlot, Inventory, MAX_INVENTORY_SLOTS, ConsumableEffect, StatusEffectType,
  UnitClassName, MovementType
} from '../../shared/types';
```
