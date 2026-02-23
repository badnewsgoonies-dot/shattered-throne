import {
  BattleSaveData,
  CampaignState,
  ChapterDefinition,
  ChapterRewards,
  ICampaignSystem,
  IDataProvider,
  ItemInstance,
  MAX_PARTY_SIZE,
  SaveData,
  SupportConversation,
  SupportRank,
  Unit,
  WorldMapNode,
} from '../shared/types';
import {
  CHAPTER_FLOW,
  PARALOGUE_UNLOCKS,
} from './chapterManager';
import {
  load as loadSave,
  save as saveToSlot,
  saveBattle as saveBattleToSlot,
} from './saveSystem';
import {
  updateSupportPoints as updateSupportPointsInternal,
  updateSupportRank as updateSupportRankInternal,
} from './supportSystem';
import {
  createDefaultWorldMapNodes,
  getWorldMapNodes as getWorldMapNodesInternal,
} from './worldMap';

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function flowUnlocksForChapter(chapterId: string): string[] {
  const flow = CHAPTER_FLOW[chapterId];
  if (!flow) {
    return [];
  }

  const unlocked: string[] = [];

  if (flow.next) {
    unlocked.push(flow.next);
  }

  if (flow.branches) {
    unlocked.push(...flow.branches.map((branch) => branch.nextChapterId));
  }

  return unlocked;
}

function routeForChapter(chapterId: string, currentRoute: string | undefined): string | undefined {
  if (chapterId.endsWith('a')) {
    return 'A';
  }

  if (chapterId.endsWith('b')) {
    return 'B';
  }

  return currentRoute;
}

function getUnlockedParalogues(
  completedChapters: string[],
  currentlyUnlocked: string[],
): string[] {
  const completedSet = new Set(completedChapters);
  const unlockedSet = new Set(currentlyUnlocked);
  const result: string[] = [];

  for (const [paralogueId, unlock] of Object.entries(PARALOGUE_UNLOCKS)) {
    if (!unlockedSet.has(paralogueId) && completedSet.has(unlock.requiredChapter)) {
      result.push(paralogueId);
    }
  }

  return result;
}

function makeRewardItems(itemRewards: string[]): ItemInstance[] {
  return itemRewards.map((itemId, index) => ({
    instanceId: `inst_${itemId}_${Date.now()}_${index}`,
    dataId: itemId,
  }));
}

function refreshWorldMapNodes(
  nodes: WorldMapNode[],
  unlockedChapters: string[],
  completedChapters: string[],
): WorldMapNode[] {
  const unlockedChapterSet = new Set(unlockedChapters);
  const completedChapterSet = new Set(completedChapters);

  const completedNodeIds = new Set(
    nodes
      .filter((node) => completedChapterSet.has(node.chapterId))
      .map((node) => node.id),
  );

  const unlockedNodeIds = new Set(
    nodes
      .filter((node) => node.unlocked)
      .map((node) => node.id),
  );

  for (const node of nodes) {
    if (completedChapterSet.has(node.chapterId) || unlockedChapterSet.has(node.chapterId)) {
      unlockedNodeIds.add(node.id);
    }
  }

  for (const node of nodes) {
    if (completedNodeIds.has(node.id)) {
      for (const connectionId of node.connections) {
        unlockedNodeIds.add(connectionId);
      }
    }

    if (node.connections.some((connectionId) => completedNodeIds.has(connectionId))) {
      unlockedNodeIds.add(node.id);
    }
  }

  return nodes.map((node) => {
    const completed = completedChapterSet.has(node.chapterId);

    return {
      ...node,
      completed,
      unlocked: completed || unlockedNodeIds.has(node.id),
    };
  });
}

function chooseCurrentChapter(
  state: CampaignState,
  completedChapters: string[],
  newlyUnlockedCandidates: string[],
): string {
  const completedSet = new Set(completedChapters);

  const next = newlyUnlockedCandidates.find((chapterId) => !completedSet.has(chapterId));
  if (next) {
    return next;
  }

  return state.currentChapterId;
}

function findSupportConversation(
  conversations: SupportConversation[],
  charA: string,
  charB: string,
  rank: SupportRank,
): SupportConversation | null {
  return conversations.find((conversation) => {
    const samePair =
      (conversation.characterA === charA && conversation.characterB === charB)
      || (conversation.characterA === charB && conversation.characterB === charA);

    return samePair && conversation.rank === rank;
  }) ?? null;
}

