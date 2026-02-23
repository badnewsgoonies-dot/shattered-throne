import { CombatState, CombatStateType, TurnPhase } from '../shared/types';

export function transitionState(state: CombatState, event: string): CombatState {
  switch (state.stateType) {
    case CombatStateType.Deploy:
      if (event === 'confirm_deploy') {
        return {
          ...state,
          phase: TurnPhase.Player,
          stateType: CombatStateType.UnitSelect,
        };
      }
      return state;

    case CombatStateType.UnitSelect:
      if (event === 'unit_selected') {
        return {
          ...state,
          stateType: CombatStateType.MoveSelect,
        };
      }

      if (event === 'all_units_acted') {
        return {
          ...state,
          phase: TurnPhase.Enemy,
          stateType: CombatStateType.EnemyTurn,
          selectedUnitId: null,
          movementRange: [],
          attackRange: [],
        };
      }

      return state;

    case CombatStateType.MoveSelect:
      if (event === 'move_confirmed') {
        return {
          ...state,
          stateType: CombatStateType.ActionSelect,
        };
      }
      return state;

    case CombatStateType.ActionSelect:
      if (event === 'attack_selected' || event === 'skill_selected') {
        return {
          ...state,
          stateType: CombatStateType.TargetSelect,
        };
      }

      if (event === 'wait_selected') {
        return {
          ...state,
          stateType: CombatStateType.UnitSelect,
          selectedUnitId: null,
          movementRange: [],
          attackRange: [],
        };
      }

      return state;

    case CombatStateType.TargetSelect:
      if (event === 'target_confirmed') {
        return {
          ...state,
          stateType: CombatStateType.Animation,
        };
      }
      return state;

    case CombatStateType.Animation:
      if (event === 'animation_complete') {
        return {
          ...state,
          stateType: CombatStateType.UnitSelect,
          selectedUnitId: null,
          movementRange: [],
          attackRange: [],
        };
      }

      if (event === 'victory') {
        return {
          ...state,
          stateType: CombatStateType.Victory,
        };
      }

      if (event === 'defeat') {
        return {
          ...state,
          stateType: CombatStateType.Defeat,
        };
      }

      return state;

    case CombatStateType.EnemyTurn:
      if (event === 'enemy_turn_complete') {
        return {
          ...state,
          phase: TurnPhase.Player,
          stateType: CombatStateType.UnitSelect,
          turnNumber: state.turnNumber + 1,
          selectedUnitId: null,
          movementRange: [],
          attackRange: [],
        };
      }
      return state;

    default:
      return state;
  }
}

export function undoMove(state: CombatState): CombatState {
  if (state.undoStack.length === 0) {
    return state;
  }

  const previousUndo = state.undoStack[state.undoStack.length - 1];

  return {
    ...state,
    stateType: CombatStateType.UnitSelect,
    selectedUnitId: previousUndo.unitId,
    cursorPosition: { ...previousUndo.previousPosition },
    movementRange: [],
    attackRange: [],
    undoStack: state.undoStack.slice(0, -1),
  };
}

export function createInitialCombatState(): CombatState {
  return {
    phase: TurnPhase.Player,
    stateType: CombatStateType.Deploy,
    turnNumber: 1,
    selectedUnitId: null,
    movementRange: [],
    attackRange: [],
    dangerZone: [],
    cursorPosition: { x: 0, y: 0 },
    combatLog: [],
    undoStack: [],
  };
}
