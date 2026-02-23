import { IAudioSystem, AudioConfig, SoundRequest, MusicRequest } from '../shared/types';
import { SFX_GENERATORS } from './sfxGenerator';
import { MUSIC_GENERATORS } from './musicGenerator';
import { loadConfig, saveConfig } from './volumeManager';
import { createSoundQueue } from './soundQueue';

function resolveAudioContextConstructor(): (new () => AudioContext) | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const audioContextConstructor =
    (window.AudioContext as typeof AudioContext | undefined) ??
    ((window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ?? undefined);

  return audioContextConstructor ?? null;
}

export function createAudioSystem(): IAudioSystem {
  let audioCtx: AudioContext | null = null;
  let config: AudioConfig = loadConfig();
  let currentMusic: { stop: () => void } | null = null;

  let audioSystem: IAudioSystem;
  const queue = createSoundQueue((request: SoundRequest) => {
    audioSystem.playSFX(request);
  });

  audioSystem = {
    async init(): Promise<void> {
      if (!audioCtx) {
        const AudioContextCtor = resolveAudioContextConstructor();
        if (AudioContextCtor) {
          audioCtx = new AudioContextCtor();
        }
      }

      config = loadConfig();
    },

    playSFX(request: SoundRequest): void {
      if (!audioCtx || config.muted) {
        return;
      }

      const generator = SFX_GENERATORS[request.type];
      const volume = config.sfxVolume * config.masterVolume * (request.volume ?? 1);
      generator(audioCtx, audioCtx.destination, volume);
    },

    playMusic(request: MusicRequest): void {
      if (!audioCtx || config.muted) {
        return;
      }

      if (currentMusic) {
        currentMusic.stop();
      }

      const generator = MUSIC_GENERATORS[request.context];
      const volume = config.musicVolume * config.masterVolume;
      currentMusic = generator(audioCtx, audioCtx.destination, volume);
    },

    stopMusic(_fadeOutMs?: number): void {
      if (!currentMusic) {
        return;
      }

      currentMusic.stop();
      currentMusic = null;
    },

    setConfig(newConfig: AudioConfig): void {
      config = { ...newConfig };
      saveConfig(config);

      if (config.muted && currentMusic) {
        currentMusic.stop();
        currentMusic = null;
      }
    },

    getConfig(): AudioConfig {
      return { ...config };
    },

    queueSFX(requests: SoundRequest[]): void {
      queue.enqueue(requests);
    },
  };

  return audioSystem;
}
