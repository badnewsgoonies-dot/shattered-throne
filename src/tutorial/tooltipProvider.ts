import { StatusEffectType, TerrainType, UnitClassName, WeaponType } from '../shared/types';

const TERRAIN_TOOLTIPS: Record<TerrainType, string> = {
  [TerrainType.Plains]: 'Plains: No bonuses. Standard movement cost for most units.',
  [TerrainType.Forest]: 'Forest: +1 Defense, +20 Evasion. Movement is slower for mounted units.',
  [TerrainType.Mountain]: 'Mountain: +2 Defense, +30 Evasion, high elevation. Difficult for non-fliers to cross.',
  [TerrainType.Water]: 'Water: Impassable for most ground units. Flying units cross freely.',
  [TerrainType.Lava]: 'Lava: Hazardous and impassable for most units. Flying units can traverse it.',
  [TerrainType.Fortress]: 'Fortress: +3 Defense, +20 Evasion, and favorable defensive positioning.',
  [TerrainType.Bridge]: 'Bridge: Narrow pass with no terrain bonuses. Useful for chokepoints.',
  [TerrainType.Swamp]: 'Swamp: Slows movement and grants minor evasion. Mounted units are heavily slowed.',
  [TerrainType.Sand]: 'Sand: Reduces movement for ground units. Minimal combat bonuses.',
  [TerrainType.Snow]: 'Snow: Slows movement and provides a slight evasion bonus.',
  [TerrainType.Void]: 'Void: Impassable terrain with no combat bonuses.',
};

const STAT_TOOLTIPS: Record<string, string> = {
  hp: 'HP (Hit Points): Determines how much damage a unit can take before being defeated.',
  health: 'HP (Hit Points): Determines how much damage a unit can take before being defeated.',
  strength: 'Strength: Increases physical damage from swords, lances, axes, and bows.',
  str: 'Strength: Increases physical damage from swords, lances, axes, and bows.',
  magic: 'Magic: Increases tome damage and healing effectiveness with staves.',
  mag: 'Magic: Increases tome damage and healing effectiveness with staves.',
  skill: 'Skill: Improves hit rate and contributes to critical chance.',
  skl: 'Skill: Improves hit rate and contributes to critical chance.',
  speed: 'Speed: Improves evasion and enables double attacks when 5 or more above target speed.',
  spd: 'Speed: Improves evasion and enables double attacks when 5 or more above target speed.',
  luck: 'Luck: Reduces enemy critical chance and slightly improves combat reliability.',
  lck: 'Luck: Reduces enemy critical chance and slightly improves combat reliability.',
  defense: 'Defense: Reduces incoming physical damage.',
  def: 'Defense: Reduces incoming physical damage.',
  resistance: 'Resistance: Reduces incoming magical damage.',
  res: 'Resistance: Reduces incoming magical damage.',
  movement: 'Movement: Determines how many tiles a unit can traverse each turn.',
  mov: 'Movement: Determines how many tiles a unit can traverse each turn.',
};

const STATUS_TOOLTIPS: Record<StatusEffectType, string> = {
  [StatusEffectType.Poison]: 'Poison: Unit loses 10% max HP at the start of each turn.',
  [StatusEffectType.Sleep]: 'Sleep: Unit cannot act until the status expires or they are struck.',
  [StatusEffectType.Silence]: 'Silence: Unit cannot use tomes or staves while silenced.',
  [StatusEffectType.Berserk]: 'Berserk: Unit attacks the nearest target, regardless of allegiance.',
  [StatusEffectType.Charm]: 'Charm: Unit temporarily fights for the opposing side.',
  [StatusEffectType.Frozen]: 'Frozen: Unit cannot move but may still act if targets are in range.',
  [StatusEffectType.Blind]: 'Blind: Unit suffers a severe hit-rate penalty.',
  [StatusEffectType.Stun]: 'Stun: Unit loses its next action.',
};

