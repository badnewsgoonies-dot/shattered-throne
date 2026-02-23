# Tutorial & Help — Full Domain Implementation

You are implementing the Tutorial domain for Shattered Throne, a tactical RPG.

## CRITICAL RULES
- ONLY create/modify files under `src/tutorial/`
- Import types ONLY from `../../shared/types`
- Do NOT import from any other domain
- `src/shared/types.ts` already exists — do NOT modify it

## Files to Create

### 1. `src/tutorial/tutorialSteps.ts`

Define 6 tutorial sequences as TutorialStep chains linked by nextStepId.

```typescript
import { TutorialStep } from '../../shared/types';

// Each tutorial is an array of steps. Steps link via nextStepId.

export const TUTORIAL_SEQUENCES: Record<string, TutorialStep[]> = {
  movement_tutorial: [
    { id: 'mov_1', title: 'Select a Unit', text: 'Click on one of your blue units to select them and view their movement options.', highlightUI: 'unitList', nextStepId: 'mov_2' },
    { id: 'mov_2', title: 'View Movement Range', text: 'The blue-highlighted tiles show where this unit can move. Terrain affects movement cost.', nextStepId: 'mov_3' },
    { id: 'mov_3', title: 'Choose Destination', text: 'Click on a blue tile to move your unit there. Different terrain has different movement costs.', nextStepId: 'mov_4' },
    { id: 'mov_4', title: 'Confirm or Cancel', text: 'After moving, an action menu appears. You can attack, use items, or wait.', nextStepId: 'mov_5' },
    { id: 'mov_5', title: 'Wait or Act', text: 'Select "Wait" to end this unit\'s turn without acting, or choose another action.', nextStepId: 'mov_6' },
    { id: 'mov_6', title: 'End Your Turn', text: 'When all your units have acted, select "End Turn" to let the enemy move.', nextStepId: null },
  ],
  combat_tutorial: [
    { id: 'cmb_1', title: 'Move Near an Enemy', text: 'Move your unit adjacent to a red enemy unit. Red tiles show attack range.', nextStepId: 'cmb_2' },
    { id: 'cmb_2', title: 'Select Attack', text: 'Choose "Attack" from the action menu to initiate combat.', nextStepId: 'cmb_3' },
    { id: 'cmb_3', title: 'Read the Forecast', text: 'The battle forecast shows expected damage, hit chance, and critical chance for both sides.', nextStepId: 'cmb_4' },
    { id: 'cmb_4', title: 'Confirm Attack', text: 'Confirm your target to watch the combat play out. Units may counter-attack!', nextStepId: 'cmb_5' },
    { id: 'cmb_5', title: 'Experience Points', text: 'After combat, units earn EXP. At 100 EXP, they level up and gain stats!', nextStepId: null },
  ],
  item_tutorial: [
    { id: 'itm_1', title: 'Open Inventory', text: 'Select "Item" from the action menu to view your unit\'s inventory.', nextStepId: 'itm_2' },
    { id: 'itm_2', title: 'Use a Vulnerary', text: 'Select a healing item like Vulnerary to restore HP. Items have limited uses.', nextStepId: 'itm_3' },
    { id: 'itm_3', title: 'Equip a Weapon', text: 'You can switch weapons by selecting one from your inventory. Different weapons have different stats.', nextStepId: 'itm_4' },
    { id: 'itm_4', title: 'Trade Items', text: 'When adjacent to an ally, select "Trade" to swap items between units.', nextStepId: null },
  ],
  terrain_tutorial: [
    { id: 'ter_1', title: 'Terrain Matters', text: 'Different terrain provides defense and evasion bonuses. Forests give +1 Def and +20% Evasion.', nextStepId: 'ter_2' },
    { id: 'ter_2', title: 'Movement Costs', text: 'Terrain affects how far units can move. Mountains cost 4 movement for foot units but 1 for flyers.', nextStepId: 'ter_3' },
    { id: 'ter_3', title: 'Height Advantage', text: 'Attacking from higher ground gives +15% hit rate. Attacking uphill gives -15% hit rate.', nextStepId: null },
  ],
  skills_tutorial: [
    { id: 'skl_1', title: 'Skills Menu', text: 'Select "Skill" from the action menu to use special abilities. Each class learns unique skills.', nextStepId: 'skl_2' },
    { id: 'skl_2', title: 'SP Costs', text: 'Skills cost SP (Skill Points) to use. SP regenerates 10% per turn. Manage your SP wisely!', nextStepId: 'skl_3' },
    { id: 'skl_3', title: 'Targeting', text: 'Some skills hit a single target, while others have area-of-effect patterns like circles, lines, or crosses.', nextStepId: null },
  ],
  promotion_tutorial: [
    { id: 'prm_1', title: 'Promotion Eligible', text: 'At level 15, base class units can promote to an advanced class using a promotion item.', nextStepId: 'prm_2' },
    { id: 'prm_2', title: 'Choose Promotion Path', text: 'Each class has 2 promotion options with different stat bonuses and weapon access. Choose wisely!', nextStepId: null },
  ],
};

export function getTutorialSteps(tutorialId: string): TutorialStep[] {
  return TUTORIAL_SEQUENCES[tutorialId] ?? [];
}
```

