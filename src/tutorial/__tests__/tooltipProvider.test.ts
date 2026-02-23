import { describe, it, expect } from 'vitest';
import {
  getTooltipForTerrain,
  getTooltipForStat,
  getTooltipForStatus,
  getTooltipForWeaponType,
  getTooltipForClass,
} from '../tooltipProvider';
import { TerrainType, StatusEffectType, WeaponType, UnitClassName } from '../../shared/types';

describe('TooltipProvider', () => {
  describe('getTooltipForTerrain', () => {
    const terrainTypes = Object.values(TerrainType);

    for (const terrain of terrainTypes) {
      it(`should return tooltip for ${terrain}`, () => {
        const tip = getTooltipForTerrain(terrain);
        expect(tip).toBeTruthy();
        expect(tip.length).toBeGreaterThan(10);
      });
    }

    it('Forest tooltip mentions defense bonus', () => {
      expect(getTooltipForTerrain(TerrainType.Forest)).toContain('defense');
    });

    it('Mountain tooltip mentions impassable', () => {
      expect(getTooltipForTerrain(TerrainType.Mountain)).toContain('Impassable');
    });
  });

  describe('getTooltipForStat', () => {
    const stats = ['hp', 'strength', 'magic', 'skill', 'speed', 'luck', 'defense', 'resistance', 'movement'];

    for (const stat of stats) {
      it(`should return tooltip for ${stat}`, () => {
        const tip = getTooltipForStat(stat);
        expect(tip).toBeTruthy();
        expect(tip.length).toBeGreaterThan(10);
      });
    }

    it('should be case-insensitive', () => {
      expect(getTooltipForStat('HP')).toBe(getTooltipForStat('hp'));
      expect(getTooltipForStat('Strength')).toBe(getTooltipForStat('strength'));
    });

    it('should return fallback for unknown stat', () => {
      expect(getTooltipForStat('charisma')).toBe('Unknown stat.');
    });
  });

  describe('getTooltipForStatus', () => {
    const statuses = Object.values(StatusEffectType);

    for (const status of statuses) {
      it(`should return tooltip for ${status}`, () => {
        const tip = getTooltipForStatus(status);
        expect(tip).toBeTruthy();
        expect(tip.length).toBeGreaterThan(10);
      });
    }

    it('Poison tooltip mentions damage', () => {
      expect(getTooltipForStatus(StatusEffectType.Poison)).toContain('damage');
    });
  });

  describe('getTooltipForWeaponType', () => {
    const weapons = Object.values(WeaponType);

    for (const weapon of weapons) {
      it(`should return tooltip for ${weapon}`, () => {
        const tip = getTooltipForWeaponType(weapon);
        expect(tip).toBeTruthy();
        expect(tip.length).toBeGreaterThan(10);
      });
    }

    it('Sword tooltip mentions weapon triangle', () => {
      expect(getTooltipForWeaponType(WeaponType.Sword)).toContain('Axes');
    });
  });

  describe('getTooltipForClass', () => {
    const classes = Object.values(UnitClassName);

    for (const cls of classes) {
      it(`should return tooltip for ${cls}`, () => {
        const tip = getTooltipForClass(cls);
        expect(tip).toBeTruthy();
        expect(tip.length).toBeGreaterThan(10);
      });
    }

    it('Warrior tooltip mentions melee', () => {
      expect(getTooltipForClass(UnitClassName.Warrior)).toContain('melee');
    });

    it('Cleric tooltip mentions healer', () => {
      expect(getTooltipForClass(UnitClassName.Cleric)).toContain('Healer');
    });
  });
});
