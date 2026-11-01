---
name: r3f-ui-designer
description: "Design HUDs and overlays for a react-three-fiber scene — HTML-over-canvas UI, readability against a moving 3D background, responsive fit, safe areas, and input latency. Use when the scene needs menus, status, or overlays that stay legible and responsive without stealing input from the canvas. STUB: the readability and responsive checklists are not authored yet."
---

# r3f-ui-designer  ·  STUB

## State

This skill is **a stub**. The seam is defined; the checklists are not written yet. Do not present
its output as a completed UI phase; if UI work is needed now, do it from first principles and note
the gap in the director's risk ledger.

## Intended purpose

Own the UI layer that sits over the canvas (HTML overlay, or drei `<Html>` for in-scene labels):
readable over bright/dark/moving backgrounds, responsive to viewport and DPR, respectful of mobile
safe areas, and never delaying canvas input. The bar will be that critical state changes have at
least two feedback channels (shape/color/motion/sound/text), dynamic values don't reflow layout,
and UI state is driven by the scene's state model rather than duplicating simulation rules.

## Intended references (to author)

- `references/checklists/hud-readability.md` — contrast over moving backgrounds, stable containers,
  focal-area avoidance, multi-channel feedback.
- `references/checklists/responsive-ui-fit.md` — safe areas, no clip/overflow, stable hit targets,
  canvas-resize/HUD-sync, touch-vs-scroll.

## Dependency

Proceeds in parallel with `r3f-graphics-builder` once structure is sound. When authored, this
header becomes a full skill per the r3f-scene-architect template.
