import { ItemInstance } from '../shared/types';

export function addToConvoy(convoy: ItemInstance[], item: ItemInstance): ItemInstance[] {
  return [...convoy, item];
}

export function removeFromConvoy(convoy: ItemInstance[], instanceId: string): { convoy: ItemInstance[]; item: ItemInstance | null } {
  const index = convoy.findIndex((convoyItem) => convoyItem.instanceId === instanceId);
  if (index === -1) {
    return { convoy, item: null };
  }

  const item = convoy[index];
  const newConvoy = [...convoy.slice(0, index), ...convoy.slice(index + 1)];
  return { convoy: newConvoy, item };
}
