# Combat Engine Domain Spec

## Domain Objective

The Combat Engine resolves all tactical combat in Shattered Throne. It implements physical and magical damage formulas, hit rate and crit rate calculations, weapon triangle and magic triangle bonuses, height advantage, support bonuses, counter-attacks, double attacks, skill execution, and the full combat state machine. It manages turn phases, undo, combat logging, victory/defeat condition checking, and EXP calculation.

## Owned Directories

- `src/combat/` — ALL files in this directory are owned by this domain exclusively.
- Do NOT create or modify files outside `src/combat/`.

## Required Exports

From `src/combat/index.ts`, export:

```typescript
export { createCombatEngine } from './combatEngine';
// createCombatEngine: () => ICombatEngine
```

The returned object must implement every method of the `ICombatEngine` interface from `src/shared/types.ts`.

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
export interface TutorialStep { id: string; title: string; text: string; highlightPosition?: Position; highlightUI?: string; requiredAction?: string; nextStepId: string | null; }
export interface TutorialState { seenTutorials: string[]; currentTutorialId: string | null; currentStepId: string | null; hintsEnabled: boolean; lastActionTimestamp: number; }

export interface IGridEngine { createGrid(width: number, height: number, gridType: GridType): GridMap; loadMap(mapDef: GridMap): GridMap; getTile(map: GridMap, pos: Position): Tile | null; setOccupant(map: GridMap, pos: Position, unitId: string | null): GridMap; getMovementRange(map: GridMap, start: Position, movement: number, movementType: MovementType, units: Unit[]): Position[]; getAttackRange(map: GridMap, positions: Position[], minRange: number, maxRange: number): Position[]; findPath(map: GridMap, start: Position, end: Position, movement: number, movementType: MovementType, units: Unit[]): Position[] | null; getLineOfSight(map: GridMap, from: Position, to: Position): boolean; getAdjacentPositions(map: GridMap, pos: Position): Position[]; getDistance(a: Position, b: Position, gridType: GridType): number; applyFogOfWar(map: GridMap, team: 'player' | 'enemy' | 'ally', units: Unit[]): GridMap; calculateDangerZone(map: GridMap, enemies: Unit[]): Position[]; serializeMap(map: GridMap): string; deserializeMap(data: string): GridMap; }
export interface IUnitSystem { createUnit(characterDef: CharacterDefinition, classDef: ClassDefinition): Unit; createEnemyUnit(placement: EnemyPlacement, classDef: ClassDefinition, items: ItemData[]): Unit; getEffectiveStats(unit: Unit, equippedWeapon: WeaponData | null, equippedArmor: ArmorData[]): Stats; applyDamage(unit: Unit, damage: number): Unit; applyHealing(unit: Unit, amount: number): Unit; applyStatusEffect(unit: Unit, effect: ActiveStatusEffect): Unit; tickStatusEffects(unit: Unit): Unit; resetTurnState(unit: Unit): Unit; getEquippedWeapon(unit: Unit, items: ItemData[]): WeaponData | null; getEquippedArmor(unit: Unit, items: ItemData[]): ArmorData[]; canUseWeapon(unit: Unit, weapon: WeaponData, classDef: ClassDefinition): boolean; calculateAIAction(unit: Unit, allies: Unit[], enemies: Unit[], map: GridMap, gridEngine: IGridEngine): CombatAction; serializeUnit(unit: Unit): string; deserializeUnit(data: string): Unit; }
export interface ICombatEngine { calculateDamage(attacker: Unit, defender: Unit, attackerWeapon: WeaponData, defenderWeapon: WeaponData | null, terrain: TerrainData, distance: number): number; calculateHitRate(attacker: Unit, defender: Unit, attackerWeapon: WeaponData, terrain: TerrainData, adjacentAllies: number): number; calculateCritRate(attacker: Unit, defender: Unit, attackerWeapon: WeaponData): number; getBattleForecast(attacker: Unit, defender: Unit, attackerWeapon: WeaponData, defenderWeapon: WeaponData | null, attackerTerrain: TerrainData, defenderTerrain: TerrainData, distance: number, attackerAllies: number, defenderAllies: number): BattleForecast; resolveCombat(attacker: Unit, defender: Unit, attackerWeapon: WeaponData, defenderWeapon: WeaponData | null, attackerTerrain: TerrainData, defenderTerrain: TerrainData, distance: number): CombatResult; executeSkill(user: Unit, skill: SkillDefinition, targets: Unit[], map: GridMap): CombatResult; getWeaponTriangleBonus(attackerWeapon: WeaponType, defenderWeapon: WeaponType): { hitBonus: number; damageBonus: number }; getMagicTriangleBonus(attackerElement: Element, defenderElement: Element): { hitBonus: number; damageBonus: number }; checkVictoryConditions(conditions: VictoryConditionDef[], units: Unit[], turnNumber: number): boolean; checkDefeatConditions(conditions: DefeatConditionDef[], units: Unit[], turnNumber: number): boolean; calculateExpGain(attacker: Unit, defender: Unit, damageDealt: number, killed: boolean): number; }
export interface IItemSystem { getItemData(itemId: string): ItemData | null; createItemInstance(dataId: string): ItemInstance; equipWeapon(unit: Unit, itemIndex: number): Unit; equipArmor(unit: Unit, itemIndex: number): Unit; useConsumable(unit: Unit, itemIndex: number): { unit: Unit; consumed: boolean }; addToInventory(unit: Unit, item: ItemInstance): { unit: Unit; success: boolean }; removeFromInventory(unit: Unit, itemIndex: number): { unit: Unit; item: ItemInstance | null }; tradeItems(unitA: Unit, unitB: Unit, indexA: number, indexB: number): { unitA: Unit; unitB: Unit }; addToConvoy(convoy: ItemInstance[], item: ItemInstance): ItemInstance[]; removeFromConvoy(convoy: ItemInstance[], instanceId: string): { convoy: ItemInstance[]; item: ItemInstance | null }; reduceDurability(item: ItemInstance): ItemInstance | null; forgeWeapon(item: ItemInstance, bonuses: { might: number; hit: number; crit: number }, goldCost: number): { item: ItemInstance; cost: number }; getShopInventory(chapterId: string): ItemData[]; canUnitUseItem(unit: Unit, item: ItemData, classDef: ClassDefinition): boolean; }
export interface ICampaignSystem { startNewCampaign(): CampaignState; getChapter(chapterId: string): ChapterDefinition; completeChapter(state: CampaignState, chapterId: string, rewards: ChapterRewards): CampaignState; getAvailableChapters(state: CampaignState): string[]; addUnitToRoster(state: CampaignState, unit: Unit): CampaignState; removeUnitFromRoster(state: CampaignState, unitId: string): CampaignState; updateSupportPoints(state: CampaignState, charA: string, charB: string, points: number): CampaignState; updateSupportRank(state: CampaignState, charA: string, charB: string, rank: SupportRank): CampaignState; getSupportConversation(charA: string, charB: string, rank: SupportRank): SupportConversation | null; save(state: CampaignState, slotIndex: number): SaveData; load(slotIndex: number): SaveData | null; saveBattle(state: CampaignState, battleState: BattleSaveData, slotIndex: number): SaveData; getWorldMapNodes(state: CampaignState): WorldMapNode[]; }
export interface IProgressionSystem { awardExp(unit: Unit, gains: ExpGain[]): { unit: Unit; levelUp: LevelUpResult | null }; rollLevelUp(unit: Unit, growthRates: GrowthRates): LevelUpResult; canPromote(unit: Unit, classDef: ClassDefinition): boolean; promote(unit: Unit, newClassName: UnitClassName, classDef: ClassDefinition): PromotionResult; getExpForNextLevel(currentExp: number): number; calculateLevelDifferenceMultiplier(attackerLevel: number, defenderLevel: number): number; getArenaOpponent(playerUnit: Unit): Unit; resolveArenaFight(playerUnit: Unit, opponent: Unit): { won: boolean; goldChange: number; expGained: number }; }
export interface IAudioSystem { init(): Promise<void>; playSFX(request: SoundRequest): void; playMusic(request: MusicRequest): void; stopMusic(fadeOutMs?: number): void; setConfig(config: AudioConfig): void; getConfig(): AudioConfig; queueSFX(requests: SoundRequest[]): void; }
export interface IRenderer { init(canvas: HTMLCanvasElement): void; renderBattle(map: GridMap, units: Unit[], state: CombatState, camera: Camera, overlays: RenderOverlay[]): void; renderUI(screen: UIScreen, data: unknown): void; renderDialogue(lines: DialogueLine[], currentIndex: number): void; renderBattleForecast(forecast: BattleForecast, attacker: Unit, defender: Unit): void; renderLevelUp(result: LevelUpResult, unit: Unit): void; playAnimation(request: AnimationRequest): Promise<void>; setCamera(camera: Camera): void; getCamera(): Camera; screenToGrid(screenX: number, screenY: number, camera: Camera, gridType: GridType): Position; gridToScreen(pos: Position, camera: Camera, gridType: GridType): { x: number; y: number }; }
export interface ITutorialSystem { init(state: TutorialState): void; startTutorial(tutorialId: string): TutorialStep | null; advanceTutorial(): TutorialStep | null; completeTutorial(tutorialId: string): void; getHint(context: string, timeSinceLastAction: number): string | null; getGlossaryEntry(term: string): string | null; searchGlossary(query: string): { term: string; definition: string }[]; getState(): TutorialState; markSeen(tutorialId: string): void; }
export interface IDataProvider { getClassDefinition(className: UnitClassName): ClassDefinition; getAllClasses(): ClassDefinition[]; getWeapon(id: string): WeaponData | null; getAllWeapons(): WeaponData[]; getArmor(id: string): ArmorData | null; getAllArmor(): ArmorData[]; getConsumable(id: string): ConsumableData | null; getAllConsumables(): ConsumableData[]; getPromotionItem(id: string): PromotionItemData | null; getAllPromotionItems(): PromotionItemData[]; getItem(id: string): ItemData | null; getSkill(id: string): SkillDefinition | null; getAllSkills(): SkillDefinition[]; getChapter(id: string): ChapterDefinition | null; getAllChapters(): ChapterDefinition[]; getCharacter(id: string): CharacterDefinition | null; getAllCharacters(): CharacterDefinition[]; getMapData(id: string): GridMap | null; getAllMaps(): GridMap[]; getSupportConversations(charA: string, charB: string): SupportConversation[]; getAllSupportConversations(): SupportConversation[]; getEnemyTemplate(id: string): EnemyPlacement | null; getAllEnemyTemplates(): EnemyPlacement[]; validateAllData(): { valid: boolean; errors: string[] }; }

