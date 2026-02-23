import { describe, it, expect } from 'vitest';
import { createCombatEngine } from '../combatEngine';
import { makeUnit, makeWeapon, makeTerrain } from './helpers';
import { WeaponType, DOUBLE_ATTACK_SPEED_THRESHOLD } from '../../shared/types';

describe('battleForecast', () => {
  const engine = createCombatEngine();

  it('calculates attacker damage correctly', () => {
    const attacker = makeUnit({ currentStats: { strength: 15, speed: 10, skill: 10, luck: 5 } });
    const defender = makeUnit({ currentStats: { defense: 8, speed: 5, skill: 5, luck: 3 } });
    const atkWeapon = makeWeapon({ might: 5, hit: 90, crit: 0 });
    const atkTerrain = makeTerrain();
    const defTerrain = makeTerrain();

    const forecast = engine.getBattleForecast(
      attacker, defender, atkWeapon, null,
      atkTerrain, defTerrain, 1, 0, 0,
    );
    // damage = 15 + 5 - 8 = 12
    expect(forecast.attackerDamage).toBe(12);
  });

  it('correctly identifies when attacker can double', () => {
    const attacker = makeUnit({ currentStats: { speed: 15 } });
    const defender = makeUnit({ currentStats: { speed: 5 } });
    const weapon = makeWeapon({ might: 5 });
    const terrain = makeTerrain();

    const forecast = engine.getBattleForecast(
      attacker, defender, weapon, null,
      terrain, terrain, 1, 0, 0,
    );
    // speed diff = 10 > 5 threshold
    expect(forecast.attackerDoubles).toBe(true);
  });

  it('no double when speed difference equals threshold', () => {
    const attacker = makeUnit({ currentStats: { speed: 15 } });
    const defender = makeUnit({ currentStats: { speed: 10 } });
    const weapon = makeWeapon({ might: 5 });
    const terrain = makeTerrain();

    const forecast = engine.getBattleForecast(
      attacker, defender, weapon, null,
      terrain, terrain, 1, 0, 0,
    );
    // speed diff = 5 = threshold, not > threshold
    expect(forecast.attackerDoubles).toBe(false);
  });

  it('no double when speed difference is below threshold', () => {
    const attacker = makeUnit({ currentStats: { speed: 12 } });
    const defender = makeUnit({ currentStats: { speed: 10 } });
    const weapon = makeWeapon({ might: 5 });
    const terrain = makeTerrain();

    const forecast = engine.getBattleForecast(
      attacker, defender, weapon, null,
      terrain, terrain, 1, 0, 0,
    );
    expect(forecast.attackerDoubles).toBe(false);
  });

  it('detects defender can counter when in range', () => {
    const attacker = makeUnit({ currentStats: { strength: 15 } });
    const defender = makeUnit({ currentStats: { strength: 10, defense: 8 } });
    const atkWeapon = makeWeapon({ might: 5, range: { min: 1, max: 1 } });
    const defWeapon = makeWeapon({ might: 4, range: { min: 1, max: 1 } });
    const terrain = makeTerrain();

    const forecast = engine.getBattleForecast(
      attacker, defender, atkWeapon, defWeapon,
      terrain, terrain, 1, 0, 0,
    );
    expect(forecast.defenderCanCounter).toBe(true);
    expect(forecast.defenderDamage).toBeGreaterThanOrEqual(0);
  });

  it('detects defender cannot counter when out of range', () => {
    const attacker = makeUnit({ currentStats: { strength: 15 } });
    const defender = makeUnit({ currentStats: { strength: 10 } });
    const atkWeapon = makeWeapon({ might: 5, range: { min: 2, max: 3 } });
    const defWeapon = makeWeapon({ might: 4, range: { min: 1, max: 1 } });
    const terrain = makeTerrain();

    const forecast = engine.getBattleForecast(
      attacker, defender, atkWeapon, defWeapon,
      terrain, terrain, 2, 0, 0,
    );
    expect(forecast.defenderCanCounter).toBe(false);
    expect(forecast.defenderDamage).toBe(0);
  });

  it('defender cannot counter without weapon', () => {
    const attacker = makeUnit({ currentStats: { strength: 15 } });
    const defender = makeUnit({ currentStats: { strength: 10 } });
    const atkWeapon = makeWeapon({ might: 5 });
    const terrain = makeTerrain();

    const forecast = engine.getBattleForecast(
      attacker, defender, atkWeapon, null,
      terrain, terrain, 1, 0, 0,
    );
    expect(forecast.defenderCanCounter).toBe(false);
    expect(forecast.defenderDamage).toBe(0);
    expect(forecast.defenderHit).toBe(0);
    expect(forecast.defenderCrit).toBe(0);
    expect(forecast.defenderDoubles).toBe(false);
  });

  it('defender can double if fast enough', () => {
    const attacker = makeUnit({ currentStats: { speed: 5, strength: 10 } });
    const defender = makeUnit({ currentStats: { speed: 15, strength: 10, defense: 8 } });
    const atkWeapon = makeWeapon({ might: 5 });
    const defWeapon = makeWeapon({ might: 4 });
    const terrain = makeTerrain();

    const forecast = engine.getBattleForecast(
      attacker, defender, atkWeapon, defWeapon,
      terrain, terrain, 1, 0, 0,
    );
    expect(forecast.defenderDoubles).toBe(true);
    expect(forecast.attackerDoubles).toBe(false);
  });

  it('applies support bonuses to hit rates', () => {
    const attacker = makeUnit({ currentStats: { skill: 10, luck: 5, speed: 10, strength: 10 } });
    const defender = makeUnit({ currentStats: { speed: 10, luck: 5, defense: 8, skill: 5 } });
    const atkWeapon = makeWeapon({ hit: 70 });
    const terrain = makeTerrain();

    const forecastNoAllies = engine.getBattleForecast(
      attacker, defender, atkWeapon, null,
      terrain, terrain, 1, 0, 0,
    );
    const forecastWithAllies = engine.getBattleForecast(
      attacker, defender, atkWeapon, null,
      terrain, terrain, 1, 2, 0,
    );
    expect(forecastWithAllies.attackerHit).toBeGreaterThan(forecastNoAllies.attackerHit);
  });

  it('height advantage affects forecast damage', () => {
    const attacker = makeUnit({ currentStats: { strength: 10 } });
    const defender = makeUnit({ currentStats: { defense: 5 } });
    const weapon = makeWeapon({ might: 5 });
    const highTerrain = makeTerrain({ heightLevel: 2 });
    const lowTerrain = makeTerrain({ heightLevel: 0 });

    const forecastHigh = engine.getBattleForecast(
      attacker, defender, weapon, null,
      highTerrain, lowTerrain, 1, 0, 0,
    );
    const forecastLevel = engine.getBattleForecast(
      attacker, defender, weapon, null,
      lowTerrain, lowTerrain, 1, 0, 0,
    );
    expect(forecastHigh.attackerDamage).toBeGreaterThan(forecastLevel.attackerDamage);
  });

  it('crit rate appears in forecast', () => {
    const attacker = makeUnit({ currentStats: { skill: 20, strength: 10 } });
    const defender = makeUnit({ currentStats: { luck: 5, defense: 8 } });
    const weapon = makeWeapon({ might: 5, crit: 10 });
    const terrain = makeTerrain();

    const forecast = engine.getBattleForecast(
      attacker, defender, weapon, null,
      terrain, terrain, 1, 0, 0,
    );
    expect(forecast.attackerCrit).toBeGreaterThan(0);
  });

  it('weapon triangle affects forecast hit', () => {
    const attacker = makeUnit({ currentStats: { skill: 10, luck: 5, strength: 10 } });
    const defender = makeUnit({ currentStats: { speed: 10, luck: 5, defense: 8, skill: 10 } });
    const swordWeapon = makeWeapon({ weaponType: WeaponType.Sword, hit: 70 });
    const axeWeapon = makeWeapon({ weaponType: WeaponType.Axe, hit: 70 });
    const terrain = makeTerrain();

    // Sword > Axe
    const forecast = engine.getBattleForecast(
      attacker, defender, swordWeapon, axeWeapon,
      terrain, terrain, 1, 0, 0,
    );
    expect(forecast.attackerHit).toBeGreaterThan(forecast.defenderHit);
  });
});
