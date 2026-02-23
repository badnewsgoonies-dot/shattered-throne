import { describe, expect, it } from 'vitest';
import {
  MovementType,
  PROMOTION_LEVEL,
  UnitClassName,
  WeaponType,
} from '../../shared/types';
import {
  applyPromotion,
  canPromote,
  promote,
} from '../promotionSystem';
import {
  createClassDef,
  createTestUnit,
} from './testUtils';

describe('canPromote', () => {
  it('returns true when level requirement is met with valid options', () => {
    const unit = createTestUnit({ level: PROMOTION_LEVEL });
    const classDef = createClassDef({
      isPromoted: false,
      promotionOptions: [UnitClassName.Berserker],
    });

    expect(canPromote(unit, classDef)).toBe(true);
  });

  it('returns false when unit level is below requirement', () => {
    const unit = createTestUnit({ level: PROMOTION_LEVEL - 1 });
    const classDef = createClassDef();

    expect(canPromote(unit, classDef)).toBe(false);
  });

  it('returns false when class has no promotion options', () => {
    const unit = createTestUnit({ level: PROMOTION_LEVEL });
    const classDef = createClassDef({ promotionOptions: [] });

    expect(canPromote(unit, classDef)).toBe(false);
  });

  it('returns false when class is already promoted', () => {
    const unit = createTestUnit({ level: PROMOTION_LEVEL });
    const classDef = createClassDef({ isPromoted: true });

    expect(canPromote(unit, classDef)).toBe(false);
  });

  it('returns false when promoted class also has no options', () => {
    const unit = createTestUnit({ level: PROMOTION_LEVEL + 5 });
    const classDef = createClassDef({ isPromoted: true, promotionOptions: [] });

    expect(canPromote(unit, classDef)).toBe(false);
  });
});

describe('promote', () => {
  it('returns promotion metadata with old and new class names', () => {
    const unit = createTestUnit({ className: UnitClassName.Warrior });
    const newClassDef = createClassDef({ name: UnitClassName.Berserker });

    const result = promote(unit, UnitClassName.Berserker, newClassDef);

    expect(result.unitId).toBe(unit.id);
    expect(result.oldClass).toBe(UnitClassName.Warrior);
    expect(result.newClass).toBe(UnitClassName.Berserker);
  });

  it('uses promotionBonuses from the new class definition', () => {
    const unit = createTestUnit();
    const newClassDef = createClassDef({
      promotionBonuses: { hp: 3, strength: 2, defense: 1 },
    });

    const result = promote(unit, UnitClassName.Berserker, newClassDef);

    expect(result.statBonuses).toEqual({ hp: 3, strength: 2, defense: 1 });
  });

  it('uses weaponTypes from the new class definition', () => {
    const unit = createTestUnit();
    const newClassDef = createClassDef({
      weaponTypes: [WeaponType.Axe, WeaponType.Bow],
    });

    const result = promote(unit, UnitClassName.Berserker, newClassDef);

    expect(result.newWeaponTypes).toEqual([WeaponType.Axe, WeaponType.Bow]);
  });

  it('learns only class skills at level 1 or below on promotion', () => {
    const unit = createTestUnit();
    const newClassDef = createClassDef({
      skills: [
        { level: 1, skillId: 'wrath' },
        { level: 2, skillId: 'sol' },
        { level: 0, skillId: 'axe_faire' },
      ],
    });

    const result = promote(unit, UnitClassName.Berserker, newClassDef);

    expect(result.newSkills).toEqual(['wrath', 'axe_faire']);
  });

  it('returns empty skill list when no promotion-time skills exist', () => {
    const unit = createTestUnit();
    const newClassDef = createClassDef({
      skills: [{ level: 3, skillId: 'late_skill' }],
    });

    const result = promote(unit, UnitClassName.Berserker, newClassDef);

    expect(result.newSkills).toEqual([]);
  });
});

