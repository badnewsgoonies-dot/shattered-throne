import { BattleForecast, Unit } from '../shared/types';

function drawPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  name: string,
  damage: number,
  hit: number,
  crit: number,
  doubles: boolean,
): void {
  ctx.fillStyle = '#0B1220E6';
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = '#E5E7EB55';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);

  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(name, x + 12, y + 10);

  ctx.font = '14px sans-serif';
  ctx.fillText(`DMG: ${damage}`, x + 12, y + 36);
  ctx.fillText(`HIT: ${hit}%`, x + 12, y + 56);
  ctx.fillText(`CRT: ${crit}%`, x + 12, y + 76);
  ctx.fillText(`DBL: ${doubles ? 'Yes' : 'No'}`, x + 12, y + 96);
}

export function renderBattleForecast(
  ctx: CanvasRenderingContext2D | null,
  forecast: BattleForecast,
  attacker: Unit,
  defender: Unit,
): void {
  if (!ctx) {
    return;
  }

  const width = ctx.canvas.width;
  const panelWidth = 220;
  const panelHeight = 130;
  const gap = 18;
  const totalWidth = panelWidth * 2 + gap;
  const x = Math.max(10, Math.floor((width - totalWidth) / 2));
  const y = 14;

  drawPanel(
    ctx,
    x,
    y,
    panelWidth,
    panelHeight,
    attacker.name,
    forecast.attackerDamage,
    forecast.attackerHit,
    forecast.attackerCrit,
    forecast.attackerDoubles,
  );

  drawPanel(
    ctx,
    x + panelWidth + gap,
    y,
    panelWidth,
    panelHeight,
    defender.name,
    forecast.defenderDamage,
    forecast.defenderHit,
    forecast.defenderCrit,
    forecast.defenderDoubles,
  );

  ctx.fillStyle = '#FCD34D';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Counter: ${forecast.defenderCanCounter ? 'Yes' : 'No'}`, x + totalWidth / 2, y + panelHeight - 10);
}
