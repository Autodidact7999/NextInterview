# NextInterview

Unified interview prep workspace built with Next.js App Router and TypeScript.

## What This App Contains

- `/` dashboard for today view, quick navigation, and progress summary
- `/roadmap` for the 12-week DSA and System Design plan
- `/practice` for the 84-day schedule, solution recall panels, and start-date driven pacing
- `/reference` for the Java DSA toolkit, quick reference tables, traps, and the interactive mind map
- `/progress` for roadmap tracker logging and overall momentum

## Project Shape

- `src/app` route entrypoints
- `src/components` reusable UI and route views
- `src/content` typed content modules migrated from the legacy HTML files
- `src/lib` shared types, storage, date math, and route helpers
- `scripts/extract-legacy-content.mjs` one-off extractor used to turn legacy inline data into typed modules

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run test
npm run format:check
```

## Notes

- Legacy browser progress is migrated from the old localStorage keys on first load.
- `AGENTS.md` is the Codex implementation guide for this repo.
- `CLAUDE.md` remains the product/context brief during the migration.
