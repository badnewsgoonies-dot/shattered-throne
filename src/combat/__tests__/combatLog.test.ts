import { describe, it, expect } from 'vitest';
import {
  createLogEntry,
  logAttack,
  logMiss,
  logCritical,
  logHeal,
  logDefeat,
  logSkillUse,
} from '../combatLog';
import { TurnPhase } from '../../shared/types';

describe('combatLog', () => {
  describe('createLogEntry', () => {
    it('creates a log entry with correct fields', () => {
      const entry = createLogEntry(1, TurnPhase.Player, 'Test message');
      expect(entry.turnNumber).toBe(1);
      expect(entry.phase).toBe(TurnPhase.Player);
      expect(entry.message).toBe('Test message');
      expect(entry.timestamp).toBeGreaterThan(0);
    });

    it('uses current timestamp', () => {
      const before = Date.now();
      const entry = createLogEntry(1, TurnPhase.Player, 'msg');
      const after = Date.now();
      expect(entry.timestamp).toBeGreaterThanOrEqual(before);
      expect(entry.timestamp).toBeLessThanOrEqual(after);
    });

    it('supports enemy phase', () => {
      const entry = createLogEntry(3, TurnPhase.Enemy, 'Enemy action');
      expect(entry.phase).toBe(TurnPhase.Enemy);
      expect(entry.turnNumber).toBe(3);
    });

    it('supports ally NPC phase', () => {
      const entry = createLogEntry(2, TurnPhase.AllyNPC, 'Ally action');
      expect(entry.phase).toBe(TurnPhase.AllyNPC);
    });
  });

  describe('logAttack', () => {
    it('formats attack message correctly', () => {
      const entry = logAttack(1, TurnPhase.Player, 'Eirika', 'Bandit', 12);
      expect(entry.message).toBe('Eirika attacks Bandit for 12 damage');
    });

    it('handles 0 damage attacks', () => {
      const entry = logAttack(1, TurnPhase.Player, 'Eirika', 'General', 0);
      expect(entry.message).toBe('Eirika attacks General for 0 damage');
    });

    it('preserves turn number', () => {
      const entry = logAttack(5, TurnPhase.Enemy, 'Bandit', 'Eirika', 8);
      expect(entry.turnNumber).toBe(5);
      expect(entry.phase).toBe(TurnPhase.Enemy);
    });
  });

  describe('logMiss', () => {
    it('formats miss message correctly', () => {
      const entry = logMiss(1, TurnPhase.Player, 'Eirika', 'Bandit');
      expect(entry.message).toBe('Eirika misses Bandit');
    });

    it('works for enemy phase', () => {
      const entry = logMiss(2, TurnPhase.Enemy, 'Mage', 'Knight');
      expect(entry.message).toBe('Mage misses Knight');
      expect(entry.phase).toBe(TurnPhase.Enemy);
    });
  });

  describe('logCritical', () => {
    it('formats critical hit message correctly', () => {
      const entry = logCritical(1, TurnPhase.Player, 'Eirika', 'Bandit', 36);
      expect(entry.message).toBe('Eirika lands a critical hit on Bandit for 36 damage');
    });
  });

  describe('logHeal', () => {
    it('formats heal message correctly', () => {
      const entry = logHeal(1, TurnPhase.Player, 'Cleric', 'Warrior', 15);
      expect(entry.message).toBe('Cleric heals Warrior for 15 HP');
    });

    it('handles large heals', () => {
      const entry = logHeal(3, TurnPhase.AllyNPC, 'Sage', 'Paladin', 30);
      expect(entry.message).toBe('Sage heals Paladin for 30 HP');
    });
  });

  describe('logDefeat', () => {
    it('formats defeat message correctly', () => {
      const entry = logDefeat(2, TurnPhase.Player, 'Bandit');
      expect(entry.message).toBe('Bandit is defeated');
    });

    it('works for player unit defeat', () => {
      const entry = logDefeat(3, TurnPhase.Enemy, 'Eirika');
      expect(entry.message).toBe('Eirika is defeated');
    });
  });

  describe('logSkillUse', () => {
    it('formats skill use message correctly', () => {
      const entry = logSkillUse(1, TurnPhase.Player, 'Mage', 'Fireball');
      expect(entry.message).toBe('Mage uses Fireball');
    });
  });

  describe('consistency', () => {
    it('all log functions return CombatLogEntry shape', () => {
      const entries = [
        logAttack(1, TurnPhase.Player, 'A', 'B', 10),
        logMiss(1, TurnPhase.Player, 'A', 'B'),
        logCritical(1, TurnPhase.Player, 'A', 'B', 30),
        logHeal(1, TurnPhase.Player, 'A', 'B', 15),
        logDefeat(1, TurnPhase.Player, 'A'),
        logSkillUse(1, TurnPhase.Player, 'A', 'Skill'),
      ];
      for (const entry of entries) {
        expect(entry).toHaveProperty('turnNumber');
        expect(entry).toHaveProperty('phase');
        expect(entry).toHaveProperty('message');
        expect(entry).toHaveProperty('timestamp');
        expect(typeof entry.message).toBe('string');
        expect(typeof entry.timestamp).toBe('number');
      }
    });
  });
});
