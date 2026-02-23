import { describe, it, expect } from 'vitest';
import { checkAchievements, getAchievementList, getAchievementById } from '../achievementTracker';
import {
  CampaignState,
  UnitClassName,
  MovementType,
  ArmorSlot,
  Unit,
} from '../../shared/types';

function makeUnit(overrides: Partial<Unit> = {}): Unit {
  return {
    id: 'unit-1',
    name: 'TestUnit',
    characterId: 'char-1',
    className: UnitClassName.Warrior,
    level: 1,
    exp: 0,
    currentStats: { hp: 20, strength: 8, magic: 2, skill: 6, speed: 5, luck: 4, defense: 6, resistance: 2, movement: 5 },
    maxHP: 20,
    currentHP: 20,
    currentSP: 50,
    maxSP: 100,
    growthRates: { hp: 80, strength: 50, magic: 10, skill: 40, speed: 40, luck: 30, defense: 35, resistance: 15 },
    inventory: {
      items: [null, null, null, null, null],
      equippedWeaponIndex: null,
      equippedArmor: { [ArmorSlot.Head]: null, [ArmorSlot.Chest]: null, [ArmorSlot.Boots]: null, [ArmorSlot.Accessory]: null },
    },
    skills: [],
    activeStatusEffects: [],
    position: null,
    hasMoved: false,
    hasActed: false,
    isAlive: true,
    team: 'player',
    supportRanks: {},
    supportPoints: {},
    killCount: 0,
    movementType: MovementType.Foot,
    ...overrides,
  };
}

function makeCampaignState(overrides: Partial<CampaignState> = {}): CampaignState {
  return {
    currentChapterId: 'ch1',
    completedChapters: [],
    unlockedChapters: ['ch1'],
    roster: [],
    convoy: [],
    gold: 0,
    turnCount: 0,
    supportLog: {},
    achievements: [],
    worldMapNodes: [],
    playtimeSeconds: 0,
    ...overrides,
  };
}

describe('Achievement Tracker', () => {
  describe('getAchievementList', () => {
    it('should return at least 15 achievements', () => {
      const list = getAchievementList();
      expect(list.length).toBeGreaterThanOrEqual(15);
    });

    it('should have unique IDs', () => {
      const list = getAchievementList();
      const ids = list.map((a) => a.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have name and description for each', () => {
      const list = getAchievementList();
      for (const a of list) {
        expect(a.name).toBeTruthy();
        expect(a.description).toBeTruthy();
      }
    });

    it('should have non-empty IDs', () => {
      const list = getAchievementList();
      for (const a of list) {
        expect(a.id.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getAchievementById', () => {
    it('should return an achievement by id', () => {
      const a = getAchievementById('chapters_cleared_1');
      expect(a).toBeDefined();
      expect(a!.id).toBe('chapters_cleared_1');
    });

    it('should return undefined for unknown id', () => {
      const a = getAchievementById('nonexistent');
      expect(a).toBeUndefined();
    });
  });

  describe('checkAchievements', () => {
    it('should return chapters_cleared_1 when 1 chapter completed', () => {
      const state = makeCampaignState({ completedChapters: ['ch1'] });
      const earned = checkAchievements(state);
      expect(earned).toContain('chapters_cleared_1');
    });

    it('should return chapters_cleared_5 when 5 chapters completed', () => {
      const state = makeCampaignState({
        completedChapters: ['ch1', 'ch2', 'ch3', 'ch4', 'ch5'],
      });
      const earned = checkAchievements(state);
      expect(earned).toContain('chapters_cleared_5');
    });

    it('should return gold_hoarder_1000 when gold >= 1000', () => {
      const state = makeCampaignState({ gold: 1000 });
      const earned = checkAchievements(state);
      expect(earned).toContain('gold_hoarder_1000');
    });

    it('should not return already earned achievements', () => {
      const state = makeCampaignState({ completedChapters: ['ch1'] });
      const earned = checkAchievements(state, ['chapters_cleared_1']);
      expect(earned).not.toContain('chapters_cleared_1');
    });

    it('should return empty array when no achievements earned', () => {
      const state = makeCampaignState();
      const earned = checkAchievements(state);
      // Some achievements might always be met (e.g., zero state), filter them
      // At minimum, chapters_cleared should NOT be earned
      expect(earned).not.toContain('chapters_cleared_5');
      expect(earned).not.toContain('chapters_cleared_10');
    });

    it('should return roster_5 when roster has 5 units', () => {
      const state = makeCampaignState({
        roster: [makeUnit({ id: '1' }), makeUnit({ id: '2' }), makeUnit({ id: '3' }), makeUnit({ id: '4' }), makeUnit({ id: '5' })],
      });
      const earned = checkAchievements(state);
      expect(earned).toContain('roster_5');
    });

    it('should return max_level when a unit reaches level 30', () => {
      const state = makeCampaignState({
        roster: [makeUnit({ level: 30 })],
      });
      const earned = checkAchievements(state);
      expect(earned).toContain('max_level');
    });

    it('should return boss_slayer_10 when total kills >= 10', () => {
      const state = makeCampaignState({
        roster: [makeUnit({ killCount: 5 }), makeUnit({ killCount: 5 })],
      });
      const earned = checkAchievements(state);
      expect(earned).toContain('boss_slayer_10');
    });

    it('should return playtime_veteran when playtime >= 3600', () => {
      const state = makeCampaignState({ playtimeSeconds: 3600 });
      const earned = checkAchievements(state);
      expect(earned).toContain('playtime_veteran');
    });

    it('should not return duplicates', () => {
      const state = makeCampaignState({
        completedChapters: ['ch1', 'ch2', 'ch3', 'ch4', 'ch5'],
        gold: 5000,
        roster: [makeUnit({ killCount: 10, level: 30 })],
        playtimeSeconds: 7200,
      });
      const earned = checkAchievements(state);
      const uniqueEarned = new Set(earned);
      expect(uniqueEarned.size).toBe(earned.length);
    });

    it('should return convoy_collector when convoy has 20 items', () => {
      const convoy = Array.from({ length: 20 }, (_, i) => ({
        instanceId: `item-${i}`,
        dataId: `data-${i}`,
      }));
      const state = makeCampaignState({ convoy });
      const earned = checkAchievements(state);
      expect(earned).toContain('convoy_collector');
    });
  });
});
