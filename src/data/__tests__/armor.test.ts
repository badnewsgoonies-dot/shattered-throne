import { describe, it, expect } from 'vitest';
import { armor } from '../armor';
import { ItemCategory, ArmorSlot } from '../../shared/types';

describe('Armor', () => {
  it('should have 40+ armor pieces', () => {
    expect(armor.length).toBeGreaterThanOrEqual(40);
  });

  it('should have no duplicate IDs', () => {
    const ids = armor.map(a => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should all have armor category', () => {
    for (const a of armor) {
      expect(a.category).toBe(ItemCategory.Armor);
    }
  });

  it('should have valid armor slots', () => {
    const validSlots = Object.values(ArmorSlot);
    for (const a of armor) {
      expect(validSlots).toContain(a.slot);
    }
  });

  it('should have non-negative defense and resistance', () => {
    for (const a of armor) {
      expect(a.defense).toBeGreaterThanOrEqual(0);
      expect(a.resistance).toBeGreaterThanOrEqual(0);
    }
  });

  it('should have non-negative weight and cost', () => {
    for (const a of armor) {
      expect(a.weight).toBeGreaterThanOrEqual(0);
      expect(a.cost).toBeGreaterThanOrEqual(0);
    }
  });

  it('should have speed penalty as a number', () => {
    for (const a of armor) {
      expect(typeof a.speedPenalty).toBe('number');
    }
  });

  it('should include helmets', () => {
    const heads = armor.filter(a => a.slot === ArmorSlot.Head);
    expect(heads.length).toBeGreaterThanOrEqual(10);
  });

  it('should include chest armor', () => {
    const chests = armor.filter(a => a.slot === ArmorSlot.Chest);
    expect(chests.length).toBeGreaterThanOrEqual(10);
  });

  it('should include boots', () => {
    const boots = armor.filter(a => a.slot === ArmorSlot.Boots);
    expect(boots.length).toBeGreaterThanOrEqual(10);
  });

  it('should include accessories', () => {
    const acc = armor.filter(a => a.slot === ArmorSlot.Accessory);
    expect(acc.length).toBeGreaterThanOrEqual(10);
  });

  it('should have at least 3 set IDs', () => {
    const setIds = new Set(armor.filter(a => a.setId).map(a => a.setId));
    expect(setIds.size).toBeGreaterThanOrEqual(3);
  });

  it('should have names and descriptions', () => {
    for (const a of armor) {
      expect(a.name).toBeTruthy();
      expect(a.description).toBeTruthy();
    }
  });
});
