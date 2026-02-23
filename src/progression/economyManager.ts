export interface EconomyState {
  gold: number;
}

export function addGold(state: EconomyState, amount: number): EconomyState {
  return { ...state, gold: state.gold + amount };
}

export function removeGold(state: EconomyState, amount: number): EconomyState {
  if (state.gold < amount) {
    throw new Error(`Insufficient gold: have ${state.gold}, need ${amount}`);
  }
  return { ...state, gold: state.gold - amount };
}

export function hasEnoughGold(state: EconomyState, amount: number): boolean {
  return state.gold >= amount;
}

export function createEconomyState(initialGold: number = 0): EconomyState {
  return { gold: initialGold };
}
