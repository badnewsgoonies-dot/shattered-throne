import {
  BattleSaveData,
  CampaignState,
  NUM_SAVE_SLOTS,
  SAVE_VERSION,
  SaveData,
} from '../shared/types';

function assertValidSlot(slotIndex: number): void {
  if (slotIndex < 0 || slotIndex >= NUM_SAVE_SLOTS) {
    throw new Error('Invalid slot');
  }
}

function getSlotKey(slotIndex: number): string {
  return `save_slot_${slotIndex}`;
}

export function save(state: CampaignState, slotIndex: number): SaveData {
  assertValidSlot(slotIndex);

  const saveData: SaveData = {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    slotIndex,
    campaign: state,
  };

  localStorage.setItem(getSlotKey(slotIndex), JSON.stringify(saveData));

  return saveData;
}

export function load(slotIndex: number): SaveData | null {
  assertValidSlot(slotIndex);

  const rawData = localStorage.getItem(getSlotKey(slotIndex));
  if (!rawData) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawData) as SaveData;

    if (parsed.version !== SAVE_VERSION) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function saveBattle(
  state: CampaignState,
  battleState: BattleSaveData,
  slotIndex: number,
): SaveData {
  assertValidSlot(slotIndex);

  const saveData: SaveData = {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    slotIndex,
    campaign: state,
    battleState,
  };

  localStorage.setItem(getSlotKey(slotIndex), JSON.stringify(saveData));

  return saveData;
}
