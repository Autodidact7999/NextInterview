import type { ProgressState } from "@/lib/types";

export const PROGRESS_STORAGE_KEY = "next_interview_progress_v1";

export const LEGACY_STORAGE_KEYS = {
  startDate: "dsa_start_date",
  completedProblems: "day_problems_v1",
  roadmapTracker: "prep_v2",
} as const;

export const ROADMAP_DAY_COUNT = 90;
export const PRACTICE_DAY_COUNT = 84;

export function createDefaultProgressState(): ProgressState {
  return {
    startDate: null,
    completedProblems: {},
    roadmapStatuses: {},
    legacyMigrated: false,
    updatedAt: new Date(0).toISOString(),
  };
}
