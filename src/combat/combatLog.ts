import { CombatLogEntry, TurnPhase } from '../shared/types';

export function createLogEntry(turnNumber: number, phase: TurnPhase, message: string): CombatLogEntry {
  return { turnNumber, phase, message, timestamp: Date.now() };
}

export function formatAttackLog(
  attackerName: string,
  defenderName: string,
  damage: number,
  hit: boolean,
  crit: boolean,
): string {
  if (!hit) {
    return `${attackerName} attacks ${defenderName} but misses!`;
  }

  if (crit) {
    return `${attackerName} lands a critical hit on ${defenderName} for ${damage} damage!`;
  }

  return `${attackerName} attacks ${defenderName} for ${damage} damage.`;
}
