const CONTEXT_HINTS: Record<string, string> = {
  unitSelect: 'Select one of your units with blue highlight to begin their turn.',
  moveSelect: 'Click a blue-highlighted tile to move your unit there.',
  actionSelect: 'Choose an action: Attack, Skill, Item, Wait, or Trade.',
  targetSelect: 'Select an enemy in range to attack. Red tiles show valid targets.',
  deploy: 'Place your units on the blue deployment zones, then press Start.',
  baseCamp: 'Manage your roster, buy items at the shop, or view support conversations.',
  worldMap: 'Select a chapter node on the map to begin a mission.',
};

let lastHintTime = 0;
let lastHintContext = '';

export function getHint(context: string, timeSinceLastAction: number, hintsEnabled: boolean): string | null {
  if (!hintsEnabled) {
    return null;
  }

  if (timeSinceLastAction < 10000) {
    return null;
  }

  const hint = CONTEXT_HINTS[context];
  if (!hint) {
    return null;
  }

  const now = Date.now();
  if (context === lastHintContext && now - lastHintTime < 30000) {
    return null;
  }

  lastHintTime = now;
  lastHintContext = context;
  return hint;
}

export function resetHintState(): void {
  lastHintTime = 0;
  lastHintContext = '';
}
