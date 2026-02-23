import {
  IAudioSystem,
  AudioConfig,
  SoundRequest,
  MusicRequest,
  MusicContext,
} from '../shared/types';
import { loadConfig, saveConfig } from './volumeManager';
import { generateSFX } from './sfxGenerator';
import { startMusic, stopMusicTrack } from './musicGenerator';
import { createSoundQueue } from './soundQueue';

export function createAudioSystem(): IAudioSystem {
  let audioCtx: AudioContext | null = null;
  let config: AudioConfig = loadConfig();

  let masterGain: GainNode | null = null;
  let musicGain: GainNode | null = null;
  let sfxGain: GainNode | null = null;

  let currentMusic: { context: MusicContext; stopFn: () => void } | null = null;
  let soundQueue: ReturnType<typeof createSoundQueue> | null = null;

  function ensureContext(): AudioContext {
    if (!audioCtx) {
      audioCtx = new AudioContext();
      masterGain = audioCtx.createGain();
      masterGain.connect(audioCtx.destination);

      musicGain = audioCtx.createGain();
      musicGain.connect(masterGain);

      sfxGain = audioCtx.createGain();
      sfxGain.connect(masterGain);

      applyVolumes();
      soundQueue = createSoundQueue(audioCtx, sfxGain);
    }
    return audioCtx;
  }

  function applyVolumes(): void {
    if (!masterGain || !musicGain || !sfxGain) return;
    const muted = config.muted ? 0 : 1;
    masterGain.gain.setValueAtTime(config.masterVolume * muted, audioCtx!.currentTime);
    musicGain.gain.setValueAtTime(config.musicVolume, audioCtx!.currentTime);
    sfxGain.gain.setValueAtTime(config.sfxVolume, audioCtx!.currentTime);
  }

  const system: IAudioSystem = {
    async init(): Promise<void> {
      ensureContext();
    },

    playSFX(request: SoundRequest): void {
      if (config.muted) return;
      const ctx = ensureContext();
      const vol = request.volume ?? 1;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.connect(sfxGain!);
      generateSFX(ctx, gain, request.type);
    },

    playMusic(request: MusicRequest): void {
      const ctx = ensureContext();
      const fadeOutMs = request.fadeOutMs ?? 500;
      const fadeInMs = request.fadeInMs ?? 500;

      if (currentMusic) {
        // Fade out old music
        const fadeOutSec = fadeOutMs / 1000;
        const oldGain = ctx.createGain();
        oldGain.gain.setValueAtTime(1, ctx.currentTime);
        oldGain.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeOutSec);
        const oldStop = currentMusic.stopFn;
        setTimeout(() => oldStop(), fadeOutMs);
        currentMusic = null;
      }

      // Fade in new music
      const fadeInSec = fadeInMs / 1000;
      const newGain = ctx.createGain();
      newGain.connect(musicGain!);
      newGain.gain.setValueAtTime(0, ctx.currentTime);
      newGain.gain.linearRampToValueAtTime(1, ctx.currentTime + fadeInSec);

      const track = startMusic(ctx, newGain, request.context);
      currentMusic = { context: request.context, stopFn: track.stopFn };
    },

    stopMusic(fadeOutMs?: number): void {
      if (!currentMusic || !audioCtx || !musicGain) return;
      const ms = fadeOutMs ?? 500;
      const sec = ms / 1000;
      musicGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + sec);
      const stop = currentMusic.stopFn;
      setTimeout(() => {
        stop();
        if (musicGain && audioCtx) {
          musicGain.gain.setValueAtTime(config.musicVolume, audioCtx.currentTime);
        }
      }, ms);
      currentMusic = null;
    },

    setConfig(newConfig: AudioConfig): void {
      config = { ...newConfig };
      saveConfig(config);
      applyVolumes();
    },

    getConfig(): AudioConfig {
      return { ...config };
    },

    queueSFX(requests: SoundRequest[]): void {
      if (config.muted) return;
      ensureContext();
      soundQueue!.enqueue(requests);
    },
  };

  return system;
}
