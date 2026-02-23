import { KILL_EXP_BONUS, Unit } from '../shared/types';

function clampExp(value: number): number {
  return Math.max(1, Math.min(100, value));
}

export function calculateExpGain(
  attacker: Unit,
  defender: Unit,
  damageDealt: number,
  killed: boolean,
): number {
  const baseExp = (defender.level - attacker.level + 10) * 3;

  let exp = baseExp;
  if (killed) {
    exp = baseExp + KILL_EXP_BONUS;
  } else if (damageDealt > 0 && defender.maxHP > 0) {
    exp = baseExp * (damageDealt / defender.maxHP);
  }

  return clampExp(Math.round(exp));
}
