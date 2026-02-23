import {
  GridMap,
  GridType,
  MovementType,
  Position,
  TerrainData,
  TerrainType,
  Tile,
} from '../shared/types';

const IMPASSABLE_COST = 99;

function terrain(
  type: TerrainType,
  movementCost: Record<MovementType, number>,
  defenseBonus: number,
  evasionBonus: number,
  heightLevel: number,
): TerrainData {
  return {
    type,
    movementCost,
    defenseBonus,
    evasionBonus,
    heightLevel,
    passable: {
      [MovementType.Foot]: movementCost[MovementType.Foot] < IMPASSABLE_COST,
      [MovementType.Mounted]: movementCost[MovementType.Mounted] < IMPASSABLE_COST,
      [MovementType.Armored]: movementCost[MovementType.Armored] < IMPASSABLE_COST,
      [MovementType.Flying]: movementCost[MovementType.Flying] < IMPASSABLE_COST,
    },
  };
}

const TERRAIN_LIBRARY: Record<TerrainType, TerrainData> = {
  [TerrainType.Plains]: terrain(
    TerrainType.Plains,
    {
      [MovementType.Foot]: 1,
      [MovementType.Mounted]: 1,
      [MovementType.Armored]: 1,
      [MovementType.Flying]: 1,
    },
    0,
    0,
    0,
  ),
  [TerrainType.Forest]: terrain(
    TerrainType.Forest,
    {
      [MovementType.Foot]: 2,
      [MovementType.Mounted]: 3,
      [MovementType.Armored]: 2,
      [MovementType.Flying]: 1,
    },
    1,
    20,
    0,
  ),
  [TerrainType.Mountain]: terrain(
    TerrainType.Mountain,
    {
      [MovementType.Foot]: 4,
      [MovementType.Mounted]: IMPASSABLE_COST,
      [MovementType.Armored]: IMPASSABLE_COST,
      [MovementType.Flying]: 1,
    },
    2,
    30,
    2,
  ),
  [TerrainType.Water]: terrain(
    TerrainType.Water,
    {
      [MovementType.Foot]: IMPASSABLE_COST,
      [MovementType.Mounted]: IMPASSABLE_COST,
      [MovementType.Armored]: IMPASSABLE_COST,
      [MovementType.Flying]: 1,
    },
    0,
    0,
    0,
  ),
  [TerrainType.Lava]: terrain(
    TerrainType.Lava,
    {
      [MovementType.Foot]: IMPASSABLE_COST,
      [MovementType.Mounted]: IMPASSABLE_COST,
      [MovementType.Armored]: IMPASSABLE_COST,
      [MovementType.Flying]: 1,
    },
    0,
    0,
    0,
  ),
  [TerrainType.Fortress]: terrain(
    TerrainType.Fortress,
    {
      [MovementType.Foot]: 1,
      [MovementType.Mounted]: 1,
      [MovementType.Armored]: 1,
      [MovementType.Flying]: 1,
    },
    3,
    20,
    1,
  ),
  [TerrainType.Bridge]: terrain(
    TerrainType.Bridge,
    {
      [MovementType.Foot]: 1,
      [MovementType.Mounted]: 1,
      [MovementType.Armored]: 1,
      [MovementType.Flying]: 1,
    },
    0,
    0,
    0,
  ),
  [TerrainType.Swamp]: terrain(
    TerrainType.Swamp,
    {
      [MovementType.Foot]: 3,
      [MovementType.Mounted]: 4,
      [MovementType.Armored]: 3,
      [MovementType.Flying]: 1,
    },
    0,
    10,
    0,
  ),
  [TerrainType.Sand]: terrain(
    TerrainType.Sand,
    {
      [MovementType.Foot]: 2,
      [MovementType.Mounted]: 3,
      [MovementType.Armored]: 2,
      [MovementType.Flying]: 1,
    },
    0,
    5,
    0,
  ),
  [TerrainType.Snow]: terrain(
    TerrainType.Snow,
    {
      [MovementType.Foot]: 2,
      [MovementType.Mounted]: 3,
      [MovementType.Armored]: 2,
      [MovementType.Flying]: 1,
    },
    0,
    10,
    0,
  ),
  [TerrainType.Void]: terrain(
    TerrainType.Void,
    {
      [MovementType.Foot]: IMPASSABLE_COST,
      [MovementType.Mounted]: IMPASSABLE_COST,
      [MovementType.Armored]: IMPASSABLE_COST,
      [MovementType.Flying]: IMPASSABLE_COST,
    },
    0,
    0,
    0,
  ),
};

