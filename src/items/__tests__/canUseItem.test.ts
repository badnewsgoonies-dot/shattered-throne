import { describe, it, expect } from 'vitest';
import { canUnitUseItem } from '../equipmentManager';
import {
  makeUnit,
  warriorClass,
  archerClass,
  mageClass,
  ironSword,
  ironBow,
  fireTome,
  leatherArmor,
  vulnerary,
  heroCrest,
  guidingRing,
} from './helpers';
import { UnitClassName } from '../../shared/types';

describe('canUnitUseItem', () => {
  describe('weapons', () => {
    it('should allow warrior to use sword', () => {
      const unit = makeUnit({ className: UnitClassName.Warrior });
      expect(canUnitUseItem(unit, ironSword, warriorClass)).toBe(true);
    });

    it('should not allow warrior to use bow', () => {
      const unit = makeUnit({ className: UnitClassName.Warrior });
      expect(canUnitUseItem(unit, ironBow, warriorClass)).toBe(false);
    });

    it('should allow archer to use bow', () => {
      const unit = makeUnit({ className: UnitClassName.Archer });
      expect(canUnitUseItem(unit, ironBow, archerClass)).toBe(true);
    });

    it('should not allow archer to use sword', () => {
      const unit = makeUnit({ className: UnitClassName.Archer });
      expect(canUnitUseItem(unit, ironSword, archerClass)).toBe(false);
    });

    it('should allow mage to use fire tome', () => {
      const unit = makeUnit({ className: UnitClassName.Mage });
      expect(canUnitUseItem(unit, fireTome, mageClass)).toBe(true);
    });

    it('should not allow warrior to use fire tome', () => {
      const unit = makeUnit({ className: UnitClassName.Warrior });
      expect(canUnitUseItem(unit, fireTome, warriorClass)).toBe(false);
    });

    it('should not allow mage to use sword', () => {
      const unit = makeUnit({ className: UnitClassName.Mage });
      expect(canUnitUseItem(unit, ironSword, mageClass)).toBe(false);
    });
  });

  describe('armor', () => {
    it('should always allow armor usage', () => {
      const unit = makeUnit({ className: UnitClassName.Warrior });
      expect(canUnitUseItem(unit, leatherArmor, warriorClass)).toBe(true);
    });

    it('should allow archer to use armor', () => {
      const unit = makeUnit({ className: UnitClassName.Archer });
      expect(canUnitUseItem(unit, leatherArmor, archerClass)).toBe(true);
    });

    it('should allow mage to use armor', () => {
      const unit = makeUnit({ className: UnitClassName.Mage });
      expect(canUnitUseItem(unit, leatherArmor, mageClass)).toBe(true);
    });
  });

  describe('consumables', () => {
    it('should always allow consumable usage', () => {
      const unit = makeUnit({ className: UnitClassName.Warrior });
      expect(canUnitUseItem(unit, vulnerary, warriorClass)).toBe(true);
    });

    it('should allow any class to use consumable', () => {
      const unit = makeUnit({ className: UnitClassName.Mage });
      expect(canUnitUseItem(unit, vulnerary, mageClass)).toBe(true);
    });
  });

  describe('promotion items', () => {
    it('should allow warrior to use hero crest', () => {
      const unit = makeUnit({ className: UnitClassName.Warrior });
      expect(canUnitUseItem(unit, heroCrest, warriorClass)).toBe(true);
    });

    it('should not allow mage to use hero crest', () => {
      const unit = makeUnit({ className: UnitClassName.Mage });
      expect(canUnitUseItem(unit, heroCrest, mageClass)).toBe(false);
    });

    it('should allow mage to use guiding ring', () => {
      const unit = makeUnit({ className: UnitClassName.Mage });
      expect(canUnitUseItem(unit, guidingRing, mageClass)).toBe(true);
    });

    it('should not allow warrior to use guiding ring', () => {
      const unit = makeUnit({ className: UnitClassName.Warrior });
      expect(canUnitUseItem(unit, guidingRing, warriorClass)).toBe(false);
    });

    it('should not allow archer to use hero crest', () => {
      const unit = makeUnit({ className: UnitClassName.Archer });
      expect(canUnitUseItem(unit, heroCrest, archerClass)).toBe(false);
    });
  });
});
