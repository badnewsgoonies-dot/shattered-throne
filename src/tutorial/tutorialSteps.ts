import { TutorialStep } from '../shared/types';

// Each tutorial is an array of steps. Steps link via nextStepId.
export const TUTORIAL_SEQUENCES: Record<string, TutorialStep[]> = {
  movement_tutorial: [
    {
      id: 'mov_1',
      title: 'Select a Unit',
      text: 'Click on one of your blue units to select them and view their movement options.',
      highlightUI: 'unitList',
      nextStepId: 'mov_2',
    },
    {
      id: 'mov_2',
      title: 'View Movement Range',
      text: 'The blue-highlighted tiles show where this unit can move. Terrain affects movement cost.',
      nextStepId: 'mov_3',
    },
    {
      id: 'mov_3',
      title: 'Choose Destination',
      text: 'Click on a blue tile to move your unit there. Different terrain has different movement costs.',
      nextStepId: 'mov_4',
    },
    {
      id: 'mov_4',
      title: 'Confirm or Cancel',
      text: 'After moving, an action menu appears. You can attack, use items, or wait.',
      nextStepId: 'mov_5',
    },
    {
      id: 'mov_5',
      title: 'Wait or Act',
      text: 'Select "Wait" to end this unit\'s turn without acting, or choose another action.',
      nextStepId: 'mov_6',
    },
    {
      id: 'mov_6',
      title: 'End Your Turn',
      text: 'When all your units have acted, select "End Turn" to let the enemy move.',
      nextStepId: null,
    },
  ],
  combat_tutorial: [
    {
      id: 'cmb_1',
      title: 'Move Near an Enemy',
      text: 'Move your unit adjacent to a red enemy unit. Red tiles show attack range.',
      nextStepId: 'cmb_2',
    },
    {
      id: 'cmb_2',
      title: 'Select Attack',
      text: 'Choose "Attack" from the action menu to initiate combat.',
      nextStepId: 'cmb_3',
    },
    {
      id: 'cmb_3',
      title: 'Read the Forecast',
      text: 'The battle forecast shows expected damage, hit chance, and critical chance for both sides.',
      nextStepId: 'cmb_4',
    },
    {
      id: 'cmb_4',
      title: 'Confirm Attack',
      text: 'Confirm your target to watch the combat play out. Units may counter-attack!',
      nextStepId: 'cmb_5',
    },
    {
      id: 'cmb_5',
      title: 'Experience Points',
      text: 'After combat, units earn EXP. At 100 EXP, they level up and gain stats!',
      nextStepId: null,
    },
  ],
  item_tutorial: [
    {
      id: 'itm_1',
      title: 'Open Inventory',
      text: 'Select "Item" from the action menu to view your unit\'s inventory.',
      nextStepId: 'itm_2',
    },
    {
      id: 'itm_2',
      title: 'Use a Vulnerary',
      text: 'Select a healing item like Vulnerary to restore HP. Items have limited uses.',
      nextStepId: 'itm_3',
    },
    {
      id: 'itm_3',
      title: 'Equip a Weapon',
      text: 'You can switch weapons by selecting one from your inventory. Different weapons have different stats.',
      nextStepId: 'itm_4',
    },
    {
      id: 'itm_4',
      title: 'Trade Items',
      text: 'When adjacent to an ally, select "Trade" to swap items between units.',
      nextStepId: null,
    },
  ],
  terrain_tutorial: [
    {
      id: 'ter_1',
      title: 'Terrain Matters',
      text: 'Different terrain provides defense and evasion bonuses. Forests give +1 Def and +20% Evasion.',
      nextStepId: 'ter_2',
    },
    {
      id: 'ter_2',
      title: 'Movement Costs',
      text: 'Terrain affects how far units can move. Mountains cost 4 movement for foot units but 1 for flyers.',
      nextStepId: 'ter_3',
    },
    {
      id: 'ter_3',
      title: 'Height Advantage',
      text: 'Attacking from higher ground gives +15% hit rate. Attacking uphill gives -15% hit rate.',
      nextStepId: null,
    },
  ],
  skills_tutorial: [
    {
      id: 'skl_1',
      title: 'Skills Menu',
      text: 'Select "Skill" from the action menu to use special abilities. Each class learns unique skills.',
      nextStepId: 'skl_2',
    },
    {
      id: 'skl_2',
      title: 'SP Costs',
      text: 'Skills cost SP (Skill Points) to use. SP regenerates 10% per turn. Manage your SP wisely!',
      nextStepId: 'skl_3',
    },
    {
      id: 'skl_3',
      title: 'Targeting',
      text: 'Some skills hit a single target, while others have area-of-effect patterns like circles, lines, or crosses.',
      nextStepId: null,
    },
  ],
  promotion_tutorial: [
    {
      id: 'prm_1',
      title: 'Promotion Eligible',
      text: 'At level 15, base class units can promote to an advanced class using a promotion item.',
      nextStepId: 'prm_2',
    },
    {
      id: 'prm_2',
      title: 'Choose Promotion Path',
      text: 'Each class has 2 promotion options with different stat bonuses and weapon access. Choose wisely!',
      nextStepId: null,
    },
  ],
};

export function getTutorialSteps(tutorialId: string): TutorialStep[] {
  const steps = TUTORIAL_SEQUENCES[tutorialId] ?? [];
  return steps.map((step) => ({ ...step }));
}
