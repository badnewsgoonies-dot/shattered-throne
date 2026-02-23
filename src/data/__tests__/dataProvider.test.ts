import { describe, expect, it } from 'vitest';
import { UnitClassName } from '../../shared/types';
import { CHAPTERS } from '../chapters';
import { CHARACTERS } from '../characters';
import { createDataProvider } from '../dataProvider';
import { MAP_LAYOUTS } from '../mapLayouts';
import { PARALOGUES } from '../paralogues';
import { SKILLS } from '../skills';
import { WEAPONS } from '../weapons';
import { ARMOR } from '../armor';
import { CONSUMABLES } from '../consumables';
import { PROMOTION_ITEMS } from '../promotionItems';

describe('dataProvider', () => {
  const data = createDataProvider();

  it('returns class definitions', () => {
    const warrior = data.getClassDefinition(UnitClassName.Warrior);
    expect(warrior.name).toBe(UnitClassName.Warrior);
  });

  it('returns all classes', () => {
    expect(data.getAllClasses().length).toBe(19);
  });

  it('returns weapons and null on invalid id', () => {
    expect(data.getWeapon('iron_sword')?.id).toBe('iron_sword');
    expect(data.getWeapon('missing_weapon')).toBeNull();
  });

  it('returns armor and null on invalid id', () => {
    expect(data.getArmor('iron_helm')?.id).toBe('iron_helm');
    expect(data.getArmor('missing_armor')).toBeNull();
  });

  it('returns consumables and null on invalid id', () => {
    expect(data.getConsumable('vulnerary')?.id).toBe('vulnerary');
    expect(data.getConsumable('missing_consumable')).toBeNull();
  });

  it('returns promotion items and null on invalid id', () => {
    expect(data.getPromotionItem('master_seal')?.id).toBe('master_seal');
    expect(data.getPromotionItem('missing_promo')).toBeNull();
  });

  it('aggregates item lookup across all categories', () => {
    expect(data.getItem('iron_sword')?.id).toBe('iron_sword');
    expect(data.getItem('iron_helm')?.id).toBe('iron_helm');
    expect(data.getItem('vulnerary')?.id).toBe('vulnerary');
    expect(data.getItem('master_seal')?.id).toBe('master_seal');
    expect(data.getItem('missing_item')).toBeNull();
  });

  it('returns skills and null on invalid id', () => {
    expect(data.getSkill('power-strike')?.id).toBe('power-strike');
    expect(data.getSkill('missing_skill')).toBeNull();
    expect(data.getAllSkills().length).toBe(SKILLS.length);
  });

  it('returns chapters including paralogues', () => {
    expect(data.getChapter('ch_1')?.id).toBe('ch_1');
    expect(data.getChapter('px_1')?.id).toBe('px_1');
    expect(data.getChapter('missing_chapter')).toBeNull();
    expect(data.getAllChapters().length).toBe(CHAPTERS.length + PARALOGUES.length);
  });

  it('returns characters and null on invalid id', () => {
    expect(data.getCharacter('alaric')?.id).toBe('alaric');
    expect(data.getCharacter('missing_character')).toBeNull();
    expect(data.getAllCharacters().length).toBe(CHARACTERS.length);
  });

  it('returns maps and null on invalid id', () => {
    expect(data.getMapData('map_borderlands_08')?.id).toBe('map_borderlands_08');
    expect(data.getMapData('missing_map')).toBeNull();
    expect(data.getAllMaps().length).toBe(MAP_LAYOUTS.length);
  });

  it('returns support conversations in both character orders', () => {
    const forward = data.getSupportConversations('alaric', 'elena');
    const reverse = data.getSupportConversations('elena', 'alaric');
    expect(forward.length).toBeGreaterThan(0);
    expect(reverse.length).toBe(forward.length);
  });

  it('returns enemy templates and null for unknown template', () => {
    expect(data.getEnemyTemplate('enemy_bandit_01')?.characterId).toBe('enemy_bandit_01');
    expect(data.getEnemyTemplate('missing_enemy')).toBeNull();
    expect(data.getAllEnemyTemplates().length).toBeGreaterThanOrEqual(30);
  });

  it('all collection getters return expected source sizes', () => {
    expect(data.getAllWeapons().length).toBe(WEAPONS.length);
    expect(data.getAllArmor().length).toBe(ARMOR.length);
    expect(data.getAllConsumables().length).toBe(CONSUMABLES.length);
    expect(data.getAllPromotionItems().length).toBe(PROMOTION_ITEMS.length);
  });

  it('validation method returns a shaped result', () => {
    const result = data.validateAllData();
    expect(typeof result.valid).toBe('boolean');
    expect(Array.isArray(result.errors)).toBe(true);
  });
});
