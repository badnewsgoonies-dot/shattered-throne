import {
  ChapterDefinition, Weather, VictoryCondition, DefeatCondition,
  UnitClassName, AIBehavior, EnemyPlacement, Position
} from '../shared/types';

function enemy(charId: string, cls: UnitClassName, level: number, pos: Position, equip: string[], ai: AIBehavior, isBoss: boolean, drop?: string): EnemyPlacement {
  return { characterId: charId, className: cls, level, position: pos, equipment: equip, aiBehavior: ai, isBoss, dropItemId: drop };
}

export const chapters: ChapterDefinition[] = [
  // Chapter 1
  {
    id: 'ch-1', number: 1, title: "A Kingdom's Fall",
    description: 'The empire strikes at Castle Alden. Prince Alaric must escape with his allies.',
    mapId: 'map-ch1',
    deploymentSlots: [{ x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }],
    maxDeployments: 3,
    enemies: [
      enemy('enemy-soldier', UnitClassName.Warrior, 1, { x: 3, y: 1 }, ['iron-sword'], AIBehavior.Aggressive, false),
      enemy('enemy-soldier', UnitClassName.Warrior, 1, { x: 5, y: 2 }, ['iron-sword'], AIBehavior.Aggressive, false),
      enemy('enemy-soldier', UnitClassName.Warrior, 2, { x: 6, y: 3 }, ['iron-axe'], AIBehavior.Aggressive, false, 'vulnerary'),
      enemy('boss-commander', UnitClassName.Warrior, 3, { x: 4, y: 0 }, ['steel-sword'], AIBehavior.Boss, true, 'iron-lance'),
    ],
    allies: [],
    victoryConditions: [{ type: VictoryCondition.Rout }],
    defeatConditions: [{ type: DefeatCondition.LordDies, protectedUnitId: 'alaric' }],
    reinforcements: [],
    treasures: [],
    narrative: [
      { trigger: 'preBattle', dialogue: [
        { speaker: 'Alaric', text: 'The castle is under attack! We must fight our way out!', emotion: 'angry' },
        { speaker: 'Elena', text: 'Stay close, Alaric. I will heal your wounds.', emotion: 'neutral' },
        { speaker: 'Marcus', text: 'Form up! Protect the prince!', emotion: 'neutral' },
      ]},
      { trigger: 'postBattle', dialogue: [
        { speaker: 'Alaric', text: 'The castle is lost... but we live to fight another day.', emotion: 'sad' },
        { speaker: 'Marcus', text: 'We must make for the forest. Reinforcements will not reach us here.', emotion: 'neutral' },
      ]},
    ],
    weather: Weather.Clear,
    rewards: { goldReward: 500, expBonus: 50, itemRewards: ['vulnerary'], unlockedChapters: ['ch-2'] },
    nextChapterId: 'ch-2',
  },
  // Chapter 2
  {
    id: 'ch-2', number: 2, title: 'Escape to the Forest',
    description: 'Alaric and company flee through the Greenwood. A hunter joins their cause.',
    mapId: 'map-ch2',
    deploymentSlots: [{ x: 0, y: 8 }, { x: 1, y: 8 }, { x: 0, y: 9 }, { x: 1, y: 9 }, { x: 2, y: 9 }, { x: 3, y: 9 }],
    maxDeployments: 4,
    enemies: [
      enemy('enemy-soldier', UnitClassName.Warrior, 2, { x: 4, y: 3 }, ['iron-sword'], AIBehavior.Aggressive, false),
      enemy('enemy-soldier', UnitClassName.Warrior, 2, { x: 7, y: 2 }, ['iron-axe'], AIBehavior.Aggressive, false),
      enemy('enemy-archer', UnitClassName.Archer, 2, { x: 8, y: 4 }, ['iron-bow'], AIBehavior.Defensive, false),
      enemy('enemy-soldier', UnitClassName.Warrior, 3, { x: 5, y: 1 }, ['iron-sword'], AIBehavior.Aggressive, false, 'vulnerary'),
      enemy('enemy-archer', UnitClassName.Archer, 2, { x: 6, y: 0 }, ['iron-bow'], AIBehavior.Defensive, false),
      enemy('boss-bandit', UnitClassName.Warrior, 4, { x: 9, y: 0 }, ['steel-axe'], AIBehavior.Boss, true, 'iron-bow'),
    ],
    allies: [],
    victoryConditions: [{ type: VictoryCondition.Rout }],
    defeatConditions: [{ type: DefeatCondition.LordDies, protectedUnitId: 'alaric' }],
    reinforcements: [
      { condition: { type: 'turn', turn: 3 }, enemies: [
        enemy('enemy-soldier', UnitClassName.Warrior, 2, { x: 9, y: 5 }, ['iron-sword'], AIBehavior.Aggressive, false),
        enemy('enemy-soldier', UnitClassName.Warrior, 2, { x: 9, y: 6 }, ['iron-axe'], AIBehavior.Aggressive, false),
      ]},
    ],
    treasures: [],
    narrative: [
      { trigger: 'preBattle', dialogue: [
        { speaker: 'Alaric', text: 'Bandits in the forest? They must be working for the empire.', emotion: 'neutral' },
        { speaker: 'Lira', text: 'Hold! I am Lira, a hunter of these woods. Those bandits razed my village.', emotion: 'angry' },
        { speaker: 'Alaric', text: 'Then we share an enemy. Fight with us!', emotion: 'neutral' },
      ]},
      { trigger: 'postBattle', dialogue: [
        { speaker: 'Lira', text: 'Thank you. I owe you a debt, prince.', emotion: 'neutral' },
      ]},
    ],
    weather: Weather.Clear,
    rewards: { goldReward: 700, expBonus: 60, itemRewards: ['iron-bow'], unlockedChapters: ['ch-3'] },
    nextChapterId: 'ch-3',
  },
  // Chapter 3
  {
    id: 'ch-3', number: 3, title: 'The Academy Siege',
    description: 'The imperial army besieges the mage academy. Alaric must defeat the enemy commander.',
    mapId: 'map-ch3',
    deploymentSlots: [{ x: 4, y: 10 }, { x: 5, y: 10 }, { x: 6, y: 10 }, { x: 7, y: 10 }, { x: 4, y: 11 }, { x: 5, y: 11 }, { x: 6, y: 11 }, { x: 7, y: 11 }],
    maxDeployments: 5,
    enemies: [
      enemy('enemy-soldier', UnitClassName.Warrior, 3, { x: 3, y: 3 }, ['iron-sword'], AIBehavior.Aggressive, false),
      enemy('enemy-soldier', UnitClassName.Warrior, 3, { x: 8, y: 3 }, ['iron-sword'], AIBehavior.Aggressive, false),
      enemy('enemy-knight', UnitClassName.Knight, 3, { x: 5, y: 2 }, ['iron-lance'], AIBehavior.Aggressive, false),
      enemy('enemy-archer', UnitClassName.Archer, 3, { x: 2, y: 5 }, ['iron-bow'], AIBehavior.Defensive, false),
      enemy('enemy-archer', UnitClassName.Archer, 3, { x: 9, y: 5 }, ['iron-bow'], AIBehavior.Defensive, false),
      enemy('enemy-mage', UnitClassName.Mage, 3, { x: 6, y: 1 }, ['fire'], AIBehavior.Aggressive, false, 'vulnerary'),
      enemy('enemy-cleric', UnitClassName.Cleric, 3, { x: 5, y: 0 }, ['heal-staff'], AIBehavior.Support, false),
      enemy('boss-general', UnitClassName.Knight, 5, { x: 6, y: 0 }, ['steel-lance', 'javelin'], AIBehavior.Boss, true, 'knight-crest'),
    ],
    allies: [],
    victoryConditions: [{ type: VictoryCondition.BossKill, targetUnitId: 'boss-general' }],
    defeatConditions: [{ type: DefeatCondition.LordDies, protectedUnitId: 'alaric' }],
    reinforcements: [],
    treasures: [],
    narrative: [
      { trigger: 'preBattle', dialogue: [
        { speaker: 'Theron', text: 'The academy! They are attacking it!', emotion: 'angry' },
        { speaker: 'Alaric', text: 'We will save it. Theron, join us!', emotion: 'neutral' },
        { speaker: 'Theron', text: 'My knowledge is at your service.', emotion: 'neutral' },
      ]},
      { trigger: 'postBattle', dialogue: [
        { speaker: 'Theron', text: 'The academy stands, but for how long?', emotion: 'sad' },
        { speaker: 'Alaric', text: 'We will end this war. I swear it.', emotion: 'neutral' },
      ]},
    ],
    weather: Weather.Clear,
    rewards: { goldReward: 900, expBonus: 80, itemRewards: ['fire'], unlockedChapters: ['ch-4', 'par-arena'] },
    nextChapterId: 'ch-4',
  },
  // Chapter 4
  {
    id: 'ch-4', number: 4, title: 'Thieves of the Undercity',
    description: 'Alaric ventures into the undercity to find allies among the thieves guild.',
    mapId: 'map-ch4',
    deploymentSlots: [{ x: 0, y: 8 }, { x: 1, y: 8 }, { x: 0, y: 9 }, { x: 1, y: 9 }, { x: 2, y: 9 }],
    maxDeployments: 5,
    enemies: [
      enemy('enemy-thief', UnitClassName.Thief, 3, { x: 3, y: 2 }, ['iron-sword'], AIBehavior.Flanker, false),
      enemy('enemy-thief', UnitClassName.Thief, 3, { x: 7, y: 3 }, ['iron-sword'], AIBehavior.Flanker, false),
      enemy('enemy-soldier', UnitClassName.Warrior, 3, { x: 5, y: 1 }, ['iron-axe'], AIBehavior.Aggressive, false),
      enemy('enemy-archer', UnitClassName.Archer, 3, { x: 8, y: 1 }, ['iron-bow'], AIBehavior.Defensive, false),
      enemy('enemy-mage', UnitClassName.Mage, 4, { x: 2, y: 0 }, ['flux'], AIBehavior.Aggressive, false, 'chest-key'),
      enemy('boss-thiefking', UnitClassName.Thief, 6, { x: 8, y: 0 }, ['steel-sword', 'vulnerary'], AIBehavior.Boss, true, 'hero-crest'),
    ],
    allies: [],
    victoryConditions: [{ type: VictoryCondition.Rout }],
    defeatConditions: [{ type: DefeatCondition.LordDies, protectedUnitId: 'alaric' }],
    reinforcements: [],
    treasures: [
      { position: { x: 1, y: 1 }, itemId: 'steel-sword', requiresKey: true },
      { position: { x: 8, y: 5 }, itemId: 'concoction', requiresKey: true },
    ],
    narrative: [
      { trigger: 'preBattle', dialogue: [
        { speaker: 'Kael', text: 'Looking for allies, princeling? You found them.', emotion: 'happy' },
        { speaker: 'Alaric', text: 'Can we trust you?', emotion: 'neutral' },
        { speaker: 'Kael', text: 'Trust is earned. Let me prove myself.', emotion: 'neutral' },
      ]},
    ],
    weather: Weather.Clear,
    rewards: { goldReward: 800, expBonus: 70, itemRewards: ['chest-key'], unlockedChapters: ['ch-5'] },
    nextChapterId: 'ch-5',
  },
  // Chapter 5
  {
    id: 'ch-5', number: 5, title: 'Bridge of Sorrows',
    description: 'The army must hold a narrow bridge against waves of imperial soldiers.',
    mapId: 'map-ch5',
    deploymentSlots: [{ x: 3, y: 14 }, { x: 4, y: 14 }, { x: 3, y: 15 }, { x: 4, y: 15 }, { x: 2, y: 15 }, { x: 5, y: 15 }],
    maxDeployments: 6,
    enemies: [
      enemy('enemy-soldier', UnitClassName.Warrior, 4, { x: 3, y: 3 }, ['iron-sword'], AIBehavior.Aggressive, false),
      enemy('enemy-soldier', UnitClassName.Warrior, 4, { x: 4, y: 3 }, ['iron-axe'], AIBehavior.Aggressive, false),
      enemy('enemy-knight', UnitClassName.Knight, 4, { x: 3, y: 1 }, ['iron-lance'], AIBehavior.Aggressive, false),
      enemy('enemy-knight', UnitClassName.Knight, 4, { x: 4, y: 1 }, ['iron-lance'], AIBehavior.Aggressive, false),
      enemy('enemy-archer', UnitClassName.Archer, 4, { x: 3, y: 0 }, ['iron-bow'], AIBehavior.Defensive, false),
      enemy('enemy-archer', UnitClassName.Archer, 4, { x: 4, y: 0 }, ['iron-bow'], AIBehavior.Defensive, false),
    ],
    allies: [],
    victoryConditions: [{ type: VictoryCondition.Survive, surviveTurns: 8 }],
    defeatConditions: [{ type: DefeatCondition.LordDies, protectedUnitId: 'alaric' }],
    reinforcements: [
      { condition: { type: 'turn', turn: 2 }, enemies: [
        enemy('enemy-soldier', UnitClassName.Warrior, 4, { x: 3, y: 0 }, ['iron-sword'], AIBehavior.Aggressive, false),
        enemy('enemy-soldier', UnitClassName.Warrior, 4, { x: 4, y: 0 }, ['iron-axe'], AIBehavior.Aggressive, false),
      ]},
      { condition: { type: 'turn', turn: 4 }, enemies: [
        enemy('enemy-knight', UnitClassName.Knight, 5, { x: 3, y: 0 }, ['steel-lance'], AIBehavior.Aggressive, false),
        enemy('enemy-archer', UnitClassName.Archer, 5, { x: 4, y: 0 }, ['steel-bow'], AIBehavior.Defensive, false),
      ]},
      { condition: { type: 'turn', turn: 6 }, enemies: [
        enemy('enemy-soldier', UnitClassName.Warrior, 5, { x: 3, y: 0 }, ['steel-sword'], AIBehavior.Aggressive, false),
        enemy('enemy-mage', UnitClassName.Mage, 5, { x: 4, y: 0 }, ['fire'], AIBehavior.Aggressive, false),
      ]},
    ],
    treasures: [],
    narrative: [
      { trigger: 'preBattle', dialogue: [
        { speaker: 'Marcus', text: 'We must hold this bridge. If they cross, we are finished.', emotion: 'neutral' },
        { speaker: 'Alaric', text: 'Eight turns. We hold for eight turns, then retreat across the river.', emotion: 'neutral' },
      ]},
      { trigger: 'postBattle', dialogue: [
        { speaker: 'Alaric', text: 'We held! Cut the ropes—bring down the bridge!', emotion: 'happy' },
      ]},
    ],
    weather: Weather.Rain,
    rewards: { goldReward: 1000, expBonus: 100, itemRewards: ['steel-lance'], unlockedChapters: ['ch-6'] },
    nextChapterId: 'ch-6',
  },
  // Chapter 6
  {
    id: 'ch-6', number: 6, title: 'Dance of Blades',
    description: 'On the open plains, Alaric encounters a traveling dancer and a new threat.',
    mapId: 'map-ch6',
    deploymentSlots: [{ x: 0, y: 10 }, { x: 1, y: 10 }, { x: 2, y: 10 }, { x: 0, y: 11 }, { x: 1, y: 11 }, { x: 2, y: 11 }, { x: 3, y: 11 }, { x: 4, y: 11 }],
    maxDeployments: 6,
    enemies: [
      enemy('enemy-soldier', UnitClassName.Warrior, 5, { x: 6, y: 2 }, ['steel-sword'], AIBehavior.Aggressive, false),
      enemy('enemy-soldier', UnitClassName.Warrior, 5, { x: 8, y: 3 }, ['steel-axe'], AIBehavior.Aggressive, false),
      enemy('enemy-knight', UnitClassName.Knight, 5, { x: 10, y: 1 }, ['steel-lance'], AIBehavior.Flanker, false),
      enemy('enemy-archer', UnitClassName.Archer, 5, { x: 9, y: 5 }, ['steel-bow'], AIBehavior.Defensive, false),
      enemy('enemy-mage', UnitClassName.Mage, 5, { x: 4, y: 1 }, ['elfire'], AIBehavior.Aggressive, false),
      enemy('enemy-cleric', UnitClassName.Cleric, 5, { x: 7, y: 1 }, ['mend-staff'], AIBehavior.Support, false),
      enemy('enemy-soldier', UnitClassName.Warrior, 6, { x: 11, y: 0 }, ['steel-sword'], AIBehavior.Aggressive, false, 'vulnerary'),
      enemy('boss-captain', UnitClassName.Knight, 7, { x: 10, y: 0 }, ['steel-lance', 'javelin'], AIBehavior.Boss, true, 'energy-drop'),
    ],
    allies: [],
    victoryConditions: [{ type: VictoryCondition.Rout }],
    defeatConditions: [{ type: DefeatCondition.LordDies, protectedUnitId: 'alaric' }],
    reinforcements: [],
    treasures: [],
    narrative: [
      { trigger: 'preBattle', dialogue: [
        { speaker: 'Seraphina', text: 'Oh my! A battle! How thrilling!', emotion: 'happy' },
        { speaker: 'Alaric', text: 'This is no game, dancer. Stay behind us!', emotion: 'neutral' },
        { speaker: 'Seraphina', text: 'My dances can inspire your warriors. Let me help!', emotion: 'happy' },
      ]},
    ],
    weather: Weather.Clear,
    rewards: { goldReward: 1100, expBonus: 100, itemRewards: ['concoction'], unlockedChapters: ['ch-7', 'par-hidden-village'] },
    nextChapterId: 'ch-7',
  },
  // Chapter 7
  {
    id: 'ch-7', number: 7, title: 'The Mountain Pass',
    description: 'The army must navigate a treacherous mountain pass, ambushed from both sides.',
    mapId: 'map-ch7',
    deploymentSlots: [{ x: 4, y: 12 }, { x: 5, y: 12 }, { x: 4, y: 13 }, { x: 5, y: 13 }, { x: 3, y: 13 }, { x: 6, y: 13 }],
    maxDeployments: 6,
    enemies: [
      enemy('enemy-soldier', UnitClassName.Warrior, 6, { x: 4, y: 5 }, ['steel-sword'], AIBehavior.Aggressive, false),
      enemy('enemy-soldier', UnitClassName.Warrior, 6, { x: 5, y: 5 }, ['steel-axe'], AIBehavior.Aggressive, false),
      enemy('enemy-archer', UnitClassName.Archer, 6, { x: 3, y: 3 }, ['steel-bow'], AIBehavior.Defensive, false),
      enemy('enemy-archer', UnitClassName.Archer, 6, { x: 6, y: 3 }, ['steel-bow'], AIBehavior.Defensive, false),
      enemy('enemy-mage', UnitClassName.Mage, 6, { x: 4, y: 1 }, ['elfire'], AIBehavior.Aggressive, false),
      enemy('enemy-mage', UnitClassName.Mage, 6, { x: 5, y: 1 }, ['thunder'], AIBehavior.Aggressive, false),
      enemy('enemy-knight', UnitClassName.Knight, 7, { x: 4, y: 0 }, ['steel-lance'], AIBehavior.Aggressive, false),
      enemy('boss-wyvern', UnitClassName.Knight, 8, { x: 5, y: 0 }, ['silver-lance'], AIBehavior.Boss, true, 'speedwing'),
    ],
    allies: [],
    victoryConditions: [{ type: VictoryCondition.BossKill, targetUnitId: 'boss-wyvern' }],
    defeatConditions: [{ type: DefeatCondition.LordDies, protectedUnitId: 'alaric' }],
    reinforcements: [
      { condition: { type: 'turn', turn: 3 }, enemies: [
        enemy('enemy-soldier', UnitClassName.Warrior, 6, { x: 2, y: 6 }, ['steel-sword'], AIBehavior.Aggressive, false),
        enemy('enemy-soldier', UnitClassName.Warrior, 6, { x: 7, y: 6 }, ['steel-axe'], AIBehavior.Aggressive, false),
      ]},
    ],
    treasures: [],
    narrative: [
      { trigger: 'preBattle', dialogue: [
        { speaker: 'Lira', text: 'Ambush! They have the high ground!', emotion: 'angry' },
        { speaker: 'Alaric', text: 'Fight through! We have no choice!', emotion: 'neutral' },
      ]},
    ],
    weather: Weather.Clear,
    rewards: { goldReward: 1200, expBonus: 110, itemRewards: ['steel-bow'], unlockedChapters: ['ch-8'] },
    nextChapterId: 'ch-8',
  },
  // Chapter 8
  {
    id: 'ch-8', number: 8, title: 'The Haunted Graveyard',
    description: 'Dark forces rise in the ancient graveyard. The army must destroy the source.',
    mapId: 'map-ch8',
    deploymentSlots: [{ x: 3, y: 8 }, { x: 4, y: 8 }, { x: 5, y: 8 }, { x: 6, y: 8 }, { x: 3, y: 9 }, { x: 4, y: 9 }, { x: 5, y: 9 }, { x: 6, y: 9 }],
    maxDeployments: 7,
    enemies: [
      enemy('enemy-soldier', UnitClassName.Warrior, 7, { x: 3, y: 2 }, ['steel-axe'], AIBehavior.Aggressive, false),
      enemy('enemy-soldier', UnitClassName.Warrior, 7, { x: 6, y: 2 }, ['steel-sword'], AIBehavior.Aggressive, false),
      enemy('enemy-mage', UnitClassName.Mage, 7, { x: 4, y: 3 }, ['flux'], AIBehavior.Aggressive, false),
      enemy('enemy-mage', UnitClassName.Mage, 7, { x: 5, y: 3 }, ['nosferatu'], AIBehavior.Aggressive, false),
      enemy('enemy-thief', UnitClassName.Thief, 7, { x: 2, y: 0 }, ['steel-sword'], AIBehavior.Flanker, false),
      enemy('enemy-thief', UnitClassName.Thief, 7, { x: 7, y: 0 }, ['steel-sword'], AIBehavior.Flanker, false),
      enemy('enemy-cleric', UnitClassName.Cleric, 7, { x: 5, y: 0 }, ['mend-staff'], AIBehavior.Support, false),
      enemy('boss-necro', UnitClassName.Mage, 9, { x: 4, y: 0 }, ['nosferatu', 'flux'], AIBehavior.Boss, true, 'guiding-ring'),
    ],
    allies: [],
    victoryConditions: [{ type: VictoryCondition.BossKill, targetUnitId: 'boss-necro' }],
    defeatConditions: [{ type: DefeatCondition.LordDies, protectedUnitId: 'alaric' }],
    reinforcements: [
      { condition: { type: 'turn', turn: 4 }, enemies: [
        enemy('enemy-soldier', UnitClassName.Warrior, 7, { x: 0, y: 0 }, ['iron-axe'], AIBehavior.Aggressive, false),
        enemy('enemy-soldier', UnitClassName.Warrior, 7, { x: 9, y: 0 }, ['iron-axe'], AIBehavior.Aggressive, false),
      ]},
    ],
    treasures: [{ position: { x: 3, y: 2 }, itemId: 'secret-book', requiresKey: false }],
    narrative: [
      { trigger: 'preBattle', dialogue: [
        { speaker: 'Theron', text: 'Dark magic... I can feel it pulsing from the graves.', emotion: 'neutral' },
        { speaker: 'Elena', text: 'We must purify this place. My light magic can help.', emotion: 'neutral' },
      ]},
    ],
    weather: Weather.Fog,
    rewards: { goldReward: 1300, expBonus: 120, itemRewards: ['flux'], unlockedChapters: ['ch-9'] },
    nextChapterId: 'ch-9',
  },
  // Chapter 9
  {
    id: 'ch-9', number: 9, title: 'The Port of No Return',
    description: 'Alaric must secure the port city to find passage across the sea.',
    mapId: 'map-ch9',
    deploymentSlots: [{ x: 10, y: 12 }, { x: 11, y: 12 }, { x: 12, y: 12 }, { x: 10, y: 13 }, { x: 11, y: 13 }, { x: 12, y: 13 }, { x: 13, y: 13 }, { x: 13, y: 12 }],
    maxDeployments: 8,
    enemies: [
      enemy('enemy-soldier', UnitClassName.Warrior, 8, { x: 5, y: 3 }, ['steel-sword'], AIBehavior.Aggressive, false),
      enemy('enemy-knight', UnitClassName.Knight, 8, { x: 7, y: 5 }, ['steel-lance', 'javelin'], AIBehavior.Flanker, false),
      enemy('enemy-archer', UnitClassName.Archer, 8, { x: 3, y: 7 }, ['steel-bow'], AIBehavior.Defensive, false),
      enemy('enemy-archer', UnitClassName.Archer, 8, { x: 8, y: 2 }, ['steel-bow'], AIBehavior.Defensive, false),
      enemy('enemy-mage', UnitClassName.Mage, 8, { x: 6, y: 1 }, ['elthunder'], AIBehavior.Aggressive, false),
      enemy('enemy-thief', UnitClassName.Thief, 8, { x: 4, y: 8 }, ['steel-sword'], AIBehavior.Flanker, false, 'vulnerary'),
      enemy('enemy-cleric', UnitClassName.Cleric, 8, { x: 7, y: 0 }, ['physic-staff'], AIBehavior.Support, false),
      enemy('enemy-soldier', UnitClassName.Warrior, 9, { x: 9, y: 1 }, ['steel-axe'], AIBehavior.Aggressive, false),
      enemy('boss-admiral', UnitClassName.Knight, 10, { x: 6, y: 0 }, ['silver-lance', 'javelin'], AIBehavior.Boss, true, 'silver-sword'),
    ],
    allies: [],
    victoryConditions: [{ type: VictoryCondition.Rout }],
    defeatConditions: [{ type: DefeatCondition.LordDies, protectedUnitId: 'alaric' }],
    reinforcements: [],
    treasures: [{ position: { x: 6, y: 9 }, itemId: 'elixir', requiresKey: true }],
    narrative: [
      { trigger: 'preBattle', dialogue: [
        { speaker: 'Alaric', text: 'The port is heavily guarded. We need to clear them out.', emotion: 'neutral' },
        { speaker: 'Marcus', text: 'The admiral commands from the docks. Take him down.', emotion: 'neutral' },
      ]},
      { trigger: 'postBattle', dialogue: [
        { speaker: 'Alaric', text: 'The port is ours. We can sail when ready.', emotion: 'happy' },
      ]},
    ],
    weather: Weather.Rain,
    rewards: { goldReward: 1500, expBonus: 130, itemRewards: ['silver-lance'], unlockedChapters: ['ch-10'] },
    nextChapterId: 'ch-10',
  },
  // Chapter 10
  {
    id: 'ch-10', number: 10, title: "The Warlord's Fortress",
    description: 'Alaric storms the fortress of the regional warlord to rally more allies.',
    mapId: 'map-ch10',
    deploymentSlots: [{ x: 4, y: 10 }, { x: 5, y: 10 }, { x: 6, y: 10 }, { x: 7, y: 10 }, { x: 4, y: 11 }, { x: 5, y: 11 }, { x: 6, y: 11 }, { x: 7, y: 11 }],
    maxDeployments: 8,
    enemies: [
      enemy('enemy-soldier', UnitClassName.Warrior, 9, { x: 3, y: 3 }, ['steel-sword'], AIBehavior.Aggressive, false),
      enemy('enemy-soldier', UnitClassName.Warrior, 9, { x: 8, y: 3 }, ['steel-axe'], AIBehavior.Aggressive, false),
      enemy('enemy-knight', UnitClassName.Knight, 9, { x: 5, y: 5 }, ['steel-lance'], AIBehavior.Defensive, false),
      enemy('enemy-knight', UnitClassName.Knight, 9, { x: 6, y: 5 }, ['steel-lance'], AIBehavior.Defensive, false),
      enemy('enemy-mage', UnitClassName.Mage, 9, { x: 4, y: 2 }, ['elfire'], AIBehavior.Aggressive, false),
      enemy('enemy-mage', UnitClassName.Mage, 9, { x: 7, y: 2 }, ['elthunder'], AIBehavior.Aggressive, false),
      enemy('enemy-archer', UnitClassName.Archer, 9, { x: 2, y: 7 }, ['steel-bow'], AIBehavior.Defensive, false),
      enemy('enemy-archer', UnitClassName.Archer, 9, { x: 9, y: 7 }, ['steel-bow'], AIBehavior.Defensive, false),
      enemy('enemy-cleric', UnitClassName.Cleric, 9, { x: 5, y: 1 }, ['physic-staff'], AIBehavior.Support, false),
      enemy('boss-warlord', UnitClassName.Warrior, 12, { x: 6, y: 1 }, ['silver-sword', 'hand-axe'], AIBehavior.Boss, true, 'master-seal'),
    ],
    allies: [],
    victoryConditions: [{ type: VictoryCondition.BossKill, targetUnitId: 'boss-warlord' }],
    defeatConditions: [{ type: DefeatCondition.LordDies, protectedUnitId: 'alaric' }],
    reinforcements: [
      { condition: { type: 'turn', turn: 4 }, enemies: [
        enemy('enemy-soldier', UnitClassName.Warrior, 9, { x: 1, y: 9 }, ['steel-sword'], AIBehavior.Aggressive, false),
        enemy('enemy-soldier', UnitClassName.Warrior, 9, { x: 10, y: 9 }, ['steel-axe'], AIBehavior.Aggressive, false),
      ]},
    ],
    treasures: [
      { position: { x: 4, y: 3 }, itemId: 'silver-axe', requiresKey: true },
    ],
    narrative: [
      { trigger: 'preBattle', dialogue: [
        { speaker: 'Alaric', text: 'The warlord oppresses these people. We end this now.', emotion: 'angry' },
        { speaker: 'Marcus', text: 'His fortress is well-defended. Stay sharp.', emotion: 'neutral' },
      ]},
      { trigger: 'postBattle', dialogue: [
        { speaker: 'Alaric', text: 'The warlord has fallen. These lands are free.', emotion: 'happy' },
      ]},
    ],
    weather: Weather.Clear,
    rewards: { goldReward: 2000, expBonus: 150, itemRewards: ['master-seal'], unlockedChapters: ['ch-11'] },
    nextChapterId: 'ch-11',
  },
  // Chapters 11-25 (lighter definitions)
  ...Array.from({ length: 15 }, (_, i) => {
    const n = i + 11;
    const titles = [
      'Frozen Wasteland', 'Sands of Despair', 'The Murky Swamp', 'Abandoned Mines',
      'Dark Forest Ambush', 'Volcanic Lair', 'Imperial Throne Room', 'Mountain Summit',
      'River Crossing', 'The Final March', 'Siege of the Capital', 'The Inner Sanctum',
      'Betrayal at Dawn', 'Dragon\'s Den', 'Shattered Throne',
    ];
    const mapIds = [
      'map-ch11', 'map-ch12', 'map-ch13', 'map-ch14',
      'map-ch15', 'map-ch16', 'map-ch17', 'map-ch18',
      'map-ch19', 'map-ch20', 'map-ch20', 'map-ch17',
      'map-ch10', 'map-ch16', 'map-ch20',
    ];
    const deploySlots: Position[] = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 0 }];
    const lvl = 8 + n;
    return {
      id: `ch-${n}`, number: n, title: titles[i],
      description: `Chapter ${n}: ${titles[i]}. The war intensifies as Alaric pushes deeper into enemy territory.`,
      mapId: mapIds[i],
      deploymentSlots: deploySlots,
      maxDeployments: 8,
      enemies: [
        enemy('enemy-soldier', UnitClassName.Warrior, lvl, { x: 4, y: 4 }, ['steel-sword'], AIBehavior.Aggressive, false),
        enemy('enemy-soldier', UnitClassName.Warrior, lvl, { x: 5, y: 4 }, ['steel-axe'], AIBehavior.Aggressive, false),
        enemy('enemy-knight', UnitClassName.Knight, lvl, { x: 4, y: 3 }, ['steel-lance'], AIBehavior.Aggressive, false),
        enemy('enemy-archer', UnitClassName.Archer, lvl, { x: 6, y: 3 }, ['steel-bow'], AIBehavior.Defensive, false),
        enemy('enemy-mage', UnitClassName.Mage, lvl, { x: 5, y: 2 }, ['elfire'], AIBehavior.Aggressive, false),
        enemy(`boss-ch${n}`, n >= 20 ? UnitClassName.General : UnitClassName.Knight, lvl + 3, { x: 5, y: 0 }, ['silver-lance', 'silver-sword'], AIBehavior.Boss, true, 'elixir'),
      ],
      allies: [] as EnemyPlacement[],
      victoryConditions: [n === 25 ? { type: VictoryCondition.BossKill, targetUnitId: `boss-ch${n}` } : { type: VictoryCondition.Rout }],
      defeatConditions: [{ type: DefeatCondition.LordDies, protectedUnitId: 'alaric' }],
      reinforcements: lvl >= 12 ? [
        { condition: { type: 'turn' as const, turn: 3 }, enemies: [
          enemy('enemy-soldier', UnitClassName.Warrior, lvl, { x: 0, y: 0 }, ['steel-sword'], AIBehavior.Aggressive, false),
        ]},
      ] : [],
      treasures: [] as { position: Position; itemId: string; requiresKey: boolean }[],
      narrative: [
        { trigger: 'preBattle' as const, dialogue: [
          { speaker: 'Alaric', text: `We push forward. Chapter ${n} awaits.`, emotion: 'neutral' as const },
        ]},
      ],
      weather: n % 3 === 0 ? Weather.Rain : n % 5 === 0 ? Weather.Snow : Weather.Clear,
      rewards: {
        goldReward: 1000 + n * 200,
        expBonus: 100 + n * 10,
        itemRewards: ['elixir'],
        unlockedChapters: n < 25 ? [`ch-${n + 1}`] : [],
      },
      nextChapterId: n < 25 ? `ch-${n + 1}` : null,
    } satisfies ChapterDefinition;
  }),
];
