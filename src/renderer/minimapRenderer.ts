import { Camera, GridMap, Unit } from '../shared/types';
import { TERRAIN_COLORS, TILE_SIZE } from './terrainColors';

const TEAM_COLORS: Record<Unit['team'], string> = {
  player: '#60A5FA',
  enemy: '#F87171',
  ally: '#34D399',
};

export function renderMinimap(
  ctx: CanvasRenderingContext2D | null,
  map: GridMap,
  units: Unit[],
  camera: Camera,
): void {
  if (!ctx) {
    return;
  }

  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;

  const maxSize = 180;
  const scale = Math.min(maxSize / map.width, maxSize / map.height);
  const minimapWidth = Math.max(40, map.width * scale);
  const minimapHeight = Math.max(40, map.height * scale);
  const x = canvasWidth - minimapWidth - 10;
  const y = 10;

  ctx.fillStyle = '#020617CC';
  ctx.fillRect(x - 4, y - 4, minimapWidth + 8, minimapHeight + 8);

  for (let row = 0; row < map.height; row += 1) {
    for (let col = 0; col < map.width; col += 1) {
      const tile = map.tiles[row]?.[col];
      if (!tile) {
        continue;
      }

      ctx.fillStyle = TERRAIN_COLORS[tile.terrain.type] ?? '#000000';
      ctx.fillRect(x + col * scale, y + row * scale, Math.ceil(scale), Math.ceil(scale));
    }
  }

  for (const unit of units) {
    if (!unit.position || !unit.isAlive) {
      continue;
    }

    ctx.fillStyle = TEAM_COLORS[unit.team];
    ctx.fillRect(x + unit.position.x * scale, y + unit.position.y * scale, Math.max(2, scale), Math.max(2, scale));
  }

  const worldTileSize = TILE_SIZE * camera.zoom;
  const viewportTilesWide = ctx.canvas.width / worldTileSize;
  const viewportTilesHigh = ctx.canvas.height / worldTileSize;

  const viewX = x + (camera.x / worldTileSize) * scale;
  const viewY = y + (camera.y / worldTileSize) * scale;
  const viewWidth = viewportTilesWide * scale;
  const viewHeight = viewportTilesHigh * scale;

  ctx.strokeStyle = '#F8FAFC';
  ctx.lineWidth = 1;
  ctx.strokeRect(viewX, viewY, viewWidth, viewHeight);
}