describe('applyPromotion', () => {
  it('applies stat bonuses to current stats', () => {
    const unit = createTestUnit();
    const newClassDef = createClassDef({ movementType: MovementType.Mounted });
    const result = {
      unitId: unit.id,
      oldClass: unit.className,
      newClass: UnitClassName.Paladin,
      statBonuses: { strength: 2, speed: 1, defense: 1 },
      newWeaponTypes: [WeaponType.Sword, WeaponType.Lance],
      newSkills: [],
    };

    const updated = applyPromotion(unit, result, newClassDef);

    expect(updated.currentStats.strength).toBe(unit.currentStats.strength + 2);
    expect(updated.currentStats.speed).toBe(unit.currentStats.speed + 1);
    expect(updated.currentStats.defense).toBe(unit.currentStats.defense + 1);
  });

  it('changes className and resets level/exp', () => {
    const unit = createTestUnit({ level: 18, exp: 77 });
    const newClassDef = createClassDef({ name: UnitClassName.Berserker });
    const result = {
      unitId: unit.id,
      oldClass: unit.className,
      newClass: UnitClassName.Berserker,
      statBonuses: {},
      newWeaponTypes: [WeaponType.Axe],
      newSkills: [],
    };

    const updated = applyPromotion(unit, result, newClassDef);

    expect(updated.className).toBe(UnitClassName.Berserker);
    expect(updated.level).toBe(1);
    expect(updated.exp).toBe(0);
  });

  it('updates maxHP and currentHP based on hp bonus', () => {
    const unit = createTestUnit({ currentHP: 12, maxHP: 20 });
    const newClassDef = createClassDef();
    const result = {
      unitId: unit.id,
      oldClass: unit.className,
      newClass: UnitClassName.Berserker,
      statBonuses: { hp: 4 },
      newWeaponTypes: [WeaponType.Axe],
      newSkills: [],
    };

    const updated = applyPromotion(unit, result, newClassDef);

    expect(updated.maxHP).toBe(24);
    expect(updated.currentHP).toBe(16);
  });

  it('caps currentHP at new maxHP after promotion', () => {
    const unit = createTestUnit({ currentHP: 20, maxHP: 20 });
    const newClassDef = createClassDef();
    const result = {
      unitId: unit.id,
      oldClass: unit.className,
      newClass: UnitClassName.Berserker,
      statBonuses: { hp: 2 },
      newWeaponTypes: [WeaponType.Axe],
      newSkills: [],
    };

    const updated = applyPromotion(unit, result, newClassDef);

    expect(updated.maxHP).toBe(22);
    expect(updated.currentHP).toBe(22);
  });

  it('updates movement type from the new class definition', () => {
    const unit = createTestUnit({ movementType: MovementType.Foot });
    const newClassDef = createClassDef({ movementType: MovementType.Mounted });
    const result = {
      unitId: unit.id,
      oldClass: unit.className,
      newClass: UnitClassName.Paladin,
      statBonuses: {},
      newWeaponTypes: [WeaponType.Sword, WeaponType.Lance],
      newSkills: [],
    };

    const updated = applyPromotion(unit, result, newClassDef);

    expect(updated.movementType).toBe(MovementType.Mounted);
  });

  it('adds promotion skills and deduplicates against existing skills', () => {
    const unit = createTestUnit({ skills: ['resolve'] });
    const newClassDef = createClassDef();
    const result = {
      unitId: unit.id,
      oldClass: unit.className,
      newClass: UnitClassName.Berserker,
      statBonuses: {},
      newWeaponTypes: [WeaponType.Axe],
      newSkills: ['resolve', 'wrath'],
    };

    const updated = applyPromotion(unit, result, newClassDef);

    expect(updated.skills).toEqual(['resolve', 'wrath']);
  });

  it('preserves unrelated unit fields', () => {
    const unit = createTestUnit({ id: 'hero_7', team: 'player', killCount: 12 });
    const newClassDef = createClassDef();
    const result = {
      unitId: unit.id,
      oldClass: unit.className,
      newClass: UnitClassName.Berserker,
      statBonuses: {},
      newWeaponTypes: [WeaponType.Axe],
      newSkills: [],
    };

    const updated = applyPromotion(unit, result, newClassDef);

    expect(updated.id).toBe('hero_7');
    expect(updated.team).toBe('player');
    expect(updated.killCount).toBe(12);
  });
});
