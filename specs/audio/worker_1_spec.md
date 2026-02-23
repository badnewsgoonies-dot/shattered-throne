# Audio & Effects — Full Domain Implementation

You are implementing the Audio domain for Shattered Throne, a tactical RPG.

## CRITICAL RULES
- ONLY create/modify files under `src/audio/`
- Import types ONLY from `../../shared/types`
- Do NOT import from any other domain
- The file `src/shared/types.ts` already exists — do NOT modify it
- Web Audio API (AudioContext, OscillatorNode, GainNode) is NOT available in test environment — tests MUST mock them

## Files to Create

### 1. `src/audio/sfxGenerator.ts`

Generate retro-style synthesized sound effects. Each SFX is a function that takes AudioContext and destination GainNode, creates oscillator/gain nodes, and schedules playback.

```typescript
import { SoundEffectType } from '../../shared/types';

export type SFXFunction = (ctx: AudioContext, destination: AudioNode, volume: number) => void;

export const SFX_GENERATORS: Record<SoundEffectType, SFXFunction> = {
  swordSwing: (ctx, dest, vol) => {
    // Sine sweep 400Hz→200Hz over 100ms
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  },
  // ... define all 11 SFX types with appropriate synthesis parameters
};
```

SFX specs:
- **SwordSwing**: Sine sweep 400→200Hz, 100ms
- **ArrowFire**: White noise 50ms + sine 800Hz 30ms
- **MagicCast**: Sine chord sweep 300→1000Hz, 300ms
- **HitImpact**: Square 150Hz 50ms + noise 30ms
- **CriticalHit**: Square 100Hz 80ms + noise 50ms (louder)
- **LevelUp**: Ascending arpeggio C5-E5-G5-C6, sawtooth, 100ms each
- **MenuSelect**: Sine 600Hz, 50ms
- **CursorMove**: Sine 400Hz, 30ms, low vol
- **Heal**: Triangle sweep 400→800Hz, 200ms
- **Miss**: Sine sweep 500→200Hz, 80ms
- **Death**: Square 100→50Hz, 300ms, slow decay

### 2. `src/audio/musicGenerator.ts`

Generate procedural ambient music loops for each MusicContext.

```typescript
import { MusicContext } from '../../shared/types';

export type MusicGenerator = (ctx: AudioContext, destination: AudioNode, volume: number) => { stop: () => void };

export const MUSIC_GENERATORS: Record<MusicContext, MusicGenerator> = { ... };
```

Each music context creates looping patterns using OscillatorNode scheduling. The `stop` function returned should stop all oscillators and clean up. Use `setValueAtTime` and `linearRampToValueAtTime` for note shaping.

Contexts and moods:
- **title**: Slow minor arpeggios (Am-F-C-G), sine, gentle
- **worldMap**: Major arpeggios (C-G-Am-F), moderate
- **baseCamp**: Soft sine pads, slow
- **battlePlayer**: Driving bass + staccato, minor, fast
- **battleEnemy**: Lower register ominous version
- **bossBattle**: Fast bass + tremolo, diminished chords
- **victory**: Major ascending fanfare, short
- **defeat**: Descending minor, slow
- **story**: Piano-like tones, moderate
- **shop**: Major bouncy rhythm

Each generator should schedule 4-8 bars and loop by recursively scheduling.

### 3. `src/audio/volumeManager.ts`

```typescript
import { AudioConfig } from '../../shared/types';

const STORAGE_KEY = 'audio_config';
const DEFAULT_CONFIG: AudioConfig = { masterVolume: 0.7, musicVolume: 0.5, sfxVolume: 0.8, muted: false };

export function loadConfig(): AudioConfig {
  // Try localStorage, fall back to defaults
}
export function saveConfig(config: AudioConfig): void {
  // Save to localStorage
}
```

### 4. `src/audio/soundQueue.ts`

```typescript
import { SoundRequest } from '../../shared/types';

export interface SoundQueue {
  enqueue(requests: SoundRequest[]): void;
  // Internal: plays them in sequence with 100ms gap
}

export function createSoundQueue(
  playSFX: (request: SoundRequest) => void
): SoundQueue { ... }
```

