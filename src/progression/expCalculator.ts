import { EXP_PER_LEVEL } from '../shared/types';

export function getExpForNextLevel(currentExp: number): number {
  return EXP_PER_LEVEL - (currentExp % EXP_PER_LEVEL);
}

export function calculateLevelDifferenceMultiplier(attackerLevel: number, defenderLevel: number): number {
  if (defenderLevel > attackerLevel) {
    return Math.min(3.0, 1 + (defenderLevel - attackerLevel) * 0.1);
  }

  if (attackerLevel > defenderLevel) {
    return Math.max(0.1, 1 - (attackerLevel - defenderLevel) * 0.05);
  }

  return 1.0;
}
