---
name: r3f-scene-architect
description: "Structure and review react-three-fiber scenes. Use when designing a new R3F scene graph, refactoring one that has grown messy, deciding where state and update logic live, fixing a per-frame loop that stutters or leaks, choosing between many useFrame hooks vs one batched loop, introducing instancing or object pooling, or auditing a scene for disposal and update-order problems. Use before adding effects or visual polish — architecture first, then graphics."
---

# r3f-scene-architect

## Purpose

Own the *shape* of a react-three-fiber scene: how the component tree maps to the Three.js
scene graph, what runs each frame and in what order, how repeated objects are drawn, and how
GPU resources are created and released. A scene that is architected well stays at frame budget
as it grows and does not leak across mounts. This skill is the spine the other r3f skills build
on — settle structure before reaching for materials, lights, or post-processing.

## Use when

- Starting a new scene and deciding the component/module boundaries.
- A scene has accreted dozens of `useFrame` hooks, prop-drilled refs, or ad-hoc state.
- Frame time is uneven and you suspect the update loop, not the GPU.
- Many similar meshes exist (nodes, particles, tiles) without instancing or pooling.
- Objects, geometries, materials, or textures may not be disposed on unmount/scene change.
- You are about to add effects and want the foundation checked first.

## Workflow

1. **Load the references before judging anything.** Read, in this order:
   - `references/r3f-idioms.md` — the R3F mental model and the load-bearing hooks.
   - `references/update-order.md` — the per-frame execution order and how to enforce it.
   - `references/instancing-and-dispose.md` — repeated geometry and resource lifecycle.
2. **Map the real scene before proposing changes.** Identify the `<Canvas>`, the top-level
   scene components, every `useFrame` (count them and note priorities), where simulation state
   lives, and which objects are created at runtime. Do not generalize from the file tree — open
   the hot files and read the loops.
3. **Run `references/checklists/scene-architecture-review.md`** against what you found. Record a
   verdict per item with the file/line evidence that earned it.
4. **Propose changes smallest-blast-radius first.** Prefer a batched loop over rewriting
   components; prefer instancing an existing mesh over a new abstraction. Do not invent layers
   the scene does not yet need.
5. **Apply one concrete fix and verify it.** Pick the highest-value finding, make the change,
   and confirm the scene still mounts and the loop still runs (hand off measurement to
   `r3f-debug-profiler` if frame numbers are in question). An architecture review that ships zero
   applied, verified changes has not done its job.

## Common failure modes

- **Per-component `useFrame` sprawl.** Fifty hooks each reading the clock is fifty React-fiber
  callbacks and fifty closures per frame. Batch like-kind animation into one loop driving refs.
- **State that lives in React for things that change every frame.** `setState` in `useFrame`
  re-renders the tree 60×/s. Frame-rate values belong in refs and direct mutation, not state.
- **New meshes per frame or per item.** Cloning geometry/material per node multiplies draw calls
  and GPU memory. Share immutable resources; instance the repeated ones.
- **No disposal.** Geometries, materials, textures, and render targets created imperatively
  outlive the component unless disposed. Mounting/unmounting the scene then leaks.
- **Update order left to mount order.** Camera that reads a body's position must run *after* the
  body moved this frame. Use `useFrame` priorities or a single ordered loop, not luck.
- **Abstraction before need.** An ECS, an event bus, or a system registry added before the
  mechanics demand it is cost without payoff. Earn each layer.

## Final response

Report back, in this order:

1. **References loaded** — which of the three you read (all are required before a verdict).
2. **Scene map** — `<Canvas>` location, top-level components, `useFrame` count and priorities,
   where frame-state lives, runtime-created objects. With file/line evidence.
3. **Checklist outcome** — each review item with pass/fail/n-a and the evidence.
4. **Findings, ranked** — highest blast-radius first; each names the file, the problem, and the
   smallest fix.
5. **Applied change** — what you actually changed and how you confirmed the scene still runs.
6. **Remaining risks / handoffs** — what you deferred and which skill should pick it up
   (`r3f-debug-profiler` for measurement, `r3f-graphics-builder` for visual quality).
