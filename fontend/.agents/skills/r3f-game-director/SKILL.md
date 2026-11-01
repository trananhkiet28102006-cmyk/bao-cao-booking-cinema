---
name: r3f-game-director
description: "Orchestrate a multi-stage react-three-fiber build or overhaul. Use as the entry point when a scene needs more than one kind of work — architecture plus visuals plus performance plus QA — and the phases must run in a sensible order with the work staying accountable. Use when you want a single skill to sequence the others, decide which phases apply, delegate them, and report what was actually done versus skipped. Not for a single narrow task — call the specific skill directly for that."
---

# r3f-game-director

## Purpose

Sequence a react-three-fiber effort across phases and keep it honest. The director does not do
the architecture, the graphics, or the profiling itself — it decides *which* phases apply, *in
what order*, reads the relevant sibling skills into context, hands each phase to a focused
worker, and maintains ledgers so that at the end you can see exactly what ran, what loaded, and
what was skipped and why. It exists for jobs big enough that doing them ad hoc loses track of
coverage.

## The one rule that shapes everything: a skill cannot invoke another skill

Under this agent model, a skill has **no ability to call another skill**. There is no
`run_skill()`. So the director cannot "invoke" `r3f-scene-architect`. What it can actually do is
exactly two things, and the whole design follows from them:

1. **Load** a sibling skill's `SKILL.md` (and the references it points to) into context by
   reading the files, then act on that guidance directly. The skill's content informs the
   director; it is not executed as a separate unit.
2. **Delegate** a phase to a subagent/Task worker — when such a tool is available — handing that
   worker the phase's `SKILL.md` and required references as explicit reading. The worker does the
   phase with the skill loaded; its report comes back to the director.

Because "invoke" is impossible, the ledger distinguishes three honest states and the director
must never blur them:

- **loaded** — the sibling `SKILL.md`/references were read into context here.
- **delegated** — a subagent was dispatched to run the phase with the skill loaded.
- **executed** — the phase's actual work happened (by the director acting on loaded guidance, or
  by the returned subagent) and produced evidence.

Writing "invoked r3f-graphics-builder" is a lie this model cannot make true. Say *loaded* or
*delegated*, and track *executed* separately with its evidence.

## Finding sibling skills

The director needs to read its siblings' `SKILL.md`. Resolve their location by trying, in order,
until one exists:

1. A sibling folder next to this skill (same parent dir as `r3f-game-director/`).
2. `~/.claude/skills/<skill-name>/SKILL.md` (the standard install target).
3. The path the user names, if they point at a working checkout.

Record which path resolved in the provenance ledger. If a needed sibling is a stub (declares
itself incomplete) or missing, the director does not fake the phase — it records the gap and
either does a reduced version from first principles or hands the phase back to the user.

## Workflow

1. **Load the orchestration references first:**
   - `references/phase-map.md` — the canonical phases, their order, dependencies, and which
     sibling skill owns each.
   - `references/orchestration-ledgers.md` — the four ledgers and the phase-entry reference gate.
2. **Scope the job.** Decide which phases this effort actually needs. Not every job needs every
   phase; a polish pass may be graphics + QA only. Record the chosen phase set and why.
3. **For each phase, in dependency order:**
   a. **Reference gate** — load the owning skill's `SKILL.md` and its required references *before*
      the phase may start. A phase cannot move to `running` until its references are `loaded`.
   b. **Execute** — either delegate to a subagent (preferred when the tool exists; hand it the
      loaded skill + references explicitly), or do the phase directly from the loaded guidance.
   c. **Record** — update the phase ledger to `done`/`skipped` with the evidence (what changed,
      what was measured, screenshots, files touched).
4. **Respect dependencies.** Architecture precedes graphics; graphics precedes a final QA pass;
   profiling can run after any change that could move the frame budget. The phase map encodes
   this — don't reorder for convenience.
5. **Always run the retrospective (phase 6).** After the gameplay phases, load `r3f-skill-smith`
   and run it over this job's signal — findings the checklists caught, ones they missed, near
   false-positives, and any rule you verified against source. It journals every lesson and
   *proposes* (gated) promotions back into the relevant skills. This is the loop that makes the
   suite self-improving; it runs even on a one-phase job (at worst it journals "nothing new").
6. **Close with the ledgers.** The final response *is* the four ledgers plus the consolidated
   evidence, with the retrospective's journaled lessons and proposed promotions attached.
   Coverage is a fact you report, not a vibe.

## Common failure modes

- **Claiming invocation.** Saying a sibling skill was "invoked/called/run" when it was only read.
  Use loaded/delegated/executed.
- **Skipping the reference gate.** Starting a phase before its skill's references are loaded, so
  the phase is done from memory and misses the checklist that was the point.
- **Phantom coverage.** Marking a phase done with no evidence. `done` requires an artifact.
- **Running every phase regardless.** The director's job includes deciding a phase is `n-a` and
  saying so — not performing busywork to fill the map.
- **Losing the thread across delegation.** Dispatching subagents and not folding their evidence
  back into the ledgers, so the final report is thinner than the work done.

## Final response

Emit all four ledgers (see `references/orchestration-ledgers.md` for their exact shape — the
provenance / gate / phase / risk tables):

1. **Provenance ledger** — per sibling: loaded? delegated? resolved path / reason.
2. **Gate ledger** — per phase: which references were required and loaded before it ran.
3. **Phase ledger** — per phase: `done`/`skipped`/`n-a` + evidence (files, measurements, shots).
4. **Risk ledger** — what's unverified, deferred, or owed, and which skill should pick it up.

Then a short plain-language summary of what the scene gained and what remains.
