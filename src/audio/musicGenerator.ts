import { MusicContext } from '../shared/types';

export type MusicGenerator = (ctx: AudioContext, destination: AudioNode, volume: number) => { stop: () => void };

interface LoopState {
  stopped: boolean;
  timer: ReturnType<typeof setTimeout> | null;
  oscillators: Set<OscillatorNode>;
  gains: Set<GainNode>;
}

interface NoteOptions {
  type: OscillatorType;
  frequency: number;
  endFrequency?: number;
  startTime: number;
  duration: number;
  volume: number;
  attack?: number;
  release?: number;
}

function beatsToSeconds(tempo: number, beats: number): number {
  return (60 / tempo) * beats;
}

function scheduleNote(ctx: AudioContext, destination: AudioNode, state: LoopState, options: NoteOptions): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const attack = options.attack ?? Math.min(0.03, options.duration * 0.25);
  const release = options.release ?? Math.min(0.08, options.duration * 0.45);
  const sustainTime = Math.max(options.startTime + attack, options.startTime + options.duration - release);

  osc.type = options.type;
  osc.frequency.setValueAtTime(options.frequency, options.startTime);

  if (options.endFrequency !== undefined) {
    osc.frequency.linearRampToValueAtTime(options.endFrequency, options.startTime + options.duration);
  }

  gain.gain.setValueAtTime(0, options.startTime);
  gain.gain.linearRampToValueAtTime(options.volume, options.startTime + attack);
  gain.gain.setValueAtTime(options.volume, sustainTime);
  gain.gain.linearRampToValueAtTime(0, options.startTime + options.duration);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(options.startTime);
  osc.stop(options.startTime + options.duration);

  state.oscillators.add(osc);
  state.gains.add(gain);
}

function scheduleChord(
  ctx: AudioContext,
  destination: AudioNode,
  state: LoopState,
  options: Omit<NoteOptions, 'frequency'> & { frequencies: number[] },
): void {
  for (const frequency of options.frequencies) {
    scheduleNote(ctx, destination, state, {
      ...options,
      frequency,
    });
  }
}

function createLoopingTrack(
  ctx: AudioContext,
  destination: AudioNode,
  volume: number,
  scheduler: (loopStart: number, state: LoopState, normalizedVolume: number) => number,
): { stop: () => void } {
  const state: LoopState = {
    stopped: false,
    timer: null,
    oscillators: new Set<OscillatorNode>(),
    gains: new Set<GainNode>(),
  };

  const scheduleLoop = (loopStart: number): void => {
    if (state.stopped) {
      return;
    }

    const loopDuration = scheduler(loopStart, state, volume);
    state.timer = setTimeout(() => {
      scheduleLoop(loopStart + loopDuration);
    }, loopDuration * 1000);
  };

  scheduleLoop(ctx.currentTime);

  return {
    stop: () => {
      if (state.stopped) {
        return;
      }

      state.stopped = true;

      if (state.timer !== null) {
        clearTimeout(state.timer);
        state.timer = null;
      }

      for (const osc of state.oscillators) {
        try {
          osc.stop(ctx.currentTime);
        } catch {
          // Oscillator might already be stopped.
        }
        osc.disconnect();
      }

      for (const gain of state.gains) {
        gain.disconnect();
      }

      state.oscillators.clear();
      state.gains.clear();
    },
  };
}

function scheduleArpeggioBars(
  ctx: AudioContext,
  destination: AudioNode,
  state: LoopState,
  options: {
    loopStart: number;
    tempo: number;
    bars: number;
    chords: number[][];
    oscType: OscillatorType;
    noteBeats: number;
    volume: number;
  },
): number {
  const beatSeconds = beatsToSeconds(options.tempo, 1);

  for (let bar = 0; bar < options.bars; bar += 1) {
    const chord = options.chords[bar % options.chords.length];

    for (let beat = 0; beat < 4; beat += 1) {
      const frequency = chord[beat % chord.length];
      const startTime = options.loopStart + (bar * 4 + beat) * beatSeconds;

      scheduleNote(ctx, destination, state, {
        type: options.oscType,
        frequency,
        startTime,
        duration: beatSeconds * options.noteBeats,
        volume: options.volume,
      });
    }
  }

  return beatSeconds * options.bars * 4;
}

