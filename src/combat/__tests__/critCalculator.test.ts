import { describe, it, expect } from 'vitest';
import { calculateCritRate } from '../hitCalculator';
import { makeUnit, makeWeapon } from './helpers';
import { UnitClassName } from '../../shared/types';

describe('critCalculator', () => {
  it('basic crit formula: skill/2 + weapon.crit - defender.luck', () => {
    const attacker = makeUnit({ currentStats: { skill: 16 } });
    const defender = makeUnit({ currentStats: { luck: 4 } });
    const weapon = makeWeapon({ crit: 5 });
    // floor(16/2) + 5 - 4 = 8 + 5 - 4 = 9
    expect(calculateCritRate(attacker, defender, weapon)).toBe(9);
  });

  it('Berserker gets +10 crit bonus', () => {
    const attacker = makeUnit({ className: UnitClassName.Berserker, currentStats: { skill: 10 } });
    const defender = makeUnit({ currentStats: { luck: 2 } });
    const weapon = makeWeapon({ crit: 5 });
    // floor(10/2) + 5 + 10 - 2 = 5 + 5 + 10 - 2 = 18
    expect(calculateCritRate(attacker, defender, weapon)).toBe(18);
  });

  it('Assassin gets +15 crit bonus', () => {
    const attacker = makeUnit({ className: UnitClassName.Assassin, currentStats: { skill: 10 } });
    const defender = makeUnit({ currentStats: { luck: 2 } });
    const weapon = makeWeapon({ crit: 5 });
    // 5 + 5 + 15 - 2 = 23
    expect(calculateCritRate(attacker, defender, weapon)).toBe(23);
  });

  it('Sniper gets +10 crit bonus', () => {
    const attacker = makeUnit({ className: UnitClassName.Sniper, currentStats: { skill: 10 } });
    const defender = makeUnit({ currentStats: { luck: 2 } });
    const weapon = makeWeapon({ crit: 5 });
    // 5 + 5 + 10 - 2 = 18
    expect(calculateCritRate(attacker, defender, weapon)).toBe(18);
  });

  it('Thief gets +5 crit bonus', () => {
    const attacker = makeUnit({ className: UnitClassName.Thief, currentStats: { skill: 10 } });
    const defender = makeUnit({ currentStats: { luck: 2 } });
    const weapon = makeWeapon({ crit: 5 });
    // 5 + 5 + 5 - 2 = 13
    expect(calculateCritRate(attacker, defender, weapon)).toBe(13);
  });

  it('non-crit classes get no bonus', () => {
    const classes = [
      UnitClassName.Warrior, UnitClassName.Knight, UnitClassName.Archer,
      UnitClassName.Mage, UnitClassName.Cleric, UnitClassName.Paladin,
    ];
    for (const cls of classes) {
      const attacker = makeUnit({ className: cls, currentStats: { skill: 10 } });
      const defender = makeUnit({ currentStats: { luck: 2 } });
      const weapon = makeWeapon({ crit: 5 });
      // 5 + 5 + 0 - 2 = 8
      expect(calculateCritRate(attacker, defender, weapon)).toBe(8);
    }
  });

  it('crit rate clamps to 0', () => {
    const attacker = makeUnit({ currentStats: { skill: 2 } });
    const defender = makeUnit({ currentStats: { luck: 50 } });
    const weapon = makeWeapon({ crit: 0 });
    expect(calculateCritRate(attacker, defender, weapon)).toBe(0);
  });

  it('crit rate clamps to 100', () => {
    const attacker = makeUnit({
      className: UnitClassName.Assassin,
      currentStats: { skill: 60 },
    });
    const defender = makeUnit({ currentStats: { luck: 0 } });
    const weapon = makeWeapon({ crit: 80 });
    // floor(60/2) + 80 + 15 - 0 = 30 + 80 + 15 = 125 → clamp 100
    expect(calculateCritRate(attacker, defender, weapon)).toBe(100);
  });

  it('forge crit bonus is added', () => {
    const attacker = makeUnit({ currentStats: { skill: 10 } });
    const defender = makeUnit({ currentStats: { luck: 3 } });
    const weapon = makeWeapon({
      crit: 5,
      forgeBonuses: { might: 0, hit: 0, crit: 7 },
    } as any);
    // floor(10/2) + 5 + 7 - 3 = 5 + 5 + 7 - 3 = 14
    expect(calculateCritRate(attacker, defender, weapon)).toBe(14);
  });

  it('zero skill gives 0 from skill component', () => {
    const attacker = makeUnit({ currentStats: { skill: 0 } });
    const defender = makeUnit({ currentStats: { luck: 0 } });
    const weapon = makeWeapon({ crit: 10 });
    // floor(0/2) + 10 - 0 = 10
    expect(calculateCritRate(attacker, defender, weapon)).toBe(10);
  });

  it('odd skill floors properly', () => {
    const attacker = makeUnit({ currentStats: { skill: 7 } });
    const defender = makeUnit({ currentStats: { luck: 0 } });
    const weapon = makeWeapon({ crit: 0 });
    // floor(7/2) = 3
    expect(calculateCritRate(attacker, defender, weapon)).toBe(3);
  });

  it('high defender luck reduces crit significantly', () => {
    const attacker = makeUnit({ currentStats: { skill: 20 } });
    const defender = makeUnit({ currentStats: { luck: 15 } });
    const weapon = makeWeapon({ crit: 5 });
    // floor(20/2) + 5 - 15 = 10 + 5 - 15 = 0
    expect(calculateCritRate(attacker, defender, weapon)).toBe(0);
  });
});
