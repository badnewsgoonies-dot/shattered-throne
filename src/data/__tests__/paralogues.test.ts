import { describe, expect, it } from 'vitest';
import { DefeatCondition } from '../../shared/types';
import { MAP_LAYOUTS } from '../mapLayouts';
import { PARALOGUES, getParalogueById } from '../paralogues';

describe('paralogues data', () => {
  const mapSet = new Set(MAP_LAYOUTS.map((map) => map.id));

  it('has exactly 10 paralogue chapters', () => {
    expect(PARALOGUES).toHaveLength(10);
  });

  it('paralogue IDs are unique and prefixed with px_', () => {
    const ids = PARALOGUES.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id.startsWith('px_')).toBe(true);
    }
  });

  it('all map references are valid', () => {
    for (const chapter of PARALOGUES) {
      expect(mapSet.has(chapter.mapId)).toBe(true);
    }
  });

  it('all descriptions include unlock conditions', () => {
    for (const chapter of PARALOGUES) {
      expect(chapter.description.includes('Unlock:')).toBe(true);
    }
  });

  it('all paralogues are standalone (nextChapterId null)', () => {
    for (const chapter of PARALOGUES) {
      expect(chapter.nextChapterId).toBeNull();
    }
  });

  it('all paralogues include preBattle and postBattle narrative', () => {
    for (const chapter of PARALOGUES) {
      const pre = chapter.narrative.find((entry) => entry.trigger === 'preBattle');
      const post = chapter.narrative.find((entry) => entry.trigger === 'postBattle');
      expect(pre).toBeDefined();
      expect(post).toBeDefined();
    }
  });

  it('all paralogues have victory and defeat conditions', () => {
    for (const chapter of PARALOGUES) {
      expect(chapter.victoryConditions.length).toBeGreaterThan(0);
      expect(chapter.defeatConditions.length).toBeGreaterThan(0);
      expect(chapter.defeatConditions.map((entry) => entry.type)).toContain(DefeatCondition.LordDies);
    }
  });

  it('all paralogues have enemies and rewards', () => {
    for (const chapter of PARALOGUES) {
      expect(chapter.enemies.length).toBeGreaterThan(0);
      expect(chapter.rewards.itemRewards.length).toBeGreaterThan(0);
      expect(chapter.rewards.goldReward).toBeGreaterThan(0);
    }
  });

  it('paralogue numbers are in 100+ side-story range', () => {
    for (const chapter of PARALOGUES) {
      expect(chapter.number).toBeGreaterThanOrEqual(100);
    }
  });

  it('getter returns chapter for known id and null for unknown id', () => {
    expect(getParalogueById('px_1')?.id).toBe('px_1');
    expect(getParalogueById('missing')).toBeNull();
  });
});
