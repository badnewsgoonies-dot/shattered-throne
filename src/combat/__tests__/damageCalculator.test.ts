import { describe, it, expect } from 'vitest';
import { calculateDamage, calculateDamageWithHeight, applyCritical } from '../damageCalculator';
import { makeUnit, makeWeapon, makeTerrain } from './helpers';
import {
  WeaponType,
  ItemCategory,
  MovementType,
  Element,
  TerrainType,
  CRIT_MULTIPLIER,
} from '../../shared/types';

describe('damageCalculator', () => {
  describe('physical damage', () => {
    it('calculates basic physical damage correctly', () => {
      const attacker = makeUnit({ currentStats: { strength: 15 } });
      const defender = makeUnit({ currentStats: { defense: 8 } });
      const weapon = makeWeapon({ might: 5 });
      const terrain = makeTerrain();
      // damage = 15 + 5 - 8 = 12
      expect(calculateDamage(attacker, defender, weapon, null, terrain, 1)).toBe(12);
    });

    it('applies terrain defense bonus', () => {
      const attacker = makeUnit({ currentStats: { strength: 15 } });
      const defender = makeUnit({ currentStats: { defense: 8 } });
      const weapon = makeWeapon({ might: 5 });
      const terrain = makeTerrain({ defenseBonus: 3 });
      // damage = 15 + 5 - 8 - 3 = 9
      expect(calculateDamage(attacker, defender, weapon, null, terrain, 1)).toBe(9);
    });

    it('clamps damage to minimum 0', () => {
      const attacker = makeUnit({ currentStats: { strength: 2 } });
      const defender = makeUnit({ currentStats: { defense: 20 } });
      const weapon = makeWeapon({ might: 3 });
      const terrain = makeTerrain();
      expect(calculateDamage(attacker, defender, weapon, null, terrain, 1)).toBe(0);
    });

    it('applies weapon triangle damage bonus (advantage)', () => {
      const attacker = makeUnit({ currentStats: { strength: 10 } });
      const defender = makeUnit({ currentStats: { defense: 8 } });
      const atkWeapon = makeWeapon({ weaponType: WeaponType.Sword, might: 5 });
      const defWeapon = makeWeapon({ weaponType: WeaponType.Axe, might: 5 });
      const terrain = makeTerrain();
      // Sword > Axe: +1 damage bonus
      // damage = 10 + 5 + 1 - 8 = 8
      expect(calculateDamage(attacker, defender, atkWeapon, defWeapon, terrain, 1)).toBe(8);
    });

    it('applies weapon triangle damage penalty (disadvantage)', () => {
      const attacker = makeUnit({ currentStats: { strength: 10 } });
      const defender = makeUnit({ currentStats: { defense: 8 } });
      const atkWeapon = makeWeapon({ weaponType: WeaponType.Axe, might: 5 });
      const defWeapon = makeWeapon({ weaponType: WeaponType.Sword, might: 5 });
      const terrain = makeTerrain();
      // Axe < Sword: -1 damage bonus
      // damage = 10 + 5 - 1 - 8 = 6
      expect(calculateDamage(attacker, defender, atkWeapon, defWeapon, terrain, 1)).toBe(6);
    });

    it('applies forge bonuses to weapon might', () => {
      const attacker = makeUnit({ currentStats: { strength: 10 } });
      const defender = makeUnit({ currentStats: { defense: 8 } });
      const weapon = makeWeapon({
        might: 5,
        forgeBonuses: { might: 3, hit: 0, crit: 0 },
      } as any);
      const terrain = makeTerrain();
      // damage = 10 + 5 + 3 - 8 = 10
      expect(calculateDamage(attacker, defender, weapon, null, terrain, 1)).toBe(10);
    });

    it('applies effectiveness bonus (3x weapon might)', () => {
      const attacker = makeUnit({ currentStats: { strength: 10 } });
      const defender = makeUnit({ movementType: MovementType.Mounted });
      const weapon = makeWeapon({
        might: 5,
        effectiveAgainst: [MovementType.Mounted],
      });
      const terrain = makeTerrain();
      // effectiveness: 3x weapon might = 15
      // damage = 10 + 15 - 8 = 17
      expect(calculateDamage(attacker, defender, weapon, null, terrain, 1)).toBe(17);
    });

    it('applies effectiveness with forge bonus', () => {
      const attacker = makeUnit({ currentStats: { strength: 10 } });
      const defender = makeUnit({ movementType: MovementType.Mounted, currentStats: { defense: 8 } });
      const weapon = makeWeapon({
        might: 5,
        effectiveAgainst: [MovementType.Mounted],
        forgeBonuses: { might: 2, hit: 0, crit: 0 },
      } as any);
      const terrain = makeTerrain();
      // effectiveness: 3x base might = 15, + forge 2 = 17
      // damage = 10 + 17 - 8 = 19
      expect(calculateDamage(attacker, defender, weapon, null, terrain, 1)).toBe(19);
    });
  });

  describe('magical damage', () => {
    it('calculates magical damage with tomes', () => {
      const attacker = makeUnit({ currentStats: { magic: 12 } });
      const defender = makeUnit({ currentStats: { resistance: 5 } });
      const weapon = makeWeapon({ weaponType: WeaponType.FireTome, might: 6 });
      const terrain = makeTerrain();
      // magic damage = 12 + 6 - 5 = 13
      expect(calculateDamage(attacker, defender, weapon, null, terrain, 1)).toBe(13);
    });

    it('applies magic triangle bonus (Fire > Wind)', () => {
      const attacker = makeUnit({ currentStats: { magic: 10 } });
      const defender = makeUnit({ currentStats: { resistance: 5 } });
      const atkWeapon = makeWeapon({
        weaponType: WeaponType.FireTome,
        might: 6,
        element: Element.Fire,
      });
      const defWeapon = makeWeapon({
        weaponType: WeaponType.WindTome,
        might: 6,
        element: Element.Wind,
      });
      const terrain = makeTerrain();
      // Fire > Wind: +1 magic triangle damage bonus
      // damage = 10 + 6 + 1 - 5 = 12
      expect(calculateDamage(attacker, defender, atkWeapon, defWeapon, terrain, 1)).toBe(12);
    });

    it('applies Dark <> Light mutual advantage bonus', () => {
      const attacker = makeUnit({ currentStats: { magic: 10 } });
      const defender = makeUnit({ currentStats: { resistance: 5 } });
      const atkWeapon = makeWeapon({
        weaponType: WeaponType.DarkTome,
        might: 6,
        element: Element.Dark,
      });
      const defWeapon = makeWeapon({
        weaponType: WeaponType.LightTome,
        might: 6,
        element: Element.Light,
      });
      const terrain = makeTerrain();
      // Dark <> Light: mutual advantage, +1 damage
      // damage = 10 + 6 + 1 - 5 = 12
      expect(calculateDamage(attacker, defender, atkWeapon, defWeapon, terrain, 1)).toBe(12);
    });
  });

  describe('height advantage', () => {
    it('adds 15% damage when attacker is higher', () => {
      const attacker = makeUnit({ currentStats: { strength: 10 } });
      const defender = makeUnit({ currentStats: { defense: 5 } });
      const weapon = makeWeapon({ might: 5 });
      const atkTerrain = makeTerrain({ heightLevel: 2 });
      const defTerrain = makeTerrain({ heightLevel: 0 });
      // base damage = 10 + 5 - 5 = 10, terrain def = 0
      // with height: floor(10 * 1.15) = 11
      expect(calculateDamageWithHeight(attacker, defender, weapon, null, atkTerrain, defTerrain, 1)).toBe(11);
    });

    it('does not add bonus when heights are equal', () => {
      const attacker = makeUnit({ currentStats: { strength: 10 } });
      const defender = makeUnit({ currentStats: { defense: 5 } });
      const weapon = makeWeapon({ might: 5 });
      const atkTerrain = makeTerrain({ heightLevel: 1 });
      const defTerrain = makeTerrain({ heightLevel: 1 });
      expect(calculateDamageWithHeight(attacker, defender, weapon, null, atkTerrain, defTerrain, 1)).toBe(10);
    });

    it('does not add bonus when attacker is lower', () => {
      const attacker = makeUnit({ currentStats: { strength: 10 } });
      const defender = makeUnit({ currentStats: { defense: 5 } });
      const weapon = makeWeapon({ might: 5 });
      const atkTerrain = makeTerrain({ heightLevel: 0 });
      const defTerrain = makeTerrain({ heightLevel: 2 });
      expect(calculateDamageWithHeight(attacker, defender, weapon, null, atkTerrain, defTerrain, 1)).toBe(10);
    });
  });

  describe('critical damage', () => {
    it('multiplies damage by CRIT_MULTIPLIER (3)', () => {
      expect(applyCritical(10)).toBe(30);
    });

    it('handles zero damage crits', () => {
      expect(applyCritical(0)).toBe(0);
    });

    it('handles large damage crits', () => {
      expect(applyCritical(50)).toBe(150);
    });
  });

  describe('edge cases', () => {
    it('handles zero might weapon', () => {
      const attacker = makeUnit({ currentStats: { strength: 10 } });
      const defender = makeUnit({ currentStats: { defense: 8 } });
      const weapon = makeWeapon({ might: 0 });
      const terrain = makeTerrain();
      expect(calculateDamage(attacker, defender, weapon, null, terrain, 1)).toBe(2);
    });

    it('handles very high defense', () => {
      const attacker = makeUnit({ currentStats: { strength: 5 } });
      const defender = makeUnit({ currentStats: { defense: 50 } });
      const weapon = makeWeapon({ might: 5 });
      const terrain = makeTerrain();
      expect(calculateDamage(attacker, defender, weapon, null, terrain, 1)).toBe(0);
    });

    it('handles forest terrain defense', () => {
      const attacker = makeUnit({ currentStats: { strength: 15 } });
      const defender = makeUnit({ currentStats: { defense: 8 } });
      const weapon = makeWeapon({ might: 5 });
      const terrain = makeTerrain({ type: TerrainType.Forest, defenseBonus: 2 });
      // 15 + 5 - 8 - 2 = 10
      expect(calculateDamage(attacker, defender, weapon, null, terrain, 1)).toBe(10);
    });

    it('handles fortress terrain defense', () => {
      const attacker = makeUnit({ currentStats: { strength: 15 } });
      const defender = makeUnit({ currentStats: { defense: 8 } });
      const weapon = makeWeapon({ might: 5 });
      const terrain = makeTerrain({ type: TerrainType.Fortress, defenseBonus: 5 });
      // 15 + 5 - 8 - 5 = 7
      expect(calculateDamage(attacker, defender, weapon, null, terrain, 1)).toBe(7);
    });
  });
});
