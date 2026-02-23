import { DialogueLine } from '../shared/types';

export function getTypewriterText(text: string, elapsedMs: number, charsPerSecond = 45): string {
  if (elapsedMs === Number.POSITIVE_INFINITY) {
    return text;
  }

  if (charsPerSecond <= 0 || elapsedMs <= 0) {
    return '';
  }

  const visibleChars = Math.floor((elapsedMs / 1000) * charsPerSecond);
  return text.slice(0, Math.max(0, visibleChars));
}

function wrapTextByWords(text: string, maxCharsPerLine: number): string[] {
  if (maxCharsPerLine <= 1) {
    return [text];
  }

  const words = text.split(/\s+/).filter((word) => word.length > 0);
  if (words.length === 0) {
    return [''];
  }

  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const candidate = currentLine.length === 0 ? word : `${currentLine} ${word}`;
    if (candidate.length <= maxCharsPerLine) {
      currentLine = candidate;
      continue;
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    currentLine = word;
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}

export function renderDialogueBox(
  ctx: CanvasRenderingContext2D | null,
  lines: DialogueLine[],
  currentIndex: number,
  elapsedMs = Number.POSITIVE_INFINITY,
): void {
  if (!ctx) {
    return;
  }

  const line = lines[currentIndex];
  if (!line) {
    return;
  }

  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const boxHeight = Math.max(130, Math.floor(height * 0.25));
  const boxY = height - boxHeight - 12;

  ctx.fillStyle = '#020617D9';
  ctx.fillRect(12, boxY, width - 24, boxHeight);
  ctx.strokeStyle = '#E2E8F0AA';
  ctx.lineWidth = 1;
  ctx.strokeRect(12, boxY, width - 24, boxHeight);

  ctx.fillStyle = '#FCD34D';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(line.speaker, 24, boxY + 12);

  const visibleText = getTypewriterText(line.text, elapsedMs);
  const wrapped = wrapTextByWords(visibleText, 56);

  ctx.fillStyle = '#F8FAFC';
  ctx.font = '16px sans-serif';

  wrapped.slice(0, 4).forEach((textLine, idx) => {
    ctx.fillText(textLine, 24, boxY + 42 + idx * 24);
  });
}