### 2. `src/tutorial/glossary.ts`

Define 50+ game term definitions.

```typescript
export interface GlossaryEntry {
  term: string;
  definition: string;
}

export const GLOSSARY: GlossaryEntry[] = [
  { term: 'Weapon Triangle', definition: 'Swords beat Axes, Axes beat Lances, Lances beat Swords. Advantage gives +15 hit and +1 damage.' },
  { term: 'Magic Triangle', definition: 'Fire beats Wind, Wind beats Thunder, Thunder beats Fire. Same bonuses as weapon triangle.' },
  { term: 'Terrain Bonus', definition: 'Standing on certain terrain grants defense and evasion bonuses. Forests give +1 Def and +20 Eva.' },
  { term: 'Movement Cost', definition: 'Each terrain type has a movement cost per unit type. Forest costs 2 for foot units, 3 for mounted.' },
  { term: 'Height Advantage', definition: 'Attacking from higher terrain gives +15% hit rate. Attacking upward gives -15% hit rate.' },
  { term: 'Zone of Control', definition: 'Moving through tiles adjacent to enemies costs 3 extra movement points.' },
  { term: 'Counter-attack', definition: 'If the defender has a weapon that can reach the attacker, they will counter-attack after being hit.' },
  { term: 'Double Attack', definition: 'If a unit\'s Speed exceeds the target\'s by 5 or more, they attack twice in one combat.' },
  { term: 'Critical Hit', definition: 'A critical hit deals 3x normal damage. Crit rate = Skill/2 + Weapon Crit - Enemy Luck.' },
  { term: 'Support Bonus', definition: 'Adjacent allied units provide +10% hit and evasion per adjacent ally during combat.' },
  { term: 'Effective Damage', definition: 'Weapons effective against a unit type (e.g., Horseslayer vs Mounted) deal 3x weapon might.' },
  { term: 'Fog of War', definition: 'In fog conditions, you can only see tiles within your units\' vision range.' },
  { term: 'Deployment', definition: 'Before battle, place your units on the blue deployment zones. Maximum 8 units per battle.' },
  { term: 'Promotion', definition: 'At level 15, base class units can promote to an advanced class using a promotion item.' },
  { term: 'Growth Rates', definition: 'Each stat has a growth rate (%) — the chance that stat increases by 1 on level up.' },
  { term: 'Durability', definition: 'Weapons and items break after a set number of uses. Iron weapons last 45 uses, Silver last 20.' },
  { term: 'Convoy', definition: 'Shared item storage accessible between battles and by the Lord unit during battle.' },
  { term: 'Support Rank', definition: 'Fight alongside allies to build support points. At thresholds (20/40/60), unlock C/B/A conversations.' },
  { term: 'Forging', definition: 'Improve weapons at the forge by spending gold to add Might (+5 max), Hit (+20 max), or Crit (+10 max) bonuses.' },
  { term: 'Arena', definition: 'Fight random opponents matched to your level to earn gold and experience between chapters.' },
  // Status Effects (8)
  { term: 'Poison', definition: 'Poisoned units lose 10% of max HP at the start of each turn. Lasts until cured or expired.' },
  { term: 'Sleep', definition: 'Sleeping units skip their turn entirely. They wake up if attacked by an enemy.' },
  { term: 'Silence', definition: 'Silenced units cannot use magic tomes or staves until the effect wears off.' },
  { term: 'Berserk', definition: 'Berserked units attack the nearest unit (friend or foe) with +50% Strength. Cannot be controlled.' },
  { term: 'Charm', definition: 'Charmed units temporarily fight for the enemy team until the effect expires.' },
  { term: 'Frozen', definition: 'Frozen units cannot move but can still attack or use items if an enemy is in range.' },
  { term: 'Blind', definition: 'Blinded units have their hit rate reduced by 50%, making attacks much less accurate.' },
  { term: 'Stun', definition: 'Stunned units skip their turn entirely, similar to sleep but not removed by attacks.' },
  // Stats (9)
  { term: 'HP', definition: 'Hit Points — the unit\'s health. When HP reaches 0, the unit is defeated.' },
  { term: 'Strength', definition: 'Determines physical attack damage. Higher Strength means more damage with swords, lances, axes, and bows.' },
  { term: 'Magic', definition: 'Determines magical attack damage and healing power. Used with tomes and staves.' },
  { term: 'Skill', definition: 'Affects hit rate and critical hit chance. Higher Skill means more accurate and deadly attacks.' },
  { term: 'Speed', definition: 'Determines evasion and double attack threshold. Units 5+ Speed faster attack twice.' },
  { term: 'Luck', definition: 'Reduces enemy critical hit chance and slightly improves hit rate. A defensive stat.' },
  { term: 'Defense', definition: 'Reduces physical damage taken. Each point of Defense blocks 1 point of physical damage.' },
  { term: 'Resistance', definition: 'Reduces magical damage taken. Each point of Resistance blocks 1 point of magical damage.' },
  { term: 'Movement', definition: 'How many tiles a unit can move per turn. Terrain costs are subtracted from this value.' },
  // Victory Conditions (5)
  { term: 'Rout', definition: 'Victory condition: defeat all enemy units on the map to win.' },
  { term: 'Boss Kill', definition: 'Victory condition: defeat the boss enemy (marked with a crown) to win.' },
  { term: 'Survive', definition: 'Victory condition: survive for the specified number of turns to win.' },
  { term: 'Reach Location', definition: 'Victory condition: move any player unit to the marked destination tile.' },
  { term: 'Protect Target', definition: 'Victory condition: keep the specified allied unit alive until victory.' },
  // Classes (basic descriptions)
  { term: 'Warrior', definition: 'A balanced melee fighter using swords and axes. Promotes to Berserker or General.' },
  { term: 'Knight', definition: 'A mounted lancer with high mobility. Promotes to Paladin or Great Knight.' },
  { term: 'Archer', definition: 'A ranged attacker using bows. Cannot counter at melee range. Promotes to Sniper or Ranger.' },
  { term: 'Mage', definition: 'A magical attacker using tomes. Targets Resistance instead of Defense. Promotes to Sage or Dark Knight.' },
  { term: 'Cleric', definition: 'A healer using staves. Cannot attack directly. Promotes to Bishop or Valkyrie.' },
  { term: 'Thief', definition: 'A fast, evasive unit with high Skill. Can pick locks. Promotes to Assassin or Trickster.' },
  { term: 'Berserker', definition: 'Promoted Warrior focused on raw power. +10 critical hit bonus. Axes specialist.' },
  { term: 'Paladin', definition: 'Promoted Knight with staff access. High mobility and defensive stats.' },
  { term: 'Assassin', definition: 'Promoted Thief with +15 critical hit bonus. Deadly and fast.' },
  { term: 'Sage', definition: 'Promoted Mage with staff access. Master of offensive and support magic.' },
];

export function getGlossaryEntry(term: string): string | null {
  const entry = GLOSSARY.find(e => e.term.toLowerCase() === term.toLowerCase());
  return entry?.definition ?? null;
}

export function searchGlossary(query: string): { term: string; definition: string }[] {
  const q = query.toLowerCase();
  return GLOSSARY.filter(e => e.term.toLowerCase().includes(q) || e.definition.toLowerCase().includes(q));
}

export function getAllGlossaryEntries(): { term: string; definition: string }[] {
  return [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
}
```

