# Data & Content Domain Spec

## Domain Objective

The Data domain contains ALL game content as typed TypeScript data structures. It defines 12 class definitions, 80+ weapons, 40+ armor pieces, 20+ consumables, 50+ skills, 25 story chapters, 10 paralogues, 40+ characters, 30+ support conversations, 20+ map layouts, 30+ enemy templates, and promotion items. All data is in `.ts` files (no JSON). It provides comprehensive validation functions ensuring all cross-references resolve. This is a leaf dependency — no other domain imports are needed.

## Owned Directories

- `src/data/` — ALL files in this directory are owned by this domain exclusively.
- Do NOT create or modify files outside `src/data/`.

## Required Exports

From `src/data/index.ts`, export:

```typescript
export { createDataProvider } from './dataProvider';
// createDataProvider: () => IDataProvider
```

The returned object must implement every method of the `IDataProvider` interface from `src/shared/types.ts`.

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

export interface IDataProvider { getClassDefinition(className: UnitClassName): ClassDefinition; getAllClasses(): ClassDefinition[]; getWeapon(id: string): WeaponData | null; getAllWeapons(): WeaponData[]; getArmor(id: string): ArmorData | null; getAllArmor(): ArmorData[]; getConsumable(id: string): ConsumableData | null; getAllConsumables(): ConsumableData[]; getPromotionItem(id: string): PromotionItemData | null; getAllPromotionItems(): PromotionItemData[]; getItem(id: string): ItemData | null; getSkill(id: string): SkillDefinition | null; getAllSkills(): SkillDefinition[]; getChapter(id: string): ChapterDefinition | null; getAllChapters(): ChapterDefinition[]; getCharacter(id: string): CharacterDefinition | null; getAllCharacters(): CharacterDefinition[]; getMapData(id: string): GridMap | null; getAllMaps(): GridMap[]; getSupportConversations(charA: string, charB: string): SupportConversation[]; getAllSupportConversations(): SupportConversation[]; getEnemyTemplate(id: string): EnemyPlacement | null; getAllEnemyTemplates(): EnemyPlacement[]; validateAllData(): { valid: boolean; errors: string[] }; }

