import { describe, expect, it } from 'vitest';
import { addToConvoy, removeFromConvoy } from '../convoyManager';
import { makeItemInstance } from './testUtils';

describe('convoyManager', () => {
  it('adds an item to an empty convoy', () => {
    const item = makeItemInstance('test_sword');

    const result = addToConvoy([], item);

    expect(result).toEqual([item]);
  });

  it('appends items to the end of convoy', () => {
    const first = makeItemInstance('test_sword');
    const second = makeItemInstance('test_helm');

    const result = addToConvoy([first], second);

    expect(result).toEqual([first, second]);
  });

  it('does not mutate original convoy when adding', () => {
    const first = makeItemInstance('test_sword');
    const convoy = [first];

    const result = addToConvoy(convoy, makeItemInstance('test_staff'));

    expect(result).not.toBe(convoy);
    expect(convoy).toEqual([first]);
  });

  it('removes an item by matching instanceId', () => {
    const first = makeItemInstance('test_sword');
    const second = makeItemInstance('test_helm');

    const result = removeFromConvoy([first, second], second.instanceId);

    expect(result.item).toEqual(second);
    expect(result.convoy).toEqual([first]);
  });

  it('removes first item correctly', () => {
    const first = makeItemInstance('test_sword');
    const second = makeItemInstance('test_helm');

    const result = removeFromConvoy([first, second], first.instanceId);

    expect(result.item).toEqual(first);
    expect(result.convoy).toEqual([second]);
  });

  it('removes middle item correctly', () => {
    const first = makeItemInstance('test_sword');
    const second = makeItemInstance('test_helm');
    const third = makeItemInstance('test_staff');

    const result = removeFromConvoy([first, second, third], second.instanceId);

    expect(result.item).toEqual(second);
    expect(result.convoy).toEqual([first, third]);
  });

  it('returns original convoy and null item when id is not found', () => {
    const first = makeItemInstance('test_sword');
    const convoy = [first];

    const result = removeFromConvoy(convoy, 'missing_id');

    expect(result.item).toBeNull();
    expect(result.convoy).toBe(convoy);
  });

  it('handles removal from empty convoy', () => {
    const convoy: ReturnType<typeof addToConvoy> = [];

    const result = removeFromConvoy(convoy, 'missing_id');

    expect(result.item).toBeNull();
    expect(result.convoy).toEqual([]);
  });
});
