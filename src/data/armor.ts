import { ArmorData, ItemCategory, ArmorSlot } from '../../src/shared/types';

export const armor: ArmorData[] = [
  // ===== HELMETS (Head) =====
  { id: 'iron-helm', name: 'Iron Helm', description: 'A basic iron helmet.', category: ItemCategory.Armor, slot: ArmorSlot.Head, defense: 2, resistance: 0, weight: 3, speedPenalty: 0, cost: 300 },
  { id: 'steel-helm', name: 'Steel Helm', description: 'A sturdy steel helmet.', category: ItemCategory.Armor, slot: ArmorSlot.Head, defense: 4, resistance: 0, weight: 5, speedPenalty: 1, cost: 600 },
  { id: 'silver-helm', name: 'Silver Helm', description: 'A finely crafted silver helmet.', category: ItemCategory.Armor, slot: ArmorSlot.Head, defense: 6, resistance: 1, weight: 4, speedPenalty: 0, cost: 1200 },
  { id: 'mage-hat', name: 'Mage Hat', description: 'A hat infused with magical energy.', category: ItemCategory.Armor, slot: ArmorSlot.Head, defense: 0, resistance: 4, weight: 1, speedPenalty: 0, cost: 800 },
  { id: 'holy-crown', name: 'Holy Crown', description: 'A blessed crown that wards off dark magic.', category: ItemCategory.Armor, slot: ArmorSlot.Head, defense: 1, resistance: 6, weight: 2, speedPenalty: 0, cost: 1500 },
  { id: 'great-helm', name: 'Great Helm', description: 'A massive full-face helmet.', category: ItemCategory.Armor, slot: ArmorSlot.Head, defense: 8, resistance: 0, weight: 8, speedPenalty: 2, cost: 1800 },
  { id: 'circlet', name: 'Circlet', description: 'An elegant circlet with protective enchantments.', category: ItemCategory.Armor, slot: ArmorSlot.Head, defense: 2, resistance: 3, weight: 1, speedPenalty: 0, cost: 900 },
  { id: 'dragon-helm', name: 'Dragon Helm', description: 'A helm forged from dragon scales.', category: ItemCategory.Armor, slot: ArmorSlot.Head, defense: 5, resistance: 3, weight: 4, speedPenalty: 0, setId: 'dragon-set', cost: 2000 },
  { id: 'thief-hood', name: 'Thief Hood', description: 'A dark hood favored by rogues.', category: ItemCategory.Armor, slot: ArmorSlot.Head, defense: 1, resistance: 1, weight: 1, speedPenalty: 0, cost: 400 },
  { id: 'war-crown', name: 'War Crown', description: 'A crown worn by battle commanders.', category: ItemCategory.Armor, slot: ArmorSlot.Head, defense: 3, resistance: 2, weight: 2, speedPenalty: 0, cost: 1000 },

  // ===== CHEST =====
  { id: 'iron-plate', name: 'Iron Plate', description: 'A basic iron chestplate.', category: ItemCategory.Armor, slot: ArmorSlot.Chest, defense: 3, resistance: 0, weight: 5, speedPenalty: 1, cost: 400 },
  { id: 'steel-plate', name: 'Steel Plate', description: 'A sturdy steel chestplate.', category: ItemCategory.Armor, slot: ArmorSlot.Chest, defense: 6, resistance: 0, weight: 8, speedPenalty: 2, cost: 800 },
  { id: 'silver-plate', name: 'Silver Plate', description: 'A finely crafted silver chestplate.', category: ItemCategory.Armor, slot: ArmorSlot.Chest, defense: 8, resistance: 2, weight: 6, speedPenalty: 1, cost: 1600 },
  { id: 'mage-robe', name: 'Mage Robe', description: 'A robe imbued with magical protection.', category: ItemCategory.Armor, slot: ArmorSlot.Chest, defense: 1, resistance: 6, weight: 2, speedPenalty: 0, cost: 1000 },
  { id: 'holy-robe', name: 'Holy Robe', description: 'Sacred vestments that shield against darkness.', category: ItemCategory.Armor, slot: ArmorSlot.Chest, defense: 2, resistance: 8, weight: 3, speedPenalty: 0, cost: 1800 },
  { id: 'heavy-plate', name: 'Heavy Plate', description: 'Extremely heavy full body armor.', category: ItemCategory.Armor, slot: ArmorSlot.Chest, defense: 10, resistance: 0, weight: 12, speedPenalty: 3, cost: 2200 },
  { id: 'leather-vest', name: 'Leather Vest', description: 'A lightweight leather vest.', category: ItemCategory.Armor, slot: ArmorSlot.Chest, defense: 2, resistance: 1, weight: 2, speedPenalty: 0, cost: 250 },
  { id: 'dragon-mail', name: 'Dragon Mail', description: 'Armor forged from dragon scales.', category: ItemCategory.Armor, slot: ArmorSlot.Chest, defense: 7, resistance: 4, weight: 6, speedPenalty: 1, setId: 'dragon-set', cost: 2500 },
  { id: 'brigandine', name: 'Brigandine', description: 'A coat with metal plates sewn inside.', category: ItemCategory.Armor, slot: ArmorSlot.Chest, defense: 4, resistance: 1, weight: 4, speedPenalty: 0, cost: 550 },
  { id: 'enchanted-cloak', name: 'Enchanted Cloak', description: 'A cloak with balanced magical and physical protection.', category: ItemCategory.Armor, slot: ArmorSlot.Chest, defense: 3, resistance: 3, weight: 2, speedPenalty: 0, cost: 900 },

  // ===== BOOTS =====
  { id: 'iron-boots', name: 'Iron Boots', description: 'Basic iron boots.', category: ItemCategory.Armor, slot: ArmorSlot.Boots, defense: 1, resistance: 0, weight: 2, speedPenalty: 0, cost: 200 },
  { id: 'steel-boots', name: 'Steel Boots', description: 'Sturdy steel boots.', category: ItemCategory.Armor, slot: ArmorSlot.Boots, defense: 3, resistance: 0, weight: 4, speedPenalty: 1, cost: 500 },
  { id: 'winged-boots', name: 'Winged Boots', description: 'Magical boots that increase movement by 1.', category: ItemCategory.Armor, slot: ArmorSlot.Boots, defense: 1, resistance: 1, weight: 1, speedPenalty: -1, cost: 2000 },
  { id: 'assassin-boots', name: "Assassin's Boots", description: 'Silent boots favored by assassins.', category: ItemCategory.Armor, slot: ArmorSlot.Boots, defense: 1, resistance: 0, weight: 1, speedPenalty: -1, cost: 1200 },
  { id: 'silver-greaves', name: 'Silver Greaves', description: 'Finely crafted silver greaves.', category: ItemCategory.Armor, slot: ArmorSlot.Boots, defense: 4, resistance: 1, weight: 3, speedPenalty: 0, cost: 1000 },
  { id: 'dragon-greaves', name: 'Dragon Greaves', description: 'Greaves forged from dragon scales.', category: ItemCategory.Armor, slot: ArmorSlot.Boots, defense: 3, resistance: 2, weight: 3, speedPenalty: 0, setId: 'dragon-set', cost: 1800 },
  { id: 'leather-boots', name: 'Leather Boots', description: 'Simple leather boots.', category: ItemCategory.Armor, slot: ArmorSlot.Boots, defense: 1, resistance: 0, weight: 1, speedPenalty: 0, cost: 150 },
  { id: 'spiked-boots', name: 'Spiked Boots', description: 'Boots with spikes for better traction on rough terrain.', category: ItemCategory.Armor, slot: ArmorSlot.Boots, defense: 2, resistance: 0, weight: 3, speedPenalty: 0, cost: 600 },
  { id: 'mage-sandals', name: 'Mage Sandals', description: 'Lightweight sandals imbued with arcane energy.', category: ItemCategory.Armor, slot: ArmorSlot.Boots, defense: 0, resistance: 3, weight: 0, speedPenalty: 0, cost: 700 },
  { id: 'war-boots', name: 'War Boots', description: 'Heavy boots designed for the battlefield.', category: ItemCategory.Armor, slot: ArmorSlot.Boots, defense: 3, resistance: 0, weight: 4, speedPenalty: 1, cost: 650 },

  // ===== ACCESSORIES =====
  { id: 'shield-ring', name: 'Shield Ring', description: 'A ring that bolsters physical defense. +2 Def.', category: ItemCategory.Armor, slot: ArmorSlot.Accessory, defense: 2, resistance: 0, weight: 0, speedPenalty: 0, cost: 1500 },
  { id: 'speed-ring', name: 'Speed Ring', description: 'A ring that enhances agility. +2 Spd.', category: ItemCategory.Armor, slot: ArmorSlot.Accessory, defense: 0, resistance: 0, weight: 0, speedPenalty: -2, cost: 1500 },
  { id: 'skill-ring', name: 'Skill Ring', description: 'A ring that sharpens focus. +2 Skl.', category: ItemCategory.Armor, slot: ArmorSlot.Accessory, defense: 0, resistance: 0, weight: 0, speedPenalty: 0, cost: 1500 },
  { id: 'magic-ring', name: 'Magic Ring', description: 'A ring that amplifies magic. +2 Mag.', category: ItemCategory.Armor, slot: ArmorSlot.Accessory, defense: 0, resistance: 2, weight: 0, speedPenalty: 0, cost: 1500 },
  { id: 'strength-ring', name: 'Strength Ring', description: 'A ring that boosts raw power. +2 Str.', category: ItemCategory.Armor, slot: ArmorSlot.Accessory, defense: 0, resistance: 0, weight: 0, speedPenalty: 0, cost: 1500 },
  { id: 'luck-ring', name: 'Luck Ring', description: 'A ring blessed with fortune.', category: ItemCategory.Armor, slot: ArmorSlot.Accessory, defense: 0, resistance: 0, weight: 0, speedPenalty: 0, cost: 1000 },
  { id: 'guard-ring', name: 'Guard Ring', description: 'A ring with balanced defenses. +1 Def, +1 Res.', category: ItemCategory.Armor, slot: ArmorSlot.Accessory, defense: 1, resistance: 1, weight: 0, speedPenalty: 0, cost: 1200 },
  { id: 'knight-ward', name: 'Knight Ward', description: 'A protective talisman for knights.', category: ItemCategory.Armor, slot: ArmorSlot.Accessory, defense: 3, resistance: 0, weight: 0, speedPenalty: 0, setId: 'knight-set', cost: 1600 },
  { id: 'sage-pendant', name: 'Sage Pendant', description: 'A pendant favored by scholars and mages.', category: ItemCategory.Armor, slot: ArmorSlot.Accessory, defense: 0, resistance: 3, weight: 0, speedPenalty: 0, setId: 'sage-set', cost: 1600 },
  { id: 'royal-amulet', name: 'Royal Amulet', description: 'An amulet of ancient royalty. +2 Def, +2 Res.', category: ItemCategory.Armor, slot: ArmorSlot.Accessory, defense: 2, resistance: 2, weight: 0, speedPenalty: 0, cost: 3000 },
];
