import {
  ClassDefinition,
  ExpGain,
  EXP_PER_LEVEL,
  GrowthRates,
  IDataProvider,
  IProgressionSystem,
  LevelUpResult,
  MAX_LEVEL,
  Unit,
  UnitClassName,
} from '../shared/types';
import {
  calculateLevelDifferenceMultiplier,
  getExpForNextLevel,
} from './expCalculator';
import {
  applyLevelUp,
  rollLevelUp,
} from './levelUpSystem';
import {
  canPromote,
  promote,
} from './promotionSystem';
import {
  getArenaOpponent,
  resolveArenaFight,
} from './arenaSystem';

export function createProgressionSystem(_data: IDataProvider): IProgressionSystem {
  return {
    awardExp(unit: Unit, gains: ExpGain[]): { unit: Unit; levelUp: LevelUpResult | null } {
      if (unit.level >= MAX_LEVEL) {
        return {
          unit: { ...unit, exp: 0 },
          levelUp: null,
        };
      }

      const totalGain = gains.reduce((sum, gain) => sum + gain.amount, 0);
      const totalExp = Math.max(0, unit.exp + totalGain);
      const possibleLevelUps = Math.floor(totalExp / EXP_PER_LEVEL);
      const remainingExp = totalExp % EXP_PER_LEVEL;
      const levelUpsAllowed = Math.max(0, MAX_LEVEL - unit.level);
      const levelUpsToApply = Math.min(possibleLevelUps, levelUpsAllowed);

      let updatedUnit: Unit = { ...unit, exp: totalExp };

      let lastLevelUp: LevelUpResult | null = null;

      for (let i = 0; i < levelUpsToApply; i += 1) {
        const levelResult = rollLevelUp(updatedUnit, updatedUnit.growthRates);
        lastLevelUp = levelResult;
        updatedUnit = applyLevelUp({ ...updatedUnit, exp: EXP_PER_LEVEL }, levelResult);
      }

      updatedUnit = {
        ...updatedUnit,
        exp: updatedUnit.level >= MAX_LEVEL ? 0 : remainingExp,
      };

      return {
        unit: updatedUnit,
        levelUp: lastLevelUp,
      };
    },

    rollLevelUp(unit: Unit, growthRates: GrowthRates): LevelUpResult {
      return rollLevelUp(unit, growthRates);
    },

    canPromote(unit: Unit, classDef: ClassDefinition): boolean {
      return canPromote(unit, classDef);
    },

    promote(unit: Unit, newClassName: UnitClassName, classDef: ClassDefinition) {
      return promote(unit, newClassName, classDef);
    },

    getExpForNextLevel,
    calculateLevelDifferenceMultiplier,
    getArenaOpponent,
    resolveArenaFight,
  };
}
