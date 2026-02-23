import { AnimationRequest } from '../shared/types';

export function playAnimation(request: AnimationRequest, ctx: CanvasRenderingContext2D | null): Promise<void> {
  return new Promise((resolve) => {
    if (!ctx) {
      resolve();
      return;
    }

    setTimeout(resolve, Math.max(0, request.durationMs));
  });
}
