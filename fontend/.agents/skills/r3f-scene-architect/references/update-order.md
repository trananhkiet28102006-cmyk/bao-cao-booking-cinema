# Update order — what runs each frame, and in what sequence

A frame is not "everything moves at once." It is an ordered pipeline, and getting the order
wrong produces a class of bugs that look like jitter, one-frame lag, or a camera that always
trails its target by exactly one frame. In R3F you have less explicit control of the loop than
in vanilla Three.js, so you enforce order deliberately.

## The canonical order

```
input  ->  fixed-step simulation  ->  gameplay/scene logic  ->  animation & VFX  ->  camera  ->  UI bridge  ->  render
```

Read it as a dependency chain: each stage consumes the results of the one before it *this same
frame*. The camera frames where bodies actually are now; VFX reacts to events logic just
produced; the UI bridge reflects state after it settled. Violate the chain and a consumer reads
last frame's value.

## How R3F orders `useFrame`

`useFrame(cb, priority)` callbacks run in **ascending priority** order. Two rules to remember:

1. With all priorities at the default `0`, callbacks run in **mount order** — fragile, because
   it depends on tree structure. Do not rely on it for cross-component dependencies.
2. The instant **any** callback has priority `> 0`, R3F stops auto-rendering and assumes *you*
   render. You must add a render call yourself (typically the highest-priority callback:
   `gl.render(scene, camera)`), or use an `<EffectComposer>` which takes over rendering.

So there are two clean strategies:

- **Priorities as stages.** Assign bands: input `1`, simulation `2`, logic `3`, animation `4`,
  camera `5`, and a final `100` that renders. Explicit and self-documenting, but you now own the
  render call and must keep the render at the end.
- **One ordered loop.** A single `useFrame` that calls stage functions in order and lets R3F
  render (keep everything at priority 0, or render yourself). Fewer moving parts; the order is
  literally the lines of the function. This is the simplest correct option for most scenes.

## Frame-rate independence

Drive every motion by `delta`. `position.x += speed * delta`, not `+= speed`. For simulation
that must be deterministic or stable under variable frame rate (physics, anything integrated),
use a **fixed-step accumulator**:

```ts
const STEP = 1 / 60
let acc = 0
useFrame((_, delta) => {
  acc += Math.min(delta, 0.25)   // clamp to avoid spiral-of-death after a stall
  while (acc >= STEP) { simulate(STEP); acc -= STEP }
  // render/interpolation reads the latest simulated state
})
```

The clamp matters: after a tab is backgrounded, `delta` can be huge; without the clamp the
while-loop tries to catch up across thousands of steps and locks the frame.

## Camera comes after the thing it follows

A follow/orbit camera that reads a moving target must update *after* the target moved this
frame. If the camera is a higher-or-equal-priority `useFrame` than the body, it reads the body's
*previous* position and visibly lags by one frame. Give the camera a later stage, or update it
at the tail of the single ordered loop.

## Don't do these in the loop

- `setState` / context writes — re-renders the tree every frame.
- Allocations — `new Vector3()`, array literals, object literals churn the garbage collector.
  Hoist scratch vectors to module or ref scope and reuse them.
- Heavy reads — `getComputedStyle`, layout-thrashing DOM reads. Bridge UI through refs or a
  throttled effect, not per-frame.

## Quick diagnosis

- "Camera lags the target by one frame" → camera updates before/with the target. Reorder.
- "Nothing renders after I added a `useFrame`" → a priority went `> 0`; you must render yourself.
- "Motion is faster on a 144Hz screen" → motion isn't multiplied by `delta`.
- "Stutter only after backgrounding the tab" → unclamped accumulator or a huge first `delta`.
