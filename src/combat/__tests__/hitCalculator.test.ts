import { describe, expect, it } from 'vitest';
import { SUPPORT_HIT_EVADE_BONUS_PER_ALLY } from '../../shared/types';
import { calculateHitRate } from '../hitCalculator';
import { makeTerrain, makeUnit, makeWeapon } from './testUtils';

describe('hitCalculator.calculateHitRate', () => {
  it('calculates hit rate from stats, weapon hit, and terrain evasion', () => {
    const attacker = makeUnit({ currentStats: { skill: 12, luck: 8 } });
    const defender = makeUnit({ currentStats: { speed: 10, luck: 6 } });
    const weapon = makeWeapon({ hit: 80 });
    const terrain = makeTerrain({ evasionBonus: 10 });

    const result = calculateHitRate(attacker, defender, weapon, terrain, 0);

    expect(result).toBe(76);
  });

  it.each([0, 1, 2, 3])('applies support bonus per adjacent ally (%s allies)', (adjacentAllies) => {
    const attacker = makeUnit({ currentStats: { skill: 10, luck: 6 } });
    const defender = makeUnit({ currentStats: { speed: 8, luck: 5 } });
    const weapon = makeWeapon({ hit: 75 });

    const result = calculateHitRate(attacker, defender, weapon, makeTerrain(), adjacentAllies);

    expect(result).toBe(Math.min(100, 80 + adjacentAllies * SUPPORT_HIT_EVADE_BONUS_PER_ALLY));
  });

  it('subtracts larger terrain evasion values correctly', () => {
    const attacker = makeUnit({ currentStats: { skill: 10, luck: 5 } });
    const defender = makeUnit({ currentStats: { speed: 8, luck: 4 } });
    const weapon = makeWeapon({ hit: 70 });

    const lowEvasion = calculateHitRate(attacker, defender, weapon, makeTerrain({ evasionBonus: 5 }), 0);
    const highEvasion = calculateHitRate(attacker, defender, weapon, makeTerrain({ evasionBonus: 25 }), 0);

    expect(lowEvasion - highEvasion).toBe(20);
  });

  it('includes forge hit bonus from weapon data', () => {
    const attacker = makeUnit({ currentStats: { skill: 10, luck: 5 } });
    const defender = makeUnit({ currentStats: { speed: 10, luck: 5 } });
    const normalWeapon = makeWeapon({ hit: 70 });
    const forgedWeapon = makeWeapon({ hit: 70, forgeBonuses: { might: 0, hit: 12, crit: 0 } });

    const normalHit = calculateHitRate(attacker, defender, normalWeapon, makeTerrain(), 0);
    const forgedHit = calculateHitRate(attacker, defender, forgedWeapon, makeTerrain(), 0);

    expect(forgedHit - normalHit).toBe(12);
  });

  it('clamps hit rate to 100 maximum', () => {
    const attacker = makeUnit({ currentStats: { skill: 50, luck: 50 } });
    const defender = makeUnit({ currentStats: { speed: 1, luck: 1 } });
    const weapon = makeWeapon({ hit: 100 });

    const result = calculateHitRate(attacker, defender, weapon, makeTerrain({ evasionBonus: 0 }), 3);

    expect(result).toBe(100);
  });

  it('clamps hit rate to 0 minimum', () => {
    const attacker = makeUnit({ currentStats: { skill: 0, luck: 0 } });
    const defender = makeUnit({ currentStats: { speed: 50, luck: 50 } });
    const weapon = makeWeapon({ hit: 10 });

    const result = calculateHitRate(attacker, defender, weapon, makeTerrain({ evasionBonus: 30 }), 0);

    expect(result).toBe(0);
  });

  it('responds to defender speed changes linearly', () => {
    const attacker = makeUnit({ currentStats: { skill: 10, luck: 5 } });
    const slowDefender = makeUnit({ currentStats: { speed: 5, luck: 5 } });
    const fastDefender = makeUnit({ currentStats: { speed: 8, luck: 5 } });
    const weapon = makeWeapon({ hit: 70 });

    const slowResult = calculateHitRate(attacker, slowDefender, weapon, makeTerrain(), 0);
    const fastResult = calculateHitRate(attacker, fastDefender, weapon, makeTerrain(), 0);

    expect(slowResult - fastResult).toBe(6);
  });

  it('responds to attacker skill changes linearly', () => {
    const lowSkillAttacker = makeUnit({ currentStats: { skill: 8, luck: 5 } });
    const highSkillAttacker = makeUnit({ currentStats: { skill: 11, luck: 5 } });
    const defender = makeUnit({ currentStats: { speed: 8, luck: 5 } });
    const weapon = makeWeapon({ hit: 70 });

    const lowResult = calculateHitRate(lowSkillAttacker, defender, weapon, makeTerrain(), 0);
    const highResult = calculateHitRate(highSkillAttacker, defender, weapon, makeTerrain(), 0);

    expect(highResult - lowResult).toBe(6);
  });

  it('responds to attacker luck changes linearly', () => {
    const lowLuckAttacker = makeUnit({ currentStats: { skill: 8, luck: 3 } });
    const highLuckAttacker = makeUnit({ currentStats: { skill: 8, luck: 7 } });
    const defender = makeUnit({ currentStats: { speed: 8, luck: 5 } });
    const weapon = makeWeapon({ hit: 70 });

    const lowResult = calculateHitRate(lowLuckAttacker, defender, weapon, makeTerrain(), 0);
    const highResult = calculateHitRate(highLuckAttacker, defender, weapon, makeTerrain(), 0);

    expect(highResult - lowResult).toBe(4);
  });

  it('handles negative adjacent ally input consistently', () => {
    const attacker = makeUnit({ currentStats: { skill: 10, luck: 5 } });
    const defender = makeUnit({ currentStats: { speed: 8, luck: 5 } });
    const weapon = makeWeapon({ hit: 70 });

    const result = calculateHitRate(attacker, defender, weapon, makeTerrain(), -1);

    expect(result).toBe(64);
  });

  it('returns an integer-like number for integer inputs', () => {
    const attacker = makeUnit({ currentStats: { skill: 11, luck: 5 } });
    const defender = makeUnit({ currentStats: { speed: 9, luck: 5 } });
    const weapon = makeWeapon({ hit: 75 });

    const result = calculateHitRate(attacker, defender, weapon, makeTerrain(), 1);

    expect(Number.isInteger(result)).toBe(true);
  });

  it.each([
    [0, 0, 0, 0, 0, 0],
    [8, 5, 8, 5, 70, 70],
    [15, 10, 12, 6, 85, 95],
  ])(
    'matches formula for attacker skill/luck %s/%s defender speed/luck %s/%s weapon hit %s',
    (askill, aluck, dspeed, dluck, weaponHit, expected) => {
      const attacker = makeUnit({ currentStats: { skill: askill, luck: aluck } });
      const defender = makeUnit({ currentStats: { speed: dspeed, luck: dluck } });
      const weapon = makeWeapon({ hit: weaponHit });

      const result = calculateHitRate(attacker, defender, weapon, makeTerrain(), 0);

      expect(result).toBe(expected);
    },
  );
});
