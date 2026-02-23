import { MAX_INVENTORY_SLOTS, Unit } from '../shared/types';

export function tradeItems(unitA: Unit, unitB: Unit, indexA: number, indexB: number): { unitA: Unit; unitB: Unit } {
  if (indexA < 0 || indexA >= MAX_INVENTORY_SLOTS || indexB < 0 || indexB >= MAX_INVENTORY_SLOTS) {
    return { unitA, unitB };
  }

  const itemsA = [...unitA.inventory.items];
  const itemsB = [...unitB.inventory.items];

  const temp = itemsA[indexA];
  itemsA[indexA] = itemsB[indexB];
  itemsB[indexB] = temp;

  return {
    unitA: {
      ...unitA,
      inventory: {
        ...unitA.inventory,
        items: itemsA,
      },
    },
    unitB: {
      ...unitB,
      inventory: {
        ...unitB.inventory,
        items: itemsB,
      },
    },
  };
}
