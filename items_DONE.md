# Items Domain — Complete

## Files Created

### Source Files (src/items/)
- `index.ts` — Public export of `createItemSystem`
- `itemSystem.ts` — Factory function implementing `IItemSystem`
- `inventoryManager.ts` — Add/remove items from unit inventory (5 slots)
- `equipmentManager.ts` — Equip weapons/armor, `canUnitUseItem` checks
- `durabilityManager.ts` — Reduce durability, handle item breakage
- `convoyManager.ts` — Add/remove items from shared convoy storage
- `tradeSystem.ts` — Swap items between two units
- `forgeSystem.ts` — Apply forge bonuses with caps (+5 might, +20 hit, +10 crit)
- `shopSystem.ts` — Per-chapter shop inventories (early/mid/late tiers)

### Test Files (src/items/__tests__/)
- `helpers.ts` — Shared test utilities, mock data provider, sample items/classes
- `inventory.test.ts` — 15 tests
- `equipment.test.ts` — 14 tests
- `consumables.test.ts` — 15 tests
- `durability.test.ts` — 8 tests
- `convoy.test.ts` — 10 tests
- `trade.test.ts` — 9 tests
- `forge.test.ts` — 13 tests
- `shop.test.ts` — 10 tests
- `canUseItem.test.ts` — 17 tests

## Test Results

- **111 tests passing** across 9 test files
- All tests pass with `vitest run src/items/`

## Implementation Notes

- All operations are immutable — return new objects, never mutate inputs
- `createItemSystem` closes over an `IDataProvider` for all item lookups
- Unique instance IDs generated via timestamp + counter
- Shop system uses chapter number extraction from chapterId strings
- Forge bonuses stack and are capped per stat
- Equipment removal auto-unequips weapons/armor at that index
- Consumable usage decrements durability and removes item at 0
