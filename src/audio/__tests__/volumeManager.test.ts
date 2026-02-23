import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockLocalStorage } from './mocks';

// Must mock localStorage before importing
const mockStorage = createMockLocalStorage();
vi.stubGlobal('localStorage', mockStorage);

import { loadConfig, saveConfig, getDefaultConfig } from '../volumeManager';

describe('volumeManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage.clear();
  });

  describe('getDefaultConfig', () => {
    it('should return default config values', () => {
      const config = getDefaultConfig();
      expect(config.masterVolume).toBe(0.7);
      expect(config.musicVolume).toBe(0.5);
      expect(config.sfxVolume).toBe(0.8);
      expect(config.muted).toBe(false);
    });

    it('should return a new object each time', () => {
      const a = getDefaultConfig();
      const b = getDefaultConfig();
      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    });
  });

  describe('loadConfig', () => {
    it('should return default config when localStorage is empty', () => {
      const config = loadConfig();
      expect(config).toEqual(getDefaultConfig());
    });

    it('should return stored config from localStorage', () => {
      const stored = { masterVolume: 1, musicVolume: 0.3, sfxVolume: 0.5, muted: true };
      mockStorage._store['audio_config'] = JSON.stringify(stored);
      const config = loadConfig();
      expect(config).toEqual(stored);
    });

    it('should return default config on invalid JSON', () => {
      mockStorage._store['audio_config'] = 'invalid json{{{';
      const config = loadConfig();
      expect(config).toEqual(getDefaultConfig());
    });

    it('should read from the correct localStorage key', () => {
      loadConfig();
      expect(mockStorage.getItem).toHaveBeenCalledWith('audio_config');
    });
  });

  describe('saveConfig', () => {
    it('should save config to localStorage', () => {
      const config = { masterVolume: 0.5, musicVolume: 0.3, sfxVolume: 0.9, muted: true };
      saveConfig(config);
      expect(mockStorage.setItem).toHaveBeenCalledWith('audio_config', JSON.stringify(config));
    });

    it('should save to the correct key', () => {
      saveConfig(getDefaultConfig());
      expect(mockStorage.setItem).toHaveBeenCalledWith('audio_config', expect.any(String));
    });

    it('should persist config that can be loaded back', () => {
      const config = { masterVolume: 0.2, musicVolume: 0.8, sfxVolume: 0.1, muted: false };
      saveConfig(config);
      const stored = mockStorage._store['audio_config'];
      expect(JSON.parse(stored)).toEqual(config);
    });

    it('should overwrite previous config', () => {
      const first = { masterVolume: 0.1, musicVolume: 0.1, sfxVolume: 0.1, muted: false };
      const second = { masterVolume: 0.9, musicVolume: 0.9, sfxVolume: 0.9, muted: true };
      saveConfig(first);
      saveConfig(second);
      const stored = JSON.parse(mockStorage._store['audio_config']);
      expect(stored).toEqual(second);
    });
  });
});
