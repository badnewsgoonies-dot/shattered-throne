# Data & Content — Full Domain Implementation

You are implementing the Data domain for Shattered Throne, a tactical RPG. This is the LARGEST domain — it contains ALL game content as typed TypeScript data.

## CRITICAL RULES
- ONLY create/modify files under `src/data/`
- Import types ONLY from `../../shared/types`
- Do NOT import from any other domain
- `src/shared/types.ts` already exists — do NOT modify it
- ALL data in .ts files, NO JSON

## Files to Create

### 1. `src/data/classes.ts`
Define ALL 19 classes (6 base + 13 promoted). Use the ClassDefinition type.

**Base Classes (with full stats, growth rates, stat caps, weapon types, skills, promotion paths):**

| Class   | HP | Str | Mag | Skl | Spd | Lck | Def | Res | Mov | Movement | Weapons | Promotes To |
|---------|----|-----|-----|-----|-----|-----|-----|-----|-----|----------|---------|-------------|
| Warrior | 20 | 7   | 0   | 5   | 5   | 3   | 6   | 1   | 5   | Foot     | Sword,Axe | Berserker,General |
| Knight  | 18 | 6   | 0   | 5   | 7   | 4   | 5   | 1   | 7   | Mounted  | Lance | Paladin,GreatKnight |
| Archer  | 17 | 5   | 0   | 7   | 6   | 4   | 3   | 2   | 5   | Foot     | Bow | Sniper,Ranger |
| Mage    | 16 | 0   | 7   | 5   | 5   | 4   | 2   | 6   | 5   | Foot     | FireTome,WindTome,ThunderTome | Sage,DarkKnight |
| Cleric  | 16 | 0   | 5   | 4   | 5   | 6   | 2   | 7   | 5   | Foot     | Staff | Bishop,Valkyrie |
| Thief   | 17 | 4   | 0   | 8   | 9   | 7   | 3   | 2   | 6   | Foot     | Sword | Assassin,Trickster |

**Promoted Classes** — each has isPromoted: true, empty promotionOptions, higher stat caps, additional weapon types. Dancer has no promotion. Set appropriate growthRates (50-80 range), statCaps (30-60 range), promotionBonuses (+2-4 to key stats), and 2-3 skills per class.

Export: `CLASS_DEFINITIONS: Record<UnitClassName, ClassDefinition>` and a getter function.

### 2. `src/data/weapons.ts`
Define 80+ weapons. Each is a WeaponData object.

**Swords (12):** Iron Sword (might:5,hit:90,crit:0,range:1-1,wt:5,dur:45,cost:460), Steel Sword (8,85,0,1-1,10,30,700), Silver Sword (13,80,0,1-1,8,20,1500), Brave Sword (9,75,0,1-1,12,30,3000), Killing Edge (9,85,30,1-1,7,20,1200), Armorslayer (8,80,0,1-1,11,25,1000,effective:Armored), Wyrmslayer (7,80,0,1-1,8,25,1000,effective:Flying), Levin Sword (6,80,0,1-2,6,25,1100,element:Thunder), Rapier (7,95,10,1-1,5,30,900), Slim Sword (3,100,5,1-1,2,45,300), Runesword (12,70,0,1-2,14,15,2500,element:Dark), Mercurius (18,90,10,1-1,9,25,—)

**Lances (10):** Iron Lance (7,80,0,1-1,8,45,360), Steel Lance (10,75,0,1-1,13,30,600), Silver Lance (14,75,0,1-1,10,20,1400), Brave Lance (10,70,0,1-1,14,30,3000), Killer Lance (10,80,30,1-1,9,20,1200), Horseslayer (7,70,0,1-1,13,25,1000,effective:Mounted), Javelin (6,65,0,1-2,11,25,500), Short Spear (9,70,0,1-2,12,20,900), Gradivus (17,85,5,1-2,9,25,—), Slim Lance (4,90,5,1-1,4,45,350)

