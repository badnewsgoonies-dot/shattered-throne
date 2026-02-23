interface SaveSlotView {
  slotIndex: number;
  timestamp: number | null;
  chapterName?: string;
}

interface SaveLoadRenderData {
  slots: SaveSlotView[];
  selectedIndex?: number;
  mode?: 'save' | 'load';
}

function normalizeSaveLoadData(data: unknown): Required<SaveLoadRenderData> {
  const defaults: Required<SaveLoadRenderData> = {
    slots: [],
    selectedIndex: 0,
    mode: 'load',
  };

  if (!data || typeof data !== 'object') {
    return defaults;
  }

  const input = data as Partial<SaveLoadRenderData>;
  const slots = Array.isArray(input.slots) ? input.slots : [];
  const selected = typeof input.selectedIndex === 'number' ? Math.floor(input.selectedIndex) : 0;

  return {
    slots,
    selectedIndex: Math.max(0, Math.min(Math.max(0, slots.length - 1), selected)),
    mode: input.mode === 'save' ? 'save' : 'load',
  };
}

function formatTimestamp(timestamp: number | null): string {
  if (timestamp === null) {
    return 'Empty Slot';
  }

  const d = new Date(timestamp);
  if (Number.isNaN(d.getTime())) {
    return 'Corrupted Save';
  }

  return d.toLocaleString();
}

export function renderSaveLoadMenu(ctx: CanvasRenderingContext2D | null, data: unknown): void {
  if (!ctx) {
    return;
  }

  const model = normalizeSaveLoadData(data);
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.fillStyle = '#0B132B';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(model.mode === 'save' ? 'Save Game' : 'Load Game', 24, 20);

  ctx.font = '16px sans-serif';

  model.slots.slice(0, 8).forEach((slot, idx) => {
    const y = 76 + idx * 52;
    const selected = idx === model.selectedIndex;

    if (selected) {
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(20, y - 6, width - 40, 44);
    }

    ctx.fillStyle = '#E2E8F0';
    ctx.fillText(`Slot ${slot.slotIndex + 1}: ${formatTimestamp(slot.timestamp)}`, 28, y);

    if (slot.chapterName) {
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(slot.chapterName, width - 250, y);
    }
  });

  if (model.slots.length === 0) {
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('No save slots available.', 28, 88);
  }
}
