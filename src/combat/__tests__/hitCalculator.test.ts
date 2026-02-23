import { describe, it, expect } from 'vitest';
import { calculateHitRate, calculateCritRate } from '../hitCalculator';
import { makeUnit, makeWeapon, makeTerrain } from './helpers';
import {
  UnitClassName,
  SUPPORT_HIT_EVADE_BONUS_PER_ALLY,
  HEIGHT_ADVANTAGE_HIT_BONUS,
  HEIGHT_DISADVANTAGE_HIT_PENALTY,
} from '../../shared/types';

describe('hitCalculator', () => {
  describe('calculateHitRate', () => {
    it('calculates basic hit rate correctly', () => {
      const attacker = makeUnit({ currentStats: { skill: 10, luck: 5 } });
      const defender = makeUnit({ currentStats: { speed: 5, luck: 3 } });
      const weapon = makeWeapon({ hit: 90 });
      const terrain = makeTerrain({ evasionBonus: 0 });
      // hitRate = (10*2 + 5) + 90 - (5*2 + 3) - 0 = 25 + 90 - 13 = 102 → clamp to 100
      expect(calculateHitRate(attacker, defender, weapon, terrain, 0)).toBe(100);
    });

    it('applies terrain evasion bonus', () => {
      const attacker = makeUnit({ currentStats: { skill: 10, luck: 5 } });
      const defender = makeUnit({ currentStats: { speed: 8, luck: 5 } });
      const weapon = makeWeapon({ hit: 80 });
      const terrain = makeTerrain({ evasionBonus: 20 });
      // hitRate = (20 + 5) + 80 - (16 + 5) - 20 = 25 + 80 - 21 - 20 = 64
      expect(calculateHitRate(attacker, defender, weapon, terrain, 0)).toBe(64);
    });

    it('applies support bonus for adjacent allies', () => {
      const attacker = makeUnit({ currentStats: { skill: 10, luck: 5 } });
      const defender = makeUnit({ currentStats: { speed: 10, luck: 5 } });
      const weapon = makeWeapon({ hit: 80 });
      const terrain = makeTerrain();
      // base = 25 + 80 - 25 = 80
      // with 2 allies: +20
      expect(calculateHitRate(attacker, defender, weapon, terrain, 2)).toBe(100);
    });

    it('applies defender support evasion', () => {
      const attacker = makeUnit({ currentStats: { skill: 10, luck: 5 } });
      const defender = makeUnit({ currentStats: { speed: 10, luck: 5 } });
      const weapon = makeWeapon({ hit: 80 });
      const terrain = makeTerrain();
      // base = 25 + 80 - 25 = 80
      // defender has 2 adjacent allies: -20
      expect(calculateHitRate(attacker, defender, weapon, terrain, 0, 0, undefined, 2)).toBe(60);
    });

    it('applies height advantage hit bonus', () => {
      const attacker = makeUnit({ currentStats: { skill: 10, luck: 5 } });
      const defender = makeUnit({ currentStats: { speed: 10, luck: 5 } });
      const weapon = makeWeapon({ hit: 70 });
      const atkTerrain = makeTerrain({ heightLevel: 2 });
      const defTerrain = makeTerrain({ heightLevel: 0 });
      // base = 25 + 70 - 25 = 70
      // height advantage: +15
      expect(calculateHitRate(attacker, defender, weapon, defTerrain, 0, 0, atkTerrain)).toBe(85);
    });

    it('applies height disadvantage hit penalty', () => {
      const attacker = makeUnit({ currentStats: { skill: 10, luck: 5 } });
      const defender = makeUnit({ currentStats: { speed: 10, luck: 5 } });
      const weapon = makeWeapon({ hit: 70 });
      const atkTerrain = makeTerrain({ heightLevel: 0 });
      const defTerrain = makeTerrain({ heightLevel: 2 });
      // base = 70
      // height disadvantage: -15
      expect(calculateHitRate(attacker, defender, weapon, defTerrain, 0, 0, atkTerrain)).toBe(55);
    });

    it('clamps hit rate to minimum 0', () => {
      const attacker = makeUnit({ currentStats: { skill: 1, luck: 0 } });
      const defender = makeUnit({ currentStats: { speed: 30, luck: 20 } });
      const weapon = makeWeapon({ hit: 10 });
      const terrain = makeTerrain({ evasionBonus: 30 });
      expect(calculateHitRate(attacker, defender, weapon, terrain, 0)).toBe(0);
    });

    it('clamps hit rate to maximum 100', () => {
      const attacker = makeUnit({ currentStats: { skill: 30, luck: 20 } });
      const defender = makeUnit({ currentStats: { speed: 1, luck: 0 } });
      const weapon = makeWeapon({ hit: 100 });
      const terrain = makeTerrain();
      expect(calculateHitRate(attacker, defender, weapon, terrain, 5)).toBe(100);
    });

    it('applies weapon triangle hit bonus', () => {
      const attacker = makeUnit({ currentStats: { skill: 10, luck: 5 } });
      const defender = makeUnit({ currentStats: { speed: 10, luck: 5 } });
      const weapon = makeWeapon({ hit: 70 });
      const terrain = makeTerrain();
      // base = 70, triangle hit bonus = +15
      expect(calculateHitRate(attacker, defender, weapon, terrain, 0, 15)).toBe(85);
    });

    it('applies weapon triangle hit penalty', () => {
      const attacker = makeUnit({ currentStats: { skill: 10, luck: 5 } });
      const defender = makeUnit({ currentStats: { speed: 10, luck: 5 } });
      const weapon = makeWeapon({ hit: 70 });
      const terrain = makeTerrain();
      // base = 70, triangle hit penalty = -15
      expect(calculateHitRate(attacker, defender, weapon, terrain, 0, -15)).toBe(55);
    });

    it('applies forge hit bonus', () => {
      const attacker = makeUnit({ currentStats: { skill: 10, luck: 5 } });
      const defender = makeUnit({ currentStats: { speed: 10, luck: 5 } });
      const weapon = makeWeapon({
        hit: 70,
        forgeBonuses: { might: 0, hit: 10, crit: 0 },
      } as any);
      const terrain = makeTerrain();
      // base = 25 + 70 + 10 - 25 = 80
      expect(calculateHitRate(attacker, defender, weapon, terrain, 0)).toBe(80);
    });

    it('equal heights give no bonus', () => {
      const attacker = makeUnit({ currentStats: { skill: 10, luck: 5 } });
      const defender = makeUnit({ currentStats: { speed: 10, luck: 5 } });
      const weapon = makeWeapon({ hit: 70 });
      const atkTerrain = makeTerrain({ heightLevel: 1 });
      const defTerrain = makeTerrain({ heightLevel: 1 });
      expect(calculateHitRate(attacker, defender, weapon, defTerrain, 0, 0, atkTerrain)).toBe(70);
    });

    it('combines all modifiers together', () => {
      const attacker = makeUnit({ currentStats: { skill: 12, luck: 8 } });
      const defender = makeUnit({ currentStats: { speed: 6, luck: 4 } });
      const weapon = makeWeapon({ hit: 75 });
      const atkTerrain = makeTerrain({ heightLevel: 2 });
      const defTerrain = makeTerrain({ evasionBonus: 10, heightLevel: 0 });
      // hit = (24 + 8) + 75 - (12 + 4) - 10 + 10 (1 ally) - 0 + 15 (height) + 5 (triangle)
      // = 32 + 75 - 16 - 10 + 10 + 15 + 5 = 111 → clamp 100
      expect(calculateHitRate(attacker, defender, weapon, defTerrain, 1, 5, atkTerrain, 0)).toBe(100);
    });
  });

  describe('calculateCritRate', () => {
    it('calculates basic crit rate', () => {
      const attacker = makeUnit({ currentStats: { skill: 20 } });
      const defender = makeUnit({ currentStats: { luck: 5 } });
      const weapon = makeWeapon({ crit: 10 });
      // crit = floor(20/2) + 10 - 5 = 10 + 10 - 5 = 15
      expect(calculateCritRate(attacker, defender, weapon)).toBe(15);
    });

    it('applies Berserker class bonus (+10)', () => {
      const attacker = makeUnit({
        className: UnitClassName.Berserker,
        currentStats: { skill: 20 },
      });
      const defender = makeUnit({ currentStats: { luck: 5 } });
      const weapon = makeWeapon({ crit: 10 });
      // crit = 10 + 10 + 10 - 5 = 25
      expect(calculateCritRate(attacker, defender, weapon)).toBe(25);
    });

    it('applies Assassin class bonus (+15)', () => {
      const attacker = makeUnit({
        className: UnitClassName.Assassin,
        currentStats: { skill: 20 },
      });
      const defender = makeUnit({ currentStats: { luck: 5 } });
      const weapon = makeWeapon({ crit: 10 });
      // crit = 10 + 10 + 15 - 5 = 30
      expect(calculateCritRate(attacker, defender, weapon)).toBe(30);
    });

    it('applies Sniper class bonus (+10)', () => {
      const attacker = makeUnit({
        className: UnitClassName.Sniper,
        currentStats: { skill: 20 },
      });
      const defender = makeUnit({ currentStats: { luck: 5 } });
      const weapon = makeWeapon({ crit: 10 });
      expect(calculateCritRate(attacker, defender, weapon)).toBe(25);
    });

    it('applies Thief class bonus (+5)', () => {
      const attacker = makeUnit({
        className: UnitClassName.Thief,
        currentStats: { skill: 20 },
      });
      const defender = makeUnit({ currentStats: { luck: 5 } });
      const weapon = makeWeapon({ crit: 10 });
      expect(calculateCritRate(attacker, defender, weapon)).toBe(20);
    });

    it('no class bonus for regular classes', () => {
      const attacker = makeUnit({
        className: UnitClassName.Warrior,
        currentStats: { skill: 20 },
      });
      const defender = makeUnit({ currentStats: { luck: 5 } });
      const weapon = makeWeapon({ crit: 10 });
      expect(calculateCritRate(attacker, defender, weapon)).toBe(15);
    });

    it('clamps to minimum 0', () => {
      const attacker = makeUnit({ currentStats: { skill: 2 } });
      const defender = makeUnit({ currentStats: { luck: 30 } });
      const weapon = makeWeapon({ crit: 0 });
      expect(calculateCritRate(attacker, defender, weapon)).toBe(0);
    });

    it('clamps to maximum 100', () => {
      const attacker = makeUnit({
        className: UnitClassName.Assassin,
        currentStats: { skill: 50 },
      });
      const defender = makeUnit({ currentStats: { luck: 0 } });
      const weapon = makeWeapon({ crit: 50 });
      expect(calculateCritRate(attacker, defender, weapon)).toBe(90);
    });

    it('applies forge crit bonus', () => {
      const attacker = makeUnit({ currentStats: { skill: 20 } });
      const defender = makeUnit({ currentStats: { luck: 5 } });
      const weapon = makeWeapon({
        crit: 10,
        forgeBonuses: { might: 0, hit: 0, crit: 5 },
      } as any);
      // crit = 10 + 10 + 5 - 5 = 20
      expect(calculateCritRate(attacker, defender, weapon)).toBe(20);
    });

    it('handles odd skill values (floor division)', () => {
      const attacker = makeUnit({ currentStats: { skill: 15 } });
      const defender = makeUnit({ currentStats: { luck: 3 } });
      const weapon = makeWeapon({ crit: 5 });
      // crit = floor(15/2) + 5 - 3 = 7 + 5 - 3 = 9
      expect(calculateCritRate(attacker, defender, weapon)).toBe(9);
    });
  });
});
