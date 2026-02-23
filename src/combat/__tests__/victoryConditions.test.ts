import { describe, it, expect } from 'vitest';
import { checkVictoryConditions, checkDefeatConditions } from '../victoryConditions';
import { makeUnit } from './helpers';
import { VictoryCondition, DefeatCondition } from '../../shared/types';

describe('victoryConditions', () => {
  describe('checkVictoryConditions', () => {
    it('Rout: returns true when all enemies are defeated', () => {
      const units = [
        makeUnit({ id: 'p1', team: 'player', isAlive: true }),
        makeUnit({ id: 'e1', team: 'enemy', isAlive: false }),
        makeUnit({ id: 'e2', team: 'enemy', isAlive: false }),
      ];
      expect(
        checkVictoryConditions([{ type: VictoryCondition.Rout }], units, 1),
      ).toBe(true);
    });

    it('Rout: returns false when enemies remain alive', () => {
      const units = [
        makeUnit({ id: 'p1', team: 'player', isAlive: true }),
        makeUnit({ id: 'e1', team: 'enemy', isAlive: false }),
        makeUnit({ id: 'e2', team: 'enemy', isAlive: true }),
      ];
      expect(
        checkVictoryConditions([{ type: VictoryCondition.Rout }], units, 1),
      ).toBe(false);
    });

    it('BossKill: returns true when boss unit is defeated', () => {
      const units = [
        makeUnit({ id: 'boss', team: 'enemy', isAlive: false }),
        makeUnit({ id: 'e1', team: 'enemy', isAlive: true }),
      ];
      expect(
        checkVictoryConditions(
          [{ type: VictoryCondition.BossKill, targetUnitId: 'boss' }],
          units,
          1,
        ),
      ).toBe(true);
    });

    it('BossKill: returns false when boss is still alive', () => {
      const units = [
        makeUnit({ id: 'boss', team: 'enemy', isAlive: true }),
      ];
      expect(
        checkVictoryConditions(
          [{ type: VictoryCondition.BossKill, targetUnitId: 'boss' }],
          units,
          1,
        ),
      ).toBe(false);
    });

    it('Survive: returns true when turn number >= surviveTurns', () => {
      expect(
        checkVictoryConditions(
          [{ type: VictoryCondition.Survive, surviveTurns: 10 }],
          [],
          10,
        ),
      ).toBe(true);
    });

    it('Survive: returns false when turns not reached', () => {
      expect(
        checkVictoryConditions(
          [{ type: VictoryCondition.Survive, surviveTurns: 10 }],
          [],
          9,
        ),
      ).toBe(false);
    });

    it('Survive: returns true when turn exceeds surviveTurns', () => {
      expect(
        checkVictoryConditions(
          [{ type: VictoryCondition.Survive, surviveTurns: 5 }],
          [],
          8,
        ),
      ).toBe(true);
    });

    it('ReachLocation: returns true when player unit at target', () => {
      const units = [
        makeUnit({
          id: 'p1',
          team: 'player',
          isAlive: true,
          position: { x: 5, y: 3 },
        }),
      ];
      expect(
        checkVictoryConditions(
          [{ type: VictoryCondition.ReachLocation, targetPosition: { x: 5, y: 3 } }],
          units,
          1,
        ),
      ).toBe(true);
    });

    it('ReachLocation: returns false when no player at target', () => {
      const units = [
        makeUnit({
          id: 'p1',
          team: 'player',
          isAlive: true,
          position: { x: 2, y: 3 },
        }),
      ];
      expect(
        checkVictoryConditions(
          [{ type: VictoryCondition.ReachLocation, targetPosition: { x: 5, y: 3 } }],
          units,
          1,
        ),
      ).toBe(false);
    });

    it('ReachLocation: dead player at location does not count', () => {
      const units = [
        makeUnit({
          id: 'p1',
          team: 'player',
          isAlive: false,
          position: { x: 5, y: 3 },
        }),
      ];
      expect(
        checkVictoryConditions(
          [{ type: VictoryCondition.ReachLocation, targetPosition: { x: 5, y: 3 } }],
          units,
          1,
        ),
      ).toBe(false);
    });

    it('ProtectTarget: returns true when target is alive', () => {
      const units = [
        makeUnit({ id: 'npc1', team: 'ally', isAlive: true }),
      ];
      expect(
        checkVictoryConditions(
          [{ type: VictoryCondition.ProtectTarget, targetUnitId: 'npc1' }],
          units,
          1,
        ),
      ).toBe(true);
    });

    it('ProtectTarget: returns false when target is dead', () => {
      const units = [
        makeUnit({ id: 'npc1', team: 'ally', isAlive: false }),
      ];
      expect(
        checkVictoryConditions(
          [{ type: VictoryCondition.ProtectTarget, targetUnitId: 'npc1' }],
          units,
          1,
        ),
      ).toBe(false);
    });

    it('returns true if any condition is met (OR logic)', () => {
      const units = [
        makeUnit({ id: 'e1', team: 'enemy', isAlive: true }),
      ];
      expect(
        checkVictoryConditions(
          [
            { type: VictoryCondition.Rout },
            { type: VictoryCondition.Survive, surviveTurns: 5 },
          ],
          units,
          6,
        ),
      ).toBe(true);
    });

    it('returns false when no conditions are met', () => {
      const units = [
        makeUnit({ id: 'e1', team: 'enemy', isAlive: true }),
      ];
      expect(
        checkVictoryConditions(
          [
            { type: VictoryCondition.Rout },
            { type: VictoryCondition.Survive, surviveTurns: 10 },
          ],
          units,
          3,
        ),
      ).toBe(false);
    });
  });

  describe('checkDefeatConditions', () => {
    it('LordDies: returns true when protected unit dies', () => {
      const units = [
        makeUnit({ id: 'lord', team: 'player', isAlive: false }),
      ];
      expect(
        checkDefeatConditions(
          [{ type: DefeatCondition.LordDies, protectedUnitId: 'lord' }],
          units,
          1,
        ),
      ).toBe(true);
    });

    it('LordDies: returns false when protected unit is alive', () => {
      const units = [
        makeUnit({ id: 'lord', team: 'player', isAlive: true }),
      ];
      expect(
        checkDefeatConditions(
          [{ type: DefeatCondition.LordDies, protectedUnitId: 'lord' }],
          units,
          1,
        ),
      ).toBe(false);
    });

    it('AllUnitsDie: returns true when all player units dead', () => {
      const units = [
        makeUnit({ id: 'p1', team: 'player', isAlive: false }),
        makeUnit({ id: 'p2', team: 'player', isAlive: false }),
        makeUnit({ id: 'e1', team: 'enemy', isAlive: true }),
      ];
      expect(
        checkDefeatConditions(
          [{ type: DefeatCondition.AllUnitsDie }],
          units,
          1,
        ),
      ).toBe(true);
    });

    it('AllUnitsDie: returns false when some player units alive', () => {
      const units = [
        makeUnit({ id: 'p1', team: 'player', isAlive: false }),
        makeUnit({ id: 'p2', team: 'player', isAlive: true }),
      ];
      expect(
        checkDefeatConditions(
          [{ type: DefeatCondition.AllUnitsDie }],
          units,
          1,
        ),
      ).toBe(false);
    });

    it('ProtectedUnitDies: returns true when specified unit dies', () => {
      const units = [
        makeUnit({ id: 'npc1', team: 'ally', isAlive: false }),
      ];
      expect(
        checkDefeatConditions(
          [{ type: DefeatCondition.ProtectedUnitDies, protectedUnitId: 'npc1' }],
          units,
          1,
        ),
      ).toBe(true);
    });

    it('ProtectedUnitDies: returns false when specified unit alive', () => {
      const units = [
        makeUnit({ id: 'npc1', team: 'ally', isAlive: true }),
      ];
      expect(
        checkDefeatConditions(
          [{ type: DefeatCondition.ProtectedUnitDies, protectedUnitId: 'npc1' }],
          units,
          1,
        ),
      ).toBe(false);
    });

    it('TimerExpires: returns true when turn exceeds limit', () => {
      expect(
        checkDefeatConditions(
          [{ type: DefeatCondition.TimerExpires, turnLimit: 10 }],
          [],
          11,
        ),
      ).toBe(true);
    });

    it('TimerExpires: returns false when at turn limit', () => {
      expect(
        checkDefeatConditions(
          [{ type: DefeatCondition.TimerExpires, turnLimit: 10 }],
          [],
          10,
        ),
      ).toBe(false);
    });

    it('TimerExpires: returns false before limit', () => {
      expect(
        checkDefeatConditions(
          [{ type: DefeatCondition.TimerExpires, turnLimit: 10 }],
          [],
          5,
        ),
      ).toBe(false);
    });

    it('returns true if any defeat condition met', () => {
      const units = [
        makeUnit({ id: 'p1', team: 'player', isAlive: true }),
      ];
      expect(
        checkDefeatConditions(
          [
            { type: DefeatCondition.AllUnitsDie },
            { type: DefeatCondition.TimerExpires, turnLimit: 5 },
          ],
          units,
          6,
        ),
      ).toBe(true);
    });

    it('returns false when no defeat conditions met', () => {
      const units = [
        makeUnit({ id: 'p1', team: 'player', isAlive: true }),
      ];
      expect(
        checkDefeatConditions(
          [
            { type: DefeatCondition.AllUnitsDie },
            { type: DefeatCondition.TimerExpires, turnLimit: 10 },
          ],
          units,
          5,
        ),
      ).toBe(false);
    });
  });
});
