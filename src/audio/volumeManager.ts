import { AudioConfig } from '../shared/types';

const STORAGE_KEY = 'audio_config';
const DEFAULT_CONFIG: AudioConfig = {
  masterVolume: 0.7,
  musicVolume: 0.5,
  sfxVolume: 0.8,
  muted: false,
};

function cloneDefaultConfig(): AudioConfig {
  return { ...DEFAULT_CONFIG };
}

function normalizeConfig(raw: unknown): AudioConfig | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const candidate = raw as Partial<AudioConfig>;

  const masterVolume =
    typeof candidate.masterVolume === 'number' && Number.isFinite(candidate.masterVolume)
      ? candidate.masterVolume
      : DEFAULT_CONFIG.masterVolume;

  const musicVolume =
    typeof candidate.musicVolume === 'number' && Number.isFinite(candidate.musicVolume)
      ? candidate.musicVolume
      : DEFAULT_CONFIG.musicVolume;

  const sfxVolume =
    typeof candidate.sfxVolume === 'number' && Number.isFinite(candidate.sfxVolume)
      ? candidate.sfxVolume
      : DEFAULT_CONFIG.sfxVolume;

  const muted = typeof candidate.muted === 'boolean' ? candidate.muted : DEFAULT_CONFIG.muted;

  return {
    masterVolume,
    musicVolume,
    sfxVolume,
    muted,
  };
}

export function loadConfig(): AudioConfig {
  if (typeof localStorage === 'undefined') {
    return cloneDefaultConfig();
  }

  try {
    const rawConfig = localStorage.getItem(STORAGE_KEY);
    if (!rawConfig) {
      return cloneDefaultConfig();
    }

    const parsed = JSON.parse(rawConfig) as unknown;
    return normalizeConfig(parsed) ?? cloneDefaultConfig();
  } catch {
    return cloneDefaultConfig();
  }
}

export function saveConfig(config: AudioConfig): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore storage write failures.
  }
}
