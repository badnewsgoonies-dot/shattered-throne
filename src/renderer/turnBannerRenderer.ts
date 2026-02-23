import { TurnPhase } from '../shared/types';

const PHASE_LABELS: Record<TurnPhase, string> = {
  [TurnPhase.Player]: 'Player Phase',
  [TurnPhase.Enemy]: 'Enemy Phase',
  [TurnPhase.AllyNPC]: 'Ally Phase',
};

function smoothStep(t: number): number {
  return t * t * (3 - 2 * t);
}

export function renderTurnBanner(
  ctx: CanvasRenderingContext2D | null,
  phase: TurnPhase,
  elapsedMs: number,
  durationMs = 1200,
): void {
  if (!ctx || durationMs <= 0) {
    return;
  }

  const progress = Math.max(0, Math.min(1, elapsedMs / durationMs));
  if (progress >= 1) {
    return;
  }

  const fadeInEnd = 0.2;
  const fadeOutStart = 0.8;

  let alpha = 1;
  if (progress < fadeInEnd) {
    alpha = progress / fadeInEnd;
  } else if (progress > fadeOutStart) {
    alpha = (1 - progress) / (1 - fadeOutStart);
  }

  const eased = smoothStep(progress);
  const bannerWidth = 260;
  const bannerHeight = 46;
  const baseX = Math.floor((ctx.canvas.width - bannerWidth) / 2);
  const x = baseX + Math.floor((1 - eased) * 30);
  const y = 22;

  const previousAlpha = ctx.globalAlpha;
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

  ctx.fillStyle = '#0F172AE6';
  ctx.fillRect(x, y, bannerWidth, bannerHeight);
  ctx.strokeStyle = '#E2E8F0AA';
  ctx.strokeRect(x, y, bannerWidth, bannerHeight);

  ctx.fillStyle = '#F8FAFC';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(PHASE_LABELS[phase], x + bannerWidth / 2, y + bannerHeight / 2);

  ctx.globalAlpha = previousAlpha;
}
