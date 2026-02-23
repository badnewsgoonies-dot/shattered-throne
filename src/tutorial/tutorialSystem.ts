import type { TutorialStep, TutorialState, ITutorialSystem } from '../shared/types';
import { getTutorialSteps } from './tutorialSteps';
import { createHintSystem } from './hintSystem';
import { getGlossaryEntry, searchGlossary } from './glossary';

export function createTutorialSystem(): ITutorialSystem {
  let state: TutorialState = {
    seenTutorials: [],
    currentTutorialId: null,
    currentStepId: null,
    hintsEnabled: true,
    lastActionTimestamp: Date.now(),
  };

  const hintSystem = createHintSystem();

  function findStep(tutorialId: string, stepId: string): TutorialStep | null {
    const steps = getTutorialSteps(tutorialId);
    return steps.find((s) => s.id === stepId) ?? null;
  }

  return {
    init(initialState: TutorialState): void {
      state = { ...initialState };
      hintSystem.setEnabled(state.hintsEnabled);
    },

    startTutorial(tutorialId: string): TutorialStep | null {
      if (state.seenTutorials.includes(tutorialId) && !state.hintsEnabled) {
        return null;
      }
      const steps = getTutorialSteps(tutorialId);
      if (steps.length === 0) return null;

      state.currentTutorialId = tutorialId;
      state.currentStepId = steps[0].id;
      return steps[0];
    },

    advanceTutorial(): TutorialStep | null {
      if (!state.currentTutorialId || !state.currentStepId) return null;

      const current = findStep(state.currentTutorialId, state.currentStepId);
      if (!current || !current.nextStepId) {
        // Tutorial complete
        if (state.currentTutorialId) {
          this.completeTutorial(state.currentTutorialId);
        }
        state.currentTutorialId = null;
        state.currentStepId = null;
        return null;
      }

      const next = findStep(state.currentTutorialId, current.nextStepId);
      if (next) {
        state.currentStepId = next.id;
      }
      return next;
    },

    completeTutorial(tutorialId: string): void {
      if (!state.seenTutorials.includes(tutorialId)) {
        state.seenTutorials.push(tutorialId);
      }
      if (state.currentTutorialId === tutorialId) {
        state.currentTutorialId = null;
        state.currentStepId = null;
      }
    },

    getHint(context: string, timeSinceLastAction: number): string | null {
      hintSystem.setEnabled(state.hintsEnabled);
      return hintSystem.getHint(context, timeSinceLastAction);
    },

    getGlossaryEntry(term: string): string | null {
      return getGlossaryEntry(term);
    },

    searchGlossary(query: string): { term: string; definition: string }[] {
      return searchGlossary(query);
    },

    getState(): TutorialState {
      return { ...state };
    },

    markSeen(tutorialId: string): void {
      if (!state.seenTutorials.includes(tutorialId)) {
        state.seenTutorials.push(tutorialId);
      }
    },
  };
}
