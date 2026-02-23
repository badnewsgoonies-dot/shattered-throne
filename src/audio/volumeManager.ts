import { AudioConfig } from '../shared/types';

const STORAGE_KEY = 'audio_config';

const DEFAULT_CONFIG: AudioConfig = {
  masterVolume: 0.7,
  musicVolume: 0.5,
  sfxVolume: 0.8,
  muted: false,
};

export function loadConfig(): AudioConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as AudioConfig;
    }
  } catch {
    // fall through to default
  }
  return { ...DEFAULT_CONFIG };
}

export function saveConfig(config: AudioConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function getDefaultConfig(): AudioConfig {
  return { ...DEFAULT_CONFIG };
}
