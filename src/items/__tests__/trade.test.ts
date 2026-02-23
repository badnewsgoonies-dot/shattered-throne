import { describe, expect, it } from 'vitest';
import { tradeItems } from '../tradeSystem';
import { makeItemInstance, makeUnit } from './testUtils';

describe('tradeSystem.tradeItems', () => {
  it('swaps two non-null items between units', () => {
    const sword = makeItemInstance('test_sword');
    const bow = makeItemInstance('test_bow');
    const unitA = makeUnit({ inventory: { items: [sword, null, null, null, null] } });
    const unitB = makeUnit({ inventory: { items: [bow, null, null, null, null] }, id: 'unit_2' });

    const result = tradeItems(unitA, unitB, 0, 0);

    expect(result.unitA.inventory.items[0]).toEqual(bow);
    expect(result.unitB.inventory.items[0]).toEqual(sword);
  });

  it('handles trading when unit A slot is null', () => {
    const bow = makeItemInstance('test_bow');
    const unitA = makeUnit({ inventory: { items: [null, null, null, null, null] } });
    const unitB = makeUnit({ inventory: { items: [bow, null, null, null, null] }, id: 'unit_2' });

    const result = tradeItems(unitA, unitB, 0, 0);

    expect(result.unitA.inventory.items[0]).toEqual(bow);
    expect(result.unitB.inventory.items[0]).toBeNull();
  });

  it('handles trading when unit B slot is null', () => {
    const sword = makeItemInstance('test_sword');
    const unitA = makeUnit({ inventory: { items: [sword, null, null, null, null] } });
    const unitB = makeUnit({ inventory: { items: [null, null, null, null, null] }, id: 'unit_2' });

    const result = tradeItems(unitA, unitB, 0, 0);

    expect(result.unitA.inventory.items[0]).toBeNull();
    expect(result.unitB.inventory.items[0]).toEqual(sword);
  });

  it('handles swapping null with null', () => {
    const unitA = makeUnit();
    const unitB = makeUnit({ id: 'unit_2' });

    const result = tradeItems(unitA, unitB, 1, 2);

    expect(result.unitA.inventory.items[1]).toBeNull();
    expect(result.unitB.inventory.items[2]).toBeNull();
  });

  it('does not mutate original unit inventories', () => {
    const sword = makeItemInstance('test_sword');
    const bow = makeItemInstance('test_bow');
    const unitA = makeUnit({ inventory: { items: [sword, null, null, null, null] } });
    const unitB = makeUnit({ inventory: { items: [bow, null, null, null, null] }, id: 'unit_2' });

    void tradeItems(unitA, unitB, 0, 0);

    expect(unitA.inventory.items[0]).toEqual(sword);
    expect(unitB.inventory.items[0]).toEqual(bow);
  });

  it('returns new inventory arrays for both units', () => {
    const sword = makeItemInstance('test_sword');
    const bow = makeItemInstance('test_bow');
    const unitA = makeUnit({ inventory: { items: [sword, null, null, null, null] } });
    const unitB = makeUnit({ inventory: { items: [bow, null, null, null, null] }, id: 'unit_2' });

    const result = tradeItems(unitA, unitB, 0, 0);

    expect(result.unitA.inventory.items).not.toBe(unitA.inventory.items);
    expect(result.unitB.inventory.items).not.toBe(unitB.inventory.items);
  });

  it('returns unchanged units for invalid indexA', () => {
    const unitA = makeUnit({ inventory: { items: [makeItemInstance('test_sword'), null, null, null, null] } });
    const unitB = makeUnit({ id: 'unit_2', inventory: { items: [makeItemInstance('test_bow'), null, null, null, null] } });

    const result = tradeItems(unitA, unitB, -1, 0);

    expect(result.unitA).toBe(unitA);
    expect(result.unitB).toBe(unitB);
  });

  it('returns unchanged units for invalid indexB', () => {
    const unitA = makeUnit({ inventory: { items: [makeItemInstance('test_sword'), null, null, null, null] } });
    const unitB = makeUnit({ id: 'unit_2', inventory: { items: [makeItemInstance('test_bow'), null, null, null, null] } });

    const result = tradeItems(unitA, unitB, 0, 5);

    expect(result.unitA).toBe(unitA);
    expect(result.unitB).toBe(unitB);
  });
});
