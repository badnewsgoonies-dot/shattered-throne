import { describe, expect, it } from 'vitest';
import {
  addGold,
  removeGold,
} from '../economyManager';

describe('economyManager', () => {
  it('addGold increases current gold by amount', () => {
    expect(addGold(100, 50)).toBe(150);
  });

  it('addGold supports zero amount', () => {
    expect(addGold(200, 0)).toBe(200);
  });

  it('addGold supports negative amount values', () => {
    expect(addGold(200, -30)).toBe(170);
  });

  it('addGold works with large values', () => {
    expect(addGold(1_000_000, 250_000)).toBe(1_250_000);
  });

  it('removeGold succeeds when enough gold is available', () => {
    expect(removeGold(300, 120)).toEqual({ gold: 180, success: true });
  });

  it('removeGold succeeds when spending exact remaining gold', () => {
    expect(removeGold(75, 75)).toEqual({ gold: 0, success: true });
  });

  it('removeGold fails and preserves gold when funds are insufficient', () => {
    expect(removeGold(50, 51)).toEqual({ gold: 50, success: false });
  });

  it('removeGold handles zero-cost spend as success', () => {
    expect(removeGold(40, 0)).toEqual({ gold: 40, success: true });
  });

  it('removeGold fails correctly when current gold is zero', () => {
    expect(removeGold(0, 1)).toEqual({ gold: 0, success: false });
  });

  it('removeGold mirrors arithmetic for negative spend amount', () => {
    expect(removeGold(100, -10)).toEqual({ gold: 110, success: true });
  });
});
