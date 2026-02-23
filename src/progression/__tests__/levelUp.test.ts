import { describe, it, expect, vi, afterEach } from 'vitest';
import { rollLevelUp } from '../levelUpSystem';
import {
  Unit,
  GrowthRates,
  UnitClassName,
  MovementType,
  ArmorSlot,
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

const defaultGrowths: GrowthRates = {
  hp: 80,
  strength: 50,
  magic: 10,
  skill: 40,
  speed: 40,
  luck: 30,
  defense: 35,
  resistance: 15,
};

describe('Level Up System', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should increase level by 1', () => {
    const unit = makeUnit({ level: 5 });
    const result = rollLevelUp(unit, defaultGrowths);
    expect(result.newLevel).toBe(6);
  });

  it('should return correct unitId', () => {
    const unit = makeUnit({ id: 'hero-1' });
    const result = rollLevelUp(unit, defaultGrowths);
    expect(result.unitId).toBe('hero-1');
  });

  it('should gain all stats when rolls are low (all succeed)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0); // roll=0, always < growthRate
    const unit = makeUnit();
    const result = rollLevelUp(unit, defaultGrowths);
    expect(result.statGains.hp).toBe(1);
    expect(result.statGains.strength).toBe(1);
    expect(result.statGains.magic).toBe(1);
    expect(result.statGains.skill).toBe(1);
    expect(result.statGains.speed).toBe(1);
    expect(result.statGains.luck).toBe(1);
    expect(result.statGains.defense).toBe(1);
    expect(result.statGains.resistance).toBe(1);
  });

  it('should gain no stats when rolls are high (all fail)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // roll=99, always >= growthRate
    const unit = makeUnit();
    const result = rollLevelUp(unit, defaultGrowths);
    expect(result.statGains.hp).toBeUndefined();
    expect(result.statGains.strength).toBeUndefined();
    expect(result.statGains.magic).toBeUndefined();
  });

  it('should respect growth rate thresholds', () => {
    // roll of 50 means growth rates > 50 succeed, <= 50 fail
    vi.spyOn(Math, 'random').mockReturnValue(0.50); // roll = 50
    const unit = makeUnit();
    const growths: GrowthRates = { hp: 80, strength: 60, magic: 51, skill: 50, speed: 40, luck: 30, defense: 20, resistance: 10 };
    const result = rollLevelUp(unit, growths);
    expect(result.statGains.hp).toBe(1);       // 80 > 50
    expect(result.statGains.strength).toBe(1);  // 60 > 50
    expect(result.statGains.magic).toBe(1);     // 51 > 50
    expect(result.statGains.skill).toBeUndefined(); // 50 is not > 50
    expect(result.statGains.speed).toBeUndefined();
  });

  it('should cap stats at statCaps', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const unit = makeUnit({
      currentStats: { hp: 60, strength: 30, magic: 2, skill: 6, speed: 5, luck: 4, defense: 6, resistance: 2, movement: 5 },
    });
    const caps: Record<string, number> = { hp: 60, strength: 30, magic: 30, skill: 30, speed: 30, luck: 30, defense: 30, resistance: 30 };
    const result = rollLevelUp(unit, defaultGrowths, [], caps);
    expect(result.statGains.hp).toBeUndefined(); // already at cap
    expect(result.statGains.strength).toBeUndefined(); // already at cap
    expect(result.statGains.magic).toBe(1); // not at cap
  });

  it('should learn new skills at the correct level', () => {
    const unit = makeUnit({ level: 4, skills: [] });
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const classSkills = [
      { level: 5, skillId: 'powerStrike' },
      { level: 10, skillId: 'shield' },
    ];
    const result = rollLevelUp(unit, defaultGrowths, classSkills);
    expect(result.newSkills).toContain('powerStrike');
    expect(result.newSkills).not.toContain('shield');
  });

  it('should not learn skills already known', () => {
    const unit = makeUnit({ level: 4, skills: ['powerStrike'] });
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const classSkills = [{ level: 5, skillId: 'powerStrike' }];
    const result = rollLevelUp(unit, defaultGrowths, classSkills);
    expect(result.newSkills).not.toContain('powerStrike');
  });

  it('should return empty newSkills when no skills at level', () => {
    const unit = makeUnit({ level: 3 });
    const classSkills = [{ level: 10, skillId: 'shield' }];
    const result = rollLevelUp(unit, defaultGrowths, classSkills);
    expect(result.newSkills).toEqual([]);
  });

  it('should handle zero growth rates', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const unit = makeUnit();
    const zeroGrowths: GrowthRates = { hp: 0, strength: 0, magic: 0, skill: 0, speed: 0, luck: 0, defense: 0, resistance: 0 };
    const result = rollLevelUp(unit, zeroGrowths);
    expect(Object.keys(result.statGains).length).toBe(0);
  });

  it('should handle 100% growth rates', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const unit = makeUnit();
    const maxGrowths: GrowthRates = { hp: 100, strength: 100, magic: 100, skill: 100, speed: 100, luck: 100, defense: 100, resistance: 100 };
    const result = rollLevelUp(unit, maxGrowths);
    // roll=99, 99 < 100, so all should succeed
    expect(result.statGains.hp).toBe(1);
    expect(result.statGains.strength).toBe(1);
  });

  it('should learn multiple skills at same level', () => {
    const unit = makeUnit({ level: 4, skills: [] });
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const classSkills = [
      { level: 5, skillId: 'powerStrike' },
      { level: 5, skillId: 'warCry' },
    ];
    const result = rollLevelUp(unit, defaultGrowths, classSkills);
    expect(result.newSkills).toContain('powerStrike');
    expect(result.newSkills).toContain('warCry');
  });
});
