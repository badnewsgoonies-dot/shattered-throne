import { describe, expect, it } from 'vitest';
import { GLOSSARY, getAllGlossaryEntries, getGlossaryEntry, searchGlossary } from '../glossary';

describe('glossary', () => {
  it('defines at least 50 glossary entries', () => {
    expect(GLOSSARY.length).toBeGreaterThanOrEqual(50);
  });

  it('contains required key terms', () => {
    expect(getGlossaryEntry('Weapon Triangle')).not.toBeNull();
    expect(getGlossaryEntry('Magic Triangle')).not.toBeNull();
    expect(getGlossaryEntry('Terrain Bonus')).not.toBeNull();
    expect(getGlossaryEntry('Movement Cost')).not.toBeNull();
    expect(getGlossaryEntry('Height Advantage')).not.toBeNull();
  });

  it('looks up an exact glossary term', () => {
    expect(getGlossaryEntry('Weapon Triangle')).toContain('Swords beat Axes');
  });

  it('looks up glossary terms case-insensitively', () => {
    expect(getGlossaryEntry('weapon triangle')).toBe(getGlossaryEntry('Weapon Triangle'));
  });

  it('trims leading and trailing spaces in lookup term', () => {
    expect(getGlossaryEntry('  Weapon Triangle  ')).toBe(getGlossaryEntry('Weapon Triangle'));
  });

  it('returns null for missing glossary term', () => {
    expect(getGlossaryEntry('Not A Real Entry')).toBeNull();
  });

  it('searches by term text', () => {
    const results = searchGlossary('triangle');
    const terms = results.map((entry) => entry.term);

    expect(terms).toContain('Weapon Triangle');
    expect(terms).toContain('Magic Triangle');
  });

  it('searches by definition text', () => {
    const results = searchGlossary('counter-attack');
    expect(results.some((entry) => entry.term === 'Counter-attack')).toBe(true);
  });

  it('search is case-insensitive', () => {
    const lower = searchGlossary('promotion');
    const upper = searchGlossary('PROMOTION');
    expect(upper).toEqual(lower);
  });

  it('search with no matches returns empty array', () => {
    expect(searchGlossary('zzzz_no_match_zzzz')).toEqual([]);
  });

  it('search with empty query returns all entries', () => {
    expect(searchGlossary('')).toHaveLength(GLOSSARY.length);
  });

  it('returns all glossary entries sorted alphabetically', () => {
    const sorted = getAllGlossaryEntries();
    for (let i = 1; i < sorted.length; i += 1) {
      expect(sorted[i - 1].term.localeCompare(sorted[i].term)).toBeLessThanOrEqual(0);
    }
  });

  it('getAllGlossaryEntries returns a new array', () => {
    const all = getAllGlossaryEntries();
    all.pop();

    expect(getAllGlossaryEntries()).toHaveLength(GLOSSARY.length);
  });

  it('contains all 8 status-effect terms', () => {
    const required = ['Poison', 'Sleep', 'Silence', 'Berserk', 'Charm', 'Frozen', 'Blind', 'Stun'];
    for (const term of required) {
      expect(getGlossaryEntry(term)).not.toBeNull();
    }
  });

  it('contains all 9 stat terms', () => {
    const required = ['HP', 'Strength', 'Magic', 'Skill', 'Speed', 'Luck', 'Defense', 'Resistance', 'Movement'];
    for (const term of required) {
      expect(getGlossaryEntry(term)).not.toBeNull();
    }
  });

  it('contains all 5 victory condition terms', () => {
    const required = ['Rout', 'Boss Kill', 'Survive', 'Reach Location', 'Protect Target'];
    for (const term of required) {
      expect(getGlossaryEntry(term)).not.toBeNull();
    }
  });

  it('contains at least 12 class entries', () => {
    const classTerms = [
      'Warrior',
      'Knight',
      'Archer',
      'Mage',
      'Cleric',
      'Thief',
      'Berserker',
      'Paladin',
      'Assassin',
      'Sage',
      'General',
      'Dancer',
      'Sniper',
      'Ranger',
      'Dark Knight',
      'Bishop',
      'Valkyrie',
      'Trickster',
      'Great Knight',
    ];

    const count = classTerms.filter((term) => getGlossaryEntry(term) !== null).length;
    expect(count).toBeGreaterThanOrEqual(12);
  });
});
