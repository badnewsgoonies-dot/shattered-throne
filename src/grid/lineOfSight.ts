import { GridMap, Position } from '../shared/types';

function getLinePoints(from: Position, to: Position): Position[] {
  const points: Position[] = [];

  let x0 = from.x;
  let y0 = from.y;
  const x1 = to.x;
  const y1 = to.y;

  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  points.push({ x: x0, y: y0 });

  while (!(x0 === x1 && y0 === y1)) {
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
    points.push({ x: x0, y: y0 });
  }

  return points;
}

function getTile(map: GridMap, pos: Position) {
  if (pos.y < 0 || pos.y >= map.height || pos.x < 0 || pos.x >= map.width) {
    return null;
  }
  return map.tiles[pos.y]?.[pos.x] ?? null;
}

export function getLineOfSight(map: GridMap, from: Position, to: Position): boolean {
  const fromTile = getTile(map, from);
  const toTile = getTile(map, to);

  if (!fromTile || !toTile) {
    return false;
  }

  if (from.x === to.x && from.y === to.y) {
    return true;
  }

  const points = getLinePoints(from, to);
  const fromHeight = fromTile.terrain.heightLevel;
  const toHeight = toTile.terrain.heightLevel;

  for (let i = 1; i < points.length - 1; i += 1) {
    const point = points[i];
    const tile = getTile(map, point);
    if (!tile) {
      return false;
    }

    const tileHeight = tile.terrain.heightLevel;
    if (tileHeight <= fromHeight) {
      continue;
    }

    const t = i / (points.length - 1);
    const visibleHeight = fromHeight + (toHeight - fromHeight) * t;

    if (tileHeight > visibleHeight) {
      return false;
    }
  }

  return true;
}
