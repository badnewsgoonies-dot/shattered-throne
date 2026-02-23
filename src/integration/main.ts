// ============================================================
// Shattered Throne — Integration Layer
// src/integration/main.ts
//
// Wires all 10 domain APIs together into the game loop.
// This is the ONLY module that imports from multiple domains.
// ============================================================

import { createGridEngine } from '../grid/index';
import { createUnitSystem } from '../units/index';
import { createCombatEngine } from '../combat/index';
import { createItemSystem } from '../items/index';
import { createCampaignSystem } from '../campaign/index';
import { createProgressionSystem } from '../progression/index';
import { createAudioSystem } from '../audio/index';
import { createRenderer } from '../renderer/index';
import { createTutorialSystem } from '../tutorial/index';
import { createDataProvider } from '../data/index';

import {
  TurnPhase,
  CombatStateType,
  SoundEffectType,
  MusicContext,
} from '../shared/types';

import type {
  IGridEngine,
  IUnitSystem,
  ICombatEngine,
  IItemSystem,
  ICampaignSystem,
  IProgressionSystem,
  IAudioSystem,
  IRenderer,
  ITutorialSystem,
  IDataProvider,
  CampaignState,
  CombatState,
  Unit,
  GridMap,
  ChapterDefinition,
  Camera,
  Position,
  CombatAction,
  BattleForecast,
  CombatResult,
  RenderOverlay,
  TutorialState,
  BattleSaveData,
} from '../shared/types';

// ============================================================
// Game Systems Container
// ============================================================

export interface GameSystems {
  grid: IGridEngine;
  units: IUnitSystem;
  combat: ICombatEngine;
  items: IItemSystem;
  campaign: ICampaignSystem;
  progression: IProgressionSystem;
  audio: IAudioSystem;
  renderer: IRenderer;
  tutorial: ITutorialSystem;
  data: IDataProvider;
}

export function initializeSystems(): GameSystems {
  // Create leaf dependencies first
  const data = createDataProvider();
  const grid = createGridEngine();

  // Create systems that depend on data
  const items = createItemSystem(data);
  const campaign = createCampaignSystem(data);
  const progression = createProgressionSystem(data);

  // Create independent systems
  const units = createUnitSystem();
  const combat = createCombatEngine();
  const audio = createAudioSystem();
  const renderer = createRenderer();
  const tutorial = createTutorialSystem();

  return { grid, units, combat, items, campaign, progression, audio, renderer, tutorial, data };
}

// ============================================================
// Game State
// ============================================================

export interface GameState {
  campaignState: CampaignState;
  combatState: CombatState | null;
  currentMap: GridMap | null;
  battleUnits: Unit[];
  currentChapter: ChapterDefinition | null;
  camera: Camera;
  tutorialState: TutorialState;
  isInBattle: boolean;
  isPaused: boolean;
}

export function createInitialGameState(systems: GameSystems): GameState {
  const campaignState = systems.campaign.startNewCampaign();

  return {
    campaignState,
    combatState: null,
    currentMap: null,
    battleUnits: [],
    currentChapter: null,
    camera: { x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0, targetZoom: 1 },
    tutorialState: {
      seenTutorials: [],
      currentTutorialId: null,
      currentStepId: null,
      hintsEnabled: true,
      lastActionTimestamp: Date.now(),
    },
    isInBattle: false,
    isPaused: false,
  };
}

// ============================================================
// Game Loop Actions
// ============================================================

export function startChapter(
  systems: GameSystems,
  state: GameState,
  chapterId: string
): GameState {
  const chapter = systems.campaign.getChapter(chapterId);
  const mapData = systems.data.getMapData(chapter.mapId);
  if (!mapData) throw new Error(`Map not found: ${chapter.mapId}`);

  const map = systems.grid.loadMap(mapData);

  // Create enemy units
  const enemyUnits: Unit[] = chapter.enemies.map((enemy) => {
    const classDef = systems.data.getClassDefinition(enemy.className);
    const items = enemy.equipment
      .map((id) => systems.data.getItem(id))
      .filter((i): i is NonNullable<typeof i> => i !== null);
    return systems.units.createEnemyUnit(enemy, classDef, items);
  });

  // Play battle music
  systems.audio.playMusic({ context: MusicContext.BattlePlayer });

  // Start movement tutorial on first chapter
  if (!state.tutorialState.seenTutorials.includes('movement_tutorial')) {
    systems.tutorial.init(state.tutorialState);
    systems.tutorial.startTutorial('movement_tutorial');
  }

  return {
    ...state,
    currentChapter: chapter,
    currentMap: map,
    battleUnits: [...state.campaignState.roster, ...enemyUnits],
    combatState: {
      phase: TurnPhase.Player,
      stateType: CombatStateType.Deploy,
      turnNumber: 1,
      selectedUnitId: null,
      movementRange: [],
      attackRange: [],
      dangerZone: [],
      cursorPosition: { x: 0, y: 0 },
      combatLog: [],
      undoStack: [],
    },
    isInBattle: true,
  };
}

