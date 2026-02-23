import { describe, it, expect } from 'vitest';
import { skills } from '../skills';
import { SkillType, AoEPattern } from '../../shared/types';

describe('Skills', () => {
  it('should have 50+ skills', () => {
    expect(skills.length).toBeGreaterThanOrEqual(50);
  });

  it('should have no duplicate IDs', () => {
    const ids = skills.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have valid skill types', () => {
    for (const s of skills) {
      expect([SkillType.Active, SkillType.Passive]).toContain(s.type);
    }
  });

  it('should have non-negative SP costs', () => {
    for (const s of skills) {
      expect(s.spCost).toBeGreaterThanOrEqual(0);
    }
  });

  it('should have valid AoE patterns', () => {
    const validPatterns = Object.values(AoEPattern);
    for (const s of skills) {
      expect(validPatterns).toContain(s.aoePattern);
    }
  });

  it('should have valid range (min <= max)', () => {
    for (const s of skills) {
      expect(s.range.min).toBeLessThanOrEqual(s.range.max);
    }
  });

  it('should include active damage skills', () => {
    const dmg = skills.filter(s => s.type === SkillType.Active && s.damage);
    expect(dmg.length).toBeGreaterThanOrEqual(10);
  });

  it('should include active heal/support skills', () => {
    const heal = skills.filter(s => s.type === SkillType.Active && (s.healing || s.buff));
    expect(heal.length).toBeGreaterThanOrEqual(5);
  });

  it('should include passive skills', () => {
    const passive = skills.filter(s => s.type === SkillType.Passive);
    expect(passive.length).toBeGreaterThanOrEqual(15);
  });

  it('should have names and descriptions', () => {
    for (const s of skills) {
      expect(s.name).toBeTruthy();
      expect(s.description).toBeTruthy();
    }
  });

  it('should have non-negative aoeSize', () => {
    for (const s of skills) {
      expect(s.aoeSize).toBeGreaterThanOrEqual(0);
    }
  });
});
