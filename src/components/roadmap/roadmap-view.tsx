"use client";

import Link from "next/link";

import {
  revisionSchedule,
  roadmapHighlights,
  roadmapPatterns,
  roadmapWeeks,
  systemDesignTopics,
  weekdayRoutine,
  weekendRoutine,
} from "@/content/roadmap";
import { useProgress } from "@/lib/progress/context";
import { computeRoadmapStats } from "@/lib/progress/metrics";
import { roadmapSectionOptions } from "@/lib/routes/search-params";
import type { RoadmapSection } from "@/lib/types";
import { SectionLinks } from "@/components/ui/section-links";

const phaseCards = [
  {
    badge: "Month 1",
    accent: "accent-green",
    title: "Foundations",
    copy: "Core data structures, basic algorithms, and problem-solving muscle.",
  },
  {
    badge: "Month 2",
    accent: "accent-purple",
    title: "Patterns & system design",
    copy: "The core interview patterns, graphs, dynamic programming, backtracking, and your first system-design cycles.",
  },
  {
    badge: "Month 3",
    accent: "accent-coral",
    title: "Mocks & polish",
    copy: "Harder blends, full case studies, weak-area tightening, and mock pressure practice.",
  },
] as const;

const patternCollections = [
  {
    title: "Foundation patterns",
    description:
      "The shapes you want automatic before harder graph and DP work starts showing up in mocks.",
    accent: "accent-green",
    patterns: [
      "Two Pointers",
      "Sliding Window",
      "Binary Search",
      "Prefix Sum",
      "Fast & Slow Pointers",
    ] as const,
  },
  {
    title: "Traversal and structure",
    description:
      "Patterns that help you move through trees, graphs, and branching state spaces without losing the invariant.",
    accent: "accent-purple",
    patterns: [
      "BFS / Level Order",
      "DFS / Backtracking",
      "Topological Sort",
      "Union Find (DSU)",
      "Trie (Prefix Tree)",
    ] as const,
  },
  {
    title: "Optimization and prioritization",
    description:
      "The patterns that usually unlock the leap from correct to interview-caliber performance.",
    accent: "accent-coral",
    patterns: [
      "Dynamic Programming",
      "Merge Intervals",
      "Top K / Heap",
      "Monotonic Stack",
      "Greedy",
    ] as const,
  },
] as const;

const patternSignals = [
  "Name the input shape first: sorted, linear stream, tree/graph, interval list, or optimization target.",
  "Pick the invariant before coding: window, pointer relation, queue frontier, heap top, or DP state.",
  "Stress test with the smallest edge case before the happy path to catch broken transitions early.",
] as const;

const systemDesignStageNotes = [
  {
    label: "Shared language",
    copy: "Get fluent with trade-offs so your opening ten minutes sound grounded instead of memorized.",
  },
  {
    label: "Storage choices",
    copy: "Connect data shape, read/write patterns, and consistency expectations before you scale anything.",
  },
  {
    label: "Fast paths",
    copy: "Caching and CDN decisions usually produce the biggest early latency wins.",
  },
  {
    label: "Case studies",
    copy: "Translate the theory into concrete product systems with clear traffic and fan-out decisions.",
  },
  {
    label: "Async systems",
    copy: "Use queues and event flow to absorb spikes, isolate failures, and keep services decoupled.",
  },
  {
    label: "Distributed trade-offs",
    copy: "This is where coordination, replication, and consistency costs become part of the design story.",
  },
  {
    label: "User-facing scale",
    copy: "Realtime delivery and search both test how well you separate hot paths from durable systems.",
  },
  {
    label: "Full-round rehearsal",
    copy: "Practice complete answers with APIs, scaling story, bottlenecks, and monitoring all spoken aloud.",
  },
] as const;

