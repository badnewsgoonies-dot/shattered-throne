import { EXP_PER_LEVEL, GrowthRates, LevelUpResult, MAX_LEVEL, Stats, Unit } from '../shared/types';

const STAT_KEYS: (keyof GrowthRates)[] = [
  'hp',
  'strength',
  'magic',
  'skill',
  'speed',
  'luck',
  'defense',
  'resistance',
];

export function rollLevelUp(unit: Unit, growthRates: GrowthRates): LevelUpResult {
  if (unit.level >= MAX_LEVEL) {
    return {
      unitId: unit.id,
      newLevel: MAX_LEVEL,
      statGains: {},
      newSkills: [],
    };
  }

  const statGains: Partial<Stats> = {};

  for (const key of STAT_KEYS) {
    const roll = Math.random() * 100;
    if (roll < growthRates[key]) {
      statGains[key] = 1;
    }
  }

  return {
    unitId: unit.id,
    newLevel: Math.min(MAX_LEVEL, unit.level + 1),
    statGains,
    newSkills: [],
  };
}

function uniqueSkills(skills: string[]): string[] {
  return [...new Set(skills)];
}

export function applyLevelUp(unit: Unit, result: LevelUpResult): Unit {
  const nextLevel = Math.min(result.newLevel, MAX_LEVEL);

  const newStats: Stats = { ...unit.currentStats };
  for (const [key, value] of Object.entries(result.statGains)) {
    if (typeof value !== 'number') {
      continue;
    }

    const statKey = key as keyof Stats;
    if (statKey in newStats) {
      newStats[statKey] += value;
    }
  }

  const hpGain = typeof result.statGains.hp === 'number' ? result.statGains.hp : 0;
  const newMaxHP = newStats.hp;

  return {
    ...unit,
    level: nextLevel,
    exp: nextLevel >= MAX_LEVEL ? 0 : unit.exp % EXP_PER_LEVEL,
    currentStats: newStats,
    maxHP: newMaxHP,
    currentHP: Math.min(newMaxHP, unit.currentHP + hpGain),
    skills: result.newSkills.length > 0 ? uniqueSkills([...unit.skills, ...result.newSkills]) : unit.skills,
  };
}
