import { Position, WorldMapNode } from '../shared/types';

interface WorldMapRenderData {
  nodes: WorldMapNode[];
  selectedNodeId?: string;
}

const NODE_COLORS: Record<WorldMapNode['type'], string> = {
  story: '#60A5FA',
  paralogue: '#A78BFA',
  shop: '#34D399',
  arena: '#F59E0B',
};

function normalizeWorldMapData(data: unknown): WorldMapRenderData {
  if (!data || typeof data !== 'object') {
    return { nodes: [] };
  }

  const input = data as Partial<WorldMapRenderData>;
  return {
    nodes: Array.isArray(input.nodes) ? input.nodes : [],
    selectedNodeId: typeof input.selectedNodeId === 'string' ? input.selectedNodeId : undefined,
  };
}

function projectPositions(nodes: WorldMapNode[], width: number, height: number): Record<string, Position> {
  if (nodes.length === 0) {
    return {};
  }

  const padding = 56;
  const xs = nodes.map((n) => n.position.x);
  const ys = nodes.map((n) => n.position.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = Math.max(1, maxX - minX);
  const spanY = Math.max(1, maxY - minY);

  const projected: Record<string, Position> = {};

  for (const node of nodes) {
    const px = padding + ((node.position.x - minX) / spanX) * Math.max(1, width - padding * 2);
    const py = padding + ((node.position.y - minY) / spanY) * Math.max(1, height - padding * 2);
    projected[node.id] = { x: px, y: py };
  }

  return projected;
}

export function renderWorldMap(ctx: CanvasRenderingContext2D | null, data: unknown): void {
  if (!ctx) {
    return;
  }

  const model = normalizeWorldMapData(data);
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const projected = projectPositions(model.nodes, width, height);

  ctx.fillStyle = '#04121F';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#7DD3FC66';
  ctx.lineWidth = 2;

  for (const node of model.nodes) {
    const from = projected[node.id];
    if (!from) {
      continue;
    }

    for (const targetId of node.connections) {
      const to = projected[targetId];
      if (!to) {
        continue;
      }

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }
  }

  for (const node of model.nodes) {
    const p = projected[node.id];
    if (!p) {
      continue;
    }

    const baseColor = NODE_COLORS[node.type];
    const nodeColor = node.completed ? '#22C55E' : node.unlocked ? baseColor : '#475569';

    ctx.fillStyle = nodeColor;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
    ctx.fill();

    if (node.id === model.selectedNodeId) {
      ctx.strokeStyle = '#F8FAFC';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 18, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}
