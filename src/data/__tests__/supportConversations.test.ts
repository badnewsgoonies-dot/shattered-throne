import { describe, expect, it } from 'vitest';
import { SupportRank } from '../../shared/types';
import { CHARACTERS } from '../characters';
import {
  SUPPORT_CONVERSATIONS,
  getSupportConversationsForPair,
} from '../supportConversations';

describe('support conversations data', () => {
  const characterSet = new Set(CHARACTERS.map((entry) => entry.id));

  it('has at least 30 conversations', () => {
    expect(SUPPORT_CONVERSATIONS.length).toBeGreaterThanOrEqual(30);
  });

  it('all conversations reference valid characters', () => {
    for (const conversation of SUPPORT_CONVERSATIONS) {
      expect(characterSet.has(conversation.characterA)).toBe(true);
      expect(characterSet.has(conversation.characterB)).toBe(true);
    }
  });

  it('all conversations have rank C, B, or A', () => {
    for (const conversation of SUPPORT_CONVERSATIONS) {
      expect([SupportRank.C, SupportRank.B, SupportRank.A]).toContain(conversation.rank);
    }
  });

  it('all conversations have 4-8 dialogue lines', () => {
    for (const conversation of SUPPORT_CONVERSATIONS) {
      expect(conversation.dialogue.length).toBeGreaterThanOrEqual(4);
      expect(conversation.dialogue.length).toBeLessThanOrEqual(8);
    }
  });

  it('all dialogue lines have speaker and text', () => {
    for (const conversation of SUPPORT_CONVERSATIONS) {
      for (const line of conversation.dialogue) {
        expect(line.speaker.length).toBeGreaterThan(0);
        expect(line.text.length).toBeGreaterThan(0);
      }
    }
  });

  it('requiredBattlesTogether is positive for all conversations', () => {
    for (const conversation of SUPPORT_CONVERSATIONS) {
      expect(conversation.requiredBattlesTogether).toBeGreaterThan(0);
    }
  });

  it('each pair has a full C/B/A support chain', () => {
    const pairToRanks = new Map<string, Set<SupportRank>>();

    for (const convo of SUPPORT_CONVERSATIONS) {
      const pair = [convo.characterA, convo.characterB].sort().join('|');
      if (!pairToRanks.has(pair)) {
        pairToRanks.set(pair, new Set<SupportRank>());
      }
      pairToRanks.get(pair)?.add(convo.rank);
    }

    for (const ranks of pairToRanks.values()) {
      expect(ranks.has(SupportRank.C)).toBe(true);
      expect(ranks.has(SupportRank.B)).toBe(true);
      expect(ranks.has(SupportRank.A)).toBe(true);
    }
  });

  it('there are no duplicate pair+rank entries', () => {
    const seen = new Set<string>();
    for (const convo of SUPPORT_CONVERSATIONS) {
      const key = [convo.characterA, convo.characterB].sort().join('|') + `|${convo.rank}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  it('pair getter supports both character orders', () => {
    const forward = getSupportConversationsForPair('alaric', 'elena');
    const reverse = getSupportConversationsForPair('elena', 'alaric');
    expect(forward.length).toBeGreaterThan(0);
    expect(reverse.length).toBe(forward.length);
  });

  it('pair getter returns empty for unknown pair', () => {
    expect(getSupportConversationsForPair('alaric', 'missing')).toHaveLength(0);
  });
});
