import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AIBehavior,
  MAX_SP,
  UnitClassName,
} from '../../shared/types';
import {
  getArenaOpponent,
  resolveArenaFight,
} from '../arenaSystem';
import { createTestUnit } from './testUtils';

describe('getArenaOpponent', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates an enemy arena unit with baseline identity', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    vi.spyOn(Date, 'now').mockReturnValue(12345);
    const player = createTestUnit({ level: 10 });

    const opponent = getArenaOpponent(player);

    expect(opponent.id).toBe('arena_12345');
    expect(opponent.name).toBe('Arena Champion');
    expect(opponent.team).toBe('enemy');
    expect(opponent.aiBehavior).toBe(AIBehavior.Aggressive);
  });

  it('generates level in range player-2 when random is minimum', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0);
    const player = createTestUnit({ level: 12 });

    const opponent = getArenaOpponent(player);

    expect(opponent.level).toBe(10);
  });

  it('generates level in range player+2 when random is maximum bucket', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.99).mockReturnValueOnce(0);
    const player = createTestUnit({ level: 12 });

    const opponent = getArenaOpponent(player);

    expect(opponent.level).toBe(14);
  });

  it('never generates a level below 1', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0);
    const player = createTestUnit({ level: 1 });

    const opponent = getArenaOpponent(player);

    expect(opponent.level).toBe(1);
  });

  it('selects class from allowed arena pool', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.5).mockReturnValueOnce(0.76);
    const player = createTestUnit({ level: 10 });

    const opponent = getArenaOpponent(player);

    expect([
      UnitClassName.Warrior,
      UnitClassName.Knight,
      UnitClassName.Archer,
      UnitClassName.Mage,
    ]).toContain(opponent.className);
  });

  it('sets HP fields consistently with generated stats', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.99).mockReturnValueOnce(0.2);
    const player = createTestUnit({ level: 8 });

    const opponent = getArenaOpponent(player);

    expect(opponent.maxHP).toBe(opponent.currentStats.hp);
    expect(opponent.currentHP).toBe(opponent.currentStats.hp);
  });

  it('initializes SP to MAX_SP', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const player = createTestUnit({ level: 8 });

    const opponent = getArenaOpponent(player);

    expect(opponent.currentSP).toBe(MAX_SP);
    expect(opponent.maxSP).toBe(MAX_SP);
  });

  it('initializes inventory with 5 empty slots and no equipment', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const player = createTestUnit({ level: 9 });

    const opponent = getArenaOpponent(player);

    expect(opponent.inventory.items).toHaveLength(5);
    expect(opponent.inventory.equippedWeaponIndex).toBeNull();
    expect(opponent.inventory.equippedArmor).toEqual({
      head: null,
      chest: null,
      boots: null,
      accessory: null,
    });
  });
});

describe('resolveArenaFight', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('player wins when player roll meets or exceeds opponent roll', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0);

    const player = createTestUnit({
      currentStats: { hp: 20, strength: 10, magic: 0, skill: 10, speed: 10, luck: 0, defense: 0, resistance: 0, movement: 5 },
      level: 10,
    });
    const opponent = createTestUnit({
      team: 'enemy',
      currentStats: { hp: 20, strength: 5, magic: 0, skill: 5, speed: 5, luck: 0, defense: 0, resistance: 0, movement: 5 },
      level: 10,
    });

    const result = resolveArenaFight(player, opponent);

    expect(result.won).toBe(true);
    expect(result.goldChange).toBe(1000);
    expect(result.expGained).toBeGreaterThan(0);
  });

  it('player loses when opponent roll is higher', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0.99);

    const player = createTestUnit({
      currentStats: { hp: 20, strength: 5, magic: 0, skill: 5, speed: 5, luck: 0, defense: 0, resistance: 0, movement: 5 },
      level: 10,
    });
    const opponent = createTestUnit({
      team: 'enemy',
      currentStats: { hp: 20, strength: 10, magic: 0, skill: 10, speed: 10, luck: 0, defense: 0, resistance: 0, movement: 5 },
      level: 10,
    });

    const result = resolveArenaFight(player, opponent);

    expect(result).toEqual({ won: false, goldChange: 0, expGained: 0 });
  });

  it('tie on power+roll counts as a win for player', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.25).mockReturnValueOnce(0.25);

    const player = createTestUnit({
      currentStats: { hp: 20, strength: 8, magic: 0, skill: 8, speed: 8, luck: 0, defense: 0, resistance: 0, movement: 5 },
      level: 10,
    });
    const opponent = createTestUnit({
      team: 'enemy',
      currentStats: { hp: 20, strength: 8, magic: 0, skill: 8, speed: 8, luck: 0, defense: 0, resistance: 0, movement: 5 },
      level: 10,
    });

    const result = resolveArenaFight(player, opponent);

    expect(result.won).toBe(true);
  });

  it('win reward gold scales with opponent level', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0);

    const player = createTestUnit({ level: 5 });
    const opponent = createTestUnit({ team: 'enemy', level: 17 });

    const result = resolveArenaFight(player, opponent);

    expect(result.goldChange).toBe(1700);
  });

  it('exp reward is capped at 100', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0);

    const player = createTestUnit({ level: 1 });
    const opponent = createTestUnit({ team: 'enemy', level: 30 });

    const result = resolveArenaFight(player, opponent);

    expect(result.expGained).toBe(100);
  });

  it('exp reward floors at 0 for high-level players despite win', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0);

    const player = createTestUnit({ level: 30 });
    const opponent = createTestUnit({ team: 'enemy', level: 1 });

    const result = resolveArenaFight(player, opponent);

    expect(result.won).toBe(true);
    expect(result.expGained).toBe(0);
  });
});
