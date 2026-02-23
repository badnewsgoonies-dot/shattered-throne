import { describe, it, expect } from 'vitest';
import { calculateExpGain } from '../expCalculator';
import { makeUnit } from './helpers';
import { KILL_EXP_BONUS } from '../../shared/types';

describe('expCalculator', () => {
  it('calculates base exp from level difference', () => {
    const attacker = makeUnit({ level: 5 });
    const defender = makeUnit({ level: 5, maxHP: 20 });
    // base = (5 - 5 + 10) * 3 = 30
    // killed: 30 + 30 = 60
    expect(calculateExpGain(attacker, defender, 20, true)).toBe(60);
  });

  it('gives more exp for higher level enemies', () => {
    const attacker = makeUnit({ level: 3 });
    const defender = makeUnit({ level: 8, maxHP: 20 });
    // base = (8 - 3 + 10) * 3 = 45
    // killed: 45 + 30 = 75
    expect(calculateExpGain(attacker, defender, 20, true)).toBe(75);
  });

  it('gives less exp for lower level enemies', () => {
    const attacker = makeUnit({ level: 10 });
    const defender = makeUnit({ level: 3, maxHP: 20 });
    // base = (3 - 10 + 10) * 3 = 9
    // killed: 9 + 30 = 39
    expect(calculateExpGain(attacker, defender, 20, true)).toBe(39);
  });

  it('applies kill bonus', () => {
    const attacker = makeUnit({ level: 5 });
    const defender = makeUnit({ level: 5, maxHP: 20 });
    const withKill = calculateExpGain(attacker, defender, 20, true);
    const withoutKill = calculateExpGain(attacker, defender, 10, false);
    expect(withKill).toBeGreaterThan(withoutKill);
  });

  it('scales exp by damage dealt when not killed', () => {
    const attacker = makeUnit({ level: 5 });
    const defender = makeUnit({ level: 5, maxHP: 40 });
    // base = 30
    // partial: floor(30 * 10/40) = floor(7.5) = 7
    expect(calculateExpGain(attacker, defender, 10, false)).toBe(7);
  });

  it('gives full base exp when dealing max HP damage but not killed', () => {
    const attacker = makeUnit({ level: 5 });
    const defender = makeUnit({ level: 5, maxHP: 20 });
    // base = 30
    // partial: floor(30 * 20/20) = 30
    expect(calculateExpGain(attacker, defender, 20, false)).toBe(30);
  });

  it('clamps minimum to 1 exp when damage dealt', () => {
    const attacker = makeUnit({ level: 20 });
    const defender = makeUnit({ level: 1, maxHP: 50 });
    // base = (1 - 20 + 10) * 3 = -27
    // partial: floor(-27 * 1/50) = -1 → clamp to 1
    expect(calculateExpGain(attacker, defender, 1, false)).toBe(1);
  });

  it('clamps minimum to 1 exp when killed', () => {
    const attacker = makeUnit({ level: 20 });
    const defender = makeUnit({ level: 1, maxHP: 20 });
    // base = (1 - 20 + 10) * 3 = -27
    // killed: -27 + 30 = 3
    expect(calculateExpGain(attacker, defender, 20, true)).toBe(3);
  });

  it('clamps maximum to 100 exp', () => {
    const attacker = makeUnit({ level: 1 });
    const defender = makeUnit({ level: 30, maxHP: 20 });
    // base = (30 - 1 + 10) * 3 = 117
    // killed: 117 + 30 = 147 → clamp to 100
    expect(calculateExpGain(attacker, defender, 20, true)).toBe(100);
  });

  it('returns 0 exp for 0 damage and no kill', () => {
    const attacker = makeUnit({ level: 5 });
    const defender = makeUnit({ level: 5, maxHP: 20 });
    expect(calculateExpGain(attacker, defender, 0, false)).toBe(0);
  });

  it('gives minimum 1 for kill even at 0 damage', () => {
    const attacker = makeUnit({ level: 20 });
    const defender = makeUnit({ level: 1, maxHP: 20 });
    // Killed but no damage dealt
    // base = (1 - 20 + 10) * 3 = -27
    // killed: -27 + 30 = 3
    expect(calculateExpGain(attacker, defender, 0, true)).toBe(3);
  });

  it('handles same level units', () => {
    const attacker = makeUnit({ level: 10 });
    const defender = makeUnit({ level: 10, maxHP: 30 });
    // base = (10 - 10 + 10) * 3 = 30
    // killed: 30 + 30 = 60
    expect(calculateExpGain(attacker, defender, 30, true)).toBe(60);
  });

  it('handles partial damage as fraction of maxHP', () => {
    const attacker = makeUnit({ level: 5 });
    const defender = makeUnit({ level: 5, maxHP: 100 });
    // base = 30
    // partial: floor(30 * 25/100) = 7
    expect(calculateExpGain(attacker, defender, 25, false)).toBe(7);
  });

  it('kill exp includes KILL_EXP_BONUS constant', () => {
    const attacker = makeUnit({ level: 5 });
    const defender = makeUnit({ level: 5, maxHP: 20 });
    const exp = calculateExpGain(attacker, defender, 20, true);
    // base = 30, killed = 30 + 30 = 60
    expect(exp).toBe(30 + KILL_EXP_BONUS);
  });
});
