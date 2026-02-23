import { describe, expect, it } from 'vitest';
import { AIBehavior } from '../../shared/types';
import { calculateAIAction } from '../aiSystem';
import {
  makeMap,
  makeMockGridEngine,
  makeUnit,
  pos,
} from './testUtils';

describe('aiSystem.calculateAIAction - Boss', () => {
  it('attacks enemy in current range at high HP', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    const boss = makeUnit({ aiBehavior: AIBehavior.Boss, position: pos(3, 3), maxHP: 100, currentHP: 80 });
    const enemy = makeUnit({ id: 'player_adjacent', team: 'player', position: pos(3, 4) });

    const action = calculateAIAction(boss, [], [enemy], map, gridEngine);

    expect(action.type).toBe('attack');
    expect(action.targetUnitId).toBe('player_adjacent');
    expect(action.targetPosition).toEqual(pos(3, 3));
  });

  it('does not move when HP is high and enemies are out of range', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    const boss = makeUnit({ aiBehavior: AIBehavior.Boss, position: pos(2, 2), maxHP: 100, currentHP: 90, currentStats: { movement: 5 } });
    const enemy = makeUnit({ id: 'player_far', team: 'player', position: pos(5, 2) });

    const action = calculateAIAction(boss, [], [enemy], map, gridEngine);

    expect(action.type).toBe('wait');
    expect(action.targetPosition).toEqual(pos(2, 2));
  });

  it('attacks the enemy with highest estimated damage when multiple are in range', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    const boss = makeUnit({ aiBehavior: AIBehavior.Boss, position: pos(3, 3), currentStats: { strength: 18 }, maxHP: 100, currentHP: 90 });
    const tanky = makeUnit({ id: 'tanky', team: 'player', position: pos(3, 4), currentStats: { defense: 12 } });
    const squishy = makeUnit({ id: 'squishy', team: 'player', position: pos(4, 3), currentStats: { defense: 2 } });

    const action = calculateAIAction(boss, [], [tanky, squishy], map, gridEngine);

    expect(action.targetUnitId).toBe('squishy');
  });

  it('switches to aggressive behavior below 25 percent HP', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    const boss = makeUnit({ aiBehavior: AIBehavior.Boss, position: pos(1, 1), maxHP: 100, currentHP: 20, currentStats: { movement: 1 } });
    const enemy = makeUnit({ id: 'player_target', team: 'player', position: pos(3, 1) });

    const action = calculateAIAction(boss, [], [enemy], map, gridEngine);

    expect(action.type).toBe('attack');
    expect(action.targetUnitId).toBe('player_target');
  });

  it('does not switch at exactly 25 percent HP', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    const boss = makeUnit({ aiBehavior: AIBehavior.Boss, position: pos(1, 1), maxHP: 100, currentHP: 25, currentStats: { movement: 5 } });
    const enemy = makeUnit({ id: 'player_far', team: 'player', position: pos(3, 1) });

    const action = calculateAIAction(boss, [], [enemy], map, gridEngine);

    expect(action.type).toBe('wait');
    expect(action.targetPosition).toEqual(pos(1, 1));
  });

  it('waits in place when no enemies exist', () => {
    const action = calculateAIAction(
      makeUnit({ aiBehavior: AIBehavior.Boss, position: pos(3, 3), maxHP: 100, currentHP: 70 }),
      [],
      [],
      makeMap(),
      makeMockGridEngine(),
    );

    expect(action.type).toBe('wait');
    expect(action.targetPosition).toEqual(pos(3, 3));
  });

  it('returns wait when boss has no position', () => {
    const action = calculateAIAction(
      makeUnit({ aiBehavior: AIBehavior.Boss, position: null }),
      [],
      [makeUnit({ id: 'player_1', team: 'player', position: pos(3, 3) })],
      makeMap(),
      makeMockGridEngine(),
    );

    expect(action.type).toBe('wait');
  });

  it('low HP boss inherits aggressive kill prioritization', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    const boss = makeUnit({ aiBehavior: AIBehavior.Boss, position: pos(1, 1), maxHP: 120, currentHP: 20, currentStats: { movement: 2, strength: 20 } });
    const killable = makeUnit({ id: 'killable', team: 'player', position: pos(3, 1), currentHP: 5, currentStats: { defense: 0 } });
    const bulky = makeUnit({ id: 'bulky', team: 'player', position: pos(2, 2), currentHP: 60, currentStats: { defense: 10 } });

    const action = calculateAIAction(boss, [], [killable, bulky], map, gridEngine);

    expect(action.type).toBe('attack');
    expect(action.targetUnitId).toBe('killable');
  });
});
