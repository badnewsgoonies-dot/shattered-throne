import {
  Unit,
  UnitClassName,
  ClassDefinition,
  PromotionResult,
  Stats,
  PROMOTION_LEVEL,
} from '../shared/types';

export function canPromote(unit: Unit, classDef: ClassDefinition): boolean {
  return (
    unit.level >= PROMOTION_LEVEL &&
    classDef.promotionOptions.length > 0 &&
    !classDef.isPromoted
  );
}

export function promote(
  unit: Unit,
  newClassName: UnitClassName,
  newClassDef: ClassDefinition,
  oldClassDef: ClassDefinition,
): PromotionResult {
  const bonuses = oldClassDef.promotionBonuses;

  const statBonuses: Partial<Stats> = { ...bonuses };

  const newWeaponTypes = newClassDef.weaponTypes.filter(
    (wt) => !oldClassDef.weaponTypes.includes(wt),
  );

  const newSkills = newClassDef.skills
    .filter((s) => s.level <= 1)
    .map((s) => s.skillId)
    .filter((id) => !unit.skills.includes(id));

  return {
    unitId: unit.id,
    oldClass: unit.className,
    newClass: newClassName,
    statBonuses,
    newWeaponTypes,
    newSkills,
  };
}

export function applyPromotion(
  unit: Unit,
  result: PromotionResult,
  newClassDef: ClassDefinition,
): Unit {
  const stats = { ...unit.currentStats };
  for (const [key, val] of Object.entries(result.statBonuses)) {
    if (val !== undefined && key in stats) {
      (stats as Record<string, number>)[key] += val;
    }
  }

  return {
    ...unit,
    className: result.newClass,
    level: 1,
    exp: 0,
    currentStats: stats,
    maxHP: stats.hp,
    currentHP: Math.min(unit.currentHP + (result.statBonuses.hp ?? 0), stats.hp),
    skills: [...unit.skills, ...result.newSkills],
    movementType: newClassDef.movementType,
  };
}