export function executeAttack(
  systems: GameSystems,
  state: GameState,
  attackerId: string,
  defenderId: string
): { state: GameState; result: CombatResult } {
  const attacker = state.battleUnits.find((u) => u.id === attackerId);
  const defender = state.battleUnits.find((u) => u.id === defenderId);
  if (!attacker || !defender || !state.currentMap) {
    throw new Error('Invalid attack parameters');
  }

  const attackerWeapon = systems.units.getEquippedWeapon(
    attacker,
    systems.data.getAllWeapons()
  );
  const defenderWeapon = systems.units.getEquippedWeapon(
    defender,
    systems.data.getAllWeapons()
  );

  if (!attackerWeapon) throw new Error('Attacker has no weapon equipped');

  const attackerPos = attacker.position!;
  const defenderPos = defender.position!;
  const attackerTile = systems.grid.getTile(state.currentMap, attackerPos);
  const defenderTile = systems.grid.getTile(state.currentMap, defenderPos);

  if (!attackerTile || !defenderTile) throw new Error('Invalid positions');

  const distance = systems.grid.getDistance(
    attackerPos,
    defenderPos,
    state.currentMap.gridType
  );

  // Resolve combat
  const result = systems.combat.resolveCombat(
    attacker,
    defender,
    attackerWeapon,
    defenderWeapon,
    attackerTile.terrain,
    defenderTile.terrain,
    distance
  );

  // Play sound effects
  systems.audio.playSFX({ type: SoundEffectType.SwordSwing });
  if (result.rounds.some((r) => r.crit)) {
    systems.audio.playSFX({ type: SoundEffectType.CriticalHit });
  }
  if (result.rounds.some((r) => r.hit)) {
    systems.audio.playSFX({ type: SoundEffectType.HitImpact });
  }

  // Update units with combat results
  const updatedUnits = state.battleUnits.map((u) => {
    if (u.id === attackerId) {
      const lastRound = result.rounds[result.rounds.length - 1];
      const newHP = lastRound.attacker === attackerId
        ? lastRound.attackerHPAfter
        : lastRound.defenderHPAfter;
      return { ...u, currentHP: newHP, isAlive: newHP > 0, hasActed: true };
    }
    if (u.id === defenderId) {
      const lastRound = result.rounds[result.rounds.length - 1];
      const newHP = lastRound.attacker === attackerId
        ? lastRound.defenderHPAfter
        : lastRound.attackerHPAfter;
      if (newHP <= 0) {
        systems.audio.playSFX({ type: SoundEffectType.Death });
      }
      return { ...u, currentHP: newHP, isAlive: newHP > 0 };
    }
    return u;
  });

  // Award EXP to attacker
  const attackerUpdated = updatedUnits.find((u) => u.id === attackerId)!;
  const defenderUpdated = updatedUnits.find((u) => u.id === defenderId)!;
  const expGain = systems.combat.calculateExpGain(
    attackerUpdated,
    defenderUpdated,
    result.rounds.reduce((sum, r) => sum + (r.hit ? r.damage : 0), 0),
    !defenderUpdated.isAlive
  );

  const { unit: expUnit, levelUp } = systems.progression.awardExp(attackerUpdated, [
    { unitId: attackerUpdated.id, amount: expGain, source: !defenderUpdated.isAlive ? 'kill' : 'damage' },
  ]);

  if (levelUp) {
    systems.audio.playSFX({ type: SoundEffectType.LevelUp });
  }

  const finalUnits = updatedUnits.map((u) =>
    u.id === attackerId ? expUnit : u
  );

  return {
    state: { ...state, battleUnits: finalUnits },
    result,
  };
}

