import {
  Unit,
  SkillDefinition,
  GridMap,
  CombatResult,
  CombatRound,
} from '../../shared/types';

export function executeSkill(
  user: Unit,
  skill: SkillDefinition,
  targets: Unit[],
  _map: GridMap,
): CombatResult {
  const rounds: CombatRound[] = [];

  // Deduct SP cost
  const updatedUser = { ...user, currentSP: Math.max(0, user.currentSP - skill.spCost) };

  for (const target of targets) {
    let damage = 0;
    let healing = 0;

    // Damage skills
    if (skill.damage) {
      const scalingStat =
        skill.damage.scaling === 'strength'
          ? updatedUser.currentStats.strength
          : updatedUser.currentStats.magic;
      damage = skill.damage.base + scalingStat;
      const defStat =
        skill.damage.scaling === 'strength'
          ? target.currentStats.defense
          : target.currentStats.resistance;
      damage = Math.max(0, damage - defStat);
    }

    // Healing skills
    if (skill.healing) {
      healing = skill.healing.base + updatedUser.currentStats.magic;
    }

    // Compute HP changes
    let targetHPAfter = target.currentHP;
    if (damage > 0) {
      targetHPAfter = Math.max(0, target.currentHP - damage);
    }
    if (healing > 0) {
      targetHPAfter = Math.min(target.maxHP, target.currentHP + healing);
    }

    const round: CombatRound = {
      attacker: updatedUser.id,
      damage: damage > 0 ? damage : -healing,
      hit: true,
      crit: false,
      attackerHPAfter: updatedUser.currentHP,
      defenderHPAfter: targetHPAfter,
    };
    rounds.push(round);
  }

  return {
    attackerId: updatedUser.id,
    defenderId: targets.length > 0 ? targets[0].id : updatedUser.id,
    rounds,
    attackerExpGained: 0,
    defenderExpGained: 0,
    attackerLevelUp: null,
    defenderLevelUp: null,
  };
}
