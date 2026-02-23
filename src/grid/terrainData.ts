import { TerrainType, TerrainData, MovementType } from '../shared/types';

const IMPASSABLE_COST = 99;

function createPassable(movementCost: Record<MovementType, number>): Record<MovementType, boolean> {
  return {
    [MovementType.Foot]: movementCost[MovementType.Foot] < IMPASSABLE_COST,
    [MovementType.Mounted]: movementCost[MovementType.Mounted] < IMPASSABLE_COST,
    [MovementType.Armored]: movementCost[MovementType.Armored] < IMPASSABLE_COST,
    [MovementType.Flying]: movementCost[MovementType.Flying] < IMPASSABLE_COST,
  };
}

function buildTerrain(
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
    passable: createPassable(movementCost),
  };
}

export const DEFAULT_TERRAIN_MAP: Record<TerrainType, TerrainData> = {
  [TerrainType.Plains]: buildTerrain(
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
  [TerrainType.Forest]: buildTerrain(
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
  [TerrainType.Mountain]: buildTerrain(
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
  [TerrainType.Water]: buildTerrain(
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
  [TerrainType.Lava]: buildTerrain(
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
  [TerrainType.Fortress]: buildTerrain(
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
  [TerrainType.Bridge]: buildTerrain(
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
  [TerrainType.Swamp]: buildTerrain(
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
  [TerrainType.Sand]: buildTerrain(
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
  [TerrainType.Snow]: buildTerrain(
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
  [TerrainType.Void]: buildTerrain(
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

export function getTerrainData(type: TerrainType): TerrainData {
  const terrain = DEFAULT_TERRAIN_MAP[type];
  return {
    ...terrain,
    movementCost: { ...terrain.movementCost },
    passable: { ...terrain.passable },
  };
}
