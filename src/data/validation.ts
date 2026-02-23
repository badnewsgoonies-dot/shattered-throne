import { IDataProvider, UnitClassName } from '../shared/types';

export function validateAllData(provider: IDataProvider): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate class skill references
  for (const cls of provider.getAllClasses()) {
    for (const s of cls.skills) {
      if (!provider.getSkill(s.skillId)) {
        errors.push(`Class "${cls.name}" references unknown skill "${s.skillId}"`);
      }
    }
    for (const promo of cls.promotionOptions) {
      const promoCls = provider.getClassDefinition(promo);
      if (!promoCls) {
        errors.push(`Class "${cls.name}" has unknown promotion option "${promo}"`);
      } else if (!promoCls.isPromoted) {
        errors.push(`Class "${cls.name}" promotion target "${promo}" is not a promoted class`);
      }
    }
  }

  // Validate character references
  for (const char of provider.getAllCharacters()) {
    try { provider.getClassDefinition(char.className); } catch {
      errors.push(`Character "${char.id}" references unknown class "${char.className}"`);
    }
    for (const equipId of char.startingEquipment) {
      if (!provider.getItem(equipId)) {
        errors.push(`Character "${char.id}" references unknown equipment "${equipId}"`);
      }
    }
    for (const skillId of char.personalSkills) {
      if (!provider.getSkill(skillId)) {
        errors.push(`Character "${char.id}" references unknown skill "${skillId}"`);
      }
    }
  }

  // Validate chapter references
  for (const ch of provider.getAllChapters()) {
    if (!provider.getMapData(ch.mapId)) {
      errors.push(`Chapter "${ch.id}" references unknown map "${ch.mapId}"`);
    }
    if (ch.nextChapterId) {
      if (!provider.getChapter(ch.nextChapterId)) {
        errors.push(`Chapter "${ch.id}" references unknown nextChapterId "${ch.nextChapterId}"`);
      }
    }
    for (const e of ch.enemies) {
      for (const equipId of e.equipment) {
        if (!provider.getItem(equipId)) {
          errors.push(`Chapter "${ch.id}" enemy "${e.characterId}" references unknown equipment "${equipId}"`);
        }
      }
    }
    for (const t of ch.treasures) {
      if (!provider.getItem(t.itemId)) {
        errors.push(`Chapter "${ch.id}" treasure references unknown item "${t.itemId}"`);
      }
    }
    for (const r of ch.rewards.itemRewards) {
      if (!provider.getItem(r)) {
        errors.push(`Chapter "${ch.id}" reward references unknown item "${r}"`);
      }
    }
    for (const r of ch.reinforcements) {
      for (const e of r.enemies) {
        for (const equipId of e.equipment) {
          if (!provider.getItem(equipId)) {
            errors.push(`Chapter "${ch.id}" reinforcement enemy references unknown equipment "${equipId}"`);
          }
        }
      }
    }
    for (const uc of ch.rewards.unlockedChapters) {
      if (!provider.getChapter(uc)) {
        errors.push(`Chapter "${ch.id}" unlocks unknown chapter "${uc}"`);
      }
    }
  }

  // Validate support conversations
  for (const sc of provider.getAllSupportConversations()) {
    if (!provider.getCharacter(sc.characterA)) {
      errors.push(`Support conversation references unknown character "${sc.characterA}"`);
    }
    if (!provider.getCharacter(sc.characterB)) {
      errors.push(`Support conversation references unknown character "${sc.characterB}"`);
    }
  }

  // Validate enemy templates
  for (const et of provider.getAllEnemyTemplates()) {
    for (const equipId of et.equipment) {
      if (!provider.getItem(equipId)) {
        errors.push(`Enemy template "${et.characterId}" references unknown equipment "${equipId}"`);
      }
    }
  }

  // Validate promotion items
  for (const pi of provider.getAllPromotionItems()) {
    for (const cls of pi.validClasses) {
      try { provider.getClassDefinition(cls); } catch {
        errors.push(`Promotion item "${pi.id}" references unknown class "${cls}"`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
