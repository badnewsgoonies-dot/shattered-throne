export type EasingFn = (t: number) => number;

export const Easing = {
  linear: (t: number): number => t,
  easeIn: (t: number): number => t * t,
  easeOut: (t: number): number => t * (2 - t),
  easeInOut: (t: number): number => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
};

export interface Tween {
  update(dt: number): number;
  isComplete: boolean;
  value: number;
}

export function createTween(from: number, to: number, duration: number, easing: EasingFn = Easing.linear): Tween {
  const safeDuration = Math.max(0, duration);
  let elapsed = 0;

  function currentT(): number {
    if (safeDuration === 0) {
      return 1;
    }

    return Math.min(1, elapsed / safeDuration);
  }

  function currentValue(): number {
    return from + (to - from) * easing(currentT());
  }

  return {
    get isComplete(): boolean {
      return safeDuration === 0 || elapsed >= safeDuration;
    },
    get value(): number {
      return currentValue();
    },
    update(dt: number): number {
      if (safeDuration === 0) {
        elapsed = 0;
        return currentValue();
      }

      elapsed = Math.min(safeDuration, elapsed + Math.max(0, dt));
      return currentValue();
    },
  };
}
