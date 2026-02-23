import { ItemInstance } from '../shared/types';

export function addToConvoy(
  convoy: ItemInstance[],
  item: ItemInstance
): ItemInstance[] {
  return [...convoy, item];
}

export function removeFromConvoy(
  convoy: ItemInstance[],
  instanceId: string
): { convoy: ItemInstance[]; item: ItemInstance | null } {
  const idx = convoy.findIndex((i) => i.instanceId === instanceId);
  if (idx === -1) return { convoy, item: null };
  const item = convoy[idx];
  const newConvoy = [...convoy.slice(0, idx), ...convoy.slice(idx + 1)];
  return { convoy: newConvoy, item };
}