### 3. `src/tutorial/hintSystem.ts`

```typescript
const CONTEXT_HINTS: Record<string, string> = {
  unitSelect: 'Select one of your units with blue highlight to begin their turn.',
  moveSelect: 'Click a blue-highlighted tile to move your unit there.',
  actionSelect: 'Choose an action: Attack, Skill, Item, Wait, or Trade.',
  targetSelect: 'Select an enemy in range to attack. Red tiles show valid targets.',
  deploy: 'Place your units on the blue deployment zones, then press Start.',
  baseCamp: 'Manage your roster, buy items at the shop, or view support conversations.',
  worldMap: 'Select a chapter node on the map to begin a mission.',
};

let lastHintTime = 0;
let lastHintContext = '';

export function getHint(context: string, timeSinceLastAction: number, hintsEnabled: boolean): string | null {
  if (!hintsEnabled) return null;
  if (timeSinceLastAction < 10000) return null;
  const hint = CONTEXT_HINTS[context];
  if (!hint) return null;
  const now = Date.now();
  if (context === lastHintContext && now - lastHintTime < 30000) return null;
  lastHintTime = now;
  lastHintContext = context;
  return hint;
}

export function resetHintState(): void {
  lastHintTime = 0;
  lastHintContext = '';
}
```

### 4. `src/tutorial/tooltipProvider.ts`

