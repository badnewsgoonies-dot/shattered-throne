# Campaign & Story Domain Spec

## Domain Objective

The Campaign domain manages campaign progression, story missions, world map navigation, base camp operations, narrative events, support conversations, and the save/load system. It tracks campaign state including completed chapters, unlocked content, roster, gold, and achievements. It defines the flow of 25 story chapters + 10 paralogues with branching paths.

## Owned Directories

- `src/campaign/` — ALL files in this directory are owned by this domain exclusively.
- Do NOT create or modify files outside `src/campaign/`.

## Required Exports

From `src/campaign/index.ts`, export:

```typescript
export { createCampaignSystem } from './campaignSystem';
// createCampaignSystem: (data: IDataProvider) => ICampaignSystem
```

## Full Type Contract (src/shared/types.ts)

**IMPORTANT: Import types from `../../shared/types`.**

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
export enum Element { Fire = 'fire', Wind = 'wind', Thunder = 'thunder', Dark = 'dark', Light = 'light' }
export enum MovementType { Foot = 'foot', Mounted = 'mounted', Armored = 'armored', Flying = 'flying' }

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
export interface ReinforcementTrigger { condition: { type: 'turn'; turn: number } | { type: 'event'; eventId: string }; enemies: EnemyPlacement[]; }
export interface TreasureLocation { position: Position; itemId: string; requiresKey: boolean; }
export interface ChapterRewards { goldReward: number; expBonus: number; itemRewards: string[]; unlockedChapters: string[]; }
export interface ChapterDefinition { id: string; number: number; title: string; description: string; mapId: string; deploymentSlots: Position[]; maxDeployments: number; enemies: EnemyPlacement[]; allies: EnemyPlacement[]; victoryConditions: VictoryConditionDef[]; defeatConditions: DefeatConditionDef[]; reinforcements: ReinforcementTrigger[]; treasures: TreasureLocation[]; narrative: NarrativeEvent[]; weather: Weather; rewards: ChapterRewards; nextChapterId: string | null; branchOptions?: { choiceText: string; nextChapterId: string }[]; }
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

export interface ICampaignSystem { startNewCampaign(): CampaignState; getChapter(chapterId: string): ChapterDefinition; completeChapter(state: CampaignState, chapterId: string, rewards: ChapterRewards): CampaignState; getAvailableChapters(state: CampaignState): string[]; addUnitToRoster(state: CampaignState, unit: Unit): CampaignState; removeUnitFromRoster(state: CampaignState, unitId: string): CampaignState; updateSupportPoints(state: CampaignState, charA: string, charB: string, points: number): CampaignState; updateSupportRank(state: CampaignState, charA: string, charB: string, rank: SupportRank): CampaignState; getSupportConversation(charA: string, charB: string, rank: SupportRank): SupportConversation | null; save(state: CampaignState, slotIndex: number): SaveData; load(slotIndex: number): SaveData | null; saveBattle(state: CampaignState, battleState: BattleSaveData, slotIndex: number): SaveData; getWorldMapNodes(state: CampaignState): WorldMapNode[]; }
export interface IDataProvider { getClassDefinition(className: UnitClassName): ClassDefinition; getAllClasses(): ClassDefinition[]; getWeapon(id: string): WeaponData | null; getAllWeapons(): WeaponData[]; getArmor(id: string): ArmorData | null; getAllArmor(): ArmorData[]; getConsumable(id: string): ConsumableData | null; getAllConsumables(): ConsumableData[]; getPromotionItem(id: string): PromotionItemData | null; getAllPromotionItems(): PromotionItemData[]; getItem(id: string): ItemData | null; getSkill(id: string): SkillDefinition | null; getAllSkills(): SkillDefinition[]; getChapter(id: string): ChapterDefinition | null; getAllChapters(): ChapterDefinition[]; getCharacter(id: string): CharacterDefinition | null; getAllCharacters(): CharacterDefinition[]; getMapData(id: string): GridMap | null; getAllMaps(): GridMap[]; getSupportConversations(charA: string, charB: string): SupportConversation[]; getAllSupportConversations(): SupportConversation[]; getEnemyTemplate(id: string): EnemyPlacement | null; getAllEnemyTemplates(): EnemyPlacement[]; validateAllData(): { valid: boolean; errors: string[] }; }

