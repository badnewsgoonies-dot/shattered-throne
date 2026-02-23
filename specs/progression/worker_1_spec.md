# Progression & Economy — Full Domain Implementation

You are implementing the Progression domain for Shattered Throne, a tactical RPG.

## CRITICAL RULES
- ONLY create/modify files under `src/progression/`
- Import types ONLY from `../../shared/types`
- Do NOT import from any other domain
- The file `src/shared/types.ts` already exists — do NOT modify it

## Files to Create

### 1. `src/progression/expCalculator.ts`

```typescript
import { Unit, ExpGain, LevelUpResult, EXP_PER_LEVEL, MAX_LEVEL } from '../../shared/types';

export function getExpForNextLevel(currentExp: number): number {
  return EXP_PER_LEVEL - (currentExp % EXP_PER_LEVEL);
}

export function calculateLevelDifferenceMultiplier(attackerLevel: number, defenderLevel: number): number {
  if (defenderLevel > attackerLevel) {
    return Math.min(3.0, 1 + (defenderLevel - attackerLevel) * 0.1);
  } else if (attackerLevel > defenderLevel) {
    return Math.max(0.1, 1 - (attackerLevel - defenderLevel) * 0.05);
  }
  return 1.0;
}
```

### 2. `src/progression/levelUpSystem.ts`

```typescript
import { Unit, GrowthRates, LevelUpResult, Stats, MAX_LEVEL } from '../../shared/types';

export function rollLevelUp(unit: Unit, growthRates: GrowthRates): LevelUpResult {
  const statGains: Partial<Stats> = {};
  const statKeys: (keyof GrowthRates)[] = ['hp', 'strength', 'magic', 'skill', 'speed', 'luck', 'defense', 'resistance'];

  for (const key of statKeys) {
    const roll = Math.random() * 100;
    if (roll < growthRates[key]) {
      statGains[key] = 1;
    }
  }

  // Check for new skills at new level (would need class data, but we don't have it here)
  // Return empty newSkills — caller can check
  return {
    unitId: unit.id,
    newLevel: unit.level + 1,
    statGains,
    newSkills: [],
  };
}

export function applyLevelUp(unit: Unit, result: LevelUpResult): Unit {
  const newStats = { ...unit.currentStats };
  for (const [key, value] of Object.entries(result.statGains)) {
    if (key in newStats && typeof value === 'number') {
      (newStats as any)[key] += value;
    }
  }

  const newMaxHP = newStats.hp;
  return {
    ...unit,
    level: result.newLevel,
    exp: unit.exp % EXP_PER_LEVEL,
    currentStats: newStats,
    maxHP: newMaxHP,
    currentHP: unit.currentHP + (result.statGains.hp ?? 0), // Heal by HP gained
  };
}
```

### 3. `src/progression/promotionSystem.ts`

```typescript
import { Unit, ClassDefinition, UnitClassName, PromotionResult, WeaponType, PROMOTION_LEVEL } from '../../shared/types';

export function canPromote(unit: Unit, classDef: ClassDefinition): boolean {
  return unit.level >= PROMOTION_LEVEL &&
         classDef.promotionOptions.length > 0 &&
         !classDef.isPromoted;
}

export function promote(unit: Unit, newClassName: UnitClassName, newClassDef: ClassDefinition): PromotionResult {
  // Apply promotion bonuses from the NEW class definition (promotionBonuses)
  const statBonuses = newClassDef.promotionBonuses;
  const newWeaponTypes = newClassDef.weaponTypes;
  const newSkills = newClassDef.skills
    .filter(s => s.level <= 1) // Skills at promotion level
    .map(s => s.skillId);

  return {
    unitId: unit.id,
    oldClass: unit.className,
    newClass: newClassName,
    statBonuses: statBonuses as Partial<Stats>,
    newWeaponTypes,
    newSkills,
  };
}

export function applyPromotion(unit: Unit, result: PromotionResult, newClassDef: ClassDefinition): Unit {
  const newStats = { ...unit.currentStats };
  for (const [key, value] of Object.entries(result.statBonuses)) {
    if (key in newStats && typeof value === 'number') {
      (newStats as any)[key] += value;
    }
  }

  return {
    ...unit,
    className: result.newClass,
    level: 1, // Reset to promoted level 1
    exp: 0,
    currentStats: newStats,
    maxHP: newStats.hp,
    currentHP: Math.min(unit.currentHP + (result.statBonuses.hp ?? 0), newStats.hp),
    movementType: newClassDef.movementType,
    skills: [...unit.skills, ...result.newSkills],
  };
}
```

