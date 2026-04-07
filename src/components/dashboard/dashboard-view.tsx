"use client";

import Link from "next/link";

import styles from "@/components/dashboard/dashboard-view.module.css";
import { practiceDayPlan } from "@/content/practice";
import {
  PRACTICE_DAY_COUNT,
  ROADMAP_DAY_COUNT,
} from "@/lib/progress/constants";
import { useProgress } from "@/lib/progress/context";
import {
  computePracticeStats,
  computeRoadmapStats,
  getDashboardSnapshot,
  getPracticeDate,
  getProblemStorageKey,
} from "@/lib/progress/metrics";
import type { DayPlanEntry } from "@/lib/types";
import { formatLongDate, slugifyLeetCodeTitle } from "@/lib/utils";

const quickLinks = [
  {
    href: "/practice",
    kicker: "Live plan",
    accentClassName: "accent-purple",
    title: "Open the scheduled practice block",
    description:
      "Go straight into the 84-day run with today highlighted, solution notes close by, and completion toggles ready.",
  },
  {
    href: "/roadmap",
    kicker: "12 weeks",
    accentClassName: "accent-green",
    title: "Zoom out to the full roadmap",
    description:
      "Step back when you need to understand this week in the larger plan before the next rep starts.",
  },
  {
    href: "/reference",
    kicker: "Recall",
    accentClassName: "accent-blue",
    title: "Refresh syntax and pattern memory",
    description:
      "Use the mind map, Java quick reference, and trap list when recall feels slower than it should.",
  },
  {
    href: "/progress",
    kicker: "Review",
    accentClassName: "accent-coral",
    title: "Check momentum and tracker history",
    description:
      "Review streaks, roadmap logging, and what the current cycle says about your consistency.",
  },
] as const;

const studyProtocol = [
  {
    label: "01",
    title: "Anchor the session",
    description:
      "Start from today’s focus so the practice block has one clear intention before you solve.",
  },
  {
    label: "02",
    title: "Explain before peeking",
    description:
      "Narrate the pattern, edge cases, and trade-offs out loud before opening notes or solutions.",
  },
  {
    label: "03",
    title: "Log the honest result",
    description:
      "Mark progress based on what you actually finished so the next review stays grounded in reality.",
  },
] as const;

function getSessionMessage(
  todayPlan: DayPlanEntry | null,
  scheduledDate: Date | null,
  hasStartDate: boolean,
  daysRemaining: number | null,
) {
  if (!todayPlan) {
    if (!hasStartDate) {
      return {
        title: "Set Day 1 to activate the live study board",
        copy: "Once your start date is in place, this area turns into a daily brief with pacing, countdowns, and clearer next actions.",
      };
    }

    if (daysRemaining != null && daysRemaining <= 0) {
      return {
        title: "You have reached the end of the current 84-day run",
        copy: "Use the roadmap and progress pages to review what is solid, then start a new cycle when you are ready for another pass.",
      };
    }

    return {
      title: "Your current date is outside the active 84-day window",
      copy: "The plan is still available to browse, and you can reset Day 1 whenever you want the schedule to become live again.",
    };
  }

  if (todayPlan.mock) {
    return {
      title: `Day ${todayPlan.day} is a timed mock`,
      copy: "Run the session like an interview: three problems, ninety focused minutes, no hints, then a calm review of better alternatives.",
    };
  }

  if (todayPlan.review) {
    return {
      title: `Day ${todayPlan.day} is a review reset`,
      copy: "Re-solve the hardest problem from the week, tighten your verbal explanation, and write down the mistakes worth remembering.",
    };
  }

  return {
    title: `Day ${todayPlan.day} is scheduled for ${formatLongDate(scheduledDate ?? new Date())}`,
    copy: "Treat this session like pattern rehearsal: solve cleanly, narrate the trade-offs, and keep the pace slow enough to stay deliberate.",
  };
}

