import {
  AIBehavior,
  CombatAction,
  GridMap,
  IGridEngine,
  Position,
  TerrainType,
  Unit,
  UnitClassName,
} from '../shared/types';
import {
  estimateDamage,
  isKillable,
} from './aiThreatAssessment';

const ATTACK_MIN_RANGE = 1;
const ATTACK_MAX_RANGE = 1;

const HEALER_CLASSES = new Set<UnitClassName>([
  UnitClassName.Cleric,
  UnitClassName.Bishop,
  UnitClassName.Valkyrie,
]);

function positionKey(pos: Position): string {
  return `${pos.x},${pos.y}`;
}

function samePosition(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

function isPositionInList(pos: Position, list: Position[]): boolean {
  const key = positionKey(pos);
  return list.some((candidate) => positionKey(candidate) === key);
}

function uniquePositions(positions: Position[]): Position[] {
  const seen = new Set<string>();
  const result: Position[] = [];

  for (const pos of positions) {
    const key = positionKey(pos);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(pos);
    }
  }

  return result;
}

function getDistance(gridEngine: IGridEngine, map: GridMap, from: Position, to: Position): number {
  return gridEngine.getDistance(from, to, map.gridType);
}

function getMovePositions(unit: Unit, allies: Unit[], enemies: Unit[], map: GridMap, gridEngine: IGridEngine, movementOverride?: number): Position[] {
  if (!unit.position) {
    return [];
  }

  const movement = movementOverride ?? unit.currentStats.movement;
  const allUnits = [unit, ...allies, ...enemies];
  const movementRange = gridEngine.getMovementRange(map, unit.position, movement, unit.movementType, allUnits);

  return uniquePositions([unit.position, ...movementRange]);
}

function getAlivePositionedUnits(units: Unit[]): Array<Unit & { position: Position }> {
  return units.filter((unit): unit is Unit & { position: Position } => unit.isAlive && unit.position !== null);
}

function pickNearestPosition(candidates: Position[], target: Position, map: GridMap, gridEngine: IGridEngine): Position | null {
  if (candidates.length === 0) {
    return null;
  }

  return candidates.reduce((best, current) => {
    const bestDistance = getDistance(gridEngine, map, best, target);
    const currentDistance = getDistance(gridEngine, map, current, target);

    return currentDistance < bestDistance ? current : best;
  });
}

function pickAttackPositionForTarget(unit: Unit, target: Unit & { position: Position }, movePositions: Position[], map: GridMap, gridEngine: IGridEngine): Position | null {
  if (!unit.position) {
    return null;
  }
  const unitPosition = unit.position;

  const attackableMovePositions = movePositions.filter((movePos) => {
    const fromMoveRange = gridEngine.getAttackRange(map, [movePos], ATTACK_MIN_RANGE, ATTACK_MAX_RANGE);
    return isPositionInList(target.position, fromMoveRange);
  });

  if (attackableMovePositions.length === 0) {
    return null;
  }

  return attackableMovePositions.reduce((best, current) => {
    const bestDistanceToTarget = getDistance(gridEngine, map, best, target.position);
    const currentDistanceToTarget = getDistance(gridEngine, map, current, target.position);

    if (currentDistanceToTarget < bestDistanceToTarget) {
      return current;
    }

    if (currentDistanceToTarget > bestDistanceToTarget) {
      return best;
    }

    const bestDistanceFromUnit = getDistance(gridEngine, map, unitPosition, best);
    const currentDistanceFromUnit = getDistance(gridEngine, map, unitPosition, current);

    return currentDistanceFromUnit < bestDistanceFromUnit ? current : best;
  });
}

function hasHealingCapability(unit: Unit): boolean {
  if (HEALER_CLASSES.has(unit.className)) {
    return true;
  }

  return unit.skills.some((skillId) => /heal|cure|recover|mend|restore/i.test(skillId));
}

function getPreferredHealingSkill(unit: Unit): string | undefined {
  return unit.skills.find((skillId) => /heal|cure|recover|mend|restore/i.test(skillId));
}

