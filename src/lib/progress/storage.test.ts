import { beforeEach, describe, expect, it } from "vitest";

import {
  LEGACY_STORAGE_KEYS,
  PROGRESS_STORAGE_KEY,
} from "@/lib/progress/constants";
import { progressStorage } from "@/lib/progress/storage";

describe("progressStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("migrates legacy localStorage keys into the normalized progress record", () => {
    window.localStorage.setItem(LEGACY_STORAGE_KEYS.startDate, "2026-04-01");
    window.localStorage.setItem(
      LEGACY_STORAGE_KEYS.completedProblems,
      JSON.stringify({
        day1_prob1: true,
        day2_prob3: false,
      }),
    );
    window.localStorage.setItem(
      LEGACY_STORAGE_KEYS.roadmapTracker,
      JSON.stringify({
        "d-0": "dsa",
        "d-1": "sd",
      }),
    );

    const migrated = progressStorage.migrateLegacyState();

    expect(migrated.startDate).toBe("2026-04-01");
    expect(migrated.completedProblems.day1_prob1).toBe(true);
    expect(migrated.roadmapStatuses["roadmap-1"]).toBe("dsa");
    expect(migrated.roadmapStatuses["roadmap-2"]).toBe("sd");
    expect(migrated.legacyMigrated).toBe(true);
    expect(window.localStorage.getItem(PROGRESS_STORAGE_KEY)).toContain(
      "roadmap-1",
    );
  });

  it("toggles problem completion and cycles roadmap statuses", () => {
    progressStorage.migrateLegacyState();

    const afterProblemToggle = progressStorage.toggleProblem(3, 560);
    expect(afterProblemToggle.completedProblems.day3_prob560).toBe(true);

    const afterRoadmapToggle = progressStorage.cycleRoadmapDayStatus(5);
    expect(afterRoadmapToggle.roadmapStatuses["roadmap-5"]).toBe("dsa");
    expect(
      progressStorage.cycleRoadmapDayStatus(5).roadmapStatuses["roadmap-5"],
    ).toBe("sd");
    expect(
      progressStorage.cycleRoadmapDayStatus(5).roadmapStatuses["roadmap-5"],
    ).toBe("none");
  });
});
