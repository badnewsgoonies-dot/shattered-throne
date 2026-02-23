import { afterEach, describe, expect, it, vi } from 'vitest';
import { createParticleEmitter } from '../particleSystem';

describe('particleSystem', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates requested number of particles', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const emitter = createParticleEmitter(10, 20, '#FFFFFF', 6, 100, 1);
    expect(emitter.particles).toHaveLength(6);
  });

  it('initializes particle positions at emitter location', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const emitter = createParticleEmitter(3, 4, '#AA0000', 3, 20, 1);

    emitter.particles.forEach((particle) => {
      expect(particle.x).toBe(3);
      expect(particle.y).toBe(4);
    });
  });

  it('assigns velocity magnitudes within speed range', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const speed = 40;
    const emitter = createParticleEmitter(0, 0, '#0F0', 4, speed, 1);

    emitter.particles.forEach((particle) => {
      const magnitude = Math.hypot(particle.vx, particle.vy);
      expect(magnitude).toBeLessThanOrEqual(speed);
      expect(magnitude).toBeGreaterThan(0);
    });
  });

  it('updates particle positions using velocity and dt', () => {
    const values = [0, 1, 0, 1];
    let i = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => values[i++] ?? 0);

    const emitter = createParticleEmitter(0, 0, '#FFF', 2, 10, 2);
    emitter.update(0.5);

    expect(emitter.particles[0]?.x).toBeCloseTo(5);
    expect(emitter.particles[0]?.y).toBeCloseTo(0);
  });

  it('decreases lifetime each update tick', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const emitter = createParticleEmitter(0, 0, '#FFF', 1, 5, 2);

    emitter.update(0.5);
    expect(emitter.particles[0]?.lifetime).toBeCloseTo(1.5);
  });

  it('updates alpha based on remaining lifetime ratio', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const emitter = createParticleEmitter(0, 0, '#FFF', 1, 5, 2);

    emitter.update(1);
    expect(emitter.particles[0]?.alpha).toBeCloseTo(0.5);
  });

  it('removes particles whose lifetime reaches zero', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const emitter = createParticleEmitter(0, 0, '#FFF', 3, 5, 1);

    emitter.update(1.1);
    expect(emitter.particles).toHaveLength(0);
  });

  it('reports completion when all particles expire', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const emitter = createParticleEmitter(0, 0, '#FFF', 2, 5, 0.2);

    expect(emitter.isComplete).toBe(false);
    emitter.update(1);
    expect(emitter.isComplete).toBe(true);
  });
});