```typescript
import { TerrainType, StatusEffectType, WeaponType, UnitClassName } from '../../shared/types';

export function getTooltipForTerrain(terrain: TerrainType): string { /* terrain effect descriptions */ }
export function getTooltipForStat(statName: string): string { /* stat descriptions */ }
export function getTooltipForStatus(status: StatusEffectType): string { /* status effect descriptions */ }
export function getTooltipForWeaponType(weapon: WeaponType): string { /* weapon triangle info */ }
export function getTooltipForClass(className: UnitClassName): string { /* class descriptions */ }
```

### 5. `src/tutorial/tutorialSystem.ts`

Factory function `createTutorialSystem(): ITutorialSystem`.

```typescript
import { ITutorialSystem, TutorialState, TutorialStep } from '../../shared/types';

export function createTutorialSystem(): ITutorialSystem {
  let state: TutorialState = {
    seenTutorials: [],
    currentTutorialId: null,
    currentStepId: null,
    hintsEnabled: true,
    lastActionTimestamp: Date.now(),
  };

  return {
    init(initialState: TutorialState) { state = { ...initialState }; },
    startTutorial(tutorialId: string): TutorialStep | null {
      if (state.seenTutorials.includes(tutorialId) && !state.hintsEnabled) return null;
      const steps = getTutorialSteps(tutorialId);
      if (steps.length === 0) return null;
      state = { ...state, currentTutorialId: tutorialId, currentStepId: steps[0].id };
      return steps[0];
    },
    advanceTutorial(): TutorialStep | null {
      if (!state.currentTutorialId || !state.currentStepId) return null;
      const steps = getTutorialSteps(state.currentTutorialId);
      const current = steps.find(s => s.id === state.currentStepId);
      if (!current?.nextStepId) {
        this.completeTutorial(state.currentTutorialId);
        return null;
      }
      state = { ...state, currentStepId: current.nextStepId };
      return steps.find(s => s.id === current.nextStepId) ?? null;
    },
    completeTutorial(tutorialId: string) {
      if (!state.seenTutorials.includes(tutorialId)) {
        state = { ...state, seenTutorials: [...state.seenTutorials, tutorialId], currentTutorialId: null, currentStepId: null };
      }
    },
    getHint(context, timeSinceLastAction) { return getHint(context, timeSinceLastAction, state.hintsEnabled); },
    getGlossaryEntry(term) { return getGlossaryEntryFn(term); },
    searchGlossary(query) { return searchGlossaryFn(query); },
    getState() { return { ...state }; },
    markSeen(tutorialId) {
      if (!state.seenTutorials.includes(tutorialId)) {
        state = { ...state, seenTutorials: [...state.seenTutorials, tutorialId] };
      }
    },
  };
}
```

### 6. `src/tutorial/index.ts`
```typescript
export { createTutorialSystem } from './tutorialSystem';
```

### 7. Tests — `src/tutorial/__tests__/`

**tutorialSystem.test.ts** (~15 tests): Init, start tutorial, advance through steps, complete, markSeen, already-seen handling, getState.
**tutorialSteps.test.ts** (~12 tests): All 6 sequences exist, proper step count, nextStepId chains are valid, no broken links, last step has null nextStepId.
**glossary.test.ts** (~12 tests): Lookup exact term, case-insensitive, search returns matches, 50+ entries exist, getAllGlossaryEntries sorted.
**hintSystem.test.ts** (~12 tests): Hint after 10s, no hint before 10s, context-specific, no repeat within 30s, disabled when hintsEnabled=false, unknown context returns null.
**tooltipProvider.test.ts** (~12 tests): Tooltip for each terrain type (11), each stat (9), each status (8), each weapon type, each class.

TOTAL: 60+ tests

## Import Pattern
```typescript
import { ITutorialSystem, TutorialState, TutorialStep, TerrainType, StatusEffectType, WeaponType, UnitClassName } from '../../shared/types';
```
