# Interview Prep — System Notes for Claude

This file tells Claude everything it needs to know about Harsh's interview prep system so every conversation picks up exactly where the last one left off.

---

## Who this is for

Harsh — 3-year SWE, switching roles, targeting DSA + System Design interviews. Coding in Java. Goal: be interview-ready in 3 months.

---

## Project Architecture

This is a **Next.js 16** app (React 19) with App Router, CSS Modules, and localStorage-based progress tracking. No Tailwind — uses a custom CSS design system.

### Tech stack

- Next.js 16.2.2, React 19.2.4, TypeScript (strict)
- CSS Modules for component styling, `globals.css` for design tokens and shared styles
- Google Fonts: Manrope (body), Space Grotesk (display headings), IBM Plex Mono (code)
- Vitest + Testing Library (unit), Playwright (e2e)
- Path alias: `@/*` → `./src/*`

### File structure

```
src/
├── app/                          # App Router pages + globals.css
│   ├── layout.tsx                # Root layout, fonts, ProgressProvider + AppShell
│   ├── page.tsx                  # Dashboard (/)
│   ├── practice/page.tsx         # 84-day practice plan (/practice)
│   ├── progress/page.tsx         # Progress tracker (/progress)
│   ├── reference/page.tsx        # Reference library (/reference)
│   └── roadmap/page.tsx          # 12-week roadmap (/roadmap)
├── components/
│   ├── dashboard/                # DashboardView + CSS module
│   ├── layout/                   # AppShell (sidebar + mobile nav) + CSS module
│   ├── practice/                 # PracticeView, SettingsModal + CSS module
│   ├── progress/                 # ProgressView
│   ├── reference/                # ReferenceView, MindMap
│   ├── roadmap/                  # RoadmapView
│   └── ui/                       # Shared: AccordionList, CodeBlock, SectionLinks
├── content/                      # All data files (problems, roadmap, reference)
│   ├── practice.generated.ts     # 84-day problem schedule (~2000 lines)
│   ├── reference.generated.ts    # Reference entries (~700 lines)
│   ├── roadmap.generated.ts      # Roadmap week data
│   └── mindmap.ts                # SVG mind map node/edge definitions
└── lib/
    ├── progress/                 # Context, storage, metrics, constants
    ├── routes/                   # URL search param parsers
    ├── types.ts                  # All TypeScript interfaces
    └── utils.ts                  # Date helpers, slug helpers
```

---

## Design System (v2 — Clean & Minimal)

The UI follows a clean, minimal aesthetic inspired by Linear/Notion. No glass morphism, no radial gradients, no backdrop-filter effects.

### Color tokens

```css
/* Light mode */
--bg-canvas: #ffffff;          /* Page background */
--surface: #ffffff;            /* Cards, panels */
--surface-muted: #f5f5f5;     /* Subtle background fills */
--surface-code: #1a1a2e;      /* Code block background */
--text-primary: #111111;       /* Headings, strong text */
--text-secondary: #6b6b6b;    /* Body text, descriptions */
--text-tertiary: #999999;      /* Labels, captions */
--border-subtle: #ebebeb;      /* Card borders */
--border-strong: #d4d4d4;      /* Input borders, hover states */

/* Accent palette */
--purple: #5b5bd6;             /* Primary accent — active states, CTAs */
--green: #1a7f5a;              /* Month 1 / foundations / completion */
--coral: #cd4a2a;              /* Month 3 / hard problems / warnings */
--blue-text: #1a5fa5;          /* Algorithms / BFS/DFS */
--amber-text: #7a4d0b;        /* Heap / PQ / revision */
--lime-text: #3b6d11;         /* Graph / trie */
```

### Design principles

- **Solid backgrounds only** — no rgba overlays, no backdrop-filter
- **Subtle shadows** — `0 1px 3px rgba(0,0,0,0.04)` for soft, `0 4px 12px rgba(0,0,0,0.08)` for strong
- **Tight border radii** — 8px (sm), 12px (md), 16px (lg) — not oversized pill shapes
- **Breathing room** — generous padding between sections, `gap: 0.75rem` in grids
- **Dark mode** via `prefers-color-scheme: dark` — clean dark tones, no warm tints

### CSS class conventions

- `.surface` — basic card container (border + bg + radius)
- `.badge` + `.accent-{color}` — colored pill labels (green, purple, coral, blue, amber, lime)
- `.chip-link` / `.chip-button` — navigation filter buttons
- `.button-primary` / `.button-secondary` — CTAs
- `.stat-card` / `.stat-value` / `.stat-label` — metric display
- `.code-block` / `.code-block-label` — syntax-highlighted code
- `.accordion-item` / `.accordion-trigger` / `.accordion-panel` — expandable sections

---

## The Learning System

### Core philosophy

> Understand the problem → pick the right Java structure → write from memory → handle edge cases.

Most failures come from picking the wrong structure, not forgetting syntax.

### Three loops