### 5. `src/audio/audioSystem.ts`

Factory function `createAudioSystem(): IAudioSystem`.

```typescript
import { IAudioSystem, AudioConfig, SoundRequest, MusicRequest } from '../../shared/types';

export function createAudioSystem(): IAudioSystem {
  let audioCtx: AudioContext | null = null;
  let config: AudioConfig = loadConfig();
  let currentMusic: { stop: () => void } | null = null;

  return {
    async init() {
      // Create AudioContext (lazy)
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      config = loadConfig();
    },

    playSFX(request: SoundRequest) {
      if (!audioCtx || config.muted) return;
      const vol = config.sfxVolume * config.masterVolume * (request.volume ?? 1);
      SFX_GENERATORS[request.type](audioCtx, audioCtx.destination, vol);
    },

    playMusic(request: MusicRequest) {
      if (!audioCtx || config.muted) return;
      // Stop current music with fade
      if (currentMusic) currentMusic.stop();
      const vol = config.musicVolume * config.masterVolume;
      currentMusic = MUSIC_GENERATORS[request.context](audioCtx, audioCtx.destination, vol);
    },

    stopMusic(fadeOutMs?: number) {
      if (currentMusic) { currentMusic.stop(); currentMusic = null; }
    },

    setConfig(newConfig: AudioConfig) {
      config = newConfig;
      saveConfig(config);
    },

    getConfig() { return { ...config }; },

    queueSFX(requests: SoundRequest[]) {
      // Play in sequence with 100ms gaps
      const queue = createSoundQueue((r) => this.playSFX(r));
      queue.enqueue(requests);
    },
  };
}
```

### 6. `src/audio/index.ts`
```typescript
export { createAudioSystem } from './audioSystem';
```

### 7. Tests — `src/audio/__tests__/`

**IMPORTANT: Mock AudioContext, OscillatorNode, GainNode, and AudioNode.**

Create a mock setup:
```typescript
class MockAudioParam {
  value = 0;
  setValueAtTime(v: number, t: number) { this.value = v; }
  linearRampToValueAtTime(v: number, t: number) { this.value = v; }
}

class MockOscillator {
  type = 'sine';
  frequency = new MockAudioParam();
  connect(dest: any) {}
  start(t?: number) {}
  stop(t?: number) {}
  disconnect() {}
}

class MockGainNode {
  gain = new MockAudioParam();
  connect(dest: any) {}
  disconnect() {}
}

class MockAudioContext {
  currentTime = 0;
  destination = {};
  createOscillator() { return new MockOscillator(); }
  createGain() { return new MockGainNode(); }
}
```

Also mock localStorage:
```typescript
const mockStorage = new Map<string, string>();
globalThis.localStorage = {
  getItem: (key: string) => mockStorage.get(key) ?? null,
  setItem: (key: string, val: string) => { mockStorage.set(key, val); },
  removeItem: (key: string) => { mockStorage.delete(key); },
  clear: () => mockStorage.clear(),
  get length() { return mockStorage.size; },
  key: (i: number) => [...mockStorage.keys()][i] ?? null,
};
```

**audioSystem.test.ts** (~15 tests): Init creates context, playSFX calls generator, playMusic starts loop, stopMusic cleans up, config save/load, mute blocks playback, queueSFX.

**sfxGenerator.test.ts** (~12 tests): Each SFX type creates oscillator with correct type/frequency settings.

**musicGenerator.test.ts** (~10 tests): Each context creates a generator that returns a stop function.

**volumeManager.test.ts** (~8 tests): Save/load config, default config when none saved, localStorage interaction.

**soundQueue.test.ts** (~8 tests): Queue processes in order, gap timing with setTimeout, empty queue handling.

TOTAL: 50+ tests

## Import Pattern
```typescript
import { IAudioSystem, AudioConfig, SoundRequest, MusicRequest, SoundEffectType, MusicContext } from '../../shared/types';
```
