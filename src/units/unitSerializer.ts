import { Unit } from '../shared/types';

const REQUIRED_UNIT_FIELDS: (keyof Unit)[] = [
  'id',
  'name',
  'characterId',
  'className',
  'level',
  'exp',
  'currentStats',
  'maxHP',
  'currentHP',
  'currentSP',
  'maxSP',
  'growthRates',
  'inventory',
  'skills',
  'activeStatusEffects',
  'position',
  'hasMoved',
  'hasActed',
  'isAlive',
  'team',
  'supportRanks',
  'supportPoints',
  'killCount',
  'movementType',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hasRequiredFields(value: unknown): value is Unit {
  if (!isRecord(value)) {
    return false;
  }

  for (const field of REQUIRED_UNIT_FIELDS) {
    if (!(field in value)) {
      return false;
    }
  }

  if (!isRecord(value.currentStats) || !isRecord(value.growthRates) || !isRecord(value.inventory)) {
    return false;
  }

  if (!Array.isArray(value.inventory.items) || !Array.isArray(value.skills) || !Array.isArray(value.activeStatusEffects)) {
    return false;
  }

  return true;
}

export function serializeUnit(unit: Unit): string {
  return JSON.stringify(unit);
}

export function deserializeUnit(data: string): Unit {
  let parsed: unknown;

  try {
    parsed = JSON.parse(data);
  } catch {
    throw new Error('Invalid unit JSON data');
  }

  if (!hasRequiredFields(parsed)) {
    throw new Error('Invalid unit data: missing required fields');
  }

  return parsed;
}
