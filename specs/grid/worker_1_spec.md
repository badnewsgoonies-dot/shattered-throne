# Grid Engine — Full Domain Implementation

You are implementing the Grid Engine domain for Shattered Throne, a tactical RPG.

## CRITICAL RULES
- ONLY create/modify files under `src/grid/`
- Import types ONLY from `../../shared/types`
- Do NOT import from any other domain
- The file `src/shared/types.ts` already exists — do NOT modify it

## Files to Create

### 1. `src/grid/terrainData.ts`
Define terrain data for all 11 terrain types from TerrainType enum.

```typescript
import { TerrainType, TerrainData, MovementType } from '../../shared/types';

// Movement costs (99 = impassable):
// Plains:    Foot=1, Mounted=1, Armored=1, Flying=1, Def=0, Eva=0, Height=0
// Forest:    Foot=2, Mounted=3, Armored=2, Flying=1, Def=1, Eva=20, Height=0
// Mountain:  Foot=4, Mounted=99, Armored=99, Flying=1, Def=2, Eva=30, Height=2
// Water:     Foot=99, Mounted=99, Armored=99, Flying=1, Def=0, Eva=0, Height=0
// Lava:      Foot=99, Mounted=99, Armored=99, Flying=1, Def=0, Eva=0, Height=0
// Fortress:  Foot=1, Mounted=1, Armored=1, Flying=1, Def=3, Eva=20, Height=1
// Bridge:    Foot=1, Mounted=1, Armored=1, Flying=1, Def=0, Eva=0, Height=0
// Swamp:     Foot=3, Mounted=4, Armored=3, Flying=1, Def=0, Eva=10, Height=0
// Sand:      Foot=2, Mounted=3, Armored=2, Flying=1, Def=0, Eva=5, Height=0
// Snow:      Foot=2, Mounted=3, Armored=2, Flying=1, Def=0, Eva=10, Height=0
// Void:      ALL=99, Def=0, Eva=0, Height=0

// Passable = movement cost < 99 for that type. Void is impassable by all.

export const DEFAULT_TERRAIN_MAP: Record<TerrainType, TerrainData> = { ... };
export function getTerrainData(type: TerrainType): TerrainData { ... }
```

### 2. `src/grid/gridEngine.ts`
Main engine implementing IGridEngine. Factory function `createGridEngine(): IGridEngine`.

Methods:
- `createGrid(width, height, gridType)`: Create grid filled with Plains terrain. Each tile has position, terrain, null occupant, etc.
- `loadMap(mapDef)`: Deep clone and return.
- `getTile(map, pos)`: Return tile at [pos.y][pos.x] or null if out of bounds.
- `setOccupant(map, pos, unitId)`: Return new map with updated occupant. Immutable.
- `getAdjacentPositions(map, pos)`: 4-directional for square (N/S/E/W), 6-directional for hex.
- `getDistance(a, b, gridType)`: Manhattan for square, hex distance for hex.
- `serializeMap(map)`: JSON.stringify.
- `deserializeMap(data)`: JSON.parse with validation.

Delegate to pathfinding/range/LOS/fog modules for complex methods.

### 3. `src/grid/pathfinding.ts`
A* pathfinding with terrain costs.

`findPath(map, start, end, movement, movementType, units)`:
- Use A* with priority queue (min-heap).
- Cost = terrain movementCost for the unit's movementType.
- Tiles occupied by enemy units are impassable.
- Tiles occupied by friendly units can be passed through but not stopped on.
- Zone of control: tiles adjacent to enemy units cost +3 extra (ZONE_OF_CONTROL_EXTRA_COST=3).
- Return path as Position[] from start to end, or null if unreachable within movement.
- For hex grids, use hex distance as heuristic.

### 4. `src/grid/rangeCalculator.ts`
- `getMovementRange(map, start, movement, movementType, units)`: BFS/Dijkstra flood fill from start. Account for terrain costs, block on impassable/enemy tiles. Return all reachable positions.
- `getAttackRange(map, positions, minRange, maxRange)`: From each position in the movement range, find all tiles at distance [minRange, maxRange] that are NOT in the movement range.
- `calculateDangerZone(map, enemies)`: For each enemy unit (must have position and be alive), compute movement range + attack range (assume min range 1, max range from unit stats — use movement stat for range, assume weapon range 1-2). Union all positions.

