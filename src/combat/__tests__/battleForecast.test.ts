import { describe, expect, it } from 'vitest';
import { WeaponType } from '../../shared/types';
import { createCombatEngine } from '../combatEngine';
import { makeMagicWeapon, makeTerrain, makeUnit, makeWeapon } from './testUtils';

const engine = createCombatEngine();

describe('combatEngine.getBattleForecast', () => {
  it('returns baseline forecast values for equal units', () => {
    const attacker = makeUnit({ id: 'a' });
    const defender = makeUnit({ id: 'd', team: 'enemy' });
    const attackerWeapon = makeWeapon({ weaponType: WeaponType.Sword });
    const defenderWeapon = makeWeapon({ weaponType: WeaponType.Sword });

    const forecast = engine.getBattleForecast(
      attacker,
      defender,
      attackerWeapon,
      defenderWeapon,
      makeTerrain(),
      makeTerrain(),
      1,
      0,
      0,
    );

    expect(forecast).toEqual({
      attackerDamage: 8,
      attackerHit: 80,
      attackerCrit: 0,
      attackerDoubles: false,
      defenderDamage: 8,
      defenderHit: 80,
      defenderCrit: 0,
      defenderDoubles: false,
      defenderCanCounter: true,
    });
  });

  it('applies support allies to attacker and defender hit values', () => {
    const attacker = makeUnit({ id: 'a' });
    const defender = makeUnit({ id: 'd', team: 'enemy' });

    const forecast = engine.getBattleForecast(
      attacker,
      defender,
      makeWeapon({ weaponType: WeaponType.Sword }),
      makeWeapon({ weaponType: WeaponType.Sword }),
      makeTerrain(),
      makeTerrain(),
      1,
      2,
      1,
    );

    expect(forecast.attackerHit).toBe(90);
    expect(forecast.defenderHit).toBe(70);
  });

  it('applies physical triangle bonus to attacker and penalty to defender', () => {
    const attacker = makeUnit({ id: 'a' });
    const defender = makeUnit({ id: 'd', team: 'enemy' });

    const forecast = engine.getBattleForecast(
      attacker,
      defender,
      makeWeapon({ weaponType: WeaponType.Sword }),
      makeWeapon({ weaponType: WeaponType.Axe }),
      makeTerrain(),
      makeTerrain(),
      1,
      0,
      0,
    );

    expect(forecast.attackerDamage).toBe(9);
    expect(forecast.attackerHit).toBe(95);
    expect(forecast.defenderDamage).toBe(7);
    expect(forecast.defenderHit).toBe(65);
  });

  it('applies magic triangle bonus when both weapons have elements', () => {
    const attacker = makeUnit({ id: 'a', currentStats: { magic: 12 } });
    const defender = makeUnit({ id: 'd', team: 'enemy', currentStats: { resistance: 7 } });

    const forecast = engine.getBattleForecast(
      attacker,
      defender,
      makeMagicWeapon(WeaponType.FireTome),
      makeMagicWeapon(WeaponType.WindTome),
      makeTerrain(),
      makeTerrain(),
      1,
      0,
      0,
    );

    expect(forecast.attackerDamage).toBe(13);
    expect(forecast.attackerHit).toBe(100);
  });

  it('applies height advantage and disadvantage hit modifiers', () => {
    const attacker = makeUnit({ id: 'a' });
    const defender = makeUnit({ id: 'd', team: 'enemy' });

    const highGround = engine.getBattleForecast(
      attacker,
      defender,
      makeWeapon(),
      makeWeapon(),
      makeTerrain({ heightLevel: 2 }),
      makeTerrain({ heightLevel: 0 }),
      1,
      0,
      0,
    );

    const lowGround = engine.getBattleForecast(
      attacker,
      defender,
      makeWeapon(),
      makeWeapon(),
      makeTerrain({ heightLevel: 0 }),
      makeTerrain({ heightLevel: 2 }),
      1,
      0,
      0,
    );

    expect(highGround.attackerHit).toBe(95);
    expect(highGround.defenderHit).toBe(65);
    expect(lowGround.attackerHit).toBe(65);
    expect(lowGround.defenderHit).toBe(95);
  });

  it('marks attacker as doubling only when speed difference is strictly greater than threshold', () => {
    const defender = makeUnit({ id: 'd', team: 'enemy', currentStats: { speed: 9 } });

    const diffFive = engine.getBattleForecast(
      makeUnit({ id: 'a', currentStats: { speed: 14 } }),
      defender,
      makeWeapon(),
      makeWeapon(),
      makeTerrain(),
      makeTerrain(),
      1,
      0,
      0,
    );

    const diffSix = engine.getBattleForecast(
      makeUnit({ id: 'a2', currentStats: { speed: 15 } }),
      defender,
      makeWeapon(),
      makeWeapon(),
      makeTerrain(),
      makeTerrain(),
      1,
      0,
      0,
    );

    expect(diffFive.attackerDoubles).toBe(false);
    expect(diffSix.attackerDoubles).toBe(true);
  });

  it('allows defender doubles only when defender can counter', () => {
    const attacker = makeUnit({ id: 'a', currentStats: { speed: 8 } });
    const defender = makeUnit({ id: 'd', team: 'enemy', currentStats: { speed: 16 } });

    const withCounter = engine.getBattleForecast(
      attacker,
      defender,
      makeWeapon({ range: { min: 1, max: 1 } }),
      makeWeapon({ range: { min: 1, max: 1 } }),
      makeTerrain(),
      makeTerrain(),
      1,
      0,
      0,
    );

    const noCounter = engine.getBattleForecast(
      attacker,
      defender,
      makeWeapon({ range: { min: 1, max: 1 } }),
      makeWeapon({ range: { min: 2, max: 2 } }),
      makeTerrain(),
      makeTerrain(),
      1,
      0,
      0,
    );

    expect(withCounter.defenderDoubles).toBe(true);
    expect(noCounter.defenderDoubles).toBe(false);
  });

  it.each([
    [null, 1, false],
    [makeWeapon({ range: { min: 2, max: 2 } }), 1, false],
    [makeWeapon({ range: { min: 1, max: 1 } }), 1, true],
    [makeWeapon({ range: { min: 1, max: 2 } }), 2, true],
  ] as const)('computes counter possibility with weapon range and distance', (defenderWeapon, distance, expected) => {
    const forecast = engine.getBattleForecast(
      makeUnit({ id: 'a' }),
      makeUnit({ id: 'd', team: 'enemy' }),
      makeWeapon({ range: { min: 1, max: 1 } }),
      defenderWeapon,
      makeTerrain(),
      makeTerrain(),
      distance,
      0,
      0,
    );

    expect(forecast.defenderCanCounter).toBe(expected);
  });

  it('sets defender combat stats to zero when counter is not possible', () => {
    const forecast = engine.getBattleForecast(
      makeUnit({ id: 'a' }),
      makeUnit({ id: 'd', team: 'enemy' }),
      makeWeapon({ range: { min: 1, max: 1 } }),
      makeWeapon({ range: { min: 2, max: 2 } }),
      makeTerrain(),
      makeTerrain(),
      1,
      0,
      0,
    );

    expect(forecast.defenderDamage).toBe(0);
    expect(forecast.defenderHit).toBe(0);
    expect(forecast.defenderCrit).toBe(0);
    expect(forecast.defenderDoubles).toBe(false);
  });

  it('uses defender terrain for attacker damage reduction', () => {
    const forecast = engine.getBattleForecast(
      makeUnit({ id: 'a', currentStats: { strength: 12 } }),
      makeUnit({ id: 'd', team: 'enemy', currentStats: { defense: 7 } }),
      makeWeapon({ might: 6 }),
      makeWeapon(),
      makeTerrain(),
      makeTerrain({ defenseBonus: 3 }),
      1,
      0,
      0,
    );

    expect(forecast.attackerDamage).toBe(8);
  });

  it('uses attacker terrain for defender damage reduction on counter', () => {
    const forecast = engine.getBattleForecast(
      makeUnit({ id: 'a', currentStats: { defense: 10 } }),
      makeUnit({ id: 'd', team: 'enemy', currentStats: { strength: 12 } }),
      makeWeapon(),
      makeWeapon({ might: 6 }),
      makeTerrain({ defenseBonus: 2 }),
      makeTerrain(),
      1,
      0,
      0,
    );

    expect(forecast.defenderDamage).toBe(6);
  });
});
