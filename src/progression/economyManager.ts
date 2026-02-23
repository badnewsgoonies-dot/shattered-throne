export function addGold(currentGold: number, amount: number): number {
  return currentGold + amount;
}

export function removeGold(currentGold: number, amount: number): { gold: number; success: boolean } {
  if (currentGold < amount) {
    return { gold: currentGold, success: false };
  }

  return { gold: currentGold - amount, success: true };
}
