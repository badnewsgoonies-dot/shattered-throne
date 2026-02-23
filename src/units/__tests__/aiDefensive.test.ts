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

describe('aiSystem.calculateAIAction - Defensive', () => {
  it('attacks enemies already in current attack range', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    const unit = makeUnit({ aiBehavior: AIBehavior.Defensive, position: pos(2, 2) });
    const enemy = makeUnit({ id: 'player_adjacent', team: 'player', position: pos(2, 3) });

    const action = calculateAIAction(unit, [], [enemy], map, gridEngine);

    expect(action.type).toBe('attack');
    expect(action.targetUnitId).toBe('player_adjacent');
    expect(action.targetPosition).toEqual(pos(2, 2));
  });

  it('does not move to attack enemies outside current range', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    const unit = makeUnit({ aiBehavior: AIBehavior.Defensive, position: pos(1, 1), currentStats: { movement: 5 } });
    const farEnemy = makeUnit({ id: 'player_far', team: 'player', position: pos(4, 1) });

    const action = calculateAIAction(unit, [], [farEnemy], map, gridEngine);

    expect(action.type).toBe('wait');
  });

  it('targets highest threat enemy when multiple are in range', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    const unit = makeUnit({ aiBehavior: AIBehavior.Defensive, position: pos(3, 3), currentStats: { defense: 5 } });
    const weakThreat = makeUnit({ id: 'weak', team: 'player', position: pos(3, 2), currentStats: { strength: 8 } });
    const highThreat = makeUnit({ id: 'high', team: 'player', position: pos(4, 3), currentStats: { strength: 20 } });

    const action = calculateAIAction(unit, [], [weakThreat, highThreat], map, gridEngine);

    expect(action.targetUnitId).toBe('high');
  });

  it('moves to forest terrain within 3 tiles when not attacking', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    setTerrain(map, pos(2, 2), TerrainType.Forest, 2, 3);
    const unit = makeUnit({ aiBehavior: AIBehavior.Defensive, position: pos(1, 1) });

    const action = calculateAIAction(unit, [], [makeUnit({ id: 'far', team: 'player', position: pos(7, 7) })], map, gridEngine);

    expect(action.type).toBe('wait');
    expect(action.targetPosition).toEqual(pos(2, 2));
  });

  it('prefers fortress terrain when available', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    setTerrain(map, pos(2, 1), TerrainType.Forest, 2, 2);
    setTerrain(map, pos(1, 2), TerrainType.Fortress, 2, 2);
    const unit = makeUnit({ aiBehavior: AIBehavior.Defensive, position: pos(1, 1) });

    const action = calculateAIAction(unit, [], [makeUnit({ id: 'far', team: 'player', position: pos(7, 7) })], map, gridEngine);

    expect(action.targetPosition).toEqual(pos(1, 2));
  });

  it('waits in current position when no better defensive terrain exists', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    const unit = makeUnit({ aiBehavior: AIBehavior.Defensive, position: pos(2, 2) });

    const action = calculateAIAction(unit, [], [makeUnit({ id: 'far', team: 'player', position: pos(7, 7) })], map, gridEngine);

    expect(action.type).toBe('wait');
    expect(action.targetPosition).toEqual(pos(2, 2));
  });

  it('returns wait when defensive unit has no position', () => {
    const action = calculateAIAction(
      makeUnit({ aiBehavior: AIBehavior.Defensive, position: null }),
      [],
      [makeUnit({ id: 'player_1', team: 'player', position: pos(3, 3) })],
      makeMap(),
      makeMockGridEngine(),
    );

    expect(action.type).toBe('wait');
  });

  it('ignores dead enemies even if they are in range', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    const unit = makeUnit({ aiBehavior: AIBehavior.Defensive, position: pos(2, 2) });
    const deadEnemy = makeUnit({ id: 'dead', team: 'player', position: pos(2, 3), isAlive: false });

    const action = calculateAIAction(unit, [], [deadEnemy], map, gridEngine);

    expect(action.type).toBe('wait');
    expect(action.targetUnitId).toBeUndefined();
  });
});
