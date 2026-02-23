import { describe, expect, it } from 'vitest';
import { AIBehavior } from '../../shared/types';
import { calculateAIAction } from '../aiSystem';
import {
  makeMap,
  makeMockGridEngine,
  makeUnit,
  pos,
} from './testUtils';

describe('aiSystem.calculateAIAction - Aggressive', () => {
  it('attacks an enemy reachable by moving then attacking', () => {
    const map = makeMap(8, 8);
    const gridEngine = makeMockGridEngine();
    const unit = makeUnit({
      id: 'enemy_ai',
      aiBehavior: AIBehavior.Aggressive,
      position: pos(1, 1),
      currentStats: { movement: 1, strength: 10 },
    });
    const target = makeUnit({ id: 'player_1', team: 'player', position: pos(3, 1), currentHP: 20 });

    const action = calculateAIAction(unit, [], [target], map, gridEngine);

    expect(action.type).toBe('attack');
    expect(action.targetUnitId).toBe('player_1');
  });

  it('prioritizes killable targets over non-killable targets', () => {
    const map = makeMap(8, 8);
    const gridEngine = makeMockGridEngine();
    const unit = makeUnit({
      id: 'enemy_ai',
      aiBehavior: AIBehavior.Aggressive,
      position: pos(1, 1),
      currentStats: { movement: 2, strength: 20 },
    });
    const killable = makeUnit({ id: 'player_killable', team: 'player', position: pos(3, 1), currentHP: 5, currentStats: { defense: 0 } });
    const bulky = makeUnit({ id: 'player_bulky', team: 'player', position: pos(2, 2), currentHP: 50, currentStats: { defense: 20 } });

    const action = calculateAIAction(unit, [], [killable, bulky], map, gridEngine);

    expect(action.type).toBe('attack');
    expect(action.targetUnitId).toBe('player_killable');
  });

  it('targets higher estimated damage enemy when no kill is available', () => {
    const map = makeMap(8, 8);
    const gridEngine = makeMockGridEngine();
    const unit = makeUnit({ aiBehavior: AIBehavior.Aggressive, position: pos(2, 2), currentStats: { movement: 2, strength: 14 } });
    const lowDefense = makeUnit({ id: 'low_def', team: 'player', position: pos(4, 2), currentHP: 40, currentStats: { defense: 5 } });
    const highDefense = makeUnit({ id: 'high_def', team: 'player', position: pos(3, 3), currentHP: 40, currentStats: { defense: 12 } });

    const action = calculateAIAction(unit, [], [lowDefense, highDefense], map, gridEngine);

    expect(action.targetUnitId).toBe('low_def');
  });

  it('moves toward nearest enemy and waits when nobody is reachable', () => {
    const map = makeMap(10, 10);
    const gridEngine = makeMockGridEngine();
    const unit = makeUnit({ aiBehavior: AIBehavior.Aggressive, position: pos(0, 0), currentStats: { movement: 1 } });
    const farEnemy = makeUnit({ id: 'far_enemy', team: 'player', position: pos(9, 9) });

    const action = calculateAIAction(unit, [], [farEnemy], map, gridEngine);

    expect(action.type).toBe('wait');
    expect(action.targetPosition).toBeDefined();
    expect((action.targetPosition?.x ?? 0) + (action.targetPosition?.y ?? 0)).toBeGreaterThan(0);
  });

  it('waits in place when there are no enemies', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    const unit = makeUnit({ aiBehavior: AIBehavior.Aggressive, position: pos(2, 2) });

    const action = calculateAIAction(unit, [], [], map, gridEngine);

    expect(action.type).toBe('wait');
    expect(action.targetPosition).toEqual(pos(2, 2));
  });

  it('returns wait when unit has no position', () => {
    const action = calculateAIAction(
      makeUnit({ aiBehavior: AIBehavior.Aggressive, position: null }),
      [],
      [makeUnit({ id: 'player_1', team: 'player', position: pos(1, 1) })],
      makeMap(),
      makeMockGridEngine(),
    );

    expect(action.type).toBe('wait');
    expect(action.targetPosition).toBeUndefined();
  });

  it('ignores dead enemies for targeting', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    const unit = makeUnit({ aiBehavior: AIBehavior.Aggressive, position: pos(1, 1), currentStats: { movement: 2 } });
    const deadEnemy = makeUnit({ id: 'dead_enemy', team: 'player', isAlive: false, position: pos(2, 1) });
    const aliveEnemy = makeUnit({ id: 'alive_enemy', team: 'player', isAlive: true, position: pos(3, 1) });

    const action = calculateAIAction(unit, [], [deadEnemy, aliveEnemy], map, gridEngine);

    expect(action.targetUnitId).toBe('alive_enemy');
  });

  it('includes a targetPosition when attacking', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    const unit = makeUnit({ aiBehavior: AIBehavior.Aggressive, position: pos(1, 1), currentStats: { movement: 2 } });
    const enemy = makeUnit({ id: 'player_target', team: 'player', position: pos(3, 1) });

    const action = calculateAIAction(unit, [], [enemy], map, gridEngine);

    expect(action.type).toBe('attack');
    expect(action.targetPosition).toBeDefined();
  });

  it('selects an attack position adjacent to chosen target', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    const unit = makeUnit({ aiBehavior: AIBehavior.Aggressive, position: pos(1, 3), currentStats: { movement: 2 } });
    const enemy = makeUnit({ id: 'target', team: 'player', position: pos(4, 3) });

    const action = calculateAIAction(unit, [], [enemy], map, gridEngine);

    const distance = Math.abs((action.targetPosition?.x ?? 0) - 4) + Math.abs((action.targetPosition?.y ?? 0) - 3);
    expect(action.type).toBe('attack');
    expect(distance).toBe(1);
  });

  it('defaults to aggressive behavior when aiBehavior is undefined', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    const unit = makeUnit({ aiBehavior: undefined, position: pos(1, 1), currentStats: { movement: 1 } });
    const enemy = makeUnit({ id: 'player_1', team: 'player', position: pos(3, 1) });

    const action = calculateAIAction(unit, [], [enemy], map, gridEngine);

    expect(['attack', 'wait']).toContain(action.type);
    expect(action.unitId).toBe(unit.id);
  });
});
