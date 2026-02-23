import { describe, it, expect } from 'vitest';
import { canPromote, promote, applyPromotion } from '../promotionSystem';
import {
  Unit,
  UnitClassName,
  ClassDefinition,
  MovementType,
  WeaponType,
  ArmorSlot,
  PROMOTION_LEVEL,
} from '../../shared/types';

function makeUnit(overrides: Partial<Unit> = {}): Unit {
  return {
    id: 'unit-1',
    name: 'TestUnit',
    characterId: 'char-1',
    className: UnitClassName.Warrior,
    level: 15,
    exp: 0,
    currentStats: { hp: 25, strength: 12, magic: 3, skill: 10, speed: 8, luck: 6, defense: 10, resistance: 4, movement: 5 },
    maxHP: 25,
    currentHP: 25,
    currentSP: 50,
    maxSP: 100,
    growthRates: { hp: 80, strength: 50, magic: 10, skill: 40, speed: 40, luck: 30, defense: 35, resistance: 15 },
    inventory: {
      items: [null, null, null, null, null],
      equippedWeaponIndex: null,
      equippedArmor: { [ArmorSlot.Head]: null, [ArmorSlot.Chest]: null, [ArmorSlot.Boots]: null, [ArmorSlot.Accessory]: null },
    },
    skills: ['basicAttack'],
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

function makeClassDef(overrides: Partial<ClassDefinition> = {}): ClassDefinition {
  return {
    name: UnitClassName.Warrior,
    displayName: 'Warrior',
    baseStats: { hp: 18, strength: 6, magic: 0, skill: 4, speed: 4, luck: 2, defense: 5, resistance: 1, movement: 5 },
    growthRates: { hp: 80, strength: 50, magic: 10, skill: 40, speed: 40, luck: 30, defense: 35, resistance: 15 },
    statCaps: { hp: 60, strength: 30, magic: 30, skill: 30, speed: 30, luck: 30, defense: 30, resistance: 30, movement: 8 },
    movementType: MovementType.Foot,
    weaponTypes: [WeaponType.Sword],
    skills: [{ level: 1, skillId: 'basicAttack' }],
    promotionOptions: [UnitClassName.Berserker, UnitClassName.Paladin],
    promotionBonuses: { hp: 3, strength: 2, defense: 2, speed: 1 },
    isPromoted: false,
    ...overrides,
  };
}

const promotedClassDef: ClassDefinition = {
  name: UnitClassName.Berserker,
  displayName: 'Berserker',
  baseStats: { hp: 22, strength: 10, magic: 0, skill: 5, speed: 6, luck: 2, defense: 7, resistance: 1, movement: 5 },
  growthRates: { hp: 90, strength: 60, magic: 5, skill: 45, speed: 45, luck: 25, defense: 40, resistance: 10 },
  statCaps: { hp: 80, strength: 40, magic: 20, skill: 35, speed: 35, luck: 30, defense: 35, resistance: 25, movement: 8 },
  movementType: MovementType.Foot,
  weaponTypes: [WeaponType.Sword, WeaponType.Axe],
  skills: [{ level: 1, skillId: 'rage' }, { level: 5, skillId: 'critBoost' }],
  promotionOptions: [],
  promotionBonuses: {},
  isPromoted: true,
};

describe('Promotion System', () => {
  describe('canPromote', () => {
    it('should allow promotion at PROMOTION_LEVEL', () => {
      const unit = makeUnit({ level: PROMOTION_LEVEL });
      const classDef = makeClassDef();
      expect(canPromote(unit, classDef)).toBe(true);
    });

    it('should allow promotion above PROMOTION_LEVEL', () => {
      const unit = makeUnit({ level: 20 });
      const classDef = makeClassDef();
      expect(canPromote(unit, classDef)).toBe(true);
    });

    it('should deny promotion below PROMOTION_LEVEL', () => {
      const unit = makeUnit({ level: 10 });
      const classDef = makeClassDef();
      expect(canPromote(unit, classDef)).toBe(false);
    });

    it('should deny promotion if no promotion options', () => {
      const unit = makeUnit({ level: 15 });
      const classDef = makeClassDef({ promotionOptions: [] });
      expect(canPromote(unit, classDef)).toBe(false);
    });

    it('should deny promotion if class is already promoted', () => {
      const unit = makeUnit({ level: 15, className: UnitClassName.Berserker });
      expect(canPromote(unit, promotedClassDef)).toBe(false);
    });

    it('should deny promotion at level 14', () => {
      const unit = makeUnit({ level: 14 });
      const classDef = makeClassDef();
      expect(canPromote(unit, classDef)).toBe(false);
    });
  });

  describe('promote', () => {
    it('should return correct old and new class', () => {
      const unit = makeUnit();
      const oldClassDef = makeClassDef();
      const result = promote(unit, UnitClassName.Berserker, promotedClassDef, oldClassDef);
      expect(result.oldClass).toBe(UnitClassName.Warrior);
      expect(result.newClass).toBe(UnitClassName.Berserker);
    });

    it('should include stat bonuses from old class', () => {
      const unit = makeUnit();
      const oldClassDef = makeClassDef();
      const result = promote(unit, UnitClassName.Berserker, promotedClassDef, oldClassDef);
      expect(result.statBonuses.hp).toBe(3);
      expect(result.statBonuses.strength).toBe(2);
      expect(result.statBonuses.defense).toBe(2);
    });

    it('should return new weapon types not in old class', () => {
      const unit = makeUnit();
      const oldClassDef = makeClassDef();
      const result = promote(unit, UnitClassName.Berserker, promotedClassDef, oldClassDef);
      expect(result.newWeaponTypes).toContain(WeaponType.Axe);
      expect(result.newWeaponTypes).not.toContain(WeaponType.Sword);
    });

    it('should learn promotion skills', () => {
      const unit = makeUnit();
      const oldClassDef = makeClassDef();
      const result = promote(unit, UnitClassName.Berserker, promotedClassDef, oldClassDef);
      expect(result.newSkills).toContain('rage');
    });

    it('should not duplicate existing skills', () => {
      const unit = makeUnit({ skills: ['rage'] });
      const oldClassDef = makeClassDef();
      const result = promote(unit, UnitClassName.Berserker, promotedClassDef, oldClassDef);
      expect(result.newSkills).not.toContain('rage');
    });

    it('should return correct unitId', () => {
      const unit = makeUnit({ id: 'hero-1' });
      const oldClassDef = makeClassDef();
      const result = promote(unit, UnitClassName.Berserker, promotedClassDef, oldClassDef);
      expect(result.unitId).toBe('hero-1');
    });
  });

  describe('applyPromotion', () => {
    it('should reset level to 1', () => {
      const unit = makeUnit({ level: 15 });
      const oldClassDef = makeClassDef();
      const result = promote(unit, UnitClassName.Berserker, promotedClassDef, oldClassDef);
      const promoted = applyPromotion(unit, result, promotedClassDef);
      expect(promoted.level).toBe(1);
    });

    it('should reset exp to 0', () => {
      const unit = makeUnit({ exp: 50 });
      const oldClassDef = makeClassDef();
      const result = promote(unit, UnitClassName.Berserker, promotedClassDef, oldClassDef);
      const promoted = applyPromotion(unit, result, promotedClassDef);
      expect(promoted.exp).toBe(0);
    });

    it('should apply stat bonuses', () => {
      const unit = makeUnit();
      const oldClassDef = makeClassDef();
      const result = promote(unit, UnitClassName.Berserker, promotedClassDef, oldClassDef);
      const promoted = applyPromotion(unit, result, promotedClassDef);
      expect(promoted.currentStats.hp).toBe(unit.currentStats.hp + 3);
      expect(promoted.currentStats.strength).toBe(unit.currentStats.strength + 2);
    });

    it('should change className', () => {
      const unit = makeUnit();
      const oldClassDef = makeClassDef();
      const result = promote(unit, UnitClassName.Berserker, promotedClassDef, oldClassDef);
      const promoted = applyPromotion(unit, result, promotedClassDef);
      expect(promoted.className).toBe(UnitClassName.Berserker);
    });

    it('should update movementType', () => {
      const unit = makeUnit({ movementType: MovementType.Foot });
      const mountedClassDef: ClassDefinition = { ...promotedClassDef, movementType: MovementType.Mounted };
      const oldClassDef = makeClassDef();
      const result = promote(unit, UnitClassName.Berserker, mountedClassDef, oldClassDef);
      const promoted = applyPromotion(unit, result, mountedClassDef);
      expect(promoted.movementType).toBe(MovementType.Mounted);
    });

    it('should add new skills to unit', () => {
      const unit = makeUnit({ skills: ['basicAttack'] });
      const oldClassDef = makeClassDef();
      const result = promote(unit, UnitClassName.Berserker, promotedClassDef, oldClassDef);
      const promoted = applyPromotion(unit, result, promotedClassDef);
      expect(promoted.skills).toContain('basicAttack');
      expect(promoted.skills).toContain('rage');
    });

    it('should update maxHP', () => {
      const unit = makeUnit({ maxHP: 25 });
      const oldClassDef = makeClassDef();
      const result = promote(unit, UnitClassName.Berserker, promotedClassDef, oldClassDef);
      const promoted = applyPromotion(unit, result, promotedClassDef);
      expect(promoted.maxHP).toBe(25 + 3);
    });
  });
});
