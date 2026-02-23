import { beforeEach, describe, expect, it } from 'vitest';
import { loadConfig, saveConfig } from '../volumeManager';
import { AudioConfig } from '../../shared/types';
import { clearMockLocalStorage, getStoredValue, installMockLocalStorage } from './mocks';

const DEFAULT_CONFIG: AudioConfig = {
  masterVolume: 0.7,
  musicVolume: 0.5,
  sfxVolume: 0.8,
  muted: false,
};

describe('volumeManager', () => {
  beforeEach(() => {
    installMockLocalStorage();
    clearMockLocalStorage();
  });

  it('returns default config when storage is empty', () => {
    expect(loadConfig()).toEqual(DEFAULT_CONFIG);
  });

  it('saves config to localStorage under audio_config key', () => {
    const config: AudioConfig = {
      masterVolume: 0.9,
      musicVolume: 0.4,
      sfxVolume: 0.2,
      muted: true,
    };

    saveConfig(config);

    expect(getStoredValue('audio_config')).toBe(JSON.stringify(config));
  });

  it('loads a previously saved config', () => {
    const config: AudioConfig = {
      masterVolume: 0.15,
      musicVolume: 0.25,
      sfxVolume: 0.35,
      muted: true,
    };

    saveConfig(config);

    expect(loadConfig()).toEqual(config);
  });

  it('falls back to defaults when stored JSON is invalid', () => {
    localStorage.setItem('audio_config', '{invalid-json');

    expect(loadConfig()).toEqual(DEFAULT_CONFIG);
  });

  it('merges partial configs with defaults', () => {
    localStorage.setItem('audio_config', JSON.stringify({ musicVolume: 0.2 }));

    expect(loadConfig()).toEqual({
      masterVolume: DEFAULT_CONFIG.masterVolume,
      musicVolume: 0.2,
      sfxVolume: DEFAULT_CONFIG.sfxVolume,
      muted: DEFAULT_CONFIG.muted,
    });
  });

  it('falls back field-by-field when stored config has invalid value types', () => {
    localStorage.setItem(
      'audio_config',
      JSON.stringify({
        masterVolume: 'loud',
        musicVolume: 0.3,
        sfxVolume: null,
        muted: 'nope',
      }),
    );

    expect(loadConfig()).toEqual({
      masterVolume: DEFAULT_CONFIG.masterVolume,
      musicVolume: 0.3,
      sfxVolume: DEFAULT_CONFIG.sfxVolume,
      muted: DEFAULT_CONFIG.muted,
    });
  });

  it('returns defaults when localStorage is unavailable', () => {
    const originalStorage = (globalThis as { localStorage?: Storage }).localStorage;
    delete (globalThis as { localStorage?: Storage }).localStorage;

    expect(loadConfig()).toEqual(DEFAULT_CONFIG);

    (globalThis as { localStorage?: Storage }).localStorage = originalStorage;
  });

  it('does not throw when saving without localStorage', () => {
    const originalStorage = (globalThis as { localStorage?: Storage }).localStorage;
    delete (globalThis as { localStorage?: Storage }).localStorage;

    expect(() => saveConfig(DEFAULT_CONFIG)).not.toThrow();

    (globalThis as { localStorage?: Storage }).localStorage = originalStorage;
  });
});
