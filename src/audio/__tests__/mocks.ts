import { vi } from 'vitest';

export class MockAudioParam {
  value = 0;
  setValueCalls: Array<{ value: number; time: number }> = [];
  rampCalls: Array<{ value: number; time: number }> = [];

  setValueAtTime(value: number, time: number): void {
    this.value = value;
    this.setValueCalls.push({ value, time });
  }

  linearRampToValueAtTime(value: number, time: number): void {
    this.value = value;
    this.rampCalls.push({ value, time });
  }
}

export class MockOscillator {
  type: OscillatorType = 'sine';
  frequency = new MockAudioParam();
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
  disconnect = vi.fn();
}

export class MockGainNode {
  gain = new MockAudioParam();
  connect = vi.fn();
  disconnect = vi.fn();
}

export class MockAudioBuffer {
  private channels: Float32Array[];

  constructor(numberOfChannels: number, length: number) {
    this.channels = Array.from({ length: numberOfChannels }, () => new Float32Array(length));
  }

  getChannelData(channel: number): Float32Array {
    return this.channels[channel];
  }
}

export class MockBufferSource {
  buffer: AudioBuffer | null = null;
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
  disconnect = vi.fn();
}

export class MockAudioContext {
  static instances: MockAudioContext[] = [];

  currentTime = 0;
  sampleRate = 44100;
  destination = {} as AudioNode;

  oscillators: MockOscillator[] = [];
  gains: MockGainNode[] = [];
  buffers: MockAudioBuffer[] = [];
  bufferSources: MockBufferSource[] = [];

  constructor() {
    MockAudioContext.instances.push(this);
  }

  createOscillator(): OscillatorNode {
    const oscillator = new MockOscillator();
    this.oscillators.push(oscillator);
    return oscillator as unknown as OscillatorNode;
  }

  createGain(): GainNode {
    const gainNode = new MockGainNode();
    this.gains.push(gainNode);
    return gainNode as unknown as GainNode;
  }

  createBuffer(numberOfChannels: number, length: number, _sampleRate: number): AudioBuffer {
    const buffer = new MockAudioBuffer(numberOfChannels, length);
    this.buffers.push(buffer);
    return buffer as unknown as AudioBuffer;
  }

  createBufferSource(): AudioBufferSourceNode {
    const source = new MockBufferSource();
    this.bufferSources.push(source);
    return source as unknown as AudioBufferSourceNode;
  }
}

const mockStorage = new Map<string, string>();

export function installMockAudioContext(): void {
  const globalRef = globalThis as unknown as {
    window?: { AudioContext?: typeof MockAudioContext; webkitAudioContext?: typeof MockAudioContext };
    AudioContext?: typeof MockAudioContext;
  };

  if (!globalRef.window) {
    globalRef.window = {};
  }

  globalRef.window.AudioContext = MockAudioContext;
  globalRef.window.webkitAudioContext = MockAudioContext;
  globalRef.AudioContext = MockAudioContext;
}

export function resetMockAudioContextInstances(): void {
  MockAudioContext.instances = [];
}

export function getLastMockAudioContext(): MockAudioContext | undefined {
  return MockAudioContext.instances[MockAudioContext.instances.length - 1];
}

export function createMockAudioContext(): AudioContext {
  return new MockAudioContext() as unknown as AudioContext;
}

export function installMockLocalStorage(): void {
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (key: string) => mockStorage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      mockStorage.set(key, value);
    },
    removeItem: (key: string) => {
      mockStorage.delete(key);
    },
    clear: () => {
      mockStorage.clear();
    },
    get length() {
      return mockStorage.size;
    },
    key: (index: number) => [...mockStorage.keys()][index] ?? null,
  };
}

export function clearMockLocalStorage(): void {
  mockStorage.clear();
}

export function getStoredValue(key: string): string | null {
  return mockStorage.get(key) ?? null;
}
