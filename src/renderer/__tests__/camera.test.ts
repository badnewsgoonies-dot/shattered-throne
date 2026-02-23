import { describe, expect, it } from 'vitest';
import { clampCamera, createDefaultCamera, lerpCamera } from '../camera';

describe('camera', () => {
  it('createDefaultCamera returns zeroed position and unit zoom', () => {
    expect(createDefaultCamera()).toEqual({
      x: 0,
      y: 0,
      zoom: 1,
      targetX: 0,
      targetY: 0,
      targetZoom: 1,
    });
  });

  it('lerpCamera with dt=0 keeps camera unchanged', () => {
    const camera = { x: 10, y: 20, zoom: 1, targetX: 30, targetY: 40, targetZoom: 2 };
    expect(lerpCamera(camera, 0)).toEqual(camera);
  });

  it('lerpCamera moves toward target position', () => {
    const camera = { x: 0, y: 0, zoom: 1, targetX: 100, targetY: 50, targetZoom: 1 };
    const result = lerpCamera(camera, 0.1);
    expect(result.x).toBe(50);
    expect(result.y).toBe(25);
  });

  it('lerpCamera updates zoom toward target zoom', () => {
    const camera = { x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0, targetZoom: 2 };
    const result = lerpCamera(camera, 0.1);
    expect(result.zoom).toBe(1.5);
  });

  it('lerpCamera clamps interpolation factor to 1', () => {
    const camera = { x: 10, y: 20, zoom: 1.2, targetX: 100, targetY: 200, targetZoom: 2 };
    const result = lerpCamera(camera, 10);
    expect(result.x).toBe(100);
    expect(result.y).toBe(200);
    expect(result.zoom).toBe(2);
  });

  it('clampCamera clamps current camera position to map bounds', () => {
    const camera = { x: 9999, y: 9999, zoom: 1, targetX: 0, targetY: 0, targetZoom: 1 };
    const result = clampCamera(camera, 10, 8, 320, 240);
    expect(result.x).toBe(160);
    expect(result.y).toBe(144);
  });

  it('clampCamera clamps target camera position to map bounds', () => {
    const camera = { x: 0, y: 0, zoom: 1, targetX: 9999, targetY: 9999, targetZoom: 1 };
    const result = clampCamera(camera, 10, 8, 320, 240);
    expect(result.targetX).toBe(160);
    expect(result.targetY).toBe(144);
  });

  it('clampCamera clamps negatives to zero', () => {
    const camera = { x: -50, y: -80, zoom: 1, targetX: -10, targetY: -20, targetZoom: 1 };
    const result = clampCamera(camera, 10, 8, 320, 240);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.targetX).toBe(0);
    expect(result.targetY).toBe(0);
  });

  it('clampCamera returns zero bounds when map is smaller than viewport', () => {
    const camera = { x: 50, y: 50, zoom: 1, targetX: 50, targetY: 50, targetZoom: 1 };
    const result = clampCamera(camera, 2, 2, 500, 500);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.targetX).toBe(0);
    expect(result.targetY).toBe(0);
  });

  it('clampCamera uses zoom when calculating bounds', () => {
    const camera = { x: 500, y: 500, zoom: 2, targetX: 500, targetY: 500, targetZoom: 2 };
    const result = clampCamera(camera, 10, 10, 320, 240);
    expect(result.x).toBe(500);
    expect(result.y).toBe(500);

    const maxX = 10 * 48 * 2 - 320;
    const maxY = 10 * 48 * 2 - 240;
    expect(result.x).toBeLessThanOrEqual(maxX);
    expect(result.y).toBeLessThanOrEqual(maxY);
  });
});