const titleGenerator: MusicGenerator = (ctx, destination, volume) =>
  createLoopingTrack(ctx, destination, volume, (loopStart, state, normalizedVolume) => {
    const chords = [
      [220.0, 261.63, 329.63, 440.0],
      [174.61, 220.0, 261.63, 349.23],
      [130.81, 196.0, 261.63, 329.63],
      [146.83, 196.0, 246.94, 392.0],
    ];

    return scheduleArpeggioBars(ctx, destination, state, {
      loopStart,
      tempo: 72,
      bars: 4,
      chords,
      oscType: 'sine',
      noteBeats: 0.92,
      volume: normalizedVolume * 0.48,
    });
  });

const worldMapGenerator: MusicGenerator = (ctx, destination, volume) =>
  createLoopingTrack(ctx, destination, volume, (loopStart, state, normalizedVolume) => {
    const chords = [
      [261.63, 329.63, 392.0, 523.25],
      [196.0, 246.94, 293.66, 392.0],
      [220.0, 261.63, 329.63, 440.0],
      [174.61, 220.0, 261.63, 349.23],
    ];

    return scheduleArpeggioBars(ctx, destination, state, {
      loopStart,
      tempo: 96,
      bars: 4,
      chords,
      oscType: 'sine',
      noteBeats: 0.82,
      volume: normalizedVolume * 0.58,
    });
  });

const baseCampGenerator: MusicGenerator = (ctx, destination, volume) =>
  createLoopingTrack(ctx, destination, volume, (loopStart, state, normalizedVolume) => {
    const tempo = 60;
    const bars = 4;
    const beatSeconds = beatsToSeconds(tempo, 1);
    const padChords = [
      [261.63, 329.63, 392.0],
      [220.0, 261.63, 329.63],
      [174.61, 220.0, 261.63],
      [196.0, 246.94, 329.63],
    ];

    for (let bar = 0; bar < bars; bar += 1) {
      const startTime = loopStart + bar * 4 * beatSeconds;
      const chord = padChords[bar % padChords.length];

      scheduleChord(ctx, destination, state, {
        type: 'sine',
        frequencies: chord,
        startTime,
        duration: beatSeconds * 3.8,
        volume: normalizedVolume * 0.28,
        attack: 0.12,
        release: 0.24,
      });
    }

    return beatSeconds * bars * 4;
  });

const battlePlayerGenerator: MusicGenerator = (ctx, destination, volume) =>
  createLoopingTrack(ctx, destination, volume, (loopStart, state, normalizedVolume) => {
    const tempo = 136;
    const bars = 4;
    const beatSeconds = beatsToSeconds(tempo, 1);
    const roots = [110.0, 87.31, 98.0, 82.41];
    const staccatoPhrases = [
      [220.0, 261.63],
      [196.0, 220.0],
      [220.0, 261.63],
      [164.81, 196.0],
    ];

    for (let bar = 0; bar < bars; bar += 1) {
      const root = roots[bar % roots.length];
      const phrase = staccatoPhrases[bar % staccatoPhrases.length];

      for (let beat = 0; beat < 4; beat += 1) {
        const beatStart = loopStart + (bar * 4 + beat) * beatSeconds;

        scheduleNote(ctx, destination, state, {
          type: 'square',
          frequency: root,
          startTime: beatStart,
          duration: beatSeconds * 0.42,
          volume: normalizedVolume * 0.56,
        });

        scheduleNote(ctx, destination, state, {
          type: 'sawtooth',
          frequency: phrase[beat % phrase.length],
          startTime: beatStart + beatSeconds * 0.5,
          duration: beatSeconds * 0.22,
          volume: normalizedVolume * 0.35,
          attack: 0.01,
          release: 0.03,
        });
      }
    }

    return beatSeconds * bars * 4;
  });