const pedalsSteps = [
  {
    label: "P",
    title: "Problem",
    copy: "Clarify users, constraints, traffic shape, and success metrics before drawing boxes.",
  },
  {
    label: "E",
    title: "Estimates",
    copy: "Back into QPS, storage, fan-out, and growth so the design has a believable load profile.",
  },
  {
    label: "D",
    title: "Design API",
    copy: "Define the core endpoints and contracts early so the rest of the system has a clean seam.",
  },
  {
    label: "A",
    title: "Architecture",
    copy: "Lay out the happy path first, then add queues, caches, and background workers where pressure builds.",
  },
  {
    label: "L",
    title: "Load & scale",
    copy: "Explain how the hot path behaves at 10x traffic and where you would partition or cache next.",
  },
  {
    label: "S",
    title: "Storage",
    copy: "Close by justifying schemas, indexes, TTLs, and the consistency model that fits the product.",
  },
] as const;

function getPatternCard(patternName: string) {
  const pattern = roadmapPatterns.find((entry) => entry.name === patternName);

  if (!pattern) {
    throw new Error(`Missing roadmap pattern: ${patternName}`);
  }

  return pattern;
}

function phaseAccent(phase: string): string {
  if (phase === "M1") return "accent-green";
  if (phase === "M2") return "accent-purple";
  if (phase === "M3") return "accent-coral";
  return "accent-purple";
}

// Maps pattern bg color hex to a CSS accent class so badges adapt to dark mode
function patternAccent(bg: string): string {
  const upper = bg.toUpperCase();
  if (upper.startsWith("#E1F5") || upper.startsWith("#EAF3"))
    return "accent-green";
  if (upper.startsWith("#EEEE") || upper.startsWith("#EEED"))
    return "accent-purple";
  if (upper.startsWith("#FAEC") || upper.startsWith("#FCEB"))
    return "accent-coral";
  if (upper.startsWith("#FAEE")) return "accent-amber";
  if (upper.startsWith("#E6F1")) return "accent-blue";
  return "accent-purple";
}

