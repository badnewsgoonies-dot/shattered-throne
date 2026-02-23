import {
  AIBehavior,
  ChapterDefinition,
  DefeatCondition,
  EnemyPlacement,
  Position,
  UnitClassName,
  VictoryCondition,
  Weather,
} from '../shared/types';
import { MAP_LAYOUTS } from './mapLayouts';

function position(x: number, y: number): Position {
  return { x, y };
}

function deploymentSlots(mapId: string, count: number): Position[] {
  const map = MAP_LAYOUTS.find((entry) => entry.id === mapId);
  if (!map) {
    return [];
  }

  const slots: Position[] = [];
  const startY = Math.max(0, Math.floor(map.height / 2) - Math.ceil(count / 4));
  for (let i = 0; i < count; i += 1) {
    slots.push({ x: i % 2, y: startY + Math.floor(i / 2) });
  }
  return slots;
}

function enemy(
  characterId: string,
  className: UnitClassName,
  level: number,
  x: number,
  y: number,
  equipment: string[],
  aiBehavior: AIBehavior,
  isBoss = false,
  dropItemId?: string,
): EnemyPlacement {
  return {
    characterId,
    className,
    level,
    position: position(x, y),
    equipment,
    aiBehavior,
    isBoss,
    dropItemId,
  };
}