**Axes (10):** Iron Axe (8,75,0,1-1,10,45,300), Steel Axe (11,70,0,1-1,15,30,550), Silver Axe (15,65,0,1-1,12,20,1300), Brave Axe (11,65,0,1-1,16,30,3000), Killer Axe (11,70,30,1-1,12,20,1100), Hammer (10,55,0,1-1,15,25,800,effective:Armored), Hand Axe (7,60,0,1-2,12,25,450), Tomahawk (13,65,0,1-2,14,20,1500), Hauteclere (18,80,10,1-1,11,25,—), Devil Axe (18,55,0,1-1,13,20,800)

**Bows (8):** Iron Bow (6,85,0,2-2,5,45,330), Steel Bow (9,80,0,2-2,9,30,630), Silver Bow (13,75,0,2-2,6,20,1400), Killer Bow (9,85,30,2-2,7,20,1200), Longbow (5,70,0,2-3,6,20,1000), Brave Bow (10,70,0,2-2,12,30,3000), Short Bow (4,90,5,2-2,3,45,280), Parthia (16,85,5,2-3,8,25,—)

**Tomes (18):** Fire (5,90,0,1-2,4,40,400,element:Fire), Elfire (10,85,0,1-2,10,30,900,element:Fire), Arcfire (14,80,0,1-2,12,20,2200,element:Fire), Wind (4,95,0,1-2,2,40,350,element:Wind), Elwind (9,90,5,1-2,7,30,800,element:Wind), Arcwind (13,85,0,1-2,10,20,2000,element:Wind), Thunder (6,85,5,1-2,6,40,420,element:Thunder), Elthunder (11,80,5,1-2,10,30,950,element:Thunder), Arcthunder (15,75,5,1-2,14,20,2300,element:Thunder), Flux (7,80,0,1-2,8,35,700,element:Dark), Nosferatu (6,70,0,1-2,12,20,1200,element:Dark,special:drain), Luna(DarkTome,12,60,0,1-2,12,15,2500,element:Dark,special:ignoreRes), Lightning(LightTome,6,90,5,1-2,6,35,500,element:Light), Shine(LightTome,8,85,5,1-2,8,30,700,element:Light), Aura(LightTome,15,85,0,1-2,9,20,2500,element:Light), Excalibur(WindTome,18,90,10,1-2,8,25,—,element:Wind), Thoron(ThunderTome,13,80,5,1-2,10,20,2000,element:Thunder), Bolganone(FireTome,16,85,0,1-2,13,20,—,element:Fire)

**Staves (10):** Heal (staff,0,0,0,1-1,6,30,400), Mend (staff,0,0,0,1-1,8,20,700), Recover (staff,0,0,0,1-1,10,15,1400), Physic (staff,0,0,0,1-3,8,15,1500), Warp (staff,0,0,0,1-99,10,5,2500), Rescue (staff,0,0,0,1-10,10,5,2000), Restore (staff,0,0,0,1-1,6,10,1200), Silence (staff,0,0,0,1-3,8,5,1800), Sleep (staff,0,0,0,1-3,10,5,2000), Fortify (staff,0,0,0,1-2,12,5,3000)

Note: Staves use might=0, hit=0, crit=0 — they are not offensive weapons. For heal staves, the specialEffect or a convention describes the heal amount.

Export: `WEAPONS: WeaponData[]` and getter functions.

### 3. `src/data/armor.ts`
40+ armor pieces across 4 slots. Each is an ArmorData object.

**Helmets (10+):** Iron Helm (def:2,res:0,wt:3,spd:0,cost:300), Steel Helm (def:4,res:0,wt:5,spd:1,cost:600), Silver Helm (def:6,res:1,wt:4,spd:0,cost:1200), Mage Hat (def:0,res:3,wt:1,spd:0,cost:400), Holy Crown (def:1,res:5,wt:2,spd:0,cost:1000), etc.

**Chest (10+):** Iron Plate (def:3,res:0,wt:5,spd:1), Steel Plate (def:5,res:0,wt:8,spd:2), Silver Plate (def:7,res:1,wt:6,spd:1), Mage Robe (def:1,res:4,wt:2,spd:0), Holy Robe (def:2,res:6,wt:3,spd:0), etc.

