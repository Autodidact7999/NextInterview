"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { SettingsModal } from "@/components/practice/settings-modal";
import styles from "@/components/practice/practice-view.module.css";
import { CodeBlock } from "@/components/ui/code-block";
import { SectionLinks } from "@/components/ui/section-links";
import {
  practiceDayPlan,
  practiceSolutions,
  practiceWeekFilters,
  practiceWeekMeta,
} from "@/content/practice";
import { useProgress } from "@/lib/progress/context";
import {
  computePracticeStats,
  getCurrentPracticeDayNumber,
  getProblemStorageKey,
  getPracticeDate,
} from "@/lib/progress/metrics";
import type { PracticeWeekFilter } from "@/lib/types";
import { formatLongDate, slugifyLeetCodeTitle, startOfDay } from "@/lib/utils";

function getDifficultyAccent(diff: "E" | "M" | "H") {
  return diff === "E"
    ? "accent-green"
    : diff === "M"
      ? "accent-purple"
      : "accent-coral";
}

function formatShortPracticeDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function PracticeView({
  selectedWeek,
}: {
  selectedWeek: PracticeWeekFilter;
}) {
  const { hydrated, progress, setProblemCompletion } = useProgress();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [openSolutions, setOpenSolutions] = useState<Record<string, boolean>>(
    {},
  );
  const practiceStats = computePracticeStats(progress, practiceDayPlan);
  const today = startOfDay(new Date());

  const filteredDays = useMemo(() => {
    return selectedWeek === "all"
      ? practiceDayPlan
      : practiceDayPlan.filter((day) => day.week === selectedWeek);
  }, [selectedWeek]);
  const currentDayNumber = getCurrentPracticeDayNumber(
    progress.startDate,
    today,
  );
  const selectedWeekLabel =
    selectedWeek === "all" ? "All 12 weeks" : `Week ${selectedWeek}`;
  const selectedWeekTitle =
    selectedWeek === "all"
      ? "The full 84-day practice plan"
      : `Week ${selectedWeek}: ${practiceWeekMeta[selectedWeek].title}`;
  const dayCards = filteredDays.map((day) => {
    const meta = practiceWeekMeta[day.week];
    const scheduledDate = progress.startDate
      ? getPracticeDate(progress.startDate, day.day)
      : null;
    const isToday = scheduledDate
      ? scheduledDate.getTime() === today.getTime()
      : false;
    const isPast = scheduledDate ? scheduledDate < today : false;
    const solvedCount = day.problems.filter((problem) =>
      Boolean(
        progress.completedProblems[getProblemStorageKey(day.day, problem.lc)],
      ),
    ).length;

    return { day, isPast, isToday, meta, scheduledDate, solvedCount };
  });
  const visibleProblemCount = dayCards.reduce(
    (sum, item) => sum + item.day.problems.length,
    0,
  );
  const visibleSolvedCount = dayCards.reduce(
    (sum, item) => sum + item.solvedCount,
    0,
  );
  const specialDayCount = dayCards.filter(
    (item) => item.day.mock || item.day.review,
  ).length;
  const todayCard = dayCards.find((item) => item.isToday) ?? null;
  const nextQueuedProblem =
    dayCards
      .flatMap((item) =>
        item.day.problems.map((problem) => ({
          day: item.day,
          problem,
        })),
      )
      .find(
        ({ day, problem }) =>
          !progress.completedProblems[
            getProblemStorageKey(day.day, problem.lc)
          ],
      ) ?? null;
  const startDateLabel = progress.startDate
    ? formatLongDate(getPracticeDate(progress.startDate, 1))
    : "Not set";

  return (
    <div className={`app-page page-stack ${styles.page}`}>
      <section className={styles.hero}>
        <div className={styles.heroMain}>
          <div>
            <p className="eyebrow">Practice workspace</p>
            <h1 className={styles.heroTitle}>{selectedWeekTitle}</h1>
            <p className={styles.heroCopy}>
              Work one session at a time. Solve first, explain the pattern out
              loud, then open the notes only when you need them.
            </p>
          </div>

          <div className={styles.heroMeta}>
            <span className={styles.heroMetaPill}>84-day interview sprint</span>
            <span className={styles.heroMetaPill}>{selectedWeekLabel}</span>
            <span className={styles.heroMetaPill}>
              {`${filteredDays.length} sessions in view`}
            </span>
          </div>

          <div className="header-actions">
            <button
              className="button-secondary"
              onClick={() => setSettingsOpen(true)}
              type="button"
            >
              Choose start date
            </button>
            <Link className="button-primary" href="/progress">
              View progress
            </Link>
          </div>
        </div>

        <aside className={styles.heroAside}>
          <section
            aria-labelledby="current-run-title"
            className={styles.runSummary}
          >
            <span className={styles.focusLabel}>Current run</span>
            <h2 className={styles.focusTitle} id="current-run-title">
              {todayCard
                ? `Day ${todayCard.day.day} is live`
                : progress.startDate
                  ? currentDayNumber &&
                    currentDayNumber <= practiceDayPlan.length
                    ? `Day ${currentDayNumber} is your current position`
                    : "Your schedule is outside the active 84-day run"
                  : "Set Day 1 to activate the calendar"}
            </h2>
            <p className={styles.focusCopy}>
              {todayCard
                ? `${todayCard.day.focus} is scheduled for ${formatLongDate(todayCard.scheduledDate!)}. Try to explain the pattern yourself before opening the notes.`
                : progress.startDate
                  ? `Day 1 is ${startDateLabel}. Use the week filters to move around the plan without losing your place.`
                  : "Choose your start date to unlock today highlighting, pacing, and a clearer sense of where you are in the run."}
            </p>
            {nextQueuedProblem ? (
              <div className={styles.nextUp}>
                <span className={styles.nextUpLabel}>Next queued</span>
                <span className={styles.nextUpTitle}>
                  {nextQueuedProblem.problem.title}
                </span>
                <span className={styles.nextUpMeta}>
                  {`Day ${nextQueuedProblem.day.day} · LC #${nextQueuedProblem.problem.lc}`}
                </span>
              </div>
            ) : null}
          </section>

          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>In View</span>
              <span className={styles.metricValue}>
                {hydrated
                  ? visibleProblemCount
                    ? `${visibleSolvedCount}/${visibleProblemCount}`
                    : "Guided"
                  : "Loading"}
              </span>
              <span className={styles.metricCopy}>
                Progress inside the selected scope
              </span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Current Streak</span>
              <span className={styles.metricValue}>
                {hydrated ? `${practiceStats.currentStreak}d` : "Loading"}
              </span>
              <span className={styles.metricCopy}>
                Consecutive scheduled sessions completed
              </span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Runway Left</span>
              <span className={styles.metricValue}>
                {hydrated ? practiceStats.remainingLabel : "Loading"}
              </span>
              <span className={styles.metricCopy}>
                Time left in the active practice cycle
              </span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Special Days</span>
              <span className={styles.metricValue}>{specialDayCount}</span>
              <span className={styles.metricCopy}>
                Mock and review sessions in the visible plan
              </span>
            </div>
          </div>
        </aside>
      </section>

      <section className={styles.filters}>
        <div className={styles.filtersHead}>
          <div>
            <h2 className={styles.filtersTitle}>Choose a week</h2>
            <p className={styles.filtersCopy}>
              The default view stays focused on one week. Open all 12 weeks only
              when you need the full sequence.
            </p>
          </div>
          <span className={styles.scopeBadge}>
            {progress.startDate
              ? `Day 1: ${startDateLabel}`
              : "Schedule not activated yet"}
          </span>
        </div>

        <div className={styles.filterTabs}>
          <SectionLinks
            activeValue={String(selectedWeek)}
            basePath="/practice"
            options={practiceWeekFilters}
            paramName="week"
          />
        </div>
      </section>

      {!progress.startDate ? (
        <div className={styles.startNotice}>
          <strong className={styles.startNoticeTitle}>
            Add Day 1 to highlight today’s session.
          </strong>
          <p className={styles.startNoticeCopy}>
            The plan works without a date, but scheduling adds today markers,
            pacing, and streak context.
          </p>
        </div>
      ) : null}

      <section className={styles.timeline}>
        {dayCards.map(
          ({ day, isPast, isToday, meta, scheduledDate, solvedCount }) => {
            const sessionBadge = day.mock
              ? "Timed mock"
              : day.review
                ? "Review lab"
                : `${day.problems.length} reps`;
            const sessionCopy = day.mock
              ? "Three problems, 90 minutes, then a full solution review."
              : day.review
                ? "Re-solve the hardest rep from the week and explain it cleanly."
                : day.revision
                  ? "Solve the fresh set, then finish with one spaced-repetition problem."
                  : "Solve first, explain the pattern out loud, then check the notes if needed.";
            const progressValue =
              day.mock || day.review
                ? "Guided"
                : `${solvedCount}/${day.problems.length}`;
            const progressLabel = day.mock
              ? "Mock session"
              : day.review
                ? "Review session"
                : "Problems marked done";
            const dayCardClasses = [
              styles.dayCard,
              isToday ? styles.dayCardToday : "",
              isPast && !isToday ? styles.dayCardPast : "",
              day.mock ? styles.dayCardMock : "",
              day.review ? styles.dayCardReview : "",
            ]
              .filter(Boolean)
              .join(" ");
            const sessionPillClass = day.mock
              ? styles.sessionPillMock
              : day.review
                ? styles.sessionPillReview
                : styles.sessionPillPractice;

            return (
              <article className={dayCardClasses} key={day.day}>
                <div className={styles.dayRail}>
                  <span
                    className={styles.weekBadge}
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    {`Week ${day.week}`}
                  </span>
                  <div className={styles.dayNumber}>
                    {String(day.day).padStart(2, "0")}
                  </div>
                  <div className={styles.dayRailLabel}>{day.label}</div>
                  <div className={styles.dayRailDate}>
                    {scheduledDate
                      ? formatShortPracticeDate(scheduledDate)
                      : "Flexible"}
                  </div>
                  {isToday ? (
                    <span className={styles.todayTag}>Today</span>
                  ) : null}
                </div>

                <div className={styles.dayBody}>
                  <div className={styles.dayTop}>
                    <div className={styles.dayText}>
                      <div className={styles.dayMetaRow}>
                        <span
                          className={`${styles.sessionPill} ${sessionPillClass}`}
                        >
                          {sessionBadge}
                        </span>
                        {day.revision ? (
                          <span className={styles.dayHint}>
                            Includes a revision rep
                          </span>
                        ) : null}
                      </div>
                      <h2 className={styles.dayTitle}>{day.focus}</h2>
                      <p className={styles.dayCopy}>{sessionCopy}</p>
                    </div>

                    <div className={styles.dayProgressCard}>
                      <span className={styles.dayProgressValue}>
                        {progressValue}
                      </span>
                      <span className={styles.dayProgressLabel}>
                        {progressLabel}
                      </span>
                    </div>
                  </div>

                  {day.mock ? (
                    <div className={styles.sessionCallout}>
                      <strong>Timed mock</strong>
                      <p>
                        Solve three problems in 90 minutes with no hints, then
                        review every alternative carefully and say the
                        trade-offs out loud.
                      </p>
                    </div>
                  ) : day.review ? (
                    <div className={styles.sessionCallout}>
                      <strong>Review session</strong>
                      <p>
                        Revisit the hardest problem from the week, solve it from
                        scratch, and tighten the explanation so it feels ready
                        for interview pace.
                      </p>
                    </div>
                  ) : (
                    <div className={styles.problemStack}>
                      {day.problems.map((problem) => {
                        const problemKey = getProblemStorageKey(
                          day.day,
                          problem.lc,
                        );
                        const open = openSolutions[problemKey] ?? false;
                        const solution = practiceSolutions[problem.lc];
                        const completed = Boolean(
                          progress.completedProblems[problemKey],
                        );
                        const problemClasses = [
                          styles.problemCard,
                          open ? styles.problemCardOpen : "",
                          completed ? styles.problemCardComplete : "",
                        ]
                          .filter(Boolean)
                          .join(" ");

                        return (
                          <div className={problemClasses} key={problemKey}>
                            <div className={styles.problemHeader}>
                              <div className={styles.problemInfo}>
                                <div className={styles.problemTitleRow}>
                                  <Link
                                    className={styles.problemLink}
                                    href={`https://leetcode.com/problems/${slugifyLeetCodeTitle(problem.title)}/`}
                                    rel="noreferrer"
                                    target="_blank"
                                  >
                                    {problem.title}
                                  </Link>
                                  <span
                                    className={`badge ${getDifficultyAccent(problem.diff)}`}
                                  >
                                    {problem.diff}
                                  </span>
                                </div>
                                <div className={styles.problemMeta}>
                                  <span>{`LeetCode #${problem.lc}`}</span>
                                  <span className={styles.problemStatus}>
                                    {completed
                                      ? "Marked done"
                                      : "Ready to solve"}
                                  </span>
                                </div>
                              </div>

                              <div className={styles.problemControls}>
                                <button
                                  className={`${styles.actionButton} ${
                                    open ? styles.actionButtonActive : ""
                                  }`}
                                  disabled={!solution}
                                  onClick={() =>
                                    setOpenSolutions((current) => ({
                                      ...current,
                                      [problemKey]: !current[problemKey],
                                    }))
                                  }
                                  type="button"
                                >
                                  {open
                                    ? "Hide notes"
                                    : solution
                                      ? "See approach"
                                      : "Notes soon"}
                                </button>
                                <label
                                  className={`${styles.completeToggle} ${
                                    completed
                                      ? styles.completeToggleChecked
                                      : ""
                                  }`}
                                >
                                  <input
                                    aria-label={`Mark ${problem.title} complete for Day ${day.day}`}
                                    checked={completed}
                                    className={styles.checkbox}
                                    onChange={(event) =>
                                      setProblemCompletion(
                                        day.day,
                                        problem.lc,
                                        event.target.checked,
                                      )
                                    }
                                    type="checkbox"
                                  />
                                  <span>{completed ? "Done" : "Mark"}</span>
                                  <span className="sr-only">{`Mark ${problem.title} complete for Day ${day.day}`}</span>
                                </label>
                              </div>
                            </div>

                            {open ? (
                              <div className={styles.solutionPanel}>
                                {solution ? (
                                  <>
                                    <div className={styles.solutionMeta}>
                                      <span className="badge accent-purple">
                                        {solution.pattern}
                                      </span>
                                      <span>{`Time ${solution.time}`}</span>
                                      <span>{`Space ${solution.space}`}</span>
                                    </div>
                                    {solution.approach ? (
                                      <div className={styles.approachBlock}>
                                        <strong
                                          className={styles.approachLabel}
                                        >
                                          How to think about it
                                        </strong>
                                        <p className={styles.approachCopy}>
                                          {solution.approach}
                                        </p>
                                      </div>
                                    ) : null}
                                    <p className={styles.solutionCopy}>
                                      {solution.insight}
                                    </p>
                                    <CodeBlock code={solution.code} />
                                  </>
                                ) : (
                                  <p className={styles.solutionCopy}>
                                    Written notes for this problem are coming
                                    soon.
                                  </p>
                                )}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {day.revision ? (
                    <div className={styles.revisionCallout}>
                      <strong>Revision rep</strong>
                      <p>
                        {`Re-solve ${day.revision.title} from Day ${day.revision.day} without looking at the old solution.`}
                      </p>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          },
        )}
      </section>

      <SettingsModal
        onClose={() => setSettingsOpen(false)}
        open={settingsOpen}
      />
    </div>
  );
}
