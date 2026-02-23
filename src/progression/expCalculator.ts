import {
  Unit,
  ExpGain,
  LevelUpResult,
  GrowthRates,
  EXP_PER_LEVEL,
  MAX_LEVEL,
} from '../shared/types';
import { rollLevelUp } from './levelUpSystem';

export function awardExp(
  unit: Unit,
  gains: ExpGain[],
  classSkills?: { level: number; skillId: string }[],
  statCaps?: Record<string, number>,
): { unit: Unit; levelUp: LevelUpResult | null } {
  const totalExp = gains.reduce((sum, g) => sum + g.amount, 0);
  let updatedUnit = { ...unit, exp: unit.exp + totalExp };
  let lastLevelUp: LevelUpResult | null = null;

  while (updatedUnit.exp >= EXP_PER_LEVEL && updatedUnit.level < MAX_LEVEL) {
    updatedUnit = { ...updatedUnit, exp: updatedUnit.exp - EXP_PER_LEVEL };
    const levelUp = rollLevelUp(updatedUnit, updatedUnit.growthRates, classSkills, statCaps);
    updatedUnit = {
      ...updatedUnit,
      level: levelUp.newLevel,
      currentStats: applyStatGains(updatedUnit.currentStats, levelUp.statGains),
      maxHP: updatedUnit.maxHP + (levelUp.statGains.hp ?? 0),
      currentHP: updatedUnit.currentHP + (levelUp.statGains.hp ?? 0),
      skills: [...updatedUnit.skills, ...levelUp.newSkills],
    };
    lastLevelUp = levelUp;
  }

  if (updatedUnit.level >= MAX_LEVEL) {
    updatedUnit = { ...updatedUnit, exp: 0 };
  }

  return { unit: updatedUnit, levelUp: lastLevelUp };
}

function applyStatGains(
  stats: Unit['currentStats'],
  gains: Partial<Unit['currentStats']>,
): Unit['currentStats'] {
  return {
    hp: stats.hp + (gains.hp ?? 0),
    strength: stats.strength + (gains.strength ?? 0),
    magic: stats.magic + (gains.magic ?? 0),
    skill: stats.skill + (gains.skill ?? 0),
    speed: stats.speed + (gains.speed ?? 0),
    luck: stats.luck + (gains.luck ?? 0),
    defense: stats.defense + (gains.defense ?? 0),
    resistance: stats.resistance + (gains.resistance ?? 0),
    movement: stats.movement + (gains.movement ?? 0),
  };
}

export function getExpForNextLevel(currentExp: number): number {
  return EXP_PER_LEVEL - (currentExp % EXP_PER_LEVEL);
}

export function calculateLevelDifferenceMultiplier(
  attackerLevel: number,
  defenderLevel: number,
): number {
  if (defenderLevel > attackerLevel) {
    return Math.min(1 + (defenderLevel - attackerLevel) * 0.1, 3.0);
  }
  if (attackerLevel > defenderLevel) {
    return Math.max(1 - (attackerLevel - defenderLevel) * 0.05, 0.1);
  }
  return 1.0;
}
