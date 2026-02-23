import { expect } from 'vitest';
import {
  AIBehavior,
  GridMap,
  GridType,
  MovementType,
  Position,
  Stats,
  TerrainType,
  Unit,
  UnitClassName,
} from '../../shared/types';
import { createGridEngine } from '../gridEngine';
import { getTerrainData } from '../terrainData';

const engine = createGridEngine();

const DEFAULT_STATS: Stats = {
  hp: 20,
  strength: 5,
  magic: 3,
  skill: 5,
  speed: 5,
  luck: 5,
  defense: 5,
  resistance: 5,
  movement: 5,
};

export function createTestMap(
  width: number,
  height: number,
  gridType: GridType = GridType.Square,
): GridMap {
  return engine.createGrid(width, height, gridType);
}

export function withTerrain(map: GridMap, pos: Position, terrainType: TerrainType): GridMap {
  const next = engine.loadMap(map);
  const row = next.tiles[pos.y];
  const tile = row[pos.x];
  row[pos.x] = {
    ...tile,
    terrain: getTerrainData(terrainType),
  };
  return next;
}

export function withOccupant(map: GridMap, pos: Position, occupantId: string | null): GridMap {
  return engine.setOccupant(map, pos, occupantId);
}

export function createUnit(overrides: Partial<Unit> & { id: string }): Unit {
  const position = overrides.position === undefined ? { x: 0, y: 0 } : overrides.position;

  return {
    id: overrides.id,
    name: overrides.name ?? overrides.id,
    characterId: overrides.characterId ?? `${overrides.id}_char`,
    className: overrides.className ?? UnitClassName.Warrior,
    level: overrides.level ?? 1,
    exp: overrides.exp ?? 0,
    currentStats: overrides.currentStats ?? { ...DEFAULT_STATS },
    maxHP: overrides.maxHP ?? 20,
    currentHP: overrides.currentHP ?? 20,
    currentSP: overrides.currentSP ?? 0,
    maxSP: overrides.maxSP ?? 100,
    growthRates: overrides.growthRates ?? {
      hp: 50,
      strength: 50,
      magic: 50,
      skill: 50,
      speed: 50,
      luck: 50,
      defense: 50,
      resistance: 50,
    },
    inventory: overrides.inventory ?? {
      items: [null, null, null, null, null],
      equippedWeaponIndex: null,
      equippedArmor: {
        head: null,
        chest: null,
        boots: null,
        accessory: null,
      },
    },
    skills: overrides.skills ?? [],
    activeStatusEffects: overrides.activeStatusEffects ?? [],
    position,
    hasMoved: overrides.hasMoved ?? false,
    hasActed: overrides.hasActed ?? false,
    isAlive: overrides.isAlive ?? true,
    team: overrides.team ?? 'player',
    aiBehavior: overrides.aiBehavior ?? AIBehavior.Aggressive,
    supportRanks: overrides.supportRanks ?? {},
    supportPoints: overrides.supportPoints ?? {},
    killCount: overrides.killCount ?? 0,
    movementType: overrides.movementType ?? MovementType.Foot,
  };
}

export function toKeySet(positions: Position[]): Set<string> {
  return new Set(positions.map((pos) => `${pos.x},${pos.y}`));
}

export function expectPositionSetEqual(actual: Position[], expected: Position[]): void {
  const actualSet = toKeySet(actual);
  const expectedSet = toKeySet(expected);
  expect(actualSet.size).toBe(expectedSet.size);
  for (const key of expectedSet) {
    expect(actualSet.has(key)).toBe(true);
  }
}
