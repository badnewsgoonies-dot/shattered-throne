import { describe, expect, it } from 'vitest';
import { StatusEffectType, TerrainType, UnitClassName, WeaponType } from '../../shared/types';
import {
  getTooltipForClass,
  getTooltipForStat,
  getTooltipForStatus,
  getTooltipForTerrain,
  getTooltipForWeaponType,
} from '../tooltipProvider';

const terrainKeywords: Record<TerrainType, string> = {
  [TerrainType.Plains]: 'standard',
  [TerrainType.Forest]: 'defense',
  [TerrainType.Mountain]: 'evasion',
  [TerrainType.Water]: 'impassable',
  [TerrainType.Lava]: 'hazardous',
  [TerrainType.Fortress]: 'defense',
  [TerrainType.Bridge]: 'chokepoints',
  [TerrainType.Swamp]: 'slows',
  [TerrainType.Sand]: 'movement',
  [TerrainType.Snow]: 'slows',
  [TerrainType.Void]: 'impassable',
};

const statNames = ['HP', 'Strength', 'Magic', 'Skill', 'Speed', 'Luck', 'Defense', 'Resistance', 'Movement'];

const statusKeywords: Record<StatusEffectType, string> = {
  [StatusEffectType.Poison]: '10% max hp',
  [StatusEffectType.Sleep]: 'cannot act',
  [StatusEffectType.Silence]: 'cannot use',
  [StatusEffectType.Berserk]: 'nearest target',
  [StatusEffectType.Charm]: 'opposing side',
  [StatusEffectType.Frozen]: 'cannot move',
  [StatusEffectType.Blind]: 'hit-rate',
  [StatusEffectType.Stun]: 'loses',
};

const weaponKeywords: Record<WeaponType, string> = {
  [WeaponType.Sword]: 'axes',
  [WeaponType.Lance]: 'swords',
  [WeaponType.Axe]: 'lances',
  [WeaponType.Bow]: 'ranged',
  [WeaponType.FireTome]: 'wind',
  [WeaponType.WindTome]: 'thunder',
  [WeaponType.ThunderTome]: 'fire',
  [WeaponType.DarkTome]: 'specialized',
  [WeaponType.LightTome]: 'holy',
  [WeaponType.Staff]: 'healing',
};

const classKeywords: Record<UnitClassName, string> = {
  [UnitClassName.Warrior]: 'fighter',
  [UnitClassName.Knight]: 'mounted',
  [UnitClassName.Archer]: 'ranged',
  [UnitClassName.Mage]: 'caster',
  [UnitClassName.Cleric]: 'healer',
  [UnitClassName.Thief]: 'utility',
  [UnitClassName.Berserker]: 'power',
  [UnitClassName.Paladin]: 'mounted',
  [UnitClassName.Assassin]: 'critical',
  [UnitClassName.Sage]: 'magic',
  [UnitClassName.General]: 'armored',
  [UnitClassName.Dancer]: 'refreshes',
  [UnitClassName.Sniper]: 'ranged',
  [UnitClassName.Ranger]: 'mobile',
  [UnitClassName.DarkKnight]: 'mounted',
  [UnitClassName.Bishop]: 'healing',
  [UnitClassName.Valkyrie]: 'mounted',
  [UnitClassName.Trickster]: 'utility',
  [UnitClassName.GreatKnight]: 'mounted',
};

describe('tooltipProvider', () => {
  for (const terrain of Object.values(TerrainType)) {
    it(`returns tooltip for terrain ${terrain}`, () => {
      const tooltip = getTooltipForTerrain(terrain);
      expect(tooltip.length).toBeGreaterThan(0);
      expect(tooltip.toLowerCase()).toContain(terrainKeywords[terrain]);
    });
  }

  for (const statName of statNames) {
    it(`returns tooltip for stat ${statName}`, () => {
      const tooltip = getTooltipForStat(statName);
      expect(tooltip.length).toBeGreaterThan(0);
      expect(tooltip.toLowerCase()).toContain(statName.toLowerCase() === 'hp' ? 'hit points' : statName.toLowerCase());
    });
  }

  for (const status of Object.values(StatusEffectType)) {
    it(`returns tooltip for status ${status}`, () => {
      const tooltip = getTooltipForStatus(status);
      expect(tooltip.length).toBeGreaterThan(0);
      expect(tooltip.toLowerCase()).toContain(statusKeywords[status]);
    });
  }

  for (const weapon of Object.values(WeaponType)) {
    it(`returns tooltip for weapon type ${weapon}`, () => {
      const tooltip = getTooltipForWeaponType(weapon);
      expect(tooltip.length).toBeGreaterThan(0);
      expect(tooltip.toLowerCase()).toContain(weaponKeywords[weapon]);
    });
  }

  for (const className of Object.values(UnitClassName)) {
    it(`returns tooltip for class ${className}`, () => {
      const tooltip = getTooltipForClass(className);
      expect(tooltip.length).toBeGreaterThan(0);
      expect(tooltip.toLowerCase()).toContain(classKeywords[className]);
    });
  }

  it('supports common stat abbreviations', () => {
    expect(getTooltipForStat('str')).toContain('Strength');
    expect(getTooltipForStat('mag')).toContain('Magic');
    expect(getTooltipForStat('skl')).toContain('Skill');
    expect(getTooltipForStat('spd')).toContain('Speed');
    expect(getTooltipForStat('lck')).toContain('Luck');
    expect(getTooltipForStat('def')).toContain('Defense');
    expect(getTooltipForStat('res')).toContain('Resistance');
    expect(getTooltipForStat('mov')).toContain('Movement');
  });

  it('returns fallback message for unknown stat', () => {
    expect(getTooltipForStat('unknown-stat-name')).toBe('No tooltip available for this stat.');
  });
});
