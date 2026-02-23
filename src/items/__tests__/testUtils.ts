import {
  ArmorData,
  ArmorSlot,
  ChapterDefinition,
  CharacterDefinition,
  ClassDefinition,
  ConsumableData,
  IDataProvider,
  Inventory,
  ItemCategory,
  ItemData,
  ItemInstance,
  MAX_INVENTORY_SLOTS,
  MovementType,
  PromotionItemData,
  SkillDefinition,
  Stats,
  StatusEffectType,
  SupportRank,
  Unit,
  UnitClassName,
  WeaponData,
  WeaponType,
} from '../../shared/types';

const DEFAULT_STATS: Stats = {
  hp: 30,
  strength: 10,
  magic: 5,
  skill: 8,
  speed: 9,
  luck: 6,
  defense: 7,
  resistance: 4,
  movement: 5,
};

let instanceCounter = 0;

export function makeStats(overrides: Partial<Stats> = {}): Stats {
  return {
    ...DEFAULT_STATS,
    ...overrides,
  };
}

export function makeClassDefinition(overrides: Partial<ClassDefinition> = {}): ClassDefinition {
  const base: ClassDefinition = {
    name: UnitClassName.Warrior,
    displayName: 'Warrior',
    baseStats: makeStats(),
    growthRates: {
      hp: 50,
      strength: 45,
      magic: 20,
      skill: 40,
      speed: 35,
      luck: 30,
      defense: 25,
      resistance: 15,
    },
    statCaps: {
      hp: 60,
      strength: 30,
      magic: 30,
      skill: 30,
      speed: 30,
      luck: 30,
      defense: 30,
      resistance: 30,
      movement: 10,
    },
    movementType: MovementType.Foot,
    weaponTypes: [WeaponType.Sword],
    skills: [],
    promotionOptions: [UnitClassName.Berserker],
    promotionBonuses: { strength: 2 },
    isPromoted: false,
  };

  return {
    ...base,
    ...overrides,
    baseStats: {
      ...base.baseStats,
      ...(overrides.baseStats ?? {}),
    },
    growthRates: {
      ...base.growthRates,
      ...(overrides.growthRates ?? {}),
    },
    statCaps: {
      ...base.statCaps,
      ...(overrides.statCaps ?? {}),
    },
    promotionBonuses: {
      ...base.promotionBonuses,
      ...(overrides.promotionBonuses ?? {}),
    },
    weaponTypes: overrides.weaponTypes ? [...overrides.weaponTypes] : [...base.weaponTypes],
    skills: overrides.skills ? [...overrides.skills] : [...base.skills],
    promotionOptions: overrides.promotionOptions ? [...overrides.promotionOptions] : [...base.promotionOptions],
  };
}

export function makeWeaponData(overrides: Partial<WeaponData> = {}): WeaponData {
  return {
    id: 'test_sword',
    name: 'Test Sword',
    description: 'A test sword',
    category: ItemCategory.Weapon,
    weaponType: WeaponType.Sword,
    might: 5,
    hit: 90,
    crit: 0,
    range: { min: 1, max: 1 },
    weight: 5,
    maxDurability: 45,
    cost: 500,
    rank: 'E',
    ...overrides,
  };
}

export function makeArmorData(overrides: Partial<ArmorData> = {}): ArmorData {
  return {
    id: 'test_helm',
    name: 'Test Helm',
    description: 'A test helm',
    category: ItemCategory.Armor,
    slot: ArmorSlot.Head,
    defense: 2,
    resistance: 1,
    weight: 3,
    speedPenalty: 1,
    cost: 300,
    ...overrides,
  };
}

export function makeConsumableData(overrides: Partial<ConsumableData> = {}): ConsumableData {
  return {
    id: 'test_potion',
    name: 'Test Potion',
    description: 'A test potion',
    category: ItemCategory.Consumable,
    effect: {
      type: 'heal',
      healAmount: 10,
    },
    uses: 3,
    cost: 250,
    ...overrides,
  };
}

export function makePromotionItemData(overrides: Partial<PromotionItemData> = {}): PromotionItemData {
  return {
    id: 'master_seal',
    name: 'Master Seal',
    description: 'Promotes eligible classes',
    category: ItemCategory.PromotionItem,
    validClasses: [UnitClassName.Warrior],
    cost: 2500,
    ...overrides,
  };
}

