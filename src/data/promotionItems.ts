import {
  ItemCategory,
  PromotionItemData,
  UnitClassName,
} from '../shared/types';

function promotionItem(
  id: string,
  name: string,
  description: string,
  validClasses: UnitClassName[],
  cost: number,
): PromotionItemData {
  return {
    id,
    name,
    description,
    category: ItemCategory.PromotionItem,
    validClasses,
    cost,
  };
}

export const PROMOTION_ITEMS: PromotionItemData[] = [
  promotionItem(
    'master_seal',
    'Master Seal',
    'A universal seal that enables promotion for all base classes.',
    [
      UnitClassName.Warrior,
      UnitClassName.Knight,
      UnitClassName.Archer,
      UnitClassName.Mage,
      UnitClassName.Cleric,
      UnitClassName.Thief,
    ],
    2500,
  ),
  promotionItem(
    'knight_crest',
    'Knight Crest',
    'An emblem used by frontline fighters to advance their class.',
    [UnitClassName.Warrior, UnitClassName.Knight],
    2000,
  ),
  promotionItem(
    'hero_crest',
    'Hero Crest',
    'A crest associated with daring swordmasters and rogues.',
    [UnitClassName.Warrior, UnitClassName.Thief],
    2000,
  ),
  promotionItem(
    'guiding_ring',
    'Guiding Ring',
    'A ring attuned to mystic and holy classes.',
    [UnitClassName.Mage, UnitClassName.Cleric],
    2000,
  ),
  promotionItem(
    'orions_bolt',
    "Orion's Bolt",
    'A masterwork arrowhead used by expert archers.',
    [UnitClassName.Archer],
    2000,
  ),
  promotionItem(
    'elysian_whip',
    'Elysian Whip',
    'A rare relic used for advanced mounted combat forms.',
    [UnitClassName.Knight],
    2000,
  ),
];

export function getPromotionItemById(id: string): PromotionItemData | null {
  return PROMOTION_ITEMS.find((entry) => entry.id === id) ?? null;
}

export function getAllPromotionItems(): PromotionItemData[] {
  return [...PROMOTION_ITEMS];
}
