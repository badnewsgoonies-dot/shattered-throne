import { describe, expect, it } from 'vitest';
import { UnitClassName } from '../../shared/types';
import { CHAPTERS } from '../chapters';
import { CLASS_DEFINITIONS } from '../classes';
import { CHARACTERS } from '../characters';
import { ENEMY_TEMPLATES } from '../enemyTemplates';
import { PARALOGUES } from '../paralogues';
import { SUPPORT_CONVERSATIONS } from '../supportConversations';
import { validateAllData } from '../validation';
import { WEAPONS } from '../weapons';

describe.sequential('validateAllData', () => {
  it('passes on shipped data', () => {
    const result = validateAllData();
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('catches invalid class skill references', () => {
    const original = [...CLASS_DEFINITIONS[UnitClassName.Warrior].skills];
    CLASS_DEFINITIONS[UnitClassName.Warrior].skills.push({ level: 99, skillId: 'missing_skill' });

    try {
      const result = validateAllData();
      expect(result.valid).toBe(false);
      expect(result.errors.some((error) => error.includes('missing skill missing_skill'))).toBe(true);
    } finally {
      CLASS_DEFINITIONS[UnitClassName.Warrior].skills = original;
    }
  });

  it('catches invalid character equipment references', () => {
    const original = [...CHARACTERS[0].startingEquipment];
    CHARACTERS[0].startingEquipment.push('missing_equipment');

    try {
      const result = validateAllData();
      expect(result.valid).toBe(false);
      expect(result.errors.some((error) => error.includes('missing equipment missing_equipment'))).toBe(true);
    } finally {
      CHARACTERS[0].startingEquipment = original;
    }
  });

  it('catches invalid chapter map references', () => {
    const original = CHAPTERS[0].mapId;
    CHAPTERS[0].mapId = 'missing_map';

    try {
      const result = validateAllData();
      expect(result.valid).toBe(false);
      expect(result.errors.some((error) => error.includes('references missing map missing_map'))).toBe(true);
    } finally {
      CHAPTERS[0].mapId = original;
    }
  });

  it('catches invalid nextChapterId references', () => {
    const original = CHAPTERS[0].nextChapterId;
    CHAPTERS[0].nextChapterId = 'missing_next';

    try {
      const result = validateAllData();
      expect(result.valid).toBe(false);
      expect(result.errors.some((error) => error.includes('invalid nextChapterId missing_next'))).toBe(true);
    } finally {
      CHAPTERS[0].nextChapterId = original;
    }
  });

  it('catches invalid enemy character IDs in chapters', () => {
    const original = CHAPTERS[0].enemies[0].characterId;
    CHAPTERS[0].enemies[0].characterId = 'missing_enemy_id';

    try {
      const result = validateAllData();
      expect(result.valid).toBe(false);
      expect(result.errors.some((error) => error.includes('unknown characterId missing_enemy_id'))).toBe(true);
    } finally {
      CHAPTERS[0].enemies[0].characterId = original;
    }
  });

  it('catches invalid promotion path targets', () => {
    const original = [...CLASS_DEFINITIONS[UnitClassName.Warrior].promotionOptions];
    CLASS_DEFINITIONS[UnitClassName.Warrior].promotionOptions = [UnitClassName.Warrior];

    try {
      const result = validateAllData();
      expect(result.valid).toBe(false);
      expect(result.errors.some((error) => error.includes('promotes to non-promoted class'))).toBe(true);
    } finally {
      CLASS_DEFINITIONS[UnitClassName.Warrior].promotionOptions = original;
    }
  });

  it('catches invalid support conversation character references', () => {
    const original = SUPPORT_CONVERSATIONS[0].characterA;
    SUPPORT_CONVERSATIONS[0].characterA = 'missing_character';

    try {
      const result = validateAllData();
      expect(result.valid).toBe(false);
      expect(result.errors.some((error) => error.includes('invalid characterA missing_character'))).toBe(true);
    } finally {
      SUPPORT_CONVERSATIONS[0].characterA = original;
    }
  });

  it('catches duplicate item IDs', () => {
    WEAPONS.push({ ...WEAPONS[0] });

    try {
      const result = validateAllData();
      expect(result.valid).toBe(false);
      expect(result.errors.some((error) => error.includes('Duplicate item IDs'))).toBe(true);
    } finally {
      WEAPONS.pop();
    }
  });

  it('catches invalid treasure item references', () => {
    const original = CHAPTERS[0].treasures[0]?.itemId;
    CHAPTERS[0].treasures[0].itemId = 'missing_treasure';

    try {
      const result = validateAllData();
      expect(result.valid).toBe(false);
      expect(result.errors.some((error) => error.includes('invalid treasure item missing_treasure'))).toBe(true);
    } finally {
      if (original) {
        CHAPTERS[0].treasures[0].itemId = original;
      }
    }
  });

  it('catches invalid enemy template classes', () => {
    const original = ENEMY_TEMPLATES[0].className;
    ENEMY_TEMPLATES[0].className = 'invalidClass' as UnitClassName;

    try {
      const result = validateAllData();
      expect(result.valid).toBe(false);
      expect(result.errors.some((error) => error.includes('Enemy template enemy_bandit_01 has invalid class'))).toBe(true);
    } finally {
      ENEMY_TEMPLATES[0].className = original;
    }
  });

  it('catches invalid chapter unlock references in rewards', () => {
    CHAPTERS[1].rewards.unlockedChapters.push('unknown_chapter');

    try {
      const result = validateAllData();
      expect(result.valid).toBe(false);
      expect(result.errors.some((error) => error.includes('unlock invalid chapter unknown_chapter'))).toBe(true);
    } finally {
      CHAPTERS[1].rewards.unlockedChapters.pop();
    }
  });

  it('catches invalid character recruit chapters', () => {
    const original = CHARACTERS[0].recruitChapter;
    CHARACTERS[0].recruitChapter = 'missing_recruit_chapter';

    try {
      const result = validateAllData();
      expect(result.valid).toBe(false);
      expect(result.errors.some((error) => error.includes('invalid recruitChapter missing_recruit_chapter'))).toBe(true);
    } finally {
      CHARACTERS[0].recruitChapter = original;
    }
  });

  it('catches invalid protected unit references', () => {
    const original = CHAPTERS[2].defeatConditions[1].protectedUnitId;
    CHAPTERS[2].defeatConditions[1].protectedUnitId = 'not_present_here';

    try {
      const result = validateAllData();
      expect(result.valid).toBe(false);
      expect(result.errors.some((error) => error.includes('protected unit not_present_here'))).toBe(true);
    } finally {
      CHAPTERS[2].defeatConditions[1].protectedUnitId = original;
    }
  });

  it('supports validation over story + paralogue chapter IDs', () => {
    const allIds = new Set([...CHAPTERS.map((chapter) => chapter.id), ...PARALOGUES.map((chapter) => chapter.id)]);
    expect(allIds.has('ch_1')).toBe(true);
    expect(allIds.has('px_1')).toBe(true);
  });
});
