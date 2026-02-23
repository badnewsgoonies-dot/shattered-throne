import { CombatLogEntry } from '../shared/types';

function phaseLabel(phase: CombatLogEntry['phase']): string {
  if (phase === 'player') {
    return 'P';
  }

  if (phase === 'enemy') {
    return 'E';
  }

  return 'A';
}

export function renderCombatLog(
  ctx: CanvasRenderingContext2D | null,
  entries: CombatLogEntry[],
  scrollOffset = 0,
): void {
  if (!ctx) {
    return;
  }

  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;
  const sidebarWidth = Math.min(330, Math.max(220, Math.floor(canvasWidth * 0.3)));
  const x = canvasWidth - sidebarWidth;

  ctx.fillStyle = '#020617CC';
  ctx.fillRect(x, 0, sidebarWidth, canvasHeight);

  ctx.fillStyle = '#E2E8F0';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Combat Log', x + 12, 10);

  const lineHeight = 18;
  const topPadding = 36;
  const visibleLines = Math.max(1, Math.floor((canvasHeight - topPadding - 10) / lineHeight));
  const safeOffset = Math.max(0, scrollOffset);
  const startIndex = Math.max(0, entries.length - visibleLines - safeOffset);
  const visible = entries.slice(startIndex, startIndex + visibleLines);

  ctx.font = '12px sans-serif';

  visible.forEach((entry, index) => {
    const y = topPadding + index * lineHeight;
    const prefix = `[T${entry.turnNumber} ${phaseLabel(entry.phase)}] `;
    const text = `${prefix}${entry.message}`;
    const clipped = text.length > 48 ? `${text.slice(0, 45)}...` : text;
    ctx.fillStyle = '#CBD5E1';
    ctx.fillText(clipped, x + 12, y);
  });
}