**Boots (10+):** Iron Boots, Steel Boots, Winged Boots (def:1,res:0,+1 speed boost via specialEffect), etc.

**Accessories (10+):** Shield Ring (def:2), Speed Ring (spd:-2 penalty removed), Skill Ring, Strength Ring, etc.

Include 3 armor sets (setId: 'iron_set', 'steel_set', 'silver_set').

Export: `ARMOR: ArmorData[]` and getter functions.

### 4. `src/data/consumables.ts`
20+ consumables. Each is a ConsumableData object.

Vulnerary (heal:10,uses:3,cost:300), Concoction (heal:20,uses:3,cost:600), Elixir (fullHeal,uses:3,cost:2000), Antidote (cureStatus:Poison,uses:3,cost:100), Pure Water (statBoost:res+7,uses:1,cost:500), stat boosters (permanent statBoost, 1 use): Energy Drop (str+2,3000), Spirit Dust (mag+2,3000), Secret Book (skl+2,3000), Speedwing (spd+2,3000), Goddess Icon (lck+2,3000), Dracoshield (def+2,3000), Talisman (res+2,3000), Boots item (mov+2,5000), Door Key (key,1 use,50), Chest Key (key,1 use,50), Master Key (key,5 uses,500), Torch (special,3 uses,300)

Export: `CONSUMABLES: ConsumableData[]` and getter functions.

### 5. `src/data/promotionItems.ts`
6 promotion items as PromotionItemData objects.

Master Seal (all base classes, 2500), Knight Crest (Warrior,Knight, 2000), Hero Crest (Warrior,Thief, 2000), Guiding Ring (Mage,Cleric, 2000), Orion's Bolt (Archer, 2000), Elysian Whip (Knight, 2000)

Export: `PROMOTION_ITEMS: PromotionItemData[]` and getter.

### 6. `src/data/skills.ts`
50+ skills as SkillDefinition objects. Mix of active damage, healing, buff, debuff, status, and passive.

Active damage (15+): Power Strike, Luna Strike, Sol, Astra, Ignis, Flame Burst (AoE circle), Wind Blade (AoE line), Thunder Strike (AoE cross), etc.
Active heal/support (10+): Heal skill, Rally Strength, Rally Speed, Dance, Restore, Barrier, etc.
Active debuff (5+): Poison Strike, Silence skill, Hex, etc.
Passive (20+): Vantage, Wrath, Renewal, Counter, Miracle, Pavise, Aegis, Desperation, Quick Burn, Lifetaker, etc.

Export: `SKILLS: SkillDefinition[]` and getter.

### 7. `src/data/characters.ts`
40+ characters as CharacterDefinition objects.

**Player Characters (20+):**
- Alaric (Warrior, L1, isLord:true, ch_1)
- Elena (Cleric, L1, ch_1)
- Marcus (Knight, L3, ch_1)
- Lira (Archer, L2, ch_2)
- Theron (Mage, L2, ch_3)
- Kael (Thief, L4, ch_4)
- Seraphina (Dancer, L5, ch_6)
- (13+ more characters across chapters 5-25)

**Bosses (10+):** One per major chapter with higher stats, boss AI.
**NPC Allies (5+):** Green units for specific chapters.

Each needs all fields: id, name, backstory (2-3 sentences), className, baseLevel, baseStats, personalGrowthBonuses, personalSkills (skill IDs), startingEquipment (item IDs), recruitChapter, isLord, portraitColor, supportPartners.

Export: `CHARACTERS: CharacterDefinition[]` and getter.

### 8. `src/data/supportConversations.ts`
30+ support conversations as SupportConversation objects.

Each pair has C/B/A rank conversations. 4-8 DialogueLine entries per conversation.

Export: `SUPPORT_CONVERSATIONS: SupportConversation[]` and getter.

### 9. `src/data/chapters.ts`
25 story chapters as ChapterDefinition objects.

