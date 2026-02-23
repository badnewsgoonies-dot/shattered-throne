import { describe, expect, it } from 'vitest';
import { TerrainType } from '../../shared/types';
import { TERRAIN_COLORS, TILE_SIZE } from '../terrainColors';

describe('terrainColors', () => {
  it('uses tile size of 48 pixels', () => {
    expect(TILE_SIZE).toBe(48);
  });

  it('maps plains to expected color', () => {
    expect(TERRAIN_COLORS[TerrainType.Plains]).toBe('#90C060');
  });

  it('maps forest to expected color', () => {
    expect(TERRAIN_COLORS[TerrainType.Forest]).toBe('#408030');
  });

  it('maps mountain to expected color', () => {
    expect(TERRAIN_COLORS[TerrainType.Mountain]).toBe('#A08060');
  });

  it('maps water to expected color', () => {
    expect(TERRAIN_COLORS[TerrainType.Water]).toBe('#4080D0');
  });

  it('maps lava to expected color', () => {
    expect(TERRAIN_COLORS[TerrainType.Lava]).toBe('#D04020');
  });

  it('maps fortress/bridge/swamp/sand/snow/void to expected colors', () => {
    expect(TERRAIN_COLORS[TerrainType.Fortress]).toBe('#808090');
    expect(TERRAIN_COLORS[TerrainType.Bridge]).toBe('#B09060');
    expect(TERRAIN_COLORS[TerrainType.Swamp]).toBe('#607048');
    expect(TERRAIN_COLORS[TerrainType.Sand]).toBe('#D0C080');
    expect(TERRAIN_COLORS[TerrainType.Snow]).toBe('#E0E8F0');
    expect(TERRAIN_COLORS[TerrainType.Void]).toBe('#202020');
  });

  it('covers every TerrainType with a valid hex color', () => {
    const entries = Object.values(TerrainType).map((terrain) => TERRAIN_COLORS[terrain]);
    expect(entries).toHaveLength(Object.values(TerrainType).length);
    for (const color of entries) {
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });
});
