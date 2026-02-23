import { describe, expect, it } from 'vitest';
import { UnitClassName } from '../../shared/types';
import { canUnitUseItem } from '../equipmentManager';
import { createItemSystem } from '../itemSystem';
import {
  archerClassDef,
  clericClassDef,
  createMockDataProvider,
  makeClassDefinition,
  makePromotionItemData,
  makeUnit,
  mockBow,
  mockHeadArmor,
  mockHealConsumable,
  mockPromotionItem,
  mockStaff,
  mockWeapon,
  warriorClassDef,
} from './testUtils';

describe('canUnitUseItem', () => {
  it('returns true when class can use weapon type', () => {
    const unit = makeUnit({ className: UnitClassName.Warrior });

    const result = canUnitUseItem(unit, mockWeapon, warriorClassDef);

    expect(result).toBe(true);
  });

  it('returns false when class cannot use weapon type', () => {
    const unit = makeUnit({ className: UnitClassName.Warrior });

    const result = canUnitUseItem(unit, mockBow, warriorClassDef);

    expect(result).toBe(false);
  });

  it('returns true for promotion item when class is eligible', () => {
    const unit = makeUnit({ className: UnitClassName.Warrior });

    const result = canUnitUseItem(unit, mockPromotionItem, warriorClassDef);

    expect(result).toBe(true);
  });

  it('returns false for promotion item when class is not eligible', () => {
    const unit = makeUnit({ className: UnitClassName.Archer });
    const archerOnlyClassDef = makeClassDefinition({ name: UnitClassName.Archer });

    const result = canUnitUseItem(unit, mockPromotionItem, archerOnlyClassDef);

    expect(result).toBe(false);
  });

  it('returns true for armor regardless of class weapon proficiencies', () => {
    const unit = makeUnit({ className: UnitClassName.Cleric });

    const result = canUnitUseItem(unit, mockHeadArmor, clericClassDef);

    expect(result).toBe(true);
  });

  it('returns true for consumables regardless of class', () => {
    const unit = makeUnit({ className: UnitClassName.Archer });

    const result = canUnitUseItem(unit, mockHealConsumable, archerClassDef);

    expect(result).toBe(true);
  });

  it('supports classes with non-physical weapon types like staff', () => {
    const unit = makeUnit({ className: UnitClassName.Cleric });

    const result = canUnitUseItem(unit, mockStaff, clericClassDef);

    expect(result).toBe(true);
  });

  it('itemSystem.canUnitUseItem delegates correctly', () => {
    const provider = createMockDataProvider({
      items: [mockWeapon, mockBow, mockHeadArmor, mockHealConsumable, mockPromotionItem],
      classes: [warriorClassDef, archerClassDef],
    });
    const itemSystem = createItemSystem(provider);
    const unit = makeUnit({ className: UnitClassName.Warrior });
    const promotion = makePromotionItemData({ validClasses: [UnitClassName.Warrior] });

    expect(itemSystem.canUnitUseItem(unit, mockWeapon, warriorClassDef)).toBe(true);
    expect(itemSystem.canUnitUseItem(unit, mockBow, warriorClassDef)).toBe(false);
    expect(itemSystem.canUnitUseItem(unit, promotion, warriorClassDef)).toBe(true);
  });
});
