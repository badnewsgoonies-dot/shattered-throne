import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SoundEffectType, SoundRequest } from '../../shared/types';
import { createSoundQueue } from '../soundQueue';

describe('createSoundQueue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('plays a single request immediately', () => {
    const playSFX = vi.fn();
    const queue = createSoundQueue(playSFX);
    const request: SoundRequest = { type: SoundEffectType.MenuSelect };

    queue.enqueue([request]);

    expect(playSFX).toHaveBeenCalledTimes(1);
    expect(playSFX).toHaveBeenLastCalledWith(request);
  });

  it('processes queued requests in order with 100ms spacing', () => {
    const playSFX = vi.fn();
    const queue = createSoundQueue(playSFX);
    const requests: SoundRequest[] = [
      { type: SoundEffectType.SwordSwing },
      { type: SoundEffectType.ArrowFire },
      { type: SoundEffectType.Heal },
    ];

    queue.enqueue(requests);

    expect(playSFX).toHaveBeenCalledTimes(1);
    expect(playSFX).toHaveBeenNthCalledWith(1, requests[0]);

    vi.advanceTimersByTime(99);
    expect(playSFX).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1);
    expect(playSFX).toHaveBeenCalledTimes(2);
    expect(playSFX).toHaveBeenNthCalledWith(2, requests[1]);

    vi.advanceTimersByTime(100);
    expect(playSFX).toHaveBeenCalledTimes(3);
    expect(playSFX).toHaveBeenNthCalledWith(3, requests[2]);
  });

  it('does nothing when enqueue is called with an empty array', () => {
    const playSFX = vi.fn();
    const queue = createSoundQueue(playSFX);

    queue.enqueue([]);
    vi.advanceTimersByTime(500);

    expect(playSFX).not.toHaveBeenCalled();
  });

  it('appends new requests while processing', () => {
    const playSFX = vi.fn();
    const queue = createSoundQueue(playSFX);
    const firstBatch: SoundRequest[] = [
      { type: SoundEffectType.Miss },
      { type: SoundEffectType.HitImpact },
    ];
    const secondBatch: SoundRequest[] = [{ type: SoundEffectType.LevelUp }];

    queue.enqueue(firstBatch);
    expect(playSFX).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(50);
    queue.enqueue(secondBatch);

    vi.advanceTimersByTime(50);
    expect(playSFX).toHaveBeenCalledTimes(2);
    expect(playSFX).toHaveBeenNthCalledWith(2, firstBatch[1]);

    vi.advanceTimersByTime(100);
    expect(playSFX).toHaveBeenCalledTimes(3);
    expect(playSFX).toHaveBeenNthCalledWith(3, secondBatch[0]);
  });

  it('does not trigger the next sound before the full gap elapses', () => {
    const playSFX = vi.fn();
    const queue = createSoundQueue(playSFX);

    queue.enqueue([
      { type: SoundEffectType.CursorMove },
      { type: SoundEffectType.CursorMove },
    ]);

    expect(playSFX).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(99);
    expect(playSFX).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1);
    expect(playSFX).toHaveBeenCalledTimes(2);
  });

  it('starts immediately again after a queue drain', () => {
    const playSFX = vi.fn();
    const queue = createSoundQueue(playSFX);

    const firstRequest: SoundRequest = { type: SoundEffectType.MenuSelect };
    const secondRequest: SoundRequest = { type: SoundEffectType.Death };

    queue.enqueue([firstRequest]);
    expect(playSFX).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);

    queue.enqueue([secondRequest]);

    expect(playSFX).toHaveBeenCalledTimes(2);
    expect(playSFX).toHaveBeenNthCalledWith(2, secondRequest);
  });

  it('forwards request payloads unchanged', () => {
    const playSFX = vi.fn();
    const queue = createSoundQueue(playSFX);
    const request: SoundRequest = {
      type: SoundEffectType.CriticalHit,
      volume: 0.35,
    };

    queue.enqueue([request]);

    expect(playSFX).toHaveBeenCalledWith({
      type: SoundEffectType.CriticalHit,
      volume: 0.35,
    });
  });

  it('handles longer batches without dropping any requests', () => {
    const playSFX = vi.fn();
    const queue = createSoundQueue(playSFX);
    const requests: SoundRequest[] = [
      { type: SoundEffectType.MenuSelect },
      { type: SoundEffectType.CursorMove },
      { type: SoundEffectType.Miss },
      { type: SoundEffectType.Heal },
      { type: SoundEffectType.LevelUp },
      { type: SoundEffectType.Death },
    ];

    queue.enqueue(requests);
    vi.advanceTimersByTime(100 * requests.length);

    expect(playSFX).toHaveBeenCalledTimes(requests.length);
    expect(playSFX.mock.calls.map((call) => call[0])).toEqual(requests);
  });
});
