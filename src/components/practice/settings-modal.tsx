"use client";

import { useEffect, useRef, useState } from "react";

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();

    return () => previouslyFocused?.focus();
  }, []);

  const keepFocusInDialog = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") {
      return;
    }

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    );

    if (!focusable?.length) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        aria-describedby="settings-modal-description"
        aria-labelledby="settings-modal-title"
        aria-modal="true"
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={keepFocusInDialog}
        ref={dialogRef}
        role="dialog"
      >
        <div className="modal-header">
          <p className="eyebrow">Practice Settings</p>
          <h2 className="section-title" id="settings-modal-title">
            Choose your Day 1 date
          </h2>
          <p className="section-copy" id="settings-modal-description">
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
                ref={inputRef}
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
