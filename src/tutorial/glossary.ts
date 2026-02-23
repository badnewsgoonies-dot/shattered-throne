export interface GlossaryEntry {
  term: string;
  definition: string;
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    term: 'Weapon Triangle',
    definition:
      'Swords beat Axes, Axes beat Lances, Lances beat Swords. Advantage gives +15 hit and +1 damage.',
  },
  {
    term: 'Magic Triangle',
    definition:
      'Fire beats Wind, Wind beats Thunder, Thunder beats Fire. Same bonuses as weapon triangle.',
  },
  {
    term: 'Terrain Bonus',
    definition:
      'Standing on certain terrain grants defense and evasion bonuses. Forests give +1 Def and +20 Eva.',
  },
  {
    term: 'Movement Cost',
    definition: 'Each terrain type has a movement cost per unit type. Forest costs 2 for foot units, 3 for mounted.',
  },
  {
    term: 'Height Advantage',
    definition: 'Attacking from higher terrain gives +15% hit rate. Attacking upward gives -15% hit rate.',
  },
  {
    term: 'Zone of Control',
    definition: 'Moving through tiles adjacent to enemies costs 3 extra movement points.',
  },
  {
    term: 'Counter-attack',
    definition: 'If the defender has a weapon that can reach the attacker, they will counter-attack after being hit.',
  },
  {
    term: 'Double Attack',
    definition: "If a unit's Speed exceeds the target's by 5 or more, they attack twice in one combat.",
  },
  {
    term: 'Critical Hit',
    definition: 'A critical hit deals 3x normal damage. Crit rate = Skill/2 + Weapon Crit - Enemy Luck.',
  },
  {
    term: 'Support Bonus',
    definition: 'Adjacent allied units provide +10% hit and evasion per adjacent ally during combat.',
  },
  {
    term: 'Effective Damage',
    definition: 'Weapons effective against a unit type (e.g., Horseslayer vs Mounted) deal 3x weapon might.',
  },
  {
    term: 'Fog of War',
    definition: "In fog conditions, you can only see tiles within your units' vision range.",
  },
  {
    term: 'Deployment',
    definition: 'Before battle, place your units on the blue deployment zones. Maximum 8 units per battle.',
  },
  {
    term: 'Promotion',
    definition: 'At level 15, base class units can promote to an advanced class using a promotion item.',
  },
  {
    term: 'Growth Rates',
    definition: 'Each stat has a growth rate (%) — the chance that stat increases by 1 on level up.',
  },
  {
    term: 'Durability',
    definition: 'Weapons and items break after a set number of uses. Iron weapons last 45 uses, Silver last 20.',
  },
  {
    term: 'Convoy',
    definition: 'Shared item storage accessible between battles and by the Lord unit during battle.',
  },
  {
    term: 'Support Rank',
    definition: 'Fight alongside allies to build support points. At thresholds (20/40/60), unlock C/B/A conversations.',
  },
  {
    term: 'Forging',
    definition:
      'Improve weapons at the forge by spending gold to add Might (+5 max), Hit (+20 max), or Crit (+10 max) bonuses.',
  },
  {
    term: 'Arena',
    definition: 'Fight random opponents matched to your level to earn gold and experience between chapters.',
  },

  // Status Effects
  {
    term: 'Poison',
    definition: 'Poisoned units lose 10% of max HP at the start of each turn. Lasts until cured or expired.',
  },
  {
    term: 'Sleep',
    definition: 'Sleeping units skip their turn entirely. They wake up if attacked by an enemy.',
  },
  {
    term: 'Silence',
    definition: 'Silenced units cannot use magic tomes or staves until the effect wears off.',
  },
  {
    term: 'Berserk',
    definition: 'Berserked units attack the nearest unit (friend or foe) with +50% Strength. Cannot be controlled.',
  },
  {
    term: 'Charm',
    definition: 'Charmed units temporarily fight for the enemy team until the effect expires.',
  },
  {
    term: 'Frozen',
    definition: 'Frozen units cannot move but can still attack or use items if an enemy is in range.',
  },
  {
    term: 'Blind',
    definition: 'Blinded units have their hit rate reduced by 50%, making attacks much less accurate.',
  },
  {
    term: 'Stun',
    definition: 'Stunned units skip their turn entirely, similar to sleep but not removed by attacks.',
  },

  // Stats
  {
    term: 'HP',
    definition: "Hit Points — the unit's health. When HP reaches 0, the unit is defeated.",
  },
  {
    term: 'Strength',
    definition:
      'Determines physical attack damage. Higher Strength means more damage with swords, lances, axes, and bows.',
  },
  {
    term: 'Magic',
    definition: 'Determines magical attack damage and healing power. Used with tomes and staves.',
  },
  {
    term: 'Skill',
    definition: 'Affects hit rate and critical hit chance. Higher Skill means more accurate and deadly attacks.',
  },
  {
    term: 'Speed',
    definition: 'Determines evasion and double attack threshold. Units 5+ Speed faster attack twice.',
  },
  {
    term: 'Luck',
    definition: 'Reduces enemy critical hit chance and slightly improves hit rate. A defensive stat.',
  },
  {
    term: 'Defense',
    definition: 'Reduces physical damage taken. Each point of Defense blocks 1 point of physical damage.',
  },
  {
    term: 'Resistance',
    definition: 'Reduces magical damage taken. Each point of Resistance blocks 1 point of magical damage.',
  },
  {
    term: 'Movement',
    definition: 'How many tiles a unit can move per turn. Terrain costs are subtracted from this value.',
  },

  // Victory Conditions
  {
    term: 'Rout',
    definition: 'Victory condition: defeat all enemy units on the map to win.',
  },
  {
    term: 'Boss Kill',
    definition: 'Victory condition: defeat the boss enemy (marked with a crown) to win.',
  },
  {
    term: 'Survive',
    definition: 'Victory condition: survive for the specified number of turns to win.',
  },
  {
    term: 'Reach Location',
    definition: 'Victory condition: move any player unit to the marked destination tile.',
  },
  {
    term: 'Protect Target',
    definition: 'Victory condition: keep the specified allied unit alive until victory.',
  },

  // Classes
  {
    term: 'Warrior',
    definition: 'A balanced melee fighter using swords and axes. Promotes to Berserker or General.',
  },
  {
    term: 'Knight',
    definition: 'A mounted lancer with high mobility. Promotes to Paladin or Great Knight.',
  },
  {
    term: 'Archer',
    definition: 'A ranged attacker using bows. Cannot counter at melee range. Promotes to Sniper or Ranger.',
  },
  {
    term: 'Mage',
    definition:
      'A magical attacker using tomes. Targets Resistance instead of Defense. Promotes to Sage or Dark Knight.',
  },
  {
    term: 'Cleric',
    definition: 'A healer using staves. Cannot attack directly. Promotes to Bishop or Valkyrie.',
  },
  {
    term: 'Thief',
    definition: 'A fast, evasive unit with high Skill. Can pick locks. Promotes to Assassin or Trickster.',
  },
  {
    term: 'Berserker',
    definition: 'Promoted Warrior focused on raw power. +10 critical hit bonus. Axes specialist.',
  },
  {
    term: 'Paladin',
    definition: 'Promoted Knight with staff access. High mobility and defensive stats.',
  },
  {
    term: 'Assassin',
    definition: 'Promoted Thief with +15 critical hit bonus. Deadly and fast.',
  },
  {
    term: 'Sage',
    definition: 'Promoted Mage with staff access. Master of offensive and support magic.',
  },
  {
    term: 'General',
    definition: 'Heavily armored promoted class with exceptional Defense and strong front-line presence.',
  },
  {
    term: 'Dancer',
    definition: 'Support class that can refresh an ally, allowing that unit to act again in the same turn.',
  },
  {
    term: 'Sniper',
    definition: 'Promoted Archer with elite bow accuracy, range control, and high critical consistency.',
  },
  {
    term: 'Ranger',
    definition: 'Promoted Archer with improved mobility and flexible skirmishing capabilities.',
  },
  {
    term: 'Dark Knight',
    definition: 'Hybrid mounted caster combining mobility with dark magic pressure.',
  },
  {
    term: 'Bishop',
    definition: 'Promoted Cleric focused on high-value healing and holy magic support.',
  },
  {
    term: 'Valkyrie',
    definition: 'Mounted promoted healer with strong repositioning and support range.',
  },
  {
    term: 'Trickster',
    definition: 'Promoted Thief that blends utility, evasive play, and disruptive support tools.',
  },
  {
    term: 'Great Knight',
    definition: 'Promoted mounted tank with strong defenses, weapon coverage, and objective control.',
  },
];

export function getGlossaryEntry(term: string): string | null {
  const normalizedTerm = term.trim().toLowerCase();
  const entry = GLOSSARY.find((candidate) => candidate.term.toLowerCase() === normalizedTerm);
  return entry?.definition ?? null;
}

export function searchGlossary(query: string): { term: string; definition: string }[] {
  const normalizedQuery = query.toLowerCase();
  return GLOSSARY.filter(
    (entry) =>
      entry.term.toLowerCase().includes(normalizedQuery) || entry.definition.toLowerCase().includes(normalizedQuery),
  );
}

export function getAllGlossaryEntries(): { term: string; definition: string }[] {
  return [...GLOSSARY].sort((left, right) => left.term.localeCompare(right.term));
}
