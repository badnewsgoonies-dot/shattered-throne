interface TitleScreenData {
  title?: string;
  menuItems?: string[];
  selectedIndex?: number;
}

function normalizeTitleData(data: unknown): Required<TitleScreenData> {
  const defaults: Required<TitleScreenData> = {
    title: 'Shattered Throne',
    menuItems: ['New Game', 'Continue', 'Settings'],
    selectedIndex: 0,
  };

  if (!data || typeof data !== 'object') {
    return defaults;
  }

  const input = data as TitleScreenData;
  const menuItems = Array.isArray(input.menuItems) && input.menuItems.length > 0 ? input.menuItems : defaults.menuItems;
  const selectedIndexRaw = typeof input.selectedIndex === 'number' ? input.selectedIndex : defaults.selectedIndex;

  return {
    title: typeof input.title === 'string' && input.title.trim().length > 0 ? input.title : defaults.title,
    menuItems,
    selectedIndex: Math.max(0, Math.min(menuItems.length - 1, Math.floor(selectedIndexRaw))),
  };
}

export function renderTitleScreen(ctx: CanvasRenderingContext2D | null, data: unknown): void {
  if (!ctx) {
    return;
  }

  const model = normalizeTitleData(data);
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#0B132B');
  gradient.addColorStop(1, '#1C2541');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#F8FAFC';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 54px serif';
  ctx.fillText(model.title, width / 2, height * 0.28);

  ctx.font = '26px sans-serif';

  model.menuItems.forEach((item, index) => {
    const y = height * 0.5 + index * 44;
    const selected = index === model.selectedIndex;
    ctx.fillStyle = selected ? '#FCD34D' : '#E2E8F0';
    const text = selected ? `> ${item} <` : item;
    ctx.fillText(text, width / 2, y);
  });
}
