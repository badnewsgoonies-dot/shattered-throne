# Unit System — Full Domain Implementation

You are implementing the Unit System domain for Shattered Throne, a tactical RPG.

## CRITICAL RULES
- ONLY create/modify files under `src/units/`
- Import types ONLY from `../../shared/types`
- Do NOT import from any other domain
- The file `src/shared/types.ts` already exists — do NOT modify it

## Files to Create

### 1. `src/units/unitFactory.ts`

**createUnit(characterDef: CharacterDefinition, classDef: ClassDefinition): Unit**
- Generate unique ID: `unit_${characterDef.id}_${Date.now()}`
- Set base stats from classDef.baseStats (copy)
- Combine growth rates: classDef.growthRates + characterDef.personalGrowthBonuses
- Initialize: level=characterDef.baseLevel, exp=0, currentHP=maxHP=baseStats.hp, currentSP=MAX_SP(100), maxSP=100
- Create empty inventory: items=[null,null,null,null,null], equippedWeaponIndex=null, equippedArmor={head:null,chest:null,boots:null,accessory:null}
- Set skills from classDef.skills where skill.level <= characterDef.baseLevel
- Set isAlive=true, hasMoved=false, hasActed=false, team='player', killCount=0
- Set movementType from classDef
- Set supportRanks={}, supportPoints={}

**createEnemyUnit(placement: EnemyPlacement, classDef: ClassDefinition, items: ItemData[]): Unit**
- Similar to createUnit but for enemies
- Generate ID: `enemy_${placement.characterId}_${Date.now()}`
- Simulate leveling from 1 to placement.level: for each level, add average stat gains (growthRate/100 for each stat, rounded)
- Set team='enemy', aiBehavior=placement.aiBehavior
- Create inventory with items from placement.equipment (match against provided items array by ID, create ItemInstances)
- Set position=placement.position

### 2. `src/units/statCalculator.ts`

**getEffectiveStats(unit: Unit, equippedWeapon: WeaponData | null, equippedArmor: ArmorData[]): Stats**
- Start with copy of unit.currentStats
- If weapon equipped: speed penalty = max(0, weapon.weight - unit.currentStats.strength)
- Add armor bonuses: for each armor piece, +defense, +resistance, -speedPenalty
- Apply status effects: Berserk = +50% strength (BERSERK_ATTACK_BONUS_PERCENT)
- Return effective stats (do NOT apply stat caps here — caps are enforced during level up)

### 3. `src/units/statusEffects.ts`

**applyStatusEffect(unit: Unit, effect: ActiveStatusEffect): Unit**
- If same type exists, refresh duration (replace with new one)
- Otherwise add to activeStatusEffects array
- Return new unit

**tickStatusEffects(unit: Unit): Unit**
- Process each active effect:
  - Poison: lose POISON_HP_PERCENT(10)% of maxHP (min 1 HP remaining)
  - Sleep: set hasMoved=true, hasActed=true
  - Silence: (handled by combat layer, just track)
  - Berserk: set hasMoved=false, hasActed=false (AI controls)
  - Charm: (handled by combat layer)
  - Frozen: set hasMoved=true (can still act)
  - Blind: (handled by combat layer — -50% hit)
  - Stun: set hasMoved=true, hasActed=true
- Decrement remainingTurns, remove expired (remainingTurns <= 0)
- Return new unit

### 4. `src/units/aiSystem.ts`

**calculateAIAction(unit: Unit, allies: Unit[], enemies: Unit[], map: GridMap, gridEngine: IGridEngine): CombatAction**

Based on unit.aiBehavior:

**Aggressive:**
- Get movement range via gridEngine
- Find enemies within movement+attack range
- Score each: (estimated damage) * (kill probability bonus: 2x if can kill)
- Move toward best target, return attack action if in range
- If nothing reachable, move toward nearest enemy, return wait

