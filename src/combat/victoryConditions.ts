import {
  DefeatCondition,
  DefeatConditionDef,
  Unit,
  VictoryCondition,
  VictoryConditionDef,
} from '../shared/types';

function isDeadUnit(units: Unit[], unitId: string): boolean {
  const unit = units.find((candidate) => candidate.id === unitId);
  return !!unit && !unit.isAlive;
}

function isSamePosition(a: { x: number; y: number }, b: { x: number; y: number }): boolean {
  return a.x === b.x && a.y === b.y;
}

export function checkVictoryConditions(
  conditions: VictoryConditionDef[],
  units: Unit[],
  turnNumber: number,
): boolean {
  return conditions.some((condition) => {
    switch (condition.type) {
      case VictoryCondition.Rout:
        return units
          .filter((unit) => unit.team === 'enemy')
          .every((enemy) => !enemy.isAlive);

      case VictoryCondition.BossKill:
        return condition.targetUnitId ? isDeadUnit(units, condition.targetUnitId) : false;

      case VictoryCondition.Survive:
        return condition.surviveTurns !== undefined && turnNumber >= condition.surviveTurns;

      case VictoryCondition.ReachLocation:
        return condition.targetPosition !== undefined
          && units.some(
            (unit) => unit.team === 'player'
              && unit.isAlive
              && unit.position !== null
              && isSamePosition(unit.position, condition.targetPosition!),
          );

      case VictoryCondition.ProtectTarget:
        if (!condition.targetUnitId) {
          return true;
        }
        return !isDeadUnit(units, condition.targetUnitId);

      default:
        return false;
    }
  });
}

export function checkDefeatConditions(
  conditions: DefeatConditionDef[],
  units: Unit[],
  turnNumber: number,
): boolean {
  return conditions.some((condition) => {
    switch (condition.type) {
      case DefeatCondition.LordDies:
        return condition.protectedUnitId ? isDeadUnit(units, condition.protectedUnitId) : false;

      case DefeatCondition.AllUnitsDie: {
        const playerUnits = units.filter((unit) => unit.team === 'player');
        return playerUnits.length > 0 && playerUnits.every((unit) => !unit.isAlive);
      }

      case DefeatCondition.ProtectedUnitDies:
        return condition.protectedUnitId ? isDeadUnit(units, condition.protectedUnitId) : false;

      case DefeatCondition.TimerExpires:
        return condition.turnLimit !== undefined && turnNumber > condition.turnLimit;

      default:
        return false;
    }
  });
}
