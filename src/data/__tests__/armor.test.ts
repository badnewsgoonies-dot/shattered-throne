import { describe, expect, it } from 'vitest';
import { ArmorSlot } from '../../shared/types';
import { ARMOR, getArmorById, getArmorBySlot } from '../armor';

describe('armor data', () => {
  it('has at least 40 armor pieces', () => {
    expect(ARMOR.length).toBeGreaterThanOrEqual(40);
  });

  it('armor IDs are unique', () => {
    const ids = ARMOR.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('contains all 4 slots', () => {
    expect(getArmorBySlot(ArmorSlot.Head).length).toBeGreaterThan(0);
    expect(getArmorBySlot(ArmorSlot.Chest).length).toBeGreaterThan(0);
    expect(getArmorBySlot(ArmorSlot.Boots).length).toBeGreaterThan(0);
    expect(getArmorBySlot(ArmorSlot.Accessory).length).toBeGreaterThan(0);
  });

  it('has at least 10 pieces per slot', () => {
    expect(getArmorBySlot(ArmorSlot.Head).length).toBeGreaterThanOrEqual(10);
    expect(getArmorBySlot(ArmorSlot.Chest).length).toBeGreaterThanOrEqual(10);
    expect(getArmorBySlot(ArmorSlot.Boots).length).toBeGreaterThanOrEqual(10);
    expect(getArmorBySlot(ArmorSlot.Accessory).length).toBeGreaterThanOrEqual(10);
  });

  it('iron helm matches spec', () => {
    expect(getArmorById('iron_helm')).toMatchObject({
      slot: ArmorSlot.Head,
      defense: 2,
      resistance: 0,
      weight: 3,
      speedPenalty: 0,
      cost: 300,
    });
  });

  it('steel helm matches spec', () => {
    expect(getArmorById('steel_helm')).toMatchObject({
      defense: 4,
      resistance: 0,
      weight: 5,
      speedPenalty: 1,
      cost: 600,
    });
  });

  it('silver helm matches spec', () => {
    expect(getArmorById('silver_helm')).toMatchObject({
      defense: 6,
      resistance: 1,
      weight: 4,
      speedPenalty: 0,
      cost: 1200,
    });
  });

  it('mage hat and holy crown match spec anchors', () => {
    expect(getArmorById('mage_hat')).toMatchObject({ defense: 0, resistance: 3, weight: 1, cost: 400 });
    expect(getArmorById('holy_crown')).toMatchObject({ defense: 1, resistance: 5, weight: 2, cost: 1000 });
  });

  it('contains iron/steel/silver set IDs', () => {
    const setIds = new Set(ARMOR.map((entry) => entry.setId).filter((value): value is string => Boolean(value)));
    expect(setIds.has('iron_set')).toBe(true);
    expect(setIds.has('steel_set')).toBe(true);
    expect(setIds.has('silver_set')).toBe(true);
  });

  it('all costs are positive', () => {
    for (const armor of ARMOR) {
      expect(armor.cost).toBeGreaterThan(0);
    }
  });

  it('speed ring provides a speed boost via negative penalty', () => {
    expect(getArmorById('speed_ring')?.speedPenalty).toBeLessThan(0);
  });

  it('getter returns null for unknown armor', () => {
    expect(getArmorById('unknown_armor')).toBeNull();
  });
});
