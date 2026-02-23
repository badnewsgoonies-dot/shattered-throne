import { describe, expect, it } from 'vitest';
import { GridType, TerrainType } from '../../shared/types';
import { applyFogOfWar } from '../fogOfWar';
import { createTestMap, createUnit, withTerrain } from './testUtils';

describe('fogOfWar', () => {
  it('reveals tiles within unit vision radius', () => {
    const map = createTestMap(7, 7, GridType.Square);
    const unit = createUnit({
      id: 'p1',
      team: 'player',
      position: { x: 3, y: 3 },
      currentStats: {
        hp: 20,
        strength: 5,
        magic: 3,
        skill: 5,
        speed: 5,
        luck: 5,
        defense: 5,
        resistance: 5,
        movement: 1,
      },
    });

    const result = applyFogOfWar(map, 'player', [unit]);

    expect(result.tiles[3][3].fogRevealed).toBe(true);
    expect(result.tiles[3][4].fogRevealed).toBe(true);
    expect(result.tiles[0][3].fogRevealed).toBe(true);
  });

  it('hides tiles outside all vision radii', () => {
    const map = createTestMap(9, 9, GridType.Square);
    const unit = createUnit({
      id: 'p1',
      team: 'player',
      position: { x: 0, y: 0 },
      currentStats: {
        hp: 20,
        strength: 5,
        magic: 3,
        skill: 5,
        speed: 5,
        luck: 5,
        defense: 5,
        resistance: 5,
        movement: 1,
      },
    });

    const result = applyFogOfWar(map, 'player', [unit]);
    expect(result.tiles[8][8].fogRevealed).toBe(false);
  });

  it('only uses units on the requested team for visibility', () => {
    const map = createTestMap(9, 9, GridType.Square);
    const player = createUnit({ id: 'p1', team: 'player', position: { x: 0, y: 0 } });
    const enemy = createUnit({ id: 'e1', team: 'enemy', position: { x: 8, y: 8 } });

    const result = applyFogOfWar(map, 'player', [player, enemy]);

    expect(result.tiles[8][8].fogRevealed).toBe(false);
    expect(result.tiles[0][0].fogRevealed).toBe(true);
  });

  it('ignores dead units', () => {
    const map = createTestMap(7, 7, GridType.Square);
    const deadPlayer = createUnit({ id: 'p1', team: 'player', position: { x: 3, y: 3 }, isAlive: false });

    const result = applyFogOfWar(map, 'player', [deadPlayer]);
    expect(result.tiles[3][3].fogRevealed).toBe(false);
  });

  it('ignores units without a position', () => {
    const map = createTestMap(7, 7, GridType.Square);
    const noPos = createUnit({ id: 'p1', team: 'player', position: null });

    const result = applyFogOfWar(map, 'player', [noPos]);
    expect(result.tiles[3][3].fogRevealed).toBe(false);
  });

  it('uses line of sight so elevated blockers hide tiles behind them', () => {
    let map = createTestMap(6, 1, GridType.Square);
    map = withTerrain(map, { x: 2, y: 0 }, TerrainType.Mountain);

    const unit = createUnit({
      id: 'p1',
      team: 'player',
      position: { x: 0, y: 0 },
      currentStats: {
        hp: 20,
        strength: 5,
        magic: 3,
        skill: 5,
        speed: 5,
        luck: 5,
        defense: 5,
        resistance: 5,
        movement: 4,
      },
    });

    const result = applyFogOfWar(map, 'player', [unit]);

    expect(result.tiles[0][1].fogRevealed).toBe(true);
    expect(result.tiles[0][2].fogRevealed).toBe(true);
    expect(result.tiles[0][4].fogRevealed).toBe(false);
  });

  it('combines visibility from multiple friendly units', () => {
    const map = createTestMap(9, 9, GridType.Square);
    const p1 = createUnit({ id: 'p1', team: 'player', position: { x: 1, y: 1 } });
    const p2 = createUnit({ id: 'p2', team: 'player', position: { x: 7, y: 7 } });

    const result = applyFogOfWar(map, 'player', [p1, p2]);

    expect(result.tiles[1][1].fogRevealed).toBe(true);
    expect(result.tiles[7][7].fogRevealed).toBe(true);
  });

  it('returns a new immutable map instance', () => {
    const map = createTestMap(5, 5, GridType.Square);
    const unit = createUnit({ id: 'p1', team: 'player', position: { x: 2, y: 2 } });

    const result = applyFogOfWar(map, 'player', [unit]);

    expect(result).not.toBe(map);
    expect(result.tiles).not.toBe(map.tiles);
    expect(map.tiles[2][2].fogRevealed).toBe(false);
  });

  it('resets fog for unseen tiles even if previously revealed', () => {
    const map = createTestMap(5, 5, GridType.Square);
    const preRevealed = {
      ...map,
      tiles: map.tiles.map((row) => row.map((tile) => ({ ...tile, fogRevealed: true }))),
    };
    const unit = createUnit({
      id: 'p1',
      team: 'player',
      position: { x: 0, y: 0 },
      currentStats: {
        hp: 20,
        strength: 5,
        magic: 3,
        skill: 5,
        speed: 5,
        luck: 5,
        defense: 5,
        resistance: 5,
        movement: 0,
      },
    });

    const result = applyFogOfWar(preRevealed, 'player', [unit]);
    expect(result.tiles[4][4].fogRevealed).toBe(false);
  });

  it('supports hex-grid visibility distance', () => {
    const map = createTestMap(7, 7, GridType.Hex);
    const unit = createUnit({
      id: 'p1',
      team: 'player',
      position: { x: 3, y: 3 },
      currentStats: {
        hp: 20,
        strength: 5,
        magic: 3,
        skill: 5,
        speed: 5,
        luck: 5,
        defense: 5,
        resistance: 5,
        movement: 1,
      },
    });

    const result = applyFogOfWar(map, 'player', [unit]);
    expect(result.tiles[3][3].fogRevealed).toBe(true);
    expect(result.tiles[0][0].fogRevealed).toBe(false);
  });
});