export const PARALOGUES: ChapterDefinition[] = [
  {
    id: 'px_1',
    number: 101,
    title: 'Song of Shelter',
    description: 'Unlock: Reach C support between Alaric and Elena. Defend villagers in the silent valley.',
    mapId: 'map_silent_valley_08',
    deploymentSlots: deploymentSlots('map_silent_valley_08', 6),
    maxDeployments: 6,
    enemies: [
      enemy('enemy_bandit_06', UnitClassName.Thief, 10, 5, 2, ['steel_sword'], AIBehavior.Flanker),
      enemy('enemy_bandit_07', UnitClassName.Thief, 10, 6, 3, ['killing_edge'], AIBehavior.Flanker),
      enemy('enemy_soldier_06', UnitClassName.Archer, 10, 7, 4, ['steel_bow'], AIBehavior.Defensive),
      enemy('enemy_commander_01', UnitClassName.General, 14, 7, 6, ['silver_lance'], AIBehavior.Boss, true, 'renew_staff'),
    ],
    allies: [enemy('npc_sister_ada', UnitClassName.Cleric, 9, 2, 4, ['mend_staff'], AIBehavior.Support)],
    victoryConditions: [{ type: VictoryCondition.ProtectTarget, targetUnitId: 'npc_sister_ada' }],
    defeatConditions: [{ type: DefeatCondition.LordDies }],
    reinforcements: [],
    treasures: [{ position: position(7, 7), itemId: 'renew_staff', requiresKey: true }],
    narrative: [
      {
        trigger: 'preBattle',
        dialogue: [
          { speaker: 'Elena', text: 'Unlock condition met. These villagers asked for our help.' },
          { speaker: 'Alaric', text: 'Then we answer. No one is left behind.' },
        ],
      },
      {
        trigger: 'postBattle',
        dialogue: [
          { speaker: 'Elena', text: 'They are safe. Thank you, Alaric.' },
          { speaker: 'Alaric', text: 'We did this together.' },
        ],
      },
    ],
    weather: Weather.Fog,
    rewards: {
      goldReward: 1200,
      expBonus: 200,
      itemRewards: ['renew_staff'],
      unlockedChapters: [],
    },
    nextChapterId: null,
  },
  {
    id: 'px_2',
    number: 102,
    title: 'Knightly Oath',
    description: 'Unlock: Marcus and Isolde B support. Duel rival cavalry at the hill fort.',
    mapId: 'map_hill_fort_12',
    deploymentSlots: deploymentSlots('map_hill_fort_12', 7),
    maxDeployments: 7,
    enemies: [
      enemy('enemy_elite_02', UnitClassName.Paladin, 14, 8, 5, ['silver_lance'], AIBehavior.Defensive),
      enemy('enemy_elite_12', UnitClassName.GreatKnight, 14, 9, 6, ['silver_lance'], AIBehavior.Defensive),
      enemy('enemy_commander_04', UnitClassName.Berserker, 15, 10, 6, ['killer_axe'], AIBehavior.Boss, true, 'knight_crest'),
    ],
    allies: [],
    victoryConditions: [{ type: VictoryCondition.BossKill, targetUnitId: 'enemy_commander_04' }],
    defeatConditions: [{ type: DefeatCondition.LordDies }],
    reinforcements: [],
    treasures: [{ position: position(6, 6), itemId: 'knight_crest', requiresKey: false }],
    narrative: [
      {
        trigger: 'preBattle',
        dialogue: [
          { speaker: 'Isolde', text: 'Only riders who keep their oath may pass this challenge.' },
          { speaker: 'Marcus', text: 'Then let us ride true.' },
        ],
      },
      {
        trigger: 'postBattle',
        dialogue: [
          { speaker: 'Marcus', text: 'Our oaths hold.' },
          { speaker: 'Isolde', text: 'And our riders are stronger for it.' },
        ],
      },
    ],
    weather: Weather.Clear,
    rewards: {
      goldReward: 1400,
      expBonus: 220,
      itemRewards: ['knight_crest'],
      unlockedChapters: [],
    },
    nextChapterId: null,
  },
  {
    id: 'px_3',
    number: 103,
    title: 'Masks and Mirrors',
    description: 'Unlock: Kael and Petra C support. Infiltrate a hidden troupe hideout.',
    mapId: 'map_twilight_forest_12',
    deploymentSlots: deploymentSlots('map_twilight_forest_12', 7),
    maxDeployments: 7,
    enemies: [
      enemy('enemy_elite_03', UnitClassName.Assassin, 15, 8, 6, ['killing_edge'], AIBehavior.Flanker),
      enemy('enemy_elite_11', UnitClassName.Trickster, 15, 9, 7, ['levin_sword'], AIBehavior.Flanker),
      enemy('enemy_elite_03', UnitClassName.Assassin, 15, 10, 5, ['killing_edge'], AIBehavior.Flanker),
    ],
    allies: [],
    victoryConditions: [{ type: VictoryCondition.Rout }],
    defeatConditions: [{ type: DefeatCondition.LordDies }],
    reinforcements: [],
    treasures: [{ position: position(11, 11), itemId: 'smoke_bomb', requiresKey: false }],
    narrative: [
      {
        trigger: 'preBattle',
        dialogue: [
          { speaker: 'Petra', text: 'Unlock condition met. These masks were used to mark targets.' },
          { speaker: 'Kael', text: 'Then we burn the ledger and free the names.' },
        ],
      },
      {
        trigger: 'postBattle',
        dialogue: [
          { speaker: 'Kael', text: 'No more contracts in these woods.' },
          { speaker: 'Petra', text: 'Only open stages from now on.' },
        ],
      },
    ],
    weather: Weather.Fog,
    rewards: {
      goldReward: 1500,
      expBonus: 240,
      itemRewards: ['smoke_bomb'],
      unlockedChapters: [],
    },
    nextChapterId: null,
  },
  {
    id: 'px_4',
    number: 104,
    title: 'Relic Tide',
    description: 'Unlock: Rhea and Lysandra B support. Recover relic caches in flooded halls.',
    mapId: 'map_sunken_temple_16',
    deploymentSlots: deploymentSlots('map_sunken_temple_16', 8),
    maxDeployments: 8,
    enemies: [
      enemy('enemy_elite_09', UnitClassName.Bishop, 17, 11, 6, ['physic_staff'], AIBehavior.Support),
      enemy('enemy_elite_10', UnitClassName.Valkyrie, 17, 12, 7, ['lightning'], AIBehavior.Support),
      enemy('enemy_elite_04', UnitClassName.Sage, 17, 13, 8, ['thoron'], AIBehavior.Boss, true, 'talisman'),
    ],
    allies: [],
    victoryConditions: [{ type: VictoryCondition.BossKill, targetUnitId: 'enemy_elite_04' }],
    defeatConditions: [{ type: DefeatCondition.LordDies }],
    reinforcements: [],
    treasures: [{ position: position(8, 7), itemId: 'talisman', requiresKey: true }],
    narrative: [
      {
        trigger: 'preBattle',
        dialogue: [
          { speaker: 'Rhea', text: 'These relics must not fall into imperial hands again.' },
          { speaker: 'Lysandra', text: 'I can decode the locking wards. Protect me while I work.' },
        ],
      },
      {
        trigger: 'postBattle',
        dialogue: [
          { speaker: 'Lysandra', text: 'Caches secured and cataloged.' },
          { speaker: 'Rhea', text: 'Good. The past will not be weaponized again.' },
        ],
      },
    ],
    weather: Weather.Rain,
    rewards: {
      goldReward: 1700,
      expBonus: 260,
      itemRewards: ['talisman'],
      unlockedChapters: [],
    },
    nextChapterId: null,
  },
  {
    id: 'px_5',
    number: 105,
    title: 'Arena Unbound',
    description: 'Unlock: Cedric recruited. Liberate captives from the crimson arena.',
    mapId: 'map_crimson_fields_18',
    deploymentSlots: deploymentSlots('map_crimson_fields_18', 8),
    maxDeployments: 8,
    enemies: [
      enemy('enemy_elite_01', UnitClassName.Berserker, 18, 12, 7, ['killer_axe'], AIBehavior.Aggressive),
      enemy('enemy_elite_01', UnitClassName.Berserker, 18, 13, 8, ['killer_axe'], AIBehavior.Aggressive),
      enemy('enemy_commander_04', UnitClassName.Berserker, 19, 14, 9, ['hauteclere'], AIBehavior.Boss, true, 'energy_drop'),
    ],
    allies: [enemy('npc_guardian_owen', UnitClassName.General, 13, 3, 8, ['silver_lance'], AIBehavior.Defensive)],
    victoryConditions: [{ type: VictoryCondition.BossKill, targetUnitId: 'enemy_commander_04' }],
    defeatConditions: [{ type: DefeatCondition.LordDies }],
    reinforcements: [],
    treasures: [{ position: position(17, 14), itemId: 'energy_drop', requiresKey: true }],
    narrative: [
      {
        trigger: 'preBattle',
        dialogue: [
          { speaker: 'Cedric', text: 'These pits still chain fighters for sport.' },
          { speaker: 'Alaric', text: 'Then tonight we break every chain.' },
        ],
      },
      {
        trigger: 'postBattle',
        dialogue: [
          { speaker: 'Cedric', text: 'No more arena bloodshed.' },
          { speaker: 'Alaric', text: 'Escort the freed captives to camp.' },
        ],
      },
    ],
    weather: Weather.Clear,
    rewards: {
      goldReward: 1800,
      expBonus: 280,
      itemRewards: ['energy_drop'],
      unlockedChapters: [],
    },
    nextChapterId: null,
  },
  {
    id: 'px_6',
    number: 106,
    title: 'Courier Skies',
    description: 'Unlock: Orion and Yvette B support. Reopen aerial courier routes.',
    mapId: 'map_sky_bridge_20',
    deploymentSlots: deploymentSlots('map_sky_bridge_20', 9),
    maxDeployments: 9,
    enemies: [
      enemy('enemy_elite_06', UnitClassName.Sniper, 19, 15, 10, ['silver_bow'], AIBehavior.Defensive),
      enemy('enemy_elite_07', UnitClassName.Ranger, 19, 16, 10, ['silver_bow'], AIBehavior.Flanker),
      enemy('enemy_elite_12', UnitClassName.GreatKnight, 19, 17, 10, ['silver_lance'], AIBehavior.Boss, true, 'boots_item'),
    ],
    allies: [],
    victoryConditions: [{ type: VictoryCondition.ReachLocation, targetPosition: position(19, 10) }],
    defeatConditions: [{ type: DefeatCondition.LordDies }],
    reinforcements: [],
    treasures: [{ position: position(18, 10), itemId: 'boots_item', requiresKey: true }],
    narrative: [
      {
        trigger: 'preBattle',
        dialogue: [
          { speaker: 'Orion', text: 'Messenger lanes are blocked across the span.' },
          { speaker: 'Yvette', text: 'Clear them, and aid can move at once.' },
        ],
      },
      {
        trigger: 'postBattle',
        dialogue: [
          { speaker: 'Yvette', text: 'Courier route restored.' },
          { speaker: 'Orion', text: 'Medical trains can move by dawn.' },
        ],
      },
    ],
    weather: Weather.Clear,
    rewards: {
      goldReward: 1900,
      expBonus: 300,
      itemRewards: ['boots_item'],
      unlockedChapters: [],
    },
    nextChapterId: null,
  },
  {
    id: 'px_7',
    number: 107,
    title: 'Mirebound Ledger',
    description: 'Unlock: Bram and Fenric B support. Recover intelligence from marsh couriers.',
    mapId: 'map_black_marsh_16',
    deploymentSlots: deploymentSlots('map_black_marsh_16', 9),
    maxDeployments: 9,
    enemies: [
      enemy('enemy_elite_03', UnitClassName.Assassin, 20, 12, 6, ['killing_edge'], AIBehavior.Flanker),
      enemy('enemy_elite_11', UnitClassName.Trickster, 20, 13, 7, ['levin_sword'], AIBehavior.Flanker),
      enemy('enemy_elite_03', UnitClassName.Assassin, 20, 14, 8, ['killing_edge'], AIBehavior.Boss, true, 'master_key'),
    ],
    allies: [],
    victoryConditions: [{ type: VictoryCondition.BossKill, targetUnitId: 'enemy_elite_03' }],
    defeatConditions: [{ type: DefeatCondition.LordDies }],
    reinforcements: [],
    treasures: [{ position: position(14, 2), itemId: 'master_key', requiresKey: false }],
    narrative: [
      {
        trigger: 'preBattle',
        dialogue: [
          { speaker: 'Bram', text: 'Courier satchels are hidden in this swamp.' },
          { speaker: 'Fenric', text: 'I know their markers. Follow my lead.' },
        ],
      },
      {
        trigger: 'postBattle',
        dialogue: [
          { speaker: 'Fenric', text: 'Ledger recovered. Routes and cipher keys too.' },
          { speaker: 'Bram', text: 'Perfect. Intelligence wins wars.' },
        ],
      },
    ],
    weather: Weather.Fog,
    rewards: {
      goldReward: 2000,
      expBonus: 320,
      itemRewards: ['master_key'],
      unlockedChapters: [],
    },
    nextChapterId: null,
  },
  {
    id: 'px_8',
    number: 108,
    title: 'Siege Drill',
    description: 'Unlock: Garrick and Tiber A support. Complete a full-scale siege exercise.',
    mapId: 'map_bastion_walls_22',
    deploymentSlots: deploymentSlots('map_bastion_walls_22', 10),
    maxDeployments: 10,
    enemies: [
      enemy('enemy_elite_05', UnitClassName.General, 21, 16, 8, ['silver_lance'], AIBehavior.Defensive),
      enemy('enemy_elite_12', UnitClassName.GreatKnight, 21, 17, 9, ['silver_lance'], AIBehavior.Defensive),
      enemy('enemy_elite_05', UnitClassName.General, 21, 18, 10, ['silver_lance'], AIBehavior.Boss, true, 'dracoshield'),
    ],
    allies: [enemy('npc_knight_voss', UnitClassName.Paladin, 16, 3, 10, ['silver_lance'], AIBehavior.Defensive)],
    victoryConditions: [{ type: VictoryCondition.Rout }],
    defeatConditions: [{ type: DefeatCondition.LordDies }],
    reinforcements: [],
    treasures: [{ position: position(20, 6), itemId: 'dracoshield', requiresKey: true }],
    narrative: [
      {
        trigger: 'preBattle',
        dialogue: [
          { speaker: 'Tiber', text: 'This drill simulates a full fortress break.' },
          { speaker: 'Garrick', text: 'Then we run it without mistakes.' },
        ],
      },
      {
        trigger: 'postBattle',
        dialogue: [
          { speaker: 'Garrick', text: 'Formation discipline improved across every unit.' },
          { speaker: 'Tiber', text: 'Exactly what we needed.' },
        ],
      },
    ],
    weather: Weather.Clear,
    rewards: {
      goldReward: 2100,
      expBonus: 340,
      itemRewards: ['dracoshield'],
      unlockedChapters: [],
    },
    nextChapterId: null,
  },
  {
    id: 'px_9',
    number: 109,
    title: 'Desert Convoy',
    description: 'Unlock: Own at least 3 mounted units. Escort supply wagons through outpost fire.',
    mapId: 'map_desert_outpost_14',
    deploymentSlots: deploymentSlots('map_desert_outpost_14', 10),
    maxDeployments: 10,
    enemies: [
      enemy('enemy_elite_02', UnitClassName.Paladin, 22, 10, 6, ['silver_lance'], AIBehavior.Defensive),
      enemy('enemy_elite_08', UnitClassName.DarkKnight, 22, 11, 7, ['thoron'], AIBehavior.Boss, true, 'guiding_ring'),
      enemy('enemy_elite_06', UnitClassName.Sniper, 22, 12, 8, ['silver_bow'], AIBehavior.Defensive),
    ],
    allies: [enemy('npc_captain_hale', UnitClassName.Paladin, 12, 3, 7, ['silver_lance'], AIBehavior.Defensive)],
    victoryConditions: [{ type: VictoryCondition.ProtectTarget, targetUnitId: 'npc_captain_hale' }],
    defeatConditions: [{ type: DefeatCondition.LordDies }],
    reinforcements: [],
    treasures: [{ position: position(7, 7), itemId: 'guiding_ring', requiresKey: true }],
    narrative: [
      {
        trigger: 'preBattle',
        dialogue: [
          { speaker: 'Hale', text: 'Convoy cannot survive another ambush run.' },
          { speaker: 'Alaric', text: 'Then this escort reaches the city intact.' },
        ],
      },
      {
        trigger: 'postBattle',
        dialogue: [
          { speaker: 'Hale', text: 'Convoy delivered. We made it.' },
          { speaker: 'Alaric', text: 'Good work. These supplies save lives.' },
        ],
      },
    ],
    weather: Weather.Clear,
    rewards: {
      goldReward: 2200,
      expBonus: 360,
      itemRewards: ['guiding_ring'],
      unlockedChapters: [],
    },
    nextChapterId: null,
  },
  {
    id: 'px_10',
    number: 110,
    title: 'Final Muster',
    description: 'Unlock: Complete all prior paralogues. Hold the royal road against elite waves.',
    mapId: 'map_royal_road_24',
    deploymentSlots: deploymentSlots('map_royal_road_24', 12),
    maxDeployments: 12,
    enemies: [
      enemy('enemy_elite_05', UnitClassName.General, 24, 17, 10, ['silver_lance'], AIBehavior.Defensive),
      enemy('enemy_elite_06', UnitClassName.Sniper, 24, 18, 11, ['silver_bow'], AIBehavior.Defensive),
      enemy('enemy_elite_08', UnitClassName.DarkKnight, 24, 19, 10, ['thoron'], AIBehavior.Boss),
      enemy('enemy_commander_02', UnitClassName.Sage, 25, 20, 11, ['bolganone'], AIBehavior.Boss, true, 'master_seal'),
    ],
    allies: [enemy('npc_healer_lune', UnitClassName.Cleric, 14, 3, 11, ['physic_staff'], AIBehavior.Support)],
    victoryConditions: [{ type: VictoryCondition.Survive, surviveTurns: 12 }],
    defeatConditions: [{ type: DefeatCondition.LordDies }],
    reinforcements: [],
    treasures: [{ position: position(22, 20), itemId: 'master_seal', requiresKey: true }],
    narrative: [
      {
        trigger: 'preBattle',
        dialogue: [
          { speaker: 'Alaric', text: 'Every side battle led to this final muster.' },
          { speaker: 'Tiber', text: 'Then we hold this road and prove our readiness.' },
        ],
      },
      {
        trigger: 'postBattle',
        dialogue: [
          { speaker: 'Alaric', text: 'All units stood firm. We are ready for any war to come.' },
          { speaker: 'Elena', text: 'And ready to protect the peace we fought for.' },
        ],
      },
    ],
    weather: Weather.Clear,
    rewards: {
      goldReward: 3000,
      expBonus: 500,
      itemRewards: ['master_seal'],
      unlockedChapters: [],
    },
    nextChapterId: null,
  },
];

