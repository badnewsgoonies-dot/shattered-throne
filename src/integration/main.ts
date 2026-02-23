// ============================================================
// Shattered Throne — Integration Entry Point
// Wires all domain systems together and boots the game.
// ============================================================

import type {
  IAudioSystem,
  ICombatEngine,
  IDataProvider,
  IItemSystem,
  IProgressionSystem,
  ITutorialSystem,
  CampaignState,
  TutorialState,
  UIScreen,
} from '../shared/types';

import { createAudioSystem } from '../audio';
import { createCombatEngine } from '../combat';
import { createDataProvider } from '../data';
import { createItemSystem } from '../items';
import { createProgressionSystem } from '../progression';
import { createTutorialSystem } from '../tutorial';

// ============================================================
// Game container — holds all domain systems
// ============================================================

export interface GameSystems {
  data: IDataProvider;
  audio: IAudioSystem;
  combat: ICombatEngine;
  items: IItemSystem;
  progression: IProgressionSystem;
  tutorial: ITutorialSystem;
}

export interface GameState {
  campaign: CampaignState | null;
  currentScreen: UIScreen;
  initialized: boolean;
}

// ============================================================
// Bootstrap
// ============================================================

export function createGameSystems(): GameSystems {
  const data = createDataProvider();
  const audio = createAudioSystem();
  const combat = createCombatEngine();
  const items = createItemSystem(data);
  const progression = createProgressionSystem(data);
  const tutorial = createTutorialSystem();

  return { data, audio, combat, items, progression, tutorial };
}

export function createInitialGameState(): GameState {
  return {
    campaign: null,
    currentScreen: 'title' as UIScreen,
    initialized: false,
  };
}

export async function initGame(systems: GameSystems): Promise<GameState> {
  // Validate static data
  const validation = systems.data.validateAllData();
  if (!validation.valid) {
    console.warn('Data validation warnings:', validation.errors);
  }

  // Initialize audio (requires user gesture in browsers — wrapped in try/catch)
  try {
    await systems.audio.init();
  } catch {
    console.warn('Audio init deferred — requires user interaction');
  }

  // Initialize tutorial system with default state
  const tutorialState: TutorialState = {
    seenTutorials: [],
    currentTutorialId: null,
    currentStepId: null,
    hintsEnabled: true,
    lastActionTimestamp: Date.now(),
  };
  systems.tutorial.init(tutorialState);

  return {
    campaign: null,
    currentScreen: 'title' as UIScreen,
    initialized: true,
  };
}

// ============================================================
// Main — runs when loaded in browser
// ============================================================

export async function main(): Promise<void> {
  const systems = createGameSystems();
  const state = await initGame(systems);

  // Log domain system availability
  console.log('Shattered Throne — Systems initialized');
  console.log(`  Data: ${systems.data.getAllClasses().length} classes, ${systems.data.getAllWeapons().length} weapons, ${systems.data.getAllCharacters().length} characters`);
  console.log(`  Combat engine: ready`);
  console.log(`  Items: ready`);
  console.log(`  Progression: ready`);
  console.log(`  Tutorial: ${systems.tutorial.getState().hintsEnabled ? 'hints enabled' : 'hints disabled'}`);
  console.log(`  Audio: config loaded (master=${systems.audio.getConfig().masterVolume})`);
  console.log(`  Screen: ${state.currentScreen}`);

  // Expose for debugging in browser console
  if (typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>)['shatteredThrone'] = { systems, state };
  }
}

// Auto-run when loaded as a module in the browser
if (typeof window !== 'undefined') {
  main().catch(console.error);
}
