import { describe, expect, it } from 'vitest';
import { StatusEffectType } from '../../shared/types';
import {
  applyStatusEffect,
  tickStatusEffects,
} from '../statusEffects';
import { makeUnit } from './testUtils';

describe('statusEffects.applyStatusEffect', () => {
  it('adds a new status effect when type is not present', () => {
    const unit = makeUnit();

    const updated = applyStatusEffect(unit, {
      type: StatusEffectType.Poison,
      remainingTurns: 3,
      sourceUnitId: 'enemy_a',
    });

    expect(updated.activeStatusEffects).toHaveLength(1);
    expect(updated.activeStatusEffects[0].type).toBe(StatusEffectType.Poison);
  });

  it('refreshes existing effect by replacing duration and source', () => {
    const unit = makeUnit({
      activeStatusEffects: [{ type: StatusEffectType.Poison, remainingTurns: 1, sourceUnitId: 'enemy_old' }],
    });

    const updated = applyStatusEffect(unit, {
      type: StatusEffectType.Poison,
      remainingTurns: 5,
      sourceUnitId: 'enemy_new',
    });

    expect(updated.activeStatusEffects).toHaveLength(1);
    expect(updated.activeStatusEffects[0]).toEqual({
      type: StatusEffectType.Poison,
      remainingTurns: 5,
      sourceUnitId: 'enemy_new',
    });
  });

  it('keeps other effects when refreshing one effect type', () => {
    const unit = makeUnit({
      activeStatusEffects: [
        { type: StatusEffectType.Poison, remainingTurns: 1, sourceUnitId: 'enemy_old' },
        { type: StatusEffectType.Sleep, remainingTurns: 2, sourceUnitId: 'enemy_sleep' },
      ],
    });

    const updated = applyStatusEffect(unit, {
      type: StatusEffectType.Poison,
      remainingTurns: 4,
      sourceUnitId: 'enemy_new',
    });

    expect(updated.activeStatusEffects).toHaveLength(2);
    expect(updated.activeStatusEffects.find((effect) => effect.type === StatusEffectType.Sleep)).toBeTruthy();
    expect(updated.activeStatusEffects.find((effect) => effect.type === StatusEffectType.Poison)?.remainingTurns).toBe(4);
  });
});

