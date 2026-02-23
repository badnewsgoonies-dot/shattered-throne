import {
  ChapterDefinition,
  DialogueLine,
  Position,
} from '../shared/types';

function positionsMatch(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

function triggerMatches(
  eventTrigger:
    | 'preBattle'
    | 'postBattle'
    | { type: 'turn'; turn: number }
    | { type: 'location'; position: Position }
    | { type: 'unitDefeated'; unitId: string },
  trigger:
    | 'preBattle'
    | 'postBattle'
    | { type: 'turn'; turn: number }
    | { type: 'location'; position: Position }
    | { type: 'unitDefeated'; unitId: string },
): boolean {
  if (typeof eventTrigger === 'string' || typeof trigger === 'string') {
    return eventTrigger === trigger;
  }

  if (eventTrigger.type !== trigger.type) {
    return false;
  }

  if (eventTrigger.type === 'turn' && trigger.type === 'turn') {
    return eventTrigger.turn === trigger.turn;
  }

  if (eventTrigger.type === 'location' && trigger.type === 'location') {
    return positionsMatch(eventTrigger.position, trigger.position);
  }

  if (eventTrigger.type === 'unitDefeated' && trigger.type === 'unitDefeated') {
    return eventTrigger.unitId === trigger.unitId;
  }

  return false;
}

export function getNarrativeEvents(
  chapter: ChapterDefinition,
  trigger:
    | 'preBattle'
    | 'postBattle'
    | { type: 'turn'; turn: number }
    | { type: 'location'; position: Position }
    | { type: 'unitDefeated'; unitId: string },
): DialogueLine[] {
  for (const event of chapter.narrative) {
    if (triggerMatches(event.trigger, trigger)) {
      return event.dialogue;
    }
  }

  return [];
}
