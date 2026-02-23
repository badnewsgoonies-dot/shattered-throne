import { describe, expect, it } from 'vitest';
import { Element, MovementType, WeaponType } from '../../shared/types';
import { calculateDamage } from '../damageCalculator';
import { makeMagicWeapon, makeTerrain, makeUnit, makeWeapon } from './testUtils';

describe('damageCalculator.calculateDamage', () => {
  it('calculates basic physical damage using strength and defense', () => {
    const attacker = makeUnit({ currentStats: { strength: 12 } });
    const defender = makeUnit({ currentStats: { defense: 7 } });
    const weapon = makeWeapon({ might: 6, weaponType: WeaponType.Sword });

    const result = calculateDamage(attacker, defender, weapon, makeWeapon({ weaponType: WeaponType.Sword }), makeTerrain(), 1);

    expect(result).toBe(11);
  });

  it('calculates basic magical damage using magic and resistance', () => {
    const attacker = makeUnit({ currentStats: { magic: 14 } });
    const defender = makeUnit({ currentStats: { resistance: 6 } });
    const weapon = makeMagicWeapon(WeaponType.FireTome, Element.Fire);

    const result = calculateDamage(attacker, defender, weapon, makeMagicWeapon(WeaponType.WindTome, Element.Wind), makeTerrain(), 1);

    expect(result).toBe(16);
  });

  it.each([
    [WeaponType.Sword, WeaponType.Axe, 1],
    [WeaponType.Axe, WeaponType.Lance, 1],
    [WeaponType.Lance, WeaponType.Sword, 1],
    [WeaponType.Sword, WeaponType.Lance, -1],
    [WeaponType.Lance, WeaponType.Axe, -1],
    [WeaponType.Axe, WeaponType.Sword, -1],
  ])(
    'applies physical triangle damage modifier for %s vs %s',
    (attackerType, defenderType, expectedBonus) => {
      const attacker = makeUnit({ currentStats: { strength: 10 } });
      const defender = makeUnit({ currentStats: { defense: 8 } });
      const attackerWeapon = makeWeapon({ weaponType: attackerType, might: 6 });
      const defenderWeapon = makeWeapon({ weaponType: defenderType });

      const result = calculateDamage(attacker, defender, attackerWeapon, defenderWeapon, makeTerrain(), 1);

      expect(result).toBe(8 + expectedBonus);
    },
  );

  it.each([
    [Element.Fire, Element.Wind, 1],
    [Element.Wind, Element.Thunder, 1],
    [Element.Thunder, Element.Fire, 1],
    [Element.Fire, Element.Thunder, -1],
    [Element.Wind, Element.Fire, -1],
    [Element.Thunder, Element.Wind, -1],
  ])('applies magic triangle damage modifier for %s vs %s', (attackerElement, defenderElement, expectedBonus) => {
    const attacker = makeUnit({ currentStats: { magic: 10 } });
    const defender = makeUnit({ currentStats: { resistance: 7 } });
    const attackerWeapon = makeMagicWeapon(WeaponType.FireTome, attackerElement);
    const defenderWeapon = makeMagicWeapon(WeaponType.FireTome, defenderElement);

    const result = calculateDamage(attacker, defender, attackerWeapon, defenderWeapon, makeTerrain(), 1);

    expect(result).toBe(10 + attackerWeapon.might - 7 + expectedBonus);
  });

  it.each([
    [Element.Dark, Element.Light],
    [Element.Light, Element.Dark],
  ])('grants mutual dark/light damage advantage for %s vs %s', (attackerElement, defenderElement) => {
    const attacker = makeUnit({ currentStats: { magic: 11 } });
    const defender = makeUnit({ currentStats: { resistance: 6 } });
    const attackerWeapon = makeMagicWeapon(WeaponType.DarkTome, attackerElement);
    const defenderWeapon = makeMagicWeapon(WeaponType.LightTome, defenderElement);

    const result = calculateDamage(attacker, defender, attackerWeapon, defenderWeapon, makeTerrain(), 1);

    expect(result).toBe(13);
  });

  it('returns neutral triangle damage when defender has no weapon', () => {
    const attacker = makeUnit({ currentStats: { strength: 10 } });
    const defender = makeUnit({ currentStats: { defense: 7 } });
    const weapon = makeWeapon({ weaponType: WeaponType.Sword, might: 5 });

    const result = calculateDamage(attacker, defender, weapon, null, makeTerrain(), 1);

    expect(result).toBe(8);
  });

  it('subtracts terrain defense bonus from damage', () => {
    const attacker = makeUnit({ currentStats: { strength: 12 } });
    const defender = makeUnit({ currentStats: { defense: 7 } });
    const weapon = makeWeapon({ might: 6 });
    const terrain = makeTerrain({ defenseBonus: 3 });

    const result = calculateDamage(attacker, defender, weapon, makeWeapon({ weaponType: WeaponType.Sword }), terrain, 1);

    expect(result).toBe(8);
  });

  it('adds effectiveness bonus for matching movement type (3x weapon might total)', () => {
    const attacker = makeUnit({ currentStats: { strength: 9 } });
    const defender = makeUnit({ currentStats: { defense: 8 }, movementType: MovementType.Armored });
    const weapon = makeWeapon({ might: 7, effectiveAgainst: [MovementType.Armored] });

    const result = calculateDamage(attacker, defender, weapon, makeWeapon({ weaponType: WeaponType.Sword }), makeTerrain(), 1);

    expect(result).toBe(22);
  });

  it('does not apply effectiveness bonus when movement type does not match', () => {
    const attacker = makeUnit({ currentStats: { strength: 9 } });
    const defender = makeUnit({ currentStats: { defense: 8 }, movementType: MovementType.Foot });
    const weapon = makeWeapon({ might: 7, effectiveAgainst: [MovementType.Armored] });

    const result = calculateDamage(attacker, defender, weapon, makeWeapon({ weaponType: WeaponType.Sword }), makeTerrain(), 1);

    expect(result).toBe(8);
  });

  it('floors damage at zero for high defense targets', () => {
    const attacker = makeUnit({ currentStats: { strength: 5 } });
    const defender = makeUnit({ currentStats: { defense: 30 } });
    const weapon = makeWeapon({ might: 4 });

    const result = calculateDamage(attacker, defender, weapon, makeWeapon({ weaponType: WeaponType.Sword }), makeTerrain(), 1);

    expect(result).toBe(0);
  });

  it('handles large values without truncating', () => {
    const attacker = makeUnit({ currentStats: { strength: 80 } });
    const defender = makeUnit({ currentStats: { defense: 12 } });
    const weapon = makeWeapon({ might: 30 });

    const result = calculateDamage(attacker, defender, weapon, makeWeapon({ weaponType: WeaponType.Sword }), makeTerrain(), 1);

    expect(result).toBe(98);
  });

  it('treats staff as magic damage that targets resistance', () => {
    const attacker = makeUnit({ currentStats: { magic: 15 } });
    const defender = makeUnit({ currentStats: { defense: 50, resistance: 10 } });
    const weapon = makeWeapon({ weaponType: WeaponType.Staff, might: 6 });

    const result = calculateDamage(attacker, defender, weapon, makeWeapon({ weaponType: WeaponType.Staff }), makeTerrain(), 1);

    expect(result).toBe(11);
  });

  it('uses weapon-type derived magic element when element field is undefined', () => {
    const attacker = makeUnit({ currentStats: { magic: 10 } });
    const defender = makeUnit({ currentStats: { resistance: 4 } });
    const attackerWeapon = makeWeapon({ weaponType: WeaponType.FireTome, might: 5, element: undefined });
    const defenderWeapon = makeWeapon({ weaponType: WeaponType.WindTome, element: undefined });

    const result = calculateDamage(attacker, defender, attackerWeapon, defenderWeapon, makeTerrain(), 1);

    expect(result).toBe(12);
  });

  it('uses physical defense for non-magical weapons even when defender resistance is lower', () => {
    const attacker = makeUnit({ currentStats: { strength: 12 } });
    const defender = makeUnit({ currentStats: { defense: 11, resistance: 1 } });
    const weapon = makeWeapon({ weaponType: WeaponType.Axe, might: 5 });

    const result = calculateDamage(attacker, defender, weapon, makeWeapon({ weaponType: WeaponType.Lance }), makeTerrain(), 1);

    expect(result).toBe(7);
  });

  it('uses magical resistance for tomes even when defender defense is lower', () => {
    const attacker = makeUnit({ currentStats: { magic: 12 } });
    const defender = makeUnit({ currentStats: { defense: 2, resistance: 9 } });
    const weapon = makeMagicWeapon(WeaponType.ThunderTome, Element.Thunder);

    const result = calculateDamage(attacker, defender, weapon, makeMagicWeapon(WeaponType.FireTome, Element.Fire), makeTerrain(), 1);

    expect(result).toBe(11);
  });

  it('can be reduced to zero by terrain and low attack stats together', () => {
    const attacker = makeUnit({ currentStats: { strength: 7 } });
    const defender = makeUnit({ currentStats: { defense: 8 } });
    const weapon = makeWeapon({ might: 2 });
    const terrain = makeTerrain({ defenseBonus: 5 });

    const result = calculateDamage(attacker, defender, weapon, makeWeapon({ weaponType: WeaponType.Sword }), terrain, 1);

    expect(result).toBe(0);
  });

  it('ignores distance in current formula implementation', () => {
    const attacker = makeUnit({ currentStats: { strength: 10 } });
    const defender = makeUnit({ currentStats: { defense: 7 } });
    const weapon = makeWeapon({ might: 5 });

    const close = calculateDamage(attacker, defender, weapon, makeWeapon({ weaponType: WeaponType.Sword }), makeTerrain(), 1);
    const far = calculateDamage(attacker, defender, weapon, makeWeapon({ weaponType: WeaponType.Sword }), makeTerrain(), 2);

    expect(close).toBe(far);
  });
});
