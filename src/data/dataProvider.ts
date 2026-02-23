import {
  IDataProvider, UnitClassName, WeaponData, ArmorData, ConsumableData,
  PromotionItemData, ItemData, SkillDefinition, ClassDefinition,
  ChapterDefinition, CharacterDefinition, GridMap, SupportConversation,
  EnemyPlacement
} from '../shared/types';
import { classDefinitions } from './classes';
import { weapons } from './weapons';
import { armor } from './armor';
import { consumables } from './consumables';
import { promotionItems } from './promotionItems';
import { skills } from './skills';
import { characters } from './characters';
import { supportConversations } from './supportConversations';
import { chapters } from './chapters';
import { paralogues } from './paralogues';
import { mapLayouts } from './mapLayouts';
import { enemyTemplates } from './enemyTemplates';
import { validateAllData } from './validation';

export function createDataProvider(): IDataProvider {
  const classMap = new Map<UnitClassName, ClassDefinition>();
  for (const c of classDefinitions) classMap.set(c.name, c);

  const weaponMap = new Map<string, WeaponData>();
  for (const w of weapons) weaponMap.set(w.id, w);

  const armorMap = new Map<string, ArmorData>();
  for (const a of armor) armorMap.set(a.id, a);

  const consumableMap = new Map<string, ConsumableData>();
  for (const c of consumables) consumableMap.set(c.id, c);

  const promotionItemMap = new Map<string, PromotionItemData>();
  for (const p of promotionItems) promotionItemMap.set(p.id, p);

  const skillMap = new Map<string, SkillDefinition>();
  for (const s of skills) skillMap.set(s.id, s);

  const allChapters = [...chapters, ...paralogues];
  const chapterMap = new Map<string, ChapterDefinition>();
  for (const ch of allChapters) chapterMap.set(ch.id, ch);

  const characterMap = new Map<string, CharacterDefinition>();
  for (const ch of characters) characterMap.set(ch.id, ch);

  const mapMap = new Map<string, GridMap>();
  for (const m of mapLayouts) mapMap.set(m.id, m);

  const provider: IDataProvider = {
    getClassDefinition(className: UnitClassName): ClassDefinition {
      const c = classMap.get(className);
      if (!c) throw new Error(`Class "${className}" not found`);
      return c;
    },
    getAllClasses(): ClassDefinition[] { return classDefinitions; },

    getWeapon(id: string): WeaponData | null { return weaponMap.get(id) ?? null; },
    getAllWeapons(): WeaponData[] { return weapons; },

    getArmor(id: string): ArmorData | null { return armorMap.get(id) ?? null; },
    getAllArmor(): ArmorData[] { return armor; },

    getConsumable(id: string): ConsumableData | null { return consumableMap.get(id) ?? null; },
    getAllConsumables(): ConsumableData[] { return consumables; },

    getPromotionItem(id: string): PromotionItemData | null { return promotionItemMap.get(id) ?? null; },
    getAllPromotionItems(): PromotionItemData[] { return promotionItems; },

    getItem(id: string): ItemData | null {
      return weaponMap.get(id) ?? armorMap.get(id) ?? consumableMap.get(id) ?? promotionItemMap.get(id) ?? null;
    },

    getSkill(id: string): SkillDefinition | null { return skillMap.get(id) ?? null; },
    getAllSkills(): SkillDefinition[] { return skills; },

    getChapter(id: string): ChapterDefinition | null { return chapterMap.get(id) ?? null; },
    getAllChapters(): ChapterDefinition[] { return allChapters; },

    getCharacter(id: string): CharacterDefinition | null { return characterMap.get(id) ?? null; },
    getAllCharacters(): CharacterDefinition[] { return characters; },

    getMapData(id: string): GridMap | null { return mapMap.get(id) ?? null; },
    getAllMaps(): GridMap[] { return mapLayouts; },

    getSupportConversations(charA: string, charB: string): SupportConversation[] {
      return supportConversations.filter(
        sc => (sc.characterA === charA && sc.characterB === charB) ||
              (sc.characterA === charB && sc.characterB === charA)
      );
    },
    getAllSupportConversations(): SupportConversation[] { return supportConversations; },

    getEnemyTemplate(id: string): EnemyPlacement | null {
      return enemyTemplates.find(e => e.characterId === id) ?? null;
    },
    getAllEnemyTemplates(): EnemyPlacement[] { return enemyTemplates; },

    validateAllData(): { valid: boolean; errors: string[] } {
      return validateAllData(provider);
    },
  };

  return provider;
}
