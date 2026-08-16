# Trace problem authoring

Each problem is independently authored from the Java solution already stored in
`src/content/practice.generated.ts`. LeetSharp is research-only: do not copy its
code, frames, prose, styling, assets, schemas, examples, or visual layout.

## Folder boundary

Own exactly one folder named `<four-digit-lc>-<canonical-slug>` with these files:

- `definition.ts` — plain serializable metadata, fields, presets, and unique Java line fragments for semantic anchors.
- `runtime.ts` — Zod parsing, a pure deterministic snapshot generator, and an independent output oracle.
- `runtime.test.ts` — preset checks and roughly 100 bounded `fast-check` cases.

Export the definition and runtime as the default export. The generator also
accepts the named `definition`/`runtime` form for older isolated modules.

Do not edit shared types, packages, routes, styles, or generated registries from a
problem folder. Report a missing capability to the integration owner.

## Trace rules

- Parse raw strings, validate bounds and semantic constraints, then call
  `createTraceRuntime`.
- Emit complete immutable snapshots with stable IDs. Every frame explains the
  state change and invariant and includes at least one scene.
- Reference semantic anchor IDs, not physical source line numbers.
- Finish with exactly one `complete` frame whose `output` equals the run output.
- Include at least one prediction checkpoint and two presets, including an edge
  case. Stay below 500 frames.
- Keep inputs and snapshots plain JSON: no `Map`, `Set`, class instances,
  functions, `NaN`, or circular references.
- The oracle must be structurally independent from the traced algorithm.

After isolated modules land, only the integration owner runs
`npm run trace:generate`. `npm run trace:check` verifies that the tracked static
catalog and client loader map match the problem folders.
