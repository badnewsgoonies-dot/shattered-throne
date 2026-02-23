import { ItemInstance } from '../shared/types';

const FORGE_CAPS = { might: 5, hit: 20, crit: 10 };

export function forgeWeapon(
  item: ItemInstance,
  bonuses: { might: number; hit: number; crit: number },
  goldCost: number
): { item: ItemInstance; cost: number } {
  const existing = item.forgeBonuses ?? { might: 0, hit: 0, crit: 0 };
  const newBonuses = {
    might: Math.min(existing.might + bonuses.might, FORGE_CAPS.might),
    hit: Math.min(existing.hit + bonuses.hit, FORGE_CAPS.hit),
    crit: Math.min(existing.crit + bonuses.crit, FORGE_CAPS.crit),
  };
  return {
    item: { ...item, forgeBonuses: newBonuses },
    cost: goldCost,
  };
}
