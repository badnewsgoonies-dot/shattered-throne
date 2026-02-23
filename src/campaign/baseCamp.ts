import {
  MAX_DEPLOY_SIZE,
  Unit,
} from '../shared/types';

export function selectDeployment(roster: Unit[], selectedIds: string[]): Unit[] {
  const limitedSelection = selectedIds.slice(0, MAX_DEPLOY_SIZE);

  return roster.filter((unit) => limitedSelection.includes(unit.id));
}
