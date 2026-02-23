export const CHAPTER_FLOW: Record<string, {
  next: string | null;
  branches?: { choiceText: string; nextChapterId: string }[];
}> = (() => {
  const flow: Record<string, {
    next: string | null;
    branches?: { choiceText: string; nextChapterId: string }[];
  }> = {};

  for (let chapter = 1; chapter <= 10; chapter += 1) {
    flow[`ch_${chapter}`] = { next: `ch_${chapter + 1}` };
  }

  flow.ch_11 = {
    next: null,
    branches: [
      { choiceText: 'Side with the Kingdom', nextChapterId: 'ch_12a' },
      { choiceText: 'Side with the Rebellion', nextChapterId: 'ch_12b' },
    ],
  };

  for (let chapter = 12; chapter <= 18; chapter += 1) {
    flow[`ch_${chapter}a`] = { next: `ch_${chapter + 1}a` };
    flow[`ch_${chapter}b`] = { next: `ch_${chapter + 1}b` };
  }

  flow.ch_19a = { next: 'ch_20' };
  flow.ch_19b = { next: 'ch_20' };

  for (let chapter = 20; chapter <= 24; chapter += 1) {
    flow[`ch_${chapter}`] = { next: `ch_${chapter + 1}` };
  }

  flow.ch_25 = { next: null };

  return flow;
})();

export const PARALOGUE_UNLOCKS: Record<string, {
  requiredChapter: string;
  condition?: string;
}> = {
  par_1: { requiredChapter: 'ch_3' },
  par_2: { requiredChapter: 'ch_5' },
  par_3: { requiredChapter: 'ch_6' },
  par_4: { requiredChapter: 'ch_8' },
  par_5: { requiredChapter: 'ch_10' },
  par_6: { requiredChapter: 'ch_13a', condition: 'Route A only' },
  par_7: { requiredChapter: 'ch_13b', condition: 'Route B only' },
  par_8: { requiredChapter: 'ch_16a' },
  par_9: { requiredChapter: 'ch_20' },
  par_10: { requiredChapter: 'ch_22' },
};
