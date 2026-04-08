"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { createDefaultProgressState } from "@/lib/progress/constants";
import { progressStorage } from "@/lib/progress/storage";
import type { ProgressState } from "@/lib/types";

interface ProgressContextValue {
  hydrated: boolean;
  progress: ProgressState;
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
  const [progress, setProgress] = useState<ProgressState>(
    createDefaultProgressState,
  );
  const [hydrated, setHydrated] = useState(false);

  const refresh = () => {
    const migrated = progressStorage.migrateLegacyState();
    setProgress(migrated);
    setHydrated(true);
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      refresh();
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const value = useMemo<ProgressContextValue>(
    () => ({
      hydrated,
      progress,
      setStartDate(date) {
        setProgress(progressStorage.setStartDate(date));
      },
      toggleProblem(dayId, problemId) {
        setProgress(progressStorage.toggleProblem(dayId, problemId));
      },
      setProblemCompletion(dayId, problemId, checked) {
        setProgress(
          progressStorage.setProblemCompletion(dayId, problemId, checked),
        );
      },
      cycleRoadmapDayStatus(dayId) {
        setProgress(progressStorage.cycleRoadmapDayStatus(dayId));
      },
      refresh,
    }),
    [hydrated, progress],
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);

  if (!context) {
    throw new Error("useProgress must be used inside ProgressProvider");
  }

  return context;
}
