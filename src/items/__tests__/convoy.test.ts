import { describe, it, expect } from 'vitest';
import { addToConvoy, removeFromConvoy } from '../convoyManager';
import { makeItemInstance } from './helpers';

describe('Convoy Manager', () => {
  describe('addToConvoy', () => {
    it('should add item to empty convoy', () => {
      const item = makeItemInstance({ instanceId: 'c1' });
      const result = addToConvoy([], item);
      expect(result).toHaveLength(1);
      expect(result[0].instanceId).toBe('c1');
    });

    it('should append to existing convoy', () => {
      const existing = makeItemInstance({ instanceId: 'c1' });
      const newItem = makeItemInstance({ instanceId: 'c2' });
      const result = addToConvoy([existing], newItem);
      expect(result).toHaveLength(2);
      expect(result[1].instanceId).toBe('c2');
    });

    it('should not have a size limit', () => {
      let convoy: ReturnType<typeof makeItemInstance>[] = [];
      for (let i = 0; i < 100; i++) {
        convoy = addToConvoy(convoy, makeItemInstance({ instanceId: `item-${i}` }));
      }
      expect(convoy).toHaveLength(100);
    });

    it('should be immutable', () => {
      const original = [makeItemInstance({ instanceId: 'c1' })];
      const result = addToConvoy(original, makeItemInstance({ instanceId: 'c2' }));
      expect(result).not.toBe(original);
      expect(original).toHaveLength(1);
    });
  });

  describe('removeFromConvoy', () => {
    it('should remove item by instanceId', () => {
      const items = [
        makeItemInstance({ instanceId: 'c1' }),
        makeItemInstance({ instanceId: 'c2' }),
        makeItemInstance({ instanceId: 'c3' }),
      ];
      const result = removeFromConvoy(items, 'c2');
      expect(result.convoy).toHaveLength(2);
      expect(result.item?.instanceId).toBe('c2');
    });

    it('should return null item if not found', () => {
      const items = [makeItemInstance({ instanceId: 'c1' })];
      const result = removeFromConvoy(items, 'nonexistent');
      expect(result.item).toBeNull();
      expect(result.convoy).toHaveLength(1);
    });

    it('should return empty convoy when removing last item', () => {
      const items = [makeItemInstance({ instanceId: 'c1' })];
      const result = removeFromConvoy(items, 'c1');
      expect(result.convoy).toHaveLength(0);
      expect(result.item?.instanceId).toBe('c1');
    });

    it('should be immutable', () => {
      const original = [makeItemInstance({ instanceId: 'c1' }), makeItemInstance({ instanceId: 'c2' })];
      const result = removeFromConvoy(original, 'c1');
      expect(result.convoy).not.toBe(original);
      expect(original).toHaveLength(2);
    });

    it('should return from empty convoy', () => {
      const result = removeFromConvoy([], 'c1');
      expect(result.item).toBeNull();
      expect(result.convoy).toHaveLength(0);
    });

    it('should preserve order of remaining items', () => {
      const items = [
        makeItemInstance({ instanceId: 'a' }),
        makeItemInstance({ instanceId: 'b' }),
        makeItemInstance({ instanceId: 'c' }),
      ];
      const result = removeFromConvoy(items, 'b');
      expect(result.convoy[0].instanceId).toBe('a');
      expect(result.convoy[1].instanceId).toBe('c');
    });
  });
});
