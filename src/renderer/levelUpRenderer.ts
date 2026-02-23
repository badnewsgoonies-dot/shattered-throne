import { LevelUpResult, Unit } from '../shared/types';

export function renderLevelUpScreen(ctx: CanvasRenderingContext2D | null, result: LevelUpResult, unit: Unit): void {
  if (!ctx) {
    return;
  }

  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.fillStyle = '#04121FBF';
  ctx.fillRect(0, 0, width, height);

  const panelWidth = Math.min(540, width - 40);
  const panelHeight = Math.min(360, height - 40);
  const panelX = Math.floor((width - panelWidth) / 2);
  const panelY = Math.floor((height - panelHeight) / 2);

  ctx.fillStyle = '#0F172A';
  ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
  ctx.strokeStyle = '#E2E8F0AA';
  ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

  ctx.fillStyle = '#FCD34D';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(`${unit.name} Level Up!`, panelX + panelWidth / 2, panelY + 18);

  ctx.fillStyle = '#F8FAFC';
  ctx.font = '18px sans-serif';
  ctx.fillText(`Level ${unit.level} -> ${result.newLevel}`, panelX + panelWidth / 2, panelY + 60);

  ctx.textAlign = 'left';
  const gains = Object.entries(result.statGains).filter(([, value]) => typeof value === 'number' && value !== 0);

  if (gains.length === 0) {
    ctx.fillText('No stat gains this level.', panelX + 24, panelY + 110);
  } else {
    gains.forEach(([stat, value], idx) => {
      ctx.fillText(`${stat.toUpperCase()}: +${value}`, panelX + 24, panelY + 110 + idx * 26);
    });
  }

  if (result.newSkills.length > 0) {
    ctx.fillStyle = '#86EFAC';
    ctx.fillText(`New Skills: ${result.newSkills.join(', ')}`, panelX + 24, panelY + panelHeight - 44);
  }
}
