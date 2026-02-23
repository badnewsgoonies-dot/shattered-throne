import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SoundEffectType } from '../../shared/types';
import { createMockAudioContext, createMockGainNode, createMockOscillatorNode, createMockBufferSourceNode, createMockAudioBuffer } from './mocks';
import { generateSFX, getSFXDuration } from '../sfxGenerator';

describe('sfxGenerator', () => {
  let mockCtx: ReturnType<typeof createMockAudioContext>;
  let mockDest: ReturnType<typeof createMockGainNode>;

  beforeEach(() => {
    mockCtx = createMockAudioContext();
    mockDest = createMockGainNode();
  });

  describe('generateSFX', () => {
    it('should generate SwordSwing without errors', () => {
      expect(() => generateSFX(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, SoundEffectType.SwordSwing)).not.toThrow();
    });

    it('should generate ArrowFire without errors', () => {
      expect(() => generateSFX(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, SoundEffectType.ArrowFire)).not.toThrow();
    });

    it('should generate MagicCast without errors', () => {
      expect(() => generateSFX(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, SoundEffectType.MagicCast)).not.toThrow();
    });

    it('should generate HitImpact without errors', () => {
      expect(() => generateSFX(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, SoundEffectType.HitImpact)).not.toThrow();
    });

    it('should generate CriticalHit without errors', () => {
      expect(() => generateSFX(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, SoundEffectType.CriticalHit)).not.toThrow();
    });

    it('should generate LevelUp without errors', () => {
      expect(() => generateSFX(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, SoundEffectType.LevelUp)).not.toThrow();
    });

    it('should generate MenuSelect without errors', () => {
      expect(() => generateSFX(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, SoundEffectType.MenuSelect)).not.toThrow();
    });

    it('should generate CursorMove without errors', () => {
      expect(() => generateSFX(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, SoundEffectType.CursorMove)).not.toThrow();
    });

    it('should generate Heal without errors', () => {
      expect(() => generateSFX(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, SoundEffectType.Heal)).not.toThrow();
    });

    it('should generate Miss without errors', () => {
      expect(() => generateSFX(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, SoundEffectType.Miss)).not.toThrow();
    });

    it('should generate Death without errors', () => {
      expect(() => generateSFX(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, SoundEffectType.Death)).not.toThrow();
    });

    it('should create oscillator for SwordSwing', () => {
      generateSFX(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, SoundEffectType.SwordSwing);
      expect(mockCtx.createOscillator).toHaveBeenCalled();
      expect(mockCtx.createGain).toHaveBeenCalled();
    });

    it('should create oscillator and noise buffer for ArrowFire', () => {
      generateSFX(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, SoundEffectType.ArrowFire);
      expect(mockCtx.createOscillator).toHaveBeenCalled();
      expect(mockCtx.createBuffer).toHaveBeenCalled();
    });

    it('should create two oscillators for MagicCast (fundamental + 5th)', () => {
      generateSFX(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, SoundEffectType.MagicCast);
      expect(mockCtx.createOscillator).toHaveBeenCalledTimes(2);
    });

    it('should create oscillator and noise for HitImpact', () => {
      generateSFX(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, SoundEffectType.HitImpact);
      expect(mockCtx.createOscillator).toHaveBeenCalled();
      expect(mockCtx.createBuffer).toHaveBeenCalled();
    });

    it('should create more nodes for CriticalHit than HitImpact', () => {
      generateSFX(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, SoundEffectType.CriticalHit);
      const critOscCalls = mockCtx.createOscillator.mock.calls.length;
      expect(critOscCalls).toBeGreaterThanOrEqual(2); // extra sine at 100Hz
    });

    it('should create 4 oscillators for LevelUp (C5, E5, G5, C6)', () => {
      generateSFX(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, SoundEffectType.LevelUp);
      expect(mockCtx.createOscillator).toHaveBeenCalledTimes(4);
    });

    it('should set oscillator start and stop for each SFX', () => {
      generateSFX(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, SoundEffectType.MenuSelect);
      const osc = mockCtx.createOscillator.mock.results[0].value;
      expect(osc.start).toHaveBeenCalled();
      expect(osc.stop).toHaveBeenCalled();
    });

    it('should connect oscillators to gain nodes', () => {
      generateSFX(mockCtx as unknown as AudioContext, mockDest as unknown as AudioNode, SoundEffectType.Heal);
      const osc = mockCtx.createOscillator.mock.results[0].value;
      expect(osc.connect).toHaveBeenCalled();
    });
  });

  describe('getSFXDuration', () => {
    it('should return 100 for SwordSwing', () => {
      expect(getSFXDuration(SoundEffectType.SwordSwing)).toBe(100);
    });

    it('should return 50 for ArrowFire', () => {
      expect(getSFXDuration(SoundEffectType.ArrowFire)).toBe(50);
    });

    it('should return 300 for MagicCast', () => {
      expect(getSFXDuration(SoundEffectType.MagicCast)).toBe(300);
    });

    it('should return 50 for HitImpact', () => {
      expect(getSFXDuration(SoundEffectType.HitImpact)).toBe(50);
    });

    it('should return 80 for CriticalHit', () => {
      expect(getSFXDuration(SoundEffectType.CriticalHit)).toBe(80);
    });

    it('should return 400 for LevelUp', () => {
      expect(getSFXDuration(SoundEffectType.LevelUp)).toBe(400);
    });

    it('should return 50 for MenuSelect', () => {
      expect(getSFXDuration(SoundEffectType.MenuSelect)).toBe(50);
    });

    it('should return 30 for CursorMove', () => {
      expect(getSFXDuration(SoundEffectType.CursorMove)).toBe(30);
    });

    it('should return 200 for Heal', () => {
      expect(getSFXDuration(SoundEffectType.Heal)).toBe(200);
    });

    it('should return 80 for Miss', () => {
      expect(getSFXDuration(SoundEffectType.Miss)).toBe(80);
    });

    it('should return 300 for Death', () => {
      expect(getSFXDuration(SoundEffectType.Death)).toBe(300);
    });
  });
});
