import { SoundEffectType } from '../shared/types';

type SFXFactory = (ctx: AudioContext, destination: AudioNode) => void;

function createEnvelope(
  ctx: AudioContext,
  destination: AudioNode,
  attack: number,
  decay: number,
  volume: number,
): GainNode {
  const gain = ctx.createGain();
  gain.connect(destination);
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + attack);
  gain.gain.linearRampToValueAtTime(0, now + attack + decay);
  return gain;
}

function playOsc(
  ctx: AudioContext,
  destination: AudioNode,
  type: OscillatorType,
  startFreq: number,
  endFreq: number,
  duration: number,
  volume: number,
): void {
  const gain = createEnvelope(ctx, destination, duration * 0.1, duration * 0.9, volume);
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(endFreq, ctx.currentTime + duration);
  osc.connect(gain);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function playNoise(
  ctx: AudioContext,
  destination: AudioNode,
  duration: number,
  volume: number,
): void {
  const bufferSize = Math.ceil(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const gain = createEnvelope(ctx, destination, 0.005, duration - 0.005, volume);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(gain);
  source.start(ctx.currentTime);
  source.stop(ctx.currentTime + duration);
}

function swordSwing(ctx: AudioContext, dest: AudioNode): void {
  playOsc(ctx, dest, 'sine', 400, 200, 0.1, 0.6);
}

function arrowFire(ctx: AudioContext, dest: AudioNode): void {
  playNoise(ctx, dest, 0.05, 0.4);
  playOsc(ctx, dest, 'sine', 800, 800, 0.03, 0.5);
}

function magicCast(ctx: AudioContext, dest: AudioNode): void {
  playOsc(ctx, dest, 'sine', 300, 1000, 0.3, 0.5);
  playOsc(ctx, dest, 'sine', 450, 1500, 0.3, 0.3);
}

function hitImpact(ctx: AudioContext, dest: AudioNode): void {
  playOsc(ctx, dest, 'square', 150, 150, 0.05, 0.6);
  playNoise(ctx, dest, 0.03, 0.5);
}

function criticalHit(ctx: AudioContext, dest: AudioNode): void {
  playOsc(ctx, dest, 'square', 150, 150, 0.05, 0.8);
  playNoise(ctx, dest, 0.03, 0.7);
  playOsc(ctx, dest, 'sine', 100, 100, 0.08, 0.7);
}

function levelUp(ctx: AudioContext, dest: AudioNode): void {
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    const gain = ctx.createGain();
    gain.connect(dest);
    const start = ctx.currentTime + i * 0.1;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.5, start + 0.02);
    gain.gain.linearRampToValueAtTime(0, start + 0.1);
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, start);
    osc.connect(gain);
    osc.start(start);
    osc.stop(start + 0.1);
  });
}

function menuSelect(ctx: AudioContext, dest: AudioNode): void {
  playOsc(ctx, dest, 'sine', 600, 600, 0.05, 0.4);
}

function cursorMove(ctx: AudioContext, dest: AudioNode): void {
  playOsc(ctx, dest, 'sine', 400, 400, 0.03, 0.2);
}

function heal(ctx: AudioContext, dest: AudioNode): void {
  playOsc(ctx, dest, 'triangle', 400, 800, 0.2, 0.4);
}

function miss(ctx: AudioContext, dest: AudioNode): void {
  playOsc(ctx, dest, 'sine', 500, 200, 0.08, 0.4);
}

function death(ctx: AudioContext, dest: AudioNode): void {
  playOsc(ctx, dest, 'square', 100, 50, 0.3, 0.5);
}

const sfxFactories: Record<SoundEffectType, SFXFactory> = {
  [SoundEffectType.SwordSwing]: swordSwing,
  [SoundEffectType.ArrowFire]: arrowFire,
  [SoundEffectType.MagicCast]: magicCast,
  [SoundEffectType.HitImpact]: hitImpact,
  [SoundEffectType.CriticalHit]: criticalHit,
  [SoundEffectType.LevelUp]: levelUp,
  [SoundEffectType.MenuSelect]: menuSelect,
  [SoundEffectType.CursorMove]: cursorMove,
  [SoundEffectType.Heal]: heal,
  [SoundEffectType.Miss]: miss,
  [SoundEffectType.Death]: death,
};

export function generateSFX(
  ctx: AudioContext,
  destination: AudioNode,
  type: SoundEffectType,
): void {
  const factory = sfxFactories[type];
  if (factory) {
    factory(ctx, destination);
  }
}

export function getSFXDuration(type: SoundEffectType): number {
  const durations: Record<SoundEffectType, number> = {
    [SoundEffectType.SwordSwing]: 100,
    [SoundEffectType.ArrowFire]: 50,
    [SoundEffectType.MagicCast]: 300,
    [SoundEffectType.HitImpact]: 50,
    [SoundEffectType.CriticalHit]: 80,
    [SoundEffectType.LevelUp]: 400,
    [SoundEffectType.MenuSelect]: 50,
    [SoundEffectType.CursorMove]: 30,
    [SoundEffectType.Heal]: 200,
    [SoundEffectType.Miss]: 80,
    [SoundEffectType.Death]: 300,
  };
  return durations[type];
}
