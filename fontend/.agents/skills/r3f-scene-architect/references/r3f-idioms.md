# R3F idioms — the mental model

react-three-fiber renders a Three.js scene graph from a React component tree. JSX elements
are Three.js objects; props are constructor args and settable properties; the React
reconciler diffs them. Internalize a few load-bearing facts and most architecture decisions
fall out of them.

## The four hooks that matter

- **`useThree()`** — reach into the renderer store: `gl` (the WebGLRenderer), `scene`,
  `camera`, `size`, `viewport`, `clock`, `invalidate`. Read these; rarely write them. Selecting
  a slice (`useThree((s) => s.camera)`) avoids re-rendering on unrelated store changes.
- **`useFrame((state, delta) => …, priority?)`** — the render loop. Runs every frame *before*
  the render (or replaces it when any priority > 0 exists — see `update-order.md`). `delta` is
  seconds since last frame; multiply motion by it so speed is frame-rate independent. The
  callback must not allocate or `setState`.
- **`useLoader(Loader, url)`** — suspense-based asset loading; cached by URL. Wrap consumers in
  `<Suspense>`. For GLTF prefer drei's `useGLTF` (adds draco/meshopt and preload).
- **`useRef`** — the bridge between React and the imperative object. Frame-rate mutation goes
  through refs (`ref.current.position.x = …`), never through state.

## State belongs in two different places

Split state by *change frequency*, not by type:

- **React state / context** — things that change on user-scale events: selection, which panel
  is open, loaded data, status. Re-rendering the tree for these is fine and correct.
- **Refs and plain objects** — things that change every frame: positions, rotations, phases,
  velocities, interpolation targets. Mutate them in `useFrame`. The tree does not re-render;
  Three.js reads the mutated objects at draw time.

The single most common R3F performance mistake is putting frame-rate values in `useState` and
calling the setter inside `useFrame`. That schedules a full reconcile 60 times a second.

## Declarative graph, imperative escape hatch

Prefer JSX for the scene graph — it is diffable, readable, and disposes children on unmount.
Drop to imperative Three.js (constructing geometries/materials in a `useMemo`, calling
`.dispose()`, building `BufferAttribute`s) only when JSX cannot express it: procedural
geometry, custom buffer attributes, instanced transforms. When you do, you own the lifecycle
(see `instancing-and-dispose.md`).

```tsx
// Declarative: reconciler owns lifecycle.
<mesh position={[0, 1, 0]}>
  <boxGeometry args={[1, 1, 1]} />
  <meshStandardMaterial color="#e1a824" />
</mesh>

// Imperative escape hatch: you own disposal.
const geo = useMemo(() => buildProceduralGeometry(seed), [seed])
useEffect(() => () => geo.dispose(), [geo])
```

## Memoize what is expensive to build

Geometries, materials, typed-array attributes, gradients, and shader uniforms should be built
in `useMemo` keyed on their real inputs — not rebuilt every render. A material recreated each
render thrashes the GPU and breaks `===` identity that R3F relies on for diffing.

## Drei is the standard library

`@react-three/drei` carries the batteries: `<OrbitControls>`/`<MapControls>`, `<Instances>`/
`<Instance>`, `<Billboard>`, `<Text>`, `<Html>`, `<Environment>`, `<PerformanceMonitor>`,
`<AdaptiveDpr>`, `<Detailed>` (LOD), `<Merged>`. Reach for these before hand-rolling. They are
maintained, disposal-correct, and composable.

## Postprocessing is its own tree

`@react-three/postprocessing` replaces the default render with an `<EffectComposer>` pass
chain. It interacts with tone mapping and selective effects (bloom layers). Treat it as a
final-stage concern owned by the graphics pass, not something to sprinkle mid-scene.

## What "good architecture" buys you here

When frame-state is in refs, like-kind animation is batched, repeated meshes are instanced, and
imperative resources are disposed, the scene scales: adding nodes adds instances not draw calls,
adding animation adds work to one loop not new hooks, and remounting does not leak. Every later
visual or perf gain compounds on that base. Get it wrong and every effect you add makes the
hole deeper.
