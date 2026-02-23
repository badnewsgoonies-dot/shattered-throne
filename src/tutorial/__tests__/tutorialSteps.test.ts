import { describe, it, expect } from 'vitest';
import { TUTORIAL_SEQUENCES, getTutorialSteps } from '../tutorialSteps';

describe('TutorialSteps', () => {
  const expectedTutorials = [
    { id: 'movement_tutorial', stepCount: 6 },
    { id: 'combat_tutorial', stepCount: 5 },
    { id: 'item_tutorial', stepCount: 4 },
    { id: 'terrain_tutorial', stepCount: 3 },
    { id: 'skills_tutorial', stepCount: 3 },
    { id: 'promotion_tutorial', stepCount: 2 },
  ];

  it('should have all 6 required tutorial sequences', () => {
    for (const t of expectedTutorials) {
      expect(TUTORIAL_SEQUENCES).toHaveProperty(t.id);
    }
  });

  for (const t of expectedTutorials) {
    describe(t.id, () => {
      it(`should have ${t.stepCount} steps`, () => {
        expect(getTutorialSteps(t.id).length).toBe(t.stepCount);
      });

      it('should have properly linked nextStepId chain', () => {
        const steps = getTutorialSteps(t.id);
        for (let i = 0; i < steps.length - 1; i++) {
          expect(steps[i].nextStepId).toBe(steps[i + 1].id);
        }
        expect(steps[steps.length - 1].nextStepId).toBeNull();
      });

      it('should have unique step IDs', () => {
        const steps = getTutorialSteps(t.id);
        const ids = steps.map((s) => s.id);
        expect(new Set(ids).size).toBe(ids.length);
      });

      it('each step should have a title and text', () => {
        const steps = getTutorialSteps(t.id);
        for (const step of steps) {
          expect(step.title).toBeTruthy();
          expect(step.text).toBeTruthy();
        }
      });

      it('no broken nextStepId references', () => {
        const steps = getTutorialSteps(t.id);
        const ids = new Set(steps.map((s) => s.id));
        for (const step of steps) {
          if (step.nextStepId !== null) {
            expect(ids.has(step.nextStepId)).toBe(true);
          }
        }
      });
    });
  }

  it('getTutorialSteps should return empty for unknown tutorial', () => {
    expect(getTutorialSteps('nonexistent')).toEqual([]);
  });
});
