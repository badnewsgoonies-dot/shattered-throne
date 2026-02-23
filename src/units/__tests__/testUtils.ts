import {
  AIBehavior,
  ArmorData,
  ArmorSlot,
  CharacterDefinition,
  ClassDefinition,
  EnemyPlacement,
  GridMap,
  GridType,
  GrowthRates,
  IGridEngine,
  ItemCategory,
  ItemData,
  ItemInstance,
  MovementType,
  Position,
  Stats,
  SupportRank,
  TerrainData,
  TerrainType,
  Tile,
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

const DEFAULT_GROWTHS: GrowthRates = {
  hp: 50,
  strength: 45,
  magic: 20,
  skill: 40,
  speed: 35,
  luck: 30,
  defense: 25,
  resistance: 15,
};

function defaultTerrain(type: TerrainType = TerrainType.Plains, defenseBonus = 0, evasionBonus = 0): TerrainData {
  return {
    type,
    movementCost: {
      [MovementType.Foot]: 1,
      [MovementType.Mounted]: 1,
      [MovementType.Armored]: 1,
      [MovementType.Flying]: 1,
    },
    defenseBonus,
    evasionBonus,
    heightLevel: 0,
    passable: {
      [MovementType.Foot]: true,
      [MovementType.Mounted]: true,
      [MovementType.Armored]: true,
      [MovementType.Flying]: true,
    },
  };
}

export function pos(x: number, y: number): Position {
  return { x, y };
}

export function makeStats(overrides: Partial<Stats> = {}): Stats {
  return {
    ...DEFAULT_STATS,
    ...overrides,
  };
}

export function makeGrowthRates(overrides: Partial<GrowthRates> = {}): GrowthRates {
  return {
    ...DEFAULT_GROWTHS,
    ...overrides,
  };
}

export function makeClassDefinition(overrides: Partial<ClassDefinition> = {}): ClassDefinition {
  const base: ClassDefinition = {
    name: UnitClassName.Warrior,
    displayName: 'Warrior',
    baseStats: makeStats(),
    growthRates: makeGrowthRates(),
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
    weaponTypes: [WeaponType.Sword, WeaponType.Axe],
    skills: [
      { level: 1, skillId: 'focus' },
      { level: 5, skillId: 'power_strike' },
      { level: 10, skillId: 'last_stand' },
    ],
    promotionOptions: [UnitClassName.Berserker],
    promotionBonuses: { strength: 2, defense: 1 },
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

export function makeCharacterDefinition(overrides: Partial<CharacterDefinition> = {}): CharacterDefinition {
  const base: CharacterDefinition = {
    id: 'hero_001',
    name: 'Alden',
    backstory: 'A veteran of the border wars.',
    className: UnitClassName.Warrior,
    baseLevel: 1,
    baseStats: makeStats({ hp: 28, strength: 9 }),
    personalGrowthBonuses: { strength: 10, speed: 5 },
    personalSkills: ['vanguard'],
    startingEquipment: ['iron_sword'],
    recruitChapter: 'chapter_01',
    isLord: false,
    portraitColor: '#abc123',
    supportPartners: ['mage_001'],
  };

  return {
    ...base,
    ...overrides,
    baseStats: {
      ...base.baseStats,
      ...(overrides.baseStats ?? {}),
    },
    personalGrowthBonuses: {
      ...base.personalGrowthBonuses,
      ...(overrides.personalGrowthBonuses ?? {}),
    },
    personalSkills: overrides.personalSkills ? [...overrides.personalSkills] : [...base.personalSkills],
    startingEquipment: overrides.startingEquipment ? [...overrides.startingEquipment] : [...base.startingEquipment],
    supportPartners: overrides.supportPartners ? [...overrides.supportPartners] : [...base.supportPartners],
  };
}

export function makeWeaponData(overrides: Partial<WeaponData> = {}): WeaponData {
  return {
    id: 'iron_sword',
    name: 'Iron Sword',
    description: 'Basic sword',
    category: ItemCategory.Weapon,
    weaponType: WeaponType.Sword,
    might: 5,
    hit: 85,
    crit: 0,
    range: { min: 1, max: 1 },
    weight: 5,
    maxDurability: 40,
    cost: 500,
    rank: 'E',
    ...overrides,
  };
}

export function makeArmorData(overrides: Partial<ArmorData> = {}): ArmorData {
  return {
    id: 'leather_helm',
    name: 'Leather Helm',
    description: 'Simple head protection',
    category: ItemCategory.Armor,
    slot: ArmorSlot.Head,
    defense: 1,
    resistance: 0,
    weight: 1,
    speedPenalty: 0,
    cost: 300,
    ...overrides,
  };
}

export function makeItemInstance(dataId: string, overrides: Partial<ItemInstance> = {}): ItemInstance {
  return {
    instanceId: `instance_${dataId}`,
    dataId,
    ...overrides,
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
    growthRates: makeGrowthRates(),
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
    position: pos(0, 0),
    hasMoved: false,
    hasActed: false,
    isAlive: true,
    team: 'enemy',
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
    supportRanks: overrides.supportRanks
      ? { ...overrides.supportRanks }
      : { ...base.supportRanks },
    supportPoints: overrides.supportPoints
      ? { ...overrides.supportPoints }
      : { ...base.supportPoints },
    position: overrides.position === undefined
      ? base.position
      : overrides.position,
  };
}

export function makeEnemyPlacement(overrides: Partial<EnemyPlacement> = {}): EnemyPlacement {
  return {
    characterId: 'enemy_soldier',
    className: UnitClassName.Warrior,
    level: 3,
    position: pos(3, 3),
    equipment: ['iron_sword'],
    aiBehavior: AIBehavior.Aggressive,
    isBoss: false,
    ...overrides,
  };
}

export function makeMap(width = 8, height = 8): GridMap {
  const tiles: Tile[][] = [];

  for (let y = 0; y < height; y += 1) {
    const row: Tile[] = [];

    for (let x = 0; x < width; x += 1) {
      row.push({
        position: pos(x, y),
        terrain: defaultTerrain(),
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
    id: 'test_map',
    name: 'Test Map',
    width,
    height,
    gridType: GridType.Square,
    tiles,
    deploymentZones: [],
  };
}

export function setTerrain(map: GridMap, position: Position, type: TerrainType, defenseBonus: number, evasionBonus: number): void {
  const tile = map.tiles[position.y]?.[position.x];

  if (!tile) {
    return;
  }

  tile.terrain = defaultTerrain(type, defenseBonus, evasionBonus);
}

function withinMap(map: GridMap, position: Position): boolean {
  return position.x >= 0 && position.y >= 0 && position.x < map.width && position.y < map.height;
}

function uniqueByKey(positions: Position[]): Position[] {
  const seen = new Set<string>();
  const result: Position[] = [];

  for (const position of positions) {
    const key = `${position.x},${position.y}`;

    if (!seen.has(key)) {
      seen.add(key);
      result.push(position);
    }
  }

  return result;
}

export function makeMockGridEngine(overrides: Partial<IGridEngine> = {}): IGridEngine {
  const defaultEngine: IGridEngine = {
    createGrid(width: number, height: number): GridMap {
      return makeMap(width, height);
    },
    loadMap(mapDef: GridMap): GridMap {
      return JSON.parse(JSON.stringify(mapDef)) as GridMap;
    },
    getTile(map: GridMap, position: Position): Tile | null {
      return map.tiles[position.y]?.[position.x] ?? null;
    },
    setOccupant(map: GridMap, position: Position, unitId: string | null): GridMap {
      const clone = JSON.parse(JSON.stringify(map)) as GridMap;
      const tile = clone.tiles[position.y]?.[position.x];
      if (tile) {
        tile.occupantId = unitId;
      }
      return clone;
    },
    getMovementRange(map: GridMap, start: Position, movement: number, movementType: MovementType): Position[] {
      const positions: Position[] = [];

      for (let dx = -movement; dx <= movement; dx += 1) {
        for (let dy = -movement; dy <= movement; dy += 1) {
          const distance = Math.abs(dx) + Math.abs(dy);

          if (distance > movement) {
            continue;
          }

          const candidate = pos(start.x + dx, start.y + dy);

          if (!withinMap(map, candidate)) {
            continue;
          }

          const tile = map.tiles[candidate.y]?.[candidate.x];
          if (!tile || !tile.terrain.passable[movementType]) {
            continue;
          }

          positions.push(candidate);
        }
      }

      return uniqueByKey(positions);
    },
    getAttackRange(map: GridMap, positions: Position[], minRange: number, maxRange: number): Position[] {
      const attackable: Position[] = [];

      for (const origin of positions) {
        for (let x = 0; x < map.width; x += 1) {
          for (let y = 0; y < map.height; y += 1) {
            const distance = Math.abs(origin.x - x) + Math.abs(origin.y - y);
            if (distance >= minRange && distance <= maxRange) {
              attackable.push(pos(x, y));
            }
          }
        }
      }

      return uniqueByKey(attackable);
    },
    findPath(map: GridMap, start: Position, end: Position, movement: number): Position[] | null {
      const distance = Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
      if (distance > movement || !withinMap(map, end)) {
        return null;
      }

      const path: Position[] = [];
      let current = { ...start };

      while (current.x !== end.x) {
        current = { ...current, x: current.x + (end.x > current.x ? 1 : -1) };
        path.push({ ...current });
      }

      while (current.y !== end.y) {
        current = { ...current, y: current.y + (end.y > current.y ? 1 : -1) };
        path.push({ ...current });
      }

      return path;
    },
    getLineOfSight(): boolean {
      return true;
    },
    getAdjacentPositions(map: GridMap, position: Position): Position[] {
      const candidates = [
        pos(position.x, position.y - 1),
        pos(position.x + 1, position.y),
        pos(position.x, position.y + 1),
        pos(position.x - 1, position.y),
      ];

      return candidates.filter((candidate) => withinMap(map, candidate));
    },
    getDistance(a: Position, b: Position): number {
      return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    },
    applyFogOfWar(map: GridMap): GridMap {
      return map;
    },
    calculateDangerZone(): Position[] {
      return [];
    },
    serializeMap(map: GridMap): string {
      return JSON.stringify(map);
    },
    deserializeMap(data: string): GridMap {
      return JSON.parse(data) as GridMap;
    },
  };

  return {
    ...defaultEngine,
    ...overrides,
  };
}

export function makeSupportMapEntry(unitA: string, rank: SupportRank): Record<string, SupportRank> {
  return {
    [unitA]: rank,
  };
}

export function collectItemData(...items: ItemData[]): ItemData[] {
  return items;
}
