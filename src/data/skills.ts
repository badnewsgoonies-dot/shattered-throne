import { SkillDefinition, SkillType, AoEPattern, StatusEffectType, UnitClassName } from '../../src/shared/types';

export const skills: SkillDefinition[] = [
  // ===== ACTIVE DAMAGE SKILLS =====
  {
    id: 'power-strike', name: 'Power Strike', description: 'A powerful strike dealing 1.5x strength damage.',
    type: SkillType.Active, spCost: 5, range: { min: 1, max: 1 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    damage: { base: 8, scaling: 'strength' },
  },
  {
    id: 'luna-strike', name: 'Luna Strike', description: 'Ignores 50% of target defense.',
    type: SkillType.Active, spCost: 8, range: { min: 1, max: 1 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    damage: { base: 5, scaling: 'strength' },
  },
  {
    id: 'sol', name: 'Sol', description: 'Drains HP equal to damage dealt.',
    type: SkillType.Active, spCost: 10, range: { min: 1, max: 1 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    damage: { base: 6, scaling: 'strength' },
  },
  {
    id: 'astra', name: 'Astra', description: 'Five consecutive hits at 50% damage each.',
    type: SkillType.Active, spCost: 15, range: { min: 1, max: 1 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    damage: { base: 3, scaling: 'strength' },
  },
  {
    id: 'ignis', name: 'Ignis', description: 'Adds Magic to physical attack damage.',
    type: SkillType.Active, spCost: 8, range: { min: 1, max: 1 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    damage: { base: 5, scaling: 'magic' },
  },
  {
    id: 'flame-burst', name: 'Flame Burst', description: 'AoE fire damage in a circle.',
    type: SkillType.Active, spCost: 10, range: { min: 1, max: 2 }, aoePattern: AoEPattern.Circle, aoeSize: 1,
    damage: { base: 8, scaling: 'magic' },
    classRestriction: [UnitClassName.Mage, UnitClassName.Sage, UnitClassName.DarkKnight],
  },
  {
    id: 'wind-blade', name: 'Wind Blade', description: 'AoE wind damage in a line.',
    type: SkillType.Active, spCost: 12, range: { min: 1, max: 3 }, aoePattern: AoEPattern.Line, aoeSize: 3,
    damage: { base: 7, scaling: 'magic' },
    classRestriction: [UnitClassName.Mage, UnitClassName.Sage],
  },
  {
    id: 'thunder-strike', name: 'Thunder Strike', description: 'AoE thunder damage in a cross pattern.',
    type: SkillType.Active, spCost: 12, range: { min: 1, max: 2 }, aoePattern: AoEPattern.Cross, aoeSize: 1,
    damage: { base: 9, scaling: 'magic' },
    classRestriction: [UnitClassName.Mage, UnitClassName.Sage, UnitClassName.DarkKnight],
  },
  {
    id: 'lethality', name: 'Lethality', description: 'A deadly strike with a chance to instantly defeat the target.',
    type: SkillType.Active, spCost: 20, range: { min: 1, max: 1 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    damage: { base: 15, scaling: 'strength' },
    classRestriction: [UnitClassName.Assassin],
  },
  {
    id: 'bonfire', name: 'Bonfire', description: 'Adds 50% of defense to damage.',
    type: SkillType.Active, spCost: 7, range: { min: 1, max: 1 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    damage: { base: 5, scaling: 'strength' },
  },
  {
    id: 'dragon-fang', name: 'Dragon Fang', description: 'A devastating attack that deals massive damage.',
    type: SkillType.Active, spCost: 18, range: { min: 1, max: 1 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    damage: { base: 12, scaling: 'strength' },
  },
  {
    id: 'vengeance', name: 'Vengeance', description: 'Deals bonus damage based on HP lost.',
    type: SkillType.Active, spCost: 8, range: { min: 1, max: 1 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    damage: { base: 4, scaling: 'strength' },
  },
  {
    id: 'sacred-strike', name: 'Sacred Strike', description: 'A holy strike that deals light damage.',
    type: SkillType.Active, spCost: 10, range: { min: 1, max: 2 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    damage: { base: 8, scaling: 'magic' },
    classRestriction: [UnitClassName.Bishop, UnitClassName.Valkyrie],
  },
  {
    id: 'dark-spike', name: 'Dark Spike', description: 'A concentrated blast of dark energy.',
    type: SkillType.Active, spCost: 10, range: { min: 1, max: 2 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    damage: { base: 10, scaling: 'magic' },
  },
  {
    id: 'armor-break', name: 'Armor Break', description: 'Reduces target defense by 4 for 3 turns.',
    type: SkillType.Active, spCost: 6, range: { min: 1, max: 1 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    damage: { base: 4, scaling: 'strength' },
    debuff: { stats: { defense: -4 }, duration: 3 },
  },

  // ===== ACTIVE HEAL/SUPPORT SKILLS =====
  {
    id: 'heal', name: 'Heal', description: 'Restores 15 HP to an adjacent ally.',
    type: SkillType.Active, spCost: 3, range: { min: 1, max: 1 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    healing: { base: 15, scaling: 'magic' },
  },
  {
    id: 'rally-strength', name: 'Rally Strength', description: 'Grants +4 Str to allies in range 2.',
    type: SkillType.Active, spCost: 5, range: { min: 0, max: 2 }, aoePattern: AoEPattern.Circle, aoeSize: 2,
    buff: { stats: { strength: 4 }, duration: 1 },
  },
  {
    id: 'rally-speed', name: 'Rally Speed', description: 'Grants +4 Spd to allies in range 2.',
    type: SkillType.Active, spCost: 5, range: { min: 0, max: 2 }, aoePattern: AoEPattern.Circle, aoeSize: 2,
    buff: { stats: { speed: 4 }, duration: 1 },
  },
  {
    id: 'rally-defense', name: 'Rally Defense', description: 'Grants +4 Def to allies in range 2.',
    type: SkillType.Active, spCost: 5, range: { min: 0, max: 2 }, aoePattern: AoEPattern.Circle, aoeSize: 2,
    buff: { stats: { defense: 4 }, duration: 1 },
  },
  {
    id: 'rally-resistance', name: 'Rally Resistance', description: 'Grants +4 Res to allies in range 2.',
    type: SkillType.Active, spCost: 5, range: { min: 0, max: 2 }, aoePattern: AoEPattern.Circle, aoeSize: 2,
    buff: { stats: { resistance: 4 }, duration: 1 },
  },
  {
    id: 'rally-magic', name: 'Rally Magic', description: 'Grants +4 Mag to allies in range 2.',
    type: SkillType.Active, spCost: 5, range: { min: 0, max: 2 }, aoePattern: AoEPattern.Circle, aoeSize: 2,
    buff: { stats: { magic: 4 }, duration: 1 },
  },
  {
    id: 'dance', name: 'Dance', description: 'Grants an extra turn to an adjacent ally.',
    type: SkillType.Active, spCost: 10, range: { min: 1, max: 1 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    classRestriction: [UnitClassName.Dancer],
  },
  {
    id: 'restore-skill', name: 'Restore', description: 'Cures all status effects on an adjacent ally.',
    type: SkillType.Active, spCost: 5, range: { min: 1, max: 1 }, aoePattern: AoEPattern.Single, aoeSize: 0,
  },
  {
    id: 'barrier', name: 'Barrier', description: 'Grants +7 Res to target for 3 turns.',
    type: SkillType.Active, spCost: 5, range: { min: 1, max: 1 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    buff: { stats: { resistance: 7 }, duration: 3 },
  },
  {
    id: 'fortify-skill', name: 'Fortify', description: 'Heals all allies within range 2 for 10 HP.',
    type: SkillType.Active, spCost: 12, range: { min: 0, max: 2 }, aoePattern: AoEPattern.Circle, aoeSize: 2,
    healing: { base: 10, scaling: 'magic' },
    classRestriction: [UnitClassName.Bishop, UnitClassName.Valkyrie],
  },
  {
    id: 'inspire', name: 'Inspire', description: 'Boosts all stats of an adjacent ally by 2 for 2 turns.',
    type: SkillType.Active, spCost: 8, range: { min: 1, max: 1 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    buff: { stats: { strength: 2, magic: 2, skill: 2, speed: 2, defense: 2, resistance: 2 }, duration: 2 },
  },

  // ===== ACTIVE DEBUFF SKILLS =====
  {
    id: 'poison-strike', name: 'Poison Strike', description: 'Inflicts poison on the target.',
    type: SkillType.Active, spCost: 5, range: { min: 1, max: 1 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    damage: { base: 2, scaling: 'strength' },
    statusEffect: { type: StatusEffectType.Poison, chance: 100, duration: 3 },
  },
  {
    id: 'silence-skill', name: 'Silence', description: 'Silences a target, preventing magic use.',
    type: SkillType.Active, spCost: 8, range: { min: 1, max: 3 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    statusEffect: { type: StatusEffectType.Silence, chance: 80, duration: 3 },
  },
  {
    id: 'hex', name: 'Hex', description: 'Reduces target Def and Res by 4 for 3 turns.',
    type: SkillType.Active, spCost: 8, range: { min: 1, max: 2 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    debuff: { stats: { defense: -4, resistance: -4 }, duration: 3 },
  },
  {
    id: 'freeze', name: 'Freeze', description: 'Attempts to freeze the target in place.',
    type: SkillType.Active, spCost: 10, range: { min: 1, max: 2 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    statusEffect: { type: StatusEffectType.Frozen, chance: 70, duration: 2 },
  },
  {
    id: 'intimidate', name: 'Intimidate', description: 'Reduces target Str and Spd by 3 for 2 turns.',
    type: SkillType.Active, spCost: 6, range: { min: 1, max: 1 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    debuff: { stats: { strength: -3, speed: -3 }, duration: 2 },
  },
  {
    id: 'sleep-skill', name: 'Sleep', description: 'Puts target to sleep.',
    type: SkillType.Active, spCost: 10, range: { min: 1, max: 2 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    statusEffect: { type: StatusEffectType.Sleep, chance: 70, duration: 3 },
  },

  // ===== PASSIVE SKILLS =====
  {
    id: 'vantage', name: 'Vantage', description: 'Counter first when HP is below 50%.',
    type: SkillType.Passive, spCost: 0, range: { min: 0, max: 0 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    passiveEffect: { type: 'counterFirst', condition: 'hp<50%', value: 1 },
  },
  {
    id: 'wrath', name: 'Wrath', description: '+20 critical rate when HP is below 50%.',
    type: SkillType.Passive, spCost: 0, range: { min: 0, max: 0 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    passiveEffect: { type: 'critBonus', condition: 'hp<50%', value: 20 },
  },
  {
    id: 'renewal', name: 'Renewal', description: 'Heal 10% HP at the start of each turn.',
    type: SkillType.Passive, spCost: 0, range: { min: 0, max: 0 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    passiveEffect: { type: 'turnHeal', value: 10 },
  },
  {
    id: 'counter', name: 'Counter', description: 'Reflects melee damage back to attacker.',
    type: SkillType.Passive, spCost: 0, range: { min: 0, max: 0 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    passiveEffect: { type: 'reflectMelee', value: 100 },
  },
  {
    id: 'miracle', name: 'Miracle', description: 'Survive a lethal hit at 1 HP (luck% chance, once per battle).',
    type: SkillType.Passive, spCost: 0, range: { min: 0, max: 0 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    passiveEffect: { type: 'surviveLethal', value: 1 },
  },
  {
    id: 'pavise', name: 'Pavise', description: 'Halve physical damage (Skill% chance).',
    type: SkillType.Passive, spCost: 0, range: { min: 0, max: 0 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    passiveEffect: { type: 'halvePhysical', value: 50 },
  },
  {
    id: 'aegis', name: 'Aegis', description: 'Halve magic damage (Skill% chance).',
    type: SkillType.Passive, spCost: 0, range: { min: 0, max: 0 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    passiveEffect: { type: 'halveMagic', value: 50 },
  },
  {
    id: 'desperation', name: 'Desperation', description: 'Double attack before counter when HP < 50%.',
    type: SkillType.Passive, spCost: 0, range: { min: 0, max: 0 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    passiveEffect: { type: 'doubleBeforeCounter', condition: 'hp<50%', value: 1 },
  },
  {
    id: 'quick-burn', name: 'Quick Burn', description: '+15 hit/evade turn 1, decreasing each turn.',
    type: SkillType.Passive, spCost: 0, range: { min: 0, max: 0 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    passiveEffect: { type: 'earlyBonus', value: 15 },
  },
  {
    id: 'lifetaker', name: 'Lifetaker', description: 'Heal 50% HP on kill.',
    type: SkillType.Passive, spCost: 0, range: { min: 0, max: 0 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    passiveEffect: { type: 'healOnKill', value: 50 },
  },
  {
    id: 'focus', name: 'Focus', description: '+10 critical rate when no allies are adjacent.',
    type: SkillType.Passive, spCost: 0, range: { min: 0, max: 0 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    passiveEffect: { type: 'critBonus', condition: 'isolated', value: 10 },
  },
  {
    id: 'canto', name: 'Canto', description: 'Move remaining spaces after acting.',
    type: SkillType.Passive, spCost: 0, range: { min: 0, max: 0 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    passiveEffect: { type: 'canto', value: 1 },
  },
  {
    id: 'lockpick', name: 'Lockpick', description: 'Open chests and doors without keys.',
    type: SkillType.Passive, spCost: 0, range: { min: 0, max: 0 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    passiveEffect: { type: 'lockpick', value: 1 },
    classRestriction: [UnitClassName.Thief, UnitClassName.Assassin, UnitClassName.Trickster],
  },
  {
    id: 'steal', name: 'Steal', description: 'Steal an item from an adjacent enemy.',
    type: SkillType.Active, spCost: 3, range: { min: 1, max: 1 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    classRestriction: [UnitClassName.Thief, UnitClassName.Assassin, UnitClassName.Trickster],
  },
  {
    id: 'pass', name: 'Pass', description: 'Move through enemy units.',
    type: SkillType.Passive, spCost: 0, range: { min: 0, max: 0 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    passiveEffect: { type: 'pass', value: 1 },
  },
  {
    id: 'great-shield', name: 'Great Shield', description: 'Completely negate physical attacks (Skill/2% chance).',
    type: SkillType.Passive, spCost: 0, range: { min: 0, max: 0 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    passiveEffect: { type: 'negatePhysical', value: 1 },
    classRestriction: [UnitClassName.General, UnitClassName.GreatKnight],
  },
  {
    id: 'sure-shot', name: 'Sure Shot', description: '+20 hit rate.',
    type: SkillType.Passive, spCost: 0, range: { min: 0, max: 0 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    passiveEffect: { type: 'hitBonus', value: 20 },
    classRestriction: [UnitClassName.Sniper],
  },
  {
    id: 'bowfaire', name: 'Bowfaire', description: '+5 damage when using bows.',
    type: SkillType.Passive, spCost: 0, range: { min: 0, max: 0 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    passiveEffect: { type: 'weaponDamageBonus', condition: 'bow', value: 5 },
  },
  {
    id: 'tomefaire', name: 'Tomefaire', description: '+5 damage when using tomes.',
    type: SkillType.Passive, spCost: 0, range: { min: 0, max: 0 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    passiveEffect: { type: 'weaponDamageBonus', condition: 'tome', value: 5 },
  },
  {
    id: 'lucky-seven', name: 'Lucky Seven', description: '+20 hit and evade for the first 7 turns.',
    type: SkillType.Passive, spCost: 0, range: { min: 0, max: 0 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    passiveEffect: { type: 'earlyBonus', condition: 'turn<=7', value: 20 },
  },
  {
    id: 'charm-skill', name: 'Charm', description: 'Adjacent allies deal +2 damage.',
    type: SkillType.Passive, spCost: 0, range: { min: 0, max: 0 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    passiveEffect: { type: 'allyDamageBonus', value: 2 },
  },
  {
    id: 'resolve', name: 'Resolve', description: '+7 to all stats when HP < 25%.',
    type: SkillType.Passive, spCost: 0, range: { min: 0, max: 0 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    passiveEffect: { type: 'allStatBonus', condition: 'hp<25%', value: 7 },
  },
  {
    id: 'defiant-str', name: 'Defiant Strength', description: '+7 Str when HP < 25%.',
    type: SkillType.Passive, spCost: 0, range: { min: 0, max: 0 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    passiveEffect: { type: 'strBonus', condition: 'hp<25%', value: 7 },
  },
  {
    id: 'defiant-spd', name: 'Defiant Speed', description: '+7 Spd when HP < 25%.',
    type: SkillType.Passive, spCost: 0, range: { min: 0, max: 0 }, aoePattern: AoEPattern.Single, aoeSize: 0,
    passiveEffect: { type: 'spdBonus', condition: 'hp<25%', value: 7 },
  },
];
