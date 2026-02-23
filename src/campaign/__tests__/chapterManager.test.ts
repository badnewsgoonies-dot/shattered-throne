import {
  describe,
  expect,
  it,
} from 'vitest';
import {
  CHAPTER_FLOW,
  PARALOGUE_UNLOCKS,
} from '../chapterManager';

describe('chapterManager.CHAPTER_FLOW', () => {
  it('links ch_1 through ch_10 sequentially', () => {
    for (let chapter = 1; chapter <= 10; chapter += 1) {
      expect(CHAPTER_FLOW[`ch_${chapter}`].next).toBe(`ch_${chapter + 1}`);
    }
  });

  it('defines branching at ch_11 with null direct next', () => {
    expect(CHAPTER_FLOW.ch_11.next).toBeNull();
    expect(CHAPTER_FLOW.ch_11.branches).toBeDefined();
    expect(CHAPTER_FLOW.ch_11.branches).toHaveLength(2);
  });

  it('uses expected branch choices at ch_11', () => {
    expect(CHAPTER_FLOW.ch_11.branches).toEqual([
      { choiceText: 'Side with the Kingdom', nextChapterId: 'ch_12a' },
      { choiceText: 'Side with the Rebellion', nextChapterId: 'ch_12b' },
    ]);
  });

  it('links route A chapters ch_12a through ch_18a', () => {
    for (let chapter = 12; chapter <= 18; chapter += 1) {
      expect(CHAPTER_FLOW[`ch_${chapter}a`].next).toBe(`ch_${chapter + 1}a`);
    }
  });

  it('route A reconverges at ch_20 from ch_19a', () => {
    expect(CHAPTER_FLOW.ch_19a.next).toBe('ch_20');
  });

  it('links route B chapters ch_12b through ch_18b', () => {
    for (let chapter = 12; chapter <= 18; chapter += 1) {
      expect(CHAPTER_FLOW[`ch_${chapter}b`].next).toBe(`ch_${chapter + 1}b`);
    }
  });

  it('route B reconverges at ch_20 from ch_19b', () => {
    expect(CHAPTER_FLOW.ch_19b.next).toBe('ch_20');
  });

  it('links common ending chapters ch_20 through ch_24', () => {
    for (let chapter = 20; chapter <= 24; chapter += 1) {
      expect(CHAPTER_FLOW[`ch_${chapter}`].next).toBe(`ch_${chapter + 1}`);
    }
  });

  it('marks ch_25 as terminal chapter', () => {
    expect(CHAPTER_FLOW.ch_25.next).toBeNull();
    expect(CHAPTER_FLOW.ch_25.branches).toBeUndefined();
  });

  it('contains 33 unique flow entries for all route variants', () => {
    expect(Object.keys(CHAPTER_FLOW)).toHaveLength(33);
  });

  it('only ch_11 has branch options', () => {
    const branchEntries = Object.entries(CHAPTER_FLOW).filter(([, flow]) => flow.branches !== undefined);
    expect(branchEntries).toEqual([
      ['ch_11', CHAPTER_FLOW.ch_11],
    ]);
  });

  it('only terminal chapters have null next', () => {
    const nullNextIds = Object.entries(CHAPTER_FLOW)
      .filter(([, flow]) => flow.next === null)
      .map(([chapterId]) => chapterId)
      .sort();

    expect(nullNextIds).toEqual(['ch_11', 'ch_25']);
  });
});

describe('chapterManager.PARALOGUE_UNLOCKS', () => {
  it('defines unlock rules for 10 paralogues', () => {
    expect(Object.keys(PARALOGUE_UNLOCKS)).toHaveLength(10);
  });

  it('maps early paralogues to expected required chapters', () => {
    expect(PARALOGUE_UNLOCKS.par_1.requiredChapter).toBe('ch_3');
    expect(PARALOGUE_UNLOCKS.par_2.requiredChapter).toBe('ch_5');
    expect(PARALOGUE_UNLOCKS.par_3.requiredChapter).toBe('ch_6');
    expect(PARALOGUE_UNLOCKS.par_4.requiredChapter).toBe('ch_8');
    expect(PARALOGUE_UNLOCKS.par_5.requiredChapter).toBe('ch_10');
  });

  it('marks route-exclusive paralogues with explicit conditions', () => {
    expect(PARALOGUE_UNLOCKS.par_6).toEqual({ requiredChapter: 'ch_13a', condition: 'Route A only' });
    expect(PARALOGUE_UNLOCKS.par_7).toEqual({ requiredChapter: 'ch_13b', condition: 'Route B only' });
  });

  it('maps late paralogues to late-game chapters', () => {
    expect(PARALOGUE_UNLOCKS.par_8.requiredChapter).toBe('ch_16a');
    expect(PARALOGUE_UNLOCKS.par_9.requiredChapter).toBe('ch_20');
    expect(PARALOGUE_UNLOCKS.par_10.requiredChapter).toBe('ch_22');
  });
});