function calculateAggressiveAction(unit: Unit, allies: Unit[], enemies: Unit[], map: GridMap, gridEngine: IGridEngine): CombatAction {
  if (!unit.position || !unit.isAlive) {
    return {
      type: 'wait',
      unitId: unit.id,
    };
  }

  const aliveEnemies = getAlivePositionedUnits(enemies);
  const movePositions = getMovePositions(unit, allies, enemies, map, gridEngine);

  if (aliveEnemies.length === 0) {
    return {
      type: 'wait',
      unitId: unit.id,
      targetPosition: unit.position,
    };
  }

  const attackableTiles = gridEngine.getAttackRange(map, movePositions, ATTACK_MIN_RANGE, ATTACK_MAX_RANGE);
  const reachableTargets = aliveEnemies.filter((enemy) => isPositionInList(enemy.position, attackableTiles));

  if (reachableTargets.length > 0) {
    const bestTarget = reachableTargets.reduce((best, current) => {
      const bestScore = estimateDamage(unit, best) * (isKillable(unit, best) ? 2 : 1);
      const currentScore = estimateDamage(unit, current) * (isKillable(unit, current) ? 2 : 1);

      if (currentScore > bestScore) {
        return current;
      }

      if (currentScore < bestScore) {
        return best;
      }

      const bestDistance = getDistance(gridEngine, map, unit.position as Position, best.position);
      const currentDistance = getDistance(gridEngine, map, unit.position as Position, current.position);
      return currentDistance < bestDistance ? current : best;
    });

    const targetPosition = pickAttackPositionForTarget(unit, bestTarget, movePositions, map, gridEngine) ?? unit.position;

    return {
      type: 'attack',
      unitId: unit.id,
      targetUnitId: bestTarget.id,
      targetPosition,
    };
  }

  const nearestEnemy = aliveEnemies.reduce((best, current) => {
    const bestDistance = getDistance(gridEngine, map, unit.position as Position, best.position);
    const currentDistance = getDistance(gridEngine, map, unit.position as Position, current.position);

    return currentDistance < bestDistance ? current : best;
  });

  const moveTarget = pickNearestPosition(movePositions, nearestEnemy.position, map, gridEngine) ?? unit.position;

  return {
    type: 'wait',
    unitId: unit.id,
    targetPosition: moveTarget,
  };
}

function terrainDefenseScore(map: GridMap, gridEngine: IGridEngine, position: Position): number {
  const tile = gridEngine.getTile(map, position);

  if (!tile) {
    return Number.NEGATIVE_INFINITY;
  }

  const base = tile.terrain.defenseBonus + tile.terrain.evasionBonus;
  const terrainBonus = tile.terrain.type === TerrainType.Fortress
    ? 5
    : tile.terrain.type === TerrainType.Forest
      ? 3
      : 0;

  return base + terrainBonus;
}

function calculateDefensiveAction(unit: Unit, allies: Unit[], enemies: Unit[], map: GridMap, gridEngine: IGridEngine): CombatAction {
  if (!unit.position || !unit.isAlive) {
    return {
      type: 'wait',
      unitId: unit.id,
    };
  }

  const aliveEnemies = getAlivePositionedUnits(enemies);
  const currentAttackRange = gridEngine.getAttackRange(map, [unit.position], ATTACK_MIN_RANGE, ATTACK_MAX_RANGE);
  const enemiesInRange = aliveEnemies.filter((enemy) => isPositionInList(enemy.position, currentAttackRange));

  if (enemiesInRange.length > 0) {
    const bestTarget = enemiesInRange.reduce((best, current) => {
      const bestThreat = estimateDamage(best, unit);
      const currentThreat = estimateDamage(current, unit);

      if (currentThreat > bestThreat) {
        return current;
      }

      if (currentThreat < bestThreat) {
        return best;
      }

      return current.currentHP < best.currentHP ? current : best;
    });

    return {
      type: 'attack',
      unitId: unit.id,
      targetUnitId: bestTarget.id,
      targetPosition: unit.position,
    };
  }

  const nearbyPositions = getMovePositions(unit, allies, enemies, map, gridEngine, 3);

  if (nearbyPositions.length === 0) {
    return {
      type: 'wait',
      unitId: unit.id,
      targetPosition: unit.position,
    };
  }

  const bestDefensivePosition = nearbyPositions.reduce((best, current) => {
    const bestScore = terrainDefenseScore(map, gridEngine, best);
    const currentScore = terrainDefenseScore(map, gridEngine, current);

    if (currentScore > bestScore) {
      return current;
    }

    if (currentScore < bestScore) {
      return best;
    }

    const bestDistance = getDistance(gridEngine, map, unit.position as Position, best);
    const currentDistance = getDistance(gridEngine, map, unit.position as Position, current);

    return currentDistance < bestDistance ? current : best;
  });

  return {
    type: 'wait',
    unitId: unit.id,
    targetPosition: bestDefensivePosition,
  };
}

