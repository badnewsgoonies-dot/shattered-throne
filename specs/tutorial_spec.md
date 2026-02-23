# Tutorial & Help Domain Spec

## Domain Objective

The Tutorial domain provides an in-game tutorial system with guided first-chapter prompts, contextual tooltips, a searchable glossary of all game terms, idle-time hints, and tutorial completion tracking to avoid repeating tutorials. It is a self-contained reference and guidance system that receives context strings and returns guidance text.

## Owned Directories

- `src/tutorial/` — ALL files in this directory are owned by this domain exclusively.
- Do NOT create or modify files outside `src/tutorial/`.

## Required Exports

From `src/tutorial/index.ts`, export:

```typescript
export { createTutorialSystem } from './tutorialSystem';
// createTutorialSystem: () => ITutorialSystem
```

The returned object must implement every method of the `ITutorialSystem` interface from `src/shared/types.ts`.

## Full Type Contract (src/shared/types.ts)

**IMPORTANT: This is the complete shared type file. Import types from `../../shared/types` in your implementation.**

```typescript
export enum TerrainType { Plains = 'plains', Forest = 'forest', Mountain = 'mountain', Water = 'water', Lava = 'lava', Fortress = 'fortress', Bridge = 'bridge', Swamp = 'swamp', Sand = 'sand', Snow = 'snow', Void = 'void' }
export enum GridType { Square = 'square', Hex = 'hex' }
export enum UnitClassName { Warrior = 'warrior', Knight = 'knight', Archer = 'archer', Mage = 'mage', Cleric = 'cleric', Thief = 'thief', Berserker = 'berserker', Paladin = 'paladin', Assassin = 'assassin', Sage = 'sage', General = 'general', Dancer = 'dancer', Sniper = 'sniper', Ranger = 'ranger', DarkKnight = 'darkKnight', Bishop = 'bishop', Valkyrie = 'valkyrie', Trickster = 'trickster', GreatKnight = 'greatKnight' }
export enum WeaponType { Sword = 'sword', Lance = 'lance', Axe = 'axe', Bow = 'bow', FireTome = 'fireTome', WindTome = 'windTome', ThunderTome = 'thunderTome', DarkTome = 'darkTome', LightTome = 'lightTome', Staff = 'staff' }
export enum ItemCategory { Weapon = 'weapon', Armor = 'armor', Consumable = 'consumable', KeyItem = 'keyItem', PromotionItem = 'promotionItem' }
export enum ArmorSlot { Head = 'head', Chest = 'chest', Boots = 'boots', Accessory = 'accessory' }
export enum StatusEffectType { Poison = 'poison', Sleep = 'sleep', Silence = 'silence', Berserk = 'berserk', Charm = 'charm', Frozen = 'frozen', Blind = 'blind', Stun = 'stun' }
export enum TurnPhase { Player = 'player', Enemy = 'enemy', AllyNPC = 'allyNPC' }
export enum CombatStateType { Deploy = 'deploy', UnitSelect = 'unitSelect', MoveSelect = 'moveSelect', ActionSelect = 'actionSelect', TargetSelect = 'targetSelect', Animation = 'animation', EnemyTurn = 'enemyTurn', Victory = 'victory', Defeat = 'defeat' }
export enum AIBehavior { Aggressive = 'aggressive', Defensive = 'defensive', Support = 'support', Flanker = 'flanker', Boss = 'boss' }
export enum SkillType { Active = 'active', Passive = 'passive' }
export enum AoEPattern { Single = 'single', Circle = 'circle', Line = 'line', Cone = 'cone', Cross = 'cross' }
export enum VictoryCondition { Rout = 'rout', BossKill = 'bossKill', Survive = 'survive', ReachLocation = 'reachLocation', ProtectTarget = 'protectTarget' }
export enum DefeatCondition { LordDies = 'lordDies', AllUnitsDie = 'allUnitsDie', ProtectedUnitDies = 'protectedUnitDies', TimerExpires = 'timerExpires' }
export enum SupportRank { None = 'none', C = 'C', B = 'B', A = 'A' }
export enum Weather { Clear = 'clear', Rain = 'rain', Fog = 'fog', Snow = 'snow' }
export enum SoundEffectType { SwordSwing = 'swordSwing', ArrowFire = 'arrowFire', MagicCast = 'magicCast', HitImpact = 'hitImpact', CriticalHit = 'criticalHit', LevelUp = 'levelUp', MenuSelect = 'menuSelect', CursorMove = 'cursorMove', Heal = 'heal', Miss = 'miss', Death = 'death' }
export enum MusicContext { Title = 'title', WorldMap = 'worldMap', BaseCamp = 'baseCamp', BattlePlayer = 'battlePlayer', BattleEnemy = 'battleEnemy', BossBattle = 'bossBattle', Victory = 'victory', Defeat = 'defeat', Story = 'story', Shop = 'shop' }
export enum Element { Fire = 'fire', Wind = 'wind', Thunder = 'thunder', Dark = 'dark', Light = 'light' }
export enum MovementType { Foot = 'foot', Mounted = 'mounted', Armored = 'armored', Flying = 'flying' }

export interface Position { x: number; y: number; }
export interface Stats { hp: number; strength: number; magic: number; skill: number; speed: number; luck: number; defense: number; resistance: number; movement: number; }
export interface GrowthRates { hp: number; strength: number; magic: number; skill: number; speed: number; luck: number; defense: number; resistance: number; }
export interface Unit { id: string; name: string; characterId: string; className: UnitClassName; level: number; exp: number; currentStats: Stats; maxHP: number; currentHP: number; currentSP: number; maxSP: number; growthRates: GrowthRates; inventory: Inventory; skills: string[]; activeStatusEffects: ActiveStatusEffect[]; position: Position | null; hasMoved: boolean; hasActed: boolean; isAlive: boolean; team: 'player' | 'enemy' | 'ally'; aiBehavior?: AIBehavior; supportRanks: Record<string, SupportRank>; supportPoints: Record<string, number>; killCount: number; movementType: MovementType; }
export interface ActiveStatusEffect { type: StatusEffectType; remainingTurns: number; sourceUnitId: string; }
export interface ItemInstance { instanceId: string; dataId: string; currentDurability?: number; forgeBonuses?: { might: number; hit: number; crit: number }; }
export interface Inventory { items: (ItemInstance | null)[]; equippedWeaponIndex: number | null; equippedArmor: Record<ArmorSlot, number | null>; }
export interface TutorialStep { id: string; title: string; text: string; highlightPosition?: Position; highlightUI?: string; requiredAction?: string; nextStepId: string | null; }
export interface TutorialState { seenTutorials: string[]; currentTutorialId: string | null; currentStepId: string | null; hintsEnabled: boolean; lastActionTimestamp: number; }

export interface ITutorialSystem { init(state: TutorialState): void; startTutorial(tutorialId: string): TutorialStep | null; advanceTutorial(): TutorialStep | null; completeTutorial(tutorialId: string): void; getHint(context: string, timeSinceLastAction: number): string | null; getGlossaryEntry(term: string): string | null; searchGlossary(query: string): { term: string; definition: string }[]; getState(): TutorialState; markSeen(tutorialId: string): void; }

export const MAX_LEVEL = 30; export const PROMOTION_LEVEL = 15; export const EXP_PER_LEVEL = 100; export const MAX_INVENTORY_SLOTS = 5; export const MAX_SP = 100; export const SP_REGEN_PERCENT = 10; export const WEAPON_TRIANGLE_HIT_BONUS = 15; export const WEAPON_TRIANGLE_DAMAGE_BONUS = 1; export const CRIT_MULTIPLIER = 3; export const DOUBLE_ATTACK_SPEED_THRESHOLD = 5; export const HEIGHT_ADVANTAGE_HIT_BONUS = 15; export const SUPPORT_HIT_EVADE_BONUS_PER_ALLY = 10; export const ZONE_OF_CONTROL_EXTRA_COST = 3; export const KILL_EXP_BONUS = 30;
```

