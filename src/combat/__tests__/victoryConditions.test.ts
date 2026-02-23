import { describe, expect, it } from 'vitest';
import { DefeatCondition, VictoryCondition } from '../../shared/types';
import { checkDefeatConditions, checkVictoryConditions } from '../victoryConditions';
import { makeUnit } from './testUtils';

describe('victoryConditions.checkVictoryConditions', () => {
  it('returns true for rout when all enemies are defeated', () => {
    const units = [
      makeUnit({ id: 'p1', team: 'player', isAlive: true }),
      makeUnit({ id: 'e1', team: 'enemy', isAlive: false }),
      makeUnit({ id: 'e2', team: 'enemy', isAlive: false }),
    ];

    const result = checkVictoryConditions([{ type: VictoryCondition.Rout }], units, 1);

    expect(result).toBe(true);
  });

  it('returns false for rout when any enemy remains alive', () => {
    const units = [
      makeUnit({ id: 'p1', team: 'player', isAlive: true }),
      makeUnit({ id: 'e1', team: 'enemy', isAlive: false }),
      makeUnit({ id: 'e2', team: 'enemy', isAlive: true }),
    ];

    const result = checkVictoryConditions([{ type: VictoryCondition.Rout }], units, 1);

    expect(result).toBe(false);
  });

  it('returns true for boss kill when target unit is dead', () => {
    const units = [makeUnit({ id: 'boss', team: 'enemy', isAlive: false })];

    const result = checkVictoryConditions(
      [{ type: VictoryCondition.BossKill, targetUnitId: 'boss' }],
      units,
      1,
    );

    expect(result).toBe(true);
  });

  it('returns false for boss kill when target unit is alive', () => {
    const units = [makeUnit({ id: 'boss', team: 'enemy', isAlive: true })];

    const result = checkVictoryConditions(
      [{ type: VictoryCondition.BossKill, targetUnitId: 'boss' }],
      units,
      1,
    );

    expect(result).toBe(false);
  });

  it('returns false for boss kill when target id is missing', () => {
    const result = checkVictoryConditions([{ type: VictoryCondition.BossKill }], [makeUnit()], 1);
    expect(result).toBe(false);
  });

  it('returns true for survive condition at required turn', () => {
    const result = checkVictoryConditions(
      [{ type: VictoryCondition.Survive, surviveTurns: 5 }],
      [makeUnit()],
      5,
    );

    expect(result).toBe(true);
  });

  it('returns false for survive condition before required turn', () => {
    const result = checkVictoryConditions(
      [{ type: VictoryCondition.Survive, surviveTurns: 5 }],
      [makeUnit()],
      4,
    );

    expect(result).toBe(false);
  });

  it('returns true when any alive player reaches the target location', () => {
    const units = [
      makeUnit({ id: 'p1', team: 'player', isAlive: true, position: { x: 2, y: 3 } }),
      makeUnit({ id: 'p2', team: 'player', isAlive: true, position: { x: 1, y: 1 } }),
    ];

    const result = checkVictoryConditions(
      [{ type: VictoryCondition.ReachLocation, targetPosition: { x: 2, y: 3 } }],
      units,
      1,
    );

    expect(result).toBe(true);
  });

  it('returns false when only enemy reaches the target location', () => {
    const units = [
      makeUnit({ id: 'e1', team: 'enemy', isAlive: true, position: { x: 2, y: 3 } }),
      makeUnit({ id: 'p1', team: 'player', isAlive: true, position: { x: 1, y: 1 } }),
    ];

    const result = checkVictoryConditions(
      [{ type: VictoryCondition.ReachLocation, targetPosition: { x: 2, y: 3 } }],
      units,
      1,
    );

    expect(result).toBe(false);
  });

  it('returns true for protect target without explicit target id', () => {
    const result = checkVictoryConditions([{ type: VictoryCondition.ProtectTarget }], [makeUnit()], 1);
    expect(result).toBe(true);
  });

  it('returns false for protect target when target id is dead', () => {
    const units = [makeUnit({ id: 'npc_1', isAlive: false })];

    const result = checkVictoryConditions(
      [{ type: VictoryCondition.ProtectTarget, targetUnitId: 'npc_1' }],
      units,
      1,
    );

    expect(result).toBe(false);
  });

  it('returns true when any one of multiple victory conditions is met', () => {
    const units = [
      makeUnit({ id: 'boss', team: 'enemy', isAlive: true }),
      makeUnit({ id: 'hero', team: 'player', isAlive: true }),
    ];

    const result = checkVictoryConditions(
      [
        { type: VictoryCondition.BossKill, targetUnitId: 'boss' },
        { type: VictoryCondition.Survive, surviveTurns: 3 },
      ],
      units,
      3,
    );

    expect(result).toBe(true);
  });

  it('returns false when no victory conditions are provided', () => {
    expect(checkVictoryConditions([], [makeUnit()], 1)).toBe(false);
  });
});

