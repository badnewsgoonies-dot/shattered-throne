import {
  AIBehavior,
  EnemyPlacement,
  Position,
  UnitClassName,
} from '../shared/types';

function pos(x: number, y: number): Position {
  return { x, y };
}

function enemy(
  characterId: string,
  className: UnitClassName,
  level: number,
  position: Position,
  equipment: string[],
  aiBehavior: AIBehavior,
  isBoss = false,
  dropItemId?: string,
): EnemyPlacement {
  return {
    characterId,
    className,
    level,
    position,
    equipment,
    aiBehavior,
    isBoss,
    dropItemId,
  };
}

export const ENEMY_TEMPLATES: EnemyPlacement[] = [
  enemy('enemy_bandit_01', UnitClassName.Warrior, 3, pos(0, 0), ['iron_axe', 'vulnerary'], AIBehavior.Aggressive),
  enemy('enemy_bandit_02', UnitClassName.Warrior, 4, pos(1, 0), ['iron_axe'], AIBehavior.Aggressive),
  enemy('enemy_bandit_03', UnitClassName.Warrior, 5, pos(2, 0), ['steel_axe'], AIBehavior.Aggressive),
  enemy('enemy_bandit_04', UnitClassName.Warrior, 6, pos(3, 0), ['steel_axe', 'hand_axe'], AIBehavior.Aggressive),
  enemy('enemy_bandit_05', UnitClassName.Warrior, 7, pos(4, 0), ['killer_axe'], AIBehavior.Aggressive),
  enemy('enemy_bandit_06', UnitClassName.Thief, 6, pos(5, 0), ['steel_sword', 'door_key'], AIBehavior.Flanker),
  enemy('enemy_bandit_07', UnitClassName.Thief, 7, pos(6, 0), ['killing_edge', 'chest_key'], AIBehavior.Flanker),
  enemy('enemy_bandit_08', UnitClassName.Thief, 8, pos(7, 0), ['levin_sword', 'master_key'], AIBehavior.Flanker),

  enemy('enemy_soldier_01', UnitClassName.Knight, 4, pos(0, 1), ['iron_lance'], AIBehavior.Defensive),
  enemy('enemy_soldier_02', UnitClassName.Knight, 5, pos(1, 1), ['steel_lance'], AIBehavior.Defensive),
  enemy('enemy_soldier_03', UnitClassName.Knight, 6, pos(2, 1), ['javelin'], AIBehavior.Defensive),
  enemy('enemy_soldier_04', UnitClassName.Knight, 8, pos(3, 1), ['steel_lance', 'vulnerary'], AIBehavior.Defensive),
  enemy('enemy_soldier_05', UnitClassName.Archer, 4, pos(4, 1), ['iron_bow'], AIBehavior.Defensive),
  enemy('enemy_soldier_06', UnitClassName.Archer, 6, pos(5, 1), ['steel_bow'], AIBehavior.Defensive),
  enemy('enemy_soldier_07', UnitClassName.Archer, 7, pos(6, 1), ['longbow'], AIBehavior.Defensive),
  enemy('enemy_soldier_08', UnitClassName.Archer, 9, pos(7, 1), ['killer_bow'], AIBehavior.Defensive),

  enemy('enemy_mage_01', UnitClassName.Mage, 5, pos(0, 2), ['fire'], AIBehavior.Support),
  enemy('enemy_mage_02', UnitClassName.Mage, 6, pos(1, 2), ['wind'], AIBehavior.Support),
  enemy('enemy_mage_03', UnitClassName.Mage, 7, pos(2, 2), ['thunder'], AIBehavior.Support),
  enemy('enemy_mage_04', UnitClassName.Mage, 9, pos(3, 2), ['elfire'], AIBehavior.Support),
  enemy('enemy_mage_05', UnitClassName.Mage, 10, pos(4, 2), ['elthunder'], AIBehavior.Support),
  enemy('enemy_mage_06', UnitClassName.Mage, 12, pos(5, 2), ['arcthunder'], AIBehavior.Support),
  enemy('enemy_mage_07', UnitClassName.Cleric, 8, pos(6, 2), ['heal_staff'], AIBehavior.Support),
  enemy('enemy_mage_08', UnitClassName.Cleric, 10, pos(7, 2), ['mend_staff', 'restore_staff'], AIBehavior.Support),

  enemy('enemy_elite_01', UnitClassName.Berserker, 14, pos(0, 3), ['killer_axe', 'hand_axe'], AIBehavior.Aggressive),
  enemy('enemy_elite_02', UnitClassName.Paladin, 14, pos(1, 3), ['silver_lance', 'steel_sword'], AIBehavior.Defensive),
  enemy('enemy_elite_03', UnitClassName.Assassin, 15, pos(2, 3), ['killing_edge', 'smoke_bomb'], AIBehavior.Flanker),
  enemy('enemy_elite_04', UnitClassName.Sage, 16, pos(3, 3), ['arcfire', 'elwind'], AIBehavior.Support),
  enemy('enemy_elite_05', UnitClassName.General, 16, pos(4, 3), ['silver_lance', 'steel_plate'], AIBehavior.Defensive),
  enemy('enemy_elite_06', UnitClassName.Sniper, 15, pos(5, 3), ['silver_bow', 'longbow'], AIBehavior.Defensive),
  enemy('enemy_elite_07', UnitClassName.Ranger, 15, pos(6, 3), ['silver_bow', 'steel_sword'], AIBehavior.Flanker),
  enemy('enemy_elite_08', UnitClassName.DarkKnight, 17, pos(7, 3), ['flux', 'runesword'], AIBehavior.Boss),

  enemy('enemy_elite_09', UnitClassName.Bishop, 16, pos(0, 4), ['shine', 'physic_staff'], AIBehavior.Support),
  enemy('enemy_elite_10', UnitClassName.Valkyrie, 16, pos(1, 4), ['lightning', 'rescue_staff'], AIBehavior.Support),
  enemy('enemy_elite_11', UnitClassName.Trickster, 15, pos(2, 4), ['levin_sword', 'restore_staff'], AIBehavior.Flanker),
  enemy('enemy_elite_12', UnitClassName.GreatKnight, 17, pos(3, 4), ['silver_lance', 'tomahawk'], AIBehavior.Defensive),

  enemy('enemy_commander_01', UnitClassName.General, 20, pos(4, 4), ['gradivus', 'fortress_greaves'], AIBehavior.Boss, true, 'master_seal'),
  enemy('enemy_commander_02', UnitClassName.Sage, 21, pos(5, 4), ['bolganone', 'fenrir'], AIBehavior.Boss, true, 'guiding_ring'),
  enemy('enemy_commander_03', UnitClassName.Assassin, 22, pos(6, 4), ['shadowfang', 'smoke_bomb'], AIBehavior.Boss, true, 'hero_crest'),
  enemy('enemy_commander_04', UnitClassName.Berserker, 23, pos(7, 4), ['hauteclere', 'vulnerary'], AIBehavior.Boss, true, 'knight_crest'),
];

export function getEnemyTemplateById(id: string): EnemyPlacement | null {
  return ENEMY_TEMPLATES.find((entry) => entry.characterId === id) ?? null;
}

export function getAllEnemyTemplates(): EnemyPlacement[] {
  return ENEMY_TEMPLATES.map((entry) => ({
    ...entry,
    position: { ...entry.position },
    equipment: [...entry.equipment],
  }));
}