### 5. `src/grid/lineOfSight.ts`
`getLineOfSight(map, from, to)`: Bresenham's line algorithm.
- Cast ray from `from` to `to`.
- Check each intermediate tile's height.
- If an intermediate tile has heightLevel > from tile and blocks view to target, return false.
- Same or lower height doesn't block.
- Return true if line is clear.

### 6. `src/grid/fogOfWar.ts`
`applyFogOfWar(map, team, units)`:
- For each unit on the given team, compute vision radius = unit.currentStats.movement + 2.
- For each tile within vision radius, check LOS from unit position.
- Set fogRevealed = true for visible tiles, false for others.
- Return new map.

### 7. `src/grid/mapTemplates.ts`
Define 20 predefined battle maps as GridMap objects.

Use `getTerrainData` from terrainData.ts to build tiles. Each map needs unique terrain layouts.

**Small (8x8) - 5 maps:**
- `map_arena_8x8`: Open arena, mostly plains with fortress in center
- `map_forest_clearing_8x8`: Forest ring around plains clearing
- `map_bridge_crossing_8x8`: River (water) with bridge in middle
- `map_village_square_8x8`: Mix of plains and fortress tiles
- `map_mountain_pass_8x8`: Mountain walls with narrow plains path

**Medium (12x12) - 5 maps:**
- `map_castle_courtyard_12x12`: Fortress tiles around edge, plains center
- `map_riverside_12x12`: River along one side, bridge, varied terrain
- `map_desert_oasis_12x12`: Sand with water oasis in center
- `map_snowy_field_12x12`: Snow terrain with forest patches
- `map_swamp_ruins_12x12`: Swamp with fortress ruins

**Large (16x16) - 5 maps:**
- `map_open_battlefield_16x16`: Large open field with tactical features
- `map_fortress_siege_16x16`: Large fortress structure
- `map_volcanic_crater_16x16`: Lava ring with mountain border
- `map_coastal_cliff_16x16`: Water edge, mountains, varied height
- `map_ancient_temple_16x16`: Fortress and void tiles, symmetrical

**Extra Large (20x20+) - 5 maps:**
- `map_grand_castle_20x20`: Massive castle layout
- `map_dragons_lair_20x20`: Cave-like with lava and mountains
- `map_final_battlefield_24x24`: Epic final map
- `map_mountain_fortress_20x20`: Mountain stronghold
- `map_dark_forest_20x20`: Dense forest with clearings

Each map MUST have:
- Unique `id` matching the key
- `name` (display name)
- Correct `width` and `height`
- `gridType: GridType.Square`
- `tiles` as 2D array [y][x] of Tile objects
- `deploymentZones`: 4-8 positions

Export: `MAP_TEMPLATES: Record<string, GridMap>` and `getMapTemplate(id: string): GridMap | null`.

### 8. `src/grid/index.ts`
```typescript
export { createGridEngine } from './gridEngine';
```

### 9. Tests — `src/grid/__tests__/`

Create these test files using `import { describe, it, expect } from 'vitest'`:

**terrain.test.ts**: Test all 11 terrain types have correct movement costs, defense/evasion bonuses, height, passability. (~15 tests)

**gridCreation.test.ts**: createGrid dimensions, getTile in/out of bounds, setOccupant immutability, loadMap deep clones. (~15 tests)

**pathfinding.test.ts**: A* on open field, path around obstacles, impassable terrain, zone of control extra cost, no path returns null, hex grid paths. (~20 tests)

**rangeCalculation.test.ts**: Movement range flood fill accuracy, range with terrain costs, attack range computation, danger zone union. (~15 tests)

**lineOfSight.test.ts**: LOS on flat terrain (true), blocked by mountains, height advantage, adjacent tiles, same tile. (~10 tests)

**fogOfWar.test.ts**: Vision radius, LOS-based fog, team filtering. (~10 tests)

**mapTemplates.test.ts**: All 20 maps exist, valid dimensions, have deployment zones, have varied terrain. (~10 tests)

**serialization.test.ts**: Round-trip serialize/deserialize, invalid input handling. (~8 tests)

TOTAL: 100+ tests

## Import Pattern
Always import from `../../shared/types`:
```typescript
import {
  GridMap, GridType, Tile, Position, TerrainData, TerrainType,
  MovementType, Unit, IGridEngine, ZONE_OF_CONTROL_EXTRA_COST
} from '../../shared/types';
```

## IMPORTANT
- All functions must be pure / immutable where specified
- Use proper TypeScript strict mode types
- Make sure all method signatures match the IGridEngine interface EXACTLY
- The `forgeBonuses` field on WeaponData is optional (has `?`)
