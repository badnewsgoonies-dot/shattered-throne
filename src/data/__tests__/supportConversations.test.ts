import { describe, it, expect } from 'vitest';
import { supportConversations } from '../supportConversations';
import { characters } from '../characters';
import { SupportRank } from '../../shared/types';

describe('Support Conversations', () => {
  const charIds = new Set(characters.map(c => c.id));

  it('should have 30+ conversations', () => {
    expect(supportConversations.length).toBeGreaterThanOrEqual(30);
  });

  it('should have valid character references', () => {
    for (const sc of supportConversations) {
      expect(charIds.has(sc.characterA)).toBe(true);
      expect(charIds.has(sc.characterB)).toBe(true);
    }
  });

  it('should have C, B, and A ranks', () => {
    const ranks = new Set(supportConversations.map(s => s.rank));
    expect(ranks.has(SupportRank.C)).toBe(true);
    expect(ranks.has(SupportRank.B)).toBe(true);
    expect(ranks.has(SupportRank.A)).toBe(true);
  });

  it('should have dialogue lines with speakers and text', () => {
    for (const sc of supportConversations) {
      expect(sc.dialogue.length).toBeGreaterThanOrEqual(3);
      for (const line of sc.dialogue) {
        expect(line.speaker).toBeTruthy();
        expect(line.text).toBeTruthy();
      }
    }
  });

  it('should have non-negative requiredBattlesTogether', () => {
    for (const sc of supportConversations) {
      expect(sc.requiredBattlesTogether).toBeGreaterThanOrEqual(0);
    }
  });

  it('should have increasing battle requirements per pair', () => {
    const pairs = new Map<string, number[]>();
    for (const sc of supportConversations) {
      const key = [sc.characterA, sc.characterB].sort().join('-');
      if (!pairs.has(key)) pairs.set(key, []);
      pairs.get(key)!.push(sc.requiredBattlesTogether);
    }
    for (const [, battles] of pairs) {
      for (let i = 1; i < battles.length; i++) {
        expect(battles[i]).toBeGreaterThanOrEqual(battles[i - 1]);
      }
    }
  });

  it('should have 10+ unique pairs', () => {
    const pairs = new Set<string>();
    for (const sc of supportConversations) {
      pairs.add([sc.characterA, sc.characterB].sort().join('-'));
    }
    expect(pairs.size).toBeGreaterThanOrEqual(10);
  });
});
