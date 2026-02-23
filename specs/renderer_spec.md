# Renderer Domain Spec

## Domain Objective

The Renderer domain provides canvas-based rendering for all game views in Shattered Throne. It renders the battle grid with terrain, units with health bars, movement/attack/danger overlays, combat animations, damage numbers, all UI screens (title, world map, base camp, unit info, shop, dialogue, etc.), and manages a camera system with pan/zoom. It also provides a tween-based animation system with screen shake, particle effects, and fade transitions.

## Owned Directories

- `src/renderer/` — ALL files in this directory are owned by this domain exclusively.
- Do NOT create or modify files outside `src/renderer/`.

## Required Exports

From `src/renderer/index.ts`, export:

```typescript
export { createRenderer } from './renderer';
// createRenderer: () => IRenderer
```

The returned object must implement every method of the `IRenderer` interface from `src/shared/types.ts`.

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

export interface IRenderer { init(canvas: HTMLCanvasElement): void; renderBattle(map: GridMap, units: Unit[], state: CombatState, camera: Camera, overlays: RenderOverlay[]): void; renderUI(screen: UIScreen, data: unknown): void; renderDialogue(lines: DialogueLine[], currentIndex: number): void; renderBattleForecast(forecast: BattleForecast, attacker: Unit, defender: Unit): void; renderLevelUp(result: LevelUpResult, unit: Unit): void; playAnimation(request: AnimationRequest): Promise<void>; setCamera(camera: Camera): void; getCamera(): Camera; screenToGrid(screenX: number, screenY: number, camera: Camera, gridType: GridType): Position; gridToScreen(pos: Position, camera: Camera, gridType: GridType): { x: number; y: number }; }

