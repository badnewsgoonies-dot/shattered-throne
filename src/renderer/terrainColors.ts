import { TerrainType } from '../shared/types';

export const TERRAIN_COLORS: Record<TerrainType, string> = {
  [TerrainType.Plains]: '#90C060',
  [TerrainType.Forest]: '#408030',
  [TerrainType.Mountain]: '#A08060',
  [TerrainType.Water]: '#4080D0',
  [TerrainType.Lava]: '#D04020',
  [TerrainType.Fortress]: '#808090',
  [TerrainType.Bridge]: '#B09060',
  [TerrainType.Swamp]: '#607048',
  [TerrainType.Sand]: '#D0C080',
  [TerrainType.Snow]: '#E0E8F0',
  [TerrainType.Void]: '#202020',
};

export const TILE_SIZE = 48;
