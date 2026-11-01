# Orchestration ledgers

The director's accountability is four small tables. They exist so coverage is a fact you can
point at, not a feeling. Keep them as you go — reconstructing them at the end loses the evidence.

## The phase-entry reference gate

A phase may not move from `pending` to `running` until the references its owning skill marks
**required** are loaded. References are not optional enrichment — they carry the checklist that
*is* the phase. The reference ledger is the proof the gate was honored.

If a required reference can't be found, the phase doesn't silently proceed from memory: record
the miss in the risk ledger and either resolve the path or hand the phase back.

## Ledger 1 — Provenance

Per sibling skill the job touches. Captures the loaded-vs-delegated honesty distinction.

| skill | needed? | resolved path | loaded? | delegated? |
| ----- | ------- | ------------- | ------- | ---------- |
| r3f-scene-architect | yes | ~/.claude/skills/r3f-scene-architect | yes | subagent X |
| r3f-graphics-builder | yes | (stub) | yes | no |

- **loaded** = its `SKILL.md`/references were read into this context.
- **delegated** = a subagent was dispatched to run the phase with the skill loaded.
- Never write "invoked." A skill cannot call a skill in this model.

## Ledger 2 — Gate (the reference gate's receipt)

Per phase, the required references and whether they loaded before the phase ran.

| phase | required references | loaded before run? |
| ----- | ------------------- | ------------------ |
| Architecture | r3f-idioms, update-order, instancing-and-dispose, scene-architecture-review | yes |
| Graphics | visual-scorecard, material-lighting-quality | partial (stub) |

## Ledger 3 — Phase

The execution record. `done` requires evidence — an artifact, a measurement, a screenshot, a
diff. No evidence, not `done`.

| phase | status | evidence |
| ----- | ------ | -------- |
| Architecture | done | reordered camera loop in Scene.tsx:120; useFrame count 41→1 animator; scene mounts, loop runs |
| Graphics | skipped | n-a this pass — visuals already at bar |
| Profiling | done | gl.info.render.calls 380→120 after instancing; 60fps held |

Statuses: `pending` / `running` / `done` / `skipped` / `n-a`. `skipped` and `n-a` both need a
one-line reason.

## Ledger 4 — Risk

What is not certain. Carries deferrals, stub gaps, and unverified claims to whoever picks them up.

| item | severity | owed to |
| ---- | -------- | ------- |
| Graphics phase done from first principles; r3f-graphics-builder still a stub | medium | r3f-graphics-builder |
| Memory-leak suspicion on texture swap not yet measured | high | r3f-debug-profiler |

## Why this shape

Each ledger answers a question someone will ask at the end: *Did you actually use the skills?*
(1) *Did you follow their checklists or wing it?* (2) *What got done, with proof?* (3) *What's
still risky?* (4). Four tables, four answers, no hand-waving.
