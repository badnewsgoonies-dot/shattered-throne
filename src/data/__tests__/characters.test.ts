import { describe, it, expect } from 'vitest';
import { characters } from '../characters';
import { UnitClassName } from '../../shared/types';
import { weapons } from '../weapons';
import { armor } from '../armor';
import { consumables } from '../consumables';
import { promotionItems } from '../promotionItems';

describe('Characters', () => {
  const allItemIds = new Set([
    ...weapons.map(w => w.id),
    ...armor.map(a => a.id),
    ...consumables.map(c => c.id),
    ...promotionItems.map(p => p.id),
  ]);

  it('should have 40+ characters', () => {
    expect(characters.length).toBeGreaterThanOrEqual(40);
  });

  it('should have no duplicate IDs', () => {
    const ids = characters.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have valid class names', () => {
    const validNames = Object.values(UnitClassName);
    for (const ch of characters) {
      expect(validNames).toContain(ch.className);
    }
  });

  it('should have at least 1 lord', () => {
    const lords = characters.filter(c => c.isLord);
    expect(lords.length).toBeGreaterThanOrEqual(1);
  });

  it('should have valid starting equipment references', () => {
    for (const ch of characters) {
      for (const equipId of ch.startingEquipment) {
        expect(allItemIds.has(equipId)).toBe(true);
      }
    }
  });

  it('should have positive base levels', () => {
    for (const ch of characters) {
      expect(ch.baseLevel).toBeGreaterThanOrEqual(1);
    }
  });

  it('should have non-negative base stats', () => {
    for (const ch of characters) {
      expect(ch.baseStats.hp).toBeGreaterThan(0);
      expect(ch.baseStats.strength).toBeGreaterThanOrEqual(0);
      expect(ch.baseStats.magic).toBeGreaterThanOrEqual(0);
    }
  });

  it('should have a recruit chapter', () => {
    for (const ch of characters) {
      expect(ch.recruitChapter).toBeTruthy();
    }
  });

  it('should have a portrait color', () => {
    for (const ch of characters) {
      expect(ch.portraitColor).toBeTruthy();
    }
  });

  it('should have names and backstories', () => {
    for (const ch of characters) {
      expect(ch.name).toBeTruthy();
      expect(ch.backstory).toBeTruthy();
    }
  });

  it('should have 20+ player characters', () => {
    const players = characters.filter(c => !c.id.startsWith('boss-') && !c.id.startsWith('npc-'));
    expect(players.length).toBeGreaterThanOrEqual(20);
  });

  it('should have 10+ bosses', () => {
    const bosses = characters.filter(c => c.id.startsWith('boss-'));
    expect(bosses.length).toBeGreaterThanOrEqual(10);
  });

  it('should have 5+ NPC allies', () => {
    const npcs = characters.filter(c => c.id.startsWith('npc-'));
    expect(npcs.length).toBeGreaterThanOrEqual(5);
  });
});
