import {
  Unit,
  ExpGain,
  LevelUpResult,
  GrowthRates,
  UnitClassName,
  ClassDefinition,
  PromotionResult,
  IProgressionSystem,
  IDataProvider,
} from '../shared/types';
import {
  awardExp as doAwardExp,
  getExpForNextLevel as doGetExpForNextLevel,
  calculateLevelDifferenceMultiplier as doCalcLevelDiff,
} from './expCalculator';
import { rollLevelUp as doRollLevelUp } from './levelUpSystem';
import {
  canPromote as doCanPromote,
  promote as doPromote,
} from './promotionSystem';
import { getArenaOpponent as doGetArenaOpponent, resolveArenaFight as doResolveArenaFight } from './arenaSystem';

export function createProgressionSystem(data: IDataProvider): IProgressionSystem {
  return {
    awardExp(unit: Unit, gains: ExpGain[]): { unit: Unit; levelUp: LevelUpResult | null } {
      const classDef = data.getClassDefinition(unit.className);
      return doAwardExp(unit, gains, classDef.skills, classDef.statCaps as unknown as Record<string, number>);
    },

    rollLevelUp(unit: Unit, growthRates: GrowthRates): LevelUpResult {
      const classDef = data.getClassDefinition(unit.className);
      return doRollLevelUp(unit, growthRates, classDef.skills, classDef.statCaps as unknown as Record<string, number>);
    },

    canPromote(unit: Unit, classDef: ClassDefinition): boolean {
      return doCanPromote(unit, classDef);
    },

    promote(unit: Unit, newClassName: UnitClassName, classDef: ClassDefinition): PromotionResult {
      const oldClassDef = data.getClassDefinition(unit.className);
      return doPromote(unit, newClassName, classDef, oldClassDef);
    },

    getExpForNextLevel(currentExp: number): number {
      return doGetExpForNextLevel(currentExp);
    },

    calculateLevelDifferenceMultiplier(attackerLevel: number, defenderLevel: number): number {
      return doCalcLevelDiff(attackerLevel, defenderLevel);
    },

    getArenaOpponent(playerUnit: Unit): Unit {
      return doGetArenaOpponent(playerUnit, data);
    },

    resolveArenaFight(playerUnit: Unit, opponent: Unit): { won: boolean; goldChange: number; expGained: number } {
      return doResolveArenaFight(playerUnit, opponent);
    },
  };
}
