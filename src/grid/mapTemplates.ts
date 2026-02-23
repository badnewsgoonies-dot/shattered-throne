import { GridMap, GridType, Position, TerrainType, Tile } from '../shared/types';
import { getTerrainData } from './terrainData';

interface MapSpec {
  id: string;
  name: string;
  width: number;
  height: number;
  deploymentZones: Position[];
  terrainAt: (x: number, y: number) => TerrainType;
}

function posKey(pos: Position): string {
  return `${pos.x},${pos.y}`;
}

function cloneMap(map: GridMap): GridMap {
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

function buildMap(spec: MapSpec): GridMap {
  const deploymentSet = new Set(spec.deploymentZones.map((zone) => posKey(zone)));
  const tiles: Tile[][] = [];

  for (let y = 0; y < spec.height; y += 1) {
    const row: Tile[] = [];
    for (let x = 0; x < spec.width; x += 1) {
      const position = { x, y };
      row.push({
        position,
        terrain: getTerrainData(spec.terrainAt(x, y)),
        occupantId: null,
        itemId: null,
        isChest: false,
        isDoor: false,
        isDeploymentZone: deploymentSet.has(posKey(position)),
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

const map_arena_8x8 = buildMap({
  id: 'map_arena_8x8',
  name: 'Arena (8x8)',
  width: 8,
  height: 8,
  deploymentZones: [
    { x: 0, y: 3 },
    { x: 0, y: 4 },
    { x: 1, y: 3 },
    { x: 7, y: 3 },
    { x: 7, y: 4 },
    { x: 6, y: 4 },
  ],
  terrainAt: (x, y) => {
    if (x >= 3 && x <= 4 && y >= 3 && y <= 4) {
      return TerrainType.Fortress;
    }
    return TerrainType.Plains;
  },
});

const map_forest_clearing_8x8 = buildMap({
  id: 'map_forest_clearing_8x8',
  name: 'Forest Clearing (8x8)',
  width: 8,
  height: 8,
  deploymentZones: [
    { x: 2, y: 0 },
    { x: 3, y: 0 },
    { x: 4, y: 7 },
    { x: 5, y: 7 },
    { x: 3, y: 7 },
    { x: 4, y: 0 },
  ],
  terrainAt: (x, y) => {
    if (x <= 1 || x >= 6 || y <= 1 || y >= 6) {
      return TerrainType.Forest;
    }
    if (x === 3 && y === 3) {
      return TerrainType.Fortress;
    }
    return TerrainType.Plains;
  },
});

const map_bridge_crossing_8x8 = buildMap({
  id: 'map_bridge_crossing_8x8',
  name: 'Bridge Crossing (8x8)',
  width: 8,
  height: 8,
  deploymentZones: [
    { x: 1, y: 1 },
    { x: 1, y: 2 },
    { x: 1, y: 5 },
    { x: 6, y: 1 },
    { x: 6, y: 2 },
    { x: 6, y: 5 },
  ],
  terrainAt: (x, y) => {
    if (y === 3 || y === 4) {
      if (x === 3 || x === 4) {
        return TerrainType.Bridge;
      }
      return TerrainType.Water;
    }
    if ((x === 0 || x === 7) && (y === 0 || y === 7)) {
      return TerrainType.Fortress;
    }
    return TerrainType.Plains;
  },
});

const map_village_square_8x8 = buildMap({
  id: 'map_village_square_8x8',
  name: 'Village Square (8x8)',
  width: 8,
  height: 8,
  deploymentZones: [
    { x: 0, y: 2 },
    { x: 0, y: 3 },
    { x: 0, y: 4 },
    { x: 7, y: 3 },
    { x: 7, y: 4 },
    { x: 7, y: 5 },
  ],
  terrainAt: (x, y) => {
    if (
      (x === 2 && y >= 2 && y <= 3) ||
      (x === 5 && y >= 4 && y <= 5) ||
      (y === 2 && x >= 4 && x <= 5) ||
      (y === 5 && x >= 2 && x <= 3)
    ) {
      return TerrainType.Fortress;
    }
    if (x === 3 || x === 4 || y === 3 || y === 4) {
      return TerrainType.Plains;
    }
    return TerrainType.Forest;
  },
});

const map_mountain_pass_8x8 = buildMap({
  id: 'map_mountain_pass_8x8',
  name: 'Mountain Pass (8x8)',
  width: 8,
  height: 8,
  deploymentZones: [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 0 },
    { x: 7, y: 6 },
    { x: 7, y: 7 },
    { x: 6, y: 7 },
  ],
  terrainAt: (x, y) => {
    const passTiles = new Set([
      '0,0',
      '1,0',
      '1,1',
      '2,1',
      '2,2',
      '3,2',
      '3,3',
      '4,3',
      '4,4',
      '5,4',
      '5,5',
      '6,5',
      '6,6',
      '7,6',
      '7,7',
    ]);

    if (passTiles.has(`${x},${y}`)) {
      if ((x === 3 && y === 3) || (x === 4 && y === 4)) {
        return TerrainType.Fortress;
      }
      return TerrainType.Plains;
    }

    return TerrainType.Mountain;
  },
});

const map_castle_courtyard_12x12 = buildMap({
  id: 'map_castle_courtyard_12x12',
  name: 'Castle Courtyard (12x12)',
  width: 12,
  height: 12,
  deploymentZones: [
    { x: 1, y: 5 },
    { x: 1, y: 6 },
    { x: 2, y: 5 },
    { x: 10, y: 5 },
    { x: 10, y: 6 },
    { x: 9, y: 6 },
  ],
  terrainAt: (x, y) => {
    if (x === 0 || y === 0 || x === 11 || y === 11) {
      return TerrainType.Fortress;
    }
    if ((x === 5 || x === 6) && (y === 5 || y === 6)) {
      return TerrainType.Bridge;
    }
    if ((x === 2 || x === 9) && (y === 2 || y === 9)) {
      return TerrainType.Forest;
    }
    return TerrainType.Plains;
  },
});

const map_riverside_12x12 = buildMap({
  id: 'map_riverside_12x12',
  name: 'Riverside (12x12)',
  width: 12,
  height: 12,
  deploymentZones: [
    { x: 10, y: 2 },
    { x: 10, y: 3 },
    { x: 10, y: 4 },
    { x: 8, y: 8 },
    { x: 9, y: 8 },
    { x: 10, y: 8 },
  ],
  terrainAt: (x, y) => {
    if (x <= 2) {
      if (x === 2 && (y === 5 || y === 6)) {
        return TerrainType.Bridge;
      }
      return TerrainType.Water;
    }

    if (x === 3 && y >= 2 && y <= 9) {
      return TerrainType.Swamp;
    }

    if ((x >= 6 && x <= 8 && y >= 1 && y <= 3) || (x >= 7 && x <= 9 && y >= 8 && y <= 10)) {
      return TerrainType.Forest;
    }

    if ((x === 5 && y === 5) || (x === 8 && y === 6)) {
      return TerrainType.Fortress;
    }

    return TerrainType.Plains;
  },
});

const map_desert_oasis_12x12 = buildMap({
  id: 'map_desert_oasis_12x12',
  name: 'Desert Oasis (12x12)',
  width: 12,
  height: 12,
  deploymentZones: [
    { x: 1, y: 1 },
    { x: 1, y: 2 },
    { x: 2, y: 1 },
    { x: 10, y: 9 },
    { x: 9, y: 10 },
    { x: 10, y: 10 },
  ],
  terrainAt: (x, y) => {
    const dx = x - 5.5;
    const dy = y - 5.5;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= 1.8) {
      return TerrainType.Water;
    }
    if (dist <= 3) {
      return TerrainType.Plains;
    }
    if ((x === 3 && y === 3) || (x === 8 && y === 8) || (x === 3 && y === 8) || (x === 8 && y === 3)) {
      return TerrainType.Fortress;
    }
    return TerrainType.Sand;
  },
});

const map_snowy_field_12x12 = buildMap({
  id: 'map_snowy_field_12x12',
  name: 'Snowy Field (12x12)',
  width: 12,
  height: 12,
  deploymentZones: [
    { x: 0, y: 4 },
    { x: 0, y: 5 },
    { x: 0, y: 6 },
    { x: 11, y: 5 },
    { x: 11, y: 6 },
    { x: 11, y: 7 },
  ],
  terrainAt: (x, y) => {
    if ((x + y) % 5 === 0 || (x >= 8 && x <= 10 && y >= 2 && y <= 4)) {
      return TerrainType.Forest;
    }
    if ((x === 5 && y === 5) || (x === 6 && y === 6)) {
      return TerrainType.Fortress;
    }
    return TerrainType.Snow;
  },
});

const map_swamp_ruins_12x12 = buildMap({
  id: 'map_swamp_ruins_12x12',
  name: 'Swamp Ruins (12x12)',
  width: 12,
  height: 12,
  deploymentZones: [
    { x: 1, y: 9 },
    { x: 2, y: 9 },
    { x: 2, y: 10 },
    { x: 10, y: 1 },
    { x: 9, y: 1 },
    { x: 9, y: 2 },
  ],
  terrainAt: (x, y) => {
    if ((x === 5 || x === 6) && y >= 3 && y <= 8) {
      return TerrainType.Bridge;
    }
    if ((x >= 3 && x <= 4 && y >= 4 && y <= 5) || (x >= 7 && x <= 8 && y >= 6 && y <= 7)) {
      return TerrainType.Fortress;
    }
    if ((x === 2 && y === 2) || (x === 9 && y === 9)) {
      return TerrainType.Water;
    }
    return TerrainType.Swamp;
  },
});

const map_open_battlefield_16x16 = buildMap({
  id: 'map_open_battlefield_16x16',
  name: 'Open Battlefield (16x16)',
  width: 16,
  height: 16,
  deploymentZones: [
    { x: 1, y: 6 },
    { x: 1, y: 7 },
    { x: 1, y: 8 },
    { x: 14, y: 7 },
    { x: 14, y: 8 },
    { x: 14, y: 9 },
    { x: 2, y: 7 },
    { x: 13, y: 8 },
  ],
  terrainAt: (x, y) => {
    if ((x >= 3 && x <= 5 && y >= 2 && y <= 4) || (x >= 10 && x <= 12 && y >= 11 && y <= 13)) {
      return TerrainType.Forest;
    }

    if ((x === 7 || x === 8) && y >= 4 && y <= 11 && y !== 7 && y !== 8) {
      return TerrainType.Mountain;
    }

    if ((x === 6 && y === 7) || (x === 9 && y === 8)) {
      return TerrainType.Fortress;
    }

    if ((x === 0 || x === 15) && (y === 0 || y === 15)) {
      return TerrainType.Sand;
    }

    return TerrainType.Plains;
  },
});

const map_fortress_siege_16x16 = buildMap({
  id: 'map_fortress_siege_16x16',
  name: 'Fortress Siege (16x16)',
  width: 16,
  height: 16,
  deploymentZones: [
    { x: 1, y: 7 },
    { x: 1, y: 8 },
    { x: 2, y: 7 },
    { x: 14, y: 7 },
    { x: 14, y: 8 },
    { x: 13, y: 8 },
    { x: 1, y: 9 },
    { x: 14, y: 6 },
  ],
  terrainAt: (x, y) => {
    const inFortress = x >= 4 && x <= 11 && y >= 4 && y <= 11;
    const inMoat = x >= 3 && x <= 12 && y >= 3 && y <= 12 && !inFortress;

    if (inMoat) {
      if ((y === 3 || y === 12) && (x === 7 || x === 8)) {
        return TerrainType.Bridge;
      }
      return TerrainType.Water;
    }

    if (inFortress) {
      if (x === 4 || x === 11 || y === 4 || y === 11) {
        return TerrainType.Fortress;
      }
      return TerrainType.Plains;
    }

    if ((x === 0 || x === 15) && y >= 5 && y <= 10) {
      return TerrainType.Forest;
    }

    return TerrainType.Plains;
  },
});

const map_volcanic_crater_16x16 = buildMap({
  id: 'map_volcanic_crater_16x16',
  name: 'Volcanic Crater (16x16)',
  width: 16,
  height: 16,
  deploymentZones: [
    { x: 2, y: 2 },
    { x: 2, y: 3 },
    { x: 3, y: 2 },
    { x: 13, y: 13 },
    { x: 12, y: 13 },
    { x: 13, y: 12 },
    { x: 2, y: 13 },
    { x: 13, y: 2 },
  ],
  terrainAt: (x, y) => {
    if (x === 0 || y === 0 || x === 15 || y === 15) {
      return TerrainType.Mountain;
    }

    const dx = x - 7.5;
    const dy = y - 7.5;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist >= 4 && dist <= 5.5) {
      return TerrainType.Lava;
    }

    if (dist < 2) {
      return TerrainType.Fortress;
    }

    if (dist > 6.5) {
      return TerrainType.Mountain;
    }

    return TerrainType.Sand;
  },
});

const map_coastal_cliff_16x16 = buildMap({
  id: 'map_coastal_cliff_16x16',
  name: 'Coastal Cliff (16x16)',
  width: 16,
  height: 16,
  deploymentZones: [
    { x: 13, y: 2 },
    { x: 13, y: 3 },
    { x: 14, y: 2 },
    { x: 13, y: 12 },
    { x: 13, y: 13 },
    { x: 14, y: 13 },
    { x: 12, y: 7 },
    { x: 12, y: 8 },
  ],
  terrainAt: (x, y) => {
    if (x <= 3) {
      return TerrainType.Water;
    }
    if (x === 4 || x === 5) {
      return TerrainType.Sand;
    }
    if ((x >= 10 && y <= 5) || (x >= 11 && y >= 10)) {
      return TerrainType.Mountain;
    }
    if ((x === 8 && y === 7) || (x === 9 && y === 8)) {
      return TerrainType.Fortress;
    }
    if ((x === 6 || x === 7) && (y === 4 || y === 11)) {
      return TerrainType.Forest;
    }
    return TerrainType.Plains;
  },
});

const map_ancient_temple_16x16 = buildMap({
  id: 'map_ancient_temple_16x16',
  name: 'Ancient Temple (16x16)',
  width: 16,
  height: 16,
  deploymentZones: [
    { x: 1, y: 1 },
    { x: 1, y: 2 },
    { x: 2, y: 1 },
    { x: 14, y: 14 },
    { x: 13, y: 14 },
    { x: 14, y: 13 },
    { x: 1, y: 14 },
    { x: 14, y: 1 },
  ],
  terrainAt: (x, y) => {
    const centerCross = (x === 7 || x === 8) && y >= 5 && y <= 10;
    const centerBar = (y === 7 || y === 8) && x >= 5 && x <= 10;

    if (centerCross || centerBar) {
      return TerrainType.Void;
    }

    if ((x >= 4 && x <= 11 && (y === 4 || y === 11)) || (y >= 4 && y <= 11 && (x === 4 || x === 11))) {
      return TerrainType.Fortress;
    }

    if ((x === 2 || x === 13) && (y >= 2 && y <= 13)) {
      return TerrainType.Forest;
    }

    return TerrainType.Plains;
  },
});

const map_grand_castle_20x20 = buildMap({
  id: 'map_grand_castle_20x20',
  name: 'Grand Castle (20x20)',
  width: 20,
  height: 20,
  deploymentZones: [
    { x: 1, y: 8 },
    { x: 1, y: 9 },
    { x: 1, y: 10 },
    { x: 18, y: 8 },
    { x: 18, y: 9 },
    { x: 18, y: 10 },
    { x: 2, y: 9 },
    { x: 17, y: 9 },
  ],
  terrainAt: (x, y) => {
    const inKeep = x >= 4 && x <= 15 && y >= 4 && y <= 15;
    const inMoat = x >= 3 && x <= 16 && y >= 3 && y <= 16 && !inKeep;

    if (inMoat) {
      if ((x === 9 || x === 10) && (y === 3 || y === 16)) {
        return TerrainType.Bridge;
      }
      return TerrainType.Water;
    }

    if (inKeep) {
      if (x === 4 || x === 15 || y === 4 || y === 15) {
        return TerrainType.Fortress;
      }

      if ((x === 9 || x === 10) && (y === 9 || y === 10)) {
        return TerrainType.Fortress;
      }

      return TerrainType.Plains;
    }

    if ((x <= 1 || x >= 18) && (y <= 1 || y >= 18)) {
      return TerrainType.Mountain;
    }

    return TerrainType.Plains;
  },
});

const map_dragons_lair_20x20 = buildMap({
  id: 'map_dragons_lair_20x20',
  name: "Dragon's Lair (20x20)",
  width: 20,
  height: 20,
  deploymentZones: [
    { x: 2, y: 2 },
    { x: 2, y: 3 },
    { x: 3, y: 2 },
    { x: 17, y: 16 },
    { x: 16, y: 17 },
    { x: 17, y: 17 },
    { x: 2, y: 17 },
    { x: 17, y: 2 },
  ],
  terrainAt: (x, y) => {
    if (x === 0 || y === 0 || x === 19 || y === 19) {
      return TerrainType.Mountain;
    }

    const dx = x - 10;
    const dy = y - 10;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 3.3) {
      return TerrainType.Lava;
    }

    if ((x >= 6 && x <= 13 && y >= 6 && y <= 13) || (x + y) % 7 === 0) {
      return TerrainType.Mountain;
    }

    if ((x === 4 && y >= 8 && y <= 11) || (x === 15 && y >= 8 && y <= 11)) {
      return TerrainType.Fortress;
    }

    if ((x >= 8 && x <= 11 && (y === 5 || y === 14)) || (y >= 8 && y <= 11 && (x === 5 || x === 14))) {
      return TerrainType.Swamp;
    }

    return TerrainType.Plains;
  },
});

const map_final_battlefield_24x24 = buildMap({
  id: 'map_final_battlefield_24x24',
  name: 'Final Battlefield (24x24)',
  width: 24,
  height: 24,
  deploymentZones: [
    { x: 1, y: 10 },
    { x: 1, y: 11 },
    { x: 1, y: 12 },
    { x: 22, y: 10 },
    { x: 22, y: 11 },
    { x: 22, y: 12 },
    { x: 2, y: 11 },
    { x: 21, y: 11 },
  ],
  terrainAt: (x, y) => {
    if (x === 0 || y === 0 || x === 23 || y === 23) {
      return TerrainType.Void;
    }

    if (x <= 5 && y <= 5) {
      return TerrainType.Forest;
    }
    if (x >= 18 && y <= 5) {
      return TerrainType.Sand;
    }
    if (x <= 5 && y >= 18) {
      return TerrainType.Snow;
    }
    if (x >= 18 && y >= 18) {
      return TerrainType.Swamp;
    }

    if ((x >= 10 && x <= 13 && y >= 10 && y <= 13) || ((x === 11 || x === 12) && y >= 7 && y <= 16)) {
      return TerrainType.Fortress;
    }

    if ((x === 8 || x === 15) && y >= 6 && y <= 17) {
      return TerrainType.Mountain;
    }

    if ((y === 8 || y === 15) && x >= 6 && x <= 17) {
      return TerrainType.Water;
    }

    if ((x === 11 || x === 12) && (y === 8 || y === 15)) {
      return TerrainType.Bridge;
    }

    if ((x >= 9 && x <= 14 && (y === 6 || y === 17)) || (y >= 9 && y <= 14 && (x === 6 || x === 17))) {
      return TerrainType.Lava;
    }

    return TerrainType.Plains;
  },
});

const map_mountain_fortress_20x20 = buildMap({
  id: 'map_mountain_fortress_20x20',
  name: 'Mountain Fortress (20x20)',
  width: 20,
  height: 20,
  deploymentZones: [
    { x: 1, y: 1 },
    { x: 1, y: 2 },
    { x: 2, y: 1 },
    { x: 18, y: 17 },
    { x: 17, y: 18 },
    { x: 18, y: 18 },
    { x: 1, y: 18 },
    { x: 18, y: 1 },
  ],
  terrainAt: (x, y) => {
    const keep = x >= 7 && x <= 12 && y >= 7 && y <= 12;
    if (keep) {
      if (x === 7 || x === 12 || y === 7 || y === 12) {
        return TerrainType.Fortress;
      }
      return TerrainType.Plains;
    }

    if ((x === 9 || x === 10) && y >= 0 && y <= 19) {
      if (y === 7 || y === 12) {
        return TerrainType.Bridge;
      }
      return TerrainType.Plains;
    }

    if (x <= 3 || y <= 3 || x >= 16 || y >= 16 || (x + y) % 6 === 0) {
      return TerrainType.Mountain;
    }

    if ((x >= 4 && x <= 6 && y >= 13 && y <= 15) || (x >= 13 && x <= 15 && y >= 4 && y <= 6)) {
      return TerrainType.Forest;
    }

    return TerrainType.Plains;
  },
});

const map_dark_forest_20x20 = buildMap({
  id: 'map_dark_forest_20x20',
  name: 'Dark Forest (20x20)',
  width: 20,
  height: 20,
  deploymentZones: [
    { x: 0, y: 8 },
    { x: 0, y: 9 },
    { x: 0, y: 10 },
    { x: 19, y: 8 },
    { x: 19, y: 9 },
    { x: 19, y: 10 },
    { x: 1, y: 9 },
    { x: 18, y: 9 },
  ],
  terrainAt: (x, y) => {
    if ((x >= 7 && x <= 12 && y >= 7 && y <= 12) || (x >= 3 && x <= 5 && y >= 14 && y <= 16)) {
      return TerrainType.Plains;
    }

    if ((x + y) % 9 === 0 || (x >= 13 && x <= 16 && y >= 3 && y <= 6)) {
      return TerrainType.Swamp;
    }

    if ((x === 9 || x === 10) && (y === 4 || y === 15)) {
      return TerrainType.Fortress;
    }

    if ((x === 6 || x === 13) && y >= 6 && y <= 13) {
      return TerrainType.Mountain;
    }

    return TerrainType.Forest;
  },
});

export const MAP_TEMPLATES: Record<string, GridMap> = {
  map_arena_8x8,
  map_forest_clearing_8x8,
  map_bridge_crossing_8x8,
  map_village_square_8x8,
  map_mountain_pass_8x8,
  map_castle_courtyard_12x12,
  map_riverside_12x12,
  map_desert_oasis_12x12,
  map_snowy_field_12x12,
  map_swamp_ruins_12x12,
  map_open_battlefield_16x16,
  map_fortress_siege_16x16,
  map_volcanic_crater_16x16,
  map_coastal_cliff_16x16,
  map_ancient_temple_16x16,
  map_grand_castle_20x20,
  map_dragons_lair_20x20,
  map_final_battlefield_24x24,
  map_mountain_fortress_20x20,
  map_dark_forest_20x20,
};

export function getMapTemplate(id: string): GridMap | null {
  const map = MAP_TEMPLATES[id];
  if (!map) {
    return null;
  }
  return cloneMap(map);
}
