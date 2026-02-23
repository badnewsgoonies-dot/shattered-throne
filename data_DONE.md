# Data & Content Domain - Complete

## Files Created

### Data Files (src/data/)
1. `src/data/index.ts` — Public export of `createDataProvider`
2. `src/data/dataProvider.ts` — Factory function implementing `IDataProvider`
3. `src/data/classes.ts` — 19 class definitions (7 base + 12 promoted)
4. `src/data/weapons.ts` — 81 weapons across all weapon types
5. `src/data/armor.ts` — 40 armor pieces across 4 slots with 3 set IDs
6. `src/data/consumables.ts` — 21 consumables (heals, stat boosters, keys, etc.)
7. `src/data/promotionItems.ts` — 6 promotion items
8. `src/data/skills.ts` — 55 skill definitions (active + passive)
9. `src/data/characters.ts` — 46 characters (20 player, 10 bosses, 6 NPCs, 10 paralogue recruits)
10. `src/data/supportConversations.ts` — 33 support conversations (11 pairs × C/B/A)
11. `src/data/chapters.ts` — 25 story chapters
12. `src/data/paralogues.ts` — 10 paralogue chapters
13. `src/data/mapLayouts.ts` — 22 map layouts (8x8 to 20x20)
14. `src/data/enemyTemplates.ts` — 31 enemy templates
15. `src/data/validation.ts` — Cross-reference validation

### Test Files (src/data/__tests__/)
1. `classes.test.ts` — 13 tests
2. `weapons.test.ts` — 19 tests
3. `armor.test.ts` — 13 tests
4. `consumables.test.ts` — 10 tests
5. `skills.test.ts` — 11 tests
6. `characters.test.ts` — 13 tests
7. `chapters.test.ts` — 12 tests
8. `paralogues.test.ts` — 8 tests
9. `supportConversations.test.ts` — 7 tests
10. `mapLayouts.test.ts` — 10 tests
11. `enemyTemplates.test.ts` — 8 tests
12. `validation.test.ts` — 5 tests
13. `dataProvider.test.ts` — 36 tests

## Test Results

- **13 test files, all passing**
- **165 tests total, all passing**

## Implementation Notes

- Dancer is classified as a base class (isPromoted: false) with no promotion path, resulting in 7 base + 12 promoted = 19 total classes
- Staves are modeled as WeaponData with WeaponType.Staff and specialEffect strings for their healing/status behavior
- Map layouts use a builder function that converts ASCII art to tile grids for compact definition
- Chapters 11-25 are generated with a factory pattern for lighter but valid definitions
- Some armor pieces (Winged Boots, Speed Ring) have negative speedPenalty to represent speed bonuses
- Enemy templates are archetypes at position (0,0); chapters place them at specific positions
- All cross-references validated: equipment IDs, skill IDs, map IDs, character IDs, chapter links