function calculateSupportAction(unit: Unit, allies: Unit[], enemies: Unit[], map: GridMap, gridEngine: IGridEngine): CombatAction {
  if (!unit.position || !unit.isAlive) {
    return {
      type: 'wait',
      unitId: unit.id,
    };
  }

  const allyTargets = getAlivePositionedUnits(allies).filter((ally) => ally.id !== unit.id);
  const injuredAllies = allyTargets.filter((ally) => ally.currentHP < ally.maxHP * 0.5);

  if (injuredAllies.length > 0 && hasHealingCapability(unit)) {
    const preferredTarget = injuredAllies.reduce((best, current) => {
      const bestRatio = best.currentHP / best.maxHP;
      const currentRatio = current.currentHP / current.maxHP;

      if (currentRatio < bestRatio) {
        return current;
      }

      if (currentRatio > bestRatio) {
        return best;
      }

      const bestDistance = getDistance(gridEngine, map, unit.position as Position, best.position);
      const currentDistance = getDistance(gridEngine, map, unit.position as Position, current.position);

      return currentDistance < bestDistance ? current : best;
    });

    const movePositions = getMovePositions(unit, allies, enemies, map, gridEngine);
    const healingPositions = movePositions.filter((movePos) => {
      const healRange = gridEngine.getAttackRange(map, [movePos], ATTACK_MIN_RANGE, ATTACK_MAX_RANGE);
      return isPositionInList(preferredTarget.position, healRange);
    });

    const healingPosition = pickNearestPosition(healingPositions, preferredTarget.position, map, gridEngine)
      ?? pickNearestPosition(movePositions, preferredTarget.position, map, gridEngine)
      ?? unit.position;

    if (healingPositions.length > 0) {
      return {
        type: 'skill',
        unitId: unit.id,
        targetUnitId: preferredTarget.id,
        targetPosition: healingPosition,
        skillId: getPreferredHealingSkill(unit) ?? 'heal',
      };
    }

    return {
      type: 'wait',
      unitId: unit.id,
      targetPosition: healingPosition,
    };
  }

  if (allyTargets.length === 0) {
    return {
      type: 'wait',
      unitId: unit.id,
      targetPosition: unit.position,
    };
  }

  const movePositions = getMovePositions(unit, allies, enemies, map, gridEngine);
  const allyPositions = allyTargets.map((ally) => ally.position);
  const bestSupportPosition = movePositions.reduce((best, current) => {
    const bestAvgDistance = allyPositions.reduce((sum, allyPos) => sum + getDistance(gridEngine, map, best, allyPos), 0) / allyPositions.length;
    const currentAvgDistance = allyPositions.reduce((sum, allyPos) => sum + getDistance(gridEngine, map, current, allyPos), 0) / allyPositions.length;

    return currentAvgDistance < bestAvgDistance ? current : best;
  });

  return {
    type: 'wait',
    unitId: unit.id,
    targetPosition: bestSupportPosition,
  };
}

