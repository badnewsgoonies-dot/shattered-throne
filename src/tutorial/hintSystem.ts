const HINTS: Record<string, string> = {
  unitSelect: 'Select one of your units with blue highlight to begin their turn.',
  moveSelect: 'Click a blue-highlighted tile to move your unit there.',
  actionSelect: 'Choose an action: Attack, Skill, Item, Wait, or Trade.',
  targetSelect: 'Select an enemy in range to attack. Red tiles show valid targets.',
  deploy: 'Place your units on the blue deployment zones, then press Start.',
  baseCamp: 'Manage your roster, buy items at the shop, or view support conversations.',
  worldMap: 'Select a chapter node on the map to begin a mission.',
};

const IDLE_THRESHOLD = 10000;
const REPEAT_COOLDOWN = 30000;

export interface HintState {
  hintsEnabled: boolean;
  lastHintContext: string | null;
  lastHintTimestamp: number;
}

export function createHintSystem() {
  let state: HintState = {
    hintsEnabled: true,
    lastHintContext: null,
    lastHintTimestamp: 0,
  };

  return {
    setEnabled(enabled: boolean) {
      state.hintsEnabled = enabled;
    },

    isEnabled(): boolean {
      return state.hintsEnabled;
    },

    getHint(context: string, timeSinceLastAction: number): string | null {
      if (!state.hintsEnabled) return null;
      if (timeSinceLastAction < IDLE_THRESHOLD) return null;

      const hint = HINTS[context];
      if (!hint) return null;

      const now = Date.now();
      if (state.lastHintContext === context && now - state.lastHintTimestamp < REPEAT_COOLDOWN) {
        return null;
      }

      state.lastHintContext = context;
      state.lastHintTimestamp = now;
      return hint;
    },

    resetCooldown() {
      state.lastHintContext = null;
      state.lastHintTimestamp = 0;
    },
  };
}
