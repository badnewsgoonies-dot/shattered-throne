import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ExpGain,
  EXP_PER_LEVEL,
  MAX_LEVEL,
} from '../../shared/types';
import {
  calculateLevelDifferenceMultiplier,
  getExpForNextLevel,
} from '../expCalculator';
import { createProgressionSystem } from '../progressionSystem';
import {
  createMockDataProvider,
  createTestUnit,
} from './testUtils';

describe('expCalculator', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getExpForNextLevel returns full level amount at 0 exp', () => {
    expect(getExpForNextLevel(0)).toBe(EXP_PER_LEVEL);
  });

  it('getExpForNextLevel returns remaining exp for simple case', () => {
    expect(getExpForNextLevel(1)).toBe(99);
  });

  it('getExpForNextLevel returns 1 exp when at 99', () => {
    expect(getExpForNextLevel(99)).toBe(1);
  });

  it('getExpForNextLevel returns 100 when exactly on level boundary', () => {
    expect(getExpForNextLevel(100)).toBe(100);
  });

  it('getExpForNextLevel handles large exp totals', () => {
    expect(getExpForNextLevel(250)).toBe(50);
  });

  it('calculateLevelDifferenceMultiplier returns 1.0 at equal levels', () => {
    expect(calculateLevelDifferenceMultiplier(10, 10)).toBe(1.0);
  });

  it('calculateLevelDifferenceMultiplier increases for higher defender level', () => {
    expect(calculateLevelDifferenceMultiplier(10, 12)).toBeCloseTo(1.2, 6);
  });

  it('calculateLevelDifferenceMultiplier is capped at 3.0 for large level disadvantage', () => {
    expect(calculateLevelDifferenceMultiplier(1, 30)).toBe(3.0);
  });

  it('calculateLevelDifferenceMultiplier decreases for higher attacker level', () => {
    expect(calculateLevelDifferenceMultiplier(12, 10)).toBeCloseTo(0.9, 6);
  });

  it('calculateLevelDifferenceMultiplier has floor of 0.1 for large level advantage', () => {
    expect(calculateLevelDifferenceMultiplier(30, 1)).toBe(0.1);
  });
});

describe('createProgressionSystem.awardExp', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('adds all gain amounts when no level-up happens', () => {
    const system = createProgressionSystem(createMockDataProvider());
    const unit = createTestUnit({ exp: 20 });
    const gains: ExpGain[] = [
      { unitId: unit.id, amount: 10, source: 'damage' },
      { unitId: unit.id, amount: 15, source: 'heal' },
      { unitId: unit.id, amount: 5, source: 'other' },
    ];

    const result = system.awardExp(unit, gains);

    expect(result.levelUp).toBeNull();
    expect(result.unit.exp).toBe(50);
    expect(result.unit.level).toBe(1);
  });

  it('triggers level-up at exactly 100 total exp', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const system = createProgressionSystem(createMockDataProvider());
    const unit = createTestUnit({
      exp: 95,
      growthRates: {
        hp: 100,
        strength: 0,
        magic: 0,
        skill: 0,
        speed: 0,
        luck: 0,
        defense: 0,
        resistance: 0,
      },
    });

    const result = system.awardExp(unit, [{ unitId: unit.id, amount: 5, source: 'damage' }]);

    expect(result.levelUp).not.toBeNull();
    expect(result.levelUp?.newLevel).toBe(2);
    expect(result.unit.level).toBe(2);
    expect(result.unit.exp).toBe(0);
  });

  it('keeps overflow exp after leveling up', () => {
    vi.spyOn(Math, 'random').mockReturnValue(99.9);
    const system = createProgressionSystem(createMockDataProvider());
    const unit = createTestUnit({ exp: 95 });

    const result = system.awardExp(unit, [{ unitId: unit.id, amount: 12, source: 'other' }]);

    expect(result.unit.level).toBe(2);
    expect(result.unit.exp).toBe(7);
  });

  it('handles multi-level-up from one large award', () => {
    vi.spyOn(Math, 'random').mockReturnValue(99.9);
    const system = createProgressionSystem(createMockDataProvider());
    const unit = createTestUnit({ exp: 80, level: 1 });

    const result = system.awardExp(unit, [{ unitId: unit.id, amount: 250, source: 'objective' }]);

    expect(result.unit.level).toBe(4);
    expect(result.unit.exp).toBe(30);
    expect(result.levelUp?.newLevel).toBe(4);
  });

  it('returns null levelUp when gains list is empty', () => {
    const system = createProgressionSystem(createMockDataProvider());
    const unit = createTestUnit({ exp: 14 });

    const result = system.awardExp(unit, []);

    expect(result.levelUp).toBeNull();
    expect(result.unit.exp).toBe(14);
  });

  it('does not allow exp to go below zero', () => {
    const system = createProgressionSystem(createMockDataProvider());
    const unit = createTestUnit({ exp: 5 });

    const result = system.awardExp(unit, [{ unitId: unit.id, amount: -20, source: 'other' }]);

    expect(result.unit.exp).toBe(0);
    expect(result.unit.level).toBe(1);
  });

  it('does not level past MAX_LEVEL', () => {
    const system = createProgressionSystem(createMockDataProvider());
    const unit = createTestUnit({ level: MAX_LEVEL, exp: 80 });

    const result = system.awardExp(unit, [{ unitId: unit.id, amount: 80, source: 'kill' }]);

    expect(result.levelUp).toBeNull();
    expect(result.unit.level).toBe(MAX_LEVEL);
    expect(result.unit.exp).toBe(0);
  });
});