function isNotFrontPosition(enemyPosition: Position, candidate: Position): boolean {
  return !(candidate.x === enemyPosition.x && candidate.y === enemyPosition.y - 1);
}

function calculateFlankerAction(unit: Unit, allies: Unit[], enemies: Unit[], map: GridMap, gridEngine: IGridEngine): CombatAction {
  if (!unit.position || !unit.isAlive) {
    return {
      type: 'wait',
      unitId: unit.id,
    };
  }

  const aliveEnemies = getAlivePositionedUnits(enemies);

  if (aliveEnemies.length === 0) {
    return calculateAggressiveAction(unit, allies, enemies, map, gridEngine);
  }

  const movePositions = getMovePositions(unit, allies, enemies, map, gridEngine);
  let bestTarget: (Unit & { position: Position }) | null = null;
  let bestPosition: Position | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const enemy of aliveEnemies) {
    const adjacent = gridEngine.getAdjacentPositions(map, enemy.position);
    const flankPositions = adjacent.filter(
      (candidate) => isNotFrontPosition(enemy.position, candidate) && isPositionInList(candidate, movePositions),
    );

    for (const flankPosition of flankPositions) {
      const tile = gridEngine.getTile(map, flankPosition);
      const terrainBonus = tile?.terrain.type === TerrainType.Fortress
        ? 6
        : tile?.terrain.type === TerrainType.Forest
          ? 4
          : 0;
      const score = (100 - enemy.currentStats.defense) + terrainBonus;

      if (score > bestScore) {
        bestScore = score;
        bestTarget = enemy;
        bestPosition = flankPosition;
      }
    }
  }

  if (bestTarget && bestPosition) {
    return {
      type: 'attack',
      unitId: unit.id,
      targetUnitId: bestTarget.id,
      targetPosition: bestPosition,
    };
  }

  return calculateAggressiveAction(unit, allies, enemies, map, gridEngine);
}

function calculateBossAction(unit: Unit, allies: Unit[], enemies: Unit[], map: GridMap, gridEngine: IGridEngine): CombatAction {
  if (!unit.position || !unit.isAlive) {
    return {
      type: 'wait',
      unitId: unit.id,
    };
  }

  if (unit.currentHP < unit.maxHP * 0.25) {
    return calculateAggressiveAction(unit, allies, enemies, map, gridEngine);
  }

  const enemiesInRange = getAlivePositionedUnits(enemies).filter((enemy) => {
    const attackRange = gridEngine.getAttackRange(map, [unit.position as Position], ATTACK_MIN_RANGE, ATTACK_MAX_RANGE);
    return isPositionInList(enemy.position, attackRange);
  });

  if (enemiesInRange.length > 0) {
    const bestTarget = enemiesInRange.reduce((best, current) => {
      const bestDamage = estimateDamage(unit, best);
      const currentDamage = estimateDamage(unit, current);
      return currentDamage > bestDamage ? current : best;
    });

    return {
      type: 'attack',
      unitId: unit.id,
      targetUnitId: bestTarget.id,
      targetPosition: unit.position,
    };
  }

  return {
    type: 'wait',
    unitId: unit.id,
    targetPosition: unit.position,
  };
}

export function calculateAIAction(
  unit: Unit,
  allies: Unit[],
  enemies: Unit[],
  map: GridMap,
  gridEngine: IGridEngine,
): CombatAction {
  switch (unit.aiBehavior) {
    case AIBehavior.Defensive:
      return calculateDefensiveAction(unit, allies, enemies, map, gridEngine);
    case AIBehavior.Support:
      return calculateSupportAction(unit, allies, enemies, map, gridEngine);
    case AIBehavior.Flanker:
      return calculateFlankerAction(unit, allies, enemies, map, gridEngine);
    case AIBehavior.Boss:
      return calculateBossAction(unit, allies, enemies, map, gridEngine);
    case AIBehavior.Aggressive:
    default:
      return calculateAggressiveAction(unit, allies, enemies, map, gridEngine);
  }
}

export const __testOnly = {
  samePosition,
};
