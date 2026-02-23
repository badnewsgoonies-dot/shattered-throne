import { describe, expect, it } from 'vitest';
import { StatusEffectType } from '../../shared/types';
import {
  deserializeUnit,
  serializeUnit,
} from '../unitSerializer';
import { makeUnit } from './testUtils';

describe('unitSerializer', () => {
  it('serializeUnit returns valid JSON string', () => {
    const unit = makeUnit({ id: 'unit_serialize' });

    const data = serializeUnit(unit);

    expect(typeof data).toBe('string');
    expect(data).toContain('unit_serialize');
  });

  it('deserializeUnit round-trips unit data', () => {
    const unit = makeUnit({ id: 'round_trip', currentHP: 18, supportPoints: { ally: 10 } });

    const restored = deserializeUnit(serializeUnit(unit));

    expect(restored).toEqual(unit);
  });

  it('throws for invalid JSON payload', () => {
    expect(() => deserializeUnit('{not valid json}')).toThrow('Invalid unit JSON data');
  });

  it('throws when required id field is missing', () => {
    const payload = JSON.stringify({ name: 'No ID' });

    expect(() => deserializeUnit(payload)).toThrow('Invalid unit data: missing required fields');
  });

  it('throws when inventory field is missing', () => {
    const unit = makeUnit();
    const parsed = JSON.parse(serializeUnit(unit)) as Record<string, unknown>;
    delete parsed.inventory;

    expect(() => deserializeUnit(JSON.stringify(parsed))).toThrow('Invalid unit data: missing required fields');
  });

  it('throws when currentStats field is missing', () => {
    const unit = makeUnit();
    const parsed = JSON.parse(serializeUnit(unit)) as Record<string, unknown>;
    delete parsed.currentStats;

    expect(() => deserializeUnit(JSON.stringify(parsed))).toThrow('Invalid unit data: missing required fields');
  });

  it('supports units with optional aiBehavior omitted', () => {
    const unit = makeUnit({ aiBehavior: undefined });

    const restored = deserializeUnit(serializeUnit(unit));

    expect(restored.aiBehavior).toBeUndefined();
  });

  it('preserves nested arrays and records', () => {
    const unit = makeUnit({
      activeStatusEffects: [{ type: StatusEffectType.Poison, remainingTurns: 2, sourceUnitId: 'enemy_1' }],
      supportRanks: { ally_1: 'B' as const },
      supportPoints: { ally_1: 45 },
      inventory: {
        items: [
          { instanceId: 'inst_1', dataId: 'iron_sword', currentDurability: 20 },
          null,
          null,
          null,
          null,
        ],
        equippedWeaponIndex: 0,
        equippedArmor: {
          head: null,
          chest: null,
          boots: null,
          accessory: null,
        },
      },
    });

    const restored = deserializeUnit(serializeUnit(unit));

    expect(restored.activeStatusEffects).toEqual(unit.activeStatusEffects);
    expect(restored.supportRanks).toEqual(unit.supportRanks);
    expect(restored.supportPoints).toEqual(unit.supportPoints);
    expect(restored.inventory).toEqual(unit.inventory);
  });

  it('throws when skills is not an array', () => {
    const unit = makeUnit();
    const parsed = JSON.parse(serializeUnit(unit)) as Record<string, unknown>;
    parsed.skills = 'not-an-array';

    expect(() => deserializeUnit(JSON.stringify(parsed))).toThrow('Invalid unit data: missing required fields');
  });
});
