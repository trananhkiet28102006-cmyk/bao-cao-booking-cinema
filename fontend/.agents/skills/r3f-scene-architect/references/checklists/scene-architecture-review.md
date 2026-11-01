# Scene architecture review

Run this against a real scene with the hot files open — not from the file tree. Each item gets
a verdict (`pass` / `fail` / `n-a`) and **file/line evidence** that earned it. A review with no
evidence is an opinion.

## Update loop

- [ ] **Frame-state lives in refs, not React state.** No `setState`/context write runs inside a
  `useFrame`. Per-frame values (position, rotation, phase) are mutated on refs/objects.
- [ ] **Like-kind animation is batched.** Many similar objects are driven by one animator loop,
  not one `useFrame` per object. Count the `useFrame` hooks; justify each one that isn't batched.
  *Don't flag a lone `useFrame` in a single-instance effect — that's fine.* And don't flag on the
  hook's existence: open the loop and read it. A loop that's already batched (register/unregister),
  a `setState` that's in a pointer handler not the frame, or a `new Vector3()` that's inside a
  `useMemo` are not violations. Judge by instance count and what the loop actually does.
- [ ] **Update order is enforced, not incidental.** Cross-stage dependencies (camera follows a
  body, VFX reacts to logic) use priorities or a single ordered loop — not mount order.
- [ ] **Motion is delta-scaled.** Movement/animation multiplies by `delta`; integrated
  simulation uses a clamped fixed-step accumulator.
- [ ] **The loop doesn't allocate.** No `new Vector3()`/array/object literals per frame in the
  hot path; scratch objects are hoisted and reused.
- [ ] **Render ownership is correct.** If any `useFrame` priority is `> 0` (or an
  `EffectComposer` is present), something explicitly renders; otherwise R3F auto-renders.

## Repeated objects

- [ ] **Identical repeats are instanced.** Many copies of one geometry use `InstancedMesh` /
  `<Instances>` (or are merged if fully static), not N separate meshes.
- [ ] **Similar repeats share resources.** Near-identical objects share geometry/material via
  `useMemo`/module constants instead of each constructing its own.
- [ ] **Spawned/despawned objects are pooled.** Projectiles/particles/bursts recycle from a
  fixed pool; nothing is `new`-ed per spawn in the hot path.
- [ ] **Draw calls don't scale 1:1 with item count** where instancing is claimed (a per-item
  material silently breaks the batch).

## Resource lifecycle

- [ ] **Declarative resources only.** Geometries/materials are expressed in JSX where possible
  so the reconciler disposes them.
- [ ] **Imperative resources have cleanup.** Every `useMemo`/`useEffect`-created geometry,
  material, texture, or render target has a matching `.dispose()` on unmount.
- [ ] **Prop-bound and `<primitive>` resources are disposed by hand.** R3F only auto-disposes
  JSX-*child* resources. Anything passed via a prop (`geometry={geo}`, `material={mat}`,
  `map={tex}`) or mounted as `<primitive object={…}>` is NOT auto-disposed and leaks on
  unmount/dep-change — confirm each has an explicit cleanup. (See `instancing-and-dispose.md`.)
- [ ] **Expensive builds are memoized.** Geometries, materials, attributes, gradients, uniforms
  are built in `useMemo` keyed on real inputs — not rebuilt every render.
- [ ] **`dispose={null}` is intentional.** Any opt-out of auto-disposal is a deliberately cached
  resource with a known owner that disposes it eventually — not an accident.
- [ ] **Memory counters are flat across remount.** `gl.info.memory.{geometries,textures}` do not
  climb when the scene mounts/unmounts repeatedly. (Defer the measurement to r3f-debug-profiler;
  flag the suspect here.)

## Structure & boundaries

- [ ] **Clear module boundaries.** Scene code separates concerns (scene setup, entities/nodes,
  systems/animators, effects, UI bridge) rather than one mega-component.
- [ ] **Data flows down, events flow up.** Children read props/context and emit intents; they
  don't reach across the tree or mutate siblings.
- [ ] **No abstraction ahead of need.** Any ECS/event-bus/registry layer is justified by current
  mechanics, not speculative.
- [ ] **Effects are downstream of structure.** Post-processing and heavy VFX are a final stage,
  not interleaved through scene setup. (Hand visual quality to r3f-graphics-builder.)

## Verdict

Summarize: counts of pass/fail/n-a, the **single highest-blast-radius finding**, and the one fix
you will apply and verify before calling the review done.
