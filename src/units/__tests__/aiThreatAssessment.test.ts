import { describe, expect, it } from 'vitest';
import { UnitClassName } from '../../shared/types';
import {
  canSurviveCounter,
  estimateDamage,
  getTargetScore,
  isKillable,
} from '../aiThreatAssessment';
import { makeUnit } from './testUtils';

describe('aiThreatAssessment', () => {
  it('estimateDamage uses strength + 10 - target defense', () => {
    const attacker = makeUnit({ currentStats: { strength: 14 } });
    const target = makeUnit({ currentStats: { defense: 8 } });

    expect(estimateDamage(attacker, target)).toBe(16);
  });

  it('estimateDamage is floored at zero when defense is too high', () => {
    const attacker = makeUnit({ currentStats: { strength: 3 } });
    const target = makeUnit({ currentStats: { defense: 20 } });

    expect(estimateDamage(attacker, target)).toBe(0);
  });

  it('isKillable returns true when estimated damage meets current HP', () => {
    const attacker = makeUnit({ currentStats: { strength: 10 } });
    const target = makeUnit({ currentStats: { defense: 5 }, currentHP: 15 });

    expect(isKillable(attacker, target)).toBe(true);
  });

  it('isKillable returns false when estimated damage is below current HP', () => {
    const attacker = makeUnit({ currentStats: { strength: 10 } });
    const target = makeUnit({ currentStats: { defense: 5 }, currentHP: 20 });

    expect(isKillable(attacker, target)).toBe(false);
  });

  it('getTargetScore doubles score for killable targets', () => {
    const attacker = makeUnit({ currentStats: { strength: 12 } });
    const target = makeUnit({ currentStats: { defense: 5 }, currentHP: 5 });

    expect(getTargetScore(attacker, target)).toBe(34);
  });

  it('getTargetScore doubles strategic score for lord targets', () => {
    const attacker = makeUnit({ currentStats: { strength: 10 } });
    const target = makeUnit({ name: 'Young Lord', characterId: 'hero_lord', currentStats: { defense: 5 }, currentHP: 50 });

    expect(getTargetScore(attacker, target)).toBe(30);
  });

  it('getTargetScore doubles strategic score for healer classes', () => {
    const attacker = makeUnit({ currentStats: { strength: 9 } });
    const healerTarget = makeUnit({ className: UnitClassName.Cleric, currentStats: { defense: 4 }, currentHP: 40 });

    expect(getTargetScore(attacker, healerTarget)).toBe(30);
  });

  it('canSurviveCounter checks attacker HP against target counter estimate', () => {
    const attacker = makeUnit({ currentHP: 20, currentStats: { defense: 5 } });
    const target = makeUnit({ currentStats: { strength: 12 } });

    expect(canSurviveCounter(attacker, target)).toBe(true);
    const fragileAttacker = makeUnit({ currentHP: 10, currentStats: { defense: 5 } });
    expect(canSurviveCounter(fragileAttacker, target)).toBe(false);
  });

  it('canSurviveCounter returns false when counter damage equals current HP', () => {
    const attacker = makeUnit({ currentHP: 12, currentStats: { defense: 8 } });
    const target = makeUnit({ currentStats: { strength: 10 } });

    expect(canSurviveCounter(attacker, target)).toBe(false);
  });

  it('getTargetScore does not stack lord and healer multipliers beyond 2x strategic', () => {
    const attacker = makeUnit({ currentStats: { strength: 11 } });
    const target = makeUnit({
      name: 'Saint Lord',
      characterId: 'saint_lord',
      className: UnitClassName.Cleric,
      currentStats: { defense: 6 },
      currentHP: 60,
    });

    expect(getTargetScore(attacker, target)).toBe(30);
  });
});
