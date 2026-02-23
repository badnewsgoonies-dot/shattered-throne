# Renderer — Full Domain Implementation

You are implementing the Renderer domain for Shattered Throne, a tactical RPG.

## CRITICAL RULES
- ONLY create/modify files under `src/renderer/`
- Import types ONLY from `../../shared/types`
- Do NOT import from any other domain
- `src/shared/types.ts` already exists — do NOT modify it
- Canvas API is NOT available in Node.js tests — test only pure logic functions
- Mock HTMLCanvasElement and CanvasRenderingContext2D in implementation (use optional chaining / null checks)

## Files to Create

### 1. `src/renderer/terrainColors.ts`
```typescript
import { TerrainType } from '../../shared/types';

export const TERRAIN_COLORS: Record<TerrainType, string> = {
  plains: '#90C060', forest: '#408030', mountain: '#A08060',
  water: '#4080D0', lava: '#D04020', fortress: '#808090',
  bridge: '#B09060', swamp: '#607048', sand: '#D0C080',
  snow: '#E0E8F0', void: '#202020',
};

export const TILE_SIZE = 48;
```

### 2. `src/renderer/camera.ts`
```typescript
import { Camera, Position, GridType } from '../../shared/types';

export function createDefaultCamera(): Camera {
  return { x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0, targetZoom: 1 };
}

export function lerpCamera(camera: Camera, dt: number): Camera {
  const t = Math.min(1, dt * 5); // Smooth factor
  return {
    ...camera,
    x: camera.x + (camera.targetX - camera.x) * t,
    y: camera.y + (camera.targetY - camera.y) * t,
    zoom: camera.zoom + (camera.targetZoom - camera.zoom) * t,
  };
}

export function clampCamera(camera: Camera, mapWidth: number, mapHeight: number, viewWidth: number, viewHeight: number): Camera {
  const maxX = Math.max(0, mapWidth * 48 * camera.zoom - viewWidth);
  const maxY = Math.max(0, mapHeight * 48 * camera.zoom - viewHeight);
  return {
    ...camera,
    x: Math.max(0, Math.min(camera.x, maxX)),
    y: Math.max(0, Math.min(camera.y, maxY)),
    targetX: Math.max(0, Math.min(camera.targetX, maxX)),
    targetY: Math.max(0, Math.min(camera.targetY, maxY)),
  };
}

export function screenToGrid(screenX: number, screenY: number, camera: Camera, gridType: GridType): Position {
  const tileSize = 48 * camera.zoom;
  const worldX = screenX + camera.x;
  const worldY = screenY + camera.y;
  if (gridType === GridType.Hex) {
    // Hex grid conversion
    const col = Math.floor(worldX / (tileSize * 0.75));
    const row = Math.floor((worldY - (col % 2 === 1 ? tileSize / 2 : 0)) / tileSize);
    return { x: col, y: row };
  }
  return { x: Math.floor(worldX / tileSize), y: Math.floor(worldY / tileSize) };
}

export function gridToScreen(pos: Position, camera: Camera, gridType: GridType): { x: number; y: number } {
  const tileSize = 48 * camera.zoom;
  if (gridType === GridType.Hex) {
    const x = pos.x * tileSize * 0.75 - camera.x;
    const y = pos.y * tileSize + (pos.x % 2 === 1 ? tileSize / 2 : 0) - camera.y;
    return { x, y };
  }
  return { x: pos.x * tileSize - camera.x, y: pos.y * tileSize - camera.y };
}
```

### 3. `src/renderer/tweenEngine.ts`
```typescript
export type EasingFn = (t: number) => number;

export const Easing = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => t * (2 - t),
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
};

export interface Tween {
  update(dt: number): number;
  isComplete: boolean;
  value: number;
}

export function createTween(from: number, to: number, duration: number, easing: EasingFn = Easing.linear): Tween {
  let elapsed = 0;
  return {
    get isComplete() { return elapsed >= duration; },
    get value() {
      const t = Math.min(1, elapsed / duration);
      return from + (to - from) * easing(t);
    },
    update(dt: number): number {
      elapsed = Math.min(duration, elapsed + dt);
      const t = Math.min(1, elapsed / duration);
      return from + (to - from) * easing(t);
    },
  };
}
```

### 4. `src/renderer/particleSystem.ts`
```typescript
export interface Particle {
  x: number; y: number; vx: number; vy: number;
  color: string; alpha: number; lifetime: number; maxLifetime: number;
}

export interface ParticleEmitter {
  particles: Particle[];
  update(dt: number): void;
  isComplete: boolean;
}

export function createParticleEmitter(x: number, y: number, color: string, count: number, speed: number, lifetime: number): ParticleEmitter {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const s = Math.random() * speed;
    particles.push({
      x, y, vx: Math.cos(angle) * s, vy: Math.sin(angle) * s,
      color, alpha: 1, lifetime, maxLifetime: lifetime,
    });
  }
  return {
    particles,
    update(dt: number) {
      for (const p of this.particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.lifetime -= dt;
        p.alpha = Math.max(0, p.lifetime / p.maxLifetime);
      }
      this.particles = this.particles.filter(p => p.lifetime > 0);
    },
    get isComplete() { return this.particles.length === 0; },
  };
}
```

