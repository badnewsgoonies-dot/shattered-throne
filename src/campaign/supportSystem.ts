import {
  CampaignState,
  SupportRank,
} from '../shared/types';

function getSupportKey(charA: string, charB: string): string {
  return [charA, charB].sort().join('-');
}

export function updateSupportPoints(
  state: CampaignState,
  charA: string,
  charB: string,
  points: number,
): CampaignState {
  const roster = state.roster.map((unit) => {
    if (unit.characterId !== charA && unit.characterId !== charB) {
      return unit;
    }

    const targetCharacterId = unit.characterId === charA ? charB : charA;
    const nextSupportPoints = {
      ...unit.supportPoints,
      [targetCharacterId]: (unit.supportPoints[targetCharacterId] ?? 0) + points,
    };

    return {
      ...unit,
      supportPoints: nextSupportPoints,
    };
  });

  return {
    ...state,
    roster,
  };
}

export function updateSupportRank(
  state: CampaignState,
  charA: string,
  charB: string,
  rank: SupportRank,
): CampaignState {
  const key = getSupportKey(charA, charB);
  const supportLog = {
    ...state.supportLog,
    [key]: rank,
  };

  const roster = state.roster.map((unit) => {
    if (unit.characterId !== charA && unit.characterId !== charB) {
      return unit;
    }

    const targetCharacterId = unit.characterId === charA ? charB : charA;

    return {
      ...unit,
      supportRanks: {
        ...unit.supportRanks,
        [targetCharacterId]: rank,
      },
    };
  });

  return {
    ...state,
    supportLog,
    roster,
  };
}
