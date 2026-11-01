---
name: r3f-graphics-builder
description: "Raise the visual quality of a react-three-fiber scene — materials, lighting, silhouettes, VFX, post-processing — and score it against a quality bar so 'it looks basic' becomes a measured, fixable gap. Use after r3f-scene-architect has settled structure, when a scene works but reads as a prototype. STUB: the scoring rubric and checklists are not authored yet."
---

# r3f-graphics-builder  ·  STUB

## State

This skill is **a stub**. The seam is defined; the substance is not written yet. Do not present
its output as a completed graphics phase — if you need a visual pass now, do it from first
principles and record in the director's risk ledger that this skill was unbuilt.

## Intended purpose

Own the production visual pass: turn a structurally sound scene from "obviously a prototype" into
something with intentional art direction. The center of gravity will be a **0–3 visual scorecard**
across visual categories (art direction, hero forms, environment depth, materials, lighting,
VFX/motion, UI integration, performance evidence) with explicit anchors per score and threshold
gates for "premium" vs "showcase."

## Intended references (to author)

- `references/visual-scorecard.md` — the 0–3 rubric, thresholds, and the automatic-failure list.
- `references/checklists/material-lighting-quality.md` — color management, tone mapping, key/fill/
  rim/ambient lighting roles, avoiding flat default materials.
- `references/checklists/silhouette-quality.md` — primary→secondary→tertiary form readability from
  the active camera, before material/post detail.
- `references/checklists/performance-safe-detail.md` — adding fidelity without blowing the budget;
  instancing, shared resources, shadow scoping, DPR caps (pairs with r3f-debug-profiler).

## Dependency

Runs **after** `r3f-scene-architect`. Hands measurement to `r3f-debug-profiler`. When authored,
this header becomes a real `Purpose` / `Use when` / `Workflow` / `Final response` per the
r3f-scene-architect template.
