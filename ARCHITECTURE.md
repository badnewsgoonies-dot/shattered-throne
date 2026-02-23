# Shattered Throne — Architecture Document

## Overview

Shattered Throne is a tactical RPG built in pure TypeScript with canvas rendering and Web Audio.
The codebase is organized into 10 independent domains, each with a clean public API exported
via `index.ts`. All cross-domain communication flows through typed interfaces defined in
`src/shared/types.ts`. There are zero circular dependencies between domains.

---

## Directory Structure

```
src/
├── shared/
│   └── types.ts              # Master type contract (all cross-domain types)
├── grid/                     # Domain 1: Grid Engine
├── units/                    # Domain 2: Unit System
├── combat/                   # Domain 3: Combat Engine
├── items/                    # Domain 4: Equipment & Items
├── campaign/                 # Domain 5: Campaign & Story
├── progression/              # Domain 6: Progression & Economy
├── audio/                    # Domain 7: Audio & Effects
├── renderer/                 # Domain 8: Renderer
├── tutorial/                 # Domain 9: Tutorial & Help
├── data/                     # Domain 10: Data & Content
└── integration/              # Top-level game loop wiring (not a domain)
specs/
├── grid_spec.md
├── units_spec.md
├── combat_spec.md
├── items_spec.md
├── campaign_spec.md
├── progression_spec.md
├── audio_spec.md
├── renderer_spec.md
├── tutorial_spec.md
└── data_spec.md
index.html                    # Single entry point
```

---

## Domain Descriptions

### Domain 1: Grid Engine (`src/grid/`)
**Owner:** grid team · **Interface:** `IGridEngine`

Provides the spatial foundation for all tactical gameplay. Manages hex/square grids,
terrain tiles, pathfinding (A* with terrain costs), movement range calculation (flood fill),
attack range calculation, line-of-sight with height, fog of war, zone of control, and
danger zone computation. Exports map creation, serialization, and 20+ predefined map templates.

**Key files:** `gridEngine.ts`, `pathfinding.ts`, `rangeCalculator.ts`, `lineOfSight.ts`,
`fogOfWar.ts`, `terrainData.ts`, `mapTemplates.ts`, `mapSerializer.ts`, `index.ts`

### Domain 2: Unit System (`src/units/`)
**Owner:** units team · **Interface:** `IUnitSystem`

Manages unit data models, stat calculation, 12+ character classes with growth rates and
stat caps, promotion paths, equipment effects on stats, status effect processing, and the
full enemy AI system (aggressive, defensive, support, flanker, boss behaviors). Provides
unit creation, serialization, roster management, and AI action selection.

**Key files:** `unitSystem.ts`, `statCalculator.ts`, `classDefinitions.ts`, `aiSystem.ts`,
`aiThreatAssessment.ts`, `statusEffects.ts`, `unitFactory.ts`, `unitSerializer.ts`, `index.ts`

### Domain 3: Combat Engine (`src/combat/`)
**Owner:** combat team · **Interface:** `ICombatEngine`

Resolves all tactical combat. Implements damage formulas (physical/magical), hit rate,
critical rate, weapon triangle, magic triangle, height advantage, support bonuses,
counter-attacks, double attacks, and skill execution. Manages the combat state machine
(deploy → select → move → act → animate → victory/defeat), turn phases, undo, combat
logging, victory/defeat condition checking, and EXP calculation.

**Key files:** `combatEngine.ts`, `damageCalculator.ts`, `hitCalculator.ts`,
`weaponTriangle.ts`, `combatStateMachine.ts`, `skillExecutor.ts`, `combatLog.ts`,
`victoryConditions.ts`, `expCalculator.ts`, `index.ts`

### Domain 4: Equipment & Items (`src/items/`)
**Owner:** items team · **Interface:** `IItemSystem`

