interface SettingOption {
  label: string;
  value: string | number | boolean;
}

interface SettingsRenderData {
  options: SettingOption[];
  selectedIndex?: number;
}

function normalizeSettingsData(data: unknown): Required<SettingsRenderData> {
  const defaults: Required<SettingsRenderData> = {
    options: [
      { label: 'Master Volume', value: 100 },
      { label: 'Music Volume', value: 100 },
      { label: 'SFX Volume', value: 100 },
      { label: 'Mute', value: false },
    ],
    selectedIndex: 0,
  };

  if (!data || typeof data !== 'object') {
    return defaults;
  }

  const input = data as Partial<SettingsRenderData>;
  const options = Array.isArray(input.options) && input.options.length > 0 ? input.options : defaults.options;
  const selected = typeof input.selectedIndex === 'number' ? Math.floor(input.selectedIndex) : defaults.selectedIndex;

  return {
    options,
    selectedIndex: Math.max(0, Math.min(options.length - 1, selected)),
  };
}

export function renderSettingsMenu(ctx: CanvasRenderingContext2D | null, data: unknown): void {
  if (!ctx) {
    return;
  }

  const model = normalizeSettingsData(data);
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Settings', 24, 20);

  ctx.font = '18px sans-serif';

  model.options.forEach((option, idx) => {
    const y = 84 + idx * 38;
    const selected = idx === model.selectedIndex;

    if (selected) {
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(20, y - 6, width - 40, 30);
    }

    ctx.fillStyle = '#E5E7EB';
    ctx.fillText(option.label, 28, y);
    ctx.textAlign = 'right';
    ctx.fillText(String(option.value), width - 28, y);
    ctx.textAlign = 'left';
  });
}
