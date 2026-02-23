import { describe, expect, it } from 'vitest';
import {
  GridType,
  MovementType,
  TerrainType,
  Unit,
  ZONE_OF_CONTROL_EXTRA_COST,
} from '../../shared/types';
import { createGridEngine } from '../gridEngine';
import { createTestMap, createUnit, withOccupant, withTerrain } from './testUtils';

describe('pathfinding', () => {
  const engine = createGridEngine();

  function placeTerrainLine(
    map: ReturnType<typeof createTestMap>,
    terrainType: TerrainType,
    points: Array<{ x: number; y: number }>,
  ) {
    let next = map;
    for (const point of points) {
      next = withTerrain(next, point, terrainType);
    }
    return next;
  }

  function withMoverAt(
    map: ReturnType<typeof createTestMap>,
    unitId: string,
    x: number,
    y: number,
    team: Unit['team'] = 'player',
  ) {
    const mover = createUnit({
      id: unitId,
      team,
      position: { x, y },
      movementType: MovementType.Foot,
      currentStats: {
        hp: 20,
        strength: 5,
        magic: 3,
        skill: 5,
        speed: 5,
        luck: 5,
        defense: 5,
        resistance: 5,
        movement: 10,
      },
    });

    return {
      map: withOccupant(map, { x, y }, unitId),
      mover,
    };
  }

  it('finds a straight path on open square terrain', () => {
    const map = createTestMap(5, 5, GridType.Square);
    const path = engine.findPath(map, { x: 0, y: 0 }, { x: 3, y: 0 }, 10, MovementType.Foot, []);

    expect(path).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ]);
  });

  it('returns a path that starts at start and ends at end', () => {
    const map = createTestMap(6, 6, GridType.Square);
    const path = engine.findPath(map, { x: 1, y: 1 }, { x: 4, y: 4 }, 20, MovementType.Foot, []);

    expect(path?.[0]).toEqual({ x: 1, y: 1 });
    expect(path?.[path.length - 1]).toEqual({ x: 4, y: 4 });
  });

  it('returns the shortest path length on open field', () => {
    const map = createTestMap(6, 6, GridType.Square);
    const path = engine.findPath(map, { x: 0, y: 0 }, { x: 4, y: 2 }, 20, MovementType.Foot, []);

    expect(path).not.toBeNull();
    expect(path?.length).toBe(7);
  });

  it('returns null for out-of-bounds start', () => {
    const map = createTestMap(4, 4, GridType.Square);
    const path = engine.findPath(map, { x: -1, y: 0 }, { x: 2, y: 2 }, 10, MovementType.Foot, []);
    expect(path).toBeNull();
  });

  it('returns null for out-of-bounds end', () => {
    const map = createTestMap(4, 4, GridType.Square);
    const path = engine.findPath(map, { x: 1, y: 1 }, { x: 9, y: 9 }, 10, MovementType.Foot, []);
    expect(path).toBeNull();
  });

  it('returns single-tile path when start equals end', () => {
    const map = createTestMap(4, 4, GridType.Square);
    const path = engine.findPath(map, { x: 2, y: 2 }, { x: 2, y: 2 }, 0, MovementType.Foot, []);
    expect(path).toEqual([{ x: 2, y: 2 }]);
  });

  it('routes around impassable water for foot units', () => {
    let map = createTestMap(4, 4, GridType.Square);
    map = placeTerrainLine(map, TerrainType.Water, [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ]);

    const path = engine.findPath(map, { x: 0, y: 1 }, { x: 2, y: 1 }, 20, MovementType.Foot, []);

    expect(path).not.toBeNull();
    const keys = new Set(path?.map((p) => `${p.x},${p.y}`));
    expect(keys.has('1,1')).toBe(false);
  });

  it('returns null when impassable terrain blocks all routes', () => {
    let map = createTestMap(5, 5, GridType.Square);
    map = placeTerrainLine(map, TerrainType.Water, [
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 2, y: 4 },
    ]);

    const path = engine.findPath(map, { x: 0, y: 2 }, { x: 4, y: 2 }, 20, MovementType.Foot, []);
    expect(path).toBeNull();
  });

  it('allows flying units to cross water directly', () => {
    let map = createTestMap(4, 1, GridType.Square);
    map = withTerrain(map, { x: 1, y: 0 }, TerrainType.Water);
    map = withTerrain(map, { x: 2, y: 0 }, TerrainType.Water);

    const path = engine.findPath(map, { x: 0, y: 0 }, { x: 3, y: 0 }, 4, MovementType.Flying, []);

    expect(path).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ]);
  });

  it('returns null when mounted unit must cross mountain', () => {
    let map = createTestMap(3, 1, GridType.Square);
    map = withTerrain(map, { x: 1, y: 0 }, TerrainType.Mountain);

    const path = engine.findPath(map, { x: 0, y: 0 }, { x: 2, y: 0 }, 10, MovementType.Mounted, []);
    expect(path).toBeNull();
  });

  it('treats enemy-occupied tiles as impassable', () => {
    const base = createTestMap(3, 1, GridType.Square);
    const { map, mover } = withMoverAt(base, 'p1', 0, 0, 'player');
    const enemy = createUnit({ id: 'e1', team: 'enemy', position: { x: 1, y: 0 } });
    const occupied = withOccupant(map, { x: 1, y: 0 }, 'e1');

    const path = engine.findPath(occupied, { x: 0, y: 0 }, { x: 2, y: 0 }, 10, MovementType.Foot, [mover, enemy]);
    expect(path).toBeNull();
  });

  it('allows pathing through friendly-occupied tiles', () => {
    const base = createTestMap(4, 1, GridType.Square);
    const { map, mover } = withMoverAt(base, 'p1', 0, 0, 'player');
    const friendly = createUnit({ id: 'p2', team: 'player', position: { x: 1, y: 0 } });
    const occupied = withOccupant(map, { x: 1, y: 0 }, 'p2');

    const path = engine.findPath(occupied, { x: 0, y: 0 }, { x: 3, y: 0 }, 10, MovementType.Foot, [mover, friendly]);

    expect(path).not.toBeNull();
    const keys = new Set(path?.map((p) => `${p.x},${p.y}`));
    expect(keys.has('1,0')).toBe(true);
  });

  it('cannot end movement on friendly-occupied tile', () => {
    const base = createTestMap(3, 1, GridType.Square);
    const { map, mover } = withMoverAt(base, 'p1', 0, 0, 'player');
    const friendly = createUnit({ id: 'p2', team: 'player', position: { x: 1, y: 0 } });
    const occupied = withOccupant(map, { x: 1, y: 0 }, 'p2');

    const path = engine.findPath(occupied, { x: 0, y: 0 }, { x: 1, y: 0 }, 10, MovementType.Foot, [mover, friendly]);
    expect(path).toBeNull();
  });

  it('cannot end movement on enemy-occupied tile', () => {
    const base = createTestMap(3, 1, GridType.Square);
    const { map, mover } = withMoverAt(base, 'p1', 0, 0, 'player');
    const enemy = createUnit({ id: 'e1', team: 'enemy', position: { x: 1, y: 0 } });
    const occupied = withOccupant(map, { x: 1, y: 0 }, 'e1');

    const path = engine.findPath(occupied, { x: 0, y: 0 }, { x: 1, y: 0 }, 10, MovementType.Foot, [mover, enemy]);
    expect(path).toBeNull();
  });

  it('respects movement budget using terrain costs', () => {
    let map = createTestMap(3, 1, GridType.Square);
    map = withTerrain(map, { x: 1, y: 0 }, TerrainType.Forest);
    map = withTerrain(map, { x: 2, y: 0 }, TerrainType.Forest);

    const path = engine.findPath(map, { x: 0, y: 0 }, { x: 2, y: 0 }, 3, MovementType.Foot, []);
    expect(path).toBeNull();
  });

  it('returns valid path when movement budget is exactly enough', () => {
    let map = createTestMap(3, 1, GridType.Square);
    map = withTerrain(map, { x: 1, y: 0 }, TerrainType.Forest);
    map = withTerrain(map, { x: 2, y: 0 }, TerrainType.Forest);

    const path = engine.findPath(map, { x: 0, y: 0 }, { x: 2, y: 0 }, 4, MovementType.Foot, []);
    expect(path).not.toBeNull();
  });

  it('applies zone of control extra movement cost', () => {
    const base = createTestMap(4, 3, GridType.Square);
    const { map, mover } = withMoverAt(base, 'p1', 0, 0, 'player');
    const enemy = createUnit({ id: 'e1', team: 'enemy', position: { x: 1, y: 1 } });
    const occupied = withOccupant(map, { x: 1, y: 1 }, 'e1');

    const path = engine.findPath(occupied, { x: 0, y: 0 }, { x: 3, y: 0 }, 3, MovementType.Foot, [mover, enemy]);
    expect(path).toBeNull();
    expect(ZONE_OF_CONTROL_EXTRA_COST).toBe(3);
  });

  it('can choose a longer route to avoid zone of control penalties', () => {
    const base = createTestMap(5, 3, GridType.Square);
    const { map, mover } = withMoverAt(base, 'p1', 0, 1, 'player');
    const enemy = createUnit({ id: 'e1', team: 'enemy', position: { x: 2, y: 0 } });
    const occupied = withOccupant(map, { x: 2, y: 0 }, 'e1');

    const path = engine.findPath(occupied, { x: 0, y: 1 }, { x: 4, y: 1 }, 8, MovementType.Foot, [mover, enemy]);

    expect(path).not.toBeNull();
    const keys = new Set(path?.map((p) => `${p.x},${p.y}`));
    expect(keys.has('2,1')).toBe(false);
  });

  it('returns null when movement is negative', () => {
    const map = createTestMap(5, 5, GridType.Square);
    const path = engine.findPath(map, { x: 0, y: 0 }, { x: 1, y: 0 }, -1, MovementType.Foot, []);
    expect(path).toBeNull();
  });

  it('finds paths on hex grids', () => {
    const map = createTestMap(5, 5, GridType.Hex);
    const path = engine.findPath(map, { x: 1, y: 1 }, { x: 3, y: 2 }, 10, MovementType.Foot, []);

    expect(path).not.toBeNull();
    expect(path?.[0]).toEqual({ x: 1, y: 1 });
    expect(path?.[path.length - 1]).toEqual({ x: 3, y: 2 });
  });

  it('respects impassable terrain on hex grids', () => {
    let map = createTestMap(4, 4, GridType.Hex);
    map = withTerrain(map, { x: 1, y: 0 }, TerrainType.Water);
    map = withTerrain(map, { x: 1, y: 1 }, TerrainType.Water);
    map = withTerrain(map, { x: 1, y: 2 }, TerrainType.Water);
    map = withTerrain(map, { x: 1, y: 3 }, TerrainType.Water);
    map = withTerrain(map, { x: 2, y: 0 }, TerrainType.Water);
    map = withTerrain(map, { x: 2, y: 1 }, TerrainType.Water);
    map = withTerrain(map, { x: 2, y: 2 }, TerrainType.Water);
    map = withTerrain(map, { x: 2, y: 3 }, TerrainType.Water);

    const path = engine.findPath(map, { x: 0, y: 1 }, { x: 3, y: 2 }, 4, MovementType.Foot, []);
    expect(path).toBeNull();
  });
});
