import { afterEach, describe, expect, it, vi } from 'vitest';
import { TurnPhase } from '../../shared/types';
import { createLogEntry, formatAttackLog } from '../combatLog';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('combatLog.createLogEntry', () => {
  it('creates a log entry with turn, phase, message and timestamp', () => {
    vi.spyOn(Date, 'now').mockReturnValue(123456789);

    const entry = createLogEntry(3, TurnPhase.Player, 'Alden attacks.');

    expect(entry).toEqual({
      turnNumber: 3,
      phase: TurnPhase.Player,
      message: 'Alden attacks.',
      timestamp: 123456789,
    });
  });

  it('captures a new timestamp for each call', () => {
    const nowSpy = vi.spyOn(Date, 'now');
    nowSpy.mockReturnValueOnce(100).mockReturnValueOnce(200);

    const first = createLogEntry(1, TurnPhase.Player, 'first');
    const second = createLogEntry(1, TurnPhase.Player, 'second');

    expect(first.timestamp).toBe(100);
    expect(second.timestamp).toBe(200);
  });

  it('preserves message text exactly', () => {
    const message = 'Unit uses "Blade Storm"!';
    const entry = createLogEntry(2, TurnPhase.Enemy, message);
    expect(entry.message).toBe(message);
  });
});

describe('combatLog.formatAttackLog', () => {
  it('formats miss messages', () => {
    const message = formatAttackLog('Alden', 'Bandit', 0, false, false);
    expect(message).toBe('Alden attacks Bandit but misses!');
  });

  it('formats critical-hit messages', () => {
    const message = formatAttackLog('Alden', 'Bandit', 27, true, true);
    expect(message).toBe('Alden lands a critical hit on Bandit for 27 damage!');
  });

  it('formats normal-hit messages', () => {
    const message = formatAttackLog('Alden', 'Bandit', 9, true, false);
    expect(message).toBe('Alden attacks Bandit for 9 damage.');
  });

  it('prioritizes miss text over crit flag when hit is false', () => {
    const message = formatAttackLog('Alden', 'Bandit', 30, false, true);
    expect(message).toBe('Alden attacks Bandit but misses!');
  });

  it('supports names with spaces', () => {
    const message = formatAttackLog('Sir Rowan', 'Dark Knight', 12, true, false);
    expect(message).toBe('Sir Rowan attacks Dark Knight for 12 damage.');
  });

  it('supports zero-damage hits', () => {
    const message = formatAttackLog('Mage', 'General', 0, true, false);
    expect(message).toBe('Mage attacks General for 0 damage.');
  });
});
