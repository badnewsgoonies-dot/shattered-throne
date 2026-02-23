import { describe, expect, it } from 'vitest';
import { TUTORIAL_SEQUENCES, getTutorialSteps } from '../tutorialSteps';

describe('tutorialSteps', () => {
  it('defines all 6 required tutorial sequences', () => {
    expect(Object.keys(TUTORIAL_SEQUENCES)).toHaveLength(6);
    expect(TUTORIAL_SEQUENCES.movement_tutorial).toBeDefined();
    expect(TUTORIAL_SEQUENCES.combat_tutorial).toBeDefined();
    expect(TUTORIAL_SEQUENCES.item_tutorial).toBeDefined();
    expect(TUTORIAL_SEQUENCES.terrain_tutorial).toBeDefined();
    expect(TUTORIAL_SEQUENCES.skills_tutorial).toBeDefined();
    expect(TUTORIAL_SEQUENCES.promotion_tutorial).toBeDefined();
  });

  it('has correct movement tutorial step count', () => {
    expect(TUTORIAL_SEQUENCES.movement_tutorial).toHaveLength(6);
  });

  it('has correct combat tutorial step count', () => {
    expect(TUTORIAL_SEQUENCES.combat_tutorial).toHaveLength(5);
  });

  it('has correct item tutorial step count', () => {
    expect(TUTORIAL_SEQUENCES.item_tutorial).toHaveLength(4);
  });

  it('has correct terrain tutorial step count', () => {
    expect(TUTORIAL_SEQUENCES.terrain_tutorial).toHaveLength(3);
  });

  it('has correct skills tutorial step count', () => {
    expect(TUTORIAL_SEQUENCES.skills_tutorial).toHaveLength(3);
  });

  it('has correct promotion tutorial step count', () => {
    expect(TUTORIAL_SEQUENCES.promotion_tutorial).toHaveLength(2);
  });

  it('ensures all step ids are unique within each tutorial', () => {
    for (const steps of Object.values(TUTORIAL_SEQUENCES)) {
      const ids = steps.map((step) => step.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('ensures each non-terminal nextStepId points to a valid step', () => {
    for (const steps of Object.values(TUTORIAL_SEQUENCES)) {
      const idSet = new Set(steps.map((step) => step.id));
      for (const step of steps) {
        if (step.nextStepId !== null) {
          expect(idSet.has(step.nextStepId)).toBe(true);
        }
      }
    }
  });

  it('ensures each sequence ends with a single terminal step', () => {
    for (const steps of Object.values(TUTORIAL_SEQUENCES)) {
      const terminalSteps = steps.filter((step) => step.nextStepId === null);
      expect(terminalSteps).toHaveLength(1);
    }
  });

  it('ensures there are no self-referential nextStepId links', () => {
    for (const steps of Object.values(TUTORIAL_SEQUENCES)) {
      for (const step of steps) {
        expect(step.nextStepId).not.toBe(step.id);
      }
    }
  });

  it('ensures linear chain traversal reaches all steps exactly once', () => {
    for (const steps of Object.values(TUTORIAL_SEQUENCES)) {
      const byId = new Map(steps.map((step) => [step.id, step]));
      const visited = new Set<string>();
      let current = steps[0];

      while (current) {
        expect(visited.has(current.id)).toBe(false);
        visited.add(current.id);
        current = current.nextStepId ? (byId.get(current.nextStepId) ?? null) : null;
      }

      expect(visited.size).toBe(steps.length);
    }
  });

  it('returns empty array for unknown tutorial id', () => {
    expect(getTutorialSteps('unknown_tutorial')).toEqual([]);
  });

  it('returns a cloned array so caller mutation does not affect source', () => {
    const steps = getTutorialSteps('movement_tutorial');
    steps.pop();

    expect(getTutorialSteps('movement_tutorial')).toHaveLength(6);
  });

  it('returns cloned step objects so caller mutation does not affect source step data', () => {
    const steps = getTutorialSteps('movement_tutorial');
    steps[0].title = 'Changed';

    expect(getTutorialSteps('movement_tutorial')[0].title).toBe('Select a Unit');
  });

  it('includes expected highlightUI on movement step 1', () => {
    expect(TUTORIAL_SEQUENCES.movement_tutorial[0].highlightUI).toBe('unitList');
  });
});