describe('statusEffects.tickStatusEffects', () => {
  it('poison reduces HP by 10 percent of maxHP', () => {
    const unit = makeUnit({
      maxHP: 50,
      currentHP: 40,
      activeStatusEffects: [{ type: StatusEffectType.Poison, remainingTurns: 2, sourceUnitId: 'enemy_1' }],
    });

    const updated = tickStatusEffects(unit);

    expect(updated.currentHP).toBe(35);
  });

  it('poison does at least 1 damage when percentage rounds down', () => {
    const unit = makeUnit({
      maxHP: 9,
      currentHP: 9,
      activeStatusEffects: [{ type: StatusEffectType.Poison, remainingTurns: 2, sourceUnitId: 'enemy_1' }],
    });

    const updated = tickStatusEffects(unit);

    expect(updated.currentHP).toBe(8);
  });

  it('poison cannot reduce HP below 1', () => {
    const unit = makeUnit({
      maxHP: 100,
      currentHP: 2,
      activeStatusEffects: [{ type: StatusEffectType.Poison, remainingTurns: 3, sourceUnitId: 'enemy_1' }],
    });

    const updated = tickStatusEffects(unit);

    expect(updated.currentHP).toBe(1);
  });

  it('sleep causes unit to skip movement and action', () => {
    const unit = makeUnit({
      hasMoved: false,
      hasActed: false,
      activeStatusEffects: [{ type: StatusEffectType.Sleep, remainingTurns: 2, sourceUnitId: 'enemy_1' }],
    });

    const updated = tickStatusEffects(unit);

    expect(updated.hasMoved).toBe(true);
    expect(updated.hasActed).toBe(true);
  });

  it('silence only tracks duration and does not alter turn flags', () => {
    const unit = makeUnit({
      hasMoved: false,
      hasActed: true,
      activeStatusEffects: [{ type: StatusEffectType.Silence, remainingTurns: 2, sourceUnitId: 'enemy_1' }],
    });

    const updated = tickStatusEffects(unit);

    expect(updated.hasMoved).toBe(false);
    expect(updated.hasActed).toBe(true);
  });

  it('berserk sets unit control flags for AI control', () => {
    const unit = makeUnit({
      hasMoved: true,
      hasActed: true,
      activeStatusEffects: [{ type: StatusEffectType.Berserk, remainingTurns: 2, sourceUnitId: 'enemy_1' }],
    });

    const updated = tickStatusEffects(unit);

    expect(updated.hasMoved).toBe(false);
    expect(updated.hasActed).toBe(false);
  });

  it('charm only tracks duration and keeps turn state unchanged', () => {
    const unit = makeUnit({
      hasMoved: true,
      hasActed: false,
      activeStatusEffects: [{ type: StatusEffectType.Charm, remainingTurns: 2, sourceUnitId: 'enemy_1' }],
    });

    const updated = tickStatusEffects(unit);

    expect(updated.hasMoved).toBe(true);
    expect(updated.hasActed).toBe(false);
  });

  it('frozen prevents movement but allows acting', () => {
    const unit = makeUnit({
      hasMoved: false,
      hasActed: false,
      activeStatusEffects: [{ type: StatusEffectType.Frozen, remainingTurns: 2, sourceUnitId: 'enemy_1' }],
    });

    const updated = tickStatusEffects(unit);

    expect(updated.hasMoved).toBe(true);
    expect(updated.hasActed).toBe(false);
  });

  it('blind only tracks duration and does not alter state', () => {
    const unit = makeUnit({
      hasMoved: false,
      hasActed: true,
      activeStatusEffects: [{ type: StatusEffectType.Blind, remainingTurns: 2, sourceUnitId: 'enemy_1' }],
    });

    const updated = tickStatusEffects(unit);

    expect(updated.hasMoved).toBe(false);
    expect(updated.hasActed).toBe(true);
  });

  it('stun skips both movement and action', () => {
    const unit = makeUnit({
      hasMoved: false,
      hasActed: false,
      activeStatusEffects: [{ type: StatusEffectType.Stun, remainingTurns: 2, sourceUnitId: 'enemy_1' }],
    });

    const updated = tickStatusEffects(unit);

    expect(updated.hasMoved).toBe(true);
    expect(updated.hasActed).toBe(true);
  });

  it('decrements remaining turns for non-expired effects', () => {
    const unit = makeUnit({
      activeStatusEffects: [{ type: StatusEffectType.Sleep, remainingTurns: 3, sourceUnitId: 'enemy_1' }],
    });

    const updated = tickStatusEffects(unit);

    expect(updated.activeStatusEffects[0].remainingTurns).toBe(2);
  });

  it('removes effects that expire at zero turns', () => {
    const unit = makeUnit({
      activeStatusEffects: [{ type: StatusEffectType.Sleep, remainingTurns: 1, sourceUnitId: 'enemy_1' }],
    });

    const updated = tickStatusEffects(unit);

    expect(updated.activeStatusEffects).toEqual([]);
  });

  it('keeps effects with turns remaining after decrement', () => {
    const unit = makeUnit({
      activeStatusEffects: [
        { type: StatusEffectType.Sleep, remainingTurns: 2, sourceUnitId: 'enemy_1' },
        { type: StatusEffectType.Silence, remainingTurns: 1, sourceUnitId: 'enemy_2' },
      ],
    });

    const updated = tickStatusEffects(unit);

    expect(updated.activeStatusEffects).toHaveLength(1);
    expect(updated.activeStatusEffects[0].type).toBe(StatusEffectType.Sleep);
  });

  it('processes multiple effects in one tick', () => {
    const unit = makeUnit({
      maxHP: 40,
      currentHP: 40,
      hasMoved: false,
      hasActed: false,
      activeStatusEffects: [
        { type: StatusEffectType.Poison, remainingTurns: 2, sourceUnitId: 'enemy_1' },
        { type: StatusEffectType.Sleep, remainingTurns: 2, sourceUnitId: 'enemy_2' },
      ],
    });

    const updated = tickStatusEffects(unit);

    expect(updated.currentHP).toBe(36);
    expect(updated.hasMoved).toBe(true);
    expect(updated.hasActed).toBe(true);
  });

  it('returns a new unit object and does not mutate original', () => {
    const unit = makeUnit({
      activeStatusEffects: [{ type: StatusEffectType.Poison, remainingTurns: 2, sourceUnitId: 'enemy_1' }],
      currentHP: 25,
      maxHP: 25,
    });

    const updated = tickStatusEffects(unit);

    expect(updated).not.toBe(unit);
    expect(unit.currentHP).toBe(25);
    expect(unit.activeStatusEffects[0].remainingTurns).toBe(2);
  });

  it('handles unit with no active status effects', () => {
    const unit = makeUnit({ activeStatusEffects: [] });

    const updated = tickStatusEffects(unit);

    expect(updated).toEqual(unit);
  });

  it('can process all eight effects in a single tick', () => {
    const unit = makeUnit({
      maxHP: 60,
      currentHP: 60,
      hasMoved: false,
      hasActed: false,
      activeStatusEffects: [
        { type: StatusEffectType.Poison, remainingTurns: 2, sourceUnitId: 'a' },
        { type: StatusEffectType.Sleep, remainingTurns: 2, sourceUnitId: 'b' },
        { type: StatusEffectType.Silence, remainingTurns: 2, sourceUnitId: 'c' },
        { type: StatusEffectType.Berserk, remainingTurns: 2, sourceUnitId: 'd' },
        { type: StatusEffectType.Charm, remainingTurns: 2, sourceUnitId: 'e' },
        { type: StatusEffectType.Frozen, remainingTurns: 2, sourceUnitId: 'f' },
        { type: StatusEffectType.Blind, remainingTurns: 2, sourceUnitId: 'g' },
        { type: StatusEffectType.Stun, remainingTurns: 2, sourceUnitId: 'h' },
      ],
    });

    const updated = tickStatusEffects(unit);

    expect(updated.currentHP).toBe(54);
    expect(updated.activeStatusEffects).toHaveLength(8);
    expect(updated.activeStatusEffects.every((effect) => effect.remainingTurns === 1)).toBe(true);
  });

  it('keeps HP at 1 when poisoned repeatedly at low health', () => {
    const unit = makeUnit({
      maxHP: 30,
      currentHP: 1,
      activeStatusEffects: [{ type: StatusEffectType.Poison, remainingTurns: 5, sourceUnitId: 'enemy_1' }],
    });

    const updated = tickStatusEffects(unit);

    expect(updated.currentHP).toBe(1);
  });

  it('removes all effects that expire on this tick', () => {
    const unit = makeUnit({
      activeStatusEffects: [
        { type: StatusEffectType.Sleep, remainingTurns: 1, sourceUnitId: 'a' },
        { type: StatusEffectType.Stun, remainingTurns: 1, sourceUnitId: 'b' },
      ],
    });

    const updated = tickStatusEffects(unit);

    expect(updated.activeStatusEffects).toEqual([]);
  });

  it('supports refresh then tick flow for same status type', () => {
    const base = makeUnit({
      activeStatusEffects: [{ type: StatusEffectType.Poison, remainingTurns: 1, sourceUnitId: 'old' }],
      maxHP: 40,
      currentHP: 40,
    });

    const refreshed = applyStatusEffect(base, {
      type: StatusEffectType.Poison,
      remainingTurns: 3,
      sourceUnitId: 'new',
    });

    const ticked = tickStatusEffects(refreshed);

    expect(ticked.activeStatusEffects[0].remainingTurns).toBe(2);
    expect(ticked.activeStatusEffects[0].sourceUnitId).toBe('new');
  });

  it('frozen can coexist with acted state without forcing acted true', () => {
    const unit = makeUnit({
      hasMoved: false,
      hasActed: true,
      activeStatusEffects: [{ type: StatusEffectType.Frozen, remainingTurns: 2, sourceUnitId: 'enemy_1' }],
    });

    const updated = tickStatusEffects(unit);

    expect(updated.hasMoved).toBe(true);
    expect(updated.hasActed).toBe(true);
  });
});