First 10 in full detail, chapters 11-25 with valid structure. Each needs: id, number, title, description, mapId, deploymentSlots, maxDeployments, enemies (EnemyPlacement[]), allies, victoryConditions, defeatConditions, reinforcements, treasures, narrative (at least preBattle/postBattle dialogue), weather, rewards, nextChapterId.

Export: `CHAPTERS: ChapterDefinition[]` and getter.

### 10. `src/data/paralogues.ts`
10 paralogue chapters as ChapterDefinition objects. Similar structure to story chapters but with unlock conditions.

Export: `PARALOGUES: ChapterDefinition[]` and getter.

### 11. `src/data/mapLayouts.ts`
20+ maps as GridMap objects. Various sizes (8x8 to 24x24) with varied terrain, deployment zones.

You can import terrain helpers from the grid domain... actually NO, you can't import from other domains. So define terrain data inline or create a local helper.

Actually, you need to create full Tile[][] arrays. Each tile needs all fields from the Tile interface. Create a helper function to build tiles from a simple terrain grid.

Export: `MAP_LAYOUTS: GridMap[]` and getter.

### 12. `src/data/enemyTemplates.ts`
30+ enemy templates as EnemyPlacement objects.

Export: `ENEMY_TEMPLATES: EnemyPlacement[]` and getter.

### 13. `src/data/validation.ts`
```typescript
export function validateAllData(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  // Check all cross-references:
  // - Class skill IDs exist in skills data
  // - Character equipment IDs exist in weapons/armor/consumables
  // - Chapter mapIds exist in map layouts
  // - Chapter enemy characterIds make sense
  // - Promotion paths point to valid promoted classes
  // - nextChapterId references exist
  return { valid: errors.length === 0, errors };
}
```

### 14. `src/data/dataProvider.ts`
Factory function `createDataProvider(): IDataProvider`.
Aggregates all data, provides typed lookup methods.

### 15. `src/data/index.ts`
```typescript
export { createDataProvider } from './dataProvider';
```

### 16. Tests — `src/data/__tests__/`

**classes.test.ts** (~15 tests): All 19 classes, valid stats, growth rates 0-100, promotion paths valid.
**weapons.test.ts** (~12 tests): 80+ weapons, valid types, no duplicate IDs, sensible stats.
**armor.test.ts** (~10 tests): 40+ armor, valid slots, no duplicate IDs.
**consumables.test.ts** (~8 tests): 20+ consumables, valid effects.
**skills.test.ts** (~10 tests): 50+ skills, valid types, SP costs >= 0.
**characters.test.ts** (~12 tests): 40+ characters, valid classes, at least 1 lord.
**chapters.test.ts** (~15 tests): 25 chapters, valid map refs, valid enemies, valid conditions.
**paralogues.test.ts** (~8 tests): 10 paralogues, valid structure.
**supportConversations.test.ts** (~8 tests): 30+ conversations, valid character refs.
**mapLayouts.test.ts** (~10 tests): 20+ maps, valid dimensions, deployment zones.
**enemyTemplates.test.ts** (~8 tests): 30+ templates, valid classes.
**validation.test.ts** (~12 tests): Full validation passes, broken data catches errors.
**dataProvider.test.ts** (~12 tests): All lookups work, null for invalid IDs.

TOTAL: 150+ tests

## Import Pattern
```typescript
import {
  ClassDefinition, UnitClassName, WeaponData, ArmorData, ConsumableData, PromotionItemData,
  SkillDefinition, CharacterDefinition, ChapterDefinition, SupportConversation,
  GridMap, EnemyPlacement, ItemData, WeaponType, ItemCategory, ArmorSlot,
  MovementType, Element, SkillType, AoEPattern, StatusEffectType, AIBehavior,
  VictoryCondition, DefeatCondition, Weather, SupportRank, GridType, TerrainType,
  Position, Tile, TerrainData, Stats, GrowthRates, StatCaps, IDataProvider,
  VictoryConditionDef, DefeatConditionDef, NarrativeEvent, DialogueLine,
  ReinforcementTrigger, TreasureLocation, ChapterRewards, WorldMapNode,
  ConsumableEffect, PassiveEffect
} from '../../shared/types';
```
