import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  AIBehavior,
  ArmorSlot,
  ItemCategory,
  UnitClassName,
  WeaponType,
} from '../../shared/types';
import {
  createEnemyUnit,
  createUnit,
} from '../unitFactory';
import {
  collectItemData,
  makeArmorData,
  makeCharacterDefinition,
  makeClassDefinition,
  makeEnemyPlacement,
  makeWeaponData,
} from './testUtils';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('unitFactory.createUnit', () => {
  it('creates a player unit with generated id pattern', () => {
    vi.spyOn(Date, 'now').mockReturnValue(111111);
    const characterDef = makeCharacterDefinition({ id: 'lyn' });
    const classDef = makeClassDefinition();

    const unit = createUnit(characterDef, classDef);

    expect(unit.id).toBe('unit_lyn_111111');
  });

  it('copies class base stats into currentStats', () => {
    const classDef = makeClassDefinition({ baseStats: { hp: 40, strength: 15, movement: 6 } });
    const unit = createUnit(makeCharacterDefinition(), classDef);

    expect(unit.currentStats).toEqual(classDef.baseStats);
    expect(unit.currentStats).not.toBe(classDef.baseStats);
  });

  it('combines class growth rates and personal growth bonuses', () => {
    const classDef = makeClassDefinition({
      growthRates: { hp: 40, strength: 30, magic: 10, skill: 20, speed: 25, luck: 15, defense: 20, resistance: 10 },
    });
    const characterDef = makeCharacterDefinition({
      personalGrowthBonuses: { hp: 5, strength: 10, speed: 7, resistance: 3 },
    });

    const unit = createUnit(characterDef, classDef);

    expect(unit.growthRates).toEqual({
      hp: 45,
      strength: 40,
      magic: 10,
      skill: 20,
      speed: 32,
      luck: 15,
      defense: 20,
      resistance: 13,
    });
  });

  it('initializes level exp HP and SP correctly', () => {
    const characterDef = makeCharacterDefinition({ baseLevel: 6 });
    const classDef = makeClassDefinition({ baseStats: { hp: 34 } });

    const unit = createUnit(characterDef, classDef);

    expect(unit.level).toBe(6);
    expect(unit.exp).toBe(0);
    expect(unit.maxHP).toBe(34);
    expect(unit.currentHP).toBe(34);
    expect(unit.currentSP).toBe(100);
    expect(unit.maxSP).toBe(100);
  });

  it('creates an empty inventory with 5 slots and null equipment', () => {
    const unit = createUnit(makeCharacterDefinition(), makeClassDefinition());

    expect(unit.inventory.items).toEqual([null, null, null, null, null]);
    expect(unit.inventory.equippedWeaponIndex).toBeNull();
    expect(unit.inventory.equippedArmor).toEqual({
      [ArmorSlot.Head]: null,
      [ArmorSlot.Chest]: null,
      [ArmorSlot.Boots]: null,
      [ArmorSlot.Accessory]: null,
    });
  });

  it('unlocks class skills up to the character base level', () => {
    const classDef = makeClassDefinition({
      skills: [
        { level: 1, skillId: 's1' },
        { level: 3, skillId: 's3' },
        { level: 6, skillId: 's6' },
      ],
    });
    const unit = createUnit(makeCharacterDefinition({ baseLevel: 3 }), classDef);

    expect(unit.skills).toEqual(['s1', 's3']);
  });

  it('sets default battle state and team values', () => {
    const unit = createUnit(makeCharacterDefinition(), makeClassDefinition());

    expect(unit.isAlive).toBe(true);
    expect(unit.hasMoved).toBe(false);
    expect(unit.hasActed).toBe(false);
    expect(unit.team).toBe('player');
    expect(unit.killCount).toBe(0);
  });

  it('sets movementType from class definition', () => {
    const classDef = makeClassDefinition({ movementType: 'mounted' as const });

    const unit = createUnit(makeCharacterDefinition(), classDef);

    expect(unit.movementType).toBe('mounted');
  });

  it('initializes support structures as empty objects', () => {
    const unit = createUnit(makeCharacterDefinition(), makeClassDefinition());

    expect(unit.supportRanks).toEqual({});
    expect(unit.supportPoints).toEqual({});
  });
});