export function DashboardView() {
  const { hydrated, progress } = useProgress();
  const practiceStats = computePracticeStats(progress, practiceDayPlan);
  const roadmapStats = computeRoadmapStats(progress);
  const snapshot = getDashboardSnapshot(progress, practiceDayPlan);
  const todayPlan = snapshot.todayPlan;
  const scheduledDate =
    progress.startDate && snapshot.dayNumber
      ? getPracticeDate(progress.startDate, snapshot.dayNumber)
      : null;
  const practicePercent = hydrated
    ? Math.round((practiceStats.solved / practiceStats.total) * 100)
    : null;
  const roadmapLogged = roadmapStats.dsaDays + roadmapStats.sdDays;
  const roadmapPercent = hydrated
    ? Math.round((roadmapLogged / ROADMAP_DAY_COUNT) * 100)
    : null;
  const sessionMessage = getSessionMessage(
    todayPlan,
    scheduledDate,
    Boolean(progress.startDate),
    snapshot.daysRemaining,
  );

  return (
    <div className={`app-page page-stack ${styles.page}`}>
      <section className={styles.hero}>
        <div className={styles.heroLead}>
          <p className="eyebrow">Dashboard</p>
          <h1 className={styles.heroTitle}>
            Walk into each session knowing what today is for.
          </h1>
          <p className={styles.heroCopy}>
            The dashboard is the calm entry point for the whole workspace:
            today&apos;s focus, your current pace, and the route that makes the
            next study block obvious instead of noisy.
          </p>
          <div className={styles.heroMeta}>
            <span className={styles.heroMetaPill}>
              {progress.startDate
                ? `Day 1: ${formatLongDate(getPracticeDate(progress.startDate, 1))}`
                : "Schedule inactive"}
            </span>
            <span className={styles.heroMetaPill}>
              {snapshot.currentWeek
                ? `Week ${snapshot.currentWeek}`
                : "12-week map"}
            </span>
            <span className={styles.heroMetaPill}>
              {hydrated
                ? `${practiceStats.currentStreak}-day streak`
                : "Syncing"}
            </span>
          </div>
          <div className="header-actions">
            <Link className="button-primary" href="/practice">
              Open today&apos;s practice
            </Link>
            <Link
              className="button-secondary"
              href="/reference?section=mindmap"
            >
              Review the mind map
            </Link>
          </div>
        </div>

        <aside className={styles.heroAside}>
          <article className={styles.sessionCard}>
            <span className={styles.sessionLabel}>Session board</span>
            <h2 className={styles.sessionTitle}>{sessionMessage.title}</h2>
            <p className={styles.sessionCopy}>{sessionMessage.copy}</p>
            {todayPlan?.revision ? (
              <div className={styles.sessionReview}>
                <span className={styles.sessionReviewLabel}>Spaced review</span>
                <span className={styles.sessionReviewTitle}>
                  {todayPlan.revision.title}
                </span>
                <span className={styles.sessionReviewMeta}>
                  {`Originally introduced on Day ${todayPlan.revision.day}`}
                </span>
              </div>
            ) : null}
          </article>

          <article className={styles.progressCard}>
            <div className={styles.progressRow}>
              <div>
                <span className={styles.progressLabel}>
                  Practice completion
                </span>
                <strong className={styles.progressValue}>
                  {hydrated ? `${practicePercent}%` : "Loading"}
                </strong>
              </div>
              <span className={styles.progressMeta}>
                {hydrated
                  ? `${practiceStats.solved}/${practiceStats.total} solved`
                  : "Progress syncing"}
              </span>
            </div>
            <div className={styles.progressTrack} aria-hidden>
              <div
                className={styles.progressFill}
                style={{ width: `${practicePercent ?? 0}%` }}
              />
            </div>
          </article>

          <div className={styles.metricGrid}>
            <article className={styles.metricCard}>
              <span className={styles.metricLabel}>Roadmap logged</span>
              <strong className={styles.metricValue}>
                {hydrated ? roadmapLogged : "Loading"}
              </strong>
              <span className={styles.metricCopy}>
                {hydrated
                  ? `${roadmapPercent}% of the ${ROADMAP_DAY_COUNT}-day roadmap`
                  : "Across the full roadmap"}
              </span>
            </article>
            <article className={styles.metricCard}>
              <span className={styles.metricLabel}>Runway left</span>
              <strong className={styles.metricValue}>
                {hydrated ? practiceStats.remainingLabel : "Loading"}
              </strong>
              <span className={styles.metricCopy}>
                {`Days remaining in the ${PRACTICE_DAY_COUNT}-day cycle`}
              </span>
            </article>
          </div>
        </aside>
      </section>

      <section className={styles.boardGrid}>
        <article className={styles.todayPanel}>
          <div className={styles.panelHead}>
            <div>
              <p className="eyebrow">Today&apos;s focus</p>
              <h2 className={styles.panelTitle}>
                {todayPlan
                  ? `Day ${todayPlan.day}: ${todayPlan.focus}`
                  : "Your live study brief appears here"}
              </h2>
              <p className={styles.panelCopy}>
                {scheduledDate
                  ? `Scheduled for ${formatLongDate(scheduledDate)}. Keep the session intentional: solve first, explain second, then review what still feels shaky.`
                  : "Pick a start date on the Practice page and this space will become a live plan with today highlighting and clearer pacing cues."}
              </p>
            </div>
          </div>

          {todayPlan ? (
            todayPlan.problems.length > 0 ? (
              <div className={styles.todayFlow}>
                {todayPlan.problems.map((problem, index) => {
                  const completed =
                    progress.completedProblems[
                      getProblemStorageKey(todayPlan.day, problem.lc)
                    ];

                  return (
                    <article
                      className={styles.flowItem}
                      key={`${todayPlan.day}-${problem.lc}`}
                    >
                      <span
                        className={styles.flowIndex}
                      >{`0${index + 1}`}</span>
                      <div className={styles.flowContent}>
                        <div className={styles.flowMeta}>
                          <span
                            className={`badge ${problem.diff === "E" ? "accent-green" : problem.diff === "M" ? "accent-purple" : "accent-coral"}`}
                          >
                            {problem.diff}
                          </span>
                          <span>{`LC #${problem.lc}`}</span>
                          <span>{completed ? "Logged" : "Queued"}</span>
                        </div>
                        <h3 className={styles.flowTitle}>{problem.title}</h3>
                        <p className={styles.flowCopy}>
                          Solve cleanly, then explain the key trade-off before
                          you open hints or compare with alternatives.
                        </p>
                      </div>
                      <Link
                        className={styles.flowLink}
                        href={`https://leetcode.com/problems/${slugifyLeetCodeTitle(problem.title)}/`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Open
                      </Link>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className={styles.specialCard}>
                <span className={styles.specialLabel}>
                  {todayPlan.mock ? "Mock day" : "Review day"}
                </span>
                <h3 className={styles.specialTitle}>
                  {todayPlan.mock
                    ? "Run the block like a real interview"
                    : "Use the day to consolidate what still feels slow"}
                </h3>
                <p className={styles.specialCopy}>
                  {todayPlan.mock
                    ? "Three problems, one quiet timer, no hints until the review. The goal is not perfection. It is signal."
                    : "Re-solve the week’s hardest problem, refresh the pattern from memory, and tighten the explanation you would give an interviewer."}
                </p>
              </div>
            )
          ) : (
            <div className={styles.emptyCard}>
              <strong className={styles.emptyTitle}>
                Set a Day 1 date to unlock the live session board.
              </strong>
              <p className={styles.emptyCopy}>
                Until then, you can still browse the roadmap, practice plan, and
                reference library. The dashboard becomes more useful once it can
                map your real calendar onto the schedule.
              </p>
            </div>
          )}
        </article>

        <div className={styles.infoRail}>
          <article className={styles.railCard}>
            <div>
              <p className="eyebrow">Momentum snapshot</p>
              <h2 className={styles.railTitle}>Month progress at a glance</h2>
            </div>

            <div className={styles.progressList}>
              {roadmapStats.monthProgress.map((progressValue, index) => (
                <div className={styles.progressListItem} key={index}>
                  <div className={styles.progressListMeta}>
                    <span>{`Month ${index + 1}`}</span>
                    <span>{`${progressValue}%`}</span>
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
            </div>

            <div className={styles.noteCard}>
              <strong>Consistency compounds.</strong>
              <span>
                Short daily reps keep retrieval warm and make mock days feel
                much less heavy.
              </span>
            </div>
          </article>

          <article className={styles.railCard}>
            <div>
              <p className="eyebrow">Study protocol</p>
              <h2 className={styles.railTitle}>
                Use the workspace in a simple rhythm
              </h2>
            </div>

            <div className={styles.protocolList}>
              {studyProtocol.map((item) => (
                <div className={styles.protocolItem} key={item.label}>
                  <span className={styles.protocolStep}>{item.label}</span>
                  <div>
                    <h3 className={styles.protocolTitle}>{item.title}</h3>
                    <p className={styles.protocolCopy}>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className={styles.quickSection}>
        <div>
          <p className="eyebrow">Choose your next step</p>
          <h2 className={styles.quickTitle}>
            Move where the session needs you
          </h2>
          <p className={styles.quickCopy}>
            Each route has a different job. Use the one that best matches what
            feels unclear right now.
          </p>
        </div>

        <div className={styles.quickGrid}>
          {quickLinks.map((item) => (
            <Link className={styles.quickCard} href={item.href} key={item.href}>
              <span className={`badge ${item.accentClassName}`}>
                {item.kicker}
              </span>
              <h3 className={styles.quickCardTitle}>{item.title}</h3>
              <p className={styles.quickCardCopy}>{item.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
