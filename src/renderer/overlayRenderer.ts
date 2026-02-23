import { Camera, GridType, Position, RenderOverlay } from '../shared/types';
import { gridToScreen } from './camera';
import { TILE_SIZE } from './terrainColors';

const DEFAULT_OVERLAY_COLORS: Record<RenderOverlay['type'], string> = {
  movement: '#4A90E2',
  attack: '#E74C3C',
  danger: '#9B59B6',
  heal: '#2ECC71',
};

function drawHexOverlay(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y);
  ctx.lineTo(x + size * 0.75, y);
  ctx.lineTo(x + size, y + size * 0.5);
  ctx.lineTo(x + size * 0.75, y + size);
  ctx.lineTo(x + size * 0.25, y + size);
  ctx.lineTo(x, y + size * 0.5);
  ctx.closePath();
  ctx.fill();
}

function drawOverlayTile(
  ctx: CanvasRenderingContext2D,
  position: Position,
  camera: Camera,
  gridType: GridType,
  tileSize: number,
): void {
  const screen = gridToScreen(position, camera, gridType);

  if (gridType === GridType.Hex) {
    drawHexOverlay(ctx, screen.x, screen.y, tileSize);
    return;
  }

  ctx.fillRect(screen.x, screen.y, tileSize, tileSize);
}

export function renderOverlays(
  overlays: RenderOverlay[],
  camera: Camera,
  gridType: GridType,
  ctx: CanvasRenderingContext2D | null,
): void {
  if (!ctx) {
    return;
  }

  const tileSize = TILE_SIZE * camera.zoom;
  const prevAlpha = ctx.globalAlpha;

  for (const overlay of overlays) {
    ctx.fillStyle = overlay.color || DEFAULT_OVERLAY_COLORS[overlay.type];
    ctx.globalAlpha = Math.max(0, Math.min(1, overlay.opacity));

    for (const pos of overlay.positions) {
      drawOverlayTile(ctx, pos, camera, gridType, tileSize);
    }
  }

  ctx.globalAlpha = prevAlpha;
}
