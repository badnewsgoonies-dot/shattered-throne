import { describe, it, expect } from 'vitest';
import { enemyTemplates } from '../enemyTemplates';
import { UnitClassName, AIBehavior } from '../../shared/types';
import { weapons } from '../weapons';
import { armor } from '../armor';
import { consumables } from '../consumables';
import { promotionItems } from '../promotionItems';

describe('Enemy Templates', () => {
  const allItemIds = new Set([
    ...weapons.map(w => w.id),
    ...armor.map(a => a.id),
    ...consumables.map(c => c.id),
    ...promotionItems.map(p => p.id),
  ]);

  it('should have 30+ templates', () => {
    expect(enemyTemplates.length).toBeGreaterThanOrEqual(30);
  });

  it('should have valid class names', () => {
    const validNames = Object.values(UnitClassName);
    for (const et of enemyTemplates) {
      expect(validNames).toContain(et.className);
    }
  });

  it('should have valid AI behaviors', () => {
    const validBehaviors = Object.values(AIBehavior);
    for (const et of enemyTemplates) {
      expect(validBehaviors).toContain(et.aiBehavior);
    }
  });

  it('should have valid equipment references', () => {
    for (const et of enemyTemplates) {
      for (const equipId of et.equipment) {
        expect(allItemIds.has(equipId)).toBe(true);
      }
    }
  });

  it('should have positive levels', () => {
    for (const et of enemyTemplates) {
      expect(et.level).toBeGreaterThanOrEqual(1);
    }
  });

  it('should have valid positions', () => {
    for (const et of enemyTemplates) {
      expect(et.position.x).toBeGreaterThanOrEqual(0);
      expect(et.position.y).toBeGreaterThanOrEqual(0);
    }
  });

  it('should have character IDs', () => {
    for (const et of enemyTemplates) {
      expect(et.characterId).toBeTruthy();
    }
  });

  it('should have isBoss flag defined', () => {
    for (const et of enemyTemplates) {
      expect(typeof et.isBoss).toBe('boolean');
    }
  });
});
