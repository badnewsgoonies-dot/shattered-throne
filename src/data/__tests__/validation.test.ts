import { describe, it, expect, beforeEach } from 'vitest';
import { createDataProvider } from '../dataProvider';
import { validateAllData } from '../validation';
import { IDataProvider, UnitClassName, ItemCategory, WeaponType, SkillType, AoEPattern } from '../../shared/types';

describe('Validation', () => {
  let provider: IDataProvider;

  beforeEach(() => {
    provider = createDataProvider();
  });

  it('should pass full validation with no errors', () => {
    const result = provider.validateAllData();
    if (!result.valid) {
      console.log('Validation errors:', result.errors);
    }
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should detect unknown skill references', () => {
    const mockProvider: IDataProvider = {
      ...provider,
      getAllClasses: () => [{
        name: UnitClassName.Warrior,
        displayName: 'Warrior',
        baseStats: { hp: 20, strength: 7, magic: 0, skill: 5, speed: 5, luck: 3, defense: 6, resistance: 1, movement: 5 },
        growthRates: { hp: 60, strength: 55, magic: 0, skill: 45, speed: 45, luck: 30, defense: 40, resistance: 15 },
        statCaps: { hp: 60, strength: 30, magic: 20, skill: 28, speed: 28, luck: 30, defense: 30, resistance: 20, movement: 8 },
        movementType: 'foot' as any,
        weaponTypes: [],
        skills: [{ level: 5, skillId: 'nonexistent-skill' }],
        promotionOptions: [],
        promotionBonuses: {},
        isPromoted: false,
      }],
    };
    const result = validateAllData(mockProvider);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('nonexistent-skill'))).toBe(true);
  });

  it('should detect unknown equipment references on characters', () => {
    const mockProvider: IDataProvider = {
      ...provider,
      getAllCharacters: () => [{
        id: 'test-char',
        name: 'Test',
        backstory: 'Test',
        className: UnitClassName.Warrior,
        baseLevel: 1,
        baseStats: { hp: 20, strength: 7, magic: 0, skill: 5, speed: 5, luck: 3, defense: 6, resistance: 1, movement: 5 },
        personalGrowthBonuses: {},
        personalSkills: [],
        startingEquipment: ['nonexistent-weapon'],
        recruitChapter: 'ch-1',
        isLord: false,
        portraitColor: '#000',
        supportPartners: [],
      }],
    };
    const result = validateAllData(mockProvider);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('nonexistent-weapon'))).toBe(true);
  });

  it('should detect unknown map references in chapters', () => {
    const mockProvider: IDataProvider = {
      ...provider,
      getAllChapters: () => [{
        id: 'test-ch', number: 99, title: 'Test', description: 'Test',
        mapId: 'nonexistent-map',
        deploymentSlots: [{ x: 0, y: 0 }], maxDeployments: 1,
        enemies: [], allies: [],
        victoryConditions: [{ type: 'rout' as any }],
        defeatConditions: [{ type: 'lordDies' as any }],
        reinforcements: [], treasures: [], narrative: [],
        weather: 'clear' as any,
        rewards: { goldReward: 0, expBonus: 0, itemRewards: [], unlockedChapters: [] },
        nextChapterId: null,
      }],
    };
    const result = validateAllData(mockProvider);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('nonexistent-map'))).toBe(true);
  });

  it('should detect unknown character references in support conversations', () => {
    const mockProvider: IDataProvider = {
      ...provider,
      getAllSupportConversations: () => [{
        characterA: 'nonexistent-a',
        characterB: 'nonexistent-b',
        rank: 'C' as any,
        dialogue: [{ speaker: 'A', text: 'Hi' }],
        requiredBattlesTogether: 5,
      }],
    };
    const result = validateAllData(mockProvider);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('nonexistent-a'))).toBe(true);
  });
});
