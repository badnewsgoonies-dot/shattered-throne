import { describe, it, expect } from 'vitest';
import { createDataProvider } from '../dataProvider';
import { UnitClassName } from '../../shared/types';

describe('DataProvider', () => {
  const provider = createDataProvider();

  it('should return all classes', () => {
    const classes = provider.getAllClasses();
    expect(classes.length).toBe(19);
  });

  it('should get a class by name', () => {
    const warrior = provider.getClassDefinition(UnitClassName.Warrior);
    expect(warrior).toBeDefined();
    expect(warrior.name).toBe(UnitClassName.Warrior);
  });

  it('should throw for unknown class', () => {
    expect(() => provider.getClassDefinition('nonexistent' as UnitClassName)).toThrow();
  });

  it('should return all weapons', () => {
    expect(provider.getAllWeapons().length).toBeGreaterThanOrEqual(80);
  });

  it('should get weapon by ID', () => {
    const sword = provider.getWeapon('iron-sword');
    expect(sword).toBeDefined();
    expect(sword!.name).toBe('Iron Sword');
  });

  it('should return null for unknown weapon', () => {
    expect(provider.getWeapon('nonexistent')).toBeNull();
  });

  it('should return all armor', () => {
    expect(provider.getAllArmor().length).toBeGreaterThanOrEqual(40);
  });

  it('should get armor by ID', () => {
    const helm = provider.getArmor('iron-helm');
    expect(helm).toBeDefined();
  });

  it('should return null for unknown armor', () => {
    expect(provider.getArmor('nonexistent')).toBeNull();
  });

  it('should return all consumables', () => {
    expect(provider.getAllConsumables().length).toBeGreaterThanOrEqual(20);
  });

  it('should get consumable by ID', () => {
    const vuln = provider.getConsumable('vulnerary');
    expect(vuln).toBeDefined();
  });

  it('should return null for unknown consumable', () => {
    expect(provider.getConsumable('nonexistent')).toBeNull();
  });

  it('should return all promotion items', () => {
    expect(provider.getAllPromotionItems().length).toBeGreaterThanOrEqual(6);
  });

  it('should get promotion item by ID', () => {
    const seal = provider.getPromotionItem('master-seal');
    expect(seal).toBeDefined();
  });

  it('should return null for unknown promotion item', () => {
    expect(provider.getPromotionItem('nonexistent')).toBeNull();
  });

  it('should get item by ID (any category)', () => {
    expect(provider.getItem('iron-sword')).toBeDefined();
    expect(provider.getItem('iron-helm')).toBeDefined();
    expect(provider.getItem('vulnerary')).toBeDefined();
    expect(provider.getItem('master-seal')).toBeDefined();
    expect(provider.getItem('nonexistent')).toBeNull();
  });

  it('should return all skills', () => {
    expect(provider.getAllSkills().length).toBeGreaterThanOrEqual(50);
  });

  it('should get skill by ID', () => {
    const skill = provider.getSkill('power-strike');
    expect(skill).toBeDefined();
  });

  it('should return null for unknown skill', () => {
    expect(provider.getSkill('nonexistent')).toBeNull();
  });

  it('should return all chapters (including paralogues)', () => {
    const all = provider.getAllChapters();
    expect(all.length).toBeGreaterThanOrEqual(35);
  });

  it('should get chapter by ID', () => {
    const ch = provider.getChapter('ch-1');
    expect(ch).toBeDefined();
    expect(ch!.title).toBeTruthy();
  });

  it('should return null for unknown chapter', () => {
    expect(provider.getChapter('nonexistent')).toBeNull();
  });

  it('should return all characters', () => {
    expect(provider.getAllCharacters().length).toBeGreaterThanOrEqual(40);
  });

  it('should get character by ID', () => {
    const alaric = provider.getCharacter('alaric');
    expect(alaric).toBeDefined();
    expect(alaric!.isLord).toBe(true);
  });

  it('should return null for unknown character', () => {
    expect(provider.getCharacter('nonexistent')).toBeNull();
  });

  it('should return all maps', () => {
    expect(provider.getAllMaps().length).toBeGreaterThanOrEqual(20);
  });

  it('should get map by ID', () => {
    const map = provider.getMapData('map-ch1');
    expect(map).toBeDefined();
  });

  it('should return null for unknown map', () => {
    expect(provider.getMapData('nonexistent')).toBeNull();
  });

  it('should get support conversations by character pair', () => {
    const convos = provider.getSupportConversations('alaric', 'elena');
    expect(convos.length).toBeGreaterThanOrEqual(3);
  });

  it('should get support conversations in reverse order too', () => {
    const convos = provider.getSupportConversations('elena', 'alaric');
    expect(convos.length).toBeGreaterThanOrEqual(3);
  });

  it('should return empty for unrelated pair', () => {
    const convos = provider.getSupportConversations('nonexistent1', 'nonexistent2');
    expect(convos.length).toBe(0);
  });

  it('should return all support conversations', () => {
    expect(provider.getAllSupportConversations().length).toBeGreaterThanOrEqual(30);
  });

  it('should get enemy template by ID', () => {
    const templates = provider.getAllEnemyTemplates();
    const first = templates[0];
    const found = provider.getEnemyTemplate(first.characterId);
    expect(found).toBeDefined();
  });

  it('should return null for unknown enemy template', () => {
    expect(provider.getEnemyTemplate('nonexistent')).toBeNull();
  });

  it('should return all enemy templates', () => {
    expect(provider.getAllEnemyTemplates().length).toBeGreaterThanOrEqual(30);
  });

  it('should validate all data successfully', () => {
    const result = provider.validateAllData();
    expect(result.valid).toBe(true);
  });
});