function cloneTerrain(type: TerrainType): TerrainData {
  const source = TERRAIN_LIBRARY[type];
  return {
    ...source,
    movementCost: { ...source.movementCost },
    passable: { ...source.passable },
  };
}

function key(position: Position): string {
  return `${position.x},${position.y}`;
}

function rectanglePositions(xStart: number, yStart: number, width: number, height: number): Position[] {
  const result: Position[] = [];
  for (let y = yStart; y < yStart + height; y += 1) {
    for (let x = xStart; x < xStart + width; x += 1) {
      result.push({ x, y });
    }
  }
  return result;
}

interface MapSpec {
  id: string;
  name: string;
  width: number;
  height: number;
  deploymentZones: Position[];
  terrainAt: (x: number, y: number, width: number, height: number) => TerrainType;
  chestPositions?: Position[];
  doorPositions?: Position[];
}

function buildMap(spec: MapSpec): GridMap {
  const deploymentSet = new Set(spec.deploymentZones.map(key));
  const chestSet = new Set((spec.chestPositions ?? []).map(key));
  const doorSet = new Set((spec.doorPositions ?? []).map(key));

  const tiles: Tile[][] = [];
  for (let y = 0; y < spec.height; y += 1) {
    const row: Tile[] = [];
    for (let x = 0; x < spec.width; x += 1) {
      const position = { x, y };
      row.push({
        position,
        terrain: cloneTerrain(spec.terrainAt(x, y, spec.width, spec.height)),
        occupantId: null,
        itemId: null,
        isChest: chestSet.has(key(position)),
        isDoor: doorSet.has(key(position)),
        isDeploymentZone: deploymentSet.has(key(position)),
        fogRevealed: false,
      });
    }
    tiles.push(row);
  }

  return {
    id: spec.id,
    name: spec.name,
    width: spec.width,
    height: spec.height,
    gridType: GridType.Square,
    tiles,
    deploymentZones: spec.deploymentZones.map((zone) => ({ ...zone })),
  };
}

