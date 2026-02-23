import { describe, expect, it } from 'vitest';
import { CHAPTERS } from '../chapters';
import { CLASS_DEFINITIONS } from '../classes';
import { CHARACTERS, getCharacterById } from '../characters';
import { CONSUMABLES } from '../consumables';
import { PARALOGUES } from '../paralogues';
import { PROMOTION_ITEMS } from '../promotionItems';
import { SKILLS } from '../skills';
import { WEAPONS } from '../weapons';
import { ARMOR } from '../armor';

describe('characters data', () => {
  const classSet = new Set(Object.keys(CLASS_DEFINITIONS));
  const skillSet = new Set(SKILLS.map((skill) => skill.id));
  const chapterSet = new Set([...CHAPTERS, ...PARALOGUES].map((chapter) => chapter.id));
  const characterSet = new Set(CHARACTERS.map((character) => character.id));
  const itemSet = new Set([
    ...WEAPONS.map((item) => item.id),
    ...ARMOR.map((item) => item.id),
    ...CONSUMABLES.map((item) => item.id),
    ...PROMOTION_ITEMS.map((item) => item.id),
  ]);

  it('has at least 40 characters', () => {
    expect(CHARACTERS.length).toBeGreaterThanOrEqual(40);
  });

  it('character IDs are unique', () => {
    const ids = CHARACTERS.map((character) => character.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has at least 20 player characters', () => {
    const playerCount = CHARACTERS.filter((entry) => !entry.id.startsWith('boss_') && !entry.id.startsWith('npc_')).length;
    expect(playerCount).toBeGreaterThanOrEqual(20);
  });

  it('has at least 10 boss characters', () => {
    const bossCount = CHARACTERS.filter((entry) => entry.id.startsWith('boss_')).length;
    expect(bossCount).toBeGreaterThanOrEqual(10);
  });

  it('has at least 5 NPC allies', () => {
    const npcCount = CHARACTERS.filter((entry) => entry.id.startsWith('npc_')).length;
    expect(npcCount).toBeGreaterThanOrEqual(5);
  });

  it('has at least one lord', () => {
    expect(CHARACTERS.some((character) => character.isLord)).toBe(true);
  });

  it('required named characters match spec anchors', () => {
    expect(getCharacterById('alaric')).toMatchObject({ className: 'warrior', baseLevel: 1, isLord: true, recruitChapter: 'ch_1' });
    expect(getCharacterById('elena')).toMatchObject({ className: 'cleric', baseLevel: 1, recruitChapter: 'ch_1' });
    expect(getCharacterById('marcus')).toMatchObject({ className: 'knight', baseLevel: 3, recruitChapter: 'ch_1' });
    expect(getCharacterById('lira')).toMatchObject({ className: 'archer', baseLevel: 2, recruitChapter: 'ch_2' });
    expect(getCharacterById('theron')).toMatchObject({ className: 'mage', baseLevel: 2, recruitChapter: 'ch_3' });
    expect(getCharacterById('kael')).toMatchObject({ className: 'thief', baseLevel: 4, recruitChapter: 'ch_4' });
    expect(getCharacterById('seraphina')).toMatchObject({ className: 'dancer', baseLevel: 5, recruitChapter: 'ch_6' });
  });

  it('all characters reference valid classes', () => {
    for (const character of CHARACTERS) {
      expect(classSet.has(character.className)).toBe(true);
    }
  });

  it('all characters reference valid personal skills', () => {
    for (const character of CHARACTERS) {
      for (const skillId of character.personalSkills) {
        expect(skillSet.has(skillId)).toBe(true);
      }
    }
  });

  it('all characters have valid starting equipment references', () => {
    for (const character of CHARACTERS) {
      for (const itemId of character.startingEquipment) {
        expect(itemSet.has(itemId)).toBe(true);
      }
    }
  });

  it('all recruit chapters are valid chapter IDs', () => {
    for (const character of CHARACTERS) {
      expect(chapterSet.has(character.recruitChapter)).toBe(true);
    }
  });

  it('all support partners reference existing characters', () => {
    for (const character of CHARACTERS) {
      for (const partnerId of character.supportPartners) {
        expect(characterSet.has(partnerId)).toBe(true);
      }
    }
  });

  it('backstories are at least two sentences', () => {
    for (const character of CHARACTERS) {
      const sentenceCount = character.backstory.split('.').filter((part) => part.trim().length > 0).length;
      expect(sentenceCount).toBeGreaterThanOrEqual(2);
    }
  });

  it('all characters have valid portrait colors', () => {
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    for (const character of CHARACTERS) {
      expect(hexColorRegex.test(character.portraitColor)).toBe(true);
    }
  });

  it('all characters include non-empty equipment and support arrays', () => {
    for (const character of CHARACTERS) {
      expect(character.startingEquipment.length).toBeGreaterThan(0);
      expect(Array.isArray(character.supportPartners)).toBe(true);
    }
  });

  it('getter returns null for unknown character', () => {
    expect(getCharacterById('missing_character')).toBeNull();
  });
});
