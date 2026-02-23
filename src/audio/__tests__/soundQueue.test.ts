import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SoundEffectType } from '../../shared/types';
import { createMockAudioContext, createMockGainNode } from './mocks';
import { createSoundQueue } from '../soundQueue';

describe('soundQueue', () => {
  let mockCtx: ReturnType<typeof createMockAudioContext>;
  let mockDest: ReturnType<typeof createMockGainNode>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockCtx = createMockAudioContext();
    mockDest = createMockGainNode();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create a sound queue', () => {
    const queue = createSoundQueue(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode);
    expect(queue).toBeDefined();
    expect(queue.enqueue).toBeInstanceOf(Function);
    expect(queue.clear).toBeInstanceOf(Function);
  });

  it('should not be processing when empty', () => {
    const queue = createSoundQueue(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode);
    expect(queue.isProcessing).toBe(false);
  });

  it('should process a single SFX request', () => {
    const queue = createSoundQueue(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode);
    queue.enqueue([{ type: SoundEffectType.SwordSwing }]);
    expect(mockCtx.createGain).toHaveBeenCalled();
  });

  it('should start processing when requests are enqueued', () => {
    const queue = createSoundQueue(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode);
    queue.enqueue([{ type: SoundEffectType.SwordSwing }]);
    expect(queue.isProcessing).toBe(true);
  });

  it('should process multiple requests in sequence', () => {
    const queue = createSoundQueue(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode);
    queue.enqueue([
      { type: SoundEffectType.SwordSwing },
      { type: SoundEffectType.HitImpact },
      { type: SoundEffectType.CriticalHit },
    ]);
    // First one plays immediately
    const initialCalls = mockCtx.createOscillator.mock.calls.length;
    expect(initialCalls).toBeGreaterThan(0);

    // Advance past first SFX duration (100ms) + gap (100ms)
    vi.advanceTimersByTime(200);
    const afterSecond = mockCtx.createOscillator.mock.calls.length;
    expect(afterSecond).toBeGreaterThan(initialCalls);
  });

  it('should apply volume from request', () => {
    const queue = createSoundQueue(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode);
    queue.enqueue([{ type: SoundEffectType.MenuSelect, volume: 0.5 }]);
    const gainNode = mockCtx.createGain.mock.results[0].value;
    expect(gainNode.gain.setValueAtTime).toHaveBeenCalledWith(0.5, 0);
  });

  it('should use default volume 1 when not specified', () => {
    const queue = createSoundQueue(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode);
    queue.enqueue([{ type: SoundEffectType.MenuSelect }]);
    const gainNode = mockCtx.createGain.mock.results[0].value;
    expect(gainNode.gain.setValueAtTime).toHaveBeenCalledWith(1, 0);
  });

  it('should stop processing after all items are played', () => {
    const queue = createSoundQueue(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode);
    queue.enqueue([{ type: SoundEffectType.CursorMove }]);
    // CursorMove duration is 30ms + 100ms gap
    vi.advanceTimersByTime(130);
    expect(queue.isProcessing).toBe(false);
  });

  it('should clear the queue', () => {
    const queue = createSoundQueue(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode);
    queue.enqueue([
      { type: SoundEffectType.SwordSwing },
      { type: SoundEffectType.HitImpact },
    ]);
    queue.clear();
    expect(queue.isProcessing).toBe(false);
  });

  it('should handle enqueue after clear', () => {
    const queue = createSoundQueue(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode);
    queue.enqueue([{ type: SoundEffectType.SwordSwing }]);
    queue.clear();
    const callsBefore = mockCtx.createOscillator.mock.calls.length;
    queue.enqueue([{ type: SoundEffectType.Heal }]);
    const callsAfter = mockCtx.createOscillator.mock.calls.length;
    expect(callsAfter).toBeGreaterThan(callsBefore);
  });

  it('should handle empty array enqueue', () => {
    const queue = createSoundQueue(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode);
    expect(() => queue.enqueue([])).not.toThrow();
    expect(queue.isProcessing).toBe(false);
  });
});
