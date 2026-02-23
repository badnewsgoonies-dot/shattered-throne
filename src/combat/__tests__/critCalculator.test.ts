import { describe, expect, it } from 'vitest';
import { UnitClassName } from '../../shared/types';
import { calculateCritRate } from '../hitCalculator';
import { makeUnit, makeWeapon } from './testUtils';

describe('hitCalculator.calculateCritRate', () => {
  it('calculates base crit rate from skill/2 + weapon crit - defender luck', () => {
    const attacker = makeUnit({ className: UnitClassName.Warrior, currentStats: { skill: 12 } });
    const defender = makeUnit({ currentStats: { luck: 7 } });
    const weapon = makeWeapon({ crit: 15 });

    const result = calculateCritRate(attacker, defender, weapon);

    expect(result).toBe(14);
  });

  it.each([
    [UnitClassName.Berserker, 10],
    [UnitClassName.Assassin, 15],
    [UnitClassName.Sniper, 10],
    [UnitClassName.Thief, 5],
  ])('applies class crit bonus for %s', (className, classBonus) => {
    const attacker = makeUnit({ className, currentStats: { skill: 10 } });
    const defender = makeUnit({ currentStats: { luck: 5 } });
    const weapon = makeWeapon({ crit: 10 });

    const result = calculateCritRate(attacker, defender, weapon);

    expect(result).toBe(10 + classBonus);
  });

  it('does not apply class bonus for unrelated classes', () => {
    const attacker = makeUnit({ className: UnitClassName.Mage, currentStats: { skill: 10 } });
    const defender = makeUnit({ currentStats: { luck: 5 } });
    const weapon = makeWeapon({ crit: 10 });

    const result = calculateCritRate(attacker, defender, weapon);

    expect(result).toBe(10);
  });

  it('adds forge crit bonus to crit rate', () => {
    const attacker = makeUnit({ className: UnitClassName.Warrior, currentStats: { skill: 12 } });
    const defender = makeUnit({ currentStats: { luck: 5 } });
    const forged = makeWeapon({ crit: 10, forgeBonuses: { might: 0, hit: 0, crit: 8 } });

    const result = calculateCritRate(attacker, defender, forged);

    expect(result).toBe(19);
  });

  it('uses half skill and preserves .5 outcomes before clamping', () => {
    const attacker = makeUnit({ className: UnitClassName.Warrior, currentStats: { skill: 11 } });
    const defender = makeUnit({ currentStats: { luck: 4 } });
    const weapon = makeWeapon({ crit: 7 });

    const result = calculateCritRate(attacker, defender, weapon);

    expect(result).toBe(8.5);
  });

  it('clamps crit to minimum 0', () => {
    const attacker = makeUnit({ className: UnitClassName.Warrior, currentStats: { skill: 0 } });
    const defender = makeUnit({ currentStats: { luck: 30 } });
    const weapon = makeWeapon({ crit: 0 });

    const result = calculateCritRate(attacker, defender, weapon);

    expect(result).toBe(0);
  });

  it('clamps crit to maximum 100', () => {
    const attacker = makeUnit({ className: UnitClassName.Assassin, currentStats: { skill: 80 } });
    const defender = makeUnit({ currentStats: { luck: 0 } });
    const weapon = makeWeapon({ crit: 90 });

    const result = calculateCritRate(attacker, defender, weapon);

    expect(result).toBe(100);
  });

  it.each([
    [5, 2.5],
    [10, 5],
    [17, 8.5],
  ])('scales with attacker skill (%s skill -> %s crit before other modifiers)', (skill, expectedSkillContribution) => {
    const attacker = makeUnit({ currentStats: { skill } });
    const defender = makeUnit({ currentStats: { luck: 0 } });
    const weapon = makeWeapon({ crit: 0 });

    const result = calculateCritRate(attacker, defender, weapon);

    expect(result).toBe(expectedSkillContribution);
  });
});
