# Combat Engine — Full Domain Implementation

You are implementing the Combat Engine domain for Shattered Throne, a tactical RPG.

## CRITICAL RULES
- ONLY create/modify files under `src/combat/`
- Import types ONLY from `../../shared/types`
- Do NOT import from any other domain
- The file `src/shared/types.ts` already exists — do NOT modify it

## Files to Create

### 1. `src/combat/weaponTriangle.ts`

```typescript
import { WeaponType, Element, WEAPON_TRIANGLE_HIT_BONUS, WEAPON_TRIANGLE_DAMAGE_BONUS, MAGIC_TRIANGLE_HIT_BONUS, MAGIC_TRIANGLE_DAMAGE_BONUS } from '../../shared/types';

// Physical: Sword > Axe > Lance > Sword
// Advantage: +15 hit, +1 damage
// Disadvantage: -15 hit, -1 damage
export function getWeaponTriangleBonus(attackerWeapon: WeaponType, defenderWeapon: WeaponType): { hitBonus: number; damageBonus: number } {
  // Sword beats Axe, Axe beats Lance, Lance beats Sword
  // Bow, tomes, staff = neutral (no triangle)
  const physicalTriangle: Record<string, string> = { sword: 'axe', axe: 'lance', lance: 'sword' };
  // Check if both are physical triangle weapons
  // If attacker has advantage: +WEAPON_TRIANGLE_HIT_BONUS, +WEAPON_TRIANGLE_DAMAGE_BONUS
  // If disadvantage: negate
  // Otherwise: 0, 0
}

// Magic: Fire > Wind > Thunder > Fire
// Dark <> Light: mutual advantage
export function getMagicTriangleBonus(attackerElement: Element, defenderElement: Element): { hitBonus: number; damageBonus: number } {
  // Fire beats Wind, Wind beats Thunder, Thunder beats Fire
  // Dark and Light beat each other (mutual advantage)
}
```

### 2. `src/combat/damageCalculator.ts`

```typescript
import { Unit, WeaponData, TerrainData, MovementType, ItemCategory } from '../../shared/types';

export function calculateDamage(
  attacker: Unit, defender: Unit,
  attackerWeapon: WeaponData, defenderWeapon: WeaponData | null,
  terrain: TerrainData, distance: number
): number {
  // Determine if physical or magical
  const isMagic = [WeaponType.FireTome, WeaponType.WindTome, WeaponType.ThunderTome,
                    WeaponType.DarkTome, WeaponType.LightTome, WeaponType.Staff]
                   .includes(attackerWeapon.weaponType);

  let baseDamage: number;
  if (isMagic) {
    baseDamage = attacker.currentStats.magic + attackerWeapon.might - defender.currentStats.resistance;
  } else {
    baseDamage = attacker.currentStats.strength + attackerWeapon.might - defender.currentStats.defense;
  }

  // Add weapon triangle bonus
  // Add forge bonuses (attackerWeapon.forgeBonuses?.might ?? 0) — BUT forgeBonuses is on ItemInstance not WeaponData. So ignore here.

  // Subtract terrain defense bonus
  baseDamage -= terrain.defenseBonus;

  // Effectiveness: if weapon.effectiveAgainst includes defender.movementType, might is tripled (3x weapon might added)
  if (attackerWeapon.effectiveAgainst?.includes(defender.movementType)) {
    baseDamage += attackerWeapon.might * 2; // 3x total = original might + 2x extra
  }

  // Height advantage: not directly available in this function (terrain is defender's terrain)
  // We don't have attacker terrain here, so skip height bonus in this function

  // Floor at 0
  return Math.max(0, baseDamage);
}
```

### 3. `src/combat/hitCalculator.ts`

```typescript
export function calculateHitRate(
  attacker: Unit, defender: Unit,
  attackerWeapon: WeaponData, terrain: TerrainData,
  adjacentAllies: number
): number {
  // hitRate = (attacker.Skill * 2 + attacker.Luck) + weapon.hit + weaponTriangleHitBonus
  //         - (defender.Speed * 2 + defender.Luck) - terrain.evasionBonus
  //         + (adjacentAllies * SUPPORT_HIT_EVADE_BONUS_PER_ALLY)
  // Clamp 0-100
}

export function calculateCritRate(
  attacker: Unit, defender: Unit,
  attackerWeapon: WeaponData
): number {
  // critRate = attacker.Skill / 2 + weapon.crit - defender.Luck
  // Class bonus: Berserker +10, Assassin +15, Sniper +10, Thief +5
  // Clamp 0-100
}
```

