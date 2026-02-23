import { describe, it, expect } from 'vitest';
import { createItemSystem } from '../itemSystem';
import { makeUnit, makeItemInstance, makeInventory, makeMockDataProvider } from './helpers';
import { StatusEffectType } from '../../shared/types';

const data = makeMockDataProvider();
const system = createItemSystem(data);

describe('Consumable Usage', () => {
  describe('heal effect', () => {
    it('should restore HP by healAmount', () => {
      const item = makeItemInstance({ dataId: 'vulnerary', currentDurability: 3 });
      const unit = makeUnit({ currentHP: 10, maxHP: 20, inventory: makeInventory([item]) });
      const result = system.useConsumable(unit, 0);
      expect(result.consumed).toBe(true);
      expect(result.unit.currentHP).toBe(20);
    });

    it('should cap healing at maxHP', () => {
      const item = makeItemInstance({ dataId: 'vulnerary', currentDurability: 3 });
      const unit = makeUnit({ currentHP: 18, maxHP: 20, inventory: makeInventory([item]) });
      const result = system.useConsumable(unit, 0);
      expect(result.unit.currentHP).toBe(20);
    });

    it('should do nothing if already at full HP (but still consume)', () => {
      const item = makeItemInstance({ dataId: 'vulnerary', currentDurability: 3 });
      const unit = makeUnit({ currentHP: 20, maxHP: 20, inventory: makeInventory([item]) });
      const result = system.useConsumable(unit, 0);
      expect(result.consumed).toBe(true);
      expect(result.unit.currentHP).toBe(20);
    });

    it('should fully heal with fullHeal effect', () => {
      const item = makeItemInstance({ dataId: 'elixir', currentDurability: 3 });
      const unit = makeUnit({ currentHP: 1, maxHP: 20, inventory: makeInventory([item]) });
      const result = system.useConsumable(unit, 0);
      expect(result.unit.currentHP).toBe(20);
    });

    it('should decrement durability after use', () => {
      const item = makeItemInstance({ dataId: 'vulnerary', currentDurability: 3 });
      const unit = makeUnit({ currentHP: 10, inventory: makeInventory([item]) });
      const result = system.useConsumable(unit, 0);
      expect(result.unit.inventory.items[0]?.currentDurability).toBe(2);
    });

    it('should remove item when durability reaches 0', () => {
      const item = makeItemInstance({ dataId: 'vulnerary', currentDurability: 1 });
      const unit = makeUnit({ currentHP: 10, inventory: makeInventory([item]) });
      const result = system.useConsumable(unit, 0);
      expect(result.unit.inventory.items[0]).toBeNull();
    });
  });

  describe('cureStatus effect', () => {
    it('should remove matching status effect', () => {
      const item = makeItemInstance({ dataId: 'antidote', currentDurability: 1 });
      const unit = makeUnit({
        inventory: makeInventory([item]),
        activeStatusEffects: [
          { type: StatusEffectType.Poison, remainingTurns: 3, sourceUnitId: 'enemy-1' },
        ],
      });
      const result = system.useConsumable(unit, 0);
      expect(result.consumed).toBe(true);
      expect(result.unit.activeStatusEffects).toHaveLength(0);
    });

    it('should not remove non-matching status effects', () => {
      const item = makeItemInstance({ dataId: 'antidote', currentDurability: 1 });
      const unit = makeUnit({
        inventory: makeInventory([item]),
        activeStatusEffects: [
          { type: StatusEffectType.Sleep, remainingTurns: 2, sourceUnitId: 'enemy-1' },
        ],
      });
      const result = system.useConsumable(unit, 0);
      expect(result.unit.activeStatusEffects).toHaveLength(1);
    });

    it('should only remove matching status and keep others', () => {
      const item = makeItemInstance({ dataId: 'antidote', currentDurability: 1 });
      const unit = makeUnit({
        inventory: makeInventory([item]),
        activeStatusEffects: [
          { type: StatusEffectType.Poison, remainingTurns: 3, sourceUnitId: 'e1' },
          { type: StatusEffectType.Sleep, remainingTurns: 2, sourceUnitId: 'e2' },
        ],
      });
      const result = system.useConsumable(unit, 0);
      expect(result.unit.activeStatusEffects).toHaveLength(1);
      expect(result.unit.activeStatusEffects[0].type).toBe(StatusEffectType.Sleep);
    });
  });

  describe('statBoost effect', () => {
    it('should permanently boost stats', () => {
      const item = makeItemInstance({ dataId: 'energy-ring', currentDurability: 1 });
      const unit = makeUnit({ inventory: makeInventory([item]) });
      const originalStr = unit.currentStats.strength;
      const result = system.useConsumable(unit, 0);
      expect(result.consumed).toBe(true);
      expect(result.unit.currentStats.strength).toBe(originalStr + 2);
    });

    it('should remove stat booster after use', () => {
      const item = makeItemInstance({ dataId: 'energy-ring', currentDurability: 1 });
      const unit = makeUnit({ inventory: makeInventory([item]) });
      const result = system.useConsumable(unit, 0);
      expect(result.unit.inventory.items[0]).toBeNull();
    });
  });

  describe('key effect', () => {
    it('should consume key item', () => {
      const item = makeItemInstance({ dataId: 'door-key', currentDurability: 1 });
      const unit = makeUnit({ inventory: makeInventory([item]) });
      const result = system.useConsumable(unit, 0);
      expect(result.consumed).toBe(true);
      expect(result.unit.inventory.items[0]).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should return consumed: false for non-consumable item', () => {
      const item = makeItemInstance({ dataId: 'iron-sword', currentDurability: 45 });
      const unit = makeUnit({ inventory: makeInventory([item]) });
      const result = system.useConsumable(unit, 0);
      expect(result.consumed).toBe(false);
    });

    it('should return consumed: false for empty slot', () => {
      const unit = makeUnit();
      const result = system.useConsumable(unit, 0);
      expect(result.consumed).toBe(false);
    });

    it('should return consumed: false for out-of-range index', () => {
      const unit = makeUnit();
      const result = system.useConsumable(unit, 99);
      expect(result.consumed).toBe(false);
    });
  });
});
