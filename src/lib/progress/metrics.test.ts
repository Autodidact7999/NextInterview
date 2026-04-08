import { describe, expect, it } from "vitest";

import { practiceDayPlan } from "@/content/practice";
import {
  computePracticeStats,
  computePracticeStreak,
  getCurrentPracticeDayNumber,
  getDashboardSnapshot,
  getDaysRemaining,
  getPracticeDate,
} from "@/lib/progress/metrics";
import type { ProgressState } from "@/lib/types";

const baseProgress: ProgressState = {
  startDate: "2026-04-01",
  completedProblems: {
    day1_prob1: true,
    day2_prob3: true,
    day3_prob560: true,
  },
  roadmapStatuses: {
    "roadmap-1": "dsa",
    "roadmap-2": "sd",
  },
  legacyMigrated: true,
  updatedAt: "2026-04-01T00:00:00.000Z",
};

describe("progress metrics", () => {
  it("calculates schedule dates and current day numbers", () => {
    expect(getPracticeDate("2026-04-01", 3).toISOString().slice(0, 10)).toBe(
      "2026-04-03",
    );
    expect(
      getCurrentPracticeDayNumber(
        "2026-04-01",
        new Date("2026-04-06T12:00:00.000Z"),
      ),
    ).toBe(6);
  });

  it("computes remaining days and streaks", () => {
    expect(
      getDaysRemaining("2026-04-01", new Date("2026-04-06T12:00:00.000Z")),
    ).toBe(78);
    expect(
      computePracticeStreak(
        baseProgress,
        practiceDayPlan,
        new Date("2026-04-03T12:00:00.000Z"),
      ),
    ).toBe(3);
  });

  it("builds the dashboard snapshot and summary stats", () => {
    const snapshot = getDashboardSnapshot(
      baseProgress,
      practiceDayPlan,
      new Date("2026-04-02T12:00:00.000Z"),
    );
    const stats = computePracticeStats(
      baseProgress,
      practiceDayPlan,
      new Date("2026-04-03T12:00:00.000Z"),
    );

    expect(snapshot.dayNumber).toBe(2);
    expect(snapshot.currentWeek).toBe(1);
    expect(snapshot.todayPlan?.focus).toContain("Sliding Window");
    expect(stats.solved).toBe(3);
    expect(stats.total).toBeGreaterThan(100);
    expect(stats.remainingLabel).toBe("81 days");
  });
});
