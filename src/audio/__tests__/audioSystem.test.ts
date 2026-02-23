import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SoundEffectType, MusicContext } from '../../shared/types';
import { createMockLocalStorage, setupAudioMocks } from './mocks';

const mockStorage = createMockLocalStorage();
vi.stubGlobal('localStorage', mockStorage);

let mockAudioCtx: ReturnType<typeof setupAudioMocks>;

beforeEach(() => {
  vi.clearAllMocks();
  mockStorage.clear();
  mockAudioCtx = setupAudioMocks();
});

// Must import after mocks are set up
import { createAudioSystem } from '../audioSystem';

describe('audioSystem', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('init', () => {
    it('should create an audio system', () => {
      const system = createAudioSystem();
      expect(system).toBeDefined();
    });

    it('should initialize without errors', async () => {
      const system = createAudioSystem();
      await expect(system.init()).resolves.toBeUndefined();
    });

    it('should create AudioContext on init', async () => {
      const system = createAudioSystem();
      await system.init();
      expect(AudioContext).toHaveBeenCalled();
    });

    it('should create master, music, and sfx gain nodes', async () => {
      const system = createAudioSystem();
      await system.init();
      // masterGain, musicGain, sfxGain = 3 gain nodes
      expect(mockAudioCtx.createGain).toHaveBeenCalledTimes(3);
    });
  });

  describe('playSFX', () => {
    it('should play a sound effect', async () => {
      const system = createAudioSystem();
      await system.init();
      const callsBefore = mockAudioCtx.createOscillator.mock.calls.length;
      system.playSFX({ type: SoundEffectType.SwordSwing });
      expect(mockAudioCtx.createOscillator.mock.calls.length).toBeGreaterThan(callsBefore);
    });

    it('should not play when muted', async () => {
      const system = createAudioSystem();
      await system.init();
      system.setConfig({ masterVolume: 1, musicVolume: 1, sfxVolume: 1, muted: true });
      const callsBefore = mockAudioCtx.createOscillator.mock.calls.length;
      system.playSFX({ type: SoundEffectType.SwordSwing });
      expect(mockAudioCtx.createOscillator.mock.calls.length).toBe(callsBefore);
    });

    it('should create a gain node for volume control', async () => {
      const system = createAudioSystem();
      await system.init();
      const callsBefore = mockAudioCtx.createGain.mock.calls.length;
      system.playSFX({ type: SoundEffectType.MenuSelect });
      expect(mockAudioCtx.createGain.mock.calls.length).toBeGreaterThan(callsBefore);
    });

    it('should apply custom volume from request', async () => {
      const system = createAudioSystem();
      await system.init();
      system.playSFX({ type: SoundEffectType.MenuSelect, volume: 0.3 });
      // The per-sfx gain node (4th created: master, music, sfx, then this one)
      const sfxGain = mockAudioCtx.createGain.mock.results[3].value;
      expect(sfxGain.gain.setValueAtTime).toHaveBeenCalledWith(0.3, 0);
    });
  });

  describe('playMusic', () => {
    it('should start playing music', async () => {
      const system = createAudioSystem();
      await system.init();
      system.playMusic({ context: MusicContext.Title });
      expect(mockAudioCtx.createOscillator).toHaveBeenCalled();
    });

    it('should create gain node for fade in', async () => {
      const system = createAudioSystem();
      await system.init();
      const callsBefore = mockAudioCtx.createGain.mock.calls.length;
      system.playMusic({ context: MusicContext.WorldMap });
      expect(mockAudioCtx.createGain.mock.calls.length).toBeGreaterThan(callsBefore);
    });

    it('should handle crossfade when switching music', async () => {
      const system = createAudioSystem();
      await system.init();
      system.playMusic({ context: MusicContext.Title });
      const callsAfterFirst = mockAudioCtx.createGain.mock.calls.length;
      system.playMusic({ context: MusicContext.BattlePlayer });
      expect(mockAudioCtx.createGain.mock.calls.length).toBeGreaterThan(callsAfterFirst);
    });
  });

  describe('stopMusic', () => {
    it('should stop music without errors', async () => {
      const system = createAudioSystem();
      await system.init();
      system.playMusic({ context: MusicContext.Title });
      expect(() => system.stopMusic()).not.toThrow();
    });

    it('should handle stopMusic when no music is playing', async () => {
      const system = createAudioSystem();
      await system.init();
      expect(() => system.stopMusic()).not.toThrow();
    });

    it('should accept custom fadeOutMs', async () => {
      const system = createAudioSystem();
      await system.init();
      system.playMusic({ context: MusicContext.Title });
      expect(() => system.stopMusic(1000)).not.toThrow();
    });
  });

  describe('setConfig / getConfig', () => {
    it('should return default config initially', () => {
      const system = createAudioSystem();
      const config = system.getConfig();
      expect(config.masterVolume).toBe(0.7);
      expect(config.musicVolume).toBe(0.5);
      expect(config.sfxVolume).toBe(0.8);
      expect(config.muted).toBe(false);
    });

    it('should update config', () => {
      const system = createAudioSystem();
      system.setConfig({ masterVolume: 1, musicVolume: 0.3, sfxVolume: 0.5, muted: true });
      const config = system.getConfig();
      expect(config.masterVolume).toBe(1);
      expect(config.musicVolume).toBe(0.3);
      expect(config.sfxVolume).toBe(0.5);
      expect(config.muted).toBe(true);
    });

    it('should persist config to localStorage', () => {
      const system = createAudioSystem();
      system.setConfig({ masterVolume: 0.5, musicVolume: 0.5, sfxVolume: 0.5, muted: false });
      expect(mockStorage.setItem).toHaveBeenCalledWith('audio_config', expect.any(String));
    });

    it('should return a copy of config (not reference)', () => {
      const system = createAudioSystem();
      const a = system.getConfig();
      const b = system.getConfig();
      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    });
  });

  describe('queueSFX', () => {
    it('should queue sound effects', async () => {
      const system = createAudioSystem();
      await system.init();
      expect(() =>
        system.queueSFX([
          { type: SoundEffectType.SwordSwing },
          { type: SoundEffectType.HitImpact },
        ]),
      ).not.toThrow();
    });

    it('should not queue when muted', async () => {
      const system = createAudioSystem();
      await system.init();
      system.setConfig({ masterVolume: 1, musicVolume: 1, sfxVolume: 1, muted: true });
      const callsBefore = mockAudioCtx.createOscillator.mock.calls.length;
      system.queueSFX([{ type: SoundEffectType.SwordSwing }]);
      expect(mockAudioCtx.createOscillator.mock.calls.length).toBe(callsBefore);
    });

    it('should play first SFX immediately', async () => {
      const system = createAudioSystem();
      await system.init();
      const callsBefore = mockAudioCtx.createOscillator.mock.calls.length;
      system.queueSFX([{ type: SoundEffectType.SwordSwing }]);
      expect(mockAudioCtx.createOscillator.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  describe('IAudioSystem interface', () => {
    it('should have all required methods', () => {
      const system = createAudioSystem();
      expect(typeof system.init).toBe('function');
      expect(typeof system.playSFX).toBe('function');
      expect(typeof system.playMusic).toBe('function');
      expect(typeof system.stopMusic).toBe('function');
      expect(typeof system.setConfig).toBe('function');
      expect(typeof system.getConfig).toBe('function');
      expect(typeof system.queueSFX).toBe('function');
    });
  });
});
