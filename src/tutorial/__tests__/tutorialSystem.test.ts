import { describe, it, expect, beforeEach } from 'vitest';
import { createTutorialSystem } from '../tutorialSystem';
import type { TutorialState, ITutorialSystem } from '../../shared/types';

function freshState(): TutorialState {
  return {
    seenTutorials: [],
    currentTutorialId: null,
    currentStepId: null,
    hintsEnabled: true,
    lastActionTimestamp: Date.now(),
  };
}

describe('TutorialSystem', () => {
  let system: ITutorialSystem;

  beforeEach(() => {
    system = createTutorialSystem();
  });

  describe('init', () => {
    it('should initialize with provided state', () => {
      const state = freshState();
      state.seenTutorials = ['movement_tutorial'];
      state.hintsEnabled = false;
      system.init(state);
      const s = system.getState();
      expect(s.seenTutorials).toContain('movement_tutorial');
      expect(s.hintsEnabled).toBe(false);
    });

    it('should preserve currentTutorialId and currentStepId', () => {
      const state = freshState();
      state.currentTutorialId = 'combat_tutorial';
      state.currentStepId = 'combat_2';
      system.init(state);
      const s = system.getState();
      expect(s.currentTutorialId).toBe('combat_tutorial');
      expect(s.currentStepId).toBe('combat_2');
    });
  });

  describe('startTutorial', () => {
    it('should return the first step of a known tutorial', () => {
      system.init(freshState());
      const step = system.startTutorial('movement_tutorial');
      expect(step).not.toBeNull();
      expect(step!.id).toBe('movement_1');
      expect(step!.title).toBe('Select a unit');
    });

    it('should return null for unknown tutorial', () => {
      system.init(freshState());
      const step = system.startTutorial('nonexistent');
      expect(step).toBeNull();
    });

    it('should return null for already-seen tutorial when hints disabled', () => {
      const state = freshState();
      state.seenTutorials = ['movement_tutorial'];
      state.hintsEnabled = false;
      system.init(state);
      expect(system.startTutorial('movement_tutorial')).toBeNull();
    });

    it('should allow replaying seen tutorial when hints enabled', () => {
      const state = freshState();
      state.seenTutorials = ['movement_tutorial'];
      state.hintsEnabled = true;
      system.init(state);
      const step = system.startTutorial('movement_tutorial');
      expect(step).not.toBeNull();
    });

    it('should update state with current tutorial and step', () => {
      system.init(freshState());
      system.startTutorial('combat_tutorial');
      const s = system.getState();
      expect(s.currentTutorialId).toBe('combat_tutorial');
      expect(s.currentStepId).toBe('combat_1');
    });
  });

  describe('advanceTutorial', () => {
    it('should return next step', () => {
      system.init(freshState());
      system.startTutorial('movement_tutorial');
      const step = system.advanceTutorial();
      expect(step).not.toBeNull();
      expect(step!.id).toBe('movement_2');
    });

    it('should return null when no tutorial active', () => {
      system.init(freshState());
      expect(system.advanceTutorial()).toBeNull();
    });

    it('should return null and complete when at last step', () => {
      system.init(freshState());
      system.startTutorial('promotion_tutorial'); // 2 steps
      system.advanceTutorial(); // step 2
      const result = system.advanceTutorial(); // past end
      expect(result).toBeNull();
      expect(system.getState().seenTutorials).toContain('promotion_tutorial');
    });

    it('should advance through all steps of a tutorial', () => {
      system.init(freshState());
      system.startTutorial('terrain_tutorial'); // 3 steps
      const s2 = system.advanceTutorial();
      expect(s2!.id).toBe('terrain_2');
      const s3 = system.advanceTutorial();
      expect(s3!.id).toBe('terrain_3');
      const end = system.advanceTutorial();
      expect(end).toBeNull();
    });
  });

  describe('completeTutorial', () => {
    it('should add tutorial to seenTutorials', () => {
      system.init(freshState());
      system.completeTutorial('movement_tutorial');
      expect(system.getState().seenTutorials).toContain('movement_tutorial');
    });

    it('should not duplicate in seenTutorials', () => {
      system.init(freshState());
      system.completeTutorial('movement_tutorial');
      system.completeTutorial('movement_tutorial');
      expect(system.getState().seenTutorials.filter((t) => t === 'movement_tutorial').length).toBe(1);
    });

    it('should clear current tutorial if completing active one', () => {
      system.init(freshState());
      system.startTutorial('combat_tutorial');
      system.completeTutorial('combat_tutorial');
      const s = system.getState();
      expect(s.currentTutorialId).toBeNull();
      expect(s.currentStepId).toBeNull();
    });
  });

  describe('markSeen', () => {
    it('should add tutorial to seenTutorials', () => {
      system.init(freshState());
      system.markSeen('item_tutorial');
      expect(system.getState().seenTutorials).toContain('item_tutorial');
    });

    it('should not duplicate', () => {
      system.init(freshState());
      system.markSeen('item_tutorial');
      system.markSeen('item_tutorial');
      expect(system.getState().seenTutorials.filter((t) => t === 'item_tutorial').length).toBe(1);
    });
  });

  describe('getState', () => {
    it('should return a copy of state', () => {
      system.init(freshState());
      const s1 = system.getState();
      const s2 = system.getState();
      expect(s1).toEqual(s2);
      expect(s1).not.toBe(s2);
    });
  });

  describe('getGlossaryEntry', () => {
    it('should return definition for known term', () => {
      system.init(freshState());
      const def = system.getGlossaryEntry('Weapon Triangle');
      expect(def).toContain('Swords beat Axes');
    });

    it('should be case-insensitive', () => {
      system.init(freshState());
      expect(system.getGlossaryEntry('weapon triangle')).not.toBeNull();
    });

    it('should return null for unknown term', () => {
      system.init(freshState());
      expect(system.getGlossaryEntry('nonexistent_term_xyz')).toBeNull();
    });
  });

  describe('searchGlossary', () => {
    it('should return matching entries', () => {
      system.init(freshState());
      const results = system.searchGlossary('weapon');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should search in definitions', () => {
      system.init(freshState());
      const results = system.searchGlossary('3x');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('getHint', () => {
    it('should return hint for valid context after idle threshold', () => {
      system.init(freshState());
      const hint = system.getHint('unitSelect', 15000);
      expect(hint).not.toBeNull();
      expect(hint).toContain('Select one of your units');
    });

    it('should return null when hints disabled', () => {
      const state = freshState();
      state.hintsEnabled = false;
      system.init(state);
      expect(system.getHint('unitSelect', 15000)).toBeNull();
    });

    it('should return null when not idle long enough', () => {
      system.init(freshState());
      expect(system.getHint('unitSelect', 5000)).toBeNull();
    });
  });
});
