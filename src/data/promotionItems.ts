import { PromotionItemData, ItemCategory, UnitClassName } from '../../src/shared/types';

export const promotionItems: PromotionItemData[] = [
  {
    id: 'master-seal',
    name: 'Master Seal',
    description: 'Allows any base class unit to promote at level 15 or higher.',
    category: ItemCategory.PromotionItem,
    validClasses: [UnitClassName.Warrior, UnitClassName.Knight, UnitClassName.Archer, UnitClassName.Mage, UnitClassName.Cleric, UnitClassName.Thief],
    cost: 2500,
  },
  {
    id: 'knight-crest',
    name: 'Knight Crest',
    description: 'Allows Warriors and Knights to promote.',
    category: ItemCategory.PromotionItem,
    validClasses: [UnitClassName.Warrior, UnitClassName.Knight],
    cost: 2000,
  },
  {
    id: 'hero-crest',
    name: 'Hero Crest',
    description: 'Allows Warriors and Thieves to promote.',
    category: ItemCategory.PromotionItem,
    validClasses: [UnitClassName.Warrior, UnitClassName.Thief],
    cost: 2000,
  },
  {
    id: 'guiding-ring',
    name: 'Guiding Ring',
    description: 'Allows Mages and Clerics to promote.',
    category: ItemCategory.PromotionItem,
    validClasses: [UnitClassName.Mage, UnitClassName.Cleric],
    cost: 2000,
  },
  {
    id: 'orions-bolt',
    name: "Orion's Bolt",
    description: 'Allows Archers to promote.',
    category: ItemCategory.PromotionItem,
    validClasses: [UnitClassName.Archer],
    cost: 2000,
  },
  {
    id: 'elysian-whip',
    name: 'Elysian Whip',
    description: 'Allows Knights to promote.',
    category: ItemCategory.PromotionItem,
    validClasses: [UnitClassName.Knight],
    cost: 2000,
  },
];
