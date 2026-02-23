import {
  Unit,
  UnitClassName,
  WeaponType,
  MovementType,
  ArmorSlot,
  SupportRank,
  IDataProvider,
  ItemCategory,
} from '../shared/types';

export function getArenaOpponent(playerUnit: Unit, data: IDataProvider): Unit {
  const allClasses = data.getAllClasses();
  const candidates = allClasses.filter(
    (c) => !c.isPromoted && c.name !== playerUnit.className,
  );
  const classDef = candidates.length > 0
    ? candidates[Math.floor(Math.random() * candidates.length)]
    : allClasses[0];

  const levelOffset = Math.floor(Math.random() * 5) - 2; // -2 to +2
  const opponentLevel = Math.max(1, Math.min(30, playerUnit.level + levelOffset));

  const weapons = data.getAllWeapons();
  const usableWeapons = weapons.filter((w) =>
    classDef.weaponTypes.includes(w.weaponType),
  );
  const weapon = usableWeapons.length > 0 ? usableWeapons[0] : null;

  const stats = { ...classDef.baseStats };

  const opponent: Unit = {
    id: `arena-opponent-${Date.now()}`,
    name: `Arena ${classDef.displayName}`,
    characterId: 'arena-opponent',
    className: classDef.name,
    level: opponentLevel,
    exp: 0,
    currentStats: stats,
    maxHP: stats.hp,
    currentHP: stats.hp,
    currentSP: 0,
    maxSP: 100,
    growthRates: classDef.growthRates,
    inventory: {
      items: weapon
        ? [{ instanceId: `arena-wpn-${Date.now()}`, dataId: weapon.id, currentDurability: weapon.maxDurability }, null, null, null, null]
        : [null, null, null, null, null],
      equippedWeaponIndex: weapon ? 0 : null,
      equippedArmor: {
        [ArmorSlot.Head]: null,
        [ArmorSlot.Chest]: null,
        [ArmorSlot.Boots]: null,
        [ArmorSlot.Accessory]: null,
      },
    },
    skills: [],
    activeStatusEffects: [],
    position: null,
    hasMoved: false,
    hasActed: false,
    isAlive: true,
    team: 'enemy',
    supportRanks: {},
    supportPoints: {},
    killCount: 0,
    movementType: classDef.movementType,
  };

  return opponent;
}

export function resolveArenaFight(
  playerUnit: Unit,
  opponent: Unit,
): { won: boolean; goldChange: number; expGained: number } {
  let playerHP = playerUnit.currentHP;
  let opponentHP = opponent.currentHP;
  const maxRounds = 5;

  for (let round = 0; round < maxRounds; round++) {
    // Player attacks
    const playerDmg = Math.max(1, playerUnit.currentStats.strength - opponent.currentStats.defense);
    opponentHP -= playerDmg;
    if (opponentHP <= 0) {
      const goldChange = opponent.level * 50;
      const expGained = 20 + opponent.level * 3;
      return { won: true, goldChange, expGained };
    }

    // Opponent attacks
    const opponentDmg = Math.max(1, opponent.currentStats.strength - playerUnit.currentStats.defense);
    playerHP -= opponentDmg;
    if (playerHP <= 0) {
      return { won: false, goldChange: 0, expGained: 0 };
    }
  }

  // If no one died in max rounds, determine by remaining HP ratio
  const playerRatio = playerHP / playerUnit.maxHP;
  const opponentRatio = opponentHP / opponent.maxHP;
  if (playerRatio >= opponentRatio) {
    const goldChange = Math.floor(opponent.level * 25);
    const expGained = 10 + opponent.level * 2;
    return { won: true, goldChange, expGained };
  }

  return { won: false, goldChange: 0, expGained: 0 };
}
