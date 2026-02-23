import { SoundRequest } from '../shared/types';

export interface SoundQueue {
  enqueue(requests: SoundRequest[]): void;
}

export function createSoundQueue(playSFX: (request: SoundRequest) => void): SoundQueue {
  const queue: SoundRequest[] = [];
  let processing = false;

  const processNext = (): void => {
    if (queue.length === 0) {
      processing = false;
      return;
    }

    processing = true;
    const nextRequest = queue.shift();

    if (!nextRequest) {
      processing = false;
      return;
    }

    playSFX(nextRequest);

    setTimeout(() => {
      processNext();
    }, 100);
  };

  return {
    enqueue: (requests: SoundRequest[]) => {
      if (requests.length === 0) {
        return;
      }

      queue.push(...requests);

      if (!processing) {
        processNext();
      }
    },
  };
}
