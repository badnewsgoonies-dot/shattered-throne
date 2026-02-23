import { describe, it, expect } from 'vitest';
import { addGold, removeGold, hasEnoughGold, createEconomyState } from '../economyManager';

describe('Economy Manager', () => {
  describe('createEconomyState', () => {
    it('should create state with default gold of 0', () => {
      const state = createEconomyState();
      expect(state.gold).toBe(0);
    });

    it('should create state with specified initial gold', () => {
      const state = createEconomyState(500);
      expect(state.gold).toBe(500);
    });
  });

  describe('addGold', () => {
    it('should add gold to state', () => {
      const state = createEconomyState(100);
      const result = addGold(state, 50);
      expect(result.gold).toBe(150);
    });

    it('should not mutate original state', () => {
      const state = createEconomyState(100);
      addGold(state, 50);
      expect(state.gold).toBe(100);
    });

    it('should handle adding zero gold', () => {
      const state = createEconomyState(100);
      const result = addGold(state, 0);
      expect(result.gold).toBe(100);
    });

    it('should handle large amounts', () => {
      const state = createEconomyState(0);
      const result = addGold(state, 999999);
      expect(result.gold).toBe(999999);
    });

    it('should accumulate from multiple adds', () => {
      let state = createEconomyState(0);
      state = addGold(state, 100);
      state = addGold(state, 200);
      state = addGold(state, 300);
      expect(state.gold).toBe(600);
    });
  });

  describe('removeGold', () => {
    it('should remove gold from state', () => {
      const state = createEconomyState(200);
      const result = removeGold(state, 50);
      expect(result.gold).toBe(150);
    });

    it('should not mutate original state', () => {
      const state = createEconomyState(200);
      removeGold(state, 50);
      expect(state.gold).toBe(200);
    });

    it('should throw on insufficient gold', () => {
      const state = createEconomyState(50);
      expect(() => removeGold(state, 100)).toThrow('Insufficient gold');
    });

    it('should allow removing exact amount', () => {
      const state = createEconomyState(100);
      const result = removeGold(state, 100);
      expect(result.gold).toBe(0);
    });

    it('should handle removing zero gold', () => {
      const state = createEconomyState(100);
      const result = removeGold(state, 0);
      expect(result.gold).toBe(100);
    });
  });

  describe('hasEnoughGold', () => {
    it('should return true when gold is sufficient', () => {
      const state = createEconomyState(100);
      expect(hasEnoughGold(state, 50)).toBe(true);
    });

    it('should return true when gold is exactly enough', () => {
      const state = createEconomyState(100);
      expect(hasEnoughGold(state, 100)).toBe(true);
    });

    it('should return false when gold is insufficient', () => {
      const state = createEconomyState(50);
      expect(hasEnoughGold(state, 100)).toBe(false);
    });

    it('should return true for zero amount', () => {
      const state = createEconomyState(0);
      expect(hasEnoughGold(state, 0)).toBe(true);
    });
  });
});