### 4. `src/progression/economyManager.ts`

```typescript
export function addGold(currentGold: number, amount: number): number {
  return currentGold + amount;
}

export function removeGold(currentGold: number, amount: number): { gold: number; success: boolean } {
  if (currentGold < amount) return { gold: currentGold, success: false };
  return { gold: currentGold - amount, success: true };
}
```

### 5. `src/progression/arenaSystem.ts`

```typescript
import { Unit, UnitClassName, MovementType, WeaponType, ArmorSlot, SupportRank, AIBehavior, Inventory, MAX_SP } from '../../shared/types';

export function getArenaOpponent(playerUnit: Unit): Unit {
  // Generate random opponent of similar level (±2)
  const level = Math.max(1, playerUnit.level + Math.floor(Math.random() * 5) - 2);
  const classes: UnitClassName[] = [UnitClassName.Warrior, UnitClassName.Knight, UnitClassName.Archer, UnitClassName.Mage];
  const className = classes[Math.floor(Math.random() * classes.length)];

  // Generate base stats scaled to level
  const baseStr = 7 + Math.floor(level * 0.5);
  const baseDef = 5 + Math.floor(level * 0.3);

  const opponent: Unit = {
    id: `arena_${Date.now()}`,
    name: 'Arena Champion',
    characterId: 'arena_opponent',
    className,
    level,
    exp: 0,
    currentStats: {
      hp: 18 + level * 2, strength: baseStr, magic: 3, skill: 5 + Math.floor(level * 0.4),
      speed: 5 + Math.floor(level * 0.3), luck: 3, defense: baseDef, resistance: 2, movement: 5,
    },
    maxHP: 18 + level * 2,
    currentHP: 18 + level * 2,
    currentSP: MAX_SP,
    maxSP: MAX_SP,
    growthRates: { hp: 50, strength: 40, magic: 10, skill: 35, speed: 30, luck: 20, defense: 25, resistance: 15 },
    inventory: { items: [null, null, null, null, null], equippedWeaponIndex: null, equippedArmor: { head: null, chest: null, boots: null, accessory: null } },
    skills: [],
    activeStatusEffects: [],
    position: null,
    hasMoved: false,
    hasActed: false,
    isAlive: true,
    team: 'enemy',
    aiBehavior: AIBehavior.Aggressive,
    supportRanks: {},
    supportPoints: {},
    killCount: 0,
    movementType: MovementType.Foot,
  };
  return opponent;
}

export function resolveArenaFight(playerUnit: Unit, opponent: Unit): { won: boolean; goldChange: number; expGained: number } {
  // Simplified combat: compare stats
  const playerPower = playerUnit.currentStats.strength + playerUnit.currentStats.speed + playerUnit.currentStats.skill;
  const opponentPower = opponent.currentStats.strength + opponent.currentStats.speed + opponent.currentStats.skill;

  // Random factor
  const playerRoll = playerPower + Math.random() * 20;
  const opponentRoll = opponentPower + Math.random() * 20;

  const won = playerRoll >= opponentRoll;
  const goldChange = won ? opponent.level * 100 : 0;
  const expGained = won ? Math.min(100, (opponent.level - playerUnit.level + 10) * 5) : 0;

  return { won, goldChange, expGained: Math.max(0, expGained) };
}
```

### 6. `src/progression/achievementTracker.ts`