### 4. `src/combat/combatEngine.ts`

Factory function `createCombatEngine(): ICombatEngine`.

Implements all ICombatEngine methods:

**getBattleForecast**: Calculate all forecast fields. Double check: speed diff > DOUBLE_ATTACK_SPEED_THRESHOLD(5). Counter: defender has weapon and attacker within defender weapon range.

**resolveCombat**:
1. Attacker attacks (roll hit using Math.random()*100 < hitRate, roll crit if hit)
2. If crit: damage * CRIT_MULTIPLIER(3)
3. Apply damage to defender
4. If defender alive and can counter: defender attacks
5. If attacker doubles and attacker alive: attack again
6. If defender doubles and counter and defender alive: counter again
7. Build CombatRound[] with HP values after each round
8. Calculate EXP: use calculateExpGain
9. Return CombatResult (levelUp fields as null — progression handles that)

**executeSkill**:
- Deduct SP from user
- Damage skills: base + scaling stat (strength or magic) vs target defense/resistance
- Healing skills: base + user magic
- Buff/debuff: apply stat modifications
- Status effects: roll chance
- Return CombatResult-like object

**checkVictoryConditions / checkDefeatConditions**: Check each condition type.

### 5. `src/combat/expCalculator.ts`

```typescript
export function calculateExpGain(
  attacker: Unit, defender: Unit,
  damageDealt: number, killed: boolean
): number {
  // base = (defender.level - attacker.level + 10) * 3
  // if killed: base + KILL_EXP_BONUS(30)
  // if damage > 0 but not killed: base * (damageDealt / defender.maxHP)
  // Clamp 1-100
}
```

### 6. `src/combat/victoryConditions.ts`

```typescript
export function checkVictoryConditions(conditions: VictoryConditionDef[], units: Unit[], turnNumber: number): boolean {
  // Return true if ANY victory condition is met
  // Rout: all enemies dead
  // BossKill: target unit dead
  // Survive: turnNumber >= surviveTurns
  // ReachLocation: any player unit at targetPosition
  // ProtectTarget: (always true unless defeat — this is a sustain condition)
}

export function checkDefeatConditions(conditions: DefeatConditionDef[], units: Unit[], turnNumber: number): boolean {
  // Return true if ANY defeat condition is met
  // LordDies: any lord unit not alive — check unit fields (look for units that could be lords, but we don't have isLord on Unit, so check characterId or assume caller marks correctly)
  // Actually: DefeatCondition.LordDies — no targetUnitId, check if any player unit with isLord... but Unit doesn't have isLord. So check protectedUnitId if provided, or return false.
  // AllUnitsDie: all player units dead
  // ProtectedUnitDies: specific unit dead
  // TimerExpires: turnNumber > turnLimit
}
```

### 7. `src/combat/skillExecutor.ts`

```typescript
export function executeSkill(user: Unit, skill: SkillDefinition, targets: Unit[], map: GridMap): CombatResult {
  // Deduct SP
  // For damage: calculate per target
  // For healing: restore HP
  // For buff/debuff: apply (return in result metadata)
  // For status: roll chance per target
  // Return CombatResult with rounds for each target hit
}
```

### 8. `src/combat/combatStateMachine.ts`

```typescript
import { CombatState, CombatStateType, TurnPhase } from '../../shared/types';

export function transitionState(state: CombatState, event: string): CombatState {
  // State transitions per spec
  // DEPLOY -> UNIT_SELECT
  // UNIT_SELECT -> MOVE_SELECT (unit selected)
  // MOVE_SELECT -> ACTION_SELECT (move confirmed)
  // ACTION_SELECT -> TARGET_SELECT (attack/skill selected)
  // ACTION_SELECT -> UNIT_SELECT (wait selected)
  // TARGET_SELECT -> ANIMATION (target confirmed)
  // ANIMATION -> UNIT_SELECT / VICTORY / DEFEAT
  // UNIT_SELECT -> ENEMY_TURN (all units acted)
  // ENEMY_TURN -> UNIT_SELECT (new turn)
}

export function undoMove(state: CombatState): CombatState {
  // Pop from undoStack, restore unit position
}

export function createInitialCombatState(): CombatState {
  // Initial state with Deploy phase
}
```

