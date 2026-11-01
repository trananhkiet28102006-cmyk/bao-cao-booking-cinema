# Phase map

The phases a react-three-fiber effort can move through, their dependency order, and the sibling
skill that owns each. The director picks the subset a given job needs — not every job runs every
phase — but when two chosen phases have a dependency, that order is fixed.

## The phases

| # | Phase | Owner skill | Status |
| - | ----- | ----------- | ------ |
| 1 | **Architecture** — scene-graph shape, update loop, instancing, disposal | `r3f-scene-architect` | ready |
| 2 | **Graphics** — materials, lighting, silhouette, VFX, the visual-quality bar | `r3f-graphics-builder` | stub |
| 3 | **UI** — HUD/overlays, readability, responsive fit, input latency | `r3f-ui-designer` | stub |
| 4 | **Profiling** — measured FPS, draw calls, triangles, memory, leaks | `r3f-debug-profiler` | stub |
| 5 | **QA / release** — active-play verification, canvas-pixel proof, build gate | `r3f-qa-release` | stub |
| 6 | **Retrospective** — bank what the run taught; promote durable rules into the skills | `r3f-skill-smith` | ready |

"stub" means the owning skill currently declares itself incomplete. The director still loads it
(so it knows the seam and the intended contract), but must not pretend a stub produced full
phase output — record the gap in the risk ledger and either do a reduced version from first
principles or hand the phase back.

## Dependency order

```
            ┌─────────────┐
            │ 1 Architecture │  ← settle structure first; everything compounds on it
            └──────┬────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
 ┌────────────┐        ┌──────────┐
 │ 2 Graphics │        │  3 UI    │   ← can proceed in parallel once structure is sound
 └─────┬──────┘        └────┬─────┘
       └──────────┬─────────┘
                  ▼
          ┌───────────────┐
          │ 4 Profiling   │   ← run after any change that could move the frame budget
          └──────┬────────┘
                 ▼
          ┌───────────────┐
          │ 5 QA / release│   ← last gameplay phase; verifies in a browser
          └──────┬────────┘
                 ▼
          ┌───────────────┐
          │ 6 Retrospective│  ← always-on tail: what did this run teach the skills?
          └───────────────┘
```

Hard rules:

- **Architecture precedes graphics and UI.** Polishing visuals on a loop that re-renders every
  frame, or on un-instanced repeats, bakes in cost you then have to redo. Structure first.
- **Profiling follows any frame-budget-moving change.** It isn't strictly one slot — re-run it
  whenever graphics or architecture changed something that could cost frames. Treat phase 4 as
  "measure now" rather than "measure once."
- **QA is the terminal *gameplay* phase.** The release gate runs last of the build phases, on the
  integrated scene, and is the only phase allowed to certify "verified in a browser."
- **Retrospective is the always-on tail.** Phase 6 runs after every job, even a one-phase one. It
  asks what the run taught the skills and proposes promotions via `r3f-skill-smith` (journal first,
  then gated promotion). This is what makes the suite self-improving rather than static — skipping
  it is how the skills stop getting smarter. It is never `n-a`; at worst it journals "nothing new."

## Choosing the subset

- **New scene from nothing:** 1 → (2 ‖ 3) → 4 → 5 → 6. All phases.
- **Visual polish pass on a sound scene:** 2 → 4 → 5 → 6. Skip 1/3 as `n-a` if structure and UI
  are fine — and *say* they were skipped, with the one-line reason.
- **"It stutters / leaks":** 4 first to localize, then 1 (architecture fix), then 4 again to
  confirm, then 5 → 6. Profiling can lead when the job is diagnostic.
- **"Black canvas / it broke":** 4's scene-debug runbook leads; the rest follow only if the fix
  touched them; 6 still runs.

Phase 6 is on the end of every subset above — the retrospective always runs. Record the chosen
subset and the reason each excluded phase is `n-a` in the phase ledger.
