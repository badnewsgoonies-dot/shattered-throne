import {
  CombatState,
  CombatStateType,
  TurnPhase,
  UndoAction,
  Position,
} from '../shared/types';

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

export function transitionState(
  state: CombatState,
  action: string,
  payload?: {
    unitId?: string;
    position?: Position;
    undoAction?: UndoAction;
  },
): CombatState {
  const next = { ...state };

  switch (state.stateType) {
    case CombatStateType.Deploy:
      if (action === 'confirmDeploy') {
        next.stateType = CombatStateType.UnitSelect;
      }
      break;

    case CombatStateType.UnitSelect:
      if (action === 'selectUnit' && payload?.unitId) {
        next.stateType = CombatStateType.MoveSelect;
        next.selectedUnitId = payload.unitId;
      } else if (action === 'endPlayerTurn') {
        next.stateType = CombatStateType.EnemyTurn;
        next.phase = TurnPhase.Enemy;
        next.selectedUnitId = null;
      }
      break;

    case CombatStateType.MoveSelect:
      if (action === 'selectMove' && payload?.position) {
        next.stateType = CombatStateType.ActionSelect;
        if (payload.undoAction) {
          next.undoStack = [...state.undoStack, payload.undoAction];
        }
      }
      break;

    case CombatStateType.ActionSelect:
      if (action === 'selectAttack' || action === 'selectSkill') {
        next.stateType = CombatStateType.TargetSelect;
      } else if (action === 'selectWait') {
        next.stateType = CombatStateType.UnitSelect;
        next.selectedUnitId = null;
        next.undoStack = [];
      } else if (action === 'undo') {
        // Restore unit position from undo stack
        const newStack = [...state.undoStack];
        newStack.pop();
        next.undoStack = newStack;
        next.stateType = CombatStateType.UnitSelect;
        next.selectedUnitId = null;
      }
      break;

    case CombatStateType.TargetSelect:
      if (action === 'confirmTarget') {
        next.stateType = CombatStateType.Animation;
      }
      break;

    case CombatStateType.Animation:
      if (action === 'animationComplete') {
        next.stateType = CombatStateType.UnitSelect;
        next.selectedUnitId = null;
      } else if (action === 'victory') {
        next.stateType = CombatStateType.Victory;
      } else if (action === 'defeat') {
        next.stateType = CombatStateType.Defeat;
      }
      break;

    case CombatStateType.EnemyTurn:
      if (action === 'enemyTurnComplete') {
        next.stateType = CombatStateType.UnitSelect;
        next.phase = TurnPhase.Player;
        next.turnNumber = state.turnNumber + 1;
      } else if (action === 'victory') {
        next.stateType = CombatStateType.Victory;
      } else if (action === 'defeat') {
        next.stateType = CombatStateType.Defeat;
      }
      break;

    // Victory and Defeat are terminal states
    case CombatStateType.Victory:
    case CombatStateType.Defeat:
      break;
  }

  return next;
}
