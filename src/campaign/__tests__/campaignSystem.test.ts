import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import {
  MAX_PARTY_SIZE,
  NUM_SAVE_SLOTS,
  SAVE_VERSION,
  SupportRank,
} from '../../shared/types';
import { createCampaignSystem } from '../campaignSystem';
import {
  createLocalStorageMock,
  createMockDataProvider,
  makeBattleSaveData,
  makeCampaignState,
  makeChapterDefinition,
  makeChapterRewards,
  makeSupportConversation,
  makeUnit,
  toNodeId,
} from './testUtils';

describe('campaignSystem', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorageMock(),
      configurable: true,
      writable: true,
    });
  });

  it('startNewCampaign initializes fresh campaign defaults', () => {
    const system = createCampaignSystem(createMockDataProvider());

    const state = system.startNewCampaign();

    expect(state.currentChapterId).toBe('ch_1');
    expect(state.unlockedChapters).toEqual(['ch_1']);
    expect(state.completedChapters).toEqual([]);
    expect(state.roster).toEqual([]);
    expect(state.convoy).toEqual([]);
    expect(state.gold).toBe(1000);
    expect(state.playtimeSeconds).toBe(0);
  });

  it('startNewCampaign creates world map with ch_1 unlocked', () => {
    const system = createCampaignSystem(createMockDataProvider());

    const state = system.startNewCampaign();
    const node = state.worldMapNodes.find((entry) => entry.chapterId === 'ch_1');

    expect(node).toBeDefined();
    expect(node?.unlocked).toBe(true);
    expect(state.worldMapNodes.every((entry) => entry.chapterId === 'ch_1' || !entry.unlocked || entry.chapterId === '')).toBe(true);
  });

  it('getChapter returns chapter from data provider', () => {
    const chapter = makeChapterDefinition({ id: 'ch_5' });
    const system = createCampaignSystem(createMockDataProvider({ chapters: [chapter] }));

    expect(system.getChapter('ch_5')).toEqual(chapter);
  });

  it('getChapter throws for missing chapter', () => {
    const system = createCampaignSystem(createMockDataProvider());

    expect(() => system.getChapter('missing')).toThrowError('Chapter not found: missing');
  });

  it('completeChapter marks chapter complete and unlocks flow chapter', () => {
    const system = createCampaignSystem(createMockDataProvider());
    const state = makeCampaignState();

    const next = system.completeChapter(state, 'ch_1', makeChapterRewards());

    expect(next.completedChapters).toContain('ch_1');
    expect(next.unlockedChapters).toContain('ch_2');
    expect(next.currentChapterId).toBe('ch_2');
  });

  it('completeChapter adds gold and item rewards', () => {
    const system = createCampaignSystem(createMockDataProvider());
    const state = makeCampaignState({ convoy: [{ instanceId: 'inst_old', dataId: 'old_item' }] });

    const next = system.completeChapter(state, 'ch_1', makeChapterRewards({
      goldReward: 500,
      itemRewards: ['item_a', 'item_b'],
    }));

    expect(next.gold).toBe(1500);
    expect(next.convoy).toHaveLength(3);
    expect(next.convoy.map((item) => item.dataId)).toEqual(['old_item', 'item_a', 'item_b']);
  });

  it('completeChapter merges explicit unlocked chapters and deduplicates', () => {
    const system = createCampaignSystem(createMockDataProvider());
    const state = makeCampaignState({ unlockedChapters: ['ch_1', 'ch_2'] });

    const next = system.completeChapter(state, 'ch_1', makeChapterRewards({
      unlockedChapters: ['ch_2', 'ch_3', 'ch_3'],
    }));

    expect(next.unlockedChapters).toContain('ch_2');
    expect(next.unlockedChapters).toContain('ch_3');
    expect(next.unlockedChapters.filter((chapterId) => chapterId === 'ch_3')).toHaveLength(1);
  });

  it('completeChapter unlocks both route branches at ch_11', () => {
    const system = createCampaignSystem(createMockDataProvider());
    const state = makeCampaignState({
      currentChapterId: 'ch_11',
      unlockedChapters: ['ch_1', 'ch_11'],
      worldMapNodes: makeCampaignState().worldMapNodes.map((node) => (
        node.chapterId === 'ch_11' ? { ...node, unlocked: true } : node
      )),
    });

    const next = system.completeChapter(state, 'ch_11', makeChapterRewards());

    expect(next.unlockedChapters).toEqual(expect.arrayContaining(['ch_12a', 'ch_12b']));
    expect(next.currentChapterId).toBe('ch_12a');
  });

  it('completeChapter unlocks paralogue when required chapter is completed', () => {
    const system = createCampaignSystem(createMockDataProvider());
    const state = makeCampaignState({
      unlockedChapters: ['ch_1', 'ch_2', 'ch_3'],
      currentChapterId: 'ch_3',
    });

    const next = system.completeChapter(state, 'ch_3', makeChapterRewards());

    expect(next.unlockedChapters).toContain('par_1');
  });

  it('completeChapter updates world map completion and adjacent unlocks', () => {
    const system = createCampaignSystem(createMockDataProvider());
    const state = makeCampaignState();

    const next = system.completeChapter(state, 'ch_1', makeChapterRewards());

    const completedNode = next.worldMapNodes.find((node) => node.id === toNodeId('ch_1'));
    const nextNode = next.worldMapNodes.find((node) => node.id === toNodeId('ch_2'));

    expect(completedNode?.completed).toBe(true);
    expect(completedNode?.unlocked).toBe(true);
    expect(nextNode?.unlocked).toBe(true);
  });

  it('getAvailableChapters returns unlocked chapters that are not completed', () => {
    const system = createCampaignSystem(createMockDataProvider());
    const state = makeCampaignState({
      unlockedChapters: ['ch_1', 'ch_2', 'ch_3'],
      completedChapters: ['ch_1'],
    });

    expect(system.getAvailableChapters(state)).toEqual(['ch_2', 'ch_3']);
  });

  it('addUnitToRoster adds unique units and ignores duplicates', () => {
    const system = createCampaignSystem(createMockDataProvider());
    const unit = makeUnit({ id: 'unit_a' });
    const state = makeCampaignState();

    const firstAdd = system.addUnitToRoster(state, unit);
    const duplicateAdd = system.addUnitToRoster(firstAdd, unit);

    expect(firstAdd.roster).toHaveLength(1);
    expect(duplicateAdd.roster).toHaveLength(1);
  });

  it('addUnitToRoster enforces MAX_PARTY_SIZE', () => {
    const system = createCampaignSystem(createMockDataProvider());
    const roster = Array.from({ length: MAX_PARTY_SIZE }, (_, index) => makeUnit({
      id: `unit_${index}`,
      characterId: `char_${index}`,
    }));

    const state = makeCampaignState({ roster });
    const attempted = system.addUnitToRoster(state, makeUnit({ id: 'overflow', characterId: 'overflow_char' }));

    expect(attempted.roster).toHaveLength(MAX_PARTY_SIZE);
    expect(attempted.roster.some((unit) => unit.id === 'overflow')).toBe(false);
  });

  it('removeUnitFromRoster removes a unit by id', () => {
    const system = createCampaignSystem(createMockDataProvider());
    const state = makeCampaignState({
      roster: [makeUnit({ id: 'a', characterId: 'a' }), makeUnit({ id: 'b', characterId: 'b' })],
    });

    const next = system.removeUnitFromRoster(state, 'a');

    expect(next.roster.map((unit) => unit.id)).toEqual(['b']);
  });

  it('updateSupportPoints and updateSupportRank delegate support updates', () => {
    const system = createCampaignSystem(createMockDataProvider());
    const state = makeCampaignState({
      roster: [
        makeUnit({ id: 'u1', characterId: 'alice' }),
        makeUnit({ id: 'u2', characterId: 'bob' }),
      ],
    });

    const withPoints = system.updateSupportPoints(state, 'alice', 'bob', 25);
    const withRank = system.updateSupportRank(withPoints, 'alice', 'bob', SupportRank.C);

    expect(withPoints.roster.find((unit) => unit.characterId === 'alice')?.supportPoints.bob).toBe(25);
    expect(withRank.supportLog['alice-bob']).toBe(SupportRank.C);
  });

  it('getSupportConversation resolves conversation by rank', () => {
    const provider = createMockDataProvider({
      supportConversations: [
        makeSupportConversation({ characterA: 'alice', characterB: 'bob', rank: SupportRank.C }),
        makeSupportConversation({ characterA: 'alice', characterB: 'bob', rank: SupportRank.B }),
      ],
    });

    const system = createCampaignSystem(provider);

    expect(system.getSupportConversation('alice', 'bob', SupportRank.B)?.rank).toBe(SupportRank.B);
    expect(system.getSupportConversation('alice', 'bob', SupportRank.A)).toBeNull();
  });

  it('save and load delegate to save system localStorage slots', () => {
    const system = createCampaignSystem(createMockDataProvider());
    const state = makeCampaignState();

    const saveData = system.save(state, NUM_SAVE_SLOTS - 1);
    const loaded = system.load(NUM_SAVE_SLOTS - 1);

    expect(saveData.version).toBe(SAVE_VERSION);
    expect(loaded?.campaign.currentChapterId).toBe('ch_1');
  });

  it('saveBattle persists battle state in save data', () => {
    const system = createCampaignSystem(createMockDataProvider());
    const state = makeCampaignState();

    const battleSave = makeBattleSaveData({ chapterId: 'ch_9', turnNumber: 4 });
    const saveData = system.saveBattle(state, battleSave, 0);

    expect(saveData.battleState?.chapterId).toBe('ch_9');
    expect(saveData.battleState?.turnNumber).toBe(4);
  });
});
