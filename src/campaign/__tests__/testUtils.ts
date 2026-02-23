import {
  AIBehavior,
  ArmorSlot,
  BattleSaveData,
  CampaignState,
  ChapterDefinition,
  ChapterRewards,
  CharacterDefinition,
  ClassDefinition,
  CombatState,
  CombatStateType,
  DefeatCondition,
  EnemyPlacement,
  GridMap,
  GridType,
  GrowthRates,
  IDataProvider,
  ItemCategory,
  ItemData,
  ItemInstance,
  MovementType,
  Position,
  Stats,
  SupportConversation,
  SupportRank,
  TerrainType,
  TurnPhase,
  Unit,
  UnitClassName,
  VictoryCondition,
  Weather,
  WeaponType,
} from '../../shared/types';
import { createDefaultWorldMapNodes } from '../worldMap';

const DEFAULT_STATS: Stats = {
  hp: 30,
  strength: 10,
  magic: 8,
  skill: 9,
  speed: 9,
  luck: 6,
  defense: 7,
  resistance: 5,
  movement: 5,
};

const DEFAULT_GROWTHS: GrowthRates = {
  hp: 50,
  strength: 45,
  magic: 25,
  skill: 40,
  speed: 35,
  luck: 30,
  defense: 25,
  resistance: 20,
};

export function makeUnit(overrides: Partial<Unit> = {}): Unit {
  const base: Unit = {
    id: 'unit_1',
    name: 'Unit 1',
    characterId: 'char_1',
    className: UnitClassName.Warrior,
    level: 1,
    exp: 0,
    currentStats: DEFAULT_STATS,
    maxHP: 30,
    currentHP: 30,
    currentSP: 20,
    maxSP: 20,
    growthRates: DEFAULT_GROWTHS,
    inventory: {
      items: [null, null, null, null, null],
      equippedWeaponIndex: null,
      equippedArmor: {
        [ArmorSlot.Head]: null,
        [ArmorSlot.Chest]: null,
        [ArmorSlot.Boots]: null,
        [ArmorSlot.Accessory]: null,
      },
    },
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
      items: overrides.inventory?.items ? [...overrides.inventory.items] : [...base.inventory.items],
      equippedArmor: {
        ...base.inventory.equippedArmor,
        ...(overrides.inventory?.equippedArmor ?? {}),
      },
    },
    skills: overrides.skills ? [...overrides.skills] : [...base.skills],
    activeStatusEffects: overrides.activeStatusEffects
      ? [...overrides.activeStatusEffects]
      : [...base.activeStatusEffects],
    supportRanks: overrides.supportRanks ? { ...overrides.supportRanks } : { ...base.supportRanks },
    supportPoints: overrides.supportPoints ? { ...overrides.supportPoints } : { ...base.supportPoints },
    position: overrides.position === undefined ? base.position : overrides.position,
  };
}

export function makeItemInstance(dataId: string, instanceId = `inst_${dataId}`): ItemInstance {
  return {
    instanceId,
    dataId,
  };
}

export function makeChapterRewards(overrides: Partial<ChapterRewards> = {}): ChapterRewards {
  return {
    goldReward: 200,
    expBonus: 50,
    itemRewards: [],
    unlockedChapters: [],
    ...overrides,
  };
}

