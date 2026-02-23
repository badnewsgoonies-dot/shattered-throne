import { CombatLogEntry, TurnPhase } from '../shared/types';

export function createLogEntry(
  turnNumber: number,
  phase: TurnPhase,
  message: string,
): CombatLogEntry {
  return {
    turnNumber,
    phase,
    message,
    timestamp: Date.now(),
  };
}

export function logAttack(
  turnNumber: number,
  phase: TurnPhase,
  attackerName: string,
  defenderName: string,
  damage: number,
): CombatLogEntry {
  return createLogEntry(
    turnNumber,
    phase,
    `${attackerName} attacks ${defenderName} for ${damage} damage`,
  );
}

export function logMiss(
  turnNumber: number,
  phase: TurnPhase,
  attackerName: string,
  defenderName: string,
): CombatLogEntry {
  return createLogEntry(
    turnNumber,
    phase,
    `${attackerName} misses ${defenderName}`,
  );
}

export function logCritical(
  turnNumber: number,
  phase: TurnPhase,
  attackerName: string,
  defenderName: string,
  damage: number,
): CombatLogEntry {
  return createLogEntry(
    turnNumber,
    phase,
    `${attackerName} lands a critical hit on ${defenderName} for ${damage} damage`,
  );
}

export function logHeal(
  turnNumber: number,
  phase: TurnPhase,
  healerName: string,
  targetName: string,
  amount: number,
): CombatLogEntry {
  return createLogEntry(
    turnNumber,
    phase,
    `${healerName} heals ${targetName} for ${amount} HP`,
  );
}

export function logDefeat(
  turnNumber: number,
  phase: TurnPhase,
  unitName: string,
): CombatLogEntry {
  return createLogEntry(
    turnNumber,
    phase,
    `${unitName} is defeated`,
  );
}

export function logSkillUse(
  turnNumber: number,
  phase: TurnPhase,
  userName: string,
  skillName: string,
): CombatLogEntry {
  return createLogEntry(
    turnNumber,
    phase,
    `${userName} uses ${skillName}`,
  );
}
