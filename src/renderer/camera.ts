import { Camera, GridType, Position } from '../shared/types';

const CAMERA_SMOOTH_FACTOR = 5;
const BASE_TILE_SIZE = 48;

export function createDefaultCamera(): Camera {
  return { x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0, targetZoom: 1 };
}

export function lerpCamera(camera: Camera, dt: number): Camera {
  const t = Math.min(1, Math.max(0, dt) * CAMERA_SMOOTH_FACTOR);
  return {
    ...camera,
    x: camera.x + (camera.targetX - camera.x) * t,
    y: camera.y + (camera.targetY - camera.y) * t,
    zoom: camera.zoom + (camera.targetZoom - camera.zoom) * t,
  };
}

export function clampCamera(
  camera: Camera,
  mapWidth: number,
  mapHeight: number,
  viewWidth: number,
  viewHeight: number,
): Camera {
  const maxX = Math.max(0, mapWidth * BASE_TILE_SIZE * camera.zoom - viewWidth);
  const maxY = Math.max(0, mapHeight * BASE_TILE_SIZE * camera.zoom - viewHeight);

  return {
    ...camera,
    x: Math.max(0, Math.min(camera.x, maxX)),
    y: Math.max(0, Math.min(camera.y, maxY)),
    targetX: Math.max(0, Math.min(camera.targetX, maxX)),
    targetY: Math.max(0, Math.min(camera.targetY, maxY)),
  };
}

export function screenToGrid(screenX: number, screenY: number, camera: Camera, gridType: GridType): Position {
  const tileSize = BASE_TILE_SIZE * camera.zoom;
  const worldX = screenX + camera.x;
  const worldY = screenY + camera.y;

  if (gridType === GridType.Hex) {
    const col = Math.floor(worldX / (tileSize * 0.75));
    const row = Math.floor((worldY - (col % 2 === 1 ? tileSize / 2 : 0)) / tileSize);
    return { x: col, y: row };
  }

  return { x: Math.floor(worldX / tileSize), y: Math.floor(worldY / tileSize) };
}

export function gridToScreen(pos: Position, camera: Camera, gridType: GridType): { x: number; y: number } {
  const tileSize = BASE_TILE_SIZE * camera.zoom;

  if (gridType === GridType.Hex) {
    const x = pos.x * tileSize * 0.75 - camera.x;
    const y = pos.y * tileSize + (pos.x % 2 === 1 ? tileSize / 2 : 0) - camera.y;
    return { x, y };
  }

  return { x: pos.x * tileSize - camera.x, y: pos.y * tileSize - camera.y };
}
