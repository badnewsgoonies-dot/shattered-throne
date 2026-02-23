import { describe, expect, it } from 'vitest';
import { ItemData, ItemCategory, UnitClassName, WeaponType } from '../../shared/types';
import { createItemSystem } from '../itemSystem';
import { getShopInventory } from '../shopSystem';
import {
  createMockDataProvider,
  makeArmorData,
  makeConsumableData,
  makePromotionItemData,
  makeWeaponData,
} from './testUtils';

const EARLY_ITEM_IDS = [
  'iron_sword',
  'iron_lance',
  'iron_axe',
  'iron_bow',
  'fire',
  'heal_staff',
  'vulnerary',
  'iron_helm',
  'iron_plate',
];

const MID_ONLY_IDS = [
  'steel_sword',
  'steel_lance',
  'steel_axe',
  'steel_bow',
  'elfire',
  'mend_staff',
  'concoction',
  'steel_helm',
  'steel_plate',
  'antidote',
];

const LATE_ONLY_IDS = [
  'silver_sword',
  'silver_lance',
  'silver_axe',
  'silver_bow',
  'arcfire',
  'recover_staff',
  'elixir',
  'silver_helm',
  'silver_plate',
  'master_seal',
];

const ALL_SHOP_IDS = [...EARLY_ITEM_IDS, ...MID_ONLY_IDS, ...LATE_ONLY_IDS];

function makeShopItem(id: string): ItemData {
  if (id === 'master_seal') {
    return makePromotionItemData({
      id,
      validClasses: [UnitClassName.Warrior],
    });
  }

  if (id === 'vulnerary' || id === 'concoction' || id === 'elixir') {
    return makeConsumableData({
      id,
      effect: {
        type: 'heal',
        healAmount: 10,
      },
      uses: 3,
    });
  }

  if (id === 'antidote') {
    return makeConsumableData({
      id,
      effect: {
        type: 'cureStatus',
        cureStatus: 'poison',
      },
      uses: 2,
    });
  }

  if (id.includes('helm')) {
    return makeArmorData({
      id,
      name: id,
      slot: 'head',
    });
  }

  if (id.includes('plate')) {
    return makeArmorData({
      id,
      name: id,
      slot: 'chest',
    });
  }

  if (id === 'fire' || id === 'elfire' || id === 'arcfire') {
    return makeWeaponData({
      id,
      name: id,
      weaponType: WeaponType.FireTome,
    });
  }

  if (id.endsWith('_staff')) {
    return makeWeaponData({
      id,
      name: id,
      weaponType: WeaponType.Staff,
      category: ItemCategory.Weapon,
    });
  }

  if (id.includes('lance')) {
    return makeWeaponData({ id, name: id, weaponType: WeaponType.Lance });
  }

  if (id.includes('axe')) {
    return makeWeaponData({ id, name: id, weaponType: WeaponType.Axe });
  }

  if (id.includes('bow')) {
    return makeWeaponData({ id, name: id, weaponType: WeaponType.Bow });
  }

  return makeWeaponData({ id, name: id, weaponType: WeaponType.Sword });
}

function getIds(items: ItemData[]): string[] {
  return items.map((item) => item.id);
}

describe('shopSystem.getShopInventory', () => {
  const provider = createMockDataProvider({
    items: ALL_SHOP_IDS.map((id) => makeShopItem(id)),
  });

  it('returns early tier inventory for chapter 1', () => {
    const items = getShopInventory('ch_1', provider);
    const ids = getIds(items);

    expect(ids).toContain('iron_sword');
    expect(ids).toContain('vulnerary');
    expect(ids).not.toContain('steel_sword');
  });

  it('returns early tier inventory for chapter 5 boundary', () => {
    const ids = getIds(getShopInventory('chapter5', provider));

    expect(ids).toContain('iron_lance');
    expect(ids).not.toContain('steel_lance');
  });

  it('returns mid tier inventory for chapter 6', () => {
    const ids = getIds(getShopInventory('ch_6', provider));

    expect(ids).toContain('steel_sword');
    expect(ids).toContain('antidote');
    expect(ids).not.toContain('silver_sword');
  });

  it('returns mid tier inventory for chapter 15 boundary', () => {
    const ids = getIds(getShopInventory('ch_15', provider));

    expect(ids).toContain('steel_bow');
    expect(ids).not.toContain('silver_bow');
  });

  it('returns late tier inventory for chapter 16', () => {
    const ids = getIds(getShopInventory('ch_16', provider));

    expect(ids).toContain('silver_sword');
    expect(ids).toContain('master_seal');
  });

  it('falls back to early tier when chapter id has no digits', () => {
    const ids = getIds(getShopInventory('prologue', provider));

    expect(ids).toContain('iron_axe');
    expect(ids).not.toContain('steel_axe');
  });

  it('filters out missing items from provider lookups', () => {
    const sparseProvider = createMockDataProvider({
      items: [makeShopItem('iron_sword'), makeShopItem('iron_lance')],
    });

    const ids = getIds(getShopInventory('ch_1', sparseProvider));

    expect(ids).toEqual(['iron_sword', 'iron_lance']);
  });

  it('itemSystem.getShopInventory delegates to shop inventory function', () => {
    const itemSystem = createItemSystem(provider);

    const direct = getIds(getShopInventory('ch_20', provider));
    const viaSystem = getIds(itemSystem.getShopInventory('ch_20'));

    expect(viaSystem).toEqual(direct);
  });
});
