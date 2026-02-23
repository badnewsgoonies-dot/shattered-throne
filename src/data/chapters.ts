import {
  AIBehavior,
  ChapterDefinition,
  DefeatCondition,
  DefeatConditionDef,
  DialogueLine,
  EnemyPlacement,
  NarrativeEvent,
  Position,
  ReinforcementTrigger,
  SupportRank,
  TreasureLocation,
  UnitClassName,
  VictoryCondition,
  VictoryConditionDef,
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
    const x = i % 2;
    const y = startY + Math.floor(i / 2);
    slots.push({ x, y });
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

function ally(
  characterId: string,
  className: UnitClassName,
  level: number,
  x: number,
  y: number,
  equipment: string[],
  aiBehavior: AIBehavior,
): EnemyPlacement {
  return enemy(characterId, className, level, x, y, equipment, aiBehavior, false);
}

function lines(raw: Array<[string, string, DialogueLine['emotion']?]>): DialogueLine[] {
  return raw.map(([speaker, text, emotion]) => ({ speaker, text, emotion }));
}

function narrative(pre: DialogueLine[], post: DialogueLine[], extras: NarrativeEvent[] = []): NarrativeEvent[] {
  return [
    { trigger: 'preBattle', dialogue: pre },
    ...extras,
    { trigger: 'postBattle', dialogue: post },
  ];
}

function victory(...conditions: VictoryConditionDef[]): VictoryConditionDef[] {
  return conditions;
}

function defeat(...conditions: DefeatConditionDef[]): DefeatConditionDef[] {
  return conditions;
}

function treasures(...entries: Array<[number, number, string, boolean]>): TreasureLocation[] {
  return entries.map(([x, y, itemId, requiresKey]) => ({ position: position(x, y), itemId, requiresKey }));
}

function reinforcements(...entries: ReinforcementTrigger[]): ReinforcementTrigger[] {
  return entries;
}

export const CHAPTERS: ChapterDefinition[] = [
  {
    id: 'ch_1',
    number: 1,
    title: 'Ashes at Dawn',
    description: 'Alaric launches his first counterattack at the border outpost.',
    mapId: 'map_borderlands_08',
    deploymentSlots: deploymentSlots('map_borderlands_08', 4),
    maxDeployments: 4,
    enemies: [
      enemy('enemy_bandit_01', UnitClassName.Warrior, 3, 5, 2, ['iron_axe'], AIBehavior.Aggressive),
      enemy('enemy_bandit_02', UnitClassName.Warrior, 3, 6, 3, ['iron_axe'], AIBehavior.Aggressive),
      enemy('enemy_bandit_03', UnitClassName.Warrior, 4, 6, 5, ['steel_axe'], AIBehavior.Aggressive),
      enemy('enemy_soldier_01', UnitClassName.Knight, 4, 7, 4, ['iron_lance'], AIBehavior.Defensive),
    ],
    allies: [],
    victoryConditions: victory({ type: VictoryCondition.Rout }),
    defeatConditions: defeat({ type: DefeatCondition.LordDies }),
    reinforcements: reinforcements({
      condition: { type: 'turn', turn: 3 },
      enemies: [
        enemy('enemy_bandit_04', UnitClassName.Warrior, 4, 7, 1, ['iron_axe'], AIBehavior.Aggressive),
        enemy('enemy_bandit_05', UnitClassName.Warrior, 4, 7, 6, ['iron_axe'], AIBehavior.Aggressive),
      ],
    }),
    treasures: treasures([7, 7, 'vulnerary', false]),
    narrative: narrative(
      lines([
        ['Alaric', 'This is where we take our first stand.'],
        ['Elena', 'Then let it be the first place we free.'],
      ]),
      lines([
        ['Marcus', 'The road is clear for now.'],
        ['Alaric', 'We move before the empire regroups.'],
      ]),
    ),
    weather: Weather.Clear,
    rewards: {
      goldReward: 500,
      expBonus: 120,
      itemRewards: ['vulnerary'],
      unlockedChapters: ['ch_2'],
    },
    nextChapterId: 'ch_2',
  },
  {
    id: 'ch_2',
    number: 2,
    title: 'Raiders in the Wood',
    description: 'Morcant attempts to pin the resistance in dense woodland.',
    mapId: 'map_woodland_10',
    deploymentSlots: deploymentSlots('map_woodland_10', 5),
    maxDeployments: 5,
    enemies: [
      enemy('enemy_bandit_02', UnitClassName.Warrior, 4, 6, 2, ['iron_axe'], AIBehavior.Aggressive),
      enemy('enemy_bandit_03', UnitClassName.Warrior, 5, 7, 3, ['steel_axe'], AIBehavior.Aggressive),
      enemy('enemy_bandit_06', UnitClassName.Thief, 5, 8, 4, ['steel_sword'], AIBehavior.Flanker),
      enemy('enemy_soldier_05', UnitClassName.Archer, 5, 7, 6, ['iron_bow'], AIBehavior.Defensive),
      enemy('boss_morcant', UnitClassName.Warrior, 7, 9, 5, ['steel_axe', 'vulnerary'], AIBehavior.Boss, true, 'door_key'),
    ],
    allies: [],
    victoryConditions: victory({ type: VictoryCondition.BossKill, targetUnitId: 'boss_morcant' }),
    defeatConditions: defeat({ type: DefeatCondition.LordDies }),
    reinforcements: reinforcements({
      condition: { type: 'turn', turn: 5 },
      enemies: [
        enemy('enemy_bandit_07', UnitClassName.Thief, 6, 9, 0, ['steel_sword'], AIBehavior.Flanker),
        enemy('enemy_bandit_08', UnitClassName.Thief, 6, 9, 9, ['steel_sword'], AIBehavior.Flanker),
      ],
    }),
    treasures: treasures([8, 8, 'chest_key', true]),
    narrative: narrative(
      lines([
        ['Morcant', 'Burn their camp and leave none alive.'],
        ['Alaric', 'Morcant. Your cruelty ends here.'],
      ]),
      lines([
        ['Morcant', 'You cannot stop the empire...'],
        ['Lira', 'We just did.'],
      ]),
      [
        {
          trigger: { type: 'turn', turn: 4 },
          dialogue: lines([
            ['Kael', 'More footsteps in the east treeline.'],
            ['Alaric', 'Hold formation and finish this quickly.'],
          ]),
        },
      ],
    ),
    weather: Weather.Rain,
    rewards: {
      goldReward: 700,
      expBonus: 140,
      itemRewards: ['door_key'],
      unlockedChapters: ['ch_3'],
    },
    nextChapterId: 'ch_3',
  },
  {
    id: 'ch_3',
    number: 3,
    title: 'Bridge of Resolve',
    description: 'Cross the river while protecting Roland’s militia.',
    mapId: 'map_river_crossing_12',
    deploymentSlots: deploymentSlots('map_river_crossing_12', 6),
    maxDeployments: 6,
    enemies: [
      enemy('enemy_soldier_01', UnitClassName.Knight, 5, 7, 5, ['iron_lance'], AIBehavior.Defensive),
      enemy('enemy_soldier_02', UnitClassName.Knight, 6, 7, 6, ['steel_lance'], AIBehavior.Defensive),
      enemy('enemy_soldier_05', UnitClassName.Archer, 5, 9, 4, ['iron_bow'], AIBehavior.Defensive),
      enemy('enemy_mage_01', UnitClassName.Mage, 6, 10, 7, ['fire'], AIBehavior.Support),
      enemy('enemy_mage_07', UnitClassName.Cleric, 6, 11, 5, ['heal_staff'], AIBehavior.Support),
    ],
    allies: [ally('npc_roland', UnitClassName.Knight, 6, 3, 5, ['iron_lance'], AIBehavior.Defensive)],
    victoryConditions: victory({ type: VictoryCondition.ReachLocation, targetPosition: position(11, 5) }),
    defeatConditions: defeat(
      { type: DefeatCondition.LordDies },
      { type: DefeatCondition.ProtectedUnitDies, protectedUnitId: 'npc_roland' },
    ),
    reinforcements: reinforcements({
      condition: { type: 'turn', turn: 4 },
      enemies: [
        enemy('enemy_soldier_03', UnitClassName.Knight, 6, 10, 0, ['javelin'], AIBehavior.Defensive),
        enemy('enemy_soldier_06', UnitClassName.Archer, 6, 10, 11, ['steel_bow'], AIBehavior.Defensive),
      ],
    }),
    treasures: treasures([11, 10, 'concoction', true]),
    narrative: narrative(
      lines([
        ['Roland', 'My militia can hold the near bank, but not for long.'],
        ['Alaric', 'Then we secure the far side before they collapse.'],
      ]),
      lines([
        ['Roland', 'The bridge is ours. The town can evacuate now.'],
        ['Theron', 'And the empire just lost its fastest crossing.'],
      ]),
    ),
    weather: Weather.Fog,
    rewards: {
      goldReward: 800,
      expBonus: 160,
      itemRewards: ['concoction'],
      unlockedChapters: ['ch_4'],
    },
    nextChapterId: 'ch_4',
  },
  {
    id: 'ch_4',
    number: 4,
    title: 'The Hill Fort',
    description: 'Storm Vargan’s mountain fort before reinforcements arrive.',
    mapId: 'map_hill_fort_12',
    deploymentSlots: deploymentSlots('map_hill_fort_12', 6),
    maxDeployments: 6,
    enemies: [
      enemy('enemy_soldier_02', UnitClassName.Knight, 6, 6, 2, ['steel_lance'], AIBehavior.Defensive),
      enemy('enemy_soldier_03', UnitClassName.Knight, 6, 7, 3, ['javelin'], AIBehavior.Defensive),
      enemy('enemy_mage_02', UnitClassName.Mage, 6, 8, 5, ['wind'], AIBehavior.Support),
      enemy('enemy_soldier_07', UnitClassName.Archer, 7, 8, 7, ['longbow'], AIBehavior.Defensive),
      enemy('boss_vargan', UnitClassName.General, 10, 6, 6, ['silver_lance', 'vulnerary'], AIBehavior.Boss, true, 'knight_crest'),
    ],
    allies: [],
    victoryConditions: victory({ type: VictoryCondition.BossKill, targetUnitId: 'boss_vargan' }),
    defeatConditions: defeat({ type: DefeatCondition.LordDies }),
    reinforcements: reinforcements({
      condition: { type: 'turn', turn: 6 },
      enemies: [
        enemy('enemy_bandit_05', UnitClassName.Warrior, 7, 11, 1, ['killer_axe'], AIBehavior.Aggressive),
        enemy('enemy_bandit_05', UnitClassName.Warrior, 7, 11, 10, ['killer_axe'], AIBehavior.Aggressive),
      ],
    }),
    treasures: treasures([6, 6, 'steel_helm', false]),
    narrative: narrative(
      lines([
        ['Vargan', 'Break yourselves against my walls if you must.'],
        ['Alaric', 'Walls do not protect tyrants forever.'],
      ]),
      lines([
        ['Vargan', 'How... did this fort fall...'],
        ['Kael', 'Because you never watched the back gate.'],
      ]),
      [
        {
          trigger: { type: 'location', position: position(6, 6) },
          dialogue: lines([
            ['Marcus', 'Center courtyard secured. Press the keep!'],
            ['Alaric', 'No retreat. End this now.'],
          ]),
        },
      ],
    ),
    weather: Weather.Clear,
    rewards: {
      goldReward: 900,
      expBonus: 180,
      itemRewards: ['knight_crest'],
      unlockedChapters: ['ch_5'],
    },
    nextChapterId: 'ch_5',
  },
  {
    id: 'ch_5',
    number: 5,
    title: 'Harbor Fire',
    description: 'Defend civilians during the port bombardment.',
    mapId: 'map_port_siege_14',
    deploymentSlots: deploymentSlots('map_port_siege_14', 7),
    maxDeployments: 7,
    enemies: [
      enemy('enemy_bandit_04', UnitClassName.Warrior, 7, 7, 4, ['steel_axe'], AIBehavior.Aggressive),
      enemy('enemy_soldier_06', UnitClassName.Archer, 7, 9, 5, ['steel_bow'], AIBehavior.Defensive),
      enemy('enemy_soldier_07', UnitClassName.Archer, 7, 10, 8, ['longbow'], AIBehavior.Defensive),
      enemy('enemy_mage_03', UnitClassName.Mage, 8, 12, 6, ['thunder'], AIBehavior.Support),
      enemy('enemy_mage_04', UnitClassName.Mage, 8, 12, 10, ['elfire'], AIBehavior.Support),
      enemy('enemy_bandit_07', UnitClassName.Thief, 8, 11, 3, ['killing_edge'], AIBehavior.Flanker),
    ],
    allies: [ally('npc_sister_ada', UnitClassName.Cleric, 7, 3, 6, ['mend_staff'], AIBehavior.Support)],
    victoryConditions: victory({ type: VictoryCondition.Survive, surviveTurns: 8 }),
    defeatConditions: defeat(
      { type: DefeatCondition.LordDies },
      { type: DefeatCondition.ProtectedUnitDies, protectedUnitId: 'npc_sister_ada' },
    ),
    reinforcements: reinforcements(
      {
        condition: { type: 'turn', turn: 3 },
        enemies: [enemy('enemy_bandit_06', UnitClassName.Thief, 8, 13, 1, ['steel_sword'], AIBehavior.Flanker)],
      },
      {
        condition: { type: 'turn', turn: 6 },
        enemies: [enemy('enemy_soldier_04', UnitClassName.Knight, 8, 13, 12, ['steel_lance'], AIBehavior.Defensive)],
      },
    ),
    treasures: treasures(
      [12, 2, 'antidote', true],
      [12, 11, 'pure_water', true],
    ),
    narrative: narrative(
      lines([
        ['Elena', 'They are firing on evacuation ships!'],
        ['Alaric', 'Then we hold until every civilian is aboard.'],
      ]),
      lines([
        ['Mira', 'Last transport has cleared the bay.'],
        ['Alaric', 'Good. Fall back in order.'],
      ]),
      [
        {
          trigger: { type: 'turn', turn: 5 },
          dialogue: lines([
            ['Kael', 'Dockside saboteurs incoming from the east.'],
            ['Alaric', 'Intercept them before they reach the ships.'],
          ]),
        },
      ],
    ),
    weather: Weather.Rain,
    rewards: {
      goldReward: 1200,
      expBonus: 220,
      itemRewards: ['mend_staff', 'antidote'],
      unlockedChapters: ['ch_6'],
    },
    nextChapterId: 'ch_6',
  },
  {
    id: 'ch_6',
    number: 6,
    title: 'Echoes in Stone',
    description: 'Retake the cathedral and defeat Helric on the upper steps.',
    mapId: 'map_cathedral_12',
    deploymentSlots: deploymentSlots('map_cathedral_12', 7),
    maxDeployments: 7,
    enemies: [
      enemy('enemy_soldier_08', UnitClassName.Archer, 8, 8, 4, ['killer_bow'], AIBehavior.Defensive),
      enemy('enemy_soldier_07', UnitClassName.Archer, 8, 9, 5, ['longbow'], AIBehavior.Defensive),
      enemy('enemy_soldier_03', UnitClassName.Knight, 8, 7, 6, ['javelin'], AIBehavior.Defensive),
      enemy('enemy_mage_04', UnitClassName.Mage, 9, 9, 8, ['elfire'], AIBehavior.Support),
      enemy('enemy_mage_07', UnitClassName.Cleric, 9, 10, 6, ['mend_staff'], AIBehavior.Support),
      enemy('boss_helric', UnitClassName.Sniper, 12, 10, 3, ['killer_bow', 'longbow'], AIBehavior.Boss, true, 'orions_bolt'),
    ],
    allies: [ally('seraphina', UnitClassName.Dancer, 5, 2, 10, ['slim_sword'], AIBehavior.Support)],
    victoryConditions: victory({ type: VictoryCondition.BossKill, targetUnitId: 'boss_helric' }),
    defeatConditions: defeat({ type: DefeatCondition.LordDies }),
    reinforcements: reinforcements({
      condition: { type: 'turn', turn: 4 },
      enemies: [
        enemy('enemy_soldier_06', UnitClassName.Archer, 8, 11, 1, ['steel_bow'], AIBehavior.Defensive),
        enemy('enemy_soldier_06', UnitClassName.Archer, 8, 11, 10, ['steel_bow'], AIBehavior.Defensive),
      ],
    }),
    treasures: treasures([5, 3, 'orions_bolt', true]),
    narrative: narrative(
      lines([
        ['Helric', 'The bells ring for your funeral, rebels.'],
        ['Seraphina', 'Then let us change the tune.'],
      ]),
      lines([
        ['Helric', 'Impossible... my range was perfect...'],
        ['Lira', 'Perfect aim means nothing against better strategy.'],
      ]),
    ),
    weather: Weather.Clear,
    rewards: {
      goldReward: 1300,
      expBonus: 240,
      itemRewards: ['orions_bolt', 'speedwing'],
      unlockedChapters: ['ch_7'],
    },
    nextChapterId: 'ch_7',
  },
  {
    id: 'ch_7',
    number: 7,
    title: 'Through the Pass',
    description: 'Escort Captain Hale through mountain chokepoints.',
    mapId: 'map_mountain_pass_16',
    deploymentSlots: deploymentSlots('map_mountain_pass_16', 8),
    maxDeployments: 8,
    enemies: [
      enemy('enemy_bandit_05', UnitClassName.Warrior, 9, 8, 5, ['killer_axe'], AIBehavior.Aggressive),
      enemy('enemy_bandit_06', UnitClassName.Thief, 9, 9, 6, ['steel_sword'], AIBehavior.Flanker),
      enemy('enemy_soldier_04', UnitClassName.Knight, 9, 10, 8, ['steel_lance'], AIBehavior.Defensive),
      enemy('enemy_soldier_07', UnitClassName.Archer, 9, 12, 9, ['longbow'], AIBehavior.Defensive),
      enemy('enemy_mage_03', UnitClassName.Mage, 9, 11, 7, ['thunder'], AIBehavior.Support),
      enemy('enemy_mage_05', UnitClassName.Mage, 10, 13, 10, ['elthunder'], AIBehavior.Support),
    ],
    allies: [ally('npc_captain_hale', UnitClassName.Paladin, 10, 2, 2, ['steel_lance'], AIBehavior.Defensive)],
    victoryConditions: victory({ type: VictoryCondition.ProtectTarget, targetUnitId: 'npc_captain_hale' }),
    defeatConditions: defeat(
      { type: DefeatCondition.LordDies },
      { type: DefeatCondition.ProtectedUnitDies, protectedUnitId: 'npc_captain_hale' },
    ),
    reinforcements: reinforcements({
      condition: { type: 'turn', turn: 5 },
      enemies: [
        enemy('enemy_bandit_08', UnitClassName.Thief, 10, 15, 14, ['levin_sword'], AIBehavior.Flanker),
        enemy('enemy_bandit_08', UnitClassName.Thief, 10, 15, 2, ['levin_sword'], AIBehavior.Flanker),
      ],
    }),
    treasures: treasures([15, 15, 'master_key', true]),
    narrative: narrative(
      lines([
        ['Captain Hale', 'One slip and the pass closes behind us.'],
        ['Alaric', 'Then we do not slip. Move!'],
      ]),
      lines([
        ['Captain Hale', 'Path is secure. My riders are yours.'],
        ['Marcus', 'Welcome to the line, captain.'],
      ]),
    ),
    weather: Weather.Fog,
    rewards: {
      goldReward: 1400,
      expBonus: 260,
      itemRewards: ['master_key'],
      unlockedChapters: ['ch_8'],
    },
    nextChapterId: 'ch_8',
  },
  {
    id: 'ch_8',
    number: 8,
    title: 'Dunes of Nightfire',
    description: 'Selene’s dark cavalry blocks the desert supply line.',
    mapId: 'map_desert_outpost_14',
    deploymentSlots: deploymentSlots('map_desert_outpost_14', 8),
    maxDeployments: 8,
    enemies: [
      enemy('enemy_soldier_03', UnitClassName.Knight, 10, 8, 5, ['javelin'], AIBehavior.Defensive),
      enemy('enemy_soldier_04', UnitClassName.Knight, 10, 9, 6, ['steel_lance'], AIBehavior.Defensive),
      enemy('enemy_mage_04', UnitClassName.Mage, 10, 10, 7, ['elfire'], AIBehavior.Support),
      enemy('enemy_mage_05', UnitClassName.Mage, 11, 11, 8, ['elthunder'], AIBehavior.Support),
      enemy('enemy_elite_02', UnitClassName.Paladin, 11, 12, 6, ['silver_lance'], AIBehavior.Defensive),
      enemy('enemy_elite_08', UnitClassName.DarkKnight, 12, 12, 9, ['flux'], AIBehavior.Boss),
      enemy('boss_selene', UnitClassName.DarkKnight, 14, 12, 7, ['thoron', 'runesword'], AIBehavior.Boss, true, 'guiding_ring'),
    ],
    allies: [],
    victoryConditions: victory({ type: VictoryCondition.BossKill, targetUnitId: 'boss_selene' }),
    defeatConditions: defeat({ type: DefeatCondition.LordDies }),
    reinforcements: reinforcements({
      condition: { type: 'turn', turn: 6 },
      enemies: [
        enemy('enemy_elite_07', UnitClassName.Ranger, 11, 13, 2, ['silver_bow'], AIBehavior.Flanker),
        enemy('enemy_elite_11', UnitClassName.Trickster, 11, 13, 12, ['levin_sword'], AIBehavior.Flanker),
      ],
    }),
    treasures: treasures([7, 7, 'guiding_ring', true]),
    narrative: narrative(
      lines([
        ['Selene', 'Defectors die in the sand.'],
        ['Theron', 'Then I will carve my freedom in stone.'],
      ]),
      lines([
        ['Selene', 'The emperor... will avenge this...'],
        ['Alaric', 'Tell him we are already at his gates.'],
      ]),
    ),
    weather: Weather.Clear,
    rewards: {
      goldReward: 1600,
      expBonus: 280,
      itemRewards: ['guiding_ring', 'spirit_dust'],
      unlockedChapters: ['ch_9'],
    },
    nextChapterId: 'ch_9',
  },
  {
    id: 'ch_9',
    number: 9,
    title: 'Frozen Vow',
    description: 'Hold the frozen lake while Isolde’s riders regroup.',
    mapId: 'map_frozen_lake_16',
    deploymentSlots: deploymentSlots('map_frozen_lake_16', 8),
    maxDeployments: 8,
    enemies: [
      enemy('enemy_soldier_06', UnitClassName.Archer, 11, 10, 5, ['steel_bow'], AIBehavior.Defensive),
      enemy('enemy_soldier_07', UnitClassName.Archer, 11, 11, 6, ['longbow'], AIBehavior.Defensive),
      enemy('enemy_elite_02', UnitClassName.Paladin, 12, 12, 7, ['silver_lance'], AIBehavior.Defensive),
      enemy('enemy_elite_05', UnitClassName.General, 12, 13, 8, ['silver_lance'], AIBehavior.Defensive),
      enemy('enemy_elite_10', UnitClassName.Valkyrie, 12, 11, 9, ['lightning'], AIBehavior.Support),
      enemy('enemy_elite_04', UnitClassName.Sage, 12, 12, 10, ['arcfire'], AIBehavior.Support),
    ],
    allies: [ally('isolde', UnitClassName.Paladin, 10, 3, 14, ['steel_lance'], AIBehavior.Defensive)],
    victoryConditions: victory({ type: VictoryCondition.Survive, surviveTurns: 10 }),
    defeatConditions: defeat({ type: DefeatCondition.LordDies }),
    reinforcements: reinforcements({
      condition: { type: 'turn', turn: 7 },
      enemies: [
        enemy('enemy_elite_06', UnitClassName.Sniper, 12, 15, 4, ['killer_bow'], AIBehavior.Defensive),
        enemy('enemy_elite_03', UnitClassName.Assassin, 12, 15, 11, ['killing_edge'], AIBehavior.Flanker),
      ],
    }),
    treasures: treasures([8, 8, 'silver_helm', false]),
    narrative: narrative(
      lines([
        ['Isolde', 'My riders need time to circle the flank. Hold this line.'],
        ['Alaric', 'Then we hold. No matter the cold.'],
      ]),
      lines([
        ['Isolde', 'Flank complete. Their line is broken.'],
        ['Alaric', 'Then we march on the capital road.'],
      ]),
    ),
    weather: Weather.Snow,
    rewards: {
      goldReward: 1700,
      expBonus: 300,
      itemRewards: ['silver_helm', 'elysian_whip'],
      unlockedChapters: ['ch_10'],
    },
    nextChapterId: 'ch_10',
  },
  {
    id: 'ch_10',
    number: 10,
    title: 'Gatebreaker',
    description: 'Assault Bastion at the capital gate and open the road inward.',
    mapId: 'map_capital_gate_18',
    deploymentSlots: deploymentSlots('map_capital_gate_18', 9),
    maxDeployments: 9,
    enemies: [
      enemy('enemy_elite_01', UnitClassName.Berserker, 13, 11, 6, ['killer_axe'], AIBehavior.Aggressive),
      enemy('enemy_elite_02', UnitClassName.Paladin, 13, 12, 7, ['silver_lance'], AIBehavior.Defensive),
      enemy('enemy_elite_06', UnitClassName.Sniper, 13, 14, 8, ['killer_bow'], AIBehavior.Defensive),
      enemy('enemy_elite_04', UnitClassName.Sage, 13, 15, 6, ['arcfire'], AIBehavior.Support),
      enemy('enemy_elite_05', UnitClassName.General, 14, 16, 7, ['silver_lance'], AIBehavior.Defensive),
      enemy('enemy_elite_09', UnitClassName.Bishop, 14, 16, 9, ['physic_staff'], AIBehavior.Support),
      enemy('boss_bastion', UnitClassName.General, 16, 16, 8, ['gradivus', 'fortify_staff'], AIBehavior.Boss, true, 'master_seal'),
    ],
    allies: [],
    victoryConditions: victory({ type: VictoryCondition.BossKill, targetUnitId: 'boss_bastion' }),
    defeatConditions: defeat({ type: DefeatCondition.LordDies }, { type: DefeatCondition.TimerExpires, turnLimit: 15 }),
    reinforcements: reinforcements(
      {
        condition: { type: 'turn', turn: 5 },
        enemies: [
          enemy('enemy_elite_07', UnitClassName.Ranger, 14, 17, 2, ['silver_bow'], AIBehavior.Flanker),
          enemy('enemy_elite_12', UnitClassName.GreatKnight, 14, 17, 13, ['silver_lance'], AIBehavior.Defensive),
        ],
      },
      {
        condition: { type: 'turn', turn: 9 },
        enemies: [enemy('enemy_elite_03', UnitClassName.Assassin, 15, 17, 8, ['killing_edge'], AIBehavior.Flanker)],
      },
    ),
    treasures: treasures(
      [16, 6, 'master_seal', true],
      [16, 10, 'silver_plate', true],
    ),
    narrative: narrative(
      lines([
        ['Bastion', 'None pass the gate while I draw breath.'],
        ['Alaric', 'Then this gate opens today.'],
      ]),
      lines([
        ['Bastion', 'The walls... have failed...'],
        ['Marcus', 'Gate is ours! Push into the capital district!'],
      ]),
      [
        {
          trigger: { type: 'turn', turn: 8 },
          dialogue: lines([
            ['Theron', 'Arcane signals from deeper inside the city.'],
            ['Alaric', 'Then we keep moving. No pause.'],
          ]),
        },
      ],
    ),
    weather: Weather.Clear,
    rewards: {
      goldReward: 2200,
      expBonus: 360,
      itemRewards: ['master_seal', 'dracoshield'],
      unlockedChapters: ['ch_11'],
    },
    nextChapterId: 'ch_11',
  },

  // Chapters 11-25 (valid structured entries)
  {
    id: 'ch_11',
    number: 11,
    title: 'Marsh of Whispers',
    description: 'Advance through the black marsh while avoiding hidden ambushes.',
    mapId: 'map_black_marsh_16',
    deploymentSlots: deploymentSlots('map_black_marsh_16', 9),
    maxDeployments: 9,
    enemies: [
      enemy('enemy_elite_03', UnitClassName.Assassin, 15, 12, 6, ['killing_edge'], AIBehavior.Flanker),
      enemy('enemy_elite_04', UnitClassName.Sage, 15, 13, 7, ['arcfire'], AIBehavior.Support),
      enemy('enemy_elite_10', UnitClassName.Valkyrie, 15, 14, 8, ['lightning'], AIBehavior.Support),
      enemy('enemy_mage_06', UnitClassName.Mage, 14, 10, 5, ['arcthunder'], AIBehavior.Support),
      enemy('enemy_soldier_08', UnitClassName.Archer, 14, 11, 9, ['killer_bow'], AIBehavior.Defensive),
    ],
    allies: [ally('npc_scout_ivy', UnitClassName.Archer, 8, 2, 8, ['steel_bow'], AIBehavior.Support)],
    victoryConditions: victory({ type: VictoryCondition.Rout }),
    defeatConditions: defeat({ type: DefeatCondition.LordDies }),
    reinforcements: [],
    treasures: treasures([14, 2, 'torch', false]),
    narrative: narrative(
      lines([
        ['Ivy', 'Marsh mist hides movement. Keep formation tight.'],
        ['Alaric', 'Eyes open. We clear this swamp together.'],
      ]),
      lines([
        ['Kael', 'No more footsteps in the reeds.'],
        ['Alaric', 'Good. We push toward the ruins.'],
      ]),
    ),
    weather: Weather.Fog,
    rewards: {
      goldReward: 1800,
      expBonus: 320,
      itemRewards: ['torch'],
      unlockedChapters: ['ch_12'],
    },
    nextChapterId: 'ch_12',
  },
  {
    id: 'ch_12',
    number: 12,
    title: 'Catacomb Oath',
    description: 'Defeat Dreadlord Xev beneath the ancient ruins.',
    mapId: 'map_ancient_ruins_14',
    deploymentSlots: deploymentSlots('map_ancient_ruins_14', 9),
    maxDeployments: 9,
    enemies: [
      enemy('enemy_elite_04', UnitClassName.Sage, 16, 10, 4, ['arcfire'], AIBehavior.Support),
      enemy('enemy_elite_09', UnitClassName.Bishop, 16, 11, 5, ['physic_staff'], AIBehavior.Support),
      enemy('enemy_elite_11', UnitClassName.Trickster, 16, 12, 7, ['levin_sword'], AIBehavior.Flanker),
      enemy('enemy_elite_12', UnitClassName.GreatKnight, 16, 11, 9, ['silver_lance'], AIBehavior.Defensive),
      enemy('boss_dreadlord', UnitClassName.Sage, 18, 12, 6, ['luna', 'fenrir'], AIBehavior.Boss, true, 'talisman'),
    ],
    allies: [],
    victoryConditions: victory({ type: VictoryCondition.BossKill, targetUnitId: 'boss_dreadlord' }),
    defeatConditions: defeat({ type: DefeatCondition.LordDies }),
    reinforcements: reinforcements({
      condition: { type: 'turn', turn: 6 },
      enemies: [enemy('enemy_mage_08', UnitClassName.Cleric, 15, 13, 12, ['restore_staff'], AIBehavior.Support)],
    }),
    treasures: treasures([11, 2, 'talisman', true]),
    narrative: narrative(
      lines([
        ['Dreadlord Xev', 'The catacombs answer only to me.'],
        ['Theron', 'Then we rewrite the oath tonight.'],
      ]),
      lines([
        ['Rhea', 'The seal is broken. The vault is safe.'],
        ['Alaric', 'And the path to the sky bridge is open.'],
      ]),
    ),
    weather: Weather.Clear,
    rewards: {
      goldReward: 2000,
      expBonus: 340,
      itemRewards: ['talisman'],
      unlockedChapters: ['ch_13'],
    },
    nextChapterId: 'ch_13',
  },
  {
    id: 'ch_13',
    number: 13,
    title: 'Bridge Above the Abyss',
    description: 'Secure the sky bridge before imperial fliers arrive.',
    mapId: 'map_sky_bridge_20',
    deploymentSlots: deploymentSlots('map_sky_bridge_20', 10),
    maxDeployments: 10,
    enemies: [
      enemy('enemy_elite_06', UnitClassName.Sniper, 17, 14, 10, ['silver_bow'], AIBehavior.Defensive),
      enemy('enemy_elite_07', UnitClassName.Ranger, 17, 15, 9, ['silver_bow'], AIBehavior.Flanker),
      enemy('enemy_elite_10', UnitClassName.Valkyrie, 17, 16, 10, ['lightning'], AIBehavior.Support),
      enemy('enemy_elite_12', UnitClassName.GreatKnight, 17, 17, 10, ['silver_lance'], AIBehavior.Defensive),
    ],
    allies: [ally('npc_monk_tomas', UnitClassName.Bishop, 12, 2, 10, ['restore_staff'], AIBehavior.Support)],
    victoryConditions: victory({ type: VictoryCondition.ReachLocation, targetPosition: position(19, 10) }),
    defeatConditions: defeat({ type: DefeatCondition.LordDies }),
    reinforcements: reinforcements({
      condition: { type: 'turn', turn: 4 },
      enemies: [enemy('enemy_elite_01', UnitClassName.Berserker, 17, 18, 10, ['killer_axe'], AIBehavior.Aggressive)],
    }),
    treasures: treasures([18, 10, 'speedwing', true]),
    narrative: narrative(
      lines([
        ['Lysandra', 'One misstep and the void takes us.'],
        ['Alaric', 'Then no one missteps.'],
      ]),
      lines([
        ['Orion', 'Bridge secured. Scouts can cross safely now.'],
        ['Alaric', 'Advance to the keep.'],
      ]),
    ),
    weather: Weather.Clear,
    rewards: {
      goldReward: 2100,
      expBonus: 350,
      itemRewards: ['speedwing'],
      unlockedChapters: ['ch_14'],
    },
    nextChapterId: 'ch_14',
  },
  {
    id: 'ch_14',
    number: 14,
    title: 'Crimson Arena',
    description: 'Defeat Vektor and free conscripted fighters.',
    mapId: 'map_obsidian_keep_20',
    deploymentSlots: deploymentSlots('map_obsidian_keep_20', 10),
    maxDeployments: 10,
    enemies: [
      enemy('enemy_elite_01', UnitClassName.Berserker, 18, 14, 8, ['killer_axe'], AIBehavior.Aggressive),
      enemy('enemy_elite_03', UnitClassName.Assassin, 18, 15, 9, ['killing_edge'], AIBehavior.Flanker),
      enemy('enemy_elite_05', UnitClassName.General, 18, 16, 10, ['silver_lance'], AIBehavior.Defensive),
      enemy('enemy_elite_08', UnitClassName.DarkKnight, 18, 17, 8, ['flux'], AIBehavior.Boss),
      enemy('boss_vektor', UnitClassName.Berserker, 19, 18, 9, ['hauteclere'], AIBehavior.Boss, true, 'hero_crest'),
    ],
    allies: [],
    victoryConditions: victory({ type: VictoryCondition.BossKill, targetUnitId: 'boss_vektor' }),
    defeatConditions: defeat({ type: DefeatCondition.LordDies }),
    reinforcements: [],
    treasures: treasures([17, 6, 'hero_crest', true]),
    narrative: narrative(
      lines([
        ['Vektor', 'Step into my ring if you dare!'],
        ['Alaric', 'Your ring is a prison. We are here to open it.'],
      ]),
      lines([
        ['Cedric', 'The prisoners are free.'],
        ['Alaric', 'Good. Send them to camp and move out.'],
      ]),
    ),
    weather: Weather.Clear,
    rewards: {
      goldReward: 2200,
      expBonus: 360,
      itemRewards: ['hero_crest'],
      unlockedChapters: ['ch_15'],
    },
    nextChapterId: 'ch_15',
  },
  {
    id: 'ch_15',
    number: 15,
    title: 'Field of Echoes',
    description: 'Break imperial formations across the crimson fields.',
    mapId: 'map_crimson_fields_18',
    deploymentSlots: deploymentSlots('map_crimson_fields_18', 10),
    maxDeployments: 10,
    enemies: [
      enemy('enemy_elite_02', UnitClassName.Paladin, 18, 12, 6, ['silver_lance'], AIBehavior.Defensive),
      enemy('enemy_elite_06', UnitClassName.Sniper, 18, 13, 7, ['silver_bow'], AIBehavior.Defensive),
      enemy('enemy_elite_07', UnitClassName.Ranger, 18, 14, 8, ['silver_bow'], AIBehavior.Flanker),
      enemy('enemy_elite_12', UnitClassName.GreatKnight, 18, 15, 9, ['silver_lance'], AIBehavior.Defensive),
    ],
    allies: [ally('npc_guardian_owen', UnitClassName.General, 13, 3, 8, ['silver_lance'], AIBehavior.Defensive)],
    victoryConditions: victory({ type: VictoryCondition.Rout }),
    defeatConditions: defeat({ type: DefeatCondition.LordDies }),
    reinforcements: [],
    treasures: treasures([17, 14, 'dracoshield', true]),
    narrative: narrative(
      lines([
        ['Garrick', 'Their line is wide but brittle.'],
        ['Alaric', 'Then we shatter it at the center.'],
      ]),
      lines([
        ['Tiber', 'Field secured. Casualties manageable.'],
        ['Alaric', 'We advance to the temple route.'],
      ]),
    ),
    weather: Weather.Clear,
    rewards: {
      goldReward: 2300,
      expBonus: 370,
      itemRewards: ['dracoshield'],
      unlockedChapters: ['ch_16'],
    },
    nextChapterId: 'ch_16',
  },
  {
    id: 'ch_16',
    number: 16,
    title: 'Sunken Thrones',
    description: 'Defeat Mirielle in the submerged temple halls.',
    mapId: 'map_sunken_temple_16',
    deploymentSlots: deploymentSlots('map_sunken_temple_16', 10),
    maxDeployments: 10,
    enemies: [
      enemy('enemy_elite_09', UnitClassName.Bishop, 19, 10, 5, ['physic_staff'], AIBehavior.Support),
      enemy('enemy_elite_10', UnitClassName.Valkyrie, 19, 11, 6, ['rescue_staff'], AIBehavior.Support),
      enemy('enemy_elite_11', UnitClassName.Trickster, 19, 12, 7, ['levin_sword'], AIBehavior.Flanker),
      enemy('enemy_elite_08', UnitClassName.DarkKnight, 19, 13, 8, ['flux'], AIBehavior.Boss),
      enemy('boss_mirielle', UnitClassName.Valkyrie, 20, 14, 7, ['aura', 'silence_staff'], AIBehavior.Boss, true, 'recover_staff'),
    ],
    allies: [],
    victoryConditions: victory({ type: VictoryCondition.BossKill, targetUnitId: 'boss_mirielle' }),
    defeatConditions: defeat({ type: DefeatCondition.LordDies }),
    reinforcements: [],
    treasures: treasures([8, 7, 'recover_staff', true]),
    narrative: narrative(
      lines([
        ['Mirielle', 'Faith belongs to the empire alone.'],
        ['Rhea', 'Faith belongs to the people.'],
      ]),
      lines([
        ['Rhea', 'The temple is free again.'],
        ['Alaric', 'Then we march on the royal road.'],
      ]),
    ),
    weather: Weather.Rain,
    rewards: {
      goldReward: 2400,
      expBonus: 390,
      itemRewards: ['recover_staff'],
      unlockedChapters: ['ch_17'],
    },
    nextChapterId: 'ch_17',
  },
  {
    id: 'ch_17',
    number: 17,
    title: 'March of Banners',
    description: 'Push along the royal road and break the outer patrol ring.',
    mapId: 'map_royal_road_24',
    deploymentSlots: deploymentSlots('map_royal_road_24', 11),
    maxDeployments: 11,
    enemies: [
      enemy('enemy_elite_02', UnitClassName.Paladin, 20, 15, 10, ['silver_lance'], AIBehavior.Defensive),
      enemy('enemy_elite_06', UnitClassName.Sniper, 20, 16, 11, ['silver_bow'], AIBehavior.Defensive),
      enemy('enemy_elite_07', UnitClassName.Ranger, 20, 17, 12, ['silver_bow'], AIBehavior.Flanker),
      enemy('enemy_elite_12', UnitClassName.GreatKnight, 20, 18, 13, ['silver_lance'], AIBehavior.Defensive),
    ],
    allies: [ally('npc_healer_lune', UnitClassName.Cleric, 14, 3, 11, ['physic_staff'], AIBehavior.Support)],
    victoryConditions: victory({ type: VictoryCondition.Rout }),
    defeatConditions: defeat({ type: DefeatCondition.LordDies }),
    reinforcements: [],
    treasures: treasures([22, 20, 'boots_item', true]),
    narrative: narrative(
      lines([
        ['Yvette', 'Caravan routes are open if we hold this road.'],
        ['Alaric', 'Then we hold it to the capital itself.'],
      ]),
      lines([
        ['Orion', 'Road secured. Supplies can move freely.'],
        ['Alaric', 'Next stop: the bastion walls.'],
      ]),
    ),
    weather: Weather.Clear,
    rewards: {
      goldReward: 2500,
      expBonus: 400,
      itemRewards: ['boots_item'],
      unlockedChapters: ['ch_18'],
    },
    nextChapterId: 'ch_18',
  },
  {
    id: 'ch_18',
    number: 18,
    title: 'Wall of Iron',
    description: 'Break Goreth’s armored line at the bastion walls.',
    mapId: 'map_bastion_walls_22',
    deploymentSlots: deploymentSlots('map_bastion_walls_22', 11),
    maxDeployments: 11,
    enemies: [
      enemy('enemy_elite_05', UnitClassName.General, 21, 16, 8, ['silver_lance'], AIBehavior.Defensive),
      enemy('enemy_elite_12', UnitClassName.GreatKnight, 21, 17, 9, ['silver_lance'], AIBehavior.Defensive),
      enemy('enemy_elite_01', UnitClassName.Berserker, 21, 18, 10, ['killer_axe'], AIBehavior.Aggressive),
      enemy('enemy_elite_06', UnitClassName.Sniper, 21, 19, 11, ['silver_bow'], AIBehavior.Defensive),
      enemy('boss_goreth', UnitClassName.GreatKnight, 22, 20, 10, ['silver_lance', 'tomahawk'], AIBehavior.Boss, true, 'elysian_whip'),
    ],
    allies: [ally('npc_knight_voss', UnitClassName.Paladin, 16, 3, 10, ['silver_lance'], AIBehavior.Defensive)],
    victoryConditions: victory({ type: VictoryCondition.BossKill, targetUnitId: 'boss_goreth' }),
    defeatConditions: defeat({ type: DefeatCondition.LordDies }),
    reinforcements: [],
    treasures: treasures(
      [20, 6, 'elysian_whip', true],
      [20, 15, 'silver_boots', true],
    ),
    narrative: narrative(
      lines([
        ['Goreth', 'Crush them under steel and hoof.'],
        ['Alaric', 'Break their charge and take the wall.'],
      ]),
      lines([
        ['Garrick', 'Wall breach complete.'],
        ['Alaric', 'Into the inner district.'],
      ]),
    ),
    weather: Weather.Clear,
    rewards: {
      goldReward: 2600,
      expBonus: 420,
      itemRewards: ['elysian_whip'],
      unlockedChapters: ['ch_19'],
    },
    nextChapterId: 'ch_19',
  },
  {
    id: 'ch_19',
    number: 19,
    title: 'Forest of Knives',
    description: 'Navigate assassination squads hidden in twilight woods.',
    mapId: 'map_twilight_forest_12',
    deploymentSlots: deploymentSlots('map_twilight_forest_12', 11),
    maxDeployments: 11,
    enemies: [
      enemy('enemy_elite_03', UnitClassName.Assassin, 22, 8, 6, ['killing_edge'], AIBehavior.Flanker),
      enemy('enemy_elite_11', UnitClassName.Trickster, 22, 9, 7, ['levin_sword'], AIBehavior.Flanker),
      enemy('enemy_elite_07', UnitClassName.Ranger, 22, 10, 5, ['silver_bow'], AIBehavior.Flanker),
      enemy('enemy_elite_10', UnitClassName.Valkyrie, 22, 11, 8, ['lightning'], AIBehavior.Support),
    ],
    allies: [],
    victoryConditions: victory({ type: VictoryCondition.Rout }),
    defeatConditions: defeat({ type: DefeatCondition.LordDies }),
    reinforcements: [],
    treasures: treasures([11, 11, 'smoke_bomb', false]),
    narrative: narrative(
      lines([
        ['Petra', 'This forest is full of staged kill zones.'],
        ['Alaric', 'Then we deny them every angle.'],
      ]),
      lines([
        ['Fenric', 'Trail is clear. No shadows moving.'],
        ['Alaric', 'Good. We face the imperial vanguard next.'],
      ]),
    ),
    weather: Weather.Fog,
    rewards: {
      goldReward: 2700,
      expBonus: 430,
      itemRewards: ['smoke_bomb'],
      unlockedChapters: ['ch_20'],
    },
    nextChapterId: 'ch_20',
  },
  {
    id: 'ch_20',
    number: 20,
    title: 'Midnight Pursuit',
    description: 'Hunt down Azrael before he reaches the palace quarter.',
    mapId: 'map_shattered_plains_10',
    deploymentSlots: deploymentSlots('map_shattered_plains_10', 11),
    maxDeployments: 11,
    enemies: [
      enemy('enemy_elite_03', UnitClassName.Assassin, 23, 7, 4, ['killing_edge'], AIBehavior.Flanker),
      enemy('enemy_elite_06', UnitClassName.Sniper, 23, 8, 5, ['silver_bow'], AIBehavior.Defensive),
      enemy('enemy_elite_11', UnitClassName.Trickster, 23, 8, 6, ['levin_sword'], AIBehavior.Flanker),
      enemy('boss_azrael', UnitClassName.Assassin, 23, 9, 5, ['shadowfang', 'smoke_bomb'], AIBehavior.Boss, true, 'energy_drop'),
    ],
    allies: [],
    victoryConditions: victory({ type: VictoryCondition.BossKill, targetUnitId: 'boss_azrael' }),
    defeatConditions: defeat({ type: DefeatCondition.LordDies }),
    reinforcements: [],
    treasures: treasures([9, 1, 'energy_drop', true]),
    narrative: narrative(
      lines([
        ['Azrael', 'You are too late to stop what comes next.'],
        ['Kael', 'Then we stop you first.'],
      ]),
      lines([
        ['Azrael', '...so this is defeat.'],
        ['Alaric', 'One less blade at our back. Move!'],
      ]),
    ),
    weather: Weather.Clear,
    rewards: {
      goldReward: 2800,
      expBonus: 440,
      itemRewards: ['energy_drop'],
      unlockedChapters: ['ch_21'],
    },
    nextChapterId: 'ch_21',
  },
  {
    id: 'ch_21',
    number: 21,
    title: 'Floodgate',
    description: 'Seize the river locks to prevent a counteroffensive.',
    mapId: 'map_river_crossing_12',
    deploymentSlots: deploymentSlots('map_river_crossing_12', 11),
    maxDeployments: 11,
    enemies: [
      enemy('enemy_elite_12', UnitClassName.GreatKnight, 23, 8, 5, ['silver_lance'], AIBehavior.Defensive),
      enemy('enemy_elite_05', UnitClassName.General, 23, 9, 6, ['silver_lance'], AIBehavior.Defensive),
      enemy('enemy_elite_10', UnitClassName.Valkyrie, 23, 10, 5, ['lightning'], AIBehavior.Support),
      enemy('enemy_elite_04', UnitClassName.Sage, 23, 11, 7, ['arcfire'], AIBehavior.Support),
    ],
    allies: [],
    victoryConditions: victory({ type: VictoryCondition.ReachLocation, targetPosition: position(11, 5) }),
    defeatConditions: defeat({ type: DefeatCondition.LordDies }),
    reinforcements: [],
    treasures: treasures([11, 10, 'master_key', true]),
    narrative: narrative(
      lines([
        ['Marcus', 'Take the lock controls and their army stalls.'],
        ['Alaric', 'Then that lock is ours.'],
      ]),
      lines([
        ['Theron', 'Floodgates secured. Counterattack delayed.'],
        ['Alaric', 'Onward to the desert flank.'],
      ]),
    ),
    weather: Weather.Rain,
    rewards: {
      goldReward: 2900,
      expBonus: 450,
      itemRewards: ['master_key'],
      unlockedChapters: ['ch_22'],
    },
    nextChapterId: 'ch_22',
  },
  {
    id: 'ch_22',
    number: 22,
    title: 'Scorched Advance',
    description: 'Cross the outpost belt under heavy magical bombardment.',
    mapId: 'map_desert_outpost_14',
    deploymentSlots: deploymentSlots('map_desert_outpost_14', 12),
    maxDeployments: 12,
    enemies: [
      enemy('enemy_elite_08', UnitClassName.DarkKnight, 24, 10, 6, ['flux'], AIBehavior.Boss),
      enemy('enemy_elite_04', UnitClassName.Sage, 24, 11, 7, ['arcfire'], AIBehavior.Support),
      enemy('enemy_elite_09', UnitClassName.Bishop, 24, 12, 8, ['physic_staff'], AIBehavior.Support),
      enemy('enemy_elite_02', UnitClassName.Paladin, 24, 12, 5, ['silver_lance'], AIBehavior.Defensive),
    ],
    allies: [],
    victoryConditions: victory({ type: VictoryCondition.Rout }),
    defeatConditions: defeat({ type: DefeatCondition.LordDies }),
    reinforcements: [],
    treasures: treasures([7, 7, 'spirit_dust', true]),
    narrative: narrative(
      lines([
        ['Nia', 'Arc signatures across the entire outpost line.'],
        ['Alaric', 'Then we break them one battery at a time.'],
      ]),
      lines([
        ['Nia', 'Bombardment ended. Sky is clear.'],
        ['Alaric', 'Final bastion ahead.'],
      ]),
    ),
    weather: Weather.Clear,
    rewards: {
      goldReward: 3000,
      expBonus: 460,
      itemRewards: ['spirit_dust'],
      unlockedChapters: ['ch_23'],
    },
    nextChapterId: 'ch_23',
  },
  {
    id: 'ch_23',
    number: 23,
    title: 'Court Magus',
    description: 'Confront Maldrake and stop the eclipse ritual.',
    mapId: 'map_obsidian_keep_20',
    deploymentSlots: deploymentSlots('map_obsidian_keep_20', 12),
    maxDeployments: 12,
    enemies: [
      enemy('enemy_elite_04', UnitClassName.Sage, 25, 15, 8, ['bolganone'], AIBehavior.Support),
      enemy('enemy_elite_08', UnitClassName.DarkKnight, 25, 16, 9, ['flux'], AIBehavior.Boss),
      enemy('enemy_elite_09', UnitClassName.Bishop, 25, 16, 10, ['fortify_staff'], AIBehavior.Support),
      enemy('enemy_elite_11', UnitClassName.Trickster, 25, 17, 8, ['levin_sword'], AIBehavior.Flanker),
      enemy('boss_maldrake', UnitClassName.Sage, 26, 18, 9, ['bolganone', 'excalibur'], AIBehavior.Boss, true, 'master_seal'),
    ],
    allies: [],
    victoryConditions: victory({ type: VictoryCondition.BossKill, targetUnitId: 'boss_maldrake' }),
    defeatConditions: defeat({ type: DefeatCondition.LordDies }),
    reinforcements: [],
    treasures: treasures([17, 6, 'master_seal', true]),
    narrative: narrative(
      lines([
        ['Maldrake', 'The eclipse will bind the realm forever.'],
        ['Theron', 'Not while we still breathe.'],
      ]),
      lines([
        ['Lysandra', 'Ritual matrix collapsed.'],
        ['Alaric', 'Then we take the palace tomorrow.'],
      ]),
    ),
    weather: Weather.Clear,
    rewards: {
      goldReward: 3200,
      expBonus: 480,
      itemRewards: ['master_seal'],
      unlockedChapters: ['ch_24'],
    },
    nextChapterId: 'ch_24',
  },
  {
    id: 'ch_24',
    number: 24,
    title: 'Last Approach',
    description: 'Fight through the royal road defenses to reach the palace gates.',
    mapId: 'map_royal_road_24',
    deploymentSlots: deploymentSlots('map_royal_road_24', 12),
    maxDeployments: 12,
    enemies: [
      enemy('enemy_elite_05', UnitClassName.General, 26, 17, 10, ['silver_lance'], AIBehavior.Defensive),
      enemy('enemy_elite_12', UnitClassName.GreatKnight, 26, 18, 11, ['silver_lance'], AIBehavior.Defensive),
      enemy('enemy_elite_06', UnitClassName.Sniper, 26, 19, 9, ['silver_bow'], AIBehavior.Defensive),
      enemy('enemy_elite_10', UnitClassName.Valkyrie, 26, 19, 12, ['aura'], AIBehavior.Support),
    ],
    allies: [],
    victoryConditions: victory({ type: VictoryCondition.ReachLocation, targetPosition: position(23, 11) }),
    defeatConditions: defeat({ type: DefeatCondition.LordDies }),
    reinforcements: [],
    treasures: treasures([22, 3, 'fortify_staff', true]),
    narrative: narrative(
      lines([
        ['Alaric', 'One final roadblock between us and the throne room.'],
        ['Marcus', 'Then we tear it down.'],
      ]),
      lines([
        ['Elena', 'Palace gates are in sight.'],
        ['Alaric', 'Prepare everyone. Tomorrow decides the realm.'],
      ]),
    ),
    weather: Weather.Clear,
    rewards: {
      goldReward: 3300,
      expBonus: 500,
      itemRewards: ['fortify_staff'],
      unlockedChapters: ['ch_25'],
    },
    nextChapterId: 'ch_25',
  },
  {
    id: 'ch_25',
    number: 25,
    title: 'Shattered Throne',
    description: 'Storm the imperial palace and defeat Emperor Vael.',
    mapId: 'map_imperial_palace_24',
    deploymentSlots: deploymentSlots('map_imperial_palace_24', 12),
    maxDeployments: 12,
    enemies: [
      enemy('enemy_elite_05', UnitClassName.General, 27, 18, 10, ['silver_lance'], AIBehavior.Defensive),
      enemy('enemy_elite_08', UnitClassName.DarkKnight, 27, 19, 11, ['thoron'], AIBehavior.Boss),
      enemy('enemy_elite_09', UnitClassName.Bishop, 27, 20, 9, ['fortify_staff'], AIBehavior.Support),
      enemy('enemy_elite_06', UnitClassName.Sniper, 27, 20, 12, ['silver_bow'], AIBehavior.Defensive),
      enemy('enemy_elite_12', UnitClassName.GreatKnight, 27, 21, 10, ['silver_lance'], AIBehavior.Defensive),
      enemy('boss_emperor', UnitClassName.GreatKnight, 30, 22, 11, ['gradivus', 'mercurius'], AIBehavior.Boss, true, 'master_seal'),
    ],
    allies: [],
    victoryConditions: victory({ type: VictoryCondition.BossKill, targetUnitId: 'boss_emperor' }),
    defeatConditions: defeat({ type: DefeatCondition.LordDies }),
    reinforcements: [],
    treasures: treasures([21, 19, 'elixir', true]),
    narrative: narrative(
      lines([
        ['Emperor Vael', 'Kneel, and I may spare your bloodline.'],
        ['Alaric', 'The throne belongs to the people, not fear.'],
      ]),
      lines([
        ['Emperor Vael', 'So... this is the end...'],
        ['Alaric', 'No. This is the beginning of repair.'],
      ]),
    ),
    weather: Weather.Clear,
    rewards: {
      goldReward: 5000,
      expBonus: 800,
      itemRewards: ['elixir'],
      unlockedChapters: [],
    },
    nextChapterId: null,
  },
];

export function getChapterById(id: string): ChapterDefinition | null {
  return CHAPTERS.find((chapter) => chapter.id === id) ?? null;
}

export function getAllChapters(): ChapterDefinition[] {
  return CHAPTERS.map((chapter) => ({
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
    branchOptions: chapter.branchOptions?.map((option) => ({ ...option })),
  }));
}