const battleEnemyGenerator: MusicGenerator = (ctx, destination, volume) =>
  createLoopingTrack(ctx, destination, volume, (loopStart, state, normalizedVolume) => {
    const tempo = 108;
    const bars = 4;
    const beatSeconds = beatsToSeconds(tempo, 1);
    const roots = [82.41, 73.42, 65.41, 61.74];

    for (let bar = 0; bar < bars; bar += 1) {
      const root = roots[bar % roots.length];

      for (let beat = 0; beat < 4; beat += 1) {
        const beatStart = loopStart + (bar * 4 + beat) * beatSeconds;

        scheduleNote(ctx, destination, state, {
          type: 'square',
          frequency: root,
          startTime: beatStart,
          duration: beatSeconds * 0.9,
          volume: normalizedVolume * 0.5,
          attack: 0.02,
          release: 0.08,
        });

        if (beat === 2) {
          scheduleNote(ctx, destination, state, {
            type: 'triangle',
            frequency: root * 1.5,
            startTime: beatStart + beatSeconds * 0.2,
            duration: beatSeconds * 0.5,
            volume: normalizedVolume * 0.22,
          });
        }
      }
    }

    return beatSeconds * bars * 4;
  });

const bossBattleGenerator: MusicGenerator = (ctx, destination, volume) =>
  createLoopingTrack(ctx, destination, volume, (loopStart, state, normalizedVolume) => {
    const tempo = 148;
    const bars = 4;
    const beatSeconds = beatsToSeconds(tempo, 1);
    const diminishedChords = [
      [123.47, 146.83, 174.61],
      [130.81, 155.56, 185.0],
      [138.59, 164.81, 196.0],
      [146.83, 174.61, 207.65],
    ];

    for (let bar = 0; bar < bars; bar += 1) {
      const chord = diminishedChords[bar % diminishedChords.length];

      for (let halfBeat = 0; halfBeat < 8; halfBeat += 1) {
        const startTime = loopStart + (bar * 4 + halfBeat * 0.5) * beatSeconds;

        scheduleNote(ctx, destination, state, {
          type: 'square',
          frequency: chord[0],
          startTime,
          duration: beatSeconds * 0.34,
          volume: normalizedVolume * 0.62,
          attack: 0.01,
          release: 0.03,
        });
      }

      for (let pulse = 0; pulse < 16; pulse += 1) {
        const startTime = loopStart + (bar * 4 + pulse * 0.25) * beatSeconds;

        scheduleNote(ctx, destination, state, {
          type: 'sawtooth',
          frequency: chord[2] * 2,
          endFrequency: chord[1] * 2,
          startTime,
          duration: beatSeconds * 0.12,
          volume: normalizedVolume * 0.25,
          attack: 0.005,
          release: 0.015,
        });
      }
    }

    return beatSeconds * bars * 4;
  });

const victoryGenerator: MusicGenerator = (ctx, destination, volume) =>
  createLoopingTrack(ctx, destination, volume, (loopStart, state, normalizedVolume) => {
    const tempo = 124;
    const bars = 4;
    const beatSeconds = beatsToSeconds(tempo, 1);
    const fanfare = [
      [261.63, 329.63, 392.0, 523.25],
      [293.66, 392.0, 493.88, 587.33],
      [329.63, 440.0, 523.25, 659.25],
      [392.0, 523.25, 659.25, 783.99],
    ];

    for (let bar = 0; bar < bars; bar += 1) {
      const phrase = fanfare[bar % fanfare.length];

      for (let beat = 0; beat < phrase.length; beat += 1) {
        const startTime = loopStart + (bar * 4 + beat) * beatSeconds;

        scheduleNote(ctx, destination, state, {
          type: 'sawtooth',
          frequency: phrase[beat],
          startTime,
          duration: beatSeconds * 0.75,
          volume: normalizedVolume * 0.62,
        });
      }
    }

    return beatSeconds * bars * 4;
  });

