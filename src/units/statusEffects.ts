import {
  ActiveStatusEffect,
  POISON_HP_PERCENT,
  StatusEffectType,
  Unit,
} from '../shared/types';

export function applyStatusEffect(unit: Unit, effect: ActiveStatusEffect): Unit {
  const existingIndex = unit.activeStatusEffects.findIndex((activeEffect) => activeEffect.type === effect.type);

  if (existingIndex === -1) {
    return {
      ...unit,
      activeStatusEffects: [...unit.activeStatusEffects, effect],
    };
  }

  const nextEffects = [...unit.activeStatusEffects];
  nextEffects[existingIndex] = effect;

  return {
    ...unit,
    activeStatusEffects: nextEffects,
  };
}

export function tickStatusEffects(unit: Unit): Unit {
  let currentHP = unit.currentHP;
  let hasMoved = unit.hasMoved;
  let hasActed = unit.hasActed;
  const nextActiveEffects: ActiveStatusEffect[] = [];

  for (const effect of unit.activeStatusEffects) {
    switch (effect.type) {
      case StatusEffectType.Poison: {
        if (currentHP > 1) {
          const poisonDamage = Math.max(1, Math.floor((unit.maxHP * POISON_HP_PERCENT) / 100));
          currentHP = Math.max(1, currentHP - poisonDamage);
        }
        break;
      }
      case StatusEffectType.Sleep:
        hasMoved = true;
        hasActed = true;
        break;
      case StatusEffectType.Silence:
        break;
      case StatusEffectType.Berserk:
        hasMoved = false;
        hasActed = false;
        break;
      case StatusEffectType.Charm:
        break;
      case StatusEffectType.Frozen:
        hasMoved = true;
        break;
      case StatusEffectType.Blind:
        break;
      case StatusEffectType.Stun:
        hasMoved = true;
        hasActed = true;
        break;
      default:
        break;
    }

    const remainingTurns = effect.remainingTurns - 1;

    if (remainingTurns > 0) {
      nextActiveEffects.push({ ...effect, remainingTurns });
    }
  }

  return {
    ...unit,
    currentHP,
    hasMoved,
    hasActed,
    activeStatusEffects: nextActiveEffects,
  };
}
