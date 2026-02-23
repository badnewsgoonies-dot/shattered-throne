import {
  GridMap,
  GridType,
  MovementType,
  Position,
  Unit,
  ZONE_OF_CONTROL_EXTRA_COST,
} from '../shared/types';

interface QueueNode {
  key: string;
  pos: Position;
  g: number;
  f: number;
}

class MinHeap {
  private data: QueueNode[] = [];

  push(node: QueueNode): void {
    this.data.push(node);
    this.bubbleUp(this.data.length - 1);
  }

  pop(): QueueNode | null {
    if (this.data.length === 0) {
      return null;
    }

    const top = this.data[0];
    const last = this.data.pop();

    if (this.data.length > 0 && last) {
      this.data[0] = last;
      this.bubbleDown(0);
    }

    return top;
  }

  get size(): number {
    return this.data.length;
  }

  private bubbleUp(index: number): void {
    let current = index;

    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);
      if (this.data[parent].f <= this.data[current].f) {
        break;
      }
      [this.data[parent], this.data[current]] = [this.data[current], this.data[parent]];
      current = parent;
    }
  }

  private bubbleDown(index: number): void {
    let current = index;

    while (true) {
      const left = current * 2 + 1;
      const right = current * 2 + 2;
      let smallest = current;

      if (left < this.data.length && this.data[left].f < this.data[smallest].f) {
        smallest = left;
      }
      if (right < this.data.length && this.data[right].f < this.data[smallest].f) {
        smallest = right;
      }
      if (smallest === current) {
        break;
      }

      [this.data[current], this.data[smallest]] = [this.data[smallest], this.data[current]];
      current = smallest;
    }
  }
}

function posKey(pos: Position): string {
  return `${pos.x},${pos.y}`;
}

function isInBounds(map: GridMap, pos: Position): boolean {
  return pos.x >= 0 && pos.x < map.width && pos.y >= 0 && pos.y < map.height;
}

function getTile(map: GridMap, pos: Position) {
  if (!isInBounds(map, pos)) {
    return null;
  }
  return map.tiles[pos.y]?.[pos.x] ?? null;
}

function getSquareNeighbors(map: GridMap, pos: Position): Position[] {
  const candidates: Position[] = [
    { x: pos.x, y: pos.y - 1 },
    { x: pos.x + 1, y: pos.y },
    { x: pos.x, y: pos.y + 1 },
    { x: pos.x - 1, y: pos.y },
  ];
  return candidates.filter((candidate) => isInBounds(map, candidate));
}

function getHexNeighbors(map: GridMap, pos: Position): Position[] {
  const isOddRow = pos.y % 2 === 1;
  const deltas = isOddRow
    ? [
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: -1 },
        { x: 1, y: -1 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ]
    : [
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: -1, y: -1 },
        { x: 0, y: -1 },
        { x: -1, y: 1 },
        { x: 0, y: 1 },
      ];

  return deltas
    .map((delta) => ({ x: pos.x + delta.x, y: pos.y + delta.y }))
    .filter((candidate) => isInBounds(map, candidate));
}

function getNeighbors(map: GridMap, pos: Position): Position[] {
  return map.gridType === GridType.Hex ? getHexNeighbors(map, pos) : getSquareNeighbors(map, pos);
}

function oddRToCube(pos: Position): { x: number; y: number; z: number } {
  const x = pos.x - (pos.y - (pos.y & 1)) / 2;
  const z = pos.y;
  const y = -x - z;
  return { x, y, z };
}

function getDistance(a: Position, b: Position, gridType: GridType): number {
  if (gridType === GridType.Square) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  const ac = oddRToCube(a);
  const bc = oddRToCube(b);
  return Math.max(Math.abs(ac.x - bc.x), Math.abs(ac.y - bc.y), Math.abs(ac.z - bc.z));
}

function reconstructPath(cameFrom: Map<string, string>, start: Position, end: Position): Position[] {
  const path: Position[] = [end];
  let current = posKey(end);
  const startKey = posKey(start);

  while (current !== startKey) {
    const previous = cameFrom.get(current);
    if (!previous) {
      return [];
    }
    const [x, y] = previous.split(',').map(Number);
    path.push({ x, y });
    current = previous;
  }

  return path.reverse();
}

function getUnitAt(unitsById: Map<string, Unit>, occupantId: string | null): Unit | null {
  if (!occupantId) {
    return null;
  }
  return unitsById.get(occupantId) ?? null;
}