export function makeChapterDefinition(overrides: Partial<ChapterDefinition> = {}): ChapterDefinition {
  const base: ChapterDefinition = {
    id: 'ch_1',
    number: 1,
    title: 'Chapter 1',
    description: 'Opening battle',
    mapId: 'map_1',
    deploymentSlots: [{ x: 0, y: 0 }],
    maxDeployments: 8,
    enemies: [
      {
        characterId: 'enemy_1',
        className: UnitClassName.Warrior,
        level: 1,
        position: { x: 4, y: 4 },
        equipment: ['iron_sword'],
        aiBehavior: AIBehavior.Aggressive,
        isBoss: false,
      },
    ],
    allies: [],
    victoryConditions: [{ type: VictoryCondition.Rout }],
    defeatConditions: [{ type: DefeatCondition.LordDies }],
    reinforcements: [],
    treasures: [],
    narrative: [],
    weather: Weather.Clear,
    rewards: makeChapterRewards(),
    nextChapterId: 'ch_2',
  };

  return {
    ...base,
    ...overrides,
    deploymentSlots: overrides.deploymentSlots
      ? [...overrides.deploymentSlots]
      : [...base.deploymentSlots],
    enemies: overrides.enemies ? [...overrides.enemies] : [...base.enemies],
    allies: overrides.allies ? [...overrides.allies] : [...base.allies],
    victoryConditions: overrides.victoryConditions
      ? [...overrides.victoryConditions]
      : [...base.victoryConditions],
    defeatConditions: overrides.defeatConditions
      ? [...overrides.defeatConditions]
      : [...base.defeatConditions],
    reinforcements: overrides.reinforcements
      ? [...overrides.reinforcements]
      : [...base.reinforcements],
    treasures: overrides.treasures ? [...overrides.treasures] : [...base.treasures],
    narrative: overrides.narrative ? [...overrides.narrative] : [...base.narrative],
    rewards: {
      ...base.rewards,
      ...(overrides.rewards ?? {}),
      itemRewards: overrides.rewards?.itemRewards
        ? [...overrides.rewards.itemRewards]
        : [...base.rewards.itemRewards],
      unlockedChapters: overrides.rewards?.unlockedChapters
        ? [...overrides.rewards.unlockedChapters]
        : [...base.rewards.unlockedChapters],
    },
    branchOptions: overrides.branchOptions
      ? [...overrides.branchOptions]
      : base.branchOptions,
  };
}

export function makeCampaignState(overrides: Partial<CampaignState> = {}): CampaignState {
  const base: CampaignState = {
    currentChapterId: 'ch_1',
    completedChapters: [],
    unlockedChapters: ['ch_1'],
    roster: [],
    convoy: [],
    gold: 1000,
    turnCount: 0,
    supportLog: {},
    achievements: [],
    worldMapNodes: createDefaultWorldMapNodes(),
    playtimeSeconds: 0,
  };

  return {
    ...base,
    ...overrides,
    completedChapters: overrides.completedChapters
      ? [...overrides.completedChapters]
      : [...base.completedChapters],
    unlockedChapters: overrides.unlockedChapters
      ? [...overrides.unlockedChapters]
      : [...base.unlockedChapters],
    roster: overrides.roster ? [...overrides.roster] : [...base.roster],
    convoy: overrides.convoy ? [...overrides.convoy] : [...base.convoy],
    supportLog: overrides.supportLog ? { ...overrides.supportLog } : { ...base.supportLog },
    achievements: overrides.achievements ? [...overrides.achievements] : [...base.achievements],
    worldMapNodes: overrides.worldMapNodes
      ? overrides.worldMapNodes.map((node) => ({ ...node, connections: [...node.connections] }))
      : base.worldMapNodes.map((node) => ({ ...node, connections: [...node.connections] })),
  };
}

