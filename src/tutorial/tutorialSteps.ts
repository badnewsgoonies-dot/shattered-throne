import type { TutorialStep } from '../shared/types';

function chain(steps: Omit<TutorialStep, 'nextStepId'>[]): TutorialStep[] {
  return steps.map((s, i) => ({
    ...s,
    nextStepId: i < steps.length - 1 ? steps[i + 1].id : null,
  }));
}

const movementTutorial = chain([
  { id: 'movement_1', title: 'Select a unit', text: 'Click on one of your units (blue-highlighted) to select them.', highlightUI: 'playerUnit', requiredAction: 'selectUnit' },
  { id: 'movement_2', title: 'View movement range', text: 'Blue tiles show where this unit can move. The range depends on their Movement stat and the terrain.', highlightUI: 'movementRange' },
  { id: 'movement_3', title: 'Choose destination', text: 'Click a blue-highlighted tile to move your unit there.', requiredAction: 'selectTile' },
  { id: 'movement_4', title: 'Confirm or cancel', text: 'An action menu will appear. You can confirm your move or press cancel to choose a different tile.', highlightUI: 'actionMenu' },
  { id: 'movement_5', title: 'Wait or act', text: 'Choose Wait to end this unit\'s turn, or select Attack, Skill, or Item to perform an action first.', highlightUI: 'actionMenu' },
  { id: 'movement_6', title: 'End your turn', text: 'Once all your units have acted, select End Turn to let the enemy take their turn.', highlightUI: 'endTurnButton', requiredAction: 'endTurn' },
]);

const combatTutorial = chain([
  { id: 'combat_1', title: 'Move near an enemy', text: 'Red tiles show enemy attack ranges. Move your unit adjacent to an enemy to initiate combat.', highlightUI: 'attackRange' },
  { id: 'combat_2', title: 'Select Attack', text: 'Choose Attack from the action menu to begin combat with an enemy in range.', highlightUI: 'actionMenu', requiredAction: 'selectAttack' },
  { id: 'combat_3', title: 'Read the forecast', text: 'The battle forecast shows damage, hit chance, and crit chance for both attacker and defender. Use it to make smart decisions.', highlightUI: 'battleForecast' },
  { id: 'combat_4', title: 'Confirm attack', text: 'Confirm to watch the combat play out. Each side attacks based on speed and range.', requiredAction: 'confirmAttack' },
  { id: 'combat_5', title: 'Experience points', text: 'After combat, your unit earns EXP. Accumulate 100 EXP to level up and gain stat increases.', highlightUI: 'expBar' },
]);

const itemTutorial = chain([
  { id: 'item_1', title: 'Open inventory', text: 'Select a unit, then choose Item from the action menu to view their inventory.', highlightUI: 'actionMenu', requiredAction: 'selectItem' },
  { id: 'item_2', title: 'Use a vulnerary', text: 'Consumable items like Vulneraries restore HP. Select one and choose Use to heal your unit.', highlightUI: 'inventory' },
  { id: 'item_3', title: 'Equip a weapon', text: 'Units can carry multiple weapons. Select a weapon and choose Equip to switch to it.', highlightUI: 'inventory' },
  { id: 'item_4', title: 'Trade items', text: 'Move adjacent to an ally and choose Trade to exchange items between units.', highlightUI: 'actionMenu', requiredAction: 'selectTrade' },
]);

const terrainTutorial = chain([
  { id: 'terrain_1', title: 'Terrain matters', text: 'Different terrain types provide defense and evasion bonuses. Position your units on forests and fortresses for extra protection.', highlightUI: 'terrainInfo' },
  { id: 'terrain_2', title: 'Movement costs', text: 'Terrain affects how far units can move. Forests cost 2 movement, mountains cost 4. Flying units ignore terrain costs.', highlightUI: 'terrainInfo' },
  { id: 'terrain_3', title: 'Height advantage', text: 'Attacking from higher terrain gives +15% hit rate. Attacking from lower ground gives -15% hit rate.', highlightUI: 'terrainInfo' },
]);

const skillsTutorial = chain([
  { id: 'skills_1', title: 'Skills menu', text: 'Select a unit and choose Skill from the action menu to see available active skills.', highlightUI: 'actionMenu', requiredAction: 'selectSkill' },
  { id: 'skills_2', title: 'SP costs', text: 'Active skills consume SP (Skill Points). SP regenerates by 10% each turn. Manage it carefully.', highlightUI: 'spBar' },
  { id: 'skills_3', title: 'Targeting', text: 'Skills can target single units, lines, circles, cones, or crosses. Check the AoE pattern before confirming.', highlightUI: 'skillTarget' },
]);

const promotionTutorial = chain([
  { id: 'promotion_1', title: 'Promotion eligible', text: 'When a unit reaches level 15, they can promote to an advanced class using a promotion item.', highlightUI: 'unitInfo' },
  { id: 'promotion_2', title: 'Choose promotion path', text: 'Some classes have multiple promotion options. Each path grants different stat bonuses, weapons, and skills.', highlightUI: 'promotionMenu' },
]);

export const TUTORIAL_SEQUENCES: Record<string, TutorialStep[]> = {
  movement_tutorial: movementTutorial,
  combat_tutorial: combatTutorial,
  item_tutorial: itemTutorial,
  terrain_tutorial: terrainTutorial,
  skills_tutorial: skillsTutorial,
  promotion_tutorial: promotionTutorial,
};

export function getTutorialSteps(tutorialId: string): TutorialStep[] {
  return TUTORIAL_SEQUENCES[tutorialId] ?? [];
}
