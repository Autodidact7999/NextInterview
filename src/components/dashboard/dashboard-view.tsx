"use client";

import Link from "next/link";

import styles from "@/components/dashboard/dashboard-view.module.css";
import { practiceDayPlan } from "@/content/practice";
import { ROADMAP_DAY_COUNT } from "@/lib/progress/constants";
import { useProgress } from "@/lib/progress/context";
import {
  computePracticeStats,
  computeRoadmapStats,
  getDashboardSnapshot,
  getPracticeDate,
  getProblemStorageKey,
} from "@/lib/progress/metrics";
import { formatLongDate, slugifyLeetCodeTitle } from "@/lib/utils";

const workspaceLinks = [
  {
    href: "/roadmap",
    index: "01",
    label: "Review the roadmap",
    copy: "Zoom out to the 12-week strategy and system-design track.",
  },
  {
    href: "/reference",
    index: "02",
    label: "Open the reference library",
    copy: "Refresh Java syntax, patterns, and common traps.",
  },
  {
    href: "/progress",
    index: "03",
    label: "Check progress",
    copy: "Log a roadmap day and review your consistency.",
  },
] as const;

export function DashboardView() {
  const { hydrated, progress, setProblemCompletion } = useProgress();
  const practiceStats = computePracticeStats(progress, practiceDayPlan);
  const roadmapStats = computeRoadmapStats(progress);
  const snapshot = getDashboardSnapshot(progress, practiceDayPlan);
  const todayPlan = snapshot.todayPlan;
  const scheduledDate =
    progress.startDate && snapshot.dayNumber
      ? getPracticeDate(progress.startDate, snapshot.dayNumber)
      : null;
  const practicePercent = Math.round(
    (practiceStats.solved / practiceStats.total) * 100,
  );
  const roadmapLogged = roadmapStats.dsaDays + roadmapStats.sdDays;
  const roadmapPercent = Math.round((roadmapLogged / ROADMAP_DAY_COUNT) * 100);
  const hasActiveRun = Boolean(progress.startDate);
  const isComplete =
    hasActiveRun &&
    snapshot.daysRemaining != null &&
    snapshot.daysRemaining <= 0;

  const heading = todayPlan
    ? `Day ${todayPlan.day}: ${todayPlan.focus}`
    : !hasActiveRun
      ? "Set up your 84-day practice run."
      : isComplete
        ? "Your 84-day run is complete."
        : "Your schedule is between active study days.";

  const description = todayPlan
    ? `${formatLongDate(scheduledDate ?? new Date())} · ${todayPlan.problems.length ? `${todayPlan.problems.length} focused reps` : todayPlan.mock ? "Timed interview practice" : "Review and consolidation"}`
    : !hasActiveRun
      ? "Choose Day 1 once. NextInterview will surface today’s session, pace the plan, and keep your progress in context."
      : isComplete
        ? "Review your progress, identify weak patterns, and choose a new Day 1 when you are ready for another cycle."
        : "Browse the plan freely or adjust Day 1 to bring today back into the active schedule.";

  return (
    <div className={`app-page ${styles.page}`}>
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className="eyebrow">{formatLongDate(new Date())}</p>
          <h1 className={styles.title}>{heading}</h1>
          <p className={styles.description}>{description}</p>
          <div className={styles.actions}>
            <Link className="button-primary" href="/practice">
              {todayPlan ? "Open this session" : "Set up practice"}
            </Link>
            <Link className="button-secondary" href="/roadmap">
              View 12-week plan
            </Link>
          </div>
        </div>

        <aside className={styles.runPanel}>
          <div className={styles.runTopline}>
            <span className={styles.runLabel}>Current run</span>
            <span className={styles.runState}>
              {hasActiveRun ? "Active" : "Not started"}
            </span>
          </div>
          <strong className={styles.runValue}>
            {todayPlan
              ? `Week ${todayPlan.week} · Day ${todayPlan.day}`
              : progress.startDate
                ? practiceStats.remainingLabel
                : "Choose Day 1"}
          </strong>
          <p className={styles.runCopy}>
            {progress.startDate
              ? `Started ${formatLongDate(getPracticeDate(progress.startDate, 1))}`
              : "The full plan remains available while your schedule is unset."}
          </p>
          <div className={styles.runProgress}>
            <div className={styles.runProgressMeta}>
              <span>Practice completion</span>
              <span>{hydrated ? `${practicePercent}%` : "—"}</span>
            </div>
            <div aria-hidden className={styles.progressTrack}>
              <span style={{ width: `${hydrated ? practicePercent : 0}%` }} />
            </div>
          </div>
        </aside>
      </header>

      <section aria-label="Progress summary" className={styles.metrics}>
        <div className={styles.metric}>
          <span>Solved</span>
          <strong>{hydrated ? practiceStats.solved : "—"}</strong>
          <small>{`of ${practiceStats.total} problems`}</small>
        </div>
        <div className={styles.metric}>
          <span>Practice streak</span>
          <strong>{hydrated ? practiceStats.currentStreak : "—"}</strong>
          <small>scheduled days</small>
        </div>
        <div className={styles.metric}>
          <span>Roadmap logged</span>
          <strong>{hydrated ? `${roadmapPercent}%` : "—"}</strong>
          <small>{`${roadmapLogged} of ${ROADMAP_DAY_COUNT} days`}</small>
        </div>
        <div className={styles.metric}>
          <span>Runway</span>
          <strong>{hydrated ? practiceStats.remainingLabel : "—"}</strong>
          <small>in the current cycle</small>
        </div>
      </section>

      <section className={styles.workspace}>
        <article className={styles.session}>
          <div className={styles.sectionHeader}>
            <div>
              <p className="eyebrow">Next session</p>
              <h2 className={styles.sectionTitle}>
                {todayPlan
                  ? todayPlan.mock
                    ? "Run a timed mock"
                    : todayPlan.review
                      ? "Consolidate the week"
                      : "Complete today’s problem set"
                  : "Activate your daily brief"}
              </h2>
            </div>
            {todayPlan ? (
              <span className={styles.sessionCount}>
                {todayPlan.problems.length
                  ? `${todayPlan.problems.length} reps`
                  : todayPlan.mock
                    ? "90 min"
                    : "Review"}
              </span>
            ) : null}
          </div>

          {todayPlan?.problems.length ? (
            <div className={styles.problemList}>
              {todayPlan.problems.map((problem, index) => {
                const problemKey = getProblemStorageKey(
                  todayPlan.day,
                  problem.lc,
                );
                const completed = Boolean(
                  progress.completedProblems[problemKey],
                );

                return (
                  <div className={styles.problemRow} key={problemKey}>
                    <span className={styles.problemIndex}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className={styles.problemCopy}>
                      <Link
                        href={`https://leetcode.com/problems/${slugifyLeetCodeTitle(problem.title)}/`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {problem.title}
                      </Link>
                      <span>{`${problem.diff} · LeetCode ${problem.lc}`}</span>
                    </div>
                    <label
                      className={`${styles.completion} ${completed ? styles.completionDone : ""}`}
                    >
                      <input
                        aria-label={`Mark ${problem.title} complete for Day ${todayPlan.day}`}
                        checked={completed}
                        onChange={(event) =>
                          setProblemCompletion(
                            todayPlan.day,
                            problem.lc,
                            event.target.checked,
                          )
                        }
                        type="checkbox"
                      />
                      <span>{completed ? "Done" : "Mark done"}</span>
                    </label>
                  </div>
                );
              })}
            </div>
          ) : todayPlan ? (
            <div className={styles.guidedSession}>
              <span>{todayPlan.mock ? "Timed mock" : "Weekly review"}</span>
              <strong>
                {todayPlan.mock
                  ? "Three problems. Ninety minutes. No hints."
                  : "Re-solve the hardest problem before checking notes."}
              </strong>
              <p>
                {todayPlan.mock
                  ? "Finish with a calm review of the trade-offs and alternatives you missed."
                  : "Then tighten the explanation until it is clear enough to give out loud."}
              </p>
            </div>
          ) : (
            <div className={styles.setupFlow}>
              <div>
                <span>01</span>
                <p>Choose the date your first practice day should begin.</p>
              </div>
              <div>
                <span>02</span>
                <p>Return here for the session that matches today.</p>
              </div>
              <div>
                <span>03</span>
                <p>Mark honest progress and keep your review loop current.</p>
              </div>
            </div>
          )}
        </article>

        <aside className={styles.reviewPanel}>
          <div>
            <p className="eyebrow">Roadmap pulse</p>
            <h2 className={styles.sectionTitle}>
              Three months, one steady pace
            </h2>
          </div>
          <div className={styles.monthList}>
            {roadmapStats.monthProgress.map((value, index) => (
              <div className={styles.month} key={index}>
                <div>
                  <span>{`Month ${index + 1}`}</span>
                  <strong>{`${value}%`}</strong>
                </div>
                <div aria-hidden className={styles.monthTrack}>
                  <span style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className={styles.reviewNote}>
            Use the tracker after each session. Honest signals make the next
            review more useful than a perfect-looking streak.
          </p>
          <Link className={styles.textLink} href="/progress">
            Open the tracker
          </Link>
        </aside>
      </section>

      <section className={styles.linksSection}>
        <div className={styles.linksIntro}>
          <p className="eyebrow">Workspace</p>
          <h2 className={styles.sectionTitle}>Go where the work needs you</h2>
        </div>
        <div className={styles.linkList}>
          {workspaceLinks.map((item) => (
            <Link href={item.href} key={item.href}>
              <span>{item.index}</span>
              <strong>{item.label}</strong>
              <small>{item.copy}</small>
              <span aria-hidden className={styles.linkArrow}>
                →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
