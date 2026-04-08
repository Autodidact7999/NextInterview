"use client";

import { useProgress } from "@/lib/progress/context";
import {
  PRACTICE_DAY_COUNT,
  ROADMAP_DAY_COUNT,
} from "@/lib/progress/constants";
import {
  computePracticeStats,
  computeRoadmapStats,
  getRoadmapStorageKey,
} from "@/lib/progress/metrics";
import { practiceDayPlan } from "@/content/practice";

const monthLabels = [
  "Month 1 · Foundations (Days 1-30)",
  "Month 2 · Patterns & System Design (Days 31-60)",
  "Month 3 · Mock & Polish (Days 61-90)",
] as const;

export function ProgressView() {
  const { hydrated, progress, cycleRoadmapDayStatus } = useProgress();
  const roadmapStats = computeRoadmapStats(progress);
  const practiceStats = computePracticeStats(progress, practiceDayPlan);

  return (
    <div className="app-page page-stack">
      <section className="page-header">
        <div className="page-header-copy">
          <p className="eyebrow">Progress</p>
          <h1 className="page-title">Keep your momentum visible every week.</h1>
          <p className="page-description">
            Use this page to see what you&apos;ve actually done, protect your
            streak, and spot where the next review session should land.
          </p>
        </div>
      </section>

      <section className="stat-grid">
        <div className="stat-card surface">
          <div className="stat-value">
            {hydrated ? roadmapStats.dsaDays : "Loading"}
          </div>
          <div className="stat-label">DSA days logged</div>
        </div>
        <div className="stat-card surface">
          <div className="stat-value">
            {hydrated ? roadmapStats.sdDays : "Loading"}
          </div>
          <div className="stat-label">System design days logged</div>
        </div>
        <div className="stat-card surface">
          <div className="stat-value">
            {hydrated ? roadmapStats.streak : "Loading"}
          </div>
          <div className="stat-label">Current roadmap streak</div>
        </div>
        <div className="stat-card surface">
          <div className="stat-value">
            {hydrated
              ? `${practiceStats.solved} / ${practiceStats.total}`
              : "Loading"}
          </div>
          <div className="stat-label">{`Practice progress across ${PRACTICE_DAY_COUNT} days`}</div>
        </div>
      </section>

      <section className="surface surface-inner page-stack">
        <div>
          <p className="eyebrow">Tracker</p>
          <h2 className="section-title">
            Log each roadmap day with one quick tap
          </h2>
          <p className="section-copy">
            First tap marks a DSA session, second tap marks a system-design
            session, and the third clears the day.
          </p>
        </div>

        {monthLabels.map((label, monthIndex) => (
          <div className="page-stack" key={label}>
            <div className="problem-meta">
              <span>{label}</span>
              <span>{`${roadmapStats.monthProgress[monthIndex]}% complete`}</span>
            </div>
            <div className="tracker-grid">
              {Array.from({ length: 30 }, (_, offset) => {
                const dayNumber = monthIndex * 30 + offset + 1;
                const status =
                  progress.roadmapStatuses[getRoadmapStorageKey(dayNumber)] ??
                  "none";
                return (
                  <button
                    aria-label={`Roadmap day ${dayNumber}`}
                    className="tracker-day"
                    data-status={status}
                    key={dayNumber}
                    onClick={() => cycleRoadmapDayStatus(dayNumber)}
                    type="button"
                  >
                    {dayNumber}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="tracker-legend">
          <span>
            <span
              className="legend-swatch"
              style={{ background: "var(--green)" }}
            />
            DSA logged
          </span>
          <span>
            <span
              className="legend-swatch"
              style={{ background: "var(--purple)" }}
            />
            System design logged
          </span>
          <span>
            <span
              className="legend-swatch"
              style={{
                background: "var(--surface-muted)",
                border: "1px solid var(--border-subtle)",
              }}
            />
            Empty
          </span>
        </div>
      </section>

      <section className="surface surface-inner page-stack">
        <div>
          <p className="eyebrow">Keep it sustainable</p>
          <h2 className="section-title">
            Small, honest reps beat perfect plans
          </h2>
          <p className="section-copy">
            This tracker helps you stay consistent across the full
            {` ${ROADMAP_DAY_COUNT}-day roadmap`} and
            {` ${PRACTICE_DAY_COUNT}-day practice cycle.`}
          </p>
        </div>
        <div className="feature-grid two-up">
          <article className="feature-card">
            <span className="badge accent-green">After each session</span>
            <h3>Log what you really finished</h3>
            <p>
              Honest tracking is more useful than optimistic tracking. Mark the
              work you completed so your weak spots stay visible.
            </p>
          </article>
          <article className="feature-card">
            <span className="badge accent-purple">Once a week</span>
            <h3>Review the misses, not just the wins</h3>
            <p>
              Use your streak and completion totals as a cue to revisit the
              problems and patterns that still feel slow.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
