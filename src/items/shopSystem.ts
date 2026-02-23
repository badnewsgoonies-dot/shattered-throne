import { IDataProvider, ItemData } from '../shared/types';

const EARLY_ITEMS = [
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

const MID_ITEMS = [
  ...EARLY_ITEMS,
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

const LATE_ITEMS = [
  ...MID_ITEMS,
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

export function getShopInventory(chapterId: string, dataProvider: IDataProvider): ItemData[] {
  const chapterNumber = parseInt(chapterId.replace(/\D/g, ''), 10) || 1;

  let itemIds: string[];
  if (chapterNumber <= 5) {
    itemIds = EARLY_ITEMS;
  } else if (chapterNumber <= 15) {
    itemIds = MID_ITEMS;
  } else {
    itemIds = LATE_ITEMS;
  }

  return itemIds
    .map((id) => dataProvider.getItem(id))
    .filter((item): item is ItemData => item !== null);
}
