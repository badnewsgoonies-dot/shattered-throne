import { vi } from 'vitest';

// Mock GainNode
export function createMockGainNode() {
  return {
    gain: {
      value: 1,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
}

// Mock OscillatorNode
export function createMockOscillatorNode() {
  return {
    type: 'sine' as OscillatorType,
    frequency: {
      value: 440,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    disconnect: vi.fn(),
  };
}

// Mock BufferSourceNode
export function createMockBufferSourceNode() {
  return {
    buffer: null as AudioBuffer | null,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    disconnect: vi.fn(),
  };
}

// Mock AudioBuffer
export function createMockAudioBuffer() {
  const channelData = new Float32Array(4410);
  return {
    getChannelData: vi.fn(() => channelData),
    length: 4410,
    sampleRate: 44100,
    duration: 0.1,
    numberOfChannels: 1,
  };
}

// Mock AudioContext
export function createMockAudioContext() {
  const mockCtx = {
    currentTime: 0,
    sampleRate: 44100,
    destination: { connect: vi.fn() },
    state: 'running' as AudioContextState,
    createGain: vi.fn(() => createMockGainNode()),
    createOscillator: vi.fn(() => createMockOscillatorNode()),
    createBuffer: vi.fn((_channels: number, _length: number, _sampleRate: number) =>
      createMockAudioBuffer(),
    ),
    createBufferSource: vi.fn(() => createMockBufferSourceNode()),
    resume: vi.fn(() => Promise.resolve()),
    close: vi.fn(() => Promise.resolve()),
  };
  return mockCtx;
}

// Setup global mocks for AudioContext
export function setupAudioMocks() {
  const mockCtx = createMockAudioContext();

  vi.stubGlobal('AudioContext', vi.fn(() => mockCtx));

  return mockCtx;
}

// Mock localStorage
export function createMockLocalStorage() {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((k) => delete store[k]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    _store: store,
  };
}