describe('victoryConditions.checkDefeatConditions', () => {
  it('returns true for lord dies when protected unit id is dead', () => {
    const units = [makeUnit({ id: 'lord_1', isAlive: false, team: 'player' })];

    const result = checkDefeatConditions(
      [{ type: DefeatCondition.LordDies, protectedUnitId: 'lord_1' }],
      units,
      1,
    );

    expect(result).toBe(true);
  });

  it('returns false for lord dies when no protected id is provided', () => {
    const result = checkDefeatConditions([{ type: DefeatCondition.LordDies }], [makeUnit()], 1);
    expect(result).toBe(false);
  });

  it('returns true when all player units are dead', () => {
    const units = [
      makeUnit({ id: 'p1', team: 'player', isAlive: false }),
      makeUnit({ id: 'p2', team: 'player', isAlive: false }),
      makeUnit({ id: 'e1', team: 'enemy', isAlive: true }),
    ];

    const result = checkDefeatConditions([{ type: DefeatCondition.AllUnitsDie }], units, 1);

    expect(result).toBe(true);
  });

  it('returns false when at least one player unit is alive', () => {
    const units = [
      makeUnit({ id: 'p1', team: 'player', isAlive: false }),
      makeUnit({ id: 'p2', team: 'player', isAlive: true }),
    ];

    const result = checkDefeatConditions([{ type: DefeatCondition.AllUnitsDie }], units, 1);

    expect(result).toBe(false);
  });

  it('returns false for all-units-die when there are no player units', () => {
    const units = [makeUnit({ id: 'e1', team: 'enemy', isAlive: true })];
    const result = checkDefeatConditions([{ type: DefeatCondition.AllUnitsDie }], units, 1);
    expect(result).toBe(false);
  });

  it('returns true when protected unit dies', () => {
    const units = [makeUnit({ id: 'npc_1', isAlive: false })];

    const result = checkDefeatConditions(
      [{ type: DefeatCondition.ProtectedUnitDies, protectedUnitId: 'npc_1' }],
      units,
      1,
    );

    expect(result).toBe(true);
  });

  it('returns false when protected unit is alive', () => {
    const units = [makeUnit({ id: 'npc_1', isAlive: true })];

    const result = checkDefeatConditions(
      [{ type: DefeatCondition.ProtectedUnitDies, protectedUnitId: 'npc_1' }],
      units,
      1,
    );

    expect(result).toBe(false);
  });

  it('returns true when timer expires strictly above limit', () => {
    const result = checkDefeatConditions(
      [{ type: DefeatCondition.TimerExpires, turnLimit: 8 }],
      [makeUnit()],
      9,
    );

    expect(result).toBe(true);
  });

  it('returns false when timer is at limit', () => {
    const result = checkDefeatConditions(
      [{ type: DefeatCondition.TimerExpires, turnLimit: 8 }],
      [makeUnit()],
      8,
    );

    expect(result).toBe(false);
  });

  it('returns true when any defeat condition is met', () => {
    const units = [makeUnit({ id: 'npc_1', isAlive: false })];

    const result = checkDefeatConditions(
      [
        { type: DefeatCondition.TimerExpires, turnLimit: 10 },
        { type: DefeatCondition.ProtectedUnitDies, protectedUnitId: 'npc_1' },
      ],
      units,
      3,
    );

    expect(result).toBe(true);
  });

  it('returns false when no defeat conditions are provided', () => {
    expect(checkDefeatConditions([], [makeUnit()], 1)).toBe(false);
  });
});