### 9. `src/combat/combatLog.ts`

```typescript
import { CombatLogEntry, TurnPhase } from '../../shared/types';

export function createLogEntry(turnNumber: number, phase: TurnPhase, message: string): CombatLogEntry {
  return { turnNumber, phase, message, timestamp: Date.now() };
}

export function formatAttackLog(attackerName: string, defenderName: string, damage: number, hit: boolean, crit: boolean): string {
  if (!hit) return `${attackerName} attacks ${defenderName} but misses!`;
  if (crit) return `${attackerName} lands a critical hit on ${defenderName} for ${damage} damage!`;
  return `${attackerName} attacks ${defenderName} for ${damage} damage.`;
}
```

### 10. `src/combat/index.ts`
```typescript
export { createCombatEngine } from './combatEngine';
```

### 11. Tests — `src/combat/__tests__/`

**damageCalculator.test.ts** (~20 tests): Physical damage, magical damage, terrain defense, effectiveness 3x, zero floor, high stats.

**hitCalculator.test.ts** (~15 tests): Hit rate formula, terrain evasion, support bonuses, clamping 0-100.

**critCalculator.test.ts** (~10 tests): Crit formula, class bonuses (Berserker +10, Assassin +15, Sniper +10, Thief +5), clamping.

**weaponTriangle.test.ts** (~15 tests): All Sword>Axe, Axe>Lance, Lance>Sword combos, neutral matchups, magic triangle Fire>Wind>Thunder>Fire, Dark<>Light mutual.

**battleForecast.test.ts** (~12 tests): Damage/hit/crit values, doubles check, counter check.

**combatResolution.test.ts** (~20 tests): Full combat: hit, miss, crit, double attack, counter attack, lethal damage, both survive.

**skillExecution.test.ts** (~15 tests): Damage skills, heal skills, buff, debuff, status effect, SP deduction.

**victoryConditions.test.ts** (~12 tests): All 5 victory types, all 4 defeat types.

**expCalculator.test.ts** (~10 tests): Level difference scaling, kill bonus, damage-based partial, clamping 1-100.

**combatStateMachine.test.ts** (~12 tests): All state transitions, undo, initial state.

**combatLog.test.ts** (~8 tests): Entry creation, format messages.

TOTAL: 150+ tests

## Key Constants
- WEAPON_TRIANGLE_HIT_BONUS = 15
- WEAPON_TRIANGLE_DAMAGE_BONUS = 1
- MAGIC_TRIANGLE_HIT_BONUS = 15
- MAGIC_TRIANGLE_DAMAGE_BONUS = 1
- CRIT_MULTIPLIER = 3
- DOUBLE_ATTACK_SPEED_THRESHOLD = 5
- HEIGHT_ADVANTAGE_HIT_BONUS = 15
- HEIGHT_DISADVANTAGE_HIT_PENALTY = 15
- SUPPORT_HIT_EVADE_BONUS_PER_ALLY = 10
- KILL_EXP_BONUS = 30

## Import Pattern
```typescript
import {
  Unit, WeaponData, TerrainData, WeaponType, Element, BattleForecast,
  CombatRound, CombatResult, CombatAction, CombatState, CombatStateType,
  CombatLogEntry, TurnPhase, SkillDefinition, GridMap, Position,
  VictoryConditionDef, DefeatConditionDef, VictoryCondition, DefeatCondition,
  ICombatEngine, MovementType, UnitClassName, LevelUpResult,
  WEAPON_TRIANGLE_HIT_BONUS, WEAPON_TRIANGLE_DAMAGE_BONUS,
  MAGIC_TRIANGLE_HIT_BONUS, MAGIC_TRIANGLE_DAMAGE_BONUS,
  CRIT_MULTIPLIER, DOUBLE_ATTACK_SPEED_THRESHOLD,
  SUPPORT_HIT_EVADE_BONUS_PER_ALLY, KILL_EXP_BONUS,
  HEIGHT_ADVANTAGE_HIT_BONUS, HEIGHT_DISADVANTAGE_HIT_PENALTY
} from '../../shared/types';
```
