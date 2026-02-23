import { describe, expect, it } from 'vitest';
import { GridType } from '../../shared/types';
import { createDefaultCamera, gridToScreen, screenToGrid } from '../camera';

describe('coordinates', () => {
  it('screenToGrid maps square origin coordinates to tile 0,0', () => {
    const camera = createDefaultCamera();
    expect(screenToGrid(0, 0, camera, GridType.Square)).toEqual({ x: 0, y: 0 });
  });

  it('screenToGrid maps square coordinates to expected tile', () => {
    const camera = createDefaultCamera();
    expect(screenToGrid(95, 48, camera, GridType.Square)).toEqual({ x: 1, y: 1 });
  });

  it('screenToGrid accounts for camera offset on square grid', () => {
    const camera = { ...createDefaultCamera(), x: 96, y: 48 };
    expect(screenToGrid(0, 0, camera, GridType.Square)).toEqual({ x: 2, y: 1 });
  });

  it('screenToGrid accounts for zoom on square grid', () => {
    const camera = { ...createDefaultCamera(), zoom: 2 };
    expect(screenToGrid(96, 96, camera, GridType.Square)).toEqual({ x: 1, y: 1 });
  });

  it('screenToGrid floors negative square coordinates', () => {
    const camera = createDefaultCamera();
    expect(screenToGrid(-1, -1, camera, GridType.Square)).toEqual({ x: -1, y: -1 });
  });

  it('gridToScreen maps square tile to pixel origin', () => {
    const camera = createDefaultCamera();
    expect(gridToScreen({ x: 0, y: 0 }, camera, GridType.Square)).toEqual({ x: 0, y: 0 });
  });

  it('gridToScreen accounts for camera and zoom on square grid', () => {
    const camera = { ...createDefaultCamera(), x: 24, y: 48, zoom: 1.5 };
    expect(gridToScreen({ x: 2, y: 2 }, camera, GridType.Square)).toEqual({ x: 120, y: 96 });
  });

  it('square conversion is stable at tile centers', () => {
    const camera = { ...createDefaultCamera(), x: 30, y: 40, zoom: 1.25 };
    const tile = { x: 5, y: 7 };
    const screen = gridToScreen(tile, camera, GridType.Square);
    const tileSize = 48 * camera.zoom;
    const back = screenToGrid(screen.x + tileSize / 2, screen.y + tileSize / 2, camera, GridType.Square);

    expect(back).toEqual(tile);
  });

  it('screenToGrid maps hex coordinates for even column', () => {
    const camera = createDefaultCamera();
    expect(screenToGrid(0, 0, camera, GridType.Hex)).toEqual({ x: 0, y: 0 });
  });

  it('screenToGrid maps hex coordinates for odd column with row offset', () => {
    const camera = createDefaultCamera();
    expect(screenToGrid(40, 72, camera, GridType.Hex)).toEqual({ x: 1, y: 1 });
  });

  it('gridToScreen maps even hex column without vertical offset', () => {
    const camera = createDefaultCamera();
    expect(gridToScreen({ x: 2, y: 3 }, camera, GridType.Hex)).toEqual({ x: 72, y: 144 });
  });

  it('gridToScreen maps odd hex column with vertical offset', () => {
    const camera = createDefaultCamera();
    expect(gridToScreen({ x: 1, y: 2 }, camera, GridType.Hex)).toEqual({ x: 36, y: 120 });
  });

  it('hex conversion is stable at tile centers', () => {
    const camera = { ...createDefaultCamera(), x: 20, y: 15, zoom: 1.2 };
    const tile = { x: 3, y: 4 };
    const screen = gridToScreen(tile, camera, GridType.Hex);
    const tileSize = 48 * camera.zoom;
    const back = screenToGrid(screen.x + tileSize * 0.4, screen.y + tileSize * 0.4, camera, GridType.Hex);

    expect(back).toEqual(tile);
  });

  it('hex conversion handles camera offset correctly', () => {
    const camera = { ...createDefaultCamera(), x: 72, y: 24 };
    const screen = gridToScreen({ x: 4, y: 3 }, camera, GridType.Hex);
    expect(screen).toEqual({ x: 72, y: 120 });

    const back = screenToGrid(screen.x + 10, screen.y + 10, camera, GridType.Hex);
    expect(back).toEqual({ x: 4, y: 3 });
  });

  it('hex conversion respects zoom levels', () => {
    const camera = { ...createDefaultCamera(), zoom: 2 };
    const screen = gridToScreen({ x: 2, y: 1 }, camera, GridType.Hex);
    expect(screen).toEqual({ x: 144, y: 96 });

    const back = screenToGrid(150, 110, camera, GridType.Hex);
    expect(back).toEqual({ x: 2, y: 1 });
  });
});
