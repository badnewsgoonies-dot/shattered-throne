import { describe, it, expect } from 'vitest';
import { createInitialCombatState, transitionState } from '../combatStateMachine';
import { CombatStateType, TurnPhase } from '../../shared/types';

describe('combatStateMachine', () => {
  describe('initial state', () => {
    it('starts in Deploy state', () => {
      const state = createInitialCombatState();
      expect(state.stateType).toBe(CombatStateType.Deploy);
    });

    it('starts in Player phase', () => {
      const state = createInitialCombatState();
      expect(state.phase).toBe(TurnPhase.Player);
    });

    it('starts at turn 1', () => {
      const state = createInitialCombatState();
      expect(state.turnNumber).toBe(1);
    });

    it('starts with no selected unit', () => {
      const state = createInitialCombatState();
      expect(state.selectedUnitId).toBeNull();
    });

    it('starts with empty undo stack', () => {
      const state = createInitialCombatState();
      expect(state.undoStack).toEqual([]);
    });
  });

  describe('Deploy → UnitSelect', () => {
    it('transitions on confirmDeploy', () => {
      const state = createInitialCombatState();
      const next = transitionState(state, 'confirmDeploy');
      expect(next.stateType).toBe(CombatStateType.UnitSelect);
    });

    it('ignores invalid actions', () => {
      const state = createInitialCombatState();
      const next = transitionState(state, 'selectUnit', { unitId: 'u1' });
      expect(next.stateType).toBe(CombatStateType.Deploy);
    });
  });

  describe('UnitSelect → MoveSelect', () => {
    it('transitions on selectUnit with unitId', () => {
      let state = createInitialCombatState();
      state = transitionState(state, 'confirmDeploy');
      const next = transitionState(state, 'selectUnit', { unitId: 'unit-1' });
      expect(next.stateType).toBe(CombatStateType.MoveSelect);
      expect(next.selectedUnitId).toBe('unit-1');
    });

    it('does not transition without unitId', () => {
      let state = createInitialCombatState();
      state = transitionState(state, 'confirmDeploy');
      const next = transitionState(state, 'selectUnit');
      expect(next.stateType).toBe(CombatStateType.UnitSelect);
    });
  });

  describe('MoveSelect → ActionSelect', () => {
    it('transitions on selectMove', () => {
      let state = createInitialCombatState();
      state = transitionState(state, 'confirmDeploy');
      state = transitionState(state, 'selectUnit', { unitId: 'u1' });
      const next = transitionState(state, 'selectMove', { position: { x: 3, y: 4 } });
      expect(next.stateType).toBe(CombatStateType.ActionSelect);
    });

    it('adds undo action to stack', () => {
      let state = createInitialCombatState();
      state = transitionState(state, 'confirmDeploy');
      state = transitionState(state, 'selectUnit', { unitId: 'u1' });
      const undoAction = {
        unitId: 'u1',
        previousPosition: { x: 0, y: 0 },
        previousHasMoved: false,
      };
      const next = transitionState(state, 'selectMove', {
        position: { x: 3, y: 4 },
        undoAction,
      });
      expect(next.undoStack.length).toBe(1);
      expect(next.undoStack[0].unitId).toBe('u1');
    });
  });

  describe('ActionSelect transitions', () => {
    function getActionSelectState() {
      let state = createInitialCombatState();
      state = transitionState(state, 'confirmDeploy');
      state = transitionState(state, 'selectUnit', { unitId: 'u1' });
      state = transitionState(state, 'selectMove', {
        position: { x: 3, y: 4 },
        undoAction: {
          unitId: 'u1',
          previousPosition: { x: 0, y: 0 },
          previousHasMoved: false,
        },
      });
      return state;
    }

    it('Attack → TargetSelect', () => {
      const state = getActionSelectState();
      const next = transitionState(state, 'selectAttack');
      expect(next.stateType).toBe(CombatStateType.TargetSelect);
    });

    it('Skill → TargetSelect', () => {
      const state = getActionSelectState();
      const next = transitionState(state, 'selectSkill');
      expect(next.stateType).toBe(CombatStateType.TargetSelect);
    });

    it('Wait → UnitSelect', () => {
      const state = getActionSelectState();
      const next = transitionState(state, 'selectWait');
      expect(next.stateType).toBe(CombatStateType.UnitSelect);
      expect(next.selectedUnitId).toBeNull();
    });

    it('Wait clears undo stack', () => {
      const state = getActionSelectState();
      const next = transitionState(state, 'selectWait');
      expect(next.undoStack).toEqual([]);
    });

    it('Undo → UnitSelect', () => {
      const state = getActionSelectState();
      const next = transitionState(state, 'undo');
      expect(next.stateType).toBe(CombatStateType.UnitSelect);
      expect(next.selectedUnitId).toBeNull();
    });

    it('Undo pops from undo stack', () => {
      const state = getActionSelectState();
      expect(state.undoStack.length).toBe(1);
      const next = transitionState(state, 'undo');
      expect(next.undoStack.length).toBe(0);
    });
  });

  describe('TargetSelect → Animation', () => {
    it('transitions on confirmTarget', () => {
      let state = createInitialCombatState();
      state = transitionState(state, 'confirmDeploy');
      state = transitionState(state, 'selectUnit', { unitId: 'u1' });
      state = transitionState(state, 'selectMove', { position: { x: 1, y: 1 } });
      state = transitionState(state, 'selectAttack');
      const next = transitionState(state, 'confirmTarget');
      expect(next.stateType).toBe(CombatStateType.Animation);
    });
  });

  describe('Animation transitions', () => {
    function getAnimationState() {
      let state = createInitialCombatState();
      state = transitionState(state, 'confirmDeploy');
      state = transitionState(state, 'selectUnit', { unitId: 'u1' });
      state = transitionState(state, 'selectMove', { position: { x: 1, y: 1 } });
      state = transitionState(state, 'selectAttack');
      state = transitionState(state, 'confirmTarget');
      return state;
    }

    it('animationComplete → UnitSelect', () => {
      const state = getAnimationState();
      const next = transitionState(state, 'animationComplete');
      expect(next.stateType).toBe(CombatStateType.UnitSelect);
      expect(next.selectedUnitId).toBeNull();
    });

    it('victory → Victory', () => {
      const state = getAnimationState();
      const next = transitionState(state, 'victory');
      expect(next.stateType).toBe(CombatStateType.Victory);
    });

    it('defeat → Defeat', () => {
      const state = getAnimationState();
      const next = transitionState(state, 'defeat');
      expect(next.stateType).toBe(CombatStateType.Defeat);
    });
  });

  describe('UnitSelect → EnemyTurn', () => {
    it('transitions on endPlayerTurn', () => {
      let state = createInitialCombatState();
      state = transitionState(state, 'confirmDeploy');
      const next = transitionState(state, 'endPlayerTurn');
      expect(next.stateType).toBe(CombatStateType.EnemyTurn);
      expect(next.phase).toBe(TurnPhase.Enemy);
    });
  });

  describe('EnemyTurn transitions', () => {
    function getEnemyTurnState() {
      let state = createInitialCombatState();
      state = transitionState(state, 'confirmDeploy');
      state = transitionState(state, 'endPlayerTurn');
      return state;
    }

    it('enemyTurnComplete → UnitSelect', () => {
      const state = getEnemyTurnState();
      const next = transitionState(state, 'enemyTurnComplete');
      expect(next.stateType).toBe(CombatStateType.UnitSelect);
      expect(next.phase).toBe(TurnPhase.Player);
    });

    it('increments turn number after enemy turn', () => {
      const state = getEnemyTurnState();
      expect(state.turnNumber).toBe(1);
      const next = transitionState(state, 'enemyTurnComplete');
      expect(next.turnNumber).toBe(2);
    });

    it('victory during enemy turn', () => {
      const state = getEnemyTurnState();
      const next = transitionState(state, 'victory');
      expect(next.stateType).toBe(CombatStateType.Victory);
    });

    it('defeat during enemy turn', () => {
      const state = getEnemyTurnState();
      const next = transitionState(state, 'defeat');
      expect(next.stateType).toBe(CombatStateType.Defeat);
    });
  });

  describe('terminal states', () => {
    it('Victory is terminal', () => {
      let state = createInitialCombatState();
      state = transitionState(state, 'confirmDeploy');
      state = transitionState(state, 'selectUnit', { unitId: 'u1' });
      state = transitionState(state, 'selectMove', { position: { x: 1, y: 1 } });
      state = transitionState(state, 'selectAttack');
      state = transitionState(state, 'confirmTarget');
      state = transitionState(state, 'victory');
      expect(state.stateType).toBe(CombatStateType.Victory);
      // Any action should keep it in Victory
      const next = transitionState(state, 'animationComplete');
      expect(next.stateType).toBe(CombatStateType.Victory);
    });

    it('Defeat is terminal', () => {
      let state = createInitialCombatState();
      state = transitionState(state, 'confirmDeploy');
      state = transitionState(state, 'selectUnit', { unitId: 'u1' });
      state = transitionState(state, 'selectMove', { position: { x: 1, y: 1 } });
      state = transitionState(state, 'selectAttack');
      state = transitionState(state, 'confirmTarget');
      state = transitionState(state, 'defeat');
      expect(state.stateType).toBe(CombatStateType.Defeat);
      const next = transitionState(state, 'animationComplete');
      expect(next.stateType).toBe(CombatStateType.Defeat);
    });
  });

  describe('full flow', () => {
    it('complete player turn cycle', () => {
      let state = createInitialCombatState();
      // Deploy
      state = transitionState(state, 'confirmDeploy');
      expect(state.stateType).toBe(CombatStateType.UnitSelect);
      // Select unit
      state = transitionState(state, 'selectUnit', { unitId: 'u1' });
      expect(state.stateType).toBe(CombatStateType.MoveSelect);
      // Move
      state = transitionState(state, 'selectMove', { position: { x: 2, y: 3 } });
      expect(state.stateType).toBe(CombatStateType.ActionSelect);
      // Attack
      state = transitionState(state, 'selectAttack');
      expect(state.stateType).toBe(CombatStateType.TargetSelect);
      // Confirm target
      state = transitionState(state, 'confirmTarget');
      expect(state.stateType).toBe(CombatStateType.Animation);
      // Animation done
      state = transitionState(state, 'animationComplete');
      expect(state.stateType).toBe(CombatStateType.UnitSelect);
      // End player turn
      state = transitionState(state, 'endPlayerTurn');
      expect(state.stateType).toBe(CombatStateType.EnemyTurn);
      // Enemy done
      state = transitionState(state, 'enemyTurnComplete');
      expect(state.stateType).toBe(CombatStateType.UnitSelect);
      expect(state.turnNumber).toBe(2);
    });
  });
});
