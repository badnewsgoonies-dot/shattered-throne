import { describe, it, expect } from 'vitest';
import { mapLayouts } from '../mapLayouts';
import { TerrainType, GridType } from '../../shared/types';

describe('Map Layouts', () => {
  it('should have 20+ maps', () => {
    expect(mapLayouts.length).toBeGreaterThanOrEqual(20);
  });

  it('should have no duplicate IDs', () => {
    const ids = mapLayouts.map(m => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have valid dimensions', () => {
    for (const m of mapLayouts) {
      expect(m.width).toBeGreaterThanOrEqual(8);
      expect(m.height).toBeGreaterThanOrEqual(8);
      expect(m.width).toBeLessThanOrEqual(24);
      expect(m.height).toBeLessThanOrEqual(24);
    }
  });

  it('should have tiles matching dimensions', () => {
    for (const m of mapLayouts) {
      expect(m.tiles.length).toBe(m.height);
      for (const row of m.tiles) {
        expect(row.length).toBe(m.width);
      }
    }
  });

  it('should have deployment zones', () => {
    for (const m of mapLayouts) {
      expect(m.deploymentZones.length).toBeGreaterThan(0);
    }
  });

  it('should have valid grid type', () => {
    for (const m of mapLayouts) {
      expect([GridType.Square, GridType.Hex]).toContain(m.gridType);
    }
  });

  it('should have varied terrain', () => {
    const allTerrainTypes = new Set<string>();
    for (const m of mapLayouts) {
      for (const row of m.tiles) {
        for (const t of row) {
          allTerrainTypes.add(t.terrain.type);
        }
      }
    }
    expect(allTerrainTypes.size).toBeGreaterThanOrEqual(5);
  });

  it('should have names', () => {
    for (const m of mapLayouts) {
      expect(m.name).toBeTruthy();
    }
  });

  it('should have valid tile positions', () => {
    for (const m of mapLayouts) {
      for (let y = 0; y < m.height; y++) {
        for (let x = 0; x < m.width; x++) {
          expect(m.tiles[y][x].position).toEqual({ x, y });
        }
      }
    }
  });

  it('should have varying map sizes', () => {
    const sizes = new Set(mapLayouts.map(m => `${m.width}x${m.height}`));
    expect(sizes.size).toBeGreaterThanOrEqual(3);
  });
});
