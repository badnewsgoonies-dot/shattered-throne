# Progression & Economy Domain Spec

## Domain Objective

The Progression domain handles experience point calculation with level-difference scaling, level-up stat rolls per growth rates, class promotion (at level 15+), the gold economy, arena battles, and achievement/unlock tracking. It takes unit data as input and returns updated units with progression changes applied.

## Owned Directories

- `src/progression/` — ALL files owned exclusively by this domain.
- Do NOT create or modify files outside `src/progression/`.

## Required Exports

From `src/progression/index.ts`:

```typescript
export { createProgressionSystem } from './progressionSystem';
// createProgressionSystem: (data: IDataProvider) => IProgressionSystem
```

## Full Type Contract (src/shared/types.ts)

**Import types from `../../shared/types`.**

```typescript
export enum TerrainType { Plains = 'plains', Forest = 'forest', Mountain = 'mountain', Water = 'water', Lava = 'lava', Fortress = 'fortress', Bridge = 'bridge', Swamp = 'swamp', Sand = 'sand', Snow = 'snow', Void = 'void' }
export enum GridType { Square = 'square', Hex = 'hex' }
export enum UnitClassName { Warrior = 'warrior', Knight = 'knight', Archer = 'archer', Mage = 'mage', Cleric = 'cleric', Thief = 'thief', Berserker = 'berserker', Paladin = 'paladin', Assassin = 'assassin', Sage = 'sage', General = 'general', Dancer = 'dancer', Sniper = 'sniper', Ranger = 'ranger', DarkKnight = 'darkKnight', Bishop = 'bishop', Valkyrie = 'valkyrie', Trickster = 'trickster', GreatKnight = 'greatKnight' }
export enum WeaponType { Sword = 'sword', Lance = 'lance', Axe = 'axe', Bow = 'bow', FireTome = 'fireTome', WindTome = 'windTome', ThunderTome = 'thunderTome', DarkTome = 'darkTome', LightTome = 'lightTome', Staff = 'staff' }
export enum ItemCategory { Weapon = 'weapon', Armor = 'armor', Consumable = 'consumable', KeyItem = 'keyItem', PromotionItem = 'promotionItem' }
export enum ArmorSlot { Head = 'head', Chest = 'chest', Boots = 'boots', Accessory = 'accessory' }
export enum StatusEffectType { Poison = 'poison', Sleep = 'sleep', Silence = 'silence', Berserk = 'berserk', Charm = 'charm', Frozen = 'frozen', Blind = 'blind', Stun = 'stun' }
export enum TurnPhase { Player = 'player', Enemy = 'enemy', AllyNPC = 'allyNPC' }
export enum AIBehavior { Aggressive = 'aggressive', Defensive = 'defensive', Support = 'support', Flanker = 'flanker', Boss = 'boss' }
export enum SkillType { Active = 'active', Passive = 'passive' }
export enum AoEPattern { Single = 'single', Circle = 'circle', Line = 'line', Cone = 'cone', Cross = 'cross' }
export enum VictoryCondition { Rout = 'rout', BossKill = 'bossKill', Survive = 'survive', ReachLocation = 'reachLocation', ProtectTarget = 'protectTarget' }
export enum DefeatCondition { LordDies = 'lordDies', AllUnitsDie = 'allUnitsDie', ProtectedUnitDies = 'protectedUnitDies', TimerExpires = 'timerExpires' }
export enum SupportRank { None = 'none', C = 'C', B = 'B', A = 'A' }
export enum Weather { Clear = 'clear', Rain = 'rain', Fog = 'fog', Snow = 'snow' }
export enum Element { Fire = 'fire', Wind = 'wind', Thunder = 'thunder', Dark = 'dark', Light = 'light' }
export enum MovementType { Foot = 'foot', Mounted = 'mounted', Armored = 'armored', Flying = 'flying' }

export interface Position { x: number; y: number; }
export interface Stats { hp: number; strength: number; magic: number; skill: number; speed: number; luck: number; defense: number; resistance: number; movement: number; }
export interface GrowthRates { hp: number; strength: number; magic: number; skill: number; speed: number; luck: number; defense: number; resistance: number; }
export interface StatCaps { hp: number; strength: number; magic: number; skill: number; speed: number; luck: number; defense: number; resistance: number; movement: number; }
export interface ClassDefinition { name: UnitClassName; displayName: string; baseStats: Stats; growthRates: GrowthRates; statCaps: StatCaps; movementType: MovementType; weaponTypes: WeaponType[]; skills: { level: number; skillId: string }[]; promotionOptions: UnitClassName[]; promotionBonuses: Partial<Stats>; isPromoted: boolean; }
export interface WeaponData { id: string; name: string; description: string; category: ItemCategory.Weapon; weaponType: WeaponType; might: number; hit: number; crit: number; range: { min: number; max: number }; weight: number; maxDurability: number; element?: Element; effectiveAgainst?: MovementType[]; specialEffect?: string; cost: number; rank: string; }
export interface ArmorData { id: string; name: string; description: string; category: ItemCategory.Armor; slot: ArmorSlot; defense: number; resistance: number; weight: number; speedPenalty: number; setId?: string; cost: number; }
export interface ConsumableEffect { type: 'heal' | 'cureStatus' | 'statBoost' | 'key' | 'special'; healAmount?: number; fullHeal?: boolean; cureStatus?: StatusEffectType; statBoost?: Partial<Stats>; permanent?: boolean; }
export interface ConsumableData { id: string; name: string; description: string; category: ItemCategory.Consumable; effect: ConsumableEffect; uses: number; cost: number; }
export interface PromotionItemData { id: string; name: string; description: string; category: ItemCategory.PromotionItem; validClasses: UnitClassName[]; cost: number; }
export type ItemData = WeaponData | ArmorData | ConsumableData | PromotionItemData;
export interface ItemInstance { instanceId: string; dataId: string; currentDurability?: number; forgeBonuses?: { might: number; hit: number; crit: number }; }
export interface Inventory { items: (ItemInstance | null)[]; equippedWeaponIndex: number | null; equippedArmor: Record<ArmorSlot, number | null>; }
export interface ActiveStatusEffect { type: StatusEffectType; remainingTurns: number; sourceUnitId: string; }
export interface Unit { id: string; name: string; characterId: string; className: UnitClassName; level: number; exp: number; currentStats: Stats; maxHP: number; currentHP: number; currentSP: number; maxSP: number; growthRates: GrowthRates; inventory: Inventory; skills: string[]; activeStatusEffects: ActiveStatusEffect[]; position: Position | null; hasMoved: boolean; hasActed: boolean; isAlive: boolean; team: 'player' | 'enemy' | 'ally'; aiBehavior?: AIBehavior; supportRanks: Record<string, SupportRank>; supportPoints: Record<string, number>; killCount: number; movementType: MovementType; }
export interface LevelUpResult { unitId: string; newLevel: number; statGains: Partial<Stats>; newSkills: string[]; }
export interface PromotionResult { unitId: string; oldClass: UnitClassName; newClass: UnitClassName; statBonuses: Partial<Stats>; newWeaponTypes: WeaponType[]; newSkills: string[]; }
export interface ExpGain { unitId: string; amount: number; source: 'damage' | 'kill' | 'heal' | 'objective' | 'other'; }
export interface IProgressionSystem { awardExp(unit: Unit, gains: ExpGain[]): { unit: Unit; levelUp: LevelUpResult | null }; rollLevelUp(unit: Unit, growthRates: GrowthRates): LevelUpResult; canPromote(unit: Unit, classDef: ClassDefinition): boolean; promote(unit: Unit, newClassName: UnitClassName, classDef: ClassDefinition): PromotionResult; getExpForNextLevel(currentExp: number): number; calculateLevelDifferenceMultiplier(attackerLevel: number, defenderLevel: number): number; getArenaOpponent(playerUnit: Unit): Unit; resolveArenaFight(playerUnit: Unit, opponent: Unit): { won: boolean; goldChange: number; expGained: number }; }
export interface IDataProvider { getClassDefinition(className: UnitClassName): ClassDefinition; getAllClasses(): ClassDefinition[]; getWeapon(id: string): WeaponData | null; getAllWeapons(): WeaponData[]; getArmor(id: string): ArmorData | null; getAllArmor(): ArmorData[]; getConsumable(id: string): ConsumableData | null; getAllConsumables(): ConsumableData[]; getPromotionItem(id: string): PromotionItemData | null; getAllPromotionItems(): PromotionItemData[]; getItem(id: string): ItemData | null; getSkill(id: string): SkillDefinition | null; getAllSkills(): SkillDefinition[]; getChapter(id: string): ChapterDefinition | null; getAllChapters(): ChapterDefinition[]; getCharacter(id: string): CharacterDefinition | null; getAllCharacters(): CharacterDefinition[]; getMapData(id: string): GridMap | null; getAllMaps(): GridMap[]; getSupportConversations(charA: string, charB: string): SupportConversation[]; getAllSupportConversations(): SupportConversation[]; getEnemyTemplate(id: string): EnemyPlacement | null; getAllEnemyTemplates(): EnemyPlacement[]; validateAllData(): { valid: boolean; errors: string[] }; }

export const MAX_LEVEL = 30; export const PROMOTION_LEVEL = 15; export const EXP_PER_LEVEL = 100; export const MAX_INVENTORY_SLOTS = 5; export const MAX_SP = 100; export const KILL_EXP_BONUS = 30; export const MAX_PARTY_SIZE = 12; export const MAX_DEPLOY_SIZE = 8;
```

