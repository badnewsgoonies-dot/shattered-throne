import { afterEach, describe, expect, it, vi } from 'vitest';
import { UnitClassName, WeaponType } from '../../shared/types';
import { createCombatEngine } from '../combatEngine';
import { makeTerrain, makeUnit, makeWeapon } from './testUtils';

const engine = createCombatEngine();

function mockRandomSequence(values: number[]): void {
  let index = 0;
  vi.spyOn(Math, 'random').mockImplementation(() => {
    const value = values[index];
    index += 1;
    return value ?? values[values.length - 1] ?? 0;
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('combatEngine.resolveCombat', () => {
  it('resolves a single attacker hit when defender cannot counter', () => {
    mockRandomSequence([0.0, 0.99]);

    const attacker = makeUnit({ id: 'attacker' });
    const defender = makeUnit({ id: 'defender', team: 'enemy' });

    const result = engine.resolveCombat(
      attacker,
      defender,
      makeWeapon({ weaponType: WeaponType.Sword }),
      makeWeapon({ weaponType: WeaponType.Sword, range: { min: 2, max: 2 } }),
      makeTerrain(),
      makeTerrain(),
      1,
    );

    expect(result.rounds).toHaveLength(1);
    expect(result.rounds[0]).toMatchObject({ attacker: 'attacker', damage: 8, hit: true, crit: false });
    expect(defender.currentHP).toBe(22);
  });

  it('records miss with zero damage', () => {
    mockRandomSequence([0.99]);

    const attacker = makeUnit({ id: 'attacker' });
    const defender = makeUnit({ id: 'defender', team: 'enemy' });

    const result = engine.resolveCombat(
      attacker,
      defender,
      makeWeapon({ hit: 20 }),
      null,
      makeTerrain(),
      makeTerrain(),
      1,
    );

    expect(result.rounds[0]).toMatchObject({ hit: false, damage: 0, crit: false });
    expect(defender.currentHP).toBe(30);
  });

  it('applies critical hits with 3x damage multiplier', () => {
    mockRandomSequence([0.0, 0.0]);

    const attacker = makeUnit({ id: 'attacker', className: UnitClassName.Assassin, currentStats: { skill: 20 } });
    const defender = makeUnit({ id: 'defender', team: 'enemy' });
    const weapon = makeWeapon({ crit: 60, might: 5, weaponType: WeaponType.Sword });

    const result = engine.resolveCombat(
      attacker,
      defender,
      weapon,
      null,
      makeTerrain(),
      makeTerrain(),
      1,
    );

    expect(result.rounds[0]).toMatchObject({ hit: true, crit: true, damage: 24 });
    expect(defender.currentHP).toBe(6);
  });

  it('allows defender counterattack when in range and alive', () => {
    mockRandomSequence([0.0, 0.99, 0.0, 0.99]);

    const attacker = makeUnit({ id: 'attacker' });
    const defender = makeUnit({ id: 'defender', team: 'enemy' });

    const result = engine.resolveCombat(
      attacker,
      defender,
      makeWeapon({ weaponType: WeaponType.Sword }),
      makeWeapon({ weaponType: WeaponType.Sword }),
      makeTerrain(),
      makeTerrain(),
      1,
    );

    expect(result.rounds).toHaveLength(2);
    expect(result.rounds.map((round) => round.attacker)).toEqual(['attacker', 'defender']);
    expect(attacker.currentHP).toBe(22);
    expect(defender.currentHP).toBe(22);
  });

  it('prevents counterattack if defender dies from first strike', () => {
    mockRandomSequence([0.0, 0.99]);

    const attacker = makeUnit({ id: 'attacker', currentStats: { strength: 40 } });
    const defender = makeUnit({ id: 'defender', team: 'enemy', currentHP: 18, maxHP: 18 });

    const result = engine.resolveCombat(
      attacker,
      defender,
      makeWeapon({ might: 15 }),
      makeWeapon(),
      makeTerrain(),
      makeTerrain(),
      1,
    );

    expect(result.rounds).toHaveLength(1);
    expect(defender.currentHP).toBe(0);
    expect(defender.isAlive).toBe(false);
  });

  it('applies attacker follow-up attack when speed advantage is greater than threshold', () => {
    mockRandomSequence([0.0, 0.99, 0.0, 0.99]);

    const attacker = makeUnit({ id: 'attacker', currentStats: { speed: 16 } });
    const defender = makeUnit({ id: 'defender', team: 'enemy', currentStats: { speed: 9 } });

    const result = engine.resolveCombat(
      attacker,
      defender,
      makeWeapon(),
      null,
      makeTerrain(),
      makeTerrain(),
      1,
    );

    expect(result.rounds).toHaveLength(2);
    expect(result.rounds.map((round) => round.attacker)).toEqual(['attacker', 'attacker']);
    expect(defender.currentHP).toBe(14);
  });

  it('does not allow attacker follow-up at exactly speed +5', () => {
    mockRandomSequence([0.0, 0.99]);

    const attacker = makeUnit({ id: 'attacker', currentStats: { speed: 14 } });
    const defender = makeUnit({ id: 'defender', team: 'enemy', currentStats: { speed: 9 } });

    const result = engine.resolveCombat(attacker, defender, makeWeapon(), null, makeTerrain(), makeTerrain(), 1);

    expect(result.rounds).toHaveLength(1);
  });

  it('applies defender follow-up when defender is much faster and can counter', () => {
    mockRandomSequence([0.0, 0.99, 0.0, 0.99, 0.0, 0.99]);

    const attacker = makeUnit({ id: 'attacker', currentStats: { speed: 8 } });
    const defender = makeUnit({ id: 'defender', team: 'enemy', currentStats: { speed: 16 } });

    const result = engine.resolveCombat(attacker, defender, makeWeapon(), makeWeapon(), makeTerrain(), makeTerrain(), 1);

    expect(result.rounds).toHaveLength(3);
    expect(result.rounds.map((round) => round.attacker)).toEqual(['attacker', 'defender', 'defender']);
  });

  it('does not allow defender follow-up when defender cannot counter', () => {
    mockRandomSequence([0.0, 0.99]);

    const attacker = makeUnit({ id: 'attacker', currentStats: { speed: 8 } });
    const defender = makeUnit({ id: 'defender', team: 'enemy', currentStats: { speed: 18 } });

    const result = engine.resolveCombat(
      attacker,
      defender,
      makeWeapon(),
      makeWeapon({ range: { min: 2, max: 2 } }),
      makeTerrain(),
      makeTerrain(),
      1,
    );

    expect(result.rounds).toHaveLength(1);
    expect(result.rounds[0]?.attacker).toBe('attacker');
  });

  it('stops combat sequence if attacker dies before potential follow-up', () => {
    mockRandomSequence([0.0, 0.99, 0.0, 0.99]);

    const attacker = makeUnit({
      id: 'attacker',
      currentStats: { speed: 20, defense: 2 },
      currentHP: 10,
      maxHP: 10,
    });
    const defender = makeUnit({
      id: 'defender',
      team: 'enemy',
      currentStats: { speed: 9, strength: 20 },
    });

    const result = engine.resolveCombat(
      attacker,
      defender,
      makeWeapon({ might: 1 }),
      makeWeapon({ might: 12 }),
      makeTerrain(),
      makeTerrain(),
      1,
    );

    expect(result.rounds).toHaveLength(2);
    expect(attacker.isAlive).toBe(false);
    expect(attacker.currentHP).toBe(0);
  });

  it('records HP values after each round correctly', () => {
    mockRandomSequence([0.0, 0.99, 0.0, 0.99]);

    const attacker = makeUnit({ id: 'attacker' });
    const defender = makeUnit({ id: 'defender', team: 'enemy' });

    const result = engine.resolveCombat(attacker, defender, makeWeapon(), makeWeapon(), makeTerrain(), makeTerrain(), 1);

    expect(result.rounds[0]).toMatchObject({ attackerHPAfter: 30, defenderHPAfter: 22 });
    expect(result.rounds[1]).toMatchObject({ attackerHPAfter: 22, defenderHPAfter: 22 });
  });

  it('never reduces HP below zero on lethal hit', () => {
    mockRandomSequence([0.0, 0.99]);

    const attacker = makeUnit({ id: 'attacker', currentStats: { strength: 99 } });
    const defender = makeUnit({ id: 'defender', team: 'enemy', currentHP: 10, maxHP: 10 });

    engine.resolveCombat(attacker, defender, makeWeapon({ might: 30 }), null, makeTerrain(), makeTerrain(), 1);

    expect(defender.currentHP).toBe(0);
    expect(defender.isAlive).toBe(false);
  });

  it('awards attacker exp even on miss due to min clamp', () => {
    mockRandomSequence([0.99]);

    const attacker = makeUnit({ id: 'attacker', level: 10 });
    const defender = makeUnit({ id: 'defender', team: 'enemy', level: 1 });

    const result = engine.resolveCombat(attacker, defender, makeWeapon({ hit: 0 }), null, makeTerrain(), makeTerrain(), 1);

    expect(result.attackerExpGained).toBe(3);
  });

  it('awards defender exp only when defender performed an attack', () => {
    mockRandomSequence([0.0, 0.99]);

    const attacker = makeUnit({ id: 'attacker' });
    const defender = makeUnit({ id: 'defender', team: 'enemy' });

    const noCounter = engine.resolveCombat(
      attacker,
      defender,
      makeWeapon(),
      makeWeapon({ range: { min: 2, max: 2 } }),
      makeTerrain(),
      makeTerrain(),
      1,
    );

    expect(noCounter.defenderExpGained).toBe(0);
  });

  it('grants defender exp when defender counterattacks', () => {
    mockRandomSequence([0.0, 0.99, 0.0, 0.99]);

    const attacker = makeUnit({ id: 'attacker' });
    const defender = makeUnit({ id: 'defender', team: 'enemy' });

    const result = engine.resolveCombat(attacker, defender, makeWeapon(), makeWeapon(), makeTerrain(), makeTerrain(), 1);

    expect(result.defenderExpGained).toBeGreaterThan(0);
  });

  it('increments attacker kill count when attacker defeats defender', () => {
    mockRandomSequence([0.0, 0.99]);

    const attacker = makeUnit({ id: 'attacker', killCount: 2, currentStats: { strength: 30 } });
    const defender = makeUnit({ id: 'defender', team: 'enemy', currentHP: 10, maxHP: 10 });

    engine.resolveCombat(attacker, defender, makeWeapon({ might: 10 }), makeWeapon(), makeTerrain(), makeTerrain(), 1);

    expect(attacker.killCount).toBe(3);
  });

  it('increments defender kill count when defender defeats attacker', () => {
    mockRandomSequence([0.0, 0.99, 0.0, 0.99]);

    const attacker = makeUnit({ id: 'attacker', currentHP: 8, maxHP: 8, currentStats: { defense: 0 } });
    const defender = makeUnit({ id: 'defender', team: 'enemy', killCount: 1, currentStats: { strength: 20 } });

    engine.resolveCombat(attacker, defender, makeWeapon({ might: 1 }), makeWeapon({ might: 10 }), makeTerrain(), makeTerrain(), 1);

    expect(defender.killCount).toBe(2);
  });

  it('maintains attack order as attacker -> defender -> attacker when attacker doubles and defender counters', () => {
    mockRandomSequence([0.0, 0.99, 0.0, 0.99, 0.0, 0.99]);

    const attacker = makeUnit({ id: 'attacker', currentStats: { speed: 16 } });
    const defender = makeUnit({ id: 'defender', team: 'enemy', currentStats: { speed: 9 } });

    const result = engine.resolveCombat(attacker, defender, makeWeapon(), makeWeapon(), makeTerrain(), makeTerrain(), 1);

    expect(result.rounds.map((round) => round.attacker)).toEqual(['attacker', 'defender', 'attacker']);
  });

  it('still allows defender counter after attacker misses', () => {
    mockRandomSequence([0.95, 0.0, 0.99]);

    const attacker = makeUnit({ id: 'attacker' });
    const defender = makeUnit({ id: 'defender', team: 'enemy' });

    const result = engine.resolveCombat(
      attacker,
      defender,
      makeWeapon({ hit: 20 }),
      makeWeapon({ hit: 100 }),
      makeTerrain(),
      makeTerrain(),
      1,
    );

    expect(result.rounds).toHaveLength(2);
    expect(result.rounds[0]?.hit).toBe(false);
    expect(result.rounds[1]?.attacker).toBe('defender');
  });

  it.each([
    [makeWeapon({ range: { min: 1, max: 1 } }), 1, true],
    [makeWeapon({ range: { min: 2, max: 2 } }), 1, false],
    [makeWeapon({ range: { min: 1, max: 2 } }), 2, true],
  ] as const)('applies counter range checks for distance %s', (defenderWeapon, distance, shouldCounter) => {
    mockRandomSequence([0.0, 0.99, 0.0, 0.99]);

    const result = engine.resolveCombat(
      makeUnit({ id: 'attacker' }),
      makeUnit({ id: 'defender', team: 'enemy' }),
      makeWeapon(),
      defenderWeapon,
      makeTerrain(),
      makeTerrain(),
      distance,
    );

    const didCounter = result.rounds.some((round) => round.attacker === 'defender');
    expect(didCounter).toBe(shouldCounter);
  });

  it('calculates attacker exp from total damage across multiple strikes', () => {
    mockRandomSequence([0.0, 0.99, 0.0, 0.99]);

    const attacker = makeUnit({ id: 'attacker', currentStats: { speed: 16 }, level: 5 });
    const defender = makeUnit({ id: 'defender', team: 'enemy', level: 5, maxHP: 30, currentHP: 30, currentStats: { speed: 9 } });

    const result = engine.resolveCombat(attacker, defender, makeWeapon(), null, makeTerrain(), makeTerrain(), 1);

    expect(result.rounds).toHaveLength(2);
    expect(result.attackerExpGained).toBe(16);
  });

  it('marks attacker and defender IDs in result payload', () => {
    mockRandomSequence([0.0, 0.99]);

    const result = engine.resolveCombat(
      makeUnit({ id: 'attacker_1' }),
      makeUnit({ id: 'defender_1', team: 'enemy' }),
      makeWeapon(),
      null,
      makeTerrain(),
      makeTerrain(),
      1,
    );

    expect(result.attackerId).toBe('attacker_1');
    expect(result.defenderId).toBe('defender_1');
    expect(result.attackerLevelUp).toBeNull();
    expect(result.defenderLevelUp).toBeNull();
  });
});
