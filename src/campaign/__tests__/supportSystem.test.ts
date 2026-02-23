import {
  describe,
  expect,
  it,
} from 'vitest';
import { SupportRank } from '../../shared/types';
import {
  updateSupportPoints,
  updateSupportRank,
} from '../supportSystem';
import {
  makeCampaignState,
  makeUnit,
} from './testUtils';

describe('supportSystem.updateSupportPoints', () => {
  it('adds support points for both units in a pair', () => {
    const state = makeCampaignState({
      roster: [
        makeUnit({ characterId: 'alice' }),
        makeUnit({ characterId: 'bob' }),
      ],
    });

    const next = updateSupportPoints(state, 'alice', 'bob', 10);

    expect(next.roster[0].supportPoints.bob).toBe(10);
    expect(next.roster[1].supportPoints.alice).toBe(10);
  });

  it('accumulates support points on repeated updates', () => {
    const state = makeCampaignState({
      roster: [
        makeUnit({ characterId: 'alice', supportPoints: { bob: 5 } }),
        makeUnit({ characterId: 'bob', supportPoints: { alice: 7 } }),
      ],
    });

    const next = updateSupportPoints(state, 'alice', 'bob', 8);

    expect(next.roster[0].supportPoints.bob).toBe(13);
    expect(next.roster[1].supportPoints.alice).toBe(15);
  });

  it('supports negative point adjustments', () => {
    const state = makeCampaignState({
      roster: [
        makeUnit({ characterId: 'alice', supportPoints: { bob: 12 } }),
        makeUnit({ characterId: 'bob', supportPoints: { alice: 12 } }),
      ],
    });

    const next = updateSupportPoints(state, 'alice', 'bob', -3);

    expect(next.roster[0].supportPoints.bob).toBe(9);
    expect(next.roster[1].supportPoints.alice).toBe(9);
  });

  it('does not modify unrelated units support points', () => {
    const unrelated = makeUnit({ characterId: 'cara', supportPoints: { dan: 4 } });
    const state = makeCampaignState({
      roster: [
        makeUnit({ characterId: 'alice' }),
        makeUnit({ characterId: 'bob' }),
        unrelated,
      ],
    });

    const next = updateSupportPoints(state, 'alice', 'bob', 10);

    expect(next.roster[2].supportPoints).toEqual({ dan: 4 });
  });

  it('leaves roster unchanged when characters are not present', () => {
    const state = makeCampaignState({
      roster: [makeUnit({ characterId: 'alice' })],
    });

    const next = updateSupportPoints(state, 'bob', 'cara', 10);

    expect(next.roster).toEqual(state.roster);
  });
});

describe('supportSystem.updateSupportRank', () => {
  it('stores rank in supportLog using sorted key order', () => {
    const state = makeCampaignState();

    const next = updateSupportRank(state, 'zane', 'alice', SupportRank.B);

    expect(next.supportLog['alice-zane']).toBe(SupportRank.B);
  });

  it('updates supportRanks on both participating units', () => {
    const state = makeCampaignState({
      roster: [
        makeUnit({ characterId: 'alice' }),
        makeUnit({ characterId: 'bob' }),
      ],
    });

    const next = updateSupportRank(state, 'alice', 'bob', SupportRank.C);

    expect(next.roster[0].supportRanks.bob).toBe(SupportRank.C);
    expect(next.roster[1].supportRanks.alice).toBe(SupportRank.C);
  });

  it('overwrites existing rank for the same pair', () => {
    const initial = makeCampaignState({
      supportLog: { 'alice-bob': SupportRank.C },
      roster: [
        makeUnit({ characterId: 'alice', supportRanks: { bob: SupportRank.C } }),
        makeUnit({ characterId: 'bob', supportRanks: { alice: SupportRank.C } }),
      ],
    });

    const next = updateSupportRank(initial, 'bob', 'alice', SupportRank.A);

    expect(next.supportLog['alice-bob']).toBe(SupportRank.A);
    expect(next.roster[0].supportRanks.bob).toBe(SupportRank.A);
    expect(next.roster[1].supportRanks.alice).toBe(SupportRank.A);
  });

  it('preserves unrelated support log entries', () => {
    const initial = makeCampaignState({
      supportLog: {
        'alice-bob': SupportRank.C,
        'cara-dan': SupportRank.B,
      },
    });

    const next = updateSupportRank(initial, 'alice', 'bob', SupportRank.B);

    expect(next.supportLog['cara-dan']).toBe(SupportRank.B);
  });

  it('leaves non-participating roster units unchanged', () => {
    const unit = makeUnit({ characterId: 'eve', supportRanks: { frank: SupportRank.C } });
    const state = makeCampaignState({
      roster: [unit],
    });

    const next = updateSupportRank(state, 'alice', 'bob', SupportRank.C);

    expect(next.roster[0].supportRanks).toEqual({ frank: SupportRank.C });
  });
});
