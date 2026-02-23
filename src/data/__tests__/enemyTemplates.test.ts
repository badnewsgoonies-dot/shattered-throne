import { describe, expect, it } from 'vitest';
import { AIBehavior } from '../../shared/types';
import { ARMOR } from '../armor';
import { CLASS_DEFINITIONS } from '../classes';
import { CONSUMABLES } from '../consumables';
import {
  ENEMY_TEMPLATES,
  getEnemyTemplateById,
} from '../enemyTemplates';
import { PROMOTION_ITEMS } from '../promotionItems';
import { WEAPONS } from '../weapons';

describe('enemy templates data', () => {
  const classSet = new Set(Object.keys(CLASS_DEFINITIONS));
  const itemSet = new Set([
    ...WEAPONS.map((item) => item.id),
    ...ARMOR.map((item) => item.id),
    ...CONSUMABLES.map((item) => item.id),
    ...PROMOTION_ITEMS.map((item) => item.id),
  ]);

  it('has at least 30 enemy templates', () => {
    expect(ENEMY_TEMPLATES.length).toBeGreaterThanOrEqual(30);
  });

  it('template character IDs are unique', () => {
    const ids = ENEMY_TEMPLATES.map((entry) => entry.characterId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all template classes are valid', () => {
    for (const entry of ENEMY_TEMPLATES) {
      expect(classSet.has(entry.className)).toBe(true);
    }
  });

  it('all template levels are positive', () => {
    for (const entry of ENEMY_TEMPLATES) {
      expect(entry.level).toBeGreaterThan(0);
    }
  });

  it('all template positions are non-negative', () => {
    for (const entry of ENEMY_TEMPLATES) {
      expect(entry.position.x).toBeGreaterThanOrEqual(0);
      expect(entry.position.y).toBeGreaterThanOrEqual(0);
    }
  });

  it('all templates have equipment and valid item references', () => {
    for (const entry of ENEMY_TEMPLATES) {
      expect(entry.equipment.length).toBeGreaterThan(0);
      for (const item of entry.equipment) {
        expect(itemSet.has(item)).toBe(true);
      }
    }
  });

  it('all drop items are valid when present', () => {
    for (const entry of ENEMY_TEMPLATES) {
      if (entry.dropItemId) {
        expect(itemSet.has(entry.dropItemId)).toBe(true);
      }
    }
  });

  it('ai behavior values are valid', () => {
    const behaviors = new Set(Object.values(AIBehavior));
    for (const entry of ENEMY_TEMPLATES) {
      expect(behaviors.has(entry.aiBehavior)).toBe(true);
    }
  });

  it('includes at least 4 boss templates', () => {
    expect(ENEMY_TEMPLATES.filter((entry) => entry.isBoss).length).toBeGreaterThanOrEqual(4);
  });

  it('getter returns template for known id and null for unknown id', () => {
    expect(getEnemyTemplateById('enemy_bandit_01')?.characterId).toBe('enemy_bandit_01');
    expect(getEnemyTemplateById('missing_enemy')).toBeNull();
  });
});
