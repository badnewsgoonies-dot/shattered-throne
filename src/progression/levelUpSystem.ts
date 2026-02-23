import { Unit, GrowthRates, LevelUpResult, Stats } from '../shared/types';

const STAT_KEYS: (keyof GrowthRates)[] = [
  'hp', 'strength', 'magic', 'skill', 'speed', 'luck', 'defense', 'resistance',
];

export function rollLevelUp(
  unit: Unit,
  growthRates: GrowthRates,
  classSkills?: { level: number; skillId: string }[],
  statCaps?: Record<string, number>,
): LevelUpResult {
  const newLevel = unit.level + 1;
  const statGains: Partial<Stats> = {};

  for (const key of STAT_KEYS) {
    const roll = Math.floor(Math.random() * 100);
    if (roll < growthRates[key]) {
      const newValue = unit.currentStats[key] + 1;
      const cap = statCaps ? statCaps[key] : undefined;
      if (cap === undefined || newValue <= cap) {
        statGains[key] = 1;
      }
    }
  }

  const newSkills: string[] = [];
  if (classSkills) {
    for (const s of classSkills) {
      if (s.level === newLevel && !unit.skills.includes(s.skillId)) {
        newSkills.push(s.skillId);
      }
    }
  }

  return {
    unitId: unit.id,
    newLevel,
    statGains,
    newSkills,
  };
}
