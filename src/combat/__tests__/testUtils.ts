import {
  AoEPattern,
  ArmorSlot,
  Element,
  GridMap,
  GridType,
  GrowthRates,
  ItemCategory,
  MovementType,
  SkillDefinition,
  SkillType,
  Stats,
  StatusEffectType,
  TerrainData,
  TerrainType,
  Tile,
  TurnPhase,
  Unit,
  UnitClassName,
  WeaponData,
  WeaponType,
} from '../../shared/types';

const BASE_STATS: Stats = {
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

const BASE_GROWTHS: GrowthRates = {
  hp: 50,
  strength: 50,
  magic: 50,
  skill: 50,
  speed: 50,
  luck: 50,
  defense: 50,
  resistance: 50,
};

export function makeStats(overrides: Partial<Stats> = {}): Stats {
  return {
    ...BASE_STATS,
    ...overrides,
  };
}

export function makeTerrain(overrides: Partial<TerrainData> = {}): TerrainData {
  const base: TerrainData = {
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
  };

  return {
    ...base,
    ...overrides,
    movementCost: {
      ...base.movementCost,
      ...(overrides.movementCost ?? {}),
    },
    passable: {
      ...base.passable,
      ...(overrides.passable ?? {}),
    },
  };
}

export function makeWeapon(overrides: Partial<WeaponData> = {}): WeaponData {
  return {
    id: 'iron_sword',
    name: 'Iron Sword',
    description: 'Simple blade.',
    category: ItemCategory.Weapon,
    weaponType: WeaponType.Sword,
    might: 5,
    hit: 80,
    crit: 0,
    range: { min: 1, max: 1 },
    weight: 5,
    maxDurability: 40,
    cost: 500,
    rank: 'E',
    ...overrides,
  };
}

export function makeUnit(overrides: Partial<Unit> = {}): Unit {
  const base: Unit = {
    id: 'unit_a',
    name: 'Unit A',
    characterId: 'char_a',
    className: UnitClassName.Warrior,
    level: 5,
    exp: 0,
    currentStats: { ...BASE_STATS },
    maxHP: 30,
    currentHP: 30,
    currentSP: 20,
    maxSP: 20,
    growthRates: { ...BASE_GROWTHS },
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

export function makeSkill(overrides: Partial<SkillDefinition> = {}): SkillDefinition {
  return {
    id: 'skill_1',
    name: 'Strike',
    description: 'A basic skill.',
    type: SkillType.Active,
    spCost: 5,
    range: { min: 1, max: 1 },
    aoePattern: AoEPattern.Single,
    aoeSize: 1,
    statusEffect: {
      type: StatusEffectType.Poison,
      chance: 0,
      duration: 1,
    },
    ...overrides,
  };
}

export function makeMagicWeapon(weaponType: WeaponType, element?: Element): WeaponData {
  return makeWeapon({
    weaponType,
    element,
    range: { min: 1, max: 2 },
    might: 7,
    hit: 85,
  });
}

export function makeMap(width = 4, height = 4): GridMap {
  const tiles: Tile[][] = [];

  for (let y = 0; y < height; y += 1) {
    const row: Tile[] = [];

    for (let x = 0; x < width; x += 1) {
      row.push({
        position: { x, y },
        terrain: makeTerrain(),
        occupantId: null,
        itemId: null,
        isChest: false,
        isDoor: false,
        isDeploymentZone: false,
        fogRevealed: true,
      });
    }

    tiles.push(row);
  }

  return {
    id: 'map_1',
    name: 'Test Map',
    width,
    height,
    gridType: GridType.Square,
    tiles,
    deploymentZones: [{ x: 0, y: 0 }],
  };
}

export const TEST_PHASE: TurnPhase = TurnPhase.Player;
