# Isolated problem template

Copy this checklist into a new `<four-digit-lc>-<canonical-slug>` folder. A
problem author owns only the three files in that folder.

## `definition.ts`

Export one `TraceProblemDefinition` as the default export. Include canonical
metadata, bounded fields, at least two presets, visual kinds, and semantic
anchors whose fragments each match exactly one line of the existing Java
solution.

## `runtime.ts`

Define a Zod schema and call `createTraceRuntime({ definition, schema,
parseRaw, trace, oracle })`. The trace function must emit immutable full
snapshots with stable IDs, changes, invariants, variables, scenes, at least one
checkpoint, and one final complete frame. Export the runtime as default.

## `runtime.test.ts`

Run every preset, rejection boundaries, determinism and JSON round-tripping,
then roughly 100 bounded `fast-check` cases against an independently written
oracle. Keep the arbitrary small enough that every generated run remains under
500 frames.

Run the isolated checks before handoff:

```bash
npx vitest run src/content/visualizations/problems/<folder>/runtime.test.ts
npx eslint src/content/visualizations/problems/<folder>
npm run typecheck
```

Only the integration owner runs `npm run trace:generate` after folders land.
