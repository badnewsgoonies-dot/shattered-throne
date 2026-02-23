import { ItemInstance } from '../shared/types';

export function forgeWeapon(
  item: ItemInstance,
  bonuses: { might: number; hit: number; crit: number },
  goldCost: number,
): { item: ItemInstance; cost: number } {
  const current = item.forgeBonuses ?? { might: 0, hit: 0, crit: 0 };
  const newBonuses = {
    might: Math.max(0, Math.min(current.might + bonuses.might, 5)),
    hit: Math.max(0, Math.min(current.hit + bonuses.hit, 20)),
    crit: Math.max(0, Math.min(current.crit + bonuses.crit, 10)),
  };

  return {
    item: {
      ...item,
      forgeBonuses: newBonuses,
    },
    cost: goldCost,
  };
}
