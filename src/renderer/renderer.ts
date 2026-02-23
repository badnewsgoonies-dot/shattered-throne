import {
  AnimationRequest,
  BattleForecast,
  Camera,
  CombatLogEntry,
  CombatState,
  DialogueLine,
  GridMap,
  GridType,
  IRenderer,
  LevelUpResult,
  Position,
  RenderOverlay,
  UIScreen,
  Unit,
  WorldMapNode,
} from '../shared/types';
import { playAnimation as playAnimationFn } from './animationSystem';
import { createDefaultCamera, gridToScreen as gridToScreenFn, screenToGrid as screenToGridFn } from './camera';
import { renderBattleForecast as renderBattleForecastPanel } from './battleForecastRenderer';
import { renderCombatLog } from './combatLogRenderer';
import { renderDialogueBox } from './dialogueRenderer';
import { renderGrid } from './gridRenderer';
import { renderLevelUpScreen } from './levelUpRenderer';
import { renderMinimap } from './minimapRenderer';
import { renderOverlays } from './overlayRenderer';
import { renderSaveLoadMenu } from './saveLoadRenderer';
import { renderSettingsMenu } from './settingsRenderer';
import { renderShop } from './shopRenderer';
import { TERRAIN_COLORS, TILE_SIZE } from './terrainColors';
import { renderTitleScreen } from './titleScreenRenderer';
import { renderTurnBanner } from './turnBannerRenderer';
import { renderUnitInfoScreen } from './unitInfoRenderer';
import { renderUnits } from './unitRenderer';
import { renderWorldMap } from './worldMapRenderer';

interface BattleForecastScreenData {
  forecast: BattleForecast;
  attacker: Unit;
  defender: Unit;
}

interface CombatLogScreenData {
  entries: CombatLogEntry[];
  scrollOffset?: number;
}

interface DialogueScreenData {
  lines: DialogueLine[];
  currentIndex: number;
  elapsedMs?: number;
}

interface WorldMapScreenData {
  nodes: WorldMapNode[];
  selectedNodeId?: string;
}

function drawHexOutline(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y);
  ctx.lineTo(x + size * 0.75, y);
  ctx.lineTo(x + size, y + size * 0.5);
  ctx.lineTo(x + size * 0.75, y + size);
  ctx.lineTo(x + size * 0.25, y + size);
  ctx.lineTo(x, y + size * 0.5);
  ctx.closePath();
}

function isUnit(value: unknown): value is Unit {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<Unit>;
  return typeof candidate.id === 'string' && typeof candidate.name === 'string' && !!candidate.currentStats;
}

function isBattleForecastScreenData(value: unknown): value is BattleForecastScreenData {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<BattleForecastScreenData>;
  return !!candidate.forecast && isUnit(candidate.attacker) && isUnit(candidate.defender);
}

function isCombatLogScreenData(value: unknown): value is CombatLogScreenData {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<CombatLogScreenData>;
  return Array.isArray(candidate.entries);
}

function isDialogueScreenData(value: unknown): value is DialogueScreenData {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<DialogueScreenData>;
  return Array.isArray(candidate.lines) && typeof candidate.currentIndex === 'number';
}

function isWorldMapScreenData(value: unknown): value is WorldMapScreenData {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<WorldMapScreenData>;
  return Array.isArray(candidate.nodes);
}

function drawCursor(
  ctx: CanvasRenderingContext2D,
  cursorPosition: Position,
  camera: Camera,
  gridType: GridType,
): void {
  const tileSize = TILE_SIZE * camera.zoom;
  const screen = gridToScreenFn(cursorPosition, camera, gridType);

  ctx.strokeStyle = '#FFE066';
  ctx.lineWidth = 2;

  if (gridType === GridType.Hex) {
    drawHexOutline(ctx, screen.x, screen.y, tileSize);
    ctx.stroke();
    return;
  }

  ctx.strokeRect(screen.x, screen.y, tileSize, tileSize);
}

function clearFrame(ctx: CanvasRenderingContext2D): void {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = TERRAIN_COLORS.void;
  ctx.fillRect(0, 0, width, height);
}

