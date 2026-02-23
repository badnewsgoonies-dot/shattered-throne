import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import {
  NUM_SAVE_SLOTS,
  SAVE_VERSION,
} from '../../shared/types';
import {
  load,
  save,
  saveBattle,
} from '../saveSystem';
import {
  createLocalStorageMock,
  makeBattleSaveData,
  makeCampaignState,
} from './testUtils';

describe('saveSystem', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorageMock(),
      configurable: true,
      writable: true,
    });
  });

  it('save returns SaveData with version and slot metadata', () => {
    const state = makeCampaignState();

    const result = save(state, 0);

    expect(result.version).toBe(SAVE_VERSION);
    expect(result.slotIndex).toBe(0);
    expect(result.timestamp).toBeTypeOf('number');
    expect(result.campaign).toEqual(state);
  });

  it('save writes serialized data to localStorage key', () => {
    const state = makeCampaignState({ currentChapterId: 'ch_2' });

    save(state, 1);

    const raw = localStorage.getItem('save_slot_1');
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw ?? '{}').campaign.currentChapterId).toBe('ch_2');
  });

  it('save throws for negative slot index', () => {
    expect(() => save(makeCampaignState(), -1)).toThrowError('Invalid slot');
  });

  it('save throws for slot index beyond NUM_SAVE_SLOTS', () => {
    expect(() => save(makeCampaignState(), NUM_SAVE_SLOTS)).toThrowError('Invalid slot');
  });

  it('load returns null when slot is empty', () => {
    expect(load(0)).toBeNull();
  });

  it('load returns saved data for a valid slot', () => {
    const state = makeCampaignState({ gold: 1337 });

    save(state, 2);
    const result = load(2);

    expect(result?.campaign.gold).toBe(1337);
    expect(result?.slotIndex).toBe(2);
  });

  it('load returns null when stored JSON is invalid', () => {
    localStorage.setItem('save_slot_0', '{not-json');

    expect(load(0)).toBeNull();
  });

  it('load returns null when save version mismatches', () => {
    localStorage.setItem('save_slot_0', JSON.stringify({
      version: '0.9.0',
      timestamp: Date.now(),
      slotIndex: 0,
      campaign: makeCampaignState(),
    }));

    expect(load(0)).toBeNull();
  });

  it('load throws for invalid slot indices', () => {
    expect(() => load(-1)).toThrowError('Invalid slot');
    expect(() => load(NUM_SAVE_SLOTS)).toThrowError('Invalid slot');
  });

  it('saveBattle stores battleState with campaign snapshot', () => {
    const state = makeCampaignState();
    const battle = makeBattleSaveData({ chapterId: 'ch_7', turnNumber: 6 });

    const result = saveBattle(state, battle, 0);

    expect(result.battleState).toEqual(battle);
    expect(load(0)?.battleState?.chapterId).toBe('ch_7');
  });

  it('saveBattle throws for invalid slot indices', () => {
    expect(() => saveBattle(makeCampaignState(), makeBattleSaveData(), -1)).toThrowError('Invalid slot');
    expect(() => saveBattle(makeCampaignState(), makeBattleSaveData(), NUM_SAVE_SLOTS)).toThrowError('Invalid slot');
  });

  it('supports multiple independent save slots', () => {
    save(makeCampaignState({ currentChapterId: 'ch_2' }), 0);
    save(makeCampaignState({ currentChapterId: 'ch_8' }), 1);
    save(makeCampaignState({ currentChapterId: 'ch_20' }), 2);

    expect(load(0)?.campaign.currentChapterId).toBe('ch_2');
    expect(load(1)?.campaign.currentChapterId).toBe('ch_8');
    expect(load(2)?.campaign.currentChapterId).toBe('ch_20');
  });

  it('overwrites existing slot data on repeated saves', () => {
    save(makeCampaignState({ gold: 500 }), 0);
    save(makeCampaignState({ gold: 900 }), 0);

    expect(load(0)?.campaign.gold).toBe(900);
  });
});
