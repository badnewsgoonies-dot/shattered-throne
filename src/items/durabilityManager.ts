import { ItemInstance } from '../shared/types';

export function reduceDurability(item: ItemInstance): ItemInstance | null {
  if (item.currentDurability === undefined) {
    return item;
  }

  const newDurability = item.currentDurability - 1;
  if (newDurability <= 0) {
    return null;
  }

  return {
    ...item,
    currentDurability: newDurability,
  };
}