export const MAX_LEVEL = 30; export const PROMOTION_LEVEL = 15; export const EXP_PER_LEVEL = 100; export const MAX_INVENTORY_SLOTS = 5; export const MAX_SP = 100; export const SP_REGEN_PERCENT = 10; export const MAX_PARTY_SIZE = 12; export const MAX_DEPLOY_SIZE = 8; export const SAVE_VERSION = '1.0.0'; export const NUM_SAVE_SLOTS = 3;
```

## Detailed Requirements

### 1. Campaign System (`campaignSystem.ts`)

- `startNewCampaign()`: Initialize a fresh CampaignState with chapter 1 unlocked, empty roster, 0 gold, default world map nodes.
- `getChapter(chapterId)`: Delegate to data provider.
- `completeChapter(state, chapterId, rewards)`: Mark chapter complete, add gold, add item rewards to convoy, unlock next chapters per rewards.unlockedChapters, update world map node. Return new CampaignState.
- `getAvailableChapters(state)`: Return chapter IDs that are unlocked but not completed.

### 2. Chapter Manager (`chapterManager.ts`)

- Track campaign progression through 25 story chapters.
- Branching at chapter 12: two routes (A and B), reconverge at chapter 20.
- 10 paralogue chapters unlocked by conditions (e.g., "complete chapter 5 with unit X alive").
- Chapter flow: ch1 → ch2 → ... → ch11 → ch12 (branch) → ch12a/ch12b → ... → ch19a/ch19b → ch20 → ... → ch25.

### 3. World Map (`worldMap.ts`)

- Build world map from WorldMapNode data.
- `getWorldMapNodes(state)`: Return nodes with current unlock/complete status.
- Nodes include: story chapters, paralogue chapters, shops, arena.
- Connection graph: nodes only accessible if connected to a completed node.

### 4. Narrative Engine (`narrativeEngine.ts`)

- Process NarrativeEvent triggers for a chapter.
- `getNarrativeEvents(chapter, trigger)`: Return dialogue lines for a given trigger type.
- Triggers: preBattle, postBattle, turn N, location reached, unit defeated.

### 5. Support System (`supportSystem.ts`)

- `updateSupportPoints(state, charA, charB, points)`: Add support points. Key is sorted "charA-charB".
- `updateSupportRank(state, charA, charB, rank)`: Set rank.
- `getSupportConversation(charA, charB, rank)`: Look up from data provider.
- Rank thresholds: C = 20 points, B = 40 points, A = 60 points.

### 6. Save System (`saveSystem.ts`)

- `save(state, slotIndex)`: Create SaveData with version, timestamp, full campaign state. Serialize to localStorage key `save_slot_${slotIndex}`.
- `load(slotIndex)`: Read from localStorage, parse, validate version. Return null if no save.
- `saveBattle(state, battleState, slotIndex)`: Save with battle state for mid-combat suspend.
- NUM_SAVE_SLOTS = 3 slots.
- For tests, mock localStorage.

### 7. Base Camp (`baseCamp.ts`)

- Provide data structures for base camp operations between missions:
  - Roster management: select which units to deploy (up to MAX_DEPLOY_SIZE).
  - Access convoy.
  - View support log.
- This is data/logic only — no rendering.

## Test Requirements

Write Vitest tests in `src/campaign/__tests__/`:

1. **campaignSystem.test.ts**: New campaign, chapter completion, available chapters, gold/item rewards.
2. **chapterManager.test.ts**: Chapter progression, branching at ch12, paralogue unlocks.
3. **worldMap.test.ts**: Node connections, unlock progression, accessibility.
4. **narrativeEngine.test.ts**: Trigger matching, dialogue retrieval.
5. **supportSystem.test.ts**: Point accumulation, rank thresholds, conversation lookup.
6. **saveSystem.test.ts**: Save/load round-trip, battle save, invalid data, multiple slots.
7. **baseCamp.test.ts**: Roster selection, deployment limits.

Target: 80+ tests.

## What This Domain Should NOT Touch

- Do NOT modify files outside `src/campaign/`.
- Only import from `../../shared/types`.
- Do NOT implement combat, items, progression, or rendering.

## Completion

When finished, write `campaign_DONE.md` in the project root.

## Worker Launch Command

```bash
codex exec --full-auto --skip-git-repo-check -C $(pwd) "$(cat specs/campaign/worker_N.md)"
```

## Scope Enforcement

```bash
git diff --name-only | grep -v '^src/campaign/' | xargs -r git checkout --
git add src/campaign/
```
