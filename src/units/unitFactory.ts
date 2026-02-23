import {
  AIBehavior,
  ArmorSlot,
  CharacterDefinition,
  ClassDefinition,
  EnemyPlacement,
  GrowthRates,
  Inventory,
  ItemCategory,
  ItemData,
  ItemInstance,
  MAX_INVENTORY_SLOTS,
  MAX_SP,
  Unit,
} from '../shared/types';

const GROWTH_RATE_KEYS: (keyof GrowthRates)[] = [
  'hp',
  'strength',
  'magic',
  'skill',
  'speed',
  'luck',
  'defense',
  'resistance',
];

function createEmptyInventory(): Inventory {
  return {
    items: Array.from({ length: MAX_INVENTORY_SLOTS }, () => null),
    equippedWeaponIndex: null,
    equippedArmor: {
      [ArmorSlot.Head]: null,
      [ArmorSlot.Chest]: null,
      [ArmorSlot.Boots]: null,
      [ArmorSlot.Accessory]: null,
    },
  };
}

function combineGrowthRates(classGrowthRates: GrowthRates, personalBonuses: Partial<GrowthRates>): GrowthRates {
  return {
    hp: classGrowthRates.hp + (personalBonuses.hp ?? 0),
    strength: classGrowthRates.strength + (personalBonuses.strength ?? 0),
    magic: classGrowthRates.magic + (personalBonuses.magic ?? 0),
    skill: classGrowthRates.skill + (personalBonuses.skill ?? 0),
    speed: classGrowthRates.speed + (personalBonuses.speed ?? 0),
    luck: classGrowthRates.luck + (personalBonuses.luck ?? 0),
    defense: classGrowthRates.defense + (personalBonuses.defense ?? 0),
    resistance: classGrowthRates.resistance + (personalBonuses.resistance ?? 0),
  };
}

function createItemInstance(itemData: ItemData, prefix: string, index: number): ItemInstance {
  const now = Date.now();
  const base: ItemInstance = {
    instanceId: `${prefix}_${itemData.id}_${index}_${now}`,
    dataId: itemData.id,
  };

  if (itemData.category === ItemCategory.Weapon) {
    return {
      ...base,
      currentDurability: itemData.maxDurability,
      forgeBonuses: itemData.forgeBonuses,
    };
  }

  return base;
}

function applyAverageLevelGains(level: number, baseStats: Unit['currentStats'], growthRates: GrowthRates): Unit['currentStats'] {
  const result = { ...baseStats };

  if (level <= 1) {
    return result;
  }

  for (let currentLevel = 1; currentLevel < level; currentLevel += 1) {
    for (const key of GROWTH_RATE_KEYS) {
      result[key] += Math.round(growthRates[key] / 100);
    }
  }

  return result;
}

function getUnlockedSkills(classDef: ClassDefinition, level: number): string[] {
  return classDef.skills.filter((skill) => skill.level <= level).map((skill) => skill.skillId);
}

function createEnemyInventory(placement: EnemyPlacement, items: ItemData[]): Inventory {
  const inventory = createEmptyInventory();

  placement.equipment.slice(0, MAX_INVENTORY_SLOTS).forEach((equipmentId, index) => {
    const itemData = items.find((item) => item.id === equipmentId);

    if (!itemData) {
      return;
    }

    inventory.items[index] = createItemInstance(itemData, 'enemy_item', index);

    if (itemData.category === ItemCategory.Weapon && inventory.equippedWeaponIndex === null) {
      inventory.equippedWeaponIndex = index;
    }

    if (itemData.category === ItemCategory.Armor && inventory.equippedArmor[itemData.slot] === null) {
      inventory.equippedArmor[itemData.slot] = index;
    }
  });

  return inventory;
}

export function createUnit(characterDef: CharacterDefinition, classDef: ClassDefinition): Unit {
  const baseStats = { ...classDef.baseStats };

  return {
    id: `unit_${characterDef.id}_${Date.now()}`,
    name: characterDef.name,
    characterId: characterDef.id,
    className: classDef.name,
    level: characterDef.baseLevel,
    exp: 0,
    currentStats: baseStats,
    maxHP: baseStats.hp,
    currentHP: baseStats.hp,
    currentSP: MAX_SP,
    maxSP: MAX_SP,
    growthRates: combineGrowthRates(classDef.growthRates, characterDef.personalGrowthBonuses),
    inventory: createEmptyInventory(),
    skills: getUnlockedSkills(classDef, characterDef.baseLevel),
    activeStatusEffects: [],
    position: null,
    hasMoved: false,
    hasActed: false,
    isAlive: true,
    team: 'player',
    supportRanks: {},
    supportPoints: {},
    killCount: 0,
    movementType: classDef.movementType,
  };
}

export function createEnemyUnit(placement: EnemyPlacement, classDef: ClassDefinition, items: ItemData[]): Unit {
  const growthRates = combineGrowthRates(classDef.growthRates, {});
  const leveledStats = applyAverageLevelGains(placement.level, classDef.baseStats, growthRates);

  return {
    id: `enemy_${placement.characterId}_${Date.now()}`,
    name: placement.characterId,
    characterId: placement.characterId,
    className: classDef.name,
    level: placement.level,
    exp: 0,
    currentStats: leveledStats,
    maxHP: leveledStats.hp,
    currentHP: leveledStats.hp,
    currentSP: MAX_SP,
    maxSP: MAX_SP,
    growthRates,
    inventory: createEnemyInventory(placement, items),
    skills: getUnlockedSkills(classDef, placement.level),
    activeStatusEffects: [],
    position: { ...placement.position },
    hasMoved: false,
    hasActed: false,
    isAlive: true,
    team: 'enemy',
    aiBehavior: placement.aiBehavior ?? AIBehavior.Aggressive,
    supportRanks: {},
    supportPoints: {},
    killCount: 0,
    movementType: classDef.movementType,
  };
}
