# Audio & Effects Domain Spec

## Domain Objective

The Audio domain provides procedural sound effects and music using the Web Audio API. It generates retro-style synthesized SFX for all game events (sword swing, arrow fire, magic cast, hit, critical, level up, etc.) and procedural ambient music loops per game context. It manages volume controls persisted to localStorage and supports sound queuing for combat resolution sequences.

## Owned Directories

- `src/audio/` — ALL files in this directory are owned by this domain exclusively.
- Do NOT create or modify files outside `src/audio/`.

## Required Exports

From `src/audio/index.ts`, export:

```typescript
export { createAudioSystem } from './audioSystem';
// createAudioSystem: () => IAudioSystem
```

The returned object must implement every method of the `IAudioSystem` interface from `src/shared/types.ts`.

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
export enum UIScreen { Title = 'title', WorldMap = 'worldMap', BaseCamp = 'baseCamp', Battle = 'battle', UnitInfo = 'unitInfo', Shop = 'shop', Forge = 'forge', SaveLoad = 'saveLoad', Settings = 'settings', Dialogue = 'dialogue', BattleForecast = 'battleForecast', CombatLog = 'combatLog', Inventory = 'inventory' }
export enum SupportRank { None = 'none', C = 'C', B = 'B', A = 'A' }
export enum Weather { Clear = 'clear', Rain = 'rain', Fog = 'fog', Snow = 'snow' }
export enum SoundEffectType { SwordSwing = 'swordSwing', ArrowFire = 'arrowFire', MagicCast = 'magicCast', HitImpact = 'hitImpact', CriticalHit = 'criticalHit', LevelUp = 'levelUp', MenuSelect = 'menuSelect', CursorMove = 'cursorMove', Heal = 'heal', Miss = 'miss', Death = 'death' }
export enum MusicContext { Title = 'title', WorldMap = 'worldMap', BaseCamp = 'baseCamp', BattlePlayer = 'battlePlayer', BattleEnemy = 'battleEnemy', BossBattle = 'bossBattle', Victory = 'victory', Defeat = 'defeat', Story = 'story', Shop = 'shop' }
export enum Element { Fire = 'fire', Wind = 'wind', Thunder = 'thunder', Dark = 'dark', Light = 'light' }
export enum MovementType { Foot = 'foot', Mounted = 'mounted', Armored = 'armored', Flying = 'flying' }
export enum Direction { North = 'north', South = 'south', East = 'east', West = 'west', NorthEast = 'northEast', NorthWest = 'northWest', SouthEast = 'southEast', SouthWest = 'southWest' }

