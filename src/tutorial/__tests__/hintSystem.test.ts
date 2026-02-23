import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getHint, resetHintState } from '../hintSystem';

describe('hintSystem', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-23T12:00:00.000Z'));
    resetHintState();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null when hints are disabled', () => {
    expect(getHint('unitSelect', 10000, false)).toBeNull();
  });

  it('returns null before 10 seconds of inactivity', () => {
    expect(getHint('unitSelect', 9999, true)).toBeNull();
  });

  it('returns a hint at exactly 10 seconds of inactivity', () => {
    expect(getHint('unitSelect', 10000, true)).toBe(
      'Select one of your units with blue highlight to begin their turn.',
    );
  });

  it('returns unitSelect hint', () => {
    expect(getHint('unitSelect', 20000, true)).toBe(
      'Select one of your units with blue highlight to begin their turn.',
    );
  });

  it('returns moveSelect hint', () => {
    expect(getHint('moveSelect', 20000, true)).toBe('Click a blue-highlighted tile to move your unit there.');
  });

  it('returns actionSelect hint', () => {
    expect(getHint('actionSelect', 20000, true)).toBe('Choose an action: Attack, Skill, Item, Wait, or Trade.');
  });

  it('returns targetSelect hint', () => {
    expect(getHint('targetSelect', 20000, true)).toBe(
      'Select an enemy in range to attack. Red tiles show valid targets.',
    );
  });

  it('returns deploy hint', () => {
    expect(getHint('deploy', 20000, true)).toBe('Place your units on the blue deployment zones, then press Start.');
  });

  it('returns baseCamp hint', () => {
    expect(getHint('baseCamp', 20000, true)).toBe(
      'Manage your roster, buy items at the shop, or view support conversations.',
    );
  });

  it('returns worldMap hint', () => {
    expect(getHint('worldMap', 20000, true)).toBe('Select a chapter node on the map to begin a mission.');
  });

  it('returns null for unknown contexts', () => {
    expect(getHint('unknownContext', 20000, true)).toBeNull();
  });

  it('does not repeat same-context hint within 30 seconds', () => {
    expect(getHint('unitSelect', 20000, true)).not.toBeNull();

    vi.advanceTimersByTime(29999);
    expect(getHint('unitSelect', 20000, true)).toBeNull();
  });

  it('allows same-context hint after 30 seconds have passed', () => {
    expect(getHint('unitSelect', 20000, true)).not.toBeNull();

    vi.advanceTimersByTime(30000);
    expect(getHint('unitSelect', 20000, true)).not.toBeNull();
  });

  it('allows different-context hints immediately', () => {
    expect(getHint('unitSelect', 20000, true)).not.toBeNull();
    expect(getHint('moveSelect', 20000, true)).not.toBeNull();
  });

  it('resetHintState clears repeat suppression', () => {
    expect(getHint('unitSelect', 20000, true)).not.toBeNull();
    expect(getHint('unitSelect', 20000, true)).toBeNull();

    resetHintState();
    expect(getHint('unitSelect', 20000, true)).not.toBeNull();
  });
});
