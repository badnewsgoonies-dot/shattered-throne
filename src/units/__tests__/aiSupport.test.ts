import { describe, expect, it } from 'vitest';
import { AIBehavior, UnitClassName } from '../../shared/types';
import { calculateAIAction } from '../aiSystem';
import {
  makeMap,
  makeMockGridEngine,
  makeUnit,
  pos,
} from './testUtils';

describe('aiSystem.calculateAIAction - Support', () => {
  it('prioritizes healing injured ally under 50 percent HP', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    const healer = makeUnit({
      id: 'healer',
      aiBehavior: AIBehavior.Support,
      className: UnitClassName.Cleric,
      position: pos(1, 1),
      currentStats: { movement: 3 },
    });
    const ally = makeUnit({ id: 'ally_1', team: 'enemy', position: pos(3, 1), maxHP: 40, currentHP: 10 });

    const action = calculateAIAction(healer, [ally], [], map, gridEngine);

    expect(action.type).toBe('skill');
    expect(action.targetUnitId).toBe('ally_1');
  });

  it('chooses the most injured ally when multiple need healing', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    const healer = makeUnit({
      id: 'healer',
      aiBehavior: AIBehavior.Support,
      className: UnitClassName.Cleric,
      position: pos(1, 1),
      currentStats: { movement: 4 },
    });
    const allyA = makeUnit({ id: 'ally_a', team: 'enemy', position: pos(3, 1), maxHP: 40, currentHP: 14 });
    const allyB = makeUnit({ id: 'ally_b', team: 'enemy', position: pos(2, 2), maxHP: 40, currentHP: 8 });

    const action = calculateAIAction(healer, [allyA, allyB], [], map, gridEngine);

    expect(action.type).toBe('skill');
    expect(action.targetUnitId).toBe('ally_b');
  });

  it('moves toward injured ally when support unit can heal', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    const healer = makeUnit({
      id: 'healer',
      aiBehavior: AIBehavior.Support,
      className: UnitClassName.Cleric,
      position: pos(0, 0),
      currentStats: { movement: 2 },
    });
    const ally = makeUnit({ id: 'ally_far', team: 'enemy', position: pos(4, 0), maxHP: 40, currentHP: 10 });

    const action = calculateAIAction(healer, [ally], [], map, gridEngine);

    expect(['skill', 'wait']).toContain(action.type);
    expect(action.targetPosition).toBeDefined();
    const startDistance = 4;
    const endDistance = Math.abs((action.targetPosition?.x ?? 0) - 4) + Math.abs((action.targetPosition?.y ?? 0) - 0);
    expect(endDistance).toBeLessThan(startDistance);
  });

  it('stays near allies and waits if unit cannot heal', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    const support = makeUnit({
      id: 'support',
      aiBehavior: AIBehavior.Support,
      className: UnitClassName.Warrior,
      skills: ['taunt'],
      position: pos(0, 0),
      currentStats: { movement: 3 },
    });
    const injured = makeUnit({ id: 'ally_injured', team: 'enemy', position: pos(3, 0), maxHP: 30, currentHP: 10 });
    const healthy = makeUnit({ id: 'ally_healthy', team: 'enemy', position: pos(2, 2), maxHP: 30, currentHP: 30 });

    const action = calculateAIAction(support, [injured, healthy], [], map, gridEngine);

    expect(action.type).toBe('wait');
  });

  it('stays close to allies when no one is injured', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    const support = makeUnit({ aiBehavior: AIBehavior.Support, position: pos(0, 0), currentStats: { movement: 3 } });
    const allyA = makeUnit({ id: 'ally_a', team: 'enemy', position: pos(2, 0), maxHP: 30, currentHP: 20 });
    const allyB = makeUnit({ id: 'ally_b', team: 'enemy', position: pos(0, 2), maxHP: 30, currentHP: 20 });

    const action = calculateAIAction(support, [allyA, allyB], [], map, gridEngine);

    expect(action.type).toBe('wait');
    expect(action.targetPosition).toBeDefined();
  });

  it('waits in place when there are no allies to support', () => {
    const action = calculateAIAction(
      makeUnit({ aiBehavior: AIBehavior.Support, position: pos(2, 2) }),
      [],
      [],
      makeMap(),
      makeMockGridEngine(),
    );

    expect(action.type).toBe('wait');
    expect(action.targetPosition).toEqual(pos(2, 2));
  });

  it('does not treat ally at exactly 50 percent HP as injured target', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    const healer = makeUnit({ aiBehavior: AIBehavior.Support, className: UnitClassName.Cleric, position: pos(1, 1) });
    const ally = makeUnit({ id: 'ally_half', team: 'enemy', position: pos(2, 1), maxHP: 20, currentHP: 10 });

    const action = calculateAIAction(healer, [ally], [], map, gridEngine);

    expect(action.type).toBe('wait');
    expect(action.targetUnitId).toBeUndefined();
  });

  it('uses preferred healing skill id when available', () => {
    const map = makeMap();
    const gridEngine = makeMockGridEngine();
    const support = makeUnit({
      aiBehavior: AIBehavior.Support,
      className: UnitClassName.Warrior,
      skills: ['heal_wave', 'shield_bash'],
      position: pos(1, 1),
      currentStats: { movement: 3 },
    });
    const injured = makeUnit({ id: 'ally_injured', team: 'enemy', position: pos(2, 1), maxHP: 30, currentHP: 5 });

    const action = calculateAIAction(support, [injured], [], map, gridEngine);

    expect(action.type).toBe('skill');
    expect(action.skillId).toBe('heal_wave');
  });
});