export const MAX_LEVEL = 30; export const PROMOTION_LEVEL = 15; export const EXP_PER_LEVEL = 100; export const MAX_INVENTORY_SLOTS = 5; export const MAX_SP = 100; export const SP_REGEN_PERCENT = 10; export const WEAPON_TRIANGLE_HIT_BONUS = 15; export const WEAPON_TRIANGLE_DAMAGE_BONUS = 1; export const MAGIC_TRIANGLE_HIT_BONUS = 15; export const MAGIC_TRIANGLE_DAMAGE_BONUS = 1; export const CRIT_MULTIPLIER = 3; export const DOUBLE_ATTACK_SPEED_THRESHOLD = 5; export const HEIGHT_ADVANTAGE_HIT_BONUS = 15; export const HEIGHT_DISADVANTAGE_HIT_PENALTY = 15; export const SUPPORT_HIT_EVADE_BONUS_PER_ALLY = 10; export const ZONE_OF_CONTROL_EXTRA_COST = 3; export const KILL_EXP_BONUS = 30; export const MAX_PARTY_SIZE = 12; export const MAX_DEPLOY_SIZE = 8; export const POISON_HP_PERCENT = 10; export const BERSERK_ATTACK_BONUS_PERCENT = 50; export const RAIN_BOW_HIT_PENALTY = 20; export const SAVE_VERSION = '1.0.0'; export const NUM_SAVE_SLOTS = 3;
```

## Detailed Requirements

### 1. Data Provider (`dataProvider.ts`)

Factory function `createDataProvider(): IDataProvider`. Aggregates all data from the files below and provides typed lookup methods. Every `get*` method does a map lookup by ID. Every `getAll*` method returns the full array.

### 2. Class Definitions (`classes.ts`)

Define all 19 classes (6 base + 13 promoted). Each must have full ClassDefinition with:
- baseStats, growthRates, statCaps, movementType, weaponTypes, skills, promotionOptions, promotionBonuses.

**Base Classes:**
| Class   | HP | Str | Mag | Skl | Spd | Lck | Def | Res | Mov | Type    | Weapons           |
|---------|----|-----|-----|-----|-----|-----|-----|-----|-----|---------|-------------------|
| Warrior | 20 | 7   | 0   | 5   | 5   | 3   | 6   | 1   | 5   | Foot    | Sword, Axe        |
| Knight  | 18 | 6   | 0   | 5   | 7   | 4   | 5   | 1   | 7   | Mounted | Lance             |
| Archer  | 17 | 5   | 0   | 7   | 6   | 4   | 3   | 2   | 5   | Foot    | Bow               |
| Mage    | 16 | 0   | 7   | 5   | 5   | 4   | 2   | 6   | 5   | Foot    | Fire/Wind/Thunder |
| Cleric  | 16 | 0   | 5   | 4   | 5   | 6   | 2   | 7   | 5   | Foot    | Staff             |
| Thief   | 17 | 4   | 0   | 8   | 9   | 7   | 3   | 2   | 6   | Foot    | Sword             |

**Promotion Paths:**
- Warrior → Berserker (Axe focus, +HP, +Str) or General (Armored, +Def, add Lance)
- Knight → Paladin (add Staff, +Res) or Great Knight (Armored, add Axe, +Def)
- Archer → Sniper (+Skl, +Crit bonus) or Ranger (Mounted, add Sword)
- Mage → Sage (add Staff, +Mag, +Res) or Dark Knight (Mounted, add Sword, +Str)
- Cleric → Bishop (+Mag, add Light tomes) or Valkyrie (Mounted, +Mov)
- Thief → Assassin (+Spd, +Crit, add Bow) or Trickster (add Staff, +Mag)

Dancer has no promotion path.

### 3. Weapons (`weapons.ts`)

Define 80+ weapons. Organized by type:

**Swords (12+):** Iron Sword (might:5, hit:90, crit:0, range:1, dur:45, cost:460), Steel Sword (8, 85, 0, 1, 30, 700), Silver Sword (13, 80, 0, 1, 20, 1500), Brave Sword (9, 75, 0, 1, 30, 3000, specialEffect: 'brave'), Killing Edge (9, 85, 30, 1, 20, 1200), Armorslayer (8, 80, 0, 1, 25, 1000, effectiveAgainst: Armored), Wyrmslayer (7, 80, 0, 1, 25, 1000, effectiveAgainst: Flying), Levin Sword (might:6, range:1-2, element: Thunder), Rapier (7, 95, 10, 1, 30, 900), Slim Sword (3, 100, 5, 1, 45, 300), Runesword (might:12, range:1-2, element:Dark), Mercurius (might:18, legendary).

**Lances (10+):** Iron, Steel, Silver, Brave Lance, Killer Lance, Horseslayer (effectiveAgainst: Mounted), Javelin (range:1-2), Short Spear (range:1-2), Gradivus (legendary), Slim Lance.

**Axes (10+):** Iron, Steel, Silver, Brave Axe, Killer Axe, Hammer (effectiveAgainst: Armored), Hand Axe (range:1-2), Tomahawk (range:1-2), Hauteclere (legendary), Devil Axe (high might, can backfire).

**Bows (8+):** Iron, Steel, Silver, Killer Bow, Longbow (range:2-3), Ballista (range:2-4, stationary), Brave Bow, Parthia (legendary).

**Tomes (18+):** Fire, Elfire, Arcfire, Wind, Elwind, Arcwind, Thunder, Elthunder, Arcthunder, Flux (Dark), Nosferatu (Dark, drain), Luna (Dark, ignore Res), Lightning (Light), Shine (Light), Aura (Light), Excalibur (Wind, legendary), Thoron (Thunder, range:1-2), Bolganone (Fire, legendary).

**Staves (10+):** Heal (restoreHP:10), Mend (20), Recover (full), Physic (ranged heal, range:1-3), Warp (teleport ally), Rescue (pull ally to adjacent), Restore (cure status), Silence (inflict silence range:1-3), Sleep (inflict sleep range:1-3), Fortify (heal all allies in range:1-2).

### 4. Armor (`armor.ts`)

Define 40+ armor pieces across all 4 slots:

**Helmets (10+):** Iron Helm, Steel Helm, Silver Helm, Mage Hat, Holy Crown, etc.
**Chest (10+):** Iron Plate, Steel Plate, Silver Plate, Mage Robe, Holy Robe, etc.
**Boots (10+):** Iron Boots, Steel Boots, Winged Boots (+1 mov), Assassin's Boots, etc.
**Accessories (10+):** Shield Ring (+2 Def), Speed Ring (+2 Spd), Skill Ring (+2 Skl), etc.

Include 3 armor set IDs. Set bonus: if 2+ pieces of same setId, +3 Def and +3 Res.

### 5. Consumables (`consumables.ts`)

Define 20+ consumables:
- Vulnerary (heal 10 HP, 3 uses), Concoction (heal 20 HP, 3 uses), Elixir (full heal, 3 uses)
- Antidote (cure poison), Pure Water (+7 Res for 1 battle)
- Stat boosters (permanent): Energy Drop (+2 Str), Spirit Dust (+2 Mag), Secret Book (+2 Skl), Speedwing (+2 Spd), Goddess Icon (+2 Lck), Dracoshield (+2 Def), Talisman (+2 Res), Boots (+2 Mov)
- Door Key (1 use), Chest Key (1 use), Master Key (5 uses, opens both)
- Torch (reveal fog in radius, 3 uses)

### 6. Promotion Items (`promotionItems.ts`)

- Master Seal (works for any base class, cost: 2500)
- Knight Crest (Warrior/Knight only, cost: 2000)
- Hero Crest (Warrior/Thief only, cost: 2000)
- Guiding Ring (Mage/Cleric only, cost: 2000)
- Orion's Bolt (Archer only, cost: 2000)
- Elysian Whip (Knight only, cost: 2000)

### 7. Skills (`skills.ts`)

Define 50+ skills. Mix of active and passive:

**Active Damage Skills (15+):** Power Strike (1.5x Str, 5 SP), Luna Strike (ignore 50% Def, 8 SP), Sol (drain HP equal to damage, 10 SP), Astra (5 consecutive hits at 50% damage, 15 SP), Ignis (add Mag to physical, 8 SP), Flame Burst (AoE circle 1, fire damage, 10 SP), Wind Blade (AoE line 3, wind damage, 12 SP), Thunder Strike (AoE cross, thunder damage, 12 SP), etc.

**Active Heal/Support Skills (10+):** Heal (restore 15HP, 3 SP), Rally Strength (+4 Str to allies in range 2, 5 SP), Rally Speed (+4 Spd, 5 SP), Dance (grant extra turn to adjacent ally, 10 SP), Restore (cure all status effects, 5 SP), Barrier (+7 Res for 3 turns, 5 SP), etc.

**Active Debuff Skills (5+):** Poison Strike (inflict poison, 5 SP), Silence (inflict silence, 8 SP), Hex (inflict -4 Def/Res for 3 turns, 8 SP), etc.

**Passive Skills (20+):** Vantage (counter first when HP<50%), Wrath (+20 crit when HP<50%), Renewal (heal 10% HP per turn), Counter (reflect melee damage), Miracle (survive lethal hit at 1HP once per battle, luck% chance), Pavise (halve physical damage, Skl% chance), Aegis (halve magic damage, Skl% chance), Desperation (double attack before counter when HP<50%), Quick Burn (+15 hit/evade turn 1, decreasing), Lifetaker (heal 50% on kill), etc.

### 8. Characters (`characters.ts`)

Define 40+ characters. At minimum:

**Player Characters (20+):**
- **Alaric** (Lord, Warrior, level 1): The protagonist prince. isLord:true. Backstory, personal skills, etc.
- **Elena** (Cleric, level 1): Alaric's childhood friend and healer.
- **Marcus** (Knight, level 3): Veteran knight, joins chapter 1.
- **Lira** (Archer, level 2): Hunter from the borderlands, joins chapter 2.
- **Theron** (Mage, level 2): Scholar from the academy, joins chapter 3.
- **Kael** (Thief, level 4): Roguish thief, joins chapter 4.
- **Seraphina** (Dancer, level 5): Traveling dancer, joins chapter 6.
- Continue with 13+ more characters recruited across chapters 5-25.

**Bosses (10+):** One boss per major chapter with unique names, higher stats, boss AI behavior.

**NPC Allies (5+):** Green units that appear in specific chapters.

Each character needs: id, name, backstory (2-3 sentences), className, baseLevel, baseStats, personalGrowthBonuses, personalSkills, startingEquipment (item IDs), recruitChapter, recruitCondition, isLord, portraitColor, supportPartners.

### 9. Support Conversations (`supportConversations.ts`)

Define 30+ support pairs with C/B/A rank conversations:
- Alaric-Elena (C: childhood memories, B: duty vs friendship, A: confession)
- Alaric-Marcus (C: training, B: respect, A: legacy)
- Elena-Theron (C: magic theory, B: shared ideals, A: partnership)
- etc.

Each conversation: 4-8 lines of dialogue with speaker, text, emotion.

### 10. Chapters (`chapters.ts`)

Define 25 story chapters. Each chapter needs full ChapterDefinition. At minimum the first 10 chapters in full detail:

- **Ch 1 "A Kingdom's Fall"**: Tutorial chapter. Small map (8x8). 4 enemies. Rout victory. Recruit: Alaric, Elena, Marcus.
- **Ch 2 "Escape to the Forest"**: Forest map (10x10). 6 enemies + reinforcements turn 3. Rout victory. Recruit: Lira.
- **Ch 3 "The Academy Siege"**: Urban map (12x12). 8 enemies. Boss kill victory. Recruit: Theron.
- **Ch 4 "Thieves of the Undercity"**: Indoor map (10x10). 6 enemies + chests. Rout + treasure. Recruit: Kael.
- **Ch 5 "Bridge of Sorrows"**: Bridge map (8x16). Survive 8 turns. Reinforcements every 2 turns.
- Continue through chapter 25 with increasing difficulty, varied objectives, narrative triggers.

Chapters 11-25 can have lighter definitions but must have valid structure.

### 11. Paralogues (`paralogues.ts`)

Define 10 paralogue chapters unlocked by conditions:
- "The Arena Champion" (complete ch3, recruit optional fighter)
- "Hidden Village" (Kael alive after ch6, recruit optional mage)
- etc.

### 12. Map Layouts (`mapLayouts.ts`)

Define 20+ map layouts as GridMap objects. These are the tile-level definitions used by chapters. Varying sizes from 8x8 to 24x24. Include varied terrain, deployment zones, chokepoints, strategic features.

### 13. Enemy Templates (`enemyTemplates.ts`)

Define 30+ enemy archetypes:
- Soldier (Warrior, level 1-5, iron weapon)
- Knight Guard (Knight, level 3-8, steel lance)
- Bandit (Warrior/Berserker, level 2-6, axe)
- Dark Mage (Mage, level 3-7, dark tome)
- Healer (Cleric, level 3-6, heal staff)
- etc.

Each template: characterId pattern, className, level range, equipment list, aiBehavior.

### 14. Validation (`validation.ts`)

`validateAllData()`: Check all cross-references:
- Every skill ID referenced by a class exists in skills data.
- Every weapon/armor/consumable ID referenced by characters/enemies exists.
- Every mapId referenced by chapters exists.
- Every characterId referenced by chapters/support conversations exists.
- Every chapter's nextChapterId exists.
- Every promotion path points to a valid promoted class.
- Return `{ valid: boolean, errors: string[] }`.

## Test Requirements

Write Vitest tests in `src/data/__tests__/`:

1. **classes.test.ts**: All 19 classes defined, base stats valid, growth rates 0-100, promotion paths point to valid promoted classes.
2. **weapons.test.ts**: 80+ weapons exist, all have valid weapon types, might/hit/crit/range are sensible, no duplicate IDs.
3. **armor.test.ts**: 40+ armor pieces, valid slots, no duplicate IDs.
4. **consumables.test.ts**: 20+ consumables, valid effects, no duplicate IDs.
5. **skills.test.ts**: 50+ skills, valid types, SP costs non-negative, no duplicate IDs.
6. **characters.test.ts**: 40+ characters, valid class names, valid starting equipment references, at least 1 lord.
7. **chapters.test.ts**: 25 story chapters, valid map references, valid enemy references, valid victory/defeat conditions.
8. **paralogues.test.ts**: 10 paralogues, valid structure.
9. **supportConversations.test.ts**: 30+ conversations, valid character references, C/B/A ranks.
10. **mapLayouts.test.ts**: 20+ maps, valid dimensions, have deployment zones, varied terrain.
11. **enemyTemplates.test.ts**: 30+ templates, valid class names, valid equipment references.
12. **validation.test.ts**: Full validation passes with no errors. Test with deliberately broken data to verify errors are caught.
13. **dataProvider.test.ts**: All lookup methods work, return null for invalid IDs.

Target: 150+ tests.

## What This Domain Should NOT Touch

- Do NOT modify files outside `src/data/`.
- Do NOT import from any other domain.
- Only import from `../../shared/types`.
- Do NOT implement game logic, combat, pathfinding, rendering, or AI.
- This domain is pure data + validation.

## Completion

When finished, write `data_DONE.md` in the project root with:
- List of all files created
- Number of tests passing
- Any notes about implementation decisions

## Worker Launch Command

For sub-tasks within this domain, use:
```bash
codex exec --full-auto --skip-git-repo-check -C $(pwd) "$(cat specs/data/worker_N.md)"
```

## Scope Enforcement

After making changes, run:
```bash
git diff --name-only | grep -v '^src/data/' | xargs -r git checkout --
git add src/data/
```
