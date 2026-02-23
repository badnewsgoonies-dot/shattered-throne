import {
  CampaignState,
  Position,
  WorldMapNode,
} from '../shared/types';
import {
  CHAPTER_FLOW,
  PARALOGUE_UNLOCKS,
} from './chapterManager';

const STORY_NODE_Y_BASE = 120;
const STORY_NODE_X_STEP = 44;

function parseChapterId(chapterId: string): { number: number; route: 'a' | 'b' | null } {
  const match = /^ch_(\d+)([ab])?$/.exec(chapterId);

  if (!match) {
    return { number: 0, route: null };
  }

  return {
    number: Number(match[1]),
    route: (match[2] as 'a' | 'b' | undefined) ?? null,
  };
}

function getStoryNodePosition(chapterId: string): Position {
  const { number, route } = parseChapterId(chapterId);

  const x = Math.max(1, number) * STORY_NODE_X_STEP;
  const waveOffset = (number % 3) * 22;
  let y = STORY_NODE_Y_BASE + waveOffset;

  if (route === 'a') {
    y -= 52;
  } else if (route === 'b') {
    y += 52;
  }

  return { x, y };
}

function buildStoryNodes(): WorldMapNode[] {
  return Object.keys(CHAPTER_FLOW).map((chapterId) => {
    const flowDef = CHAPTER_FLOW[chapterId];
    const directConnections = flowDef.next ? [`node_${flowDef.next}`] : [];
    const branchConnections = flowDef.branches
      ? flowDef.branches.map((branch) => `node_${branch.nextChapterId}`)
      : [];

    return {
      id: `node_${chapterId}`,
      chapterId,
      position: getStoryNodePosition(chapterId),
      connections: [...directConnections, ...branchConnections],
      type: 'story',
      unlocked: chapterId === 'ch_1',
      completed: false,
    };
  });
}

function buildParalogueNodes(storyNodes: WorldMapNode[]): WorldMapNode[] {
  const chapterNodeById = new Map(storyNodes.map((node) => [node.chapterId, node]));

  return Object.entries(PARALOGUE_UNLOCKS).map(([paralogueId, unlock], index) => {
    const anchorNode = chapterNodeById.get(unlock.requiredChapter);
    const anchorPosition = anchorNode?.position ?? { x: 40 * (index + 1), y: 260 };

    return {
      id: `node_${paralogueId}`,
      chapterId: paralogueId,
      position: {
        x: anchorPosition.x + 20,
        y: anchorPosition.y + (index % 2 === 0 ? 58 : -58),
      },
      connections: [`node_${unlock.requiredChapter}`],
      type: 'paralogue',
      unlocked: false,
      completed: false,
    };
  });
}

function buildServiceNodes(): WorldMapNode[] {
  return [
    {
      id: 'node_shop_1',
      chapterId: '',
      position: { x: 120, y: 250 },
      connections: ['node_ch_3'],
      type: 'shop',
      unlocked: false,
      completed: false,
    },
    {
      id: 'node_shop_2',
      chapterId: '',
      position: { x: 420, y: 245 },
      connections: ['node_ch_20'],
      type: 'shop',
      unlocked: false,
      completed: false,
    },
    {
      id: 'node_arena_1',
      chapterId: '',
      position: { x: 205, y: 262 },
      connections: ['node_ch_5'],
      type: 'arena',
      unlocked: false,
      completed: false,
    },
    {
      id: 'node_arena_2',
      chapterId: '',
      position: { x: 505, y: 262 },
      connections: ['node_ch_22'],
      type: 'arena',
      unlocked: false,
      completed: false,
    },
  ];
}

export function createDefaultWorldMapNodes(): WorldMapNode[] {
  const storyNodes = buildStoryNodes();
  const paralogueNodes = buildParalogueNodes(storyNodes);
  const serviceNodes = buildServiceNodes();

  return [...storyNodes, ...paralogueNodes, ...serviceNodes];
}

export function getWorldMapNodes(state: CampaignState): WorldMapNode[] {
  return state.worldMapNodes;
}
