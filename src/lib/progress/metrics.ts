import {
  PRACTICE_DAY_COUNT,
  ROADMAP_DAY_COUNT,
} from "@/lib/progress/constants";
import type {
  DashboardSnapshot,
  DayPlanEntry,
  PracticeStats,
  ProgressState,
  RoadmapStats,
} from "@/lib/types";
import { addDays, parseIsoDate, startOfDay } from "@/lib/utils";

export function getProblemStorageKey(day: number, lc: number) {
  return `day${day}_prob${lc}`;
}

export function getRoadmapStorageKey(day: number) {
  return `roadmap-${day}`;
}

export function getPracticeDate(startDate: string, dayNumber: number) {
  return addDays(startOfDay(parseIsoDate(startDate)), dayNumber - 1);
}

export function getCurrentPracticeDayNumber(
  startDate: string | null,
  today = new Date(),
) {
  if (!startDate) {
    return null;
  }

  const diffMs =
    startOfDay(today).getTime() - startOfDay(parseIsoDate(startDate)).getTime();
  return Math.floor(diffMs / 86_400_000) + 1;
}

export function getDaysRemaining(startDate: string | null, today = new Date()) {
  if (!startDate) {
    return null;
  }

  const endDate = getPracticeDate(startDate, PRACTICE_DAY_COUNT);
  return Math.ceil(
    (endDate.getTime() - startOfDay(today).getTime()) / 86_400_000,
  );
}

export function computePracticeStats(
  progress: ProgressState,
  dayPlan: DayPlanEntry[],
  today = new Date(),
): PracticeStats {
  const solved = Object.values(progress.completedProblems).filter(
    Boolean,
  ).length;
  const total = dayPlan.reduce((sum, day) => sum + day.problems.length, 0);
  const currentStreak = computePracticeStreak(progress, dayPlan, today);
  const daysRemaining = getDaysRemaining(progress.startDate, today);

  return {
    solved,
    total,
    currentStreak,
    remainingLabel:
      daysRemaining == null
        ? "Set start date"
        : daysRemaining > 0
          ? `${daysRemaining} days`
          : "Done!",
  };
}

export function computePracticeStreak(
  progress: ProgressState,
  dayPlan: DayPlanEntry[],
  today = new Date(),
) {
  if (!progress.startDate) {
    return 0;
  }

  const todayStart = startOfDay(today);
  let streak = 0;

  for (let index = dayPlan.length - 1; index >= 0; index -= 1) {
    const day = dayPlan[index];
    const scheduledDate = getPracticeDate(progress.startDate, day.day);

    if (scheduledDate > todayStart) {
      continue;
    }

    const completed =
      day.mock ||
      day.review ||
      day.problems.some(
        (problem) =>
          progress.completedProblems[getProblemStorageKey(day.day, problem.lc)],
      );

    if (!completed) {
      break;
    }

    streak += 1;
  }

  return streak;
}

export function computeRoadmapStats(progress: ProgressState): RoadmapStats {
  const statuses = Array.from({ length: ROADMAP_DAY_COUNT }, (_, index) => {
    return progress.roadmapStatuses[getRoadmapStorageKey(index + 1)] ?? "none";
  });

  const dsaDays = statuses.filter((status) => status === "dsa").length;
  const sdDays = statuses.filter((status) => status === "sd").length;

  let streak = 0;
  for (let index = statuses.length - 1; index >= 0; index -= 1) {
    if (statuses[index] === "none") {
      break;
    }

    streak += 1;
  }

  const monthProgress = [0, 30, 60].map((startIndex) => {
    const completed = statuses
      .slice(startIndex, startIndex + 30)
      .filter((status) => status !== "none").length;
    return Math.round((completed / 30) * 100);
  });

  return { dsaDays, sdDays, streak, monthProgress };
}

export function getDashboardSnapshot(
  progress: ProgressState,
  dayPlan: DayPlanEntry[],
  today = new Date(),
): DashboardSnapshot {
  const dayNumber = getCurrentPracticeDayNumber(progress.startDate, today);

  if (!dayNumber || dayNumber < 1 || dayNumber > dayPlan.length) {
    return {
      todayPlan: null,
      currentWeek: null,
      dayNumber: null,
      daysRemaining: getDaysRemaining(progress.startDate, today),
    };
  }

  const todayPlan = dayPlan.find((day) => day.day === dayNumber) ?? null;

  return {
    todayPlan,
    currentWeek: todayPlan?.week ?? null,
    dayNumber,
    daysRemaining: getDaysRemaining(progress.startDate, today),
  };
}
