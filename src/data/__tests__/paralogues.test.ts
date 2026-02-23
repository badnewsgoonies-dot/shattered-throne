import { describe, it, expect } from 'vitest';
import { paralogues } from '../paralogues';
import { mapLayouts } from '../mapLayouts';
import { VictoryCondition, DefeatCondition } from '../../shared/types';

describe('Paralogues', () => {
  const mapIds = new Set(mapLayouts.map(m => m.id));

  it('should have 10 paralogues', () => {
    expect(paralogues.length).toBe(10);
  });

  it('should have no duplicate IDs', () => {
    const ids = paralogues.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have valid map references', () => {
    for (const p of paralogues) {
      expect(mapIds.has(p.mapId)).toBe(true);
    }
  });

  it('should have valid victory conditions', () => {
    const validTypes = Object.values(VictoryCondition);
    for (const p of paralogues) {
      expect(p.victoryConditions.length).toBeGreaterThan(0);
      for (const vc of p.victoryConditions) {
        expect(validTypes).toContain(vc.type);
      }
    }
  });

  it('should have valid defeat conditions', () => {
    const validTypes = Object.values(DefeatCondition);
    for (const p of paralogues) {
      expect(p.defeatConditions.length).toBeGreaterThan(0);
      for (const dc of p.defeatConditions) {
        expect(validTypes).toContain(dc.type);
      }
    }
  });

  it('should have enemies', () => {
    for (const p of paralogues) {
      expect(p.enemies.length).toBeGreaterThan(0);
    }
  });

  it('should have titles and descriptions', () => {
    for (const p of paralogues) {
      expect(p.title).toBeTruthy();
      expect(p.description).toBeTruthy();
    }
  });

  it('should have deployment slots', () => {
    for (const p of paralogues) {
      expect(p.deploymentSlots.length).toBeGreaterThan(0);
    }
  });
});