export const MAX_LEVEL = 30; export const PROMOTION_LEVEL = 15; export const EXP_PER_LEVEL = 100; export const MAX_INVENTORY_SLOTS = 5; export const MAX_SP = 100;
```

## Detailed Requirements

### 1. Renderer Core (`renderer.ts`)

- `init(canvas)`: Store canvas reference, get 2D context, set default dimensions (960x640).
- `setCamera(camera)`: Update camera state.
- `getCamera()`: Return current camera.
- `screenToGrid(screenX, screenY, camera, gridType)`: Convert screen pixel coordinates to grid position accounting for camera offset and zoom. Tile size: 48px for square, hex tiles with 48px width.
- `gridToScreen(pos, camera, gridType)`: Convert grid position to screen pixel coordinates.

### 2. Grid Renderer (`gridRenderer.ts`)

Render the battle grid:

**Tile Colors by Terrain:**
| Terrain   | Color          |
|-----------|----------------|
| Plains    | #90C060        |
| Forest    | #408030        |
| Mountain  | #A08060        |
| Water     | #4080D0        |
| Lava      | #D04020        |
| Fortress  | #808090        |
| Bridge    | #B09060        |
| Swamp     | #607048        |
| Sand      | #D0C080        |
| Snow      | #E0E8F0        |
| Void      | #202020        |

- Draw grid lines (thin, semi-transparent).
- Draw terrain symbols: trees for forest, triangles for mountains, waves for water, etc. (simple geometric shapes, no images).
- Render deployment zones as blue-outlined tiles during deploy phase.
- Support both square and hex grid rendering.

### 3. Unit Renderer (`unitRenderer.ts`)

Render units on the grid:

- Each unit is a colored circle/shape:
  - Player units: blue fill
  - Enemy units: red fill
  - Ally NPC units: green fill
- Class icon inside: single letter abbreviation (W for Warrior, K for Knight, A for Archer, M for Mage, C for Cleric, T for Thief, etc.)
- Health bar below unit: green/yellow/red based on HP%.
- Greyed out if unit has already acted this turn.
- Boss units: slightly larger with gold border.
- Status effect icons: small colored dots (purple=poison, blue=sleep, etc.).
- Selected unit: pulsing highlight.

### 4. Overlay Renderer (`overlayRenderer.ts`)

Render tile overlays:
- Movement range: blue semi-transparent tiles (rgba(0, 100, 255, 0.3)).
- Attack range: red semi-transparent tiles (rgba(255, 0, 0, 0.3)).
- Danger zone: orange semi-transparent tiles (rgba(255, 165, 0, 0.2)).
- Heal range: green semi-transparent tiles (rgba(0, 255, 0, 0.3)).
- Cursor: white bordered highlight on cursor position.

### 5. Animation System (`animationSystem.ts`)

- `playAnimation(request)`: Return a Promise that resolves when animation completes.
- Animation types:
  - **move**: Tween unit from fromPosition to toPosition over durationMs. Use ease-in-out.
  - **attack**: Slide unit 50% toward target, then back. Quick (200ms).
  - **damage**: Flash unit red, show floating damage number that rises and fades.
  - **heal**: Flash unit green, show floating heal number.
  - **levelUp**: Yellow glow effect around unit, show "Level Up!" text.
  - **death**: Unit fades to transparent over 500ms.
  - **screenShake**: Offset camera randomly ±5px for durationMs.
  - **fade**: Full-screen fade to/from black.
  - **particle**: Spawn N small particles at position with random velocity, fade out.

### 6. Tween Engine (`tweenEngine.ts`)

- Linear, ease-in, ease-out, ease-in-out interpolation functions.
- `createTween(from, to, duration, easing)`: Returns object with `update(dt)` → current value and `isComplete` flag.
- Used by animation system for smooth movement.

### 7. Particle System (`particleSystem.ts`)

- `createParticleEmitter(position, color, count, speed, lifetime)`: Create particles.
- Each particle: position, velocity, color, alpha, lifetime.
- `updateParticles(dt)`: Move particles, reduce alpha, remove dead ones.
- `renderParticles(ctx)`: Draw all active particles as small circles.

### 8. Battle UI Renderer

**Battle Forecast (`battleForecastRenderer.ts`):**
- Two panels side by side: attacker (left) vs defender (right).
- Show: name, HP, damage, hit%, crit%, "×2" if doubles.
- Color-coded: good stats green, bad stats red.

**Combat Log (`combatLogRenderer.ts`):**
- Scrollable sidebar on the right.
- Each entry: turn number, message text.
- Auto-scroll to latest entry.

**Turn Banner (`turnBannerRenderer.ts`):**
- "Player Phase" / "Enemy Phase" / "Ally Phase" banner.
- Slides in from top, holds 1 second, slides out.

### 9. UI Screen Renderers

**Title Screen (`titleScreenRenderer.ts`):**
- Game title "Shattered Throne" in large text, centered.
- Animated background: slowly scrolling gradient.
- Menu options: New Game, Continue, Settings.

**World Map (`worldMapRenderer.ts`):**
- Node graph: circles for nodes, lines for connections.
- Completed nodes: filled gold. Unlocked: filled blue. Locked: filled gray.
- Current node: pulsing.

**Dialogue Box (`dialogueRenderer.ts`):**
- Bottom 25% of screen, dark semi-transparent background.
- Speaker name in bold, left-aligned.
- Text below, typewriter effect (reveal one character at a time).
- "Press Enter to continue" prompt.

**Unit Info (`unitInfoRenderer.ts`):**
- Full stat page: all stats listed, equipment shown, skills listed.

**Shop UI (`shopRenderer.ts`):**
- Item list on left, item details on right.
- Buy/sell buttons, gold display.

**Level Up Display (`levelUpRenderer.ts`):**
- Stat comparison: old stat → new stat, green arrows for gains.
- New skill notification if applicable.

**Save/Load Menu (`saveLoadRenderer.ts`):**
- 3 save slots, each showing chapter name and timestamp.

**Settings Menu (`settingsRenderer.ts`):**
- Volume sliders: Master, Music, SFX.
- Toggle: Animations on/off.
- Speed setting.

### 10. Mini-map (`minimapRenderer.ts`)

- Small (150x150) overview in corner for large maps.
- Shows terrain colors at reduced resolution.
- Unit dots: blue/red/green.
- Viewport rectangle showing current camera view.

### 11. Camera System (`camera.ts`)

- Smooth camera movement: lerp from current to target position each frame.
- Pan with arrow keys (handled externally, camera just stores state).
- Zoom levels: 0.5x, 0.75x, 1.0x, 1.5x, 2.0x.
- Center on unit: set target to unit position.
- Clamp to map bounds.

## Test Requirements

NOTE: Since Canvas API is not available in Node.js, renderer tests should be minimal. Focus on testing pure logic functions:

Write Vitest tests in `src/renderer/__tests__/`:

1. **coordinates.test.ts**: screenToGrid and gridToScreen conversions, with various camera positions and zoom levels, for both square and hex grids.
2. **tweenEngine.test.ts**: Linear interpolation, ease-in, ease-out, ease-in-out, completion detection.
3. **particleSystem.test.ts**: Particle creation, update, lifetime expiry, removal.
4. **camera.test.ts**: Camera lerp, zoom clamping, map bounds clamping.
5. **terrainColors.test.ts**: Each terrain type maps to correct color.

Target: 40+ tests for pure logic. No tests for canvas draw calls.

## What This Domain Should NOT Touch

- Do NOT modify files outside `src/renderer/`.
- Do NOT import from any other domain.
- Only import from `../../shared/types`.
- Do NOT implement game logic, combat formulas, pathfinding, or AI.
- The renderer is purely visual: it receives all data as parameters and draws it.

## Completion

When finished, write `renderer_DONE.md` in the project root with:
- List of all files created
- Number of tests passing
- Any notes about implementation decisions

## Worker Launch Command

For sub-tasks within this domain, use:
```bash
codex exec --full-auto --skip-git-repo-check -C $(pwd) "$(cat specs/renderer/worker_N.md)"
```

## Scope Enforcement

After making changes, run:
```bash
git diff --name-only | grep -v '^src/renderer/' | xargs -r git checkout --
git add src/renderer/
```
