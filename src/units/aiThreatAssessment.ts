import {
  Unit,
  UnitClassName,
} from '../shared/types';

const HEALER_CLASSES = new Set<UnitClassName>([
  UnitClassName.Cleric,
  UnitClassName.Bishop,
  UnitClassName.Valkyrie,
]);

export function estimateDamage(attacker: Unit, target: Unit): number {
  return Math.max(0, attacker.currentStats.strength + 10 - target.currentStats.defense);
}

export function isKillable(attacker: Unit, target: Unit): boolean {
  return estimateDamage(attacker, target) >= target.currentHP;
}

function isLordOrHealer(target: Unit): boolean {
  const lowerName = target.name.toLowerCase();
  const lowerCharacterId = target.characterId.toLowerCase();

  const isLord = lowerName.includes('lord') || lowerCharacterId.includes('lord');
  const isHealerClass = HEALER_CLASSES.has(target.className);

  return isLord || isHealerClass;
}

export function getTargetScore(attacker: Unit, target: Unit): number {
  const damage = estimateDamage(attacker, target);
  const killMultiplier = isKillable(attacker, target) ? 2 : 1;
  const strategicMultiplier = isLordOrHealer(target) ? 2 : 1;

  return damage * killMultiplier * strategicMultiplier;
}

export function canSurviveCounter(attacker: Unit, target: Unit): boolean {
  const counterDamage = estimateDamage(target, attacker);

  return counterDamage < attacker.currentHP;
}
