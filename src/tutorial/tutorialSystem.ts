import { ITutorialSystem, TutorialState, TutorialStep } from '../shared/types';
import { getGlossaryEntry as getGlossaryEntryFn, searchGlossary as searchGlossaryFn } from './glossary';
import { getHint as getHintFn } from './hintSystem';
import { getTutorialSteps } from './tutorialSteps';

function cloneState(state: TutorialState): TutorialState {
  return {
    ...state,
    seenTutorials: [...state.seenTutorials],
  };
}

export function createTutorialSystem(): ITutorialSystem {
  let state: TutorialState = {
    seenTutorials: [],
    currentTutorialId: null,
    currentStepId: null,
    hintsEnabled: true,
    lastActionTimestamp: Date.now(),
  };

  const completeTutorialInternal = (tutorialId: string): void => {
    const seenTutorials = state.seenTutorials.includes(tutorialId)
      ? state.seenTutorials
      : [...state.seenTutorials, tutorialId];

    const shouldClearCurrent = state.currentTutorialId === tutorialId;

    state = {
      ...state,
      seenTutorials,
      currentTutorialId: shouldClearCurrent ? null : state.currentTutorialId,
      currentStepId: shouldClearCurrent ? null : state.currentStepId,
    };
  };

  return {
    init(initialState: TutorialState): void {
      state = cloneState(initialState);
    },

    startTutorial(tutorialId: string): TutorialStep | null {
      if (state.seenTutorials.includes(tutorialId) && !state.hintsEnabled) {
        return null;
      }

      const steps = getTutorialSteps(tutorialId);
      if (steps.length === 0) {
        return null;
      }

      state = {
        ...state,
        currentTutorialId: tutorialId,
        currentStepId: steps[0].id,
      };

      return steps[0];
    },

    advanceTutorial(): TutorialStep | null {
      if (!state.currentTutorialId || !state.currentStepId) {
        return null;
      }

      const steps = getTutorialSteps(state.currentTutorialId);
      const currentStep = steps.find((step) => step.id === state.currentStepId);

      if (!currentStep || !currentStep.nextStepId) {
        completeTutorialInternal(state.currentTutorialId);
        return null;
      }

      const nextStep = steps.find((step) => step.id === currentStep.nextStepId) ?? null;
      state = {
        ...state,
        currentStepId: currentStep.nextStepId,
      };

      return nextStep;
    },

    completeTutorial(tutorialId: string): void {
      completeTutorialInternal(tutorialId);
    },

    getHint(context: string, timeSinceLastAction: number): string | null {
      return getHintFn(context, timeSinceLastAction, state.hintsEnabled);
    },

    getGlossaryEntry(term: string): string | null {
      return getGlossaryEntryFn(term);
    },

    searchGlossary(query: string): { term: string; definition: string }[] {
      return searchGlossaryFn(query);
    },

    getState(): TutorialState {
      return cloneState(state);
    },

    markSeen(tutorialId: string): void {
      if (state.seenTutorials.includes(tutorialId)) {
        return;
      }

      state = {
        ...state,
        seenTutorials: [...state.seenTutorials, tutorialId],
      };
    },
  };
}
