import { beforeEach, describe, expect, it } from 'vitest';
import { TutorialState } from '../../shared/types';
import { resetHintState } from '../hintSystem';
import { createTutorialSystem } from '../tutorialSystem';

function makeState(overrides: Partial<TutorialState> = {}): TutorialState {
  return {
    seenTutorials: [...(overrides.seenTutorials ?? [])],
    currentTutorialId: overrides.currentTutorialId ?? null,
    currentStepId: overrides.currentStepId ?? null,
    hintsEnabled: overrides.hintsEnabled ?? true,
    lastActionTimestamp: overrides.lastActionTimestamp ?? 0,
  };
}

describe('tutorialSystem', () => {
  beforeEach(() => {
    resetHintState();
  });

  it('initializes from provided tutorial state', () => {
    const system = createTutorialSystem();
    const initial = makeState({
      seenTutorials: ['movement_tutorial'],
      currentTutorialId: 'movement_tutorial',
      currentStepId: 'mov_2',
      hintsEnabled: false,
      lastActionTimestamp: 12345,
    });

    system.init(initial);

    expect(system.getState()).toEqual(initial);
  });

  it('clones seenTutorials during init', () => {
    const system = createTutorialSystem();
    const input = makeState({ seenTutorials: ['movement_tutorial'] });

    system.init(input);
    input.seenTutorials.push('combat_tutorial');

    expect(system.getState().seenTutorials).toEqual(['movement_tutorial']);
  });

  it('getState returns a copy of state', () => {
    const system = createTutorialSystem();
    system.init(makeState({ seenTutorials: ['movement_tutorial'] }));

    const state = system.getState();
    state.seenTutorials.push('combat_tutorial');

    expect(system.getState().seenTutorials).toEqual(['movement_tutorial']);
  });

  it('starts a known tutorial and returns first step', () => {
    const system = createTutorialSystem();

    const step = system.startTutorial('movement_tutorial');

    expect(step?.id).toBe('mov_1');
    expect(step?.title).toBe('Select a Unit');
  });

  it('sets current tutorial and current step on start', () => {
    const system = createTutorialSystem();

    system.startTutorial('movement_tutorial');

    expect(system.getState().currentTutorialId).toBe('movement_tutorial');
    expect(system.getState().currentStepId).toBe('mov_1');
  });

  it('returns null when starting unknown tutorial id', () => {
    const system = createTutorialSystem();

    const step = system.startTutorial('not_real');

    expect(step).toBeNull();
    expect(system.getState().currentTutorialId).toBeNull();
    expect(system.getState().currentStepId).toBeNull();
  });

  it('does not start already-seen tutorial when hints are disabled', () => {
    const system = createTutorialSystem();
    system.init(makeState({ seenTutorials: ['movement_tutorial'], hintsEnabled: false }));

    const step = system.startTutorial('movement_tutorial');

    expect(step).toBeNull();
    expect(system.getState().currentTutorialId).toBeNull();
  });

  it('allows re-starting seen tutorial when hints are enabled', () => {
    const system = createTutorialSystem();
    system.init(makeState({ seenTutorials: ['movement_tutorial'], hintsEnabled: true }));

    const step = system.startTutorial('movement_tutorial');

    expect(step?.id).toBe('mov_1');
  });

  it('advanceTutorial returns null when no tutorial is active', () => {
    const system = createTutorialSystem();

    expect(system.advanceTutorial()).toBeNull();
  });

  it('advanceTutorial advances to the next step', () => {
    const system = createTutorialSystem();
    system.startTutorial('movement_tutorial');

    const next = system.advanceTutorial();

    expect(next?.id).toBe('mov_2');
    expect(system.getState().currentStepId).toBe('mov_2');
  });

  it('advanceTutorial completes tutorial at terminal step', () => {
    const system = createTutorialSystem();
    system.startTutorial('promotion_tutorial');

    expect(system.advanceTutorial()?.id).toBe('prm_2');
    expect(system.advanceTutorial()).toBeNull();

    const state = system.getState();
    expect(state.currentTutorialId).toBeNull();
    expect(state.currentStepId).toBeNull();
    expect(state.seenTutorials).toContain('promotion_tutorial');
  });

  it('advanceTutorial with invalid current step completes and clears active state', () => {
    const system = createTutorialSystem();
    system.init(
      makeState({
        currentTutorialId: 'movement_tutorial',
        currentStepId: 'invalid_step',
      }),
    );

    expect(system.advanceTutorial()).toBeNull();
    expect(system.getState().currentTutorialId).toBeNull();
    expect(system.getState().currentStepId).toBeNull();
    expect(system.getState().seenTutorials).toContain('movement_tutorial');
  });

  it('completeTutorial adds unseen tutorial to seenTutorials', () => {
    const system = createTutorialSystem();

    system.completeTutorial('terrain_tutorial');

    expect(system.getState().seenTutorials).toContain('terrain_tutorial');
  });

  it('completeTutorial does not duplicate existing seen entries', () => {
    const system = createTutorialSystem();
    system.init(makeState({ seenTutorials: ['terrain_tutorial'] }));

    system.completeTutorial('terrain_tutorial');

    expect(system.getState().seenTutorials).toEqual(['terrain_tutorial']);
  });

  it('completeTutorial clears active state when completing current tutorial', () => {
    const system = createTutorialSystem();
    system.init(
      makeState({
        seenTutorials: ['terrain_tutorial'],
        currentTutorialId: 'terrain_tutorial',
        currentStepId: 'ter_2',
      }),
    );

    system.completeTutorial('terrain_tutorial');

    const state = system.getState();
    expect(state.currentTutorialId).toBeNull();
    expect(state.currentStepId).toBeNull();
  });

  it('markSeen adds tutorial id when missing', () => {
    const system = createTutorialSystem();

    system.markSeen('combat_tutorial');

    expect(system.getState().seenTutorials).toEqual(['combat_tutorial']);
  });

  it('markSeen does not duplicate tutorial ids', () => {
    const system = createTutorialSystem();
    system.init(makeState({ seenTutorials: ['combat_tutorial'] }));

    system.markSeen('combat_tutorial');

    expect(system.getState().seenTutorials).toEqual(['combat_tutorial']);
  });

  it('getHint returns contextual hint when eligible', () => {
    const system = createTutorialSystem();

    const hint = system.getHint('unitSelect', 10000);

    expect(hint).toBe('Select one of your units with blue highlight to begin their turn.');
  });

  it('getHint returns null when hints are disabled in state', () => {
    const system = createTutorialSystem();
    system.init(makeState({ hintsEnabled: false }));

    expect(system.getHint('unitSelect', 20000)).toBeNull();
  });

  it('getGlossaryEntry delegates to glossary lookup', () => {
    const system = createTutorialSystem();

    expect(system.getGlossaryEntry('Weapon Triangle')).toContain('Swords beat Axes');
  });

  it('searchGlossary delegates to glossary search', () => {
    const system = createTutorialSystem();

    const results = system.searchGlossary('triangle');

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((entry) => entry.term === 'Weapon Triangle')).toBe(true);
  });
});
