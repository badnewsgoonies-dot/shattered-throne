import { Unit, KILL_EXP_BONUS } from '../shared/types';

export function calculateExpGain(
  attacker: Unit,
  defender: Unit,
  damageDealt: number,
  killed: boolean,
): number {
  const baseExp = (defender.level - attacker.level + 10) * 3;

  let exp: number;

  if (killed) {
    exp = baseExp + KILL_EXP_BONUS;
  } else if (damageDealt > 0) {
    exp = Math.floor(baseExp * (damageDealt / defender.maxHP));
  } else {
    exp = 0;
  }

  // Clamp: minimum 1 EXP (if any action occurred), maximum 100 EXP
  if (damageDealt > 0 || killed) {
    exp = Math.max(1, Math.min(100, exp));
  } else {
    exp = Math.max(0, Math.min(100, exp));
  }

  return exp;
}
