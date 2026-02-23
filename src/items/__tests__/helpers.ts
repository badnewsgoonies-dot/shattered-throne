import {
  Unit,
  ItemInstance,
  Inventory,
  ItemData,
  WeaponData,
  ArmorData,
  ConsumableData,
  PromotionItemData,
  ClassDefinition,
  IDataProvider,
  UnitClassName,
  WeaponType,
  ItemCategory,
  ArmorSlot,
  MovementType,
  SupportRank,
  ChapterDefinition,
  CharacterDefinition,
  GridMap,
  SupportConversation,
  EnemyPlacement,
  SkillDefinition,
  StatusEffectType,
} from '../../shared/types';

export function makeInventory(items: (ItemInstance | null)[] = []): Inventory {
  const slots: (ItemInstance | null)[] = Array(5).fill(null);
  items.forEach((item, i) => { if (i < 5) slots[i] = item; });
  return {
    items: slots,
    equippedWeaponIndex: null,
    equippedArmor: {
      [ArmorSlot.Head]: null,
      [ArmorSlot.Chest]: null,
      [ArmorSlot.Boots]: null,
      [ArmorSlot.Accessory]: null,
    },
  };
}

export function makeUnit(overrides: Partial<Unit> = {}): Unit {
  return {
    id: 'unit-1',
    name: 'Test Unit',
    characterId: 'char-1',
    className: UnitClassName.Warrior,
    level: 1,
    exp: 0,
    currentStats: { hp: 20, strength: 8, magic: 2, skill: 6, speed: 5, luck: 4, defense: 6, resistance: 2, movement: 5 },
    maxHP: 20,
    currentHP: 20,
    currentSP: 50,
    maxSP: 100,
    growthRates: { hp: 80, strength: 50, magic: 20, skill: 40, speed: 40, luck: 30, defense: 40, resistance: 20 },
    inventory: makeInventory(),
    skills: [],
    activeStatusEffects: [],
    position: { x: 0, y: 0 },
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

export function makeItemInstance(overrides: Partial<ItemInstance> = {}): ItemInstance {
  return {
    instanceId: `inst-${Math.random().toString(36).slice(2, 8)}`,
    dataId: 'iron-sword',
    currentDurability: 45,
    ...overrides,
  };
}

export const ironSword: WeaponData = {
  id: 'iron-sword',
  name: 'Iron Sword',
  description: 'A basic iron sword.',
  category: ItemCategory.Weapon,
  weaponType: WeaponType.Sword,
  might: 5,
  hit: 90,
  crit: 0,
  range: { min: 1, max: 1 },
  weight: 5,
  maxDurability: 45,
  cost: 460,
  rank: 'E',
};

export const ironLance: WeaponData = {
  id: 'iron-lance',
  name: 'Iron Lance',
  description: 'A basic iron lance.',
  category: ItemCategory.Weapon,
  weaponType: WeaponType.Lance,
  might: 7,
  hit: 80,
  crit: 0,
  range: { min: 1, max: 1 },
  weight: 8,
  maxDurability: 45,
  cost: 560,
  rank: 'E',
};

export const ironBow: WeaponData = {
  id: 'iron-bow',
  name: 'Iron Bow',
  description: 'A basic iron bow.',
  category: ItemCategory.Weapon,
  weaponType: WeaponType.Bow,
  might: 6,
  hit: 85,
  crit: 0,
  range: { min: 2, max: 2 },
  weight: 5,
  maxDurability: 45,
  cost: 540,
  rank: 'E',
};

export const steelSword: WeaponData = {
  id: 'steel-sword',
  name: 'Steel Sword',
  description: 'A sturdy steel sword.',
  category: ItemCategory.Weapon,
  weaponType: WeaponType.Sword,
  might: 8,
  hit: 75,
  crit: 0,
  range: { min: 1, max: 1 },
  weight: 10,
  maxDurability: 30,
  cost: 700,
  rank: 'D',
};

export const fireTome: WeaponData = {
  id: 'fire',
  name: 'Fire',
  description: 'A basic fire tome.',
  category: ItemCategory.Weapon,
  weaponType: WeaponType.FireTome,
  might: 5,
  hit: 90,
  crit: 0,
  range: { min: 1, max: 2 },
  weight: 4,
  maxDurability: 40,
  cost: 500,
  rank: 'E',
};

export const leatherArmor: ArmorData = {
  id: 'leather-armor',
  name: 'Leather Armor',
  description: 'Basic leather armor.',
  category: ItemCategory.Armor,
  slot: ArmorSlot.Chest,
  defense: 2,
  resistance: 0,
  weight: 3,
  speedPenalty: 0,
  cost: 300,
};

export const ironHelm: ArmorData = {
  id: 'iron-helm',
  name: 'Iron Helm',
  description: 'A basic iron helm.',
  category: ItemCategory.Armor,
  slot: ArmorSlot.Head,
  defense: 1,
  resistance: 0,
  weight: 2,
  speedPenalty: 0,
  cost: 200,
};

export const vulnerary: ConsumableData = {
  id: 'vulnerary',
  name: 'Vulnerary',
  description: 'Restores 10 HP.',
  category: ItemCategory.Consumable,
  effect: { type: 'heal', healAmount: 10 },
  uses: 3,
  cost: 300,
};

export const elixir: ConsumableData = {
  id: 'elixir',
  name: 'Elixir',
  description: 'Fully restores HP.',
  category: ItemCategory.Consumable,
  effect: { type: 'heal', fullHeal: true },
  uses: 3,
  cost: 3000,
};

export const antidote: ConsumableData = {
  id: 'antidote',
  name: 'Antidote',
  description: 'Cures poison.',
  category: ItemCategory.Consumable,
  effect: { type: 'cureStatus', cureStatus: StatusEffectType.Poison },
  uses: 1,
  cost: 100,
};

export const statBooster: ConsumableData = {
  id: 'energy-ring',
  name: 'Energy Ring',
  description: 'Permanently increases Strength by 2.',
  category: ItemCategory.Consumable,
  effect: { type: 'statBoost', statBoost: { strength: 2 }, permanent: true },
  uses: 1,
  cost: 8000,
};

export const doorKey: ConsumableData = {
  id: 'door-key',
  name: 'Door Key',
  description: 'Opens a door.',
  category: ItemCategory.Consumable,
  effect: { type: 'key' },
  uses: 1,
  cost: 50,
};

export const heroCrest: PromotionItemData = {
  id: 'hero-crest',
  name: 'Hero Crest',
  description: 'Promotes Warrior, Thief, or similar classes.',
  category: ItemCategory.PromotionItem,
  validClasses: [UnitClassName.Warrior, UnitClassName.Thief],
  cost: 10000,
};

export const guidingRing: PromotionItemData = {
  id: 'guiding-ring',
  name: 'Guiding Ring',
  description: 'Promotes Mage or Cleric.',
  category: ItemCategory.PromotionItem,
  validClasses: [UnitClassName.Mage, UnitClassName.Cleric],
  cost: 10000,
};

const itemDb: Record<string, ItemData> = {
  'iron-sword': ironSword,
  'iron-lance': ironLance,
  'iron-bow': ironBow,
  'steel-sword': steelSword,
  'fire': fireTome,
  'leather-armor': leatherArmor,
  'iron-helm': ironHelm,
  'vulnerary': vulnerary,
  'elixir': elixir,
  'antidote': antidote,
  'energy-ring': statBooster,
  'door-key': doorKey,
  'hero-crest': heroCrest,
  'guiding-ring': guidingRing,
};

export const warriorClass: ClassDefinition = {
  name: UnitClassName.Warrior,
  displayName: 'Warrior',
  baseStats: { hp: 20, strength: 8, magic: 0, skill: 6, speed: 5, luck: 4, defense: 6, resistance: 0, movement: 5 },
  growthRates: { hp: 80, strength: 50, magic: 5, skill: 40, speed: 40, luck: 30, defense: 40, resistance: 15 },
  statCaps: { hp: 60, strength: 25, magic: 15, skill: 25, speed: 25, luck: 30, defense: 25, resistance: 20, movement: 8 },
  movementType: MovementType.Foot,
  weaponTypes: [WeaponType.Sword, WeaponType.Axe],
  skills: [],
  promotionOptions: [UnitClassName.Berserker],
  promotionBonuses: { strength: 2, defense: 2 },
  isPromoted: false,
};

export const archerClass: ClassDefinition = {
  name: UnitClassName.Archer,
  displayName: 'Archer',
  baseStats: { hp: 18, strength: 6, magic: 0, skill: 8, speed: 6, luck: 5, defense: 4, resistance: 1, movement: 5 },
  growthRates: { hp: 70, strength: 40, magic: 5, skill: 55, speed: 50, luck: 40, defense: 25, resistance: 15 },
  statCaps: { hp: 60, strength: 22, magic: 15, skill: 28, speed: 28, luck: 30, defense: 20, resistance: 20, movement: 8 },
  movementType: MovementType.Foot,
  weaponTypes: [WeaponType.Bow],
  skills: [],
  promotionOptions: [UnitClassName.Sniper],
  promotionBonuses: { skill: 2, speed: 2 },
  isPromoted: false,
};

export const mageClass: ClassDefinition = {
  name: UnitClassName.Mage,
  displayName: 'Mage',
  baseStats: { hp: 16, strength: 1, magic: 8, skill: 5, speed: 5, luck: 5, defense: 2, resistance: 6, movement: 5 },
  growthRates: { hp: 50, strength: 5, magic: 55, skill: 40, speed: 35, luck: 30, defense: 15, resistance: 45 },
  statCaps: { hp: 50, strength: 15, magic: 28, skill: 25, speed: 25, luck: 30, defense: 15, resistance: 28, movement: 8 },
  movementType: MovementType.Foot,
  weaponTypes: [WeaponType.FireTome, WeaponType.WindTome, WeaponType.ThunderTome],
  skills: [],
  promotionOptions: [UnitClassName.Sage],
  promotionBonuses: { magic: 2, resistance: 2 },
  isPromoted: false,
};

const classDb: Record<string, ClassDefinition> = {
  [UnitClassName.Warrior]: warriorClass,
  [UnitClassName.Archer]: archerClass,
  [UnitClassName.Mage]: mageClass,
};

export function makeMockDataProvider(): IDataProvider {
  return {
    getClassDefinition(className: UnitClassName): ClassDefinition {
      return classDb[className] ?? warriorClass;
    },
    getAllClasses(): ClassDefinition[] { return Object.values(classDb); },
    getWeapon(id: string): WeaponData | null {
      const item = itemDb[id];
      return item && item.category === ItemCategory.Weapon ? item as WeaponData : null;
    },
    getAllWeapons(): WeaponData[] {
      return Object.values(itemDb).filter((i) => i.category === ItemCategory.Weapon) as WeaponData[];
    },
    getArmor(id: string): ArmorData | null {
      const item = itemDb[id];
      return item && item.category === ItemCategory.Armor ? item as ArmorData : null;
    },
    getAllArmor(): ArmorData[] {
      return Object.values(itemDb).filter((i) => i.category === ItemCategory.Armor) as ArmorData[];
    },
    getConsumable(id: string): ConsumableData | null {
      const item = itemDb[id];
      return item && item.category === ItemCategory.Consumable ? item as ConsumableData : null;
    },
    getAllConsumables(): ConsumableData[] {
      return Object.values(itemDb).filter((i) => i.category === ItemCategory.Consumable) as ConsumableData[];
    },
    getPromotionItem(id: string): PromotionItemData | null {
      const item = itemDb[id];
      return item && item.category === ItemCategory.PromotionItem ? item as PromotionItemData : null;
    },
    getAllPromotionItems(): PromotionItemData[] {
      return Object.values(itemDb).filter((i) => i.category === ItemCategory.PromotionItem) as PromotionItemData[];
    },
    getItem(id: string): ItemData | null { return itemDb[id] ?? null; },
    getSkill(_id: string): SkillDefinition | null { return null; },
    getAllSkills(): SkillDefinition[] { return []; },
    getChapter(_id: string): ChapterDefinition | null { return null; },
    getAllChapters(): ChapterDefinition[] { return []; },
    getCharacter(_id: string): CharacterDefinition | null { return null; },
    getAllCharacters(): CharacterDefinition[] { return []; },
    getMapData(_id: string): GridMap | null { return null; },
    getAllMaps(): GridMap[] { return []; },
    getSupportConversations(_a: string, _b: string): SupportConversation[] { return []; },
    getAllSupportConversations(): SupportConversation[] { return []; },
    getEnemyTemplate(_id: string): EnemyPlacement | null { return null; },
    getAllEnemyTemplates(): EnemyPlacement[] { return []; },
    validateAllData(): { valid: boolean; errors: string[] } { return { valid: true, errors: [] }; },
  };
}
