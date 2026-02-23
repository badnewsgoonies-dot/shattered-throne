# Shattered Throne — Build Report

**Date:** 2026-02-22
**Phase:** 3 (Integration + Validation)

---

## Validation Results

### TypeScript Compiler (`npx tsc --noEmit`)
**PASS** — 0 errors

### Test Suite (`npx vitest run`)
**PASS** — 79 test files, 1108 tests, all passing
Duration: ~10s

---

## Per-Domain Breakdown

| Domain | Source Files | Source LOC | Test Files | Tests |
|---|---|---|---|---|
| grid | 8 | 2,145 | 9 | 112 |
| units | 8 | 1,027 | 11 | 120 |
| combat | 10 | 1,054 | 13 | 205 |
| items | 9 | 458 | 11 | 87 |
| campaign | 8 | 730 | 8 | 88 |
| progression | 8 | 380 | 7 | 84 |
| audio | 6 | 946 | 6 | 57 |
| renderer | 22 | 1,564 | 5 | 53 |
| tutorial | 6 | 703 | 5 | 128 |
| data | 15 | 7,379 | 13 | 174 |
| integration | 1 | 526 | 0 | 0 |
| shared | 1 | 984 | 0 | 0 |

---

## Totals

| Metric | Count |
|---|---|
| Total source files (excl. tests) | 102 |
| Total source LOC (excl. tests) | 17,896 |
| Total test files | 88 |
| Total tests | 1,108 |

---

## Step 2 Fixes

**None required.** The TypeScript compiler reported 0 errors on the initial run. No changes were made to `src/shared/types.ts` or any domain code.

---

## Integration Layer

The existing `src/integration/main.ts` already contained the domain wiring (`initializeSystems`), game state management, and game loop actions. The following were added:

- `createGameSystems()` — alias for `initializeSystems()`
- `initGame(canvas)` — initializes all systems with a canvas element
- `main()` — browser entry point that boots the game loop

A browser entry point `index.html` was created with a canvas element and ES module import.

---

## Known Gaps & Missing Functionality

1. **No integration tests** — the integration layer has 0 test files; all 1108 tests are domain-level unit tests
2. **No input handling** — no keyboard/mouse/touch event processing; game state can only be changed via console
3. **No turn management** — no automated phase transitions (Player → Enemy → Ally); combat state machine types exist but no orchestrator advances them
4. **No AI execution loop** — AI action calculation exists (`units.calculateAIAction`) but nothing calls it during enemy phase
5. **No deployment phase UI** — `CombatStateType.Deploy` state type exists but no placement logic
6. **No unit movement execution** — path-finding and range calculation exist but no `moveUnit()` action in integration
7. **No item use during battle** — item system is wired but no battle action triggers consumable use
8. **No skill execution in battle** — skill executor exists in combat engine but no integration action calls it
9. **No support point accumulation** — support system exists but no triggers award points during gameplay
10. **No promotion UI/flow** — promotion system exists but no integration action for class changes
11. **No world map navigation** — world map nodes and rendering exist but no navigation logic
12. **No dialogue playback loop** — dialogue renderer exists but no sequencing/advancement logic
13. **Renderer is canvas-only** — no WebGL path; all rendering is 2D canvas
14. **No bundler configured** — `index.html` imports `.ts` directly; requires Vite or similar to serve
15. **Audio requires user gesture** — `AudioContext` creation needs a user interaction event to work in browsers
