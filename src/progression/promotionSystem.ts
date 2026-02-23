import {
  ClassDefinition,
  PROMOTION_LEVEL,
  PromotionResult,
  Stats,
  Unit,
  UnitClassName,
} from '../shared/types';

export function canPromote(unit: Unit, classDef: ClassDefinition): boolean {
  return unit.level >= PROMOTION_LEVEL && classDef.promotionOptions.length > 0 && !classDef.isPromoted;
}

export function promote(unit: Unit, newClassName: UnitClassName, newClassDef: ClassDefinition): PromotionResult {
  const statBonuses = { ...newClassDef.promotionBonuses };
  const newWeaponTypes = [...newClassDef.weaponTypes];
  const newSkills = newClassDef.skills
    .filter((skill) => skill.level <= 1)
    .map((skill) => skill.skillId);

  return {
    unitId: unit.id,
    oldClass: unit.className,
    newClass: newClassName,
    statBonuses: statBonuses as Partial<Stats>,
    newWeaponTypes,
    newSkills,
  };
}

function uniqueSkills(skills: string[]): string[] {
  return [...new Set(skills)];
}

export function applyPromotion(unit: Unit, result: PromotionResult, newClassDef: ClassDefinition): Unit {
  const newStats: Stats = { ...unit.currentStats };

  for (const [key, value] of Object.entries(result.statBonuses)) {
    if (typeof value !== 'number') {
      continue;
    }

    const statKey = key as keyof Stats;
    if (statKey in newStats) {
      newStats[statKey] += value;
    }
  }

  const hpBonus = typeof result.statBonuses.hp === 'number' ? result.statBonuses.hp : 0;

  return {
    ...unit,
    className: result.newClass,
    level: 1,
    exp: 0,
    currentStats: newStats,
    maxHP: newStats.hp,
    currentHP: Math.min(unit.currentHP + hpBonus, newStats.hp),
    movementType: newClassDef.movementType,
    skills: uniqueSkills([...unit.skills, ...result.newSkills]),
  };
}
