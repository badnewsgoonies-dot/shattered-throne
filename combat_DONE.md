# Combat Engine — Implementation Complete

## Summary

The Combat Engine domain has been fully implemented with **10 source files** and **11 test files** containing **206 passing tests**.

## Source Files (`src/combat/`)

| File | Purpose |
|---|---|
| `index.ts` | Barrel export: `createCombatEngine` factory |
| `combatEngine.ts` | Main `ICombatEngine` implementation with deterministic RNG, battle forecast, combat resolution |
| `damageCalculator.ts` | Physical/magical damage formulas with terrain, height, effectiveness, forge, crit |
| `hitCalculator.ts` | Hit rate and crit rate formulas with class bonuses, support, height, terrain |
| `weaponTriangle.ts` | Physical weapon triangle (Sword>Axe>Lance) and magic triangle (Fire>Wind>Thunder, Dark↔Light) |
| `expCalculator.ts` | EXP gain calculation with level scaling, kill bonus, damage fraction, clamping |
| `victoryConditions.ts` | Victory (Rout, BossKill, Survive, ReachLocation, ProtectTarget) and defeat condition checks |
| `combatLog.ts` | Combat log entry formatters (attack, miss, crit, heal, defeat, skill use) |
| `skillExecutor.ts` | Skill execution: SP cost, damage/healing, buffs/debuffs, status effects, AoE |
| `combatStateMachine.ts` | State machine: Deploy→UnitSelect→MoveSelect→ActionSelect→TargetSelect→Animation, undo, enemy turns |

## Test Files (`src/combat/__tests__/`)

| File | Tests | Coverage |
|---|---|---|
| `helpers.ts` | — | Test factories: makeUnit, makeWeapon, makeTerrain, makeGridMap, makeSkill |
| `damageCalculator.test.ts` | 21 | Physical/magical damage, terrain defense, height advantage, effectiveness (3×), forge, crit multiplier, edge cases |
| `hitCalculator.test.ts` | 23 | Hit rate formula, terrain evasion, height bonus/penalty, support bonuses, weapon triangle hit, forge hit, clamping |
| `critCalculator.test.ts` | 12 | Crit formula, class bonuses (Berserker+10, Assassin+15, Sniper+10, Thief+5), forge crit, clamping |
| `weaponTriangle.test.ts` | 25 | All physical triangle matchups, magic triangle matchups, Dark↔Light mutual, neutral cases, non-triangle weapons |
| `expCalculator.test.ts` | 14 | Level difference scaling, kill bonus, damage fraction, clamping (1–100), zero damage, same level |
| `victoryConditions.test.ts` | 25 | All 5 victory types, all 4 defeat types, edge cases, multiple conditions |
| `battleForecast.test.ts` | 12 | Damage preview, double detection, counter detection, support/height/triangle in forecast |
| `combatResolution.test.ts` | 14 | Full combat rounds, counter-attacks, double attacks, HP tracking, EXP gains, deterministic RNG |
| `skillExecution.test.ts` | 15 | Damage/healing skills, SP deduction, buffs/debuffs, status effects, AoE, insufficient SP |
| `combatStateMachine.test.ts` | 29 | All state transitions, undo stack, enemy turn flow, terminal states, invalid transitions |
| `combatLog.test.ts` | 16 | Log entry formatting, all log types, timestamp, phase support |
| **Total** | **206** | |

## Key Design Decisions

- **Deterministic RNG**: Linear congruential generator with `setRngSeed()` for test reproducibility.
- **Height advantage**: Applied in `calculateDamageWithHeight()` (takes both terrains); the `ICombatEngine.calculateDamage()` interface method takes only defender terrain per the type contract.
- **Combat resolution order**: Attacker → Defender counter → Attacker double → Defender double counter.
- **Forge bonuses**: Accessed via optional chaining on weapon data; callers merge `ItemInstance.forgeBonuses` onto `WeaponData` before passing.
- **Immutable patterns**: All functions return new objects rather than mutating inputs.
