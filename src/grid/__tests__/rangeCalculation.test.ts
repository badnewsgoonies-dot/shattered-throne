import { describe, expect, it } from 'vitest';
import { GridType, MovementType, TerrainType } from '../../shared/types';
import {
  calculateDangerZone,
  getAttackRange,
  getMovementRange,
} from '../rangeCalculator';
import {
  createTestMap,
  createUnit,
  toKeySet,
  withOccupant,
  withTerrain,
} from './testUtils';

describe('rangeCalculator', () => {
  it('movement range includes the starting tile', () => {
    const map = createTestMap(5, 5, GridType.Square);
    const range = getMovementRange(map, { x: 2, y: 2 }, 2, MovementType.Foot, []);
    expect(toKeySet(range).has('2,2')).toBe(true);
  });

  it('movement range on open square map matches flood fill', () => {
    const map = createTestMap(5, 5, GridType.Square);
    const range = getMovementRange(map, { x: 2, y: 2 }, 1, MovementType.Foot, []);
    const keys = toKeySet(range);

    expect(keys.size).toBe(5);
    expect(keys.has('2,2')).toBe(true);
    expect(keys.has('2,1')).toBe(true);
    expect(keys.has('3,2')).toBe(true);
    expect(keys.has('2,3')).toBe(true);
    expect(keys.has('1,2')).toBe(true);
  });

  it('movement range respects terrain movement costs', () => {
    let map = createTestMap(3, 1, GridType.Square);
    map = withTerrain(map, { x: 1, y: 0 }, TerrainType.Forest);
    map = withTerrain(map, { x: 2, y: 0 }, TerrainType.Plains);

    const range = getMovementRange(map, { x: 0, y: 0 }, 2, MovementType.Foot, []);
    const keys = toKeySet(range);

    expect(keys.has('1,0')).toBe(true);
    expect(keys.has('2,0')).toBe(false);
  });

  it('movement range blocks impassable terrain', () => {
    let map = createTestMap(4, 1, GridType.Square);
    map = withTerrain(map, { x: 1, y: 0 }, TerrainType.Water);

    const range = getMovementRange(map, { x: 0, y: 0 }, 10, MovementType.Foot, []);
    const keys = toKeySet(range);

    expect(keys.has('1,0')).toBe(false);
    expect(keys.has('2,0')).toBe(false);
    expect(keys.has('3,0')).toBe(false);
  });

  it('movement range cannot move through enemy occupied tiles', () => {
    const mover = createUnit({ id: 'p1', team: 'player', position: { x: 0, y: 0 } });
    const enemy = createUnit({ id: 'e1', team: 'enemy', position: { x: 1, y: 0 } });
    let map = createTestMap(4, 1, GridType.Square);
    map = withOccupant(map, { x: 0, y: 0 }, 'p1');
    map = withOccupant(map, { x: 1, y: 0 }, 'e1');

    const range = getMovementRange(map, { x: 0, y: 0 }, 4, MovementType.Foot, [mover, enemy]);
    const keys = toKeySet(range);

    expect(keys.has('1,0')).toBe(false);
    expect(keys.has('2,0')).toBe(false);
    expect(keys.has('3,0')).toBe(false);
  });

  it('movement range can pass through friendly units but not stop on them', () => {
    const mover = createUnit({ id: 'p1', team: 'player', position: { x: 0, y: 0 } });
    const ally = createUnit({ id: 'p2', team: 'player', position: { x: 1, y: 0 } });
    let map = createTestMap(4, 1, GridType.Square);
    map = withOccupant(map, { x: 0, y: 0 }, 'p1');
    map = withOccupant(map, { x: 1, y: 0 }, 'p2');

    const range = getMovementRange(map, { x: 0, y: 0 }, 4, MovementType.Foot, [mover, ally]);
    const keys = toKeySet(range);

    expect(keys.has('1,0')).toBe(false);
    expect(keys.has('2,0')).toBe(true);
    expect(keys.has('3,0')).toBe(true);
  });

  it('movement range works on hex maps', () => {
    const map = createTestMap(5, 5, GridType.Hex);
    const range = getMovementRange(map, { x: 2, y: 2 }, 1, MovementType.Foot, []);

    expect(range.length).toBe(7);
  });

  it('attack range excludes positions already in movement range', () => {
    const map = createTestMap(5, 5, GridType.Square);
    const movement = [{ x: 2, y: 2 }];
    const attacks = getAttackRange(map, movement, 1, 1);
    const attackKeys = toKeySet(attacks);

    expect(attackKeys.has('2,2')).toBe(false);
    expect(attackKeys.has('2,1')).toBe(true);
    expect(attackKeys.has('3,2')).toBe(true);
    expect(attackKeys.has('2,3')).toBe(true);
    expect(attackKeys.has('1,2')).toBe(true);
  });

  it('attack range respects min and max range', () => {
    const map = createTestMap(7, 7, GridType.Square);
    const attacks = getAttackRange(map, [{ x: 3, y: 3 }], 2, 2);
    const keys = toKeySet(attacks);

    expect(keys.has('3,1')).toBe(true);
    expect(keys.has('5,3')).toBe(true);
    expect(keys.has('3,5')).toBe(true);
    expect(keys.has('1,3')).toBe(true);
    expect(keys.has('3,2')).toBe(false);
    expect(keys.has('3,4')).toBe(false);
  });

  it('attack range unions contributions from multiple movement tiles', () => {
    const map = createTestMap(5, 5, GridType.Square);
    const attacks = getAttackRange(
      map,
      [
        { x: 1, y: 1 },
        { x: 3, y: 3 },
      ],
      1,
      1,
    );
    const keys = toKeySet(attacks);

    expect(keys.has('1,0')).toBe(true);
    expect(keys.has('4,3')).toBe(true);
  });

  it('attack range returns empty for invalid min/max input', () => {
    const map = createTestMap(5, 5, GridType.Square);
    const attacks = getAttackRange(map, [{ x: 2, y: 2 }], 3, 2);
    expect(attacks).toEqual([]);
  });

  it('danger zone includes movement and attack area for alive enemies', () => {
    const map = createTestMap(7, 7, GridType.Square);
    const enemy = createUnit({
      id: 'e1',
      team: 'enemy',
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
        movement: 2,
      },
      movementType: MovementType.Foot,
      isAlive: true,
    });

    const danger = calculateDangerZone(map, [enemy]);
    const keys = toKeySet(danger);

    expect(keys.has('3,3')).toBe(true);
    expect(keys.has('3,1')).toBe(true);
    expect(keys.has('5,3')).toBe(true);
  });

  it('danger zone ignores dead enemies', () => {
    const map = createTestMap(7, 7, GridType.Square);
    const enemy = createUnit({ id: 'e1', team: 'enemy', position: { x: 3, y: 3 }, isAlive: false });
    const danger = calculateDangerZone(map, [enemy]);
    expect(danger).toEqual([]);
  });

  it('danger zone ignores enemies without positions', () => {
    const map = createTestMap(7, 7, GridType.Square);
    const enemy = createUnit({ id: 'e1', team: 'enemy', position: null, isAlive: true });
    const danger = calculateDangerZone(map, [enemy]);
    expect(danger).toEqual([]);
  });

  it('danger zone unions multiple enemies', () => {
    const map = createTestMap(7, 7, GridType.Square);
    const e1 = createUnit({ id: 'e1', team: 'enemy', position: { x: 1, y: 1 } });
    const e2 = createUnit({ id: 'e2', team: 'enemy', position: { x: 5, y: 5 } });

    const danger = calculateDangerZone(map, [e1, e2]);
    const keys = toKeySet(danger);

    expect(keys.has('1,1')).toBe(true);
    expect(keys.has('5,5')).toBe(true);
    expect(keys.size).toBeGreaterThan(10);
  });

  it('movement range returns empty when start is out of bounds', () => {
    const map = createTestMap(5, 5, GridType.Square);
    const range = getMovementRange(map, { x: 99, y: 99 }, 3, MovementType.Foot, []);
    expect(range).toEqual([]);
  });
});
