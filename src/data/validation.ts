import {
  DefeatCondition,
  EnemyPlacement,
  UnitClassName,
} from '../shared/types';
import { ARMOR } from './armor';
import { CHAPTERS } from './chapters';
import { CLASS_DEFINITIONS } from './classes';
import { CHARACTERS } from './characters';
import { CONSUMABLES } from './consumables';
import { ENEMY_TEMPLATES } from './enemyTemplates';
import { MAP_LAYOUTS } from './mapLayouts';
import { PARALOGUES } from './paralogues';
import { PROMOTION_ITEMS } from './promotionItems';
import { SKILLS } from './skills';
import { SUPPORT_CONVERSATIONS } from './supportConversations';
import { WEAPONS } from './weapons';

function hasUniqueIds(ids: string[]): { unique: boolean; duplicates: string[] } {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const id of ids) {
    if (seen.has(id)) {
      duplicates.add(id);
    } else {
      seen.add(id);
    }
  }

  return { unique: duplicates.size === 0, duplicates: [...duplicates] };
}

export function validateAllData(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const allItems = [...WEAPONS, ...ARMOR, ...CONSUMABLES, ...PROMOTION_ITEMS];
  const itemIdSet = new Set(allItems.map((item) => item.id));
  const weaponIdSet = new Set(WEAPONS.map((item) => item.id));
  const skillIdSet = new Set(SKILLS.map((skill) => skill.id));
  const classEntries = Object.values(CLASS_DEFINITIONS);
  const classIdSet = new Set(classEntries.map((entry) => entry.name));
  const promotedClassSet = new Set(classEntries.filter((entry) => entry.isPromoted).map((entry) => entry.name));

  const characterIdSet = new Set(CHARACTERS.map((character) => character.id));
  const chapterIdSet = new Set(CHAPTERS.map((chapter) => chapter.id));
  const paralogueIdSet = new Set(PARALOGUES.map((chapter) => chapter.id));
  const chapterLikeIdSet = new Set([...chapterIdSet, ...paralogueIdSet]);
  const mapIdSet = new Set(MAP_LAYOUTS.map((map) => map.id));
  const enemyTemplateIdSet = new Set(ENEMY_TEMPLATES.map((entry) => entry.characterId));

  // Duplicate ID checks
  const itemUnique = hasUniqueIds(allItems.map((item) => item.id));
  if (!itemUnique.unique) {
    errors.push(`Duplicate item IDs: ${itemUnique.duplicates.join(', ')}`);
  }

  const characterUnique = hasUniqueIds(CHARACTERS.map((character) => character.id));
  if (!characterUnique.unique) {
    errors.push(`Duplicate character IDs: ${characterUnique.duplicates.join(', ')}`);
  }

  const mapUnique = hasUniqueIds(MAP_LAYOUTS.map((map) => map.id));
  if (!mapUnique.unique) {
    errors.push(`Duplicate map IDs: ${mapUnique.duplicates.join(', ')}`);
  }

  // Class checks
  for (const classDef of classEntries) {
    for (const skill of classDef.skills) {
      if (!skillIdSet.has(skill.skillId)) {
        errors.push(`Class ${classDef.name} references missing skill ${skill.skillId}`);
      }
    }

    for (const promotionOption of classDef.promotionOptions) {
      if (!classIdSet.has(promotionOption)) {
        errors.push(`Class ${classDef.name} has invalid promotion target ${promotionOption}`);
      } else if (!promotedClassSet.has(promotionOption)) {
        errors.push(`Class ${classDef.name} promotes to non-promoted class ${promotionOption}`);
      }
    }

    if (classDef.isPromoted && classDef.promotionOptions.length > 0) {
      errors.push(`Promoted class ${classDef.name} should not have promotion options`);
    }
  }

  // Skill checks
  const skillUnique = hasUniqueIds(SKILLS.map((skill) => skill.id));
  if (!skillUnique.unique) {
    errors.push(`Duplicate skill IDs: ${skillUnique.duplicates.join(', ')}`);
  }

  // Character checks
  for (const character of CHARACTERS) {
    if (!classIdSet.has(character.className)) {
      errors.push(`Character ${character.id} has invalid class ${character.className}`);
    }

    for (const skillId of character.personalSkills) {
      if (!skillIdSet.has(skillId)) {
        errors.push(`Character ${character.id} references missing skill ${skillId}`);
      }
    }

    for (const itemId of character.startingEquipment) {
      if (!itemIdSet.has(itemId)) {
        errors.push(`Character ${character.id} references missing equipment ${itemId}`);
      }
    }

    if (!chapterLikeIdSet.has(character.recruitChapter)) {
      errors.push(`Character ${character.id} has invalid recruitChapter ${character.recruitChapter}`);
    }

    for (const partnerId of character.supportPartners) {
      if (!characterIdSet.has(partnerId)) {
        errors.push(`Character ${character.id} references missing support partner ${partnerId}`);
      }
    }
  }

  // Support conversation checks
  for (const support of SUPPORT_CONVERSATIONS) {
    if (!characterIdSet.has(support.characterA)) {
      errors.push(`Support conversation has invalid characterA ${support.characterA}`);
    }
    if (!characterIdSet.has(support.characterB)) {
      errors.push(`Support conversation has invalid characterB ${support.characterB}`);
    }
    if (support.dialogue.length < 1) {
      errors.push(`Support conversation ${support.characterA}/${support.characterB}/${support.rank} has no dialogue`);
    }
  }

  // Map checks
  for (const map of MAP_LAYOUTS) {
    if (map.tiles.length !== map.height) {
      errors.push(`Map ${map.id} has tile row count ${map.tiles.length} but height ${map.height}`);
      continue;
    }

    for (const [y, row] of map.tiles.entries()) {
      if (row.length !== map.width) {
        errors.push(`Map ${map.id} row ${y} has width ${row.length} but expected ${map.width}`);
      }

      for (const [x, tile] of row.entries()) {
        if (tile.position.x !== x || tile.position.y !== y) {
          errors.push(`Map ${map.id} tile position mismatch at grid ${x},${y}`);
        }
      }
    }

    for (const zone of map.deploymentZones) {
      if (zone.x < 0 || zone.y < 0 || zone.x >= map.width || zone.y >= map.height) {
        errors.push(`Map ${map.id} has out-of-bounds deployment zone (${zone.x},${zone.y})`);
      }
    }
  }

  // Enemy template checks
  const templateUnique = hasUniqueIds(ENEMY_TEMPLATES.map((template) => template.characterId));
  if (!templateUnique.unique) {
    errors.push(`Duplicate enemy template IDs: ${templateUnique.duplicates.join(', ')}`);
  }

  for (const template of ENEMY_TEMPLATES) {
    if (!classIdSet.has(template.className)) {
      errors.push(`Enemy template ${template.characterId} has invalid class ${template.className}`);
    }

    for (const itemId of template.equipment) {
      if (!weaponIdSet.has(itemId) && !itemIdSet.has(itemId)) {
        errors.push(`Enemy template ${template.characterId} has invalid equipment ${itemId}`);
      }
    }

    if (template.dropItemId && !itemIdSet.has(template.dropItemId)) {
      errors.push(`Enemy template ${template.characterId} drops missing item ${template.dropItemId}`);
    }
  }

  const allChapterData = [...CHAPTERS, ...PARALOGUES];

  for (const chapter of allChapterData) {
    if (!mapIdSet.has(chapter.mapId)) {
      errors.push(`Chapter ${chapter.id} references missing map ${chapter.mapId}`);
    }

    if (chapter.nextChapterId && !chapterLikeIdSet.has(chapter.nextChapterId)) {
      errors.push(`Chapter ${chapter.id} has invalid nextChapterId ${chapter.nextChapterId}`);
    }

    for (const unlocked of chapter.rewards.unlockedChapters) {
      if (!chapterLikeIdSet.has(unlocked)) {
        errors.push(`Chapter ${chapter.id} rewards unlock invalid chapter ${unlocked}`);
      }
    }

    for (const rewardItem of chapter.rewards.itemRewards) {
      if (!itemIdSet.has(rewardItem)) {
        errors.push(`Chapter ${chapter.id} has invalid reward item ${rewardItem}`);
      }
    }

    for (const treasure of chapter.treasures) {
      if (!itemIdSet.has(treasure.itemId)) {
        errors.push(`Chapter ${chapter.id} has invalid treasure item ${treasure.itemId}`);
      }
    }

    const chapterUnitIds = new Set<string>();

    const checkEnemyEntry = (entry: EnemyPlacement, source: string): void => {
      chapterUnitIds.add(entry.characterId);

      const knownCharacter = characterIdSet.has(entry.characterId);
      const knownTemplate = enemyTemplateIdSet.has(entry.characterId);
      if (!knownCharacter && !knownTemplate) {
        errors.push(`Chapter ${chapter.id} ${source} has unknown characterId ${entry.characterId}`);
      }

      if (!classIdSet.has(entry.className)) {
        errors.push(`Chapter ${chapter.id} ${source} has invalid class ${entry.className}`);
      }

      for (const itemId of entry.equipment) {
        if (!itemIdSet.has(itemId)) {
          errors.push(`Chapter ${chapter.id} ${source} has invalid equipment ${itemId}`);
        }
      }

      if (entry.dropItemId && !itemIdSet.has(entry.dropItemId)) {
        errors.push(`Chapter ${chapter.id} ${source} has invalid drop item ${entry.dropItemId}`);
      }
    };

    for (const entry of chapter.enemies) {
      checkEnemyEntry(entry, 'enemy');
    }

    for (const entry of chapter.allies) {
      checkEnemyEntry(entry, 'ally');
    }

    for (const trigger of chapter.reinforcements) {
      for (const entry of trigger.enemies) {
        checkEnemyEntry(entry, 'reinforcement');
      }
    }

    for (const vCondition of chapter.victoryConditions) {
      if (vCondition.type === 'bossKill' && vCondition.targetUnitId && !chapterUnitIds.has(vCondition.targetUnitId)) {
        errors.push(`Chapter ${chapter.id} bossKill target ${vCondition.targetUnitId} does not exist in chapter units`);
      }
      if (vCondition.type === 'reachLocation' && vCondition.targetPosition) {
        if (vCondition.targetPosition.x < 0 || vCondition.targetPosition.y < 0) {
          errors.push(`Chapter ${chapter.id} has negative reachLocation target`);
        }
      }
    }

    for (const dCondition of chapter.defeatConditions) {
      if (dCondition.type === DefeatCondition.ProtectedUnitDies && dCondition.protectedUnitId) {
        if (!chapterUnitIds.has(dCondition.protectedUnitId)) {
          errors.push(`Chapter ${chapter.id} protected unit ${dCondition.protectedUnitId} is not present in chapter units`);
        }
      }
    }
  }

  // Promotion item valid classes
  for (const item of PROMOTION_ITEMS) {
    for (const validClass of item.validClasses) {
      if (!classIdSet.has(validClass)) {
        errors.push(`Promotion item ${item.id} has invalid class ${validClass}`);
      }
      const classDef = CLASS_DEFINITIONS[validClass as UnitClassName];
      if (classDef && classDef.isPromoted) {
        errors.push(`Promotion item ${item.id} includes promoted class ${validClass}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