## Detailed Requirements

### 1. Tutorial System (`tutorialSystem.ts`)

- `init(state)`: Initialize with existing tutorial state (which tutorials seen, current position).
- `startTutorial(tutorialId)`: Begin a tutorial sequence. Return first TutorialStep, or null if already seen and hintsEnabled is false.
- `advanceTutorial()`: Move to next step in current tutorial. Return next TutorialStep or null if tutorial complete.
- `completeTutorial(tutorialId)`: Mark tutorial as complete. Add to seenTutorials.
- `markSeen(tutorialId)`: Mark as seen without completing all steps.
- `getState()`: Return current TutorialState.

### 2. Tutorial Steps (`tutorialSteps.ts`)

Define tutorial sequences as TutorialStep chains. Each tutorial is a series of steps linked by nextStepId.

**Required Tutorial Sequences:**

1. **movement_tutorial** (6 steps): How to select a unit, view movement range, select destination, confirm move, end turn.
   - Step 1: "Select a unit" — highlight a player unit position
   - Step 2: "View movement range" — explain blue tiles
   - Step 3: "Choose destination" — click a blue tile
   - Step 4: "Confirm or cancel" — explain action menu
   - Step 5: "Wait or act" — explain wait vs attack
   - Step 6: "End your turn" — explain end turn

