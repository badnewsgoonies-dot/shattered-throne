import { describe, expect, it } from 'vitest';
import { KILL_EXP_BONUS } from '../../shared/types';
import { calculateExpGain } from '../expCalculator';
import { makeUnit } from './testUtils';

describe('expCalculator.calculateExpGain', () => {
  it('computes base exp from level difference formula', () => {
    const attacker = makeUnit({ level: 5 });
    const defender = makeUnit({ level: 7, maxHP: 40 });

    const result = calculateExpGain(attacker, defender, 0, false);

    expect(result).toBe(36);
  });

  it('adds kill bonus when target is defeated', () => {
    const attacker = makeUnit({ level: 5 });
    const defender = makeUnit({ level: 7, maxHP: 40 });

    const result = calculateExpGain(attacker, defender, 40, true);

    expect(result).toBe((7 - 5 + 10) * 3 + KILL_EXP_BONUS);
  });

  it('scales exp by damage proportion when not killing', () => {
    const attacker = makeUnit({ level: 5 });
    const defender = makeUnit({ level: 8, maxHP: 50 });

    const result = calculateExpGain(attacker, defender, 25, false);

    expect(result).toBe(Math.round(((8 - 5 + 10) * 3) * 0.5));
  });

  it('returns minimum exp of 1 when no damage is dealt', () => {
    const attacker = makeUnit({ level: 10 });
    const defender = makeUnit({ level: 1, maxHP: 30 });

    const result = calculateExpGain(attacker, defender, 0, false);

    expect(result).toBe(3);
  });

  it('clamps exp to minimum 1 for very low values', () => {
    const attacker = makeUnit({ level: 30 });
    const defender = makeUnit({ level: 1, maxHP: 50 });

    const result = calculateExpGain(attacker, defender, 5, false);

    expect(result).toBe(1);
  });

  it('clamps exp to maximum 100', () => {
    const attacker = makeUnit({ level: 1 });
    const defender = makeUnit({ level: 30, maxHP: 60 });

    const result = calculateExpGain(attacker, defender, 60, true);

    expect(result).toBe(100);
  });

  it('rounds partial exp values to the nearest integer', () => {
    const attacker = makeUnit({ level: 5 });
    const defender = makeUnit({ level: 6, maxHP: 35 });

    const result = calculateExpGain(attacker, defender, 10, false);

    expect(result).toBe(Math.round(((6 - 5 + 10) * 3) * (10 / 35)));
  });

  it('uses defender maxHP to scale partial exp', () => {
    const attacker = makeUnit({ level: 5 });
    const lowHpDefender = makeUnit({ level: 8, maxHP: 20 });
    const highHpDefender = makeUnit({ level: 8, maxHP: 80 });

    const lowHpExp = calculateExpGain(attacker, lowHpDefender, 10, false);
    const highHpExp = calculateExpGain(attacker, highHpDefender, 10, false);

    expect(lowHpExp).toBeGreaterThan(highHpExp);
  });

  it('ignores damage proportion when kill flag is true', () => {
    const attacker = makeUnit({ level: 5 });
    const defender = makeUnit({ level: 8, maxHP: 80 });

    const lowDamageKill = calculateExpGain(attacker, defender, 1, true);
    const highDamageKill = calculateExpGain(attacker, defender, 80, true);

    expect(lowDamageKill).toBe(highDamageKill);
  });

  it('handles defender maxHP of zero safely', () => {
    const attacker = makeUnit({ level: 5 });
    const defender = makeUnit({ level: 8, maxHP: 0 });

    const result = calculateExpGain(attacker, defender, 5, false);

    expect(result).toBe((8 - 5 + 10) * 3);
  });

  it.each([
    [5, 5, 30, false, 30, 30],
    [5, 6, 15, false, 30, 17],
    [5, 6, 30, true, 30, 63],
  ])(
    'matches expected exp output for levels %s->%s, damage %s, killed %s, defenderHP %s',
    (attackerLevel, defenderLevel, damage, killed, defenderHp, expected) => {
      const attacker = makeUnit({ level: attackerLevel });
      const defender = makeUnit({ level: defenderLevel, maxHP: defenderHp });

      const result = calculateExpGain(attacker, defender, damage, killed);

      expect(result).toBe(expected);
    },
  );
});
