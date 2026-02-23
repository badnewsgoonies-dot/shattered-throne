import {
  describe,
  expect,
  it,
} from 'vitest';
import {
  NarrativeEvent,
  Position,
} from '../../shared/types';
import { getNarrativeEvents } from '../narrativeEngine';
import {
  makeChapterDefinition,
  pos,
} from './testUtils';

function dialogueTextFor(eventName: string): string {
  return `dialogue:${eventName}`;
}

function makeNarrativeEvent(trigger: NarrativeEvent['trigger'], label: string): NarrativeEvent {
  return {
    trigger,
    dialogue: [{ speaker: 'Narrator', text: dialogueTextFor(label) }],
  };
}

describe('narrativeEngine.getNarrativeEvents', () => {
  const turnPosition: Position = pos(3, 7);

  const chapter = makeChapterDefinition({
    narrative: [
      makeNarrativeEvent('preBattle', 'pre'),
      makeNarrativeEvent({ type: 'turn', turn: 2 }, 'turn2'),
      makeNarrativeEvent({ type: 'location', position: turnPosition }, 'location'),
      makeNarrativeEvent({ type: 'unitDefeated', unitId: 'boss_1' }, 'defeat'),
      makeNarrativeEvent('postBattle', 'post'),
    ],
  });

  it('returns dialogue for preBattle trigger', () => {
    expect(getNarrativeEvents(chapter, 'preBattle')[0].text).toBe(dialogueTextFor('pre'));
  });

  it('returns dialogue for postBattle trigger', () => {
    expect(getNarrativeEvents(chapter, 'postBattle')[0].text).toBe(dialogueTextFor('post'));
  });

  it('returns dialogue for matching turn trigger', () => {
    expect(getNarrativeEvents(chapter, { type: 'turn', turn: 2 })[0].text).toBe(dialogueTextFor('turn2'));
  });

  it('returns empty array for non-matching turn trigger', () => {
    expect(getNarrativeEvents(chapter, { type: 'turn', turn: 3 })).toEqual([]);
  });

  it('returns dialogue for matching location trigger', () => {
    expect(getNarrativeEvents(chapter, { type: 'location', position: pos(3, 7) })[0].text).toBe(dialogueTextFor('location'));
  });

  it('returns empty array for non-matching location trigger', () => {
    expect(getNarrativeEvents(chapter, { type: 'location', position: pos(7, 3) })).toEqual([]);
  });

  it('returns dialogue for matching unitDefeated trigger', () => {
    expect(getNarrativeEvents(chapter, { type: 'unitDefeated', unitId: 'boss_1' })[0].text).toBe(dialogueTextFor('defeat'));
  });

  it('returns empty array for non-matching unitDefeated trigger', () => {
    expect(getNarrativeEvents(chapter, { type: 'unitDefeated', unitId: 'boss_2' })).toEqual([]);
  });

  it('returns first matching event dialogue when duplicates exist', () => {
    const duplicateChapter = makeChapterDefinition({
      narrative: [
        makeNarrativeEvent('preBattle', 'first'),
        makeNarrativeEvent('preBattle', 'second'),
      ],
    });

    expect(getNarrativeEvents(duplicateChapter, 'preBattle')[0].text).toBe(dialogueTextFor('first'));
  });

  it('returns empty array when chapter has no narrative events', () => {
    const noNarrative = makeChapterDefinition({ narrative: [] });

    expect(getNarrativeEvents(noNarrative, 'preBattle')).toEqual([]);
  });
});
