---
name: r3f-qa-release
description: "Verify a react-three-fiber scene in a real browser and gate a production build — active-play screenshots, canvas-pixel proof that the scene isn't blank, console/error cleanliness, and a build/preview check. Use as the final phase before shipping. STUB: the QA runbook and release gate are not authored yet."
---

# r3f-qa-release  ·  STUB

## State

This skill is **a stub**. The seam is defined; the runbooks are not written yet. This is the only
phase allowed to certify "verified in a browser" — until it is authored, do not make that claim;
record in the director's risk ledger that release QA was unbuilt.

## Intended purpose

Be the terminal gate: prove the integrated scene actually works for a user, then prove it builds
and previews clean. QA verification captures active screenshots at desktop and mobile sizes,
proves the canvas isn't blank by pixel variance, drives one real interaction and asserts it had an
effect, and fails on any console/page error. The release gate confirms `build` passes, `preview`
serves the built files with the intended base path, no debug overlays leak, and the production
console is clean.

## Intended references (to author)

- `references/checklists/playtest-qa.md` — play the main loop, edge inputs, pause/restart/resize/
  refocus, audio-unlock-on-gesture, bugs-as-repro-steps.
- `references/checklists/release.md` — build passes, preview runs, asset base path correct, no
  debug panels, clean console, bundle/asset review.

## Dependency

Runs **last**, on the integrated scene. Consumes the diagnostics global and canvas inspector from
`r3f-debug-profiler`. When authored, becomes a full skill per the r3f-scene-architect template.
