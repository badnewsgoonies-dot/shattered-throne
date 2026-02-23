interface ShopItemView {
  name: string;
  price: number;
  description?: string;
}

interface ShopRenderData {
  inventory: ShopItemView[];
  selectedIndex?: number;
  gold?: number;
}

function normalizeShopData(data: unknown): Required<ShopRenderData> {
  const defaults: Required<ShopRenderData> = {
    inventory: [],
    selectedIndex: 0,
    gold: 0,
  };

  if (!data || typeof data !== 'object') {
    return defaults;
  }

  const input = data as Partial<ShopRenderData>;
  const inventory = Array.isArray(input.inventory) ? input.inventory : [];
  const selectedIndex = typeof input.selectedIndex === 'number' ? Math.floor(input.selectedIndex) : 0;
  const clampedIndex = Math.max(0, Math.min(Math.max(0, inventory.length - 1), selectedIndex));

  return {
    inventory,
    selectedIndex: clampedIndex,
    gold: typeof input.gold === 'number' ? Math.max(0, Math.floor(input.gold)) : 0,
  };
}

export function renderShop(ctx: CanvasRenderingContext2D | null, data: unknown): void {
  if (!ctx) {
    return;
  }

  const model = normalizeShopData(data);
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.fillStyle = '#1E293B';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Shop', 20, 14);

  ctx.font = 'bold 18px sans-serif';
  ctx.fillStyle = '#FCD34D';
  ctx.fillText(`Gold: ${model.gold}`, width - 180, 20);

  const listX = 24;
  const listY = 64;
  const rowHeight = 32;

  ctx.font = '16px sans-serif';

  model.inventory.slice(0, 12).forEach((item, idx) => {
    const y = listY + idx * rowHeight;
    const selected = idx === model.selectedIndex;

    if (selected) {
      ctx.fillStyle = '#334155';
      ctx.fillRect(listX - 8, y - 4, width - 56, rowHeight - 2);
    }

    ctx.fillStyle = '#E2E8F0';
    ctx.fillText(item.name, listX, y);
    ctx.textAlign = 'right';
    ctx.fillText(`${item.price}g`, width - 34, y);
    ctx.textAlign = 'left';
  });
}
