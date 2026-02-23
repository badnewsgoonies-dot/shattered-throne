import {
  CombatResult,
  CombatRound,
  GridMap,
  SkillDefinition,
  Stats,
  Unit,
} from '../shared/types';

function applyStatChanges(
  currentStats: Stats,
  changes: Partial<Stats>,
  mode: 'add' | 'subtract',
): Stats {
  const nextStats: Stats = { ...currentStats };

  for (const key of Object.keys(changes) as (keyof Stats)[]) {
    const value = changes[key];
    if (typeof value !== 'number') {
      continue;
    }

    const delta = mode === 'add' ? value : -Math.abs(value);
    nextStats[key] = nextStats[key] + delta;
  }

  return nextStats;
}

function buildRound(attackerId: string, damage: number, attackerHPAfter: number, defenderHPAfter: number): CombatRound {
  return {
    attacker: attackerId,
    damage,
    hit: true,
    crit: false,
    attackerHPAfter,
    defenderHPAfter,
  };
}

export function executeSkill(
  user: Unit,
  skill: SkillDefinition,
  targets: Unit[],
  map: GridMap,
): CombatResult {
  void map;

  user.currentSP = Math.max(0, user.currentSP - skill.spCost);

  const rounds: CombatRound[] = [];

  for (const target of targets) {
    if (skill.damage) {
      const scalingStat = skill.damage.scaling === 'strength'
        ? user.currentStats.strength
        : user.currentStats.magic;
      const defensiveStat = skill.damage.scaling === 'magic'
        ? target.currentStats.resistance
        : target.currentStats.defense;

      const damage = Math.max(0, skill.damage.base + scalingStat - defensiveStat);
      target.currentHP = Math.max(0, target.currentHP - damage);
      target.isAlive = target.currentHP > 0;

      rounds.push(buildRound(user.id, damage, user.currentHP, target.currentHP));
    }

    if (skill.healing) {
      const healing = Math.max(0, skill.healing.base + user.currentStats.magic);
      const previousHP = target.currentHP;
      target.currentHP = Math.min(target.maxHP, target.currentHP + healing);
      const actualHealing = target.currentHP - previousHP;
      if (target.currentHP > 0) {
        target.isAlive = true;
      }

      rounds.push(buildRound(user.id, actualHealing, user.currentHP, target.currentHP));
    }

    if (skill.buff) {
      target.currentStats = applyStatChanges(target.currentStats, skill.buff.stats, 'add');
    }

    if (skill.debuff) {
      target.currentStats = applyStatChanges(target.currentStats, skill.debuff.stats, 'subtract');
    }

    if (skill.statusEffect) {
      const roll = Math.random() * 100;
      if (roll < skill.statusEffect.chance) {
        target.activeStatusEffects.push({
          type: skill.statusEffect.type,
          remainingTurns: skill.statusEffect.duration,
          sourceUnitId: user.id,
        });
      }
    }
  }

  return {
    attackerId: user.id,
    defenderId: targets[0]?.id ?? user.id,
    rounds,
    attackerExpGained: 0,
    defenderExpGained: 0,
    attackerLevelUp: null,
    defenderLevelUp: null,
  };
}
