import { Unit } from '../shared/types';

export function renderUnitInfoScreen(ctx: CanvasRenderingContext2D | null, unit: Unit): void {
  if (!ctx) {
    return;
  }

  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.fillStyle = '#0B1120';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#F8FAFC';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText(unit.name, 24, 20);

  ctx.font = '18px sans-serif';
  ctx.fillText(`Class: ${unit.className}`, 24, 70);
  ctx.fillText(`Level: ${unit.level}`, 24, 98);
  ctx.fillText(`HP: ${unit.currentHP}/${unit.maxHP}`, 24, 126);
  ctx.fillText(`SP: ${unit.currentSP}/${unit.maxSP}`, 24, 154);

  const stats = unit.currentStats;
  const lines = [
    `STR ${stats.strength}`,
    `MAG ${stats.magic}`,
    `SKL ${stats.skill}`,
    `SPD ${stats.speed}`,
    `LCK ${stats.luck}`,
    `DEF ${stats.defense}`,
    `RES ${stats.resistance}`,
    `MOV ${stats.movement}`,
  ];

  lines.forEach((text, idx) => {
    ctx.fillText(text, 24, 204 + idx * 26);
  });
}