**Defensive:**
- Only attack enemies within current attack range (don't move toward them proactively)
- If enemy in range, attack highest threat
- Otherwise, move to best defensive terrain within 3 tiles of current position
- Return wait if nothing to do

**Support:**
- Check allies for HP < 50% of maxHP
- If found and unit has healing capability, move toward and heal
- Otherwise, stay near allies, return wait

**Flanker:**
- Find enemies, try to reach positions adjacent to enemy but not directly in front
- Prioritize low-defense targets
- Seek forest/fortress terrain
- Fallback to aggressive behavior

**Boss:**
- Don't move unless HP < 25% of maxHP
- Attack any enemy in current range with highest damage
- When HP < 25%, switch to aggressive behavior

Return CombatAction with type, unitId, targetPosition, targetUnitId.

### 5. `src/units/aiThreatAssessment.ts`

Helper functions for AI:
- `estimateDamage(attacker: Unit, target: Unit): number` — rough damage = strength + 10 (assumed weapon) - target defense
- `isKillable(attacker: Unit, target: Unit): boolean` — estimateDamage >= target.currentHP
- `getTargetScore(attacker: Unit, target: Unit): number` — damage * (isKillable ? 2 : 1) * (isLordOrHealer ? 2 : 1)
- `canSurviveCounter(attacker: Unit, target: Unit): boolean` — estimate counter damage < attacker.currentHP

### 6. `src/units/unitSerializer.ts`

**serializeUnit(unit: Unit): string** — JSON.stringify
**deserializeUnit(data: string): Unit** — JSON.parse with basic validation (check required fields exist)

### 7. `src/units/unitSystem.ts`

Factory function `createUnitSystem(): IUnitSystem` that returns an object implementing all IUnitSystem methods.

Delegates to the modules above. Also implements:
- `applyDamage(unit, damage)`: Reduce currentHP by damage. If HP <= 0, set isAlive=false, currentHP=0. Return new unit.
- `applyHealing(unit, amount)`: Increase currentHP by amount, cap at maxHP. Return new unit.
- `resetTurnState(unit)`: Set hasMoved=false, hasActed=false. Return new unit.
- `getEquippedWeapon(unit, items)`: If unit.inventory.equippedWeaponIndex is not null, get the item instance, find matching ItemData by dataId in items array (filter to WeaponData). Return WeaponData or null.
- `getEquippedArmor(unit, items)`: For each equipped armor slot, get ItemData. Return ArmorData[].
- `canUseWeapon(unit, weapon, classDef)`: Check if classDef.weaponTypes includes weapon.weaponType.

### 8. `src/units/index.ts`
```typescript
export { createUnitSystem } from './unitSystem';
```

### 9. Tests — `src/units/__tests__/`

**unitFactory.test.ts** (~15 tests): Create player units, enemy units, stat initialization, level simulation, equipment setup.

**statCalculator.test.ts** (~15 tests): Effective stats with weapon weight penalty, armor bonuses, berserk buff, no weapon, multiple armor pieces.

**statusEffects.test.ts** (~20 tests): Apply each of 8 status effects, tick processing, duration countdown, poison HP loss, sleep/stun skip turn, frozen move restriction, removal on expiry, refresh duration.

**aiAggressive.test.ts** (~10 tests): Targets nearest enemy, prioritizes kills, moves toward enemies.

**aiDefensive.test.ts** (~8 tests): Stays near position, only attacks in range, seeks defensive terrain.

**aiSupport.test.ts** (~8 tests): Prioritizes healing, moves toward injured allies.

**aiFlanker.test.ts** (~8 tests): Seeks side attacks, prioritizes low defense.

**aiBoss.test.ts** (~8 tests): Stays in position, attacks in range, becomes aggressive at low HP.

**aiThreatAssessment.test.ts** (~8 tests): Damage estimation, kill probability, strategic value scoring.

**serialization.test.ts** (~8 tests): Round-trip, corrupted data handling.

TOTAL: 120+ tests

## Key Constants (from shared/types.ts)
- MAX_LEVEL = 30
- MAX_INVENTORY_SLOTS = 5
- MAX_SP = 100
- POISON_HP_PERCENT = 10
- BERSERK_ATTACK_BONUS_PERCENT = 50
- ZONE_OF_CONTROL_EXTRA_COST = 3

## Import Pattern
```typescript
import {
  Unit, CharacterDefinition, ClassDefinition, EnemyPlacement, ItemData, WeaponData, ArmorData,
  Stats, GrowthRates, ActiveStatusEffect, StatusEffectType, CombatAction, AIBehavior,
  GridMap, Position, IGridEngine, IUnitSystem, MovementType, Inventory, ArmorSlot,
  MAX_SP, MAX_INVENTORY_SLOTS, POISON_HP_PERCENT, BERSERK_ATTACK_BONUS_PERCENT, ItemCategory, SupportRank
} from '../../shared/types';
```
