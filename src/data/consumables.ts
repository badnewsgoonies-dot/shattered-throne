import {
  ConsumableData,
  ItemCategory,
  Stats,
  StatusEffectType,
} from '../shared/types';

interface ConsumableSpec {
  id: string;
  name: string;
  description: string;
  uses: number;
  cost: number;
  effect:
    | { type: 'heal'; healAmount?: number; fullHeal?: boolean }
    | { type: 'cureStatus'; cureStatus: StatusEffectType }
    | { type: 'statBoost'; statBoost: Partial<Stats>; permanent?: boolean }
    | { type: 'key' }
    | { type: 'special' };
}

function consumable(spec: ConsumableSpec): ConsumableData {
  return {
    id: spec.id,
    name: spec.name,
    description: spec.description,
    category: ItemCategory.Consumable,
    effect: spec.effect,
    uses: spec.uses,
    cost: spec.cost,
  };
}

export const CONSUMABLES: ConsumableData[] = [
  consumable({
    id: 'vulnerary',
    name: 'Vulnerary',
    description: 'Basic medicine restoring 10 HP.',
    uses: 3,
    cost: 300,
    effect: { type: 'heal', healAmount: 10 },
  }),
  consumable({
    id: 'concoction',
    name: 'Concoction',
    description: 'Potent blend restoring 20 HP.',
    uses: 3,
    cost: 600,
    effect: { type: 'heal', healAmount: 20 },
  }),
  consumable({
    id: 'elixir',
    name: 'Elixir',
    description: 'Fully restores HP.',
    uses: 3,
    cost: 2000,
    effect: { type: 'heal', fullHeal: true },
  }),
  consumable({
    id: 'antidote',
    name: 'Antidote',
    description: 'Cures poison.',
    uses: 3,
    cost: 100,
    effect: { type: 'cureStatus', cureStatus: StatusEffectType.Poison },
  }),
  consumable({
    id: 'pure_water',
    name: 'Pure Water',
    description: 'Raises resistance by 7 for one battle.',
    uses: 1,
    cost: 500,
    effect: { type: 'statBoost', statBoost: { resistance: 7 } },
  }),

  // Permanent boosters
  consumable({
    id: 'energy_drop',
    name: 'Energy Drop',
    description: 'Permanently raises Strength by 2.',
    uses: 1,
    cost: 3000,
    effect: { type: 'statBoost', statBoost: { strength: 2 }, permanent: true },
  }),
  consumable({
    id: 'spirit_dust',
    name: 'Spirit Dust',
    description: 'Permanently raises Magic by 2.',
    uses: 1,
    cost: 3000,
    effect: { type: 'statBoost', statBoost: { magic: 2 }, permanent: true },
  }),
  consumable({
    id: 'secret_book',
    name: 'Secret Book',
    description: 'Permanently raises Skill by 2.',
    uses: 1,
    cost: 3000,
    effect: { type: 'statBoost', statBoost: { skill: 2 }, permanent: true },
  }),
  consumable({
    id: 'speedwing',
    name: 'Speedwing',
    description: 'Permanently raises Speed by 2.',
    uses: 1,
    cost: 3000,
    effect: { type: 'statBoost', statBoost: { speed: 2 }, permanent: true },
  }),
  consumable({
    id: 'goddess_icon',
    name: 'Goddess Icon',
    description: 'Permanently raises Luck by 2.',
    uses: 1,
    cost: 3000,
    effect: { type: 'statBoost', statBoost: { luck: 2 }, permanent: true },
  }),
  consumable({
    id: 'dracoshield',
    name: 'Dracoshield',
    description: 'Permanently raises Defense by 2.',
    uses: 1,
    cost: 3000,
    effect: { type: 'statBoost', statBoost: { defense: 2 }, permanent: true },
  }),
  consumable({
    id: 'talisman',
    name: 'Talisman',
    description: 'Permanently raises Resistance by 2.',
    uses: 1,
    cost: 3000,
    effect: { type: 'statBoost', statBoost: { resistance: 2 }, permanent: true },
  }),
  consumable({
    id: 'boots_item',
    name: 'Boots',
    description: 'Permanently raises Movement by 2.',
    uses: 1,
    cost: 5000,
    effect: { type: 'statBoost', statBoost: { movement: 2 }, permanent: true },
  }),

  // Keys and utility
  consumable({
    id: 'door_key',
    name: 'Door Key',
    description: 'Opens one locked door.',
    uses: 1,
    cost: 50,
    effect: { type: 'key' },
  }),
  consumable({
    id: 'chest_key',
    name: 'Chest Key',
    description: 'Opens one locked chest.',
    uses: 1,
    cost: 50,
    effect: { type: 'key' },
  }),
  consumable({
    id: 'master_key',
    name: 'Master Key',
    description: 'Opens doors and chests.',
    uses: 5,
    cost: 500,
    effect: { type: 'key' },
  }),
  consumable({
    id: 'torch',
    name: 'Torch',
    description: 'Reveals hidden terrain for several turns.',
    uses: 3,
    cost: 300,
    effect: { type: 'special' },
  }),

  // Additional consumables
  consumable({
    id: 'sweet_bun',
    name: 'Sweet Bun',
    description: 'A baked ration that restores 15 HP.',
    uses: 2,
    cost: 220,
    effect: { type: 'heal', healAmount: 15 },
  }),
  consumable({
    id: 'defense_tonic',
    name: 'Defense Tonic',
    description: 'Temporarily raises Defense by 5.',
    uses: 1,
    cost: 650,
    effect: { type: 'statBoost', statBoost: { defense: 5 } },
  }),
  consumable({
    id: 'speed_tonic',
    name: 'Speed Tonic',
    description: 'Temporarily raises Speed by 5.',
    uses: 1,
    cost: 650,
    effect: { type: 'statBoost', statBoost: { speed: 5 } },
  }),
  consumable({
    id: 'focus_tonic',
    name: 'Focus Tonic',
    description: 'Temporarily raises Skill by 5.',
    uses: 1,
    cost: 650,
    effect: { type: 'statBoost', statBoost: { skill: 5 } },
  }),
  consumable({
    id: 'panacea',
    name: 'Panacea',
    description: 'A rare cure-all remedy.',
    uses: 1,
    cost: 900,
    effect: { type: 'special' },
  }),
  consumable({
    id: 'smoke_bomb',
    name: 'Smoke Bomb',
    description: 'Creates temporary cover in fog-of-war battles.',
    uses: 2,
    cost: 420,
    effect: { type: 'special' },
  }),
];

export function getConsumableById(id: string): ConsumableData | null {
  return CONSUMABLES.find((entry) => entry.id === id) ?? null;
}

export function getAllConsumables(): ConsumableData[] {
  return [...CONSUMABLES];
}
