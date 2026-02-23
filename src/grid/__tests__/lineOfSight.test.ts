import { describe, expect, it } from 'vitest';
import { GridType, TerrainType } from '../../shared/types';
import { getLineOfSight } from '../lineOfSight';
import { createTestMap, withTerrain } from './testUtils';

describe('lineOfSight', () => {
  it('returns true for same tile', () => {
    const map = createTestMap(5, 5, GridType.Square);
    expect(getLineOfSight(map, { x: 2, y: 2 }, { x: 2, y: 2 })).toBe(true);
  });

  it('returns true for adjacent tiles on flat terrain', () => {
    const map = createTestMap(5, 5, GridType.Square);
    expect(getLineOfSight(map, { x: 2, y: 2 }, { x: 2, y: 3 })).toBe(true);
  });

  it('returns true across flat horizontal terrain', () => {
    const map = createTestMap(6, 1, GridType.Square);
    expect(getLineOfSight(map, { x: 0, y: 0 }, { x: 5, y: 0 })).toBe(true);
  });

  it('returns true across flat diagonal terrain', () => {
    const map = createTestMap(6, 6, GridType.Square);
    expect(getLineOfSight(map, { x: 0, y: 0 }, { x: 5, y: 5 })).toBe(true);
  });

  it('returns false when intermediate mountain is higher than source and blocks view', () => {
    let map = createTestMap(5, 1, GridType.Square);
    map = withTerrain(map, { x: 2, y: 0 }, TerrainType.Mountain);

    expect(getLineOfSight(map, { x: 0, y: 0 }, { x: 4, y: 0 })).toBe(false);
  });

  it('does not block LOS with same-height intermediate tiles', () => {
    let map = createTestMap(5, 1, GridType.Square);
    map = withTerrain(map, { x: 2, y: 0 }, TerrainType.Plains);

    expect(getLineOfSight(map, { x: 0, y: 0 }, { x: 4, y: 0 })).toBe(true);
  });

  it('height advantage allows seeing over lower intermediate terrain', () => {
    let map = createTestMap(5, 1, GridType.Square);
    map = withTerrain(map, { x: 0, y: 0 }, TerrainType.Mountain);
    map = withTerrain(map, { x: 2, y: 0 }, TerrainType.Fortress);

    expect(getLineOfSight(map, { x: 0, y: 0 }, { x: 4, y: 0 })).toBe(true);
  });

  it('target on higher tile can still be visible over lower intermediate tiles', () => {
    let map = createTestMap(5, 1, GridType.Square);
    map = withTerrain(map, { x: 4, y: 0 }, TerrainType.Mountain);
    map = withTerrain(map, { x: 2, y: 0 }, TerrainType.Fortress);

    expect(getLineOfSight(map, { x: 0, y: 0 }, { x: 4, y: 0 })).toBe(true);
  });

  it('returns false when source tile is out of bounds', () => {
    const map = createTestMap(5, 5, GridType.Square);
    expect(getLineOfSight(map, { x: -1, y: 0 }, { x: 2, y: 2 })).toBe(false);
  });

  it('returns false when target tile is out of bounds', () => {
    const map = createTestMap(5, 5, GridType.Square);
    expect(getLineOfSight(map, { x: 2, y: 2 }, { x: 9, y: 9 })).toBe(false);
  });

  it('multiple intermediate blockers still block LOS', () => {
    let map = createTestMap(7, 1, GridType.Square);
    map = withTerrain(map, { x: 2, y: 0 }, TerrainType.Mountain);
    map = withTerrain(map, { x: 4, y: 0 }, TerrainType.Mountain);

    expect(getLineOfSight(map, { x: 0, y: 0 }, { x: 6, y: 0 })).toBe(false);
  });
});
