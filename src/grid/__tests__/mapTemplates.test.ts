import { describe, expect, it } from 'vitest';
import { GridType } from '../../shared/types';
import { getMapTemplate, MAP_TEMPLATES } from '../mapTemplates';

describe('mapTemplates', () => {
  const expectedDimensions: Record<string, { width: number; height: number }> = {
    map_arena_8x8: { width: 8, height: 8 },
    map_forest_clearing_8x8: { width: 8, height: 8 },
    map_bridge_crossing_8x8: { width: 8, height: 8 },
    map_village_square_8x8: { width: 8, height: 8 },
    map_mountain_pass_8x8: { width: 8, height: 8 },
    map_castle_courtyard_12x12: { width: 12, height: 12 },
    map_riverside_12x12: { width: 12, height: 12 },
    map_desert_oasis_12x12: { width: 12, height: 12 },
    map_snowy_field_12x12: { width: 12, height: 12 },
    map_swamp_ruins_12x12: { width: 12, height: 12 },
    map_open_battlefield_16x16: { width: 16, height: 16 },
    map_fortress_siege_16x16: { width: 16, height: 16 },
    map_volcanic_crater_16x16: { width: 16, height: 16 },
    map_coastal_cliff_16x16: { width: 16, height: 16 },
    map_ancient_temple_16x16: { width: 16, height: 16 },
    map_grand_castle_20x20: { width: 20, height: 20 },
    map_dragons_lair_20x20: { width: 20, height: 20 },
    map_final_battlefield_24x24: { width: 24, height: 24 },
    map_mountain_fortress_20x20: { width: 20, height: 20 },
    map_dark_forest_20x20: { width: 20, height: 20 },
  };

  it('contains all 20 predefined maps', () => {
    expect(Object.keys(MAP_TEMPLATES).length).toBe(20);
  });

  it('each map id matches its object key', () => {
    for (const [key, map] of Object.entries(MAP_TEMPLATES)) {
      expect(map.id).toBe(key);
    }
  });

  it('each map has the expected dimensions', () => {
    for (const [id, dim] of Object.entries(expectedDimensions)) {
      const map = MAP_TEMPLATES[id];
      expect(map.width).toBe(dim.width);
      expect(map.height).toBe(dim.height);
    }
  });

  it('all templates use square grid type', () => {
    for (const map of Object.values(MAP_TEMPLATES)) {
      expect(map.gridType).toBe(GridType.Square);
    }
  });

  it('all templates have valid tile matrix sizes', () => {
    for (const map of Object.values(MAP_TEMPLATES)) {
      expect(map.tiles.length).toBe(map.height);
      for (const row of map.tiles) {
        expect(row.length).toBe(map.width);
      }
    }
  });

  it('all templates have deployment zones between 4 and 8', () => {
    for (const map of Object.values(MAP_TEMPLATES)) {
      expect(map.deploymentZones.length).toBeGreaterThanOrEqual(4);
      expect(map.deploymentZones.length).toBeLessThanOrEqual(8);
    }
  });

  it('deployment zones are in bounds and marked on tiles', () => {
    for (const map of Object.values(MAP_TEMPLATES)) {
      for (const zone of map.deploymentZones) {
        expect(zone.x).toBeGreaterThanOrEqual(0);
        expect(zone.x).toBeLessThan(map.width);
        expect(zone.y).toBeGreaterThanOrEqual(0);
        expect(zone.y).toBeLessThan(map.height);
        expect(map.tiles[zone.y][zone.x].isDeploymentZone).toBe(true);
      }
    }
  });

  it('every map has varied terrain (more than one terrain type)', () => {
    for (const map of Object.values(MAP_TEMPLATES)) {
      const terrainTypes = new Set<string>();
      for (const row of map.tiles) {
        for (const tile of row) {
          terrainTypes.add(tile.terrain.type);
        }
      }
      expect(terrainTypes.size).toBeGreaterThan(1);
    }
  });

  it('getMapTemplate returns null for unknown ids', () => {
    expect(getMapTemplate('does_not_exist')).toBeNull();
  });

  it('getMapTemplate returns a deep clone', () => {
    const mapA = getMapTemplate('map_arena_8x8');
    const mapB = getMapTemplate('map_arena_8x8');

    expect(mapA).not.toBeNull();
    expect(mapB).not.toBeNull();
    expect(mapA).not.toBe(mapB);

    mapA!.tiles[0][0].occupantId = 'mutate';
    expect(mapB!.tiles[0][0].occupantId).toBeNull();
  });

  it('all templates have non-empty names', () => {
    for (const map of Object.values(MAP_TEMPLATES)) {
      expect(map.name.length).toBeGreaterThan(0);
    }
  });
});
