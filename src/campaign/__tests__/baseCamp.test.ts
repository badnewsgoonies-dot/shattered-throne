import {
  describe,
  expect,
  it,
} from 'vitest';
import { MAX_DEPLOY_SIZE } from '../../shared/types';
import { selectDeployment } from '../baseCamp';
import { makeUnit } from './testUtils';

describe('baseCamp.selectDeployment', () => {
  it('returns only units whose ids were selected', () => {
    const roster = [
      makeUnit({ id: 'u1' }),
      makeUnit({ id: 'u2' }),
      makeUnit({ id: 'u3' }),
    ];

    const selected = selectDeployment(roster, ['u1', 'u3']);

    expect(selected.map((unit) => unit.id)).toEqual(['u1', 'u3']);
  });

  it('returns empty array when no ids are selected', () => {
    const roster = [makeUnit({ id: 'u1' })];

    expect(selectDeployment(roster, [])).toEqual([]);
  });

  it('ignores selected ids that are not in roster', () => {
    const roster = [makeUnit({ id: 'u1' }), makeUnit({ id: 'u2' })];

    const selected = selectDeployment(roster, ['missing', 'u2']);

    expect(selected.map((unit) => unit.id)).toEqual(['u2']);
  });

  it('returns all selected units when under MAX_DEPLOY_SIZE', () => {
    const roster = Array.from({ length: 5 }, (_, index) => makeUnit({ id: `u${index}` }));
    const ids = roster.map((unit) => unit.id);

    const selected = selectDeployment(roster, ids);

    expect(selected).toHaveLength(5);
  });

  it('enforces MAX_DEPLOY_SIZE by truncating selectedIds', () => {
    const roster = Array.from({ length: MAX_DEPLOY_SIZE + 3 }, (_, index) => makeUnit({ id: `u${index}` }));
    const selectedIds = roster.map((unit) => unit.id);

    const selected = selectDeployment(roster, selectedIds);

    expect(selected).toHaveLength(MAX_DEPLOY_SIZE);
    expect(selected.map((unit) => unit.id)).toEqual(selectedIds.slice(0, MAX_DEPLOY_SIZE));
  });

  it('still returns at most MAX_DEPLOY_SIZE with duplicate selected ids', () => {
    const roster = Array.from({ length: MAX_DEPLOY_SIZE + 1 }, (_, index) => makeUnit({ id: `u${index}` }));
    const selectedIds = [
      ...roster.slice(0, MAX_DEPLOY_SIZE).map((unit) => unit.id),
      roster[0].id,
      roster[MAX_DEPLOY_SIZE].id,
    ];

    const selected = selectDeployment(roster, selectedIds);

    expect(selected.length).toBeLessThanOrEqual(MAX_DEPLOY_SIZE);
  });

  it('follows roster ordering in returned deployment list', () => {
    const roster = [
      makeUnit({ id: 'u3' }),
      makeUnit({ id: 'u1' }),
      makeUnit({ id: 'u2' }),
    ];

    const selected = selectDeployment(roster, ['u1', 'u2', 'u3']);

    expect(selected.map((unit) => unit.id)).toEqual(['u3', 'u1', 'u2']);
  });

  it('handles empty roster safely', () => {
    expect(selectDeployment([], ['u1'])).toEqual([]);
  });

  it('does not mutate the input roster array', () => {
    const roster = [makeUnit({ id: 'u1' }), makeUnit({ id: 'u2' })];
    const snapshot = [...roster];

    selectDeployment(roster, ['u2']);

    expect(roster).toEqual(snapshot);
  });
});