```typescript
export interface AchievementDef {
  id: string;
  name: string;
  description: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_blood', name: 'First Blood', description: 'Defeat your first enemy' },
  { id: 'chapters_cleared_5', name: 'Adventurer', description: 'Clear 5 chapters' },
  { id: 'chapters_cleared_10', name: 'Veteran', description: 'Clear 10 chapters' },
  { id: 'chapters_cleared_25', name: 'Legend', description: 'Clear all 25 chapters' },
  { id: 'first_promotion', name: 'Class Change', description: 'Promote a unit for the first time' },
  { id: 'all_promotions', name: 'Master of Classes', description: 'Promote all recruitable units' },
  { id: 'boss_slayer_5', name: 'Boss Hunter', description: 'Defeat 5 boss enemies' },
  { id: 'boss_slayer_10', name: 'Boss Slayer', description: 'Defeat 10 boss enemies' },
  { id: 'gold_hoarder', name: 'Gold Hoarder', description: 'Accumulate 10000 gold' },
  { id: 'support_first', name: 'Bonds of War', description: 'Reach your first support rank' },
  { id: 'support_all_a', name: 'True Bonds', description: 'Reach A rank with all support pairs' },
  { id: 'arena_champion', name: 'Arena Champion', description: 'Win 10 arena battles' },
  { id: 'no_deaths', name: 'Perfect Commander', description: 'Complete a chapter with no unit deaths' },
  { id: 'speed_clear', name: 'Swift Victory', description: 'Clear a chapter in under 10 turns' },
  { id: 'max_level', name: 'Maximum Power', description: 'Reach level 30 with any unit' },
];

export function getAchievementList(): AchievementDef[] {
  return [...ACHIEVEMENTS];
}

export function checkAchievements(state: { completedChapters: string[]; achievements: string[] }): string[] {
  const newAchievements: string[] = [];
  if (state.completedChapters.length >= 5 && !state.achievements.includes('chapters_cleared_5')) {
    newAchievements.push('chapters_cleared_5');
  }
  if (state.completedChapters.length >= 10 && !state.achievements.includes('chapters_cleared_10')) {
    newAchievements.push('chapters_cleared_10');
  }
  if (state.completedChapters.length >= 25 && !state.achievements.includes('chapters_cleared_25')) {
    newAchievements.push('chapters_cleared_25');
  }
  return newAchievements;
}
```

### 7. `src/progression/progressionSystem.ts`

Factory function `createProgressionSystem(data: IDataProvider): IProgressionSystem`.

Implements all methods by delegating to modules above.

`awardExp(unit, gains)`: Sum all gain amounts, add to unit.exp. If crosses level threshold, call rollLevelUp. Handle multiple level-ups. Return { unit, levelUp }.

### 8. `src/progression/index.ts`
```typescript
export { createProgressionSystem } from './progressionSystem';
```

### 9. Tests — `src/progression/__tests__/`

**expCalculator.test.ts** (~12 tests): EXP accumulation, level-up trigger at 100, multi-level-up, getExpForNextLevel, level difference multiplier (higher/lower/same).

**levelUp.test.ts** (~12 tests): Stat roll randomness (mock Math.random), stat cap enforcement, max level check, skill learning placeholder, apply level up.

**promotion.test.ts** (~12 tests): canPromote eligibility (level check, not promoted, has options), promote stat bonuses, class change, level reset, weapon type update.

**economy.test.ts** (~8 tests): Add gold, remove gold, insufficient gold.

**arena.test.ts** (~10 tests): Opponent generation (level range), fight resolution, rewards on win/loss.

**achievements.test.ts** (~10 tests): Achievement checking, no duplicates, all definitions valid, chapter milestones.

TOTAL: 70+ tests

## Import Pattern
```typescript
import {
  Unit, ExpGain, LevelUpResult, PromotionResult, GrowthRates, Stats, ClassDefinition,
  UnitClassName, WeaponType, IProgressionSystem, IDataProvider,
  MAX_LEVEL, PROMOTION_LEVEL, EXP_PER_LEVEL, MovementType, AIBehavior, ArmorSlot,
  SupportRank, MAX_SP, Inventory
} from '../../shared/types';
```
