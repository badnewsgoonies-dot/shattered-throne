import {
  GridMap,
  GridType,
  IGridEngine,
  MovementType,
  Position,
  TerrainType,
  Tile,
  Unit,
} from '../shared/types';
import { applyFogOfWar } from './fogOfWar';
import { getLineOfSight } from './lineOfSight';
import { findPath } from './pathfinding';
import { calculateDangerZone, getAttackRange, getMovementRange } from './rangeCalculator';
import { getTerrainData } from './terrainData';

function posInBounds(map: GridMap, pos: Position): boolean {
  return pos.x >= 0 && pos.x < map.width && pos.y >= 0 && pos.y < map.height;
}

function oddRToCube(pos: Position): { x: number; y: number; z: number } {
  const x = pos.x - (pos.y - (pos.y & 1)) / 2;
  const z = pos.y;
  const y = -x - z;
  return { x, y, z };
}

function getHexAdjacent(map: GridMap, pos: Position): Position[] {
  const odd = pos.y % 2 === 1;
  const deltas = odd
    ? [
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: -1 },
        { x: 1, y: -1 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ]
    : [
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: -1, y: -1 },
        { x: 0, y: -1 },
        { x: -1, y: 1 },
        { x: 0, y: 1 },
      ];

  return deltas
    .map((delta) => ({ x: pos.x + delta.x, y: pos.y + delta.y }))
    .filter((candidate) => posInBounds(map, candidate));
}

function getSquareAdjacent(map: GridMap, pos: Position): Position[] {
  const candidates = [
    { x: pos.x, y: pos.y - 1 },
    { x: pos.x + 1, y: pos.y },
    { x: pos.x, y: pos.y + 1 },
    { x: pos.x - 1, y: pos.y },
  ];

  return candidates.filter((candidate) => posInBounds(map, candidate));
}

function cloneTile(tile: Tile): Tile {
  return {
    ...tile,
    position: { ...tile.position },
    terrain: {
      ...tile.terrain,
      movementCost: { ...tile.terrain.movementCost },
      passable: { ...tile.terrain.passable },
    },
  };
}