(Note: Some interfaces like SkillDefinition, ChapterDefinition, SupportConversation, EnemyPlacement, GridMap, etc. are defined in the full types.ts — use the same definitions as shown in the grid_spec.)

## Detailed Requirements

### 1. EXP System (`expCalculator.ts`)

- `awardExp(unit, gains)`: Sum all ExpGain amounts, add to unit.exp. If exp >= EXP_PER_LEVEL (100), trigger level up. Handle multiple level-ups if enough EXP. Return { unit, levelUp } where levelUp is the last LevelUpResult or null.
- `getExpForNextLevel(currentExp)`: Return EXP_PER_LEVEL - (currentExp % EXP_PER_LEVEL).
- `calculateLevelDifferenceMultiplier(attackerLevel, defenderLevel)`:
  - If defender higher: multiplier = 1 + (defenderLevel - attackerLevel) * 0.1 (capped at 3.0).
  - If attacker higher: multiplier = 1 - (attackerLevel - defenderLevel) * 0.05 (minimum 0.1).
  - Same level: 1.0.

### 2. Level Up System (`levelUpSystem.ts`)

- `rollLevelUp(unit, growthRates)`: For each stat in GrowthRates, roll a random number 0-99. If roll < growthRate, that stat gains +1. Return LevelUpResult with stat gains. Check for new skills at the new level.
- Cap stats at class statCaps.
- Cannot exceed MAX_LEVEL (30).
- Update unit.currentStats, unit.maxHP, unit.level.

