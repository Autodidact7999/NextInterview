"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AccountControl } from "@/components/auth/account-control";
import styles from "@/components/layout/app-shell.module.css";
import { practiceDayPlan } from "@/content/practice";
import { useProgress } from "@/lib/progress/context";
import { computePracticeStats } from "@/lib/progress/metrics";

const navItems = [
  {
    href: "/",
    label: "Today",
    mobileLabel: "Today",
    caption: "Your next study block",
    index: "01",
  },
  {
    href: "/roadmap",
    label: "Roadmap",
    mobileLabel: "Roadmap",
    caption: "The 12-week strategy",
    index: "02",
  },
  {
    href: "/practice",
    label: "Practice",
    mobileLabel: "Practice",
    caption: "Daily problem sessions",
    index: "03",
  },
  {
    href: "/trace",
    label: "Trace Lab",
    mobileLabel: "Trace",
    caption: "Interactive algorithm states",
    index: "04",
  },
  {
    href: "/reference",
    label: "Reference",
    mobileLabel: "Reference",
    caption: "Java and DSA recall",
    index: "05",
  },
  {
    href: "/progress",
    label: "Progress",
    mobileLabel: "Progress",
    caption: "Momentum and history",
    index: "06",
  },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span
      aria-hidden
      className={compact ? styles.mobileMark : styles.brandMark}
    >
      <span className={styles.brandLetter}>N</span>
      <span className={styles.brandSlash}>/</span>
      <span className={styles.brandLetter}>I</span>
    </span>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { hydrated, progress } = useProgress();
  const currentItem =
    navItems.find((item) => isActive(pathname, item.href)) ?? navItems[0];
  const practiceStats = computePracticeStats(progress, practiceDayPlan);
  const practicePercent = Math.round(
    (practiceStats.solved / practiceStats.total) * 100,
  );

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>

      <aside className={styles.sidebar}>
        <Link aria-label="NextInterview home" className={styles.brand} href="/">
          <BrandMark />
          <span className={styles.brandCopy}>
            <strong className={styles.brandName}>NextInterview</strong>
            <span className={styles.brandCaption}>Study workspace</span>
          </span>
        </Link>

        <nav aria-label="Primary" className={styles.nav}>
          <p className={styles.navHeading}>Workspace</p>
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
                href={item.href}
                key={item.href}
              >
                <span aria-hidden className={styles.navIndex}>
                  {item.index}
                </span>
                <span className={styles.navCopy}>
                  <strong className={styles.navLabel}>{item.label}</strong>
                  <span className={styles.navCaption}>{item.caption}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <section aria-label="Practice completion" className={styles.runStatus}>
          <div className={styles.runStatusTopline}>
            <span>84-day practice</span>
            <strong>{hydrated ? `${practicePercent}%` : "—"}</strong>
          </div>
          <div aria-hidden className={styles.runTrack}>
            <span style={{ width: `${hydrated ? practicePercent : 0}%` }} />
          </div>
          <div className={styles.runMeta}>
            <span>
              {hydrated
                ? `${practiceStats.solved} of ${practiceStats.total} problems`
                : "Syncing progress"}
            </span>
            <Link href="/progress">Review</Link>
          </div>
        </section>
      </aside>

      <div className={styles.mainColumn}>
        <header className={styles.topbar}>
          <div className={styles.topbarContext}>
            <span className={styles.topbarBreadcrumb}>Workspace</span>
            <span aria-hidden className={styles.topbarDivider}>
              /
            </span>
            <strong>{currentItem.label}</strong>
          </div>
          <div className={styles.topbarActions}>
            <span className={styles.topbarStatus}>
              <span aria-hidden className={styles.statusDot} />
              {hydrated ? currentItem.caption : "Syncing your plan"}
            </span>
            <AccountControl />
          </div>
        </header>

        <header className={styles.mobileHeader}>
          <Link
            aria-label="NextInterview home"
            className={styles.mobileBrand}
            href="/"
          >
            <BrandMark compact />
            <span className={styles.brandCopy}>
              <span className={styles.mobileEyebrow}>NextInterview</span>
              <strong>{currentItem.label}</strong>
            </span>
          </Link>
          <div className={styles.mobileActions}>
            <span className={styles.mobileProgress}>
              {hydrated ? `${practicePercent}%` : "—"}
            </span>
            <AccountControl />
          </div>
        </header>

        <main className={styles.mainContent} id="main-content">
          {children}
        </main>
      </div>

      <nav aria-label="Mobile navigation" className={styles.mobileNav}>
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`${styles.mobileNavItem} ${active ? styles.mobileNavItemActive : ""}`}
              href={item.href}
              key={item.href}
            >
              <span aria-hidden className={styles.mobileNavIndex}>
                {item.index}
              </span>
              <span>{item.mobileLabel}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