export function makeItemInstance(dataId: string, overrides: Partial<ItemInstance> = {}): ItemInstance {
  instanceCounter += 1;

  return {
    instanceId: `inst_${dataId}_${instanceCounter}`,
    dataId,
    ...overrides,
  };
}

export function makeInventory(items: (ItemInstance | null)[] = []): Inventory {
  return {
    items: Array.from({ length: MAX_INVENTORY_SLOTS }, (_, index) => items[index] ?? null),
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
  const base: Unit = {
    id: 'unit_1',
    name: 'Unit One',
    characterId: 'char_1',
    className: UnitClassName.Warrior,
    level: 5,
    exp: 0,
    currentStats: makeStats(),
    maxHP: 30,
    currentHP: 30,
    currentSP: 100,
    maxSP: 100,
    growthRates: {
      hp: 50,
      strength: 45,
      magic: 20,
      skill: 40,
      speed: 35,
      luck: 30,
      defense: 25,
      resistance: 15,
    },
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
  };

  return {
    ...base,
    ...overrides,
    currentStats: {
      ...base.currentStats,
      ...(overrides.currentStats ?? {}),
    },
    growthRates: {
      ...base.growthRates,
      ...(overrides.growthRates ?? {}),
    },
    inventory: {
      ...base.inventory,
      ...(overrides.inventory ?? {}),
      items: overrides.inventory?.items
        ? Array.from({ length: MAX_INVENTORY_SLOTS }, (_, index) => overrides.inventory?.items[index] ?? null)
        : [...base.inventory.items],
      equippedArmor: {
        ...base.inventory.equippedArmor,
        ...(overrides.inventory?.equippedArmor ?? {}),
      },
    },
    skills: overrides.skills ? [...overrides.skills] : [...base.skills],
    activeStatusEffects: overrides.activeStatusEffects
      ? [...overrides.activeStatusEffects]
      : [...base.activeStatusEffects],
    supportRanks: overrides.supportRanks
      ? { ...overrides.supportRanks }
      : { ...base.supportRanks },
    supportPoints: overrides.supportPoints
      ? { ...overrides.supportPoints }
      : { ...base.supportPoints },
    position: overrides.position === undefined ? base.position : overrides.position,
  };
}

export const mockWeapon: WeaponData = makeWeaponData();
export const mockLance: WeaponData = makeWeaponData({
  id: 'test_lance',
  name: 'Test Lance',
  weaponType: WeaponType.Lance,
});
export const mockStaff: WeaponData = makeWeaponData({
  id: 'test_staff',
  name: 'Test Staff',
  weaponType: WeaponType.Staff,
});
export const mockBow: WeaponData = makeWeaponData({
  id: 'test_bow',
  name: 'Test Bow',
  weaponType: WeaponType.Bow,
});

export const mockHeadArmor: ArmorData = makeArmorData();
export const mockChestArmor: ArmorData = makeArmorData({
  id: 'test_chest',
  name: 'Test Chest',
  slot: ArmorSlot.Chest,
});

export const mockHealConsumable: ConsumableData = makeConsumableData({
  id: 'heal_potion',
  effect: {
    type: 'heal',
    healAmount: 10,
  },
  uses: 3,
});

export const mockFullHealConsumable: ConsumableData = makeConsumableData({
  id: 'elixir',
  effect: {
    type: 'heal',
    fullHeal: true,
  },
  uses: 1,
});

export const mockCurePoisonConsumable: ConsumableData = makeConsumableData({
  id: 'antidote',
  effect: {
    type: 'cureStatus',
    cureStatus: StatusEffectType.Poison,
  },
  uses: 2,
});

export const mockPermanentStatBoostConsumable: ConsumableData = makeConsumableData({
  id: 'energy_drop',
  effect: {
    type: 'statBoost',
    statBoost: { strength: 2, speed: 1 },
    permanent: true,
  },
  uses: 1,
});

export const mockTemporaryStatBoostConsumable: ConsumableData = makeConsumableData({
  id: 'swift_tonic',
  effect: {
    type: 'statBoost',
    statBoost: { speed: 3 },
    permanent: false,
  },
  uses: 2,
});

export const mockKeyConsumable: ConsumableData = makeConsumableData({
  id: 'chest_key',
  effect: {
    type: 'key',
  },
  uses: 1,
});

export const mockPromotionItem: PromotionItemData = makePromotionItemData();

export const warriorClassDef: ClassDefinition = makeClassDefinition({
  name: UnitClassName.Warrior,
  weaponTypes: [WeaponType.Sword, WeaponType.Axe],
});

export const archerClassDef: ClassDefinition = makeClassDefinition({
  name: UnitClassName.Archer,
  weaponTypes: [WeaponType.Bow],
});

export const clericClassDef: ClassDefinition = makeClassDefinition({
  name: UnitClassName.Cleric,
  weaponTypes: [WeaponType.Staff],
});

export function createMockDataProvider(config: {
  items?: ItemData[];
  classes?: ClassDefinition[];
} = {}): IDataProvider {
  const items = config.items ?? [
    mockWeapon,
    mockLance,
    mockStaff,
    mockBow,
    mockHeadArmor,
    mockChestArmor,
    mockHealConsumable,
    mockFullHealConsumable,
    mockCurePoisonConsumable,
    mockPermanentStatBoostConsumable,
    mockTemporaryStatBoostConsumable,
    mockKeyConsumable,
    mockPromotionItem,
  ];

  const classes = config.classes ?? [warriorClassDef, archerClassDef, clericClassDef];

  const itemMap = new Map(items.map((item) => [item.id, item]));
  const classMap = new Map(classes.map((classDef) => [classDef.name, classDef]));

  function allItems(): ItemData[] {
    return [...itemMap.values()];
  }

  function isWeapon(item: ItemData): item is WeaponData {
    return item.category === ItemCategory.Weapon;
  }

  function isArmor(item: ItemData): item is ArmorData {
    return item.category === ItemCategory.Armor;
  }

  function isConsumable(item: ItemData): item is ConsumableData {
    return item.category === ItemCategory.Consumable;
  }

  function isPromotion(item: ItemData): item is PromotionItemData {
    return item.category === ItemCategory.PromotionItem;
  }

  return {
    getClassDefinition(className: UnitClassName): ClassDefinition {
      return classMap.get(className) ?? warriorClassDef;
    },
    getAllClasses(): ClassDefinition[] {
      return [...classMap.values()];
    },
    getWeapon(id: string): WeaponData | null {
      const item = itemMap.get(id);
      return item && isWeapon(item) ? item : null;
    },
    getAllWeapons(): WeaponData[] {
      return allItems().filter(isWeapon);
    },
    getArmor(id: string): ArmorData | null {
      const item = itemMap.get(id);
      return item && isArmor(item) ? item : null;
    },
    getAllArmor(): ArmorData[] {
      return allItems().filter(isArmor);
    },
    getConsumable(id: string): ConsumableData | null {
      const item = itemMap.get(id);
      return item && isConsumable(item) ? item : null;
    },
    getAllConsumables(): ConsumableData[] {
      return allItems().filter(isConsumable);
    },
    getPromotionItem(id: string): PromotionItemData | null {
      const item = itemMap.get(id);
      return item && isPromotion(item) ? item : null;
    },
    getAllPromotionItems(): PromotionItemData[] {
      return allItems().filter(isPromotion);
    },
    getItem(id: string): ItemData | null {
      return itemMap.get(id) ?? null;
    },
    getSkill(_id: string): SkillDefinition | null {
      return null;
    },
    getAllSkills(): SkillDefinition[] {
      return [];
    },
    getChapter(_id: string): ChapterDefinition | null {
      return null;
    },
    getAllChapters(): ChapterDefinition[] {
      return [];
    },
    getCharacter(_id: string): CharacterDefinition | null {
      return null;
    },
    getAllCharacters(): CharacterDefinition[] {
      return [];
    },
    getMapData(_id: string) {
      return null;
    },
    getAllMaps() {
      return [];
    },
    getSupportConversations(_charA: string, _charB: string) {
      return [];
    },
    getAllSupportConversations() {
      return [];
    },
    getEnemyTemplate(_id: string) {
      return null;
    },
    getAllEnemyTemplates() {
      return [];
    },
    validateAllData(): { valid: boolean; errors: string[] } {
      return { valid: true, errors: [] };
    },
  };
}

export function makeSupportRanks(): Record<string, SupportRank> {
  return {};
}
