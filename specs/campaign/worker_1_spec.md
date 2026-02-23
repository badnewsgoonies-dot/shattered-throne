# Campaign & Story — Full Domain Implementation

You are implementing the Campaign domain for Shattered Throne, a tactical RPG.

## CRITICAL RULES
- ONLY create/modify files under `src/campaign/`
- Import types ONLY from `../../shared/types`
- Do NOT import from any other domain
- `src/shared/types.ts` already exists — do NOT modify it
- Mock localStorage in tests

## Files to Create

### 1. `src/campaign/chapterManager.ts`

Define chapter flow data. 25 story chapters + 10 paralogues.

```typescript
// Chapter flow: ch_1 → ch_2 → ... → ch_11 → ch_12 (branch)
// Route A: ch_12a → ch_13a → ... → ch_19a → ch_20
// Route B: ch_12b → ch_13b → ... → ch_19b → ch_20
// Common: ch_20 → ch_21 → ... → ch_25

export const CHAPTER_FLOW: Record<string, { next: string | null; branches?: { choiceText: string; nextChapterId: string }[] }> = {
  'ch_1': { next: 'ch_2' },
  'ch_2': { next: 'ch_3' },
  // ... through ch_11
  'ch_11': { next: null, branches: [
    { choiceText: 'Side with the Kingdom', nextChapterId: 'ch_12a' },
    { choiceText: 'Side with the Rebellion', nextChapterId: 'ch_12b' },
  ]},
  'ch_12a': { next: 'ch_13a' },
  // ... through ch_19a
  'ch_19a': { next: 'ch_20' },
  'ch_12b': { next: 'ch_13b' },
  // ... through ch_19b
  'ch_19b': { next: 'ch_20' },
  'ch_20': { next: 'ch_21' },
  // ... through ch_25
  'ch_25': { next: null },
};

// Paralogue unlock conditions
export const PARALOGUE_UNLOCKS: Record<string, { requiredChapter: string; condition?: string }> = {
  'par_1': { requiredChapter: 'ch_3' },
  'par_2': { requiredChapter: 'ch_5' },
  'par_3': { requiredChapter: 'ch_6' },
  'par_4': { requiredChapter: 'ch_8' },
  'par_5': { requiredChapter: 'ch_10' },
  'par_6': { requiredChapter: 'ch_13a', condition: 'Route A only' },
  'par_7': { requiredChapter: 'ch_13b', condition: 'Route B only' },
  'par_8': { requiredChapter: 'ch_16a' },
  'par_9': { requiredChapter: 'ch_20' },
  'par_10': { requiredChapter: 'ch_22' },
};
```

### 2. `src/campaign/worldMap.ts`

```typescript
import { WorldMapNode, CampaignState, Position } from '../../shared/types';

export function createDefaultWorldMapNodes(): WorldMapNode[] {
  // Create nodes for all chapters, paralogues, shops, arenas
  // Each node has position, connections, type, unlocked/completed status
  const nodes: WorldMapNode[] = [];
  // Story nodes
  for (let i = 1; i <= 25; i++) {
    nodes.push({
      id: `node_ch_${i}`,
      chapterId: `ch_${i}`,
      position: { x: i * 40, y: 100 + (i % 3) * 30 },
      connections: i < 25 ? [`node_ch_${i + 1}`] : [],
      type: 'story',
      unlocked: i === 1,
      completed: false,
    });
  }
  // Add some shop and arena nodes
  nodes.push({ id: 'node_shop_1', chapterId: '', position: { x: 100, y: 200 }, connections: ['node_ch_3'], type: 'shop', unlocked: false, completed: false });
  nodes.push({ id: 'node_arena_1', chapterId: '', position: { x: 200, y: 200 }, connections: ['node_ch_5'], type: 'arena', unlocked: false, completed: false });
  return nodes;
}

export function getWorldMapNodes(state: CampaignState): WorldMapNode[] {
  return state.worldMapNodes;
}
```

### 3. `src/campaign/narrativeEngine.ts`

```typescript
import { ChapterDefinition, NarrativeEvent, DialogueLine, Position } from '../../shared/types';

export function getNarrativeEvents(
  chapter: ChapterDefinition,
  trigger: 'preBattle' | 'postBattle' | { type: 'turn'; turn: number } | { type: 'location'; position: Position } | { type: 'unitDefeated'; unitId: string }
): DialogueLine[] {
  for (const event of chapter.narrative) {
    if (typeof event.trigger === 'string' && typeof trigger === 'string' && event.trigger === trigger) {
      return event.dialogue;
    }
    if (typeof event.trigger === 'object' && typeof trigger === 'object') {
      if (event.trigger.type === trigger.type) {
        if (event.trigger.type === 'turn' && trigger.type === 'turn' && event.trigger.turn === trigger.turn) {
          return event.dialogue;
        }
        // etc.
      }
    }
  }
  return [];
}
```

### 4. `src/campaign/supportSystem.ts`