function makeClassDefinition(overrides: Partial<ClassDefinition> = {}): ClassDefinition {
  const base: ClassDefinition = {
    name: UnitClassName.Warrior,
    displayName: 'Warrior',
    baseStats: DEFAULT_STATS,
    growthRates: DEFAULT_GROWTHS,
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

function makeGridMap(): GridMap {
  return {
    id: 'map_1',
    name: 'Test Map',
    width: 1,
    height: 1,
    gridType: GridType.Square,
    tiles: [
      [
        {
          position: { x: 0, y: 0 },
          terrain: {
            type: TerrainType.Plains,
            movementCost: {
              [MovementType.Foot]: 1,
              [MovementType.Mounted]: 1,
              [MovementType.Armored]: 1,
              [MovementType.Flying]: 1,
            },
            defenseBonus: 0,
            evasionBonus: 0,
            heightLevel: 0,
            passable: {
              [MovementType.Foot]: true,
              [MovementType.Mounted]: true,
              [MovementType.Armored]: true,
              [MovementType.Flying]: true,
            },
          },
          occupantId: null,
          itemId: null,
          isChest: false,
          isDoor: false,
          isDeploymentZone: true,
          fogRevealed: true,
        },
      ],
    ],
    deploymentZones: [{ x: 0, y: 0 }],
  };
}

export function makeCombatState(overrides: Partial<CombatState> = {}): CombatState {
  return {
    phase: TurnPhase.Player,
    stateType: CombatStateType.UnitSelect,
    turnNumber: 1,
    selectedUnitId: null,
    movementRange: [],
    attackRange: [],
    dangerZone: [],
    cursorPosition: { x: 0, y: 0 },
    combatLog: [],
    undoStack: [],
    ...overrides,
  };
}

export function makeBattleSaveData(overrides: Partial<BattleSaveData> = {}): BattleSaveData {
  return {
    chapterId: 'ch_1',
    grid: makeGridMap(),
    units: [makeUnit()],
    combatState: makeCombatState(),
    turnNumber: 1,
    ...overrides,
  };
}

export function makeSupportConversation(overrides: Partial<SupportConversation> = {}): SupportConversation {
  const fallbackDialogue = [{ speaker: 'A', text: 'Hello.' }];

  return {
    characterA: 'char_1',
    characterB: 'char_2',
    rank: SupportRank.C,
    requiredBattlesTogether: 2,
    ...overrides,
    dialogue: overrides.dialogue ? [...overrides.dialogue] : fallbackDialogue,
  };
}

export function createMockDataProvider(config: {
  chapters?: ChapterDefinition[];
  supportConversations?: SupportConversation[];
} = {}): IDataProvider {
  const chapters = config.chapters ?? [];
  const supportConversations = config.supportConversations ?? [];

  const chapterMap = new Map(chapters.map((chapter) => [chapter.id, chapter]));

  const classDefinition = makeClassDefinition();

  return {
    getClassDefinition(): ClassDefinition {
      return classDefinition;
    },
    getAllClasses(): ClassDefinition[] {
      return [classDefinition];
    },
    getWeapon(): null {
      return null;
    },
    getAllWeapons() {
      return [];
    },
    getArmor(): null {
      return null;
    },
    getAllArmor() {
      return [];
    },
    getConsumable(): null {
      return null;
    },
    getAllConsumables() {
      return [];
    },
    getPromotionItem(): null {
      return null;
    },
    getAllPromotionItems() {
      return [];
    },
    getItem(_id: string): ItemData | null {
      return null;
    },
    getSkill(): null {
      return null;
    },
    getAllSkills() {
      return [];
    },
    getChapter(id: string): ChapterDefinition | null {
      return chapterMap.get(id) ?? null;
    },
    getAllChapters(): ChapterDefinition[] {
      return [...chapterMap.values()];
    },
    getCharacter(): CharacterDefinition | null {
      return null;
    },
    getAllCharacters(): CharacterDefinition[] {
      return [];
    },
    getMapData(): GridMap | null {
      return null;
    },
    getAllMaps(): GridMap[] {
      return [];
    },
    getSupportConversations(charA: string, charB: string): SupportConversation[] {
      return supportConversations.filter((conversation) => (
        (conversation.characterA === charA && conversation.characterB === charB)
        || (conversation.characterA === charB && conversation.characterB === charA)
      ));
    },
    getAllSupportConversations(): SupportConversation[] {
      return [...supportConversations];
    },
    getEnemyTemplate(): EnemyPlacement | null {
      return null;
    },
    getAllEnemyTemplates(): EnemyPlacement[] {
      return [];
    },
    validateAllData(): { valid: boolean; errors: string[] } {
      return { valid: true, errors: [] };
    },
  };
}

export function createLocalStorageMock(initialValues: Record<string, string> = {}): Storage {
  const store = new Map(Object.entries(initialValues));

  return {
    get length() {
      return store.size;
    },
    clear(): void {
      store.clear();
    },
    getItem(key: string): string | null {
      return store.has(key) ? store.get(key) ?? null : null;
    },
    key(index: number): string | null {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key: string): void {
      store.delete(key);
    },
    setItem(key: string, value: string): void {
      store.set(key, String(value));
    },
  };
}

export function toNodeId(chapterId: string): string {
  return `node_${chapterId}`;
}

export function pos(x: number, y: number): Position {
  return { x, y };
}
