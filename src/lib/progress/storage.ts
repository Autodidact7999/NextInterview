"use client";

import {
  LEGACY_STORAGE_KEYS,
  PROGRESS_STORAGE_KEY,
  createDefaultProgressState,
} from "@/lib/progress/constants";
import type { ProgressState, RoadmapDayStatus } from "@/lib/types";

function isBrowser() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function readJson<T>(key: string): T | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(key);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeProgress(progress: ProgressState) {
  if (!isBrowser()) {
    return progress;
  }

  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  return progress;
}

function normalizeRoadmapStatus(value: unknown): RoadmapDayStatus {
  return value === "dsa" || value === "sd" ? value : "none";
}

function getStoredProgress() {
  return readJson<ProgressState>(PROGRESS_STORAGE_KEY);
}

export const progressStorage = {
  getProgress(): ProgressState {
    return getStoredProgress() ?? createDefaultProgressState();
  },

  migrateLegacyState(): ProgressState {
    const existing = this.getProgress();

    if (existing.legacyMigrated) {
      return existing;
    }

    const completedProblems = {
      ...(readJson<Record<string, boolean>>(
        LEGACY_STORAGE_KEYS.completedProblems,
      ) ?? {}),
      ...existing.completedProblems,
    };

    const legacyTracker =
      readJson<Record<string, string>>(LEGACY_STORAGE_KEYS.roadmapTracker) ??
      {};
    const roadmapStatuses = { ...existing.roadmapStatuses };

    for (const [legacyKey, value] of Object.entries(legacyTracker)) {
      if (!legacyKey.startsWith("d-")) {
        continue;
      }

      const dayIndex = Number(legacyKey.slice(2));

      if (!Number.isFinite(dayIndex)) {
        continue;
      }

      roadmapStatuses[`roadmap-${dayIndex + 1}`] =
        normalizeRoadmapStatus(value);
    }

    const nextState: ProgressState = {
      ...existing,
      startDate:
        existing.startDate ??
        (isBrowser()
          ? window.localStorage.getItem(LEGACY_STORAGE_KEYS.startDate)
          : null),
      completedProblems,
      roadmapStatuses,
      legacyMigrated: true,
      updatedAt: new Date().toISOString(),
    };

    return writeProgress(nextState);
  },

  replace(progress: ProgressState): ProgressState {
    return writeProgress(progress);
  },

  setStartDate(date: string | null): ProgressState {
    const current = this.getProgress();
    return writeProgress({
      ...current,
      startDate: date,
      updatedAt: new Date().toISOString(),
    });
  },

  toggleProblem(dayId: number, problemId: number): ProgressState {
    const current = this.getProgress();
    const key = `day${dayId}_prob${problemId}`;
    const completedProblems = {
      ...current.completedProblems,
      [key]: !current.completedProblems[key],
    };

    return writeProgress({
      ...current,
      completedProblems,
      updatedAt: new Date().toISOString(),
    });
  },

  setProblemCompletion(
    dayId: number,
    problemId: number,
    checked: boolean,
  ): ProgressState {
    const current = this.getProgress();
    const key = `day${dayId}_prob${problemId}`;

    return writeProgress({
      ...current,
      completedProblems: {
        ...current.completedProblems,
        [key]: checked,
      },
      updatedAt: new Date().toISOString(),
    });
  },

  cycleRoadmapDayStatus(dayId: number): ProgressState {
    const current = this.getProgress();
    const key = `roadmap-${dayId}`;
    const existing = normalizeRoadmapStatus(current.roadmapStatuses[key]);
    const nextStatus: RoadmapDayStatus =
      existing === "none" ? "dsa" : existing === "dsa" ? "sd" : "none";

    return writeProgress({
      ...current,
      roadmapStatuses: {
        ...current.roadmapStatuses,
        [key]: nextStatus,
      },
      updatedAt: new Date().toISOString(),
    });
  },
};