export function createRenderer(): IRenderer {
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let camera: Camera = createDefaultCamera();

  let currentPhase = null as CombatState['phase'] | null;
  let phaseStartMs = Date.now();

  let dialogueIndex = -1;
  let dialogueStartMs = Date.now();

  return {
    init(c: HTMLCanvasElement): void {
      canvas = c;
      ctx = c.getContext('2d');
    },

    renderBattle(map: GridMap, units: Unit[], state: CombatState, cam: Camera, overlays: RenderOverlay[]): void {
      if (!ctx || !canvas) {
        return;
      }

      camera = cam;
      clearFrame(ctx);

      renderGrid(map, camera, ctx);
      renderOverlays(overlays, camera, map.gridType, ctx);
      renderUnits(units, camera, map.gridType, ctx);
      drawCursor(ctx, state.cursorPosition, camera, map.gridType);

      if (currentPhase !== state.phase) {
        currentPhase = state.phase;
        phaseStartMs = Date.now();
      }

      renderTurnBanner(ctx, state.phase, Date.now() - phaseStartMs);
      renderCombatLog(ctx, state.combatLog);
      renderMinimap(ctx, map, units, camera);
    },

    renderUI(screen: UIScreen, data: unknown): void {
      if (!ctx || !canvas) {
        return;
      }

      clearFrame(ctx);

      switch (screen) {
        case UIScreen.Title:
          renderTitleScreen(ctx, data);
          break;

        case UIScreen.WorldMap:
          if (isWorldMapScreenData(data)) {
            renderWorldMap(ctx, data);
          } else {
            renderWorldMap(ctx, { nodes: [] });
          }
          break;

        case UIScreen.UnitInfo:
          if (isUnit(data)) {
            renderUnitInfoScreen(ctx, data);
          }
          break;

        case UIScreen.Shop:
          renderShop(ctx, data);
          break;

        case UIScreen.SaveLoad:
          renderSaveLoadMenu(ctx, data);
          break;

        case UIScreen.Settings:
          renderSettingsMenu(ctx, data);
          break;

        case UIScreen.Dialogue:
          if (isDialogueScreenData(data)) {
            renderDialogueBox(ctx, data.lines, data.currentIndex, data.elapsedMs ?? Number.POSITIVE_INFINITY);
          }
          break;

        case UIScreen.BattleForecast:
          if (isBattleForecastScreenData(data)) {
            renderBattleForecastPanel(ctx, data.forecast, data.attacker, data.defender);
          }
          break;

        case UIScreen.CombatLog:
          if (isCombatLogScreenData(data)) {
            renderCombatLog(ctx, data.entries, data.scrollOffset ?? 0);
          }
          break;

        default:
          break;
      }
    },

    renderDialogue(lines: DialogueLine[], currentIndex: number): void {
      if (!ctx) {
        return;
      }

      if (dialogueIndex !== currentIndex) {
        dialogueIndex = currentIndex;
        dialogueStartMs = Date.now();
      }

      renderDialogueBox(ctx, lines, currentIndex, Date.now() - dialogueStartMs);
    },

    renderBattleForecast(forecast: BattleForecast, attacker: Unit, defender: Unit): void {
      if (!ctx) {
        return;
      }

      renderBattleForecastPanel(ctx, forecast, attacker, defender);
    },

    renderLevelUp(result: LevelUpResult, unit: Unit): void {
      if (!ctx) {
        return;
      }

      renderLevelUpScreen(ctx, result, unit);
    },

    async playAnimation(request: AnimationRequest): Promise<void> {
      await playAnimationFn(request, ctx);
    },

    setCamera(c: Camera): void {
      camera = c;
    },

    getCamera(): Camera {
      return { ...camera };
    },

    screenToGrid(screenX: number, screenY: number, cam: Camera, gridType: GridType): Position {
      return screenToGridFn(screenX, screenY, cam, gridType);
    },

    gridToScreen(pos: Position, cam: Camera, gridType: GridType): { x: number; y: number } {
      return gridToScreenFn(pos, cam, gridType);
    },
  };
}
