import { describe, it, expect, vi, beforeEach } from 'vitest';
import { awardExp, getExpForNextLevel, calculateLevelDifferenceMultiplier } from '../expCalculator';
import {
  Unit,
  ExpGain,
  UnitClassName,
  MovementType,
  ArmorSlot,
  SupportRank,
  EXP_PER_LEVEL,
  MAX_LEVEL,
} from '../../shared/types';

function makeUnit(overrides: Partial<Unit> = {}): Unit {
  return {
    id: 'unit-1',
    name: 'TestUnit',
    characterId: 'char-1',
    className: UnitClassName.Warrior,
    level: 1,
    exp: 0,
    currentStats: { hp: 20, strength: 8, magic: 2, skill: 6, speed: 5, luck: 4, defense: 6, resistance: 2, movement: 5 },
    maxHP: 20,
    currentHP: 20,
    currentSP: 50,
    maxSP: 100,
    growthRates: { hp: 80, strength: 50, magic: 10, skill: 40, speed: 40, luck: 30, defense: 35, resistance: 15 },
    inventory: {
      items: [null, null, null, null, null],
      equippedWeaponIndex: null,
      equippedArmor: { [ArmorSlot.Head]: null, [ArmorSlot.Chest]: null, [ArmorSlot.Boots]: null, [ArmorSlot.Accessory]: null },
    },
    skills: [],
    activeStatusEffects: [],
    position: null,
    hasMoved: false,
    hasActed: false,
    isAlive: true,
    team: 'player',
    supportRanks: {},
    supportPoints: {},
    killCount: 0,
    movementType: MovementType.Foot,
    ...overrides,
  };
}

