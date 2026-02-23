import { CampaignState } from '../shared/types';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: (state: CampaignState) => boolean;
}

const achievements: Achievement[] = [
  {
    id: 'chapters_cleared_1',
    name: 'First Steps',
    description: 'Complete your first chapter.',
    condition: (s) => s.completedChapters.length >= 1,
  },
  {
    id: 'chapters_cleared_5',
    name: 'Veteran Commander',
    description: 'Complete 5 chapters.',
    condition: (s) => s.completedChapters.length >= 5,
  },
  {
    id: 'chapters_cleared_10',
    name: 'Legendary Tactician',
    description: 'Complete 10 chapters.',
    condition: (s) => s.completedChapters.length >= 10,
  },
  {
    id: 'first_promotion',
    name: 'Ascension',
    description: 'Promote a unit for the first time.',
    condition: (s) => s.roster.some((u) => u.level === 1 && u.className !== u.className), // checked externally
  },
  {
    id: 'gold_hoarder_1000',
    name: 'Gold Hoarder',
    description: 'Accumulate 1000 gold.',
    condition: (s) => s.gold >= 1000,
  },
  {
    id: 'gold_hoarder_5000',
    name: 'Dragon\'s Trove',
    description: 'Accumulate 5000 gold.',
    condition: (s) => s.gold >= 5000,
  },
  {
    id: 'roster_5',
    name: 'Band of Five',
    description: 'Have 5 units in your roster.',
    condition: (s) => s.roster.length >= 5,
  },
  {
    id: 'roster_10',
    name: 'Army Builder',
    description: 'Have 10 units in your roster.',
    condition: (s) => s.roster.length >= 10,
  },
  {
    id: 'boss_slayer_1',
    name: 'Boss Slayer',
    description: 'Defeat your first boss.',
    condition: (s) => s.roster.some((u) => u.killCount >= 1),
  },
  {
    id: 'boss_slayer_10',
    name: 'Boss Hunter',
    description: 'Accumulate 10 kills across all units.',
    condition: (s) => s.roster.reduce((sum, u) => sum + u.killCount, 0) >= 10,
  },
  {
    id: 'max_level',
    name: 'Peak Power',
    description: 'Reach level 30 with any unit.',
    condition: (s) => s.roster.some((u) => u.level >= 30),
  },
  {
    id: 'all_supports',
    name: 'Bonds of Friendship',
    description: 'Earn at least 10 support ranks.',
    condition: (s) => Object.keys(s.supportLog).length >= 10,
  },
  {
    id: 'full_party',
    name: 'Full House',
    description: 'Have a full roster of 12 units.',
    condition: (s) => s.roster.length >= 12,
  },
  {
    id: 'rich_rewards',
    name: 'Rich Rewards',
    description: 'Accumulate 10000 gold.',
    condition: (s) => s.gold >= 10000,
  },
  {
    id: 'playtime_veteran',
    name: 'Dedicated Strategist',
    description: 'Play for over 3600 seconds.',
    condition: (s) => s.playtimeSeconds >= 3600,
  },
  {
    id: 'convoy_collector',
    name: 'Convoy Collector',
    description: 'Have 20 items in the convoy.',
    condition: (s) => s.convoy.length >= 20,
  },
];

export function checkAchievements(
  state: CampaignState,
  alreadyEarned: string[] = [],
): string[] {
  const newlyEarned: string[] = [];
  for (const achievement of achievements) {
    if (!alreadyEarned.includes(achievement.id) && achievement.condition(state)) {
      newlyEarned.push(achievement.id);
    }
  }
  return newlyEarned;
}

export function getAchievementList(): { id: string; name: string; description: string }[] {
  return achievements.map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
  }));
}

export function getAchievementById(id: string): Achievement | undefined {
  return achievements.find((a) => a.id === id);
}
