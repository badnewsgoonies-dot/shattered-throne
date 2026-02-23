import {
  ArmorData,
  ChapterDefinition,
  CharacterDefinition,
  ClassDefinition,
  ConsumableData,
  GridMap,
  IDataProvider,
  ItemData,
  PromotionItemData,
  SkillDefinition,
  SupportConversation,
  UnitClassName,
  WeaponData,
  EnemyPlacement,
} from '../shared/types';
import { ARMOR } from './armor';
import { CHAPTERS } from './chapters';
import { CLASS_DEFINITIONS } from './classes';
import { CHARACTERS } from './characters';
import { CONSUMABLES } from './consumables';
import { ENEMY_TEMPLATES } from './enemyTemplates';
import { MAP_LAYOUTS } from './mapLayouts';
import { PARALOGUES } from './paralogues';
import { PROMOTION_ITEMS } from './promotionItems';
import { SKILLS } from './skills';
import { SUPPORT_CONVERSATIONS } from './supportConversations';
import { validateAllData } from './validation';
import { WEAPONS } from './weapons';

export function createDataProvider(): IDataProvider {
  const classMap = new Map<UnitClassName, ClassDefinition>(
    Object.values(CLASS_DEFINITIONS).map((classDef) => [classDef.name, classDef]),
  );

  const weaponMap = new Map<string, WeaponData>(WEAPONS.map((item) => [item.id, item]));
  const armorMap = new Map<string, ArmorData>(ARMOR.map((item) => [item.id, item]));
  const consumableMap = new Map<string, ConsumableData>(CONSUMABLES.map((item) => [item.id, item]));
  const promotionItemMap = new Map<string, PromotionItemData>(PROMOTION_ITEMS.map((item) => [item.id, item]));
  const skillMap = new Map<string, SkillDefinition>(SKILLS.map((skill) => [skill.id, skill]));
  const chapterMap = new Map<string, ChapterDefinition>(
    [...CHAPTERS, ...PARALOGUES].map((chapter) => [chapter.id, chapter]),
  );
  const characterMap = new Map<string, CharacterDefinition>(CHARACTERS.map((character) => [character.id, character]));
  const mapDataMap = new Map<string, GridMap>(MAP_LAYOUTS.map((map) => [map.id, map]));
  const enemyTemplateMap = new Map<string, EnemyPlacement>(
    ENEMY_TEMPLATES.map((template) => [template.characterId, template]),
  );

  return {
    getClassDefinition(className: UnitClassName): ClassDefinition {
      const classDef = classMap.get(className);
      if (!classDef) {
        throw new Error(`Missing class definition for ${className}`);
      }
      return classDef;
    },

    getAllClasses(): ClassDefinition[] {
      return [...classMap.values()];
    },

    getWeapon(id: string): WeaponData | null {
      return weaponMap.get(id) ?? null;
    },

    getAllWeapons(): WeaponData[] {
      return [...weaponMap.values()];
    },

    getArmor(id: string): ArmorData | null {
      return armorMap.get(id) ?? null;
    },

    getAllArmor(): ArmorData[] {
      return [...armorMap.values()];
    },

    getConsumable(id: string): ConsumableData | null {
      return consumableMap.get(id) ?? null;
    },

    getAllConsumables(): ConsumableData[] {
      return [...consumableMap.values()];
    },

    getPromotionItem(id: string): PromotionItemData | null {
      return promotionItemMap.get(id) ?? null;
    },

    getAllPromotionItems(): PromotionItemData[] {
      return [...promotionItemMap.values()];
    },

    getItem(id: string): ItemData | null {
      return weaponMap.get(id) ?? armorMap.get(id) ?? consumableMap.get(id) ?? promotionItemMap.get(id) ?? null;
    },

    getSkill(id: string): SkillDefinition | null {
      return skillMap.get(id) ?? null;
    },

    getAllSkills(): SkillDefinition[] {
      return [...skillMap.values()];
    },

    getChapter(id: string): ChapterDefinition | null {
      return chapterMap.get(id) ?? null;
    },

    getAllChapters(): ChapterDefinition[] {
      return [...chapterMap.values()];
    },

    getCharacter(id: string): CharacterDefinition | null {
      return characterMap.get(id) ?? null;
    },

    getAllCharacters(): CharacterDefinition[] {
      return [...characterMap.values()];
    },

    getMapData(id: string): GridMap | null {
      return mapDataMap.get(id) ?? null;
    },

    getAllMaps(): GridMap[] {
      return [...mapDataMap.values()];
    },

    getSupportConversations(charA: string, charB: string): SupportConversation[] {
      return SUPPORT_CONVERSATIONS.filter(
        (conversation) =>
          (conversation.characterA === charA && conversation.characterB === charB) ||
          (conversation.characterA === charB && conversation.characterB === charA),
      );
    },

    getAllSupportConversations(): SupportConversation[] {
      return [...SUPPORT_CONVERSATIONS];
    },

    getEnemyTemplate(id: string): EnemyPlacement | null {
      return enemyTemplateMap.get(id) ?? null;
    },

    getAllEnemyTemplates(): EnemyPlacement[] {
      return [...enemyTemplateMap.values()];
    },

    validateAllData,
  };
}
