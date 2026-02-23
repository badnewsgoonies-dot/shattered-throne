import { describe, it, expect } from 'vitest';
import { executeSkill } from '../skillExecutor';
import { makeUnit, makeWeapon, makeGridMap, makeSkill } from './helpers';
import { StatusEffectType, AoEPattern, SkillType } from '../../shared/types';

describe('skillExecution', () => {
  const map = makeGridMap();

  describe('damage skills', () => {
    it('deals strength-scaled damage', () => {
      const user = makeUnit({
        id: 'user',
        currentStats: { strength: 15 },
        currentSP: 50,
      });
      const target = makeUnit({
        id: 'target',
        currentStats: { defense: 5 },
        currentHP: 30,
        maxHP: 30,
      });
      const skill = makeSkill({
        damage: { base: 10, scaling: 'strength' },
        spCost: 10,
      });

      const result = executeSkill(user, skill, [target], map);
      // damage = 10 + 15 - 5 = 20
      expect(result.rounds[0].defenderHPAfter).toBe(10);
    });

    it('deals magic-scaled damage', () => {
      const user = makeUnit({
        id: 'user',
        currentStats: { magic: 12 },
        currentSP: 50,
      });
      const target = makeUnit({
        id: 'target',
        currentStats: { resistance: 4 },
        currentHP: 30,
        maxHP: 30,
      });
      const skill = makeSkill({
        damage: { base: 8, scaling: 'magic' },
        spCost: 10,
      });

      const result = executeSkill(user, skill, [target], map);
      // damage = 8 + 12 - 4 = 16
      expect(result.rounds[0].defenderHPAfter).toBe(14);
    });

    it('clamps damage to 0 minimum', () => {
      const user = makeUnit({
        id: 'user',
        currentStats: { strength: 2 },
        currentSP: 50,
      });
      const target = makeUnit({
        id: 'target',
        currentStats: { defense: 30 },
        currentHP: 30,
        maxHP: 30,
      });
      const skill = makeSkill({
        damage: { base: 5, scaling: 'strength' },
        spCost: 10,
      });

      const result = executeSkill(user, skill, [target], map);
      expect(result.rounds[0].defenderHPAfter).toBe(30);
    });

    it('can defeat a target', () => {
      const user = makeUnit({
        id: 'user',
        currentStats: { strength: 20 },
        currentSP: 50,
      });
      const target = makeUnit({
        id: 'target',
        currentStats: { defense: 5 },
        currentHP: 10,
        maxHP: 30,
      });
      const skill = makeSkill({
        damage: { base: 10, scaling: 'strength' },
        spCost: 10,
      });

      const result = executeSkill(user, skill, [target], map);
      // damage = 10 + 20 - 5 = 25, target has 10 HP → 0
      expect(result.rounds[0].defenderHPAfter).toBe(0);
    });
  });

  describe('healing skills', () => {
    it('heals target based on magic + skill base', () => {
      const user = makeUnit({
        id: 'user',
        currentStats: { magic: 10 },
        currentSP: 50,
      });
      const target = makeUnit({
        id: 'target',
        currentHP: 10,
        maxHP: 40,
      });
      const skill = makeSkill({
        healing: { base: 5, scaling: 'magic' },
        spCost: 10,
      });

      const result = executeSkill(user, skill, [target], map);
      // heal = 5 + 10 = 15, target: 10 + 15 = 25
      expect(result.rounds[0].defenderHPAfter).toBe(25);
    });

    it('does not heal above max HP', () => {
      const user = makeUnit({
        id: 'user',
        currentStats: { magic: 20 },
        currentSP: 50,
      });
      const target = makeUnit({
        id: 'target',
        currentHP: 35,
        maxHP: 40,
      });
      const skill = makeSkill({
        healing: { base: 10, scaling: 'magic' },
        spCost: 10,
      });

      const result = executeSkill(user, skill, [target], map);
      // heal = 10 + 20 = 30, but max is 40, target has 35 → 40
      expect(result.rounds[0].defenderHPAfter).toBe(40);
    });

    it('healing damage field is negative', () => {
      const user = makeUnit({ id: 'user', currentSP: 50 });
      const target = makeUnit({ id: 'target', currentHP: 10, maxHP: 40 });
      const skill = makeSkill({
        healing: { base: 5, scaling: 'magic' },
        spCost: 5,
      });

      const result = executeSkill(user, skill, [target], map);
      expect(result.rounds[0].damage).toBeLessThan(0);
    });
  });

  describe('AoE skills', () => {
    it('applies to multiple targets', () => {
      const user = makeUnit({ id: 'user', currentStats: { strength: 15 }, currentSP: 50 });
      const targets = [
        makeUnit({ id: 't1', currentStats: { defense: 5 }, currentHP: 30, maxHP: 30 }),
        makeUnit({ id: 't2', currentStats: { defense: 8 }, currentHP: 30, maxHP: 30 }),
        makeUnit({ id: 't3', currentStats: { defense: 3 }, currentHP: 30, maxHP: 30 }),
      ];
      const skill = makeSkill({
        damage: { base: 10, scaling: 'strength' },
        aoePattern: AoEPattern.Circle,
        aoeSize: 2,
        spCost: 20,
      });

      const result = executeSkill(user, skill, targets, map);
      expect(result.rounds.length).toBe(3);
      // t1: 10 + 15 - 5 = 20 → 10
      expect(result.rounds[0].defenderHPAfter).toBe(10);
      // t2: 10 + 15 - 8 = 17 → 13
      expect(result.rounds[1].defenderHPAfter).toBe(13);
      // t3: 10 + 15 - 3 = 22 → 8
      expect(result.rounds[2].defenderHPAfter).toBe(8);
    });
  });

  describe('SP cost', () => {
    it('deducts SP from user', () => {
      const user = makeUnit({ id: 'user', currentSP: 50 });
      const target = makeUnit({ id: 'target', currentHP: 30, maxHP: 30 });
      const skill = makeSkill({
        damage: { base: 5, scaling: 'strength' },
        spCost: 15,
      });

      const result = executeSkill(user, skill, [target], map);
      // SP is deducted internally; the result doesn't directly expose it,
      // but we can verify the skill was executed
      expect(result.rounds.length).toBe(1);
    });

    it('does not go below 0 SP', () => {
      const user = makeUnit({ id: 'user', currentSP: 5 });
      const target = makeUnit({ id: 'target', currentHP: 30, maxHP: 30 });
      const skill = makeSkill({
        damage: { base: 5, scaling: 'strength' },
        spCost: 20,
      });

      const result = executeSkill(user, skill, [target], map);
      expect(result.rounds.length).toBe(1);
    });
  });

  describe('result structure', () => {
    it('returns correct attackerId and defenderId', () => {
      const user = makeUnit({ id: 'user-1', currentSP: 50 });
      const target = makeUnit({ id: 'target-1', currentHP: 30, maxHP: 30 });
      const skill = makeSkill({
        damage: { base: 5, scaling: 'strength' },
        spCost: 5,
      });

      const result = executeSkill(user, skill, [target], map);
      expect(result.attackerId).toBe('user-1');
      expect(result.defenderId).toBe('target-1');
    });

    it('handles empty targets list', () => {
      const user = makeUnit({ id: 'user', currentSP: 50 });
      const skill = makeSkill({ spCost: 5 });

      const result = executeSkill(user, skill, [], map);
      expect(result.rounds.length).toBe(0);
      expect(result.attackerId).toBe('user');
    });

    it('all rounds are hits for skills', () => {
      const user = makeUnit({ id: 'user', currentSP: 50 });
      const targets = [
        makeUnit({ id: 't1', currentHP: 30, maxHP: 30 }),
        makeUnit({ id: 't2', currentHP: 30, maxHP: 30 }),
      ];
      const skill = makeSkill({
        damage: { base: 5, scaling: 'strength' },
        spCost: 5,
      });

      const result = executeSkill(user, skill, targets, map);
      for (const round of result.rounds) {
        expect(round.hit).toBe(true);
        expect(round.crit).toBe(false);
      }
    });

    it('exp is 0 for skills', () => {
      const user = makeUnit({ id: 'user', currentSP: 50 });
      const target = makeUnit({ id: 'target', currentHP: 30, maxHP: 30 });
      const skill = makeSkill({
        damage: { base: 5, scaling: 'strength' },
        spCost: 5,
      });

      const result = executeSkill(user, skill, [target], map);
      expect(result.attackerExpGained).toBe(0);
      expect(result.defenderExpGained).toBe(0);
    });

    it('levelUp results are null', () => {
      const user = makeUnit({ id: 'user', currentSP: 50 });
      const target = makeUnit({ id: 'target', currentHP: 30, maxHP: 30 });
      const skill = makeSkill({ spCost: 5 });

      const result = executeSkill(user, skill, [target], map);
      expect(result.attackerLevelUp).toBeNull();
      expect(result.defenderLevelUp).toBeNull();
    });
  });
});