describe('unitFactory.createEnemyUnit', () => {
  it('creates enemy id, team, ai behavior, and position', () => {
    vi.spyOn(Date, 'now').mockReturnValue(222222);
    const placement = makeEnemyPlacement({ characterId: 'goblin', aiBehavior: AIBehavior.Defensive, position: { x: 4, y: 2 } });

    const enemy = createEnemyUnit(placement, makeClassDefinition(), []);

    expect(enemy.id).toBe('enemy_goblin_222222');
    expect(enemy.team).toBe('enemy');
    expect(enemy.aiBehavior).toBe(AIBehavior.Defensive);
    expect(enemy.position).toEqual({ x: 4, y: 2 });
  });

  it('simulates average level gains from level 1 to target level', () => {
    const classDef = makeClassDefinition({
      baseStats: {
        hp: 20,
        strength: 10,
        magic: 5,
        skill: 6,
        speed: 7,
        luck: 4,
        defense: 5,
        resistance: 3,
        movement: 5,
      },
      growthRates: {
        hp: 100,
        strength: 100,
        magic: 100,
        skill: 100,
        speed: 100,
        luck: 100,
        defense: 100,
        resistance: 100,
      },
    });

    const enemy = createEnemyUnit(makeEnemyPlacement({ level: 4 }), classDef, []);

    expect(enemy.currentStats.hp).toBe(23);
    expect(enemy.currentStats.strength).toBe(13);
    expect(enemy.currentStats.magic).toBe(8);
    expect(enemy.currentStats.skill).toBe(9);
    expect(enemy.currentStats.speed).toBe(10);
    expect(enemy.currentStats.luck).toBe(7);
    expect(enemy.currentStats.defense).toBe(8);
    expect(enemy.currentStats.resistance).toBe(6);
    expect(enemy.currentStats.movement).toBe(5);
  });

  it('does not grant average gains when enemy is level 1', () => {
    const classDef = makeClassDefinition({
      baseStats: { hp: 19, strength: 8, movement: 4 },
      growthRates: { hp: 100, strength: 100, magic: 100, skill: 100, speed: 100, luck: 100, defense: 100, resistance: 100 },
    });

    const enemy = createEnemyUnit(makeEnemyPlacement({ level: 1 }), classDef, []);

    expect(enemy.currentStats.hp).toBe(19);
    expect(enemy.currentStats.strength).toBe(8);
    expect(enemy.currentStats.movement).toBe(4);
  });

  it('builds inventory from placement equipment and item data ids', () => {
    const sword = makeWeaponData({ id: 'sword_01' });
    const axe = makeWeaponData({ id: 'axe_01', weaponType: WeaponType.Axe, category: ItemCategory.Weapon });
    const helm = makeArmorData({ id: 'helm_01', slot: ArmorSlot.Head });
    const items = collectItemData(sword, axe, helm);
    const placement = makeEnemyPlacement({ equipment: ['sword_01', 'helm_01', 'axe_01'] });

    const enemy = createEnemyUnit(placement, makeClassDefinition(), items);

    expect(enemy.inventory.items[0]?.dataId).toBe('sword_01');
    expect(enemy.inventory.items[1]?.dataId).toBe('helm_01');
    expect(enemy.inventory.items[2]?.dataId).toBe('axe_01');
  });

  it('equips the first weapon found in enemy inventory', () => {
    const sword = makeWeaponData({ id: 'sword_01' });
    const axe = makeWeaponData({ id: 'axe_01', weaponType: WeaponType.Axe });
    const enemy = createEnemyUnit(
      makeEnemyPlacement({ equipment: ['sword_01', 'axe_01'] }),
      makeClassDefinition(),
      collectItemData(sword, axe),
    );

    expect(enemy.inventory.equippedWeaponIndex).toBe(0);
  });

  it('equips armor indices by armor slot', () => {
    const head = makeArmorData({ id: 'head_armor', slot: ArmorSlot.Head });
    const chest = makeArmorData({ id: 'chest_armor', slot: ArmorSlot.Chest });
    const enemy = createEnemyUnit(
      makeEnemyPlacement({ equipment: ['head_armor', 'chest_armor'] }),
      makeClassDefinition(),
      collectItemData(head, chest),
    );

    expect(enemy.inventory.equippedArmor[ArmorSlot.Head]).toBe(0);
    expect(enemy.inventory.equippedArmor[ArmorSlot.Chest]).toBe(1);
  });

  it('ignores unknown equipment ids', () => {
    const sword = makeWeaponData({ id: 'known_sword' });
    const enemy = createEnemyUnit(
      makeEnemyPlacement({ equipment: ['known_sword', 'missing_item'] }),
      makeClassDefinition(),
      [sword],
    );

    expect(enemy.inventory.items[0]?.dataId).toBe('known_sword');
    expect(enemy.inventory.items[1]).toBeNull();
  });

  it('unlocks enemy class skills by placement level', () => {
    const classDef = makeClassDefinition({
      skills: [
        { level: 1, skillId: 'alpha' },
        { level: 4, skillId: 'beta' },
        { level: 6, skillId: 'gamma' },
      ],
    });

    const enemy = createEnemyUnit(makeEnemyPlacement({ level: 4 }), classDef, []);

    expect(enemy.skills).toEqual(['alpha', 'beta']);
  });

  it('uses class name and movement type from class definition', () => {
    const classDef = makeClassDefinition({ name: UnitClassName.Knight, movementType: 'armored' as const });
    const enemy = createEnemyUnit(makeEnemyPlacement(), classDef, []);

    expect(enemy.className).toBe(UnitClassName.Knight);
    expect(enemy.movementType).toBe('armored');
  });

  it('sets enemy currentHP equal to maxHP after simulated leveling', () => {
    const classDef = makeClassDefinition({
      baseStats: { hp: 18 },
      growthRates: { hp: 100, strength: 0, magic: 0, skill: 0, speed: 0, luck: 0, defense: 0, resistance: 0 },
    });

    const enemy = createEnemyUnit(makeEnemyPlacement({ level: 5 }), classDef, []);

    expect(enemy.maxHP).toBe(22);
    expect(enemy.currentHP).toBe(22);
  });
});