const WEAPON_TOOLTIPS: Record<WeaponType, string> = {
  [WeaponType.Sword]: 'Sword: Fast physical weapon. Weapon Triangle advantage over Axes (+15 Hit, +1 Damage).',
  [WeaponType.Lance]: 'Lance: Balanced physical weapon. Weapon Triangle advantage over Swords (+15 Hit, +1 Damage).',
  [WeaponType.Axe]: 'Axe: Heavy physical weapon. Weapon Triangle advantage over Lances (+15 Hit, +1 Damage).',
  [WeaponType.Bow]: 'Bow: Ranged physical weapon, strong at distance but weak in close quarters.',
  [WeaponType.FireTome]: 'Fire Tome: Magic with advantage over Wind in the Magic Triangle.',
  [WeaponType.WindTome]: 'Wind Tome: Magic with advantage over Thunder in the Magic Triangle.',
  [WeaponType.ThunderTome]: 'Thunder Tome: Magic with advantage over Fire in the Magic Triangle.',
  [WeaponType.DarkTome]: 'Dark Tome: Specialized magic type, outside the standard elemental triangle.',
  [WeaponType.LightTome]: 'Light Tome: Holy magic focused on accuracy and support pressure.',
  [WeaponType.Staff]: 'Staff: Utility and healing tool. Typically used for support rather than direct attacks.',
};

const CLASS_TOOLTIPS: Record<UnitClassName, string> = {
  [UnitClassName.Warrior]: 'Warrior: Durable front-line fighter using physical weapons.',
  [UnitClassName.Knight]: 'Knight: Mounted lancer with strong mobility and stable frontline presence.',
  [UnitClassName.Archer]: 'Archer: Ranged specialist with strong target focus from a distance.',
  [UnitClassName.Mage]: 'Mage: Offensive caster that attacks enemy Resistance.',
  [UnitClassName.Cleric]: 'Cleric: Dedicated healer using supportive staff techniques.',
  [UnitClassName.Thief]: 'Thief: Fast utility class with high evasion and map interaction tools.',
  [UnitClassName.Berserker]: 'Berserker: Power-focused promoted warrior with high critical potential.',
  [UnitClassName.Paladin]: 'Paladin: Promoted mounted class with balanced offense, defense, and support access.',
  [UnitClassName.Assassin]: 'Assassin: Precision promoted thief with high speed and critical consistency.',
  [UnitClassName.Sage]: 'Sage: Promoted mage with potent offensive and support magic.',
  [UnitClassName.General]: 'General: Heavy armored promoted class built for holding lines and objectives.',
  [UnitClassName.Dancer]: 'Dancer: Support specialist that refreshes allies for additional actions.',
  [UnitClassName.Sniper]: 'Sniper: Elite promoted archer with excellent ranged pressure.',
  [UnitClassName.Ranger]: 'Ranger: Mobile promoted archer that excels at repositioning and skirmishing.',
  [UnitClassName.DarkKnight]: 'Dark Knight: Mounted caster combining mobility with magical offense.',
  [UnitClassName.Bishop]: 'Bishop: Promoted cleric focused on high-value healing and holy magic.',
  [UnitClassName.Valkyrie]: 'Valkyrie: Mounted support class with flexible healing coverage.',
  [UnitClassName.Trickster]: 'Trickster: Utility-focused promoted thief with evasive support options.',
  [UnitClassName.GreatKnight]: 'Great Knight: Armored mounted class with strong defenses and weapon flexibility.',
};

export function getTooltipForTerrain(terrain: TerrainType): string {
  return TERRAIN_TOOLTIPS[terrain];
}

export function getTooltipForStat(statName: string): string {
  const normalized = statName.trim().toLowerCase();
  return STAT_TOOLTIPS[normalized] ?? 'No tooltip available for this stat.';
}

export function getTooltipForStatus(status: StatusEffectType): string {
  return STATUS_TOOLTIPS[status];
}

export function getTooltipForWeaponType(weapon: WeaponType): string {
  return WEAPON_TOOLTIPS[weapon];
}

export function getTooltipForClass(className: UnitClassName): string {
  return CLASS_TOOLTIPS[className];
}
