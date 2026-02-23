import { describe, it, expect } from 'vitest';
import { MovementType, TerrainType } from '../../shared/types';
import { DEFAULT_TERRAIN_MAP, getTerrainData } from '../terrainData';

describe('terrainData', () => {
  it('defines all 11 terrain types', () => {
    expect(Object.keys(DEFAULT_TERRAIN_MAP).length).toBe(11);
    for (const terrainType of Object.values(TerrainType)) {
      expect(DEFAULT_TERRAIN_MAP[terrainType]).toBeDefined();
    }
  });

  it('plains has correct stats', () => {
    const plains = getTerrainData(TerrainType.Plains);
    expect(plains.movementCost[MovementType.Foot]).toBe(1);
    expect(plains.movementCost[MovementType.Mounted]).toBe(1);
    expect(plains.movementCost[MovementType.Armored]).toBe(1);
    expect(plains.movementCost[MovementType.Flying]).toBe(1);
    expect(plains.defenseBonus).toBe(0);
    expect(plains.evasionBonus).toBe(0);
    expect(plains.heightLevel).toBe(0);
  });

  it('forest has correct stats', () => {
    const terrain = getTerrainData(TerrainType.Forest);
    expect(terrain.movementCost[MovementType.Foot]).toBe(2);
    expect(terrain.movementCost[MovementType.Mounted]).toBe(3);
    expect(terrain.movementCost[MovementType.Armored]).toBe(2);
    expect(terrain.movementCost[MovementType.Flying]).toBe(1);
    expect(terrain.defenseBonus).toBe(1);
    expect(terrain.evasionBonus).toBe(20);
    expect(terrain.heightLevel).toBe(0);
  });

  it('mountain has correct stats', () => {
    const terrain = getTerrainData(TerrainType.Mountain);
    expect(terrain.movementCost[MovementType.Foot]).toBe(4);
    expect(terrain.movementCost[MovementType.Mounted]).toBe(99);
    expect(terrain.movementCost[MovementType.Armored]).toBe(99);
    expect(terrain.movementCost[MovementType.Flying]).toBe(1);
    expect(terrain.defenseBonus).toBe(2);
    expect(terrain.evasionBonus).toBe(30);
    expect(terrain.heightLevel).toBe(2);
  });

  it('water has correct stats', () => {
    const terrain = getTerrainData(TerrainType.Water);
    expect(terrain.movementCost[MovementType.Foot]).toBe(99);
    expect(terrain.movementCost[MovementType.Mounted]).toBe(99);
    expect(terrain.movementCost[MovementType.Armored]).toBe(99);
    expect(terrain.movementCost[MovementType.Flying]).toBe(1);
    expect(terrain.defenseBonus).toBe(0);
    expect(terrain.evasionBonus).toBe(0);
    expect(terrain.heightLevel).toBe(0);
  });

  it('lava has correct stats', () => {
    const terrain = getTerrainData(TerrainType.Lava);
    expect(terrain.movementCost[MovementType.Foot]).toBe(99);
    expect(terrain.movementCost[MovementType.Mounted]).toBe(99);
    expect(terrain.movementCost[MovementType.Armored]).toBe(99);
    expect(terrain.movementCost[MovementType.Flying]).toBe(1);
    expect(terrain.defenseBonus).toBe(0);
    expect(terrain.evasionBonus).toBe(0);
    expect(terrain.heightLevel).toBe(0);
  });

  it('fortress has correct stats', () => {
    const terrain = getTerrainData(TerrainType.Fortress);
    expect(terrain.movementCost[MovementType.Foot]).toBe(1);
    expect(terrain.movementCost[MovementType.Mounted]).toBe(1);
    expect(terrain.movementCost[MovementType.Armored]).toBe(1);
    expect(terrain.movementCost[MovementType.Flying]).toBe(1);
    expect(terrain.defenseBonus).toBe(3);
    expect(terrain.evasionBonus).toBe(20);
    expect(terrain.heightLevel).toBe(1);
  });

  it('bridge has correct stats', () => {
    const terrain = getTerrainData(TerrainType.Bridge);
    expect(terrain.movementCost[MovementType.Foot]).toBe(1);
    expect(terrain.movementCost[MovementType.Mounted]).toBe(1);
    expect(terrain.movementCost[MovementType.Armored]).toBe(1);
    expect(terrain.movementCost[MovementType.Flying]).toBe(1);
    expect(terrain.defenseBonus).toBe(0);
    expect(terrain.evasionBonus).toBe(0);
    expect(terrain.heightLevel).toBe(0);
  });

  it('swamp has correct stats', () => {
    const terrain = getTerrainData(TerrainType.Swamp);
    expect(terrain.movementCost[MovementType.Foot]).toBe(3);
    expect(terrain.movementCost[MovementType.Mounted]).toBe(4);
    expect(terrain.movementCost[MovementType.Armored]).toBe(3);
    expect(terrain.movementCost[MovementType.Flying]).toBe(1);
    expect(terrain.defenseBonus).toBe(0);
    expect(terrain.evasionBonus).toBe(10);
    expect(terrain.heightLevel).toBe(0);
  });

  it('sand has correct stats', () => {
    const terrain = getTerrainData(TerrainType.Sand);
    expect(terrain.movementCost[MovementType.Foot]).toBe(2);
    expect(terrain.movementCost[MovementType.Mounted]).toBe(3);
    expect(terrain.movementCost[MovementType.Armored]).toBe(2);
    expect(terrain.movementCost[MovementType.Flying]).toBe(1);
    expect(terrain.defenseBonus).toBe(0);
    expect(terrain.evasionBonus).toBe(5);
    expect(terrain.heightLevel).toBe(0);
  });

  it('snow has correct stats', () => {
    const terrain = getTerrainData(TerrainType.Snow);
    expect(terrain.movementCost[MovementType.Foot]).toBe(2);
    expect(terrain.movementCost[MovementType.Mounted]).toBe(3);
    expect(terrain.movementCost[MovementType.Armored]).toBe(2);
    expect(terrain.movementCost[MovementType.Flying]).toBe(1);
    expect(terrain.defenseBonus).toBe(0);
    expect(terrain.evasionBonus).toBe(10);
    expect(terrain.heightLevel).toBe(0);
  });

  it('void has correct stats', () => {
    const terrain = getTerrainData(TerrainType.Void);
    expect(terrain.movementCost[MovementType.Foot]).toBe(99);
    expect(terrain.movementCost[MovementType.Mounted]).toBe(99);
    expect(terrain.movementCost[MovementType.Armored]).toBe(99);
    expect(terrain.movementCost[MovementType.Flying]).toBe(99);
    expect(terrain.defenseBonus).toBe(0);
    expect(terrain.evasionBonus).toBe(0);
    expect(terrain.heightLevel).toBe(0);
  });

  it('sets passable true when movement cost is less than 99', () => {
    const forest = getTerrainData(TerrainType.Forest);
    expect(forest.passable[MovementType.Foot]).toBe(true);
    expect(forest.passable[MovementType.Mounted]).toBe(true);
    expect(forest.passable[MovementType.Armored]).toBe(true);
    expect(forest.passable[MovementType.Flying]).toBe(true);
  });

  it('sets passable false when movement cost is 99', () => {
    const mountain = getTerrainData(TerrainType.Mountain);
    expect(mountain.passable[MovementType.Mounted]).toBe(false);
    expect(mountain.passable[MovementType.Armored]).toBe(false);
  });

  it('void is impassable for all movement types', () => {
    const terrain = getTerrainData(TerrainType.Void);
    for (const movementType of Object.values(MovementType)) {
      expect(terrain.passable[movementType]).toBe(false);
    }
  });

  it('getTerrainData returns a cloned object', () => {
    const terrain = getTerrainData(TerrainType.Plains);
    terrain.movementCost[MovementType.Foot] = 999;

    const fresh = getTerrainData(TerrainType.Plains);
    expect(fresh.movementCost[MovementType.Foot]).toBe(1);
  });
});
