import { describe, expect, it } from 'vitest';
import { CombatStateType, TurnPhase } from '../../shared/types';
import { createInitialCombatState, transitionState, undoMove } from '../combatStateMachine';

describe('combatStateMachine.createInitialCombatState', () => {
  it('creates deploy state for player turn with defaults', () => {
    const state = createInitialCombatState();

    expect(state).toEqual({
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
    });
  });
});

describe('combatStateMachine.transitionState', () => {
  it('transitions deploy to unit select on confirm_deploy', () => {
    const state = transitionState(createInitialCombatState(), 'confirm_deploy');
    expect(state.stateType).toBe(CombatStateType.UnitSelect);
  });

  it('transitions unit select to move select on unit_selected', () => {
    const state = transitionState({ ...createInitialCombatState(), stateType: CombatStateType.UnitSelect }, 'unit_selected');
    expect(state.stateType).toBe(CombatStateType.MoveSelect);
  });

  it('transitions move select to action select on move_confirmed', () => {
    const state = transitionState({ ...createInitialCombatState(), stateType: CombatStateType.MoveSelect }, 'move_confirmed');
    expect(state.stateType).toBe(CombatStateType.ActionSelect);
  });

  it.each(['attack_selected', 'skill_selected'])('transitions action select to target select on %s', (eventName) => {
    const state = transitionState({ ...createInitialCombatState(), stateType: CombatStateType.ActionSelect }, eventName);
    expect(state.stateType).toBe(CombatStateType.TargetSelect);
  });

  it('transitions action select to unit select on wait_selected and clears selection', () => {
    const state = transitionState(
      {
        ...createInitialCombatState(),
        stateType: CombatStateType.ActionSelect,
        selectedUnitId: 'unit_1',
        movementRange: [{ x: 1, y: 1 }],
        attackRange: [{ x: 2, y: 2 }],
      },
      'wait_selected',
    );

    expect(state.stateType).toBe(CombatStateType.UnitSelect);
    expect(state.selectedUnitId).toBeNull();
    expect(state.movementRange).toEqual([]);
    expect(state.attackRange).toEqual([]);
  });

  it('transitions target select to animation on target_confirmed', () => {
    const state = transitionState({ ...createInitialCombatState(), stateType: CombatStateType.TargetSelect }, 'target_confirmed');
    expect(state.stateType).toBe(CombatStateType.Animation);
  });

  it('transitions animation to unit select on animation_complete', () => {
    const state = transitionState(
      {
        ...createInitialCombatState(),
        stateType: CombatStateType.Animation,
        selectedUnitId: 'unit_1',
        movementRange: [{ x: 1, y: 1 }],
        attackRange: [{ x: 2, y: 2 }],
      },
      'animation_complete',
    );

    expect(state.stateType).toBe(CombatStateType.UnitSelect);
    expect(state.selectedUnitId).toBeNull();
    expect(state.movementRange).toEqual([]);
    expect(state.attackRange).toEqual([]);
  });

  it('transitions animation to victory on victory event', () => {
    const state = transitionState({ ...createInitialCombatState(), stateType: CombatStateType.Animation }, 'victory');
    expect(state.stateType).toBe(CombatStateType.Victory);
  });

  it('transitions animation to defeat on defeat event', () => {
    const state = transitionState({ ...createInitialCombatState(), stateType: CombatStateType.Animation }, 'defeat');
    expect(state.stateType).toBe(CombatStateType.Defeat);
  });

  it('transitions unit select to enemy turn on all_units_acted', () => {
    const state = transitionState(
      {
        ...createInitialCombatState(),
        stateType: CombatStateType.UnitSelect,
        selectedUnitId: 'unit_1',
      },
      'all_units_acted',
    );

    expect(state.stateType).toBe(CombatStateType.EnemyTurn);
    expect(state.phase).toBe(TurnPhase.Enemy);
    expect(state.selectedUnitId).toBeNull();
  });

  it('transitions enemy turn back to unit select and increments turn', () => {
    const state = transitionState(
      {
        ...createInitialCombatState(),
        phase: TurnPhase.Enemy,
        stateType: CombatStateType.EnemyTurn,
        turnNumber: 3,
      },
      'enemy_turn_complete',
    );

    expect(state.stateType).toBe(CombatStateType.UnitSelect);
    expect(state.phase).toBe(TurnPhase.Player);
    expect(state.turnNumber).toBe(4);
  });

  it('returns original state on unknown event', () => {
    const original = { ...createInitialCombatState(), stateType: CombatStateType.UnitSelect };
    const next = transitionState(original, 'unknown_event');

    expect(next).toEqual(original);
  });
});

describe('combatStateMachine.undoMove', () => {
  it('pops latest undo entry and restores cursor/selected unit', () => {
    const state = {
      ...createInitialCombatState(),
      stateType: CombatStateType.ActionSelect,
      selectedUnitId: 'unit_current',
      cursorPosition: { x: 9, y: 9 },
      movementRange: [{ x: 1, y: 1 }],
      attackRange: [{ x: 2, y: 2 }],
      undoStack: [
        {
          unitId: 'unit_1',
          previousPosition: { x: 3, y: 4 },
          previousHasMoved: false,
        },
      ],
    };

    const next = undoMove(state);

    expect(next.stateType).toBe(CombatStateType.UnitSelect);
    expect(next.selectedUnitId).toBe('unit_1');
    expect(next.cursorPosition).toEqual({ x: 3, y: 4 });
    expect(next.movementRange).toEqual([]);
    expect(next.attackRange).toEqual([]);
    expect(next.undoStack).toEqual([]);
  });

  it('returns unchanged state when undo stack is empty', () => {
    const state = { ...createInitialCombatState(), stateType: CombatStateType.ActionSelect };
    const next = undoMove(state);
    expect(next).toEqual(state);
  });
});
