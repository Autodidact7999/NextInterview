"use client";

import { useEffect, useState } from "react";

import { useProgress } from "@/lib/progress/context";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { progress } = useProgress();

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <SettingsModalContent
      initialDate={progress.startDate ?? ""}
      onClose={onClose}
    />
  );
}

function SettingsModalContent({
  initialDate,
  onClose,
}: {
  initialDate: string;
  onClose: () => void;
}) {
  const { setStartDate } = useProgress();
  const [draftDate, setDraftDate] = useState(initialDate);

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        aria-labelledby="settings-modal-title"
        aria-modal="true"
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <p className="eyebrow">Practice Settings</p>
          <h2 className="section-title" id="settings-modal-title">
            Choose your Day 1 date
          </h2>
          <p className="section-copy">
            We&apos;ll use it to highlight today, pace your calendar, and track
            your streak.
          </p>
        </div>
        <div className="modal-body">
          <div className="form-stack">
            <label className="field-label" htmlFor="start-date">
              Start date
              <input
                aria-label="Start date"
                className="text-input"
                id="start-date"
                onChange={(event) => setDraftDate(event.target.value)}
                type="date"
                value={draftDate}
              />
            </label>
            <p className="subtle">
              Leave it blank if you want to explore first and lock in the plan
              later.
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <button className="button-secondary" onClick={onClose} type="button">
            Cancel
          </button>
          <button
            className="button-primary"
            onClick={() => {
              setStartDate(draftDate || null);
              onClose();
            }}
            type="button"
          >
            Save start date
          </button>
        </div>
      </div>
    </div>
  );
}
