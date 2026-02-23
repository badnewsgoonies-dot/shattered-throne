import { describe, expect, it } from 'vitest';
import { GridType } from '../../shared/types';
import { createGridEngine } from '../gridEngine';

describe('map serialization', () => {
  const engine = createGridEngine();

  it('serializeMap returns a JSON string', () => {
    const map = engine.createGrid(3, 3, GridType.Square);
    const serialized = engine.serializeMap(map);

    expect(typeof serialized).toBe('string');
    expect(serialized.length).toBeGreaterThan(0);
  });

  it('round-trips map through serialize/deserialize', () => {
    const map = engine.createGrid(4, 4, GridType.Square);
    const occupied = engine.setOccupant(map, { x: 2, y: 1 }, 'unit_1');

    const serialized = engine.serializeMap(occupied);
    const deserialized = engine.deserializeMap(serialized);

    expect(deserialized.width).toBe(4);
    expect(deserialized.height).toBe(4);
    expect(deserialized.tiles[1][2].occupantId).toBe('unit_1');
  });

  it('deserializeMap returns a distinct map object', () => {
    const map = engine.createGrid(2, 2, GridType.Square);
    const data = engine.serializeMap(map);
    const parsed = engine.deserializeMap(data);

    expect(parsed).not.toBe(map);
    expect(parsed.tiles).not.toBe(map.tiles);
  });

  it('deserializeMap throws for invalid JSON', () => {
    expect(() => engine.deserializeMap('{invalid_json')).toThrow('Invalid map JSON data');
  });

  it('deserializeMap throws for missing required fields', () => {
    const bad = JSON.stringify({ id: 'x', width: 2, height: 2 });
    expect(() => engine.deserializeMap(bad)).toThrow('Invalid GridMap structure');
  });

  it('deserializeMap throws for malformed tile terrain data', () => {
    const map = engine.createGrid(2, 2, GridType.Square);
    const raw = JSON.parse(engine.serializeMap(map));
    raw.tiles[0][0].terrain.movementCost.foot = 'bad';

    expect(() => engine.deserializeMap(JSON.stringify(raw))).toThrow('Invalid GridMap structure');
  });

  it('deserializeMap throws when tile rows do not match map width', () => {
    const map = engine.createGrid(3, 3, GridType.Square);
    const raw = JSON.parse(engine.serializeMap(map));
    raw.tiles[1].pop();

    expect(() => engine.deserializeMap(JSON.stringify(raw))).toThrow('Invalid GridMap structure');
  });

  it('deserializeMap keeps deployment zones and metadata', () => {
    const map = engine.createGrid(3, 3, GridType.Square);
    map.deploymentZones = [{ x: 0, y: 0 }];
    map.tiles[0][0].isDeploymentZone = true;

    const parsed = engine.deserializeMap(engine.serializeMap(map));

    expect(parsed.deploymentZones).toEqual([{ x: 0, y: 0 }]);
    expect(parsed.tiles[0][0].isDeploymentZone).toBe(true);
  });

  it('deserializeMap rejects invalid gridType values', () => {
    const map = engine.createGrid(2, 2, GridType.Square);
    const raw = JSON.parse(engine.serializeMap(map));
    raw.gridType = 'triangle';

    expect(() => engine.deserializeMap(JSON.stringify(raw))).toThrow('Invalid GridMap structure');
  });
});
