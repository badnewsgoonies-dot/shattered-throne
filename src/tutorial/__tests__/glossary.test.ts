import { describe, it, expect } from 'vitest';
import { getGlossaryEntry, searchGlossary, getAllGlossaryEntries } from '../glossary';

describe('Glossary', () => {
  describe('getAllGlossaryEntries', () => {
    it('should have at least 50 entries', () => {
      expect(getAllGlossaryEntries().length).toBeGreaterThanOrEqual(50);
    });

    it('should be sorted alphabetically', () => {
      const entries = getAllGlossaryEntries();
      for (let i = 1; i < entries.length; i++) {
        expect(entries[i - 1].term.localeCompare(entries[i].term)).toBeLessThanOrEqual(0);
      }
    });
  });

  describe('getGlossaryEntry', () => {
    const requiredTerms = [
      'Weapon Triangle',
      'Magic Triangle',
      'Terrain Bonus',
      'Movement Cost',
      'Height Advantage',
      'Zone of Control',
      'Counter-attack',
      'Double Attack',
      'Critical Hit',
      'Support Bonus',
      'Effective Damage',
      'Fog of War',
      'Deployment',
      'Promotion',
      'Growth Rates',
      'Durability',
      'Convoy',
      'Support Rank',
      'Forging',
      'Arena',
      'HP',
      'Strength',
      'Magic',
      'Skill',
      'Speed',
      'Luck',
      'Defense',
      'Resistance',
      'Movement',
    ];

    for (const term of requiredTerms) {
      it(`should have entry for "${term}"`, () => {
        expect(getGlossaryEntry(term)).not.toBeNull();
      });
    }

    it('should be case-insensitive', () => {
      expect(getGlossaryEntry('weapon triangle')).toBe(getGlossaryEntry('Weapon Triangle'));
      expect(getGlossaryEntry('CRITICAL HIT')).toBe(getGlossaryEntry('Critical Hit'));
    });

    it('should return null for unknown term', () => {
      expect(getGlossaryEntry('xyznonexistent')).toBeNull();
    });

    // Status effects
    const statusEffects = ['Poison', 'Sleep', 'Silence', 'Berserk', 'Charm', 'Frozen', 'Blind', 'Stun'];
    for (const se of statusEffects) {
      it(`should have entry for status effect "${se}"`, () => {
        expect(getGlossaryEntry(se)).not.toBeNull();
      });
    }

    // Victory conditions
    const victoryConditions = ['Rout', 'Boss Kill', 'Survive', 'Reach Location', 'Protect Target'];
    for (const vc of victoryConditions) {
      it(`should have entry for victory condition "${vc}"`, () => {
        expect(getGlossaryEntry(vc)).not.toBeNull();
      });
    }

    // Classes
    const classes = ['Warrior', 'Knight', 'Archer', 'Mage', 'Cleric', 'Thief', 'Berserker', 'Paladin', 'Assassin', 'Sage', 'General', 'Dancer'];
    for (const cls of classes) {
      it(`should have entry for class "${cls}"`, () => {
        expect(getGlossaryEntry(cls)).not.toBeNull();
      });
    }
  });

  describe('searchGlossary', () => {
    it('should find entries matching term', () => {
      const results = searchGlossary('weapon');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.term === 'Weapon Triangle')).toBe(true);
    });

    it('should find entries matching definition text', () => {
      const results = searchGlossary('3x');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should be case-insensitive', () => {
      const lower = searchGlossary('sword');
      const upper = searchGlossary('SWORD');
      expect(lower.length).toBe(upper.length);
    });

    it('should return empty array for no matches', () => {
      expect(searchGlossary('xyznonexistent123')).toEqual([]);
    });
  });
});
