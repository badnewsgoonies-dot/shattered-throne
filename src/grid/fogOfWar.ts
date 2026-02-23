import { GridMap, GridType, Position, Unit } from '../shared/types';
import { getLineOfSight } from './lineOfSight';

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

function cloneMapWithFog(map: GridMap, visible: Set<string>): GridMap {
  return {
    ...map,
    tiles: map.tiles.map((row) =>
      row.map((tile) => ({
        ...tile,
        position: { ...tile.position },
        terrain: {
          ...tile.terrain,
          movementCost: { ...tile.terrain.movementCost },
          passable: { ...tile.terrain.passable },
        },
        fogRevealed: visible.has(`${tile.position.x},${tile.position.y}`),
      })),
    ),
    deploymentZones: map.deploymentZones.map((zone) => ({ ...zone })),
  };
}

export function applyFogOfWar(
  map: GridMap,
  team: 'player' | 'enemy' | 'ally',
  units: Unit[],
): GridMap {
  const visible = new Set<string>();
  const teamUnits = units.filter(
    (unit) => unit.isAlive && unit.team === team && unit.position !== null,
  );

  for (const unit of teamUnits) {
    if (!unit.position) {
      continue;
    }

    const radius = unit.currentStats.movement + 2;

    for (let y = 0; y < map.height; y += 1) {
      for (let x = 0; x < map.width; x += 1) {
        const tilePos = { x, y };
        const distance = getDistance(unit.position, tilePos, map.gridType);

        if (distance > radius) {
          continue;
        }

        if (getLineOfSight(map, unit.position, tilePos)) {
          visible.add(`${x},${y}`);
        }
      }
    }
  }

  return cloneMapWithFog(map, visible);
}
