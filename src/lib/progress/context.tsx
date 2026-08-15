"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/lib/auth/context";
import { createDefaultProgressState } from "@/lib/progress/constants";
import { progressStorage } from "@/lib/progress/storage";
import { supabase } from "@/lib/supabase/client";
import type { ProgressState } from "@/lib/types";

type SyncStatus = "idle" | "syncing" | "synced" | "error";

interface ProgressContextValue {
  hydrated: boolean;
  progress: ProgressState;
  syncStatus: SyncStatus;
  setStartDate: (date: string | null) => void;
  toggleProblem: (dayId: number, problemId: number) => void;
  setProblemCompletion: (
    dayId: number,
    problemId: number,
    checked: boolean,
  ) => void;
  cycleRoadmapDayStatus: (dayId: number) => void;
  refresh: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressState>(
    createDefaultProgressState,
  );
  const [hydrated, setHydrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");

  const refresh = useCallback(() => {
    const migrated = progressStorage.migrateLegacyState();
    setProgress(migrated);
    setHydrated(true);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      refresh();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [refresh]);

  useEffect(() => {
    const client = supabase;

    if (!hydrated || !user || !client) {
      return;
    }

    let active = true;

    const loadCloudProgress = async () => {
      setSyncStatus("syncing");
      const local = progressStorage.getProgress();
      const { data, error } = await client
        .from("user_progress")
        .select("progress")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!active) {
        return;
      }

      if (error) {
        setSyncStatus("error");
        return;
      }

      const cloud = isProgressState(data?.progress) ? data.progress : null;
      const next = cloud && cloud.updatedAt > local.updatedAt ? cloud : local;

      progressStorage.replace(next);
      setProgress(next);

      const { error: saveError } = await client
        .from("user_progress")
        .upsert({ user_id: user.id, progress: next });

      if (active) {
        setSyncStatus(saveError ? "error" : "synced");
      }
    };

    void loadCloudProgress();

    return () => {
      active = false;
    };
  }, [hydrated, user]);

  const updateProgress = useCallback(
    (next: ProgressState) => {
      setProgress(next);
      const client = supabase;

      if (!user || !client) {
        return;
      }

      setSyncStatus("syncing");
      void client
        .from("user_progress")
        .upsert({ user_id: user.id, progress: next })
        .then(({ error }) => setSyncStatus(error ? "error" : "synced"));
    },
    [user],
  );

  const value = useMemo<ProgressContextValue>(
    () => ({
      hydrated,
      progress,
      syncStatus,
      setStartDate(date) {
        updateProgress(progressStorage.setStartDate(date));
      },
      toggleProblem(dayId, problemId) {
        updateProgress(progressStorage.toggleProblem(dayId, problemId));
      },
      setProblemCompletion(dayId, problemId, checked) {
        updateProgress(
          progressStorage.setProblemCompletion(dayId, problemId, checked),
        );
      },
      cycleRoadmapDayStatus(dayId) {
        updateProgress(progressStorage.cycleRoadmapDayStatus(dayId));
      },
      refresh,
    }),
    [hydrated, progress, refresh, syncStatus, updateProgress],
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

function isProgressState(value: unknown): value is ProgressState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ProgressState>;

  return (
    (typeof candidate.startDate === "string" || candidate.startDate === null) &&
    typeof candidate.completedProblems === "object" &&
    candidate.completedProblems !== null &&
    typeof candidate.roadmapStatuses === "object" &&
    candidate.roadmapStatuses !== null &&
    typeof candidate.legacyMigrated === "boolean" &&
    typeof candidate.updatedAt === "string"
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);

  if (!context) {
    throw new Error("useProgress must be used inside ProgressProvider");
  }

  return context;
}