export interface Position { x: number; y: number; }
export interface TerrainData { type: TerrainType; movementCost: Record<MovementType, number>; defenseBonus: number; evasionBonus: number; heightLevel: number; passable: Record<MovementType, boolean>; }
export interface Tile { position: Position; terrain: TerrainData; occupantId: string | null; itemId: string | null; isChest: boolean; isDoor: boolean; isDeploymentZone: boolean; fogRevealed: boolean; }
export interface GridMap { id: string; name: string; width: number; height: number; gridType: GridType; tiles: Tile[][]; deploymentZones: Position[]; }
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
export interface PassiveEffect { type: string; condition?: string; value: number; }
export interface SkillDefinition { id: string; name: string; description: string; type: SkillType; spCost: number; range: { min: number; max: number }; aoePattern: AoEPattern; aoeSize: number; damage?: { base: number; scaling: 'strength' | 'magic' }; healing?: { base: number; scaling: 'magic' }; buff?: { stats: Partial<Stats>; duration: number }; debuff?: { stats: Partial<Stats>; duration: number }; statusEffect?: { type: StatusEffectType; chance: number; duration: number }; passiveEffect?: PassiveEffect; classRestriction?: UnitClassName[]; }
export interface ActiveStatusEffect { type: StatusEffectType; remainingTurns: number; sourceUnitId: string; }
export interface Unit { id: string; name: string; characterId: string; className: UnitClassName; level: number; exp: number; currentStats: Stats; maxHP: number; currentHP: number; currentSP: number; maxSP: number; growthRates: GrowthRates; inventory: Inventory; skills: string[]; activeStatusEffects: ActiveStatusEffect[]; position: Position | null; hasMoved: boolean; hasActed: boolean; isAlive: boolean; team: 'player' | 'enemy' | 'ally'; aiBehavior?: AIBehavior; supportRanks: Record<string, SupportRank>; supportPoints: Record<string, number>; killCount: number; movementType: MovementType; }
export interface BattleForecast { attackerDamage: number; attackerHit: number; attackerCrit: number; attackerDoubles: boolean; defenderDamage: number; defenderHit: number; defenderCrit: number; defenderDoubles: boolean; defenderCanCounter: boolean; }
export interface CombatRound { attacker: string; damage: number; hit: boolean; crit: boolean; attackerHPAfter: number; defenderHPAfter: number; }
export interface CombatResult { attackerId: string; defenderId: string; rounds: CombatRound[]; attackerExpGained: number; defenderExpGained: number; attackerLevelUp: LevelUpResult | null; defenderLevelUp: LevelUpResult | null; }
export interface CombatAction { type: 'attack' | 'skill' | 'item' | 'wait' | 'trade' | 'rescue' | 'visit'; unitId: string; targetPosition?: Position; targetUnitId?: string; skillId?: string; itemIndex?: number; }
export interface CombatLogEntry { turnNumber: number; phase: TurnPhase; message: string; timestamp: number; }
export interface UndoAction { unitId: string; previousPosition: Position; previousHasMoved: boolean; }
export interface CombatState { phase: TurnPhase; stateType: CombatStateType; turnNumber: number; selectedUnitId: string | null; movementRange: Position[]; attackRange: Position[]; dangerZone: Position[]; cursorPosition: Position; combatLog: CombatLogEntry[]; undoStack: UndoAction[]; }
export interface LevelUpResult { unitId: string; newLevel: number; statGains: Partial<Stats>; newSkills: string[]; }
export interface PromotionResult { unitId: string; oldClass: UnitClassName; newClass: UnitClassName; statBonuses: Partial<Stats>; newWeaponTypes: WeaponType[]; newSkills: string[]; }
export interface ExpGain { unitId: string; amount: number; source: 'damage' | 'kill' | 'heal' | 'objective' | 'other'; }
export interface DialogueLine { speaker: string; text: string; emotion?: 'neutral' | 'happy' | 'angry' | 'sad' | 'surprised'; }
export interface NarrativeEvent { trigger: 'preBattle' | 'postBattle' | { type: 'turn'; turn: number } | { type: 'location'; position: Position } | { type: 'unitDefeated'; unitId: string }; dialogue: DialogueLine[]; }
export interface EnemyPlacement { characterId: string; className: UnitClassName; level: number; position: Position; equipment: string[]; aiBehavior: AIBehavior; isBoss: boolean; dropItemId?: string; }
export interface VictoryConditionDef { type: VictoryCondition; targetUnitId?: string; targetPosition?: Position; surviveTurns?: number; }
export interface DefeatConditionDef { type: DefeatCondition; protectedUnitId?: string; turnLimit?: number; }
export interface ChapterRewards { goldReward: number; expBonus: number; itemRewards: string[]; unlockedChapters: string[]; }
export interface ChapterDefinition { id: string; number: number; title: string; description: string; mapId: string; deploymentSlots: Position[]; maxDeployments: number; enemies: EnemyPlacement[]; allies: EnemyPlacement[]; victoryConditions: VictoryConditionDef[]; defeatConditions: DefeatConditionDef[]; reinforcements: ReinforcementTrigger[]; treasures: TreasureLocation[]; narrative: NarrativeEvent[]; weather: Weather; rewards: ChapterRewards; nextChapterId: string | null; branchOptions?: { choiceText: string; nextChapterId: string }[]; }
export interface ReinforcementTrigger { condition: { type: 'turn'; turn: number } | { type: 'event'; eventId: string }; enemies: EnemyPlacement[]; }
export interface TreasureLocation { position: Position; itemId: string; requiresKey: boolean; }
export interface WorldMapNode { id: string; chapterId: string; position: Position; connections: string[]; type: 'story' | 'paralogue' | 'shop' | 'arena'; unlocked: boolean; completed: boolean; }
export interface SupportConversation { characterA: string; characterB: string; rank: SupportRank; dialogue: DialogueLine[]; requiredBattlesTogether: number; }
export interface CharacterDefinition { id: string; name: string; backstory: string; className: UnitClassName; baseLevel: number; baseStats: Stats; personalGrowthBonuses: Partial<GrowthRates>; personalSkills: string[]; startingEquipment: string[]; recruitChapter: string; recruitCondition?: string; isLord: boolean; portraitColor: string; supportPartners: string[]; }
export interface CampaignState { currentChapterId: string; completedChapters: string[]; unlockedChapters: string[]; roster: Unit[]; convoy: ItemInstance[]; gold: number; turnCount: number; supportLog: Record<string, SupportRank>; achievements: string[]; worldMapNodes: WorldMapNode[]; currentRoute?: string; playtimeSeconds: number; }
export interface BattleSaveData { chapterId: string; grid: GridMap; units: Unit[]; combatState: CombatState; turnNumber: number; }
export interface SaveData { version: string; timestamp: number; slotIndex: number; campaign: CampaignState; battleState?: BattleSaveData; }
export interface AudioConfig { masterVolume: number; musicVolume: number; sfxVolume: number; muted: boolean; }
export interface SoundRequest { type: SoundEffectType; volume?: number; }
export interface MusicRequest { context: MusicContext; fadeInMs?: number; fadeOutMs?: number; }
export interface Camera { x: number; y: number; zoom: number; targetX: number; targetY: number; targetZoom: number; }
export interface AnimationRequest { type: 'move' | 'attack' | 'damage' | 'heal' | 'levelUp' | 'death' | 'screenShake' | 'fade' | 'particle'; unitId?: string; fromPosition?: Position; toPosition?: Position; value?: number; color?: string; durationMs: number; }
export interface RenderOverlay { type: 'movement' | 'attack' | 'danger' | 'heal'; positions: Position[]; color: string; opacity: number; }
export interface TutorialStep { id: string; title: string; text: string; highlightPosition?: Position; highlightUI?: string; requiredAction?: string; nextStepId: string | null; }
export interface TutorialState { seenTutorials: string[]; currentTutorialId: string | null; currentStepId: string | null; hintsEnabled: boolean; lastActionTimestamp: number; }

