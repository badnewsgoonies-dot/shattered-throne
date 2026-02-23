import { AIBehavior, MAX_SP, MovementType, Unit, UnitClassName } from '../shared/types';

export function getArenaOpponent(playerUnit: Unit): Unit {
  const level = Math.max(1, playerUnit.level + Math.floor(Math.random() * 5) - 2);
  const classes: UnitClassName[] = [
    UnitClassName.Warrior,
    UnitClassName.Knight,
    UnitClassName.Archer,
    UnitClassName.Mage,
  ];
  const className = classes[Math.floor(Math.random() * classes.length)];

  const baseStr = 7 + Math.floor(level * 0.5);
  const baseDef = 5 + Math.floor(level * 0.3);

  const opponent: Unit = {
    id: `arena_${Date.now()}`,
    name: 'Arena Champion',
    characterId: 'arena_opponent',
    className,
    level,
    exp: 0,
    currentStats: {
      hp: 18 + level * 2,
      strength: baseStr,
      magic: 3,
      skill: 5 + Math.floor(level * 0.4),
      speed: 5 + Math.floor(level * 0.3),
      luck: 3,
      defense: baseDef,
      resistance: 2,
      movement: 5,
    },
    maxHP: 18 + level * 2,
    currentHP: 18 + level * 2,
    currentSP: MAX_SP,
    maxSP: MAX_SP,
    growthRates: {
      hp: 50,
      strength: 40,
      magic: 10,
      skill: 35,
      speed: 30,
      luck: 20,
      defense: 25,
      resistance: 15,
    },
    inventory: {
      items: [null, null, null, null, null],
      equippedWeaponIndex: null,
      equippedArmor: { head: null, chest: null, boots: null, accessory: null },
    },
    skills: [],
    activeStatusEffects: [],
    position: null,
    hasMoved: false,
    hasActed: false,
    isAlive: true,
    team: 'enemy',
    aiBehavior: AIBehavior.Aggressive,
    supportRanks: {},
    supportPoints: {},
    killCount: 0,
    movementType: MovementType.Foot,
  };

  return opponent;
}

export function resolveArenaFight(
  playerUnit: Unit,
  opponent: Unit,
): { won: boolean; goldChange: number; expGained: number } {
  const playerPower =
    playerUnit.currentStats.strength + playerUnit.currentStats.speed + playerUnit.currentStats.skill;
  const opponentPower =
    opponent.currentStats.strength + opponent.currentStats.speed + opponent.currentStats.skill;

  const playerRoll = playerPower + Math.random() * 20;
  const opponentRoll = opponentPower + Math.random() * 20;

  const won = playerRoll >= opponentRoll;
  const goldChange = won ? opponent.level * 100 : 0;
  const expGained = won ? Math.min(100, (opponent.level - playerUnit.level + 10) * 5) : 0;

  return { won, goldChange, expGained: Math.max(0, expGained) };
}
