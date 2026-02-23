export interface AchievementDef {
  id: string;
  name: string;
  description: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_blood', name: 'First Blood', description: 'Defeat your first enemy' },
  { id: 'chapters_cleared_5', name: 'Adventurer', description: 'Clear 5 chapters' },
  { id: 'chapters_cleared_10', name: 'Veteran', description: 'Clear 10 chapters' },
  { id: 'chapters_cleared_25', name: 'Legend', description: 'Clear all 25 chapters' },
  { id: 'first_promotion', name: 'Class Change', description: 'Promote a unit for the first time' },
  { id: 'all_promotions', name: 'Master of Classes', description: 'Promote all recruitable units' },
  { id: 'boss_slayer_5', name: 'Boss Hunter', description: 'Defeat 5 boss enemies' },
  { id: 'boss_slayer_10', name: 'Boss Slayer', description: 'Defeat 10 boss enemies' },
  { id: 'gold_hoarder', name: 'Gold Hoarder', description: 'Accumulate 10000 gold' },
  { id: 'support_first', name: 'Bonds of War', description: 'Reach your first support rank' },
  { id: 'support_all_a', name: 'True Bonds', description: 'Reach A rank with all support pairs' },
  { id: 'arena_champion', name: 'Arena Champion', description: 'Win 10 arena battles' },
  { id: 'no_deaths', name: 'Perfect Commander', description: 'Complete a chapter with no unit deaths' },
  { id: 'speed_clear', name: 'Swift Victory', description: 'Clear a chapter in under 10 turns' },
  { id: 'max_level', name: 'Maximum Power', description: 'Reach level 30 with any unit' },
];

export function getAchievementList(): AchievementDef[] {
  return [...ACHIEVEMENTS];
}

export function checkAchievements(state: { completedChapters: string[]; achievements: string[] }): string[] {
  const newAchievements: string[] = [];

  if (state.completedChapters.length >= 5 && !state.achievements.includes('chapters_cleared_5')) {
    newAchievements.push('chapters_cleared_5');
  }

  if (state.completedChapters.length >= 10 && !state.achievements.includes('chapters_cleared_10')) {
    newAchievements.push('chapters_cleared_10');
  }

  if (state.completedChapters.length >= 25 && !state.achievements.includes('chapters_cleared_25')) {
    newAchievements.push('chapters_cleared_25');
  }

  return newAchievements;
}
