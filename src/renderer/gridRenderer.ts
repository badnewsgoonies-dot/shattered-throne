import { Camera, GridMap, GridType, Position } from '../shared/types';
import { gridToScreen } from './camera';
import { TERRAIN_COLORS, TILE_SIZE } from './terrainColors';

function drawHexPath(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y);
  ctx.lineTo(x + size * 0.75, y);
  ctx.lineTo(x + size, y + size * 0.5);
  ctx.lineTo(x + size * 0.75, y + size);
  ctx.lineTo(x + size * 0.25, y + size);
  ctx.lineTo(x, y + size * 0.5);
  ctx.closePath();
}

function isTileVisible(
  tilePos: Position,
  tileSize: number,
  camera: Camera,
  mapGridType: GridType,
  canvas: HTMLCanvasElement,
): boolean {
  const screen = gridToScreen(tilePos, camera, mapGridType);
  const screenLeft = screen.x;
  const screenTop = screen.y;
  const screenRight = screenLeft + tileSize;
  const screenBottom = screenTop + tileSize;

  return screenRight >= 0 && screenBottom >= 0 && screenLeft <= canvas.width && screenTop <= canvas.height;
}

export function renderGrid(map: GridMap, camera: Camera, ctx: CanvasRenderingContext2D | null): void {
  if (!ctx) {
    return;
  }

  const canvas = ctx.canvas;
  const tileSize = TILE_SIZE * camera.zoom;

  for (let y = 0; y < map.height; y += 1) {
    for (let x = 0; x < map.width; x += 1) {
      const tile = map.tiles[y]?.[x];
      if (!tile) {
        continue;
      }

      const tilePos = { x, y };
      if (!isTileVisible(tilePos, tileSize, camera, map.gridType, canvas)) {
        continue;
      }

      const screen = gridToScreen(tilePos, camera, map.gridType);
      const fillColor = TERRAIN_COLORS[tile.terrain.type] ?? '#000000';

      ctx.fillStyle = fillColor;
      ctx.strokeStyle = '#1A1A1A33';
      ctx.lineWidth = 1;

      if (map.gridType === GridType.Hex) {
        drawHexPath(ctx, screen.x, screen.y, tileSize);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(screen.x, screen.y, tileSize, tileSize);
        ctx.strokeRect(screen.x, screen.y, tileSize, tileSize);
      }
    }
  }
}
