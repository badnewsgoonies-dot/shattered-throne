import {
  Unit,
  WeaponData,
  TerrainData,
  TerrainType,
  ItemCategory,
  WeaponType,
  UnitClassName,
  MovementType,
  SupportRank,
  ArmorSlot,
  Stats,
  GrowthRates,
  Inventory,
  GridType,
  GridMap,
  Tile,
  Position,
  Element,
  SkillDefinition,
  SkillType,
  AoEPattern,
} from '../../../shared/types';

export function makeStats(overrides: Partial<Stats> = {}): Stats {
  return {
    hp: 20,
    strength: 10,
    magic: 5,
    skill: 10,
    speed: 10,
    luck: 5,
    defense: 8,
    resistance: 4,
    movement: 5,
    ...overrides,
  };
}

export function makeGrowthRates(overrides: Partial<GrowthRates> = {}): GrowthRates {
  return {
    hp: 50,
    strength: 40,
    magic: 20,
    skill: 30,
    speed: 30,
    luck: 25,
    defense: 25,
    resistance: 15,
    ...overrides,
  };
}

export function makeInventory(): Inventory {
  return {
    items: [null, null, null, null, null],
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
  const stats = makeStats(overrides.currentStats);
  return {
    id: 'unit-1',
    name: 'Test Unit',
    characterId: 'char-1',
    className: UnitClassName.Warrior,
    level: 5,
    exp: 0,
    currentStats: stats,
    maxHP: stats.hp,
    currentHP: stats.hp,
    currentSP: 50,
    maxSP: 100,
    growthRates: makeGrowthRates(),
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
    currentStats: { ...stats, ...(overrides.currentStats ?? {}) },
  };
}

export function makeWeapon(overrides: Partial<WeaponData> = {}): WeaponData {
  return {
    id: 'iron-sword',
    name: 'Iron Sword',
    description: 'A basic sword',
    category: ItemCategory.Weapon,
    weaponType: WeaponType.Sword,
    might: 5,
    hit: 90,
    crit: 0,
    range: { min: 1, max: 1 },
    weight: 5,
    maxDurability: 40,
    cost: 500,
    rank: 'E',
    ...overrides,
  };
}

export function makeTerrain(overrides: Partial<TerrainData> = {}): TerrainData {
  return {
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
    ...overrides,
  };
}

export function makeTile(pos: Position, terrainOverrides: Partial<TerrainData> = {}): Tile {
  return {
    position: pos,
    terrain: makeTerrain(terrainOverrides),
    occupantId: null,
    itemId: null,
    isChest: false,
    isDoor: false,
    isDeploymentZone: false,
    fogRevealed: true,
  };
}

export function makeGridMap(width = 10, height = 10): GridMap {
  const tiles: Tile[][] = [];
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      row.push(makeTile({ x, y }));
    }
    tiles.push(row);
  }
  return {
    id: 'test-map',
    name: 'Test Map',
    width,
    height,
    gridType: GridType.Square,
    tiles,
    deploymentZones: [],
  };
}

export function makeSkill(overrides: Partial<SkillDefinition> = {}): SkillDefinition {
  return {
    id: 'skill-1',
    name: 'Test Skill',
    description: 'A test skill',
    type: SkillType.Active,
    spCost: 10,
    range: { min: 1, max: 1 },
    aoePattern: AoEPattern.Single,
    aoeSize: 1,
    ...overrides,
  };
}
