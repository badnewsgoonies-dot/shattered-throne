import {
  TerrainType,
  StatusEffectType,
  UnitClassName,
  WeaponType,
} from '../shared/types';

export interface GlossaryEntry {
  term: string;
  definition: string;
}

const GLOSSARY: GlossaryEntry[] = [
  // Combat mechanics
  { term: 'Weapon Triangle', definition: 'Swords beat Axes, Axes beat Lances, Lances beat Swords. Advantage gives +15 hit and +1 damage.' },
  { term: 'Magic Triangle', definition: 'Fire beats Wind, Wind beats Thunder, Thunder beats Fire. Same bonuses as weapon triangle.' },
  { term: 'Counter-attack', definition: 'If the defender has a weapon that can reach the attacker, they will counter-attack.' },
  { term: 'Double Attack', definition: "If a unit's Speed exceeds the target's by 5 or more, they attack twice." },
  { term: 'Critical Hit', definition: 'A critical hit deals 3x normal damage. Crit rate = Skill/2 + Weapon Crit - Enemy Luck.' },
  { term: 'Effective Damage', definition: 'Weapons effective against a unit type (e.g., Horseslayer vs Mounted) deal 3x weapon might.' },
  { term: 'Battle Forecast', definition: 'Before confirming an attack, the forecast shows expected damage, hit rate, and crit chance for both sides.' },
  { term: 'Experience Points', definition: 'Gained by dealing damage and defeating enemies. Accumulate 100 EXP to level up.' },

  // Terrain
  { term: 'Terrain Bonus', definition: 'Standing on certain terrain grants defense and evasion bonuses. Forests give +1 Def and +20 Eva.' },
  { term: 'Movement Cost', definition: 'Each terrain type has a movement cost. Forest costs 2 for foot units. Mountains cost 4.' },
  { term: 'Height Advantage', definition: 'Attacking from higher terrain gives +15% hit rate. Attacking upward gives -15% hit rate.' },
  { term: 'Zone of Control', definition: 'Moving through tiles adjacent to enemies costs 3 extra movement points.' },
  { term: 'Fog of War', definition: "In fog, you can only see tiles within your units' vision range." },
  { term: 'Deployment', definition: 'Before battle, place your units on the blue deployment zones.' },

  // Terrain types
  { term: 'Plains', definition: 'Open terrain with no movement penalty and no defensive bonus.' },
  { term: 'Forest', definition: 'Costs 2 movement for foot units. Grants +1 defense and +20 evasion.' },
  { term: 'Mountain', definition: 'Costs 4 movement for foot units. Grants +2 defense and +30 evasion. Impassable to mounted units.' },
  { term: 'Water', definition: 'Impassable to most units. Flying units can cross freely.' },
  { term: 'Lava', definition: 'Deals damage to units that cross it. Only flying units are unaffected.' },
  { term: 'Fortress', definition: 'Grants +2 defense and +20 evasion. Heals 10% HP at the start of each turn.' },
  { term: 'Bridge', definition: 'Normal movement cost. No defensive bonus. Connects areas over water.' },
  { term: 'Swamp', definition: 'Costs 3 movement for foot units. Slows mounted units significantly.' },
  { term: 'Sand', definition: 'Costs 2 movement for foot units. Mounted and armored units move even slower.' },
  { term: 'Snow', definition: 'Costs 2 movement. Reduces evasion slightly due to poor footing.' },

  // Items and inventory
  { term: 'Durability', definition: 'Weapons break after a certain number of uses. Iron weapons last 45 uses.' },
  { term: 'Convoy', definition: 'Shared item storage accessible between battles and by the Lord unit during battle.' },
  { term: 'Forging', definition: 'Improve weapons at the forge by spending gold to add Might, Hit, or Crit bonuses.' },
  { term: 'Vulnerary', definition: 'A consumable item that restores 10 HP. Can be used 3 times before it is consumed.' },
  { term: 'Elixir', definition: 'A rare consumable that fully restores HP. Has 3 uses.' },

  // Progression
  { term: 'Promotion', definition: 'At level 15, units can promote to an advanced class using a promotion item.' },
  { term: 'Growth Rates', definition: 'Each stat has a growth rate (%) — the chance that stat increases by 1 on level up.' },
  { term: 'Support Rank', definition: 'Fight alongside allies to build support points. At thresholds, unlock C/B/A conversations.' },
  { term: 'Support Bonus', definition: 'Adjacent allied units provide +10% hit and evasion per adjacent ally.' },
  { term: 'Arena', definition: 'Fight random opponents to earn gold and experience between chapters.' },

  // Status effects
  { term: 'Poison', definition: 'Deals 10% max HP damage at the start of each turn for the duration.' },
  { term: 'Sleep', definition: 'Unit cannot move or act until the effect wears off or is cured.' },
  { term: 'Silence', definition: 'Unit cannot use magic or staves until the effect wears off.' },
  { term: 'Berserk', definition: 'Unit attacks the nearest unit regardless of team. Gains +50% attack but cannot be controlled.' },
  { term: 'Charm', definition: 'Unit fights for the enemy until the effect wears off.' },
  { term: 'Frozen', definition: 'Unit cannot move but can still attack adjacent enemies.' },
  { term: 'Blind', definition: 'Reduces hit rate by 50% for the duration of the effect.' },
  { term: 'Stun', definition: 'Unit loses their next turn entirely. Cannot move or act.' },

  // Victory conditions
  { term: 'Rout', definition: 'Defeat all enemy units on the map to win.' },
  { term: 'Boss Kill', definition: 'Defeat the enemy boss to win the chapter.' },
  { term: 'Survive', definition: 'Survive for a set number of turns to win.' },
  { term: 'Reach Location', definition: 'Move a specific unit to a marked tile on the map.' },
  { term: 'Protect Target', definition: 'Keep a specific NPC alive for the duration of the battle.' },

  // Stats
  { term: 'HP', definition: 'Hit Points — how much damage a unit can take before falling. Reaching 0 HP defeats the unit.' },
  { term: 'Strength', definition: 'Determines physical attack damage. Added to weapon might for physical attacks.' },
  { term: 'Magic', definition: 'Determines magical attack and healing power. Added to tome might for magic attacks.' },
  { term: 'Skill', definition: 'Affects hit rate and critical hit chance. Higher skill means more accurate attacks.' },
  { term: 'Speed', definition: 'Determines double attack threshold and evasion. If Speed exceeds foe by 5+, attack twice.' },
  { term: 'Luck', definition: 'Reduces enemy critical hit chance and slightly improves hit/evasion.' },
  { term: 'Defense', definition: 'Reduces physical damage taken. Subtracted from incoming physical attacks.' },
  { term: 'Resistance', definition: 'Reduces magical damage taken. Subtracted from incoming magical attacks.' },
  { term: 'Movement', definition: 'How many tiles a unit can move per turn. Affected by terrain and movement type.' },

  // Classes
  { term: 'Warrior', definition: 'A balanced melee fighter who wields swords. Good all-around stats.' },
  { term: 'Knight', definition: 'A heavily armored unit with high defense but low speed. Uses lances.' },
  { term: 'Archer', definition: 'A ranged attacker using bows. Cannot counter-attack at melee range.' },
  { term: 'Mage', definition: 'A magic user who attacks with elemental tomes. High magic but low defense.' },
  { term: 'Cleric', definition: 'A healer who uses staves. Cannot attack but restores allies\' HP.' },
  { term: 'Thief', definition: 'A fast unit that can pick locks and steal items. Uses swords.' },
  { term: 'Berserker', definition: 'Promoted from Warrior. High strength and crit rate. Uses swords and axes.' },
  { term: 'Paladin', definition: 'Promoted from Knight. A mounted unit with good defense and movement. Uses lances and swords.' },
  { term: 'Assassin', definition: 'Promoted from Thief. Extremely fast with high crit. Uses swords and bows.' },
  { term: 'Sage', definition: 'Promoted from Mage. Masters multiple tome types and gains staff access.' },
  { term: 'General', definition: 'Promoted from Knight. Maximum defense and can use lances and axes.' },
  { term: 'Dancer', definition: 'A unique support class that can refresh an ally, granting them another turn.' },
  { term: 'Sniper', definition: 'Promoted from Archer. Extended bow range and high skill.' },
  { term: 'Ranger', definition: 'A mounted bow user with high movement. Can also use swords.' },
  { term: 'Dark Knight', definition: 'A mounted magic user combining swords and dark magic.' },
  { term: 'Bishop', definition: 'Promoted from Cleric. Powerful healing and can use light tomes.' },
  { term: 'Valkyrie', definition: 'A mounted healer with high movement. Uses staves and light tomes.' },
  { term: 'Trickster', definition: 'A versatile class that can use swords and staves. High speed and skill.' },
  { term: 'Great Knight', definition: 'A heavily armored mounted unit. Uses swords, lances, and axes.' },

  // Weapon types
  { term: 'Sword', definition: 'A melee weapon with balanced stats. Beats axes in the weapon triangle.' },
  { term: 'Lance', definition: 'A melee weapon with high might. Beats swords in the weapon triangle.' },
  { term: 'Axe', definition: 'A heavy melee weapon. Beats lances but loses to swords.' },
  { term: 'Bow', definition: 'A ranged weapon with 2-tile range. Cannot counter at melee range. Outside weapon triangle.' },
  { term: 'Tome', definition: 'Magical weapons that use the Magic stat. Fire, Wind, Thunder, Dark, and Light types exist.' },
  { term: 'Staff', definition: 'Used to heal allies or inflict status effects. Cannot deal direct damage.' },

  // Misc
  { term: 'Turn', definition: 'Each turn consists of a Player Phase, Enemy Phase, and Ally Phase. All units on a team act during their phase.' },
  { term: 'Danger Zone', definition: 'A display showing all tiles that enemies can attack on their turn. Toggle to plan safe positioning.' },
  { term: 'Wait', definition: 'End a unit\'s turn without performing an action after moving.' },
  { term: 'Trade', definition: 'Exchange items between two adjacent allied units.' },
  { term: 'Rescue', definition: 'A mounted unit can carry a smaller adjacent ally, removing them from danger but reducing the rescuer\'s stats.' },
];

const glossaryMap = new Map<string, GlossaryEntry>();
for (const entry of GLOSSARY) {
  glossaryMap.set(entry.term.toLowerCase(), entry);
}

export function getGlossaryEntry(term: string): string | null {
  const entry = glossaryMap.get(term.toLowerCase());
  return entry ? entry.definition : null;
}

export function searchGlossary(query: string): { term: string; definition: string }[] {
  const q = query.toLowerCase();
  return GLOSSARY.filter(
    (e) => e.term.toLowerCase().includes(q) || e.definition.toLowerCase().includes(q),
  );
}

export function getAllGlossaryEntries(): GlossaryEntry[] {
  return [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
}
