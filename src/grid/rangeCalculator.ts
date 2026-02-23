import { GridMap, GridType, MovementType, Position, Unit } from '../shared/types';

interface QueueEntry {
  pos: Position;
  cost: number;
}

class MinQueue {
  private items: QueueEntry[] = [];

  push(entry: QueueEntry): void {
    this.items.push(entry);
    this.bubbleUp(this.items.length - 1);
  }

  pop(): QueueEntry | null {
    if (this.items.length === 0) {
      return null;
    }

    const top = this.items[0];
    const last = this.items.pop();

    if (this.items.length > 0 && last) {
      this.items[0] = last;
      this.bubbleDown(0);
    }

    return top;
  }

  get size(): number {
    return this.items.length;
  }

  private bubbleUp(index: number): void {
    let i = index;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.items[parent].cost <= this.items[i].cost) {
        break;
      }
      [this.items[parent], this.items[i]] = [this.items[i], this.items[parent]];
      i = parent;
    }
  }

  private bubbleDown(index: number): void {
    let i = index;
    while (true) {
      const left = i * 2 + 1;
      const right = i * 2 + 2;
      let smallest = i;

      if (left < this.items.length && this.items[left].cost < this.items[smallest].cost) {
        smallest = left;
      }
      if (right < this.items.length && this.items[right].cost < this.items[smallest].cost) {
        smallest = right;
      }
      if (smallest === i) {
        break;
      }

      [this.items[i], this.items[smallest]] = [this.items[smallest], this.items[i]];
      i = smallest;
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
  const next: Position[] = [
    { x: pos.x, y: pos.y - 1 },
    { x: pos.x + 1, y: pos.y },
    { x: pos.x, y: pos.y + 1 },
    { x: pos.x - 1, y: pos.y },
  ];
  return next.filter((candidate) => isInBounds(map, candidate));
}

function getHexNeighbors(map: GridMap, pos: Position): Position[] {
  const odd = pos.y % 2 === 1;
  const deltas = odd
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
        unit.isAlive && unit.position !== null && unit.position.x === start.x && unit.position.y === start.y,
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
  if (!target || !mover) {
    return false;
  }
  return mover.team === target.team;
}

function setToPositionArray(map: GridMap, set: Set<string>): Position[] {
  const positions: Position[] = [];
  for (let y = 0; y < map.height; y += 1) {
    for (let x = 0; x < map.width; x += 1) {
      if (set.has(`${x},${y}`)) {
        positions.push({ x, y });
      }
    }
  }
  return positions;
}

export function getMovementRange(
  map: GridMap,
  start: Position,
  movement: number,
  movementType: MovementType,
  units: Unit[],
): Position[] {
  if (!isInBounds(map, start) || movement < 0) {
    return [];
  }

  const mover = findMoverUnit(map, start, units);
  const unitById = new Map(units.map((unit) => [unit.id, unit]));
  const bestCost = new Map<string, number>([[posKey(start), 0]]);
  const reachable = new Set<string>([posKey(start)]);
  const queue = new MinQueue();
  queue.push({ pos: start, cost: 0 });

  while (queue.size > 0) {
    const current = queue.pop();
    if (!current) {
      break;
    }

    const currentKey = posKey(current.pos);
    const knownCost = bestCost.get(currentKey);
    if (knownCost === undefined || current.cost > knownCost) {
      continue;
    }

    for (const neighbor of getNeighbors(map, current.pos)) {
      const tile = getTile(map, neighbor);
      if (!tile) {
        continue;
      }

      const terrainCost = tile.terrain.movementCost[movementType];
      if (terrainCost >= 99) {
        continue;
      }

      const occupantUnit = tile.occupantId ? unitById.get(tile.occupantId) ?? null : null;
      if (isEnemyUnit(mover, occupantUnit)) {
        continue;
      }

      const nextCost = current.cost + terrainCost;
      if (nextCost > movement) {
        continue;
      }

      const neighborKey = posKey(neighbor);
      const best = bestCost.get(neighborKey);
      if (best !== undefined && nextCost >= best) {
        continue;
      }

      bestCost.set(neighborKey, nextCost);
      queue.push({ pos: neighbor, cost: nextCost });

      const friendly = isFriendlyUnit(mover, occupantUnit);
      const isCurrentUnitTile = mover?.id === occupantUnit?.id;
      if (!friendly || isCurrentUnitTile) {
        reachable.add(neighborKey);
      }
    }
  }

  return setToPositionArray(map, reachable);
}

export function getAttackRange(
  map: GridMap,
  positions: Position[],
  minRange: number,
  maxRange: number,
): Position[] {
  if (minRange < 0 || maxRange < minRange) {
    return [];
  }

  const movementSet = new Set<string>(positions.map((pos) => posKey(pos)));
  const attackSet = new Set<string>();

  for (const origin of positions) {
    for (let y = 0; y < map.height; y += 1) {
      for (let x = 0; x < map.width; x += 1) {
        const target = { x, y };
        const dist = getDistance(origin, target, map.gridType);

        if (dist < minRange || dist > maxRange) {
          continue;
        }

        const key = posKey(target);
        if (movementSet.has(key)) {
          continue;
        }

        attackSet.add(key);
      }
    }
  }

  return setToPositionArray(map, attackSet);
}

export function calculateDangerZone(map: GridMap, enemies: Unit[]): Position[] {
  const danger = new Set<string>();

  for (const enemy of enemies) {
    if (!enemy.isAlive || !enemy.position) {
      continue;
    }

    const moveRange = getMovementRange(
      map,
      enemy.position,
      enemy.currentStats.movement,
      enemy.movementType,
      enemies,
    );

    const attackRange = getAttackRange(map, moveRange, 1, 2);

    for (const pos of moveRange) {
      danger.add(posKey(pos));
    }
    for (const pos of attackRange) {
      danger.add(posKey(pos));
    }
  }

  return setToPositionArray(map, danger);
}
