import { describe, expect, it, beforeEach } from 'vitest';
import { SoundEffectType } from '../../shared/types';
import { SFX_GENERATORS } from '../sfxGenerator';
import { createMockAudioContext, MockAudioContext } from './mocks';

describe('SFX_GENERATORS', () => {
  let ctx: AudioContext;
  let mockCtx: MockAudioContext;

  beforeEach(() => {
    ctx = createMockAudioContext();
    mockCtx = ctx as unknown as MockAudioContext;
  });

  it('defines a generator for every SoundEffectType', () => {
    expect(Object.keys(SFX_GENERATORS)).toHaveLength(Object.values(SoundEffectType).length);
  });

  it('synthesizes SwordSwing as a sine sweep 400Hz to 200Hz over 100ms', () => {
    SFX_GENERATORS[SoundEffectType.SwordSwing](ctx, mockCtx.destination, 0.8);

    expect(mockCtx.oscillators).toHaveLength(1);
    expect(mockCtx.oscillators[0].type).toBe('sine');
    expect(mockCtx.oscillators[0].frequency.setValueCalls[0]).toEqual({ value: 400, time: 0 });
    expect(mockCtx.oscillators[0].frequency.rampCalls[0]).toEqual({ value: 200, time: 0.1 });
    expect(mockCtx.oscillators[0].start).toHaveBeenCalledWith(0);
    expect(mockCtx.oscillators[0].stop).toHaveBeenCalledWith(0.1);
  });

  it('synthesizes ArrowFire as noise plus a short 800Hz sine tone', () => {
    SFX_GENERATORS[SoundEffectType.ArrowFire](ctx, mockCtx.destination, 0.7);

    expect(mockCtx.bufferSources).toHaveLength(1);
    expect(mockCtx.oscillators).toHaveLength(1);
    expect(mockCtx.oscillators[0].type).toBe('sine');
    expect(mockCtx.oscillators[0].frequency.setValueCalls[0]).toEqual({ value: 800, time: 0 });
    expect(mockCtx.oscillators[0].stop).toHaveBeenCalledWith(0.03);
  });

  it('synthesizes MagicCast as a 3-note sine chord sweep', () => {
    SFX_GENERATORS[SoundEffectType.MagicCast](ctx, mockCtx.destination, 0.6);

    expect(mockCtx.oscillators).toHaveLength(3);
    expect(mockCtx.oscillators.every((osc) => osc.type === 'sine')).toBe(true);
    expect(mockCtx.oscillators[0].frequency.setValueCalls[0].value).toBeCloseTo(300, 5);
    expect(mockCtx.oscillators[0].frequency.rampCalls[0].value).toBeCloseTo(1000, 5);
    expect(mockCtx.oscillators[0].stop).toHaveBeenCalledWith(0.3);
  });

  it('synthesizes HitImpact as square 150Hz plus short noise', () => {
    SFX_GENERATORS[SoundEffectType.HitImpact](ctx, mockCtx.destination, 0.9);

    expect(mockCtx.oscillators).toHaveLength(1);
    expect(mockCtx.oscillators[0].type).toBe('square');
    expect(mockCtx.oscillators[0].frequency.setValueCalls[0]).toEqual({ value: 150, time: 0 });
    expect(mockCtx.bufferSources).toHaveLength(1);
  });

  it('synthesizes CriticalHit as louder square 100Hz plus noise', () => {
    SFX_GENERATORS[SoundEffectType.CriticalHit](ctx, mockCtx.destination, 0.5);

    expect(mockCtx.oscillators).toHaveLength(1);
    expect(mockCtx.oscillators[0].type).toBe('square');
    expect(mockCtx.oscillators[0].frequency.setValueCalls[0]).toEqual({ value: 100, time: 0 });
    expect(mockCtx.bufferSources).toHaveLength(1);
    expect(mockCtx.gains[0].gain.setValueCalls[0].value).toBeGreaterThan(0.5);
  });

  it('synthesizes LevelUp as ascending sawtooth arpeggio C5-E5-G5-C6', () => {
    SFX_GENERATORS[SoundEffectType.LevelUp](ctx, mockCtx.destination, 0.7);

    const frequencies = mockCtx.oscillators.map((osc) => osc.frequency.setValueCalls[0].value);
    const starts = mockCtx.oscillators.map((osc) => (osc.start.mock.calls[0] as [number])[0]);

    expect(mockCtx.oscillators).toHaveLength(4);
    expect(mockCtx.oscillators.every((osc) => osc.type === 'sawtooth')).toBe(true);
    expect(frequencies[0]).toBeCloseTo(523.25, 2);
    expect(frequencies[1]).toBeCloseTo(659.25, 2);
    expect(frequencies[2]).toBeCloseTo(783.99, 2);
    expect(frequencies[3]).toBeCloseTo(1046.5, 2);
    expect(starts).toEqual([0, 0.1, 0.2, 0.30000000000000004]);
  });

  it('synthesizes MenuSelect as a 600Hz sine blip', () => {
    SFX_GENERATORS[SoundEffectType.MenuSelect](ctx, mockCtx.destination, 0.8);

    expect(mockCtx.oscillators).toHaveLength(1);
    expect(mockCtx.oscillators[0].type).toBe('sine');
    expect(mockCtx.oscillators[0].frequency.setValueCalls[0].value).toBe(600);
    expect(mockCtx.oscillators[0].stop).toHaveBeenCalledWith(0.05);
  });

  it('synthesizes CursorMove as a low-volume 400Hz sine blip', () => {
    SFX_GENERATORS[SoundEffectType.CursorMove](ctx, mockCtx.destination, 1);

    expect(mockCtx.oscillators).toHaveLength(1);
    expect(mockCtx.oscillators[0].type).toBe('sine');
    expect(mockCtx.oscillators[0].frequency.setValueCalls[0].value).toBe(400);
    expect(mockCtx.gains[0].gain.setValueCalls[0].value).toBeCloseTo(0.45, 5);
    expect(mockCtx.oscillators[0].stop).toHaveBeenCalledWith(0.03);
  });

  it('synthesizes Heal as triangle sweep 400Hz to 800Hz', () => {
    SFX_GENERATORS[SoundEffectType.Heal](ctx, mockCtx.destination, 0.75);

    expect(mockCtx.oscillators).toHaveLength(1);
    expect(mockCtx.oscillators[0].type).toBe('triangle');
    expect(mockCtx.oscillators[0].frequency.setValueCalls[0].value).toBe(400);
    expect(mockCtx.oscillators[0].frequency.rampCalls[0].value).toBe(800);
    expect(mockCtx.oscillators[0].stop).toHaveBeenCalledWith(0.2);
  });

  it('synthesizes Miss as sine sweep 500Hz down to 200Hz', () => {
    SFX_GENERATORS[SoundEffectType.Miss](ctx, mockCtx.destination, 0.6);

    expect(mockCtx.oscillators).toHaveLength(1);
    expect(mockCtx.oscillators[0].type).toBe('sine');
    expect(mockCtx.oscillators[0].frequency.setValueCalls[0].value).toBe(500);
    expect(mockCtx.oscillators[0].frequency.rampCalls[0].value).toBe(200);
    expect(mockCtx.oscillators[0].stop).toHaveBeenCalledWith(0.08);
  });

  it('synthesizes Death as a slow square sweep 100Hz to 50Hz', () => {
    SFX_GENERATORS[SoundEffectType.Death](ctx, mockCtx.destination, 0.5);

    expect(mockCtx.oscillators).toHaveLength(1);
    expect(mockCtx.oscillators[0].type).toBe('square');
    expect(mockCtx.oscillators[0].frequency.setValueCalls[0].value).toBe(100);
    expect(mockCtx.oscillators[0].frequency.rampCalls[0].value).toBe(50);
    expect(mockCtx.oscillators[0].stop).toHaveBeenCalledWith(0.3);
  });
});
