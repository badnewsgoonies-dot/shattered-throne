import { SoundEffectType } from '../shared/types';

export type SFXFunction = (ctx: AudioContext, destination: AudioNode, volume: number) => void;

type BufferCapableAudioContext = AudioContext & {
  createBuffer?: (numberOfChannels: number, length: number, sampleRate: number) => AudioBuffer;
  createBufferSource?: () => AudioBufferSourceNode;
  sampleRate?: number;
};

function scheduleTone(
  ctx: AudioContext,
  destination: AudioNode,
  options: {
    type: OscillatorType;
    frequency: number;
    endFrequency?: number;
    duration: number;
    volume: number;
    startTime?: number;
  },
): void {
  const startTime = options.startTime ?? ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = options.type;
  osc.frequency.setValueAtTime(options.frequency, startTime);

  if (options.endFrequency !== undefined) {
    osc.frequency.linearRampToValueAtTime(options.endFrequency, startTime + options.duration);
  }

  gain.gain.setValueAtTime(options.volume, startTime);
  gain.gain.linearRampToValueAtTime(0, startTime + options.duration);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(startTime);
  osc.stop(startTime + options.duration);
}

function scheduleNoise(
  ctx: AudioContext,
  destination: AudioNode,
  volume: number,
  startTime: number,
  duration: number,
): void {
  const bufferCtx = ctx as BufferCapableAudioContext;

  if (
    typeof bufferCtx.createBuffer === 'function' &&
    typeof bufferCtx.createBufferSource === 'function' &&
    typeof bufferCtx.sampleRate === 'number'
  ) {
    const frameCount = Math.max(1, Math.floor(bufferCtx.sampleRate * duration));
    const buffer = bufferCtx.createBuffer(1, frameCount, bufferCtx.sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < channelData.length; i += 1) {
      channelData[i] = Math.random() * 2 - 1;
    }

    const source = bufferCtx.createBufferSource();
    const gain = ctx.createGain();

    source.buffer = buffer;
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    source.connect(gain);
    gain.connect(destination);

    source.start(startTime);
    source.stop(startTime + duration);
    return;
  }

  scheduleTone(ctx, destination, {
    type: 'square',
    frequency: 1300,
    endFrequency: 900,
    duration,
    volume,
    startTime,
  });
}

export const SFX_GENERATORS: Record<SoundEffectType, SFXFunction> = {
  [SoundEffectType.SwordSwing]: (ctx, destination, volume) => {
    scheduleTone(ctx, destination, {
      type: 'sine',
      frequency: 400,
      endFrequency: 200,
      duration: 0.1,
      volume,
    });
  },

  [SoundEffectType.ArrowFire]: (ctx, destination, volume) => {
    const startTime = ctx.currentTime;
    scheduleNoise(ctx, destination, volume * 0.7, startTime, 0.05);
    scheduleTone(ctx, destination, {
      type: 'sine',
      frequency: 800,
      duration: 0.03,
      volume,
      startTime,
    });
  },

  [SoundEffectType.MagicCast]: (ctx, destination, volume) => {
    const startTime = ctx.currentTime;
    const chordMultipliers = [1, 1.25, 1.5];

    for (const multiplier of chordMultipliers) {
      scheduleTone(ctx, destination, {
        type: 'sine',
        frequency: 300 * multiplier,
        endFrequency: 1000 * multiplier,
        duration: 0.3,
        volume: volume * 0.45,
        startTime,
      });
    }
  },

  [SoundEffectType.HitImpact]: (ctx, destination, volume) => {
    const startTime = ctx.currentTime;

    scheduleTone(ctx, destination, {
      type: 'square',
      frequency: 150,
      duration: 0.05,
      volume: volume * 0.85,
      startTime,
    });

    scheduleNoise(ctx, destination, volume * 0.7, startTime, 0.03);
  },

  [SoundEffectType.CriticalHit]: (ctx, destination, volume) => {
    const startTime = ctx.currentTime;

    scheduleTone(ctx, destination, {
      type: 'square',
      frequency: 100,
      duration: 0.08,
      volume: volume * 1.35,
      startTime,
    });

    scheduleNoise(ctx, destination, volume, startTime, 0.05);
  },

  [SoundEffectType.LevelUp]: (ctx, destination, volume) => {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const noteDuration = 0.1;
    const startTime = ctx.currentTime;

    notes.forEach((frequency, index) => {
      scheduleTone(ctx, destination, {
        type: 'sawtooth',
        frequency,
        duration: noteDuration,
        volume,
        startTime: startTime + index * noteDuration,
      });
    });
  },

  [SoundEffectType.MenuSelect]: (ctx, destination, volume) => {
    scheduleTone(ctx, destination, {
      type: 'sine',
      frequency: 600,
      duration: 0.05,
      volume,
    });
  },

  [SoundEffectType.CursorMove]: (ctx, destination, volume) => {
    scheduleTone(ctx, destination, {
      type: 'sine',
      frequency: 400,
      duration: 0.03,
      volume: volume * 0.45,
    });
  },

  [SoundEffectType.Heal]: (ctx, destination, volume) => {
    scheduleTone(ctx, destination, {
      type: 'triangle',
      frequency: 400,
      endFrequency: 800,
      duration: 0.2,
      volume,
    });
  },

  [SoundEffectType.Miss]: (ctx, destination, volume) => {
    scheduleTone(ctx, destination, {
      type: 'sine',
      frequency: 500,
      endFrequency: 200,
      duration: 0.08,
      volume,
    });
  },

  [SoundEffectType.Death]: (ctx, destination, volume) => {
    scheduleTone(ctx, destination, {
      type: 'square',
      frequency: 100,
      endFrequency: 50,
      duration: 0.3,
      volume,
    });
  },
};