2. **combat_tutorial** (5 steps): How to initiate attack, read battle forecast, confirm attack, counter-attacks, experience.
   - Step 1: "Move near an enemy" — highlight attack range (red tiles)
   - Step 2: "Select Attack" — explain action menu
   - Step 3: "Read the forecast" — explain damage/hit/crit preview
   - Step 4: "Confirm attack" — watch combat play out
   - Step 5: "Experience points" — explain EXP and leveling

3. **item_tutorial** (4 steps): How to use items, equip weapons, trade between units.
   - Step 1: "Open inventory" — explain Item action
   - Step 2: "Use a vulnerary" — explain consumables
   - Step 3: "Equip a weapon" — explain weapon switching
   - Step 4: "Trade items" — explain trading with adjacent units

4. **terrain_tutorial** (3 steps): Terrain bonuses, movement costs, height advantage.
   - Step 1: "Terrain matters" — explain defense/evasion bonuses
   - Step 2: "Movement costs" — explain different terrain slows movement
   - Step 3: "Height advantage" — explain elevation bonuses

5. **skills_tutorial** (3 steps): How to use active skills, SP management.
   - Step 1: "Skills menu" — explain skill action
   - Step 2: "SP costs" — explain SP as a resource
   - Step 3: "Targeting" — explain AoE patterns

6. **promotion_tutorial** (2 steps): When and how to promote units.
   - Step 1: "Promotion eligible" — explain level 15 requirement
   - Step 2: "Choose promotion path" — explain branching class changes

Export: `TUTORIAL_SEQUENCES: Record<string, TutorialStep[]>` and `getTutorialSteps(tutorialId: string): TutorialStep[]`.

### 3. Glossary (`glossary.ts`)

Define a glossary of 50+ game terms. Each entry has a term and definition.

**Required glossary entries (minimum):**

- **Weapon Triangle**: "Swords beat Axes, Axes beat Lances, Lances beat Swords. Advantage gives +15 hit and +1 damage."
- **Magic Triangle**: "Fire beats Wind, Wind beats Thunder, Thunder beats Fire. Same bonuses as weapon triangle."
- **Terrain Bonus**: "Standing on certain terrain grants defense and evasion bonuses. Forests give +1 Def and +20 Eva."
- **Movement Cost**: "Each terrain type has a movement cost. Forest costs 2 for foot units. Mountains cost 4."
- **Height Advantage**: "Attacking from higher terrain gives +15% hit rate. Attacking upward gives -15% hit rate."
- **Zone of Control**: "Moving through tiles adjacent to enemies costs 3 extra movement points."
- **Counter-attack**: "If the defender has a weapon that can reach the attacker, they will counter-attack."
- **Double Attack**: "If a unit's Speed exceeds the target's by 5 or more, they attack twice."
- **Critical Hit**: "A critical hit deals 3x normal damage. Crit rate = Skill/2 + Weapon Crit - Enemy Luck."
- **Support Bonus**: "Adjacent allied units provide +10% hit and evasion per adjacent ally."
- **Effective Damage**: "Weapons effective against a unit type (e.g., Horseslayer vs Mounted) deal 3x weapon might."
- **Fog of War**: "In fog, you can only see tiles within your units' vision range."
- **Deployment**: "Before battle, place your units on the blue deployment zones."
- **Promotion**: "At level 15, units can promote to an advanced class using a promotion item."
- **Growth Rates**: "Each stat has a growth rate (%) — the chance that stat increases by 1 on level up."
- **Durability**: "Weapons break after a certain number of uses. Iron weapons last 45 uses."
- **Convoy**: "Shared item storage accessible between battles and by the Lord unit during battle."
- **Support Rank**: "Fight alongside allies to build support points. At thresholds, unlock C/B/A conversations."
- **Status Effects**: Define each: Poison, Sleep, Silence, Berserk, Charm, Frozen, Blind, Stun.
- **Victory Conditions**: Rout, Boss Kill, Survive, Reach Location, Protect Target.
- **Classes**: Brief description of each of the 12+ classes.
- **Stats**: Brief description of each stat (HP, Str, Mag, Skl, Spd, Lck, Def, Res, Mov).
- **Forging**: "Improve weapons at the forge by spending gold to add Might, Hit, or Crit bonuses."
- **Arena**: "Fight random opponents to earn gold and experience between chapters."

