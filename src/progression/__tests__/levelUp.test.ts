import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  EXP_PER_LEVEL,
  LevelUpResult,
  MAX_LEVEL,
} from '../../shared/types';
import {
  applyLevelUp,
  rollLevelUp,
} from '../levelUpSystem';
import { createTestUnit } from './testUtils';

describe('rollLevelUp', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('increments level by 1 when below max level', () => {
    vi.spyOn(Math, 'random').mockReturnValue(99.9);
    const unit = createTestUnit({ level: 5 });

    const result = rollLevelUp(unit, unit.growthRates);

    expect(result.newLevel).toBe(6);
    expect(result.unitId).toBe(unit.id);
  });

  it('returns MAX_LEVEL and no gains when unit is already maxed', () => {
    const unit = createTestUnit({ level: MAX_LEVEL });

    const result = rollLevelUp(unit, unit.growthRates);

    expect(result.newLevel).toBe(MAX_LEVEL);
    expect(result.statGains).toEqual({});
    expect(result.newSkills).toEqual([]);
  });

  it('gains every growth stat when roll is under all growth rates', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const unit = createTestUnit({
      growthRates: {
        hp: 100,
        strength: 100,
        magic: 100,
        skill: 100,
        speed: 100,
        luck: 100,
        defense: 100,
        resistance: 100,
      },
    });

    const result = rollLevelUp(unit, unit.growthRates);

    expect(result.statGains).toEqual({
      hp: 1,
      strength: 1,
      magic: 1,
      skill: 1,
      speed: 1,
      luck: 1,
      defense: 1,
      resistance: 1,
    });
  });

  it('gains no stats when all growth rates are zero', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const unit = createTestUnit({
      growthRates: {
        hp: 0,
        strength: 0,
        magic: 0,
        skill: 0,
        speed: 0,
        luck: 0,
        defense: 0,
        resistance: 0,
      },
    });

    const result = rollLevelUp(unit, unit.growthRates);

    expect(result.statGains).toEqual({});
  });

  it('uses per-stat random rolls independently', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.2) // hp 20 < 50 yes
      .mockReturnValueOnce(0.7) // str 70 < 45 no
      .mockReturnValueOnce(0.1) // mag 10 < 20 yes
      .mockReturnValueOnce(0.5) // skl 50 < 40 no
      .mockReturnValueOnce(0.3) // spd 30 < 35 yes
      .mockReturnValueOnce(0.4) // lck 40 < 25 no
      .mockReturnValueOnce(0.29) // def 29 < 30 yes
      .mockReturnValueOnce(0.99); // res 99 < 15 no

    const unit = createTestUnit();
    const result = rollLevelUp(unit, unit.growthRates);

    expect(result.statGains).toEqual({ hp: 1, magic: 1, speed: 1, defense: 1 });
  });

  it('never rolls movement because movement is not a growth stat', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const unit = createTestUnit({
      growthRates: {
        hp: 100,
        strength: 100,
        magic: 100,
        skill: 100,
        speed: 100,
        luck: 100,
        defense: 100,
        resistance: 100,
      },
    });

    const result = rollLevelUp(unit, unit.growthRates);

    expect(result.statGains.movement).toBeUndefined();
  });

  it('keeps skill-learning placeholder empty', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const unit = createTestUnit();

    const result = rollLevelUp(unit, unit.growthRates);

    expect(result.newSkills).toEqual([]);
  });
});

describe('applyLevelUp', () => {
  it('applies gained stats to current stats', () => {
    const unit = createTestUnit({ level: 4, exp: 140 });
    const result: LevelUpResult = {
      unitId: unit.id,
      newLevel: 5,
      statGains: { strength: 1, speed: 1, defense: 1 },
      newSkills: [],
    };

    const updated = applyLevelUp(unit, result);

    expect(updated.currentStats.strength).toBe(unit.currentStats.strength + 1);
    expect(updated.currentStats.speed).toBe(unit.currentStats.speed + 1);
    expect(updated.currentStats.defense).toBe(unit.currentStats.defense + 1);
  });

  it('updates exp with modulo EXP_PER_LEVEL', () => {
    const unit = createTestUnit({ exp: 245, level: 4 });
    const result: LevelUpResult = {
      unitId: unit.id,
      newLevel: 5,
      statGains: {},
      newSkills: [],
    };

    const updated = applyLevelUp(unit, result);

    expect(updated.exp).toBe(245 % EXP_PER_LEVEL);
  });

  it('increases maxHP and heals currentHP by hp gain', () => {
    const unit = createTestUnit({ currentHP: 10, maxHP: 20 });
    const result: LevelUpResult = {
      unitId: unit.id,
      newLevel: 2,
      statGains: { hp: 3 },
      newSkills: [],
    };

    const updated = applyLevelUp(unit, result);

    expect(updated.maxHP).toBe(23);
    expect(updated.currentHP).toBe(13);
  });

  it('does not heal beyond maxHP after hp gain', () => {
    const unit = createTestUnit({ currentHP: 20, maxHP: 20 });
    const result: LevelUpResult = {
      unitId: unit.id,
      newLevel: 2,
      statGains: { hp: 4 },
      newSkills: [],
    };

    const updated = applyLevelUp(unit, result);

    expect(updated.maxHP).toBe(24);
    expect(updated.currentHP).toBe(24);
  });

  it('clamps new level to MAX_LEVEL', () => {
    const unit = createTestUnit({ level: MAX_LEVEL - 1, exp: 999 });
    const result: LevelUpResult = {
      unitId: unit.id,
      newLevel: MAX_LEVEL + 5,
      statGains: { strength: 1 },
      newSkills: [],
    };

    const updated = applyLevelUp(unit, result);

    expect(updated.level).toBe(MAX_LEVEL);
    expect(updated.exp).toBe(0);
  });

  it('merges learned skills from level-up without duplicates', () => {
    const unit = createTestUnit({ skills: ['focus'] });
    const result: LevelUpResult = {
      unitId: unit.id,
      newLevel: 2,
      statGains: {},
      newSkills: ['focus', 'vantage'],
    };

    const updated = applyLevelUp(unit, result);

    expect(updated.skills).toEqual(['focus', 'vantage']);
  });

  it('ignores non-numeric stat gain values at runtime', () => {
    const unit = createTestUnit();
    const result = {
      unitId: unit.id,
      newLevel: 2,
      statGains: { strength: 1, speed: 'bad' as unknown as number },
      newSkills: [],
    } satisfies LevelUpResult;

    const updated = applyLevelUp(unit, result);

    expect(updated.currentStats.strength).toBe(unit.currentStats.strength + 1);
    expect(updated.currentStats.speed).toBe(unit.currentStats.speed);
  });
});