export interface IAudioSystem { init(): Promise<void>; playSFX(request: SoundRequest): void; playMusic(request: MusicRequest): void; stopMusic(fadeOutMs?: number): void; setConfig(config: AudioConfig): void; getConfig(): AudioConfig; queueSFX(requests: SoundRequest[]): void; }

export const MAX_LEVEL = 30; export const PROMOTION_LEVEL = 15; export const EXP_PER_LEVEL = 100; export const MAX_INVENTORY_SLOTS = 5; export const MAX_SP = 100; export const SP_REGEN_PERCENT = 10; export const WEAPON_TRIANGLE_HIT_BONUS = 15; export const WEAPON_TRIANGLE_DAMAGE_BONUS = 1; export const MAGIC_TRIANGLE_HIT_BONUS = 15; export const MAGIC_TRIANGLE_DAMAGE_BONUS = 1; export const CRIT_MULTIPLIER = 3; export const DOUBLE_ATTACK_SPEED_THRESHOLD = 5; export const HEIGHT_ADVANTAGE_HIT_BONUS = 15; export const HEIGHT_DISADVANTAGE_HIT_PENALTY = 15; export const SUPPORT_HIT_EVADE_BONUS_PER_ALLY = 10; export const ZONE_OF_CONTROL_EXTRA_COST = 3; export const KILL_EXP_BONUS = 30; export const MAX_PARTY_SIZE = 12; export const MAX_DEPLOY_SIZE = 8; export const POISON_HP_PERCENT = 10; export const BERSERK_ATTACK_BONUS_PERCENT = 50; export const RAIN_BOW_HIT_PENALTY = 20; export const SAVE_VERSION = '1.0.0'; export const NUM_SAVE_SLOTS = 3;
```

## Detailed Requirements

### 1. Audio System Core (`audioSystem.ts`)

Factory function `createAudioSystem(): IAudioSystem`.

- `init()`: Create AudioContext (lazy init on first user interaction to comply with browser autoplay policy). Load default config from localStorage.
- `playSFX(request)`: Generate and play a sound effect immediately. Apply volume: `sfxVolume * masterVolume * (request.volume ?? 1)`. If muted, do nothing.
- `playMusic(request)`: Start a music loop for the given context. If already playing music, crossfade (fade out old with `fadeOutMs`, fade in new with `fadeInMs`, defaults 500ms).
- `stopMusic(fadeOutMs)`: Fade out current music over fadeOutMs (default 500ms).
- `setConfig(config)`: Update volume settings, save to localStorage key `audio_config`.
- `getConfig()`: Return current AudioConfig.
- `queueSFX(requests)`: Play SFX in sequence with ~100ms gap between each. Used for combat resolution (hit, hit, crit sequence).

### 2. SFX Generator (`sfxGenerator.ts`)

Generate retro-style synthesized sound effects using OscillatorNode + GainNode. Each effect is defined by frequency, waveform, duration, and envelope parameters.

**Sound Effect Definitions:**

- **SwordSwing**: Short sine sweep from 400Hz→200Hz over 100ms. Quick attack, quick decay.
- **ArrowFire**: White noise burst 50ms + sine at 800Hz for 30ms. Twang effect.
- **MagicCast**: Sine chord (fundamental + 5th) sweeping up from 300Hz→1000Hz over 300ms with reverb-like decay.
- **HitImpact**: Square wave 150Hz for 50ms + noise burst 30ms. Punchy.
- **CriticalHit**: HitImpact but louder, with added sine at 100Hz for 80ms. Screen-shake worthy.
- **LevelUp**: Ascending arpeggio: C5-E5-G5-C6, each 100ms, sawtooth wave. Celebratory.
- **MenuSelect**: Short sine blip at 600Hz, 50ms.
- **CursorMove**: Very short sine blip at 400Hz, 30ms, low volume.
- **Heal**: Soft sine sweep upward 400Hz→800Hz over 200ms, triangle wave. Gentle.
- **Miss**: Quick descending tone 500Hz→200Hz, 80ms. Whoosh/whiff.
- **Death**: Low square wave 100Hz→50Hz over 300ms, slow decay.

Each sound effect should be a function that takes AudioContext and creates the appropriate nodes.

### 3. Music Generator (`musicGenerator.ts`)

Generate procedural ambient music loops. Each context has a distinct mood:

- **Title**: Slow arpeggiated minor chord progression (Am - F - C - G). 4 bars, loop. Use sine wave, gentle.
- **WorldMap**: Open and adventurous. Major key arpeggios (C - G - Am - F). Moderate tempo.
- **BaseCamp**: Calm, peaceful. Soft pads (low-frequency sine chords). Slow.
- **BattlePlayer**: Tense, rhythmic. Driving bass line + staccato melody. Minor key. Fast tempo.
- **BattleEnemy**: More ominous version of battle music. Lower register.
- **BossBattle**: Intense. Fast bass + tremolo strings effect. Diminished chords.
- **Victory**: Triumphant fanfare. Major key ascending. Short loop.
- **Defeat**: Somber descending minor progression. Slow.
- **Story**: Gentle, emotional. Piano-like tones. Moderate.
- **Shop**: Upbeat, casual. Major key bouncy rhythm.

Implementation approach:
- Each track is a function that creates a looping pattern using `OscillatorNode`, `GainNode`, and scheduling via `AudioContext.currentTime`.
- Use `setValueAtTime` and `linearRampToValueAtTime` for note shaping.
- Loop by recursively scheduling the next bar.

### 4. Volume Manager (`volumeManager.ts`)

- Store AudioConfig in memory and localStorage.
- `saveConfig(config)`: Serialize to localStorage key `audio_config`.
- `loadConfig()`: Deserialize from localStorage. Return defaults if not found: `{ masterVolume: 0.7, musicVolume: 0.5, sfxVolume: 0.8, muted: false }`.
- Apply volume changes immediately to active GainNodes.

### 5. Sound Queue (`soundQueue.ts`)

- `queueSFX(requests)`: Schedule sounds to play in sequence.
- Maintain an internal queue. When first sound finishes, play next.
- Gap between sounds: ~100ms.
- Used during combat resolution to sequence: attack sound → hit/miss → damage → possible counter.

## Test Requirements

Write Vitest tests in `src/audio/__tests__/`:

NOTE: Since Web Audio API is not available in Node.js test environment, tests must mock `AudioContext`, `OscillatorNode`, and `GainNode`. Create mock classes that track method calls.

1. **audioSystem.test.ts**: Init, playSFX calls sfxGenerator, playMusic starts loop, stopMusic fades, config save/load, mute check.
2. **sfxGenerator.test.ts**: Each SFX type creates correct oscillator settings (frequency, waveform, duration). Mock AudioContext.
3. **musicGenerator.test.ts**: Each music context creates appropriate loop structure. Mock AudioContext.
4. **volumeManager.test.ts**: Save/load config, default config, localStorage interaction.
5. **soundQueue.test.ts**: Queue processes in order, gap timing, empty queue handling.

Target: 50+ tests.

## What This Domain Should NOT Touch

- Do NOT modify files outside `src/audio/`.
- Do NOT import from any other domain.
- Only import from `../../shared/types`.
- Do NOT implement rendering, combat, or any game logic.
- Audio is event-driven: it receives `SoundRequest` and `MusicRequest` — it does not decide when to play sounds.

## Completion

When finished, write `audio_DONE.md` in the project root with:
- List of all files created
- Number of tests passing
- Any notes about implementation decisions

## Worker Launch Command

For sub-tasks within this domain, use:
```bash
codex exec --full-auto --skip-git-repo-check -C $(pwd) "$(cat specs/audio/worker_N.md)"
```

## Scope Enforcement

After making changes, run:
```bash
git diff --name-only | grep -v '^src/audio/' | xargs -r git checkout --
git add src/audio/
```