describe('EXP Calculator', () => {
  describe('awardExp', () => {
    it('should add exp to unit', () => {
      const unit = makeUnit({ exp: 0 });
      const gains: ExpGain[] = [{ unitId: 'unit-1', amount: 30, source: 'damage' }];
      const result = awardExp(unit, gains);
      expect(result.unit.exp).toBe(30);
      expect(result.levelUp).toBeNull();
    });

    it('should accumulate exp from multiple gains', () => {
      const unit = makeUnit({ exp: 10 });
      const gains: ExpGain[] = [
        { unitId: 'unit-1', amount: 20, source: 'damage' },
        { unitId: 'unit-1', amount: 15, source: 'kill' },
      ];
      const result = awardExp(unit, gains);
      expect(result.unit.exp).toBe(45);
    });

    it('should trigger level up at 100 exp', () => {
      const unit = makeUnit({ exp: 50 });
      const gains: ExpGain[] = [{ unitId: 'unit-1', amount: 50, source: 'kill' }];
      const result = awardExp(unit, gains);
      expect(result.unit.level).toBe(2);
      expect(result.levelUp).not.toBeNull();
      expect(result.levelUp!.newLevel).toBe(2);
    });

    it('should handle leftover exp after level up', () => {
      const unit = makeUnit({ exp: 50 });
      const gains: ExpGain[] = [{ unitId: 'unit-1', amount: 70, source: 'kill' }];
      const result = awardExp(unit, gains);
      expect(result.unit.level).toBe(2);
      expect(result.unit.exp).toBe(20);
    });

    it('should handle multi-level-up', () => {
      const unit = makeUnit({ exp: 0 });
      const gains: ExpGain[] = [{ unitId: 'unit-1', amount: 250, source: 'objective' }];
      const result = awardExp(unit, gains);
      expect(result.unit.level).toBe(3);
      expect(result.unit.exp).toBe(50);
    });

    it('should not exceed MAX_LEVEL', () => {
      const unit = makeUnit({ level: 29, exp: 50 });
      const gains: ExpGain[] = [{ unitId: 'unit-1', amount: 200, source: 'kill' }];
      const result = awardExp(unit, gains);
      expect(result.unit.level).toBe(MAX_LEVEL);
      expect(result.unit.exp).toBe(0);
    });

    it('should update maxHP when gaining hp stat', () => {
      // Force all growth rolls to succeed
      vi.spyOn(Math, 'random').mockReturnValue(0);
      const unit = makeUnit({ exp: 90 });
      const gains: ExpGain[] = [{ unitId: 'unit-1', amount: 10, source: 'kill' }];
      const result = awardExp(unit, gains);
      expect(result.unit.maxHP).toBeGreaterThanOrEqual(unit.maxHP);
      vi.restoreAllMocks();
    });

    it('should update currentHP when gaining hp stat', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0);
      const unit = makeUnit({ exp: 90, currentHP: 20, maxHP: 20 });
      const gains: ExpGain[] = [{ unitId: 'unit-1', amount: 10, source: 'kill' }];
      const result = awardExp(unit, gains);
      expect(result.unit.currentHP).toBeGreaterThanOrEqual(20);
      vi.restoreAllMocks();
    });

    it('should add new skills learned at level up', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99);
      const unit = makeUnit({ exp: 90, skills: [] });
      const classSkills = [{ level: 2, skillId: 'powerStrike' }];
      const gains: ExpGain[] = [{ unitId: 'unit-1', amount: 10, source: 'kill' }];
      const result = awardExp(unit, gains, classSkills);
      expect(result.unit.skills).toContain('powerStrike');
      vi.restoreAllMocks();
    });

    it('should return null levelUp when no level up occurs', () => {
      const unit = makeUnit({ exp: 10 });
      const gains: ExpGain[] = [{ unitId: 'unit-1', amount: 5, source: 'damage' }];
      const result = awardExp(unit, gains);
      expect(result.levelUp).toBeNull();
    });

    it('should return the last LevelUpResult for multi-level-up', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99);
      const unit = makeUnit({ exp: 0 });
      const gains: ExpGain[] = [{ unitId: 'unit-1', amount: 200, source: 'objective' }];
      const result = awardExp(unit, gains);
      expect(result.levelUp!.newLevel).toBe(3);
      vi.restoreAllMocks();
    });

    it('should handle zero exp gain', () => {
      const unit = makeUnit({ exp: 50 });
      const gains: ExpGain[] = [{ unitId: 'unit-1', amount: 0, source: 'damage' }];
      const result = awardExp(unit, gains);
      expect(result.unit.exp).toBe(50);
      expect(result.levelUp).toBeNull();
    });

    it('should handle empty gains array', () => {
      const unit = makeUnit({ exp: 50 });
      const result = awardExp(unit, []);
      expect(result.unit.exp).toBe(50);
      expect(result.levelUp).toBeNull();
    });
  });

  describe('getExpForNextLevel', () => {
    it('should return 100 when current exp is 0', () => {
      expect(getExpForNextLevel(0)).toBe(EXP_PER_LEVEL);
    });

    it('should return remaining exp needed', () => {
      expect(getExpForNextLevel(30)).toBe(70);
    });

    it('should return 100 when exp is exactly 100', () => {
      expect(getExpForNextLevel(100)).toBe(100);
    });

    it('should handle arbitrary exp values', () => {
      expect(getExpForNextLevel(150)).toBe(50);
    });

    it('should return 1 when exp is 99', () => {
      expect(getExpForNextLevel(99)).toBe(1);
    });
  });

  describe('calculateLevelDifferenceMultiplier', () => {
    it('should return 1.0 for same level', () => {
      expect(calculateLevelDifferenceMultiplier(5, 5)).toBe(1.0);
    });

    it('should increase multiplier when defender is higher level', () => {
      expect(calculateLevelDifferenceMultiplier(5, 10)).toBe(1.5);
    });

    it('should cap multiplier at 3.0', () => {
      expect(calculateLevelDifferenceMultiplier(1, 30)).toBe(3.0);
    });

    it('should decrease multiplier when attacker is higher level', () => {
      expect(calculateLevelDifferenceMultiplier(10, 5)).toBe(0.75);
    });

    it('should have minimum multiplier of 0.1', () => {
      expect(calculateLevelDifferenceMultiplier(30, 1)).toBe(0.1);
    });

    it('should handle 1 level difference (defender higher)', () => {
      expect(calculateLevelDifferenceMultiplier(5, 6)).toBeCloseTo(1.1);
    });

    it('should handle 1 level difference (attacker higher)', () => {
      expect(calculateLevelDifferenceMultiplier(6, 5)).toBeCloseTo(0.95);
    });

    it('should handle exact cap boundary for high multiplier', () => {
      // diff = 20, mult = 1 + 20*0.1 = 3.0 (at cap)
      expect(calculateLevelDifferenceMultiplier(1, 21)).toBe(3.0);
      // diff = 25, mult = 1 + 25*0.1 = 3.5, capped to 3.0
      expect(calculateLevelDifferenceMultiplier(1, 26)).toBe(3.0);
    });

    it('should handle exact floor boundary for low multiplier', () => {
      // diff = 18, mult = 1 - 18*0.05 = 0.1 (at floor)
      expect(calculateLevelDifferenceMultiplier(19, 1)).toBe(0.1);
    });
  });
});