const defeatGenerator: MusicGenerator = (ctx, destination, volume) =>
  createLoopingTrack(ctx, destination, volume, (loopStart, state, normalizedVolume) => {
    const tempo = 66;
    const bars = 4;
    const beatSeconds = beatsToSeconds(tempo, 1);
    const descending = [440.0, 392.0, 349.23, 329.63, 293.66, 261.63, 220.0, 196.0];

    for (let i = 0; i < bars * 2; i += 1) {
      const startTime = loopStart + i * 2 * beatSeconds;
      const frequency = descending[i % descending.length];

      scheduleNote(ctx, destination, state, {
        type: 'sine',
        frequency,
        endFrequency: frequency * 0.92,
        startTime,
        duration: beatSeconds * 1.8,
        volume: normalizedVolume * 0.44,
        attack: 0.04,
        release: 0.2,
      });
    }

    return beatSeconds * bars * 4;
  });

const storyGenerator: MusicGenerator = (ctx, destination, volume) =>
  createLoopingTrack(ctx, destination, volume, (loopStart, state, normalizedVolume) => {
    const tempo = 90;
    const bars = 4;
    const beatSeconds = beatsToSeconds(tempo, 1);
    const melody = [261.63, 293.66, 329.63, 392.0, 349.23, 329.63, 293.66, 261.63];
    const bass = [130.81, 110.0, 98.0, 87.31];

    for (let bar = 0; bar < bars; bar += 1) {
      const barStart = loopStart + bar * 4 * beatSeconds;

      scheduleNote(ctx, destination, state, {
        type: 'triangle',
        frequency: bass[bar % bass.length],
        startTime: barStart,
        duration: beatSeconds * 3.5,
        volume: normalizedVolume * 0.26,
        attack: 0.05,
        release: 0.18,
      });

      for (let beat = 0; beat < 4; beat += 1) {
        const noteIndex = bar * 2 + (beat % 2);
        const startTime = barStart + beat * beatSeconds;

        scheduleNote(ctx, destination, state, {
          type: 'triangle',
          frequency: melody[noteIndex % melody.length],
          startTime,
          duration: beatSeconds * 0.9,
          volume: normalizedVolume * 0.46,
          attack: 0.015,
          release: 0.06,
        });
      }
    }

    return beatSeconds * bars * 4;
  });

const shopGenerator: MusicGenerator = (ctx, destination, volume) =>
  createLoopingTrack(ctx, destination, volume, (loopStart, state, normalizedVolume) => {
    const tempo = 116;
    const bars = 4;
    const beatSeconds = beatsToSeconds(tempo, 1);
    const roots = [261.63, 392.0, 440.0, 349.23];
    const bounce = [523.25, 659.25, 587.33, 783.99];

    for (let bar = 0; bar < bars; bar += 1) {
      const root = roots[bar % roots.length];
      const top = bounce[bar % bounce.length];

      for (let beat = 0; beat < 4; beat += 1) {
        const beatStart = loopStart + (bar * 4 + beat) * beatSeconds;

        scheduleNote(ctx, destination, state, {
          type: 'sine',
          frequency: root,
          startTime: beatStart,
          duration: beatSeconds * 0.35,
          volume: normalizedVolume * 0.3,
        });

        scheduleNote(ctx, destination, state, {
          type: 'triangle',
          frequency: top,
          startTime: beatStart + beatSeconds * 0.35,
          duration: beatSeconds * 0.28,
          volume: normalizedVolume * 0.4,
          attack: 0.01,
          release: 0.03,
        });
      }
    }

    return beatSeconds * bars * 4;
  });

export const MUSIC_GENERATORS: Record<MusicContext, MusicGenerator> = {
  [MusicContext.Title]: titleGenerator,
  [MusicContext.WorldMap]: worldMapGenerator,
  [MusicContext.BaseCamp]: baseCampGenerator,
  [MusicContext.BattlePlayer]: battlePlayerGenerator,
  [MusicContext.BattleEnemy]: battleEnemyGenerator,
  [MusicContext.BossBattle]: bossBattleGenerator,
  [MusicContext.Victory]: victoryGenerator,
  [MusicContext.Defeat]: defeatGenerator,
  [MusicContext.Story]: storyGenerator,
  [MusicContext.Shop]: shopGenerator,
};