function findMoverUnit(map: GridMap, start: Position, units: Unit[]): Unit | null {
  const tile = getTile(map, start);
  if (tile?.occupantId) {
    const byOccupant = units.find((unit) => unit.id === tile.occupantId);
    if (byOccupant) {
      return byOccupant;
    }
  }

  return (
    units.find(
      (unit) =>
        unit.isAlive &&
        unit.position !== null &&
        unit.position.x === start.x &&
        unit.position.y === start.y,
    ) ?? null
  );
}

function isEnemyUnit(mover: Unit | null, target: Unit | null): boolean {
  if (!target) {
    return false;
  }
  if (!mover) {
    return true;
  }
  return mover.team !== target.team;
}

function isFriendlyUnit(mover: Unit | null, target: Unit | null): boolean {
  if (!target) {
    return false;
  }
  if (!mover) {
    return false;
  }
  return mover.team === target.team;
}

function buildEnemyZoneOfControl(map: GridMap, mover: Unit | null, units: Unit[]): Set<string> {
  const result = new Set<string>();
  const enemies = mover
    ? units.filter((unit) => unit.isAlive && unit.position && unit.team !== mover.team)
    : [];

  for (const enemy of enemies) {
    if (!enemy.position) {
      continue;
    }

    const adjacent = getNeighbors(map, enemy.position);
    for (const pos of adjacent) {
      result.add(posKey(pos));
    }
  }

  return result;
}

export function findPath(
  map: GridMap,
  start: Position,
  end: Position,
  movement: number,
  movementType: MovementType,
  units: Unit[],
): Position[] | null {
  if (!isInBounds(map, start) || !isInBounds(map, end) || movement < 0) {
    return null;
  }

  if (start.x === end.x && start.y === end.y) {
    return [start];
  }

  const unitsById = new Map(units.map((unit) => [unit.id, unit]));
  const mover = findMoverUnit(map, start, units);
  const endTile = getTile(map, end);
  const endUnit = getUnitAt(unitsById, endTile?.occupantId ?? null);

  if (isEnemyUnit(mover, endUnit)) {
    return null;
  }

  if (isFriendlyUnit(mover, endUnit) && (!mover || endUnit?.id !== mover.id)) {
    return null;
  }

  const startKey = posKey(start);
  const endKey = posKey(end);

  const openSet = new MinHeap();
  openSet.push({
    key: startKey,
    pos: start,
    g: 0,
    f: getDistance(start, end, map.gridType),
  });

  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>([[startKey, 0]]);
  const closed = new Set<string>();
  const zoneOfControlTiles = buildEnemyZoneOfControl(map, mover, units);

  while (openSet.size > 0) {
    const current = openSet.pop();
    if (!current) {
      break;
    }

    if (closed.has(current.key)) {
      continue;
    }
    closed.add(current.key);

    if (current.key === endKey) {
      if (current.g > movement) {
        return null;
      }
      const path = reconstructPath(cameFrom, start, end);
      return path.length > 0 ? path : null;
    }

    for (const neighbor of getNeighbors(map, current.pos)) {
      const neighborKey = posKey(neighbor);
      if (closed.has(neighborKey)) {
        continue;
      }

      const tile = getTile(map, neighbor);
      if (!tile) {
        continue;
      }

      const terrainCost = tile.terrain.movementCost[movementType];
      if (terrainCost >= 99) {
        continue;
      }

      const occupant = getUnitAt(unitsById, tile.occupantId);
      if (isEnemyUnit(mover, occupant)) {
        continue;
      }

      let additionalCost = terrainCost;
      if (zoneOfControlTiles.has(neighborKey)) {
        additionalCost += ZONE_OF_CONTROL_EXTRA_COST;
      }

      const tentativeG = current.g + additionalCost;
      if (tentativeG > movement) {
        continue;
      }

      const knownG = gScore.get(neighborKey);
      if (knownG !== undefined && tentativeG >= knownG) {
        continue;
      }

      cameFrom.set(neighborKey, current.key);
      gScore.set(neighborKey, tentativeG);

      const heuristic = getDistance(neighbor, end, map.gridType);
      openSet.push({
        key: neighborKey,
        pos: neighbor,
        g: tentativeG,
        f: tentativeG + heuristic,
      });
    }
  }

  return null;
}
