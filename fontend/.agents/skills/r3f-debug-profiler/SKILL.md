---
name: r3f-debug-profiler
description: "Diagnose and measure a react-three-fiber scene — blank/black canvas triage, resize and mobile bugs, and measured FPS, draw calls, triangles, memory, and leaks via gl.info. Use when a scene is broken, stutters, or needs a frame budget proven rather than guessed. STUB: the diagnostics harness and runbooks are not authored yet."
---

# r3f-debug-profiler  ·  STUB

## State

This skill is **a stub**. The seam is defined; the harness and checklists are not written yet. Do
not present its output as a completed profiling phase. If you must measure now, read `gl.info`
directly from a `useFrame` and report the raw numbers, and note in the director's risk ledger that
this skill was unbuilt.

## Intended purpose

Make scene problems *measured*, not guessed. Two halves:

1. **Correctness triage** — a runbook for the blank/black canvas (first console error, render loop
   running, canvas drawing-buffer size vs CSS size, camera framing/near-far, lights/material side,
   asset URLs/CORS) and for resize/mobile/DPR bugs.
2. **Performance profiling** — a self-reporting **diagnostics global** populated from a `useFrame`
   hook (`gl.info.render.calls/triangles`, `gl.info.memory.geometries/textures`, frame time,
   canvas size/DPR) so an out-of-process script can read the scene's vitals, plus a headless
   **canvas inspector** that screenshots the `<canvas>`, proves it isn't blank by pixel variance,
   captures console/page errors, and waits for real frame progress before asserting.

## Intended references / scripts (to author)

- `references/checklists/scene-debugging.md` — the black-canvas runbook.
- `references/checklists/performance-profile.md` — the measurement recipe and what to capture.
- `scripts/inspect-r3f-canvas.mjs` — headless Chromium canvas-pixel + diagnostics-global reader.
- A `useFrame` diagnostics-publisher snippet writing `window.__R3F_DIAGNOSTICS__`.

## Dependency

Can run after any frame-budget-moving change (it is "measure now," not a single slot). Pairs with
`r3f-scene-architect` (leak/draw-call findings) and `r3f-graphics-builder` (perf-safe detail).
