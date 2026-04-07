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
          <p className="eyebrow">Roadmap</p>
          <h1 className="page-title">
            See the full interview path before you dive into today.
          </h1>
          <p className="page-description">
            Move between the 12-week overview, weekly breakdowns, pattern list,
            system-design track, and your repeatable study routine.
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
                <span
                  className="badge"
                  style={{ background: week.bg, color: week.color }}
                >
                  {week.phase} · Week {week.week}
                </span>
                <span className="week-summary-title">{week.title}</span>
                <span className="subtle">Expand</span>
              </summary>
              <div className="surface-inner page-stack">
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
        <section className="feature-grid three-up">
          {roadmapPatterns.map((pattern) => (
            <article className="feature-card" key={pattern.name}>
              <span
                className="badge"
                style={{ background: pattern.bg, color: pattern.tc }}
              >
                {pattern.tag}
              </span>
              <h3>{pattern.name}</h3>
              <p>{pattern.desc}</p>
              <p className="subtle">{pattern.ex}</p>
            </article>
          ))}
        </section>
      ) : null}

      {selectedSection === "system-design" ? (
        <section className="page-stack">
          <div className="topic-grid two-up">
            {systemDesignTopics.map((topic) => (
              <article className="feature-card" key={topic.week}>
                <p className="eyebrow">{topic.week}</p>
                <h3>{topic.title}</h3>
                <ul className="dot-list list-reset">
                  {topic.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="notice">
            <strong>PEDALS framework:</strong> problem clarification, estimates,
            design API, architecture, load and scale, then storage schema. Lead
            with clarifications and narrate trade-offs.
          </div>
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
