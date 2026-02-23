import { describe, expect, it } from 'vitest';
import { AIBehavior, TerrainType } from '../../shared/types';
import { calculateAIAction } from '../aiSystem';
import {
  makeMap,
  makeMockGridEngine,
  makeUnit,
  pos,
  setTerrain,
} from './testUtils';

describe('aiSystem.calculateAIAction - Flanker', () => {
  it('attacks from an adjacent flank position when available', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    const flanker = makeUnit({ aiBehavior: AIBehavior.Flanker, position: pos(1, 3), currentStats: { movement: 2 } });
    const enemy = makeUnit({ id: 'target', team: 'player', position: pos(3, 3) });

    const action = calculateAIAction(flanker, [], [enemy], map, gridEngine);

    expect(action.type).toBe('attack');
    expect(action.targetUnitId).toBe('target');
    expect(action.targetPosition).toBeDefined();
  });

  it('avoids directly in front of target when selecting flank tile', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    const flanker = makeUnit({ aiBehavior: AIBehavior.Flanker, position: pos(2, 1), currentStats: { movement: 3 } });
    const enemy = makeUnit({ id: 'target', team: 'player', position: pos(3, 3) });

    const action = calculateAIAction(flanker, [], [enemy], map, gridEngine);

    expect(action.type).toBe('attack');
    expect(action.targetPosition).not.toEqual(pos(3, 2));
  });

  it('prioritizes targets with lower defense', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    const flanker = makeUnit({ aiBehavior: AIBehavior.Flanker, position: pos(2, 2), currentStats: { movement: 3 } });
    const lowDefense = makeUnit({ id: 'low_def', team: 'player', position: pos(4, 2), currentStats: { defense: 2 } });
    const highDefense = makeUnit({ id: 'high_def', team: 'player', position: pos(3, 4), currentStats: { defense: 15 } });

    const action = calculateAIAction(flanker, [], [lowDefense, highDefense], map, gridEngine);

    expect(action.targetUnitId).toBe('low_def');
  });

  it('prefers forest or fortress flank tiles when available', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    setTerrain(map, pos(4, 3), TerrainType.Forest, 2, 3);
    const flanker = makeUnit({ aiBehavior: AIBehavior.Flanker, position: pos(1, 3), currentStats: { movement: 4 } });
    const enemy = makeUnit({ id: 'target', team: 'player', position: pos(3, 3) });

    const action = calculateAIAction(flanker, [], [enemy], map, gridEngine);

    expect(action.type).toBe('attack');
    expect(action.targetPosition).toEqual(pos(4, 3));
  });

  it('falls back to aggressive behavior when no flank tiles are reachable', () => {
    const map = makeMap(12, 12);
    const gridEngine = makeMockGridEngine();
    const flanker = makeUnit({ aiBehavior: AIBehavior.Flanker, position: pos(0, 0), currentStats: { movement: 1 } });
    const farEnemy = makeUnit({ id: 'far_enemy', team: 'player', position: pos(10, 10) });

    const action = calculateAIAction(flanker, [], [farEnemy], map, gridEngine);

    expect(action.type).toBe('wait');
    expect(action.targetPosition).toBeDefined();
  });

  it('falls back gracefully when there are no enemies', () => {
    const action = calculateAIAction(
      makeUnit({ aiBehavior: AIBehavior.Flanker, position: pos(2, 2) }),
      [],
      [],
      makeMap(),
      makeMockGridEngine(),
    );

    expect(action.type).toBe('wait');
  });

  it('returns wait when flanker has no position', () => {
    const action = calculateAIAction(
      makeUnit({ aiBehavior: AIBehavior.Flanker, position: null }),
      [],
      [makeUnit({ id: 'enemy_1', team: 'player', position: pos(3, 3) })],
      makeMap(),
      makeMockGridEngine(),
    );

    expect(action.type).toBe('wait');
  });

  it('ignores dead enemies when evaluating flank targets', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    const flanker = makeUnit({ aiBehavior: AIBehavior.Flanker, position: pos(1, 3), currentStats: { movement: 3 } });
    const deadEnemy = makeUnit({ id: 'dead', team: 'player', isAlive: false, position: pos(3, 3) });

    const action = calculateAIAction(flanker, [], [deadEnemy], map, gridEngine);

    expect(action.type).toBe('wait');
    expect(action.targetUnitId).toBeUndefined();
  });
});
