import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MusicContext } from '../../shared/types';
import { MUSIC_GENERATORS } from '../musicGenerator';
import { createMockAudioContext, MockAudioContext } from './mocks';

describe('MUSIC_GENERATORS', () => {
  let ctx: AudioContext;
  let mockCtx: MockAudioContext;

  beforeEach(() => {
    vi.useFakeTimers();
    ctx = createMockAudioContext();
    mockCtx = ctx as unknown as MockAudioContext;
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it.each(Object.values(MusicContext))('creates a playable loop for %s and returns a stop function', (context) => {
    const loop = MUSIC_GENERATORS[context](ctx, mockCtx.destination, 0.6);

    expect(typeof loop.stop).toBe('function');
    expect(mockCtx.oscillators.length).toBeGreaterThan(0);

    loop.stop();

    expect(mockCtx.oscillators.every((osc) => osc.disconnect.mock.calls.length > 0)).toBe(true);
    expect(mockCtx.gains.every((gain) => gain.disconnect.mock.calls.length > 0)).toBe(true);
  });

  it('title music schedules additional bars as the loop advances', () => {
    const loop = MUSIC_GENERATORS[MusicContext.Title](ctx, mockCtx.destination, 0.5);
    const initialOscillatorCount = mockCtx.oscillators.length;

    vi.advanceTimersByTime(14_000);

    expect(mockCtx.oscillators.length).toBeGreaterThan(initialOscillatorCount);

    loop.stop();
  });

  it('stop halts future loop scheduling', () => {
    const loop = MUSIC_GENERATORS[MusicContext.WorldMap](ctx, mockCtx.destination, 0.5);
    const countAtStop = mockCtx.oscillators.length;

    loop.stop();
    vi.advanceTimersByTime(60_000);

    expect(mockCtx.oscillators.length).toBe(countAtStop);
  });
});