```typescript
import { CampaignState, SupportRank, SupportConversation, IDataProvider } from '../../shared/types';

function getSupportKey(charA: string, charB: string): string {
  return [charA, charB].sort().join('-');
}

export function updateSupportPoints(state: CampaignState, charA: string, charB: string, points: number): CampaignState {
  const key = getSupportKey(charA, charB);
  const currentPoints = (state.supportLog as any)?.[`${key}_points`] ?? 0;
  // Use supportPoints tracking... actually CampaignState doesn't have per-pair points
  // Store in a convention: supportLog is Record<string, SupportRank>
  // We need to track points separately. Store in the roster units' supportPoints.
  // For now, just return state with updated points on roster units
  const roster = state.roster.map(u => {
    if (u.characterId === charA || u.characterId === charB) {
      const targetId = u.characterId === charA ? charB : charA;
      const newPoints = { ...u.supportPoints };
      newPoints[targetId] = (newPoints[targetId] || 0) + points;
      return { ...u, supportPoints: newPoints };
    }
    return u;
  });
  return { ...state, roster };
}

export function updateSupportRank(state: CampaignState, charA: string, charB: string, rank: SupportRank): CampaignState {
  const key = getSupportKey(charA, charB);
  const supportLog = { ...state.supportLog, [key]: rank };
  const roster = state.roster.map(u => {
    if (u.characterId === charA || u.characterId === charB) {
      const targetId = u.characterId === charA ? charB : charA;
      return { ...u, supportRanks: { ...u.supportRanks, [targetId]: rank } };
    }
    return u;
  });
  return { ...state, supportLog, roster };
}
```

### 5. `src/campaign/saveSystem.ts`

```typescript
import { CampaignState, SaveData, BattleSaveData, SAVE_VERSION, NUM_SAVE_SLOTS } from '../../shared/types';

export function save(state: CampaignState, slotIndex: number): SaveData {
  if (slotIndex < 0 || slotIndex >= NUM_SAVE_SLOTS) throw new Error('Invalid slot');
  const saveData: SaveData = {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    slotIndex,
    campaign: state,
  };
  localStorage.setItem(`save_slot_${slotIndex}`, JSON.stringify(saveData));
  return saveData;
}

export function load(slotIndex: number): SaveData | null {
  const raw = localStorage.getItem(`save_slot_${slotIndex}`);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as SaveData;
    if (data.version !== SAVE_VERSION) return null;
    return data;
  } catch { return null; }
}

export function saveBattle(state: CampaignState, battleState: BattleSaveData, slotIndex: number): SaveData {
  const saveData: SaveData = {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    slotIndex,
    campaign: state,
    battleState,
  };
  localStorage.setItem(`save_slot_${slotIndex}`, JSON.stringify(saveData));
  return saveData;
}
```

### 6. `src/campaign/baseCamp.ts`

```typescript
import { CampaignState, Unit, MAX_DEPLOY_SIZE } from '../../shared/types';

export function selectDeployment(roster: Unit[], selectedIds: string[]): Unit[] {
  if (selectedIds.length > MAX_DEPLOY_SIZE) {
    return roster.filter(u => selectedIds.slice(0, MAX_DEPLOY_SIZE).includes(u.id));
  }
  return roster.filter(u => selectedIds.includes(u.id));
}
```

### 7. `src/campaign/campaignSystem.ts`

Factory function `createCampaignSystem(data: IDataProvider): ICampaignSystem`.

Implements all ICampaignSystem methods:
- `startNewCampaign()`: Fresh CampaignState with ch_1 unlocked, empty roster, 1000 gold, default world map
- `getChapter(chapterId)`: Delegate to data.getChapter. Throw if not found.
- `completeChapter(state, chapterId, rewards)`: Mark complete, add gold, add items, unlock next chapters, update world map
- `getAvailableChapters(state)`: Unlocked but not completed
- `addUnitToRoster/removeUnitFromRoster`: Add/remove from roster array
- `updateSupportPoints/updateSupportRank`: Delegate to supportSystem
- `getSupportConversation`: Delegate to data provider
- `save/load/saveBattle`: Delegate to saveSystem
- `getWorldMapNodes`: Return state.worldMapNodes

### 8. `src/campaign/index.ts`
```typescript
export { createCampaignSystem } from './campaignSystem';
```

### 9. Tests — `src/campaign/__tests__/`

Mock localStorage and IDataProvider in tests.

**campaignSystem.test.ts** (~15 tests): New campaign init, chapter completion, available chapters, gold/item rewards, roster management.
**chapterManager.test.ts** (~12 tests): Chapter flow, branching at ch_11, paralogue unlocks.
**worldMap.test.ts** (~10 tests): Default nodes, connections, unlock progression.
**narrativeEngine.test.ts** (~8 tests): Trigger matching for preBattle/postBattle/turn/location.
**supportSystem.test.ts** (~10 tests): Point accumulation, rank updates, key sorting.
**saveSystem.test.ts** (~12 tests): Save/load round-trip, battle save, invalid data, multiple slots, version check.
**baseCamp.test.ts** (~8 tests): Deployment selection, max size enforcement.

TOTAL: 80+ tests

## Import Pattern
```typescript
import {
  ICampaignSystem, IDataProvider, CampaignState, ChapterDefinition, ChapterRewards,
  Unit, ItemInstance, WorldMapNode, SupportConversation, SupportRank,
  SaveData, BattleSaveData, DialogueLine, NarrativeEvent, Position,
  SAVE_VERSION, NUM_SAVE_SLOTS, MAX_DEPLOY_SIZE, MAX_PARTY_SIZE
} from '../../shared/types';
```