export const MAX_LEVEL = 30;
export const PROMOTION_LEVEL = 15;
export const EXP_PER_LEVEL = 100;
export const MAX_INVENTORY_SLOTS = 5;
export const MAX_SP = 100;
export const SP_REGEN_PERCENT = 10;
export const WEAPON_TRIANGLE_HIT_BONUS = 15;
export const WEAPON_TRIANGLE_DAMAGE_BONUS = 1;
export const MAGIC_TRIANGLE_HIT_BONUS = 15;
export const MAGIC_TRIANGLE_DAMAGE_BONUS = 1;
export const CRIT_MULTIPLIER = 3;
export const DOUBLE_ATTACK_SPEED_THRESHOLD = 5;
export const HEIGHT_ADVANTAGE_HIT_BONUS = 15;
export const HEIGHT_DISADVANTAGE_HIT_PENALTY = 15;
export const SUPPORT_HIT_EVADE_BONUS_PER_ALLY = 10;
export const ZONE_OF_CONTROL_EXTRA_COST = 3;
export const KILL_EXP_BONUS = 30;
export const MAX_PARTY_SIZE = 12;
export const MAX_DEPLOY_SIZE = 8;
export const POISON_HP_PERCENT = 10;
export const BERSERK_ATTACK_BONUS_PERCENT = 50;
export const RAIN_BOW_HIT_PENALTY = 20;
export const SAVE_VERSION = '1.0.0';
export const NUM_SAVE_SLOTS = 3;
```

## Detailed Requirements

### 1. Damage Calculator (`damageCalculator.ts`)

**Physical Damage:**
```
baseDamage = attacker.Strength + weapon.might + weaponTriangleBonus - defender.Defense
```
- Apply terrain defense bonus (subtract from damage).
- Apply height advantage: if attacker height > defender height, +15% damage.
- Apply effectiveness bonus: if weapon is effective against defender's movement type, 3x weapon might.
- Apply forge bonuses: add weapon forgeBonuses.might to might.
- Minimum damage = 0 (never negative).

**Magical Damage:**
```
baseDamage = attacker.Magic + spell.might + magicTriangleBonus - defender.Resistance
```
- Same terrain and height bonuses apply.
- Magic triangle: Fire > Wind > Thunder > Fire (+1 damage, +15% hit for advantage).
- Dark and Light are effective against each other.

**Critical Hits:**
- Crit damage = normal damage × CRIT_MULTIPLIER (3).

### 2. Hit Rate Calculator (`hitCalculator.ts`)

```
hitRate = (attacker.Skill × 2 + attacker.Luck) + weapon.hit + weaponTriangleHitBonus
       - (defender.Speed × 2 + defender.Luck) - terrain.evasionBonus
       + supportBonus - defenderSupportBonus