### 5. `src/renderer/animationSystem.ts`
```typescript
import { AnimationRequest } from '../../shared/types';

export function playAnimation(request: AnimationRequest, ctx: CanvasRenderingContext2D | null): Promise<void> {
  return new Promise(resolve => {
    // In test/headless: resolve immediately
    if (!ctx) { resolve(); return; }
    setTimeout(resolve, request.durationMs);
  });
}
```

### 6. `src/renderer/gridRenderer.ts`
Grid rendering logic using canvas 2D context. Draws terrain tiles with colors from terrainColors.ts.

### 7. `src/renderer/unitRenderer.ts`
Unit rendering: colored circles (blue=player, red=enemy, green=ally), class letter, health bar, status dots.

### 8. `src/renderer/overlayRenderer.ts`
Movement/attack/danger/heal overlays as semi-transparent colored tiles.

### 9. `src/renderer/battleForecastRenderer.ts`
Two-panel forecast display.

### 10. `src/renderer/combatLogRenderer.ts`
Scrollable combat log sidebar.

### 11. `src/renderer/turnBannerRenderer.ts`
Phase banner animation.

### 12. `src/renderer/titleScreenRenderer.ts`
Title screen with menu.

### 13. `src/renderer/worldMapRenderer.ts`
Node graph world map.

### 14. `src/renderer/dialogueRenderer.ts`
Dialogue box with typewriter effect.

### 15. `src/renderer/unitInfoRenderer.ts`
Unit stat screen.

### 16. `src/renderer/shopRenderer.ts`
Shop UI.

### 17. `src/renderer/levelUpRenderer.ts`
Level up stat display.

### 18. `src/renderer/saveLoadRenderer.ts`
Save/load menu.

### 19. `src/renderer/settingsRenderer.ts`
Settings menu.

### 20. `src/renderer/minimapRenderer.ts`
Mini-map overlay.

### 21. `src/renderer/renderer.ts`
Factory function `createRenderer(): IRenderer`.

```typescript
import { IRenderer, Camera, GridMap, Unit, CombatState, RenderOverlay, UIScreen, DialogueLine, BattleForecast, LevelUpResult, AnimationRequest, Position, GridType } from '../../shared/types';

export function createRenderer(): IRenderer {
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let camera: Camera = createDefaultCamera();

  return {
    init(c: HTMLCanvasElement) { canvas = c; ctx = c.getContext('2d'); },
    renderBattle(map, units, state, cam, overlays) {
      if (!ctx) return;
      camera = cam;
      // Clear, draw grid, draw overlays, draw units, draw cursor, draw UI elements
    },
    renderUI(screen, data) { if (!ctx) return; /* render appropriate screen */ },
    renderDialogue(lines, currentIndex) { if (!ctx) return; /* dialogue box */ },
    renderBattleForecast(forecast, attacker, defender) { if (!ctx) return; },
    renderLevelUp(result, unit) { if (!ctx) return; },
    async playAnimation(request) { await playAnimationFn(request, ctx); },
    setCamera(c) { camera = c; },
    getCamera() { return { ...camera }; },
    screenToGrid(sx, sy, cam, gt) { return screenToGridFn(sx, sy, cam, gt); },
    gridToScreen(pos, cam, gt) { return gridToScreenFn(pos, cam, gt); },
  };
}
```

### 22. `src/renderer/index.ts`
```typescript
export { createRenderer } from './renderer';
```

### 23. Tests — `src/renderer/__tests__/`

Test ONLY pure logic functions (no canvas):

**coordinates.test.ts** (~15 tests): screenToGrid and gridToScreen with various camera positions, zoom levels, both square and hex grids.
**tweenEngine.test.ts** (~12 tests): Linear interpolation, ease-in, ease-out, ease-in-out, completion detection, boundary values.
**particleSystem.test.ts** (~8 tests): Particle creation count, update movement, lifetime expiry, removal, emitter completion.
**camera.test.ts** (~10 tests): Camera lerp, zoom levels, map bounds clamping, default camera.
**terrainColors.test.ts** (~8 tests): Each terrain type maps to correct hex color string.

TOTAL: 50+ tests

## Import Pattern
```typescript
import {
  IRenderer, Camera, GridMap, Unit, CombatState, RenderOverlay, UIScreen,
  DialogueLine, BattleForecast, LevelUpResult, AnimationRequest, Position,
  GridType, TerrainType, Tile
} from '../../shared/types';
```
