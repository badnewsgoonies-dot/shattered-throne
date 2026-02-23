import { SoundRequest } from '../shared/types';
import { generateSFX, getSFXDuration } from './sfxGenerator';

const SFX_GAP_MS = 100;

export function createSoundQueue(ctx: AudioContext, destination: AudioNode) {
  let queue: SoundRequest[] = [];
  let processing = false;

  function processNext(): void {
    if (queue.length === 0) {
      processing = false;
      return;
    }
    processing = true;
    const request = queue.shift()!;
    const vol = request.volume ?? 1;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.connect(destination);
    generateSFX(ctx, gain, request.type);
    const duration = getSFXDuration(request.type);
    setTimeout(processNext, duration + SFX_GAP_MS);
  }

  return {
    enqueue(requests: SoundRequest[]): void {
      queue.push(...requests);
      if (!processing) {
        processNext();
      }
    },
    clear(): void {
      queue = [];
      processing = false;
    },
    get isProcessing(): boolean {
      return processing;
    },
  };
}