const MAP_SPECS: MapSpec[] = [
  {
    id: 'map_borderlands_08',
    name: 'Borderlands Clash',
    width: 8,
    height: 8,
    deploymentZones: rectanglePositions(0, 2, 2, 3),
    terrainAt: (x, y) => {
      if ((x === 3 || x === 4) && (y === 3 || y === 4)) return TerrainType.Fortress;
      if ((x + y) % 7 === 0) return TerrainType.Forest;
      return TerrainType.Plains;
    },
  },
  {
    id: 'map_silent_valley_08',
    name: 'Silent Valley',
    width: 8,
    height: 8,
    deploymentZones: rectanglePositions(0, 0, 2, 2),
    terrainAt: (x, y) => {
      if (y === 4 && x >= 2 && x <= 5) return TerrainType.Bridge;
      if (y === 3 || y === 5) return TerrainType.Water;
      if (x === 7 && y >= 2) return TerrainType.Mountain;
      return TerrainType.Plains;
    },
    chestPositions: [{ x: 7, y: 7 }],
  },
  {
    id: 'map_shattered_plains_10',
    name: 'Shattered Plains',
    width: 10,
    height: 10,
    deploymentZones: rectanglePositions(0, 3, 2, 4),
    terrainAt: (x, y, width, height) => {
      if (x === Math.floor(width / 2) && y > 1 && y < height - 2) return TerrainType.Fortress;
      if ((x * 3 + y * 2) % 11 === 0) return TerrainType.Forest;
      return TerrainType.Plains;
    },
    chestPositions: [{ x: 9, y: 1 }],
  },
  {
    id: 'map_woodland_10',
    name: 'Woodland Ambush',
    width: 10,
    height: 10,
    deploymentZones: rectanglePositions(0, 7, 3, 2),
    terrainAt: (x, y) => {
      if (x <= 1 || y <= 1 || x >= 8 || y >= 8) return TerrainType.Forest;
      if ((x + y) % 5 === 0) return TerrainType.Forest;
      if (x === 5 && y === 5) return TerrainType.Fortress;
      return TerrainType.Plains;
    },
    chestPositions: [{ x: 8, y: 8 }],
  },
  {
    id: 'map_river_crossing_12',
    name: 'River Crossing',
    width: 12,
    height: 12,
    deploymentZones: rectanglePositions(0, 4, 2, 4),
    terrainAt: (x, y, width) => {
      const riverX = Math.floor(width / 2);
      if (x === riverX || x === riverX - 1) {
        if (y === 5 || y === 6) return TerrainType.Bridge;
        return TerrainType.Water;
      }
      if ((x + y) % 9 === 0) return TerrainType.Forest;
      return TerrainType.Plains;
    },
    doorPositions: [{ x: 10, y: 5 }],
    chestPositions: [{ x: 11, y: 10 }],
  },
  {
    id: 'map_hill_fort_12',
    name: 'Hill Fort',
    width: 12,
    height: 12,
    deploymentZones: rectanglePositions(0, 5, 2, 3),
    terrainAt: (x, y) => {
      const dx = x - 6;
      const dy = y - 6;
      const distance = Math.abs(dx) + Math.abs(dy);
      if (distance <= 2) return TerrainType.Fortress;
      if (distance <= 4) return TerrainType.Mountain;
      if ((x + y) % 6 === 0) return TerrainType.Forest;
      return TerrainType.Plains;
    },
    chestPositions: [{ x: 6, y: 6 }],
  },
  {
    id: 'map_cathedral_12',
    name: 'Cathedral Steps',
    width: 12,
    height: 12,
    deploymentZones: rectanglePositions(0, 9, 3, 2),
    terrainAt: (x, y) => {
      if (x >= 4 && x <= 7 && y >= 2 && y <= 9) return TerrainType.Fortress;
      if (x === 5 || x === 6) return TerrainType.Bridge;
      if ((x + y) % 8 === 0) return TerrainType.Forest;
      return TerrainType.Plains;
    },
    doorPositions: [{ x: 6, y: 2 }],
    chestPositions: [{ x: 5, y: 3 }],
  },
  {
    id: 'map_twilight_forest_12',
    name: 'Twilight Forest',
    width: 12,
    height: 12,
    deploymentZones: rectanglePositions(0, 0, 3, 2),
    terrainAt: (x, y) => {
      if ((x + y) % 2 === 0 && x > 1 && y > 1 && x < 10 && y < 10) return TerrainType.Forest;
      if (x === 10 && y === 10) return TerrainType.Fortress;
      return TerrainType.Plains;
    },
    chestPositions: [{ x: 11, y: 11 }],
  },
  {
    id: 'map_port_siege_14',
    name: 'Port Siege',
    width: 14,
    height: 14,
    deploymentZones: rectanglePositions(0, 4, 2, 5),
    terrainAt: (x, y) => {
      if (y >= 10 && x >= 4) return TerrainType.Water;
      if (y === 9 && x >= 5) return TerrainType.Bridge;
      if (x >= 9 && y <= 4) return TerrainType.Fortress;
      if ((x + y) % 10 === 0) return TerrainType.Forest;
      return TerrainType.Plains;
    },
    doorPositions: [{ x: 10, y: 4 }],
    chestPositions: [{ x: 12, y: 2 }],
  },
  {
    id: 'map_desert_outpost_14',
    name: 'Desert Outpost',
    width: 14,
    height: 14,
    deploymentZones: rectanglePositions(0, 6, 2, 3),
    terrainAt: (x, y) => {
      if (x >= 4 && x <= 9 && y >= 4 && y <= 9 && (x === 4 || x === 9 || y === 4 || y === 9)) return TerrainType.Fortress;
      if ((x + y) % 3 === 0) return TerrainType.Sand;
      return TerrainType.Plains;
    },
    chestPositions: [{ x: 7, y: 7 }],
    doorPositions: [{ x: 6, y: 4 }],
  },
  {
    id: 'map_ancient_ruins_14',
    name: 'Ancient Ruins',
    width: 14,
    height: 14,
    deploymentZones: rectanglePositions(0, 12, 3, 2),
    terrainAt: (x, y) => {
      if ((x % 4 === 0 && y % 3 === 0) || (x % 5 === 2 && y % 5 === 2)) return TerrainType.Fortress;
      if ((x + y) % 7 === 0) return TerrainType.Swamp;
      return TerrainType.Plains;
    },
    chestPositions: [
      { x: 11, y: 2 },
      { x: 12, y: 10 },
    ],
  },
  {
    id: 'map_mountain_pass_16',
    name: 'Mountain Pass',
    width: 16,
    height: 16,
    deploymentZones: rectanglePositions(0, 0, 3, 2),
    terrainAt: (x, y) => {
      if (Math.abs(y - (x / 2 + 2)) <= 1) return TerrainType.Plains;
      if (Math.abs(y - (x / 2 + 2)) <= 2) return TerrainType.Forest;
      return TerrainType.Mountain;
    },
    chestPositions: [{ x: 15, y: 15 }],
  },
  {
    id: 'map_frozen_lake_16',
    name: 'Frozen Lake',
    width: 16,
    height: 16,
    deploymentZones: rectanglePositions(0, 13, 3, 2),
    terrainAt: (x, y) => {
      if (x >= 4 && x <= 11 && y >= 4 && y <= 11) return TerrainType.Snow;
      if (x >= 6 && x <= 9 && y >= 6 && y <= 9) return TerrainType.Water;
      if ((x + y) % 9 === 0) return TerrainType.Forest;
      return TerrainType.Plains;
    },
    chestPositions: [{ x: 8, y: 8 }],
  },
  {
    id: 'map_black_marsh_16',
    name: 'Black Marsh',
    width: 16,
    height: 16,
    deploymentZones: rectanglePositions(0, 6, 2, 4),
    terrainAt: (x, y) => {
      if ((x + y) % 4 === 0) return TerrainType.Swamp;
      if ((x + y) % 11 === 0) return TerrainType.Water;
      if (x >= 11 && y <= 4) return TerrainType.Fortress;
      return TerrainType.Plains;
    },
    chestPositions: [{ x: 14, y: 2 }],
  },
  {
    id: 'map_sunken_temple_16',
    name: 'Sunken Temple',
    width: 16,
    height: 16,
    deploymentZones: rectanglePositions(0, 14, 3, 2),
    terrainAt: (x, y) => {
      if ((x === 7 || x === 8) && y >= 2 && y <= 13) return TerrainType.Bridge;
      if (x >= 5 && x <= 10 && y >= 3 && y <= 12 && !(x === 7 || x === 8)) return TerrainType.Water;
      if ((x === 5 || x === 10) && (y === 3 || y === 12)) return TerrainType.Fortress;
      if ((x + y) % 10 === 0) return TerrainType.Swamp;
      return TerrainType.Plains;
    },
    chestPositions: [{ x: 8, y: 7 }],
    doorPositions: [{ x: 7, y: 2 }],
  },
  {
    id: 'map_capital_gate_18',
    name: 'Capital Gate',
    width: 18,
    height: 16,
    deploymentZones: rectanglePositions(0, 6, 2, 4),
    terrainAt: (x, y) => {
      if (x >= 13 && y >= 4 && y <= 11) {
        if (x === 13 || x === 17 || y === 4 || y === 11) return TerrainType.Fortress;
        return TerrainType.Plains;
      }
      if (x === 10 && y >= 5 && y <= 10) return TerrainType.Bridge;
      if (x === 9 || x === 11) return TerrainType.Water;
      if ((x + y) % 12 === 0) return TerrainType.Forest;
      return TerrainType.Plains;
    },
    doorPositions: [{ x: 13, y: 7 }],
    chestPositions: [{ x: 16, y: 6 }],
  },
  {
    id: 'map_crimson_fields_18',
    name: 'Crimson Fields',
    width: 18,
    height: 16,
    deploymentZones: rectanglePositions(0, 2, 2, 4),
    terrainAt: (x, y) => {
      if ((x + y) % 5 === 0) return TerrainType.Forest;
      if (x >= 7 && x <= 10 && y >= 6 && y <= 9) return TerrainType.Fortress;
      if (y === 0 || y === 15) return TerrainType.Sand;
      return TerrainType.Plains;
    },
    chestPositions: [{ x: 17, y: 14 }],
  },
  {
    id: 'map_bastion_walls_22',
    name: 'Bastion Walls',
    width: 22,
    height: 22,
    deploymentZones: rectanglePositions(0, 9, 3, 4),
    terrainAt: (x, y) => {
      if (x >= 14 && x <= 21 && y >= 5 && y <= 16) {
        if (x === 14 || y === 5 || y === 16 || x === 21) return TerrainType.Fortress;
        return TerrainType.Plains;
      }
      if (x === 12 && y >= 6 && y <= 15) return TerrainType.Bridge;
      if (x === 11 || x === 13) return TerrainType.Water;
      if ((x + y) % 13 === 0) return TerrainType.Forest;
      return TerrainType.Plains;
    },
    doorPositions: [{ x: 14, y: 10 }],
    chestPositions: [
      { x: 20, y: 6 },
      { x: 20, y: 15 },
    ],
  },
  {
    id: 'map_sky_bridge_20',
    name: 'Sky Bridge',
    width: 20,
    height: 20,
    deploymentZones: rectanglePositions(0, 8, 2, 4),
    terrainAt: (x, y, width, height) => {
      if (y === Math.floor(height / 2) && x >= 2 && x <= width - 3) return TerrainType.Bridge;
      if (y === Math.floor(height / 2) - 1 || y === Math.floor(height / 2) + 1) return TerrainType.Void;
      if (x >= 15 && y >= 6 && y <= 13) return TerrainType.Fortress;
      if ((x + y) % 9 === 0) return TerrainType.Mountain;
      return TerrainType.Plains;
    },
    chestPositions: [{ x: 18, y: 10 }],
  },
  {
    id: 'map_obsidian_keep_20',
    name: 'Obsidian Keep',
    width: 20,
    height: 20,
    deploymentZones: rectanglePositions(0, 16, 3, 3),
    terrainAt: (x, y) => {
      if (x >= 12 && x <= 18 && y >= 4 && y <= 15) {
        if (x === 12 || x === 18 || y === 4 || y === 15) return TerrainType.Fortress;
        if ((x + y) % 3 === 0) return TerrainType.Lava;
        return TerrainType.Plains;
      }
      if ((x + y) % 8 === 0) return TerrainType.Sand;
      return TerrainType.Plains;
    },
    doorPositions: [{ x: 12, y: 10 }],
    chestPositions: [{ x: 17, y: 6 }],
  },
  {
    id: 'map_royal_road_24',
    name: 'Royal Road',
    width: 24,
    height: 24,
    deploymentZones: rectanglePositions(0, 10, 3, 4),
    terrainAt: (x, y) => {
      if (x >= 10 && x <= 13) return TerrainType.Bridge;
      if (x === 9 || x === 14) return TerrainType.Water;
      if ((x + y) % 6 === 0) return TerrainType.Forest;
      if ((x + y) % 11 === 0) return TerrainType.Fortress;
      return TerrainType.Plains;
    },
    chestPositions: [
      { x: 22, y: 3 },
      { x: 22, y: 20 },
    ],
  },
  {
    id: 'map_imperial_palace_24',
    name: 'Imperial Palace',
    width: 24,
    height: 24,
    deploymentZones: rectanglePositions(0, 20, 4, 3),
    terrainAt: (x, y) => {
      if (x >= 8 && x <= 23 && y >= 2 && y <= 21) {
        if (x === 8 || x === 23 || y === 2 || y === 21) return TerrainType.Fortress;
        if ((x + y) % 7 === 0) return TerrainType.Fortress;
        return TerrainType.Plains;
      }
      if ((x + y) % 5 === 0) return TerrainType.Forest;
      return TerrainType.Plains;
    },
    doorPositions: [
      { x: 8, y: 11 },
      { x: 8, y: 12 },
    ],
    chestPositions: [
      { x: 20, y: 4 },
      { x: 21, y: 19 },
    ],
  },
];

export const MAP_LAYOUTS: GridMap[] = MAP_SPECS.map((spec) => buildMap(spec));

export function getMapLayoutById(id: string): GridMap | null {
  const map = MAP_LAYOUTS.find((entry) => entry.id === id);
  if (!map) {
    return null;
  }

  return {
    ...map,
    tiles: map.tiles.map((row) =>
      row.map((tile) => ({
        ...tile,
        position: { ...tile.position },
        terrain: {
          ...tile.terrain,
          movementCost: { ...tile.terrain.movementCost },
          passable: { ...tile.terrain.passable },
        },
      })),
    ),
    deploymentZones: map.deploymentZones.map((zone) => ({ ...zone })),
  };
}

export function getAllMapLayouts(): GridMap[] {
  return MAP_LAYOUTS.map((map) => ({
    ...map,
    tiles: map.tiles.map((row) =>
      row.map((tile) => ({
        ...tile,
        position: { ...tile.position },
        terrain: {
          ...tile.terrain,
          movementCost: { ...tile.terrain.movementCost },
          passable: { ...tile.terrain.passable },
        },
      })),
    ),
    deploymentZones: map.deploymentZones.map((zone) => ({ ...zone })),
  }));
}
