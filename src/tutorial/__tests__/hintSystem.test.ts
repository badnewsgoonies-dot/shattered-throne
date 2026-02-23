import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createHintSystem } from '../hintSystem';

describe('HintSystem', () => {
  let hintSystem: ReturnType<typeof createHintSystem>;

  beforeEach(() => {
    hintSystem = createHintSystem();
    vi.useFakeTimers();
  });

  it('should return hint for valid context after 10s idle', () => {
    const hint = hintSystem.getHint('unitSelect', 10000);
    expect(hint).not.toBeNull();
    expect(hint).toContain('Select one of your units');
  });

  it('should return null when idle time is below 10s', () => {
    expect(hintSystem.getHint('unitSelect', 9999)).toBeNull();
  });

  it('should return null when idle time is 0', () => {
    expect(hintSystem.getHint('unitSelect', 0)).toBeNull();
  });

  it('should return null for unknown context', () => {
    expect(hintSystem.getHint('unknownContext', 15000)).toBeNull();
  });

  it('should return correct hint for each context', () => {
    const contexts: Record<string, string> = {
      unitSelect: 'Select one of your units',
      moveSelect: 'blue-highlighted tile',
      actionSelect: 'Attack, Skill, Item, Wait, or Trade',
      targetSelect: 'Red tiles',
      deploy: 'deployment zones',
      baseCamp: 'roster',
      worldMap: 'chapter node',
    };

    for (const [ctx, expected] of Object.entries(contexts)) {
      hintSystem.resetCooldown();
      const hint = hintSystem.getHint(ctx, 15000);
      expect(hint).toContain(expected);
    }
  });

  it('should not repeat the same hint within 30s', () => {
    vi.setSystemTime(new Date(0));
    const first = hintSystem.getHint('unitSelect', 15000);
    expect(first).not.toBeNull();

    vi.setSystemTime(new Date(20000)); // 20s later
    const second = hintSystem.getHint('unitSelect', 15000);
    expect(second).toBeNull();
  });

  it('should allow repeating hint after 30s', () => {
    vi.setSystemTime(new Date(0));
    const first = hintSystem.getHint('unitSelect', 15000);
    expect(first).not.toBeNull();

    vi.setSystemTime(new Date(31000)); // 31s later
    const second = hintSystem.getHint('unitSelect', 15000);
    expect(second).not.toBeNull();
  });

  it('should allow different context hints within 30s', () => {
    vi.setSystemTime(new Date(0));
    const first = hintSystem.getHint('unitSelect', 15000);
    expect(first).not.toBeNull();

    vi.setSystemTime(new Date(5000));
    const second = hintSystem.getHint('moveSelect', 15000);
    expect(second).not.toBeNull();
  });

  it('should return null when disabled', () => {
    hintSystem.setEnabled(false);
    expect(hintSystem.getHint('unitSelect', 15000)).toBeNull();
  });

  it('should resume after re-enabling', () => {
    hintSystem.setEnabled(false);
    expect(hintSystem.getHint('unitSelect', 15000)).toBeNull();
    hintSystem.setEnabled(true);
    hintSystem.resetCooldown();
    expect(hintSystem.getHint('unitSelect', 15000)).not.toBeNull();
  });

  it('should return hint at exactly 10s threshold', () => {
    expect(hintSystem.getHint('deploy', 10000)).not.toBeNull();
  });
});