```
- Height advantage: +HEIGHT_ADVANTAGE_HIT_BONUS if attacker higher.
- Height disadvantage: -HEIGHT_DISADVANTAGE_HIT_PENALTY if attacker lower.
- Support bonus: +SUPPORT_HIT_EVADE_BONUS_PER_ALLY per adjacent ally (for both attacker hit and defender evasion).
- Forge hit bonus added.
- Clamp to 0-100.

### 3. Crit Rate Calculator (in `hitCalculator.ts`)

```
critRate = attacker.Skill / 2 + weapon.crit + classBonus - defender.Luck
```
- Class bonus: Berserker +10, Assassin +15, Sniper +10, Thief +5.
- Forge crit bonus added.
- Clamp to 0-100.

### 4. Weapon Triangle (`weaponTriangle.ts`)

Physical: Sword > Axe > Lance > Sword
- Advantage: +WEAPON_TRIANGLE_HIT_BONUS hit, +WEAPON_TRIANGLE_DAMAGE_BONUS damage.
- Disadvantage: -WEAPON_TRIANGLE_HIT_BONUS hit, -WEAPON_TRIANGLE_DAMAGE_BONUS damage.
- Neutral (same weapon or non-triangle): 0.

Magic: Fire > Wind > Thunder > Fire
- Same bonuses as weapon triangle but using MAGIC_TRIANGLE constants.
- Dark <> Light: mutual advantage (both get bonus).

### 5. Battle Forecast (`combatEngine.ts`)

`getBattleForecast(attacker, defender, ...)`: Calculate and return:
- attackerDamage, attackerHit, attackerCrit, attackerDoubles
- defenderDamage, defenderHit, defenderCrit, defenderDoubles, defenderCanCounter
- Double attack: if Speed difference > DOUBLE_ATTACK_SPEED_THRESHOLD.
- Counter possible: if defender has weapon and attacker is within defender's weapon range.

### 6. Combat Resolution (`combatEngine.ts`)

`resolveCombat(attacker, defender, ...)`:
1. Attacker attacks (roll hit, roll crit if hit).
2. If defender alive and can counter: defender counters.
3. If attacker alive and doubles: attacker attacks again.
4. If defender alive and doubles and can counter: defender counters again.
5. Return CombatResult with all rounds, HP changes, EXP gains.

Use deterministic RNG seeded from unit IDs + turn number for testability — OR accept a random function parameter. For tests, use a mock random that returns predictable values.

### 7. Skill Execution (`skillExecutor.ts`)

`executeSkill(user, skill, targets, map)`:
- Deduct SP cost from user.
- For damage skills: calculate damage using skill.damage base + scaling stat.
- For healing skills: restore HP based on skill.healing base + user Magic.
- For buff skills: apply stat modifications for N turns.
- For debuff skills: apply negative stat modifications for N turns.
- For status effect skills: roll chance, apply effect if successful.
- AoE: apply to all targets in the AoE pattern.

### 8. Victory/Defeat Conditions (`victoryConditions.ts`)

`checkVictoryConditions(conditions, units, turnNumber)`:
- Rout: all enemy units defeated (isAlive === false for all enemy team).
- BossKill: specific unit (targetUnitId) is defeated.
- Survive: turnNumber >= surviveTurns.
- ReachLocation: any player unit at targetPosition.
- ProtectTarget: protected unit still alive (check is "no defeat", actual victory is separate).

`checkDefeatConditions(conditions, units, turnNumber)`:
- LordDies: any unit with isLord and !isAlive.
- AllUnitsDie: all player team units !isAlive.
- ProtectedUnitDies: specific unit !isAlive.
- TimerExpires: turnNumber > turnLimit.

### 9. EXP Calculator (`expCalculator.ts`)

`calculateExpGain(attacker, defender, damageDealt, killed)`:
- Base EXP = (defender.level - attacker.level + 10) × 3.
- If damage dealt > 0 but not killed: base × (damageDealt / defender.maxHP).
- If killed: base + KILL_EXP_BONUS.
- Level difference multiplier: higher level enemies give more EXP.
- Clamp: minimum 1 EXP, maximum 100 EXP.

### 10. Combat State Machine (`combatStateMachine.ts`)

Implement state transitions for the combat flow. This is a pure state machine — no rendering.

States and transitions:
- DEPLOY → UNIT_SELECT (when player confirms deployment)
- UNIT_SELECT → MOVE_SELECT (when player selects a unit)
- MOVE_SELECT → ACTION_SELECT (when player selects a move destination)
- ACTION_SELECT → TARGET_SELECT (when player selects "Attack" or "Skill")
- ACTION_SELECT → UNIT_SELECT (when player selects "Wait")
- TARGET_SELECT → ANIMATION (when player confirms target)
- ANIMATION → UNIT_SELECT (when animation completes, if units remain)
- ANIMATION → VICTORY (if victory conditions met)
- ANIMATION → DEFEAT (if defeat conditions met)
- UNIT_SELECT → ENEMY_TURN (when all player units acted)
- ENEMY_TURN → UNIT_SELECT (when all enemies acted, new turn)

Undo: from ACTION_SELECT, can undo back to UNIT_SELECT (restore unit position).

### 11. Combat Log (`combatLog.ts`)

Record every action: "{Unit} attacks {Target} for {N} damage", "{Unit} misses {Target}", "{Unit} heals {Target} for {N} HP", "{Unit} is defeated", etc.

## Test Requirements

Write comprehensive Vitest tests in `src/combat/__tests__/`:

1. **damageCalculator.test.ts**: Physical damage, magical damage, terrain defense, height advantage, effectiveness, zero damage floor, critical damage.
2. **hitCalculator.test.ts**: Hit rate formula, terrain evasion, height bonuses, support bonuses, clamping.
3. **critCalculator.test.ts**: Crit formula, class bonuses, minimum/maximum.
4. **weaponTriangle.test.ts**: All advantage/disadvantage/neutral combinations for physical and magic.
5. **battleForecast.test.ts**: Forecast accuracy, doubles check, counter check.
6. **combatResolution.test.ts**: Full combat flows — hit, miss, crit, double, counter, lethal.
7. **skillExecution.test.ts**: Damage skills, healing skills, buffs, debuffs, status effects, AoE.
8. **victoryConditions.test.ts**: All 5 victory types, all 4 defeat types.
9. **expCalculator.test.ts**: Level difference scaling, kill bonus, clamping.
10. **combatStateMachine.test.ts**: All state transitions, undo functionality.
11. **combatLog.test.ts**: Log entry creation and formatting.

Target: 150+ tests for this domain.

## What This Domain Should NOT Touch

- Do NOT modify files outside `src/combat/`.
- Do NOT import from `src/grid/`, `src/units/`, `src/items/`, etc.
- Only import from `../../shared/types`.
- Do NOT implement pathfinding, AI, inventory, or rendering.
- Accept Unit, WeaponData, TerrainData etc. as parameters — do not construct them.

## Completion

When finished, write `combat_DONE.md` in the project root with:
- List of all files created
- Number of tests passing
- Any notes about implementation decisions

## Worker Launch Command

For sub-tasks within this domain, use:
```bash
codex exec --full-auto --skip-git-repo-check -C $(pwd) "$(cat specs/combat/worker_N.md)"
```

## Scope Enforcement

After making changes, run:
```bash
git diff --name-only | grep -v '^src/combat/' | xargs -r git checkout --
git add src/combat/
```