Manages all item operations: equipping weapons/armor, using consumables, inventory
management (5-slot per unit), convoy (shared storage), item durability and breakage,
weapon forging, item trading between units, and shop system with per-chapter inventories.
Does NOT define item data (that's domain 10) — operates on `ItemData` and `ItemInstance` types.

**Key files:** `itemSystem.ts`, `inventoryManager.ts`, `equipmentManager.ts`,
`convoyManager.ts`, `durabilityManager.ts`, `forgeSystem.ts`, `shopSystem.ts`,
`tradeSystem.ts`, `index.ts`

### Domain 5: Campaign & Story (`src/campaign/`)
**Owner:** campaign team · **Interface:** `ICampaignSystem`

Manages campaign progression: 25 story chapters + 10 paralogues, branching story path,
world map navigation, base camp operations, narrative events (pre/mid/post battle dialogue),
support conversations, and save/load system (multiple slots, battle suspend). Tracks campaign
state including completed chapters, unlocked content, gold, roster, and achievements.

**Key files:** `campaignSystem.ts`, `chapterManager.ts`, `worldMap.ts`, `narrativeEngine.ts`,
`supportSystem.ts`, `saveSystem.ts`, `baseCamp.ts`, `index.ts`

### Domain 6: Progression & Economy (`src/progression/`)
**Owner:** progression team · **Interface:** `IProgressionSystem`

Handles EXP calculation with level-difference scaling, level-up stat rolls per growth rates,
class promotion (level 15+, promotion items, stat bonuses, new weapon types), gold economy,
arena battles, and achievement/unlock tracking.

**Key files:** `progressionSystem.ts`, `expCalculator.ts`, `levelUpSystem.ts`,
`promotionSystem.ts`, `economyManager.ts`, `arenaSystem.ts`, `achievementTracker.ts`, `index.ts`

### Domain 7: Audio & Effects (`src/audio/`)
**Owner:** audio team · **Interface:** `IAudioSystem`

Procedural sound effects using Web Audio API (OscillatorNode + GainNode). Retro-style
synthesized SFX for all game events (sword swing, arrow, magic, hit, crit, level up, etc.).
Procedural ambient music loops per context. Volume controls (master/music/SFX) persisted
to localStorage. Sound queuing for combat resolution sequences.

**Key files:** `audioSystem.ts`, `sfxGenerator.ts`, `musicGenerator.ts`, `volumeManager.ts`,
`soundQueue.ts`, `index.ts`

### Domain 8: Renderer (`src/renderer/`)
**Owner:** renderer team · **Interface:** `IRenderer`

Canvas-based rendering for all game views. Battle view: isometric/top-down grid, colored
unit shapes with class icons, health bars, movement/attack/danger overlays, combat
animations, damage numbers. UI screens: title, world map, base camp, unit info, battle
forecast, shop, inventory, dialogue boxes, save/load, settings. Animation system with
tweening, screen shake, particles, fade transitions. Camera with pan/zoom.

**Key files:** `renderer.ts`, `battleRenderer.ts`, `uiRenderer.ts`, `gridRenderer.ts`,
`unitRenderer.ts`, `animationSystem.ts`, `tweenEngine.ts`, `particleSystem.ts`,
`camera.ts`, `dialogueRenderer.ts`, `menuRenderer.ts`, `minimapRenderer.ts`, `index.ts`

### Domain 9: Tutorial & Help (`src/tutorial/`)
**Owner:** tutorial team · **Interface:** `ITutorialSystem`

In-game tutorial with guided first-chapter prompts, contextual tooltips, searchable
glossary of all game terms (weapon triangle, terrain, status effects, etc.), idle-time
hints, and tutorial completion tracking to avoid repeats.

**Key files:** `tutorialSystem.ts`, `tutorialSteps.ts`, `glossary.ts`, `hintSystem.ts`,
`tooltipProvider.ts`, `index.ts`

### Domain 10: Data & Content (`src/data/`)
**Owner:** data team · **Interface:** `IDataProvider`

All game content as typed TypeScript data structures. 12 class definitions, 80+ weapons,
40+ armor, 20+ consumables, 50+ skills, 25 chapters, 10 paralogues, 40+ characters,
30+ support conversations, 20+ map layouts, 30+ enemy templates. All data in `.ts` files
(no JSON). Comprehensive validation functions ensuring all cross-references resolve.

**Key files:** `dataProvider.ts`, `classes.ts`, `weapons.ts`, `armor.ts`, `consumables.ts`,
`skills.ts`, `chapters.ts`, `paralogues.ts`, `characters.ts`, `supportConversations.ts`,
`mapLayouts.ts`, `enemyTemplates.ts`, `promotionItems.ts`, `validation.ts`, `index.ts`

---

## Cross-Domain Interfaces

Every domain communicates exclusively through the interfaces and types in `src/shared/types.ts`.
Below is the dependency graph showing which domain APIs each domain consumes:

```
grid        → (none — leaf dependency)
data        → (none — leaf dependency)
units       → IGridEngine, IDataProvider (for AI pathfinding)
items       → IDataProvider (for item lookups)
combat      → IGridEngine, IUnitSystem, IItemSystem (for damage calc, ranges)
progression → IUnitSystem, IDataProvider (for class defs, growth rates)
campaign    → IDataProvider, IProgressionSystem (for rewards)
audio       → (none — event-driven, receives SoundRequest/MusicRequest)
renderer    → (none — receives all data as parameters)
tutorial    → (none — receives context strings)
```

### Integration Layer (`src/integration/`)

The integration layer (NOT a domain) wires all domain APIs together into the game loop.
It is the only code that imports from multiple domains simultaneously. Each domain's
`index.ts` exports a factory function or class implementing its interface.

---

## Required Exports per Domain

Each domain MUST export the following from `src/<domain>/index.ts`:

| Domain       | Primary Export                    | Type                  |
|-------------|-----------------------------------|-----------------------|
| `grid`      | `createGridEngine()`              | `() => IGridEngine`   |
| `units`     | `createUnitSystem()`              | `() => IUnitSystem`   |
| `combat`    | `createCombatEngine()`            | `() => ICombatEngine` |
| `items`     | `createItemSystem(data: IDataProvider)` | `(IDataProvider) => IItemSystem` |
| `campaign`  | `createCampaignSystem(data: IDataProvider)` | `(IDataProvider) => ICampaignSystem` |
| `progression` | `createProgressionSystem(data: IDataProvider)` | `(IDataProvider) => IProgressionSystem` |
| `audio`     | `createAudioSystem()`             | `() => IAudioSystem`  |
| `renderer`  | `createRenderer()`                | `() => IRenderer`     |
| `tutorial`  | `createTutorialSystem()`          | `() => ITutorialSystem` |
| `data`      | `createDataProvider()`            | `() => IDataProvider` |

---

## File Ownership Rules

Each domain owns ONLY files under `src/<domain>/`:

- `src/grid/*` — owned exclusively by grid domain
- `src/units/*` — owned exclusively by units domain
- `src/combat/*` — owned exclusively by combat domain
- `src/items/*` — owned exclusively by items domain
- `src/campaign/*` — owned exclusively by campaign domain
- `src/progression/*` — owned exclusively by progression domain
- `src/audio/*` — owned exclusively by audio domain
- `src/renderer/*` — owned exclusively by renderer domain
- `src/tutorial/*` — owned exclusively by tutorial domain
- `src/data/*` — owned exclusively by data domain
- `src/shared/types.ts` — READ-ONLY for all domains (maintained by architect)
- `src/integration/*` — owned by integration (post-domain assembly)

**No domain may create, modify, or delete files outside its owned directory.**

---

## Key Design Principles

1. **Immutable-style updates**: Domain functions return new objects rather than mutating inputs (e.g., `applyDamage` returns a new `Unit`, not mutating the original).
2. **No circular dependencies**: The dependency graph is a DAG. Grid and Data are leaves.
3. **Pure functions where possible**: Combat math, pathfinding, range calculations are all pure functions of their inputs.
4. **Serializable state**: All game state (`CampaignState`, `GridMap`, `Unit`, `CombatState`) is JSON-serializable for save/load.
5. **Single source of truth for types**: `src/shared/types.ts` is the ONLY place cross-domain types are defined. Domains may define internal-only types in their own files.
6. **No external dependencies**: Pure TypeScript, canvas API, and Web Audio API only. No game engines, no frameworks, no npm runtime dependencies.
7. **Test everything non-visual**: All domains except renderer have comprehensive Vitest test suites. Target 1000+ tests total.
