import { afterEach, describe, expect, it, vi } from 'vitest';
import { StatusEffectType } from '../../shared/types';
import { createCombatEngine } from '../combatEngine';
import { executeSkill } from '../skillExecutor';
import { makeMap, makeSkill, makeUnit } from './testUtils';

afterEach(() => {
  vi.restoreAllMocks();
});

const engine = createCombatEngine();

describe('skillExecutor.executeSkill', () => {
  it('deducts SP cost from user', () => {
    const user = makeUnit({ currentSP: 20 });
    const target = makeUnit({ id: 'target', team: 'enemy' });
    const skill = makeSkill({ spCost: 7, statusEffect: undefined });

    executeSkill(user, skill, [target], makeMap());

    expect(user.currentSP).toBe(13);
  });

  it('does not reduce SP below zero', () => {
    const user = makeUnit({ currentSP: 3 });
    const target = makeUnit({ id: 'target', team: 'enemy' });
    const skill = makeSkill({ spCost: 10, statusEffect: undefined });

    executeSkill(user, skill, [target], makeMap());

    expect(user.currentSP).toBe(0);
  });

  it('applies strength-scaling damage against defense', () => {
    const user = makeUnit({ currentStats: { strength: 15 } });
    const target = makeUnit({ id: 'target', team: 'enemy', currentStats: { defense: 8 }, currentHP: 30 });
    const skill = makeSkill({
      damage: { base: 6, scaling: 'strength' },
      statusEffect: undefined,
    });

    const result = executeSkill(user, skill, [target], makeMap());

    expect(target.currentHP).toBe(17);
    expect(result.rounds[0]?.damage).toBe(13);
  });

  it('applies magic-scaling damage against resistance', () => {
    const user = makeUnit({ currentStats: { magic: 14 } });
    const target = makeUnit({
      id: 'target',
      team: 'enemy',
      currentStats: { defense: 0, resistance: 9 },
      currentHP: 30,
    });
    const skill = makeSkill({
      damage: { base: 5, scaling: 'magic' },
      statusEffect: undefined,
    });

    const result = executeSkill(user, skill, [target], makeMap());

    expect(target.currentHP).toBe(20);
    expect(result.rounds[0]?.damage).toBe(10);
  });

  it('floors damage at zero for highly defensive targets', () => {
    const user = makeUnit({ currentStats: { strength: 6 } });
    const target = makeUnit({ id: 'target', team: 'enemy', currentStats: { defense: 30 }, currentHP: 25 });
    const skill = makeSkill({
      damage: { base: 3, scaling: 'strength' },
      statusEffect: undefined,
    });

    const result = executeSkill(user, skill, [target], makeMap());

    expect(target.currentHP).toBe(25);
    expect(result.rounds[0]?.damage).toBe(0);
  });

  it('applies damage skill to every target in target list', () => {
    const user = makeUnit({ currentStats: { strength: 12 } });
    const targets = [
      makeUnit({ id: 't1', team: 'enemy', currentStats: { defense: 6 }, currentHP: 20 }),
      makeUnit({ id: 't2', team: 'enemy', currentStats: { defense: 7 }, currentHP: 20 }),
      makeUnit({ id: 't3', team: 'enemy', currentStats: { defense: 8 }, currentHP: 20 }),
    ];
    const skill = makeSkill({ damage: { base: 4, scaling: 'strength' }, statusEffect: undefined });

    const result = executeSkill(user, skill, targets, makeMap());

    expect(result.rounds).toHaveLength(3);
    expect(targets.map((unit) => unit.currentHP)).toEqual([10, 11, 12]);
  });

  it('restores HP for healing skills', () => {
    const user = makeUnit({ currentStats: { magic: 10 } });
    const target = makeUnit({ id: 'ally', team: 'player', currentHP: 8, maxHP: 30 });
    const skill = makeSkill({ healing: { base: 6, scaling: 'magic' }, statusEffect: undefined });

    const result = executeSkill(user, skill, [target], makeMap());

    expect(target.currentHP).toBe(24);
    expect(result.rounds[0]?.damage).toBe(16);
  });

  it('clamps healing to maxHP', () => {
    const user = makeUnit({ currentStats: { magic: 12 } });
    const target = makeUnit({ id: 'ally', team: 'player', currentHP: 25, maxHP: 30 });
    const skill = makeSkill({ healing: { base: 10, scaling: 'magic' }, statusEffect: undefined });

    const result = executeSkill(user, skill, [target], makeMap());

    expect(target.currentHP).toBe(30);
    expect(result.rounds[0]?.damage).toBe(5);
  });

  it('healing can revive a unit by setting isAlive back to true', () => {
    const user = makeUnit({ currentStats: { magic: 8 } });
    const target = makeUnit({ id: 'ally', team: 'player', currentHP: 0, isAlive: false, maxHP: 30 });
    const skill = makeSkill({ healing: { base: 5, scaling: 'magic' }, statusEffect: undefined });

    executeSkill(user, skill, [target], makeMap());

    expect(target.currentHP).toBe(13);
    expect(target.isAlive).toBe(true);
  });

  it('applies buff stat modifications to target', () => {
    const user = makeUnit();
    const target = makeUnit({ id: 'ally', team: 'player', currentStats: { strength: 10, speed: 9 } });
    const skill = makeSkill({
      buff: { stats: { strength: 3, speed: 2 }, duration: 3 },
      statusEffect: undefined,
    });

    executeSkill(user, skill, [target], makeMap());

    expect(target.currentStats.strength).toBe(13);
    expect(target.currentStats.speed).toBe(11);
  });

  it('applies buff to all listed targets', () => {
    const user = makeUnit();
    const targets = [
      makeUnit({ id: 'a1', team: 'player', currentStats: { defense: 5 } }),
      makeUnit({ id: 'a2', team: 'player', currentStats: { defense: 6 } }),
    ];
    const skill = makeSkill({
      buff: { stats: { defense: 2 }, duration: 2 },
      statusEffect: undefined,
    });

    executeSkill(user, skill, targets, makeMap());

    expect(targets[0].currentStats.defense).toBe(7);
    expect(targets[1].currentStats.defense).toBe(8);
  });

  it('applies debuff by subtracting stat values', () => {
    const user = makeUnit();
    const target = makeUnit({ id: 'enemy', team: 'enemy', currentStats: { defense: 12, speed: 8 } });
    const skill = makeSkill({
      debuff: { stats: { defense: 3, speed: 2 }, duration: 2 },
      statusEffect: undefined,
    });

    executeSkill(user, skill, [target], makeMap());

    expect(target.currentStats.defense).toBe(9);
    expect(target.currentStats.speed).toBe(6);
  });

  it('treats negative debuff values as reductions (absolute value)', () => {
    const user = makeUnit();
    const target = makeUnit({ id: 'enemy', team: 'enemy', currentStats: { defense: 12 } });
    const skill = makeSkill({
      debuff: { stats: { defense: -4 }, duration: 2 },
      statusEffect: undefined,
    });

    executeSkill(user, skill, [target], makeMap());

    expect(target.currentStats.defense).toBe(8);
  });

  it('applies status effects when roll is below chance', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    const user = makeUnit({ id: 'caster' });
    const target = makeUnit({ id: 'enemy', team: 'enemy' });
    const skill = makeSkill({
      statusEffect: {
        type: StatusEffectType.Sleep,
        chance: 50,
        duration: 2,
      },
    });

    executeSkill(user, skill, [target], makeMap());

    expect(target.activeStatusEffects).toEqual([
      {
        type: StatusEffectType.Sleep,
        remainingTurns: 2,
        sourceUnitId: 'caster',
      },
    ]);
  });

  it('does not apply status effects when roll is above chance', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);

    const user = makeUnit({ id: 'caster' });
    const target = makeUnit({ id: 'enemy', team: 'enemy' });
    const skill = makeSkill({
      statusEffect: {
        type: StatusEffectType.Sleep,
        chance: 50,
        duration: 2,
      },
    });

    executeSkill(user, skill, [target], makeMap());

    expect(target.activeStatusEffects).toEqual([]);
  });

  it('can apply damage and status effect in one skill execution', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.0);

    const user = makeUnit({ id: 'mage', currentStats: { magic: 12 } });
    const target = makeUnit({ id: 'enemy', team: 'enemy', currentHP: 20, currentStats: { resistance: 7 } });
    const skill = makeSkill({
      damage: { base: 4, scaling: 'magic' },
      statusEffect: { type: StatusEffectType.Poison, chance: 100, duration: 3 },
    });

    const result = executeSkill(user, skill, [target], makeMap());

    expect(result.rounds).toHaveLength(1);
    expect(result.rounds[0]?.damage).toBe(9);
    expect(target.currentHP).toBe(11);
    expect(target.activeStatusEffects).toHaveLength(1);
  });

  it('can apply both damage and healing parts to each target when both are defined', () => {
    const user = makeUnit({ currentStats: { strength: 10, magic: 8 } });
    const target = makeUnit({ id: 'target', team: 'enemy', currentHP: 20, maxHP: 40, currentStats: { defense: 5 } });
    const skill = makeSkill({
      damage: { base: 5, scaling: 'strength' },
      healing: { base: 3, scaling: 'magic' },
      statusEffect: undefined,
    });

    const result = executeSkill(user, skill, [target], makeMap());

    expect(result.rounds).toHaveLength(2);
    expect(result.rounds[0]?.damage).toBe(10);
    expect(result.rounds[1]?.damage).toBe(11);
    expect(target.currentHP).toBe(21);
  });

  it('returns first target as defenderId when targets exist', () => {
    const user = makeUnit({ id: 'u1' });
    const targets = [makeUnit({ id: 't1' }), makeUnit({ id: 't2' })];

    const result = executeSkill(user, makeSkill({ statusEffect: undefined }), targets, makeMap());

    expect(result.defenderId).toBe('t1');
  });

  it('returns user id as defenderId when target list is empty', () => {
    const user = makeUnit({ id: 'u1' });

    const result = executeSkill(user, makeSkill({ statusEffect: undefined }), [], makeMap());

    expect(result.defenderId).toBe('u1');
    expect(result.rounds).toEqual([]);
  });

  it('exposes the same behavior through combat engine executeSkill', () => {
    const user = makeUnit({ currentSP: 10, currentStats: { strength: 12 } });
    const target = makeUnit({ id: 'enemy', team: 'enemy', currentStats: { defense: 8 }, currentHP: 25 });

    const result = engine.executeSkill(
      user,
      makeSkill({ damage: { base: 4, scaling: 'strength' }, statusEffect: undefined, spCost: 4 }),
      [target],
      makeMap(),
    );

    expect(user.currentSP).toBe(6);
    expect(target.currentHP).toBe(17);
    expect(result.rounds[0]?.damage).toBe(8);
  });
});
