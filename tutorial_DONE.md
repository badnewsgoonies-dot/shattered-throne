# Tutorial Domain — Complete

## Files Created

- `src/tutorial/index.ts` — Public export (createTutorialSystem)
- `src/tutorial/tutorialSystem.ts` — Main ITutorialSystem implementation
- `src/tutorial/tutorialSteps.ts` — 6 tutorial sequences (23 steps total)
- `src/tutorial/glossary.ts` — 85 game term glossary entries
- `src/tutorial/hintSystem.ts` — Context-aware idle hint system
- `src/tutorial/tooltipProvider.ts` — Tooltips for terrain, stats, status effects, weapons, classes
- `src/tutorial/__tests__/tutorialSystem.test.ts` — 25 tests
- `src/tutorial/__tests__/tutorialSteps.test.ts` — 32 tests
- `src/tutorial/__tests__/glossary.test.ts` — 62 tests
- `src/tutorial/__tests__/hintSystem.test.ts` — 11 tests
- `src/tutorial/__tests__/tooltipProvider.test.ts` — 65 tests

## Test Results

195 tests passing across 5 test files.

## Implementation Notes

- All imports use `../shared/types` (relative from `src/tutorial/`).
- Glossary contains 85 entries covering all required terms plus additional weapon types, terrain types, and classes.
- Hint system uses `Date.now()` for 30-second repeat cooldown tracking.
- Tutorial step chains are built with a helper function that auto-links `nextStepId`.
- The `startTutorial` method allows replaying seen tutorials when `hintsEnabled` is true.