export function getParalogueById(id: string): ChapterDefinition | null {
  return PARALOGUES.find((entry) => entry.id === id) ?? null;
}

export function getAllParalogues(): ChapterDefinition[] {
  return PARALOGUES.map((chapter) => ({
    ...chapter,
    deploymentSlots: chapter.deploymentSlots.map((slot) => ({ ...slot })),
    enemies: chapter.enemies.map((entry) => ({
      ...entry,
      position: { ...entry.position },
      equipment: [...entry.equipment],
    })),
    allies: chapter.allies.map((entry) => ({
      ...entry,
      position: { ...entry.position },
      equipment: [...entry.equipment],
    })),
    victoryConditions: chapter.victoryConditions.map((condition) => ({ ...condition })),
    defeatConditions: chapter.defeatConditions.map((condition) => ({ ...condition })),
    reinforcements: chapter.reinforcements.map((trigger) => ({
      condition: { ...trigger.condition },
      enemies: trigger.enemies.map((entry) => ({
        ...entry,
        position: { ...entry.position },
        equipment: [...entry.equipment],
      })),
    })),
    treasures: chapter.treasures.map((treasure) => ({
      ...treasure,
      position: { ...treasure.position },
    })),
    narrative: chapter.narrative.map((event) => ({
      ...event,
      trigger: typeof event.trigger === 'string' ? event.trigger : { ...event.trigger },
      dialogue: event.dialogue.map((line) => ({ ...line })),
    })),
    rewards: {
      ...chapter.rewards,
      itemRewards: [...chapter.rewards.itemRewards],
      unlockedChapters: [...chapter.rewards.unlockedChapters],
    },
  }));
}
