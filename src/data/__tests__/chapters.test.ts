import { describe, it, expect } from 'vitest';
import { chapters } from '../chapters';
import { paralogues } from '../paralogues';
import { mapLayouts } from '../mapLayouts';
import { VictoryCondition, DefeatCondition } from '../../shared/types';

describe('Chapters', () => {
  const mapIds = new Set(mapLayouts.map(m => m.id));
  const allChapterIds = new Set([...chapters.map(c => c.id), ...paralogues.map(p => p.id)]);

  it('should have 25 story chapters', () => {
    expect(chapters.length).toBe(25);
  });

  it('should have no duplicate IDs', () => {
    const ids = chapters.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have valid map references', () => {
    for (const ch of chapters) {
      expect(mapIds.has(ch.mapId)).toBe(true);
    }
  });

  it('should have valid victory conditions', () => {
    const validTypes = Object.values(VictoryCondition);
    for (const ch of chapters) {
      expect(ch.victoryConditions.length).toBeGreaterThan(0);
      for (const vc of ch.victoryConditions) {
        expect(validTypes).toContain(vc.type);
      }
    }
  });

  it('should have valid defeat conditions', () => {
    const validTypes = Object.values(DefeatCondition);
    for (const ch of chapters) {
      expect(ch.defeatConditions.length).toBeGreaterThan(0);
      for (const dc of ch.defeatConditions) {
        expect(validTypes).toContain(dc.type);
      }
    }
  });

  it('should have enemies in each chapter', () => {
    for (const ch of chapters) {
      expect(ch.enemies.length).toBeGreaterThan(0);
    }
  });

  it('should have valid nextChapterId references', () => {
    for (const ch of chapters) {
      if (ch.nextChapterId) {
        expect(allChapterIds.has(ch.nextChapterId)).toBe(true);
      }
    }
  });

  it('should have sequential chapter numbers', () => {
    const nums = chapters.map(c => c.number).sort((a, b) => a - b);
    for (let i = 0; i < nums.length; i++) {
      expect(nums[i]).toBe(i + 1);
    }
  });

  it('should have deployment slots', () => {
    for (const ch of chapters) {
      expect(ch.deploymentSlots.length).toBeGreaterThan(0);
    }
  });

  it('should have titles and descriptions', () => {
    for (const ch of chapters) {
      expect(ch.title).toBeTruthy();
      expect(ch.description).toBeTruthy();
    }
  });

  it('should have rewards', () => {
    for (const ch of chapters) {
      expect(ch.rewards).toBeDefined();
      expect(ch.rewards.goldReward).toBeGreaterThanOrEqual(0);
    }
  });

  it('should have maxDeployments > 0', () => {
    for (const ch of chapters) {
      expect(ch.maxDeployments).toBeGreaterThan(0);
    }
  });
});
