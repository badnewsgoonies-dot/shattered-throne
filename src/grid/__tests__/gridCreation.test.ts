import { describe, expect, it } from 'vitest';
import { GridType, TerrainType } from '../../shared/types';
import { createGridEngine } from '../gridEngine';

describe('gridEngine creation and basic operations', () => {
  const engine = createGridEngine();

  it('createGrid sets dimensions and grid type', () => {
    const map = engine.createGrid(5, 4, GridType.Square);
    expect(map.width).toBe(5);
    expect(map.height).toBe(4);
    expect(map.gridType).toBe(GridType.Square);
  });

  it('createGrid fills with plains terrain', () => {
    const map = engine.createGrid(3, 3, GridType.Square);
    for (let y = 0; y < map.height; y += 1) {
      for (let x = 0; x < map.width; x += 1) {
        expect(map.tiles[y][x].terrain.type).toBe(TerrainType.Plains);
      }
    }
  });

  it('createGrid assigns tile positions', () => {
    const map = engine.createGrid(3, 3, GridType.Square);
    expect(map.tiles[0][0].position).toEqual({ x: 0, y: 0 });
    expect(map.tiles[2][1].position).toEqual({ x: 1, y: 2 });
  });

  it('createGrid initializes default tile metadata', () => {
    const map = engine.createGrid(2, 2, GridType.Square);
    const tile = map.tiles[0][0];

    expect(tile.occupantId).toBeNull();
    expect(tile.itemId).toBeNull();
    expect(tile.isChest).toBe(false);
    expect(tile.isDoor).toBe(false);
    expect(tile.isDeploymentZone).toBe(false);
    expect(tile.fogRevealed).toBe(false);
  });

  it('getTile returns tile for in-bounds position', () => {
    const map = engine.createGrid(4, 4, GridType.Square);
    const tile = engine.getTile(map, { x: 2, y: 1 });
    expect(tile).not.toBeNull();
    expect(tile?.position).toEqual({ x: 2, y: 1 });
  });

  it('getTile returns null for negative coordinates', () => {
    const map = engine.createGrid(4, 4, GridType.Square);
    expect(engine.getTile(map, { x: -1, y: 0 })).toBeNull();
    expect(engine.getTile(map, { x: 0, y: -1 })).toBeNull();
  });

  it('getTile returns null for coordinates beyond bounds', () => {
    const map = engine.createGrid(4, 4, GridType.Square);
    expect(engine.getTile(map, { x: 4, y: 0 })).toBeNull();
    expect(engine.getTile(map, { x: 0, y: 4 })).toBeNull();
  });

  it('setOccupant updates occupant at requested tile', () => {
    const map = engine.createGrid(4, 4, GridType.Square);
    const updated = engine.setOccupant(map, { x: 1, y: 1 }, 'u1');

    expect(updated.tiles[1][1].occupantId).toBe('u1');
  });

  it('setOccupant is immutable at map level', () => {
    const map = engine.createGrid(4, 4, GridType.Square);
    const updated = engine.setOccupant(map, { x: 1, y: 1 }, 'u1');

    expect(updated).not.toBe(map);
  });

  it('setOccupant does not mutate original map tile occupant', () => {
    const map = engine.createGrid(4, 4, GridType.Square);
    const updated = engine.setOccupant(map, { x: 1, y: 1 }, 'u1');

    expect(map.tiles[1][1].occupantId).toBeNull();
    expect(updated.tiles[1][1].occupantId).toBe('u1');
  });

  it('setOccupant returns same map when out of bounds', () => {
    const map = engine.createGrid(4, 4, GridType.Square);
    const updated = engine.setOccupant(map, { x: 10, y: 10 }, 'u1');
    expect(updated).toBe(map);
  });

  it('loadMap deep clones map object', () => {
    const map = engine.createGrid(3, 3, GridType.Square);
    const cloned = engine.loadMap(map);

    expect(cloned).not.toBe(map);
    expect(cloned.tiles).not.toBe(map.tiles);
  });

  it('loadMap deep clones nested tile and terrain objects', () => {
    const map = engine.createGrid(3, 3, GridType.Square);
    const cloned = engine.loadMap(map);

    cloned.tiles[0][0].occupantId = 'mutate';
    cloned.tiles[0][0].terrain.movementCost.foot = 77;

    expect(map.tiles[0][0].occupantId).toBeNull();
    expect(map.tiles[0][0].terrain.movementCost.foot).toBe(1);
  });

  it('getAdjacentPositions returns 4 neighbors for square center', () => {
    const map = engine.createGrid(5, 5, GridType.Square);
    const adjacent = engine.getAdjacentPositions(map, { x: 2, y: 2 });
    const keys = new Set(adjacent.map((p) => `${p.x},${p.y}`));

    expect(keys.size).toBe(4);
    expect(keys.has('2,1')).toBe(true);
    expect(keys.has('3,2')).toBe(true);
    expect(keys.has('2,3')).toBe(true);
    expect(keys.has('1,2')).toBe(true);
  });

  it('getAdjacentPositions returns only in-bounds neighbors for square corner', () => {
    const map = engine.createGrid(5, 5, GridType.Square);
    const adjacent = engine.getAdjacentPositions(map, { x: 0, y: 0 });
    const keys = new Set(adjacent.map((p) => `${p.x},${p.y}`));

    expect(keys.size).toBe(2);
    expect(keys.has('1,0')).toBe(true);
    expect(keys.has('0,1')).toBe(true);
  });

  it('getAdjacentPositions returns 6 neighbors for hex center', () => {
    const map = engine.createGrid(7, 7, GridType.Hex);
    const adjacent = engine.getAdjacentPositions(map, { x: 3, y: 3 });
    expect(adjacent.length).toBe(6);
  });

  it('getDistance uses Manhattan metric on square grids', () => {
    expect(engine.getDistance({ x: 1, y: 1 }, { x: 4, y: 5 }, GridType.Square)).toBe(7);
  });

  it('getDistance uses hex distance metric on hex grids', () => {
    expect(engine.getDistance({ x: 2, y: 2 }, { x: 2, y: 2 }, GridType.Hex)).toBe(0);
    expect(engine.getDistance({ x: 3, y: 3 }, { x: 4, y: 3 }, GridType.Hex)).toBe(1);
  });
});
