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

## Google Sign-In And Cloud Progress

Progress stays in the browser until the user chooses **Sign in with Google**.
After sign-in, the app stores one private progress record for that Google
account and keeps it synchronized across devices. Google is the only configured
sign-in option.

### Setup

1. Create a [Supabase project](https://supabase.com/dashboard) and open its SQL Editor.
2. Run the contents of [`supabase/progress.sql`](supabase/progress.sql). This creates the progress table and row-level security policies, so users can only access their own progress.
3. In Supabase, open **Authentication > Providers > Google**, enable Google, and add the OAuth client ID and client secret created in Google Cloud.
4. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an OAuth 2.0 Web application. Add the Supabase callback URL shown in the Google provider screen, usually `https://<project-ref>.supabase.co/auth/v1/callback`, as an authorized redirect URI.
5. In Supabase, open **Authentication > URL Configuration** and add `http://localhost:3000` to Redirect URLs. Add `http://localhost:3001` too when using the current local server, plus the production URL when deployed.
6. Copy `.env.example` to `.env.local`, then fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from **Project Settings > API**. Do not use the service-role key in the browser.
7. Restart `npm run dev`. The Google sign-in control appears in the app header when both variables are present.

Vercel's Supabase integration supplies `SUPABASE_URL` and
`SUPABASE_PUBLISHABLE_KEY` automatically. The Next.js build maps those values
to the browser-safe variables used by this app. `SUPABASE_SECRET_KEY` is never
exposed to the browser.

On the first sign-in, the newer of browser and cloud progress is retained. The
signed-in header then indicates whether the latest change has been saved.

## Notes

- Legacy browser progress is migrated from the old localStorage keys on first load.
- `AGENTS.md` is the Codex implementation guide for this repo.
- `CLAUDE.md` remains the product/context brief during the migration.
