import { describe, expect, it } from 'vitest';
import { DefeatCondition, VictoryCondition, Weather } from '../../shared/types';
import { CHAPTERS } from '../chapters';
import { CLASS_DEFINITIONS } from '../classes';
import { MAP_LAYOUTS } from '../mapLayouts';
import { WEAPONS } from '../weapons';
import { ARMOR } from '../armor';
import { CONSUMABLES } from '../consumables';
import { PROMOTION_ITEMS } from '../promotionItems';

describe('chapters data', () => {
  const mapSet = new Set(MAP_LAYOUTS.map((map) => map.id));
  const chapterSet = new Set(CHAPTERS.map((chapter) => chapter.id));
  const classSet = new Set(Object.keys(CLASS_DEFINITIONS));
  const itemSet = new Set([
    ...WEAPONS.map((entry) => entry.id),
    ...ARMOR.map((entry) => entry.id),
    ...CONSUMABLES.map((entry) => entry.id),
    ...PROMOTION_ITEMS.map((entry) => entry.id),
  ]);

  it('has exactly 25 story chapters', () => {
    expect(CHAPTERS).toHaveLength(25);
  });

  it('chapter IDs are unique', () => {
    expect(new Set(CHAPTERS.map((chapter) => chapter.id)).size).toBe(CHAPTERS.length);
  });

  it('chapter IDs follow ch_1 through ch_25', () => {
    const expected = Array.from({ length: 25 }, (_, index) => `ch_${index + 1}`);
    expect(CHAPTERS.map((chapter) => chapter.id)).toEqual(expected);
  });

  it('chapter numbers are 1..25', () => {
    for (let i = 0; i < CHAPTERS.length; i += 1) {
      expect(CHAPTERS[i].number).toBe(i + 1);
    }
  });

  it('all map references are valid', () => {
    for (const chapter of CHAPTERS) {
      expect(mapSet.has(chapter.mapId)).toBe(true);
    }
  });

  it('all chapters have deployment slots and enemies', () => {
    for (const chapter of CHAPTERS) {
      expect(chapter.deploymentSlots.length).toBeGreaterThan(0);
      expect(chapter.maxDeployments).toBeGreaterThan(0);
      expect(chapter.enemies.length).toBeGreaterThan(0);
    }
  });

  it('deployment slots are within map bounds', () => {
    for (const chapter of CHAPTERS) {
      const map = MAP_LAYOUTS.find((entry) => entry.id === chapter.mapId);
      expect(map).toBeDefined();
      if (!map) continue;
      for (const slot of chapter.deploymentSlots) {
        expect(slot.x).toBeGreaterThanOrEqual(0);
        expect(slot.y).toBeGreaterThanOrEqual(0);
        expect(slot.x).toBeLessThan(map.width);
        expect(slot.y).toBeLessThan(map.height);
      }
    }
  });

  it('victory and defeat conditions are present for every chapter', () => {
    for (const chapter of CHAPTERS) {
      expect(chapter.victoryConditions.length).toBeGreaterThan(0);
      expect(chapter.defeatConditions.length).toBeGreaterThan(0);
    }
  });

  it('all chapters include preBattle and postBattle narrative events', () => {
    for (const chapter of CHAPTERS) {
      const pre = chapter.narrative.find((event) => event.trigger === 'preBattle');
      const post = chapter.narrative.find((event) => event.trigger === 'postBattle');
      expect(pre).toBeDefined();
      expect(post).toBeDefined();
      expect(pre?.dialogue.length).toBeGreaterThan(0);
      expect(post?.dialogue.length).toBeGreaterThan(0);
    }
  });

  it('first 10 chapters have richer detail fields populated', () => {
    for (const chapter of CHAPTERS.slice(0, 10)) {
      expect(chapter.reinforcements.length).toBeGreaterThan(0);
      expect(chapter.treasures.length).toBeGreaterThan(0);
      expect(chapter.allies.length).toBeGreaterThanOrEqual(0);
    }
  });

  it('all enemy and ally classes are valid', () => {
    for (const chapter of CHAPTERS) {
      for (const enemy of [...chapter.enemies, ...chapter.allies]) {
        expect(classSet.has(enemy.className)).toBe(true);
      }
    }
  });

  it('all enemy, ally, reinforcement equipment items are valid', () => {
    for (const chapter of CHAPTERS) {
      const pools = [
        ...chapter.enemies,
        ...chapter.allies,
        ...chapter.reinforcements.flatMap((entry) => entry.enemies),
      ];

      for (const unit of pools) {
        expect(unit.equipment.length).toBeGreaterThan(0);
        for (const itemId of unit.equipment) {
          expect(itemSet.has(itemId)).toBe(true);
        }
      }
    }
  });

  it('all treasure and chapter reward item IDs are valid', () => {
    for (const chapter of CHAPTERS) {
      for (const treasure of chapter.treasures) {
        expect(itemSet.has(treasure.itemId)).toBe(true);
      }
      for (const reward of chapter.rewards.itemRewards) {
        expect(itemSet.has(reward)).toBe(true);
      }
    }
  });

  it('all weather values are valid enum entries', () => {
    const weatherSet = new Set(Object.values(Weather));
    for (const chapter of CHAPTERS) {
      expect(weatherSet.has(chapter.weather)).toBe(true);
    }
  });

  it('all nextChapterId values point to existing chapters or null', () => {
    for (const chapter of CHAPTERS) {
      if (chapter.nextChapterId === null) {
        continue;
      }
      expect(chapterSet.has(chapter.nextChapterId)).toBe(true);
    }
  });

  it('chapter unlock rewards only reference valid story chapters', () => {
    for (const chapter of CHAPTERS) {
      for (const unlocked of chapter.rewards.unlockedChapters) {
        expect(chapterSet.has(unlocked)).toBe(true);
      }
    }
  });

  it('at least one chapter uses each key victory type', () => {
    const types = new Set(CHAPTERS.flatMap((chapter) => chapter.victoryConditions.map((condition) => condition.type)));
    expect(types.has(VictoryCondition.Rout)).toBe(true);
    expect(types.has(VictoryCondition.BossKill)).toBe(true);
    expect(types.has(VictoryCondition.Survive)).toBe(true);
    expect(types.has(VictoryCondition.ReachLocation)).toBe(true);
    expect(types.has(VictoryCondition.ProtectTarget)).toBe(true);
  });

  it('defeat conditions include LordDies throughout campaign', () => {
    for (const chapter of CHAPTERS) {
      const types = chapter.defeatConditions.map((condition) => condition.type);
      expect(types).toContain(DefeatCondition.LordDies);
    }
  });
});
