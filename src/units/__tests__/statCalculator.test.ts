import { describe, expect, it } from 'vitest';
import { StatusEffectType } from '../../shared/types';
import { getEffectiveStats } from '../statCalculator';
import {
  makeArmorData,
  makeUnit,
  makeWeaponData,
} from './testUtils';

describe('statCalculator.getEffectiveStats', () => {
  it('returns current stats copy when no weapon armor or status effects', () => {
    const unit = makeUnit({ currentStats: { hp: 30, strength: 12, speed: 9, defense: 8, resistance: 4 } });

    const stats = getEffectiveStats(unit, null, []);

    expect(stats).toEqual(unit.currentStats);
    expect(stats).not.toBe(unit.currentStats);
  });

  it('applies weapon speed penalty when weapon weight exceeds strength', () => {
    const unit = makeUnit({ currentStats: { strength: 7, speed: 12 } });
    const weapon = makeWeaponData({ weight: 11 });

    const stats = getEffectiveStats(unit, weapon, []);

    expect(stats.speed).toBe(8);
  });

  it('applies no weapon speed penalty when strength meets weapon weight', () => {
    const unit = makeUnit({ currentStats: { strength: 11, speed: 12 } });
    const weapon = makeWeaponData({ weight: 11 });

    const stats = getEffectiveStats(unit, weapon, []);

    expect(stats.speed).toBe(12);
  });

  it('never increases speed from weapon penalty calculation', () => {
    const unit = makeUnit({ currentStats: { strength: 20, speed: 10 } });
    const weapon = makeWeaponData({ weight: 1 });

    const stats = getEffectiveStats(unit, weapon, []);

    expect(stats.speed).toBe(10);
  });

  it('adds defense and resistance from a single armor piece', () => {
    const unit = makeUnit({ currentStats: { defense: 6, resistance: 3 } });
    const armor = makeArmorData({ defense: 2, resistance: 4 });

    const stats = getEffectiveStats(unit, null, [armor]);

    expect(stats.defense).toBe(8);
    expect(stats.resistance).toBe(7);
  });

  it('applies armor speed penalty', () => {
    const unit = makeUnit({ currentStats: { speed: 10 } });
    const armor = makeArmorData({ speedPenalty: 3 });

    const stats = getEffectiveStats(unit, null, [armor]);

    expect(stats.speed).toBe(7);
  });

  it('stacks defense bonuses from multiple armor pieces', () => {
    const unit = makeUnit({ currentStats: { defense: 5 } });
    const armorA = makeArmorData({ defense: 2 });
    const armorB = makeArmorData({ defense: 3, id: 'armor_b' });

    const stats = getEffectiveStats(unit, null, [armorA, armorB]);

    expect(stats.defense).toBe(10);
  });

  it('stacks resistance bonuses from multiple armor pieces', () => {
    const unit = makeUnit({ currentStats: { resistance: 4 } });
    const armorA = makeArmorData({ resistance: 1 });
    const armorB = makeArmorData({ resistance: 2, id: 'armor_b' });

    const stats = getEffectiveStats(unit, null, [armorA, armorB]);

    expect(stats.resistance).toBe(7);
  });

  it('stacks speed penalties from multiple armor pieces', () => {
    const unit = makeUnit({ currentStats: { speed: 12 } });
    const armorA = makeArmorData({ speedPenalty: 2 });
    const armorB = makeArmorData({ speedPenalty: 3, id: 'armor_b' });

    const stats = getEffectiveStats(unit, null, [armorA, armorB]);

    expect(stats.speed).toBe(7);
  });

  it('applies berserk status with +50 percent strength', () => {
    const unit = makeUnit({
      currentStats: { strength: 11 },
      activeStatusEffects: [{ type: StatusEffectType.Berserk, remainingTurns: 2, sourceUnitId: 'enemy_1' }],
    });

    const stats = getEffectiveStats(unit, null, []);

    expect(stats.strength).toBe(17);
  });

  it('does not alter non-strength stats from berserk', () => {
    const unit = makeUnit({
      currentStats: { skill: 8, defense: 9 },
      activeStatusEffects: [{ type: StatusEffectType.Berserk, remainingTurns: 1, sourceUnitId: 'enemy_1' }],
    });

    const stats = getEffectiveStats(unit, null, []);

    expect(stats.skill).toBe(8);
    expect(stats.defense).toBe(9);
  });

  it('ignores non-berserk status effects in stat calculation', () => {
    const unit = makeUnit({
      currentStats: { strength: 10 },
      activeStatusEffects: [{ type: StatusEffectType.Poison, remainingTurns: 3, sourceUnitId: 'enemy_1' }],
    });

    const stats = getEffectiveStats(unit, null, []);

    expect(stats.strength).toBe(10);
  });

  it('combines weapon and armor speed penalties correctly', () => {
    const unit = makeUnit({ currentStats: { strength: 8, speed: 15, defense: 5 } });
    const weapon = makeWeaponData({ weight: 12 });
    const armor = makeArmorData({ speedPenalty: 2, defense: 1 });

    const stats = getEffectiveStats(unit, weapon, [armor]);

    expect(stats.speed).toBe(9);
    expect(stats.defense).toBe(6);
  });

  it('floors speed at zero after all penalties', () => {
    const unit = makeUnit({ currentStats: { strength: 1, speed: 3 } });
    const weapon = makeWeaponData({ weight: 10 });
    const armor = makeArmorData({ speedPenalty: 5 });

    const stats = getEffectiveStats(unit, weapon, [armor]);

    expect(stats.speed).toBe(0);
  });

  it('does not mutate the original unit stats object', () => {
    const unit = makeUnit({ currentStats: { speed: 10, strength: 5 } });
    const original = { ...unit.currentStats };

    void getEffectiveStats(unit, makeWeaponData({ weight: 9 }), [makeArmorData({ speedPenalty: 1 })]);

    expect(unit.currentStats).toEqual(original);
  });

  it('rounds berserk bonus to nearest whole number', () => {
    const unit = makeUnit({
      currentStats: { strength: 5 },
      activeStatusEffects: [{ type: StatusEffectType.Berserk, remainingTurns: 1, sourceUnitId: 'enemy_1' }],
    });

    const stats = getEffectiveStats(unit, null, []);

    expect(stats.strength).toBe(8);
  });
});