export function RoadmapView({
  selectedSection,
}: {
  selectedSection: RoadmapSection;
}) {
  const { progress } = useProgress();
  const roadmapStats = computeRoadmapStats(progress);

  return (
    <div className="app-page page-stack">
      <section className="page-header">
        <div className="page-header-copy">
          <p className="eyebrow">12-week strategy</p>
          <h1 className="page-title">Interview roadmap</h1>
          <p className="page-description">
            Move between the weekly plan, core DSA patterns, system-design
            track, and a repeatable study routine.
          </p>
        </div>

        <div className="header-actions">
          <Link
            className="button-secondary"
            href="/reference?section=quick-ref"
          >
            Review quick ref
          </Link>
          <Link className="button-primary" href="/practice">
            Start today&apos;s reps
          </Link>
        </div>
      </section>

      <SectionLinks
        activeValue={selectedSection}
        basePath="/roadmap"
        options={roadmapSectionOptions}
        paramName="section"
      />

      {selectedSection === "overview" ? (
        <>
          <section className="panel-grid three-up">
            {phaseCards.map((phase) => (
              <div className="feature-card" key={phase.title}>
                <span className={`badge ${phase.accent}`}>{phase.badge}</span>
                <h3>{phase.title}</h3>
                <p>{phase.copy}</p>
              </div>
            ))}
          </section>

          <section className="stat-grid">
            {roadmapHighlights.map((stat) => (
              <div className="stat-card surface" key={stat.label}>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
            <div className="stat-card surface">
              <div className="stat-value">{roadmapStats.streak}</div>
              <div className="stat-label">Current roadmap streak</div>
            </div>
          </section>

          <section className="surface surface-inner page-stack">
            <div>
              <p className="eyebrow">Progress by month</p>
              <h2 className="section-title">
                See how steadily each month is filling in
              </h2>
            </div>

            {roadmapStats.monthProgress.map((progressValue, index) => (
              <div className="page-stack" key={index}>
                <div className="problem-meta">
                  <span>{`Month ${index + 1}`}</span>
                  <span>{progressValue}%</span>
                </div>
                <div className="progress-bar-track" aria-hidden>
                  <div
                    className="progress-bar-fill"
                    style={{
                      background:
                        index === 0
                          ? "var(--green)"
                          : index === 1
                            ? "var(--purple)"
                            : "var(--coral)",
                      width: `${progressValue}%`,
                    }}
                  />
                </div>
              </div>
            ))}

            <div className="notice">
              <strong>Golden rule:</strong> understand the problem, pick the
              right structure, write from memory, then review on a spaced loop.
            </div>
          </section>
        </>
      ) : null}

      {selectedSection === "weekly" ? (
        <section className="card-list">
          {roadmapWeeks.map((week) => (
            <details className="week-card" key={week.week}>
              <summary className="week-summary">
                <span className={`badge ${phaseAccent(week.phase)}`}>
                  {week.phase} · Week {week.week}
                </span>
                <span className="week-summary-title">{week.title}</span>
                <span className="subtle">Expand</span>
              </summary>
              <div className="surface-inner page-stack">
                {week.intro ? (
                  <p className="section-copy">{week.intro}</p>
                ) : null}
                <div className="feature-grid two-up">
                  <div>
                    <p className="eyebrow">Topics</p>
                    <ul className="dot-list list-reset">
                      {week.topics.map((topic) => (
                        <li key={topic}>{topic}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="eyebrow">Day-by-day rhythm</p>
                    <ul className="dot-list list-reset">
                      {week.days.map((day) => (
                        <li key={day}>{day}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </details>
          ))}
        </section>
      ) : null}

      {selectedSection === "patterns" ? (
        <section className="patterns-shell page-stack">
          <div className="surface surface-inner">
            <p className="eyebrow">Pattern playbook</p>
            <h2 className="page-title" style={{ marginBottom: "0.5rem" }}>
              Train recognition before memorizing.
            </h2>
            <p className="page-description" style={{ marginBottom: "1.25rem" }}>
              These are the recurring problem shapes interviewers reuse. The
              goal is to spot the structure quickly, choose the right invariant,
              and only then write code.
            </p>
            <div className="roadmap-focus-panel">
              <p className="eyebrow">Fast scan loop</p>
              <div className="roadmap-signal-list">
                {patternSignals.map((signal) => (
                  <p key={signal}>{signal}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="roadmap-stat-strip">
            <div className="roadmap-stat-tile">
              <strong>{roadmapPatterns.length}</strong>
              <span>Core patterns</span>
            </div>
            <div className="roadmap-stat-tile">
              <strong>3</strong>
              <span>Study clusters</span>
            </div>
            <div className="roadmap-stat-tile">
              <strong>Identify - choose - dry run</strong>
              <span>Default interview cadence</span>
            </div>
          </div>

          <div className="pattern-group-list">
            {patternCollections.map((collection) => (
              <section className="pattern-group surface" key={collection.title}>
                <div className="pattern-group-header">
                  <span className={`badge ${collection.accent}`}>
                    {collection.patterns.length} patterns
                  </span>
                  <h3>{collection.title}</h3>
                  <p className="section-copy">{collection.description}</p>
                </div>

                <div className="pattern-card-grid">
                  {collection.patterns.map((patternName) => {
                    const pattern = getPatternCard(patternName);

                    return (
                      <article
                        className="pattern-guide-card"
                        key={pattern.name}
                      >
                        <div className="pattern-guide-topline">
                          <span
                            className={`badge ${patternAccent(pattern.bg)}`}
                          >
                            {pattern.tag}
                          </span>
                        </div>

                        <div className="pattern-guide-heading">
                          <h4>{pattern.name}</h4>
                          <p>{pattern.desc}</p>
                        </div>

                        <dl className="pattern-guide-details">
                          <div>
                            <dt>Look for</dt>
                            <dd>{pattern.signal}</dd>
                          </div>
                          <div>
                            <dt>Guardrails</dt>
                            <dd>{pattern.edgeCases}</dd>
                          </div>
                          <div>
                            <dt>Drill with</dt>
                            <dd>{pattern.ex}</dd>
                          </div>
                        </dl>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </section>
      ) : null}

      {selectedSection === "system-design" ? (
        <section className="system-design-shell page-stack">
          <div className="surface surface-inner">
            <p className="eyebrow">System design studio</p>
            <h2 className="page-title" style={{ marginBottom: "0.5rem" }}>
              Build answers that sound composed under pressure.
            </h2>
            <p className="page-description" style={{ marginBottom: "1.25rem" }}>
              Move from vocabulary and storage choices into distributed
              trade-offs, then finish with end-to-end product designs you can
              speak through in one pass.
            </p>
            <div className="system-design-hero-rail">
              {systemDesignStageNotes.map((stage) => (
                <div className="system-stage-pill" key={stage.label}>
                  <strong>{stage.label}:</strong>
                  <span>{stage.copy}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="system-design-track">
            {systemDesignTopics.map((topic, index) => (
              <article className="system-week-card surface" key={topic.week}>
                <div className="system-week-meta">
                  <span className="badge accent-purple">{topic.week}</span>
                  <strong>{systemDesignStageNotes[index]?.label}</strong>
                  <p>{systemDesignStageNotes[index]?.copy}</p>
                </div>

                <div className="system-week-body">
                  <div className="system-week-heading">
                    <h3>{topic.title}</h3>
                    {topic.intro ? <p>{topic.intro}</p> : null}
                  </div>

                  <div className="system-concept-grid">
                    {topic.items.map((item, itemIndex) => (
                      <article
                        className="system-concept-card"
                        key={item.concept}
                      >
                        <span className="system-concept-index">
                          {itemIndex + 1}
                        </span>
                        <div>
                          <h4>{item.concept}</h4>
                          <p>{item.explanation}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <section className="system-framework surface">
            <div className="system-framework-header">
              <p className="eyebrow">PEDALS framework</p>
              <h3 className="section-title">
                Use one speaking order for every design round
              </h3>
            </div>

            <div className="system-framework-grid">
              {pedalsSteps.map((step) => (
                <article className="system-framework-step" key={step.label}>
                  <span className="system-framework-badge">{step.label}</span>
                  <h4>{step.title}</h4>
                  <p>{step.copy}</p>
                </article>
              ))}
            </div>
          </section>
        </section>
      ) : null}

      {selectedSection === "routine" ? (
        <>
          <section className="surface surface-inner page-stack">
            <div>
              <p className="eyebrow">Weekday rhythm</p>
              <h2 className="section-title">
                A repeatable routine with just enough structure
              </h2>
            </div>

            <div className="timeline">
              {weekdayRoutine.map((item) => (
                <div className="timeline-item" key={item.title}>
                  <div className="timeline-label">{item.label}</div>
                  <div className="timeline-body">
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="surface surface-inner page-stack">
            <div>
              <p className="eyebrow">Weekend rhythm</p>
              <h2 className="section-title">
                Longer reps where pressure and review meet
              </h2>
            </div>

            <div className="timeline">
              {weekendRoutine.map((item) => (
                <div className="timeline-item" key={item.title}>
                  <div className="timeline-label">{item.label}</div>
                  <div className="timeline-body">
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="surface surface-inner page-stack">
            <div>
              <p className="eyebrow">Revision schedule</p>
              <h2 className="section-title">When to revisit each problem</h2>
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Interval</th>
                    <th>Expectation</th>
                  </tr>
                </thead>
                <tbody>
                  {revisionSchedule.map((item) => (
                    <tr key={item.interval}>
                      <td>{item.interval}</td>
                      <td>{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