Functions:
- `getGlossaryEntry(term)`: Case-insensitive lookup. Return definition string or null.
- `searchGlossary(query)`: Return all entries whose term or definition contains the query (case-insensitive).
- `getAllGlossaryEntries()`: Return all entries sorted alphabetically.

### 4. Hint System (`hintSystem.ts`)

- `getHint(context, timeSinceLastAction)`: Return a contextual hint string if player is idle.
  - Only return hint if `timeSinceLastAction >= 10000` (10 seconds) and `hintsEnabled` is true.
  - Context-based hints:
    - `"unitSelect"` → "Select one of your units with blue highlight to begin their turn."
    - `"moveSelect"` → "Click a blue-highlighted tile to move your unit there."
    - `"actionSelect"` → "Choose an action: Attack, Skill, Item, Wait, or Trade."
    - `"targetSelect"` → "Select an enemy in range to attack. Red tiles show valid targets."
    - `"deploy"` → "Place your units on the blue deployment zones, then press Start."
    - `"baseCamp"` → "Manage your roster, buy items at the shop, or view support conversations."
    - `"worldMap"` → "Select a chapter node on the map to begin a mission."
  - If context doesn't match, return null.
  - Don't repeat the same hint within 30 seconds.

### 5. Tooltip Provider (`tooltipProvider.ts`)

- `getTooltipForTerrain(terrainType)`: Return string describing the terrain's effects.
- `getTooltipForStat(statName)`: Return string describing what the stat does.
- `getTooltipForStatus(statusType)`: Return string describing the status effect.
- `getTooltipForWeaponType(weaponType)`: Return string with weapon triangle info.
- `getTooltipForClass(className)`: Return string with class description.

## Test Requirements

Write Vitest tests in `src/tutorial/__tests__/`:

1. **tutorialSystem.test.ts**: Init, start tutorial, advance steps, complete, markSeen, already-seen check, state management.
2. **tutorialSteps.test.ts**: All 6 tutorial sequences exist, steps are properly linked, no broken nextStepId chains.
3. **glossary.test.ts**: Lookup by exact term, case-insensitive lookup, search returns matches, all 50+ entries exist.
4. **hintSystem.test.ts**: Hint returned after 10s idle, no hint before 10s, context-specific hints, no repeat within 30s, disabled when hintsEnabled=false.
5. **tooltipProvider.test.ts**: Tooltip for each terrain type, each stat, each status effect, each weapon type, each class.

Target: 60+ tests.

## What This Domain Should NOT Touch

- Do NOT modify files outside `src/tutorial/`.
- Do NOT import from any other domain.
- Only import from `../../shared/types`.
- Do NOT implement game logic, combat, rendering, or data definitions.

## Completion

When finished, write `tutorial_DONE.md` in the project root with:
- List of all files created
- Number of tests passing
- Any notes about implementation decisions

## Worker Launch Command

For sub-tasks within this domain, use:
```bash
codex exec --full-auto --skip-git-repo-check -C $(pwd) "$(cat specs/tutorial/worker_N.md)"
```

## Scope Enforcement

After making changes, run:
```bash
git diff --name-only | grep -v '^src/tutorial/' | xargs -r git checkout --
git add src/tutorial/
```
