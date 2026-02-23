export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  lifetime: number;
  maxLifetime: number;
}

export interface ParticleEmitter {
  particles: Particle[];
  update(dt: number): void;
  isComplete: boolean;
}

export function createParticleEmitter(
  x: number,
  y: number,
  color: string,
  count: number,
  speed: number,
  lifetime: number,
): ParticleEmitter {
  const particles: Particle[] = [];
  const safeLifetime = Math.max(0, lifetime);
  const safeCount = Math.max(0, Math.floor(count));

  for (let i = 0; i < safeCount; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const s = Math.random() * speed;

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * s,
      vy: Math.sin(angle) * s,
      color,
      alpha: safeLifetime > 0 ? 1 : 0,
      lifetime: safeLifetime,
      maxLifetime: safeLifetime,
    });
  }

  return {
    particles,
    update(dt: number): void {
      const safeDt = Math.max(0, dt);

      for (const p of this.particles) {
        p.x += p.vx * safeDt;
        p.y += p.vy * safeDt;
        p.lifetime -= safeDt;
        p.alpha = p.maxLifetime <= 0 ? 0 : Math.max(0, p.lifetime / p.maxLifetime);
      }

      this.particles = this.particles.filter((p) => p.lifetime > 0);
    },
    get isComplete(): boolean {
      return this.particles.length === 0;
    },
  };
}
