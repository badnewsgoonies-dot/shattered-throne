import { describe, expect, it } from 'vitest';
import { Element, WeaponType } from '../../shared/types';
import { WEAPONS, getWeaponById, getWeaponsByType } from '../weapons';

function ids(): string[] {
  return WEAPONS.map((weapon) => weapon.id);
}

describe('weapons data', () => {
  it('has at least 80 weapons', () => {
    expect(WEAPONS.length).toBeGreaterThanOrEqual(80);
  });

  it('weapon IDs are unique', () => {
    const unique = new Set(ids());
    expect(unique.size).toBe(WEAPONS.length);
  });

  it('contains all required core weapons by id', () => {
    const required = [
      'iron_sword',
      'steel_sword',
      'silver_sword',
      'brave_sword',
      'killing_edge',
      'armorslayer',
      'wyrmslayer',
      'levin_sword',
      'rapier',
      'slim_sword',
      'runesword',
      'mercurius',
      'iron_lance',
      'steel_lance',
      'silver_lance',
      'brave_lance',
      'killer_lance',
      'horseslayer',
      'javelin',
      'short_spear',
      'gradivus',
      'iron_axe',
      'steel_axe',
      'silver_axe',
      'brave_axe',
      'killer_axe',
      'hammer',
      'hand_axe',
      'tomahawk',
      'hauteclere',
      'devil_axe',
      'iron_bow',
      'steel_bow',
      'silver_bow',
      'killer_bow',
      'longbow',
      'brave_bow',
      'short_bow',
      'parthia',
      'fire',
      'elfire',
      'arcfire',
      'wind',
      'elwind',
      'arcwind',
      'thunder',
      'elthunder',
      'arcthunder',
      'flux',
      'nosferatu',
      'luna',
      'lightning',
      'shine',
      'aura',
      'excalibur',
      'thoron',
      'bolganone',
      'heal_staff',
      'mend_staff',
      'recover_staff',
      'physic_staff',
      'warp_staff',
      'rescue_staff',
      'restore_staff',
      'silence_staff',
      'sleep_staff',
      'fortify_staff',
    ];

    for (const id of required) {
      expect(getWeaponById(id)).not.toBeNull();
    }
  });

  it('weapon type distributions meet category minimums', () => {
    expect(getWeaponsByType(WeaponType.Sword).length).toBeGreaterThanOrEqual(12);
    expect(getWeaponsByType(WeaponType.Lance).length).toBeGreaterThanOrEqual(10);
    expect(getWeaponsByType(WeaponType.Axe).length).toBeGreaterThanOrEqual(10);
    expect(getWeaponsByType(WeaponType.Bow).length).toBeGreaterThanOrEqual(8);
    expect(getWeaponsByType(WeaponType.Staff).length).toBeGreaterThanOrEqual(10);
    const tomeCount =
      getWeaponsByType(WeaponType.FireTome).length +
      getWeaponsByType(WeaponType.WindTome).length +
      getWeaponsByType(WeaponType.ThunderTome).length +
      getWeaponsByType(WeaponType.DarkTome).length +
      getWeaponsByType(WeaponType.LightTome).length;
    expect(tomeCount).toBeGreaterThanOrEqual(18);
  });

  it('iron sword stats match spec', () => {
    expect(getWeaponById('iron_sword')).toMatchObject({
      might: 5,
      hit: 90,
      crit: 0,
      range: { min: 1, max: 1 },
      weight: 5,
      maxDurability: 45,
      cost: 460,
    });
  });

  it('steel sword stats match spec', () => {
    expect(getWeaponById('steel_sword')).toMatchObject({
      might: 8,
      hit: 85,
      crit: 0,
      range: { min: 1, max: 1 },
      weight: 10,
      maxDurability: 30,
      cost: 700,
    });
  });

  it('javelin and hand axe are 1-2 range weapons', () => {
    expect(getWeaponById('javelin')?.range).toEqual({ min: 1, max: 2 });
    expect(getWeaponById('hand_axe')?.range).toEqual({ min: 1, max: 2 });
  });

  it('longbow and parthia reach 3 range', () => {
    expect(getWeaponById('longbow')?.range.max).toBe(3);
    expect(getWeaponById('parthia')?.range.max).toBe(3);
  });

  it('all staff weapons are non-offensive (might/hit/crit = 0)', () => {
    for (const staff of getWeaponsByType(WeaponType.Staff)) {
      expect(staff.might).toBe(0);
      expect(staff.hit).toBe(0);
      expect(staff.crit).toBe(0);
    }
  });

  it('all weapons have valid range and durability', () => {
    for (const weapon of WEAPONS) {
      expect(weapon.range.min).toBeGreaterThanOrEqual(0);
      expect(weapon.range.max).toBeGreaterThanOrEqual(weapon.range.min);
      expect(weapon.maxDurability).toBeGreaterThan(0);
    }
  });

  it('all costs are non-negative', () => {
    for (const weapon of WEAPONS) {
      expect(weapon.cost).toBeGreaterThanOrEqual(0);
    }
  });

  it('elemental tome assignments are present for known tomes', () => {
    expect(getWeaponById('fire')?.element).toBe(Element.Fire);
    expect(getWeaponById('wind')?.element).toBe(Element.Wind);
    expect(getWeaponById('thunder')?.element).toBe(Element.Thunder);
    expect(getWeaponById('flux')?.element).toBe(Element.Dark);
    expect(getWeaponById('shine')?.element).toBe(Element.Light);
  });

  it('special-effect weapons include expected markers', () => {
    expect(getWeaponById('nosferatu')?.specialEffect).toBe('drain');
    expect(getWeaponById('luna')?.specialEffect).toBe('ignoreRes');
    expect(getWeaponById('brave_sword')?.specialEffect).toBe('brave');
  });

  it('legendary regalia have zero shop cost', () => {
    const regalia = ['mercurius', 'gradivus', 'hauteclere', 'parthia', 'excalibur'];
    for (const id of regalia) {
      expect(getWeaponById(id)?.cost).toBe(0);
    }
  });

  it('getter returns null for unknown weapon', () => {
    expect(getWeaponById('no_such_weapon')).toBeNull();
  });
});