1. **Daily** — 2–3 LeetCode problems per weekday, focused on one Java tool. Revision reminders from Day 4 onward.
2. **Weekly** — Saturdays: 3-problem timed mock (90 min). Sundays: re-solve the week's hardest problem.
3. **Spaced** — Problems recur at Day 3, Day 7, Day 21 intervals across the 84-day schedule.

---

## 84-Day Problem Schedule

12 weeks, 7 days each. Weekdays = new problems. Saturday = timed mock. Sunday = review.

| Weeks | Phase              | Java Focus                                                                                        |
| ----- | ------------------ | ------------------------------------------------------------------------------------------------- |
| 1–4   | Foundations (M1)   | int[], String, StringBuilder, HashMap, HashSet, Binary Search, Stack/Deque, Queue, Tree recursion |
| 5–9   | Patterns & SD (M2) | PriorityQueue, Graph adjacency list, DSU/Union Find, Backtracking, DP arrays, TreeMap             |
| 10–12 | Mock & Polish (M3) | All structures, hard variants, timed problem-solving                                              |

---

## App Pages

| Route       | Component        | Purpose                                                            |
| ----------- | ---------------- | ------------------------------------------------------------------ |
| `/`         | DashboardView    | Session board, today's focus, progress metrics, quick links        |
| `/roadmap`  | RoadmapView      | 12-week plan, DSA patterns, SD topics, daily routine, revision     |
| `/practice` | PracticeView     | 84-day problem schedule, per-day cards, solution panels, filtering |
| `/reference`| ReferenceView    | Mind map, quick ref, types, collections, patterns, traps tabs      |
| `/progress` | ProgressView     | 90-day tracker grid, stats, month progress bars                    |

### Reference tabs

Mind Map, Quick Ref, Types & Strings, Collections, Patterns, Traps

---

## localStorage keys

| Key                            | Used in         | Purpose                                    |
| ------------------------------ | --------------- | ------------------------------------------ |
| `next_interview_progress_v1`   | ProgressContext  | Unified progress state (start date, completions, roadmap statuses) |

Legacy keys (`dsa_start_date`, `day_problems_v1`, `prep_v2`) are auto-migrated on first load.

---

## When Harsh asks Claude for help

### "Help me solve [problem]"

→ First ask: "What Java structure did you reach for first, and why?" Then guide toward the right structure if needed.

### "I'm stuck on [week N topic]"

→ Look up the week in the schedule. Suggest re-reading the relevant Reference tab (Collections or Patterns). Give a minimal working template, not a full solution.

### "Add a new problem to the schedule"

→ Edit the `practiceDayPlan` array in `src/content/practice.generated.ts`. Problems have format: `{title, lc, diff}` where diff is `"E"` / `"M"` / `"H"`.

### "Update the roadmap"

→ Edit the `roadmapWeeks` array in `src/content/roadmap.generated.ts`. Each week has: `{phase, week, title, color, bg, days:[], topics:[]}`.

### "Change the UI/styling"

→ Design tokens live in `src/app/globals.css`. Component styles use CSS Modules (`.module.css` files co-located with components). Follow the clean, minimal design principles above.

---

## Patterns Harsh must know cold

1. Two Pointers
2. Sliding Window (fixed + variable)
3. Prefix Sum
4. Binary Search (classic + answer-space)
5. Frequency Count (int[26] first, HashMap if needed)
6. Monotonic Stack (store indices, not values)
7. Monotonic Deque (sliding window max/min)
8. BFS (Queue + mark visited on offer)
9. DFS (recursion for trees, explicit stack for graphs if depth risk)
10. Backtracking (always copy path: `new ArrayList<>(path)`)
11. Top K Heap (K largest → min-heap; K smallest → max-heap)
12. Union Find / DSU (path compression + rank)
13. Topological Sort (Kahn's BFS for cycle detection)
14. Dynamic Programming (1D → 2D → interval)
15. Dijkstra (PQ of {dist, node} sorted by dist)

---

## Critical Java traps

1. `String +=` in loop → use `StringBuilder`
2. Forgetting `long` for large sums → silent wrong answers
3. `list.remove(1)` removes by index → use `Integer.valueOf(1)` for value
4. `(a - b)` comparator → integer overflow → use `Integer.compare(a, b)`
5. `ArrayDeque` not `Stack` or `LinkedList` for stack/queue
6. `map.get(key)` returns null → use `getOrDefault`
7. Backtracking: `res.add(path)` → should be `res.add(new ArrayList<>(path))`
8. BFS: mark visited on offer, not on poll
9. K largest uses min-heap (counterintuitive)
10. `arr.length` vs `s.length()` — no parens for arrays

---

## Backlog

- [ ] System Design reference tab within the Reference page
- [ ] Per-pattern problem bank (click a pattern in Mind Map → see all related problems)
- [ ] "Weak area" tagging — mark problems as hard, re-queue them for Week 11
- [ ] Behavioral stories tracker (STAR format for 5 key stories)
- [ ] Company-specific problem lists (FAANG, mid-size, etc.)

---

_Last updated: April 2026. Next.js app — run `npm run dev` to start locally._
