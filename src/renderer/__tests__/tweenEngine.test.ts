import { describe, expect, it } from 'vitest';
import { Easing, createTween } from '../tweenEngine';

describe('tweenEngine', () => {
  it('starts at from value before updates', () => {
    const tween = createTween(2, 10, 1);
    expect(tween.value).toBe(2);
  });

  it('linearly interpolates after half duration', () => {
    const tween = createTween(0, 100, 2);
    const v = tween.update(1);
    expect(v).toBe(50);
  });

  it('reaches target at full duration', () => {
    const tween = createTween(0, 100, 2);
    const v = tween.update(2);
    expect(v).toBe(100);
  });

  it('clamps value to target after completion', () => {
    const tween = createTween(0, 10, 1);
    tween.update(2);
    expect(tween.value).toBe(10);
  });

  it('easeIn progresses slower than linear at halfway', () => {
    const tween = createTween(0, 1, 1, Easing.easeIn);
    const v = tween.update(0.5);
    expect(v).toBeCloseTo(0.25);
  });

  it('easeOut progresses faster than linear at halfway', () => {
    const tween = createTween(0, 1, 1, Easing.easeOut);
    const v = tween.update(0.5);
    expect(v).toBeCloseTo(0.75);
  });

  it('easeInOut quarter progress matches expected curve', () => {
    const tween = createTween(0, 1, 1, Easing.easeInOut);
    const v = tween.update(0.25);
    expect(v).toBeCloseTo(0.125);
  });

  it('easeInOut three-quarter progress matches expected curve', () => {
    const tween = createTween(0, 1, 1, Easing.easeInOut);
    const v = tween.update(0.75);
    expect(v).toBeCloseTo(0.875);
  });

  it('reports completion state only after duration reached', () => {
    const tween = createTween(0, 10, 1);
    expect(tween.isComplete).toBe(false);
    tween.update(0.999);
    expect(tween.isComplete).toBe(false);
    tween.update(0.001);
    expect(tween.isComplete).toBe(true);
  });

  it('handles large dt in a single update', () => {
    const tween = createTween(5, 8, 0.5);
    const v = tween.update(4);
    expect(v).toBe(8);
    expect(tween.isComplete).toBe(true);
  });

  it('handles zero duration by completing immediately', () => {
    const tween = createTween(1, 9, 0);
    expect(tween.isComplete).toBe(true);
    expect(tween.value).toBe(9);
  });

  it('ignores negative dt updates', () => {
    const tween = createTween(0, 10, 1);
    tween.update(0.4);
    const before = tween.value;
    tween.update(-1);
    expect(tween.value).toBe(before);
  });
});
