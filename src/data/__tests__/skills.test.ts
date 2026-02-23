import { describe, expect, it } from 'vitest';
import { AoEPattern, SkillType } from '../../shared/types';
import { SKILLS, getSkillById } from '../skills';

describe('skills data', () => {
  it('has at least 50 skills', () => {
    expect(SKILLS.length).toBeGreaterThanOrEqual(50);
  });

  it('skill IDs are unique', () => {
    const ids = SKILLS.map((skill) => skill.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('contains both active and passive skills', () => {
    const activeCount = SKILLS.filter((skill) => skill.type === SkillType.Active).length;
    const passiveCount = SKILLS.filter((skill) => skill.type === SkillType.Passive).length;
    expect(activeCount).toBeGreaterThan(20);
    expect(passiveCount).toBeGreaterThan(20);
  });

  it('all skills have non-negative SP costs', () => {
    for (const skill of SKILLS) {
      expect(skill.spCost).toBeGreaterThanOrEqual(0);
    }
  });

  it('all skill ranges are valid', () => {
    for (const skill of SKILLS) {
      expect(skill.range.min).toBeGreaterThanOrEqual(0);
      expect(skill.range.max).toBeGreaterThanOrEqual(skill.range.min);
    }
  });

  it('includes key active damage skills', () => {
    const ids = ['power-strike', 'luna-strike', 'sol', 'astra', 'ignis', 'flame-burst', 'wind-blade', 'thunder-strike'];
    for (const id of ids) {
      const skill = getSkillById(id);
      expect(skill).not.toBeNull();
      expect(skill?.type).toBe(SkillType.Active);
      expect(skill?.damage).toBeDefined();
    }
  });

  it('includes key support skills', () => {
    const ids = ['heal', 'rally-strength', 'rally-speed', 'dance', 'restore', 'barrier'];
    for (const id of ids) {
      const skill = getSkillById(id);
      expect(skill).not.toBeNull();
      expect(skill?.type).toBe(SkillType.Active);
    }
  });

  it('includes key debuff skills', () => {
    const ids = ['poison-strike', 'silence-skill', 'hex'];
    for (const id of ids) {
      const skill = getSkillById(id);
      expect(skill).not.toBeNull();
      expect(skill?.type).toBe(SkillType.Active);
      expect(skill?.debuff || skill?.statusEffect).toBeTruthy();
    }
  });

  it('includes key passive skills', () => {
    const ids = ['vantage', 'wrath', 'renewal', 'counter', 'miracle', 'pavise', 'aegis', 'desperation', 'quick-burn', 'lifetaker'];
    for (const id of ids) {
      const skill = getSkillById(id);
      expect(skill).not.toBeNull();
      expect(skill?.type).toBe(SkillType.Passive);
      expect(skill?.passiveEffect).toBeDefined();
    }
  });

  it('aoe patterns include non-single patterns in active skills', () => {
    const patterns = new Set(SKILLS.filter((skill) => skill.type === SkillType.Active).map((skill) => skill.aoePattern));
    expect(patterns.has(AoEPattern.Circle)).toBe(true);
    expect(patterns.has(AoEPattern.Line)).toBe(true);
    expect(patterns.has(AoEPattern.Cross)).toBe(true);
  });

  it('all passive skills have passiveEffect payload', () => {
    for (const skill of SKILLS.filter((entry) => entry.type === SkillType.Passive)) {
      expect(skill.passiveEffect).toBeDefined();
    }
  });

  it('getter returns null for unknown skill id', () => {
    expect(getSkillById('nope')).toBeNull();
  });
});