function cloneMap(map: GridMap): GridMap {
  return {
    ...map,
    tiles: map.tiles.map((row) => row.map((tile) => cloneTile(tile))),
    deploymentZones: map.deploymentZones.map((zone) => ({ ...zone })),
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isTerrainType(value: unknown): value is TerrainType {
  return typeof value === 'string' && Object.values(TerrainType).includes(value as TerrainType);
}

function isGridType(value: unknown): value is GridType {
  return typeof value === 'string' && Object.values(GridType).includes(value as GridType);
}

function validatePosition(value: unknown): value is Position {
  if (!isObject(value)) {
    return false;
  }
  return typeof value.x === 'number' && typeof value.y === 'number';
}

function validateTile(value: unknown): value is Tile {
  if (!isObject(value)) {
    return false;
  }

  if (!validatePosition(value.position)) {
    return false;
  }

  if (!isObject(value.terrain)) {
    return false;
  }

  if (!isTerrainType(value.terrain.type)) {
    return false;
  }

  const movementCost = value.terrain.movementCost;
  const passable = value.terrain.passable;

  if (!isObject(movementCost) || !isObject(passable)) {
    return false;
  }

  for (const moveType of Object.values(MovementType)) {
    if (typeof movementCost[moveType] !== 'number') {
      return false;
    }
    if (typeof passable[moveType] !== 'boolean') {
      return false;
    }
  }

  return (
    typeof value.terrain.defenseBonus === 'number' &&
    typeof value.terrain.evasionBonus === 'number' &&
    typeof value.terrain.heightLevel === 'number' &&
    (typeof value.occupantId === 'string' || value.occupantId === null) &&
    (typeof value.itemId === 'string' || value.itemId === null) &&
    typeof value.isChest === 'boolean' &&
    typeof value.isDoor === 'boolean' &&
    typeof value.isDeploymentZone === 'boolean' &&
    typeof value.fogRevealed === 'boolean'
  );
}

function validateMapShape(value: unknown): value is GridMap {
  if (!isObject(value)) {
    return false;
  }

  if (
    typeof value.id !== 'string' ||
    typeof value.name !== 'string' ||
    typeof value.width !== 'number' ||
    typeof value.height !== 'number' ||
    !Number.isInteger(value.width) ||
    !Number.isInteger(value.height) ||
    value.width <= 0 ||
    value.height <= 0 ||
    !isGridType(value.gridType)
  ) {
    return false;
  }

  if (!Array.isArray(value.tiles) || value.tiles.length !== value.height) {
    return false;
  }

  for (let y = 0; y < value.height; y += 1) {
    const row = value.tiles[y];
    if (!Array.isArray(row) || row.length !== value.width) {
      return false;
    }

    for (let x = 0; x < value.width; x += 1) {
      const tile = row[x];
      if (!validateTile(tile)) {
        return false;
      }
    }
  }

  if (!Array.isArray(value.deploymentZones)) {
    return false;
  }

  for (const zone of value.deploymentZones) {
    if (!validatePosition(zone)) {
      return false;
    }
  }

  return true;
}

export function createGridEngine(): IGridEngine {
  return {
    createGrid(width: number, height: number, gridType: GridType): GridMap {
      const tiles: Tile[][] = [];

      for (let y = 0; y < height; y += 1) {
        const row: Tile[] = [];
        for (let x = 0; x < width; x += 1) {
          row.push({
            position: { x, y },
            terrain: getTerrainData(TerrainType.Plains),
            occupantId: null,
            itemId: null,
            isChest: false,
            isDoor: false,
            isDeploymentZone: false,
            fogRevealed: false,
          });
        }
        tiles.push(row);
      }

      return {
        id: `generated_${width}x${height}_${gridType}`,
        name: 'Generated Grid',
        width,
        height,
        gridType,
        tiles,
        deploymentZones: [],
      };
    },

    loadMap(mapDef: GridMap): GridMap {
      return cloneMap(mapDef);
    },

    getTile(map: GridMap, pos: Position): Tile | null {
      if (!posInBounds(map, pos)) {
        return null;
      }
      const tile = map.tiles[pos.y]?.[pos.x];
      return tile ?? null;
    },

    setOccupant(map: GridMap, pos: Position, unitId: string | null): GridMap {
      if (!posInBounds(map, pos)) {
        return map;
      }

      const nextTiles = map.tiles.map((row, y) => {
        if (y !== pos.y) {
          return row;
        }

        return row.map((tile, x) => {
          if (x !== pos.x) {
            return tile;
          }
          return {
            ...tile,
            occupantId: unitId,
          };
        });
      });

      return {
        ...map,
        tiles: nextTiles,
      };
    },

    getMovementRange(
      map: GridMap,
      start: Position,
      movement: number,
      movementType: MovementType,
      units: Unit[],
    ): Position[] {
      return getMovementRange(map, start, movement, movementType, units);
    },

    getAttackRange(map: GridMap, positions: Position[], minRange: number, maxRange: number): Position[] {
      return getAttackRange(map, positions, minRange, maxRange);
    },

    findPath(
      map: GridMap,
      start: Position,
      end: Position,
      movement: number,
      movementType: MovementType,
      units: Unit[],
    ): Position[] | null {
      return findPath(map, start, end, movement, movementType, units);
    },

    getLineOfSight(map: GridMap, from: Position, to: Position): boolean {
      return getLineOfSight(map, from, to);
    },

    getAdjacentPositions(map: GridMap, pos: Position): Position[] {
      if (!posInBounds(map, pos)) {
        return [];
      }
      return map.gridType === GridType.Hex ? getHexAdjacent(map, pos) : getSquareAdjacent(map, pos);
    },

    getDistance(a: Position, b: Position, gridType: GridType): number {
      if (gridType === GridType.Square) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
      }

      const ac = oddRToCube(a);
      const bc = oddRToCube(b);
      return Math.max(Math.abs(ac.x - bc.x), Math.abs(ac.y - bc.y), Math.abs(ac.z - bc.z));
    },

    applyFogOfWar(map: GridMap, team: 'player' | 'enemy' | 'ally', units: Unit[]): GridMap {
      return applyFogOfWar(map, team, units);
    },

    calculateDangerZone(map: GridMap, enemies: Unit[]): Position[] {
      return calculateDangerZone(map, enemies);
    },

    serializeMap(map: GridMap): string {
      return JSON.stringify(map);
    },

    deserializeMap(data: string): GridMap {
      let parsed: unknown;
      try {
        parsed = JSON.parse(data);
      } catch {
        throw new Error('Invalid map JSON data');
      }

      if (!validateMapShape(parsed)) {
        throw new Error('Invalid GridMap structure');
      }

      return cloneMap(parsed);
    },
  };
}