### 3. Promotion System (`promotionSystem.ts`)

- `canPromote(unit, classDef)`: Unit level >= PROMOTION_LEVEL (15) and classDef has promotionOptions.length > 0 and class is not already promoted.
- `promote(unit, newClassName, newClassDef)`:
  - Apply promotionBonuses from old class to stats.
  - Change className to new class.
  - Reset level to 1 (promoted level 1).
  - Update weaponTypes from new class.
  - Learn promotion skills.
  - Update movementType from new class.
  - Return PromotionResult.

### 4. Economy Manager (`economyManager.ts`)

- Track gold: earn from chapter rewards, selling items, arena wins.
- Spend on: shop purchases, forging.
- Simple functions: `addGold(state, amount)`, `removeGold(state, amount)` — these return new state.

### 5. Arena System (`arenaSystem.ts`)

- `getArenaOpponent(playerUnit)`: Generate a random enemy unit of similar level (±2). Use data provider for class definitions. Equip with appropriate weapons.
- `resolveArenaFight(playerUnit, opponent)`: Simulate simplified combat (3-5 rounds). Determine winner by who reaches 0 HP first. Winner gets gold proportional to opponent level. Loser gets nothing. Return { won, goldChange, expGained }.

### 6. Achievement Tracker (`achievementTracker.ts`)

- Define achievements: chapters_cleared_5, chapters_cleared_10, first_promotion, all_supports, boss_slayer_10, etc. (at least 15 achievements).
- `checkAchievements(state)`: Return newly earned achievement IDs.
- `getAchievementList()`: Return all achievement definitions with name, description, condition.

## Test Requirements

Write Vitest tests in `src/progression/__tests__/`:

1. **expCalculator.test.ts**: EXP accumulation, level-up trigger, multi-level-up, level difference multiplier.
2. **levelUp.test.ts**: Stat roll distribution, stat cap enforcement, max level check, skill learning.
3. **promotion.test.ts**: Eligibility check, stat bonuses, class change, level reset, weapon type update.
4. **economy.test.ts**: Gold add/remove, insufficient gold check.
5. **arena.test.ts**: Opponent generation, fight resolution, rewards.
6. **achievements.test.ts**: Achievement checking, no duplicates, all definitions valid.

Target: 70+ tests.

## What This Domain Should NOT Touch

- Do NOT modify files outside `src/progression/`.
- Only import from `../../shared/types`.
- Do NOT implement combat, items, grid, or rendering logic.

## Completion

When finished, write `progression_DONE.md` in the project root.

## Worker Launch Command

```bash
codex exec --full-auto --skip-git-repo-check -C $(pwd) "$(cat specs/progression/worker_N.md)"
```

## Scope Enforcement

```bash
git diff --name-only | grep -v '^src/progression/' | xargs -r git checkout --
git add src/progression/
```
