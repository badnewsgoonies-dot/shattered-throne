import { describe, expect, it } from 'vitest';
import { GridType } from '../../shared/types';
import { MAP_LAYOUTS, getMapLayoutById } from '../mapLayouts';

describe('map layouts data', () => {
  it('has at least 20 maps', () => {
    expect(MAP_LAYOUTS.length).toBeGreaterThanOrEqual(20);
  });

  it('map IDs are unique', () => {
    const ids = MAP_LAYOUTS.map((map) => map.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all maps are square-grid maps', () => {
    for (const map of MAP_LAYOUTS) {
      expect(map.gridType).toBe(GridType.Square);
    }
  });

  it('map dimensions match tile arrays', () => {
    for (const map of MAP_LAYOUTS) {
      expect(map.tiles.length).toBe(map.height);
      for (const row of map.tiles) {
        expect(row.length).toBe(map.width);
      }
    }
  });

  it('tiles include correct coordinates and default occupant/item fields', () => {
    for (const map of MAP_LAYOUTS) {
      for (let y = 0; y < map.height; y += 1) {
        for (let x = 0; x < map.width; x += 1) {
          const tile = map.tiles[y][x];
          expect(tile.position.x).toBe(x);
          expect(tile.position.y).toBe(y);
          expect(tile.occupantId).toBeNull();
          expect(tile.itemId).toBeNull();
          expect(typeof tile.isChest).toBe('boolean');
          expect(typeof tile.isDoor).toBe('boolean');
          expect(typeof tile.isDeploymentZone).toBe('boolean');
          expect(typeof tile.fogRevealed).toBe('boolean');
        }
      }
    }
  });

  it('deployment zones are within bounds and marked on tiles', () => {
    for (const map of MAP_LAYOUTS) {
      for (const zone of map.deploymentZones) {
        expect(zone.x).toBeGreaterThanOrEqual(0);
        expect(zone.y).toBeGreaterThanOrEqual(0);
        expect(zone.x).toBeLessThan(map.width);
        expect(zone.y).toBeLessThan(map.height);
        expect(map.tiles[zone.y][zone.x].isDeploymentZone).toBe(true);
      }
    }
  });

  it('contains varied map sizes from 8 up to 24', () => {
    const widths = MAP_LAYOUTS.map((map) => map.width);
    const heights = MAP_LAYOUTS.map((map) => map.height);
    expect(Math.min(...widths)).toBeLessThanOrEqual(8);
    expect(Math.min(...heights)).toBeLessThanOrEqual(8);
    expect(Math.max(...widths)).toBeGreaterThanOrEqual(24);
    expect(Math.max(...heights)).toBeGreaterThanOrEqual(24);
  });

  it('terrain variety includes multiple terrain types', () => {
    const terrainTypes = new Set<string>();
    for (const map of MAP_LAYOUTS) {
      for (const row of map.tiles) {
        for (const tile of row) {
          terrainTypes.add(tile.terrain.type);
        }
      }
    }
    expect(terrainTypes.size).toBeGreaterThanOrEqual(8);
  });

  it('all terrain movement and passable records exist for all movement types', () => {
    for (const map of MAP_LAYOUTS) {
      for (const row of map.tiles) {
        for (const tile of row) {
          expect(Object.keys(tile.terrain.movementCost)).toHaveLength(4);
          expect(Object.keys(tile.terrain.passable)).toHaveLength(4);
        }
      }
    }
  });

  it('maps include at least one deployment zone', () => {
    for (const map of MAP_LAYOUTS) {
      expect(map.deploymentZones.length).toBeGreaterThan(0);
    }
  });

  it('map getter returns deep-copy-like object for known map and null for unknown', () => {
    const map = getMapLayoutById('map_borderlands_08');
    expect(map?.id).toBe('map_borderlands_08');
    expect(getMapLayoutById('missing_map')).toBeNull();

    if (map) {
      map.tiles[0][0].occupantId = 'mutated';
      const fresh = getMapLayoutById('map_borderlands_08');
      expect(fresh?.tiles[0][0].occupantId).toBeNull();
    }
  });

  it('chest and door tiles, when present, remain in bounds', () => {
    for (const map of MAP_LAYOUTS) {
      for (const row of map.tiles) {
        for (const tile of row) {
          if (tile.isChest || tile.isDoor) {
            expect(tile.position.x).toBeGreaterThanOrEqual(0);
            expect(tile.position.y).toBeGreaterThanOrEqual(0);
            expect(tile.position.x).toBeLessThan(map.width);
            expect(tile.position.y).toBeLessThan(map.height);
          }
        }
      }
    }
  });
});
