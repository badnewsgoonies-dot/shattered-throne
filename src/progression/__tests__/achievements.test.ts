import { describe, expect, it } from 'vitest';
import {
  ACHIEVEMENTS,
  checkAchievements,
  getAchievementList,
} from '../achievementTracker';

describe('achievementTracker definitions', () => {
  it('contains at least 15 achievement definitions', () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(15);
  });

  it('all achievements have non-empty id/name/description', () => {
    for (const achievement of ACHIEVEMENTS) {
      expect(achievement.id.length).toBeGreaterThan(0);
      expect(achievement.name.length).toBeGreaterThan(0);
      expect(achievement.description.length).toBeGreaterThan(0);
    }
  });

  it('achievement ids are unique', () => {
    const ids = ACHIEVEMENTS.map((achievement) => achievement.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  it('getAchievementList returns a copy, not original array reference', () => {
    const list = getAchievementList();

    expect(list).toEqual(ACHIEVEMENTS);
    expect(list).not.toBe(ACHIEVEMENTS);
  });

  it('getAchievementList mutations do not change source data', () => {
    const list = getAchievementList();
    list.pop();

    expect(list.length).toBe(ACHIEVEMENTS.length - 1);
    expect(ACHIEVEMENTS.length).toBeGreaterThan(list.length);
  });
});

describe('checkAchievements', () => {
  it('returns no chapter achievements before 5 chapters', () => {
    const result = checkAchievements({
      completedChapters: ['ch1', 'ch2', 'ch3', 'ch4'],
      achievements: [],
    });

    expect(result).toEqual([]);
  });

  it('unlocks chapters_cleared_5 at 5 completed chapters', () => {
    const result = checkAchievements({
      completedChapters: ['ch1', 'ch2', 'ch3', 'ch4', 'ch5'],
      achievements: [],
    });

    expect(result).toEqual(['chapters_cleared_5']);
  });

  it('unlocks 5 and 10 milestones when reaching 10 with none owned', () => {
    const result = checkAchievements({
      completedChapters: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10'],
      achievements: [],
    });

    expect(result).toEqual(['chapters_cleared_5', 'chapters_cleared_10']);
  });

  it('unlocks 5, 10 and 25 milestones when reaching 25 with none owned', () => {
    const completed = Array.from({ length: 25 }, (_, i) => `ch_${i + 1}`);

    const result = checkAchievements({
      completedChapters: completed,
      achievements: [],
    });

    expect(result).toEqual([
      'chapters_cleared_5',
      'chapters_cleared_10',
      'chapters_cleared_25',
    ]);
  });

  it('does not return milestones already earned', () => {
    const completed = Array.from({ length: 30 }, (_, i) => `ch_${i + 1}`);

    const result = checkAchievements({
      completedChapters: completed,
      achievements: ['chapters_cleared_5', 'chapters_cleared_10'],
    });

    expect(result).toEqual(['chapters_cleared_25']);
  });

  it('returns empty when all chapter milestones already earned', () => {
    const completed = Array.from({ length: 30 }, (_, i) => `ch_${i + 1}`);

    const result = checkAchievements({
      completedChapters: completed,
      achievements: ['chapters_cleared_5', 'chapters_cleared_10', 'chapters_cleared_25'],
    });

    expect(result).toEqual([]);
  });

  it('ignores non-chapter achievements in owned list', () => {
    const result = checkAchievements({
      completedChapters: ['ch1', 'ch2', 'ch3', 'ch4', 'ch5'],
      achievements: ['first_blood', 'arena_champion'],
    });

    expect(result).toEqual(['chapters_cleared_5']);
  });
});
