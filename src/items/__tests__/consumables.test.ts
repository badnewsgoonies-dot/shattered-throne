import { describe, expect, it } from 'vitest';
import { StatusEffectType } from '../../shared/types';
import { createItemSystem } from '../itemSystem';
import { createMockDataProvider, makeItemInstance, makeUnit } from './testUtils';

describe('consumable usage', () => {
  const provider = createMockDataProvider();
  const itemSystem = createItemSystem(provider);

  it('returns consumed false for invalid index', () => {
    const unit = makeUnit();

    const result = itemSystem.useConsumable(unit, -1);

    expect(result.consumed).toBe(false);
    expect(result.unit).toBe(unit);
  });

  it('returns consumed false for empty slot', () => {
    const unit = makeUnit();

    const result = itemSystem.useConsumable(unit, 0);

    expect(result.consumed).toBe(false);
  });

  it('returns consumed false when item is not consumable', () => {
    const unit = makeUnit({
      inventory: {
        items: [makeItemInstance('test_sword', { currentDurability: 10 }), null, null, null, null],
      },
    });

    const result = itemSystem.useConsumable(unit, 0);

    expect(result.consumed).toBe(false);
  });

  it('applies heal effect and decrements durability', () => {
    const unit = makeUnit({
      currentHP: 12,
      maxHP: 30,
      inventory: {
        items: [makeItemInstance('heal_potion', { currentDurability: 3 }), null, null, null, null],
      },
    });

    const result = itemSystem.useConsumable(unit, 0);

    expect(result.consumed).toBe(true);
    expect(result.unit.currentHP).toBe(22);
    expect(result.unit.inventory.items[0]?.currentDurability).toBe(2);
  });

  it('caps healing at max HP', () => {
    const unit = makeUnit({
      currentHP: 27,
      maxHP: 30,
      inventory: {
        items: [makeItemInstance('heal_potion', { currentDurability: 2 }), null, null, null, null],
      },
    });

    const result = itemSystem.useConsumable(unit, 0);

    expect(result.unit.currentHP).toBe(30);
  });

  it('applies full heal effect to max HP', () => {
    const unit = makeUnit({
      currentHP: 1,
      maxHP: 30,
      inventory: {
        items: [makeItemInstance('elixir', { currentDurability: 1 }), null, null, null, null],
      },
    });

    const result = itemSystem.useConsumable(unit, 0);

    expect(result.unit.currentHP).toBe(30);
  });

  it('removes matching status effect for cureStatus consumables', () => {
    const unit = makeUnit({
      activeStatusEffects: [
        { type: StatusEffectType.Poison, remainingTurns: 3, sourceUnitId: 'enemy_1' },
        { type: StatusEffectType.Sleep, remainingTurns: 1, sourceUnitId: 'enemy_2' },
      ],
      inventory: {
        items: [makeItemInstance('antidote', { currentDurability: 2 }), null, null, null, null],
      },
    });

    const result = itemSystem.useConsumable(unit, 0);

    expect(result.unit.activeStatusEffects).toHaveLength(1);
    expect(result.unit.activeStatusEffects[0].type).toBe(StatusEffectType.Sleep);
  });

  it('does not remove non-matching status effects', () => {
    const unit = makeUnit({
      activeStatusEffects: [{ type: StatusEffectType.Sleep, remainingTurns: 2, sourceUnitId: 'enemy_1' }],
      inventory: {
        items: [makeItemInstance('antidote', { currentDurability: 2 }), null, null, null, null],
      },
    });

    const result = itemSystem.useConsumable(unit, 0);

    expect(result.unit.activeStatusEffects).toHaveLength(1);
    expect(result.unit.activeStatusEffects[0].type).toBe(StatusEffectType.Sleep);
  });

  it('applies permanent stat boost consumable effects', () => {
    const unit = makeUnit({
      currentStats: {
        hp: 30,
        strength: 10,
        magic: 5,
        skill: 8,
        speed: 9,
        luck: 6,
        defense: 7,
        resistance: 4,
        movement: 5,
      },
      inventory: {
        items: [makeItemInstance('energy_drop', { currentDurability: 1 }), null, null, null, null],
      },
    });

    const result = itemSystem.useConsumable(unit, 0);

    expect(result.unit.currentStats.strength).toBe(12);
    expect(result.unit.currentStats.speed).toBe(10);
  });

  it('does not apply temporary stat boosts to current stats', () => {
    const unit = makeUnit({
      currentStats: {
        hp: 30,
        strength: 10,
        magic: 5,
        skill: 8,
        speed: 9,
        luck: 6,
        defense: 7,
        resistance: 4,
        movement: 5,
      },
      inventory: {
        items: [makeItemInstance('swift_tonic', { currentDurability: 2 }), null, null, null, null],
      },
    });

    const result = itemSystem.useConsumable(unit, 0);

    expect(result.unit.currentStats.speed).toBe(9);
    expect(result.unit.inventory.items[0]?.currentDurability).toBe(1);
  });

  it('consumes key items and removes slot when durability reaches zero', () => {
    const unit = makeUnit({
      inventory: {
        items: [makeItemInstance('chest_key', { currentDurability: 1 }), null, null, null, null],
      },
    });

    const result = itemSystem.useConsumable(unit, 0);

    expect(result.consumed).toBe(true);
    expect(result.unit.inventory.items[0]).toBeNull();
  });

  it('keeps consumable in inventory when durability remains above zero', () => {
    const unit = makeUnit({
      inventory: {
        items: [makeItemInstance('heal_potion', { currentDurability: 2 }), null, null, null, null],
      },
    });

    const result = itemSystem.useConsumable(unit, 0);

    expect(result.unit.inventory.items[0]).not.toBeNull();
    expect(result.unit.inventory.items[0]?.currentDurability).toBe(1);
  });

  it('removes consumable from inventory when durability reaches zero', () => {
    const unit = makeUnit({
      inventory: {
        items: [makeItemInstance('heal_potion', { currentDurability: 1 }), null, null, null, null],
      },
    });

    const result = itemSystem.useConsumable(unit, 0);

    expect(result.unit.inventory.items[0]).toBeNull();
  });
});
