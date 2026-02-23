import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioConfig, MusicContext, SoundEffectType } from '../../shared/types';
import { createAudioSystem } from '../audioSystem';
import { MUSIC_GENERATORS } from '../musicGenerator';
import { SFX_GENERATORS } from '../sfxGenerator';
import {
  MockAudioContext,
  clearMockLocalStorage,
  installMockAudioContext,
  installMockLocalStorage,
  resetMockAudioContextInstances,
} from './mocks';

const DEFAULT_CONFIG: AudioConfig = {
  masterVolume: 0.7,
  musicVolume: 0.5,
  sfxVolume: 0.8,
  muted: false,
};

describe('createAudioSystem', () => {
  beforeEach(() => {
    installMockLocalStorage();
    clearMockLocalStorage();
    installMockAudioContext();
    resetMockAudioContextInstances();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('init creates an AudioContext lazily', async () => {
    const system = createAudioSystem();

    expect(MockAudioContext.instances).toHaveLength(0);

    await system.init();

    expect(MockAudioContext.instances).toHaveLength(1);
  });

  it('init loads config from localStorage', async () => {
    const stored: AudioConfig = {
      masterVolume: 0.2,
      musicVolume: 0.3,
      sfxVolume: 0.4,
      muted: true,
    };

    localStorage.setItem('audio_config', JSON.stringify(stored));

    const system = createAudioSystem();
    await system.init();

    expect(system.getConfig()).toEqual(stored);
  });

  it('init uses webkitAudioContext fallback when AudioContext is unavailable', async () => {
    const globalRef = globalThis as unknown as {
      window: { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
    };

    globalRef.window.AudioContext = undefined;

    const system = createAudioSystem();
    await system.init();

    expect(MockAudioContext.instances).toHaveLength(1);
  });

  it('playSFX does nothing before init', () => {
    const original = SFX_GENERATORS[SoundEffectType.SwordSwing];
    const spy = vi.fn();
    SFX_GENERATORS[SoundEffectType.SwordSwing] = spy;

    const system = createAudioSystem();
    system.playSFX({ type: SoundEffectType.SwordSwing, volume: 0.7 });

    expect(spy).not.toHaveBeenCalled();

    SFX_GENERATORS[SoundEffectType.SwordSwing] = original;
  });

  it('playSFX calls the mapped generator with effective volume', async () => {
    const original = SFX_GENERATORS[SoundEffectType.SwordSwing];
    const spy = vi.fn();
    SFX_GENERATORS[SoundEffectType.SwordSwing] = spy;

    const system = createAudioSystem();
    await system.init();
    system.setConfig({ ...DEFAULT_CONFIG, masterVolume: 0.5, sfxVolume: 0.4, muted: false });

    system.playSFX({ type: SoundEffectType.SwordSwing, volume: 0.25 });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][2]).toBeCloseTo(0.05, 6);

    SFX_GENERATORS[SoundEffectType.SwordSwing] = original;
  });

  it('playSFX uses request.volume = 1 when omitted', async () => {
    const original = SFX_GENERATORS[SoundEffectType.MenuSelect];
    const spy = vi.fn();
    SFX_GENERATORS[SoundEffectType.MenuSelect] = spy;

    const system = createAudioSystem();
    await system.init();
    system.setConfig({ ...DEFAULT_CONFIG, masterVolume: 0.5, sfxVolume: 0.2 });

    system.playSFX({ type: SoundEffectType.MenuSelect });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][2]).toBeCloseTo(0.1, 6);

    SFX_GENERATORS[SoundEffectType.MenuSelect] = original;
  });

  it('playSFX is blocked while muted', async () => {
    const original = SFX_GENERATORS[SoundEffectType.Heal];
    const spy = vi.fn();
    SFX_GENERATORS[SoundEffectType.Heal] = spy;

    const system = createAudioSystem();
    await system.init();
    system.setConfig({ ...DEFAULT_CONFIG, muted: true });

    system.playSFX({ type: SoundEffectType.Heal });

    expect(spy).not.toHaveBeenCalled();

    SFX_GENERATORS[SoundEffectType.Heal] = original;
  });

  it('playMusic starts the generator with effective volume', async () => {
    const original = MUSIC_GENERATORS[MusicContext.Title];
    const stopSpy = vi.fn();
    const musicSpy = vi.fn().mockReturnValue({ stop: stopSpy });
    MUSIC_GENERATORS[MusicContext.Title] = musicSpy;

    const system = createAudioSystem();
    await system.init();
    system.setConfig({ ...DEFAULT_CONFIG, masterVolume: 0.6, musicVolume: 0.5 });

    system.playMusic({ context: MusicContext.Title });

    expect(musicSpy).toHaveBeenCalledTimes(1);
    expect(musicSpy.mock.calls[0][2]).toBeCloseTo(0.3, 6);

    MUSIC_GENERATORS[MusicContext.Title] = original;
  });

  it('playMusic stops existing music before starting the next track', async () => {
    const originalTitle = MUSIC_GENERATORS[MusicContext.Title];
    const originalStory = MUSIC_GENERATORS[MusicContext.Story];

    const stopFirst = vi.fn();
    const stopSecond = vi.fn();

    MUSIC_GENERATORS[MusicContext.Title] = vi.fn().mockReturnValue({ stop: stopFirst });
    MUSIC_GENERATORS[MusicContext.Story] = vi.fn().mockReturnValue({ stop: stopSecond });

    const system = createAudioSystem();
    await system.init();

    system.playMusic({ context: MusicContext.Title });
    system.playMusic({ context: MusicContext.Story });

    expect(stopFirst).toHaveBeenCalledTimes(1);
    expect(stopSecond).not.toHaveBeenCalled();

    MUSIC_GENERATORS[MusicContext.Title] = originalTitle;
    MUSIC_GENERATORS[MusicContext.Story] = originalStory;
  });

  it('playMusic does nothing before init', () => {
    const original = MUSIC_GENERATORS[MusicContext.WorldMap];
    const spy = vi.fn().mockReturnValue({ stop: vi.fn() });
    MUSIC_GENERATORS[MusicContext.WorldMap] = spy;

    const system = createAudioSystem();
    system.playMusic({ context: MusicContext.WorldMap });

    expect(spy).not.toHaveBeenCalled();

    MUSIC_GENERATORS[MusicContext.WorldMap] = original;
  });

  it('playMusic is blocked while muted', async () => {
    const original = MUSIC_GENERATORS[MusicContext.BossBattle];
    const spy = vi.fn().mockReturnValue({ stop: vi.fn() });
    MUSIC_GENERATORS[MusicContext.BossBattle] = spy;

    const system = createAudioSystem();
    await system.init();
    system.setConfig({ ...DEFAULT_CONFIG, muted: true });

    system.playMusic({ context: MusicContext.BossBattle });

    expect(spy).not.toHaveBeenCalled();

    MUSIC_GENERATORS[MusicContext.BossBattle] = original;
  });

  it('stopMusic stops active music and is safe to call repeatedly', async () => {
    const original = MUSIC_GENERATORS[MusicContext.Defeat];
    const stopSpy = vi.fn();
    MUSIC_GENERATORS[MusicContext.Defeat] = vi.fn().mockReturnValue({ stop: stopSpy });

    const system = createAudioSystem();
    await system.init();

    system.playMusic({ context: MusicContext.Defeat });
    system.stopMusic();
    system.stopMusic();

    expect(stopSpy).toHaveBeenCalledTimes(1);

    MUSIC_GENERATORS[MusicContext.Defeat] = original;
  });

  it('setConfig persists config to localStorage', async () => {
    const system = createAudioSystem();
    await system.init();

    const config: AudioConfig = {
      masterVolume: 0.9,
      musicVolume: 0.1,
      sfxVolume: 0.3,
      muted: true,
    };

    system.setConfig(config);

    expect(localStorage.getItem('audio_config')).toBe(JSON.stringify(config));
  });

  it('getConfig returns a copy, not a mutable reference', async () => {
    const system = createAudioSystem();
    await system.init();

    const first = system.getConfig();
    first.masterVolume = 0;

    const second = system.getConfig();
    expect(second.masterVolume).toBe(DEFAULT_CONFIG.masterVolume);
  });

  it('setConfig with muted true stops current music', async () => {
    const original = MUSIC_GENERATORS[MusicContext.Shop];
    const stopSpy = vi.fn();
    MUSIC_GENERATORS[MusicContext.Shop] = vi.fn().mockReturnValue({ stop: stopSpy });

    const system = createAudioSystem();
    await system.init();

    system.playMusic({ context: MusicContext.Shop });
    system.setConfig({ ...DEFAULT_CONFIG, muted: true });

    expect(stopSpy).toHaveBeenCalledTimes(1);

    MUSIC_GENERATORS[MusicContext.Shop] = original;
  });

  it('queueSFX plays requests in order through the system queue', async () => {
    vi.useFakeTimers();

    const swordOriginal = SFX_GENERATORS[SoundEffectType.SwordSwing];
    const arrowOriginal = SFX_GENERATORS[SoundEffectType.ArrowFire];

    const calls: SoundEffectType[] = [];
    SFX_GENERATORS[SoundEffectType.SwordSwing] = vi.fn(() => {
      calls.push(SoundEffectType.SwordSwing);
    });
    SFX_GENERATORS[SoundEffectType.ArrowFire] = vi.fn(() => {
      calls.push(SoundEffectType.ArrowFire);
    });

    const system = createAudioSystem();
    await system.init();

    system.queueSFX([
      { type: SoundEffectType.SwordSwing },
      { type: SoundEffectType.ArrowFire },
      { type: SoundEffectType.SwordSwing },
    ]);

    expect(calls).toEqual([SoundEffectType.SwordSwing]);

    vi.advanceTimersByTime(100);
    expect(calls).toEqual([SoundEffectType.SwordSwing, SoundEffectType.ArrowFire]);

    vi.advanceTimersByTime(100);
    expect(calls).toEqual([SoundEffectType.SwordSwing, SoundEffectType.ArrowFire, SoundEffectType.SwordSwing]);

    SFX_GENERATORS[SoundEffectType.SwordSwing] = swordOriginal;
    SFX_GENERATORS[SoundEffectType.ArrowFire] = arrowOriginal;
  });

  it('init is idempotent and does not create multiple contexts', async () => {
    const system = createAudioSystem();

    await system.init();
    await system.init();

    expect(MockAudioContext.instances).toHaveLength(1);
  });
});
