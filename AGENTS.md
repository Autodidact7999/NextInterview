# NextInterview Codex Guide

## Purpose

- This repo is the framework migration of Harsh's interview-prep workspace.
- The product goal is a calm, high-clarity study app for DSA and System Design preparation.
- The current app replaces two standalone HTML files with one typed Next.js application.

## Stack And Structure

- Use `Next.js` App Router with `TypeScript`.
- Keep source under `src/`.
- Put static content and schedule data under `src/content`.
- Put reusable logic under `src/lib`.
- Put reusable UI in `src/components`.
- Treat the legacy HTML files as reference material only. Do not add new features there.

## TypeScript Standards

- Stay in strict TypeScript.
- Prefer explicit domain types from `src/lib/types.ts`.
- Keep parsing, derived state, and storage helpers typed end to end.
- Avoid `any`. If a boundary is loose, narrow it immediately.

## Component Rules

- Prefer small, composable components over large monoliths.
- Keep routing concerns, storage concerns, and presentation concerns separated.
- Do not read `localStorage` directly inside UI components.
- Put browser persistence behind the shared storage adapter in `src/lib/progress`.

## Styling Rules

- Reuse the shared design tokens in `src/app/globals.css`.
- Prefer semantic class names and consistent surface patterns.
- Avoid inline styles unless the value is truly data-driven, like a progress width or imported accent color.
- Preserve the current visual identity: soft cards, strong hierarchy, clear spacing, and dark-mode support.

## Accessibility And UX

- Keyboard interactions must work for navigation and custom interactive widgets.
- Use semantic HTML first.
- Keep contrast strong enough in both light and dark themes.
- Make mobile behavior intentional, not a compressed desktop layout.

## Content Rules

- Keep content data separate from render logic.
- When migrating legacy content, prefer generated or typed modules over embedding big strings into components.
- Preserve meaningful legacy behavior before inventing new structure.

## Testing Expectations

- Add or update unit tests for business logic and storage migration.
- Add component coverage for interactive UI like accordions, settings modal, tracker, and mind map behavior.
- Add or update Playwright coverage for major route flows and persistence.

## Definition Of Done

- Build, lint, typecheck, unit tests, and e2e tests pass.
- All meaningful legacy content is reachable in the framework app.
- Legacy progress migrates into the new storage model.
- No route component directly touches browser storage.
- New work keeps the app coherent on both desktop and mobile.

## Next.js Note

- This repo uses a modern Next.js version. When behavior seems uncertain, prefer checking the local package behavior and current project conventions before assuming older App Router semantics.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
