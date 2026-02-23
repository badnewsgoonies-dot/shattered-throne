import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { getArenaOpponent, resolveArenaFight } from '../arenaSystem';
import {
  Unit,
  UnitClassName,
  ClassDefinition,
  MovementType,
  WeaponType,
  ArmorSlot,
  IDataProvider,
  ItemCategory,
} from '../../shared/types';

function makeUnit(overrides: Partial<Unit> = {}): Unit {
  return {
    id: 'player-1',
    name: 'Hero',
    characterId: 'char-1',
    className: UnitClassName.Warrior,
    level: 10,
    exp: 0,
    currentStats: { hp: 30, strength: 15, magic: 3, skill: 10, speed: 8, luck: 6, defense: 10, resistance: 4, movement: 5 },
    maxHP: 30,
    currentHP: 30,
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

const archerClass: ClassDefinition = {
  name: UnitClassName.Archer,
  displayName: 'Archer',
  baseStats: { hp: 18, strength: 6, magic: 0, skill: 8, speed: 7, luck: 4, defense: 3, resistance: 2, movement: 5 },
  growthRates: { hp: 70, strength: 45, magic: 5, skill: 50, speed: 50, luck: 35, defense: 20, resistance: 15 },
  statCaps: { hp: 60, strength: 28, magic: 20, skill: 35, speed: 35, luck: 30, defense: 25, resistance: 25, movement: 7 },
  movementType: MovementType.Foot,
  weaponTypes: [WeaponType.Bow],
  skills: [],
  promotionOptions: [UnitClassName.Sniper],
  promotionBonuses: { hp: 2, skill: 2, speed: 1 },
  isPromoted: false,
};

const ironBow = {
  id: 'iron-bow',
  name: 'Iron Bow',
  description: 'A basic bow.',
  category: ItemCategory.Weapon as const,
  weaponType: WeaponType.Bow,
  might: 6,
  hit: 85,
  crit: 0,
  range: { min: 2, max: 2 },
  weight: 5,
  maxDurability: 45,
  cost: 500,
  rank: 'E',
};

function createMockDataProvider(): IDataProvider {
  return {
    getClassDefinition: vi.fn().mockReturnValue(archerClass),
    getAllClasses: vi.fn().mockReturnValue([archerClass]),
    getWeapon: vi.fn().mockReturnValue(null),
    getAllWeapons: vi.fn().mockReturnValue([ironBow]),
    getArmor: vi.fn().mockReturnValue(null),
    getAllArmor: vi.fn().mockReturnValue([]),
    getConsumable: vi.fn().mockReturnValue(null),
    getAllConsumables: vi.fn().mockReturnValue([]),
    getPromotionItem: vi.fn().mockReturnValue(null),
    getAllPromotionItems: vi.fn().mockReturnValue([]),
    getItem: vi.fn().mockReturnValue(null),
    getSkill: vi.fn().mockReturnValue(null),
    getAllSkills: vi.fn().mockReturnValue([]),
    getChapter: vi.fn().mockReturnValue(null),
    getAllChapters: vi.fn().mockReturnValue([]),
    getCharacter: vi.fn().mockReturnValue(null),
    getAllCharacters: vi.fn().mockReturnValue([]),
    getMapData: vi.fn().mockReturnValue(null),
    getAllMaps: vi.fn().mockReturnValue([]),
    getSupportConversations: vi.fn().mockReturnValue([]),
    getAllSupportConversations: vi.fn().mockReturnValue([]),
    getEnemyTemplate: vi.fn().mockReturnValue(null),
    getAllEnemyTemplates: vi.fn().mockReturnValue([]),
    validateAllData: vi.fn().mockReturnValue({ valid: true, errors: [] }),
  };
}

describe('Arena System', () => {
  let mockDataProvider: IDataProvider;

  beforeEach(() => {
    mockDataProvider = createMockDataProvider();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getArenaOpponent', () => {
    it('should generate an opponent unit', () => {
      const player = makeUnit();
      const opponent = getArenaOpponent(player, mockDataProvider);
      expect(opponent).toBeDefined();
      expect(opponent.team).toBe('enemy');
    });

    it('should generate opponent with similar level', () => {
      const player = makeUnit({ level: 10 });
      const opponent = getArenaOpponent(player, mockDataProvider);
      expect(opponent.level).toBeGreaterThanOrEqual(1);
      expect(opponent.level).toBeLessThanOrEqual(30);
    });

    it('should set opponent as alive', () => {
      const player = makeUnit();
      const opponent = getArenaOpponent(player, mockDataProvider);
      expect(opponent.isAlive).toBe(true);
    });

    it('should set opponent HP correctly', () => {
      const player = makeUnit();
      const opponent = getArenaOpponent(player, mockDataProvider);
      expect(opponent.currentHP).toBe(opponent.maxHP);
    });

    it('should equip a weapon if available', () => {
      const player = makeUnit();
      const opponent = getArenaOpponent(player, mockDataProvider);
      expect(opponent.inventory.equippedWeaponIndex).toBe(0);
    });

    it('should have valid inventory structure', () => {
      const player = makeUnit();
      const opponent = getArenaOpponent(player, mockDataProvider);
      expect(opponent.inventory.items.length).toBe(5);
    });

    it('should have an id starting with arena-opponent', () => {
      const player = makeUnit();
      const opponent = getArenaOpponent(player, mockDataProvider);
      expect(opponent.id).toMatch(/^arena-opponent-/);
    });
  });

  describe('resolveArenaFight', () => {
    it('should return win when player is much stronger', () => {
      const player = makeUnit({
        currentHP: 50,
        maxHP: 50,
        currentStats: { hp: 50, strength: 30, magic: 3, skill: 10, speed: 8, luck: 6, defense: 20, resistance: 4, movement: 5 },
      });
      const opponent = makeUnit({
        id: 'opp',
        level: 5,
        currentHP: 15,
        maxHP: 15,
        currentStats: { hp: 15, strength: 5, magic: 1, skill: 4, speed: 3, luck: 2, defense: 3, resistance: 1, movement: 5 },
      });
      const result = resolveArenaFight(player, opponent);
      expect(result.won).toBe(true);
      expect(result.goldChange).toBeGreaterThan(0);
      expect(result.expGained).toBeGreaterThan(0);
    });

    it('should return loss when opponent is much stronger', () => {
      const player = makeUnit({
        currentHP: 10,
        maxHP: 10,
        currentStats: { hp: 10, strength: 3, magic: 1, skill: 3, speed: 3, luck: 2, defense: 2, resistance: 1, movement: 5 },
      });
      const opponent = makeUnit({
        id: 'opp',
        level: 20,
        currentHP: 60,
        maxHP: 60,
        currentStats: { hp: 60, strength: 30, magic: 10, skill: 20, speed: 15, luck: 10, defense: 25, resistance: 10, movement: 5 },
      });
      const result = resolveArenaFight(player, opponent);
      expect(result.won).toBe(false);
      expect(result.goldChange).toBe(0);
      expect(result.expGained).toBe(0);
    });

    it('should give gold proportional to opponent level on win', () => {
      const player = makeUnit({
        currentHP: 50,
        maxHP: 50,
        currentStats: { hp: 50, strength: 25, magic: 3, skill: 10, speed: 8, luck: 6, defense: 15, resistance: 4, movement: 5 },
      });
      const opp1 = makeUnit({ id: 'opp1', level: 5, currentHP: 10, maxHP: 10, currentStats: { hp: 10, strength: 5, magic: 1, skill: 4, speed: 3, luck: 2, defense: 3, resistance: 1, movement: 5 } });
      const opp2 = makeUnit({ id: 'opp2', level: 10, currentHP: 10, maxHP: 10, currentStats: { hp: 10, strength: 5, magic: 1, skill: 4, speed: 3, luck: 2, defense: 3, resistance: 1, movement: 5 } });
      const r1 = resolveArenaFight(player, opp1);
      const r2 = resolveArenaFight(player, opp2);
      if (r1.won && r2.won) {
        expect(r2.goldChange).toBeGreaterThan(r1.goldChange);
      }
    });

    it('should not give negative gold on loss', () => {
      const player = makeUnit({
        currentHP: 5,
        maxHP: 5,
        currentStats: { hp: 5, strength: 2, magic: 1, skill: 2, speed: 2, luck: 1, defense: 1, resistance: 1, movement: 5 },
      });
      const opponent = makeUnit({
        id: 'opp',
        level: 15,
        currentHP: 40,
        maxHP: 40,
        currentStats: { hp: 40, strength: 20, magic: 5, skill: 15, speed: 10, luck: 8, defense: 15, resistance: 5, movement: 5 },
      });
      const result = resolveArenaFight(player, opponent);
      expect(result.goldChange).toBeGreaterThanOrEqual(0);
    });

    it('should return numerical exp on win', () => {
      const player = makeUnit({
        currentHP: 50,
        maxHP: 50,
        currentStats: { hp: 50, strength: 30, magic: 3, skill: 10, speed: 8, luck: 6, defense: 20, resistance: 4, movement: 5 },
      });
      const opponent = makeUnit({
        id: 'opp',
        level: 8,
        currentHP: 15,
        maxHP: 15,
        currentStats: { hp: 15, strength: 5, magic: 1, skill: 4, speed: 3, luck: 2, defense: 3, resistance: 1, movement: 5 },
      });
      const result = resolveArenaFight(player, opponent);
      if (result.won) {
        expect(typeof result.expGained).toBe('number');
        expect(result.expGained).toBeGreaterThan(0);
      }
    });

    it('should handle equal stats fight', () => {
      const player = makeUnit({
        currentHP: 20,
        maxHP: 20,
        currentStats: { hp: 20, strength: 10, magic: 3, skill: 8, speed: 6, luck: 4, defense: 8, resistance: 3, movement: 5 },
      });
      const opponent = makeUnit({
        id: 'opp',
        level: 10,
        currentHP: 20,
        maxHP: 20,
        currentStats: { hp: 20, strength: 10, magic: 3, skill: 8, speed: 6, luck: 4, defense: 8, resistance: 3, movement: 5 },
      });
      const result = resolveArenaFight(player, opponent);
      expect(typeof result.won).toBe('boolean');
    });
  });
});