export function getBattleForecast(
  systems: GameSystems,
  state: GameState,
  attackerId: string,
  defenderId: string
): BattleForecast | null {
  const attacker = state.battleUnits.find((u) => u.id === attackerId);
  const defender = state.battleUnits.find((u) => u.id === defenderId);
  if (!attacker || !defender || !state.currentMap) return null;

  const attackerWeapon = systems.units.getEquippedWeapon(
    attacker,
    systems.data.getAllWeapons()
  );
  const defenderWeapon = systems.units.getEquippedWeapon(
    defender,
    systems.data.getAllWeapons()
  );
  if (!attackerWeapon) return null;

  const attackerTile = systems.grid.getTile(state.currentMap, attacker.position!);
  const defenderTile = systems.grid.getTile(state.currentMap, defender.position!);
  if (!attackerTile || !defenderTile) return null;

  const distance = systems.grid.getDistance(
    attacker.position!,
    defender.position!,
    state.currentMap.gridType
  );

  // Count adjacent allies
  const attackerAllies = systems.grid
    .getAdjacentPositions(state.currentMap, attacker.position!)
    .filter((pos) =>
      state.battleUnits.some(
        (u) => u.position && u.position.x === pos.x && u.position.y === pos.y && u.team === attacker.team && u.isAlive
      )
    ).length;

  const defenderAllies = systems.grid
    .getAdjacentPositions(state.currentMap, defender.position!)
    .filter((pos) =>
      state.battleUnits.some(
        (u) => u.position && u.position.x === pos.x && u.position.y === pos.y && u.team === defender.team && u.isAlive
      )
    ).length;

  return systems.combat.getBattleForecast(
    attacker,
    defender,
    attackerWeapon,
    defenderWeapon,
    attackerTile.terrain,
    defenderTile.terrain,
    distance,
    attackerAllies,
    defenderAllies
  );
}

export function completeChapter(
  systems: GameSystems,
  state: GameState
): GameState {
  if (!state.currentChapter) throw new Error('No active chapter');

  const chapter = state.currentChapter;
  const newCampaignState = systems.campaign.completeChapter(
    state.campaignState,
    chapter.id,
    chapter.rewards
  );

  systems.audio.playMusic({ context: MusicContext.Victory });

  return {
    ...state,
    campaignState: newCampaignState,
    isInBattle: false,
    combatState: null,
    currentMap: null,
    battleUnits: [],
    currentChapter: null,
  };
}

export function saveGame(
  systems: GameSystems,
  state: GameState,
  slotIndex: number
): void {
  if (state.isInBattle && state.combatState && state.currentMap && state.currentChapter) {
    const battleState: BattleSaveData = {
      chapterId: state.currentChapter.id,
      grid: state.currentMap,
      units: state.battleUnits,
      combatState: state.combatState,
      turnNumber: state.combatState.turnNumber,
    };
    systems.campaign.saveBattle(state.campaignState, battleState, slotIndex);
  } else {
    systems.campaign.save(state.campaignState, slotIndex);
  }
}

export function loadGame(
  systems: GameSystems,
  slotIndex: number
): GameState | null {
  const saveData = systems.campaign.load(slotIndex);
  if (!saveData) return null;

  const gameState: GameState = {
    campaignState: saveData.campaign,
    combatState: saveData.battleState?.combatState ?? null,
    currentMap: saveData.battleState?.grid ?? null,
    battleUnits: saveData.battleState?.units ?? [],
    currentChapter: saveData.battleState
      ? systems.campaign.getChapter(saveData.battleState.chapterId)
      : null,
    camera: { x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0, targetZoom: 1 },
    tutorialState: {
      seenTutorials: [],
      currentTutorialId: null,
      currentStepId: null,
      hintsEnabled: true,
      lastActionTimestamp: Date.now(),
    },
    isInBattle: !!saveData.battleState,
    isPaused: false,
  };

  return gameState;
}

// ============================================================
// Render Loop
// ============================================================

export function renderFrame(
  systems: GameSystems,
  state: GameState
): void {
  if (!state.isInBattle || !state.currentMap || !state.combatState) return;

  // Build overlays
  const overlays: RenderOverlay[] = [];

  if (state.combatState.movementRange.length > 0) {
    overlays.push({
      type: 'movement',
      positions: state.combatState.movementRange,
      color: 'rgba(0, 100, 255, 0.3)',
      opacity: 0.3,
    });
  }

  if (state.combatState.attackRange.length > 0) {
    overlays.push({
      type: 'attack',
      positions: state.combatState.attackRange,
      color: 'rgba(255, 0, 0, 0.3)',
      opacity: 0.3,
    });
  }

  if (state.combatState.dangerZone.length > 0) {
    overlays.push({
      type: 'danger',
      positions: state.combatState.dangerZone,
      color: 'rgba(255, 165, 0, 0.2)',
      opacity: 0.2,
    });
  }

  systems.renderer.renderBattle(
    state.currentMap,
    state.battleUnits,
    state.combatState,
    state.camera,
    overlays
  );
}

// ============================================================
// Export all
// ============================================================

export {
  initializeSystems as default,
};
