import {
  TerrainType,
  StatusEffectType,
  WeaponType,
  UnitClassName,
} from '../shared/types';

const TERRAIN_TOOLTIPS: Record<TerrainType, string> = {
  [TerrainType.Plains]: 'Plains — No movement penalty. No defensive bonus.',
  [TerrainType.Forest]: 'Forest — Costs 2 movement for foot units. +1 defense, +20 evasion.',
  [TerrainType.Mountain]: 'Mountain — Costs 4 movement for foot. +2 defense, +30 evasion. Impassable to mounted.',
  [TerrainType.Water]: 'Water — Impassable to most units. Flying units can cross freely.',
  [TerrainType.Lava]: 'Lava — Deals damage when crossed. Only flying units are unaffected.',
  [TerrainType.Fortress]: 'Fortress — +2 defense, +20 evasion. Heals 10% HP at start of turn.',
  [TerrainType.Bridge]: 'Bridge — Normal movement cost. No defensive bonus.',
  [TerrainType.Swamp]: 'Swamp — Costs 3 movement for foot. Slows mounted units significantly.',
  [TerrainType.Sand]: 'Sand — Costs 2 movement for foot. Mounted and armored units are slower.',
  [TerrainType.Snow]: 'Snow — Costs 2 movement. Reduces evasion slightly.',
  [TerrainType.Void]: 'Void — Impassable to all units.',
};

const STAT_TOOLTIPS: Record<string, string> = {
  hp: 'HP (Hit Points) — Total damage a unit can take before being defeated.',
  strength: 'Strength — Increases physical attack damage.',
  magic: 'Magic — Increases magical attack damage and healing power.',
  skill: 'Skill — Improves hit rate and critical hit chance.',
  speed: 'Speed — Determines doubling threshold and evasion. Exceed foe by 5+ to attack twice.',
  luck: 'Luck — Reduces enemy critical hit chance. Slightly boosts hit and evasion.',
  defense: 'Defense — Reduces incoming physical damage.',
  resistance: 'Resistance — Reduces incoming magical damage.',
  movement: 'Movement — Number of tiles a unit can move per turn.',
};

const STATUS_TOOLTIPS: Record<StatusEffectType, string> = {
  [StatusEffectType.Poison]: 'Poison — Deals 10% max HP damage at the start of each turn.',
  [StatusEffectType.Sleep]: 'Sleep — Unit cannot move or act until the effect wears off.',
  [StatusEffectType.Silence]: 'Silence — Unit cannot use magic or staves.',
  [StatusEffectType.Berserk]: 'Berserk — Unit attacks the nearest unit regardless of team. +50% attack.',
  [StatusEffectType.Charm]: 'Charm — Unit fights for the enemy until the effect ends.',
  [StatusEffectType.Frozen]: 'Frozen — Unit cannot move but can still attack adjacent enemies.',
  [StatusEffectType.Blind]: 'Blind — Reduces hit rate by 50%.',
  [StatusEffectType.Stun]: 'Stun — Unit loses their next turn. Cannot move or act.',
};

const WEAPON_TOOLTIPS: Record<WeaponType, string> = {
  [WeaponType.Sword]: 'Sword — Balanced melee weapon. Beats Axes, loses to Lances in the weapon triangle.',
  [WeaponType.Lance]: 'Lance — Melee weapon with high might. Beats Swords, loses to Axes.',
  [WeaponType.Axe]: 'Axe — Heavy melee weapon. Beats Lances, loses to Swords.',
  [WeaponType.Bow]: 'Bow — Ranged weapon (2 tiles). Cannot counter at melee range. Outside weapon triangle.',
  [WeaponType.FireTome]: 'Fire Tome — Fire magic. Beats Wind tomes in the magic triangle.',
  [WeaponType.WindTome]: 'Wind Tome — Wind magic. Beats Thunder tomes in the magic triangle.',
  [WeaponType.ThunderTome]: 'Thunder Tome — Thunder magic. Beats Fire tomes in the magic triangle.',
  [WeaponType.DarkTome]: 'Dark Tome — Dark magic. Outside the standard magic triangle.',
  [WeaponType.LightTome]: 'Light Tome — Light magic. Outside the standard magic triangle.',
  [WeaponType.Staff]: 'Staff — Used for healing and support. Cannot deal direct damage.',
};

const CLASS_TOOLTIPS: Record<UnitClassName, string> = {
  [UnitClassName.Warrior]: 'Warrior — Balanced melee fighter. Wields swords. Good all-around stats.',
  [UnitClassName.Knight]: 'Knight — Heavily armored with high defense. Uses lances. Low speed.',
  [UnitClassName.Archer]: 'Archer — Ranged attacker with bows. Cannot counter at melee range.',
  [UnitClassName.Mage]: 'Mage — Magic user with elemental tomes. High magic, low defense.',
  [UnitClassName.Cleric]: 'Cleric — Healer using staves. Cannot attack directly.',
  [UnitClassName.Thief]: 'Thief — Fast unit that can pick locks and steal. Uses swords.',
  [UnitClassName.Berserker]: 'Berserker — Promoted Warrior. High strength and crit. Uses swords and axes.',
  [UnitClassName.Paladin]: 'Paladin — Promoted Knight. Mounted with good defense. Uses lances and swords.',
  [UnitClassName.Assassin]: 'Assassin — Promoted Thief. Extremely fast with lethal crits. Uses swords and bows.',
  [UnitClassName.Sage]: 'Sage — Promoted Mage. Masters multiple tomes and gains staff access.',
  [UnitClassName.General]: 'General — Promoted Knight. Maximum defense. Uses lances and axes.',
  [UnitClassName.Dancer]: 'Dancer — Support class that refreshes allies, granting them another turn.',
  [UnitClassName.Sniper]: 'Sniper — Promoted Archer. Extended range and high skill.',
  [UnitClassName.Ranger]: 'Ranger — Mounted bow user. High movement. Can also use swords.',
  [UnitClassName.DarkKnight]: 'Dark Knight — Mounted magic user. Combines swords and dark magic.',
  [UnitClassName.Bishop]: 'Bishop — Promoted Cleric. Powerful healing and light tome access.',
  [UnitClassName.Valkyrie]: 'Valkyrie — Mounted healer. High movement. Uses staves and light tomes.',
  [UnitClassName.Trickster]: 'Trickster — Versatile class using swords and staves. High speed and skill.',
  [UnitClassName.GreatKnight]: 'Great Knight — Heavily armored mount. Uses swords, lances, and axes.',
};

export function getTooltipForTerrain(terrainType: TerrainType): string {
  return TERRAIN_TOOLTIPS[terrainType] ?? 'Unknown terrain.';
}

export function getTooltipForStat(statName: string): string {
  return STAT_TOOLTIPS[statName.toLowerCase()] ?? 'Unknown stat.';
}

export function getTooltipForStatus(statusType: StatusEffectType): string {
  return STATUS_TOOLTIPS[statusType] ?? 'Unknown status effect.';
}

export function getTooltipForWeaponType(weaponType: WeaponType): string {
  return WEAPON_TOOLTIPS[weaponType] ?? 'Unknown weapon type.';
}

export function getTooltipForClass(className: UnitClassName): string {
  return CLASS_TOOLTIPS[className] ?? 'Unknown class.';
}
