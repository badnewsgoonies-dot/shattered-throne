import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MusicContext } from '../../shared/types';
import { createMockAudioContext, createMockGainNode } from './mocks';
import { startMusic, stopMusicTrack } from '../musicGenerator';

describe('musicGenerator', () => {
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

  const allContexts = Object.values(MusicContext);

  describe('startMusic', () => {
    for (const context of allContexts) {
      it(`should start ${context} music without errors`, () => {
        expect(() => startMusic(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, context)).not.toThrow();
      });
    }

    it('should return a track with stopFn', () => {
      const track = startMusic(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, MusicContext.Title);
      expect(track).toHaveProperty('stopFn');
      expect(typeof track.stopFn).toBe('function');
    });

    it('should create oscillators for Title music', () => {
      startMusic(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, MusicContext.Title);
      expect(mockCtx.createOscillator).toHaveBeenCalled();
    });

    it('should create gain nodes for music', () => {
      startMusic(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, MusicContext.BattlePlayer);
      expect(mockCtx.createGain).toHaveBeenCalled();
    });

    it('should schedule oscillators with start and stop', () => {
      startMusic(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, MusicContext.WorldMap);
      const osc = mockCtx.createOscillator.mock.results[0].value;
      expect(osc.start).toHaveBeenCalled();
      expect(osc.stop).toHaveBeenCalled();
    });

    it('should connect oscillators to gain nodes', () => {
      startMusic(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, MusicContext.Shop);
      const osc = mockCtx.createOscillator.mock.results[0].value;
      expect(osc.connect).toHaveBeenCalled();
    });
  });

  describe('stopMusicTrack', () => {
    it('should call stopFn when stopping track', () => {
      const track = startMusic(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, MusicContext.Title);
      const spy = vi.spyOn(track, 'stopFn');
      stopMusicTrack(track);
      expect(spy).toHaveBeenCalled();
    });

    it('should stop the loop from continuing', () => {
      const track = startMusic(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, MusicContext.BaseCamp);
      const callsBefore = mockCtx.createOscillator.mock.calls.length;
      stopMusicTrack(track);
      vi.advanceTimersByTime(10000);
      const callsAfter = mockCtx.createOscillator.mock.calls.length;
      // After stopping, no new oscillators should be created
      expect(callsAfter).toBe(callsBefore);
    });
  });

  describe('music context variety', () => {
    it('BattlePlayer should use square waveform', () => {
      startMusic(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, MusicContext.BattlePlayer);
      const osc = mockCtx.createOscillator.mock.results[0].value;
      expect(osc.type).toBe('square');
    });

    it('Victory should use sawtooth waveform', () => {
      startMusic(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, MusicContext.Victory);
      const osc = mockCtx.createOscillator.mock.results[0].value;
      expect(osc.type).toBe('sawtooth');
    });

    it('Story should use triangle waveform', () => {
      startMusic(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, MusicContext.Story);
      const osc = mockCtx.createOscillator.mock.results[0].value;
      expect(osc.type).toBe('triangle');
    });

    it('Title should use sine waveform', () => {
      startMusic(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, MusicContext.Title);
      const osc = mockCtx.createOscillator.mock.results[0].value;
      expect(osc.type).toBe('sine');
    });
  });
});
