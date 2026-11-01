# Instancing and disposal — repeated objects and resource lifecycle

Two questions decide whether a scene scales: *do repeated objects share draw calls?* and *does
everything created get released?* They are the difference between a scene that holds 60fps with
500 nodes and one that drops frames at 50 and climbs in memory every time you remount.

## Repeated objects: instance, merge, or pool

If the scene draws many of the same geometry, do not render N separate meshes.

- **`InstancedMesh` / drei `<Instances>`+`<Instance>`** — one geometry, one material, one draw
  call, N transforms in an instance matrix buffer. Use for hundreds-to-thousands of identical
  shapes that differ only by position/rotation/scale (and optionally per-instance color via
  `instanceColor`). Update transforms by writing the instance matrix and setting
  `instanceMatrix.needsUpdate = true` — not by re-creating instances.

  ```tsx
  <Instances limit={1000}>
    <icosahedronGeometry args={[0.4, 0]} />
    <meshStandardMaterial />
    {items.map((it) => <Instance key={it.id} position={it.pos} color={it.color} />)}
  </Instances>
  ```

- **drei `<Merged>` / `BufferGeometryUtils.mergeGeometries`** — bake many *static* meshes into
  one geometry. Best when the objects never move independently (terrain detail, fixed props).
  No per-object transform after merge.

- **Object pooling** — for things that spawn and die (projectiles, particles, completion
  bursts), allocate a fixed pool once and recycle. Never `new` per spawn in the hot path.

- **drei `<Detailed>` (LOD)** — swap geometry by camera distance so far objects are cheap.

When you have many *similar but not identical* objects (your mission nodes, say), the win is
still there: share the geometry and material across them via `useMemo`/module constants even if
each is its own `<mesh>`, and batch their animation into one loop (see below). Identical → instance;
similar → share resources + batch.

## Batch like-kind animation into one loop

N objects each with their own `useFrame` is N fiber callbacks per frame. Replace them with one
animator component that holds refs to all of them and drives them in a single `useFrame`:

```tsx
function NodesAnimator({ nodeRefs }) {
  useFrame((state) => {
    const t = state.clock.elapsedTime
    for (let i = 0; i < nodeRefs.current.length; i++) {
      const m = nodeRefs.current[i]
      if (!m) continue
      m.position.y = baseY[i] + Math.sin(t * 1.5 + i) * 0.1   // bob
      m.rotation.y = t * 0.3                                   // spin
    }
  })
  return null
}
```

One closure, one loop, cache-friendly iteration. The individual node components render their
geometry and register a ref; they do not each run the clock.

## Shared, immutable resources

Geometries and materials that don't vary should be created **once** and shared, not rebuilt per
component render or per item:

- Hoist to module scope, or build in a `useMemo([])` at a stable parent, and pass down.
- A material reused across 200 nodes is one GPU program upload; 200 fresh materials is 200.
- Beware: sharing a material means shared uniforms — if you need per-object color, use
  `instanceColor`, vertex colors, or `material.clone()` *deliberately* (and then dispose each).

## Disposal: what the reconciler does and does not free

R3F's auto-disposal is narrower than "declarative." It only disposes resources mounted as
**JSX children** — the ones it tracks in the parent's internal child list. Verified in the v8
removal path (`@react-three/fiber` `events-*.cjs.dev.js`): on unmount it computes
`shouldDispose = !isPrimitive && …` and then recurses only over the object's tracked child
instances and its Object3D children. Two consequences that catch people:

- **A resource bound via a *prop* is not a tracked child.** `<mesh geometry={geo}>`,
  `material={mat}`, and `<meshBasicMaterial map={tex}>` set the value imperatively via
  `applyProps`; R3F never registers `geo`/`mat`/`tex` as a child, so it never disposes them. Only
  the JSX-*child* form `<mesh><boxGeometry/></mesh>` is auto-disposed.
- **`<primitive object={…}>` is never disposed at all** — R3F explicitly skips primitives because
  their lifetime may be owned outside React. The geometry and material *inside* that object leak
  unless you dispose them.

So `<mesh><boxGeometry/><meshStandardMaterial/></mesh>` is safe; `<mesh geometry={useMemo(…)}/>`
and `<primitive object={buildThing()}/>` are **not** — those you own.

You **must dispose yourself** anything you created imperatively or that R3F can't see:

- Geometries/materials built in `useMemo`/`useEffect` and attached imperatively.
- **Textures** and loaded assets you no longer use (`texture.dispose()`).
- **Render targets** (`WebGLRenderTarget`), and effect/composer resources.
- Anything from `useLoader` that you swap out (drei's `useGLTF.preload`/cache has its own rules).

The pattern is an effect cleanup keyed to the resource:

```tsx
const target = useMemo(() => new THREE.WebGLRenderTarget(1024, 1024), [])
useEffect(() => () => target.dispose(), [target])
```

To set `dispose={null}` on a JSX object is to *opt out* of auto-disposal — only do that for a
resource you intentionally cache and reuse across mounts, and then dispose it when the cache dies.

## How to catch leaks

- `gl.info.memory.geometries` / `gl.info.memory.textures` should be **flat** across repeated
  mount/unmount of the scene. A monotonic climb is a leak — find the imperative resource without
  a cleanup. (Measurement lives in `r3f-debug-profiler`.)
- `gl.info.render.calls` should not scale 1:1 with item count once instancing is in place. If it
  does, the instancing isn't actually batching (often a per-item material breaking the batch).
