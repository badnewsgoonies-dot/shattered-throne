import { describe, expect, it } from 'vitest';
import { StatusEffectType } from '../../shared/types';
import { CONSUMABLES, getConsumableById } from '../consumables';

describe('consumables data', () => {
  it('has at least 20 consumables', () => {
    expect(CONSUMABLES.length).toBeGreaterThanOrEqual(20);
  });

  it('consumable IDs are unique', () => {
    const ids = CONSUMABLES.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('vulnerary matches spec', () => {
    const vulnerary = getConsumableById('vulnerary');
    expect(vulnerary?.effect).toMatchObject({ type: 'heal', healAmount: 10 });
    expect(vulnerary?.uses).toBe(3);
    expect(vulnerary?.cost).toBe(300);
  });

  it('concoction matches spec', () => {
    const concoction = getConsumableById('concoction');
    expect(concoction?.effect).toMatchObject({ type: 'heal', healAmount: 20 });
    expect(concoction?.uses).toBe(3);
    expect(concoction?.cost).toBe(600);
  });

  it('elixir is full-heal and 3 uses', () => {
    const elixir = getConsumableById('elixir');
    expect(elixir?.effect).toMatchObject({ type: 'heal', fullHeal: true });
    expect(elixir?.uses).toBe(3);
    expect(elixir?.cost).toBe(2000);
  });

  it('antidote cures poison', () => {
    const antidote = getConsumableById('antidote');
    expect(antidote?.effect).toMatchObject({ type: 'cureStatus', cureStatus: StatusEffectType.Poison });
    expect(antidote?.cost).toBe(100);
  });

  it('pure water grants temporary resistance boost', () => {
    const pureWater = getConsumableById('pure_water');
    expect(pureWater?.effect).toMatchObject({ type: 'statBoost', statBoost: { resistance: 7 } });
    expect(pureWater?.uses).toBe(1);
  });

  it('all permanent boosters are 1 use and permanent', () => {
    const permanentIds = [
      'energy_drop',
      'spirit_dust',
      'secret_book',
      'speedwing',
      'goddess_icon',
      'dracoshield',
      'talisman',
      'boots_item',
    ];

    for (const id of permanentIds) {
      const item = getConsumableById(id);
      expect(item?.uses).toBe(1);
      expect(item?.effect.type).toBe('statBoost');
      if (item?.effect.type === 'statBoost') {
        expect(item.effect.permanent).toBe(true);
      }
    }
  });

  it('key items exist with expected uses', () => {
    expect(getConsumableById('door_key')?.effect.type).toBe('key');
    expect(getConsumableById('door_key')?.uses).toBe(1);

    expect(getConsumableById('chest_key')?.effect.type).toBe('key');
    expect(getConsumableById('chest_key')?.uses).toBe(1);

    expect(getConsumableById('master_key')?.effect.type).toBe('key');
    expect(getConsumableById('master_key')?.uses).toBe(5);
  });

  it('torch is a special utility item with 3 uses', () => {
    const torch = getConsumableById('torch');
    expect(torch?.effect.type).toBe('special');
    expect(torch?.uses).toBe(3);
    expect(torch?.cost).toBe(300);
  });

  it('getter returns null for unknown consumable', () => {
    expect(getConsumableById('unknown_consumable')).toBeNull();
  });
});
