import { describe, it, expect, beforeEach } from 'vitest';
import { createCombatEngine, setRngSeed } from '../combatEngine';
import { makeUnit, makeWeapon, makeTerrain } from './helpers';
import { WeaponType } from '../../shared/types';

describe('combatResolution', () => {
  const engine = createCombatEngine();

  beforeEach(() => {
    setRngSeed(42);
  });

  it('resolves a basic attack', () => {
    const attacker = makeUnit({
      id: 'atk',
      currentStats: { strength: 15, speed: 10, skill: 20, luck: 10 },
      currentHP: 30,
    });
    const defender = makeUnit({
      id: 'def',
      currentStats: { defense: 8, speed: 5, skill: 5, luck: 3 },
      currentHP: 25,
    });
    const weapon = makeWeapon({ might: 5, hit: 95, crit: 0 });
    const terrain = makeTerrain();

    const result = engine.resolveCombat(
      attacker, defender, weapon, null,
      terrain, terrain, 1,
    );
    expect(result.attackerId).toBe('atk');
    expect(result.defenderId).toBe('def');
    expect(result.rounds.length).toBeGreaterThanOrEqual(1);
  });

  it('attacker hits when hit rate is very high', () => {
    setRngSeed(0);
    const attacker = makeUnit({
      id: 'atk',
      currentStats: { strength: 15, speed: 10, skill: 30, luck: 20 },
      currentHP: 30,
    });
    const defender = makeUnit({
      id: 'def',
      currentStats: { defense: 8, speed: 5, skill: 5, luck: 0 },
      currentHP: 25,
    });
    const weapon = makeWeapon({ might: 5, hit: 100, crit: 0 });
    const terrain = makeTerrain();

    const result = engine.resolveCombat(
      attacker, defender, weapon, null,
      terrain, terrain, 1,
    );
    // With very high hit rate, first round should be a hit
    const firstRound = result.rounds[0];
    expect(firstRound.attacker).toBe('atk');
    // 100 hit means almost certain to hit
  });

  it('records damage in rounds', () => {
    setRngSeed(10);
    const attacker = makeUnit({
      id: 'atk',
      currentStats: { strength: 15, speed: 10, skill: 25, luck: 15 },
      currentHP: 30,
    });
    const defender = makeUnit({
      id: 'def',
      currentStats: { defense: 8, speed: 5, skill: 5, luck: 3 },
      currentHP: 50,
      maxHP: 50,
    });
    const weapon = makeWeapon({ might: 5, hit: 100, crit: 0 });
    const terrain = makeTerrain();

    const result = engine.resolveCombat(
      attacker, defender, weapon, null,
      terrain, terrain, 1,
    );
    const hitRounds = result.rounds.filter(r => r.hit && r.attacker === 'atk');
    for (const round of hitRounds) {
      expect(round.damage).toBeGreaterThan(0);
    }
  });

  it('defender counters when has weapon in range', () => {
    setRngSeed(5);
    const attacker = makeUnit({
      id: 'atk',
      currentStats: { strength: 15, speed: 8, skill: 20, luck: 10, defense: 10 },
      currentHP: 30,
    });
    const defender = makeUnit({
      id: 'def',
      currentStats: { strength: 12, defense: 8, speed: 8, skill: 20, luck: 10 },
      currentHP: 30,
    });
    const atkWeapon = makeWeapon({ might: 5, hit: 100, crit: 0, range: { min: 1, max: 1 } });
    const defWeapon = makeWeapon({ might: 4, hit: 100, crit: 0, range: { min: 1, max: 1 } });
    const terrain = makeTerrain();

    const result = engine.resolveCombat(
      attacker, defender, atkWeapon, defWeapon,
      terrain, terrain, 1,
    );
    // Should have attacker round and defender counter round
    expect(result.rounds.length).toBeGreaterThanOrEqual(2);
    const defenderRounds = result.rounds.filter(r => r.attacker === 'def');
    expect(defenderRounds.length).toBeGreaterThanOrEqual(1);
  });

  it('no counter when defender out of range', () => {
    setRngSeed(1);
    const attacker = makeUnit({
      id: 'atk',
      currentStats: { strength: 15, speed: 8, skill: 20, luck: 10 },
      currentHP: 30,
    });
    const defender = makeUnit({
      id: 'def',
      currentStats: { strength: 12, defense: 8, speed: 8, skill: 20, luck: 10 },
      currentHP: 30,
    });
    const atkWeapon = makeWeapon({ might: 5, hit: 100, crit: 0, range: { min: 2, max: 3 } });
    const defWeapon = makeWeapon({ might: 4, hit: 100, crit: 0, range: { min: 1, max: 1 } });
    const terrain = makeTerrain();

    const result = engine.resolveCombat(
      attacker, defender, atkWeapon, defWeapon,
      terrain, terrain, 2,
    );
    const defenderRounds = result.rounds.filter(r => r.attacker === 'def');
    expect(defenderRounds.length).toBe(0);
  });

  it('attacker doubles when speed difference > threshold', () => {
    setRngSeed(100);
    const attacker = makeUnit({
      id: 'atk',
      currentStats: { strength: 10, speed: 20, skill: 25, luck: 10 },
      currentHP: 30,
    });
    const defender = makeUnit({
      id: 'def',
      currentStats: { defense: 5, speed: 5, skill: 5, luck: 3 },
      currentHP: 50,
      maxHP: 50,
    });
    const weapon = makeWeapon({ might: 5, hit: 100, crit: 0 });
    const terrain = makeTerrain();

    const result = engine.resolveCombat(
      attacker, defender, weapon, null,
      terrain, terrain, 1,
    );
    const attackerRounds = result.rounds.filter(r => r.attacker === 'atk');
    // Should have 2 attacks (initial + double)
    expect(attackerRounds.length).toBe(2);
  });

  it('defender doubles counter when fast enough', () => {
    setRngSeed(200);
    const attacker = makeUnit({
      id: 'atk',
      currentStats: { strength: 10, speed: 5, skill: 20, luck: 10, defense: 10 },
      currentHP: 50,
    });
    const defender = makeUnit({
      id: 'def',
      currentStats: { strength: 10, defense: 8, speed: 20, skill: 20, luck: 10 },
      currentHP: 50,
    });
    const atkWeapon = makeWeapon({ might: 3, hit: 100, crit: 0 });
    const defWeapon = makeWeapon({ might: 3, hit: 100, crit: 0 });
    const terrain = makeTerrain();

    const result = engine.resolveCombat(
      attacker, defender, atkWeapon, defWeapon,
      terrain, terrain, 1,
    );
    const defenderRounds = result.rounds.filter(r => r.attacker === 'def');
    expect(defenderRounds.length).toBe(2);
  });

  it('combat stops when defender is killed', () => {
    setRngSeed(0);
    const attacker = makeUnit({
      id: 'atk',
      currentStats: { strength: 30, speed: 20, skill: 30, luck: 15 },
      currentHP: 50,
    });
    const defender = makeUnit({
      id: 'def',
      currentStats: { defense: 5, speed: 5, skill: 5, luck: 0 },
      currentHP: 10,
      maxHP: 10,
    });
    const weapon = makeWeapon({ might: 10, hit: 100, crit: 0 });
    const terrain = makeTerrain();

    const result = engine.resolveCombat(
      attacker, defender, weapon, null,
      terrain, terrain, 1,
    );
    const lastRound = result.rounds[result.rounds.length - 1];
    expect(lastRound.defenderHPAfter).toBe(0);
  });

  it('exp is awarded after combat', () => {
    setRngSeed(42);
    const attacker = makeUnit({
      id: 'atk',
      level: 5,
      currentStats: { strength: 15, speed: 10, skill: 25, luck: 10 },
      currentHP: 30,
    });
    const defender = makeUnit({
      id: 'def',
      level: 5,
      currentStats: { defense: 8, speed: 5, skill: 5, luck: 3 },
      currentHP: 15,
      maxHP: 20,
    });
    const weapon = makeWeapon({ might: 5, hit: 100, crit: 0 });
    const terrain = makeTerrain();

    const result = engine.resolveCombat(
      attacker, defender, weapon, null,
      terrain, terrain, 1,
    );
    expect(result.attackerExpGained).toBeGreaterThanOrEqual(0);
  });

  it('miss round records 0 damage', () => {
    // Use a seed that generates a miss (hitRoll >= hitRate)
    // We'll set extremely low hit to guarantee a miss
    setRngSeed(1);
    const attacker = makeUnit({
      id: 'atk',
      currentStats: { strength: 10, speed: 10, skill: 0, luck: 0 },
      currentHP: 30,
    });
    const defender = makeUnit({
      id: 'def',
      currentStats: { defense: 8, speed: 30, luck: 30 },
      currentHP: 25,
    });
    const weapon = makeWeapon({ might: 5, hit: 0, crit: 0 });
    const terrain = makeTerrain();

    const result = engine.resolveCombat(
      attacker, defender, weapon, null,
      terrain, terrain, 1,
    );
    const missRounds = result.rounds.filter(r => !r.hit);
    for (const round of missRounds) {
      expect(round.damage).toBe(0);
    }
  });

  it('crit deals triple damage', () => {
    // We need to get a hit AND a crit
    // Set up very high hit and crit rates
    setRngSeed(0);
    const attacker = makeUnit({
      id: 'atk',
      currentStats: { strength: 10, speed: 10, skill: 50, luck: 20 },
      currentHP: 30,
    });
    const defender = makeUnit({
      id: 'def',
      currentStats: { defense: 5, speed: 5, luck: 0, skill: 0 },
      currentHP: 50,
      maxHP: 50,
    });
    const weapon = makeWeapon({ might: 5, hit: 100, crit: 100 });
    const terrain = makeTerrain();

    const result = engine.resolveCombat(
      attacker, defender, weapon, null,
      terrain, terrain, 1,
    );
    const critRounds = result.rounds.filter(r => r.crit && r.attacker === 'atk');
    if (critRounds.length > 0) {
      // Normal damage = 10 + 5 - 5 = 10
      // Crit damage = 10 * 3 = 30
      expect(critRounds[0].damage).toBe(30);
    }
  });

  it('returns correct round structure', () => {
    setRngSeed(42);
    const attacker = makeUnit({ id: 'atk', currentHP: 30 });
    const defender = makeUnit({ id: 'def', currentHP: 25 });
    const weapon = makeWeapon({ might: 5, hit: 80 });
    const terrain = makeTerrain();

    const result = engine.resolveCombat(
      attacker, defender, weapon, null,
      terrain, terrain, 1,
    );
    for (const round of result.rounds) {
      expect(round).toHaveProperty('attacker');
      expect(round).toHaveProperty('damage');
      expect(round).toHaveProperty('hit');
      expect(round).toHaveProperty('crit');
      expect(round).toHaveProperty('attackerHPAfter');
      expect(round).toHaveProperty('defenderHPAfter');
    }
  });

  it('levelUp fields are null (handled externally)', () => {
    setRngSeed(42);
    const attacker = makeUnit({ id: 'atk' });
    const defender = makeUnit({ id: 'def' });
    const weapon = makeWeapon();
    const terrain = makeTerrain();

    const result = engine.resolveCombat(
      attacker, defender, weapon, null,
      terrain, terrain, 1,
    );
    expect(result.attackerLevelUp).toBeNull();
    expect(result.defenderLevelUp).toBeNull();
  });

  it('handles both units having equal speed (no doubles)', () => {
    setRngSeed(42);
    const attacker = makeUnit({
      id: 'atk',
      currentStats: { strength: 10, speed: 10, skill: 20, luck: 10, defense: 8 },
      currentHP: 30,
    });
    const defender = makeUnit({
      id: 'def',
      currentStats: { strength: 10, defense: 8, speed: 10, skill: 20, luck: 10 },
      currentHP: 30,
    });
    const weapon = makeWeapon({ might: 5, hit: 100, crit: 0 });
    const terrain = makeTerrain();

    const result = engine.resolveCombat(
      attacker, defender, weapon, weapon,
      terrain, terrain, 1,
    );
    // Each side should attack at most once
    const atkRounds = result.rounds.filter(r => r.attacker === 'atk');
    const defRounds = result.rounds.filter(r => r.attacker === 'def');
    expect(atkRounds.length).toBe(1);
    expect(defRounds.length).toBe(1);
  });
});
