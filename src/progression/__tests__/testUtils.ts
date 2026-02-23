import {
  ClassDefinition,
  GrowthRates,
  IDataProvider,
  MAX_SP,
  MovementType,
  Stats,
  Unit,
  UnitClassName,
  WeaponType,
} from '../../shared/types';

export const BASE_STATS: Stats = {
  hp: 20,
  strength: 8,
  magic: 3,
  skill: 7,
  speed: 6,
  luck: 5,
  defense: 5,
  resistance: 2,
  movement: 5,
};

export const BASE_GROWTHS: GrowthRates = {
  hp: 50,
  strength: 45,
  magic: 20,
  skill: 40,
  speed: 35,
  luck: 25,
  defense: 30,
  resistance: 15,
};

export function createTestUnit(overrides: Partial<Unit> = {}): Unit {
  const currentStats: Stats = {
    ...BASE_STATS,
    ...(overrides.currentStats ?? {}),
  };

  const growthRates: GrowthRates = {
    ...BASE_GROWTHS,
    ...(overrides.growthRates ?? {}),
  };

  const inventory = {
    items: [null, null, null, null, null],
    equippedWeaponIndex: null,
    equippedArmor: {
      head: null,
      chest: null,
      boots: null,
      accessory: null,
    },
    ...(overrides.inventory ?? {}),
  };

  const baseUnit: Unit = {
    id: 'unit_1',
    name: 'Test Unit',
    characterId: 'char_test',
    className: UnitClassName.Warrior,
    level: 1,
    exp: 0,
    currentStats,
    maxHP: currentStats.hp,
    currentHP: currentStats.hp,
    currentSP: MAX_SP,
    maxSP: MAX_SP,
    growthRates,
    inventory,
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
  };

  return {
    ...baseUnit,
    ...overrides,
    currentStats,
    growthRates,
    inventory,
  };
}

export function createClassDef(overrides: Partial<ClassDefinition> = {}): ClassDefinition {
  const baseStats: Stats = {
    ...BASE_STATS,
    ...(overrides.baseStats ?? {}),
  };

  const growthRates: GrowthRates = {
    ...BASE_GROWTHS,
    ...(overrides.growthRates ?? {}),
  };

  const baseClassDef: ClassDefinition = {
    name: UnitClassName.Warrior,
    displayName: 'Warrior',
    baseStats,
    growthRates,
    statCaps: {
      hp: 60,
      strength: 30,
      magic: 20,
      skill: 30,
      speed: 30,
      luck: 30,
      defense: 30,
      resistance: 25,
      movement: 8,
    },
    movementType: MovementType.Foot,
    weaponTypes: [WeaponType.Sword],
    skills: [],
    promotionOptions: [UnitClassName.Berserker],
    promotionBonuses: { strength: 2, defense: 1, hp: 3 },
    isPromoted: false,
  };

  return {
    ...baseClassDef,
    ...overrides,
    baseStats,
    growthRates,
  };
}

export function createMockDataProvider(): IDataProvider {
  return {} as IDataProvider;
}
