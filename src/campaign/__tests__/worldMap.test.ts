import {
  describe,
  expect,
  it,
} from 'vitest';
import {
  CHAPTER_FLOW,
  PARALOGUE_UNLOCKS,
} from '../chapterManager';
import {
  createDefaultWorldMapNodes,
  getWorldMapNodes,
} from '../worldMap';
import { makeCampaignState } from './testUtils';

describe('worldMap.createDefaultWorldMapNodes', () => {
  it('creates story nodes for all chapter flow entries', () => {
    const nodes = createDefaultWorldMapNodes();
    const storyChapterIds = nodes
      .filter((node) => node.type === 'story')
      .map((node) => node.chapterId)
      .sort();

    expect(storyChapterIds).toEqual(Object.keys(CHAPTER_FLOW).sort());
  });

  it('creates paralogue nodes for all paralogue unlock entries', () => {
    const nodes = createDefaultWorldMapNodes();
    const paralogueIds = nodes
      .filter((node) => node.type === 'paralogue')
      .map((node) => node.chapterId)
      .sort();

    expect(paralogueIds).toEqual(Object.keys(PARALOGUE_UNLOCKS).sort());
  });

  it('creates shop and arena service nodes', () => {
    const nodes = createDefaultWorldMapNodes();

    expect(nodes.filter((node) => node.type === 'shop')).toHaveLength(2);
    expect(nodes.filter((node) => node.type === 'arena')).toHaveLength(2);
  });

  it('marks only ch_1 story node unlocked at campaign start', () => {
    const nodes = createDefaultWorldMapNodes();

    const unlockedStoryNodes = nodes.filter((node) => node.type === 'story' && node.unlocked);
    expect(unlockedStoryNodes).toHaveLength(1);
    expect(unlockedStoryNodes[0].chapterId).toBe('ch_1');
  });

  it('keeps non-initial story nodes locked and incomplete', () => {
    const nodes = createDefaultWorldMapNodes();

    const nonInitial = nodes.filter((node) => node.type === 'story' && node.chapterId !== 'ch_1');
    expect(nonInitial.every((node) => !node.unlocked && !node.completed)).toBe(true);
  });

  it('uses flow-based connections for linear story chapters', () => {
    const nodes = createDefaultWorldMapNodes();

    const ch1 = nodes.find((node) => node.chapterId === 'ch_1');
    const ch20 = nodes.find((node) => node.chapterId === 'ch_20');

    expect(ch1?.connections).toEqual(['node_ch_2']);
    expect(ch20?.connections).toEqual(['node_ch_21']);
  });

  it('uses branch connections for ch_11', () => {
    const nodes = createDefaultWorldMapNodes();

    const branchNode = nodes.find((node) => node.chapterId === 'ch_11');

    expect(branchNode?.connections).toEqual(['node_ch_12a', 'node_ch_12b']);
  });

  it('connects each paralogue to its required chapter node', () => {
    const nodes = createDefaultWorldMapNodes();

    for (const [paralogueId, unlock] of Object.entries(PARALOGUE_UNLOCKS)) {
      const node = nodes.find((entry) => entry.chapterId === paralogueId);
      expect(node?.connections).toEqual([`node_${unlock.requiredChapter}`]);
    }
  });

  it('builds unique node ids', () => {
    const nodes = createDefaultWorldMapNodes();
    const ids = nodes.map((node) => node.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('offsets route A and route B chapter positions vertically', () => {
    const nodes = createDefaultWorldMapNodes();

    const a = nodes.find((node) => node.chapterId === 'ch_12a');
    const b = nodes.find((node) => node.chapterId === 'ch_12b');

    expect(a?.position.x).toBe(b?.position.x);
    expect(a?.position.y).not.toBe(b?.position.y);
    expect((a?.position.y ?? 0) < (b?.position.y ?? 0)).toBe(true);
  });

  it('initializes service nodes as locked and incomplete', () => {
    const nodes = createDefaultWorldMapNodes();
    const serviceNodes = nodes.filter((node) => node.type === 'shop' || node.type === 'arena');

    expect(serviceNodes.every((node) => !node.unlocked && !node.completed)).toBe(true);
  });
});

describe('worldMap.getWorldMapNodes', () => {
  it('returns the state worldMapNodes array', () => {
    const state = makeCampaignState();

    expect(getWorldMapNodes(state)).toBe(state.worldMapNodes);
  });
});
