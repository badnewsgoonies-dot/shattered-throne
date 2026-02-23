import { Camera, GridType, Unit } from '../shared/types';
import { gridToScreen } from './camera';
import { TILE_SIZE } from './terrainColors';

const TEAM_COLORS: Record<Unit['team'], string> = {
  player: '#2F75FF',
  enemy: '#D64545',
  ally: '#2FA85E',
};

function drawStatusDots(ctx: CanvasRenderingContext2D, x: number, y: number, count: number): void {
  const visibleDots = Math.min(5, Math.max(0, count));
  const dotRadius = 2;

  ctx.fillStyle = '#FFE066';

  for (let i = 0; i < visibleDots; i += 1) {
    const dotX = x + i * (dotRadius * 3);
    ctx.beginPath();
    ctx.arc(dotX, y, dotRadius, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function renderUnits(
  units: Unit[],
  camera: Camera,
  gridType: GridType,
  ctx: CanvasRenderingContext2D | null,
): void {
  if (!ctx) {
    return;
  }

  const tileSize = TILE_SIZE * camera.zoom;

  for (const unit of units) {
    if (!unit.position || !unit.isAlive) {
      continue;
    }

    const screen = gridToScreen(unit.position, camera, gridType);
    const centerX = screen.x + tileSize / 2;
    const centerY = screen.y + tileSize / 2;
    const radius = tileSize * 0.35;

    ctx.fillStyle = TEAM_COLORS[unit.team];
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#121212';
    ctx.lineWidth = Math.max(1, Math.floor(camera.zoom));
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.max(10, Math.floor(tileSize * 0.32))}px sans-serif`;
    ctx.fillText(unit.className.charAt(0).toUpperCase(), centerX, centerY);

    const barWidth = tileSize * 0.7;
    const barHeight = Math.max(3, Math.floor(tileSize * 0.1));
    const barX = centerX - barWidth / 2;
    const barY = screen.y - barHeight - 2;
    const hpRatio = unit.maxHP > 0 ? Math.max(0, Math.min(1, unit.currentHP / unit.maxHP)) : 0;

    ctx.fillStyle = '#222222CC';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = hpRatio > 0.35 ? '#4ADE80' : '#F97316';
    ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

    drawStatusDots(ctx, barX, barY + barHeight + 5, unit.activeStatusEffects.length);
  }
}
