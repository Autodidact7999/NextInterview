"use client";

import { useState } from "react";

import { useAuth } from "@/lib/auth/context";
import { useProgress } from "@/lib/progress/context";

import styles from "@/components/auth/account-control.module.css";

export function AccountControl() {
  const { configured, signInWithGoogle, signOut, status, user } = useAuth();
  const { syncStatus } = useProgress();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!configured) {
    return null;
  }

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);

    try {
      await action();
    } catch {
      setError("Could not update your account. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (status === "loading") {
    return <span className={styles.status}>Checking account...</span>;
  }

  if (!user) {
    return (
      <div className={styles.control}>
        <button
          className={styles.googleButton}
          disabled={busy}
          onClick={() => void run(signInWithGoogle)}
          type="button"
        >
          <GoogleMark />
          {busy ? "Opening Google..." : "Sign in with Google"}
        </button>
        {error ? <span className={styles.error}>{error}</span> : null}
      </div>
    );
  }

  const name = user.user_metadata.full_name || user.email || "Google account";

  return (
    <div className={styles.account}>
      <div className={styles.identity}>
        <span className={styles.avatar} aria-hidden>
          {name.slice(0, 1).toUpperCase()}
        </span>
        <span className={styles.name}>{name}</span>
        <span className={styles.sync}>
          {syncStatus === "syncing"
            ? "Saving..."
            : syncStatus === "error"
              ? "Save failed"
              : "Saved"}
        </span>
      </div>
      <button
        aria-label="Sign out"
        className={styles.signOut}
        disabled={busy}
        onClick={() => void run(signOut)}
        title="Sign out"
        type="button"
      >
        Sign out
      </button>
      {error ? <span className={styles.error}>{error}</span> : null}
    </div>
  );
}

function GoogleMark() {
  return (
    <span className={styles.googleMark} aria-hidden>
      G
    </span>
  );
}