export function createCampaignSystem(data: IDataProvider): ICampaignSystem {
  return {
    startNewCampaign(): CampaignState {
      return {
        currentChapterId: 'ch_1',
        completedChapters: [],
        unlockedChapters: ['ch_1'],
        roster: [],
        convoy: [],
        gold: 1000,
        turnCount: 0,
        supportLog: {},
        achievements: [],
        worldMapNodes: createDefaultWorldMapNodes(),
        playtimeSeconds: 0,
      };
    },

    getChapter(chapterId: string): ChapterDefinition {
      const chapter = data.getChapter(chapterId);
      if (!chapter) {
        throw new Error(`Chapter not found: ${chapterId}`);
      }

      return chapter;
    },

    completeChapter(state: CampaignState, chapterId: string, rewards: ChapterRewards): CampaignState {
      if (state.completedChapters.includes(chapterId)) {
        return state;
      }

      const completedChapters = [...state.completedChapters, chapterId];
      const flowUnlocks = flowUnlocksForChapter(chapterId);
      const rewardUnlocks = rewards.unlockedChapters;
      const route = routeForChapter(chapterId, state.currentRoute);

      const unlockedWithChapterRewards = unique([
        ...state.unlockedChapters,
        ...flowUnlocks,
        ...rewardUnlocks,
      ]);

      const paralogueUnlocks = getUnlockedParalogues(completedChapters, unlockedWithChapterRewards);

      const unlockedChapters = unique([
        ...unlockedWithChapterRewards,
        ...paralogueUnlocks,
      ]);

      const convoy = [
        ...state.convoy,
        ...makeRewardItems(rewards.itemRewards),
      ];

      const currentChapterId = chooseCurrentChapter(
        state,
        completedChapters,
        [...flowUnlocks, ...rewardUnlocks, ...paralogueUnlocks],
      );

      const worldMapNodes = refreshWorldMapNodes(
        state.worldMapNodes,
        unlockedChapters,
        completedChapters,
      );

      return {
        ...state,
        currentChapterId,
        completedChapters,
        unlockedChapters,
        convoy,
        gold: state.gold + rewards.goldReward,
        worldMapNodes,
        currentRoute: route,
      };
    },

    getAvailableChapters(state: CampaignState): string[] {
      const completedSet = new Set(state.completedChapters);
      return state.unlockedChapters.filter((chapterId) => !completedSet.has(chapterId));
    },

    addUnitToRoster(state: CampaignState, unit: Unit): CampaignState {
      if (state.roster.some((existing) => existing.id === unit.id)) {
        return state;
      }

      if (state.roster.length >= MAX_PARTY_SIZE) {
        return state;
      }

      return {
        ...state,
        roster: [...state.roster, unit],
      };
    },

    removeUnitFromRoster(state: CampaignState, unitId: string): CampaignState {
      const roster = state.roster.filter((unit) => unit.id !== unitId);

      if (roster.length === state.roster.length) {
        return state;
      }

      return {
        ...state,
        roster,
      };
    },

    updateSupportPoints(state: CampaignState, charA: string, charB: string, points: number): CampaignState {
      return updateSupportPointsInternal(state, charA, charB, points);
    },

    updateSupportRank(state: CampaignState, charA: string, charB: string, rank: SupportRank): CampaignState {
      return updateSupportRankInternal(state, charA, charB, rank);
    },

    getSupportConversation(charA: string, charB: string, rank: SupportRank): SupportConversation | null {
      const direct = findSupportConversation(data.getSupportConversations(charA, charB), charA, charB, rank);
      if (direct) {
        return direct;
      }

      if (charA === charB) {
        return null;
      }

      return findSupportConversation(data.getSupportConversations(charB, charA), charA, charB, rank);
    },

    save(state: CampaignState, slotIndex: number): SaveData {
      return saveToSlot(state, slotIndex);
    },

    load(slotIndex: number): SaveData | null {
      return loadSave(slotIndex);
    },

    saveBattle(state: CampaignState, battleState: BattleSaveData, slotIndex: number): SaveData {
      return saveBattleToSlot(state, battleState, slotIndex);
    },

    getWorldMapNodes(state: CampaignState): WorldMapNode[] {
      return getWorldMapNodesInternal(state);
    },
  };
}
