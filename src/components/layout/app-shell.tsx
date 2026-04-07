"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "@/components/layout/app-shell.module.css";

type NavIconName =
  | "dashboard"
  | "roadmap"
  | "practice"
  | "reference"
  | "progress";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: "dashboard",
    caption: "Today's focus",
  },
  {
    href: "/roadmap",
    label: "Roadmap",
    icon: "roadmap",
    caption: "12-week game plan",
  },
  {
    href: "/practice",
    label: "Practice",
    icon: "practice",
    caption: "84-day problem reps",
  },
  {
    href: "/reference",
    label: "Reference",
    icon: "reference",
    caption: "Java pattern library",
  },
  {
    href: "/progress",
    label: "Progress",
    icon: "progress",
    caption: "Momentum and streaks",
  },
] as const;

const studyCadence = [
  {
    step: "01",
    title: "Orient",
    copy: "Start from the dashboard or roadmap so the session has one clear objective.",
  },
  {
    step: "02",
    title: "Solve",
    copy: "Use practice for deliberate reps and keep the pace calm enough to explain aloud.",
  },
  {
    step: "03",
    title: "Lock it in",
    copy: "Open reference or progress when you need recall support or an honest review.",
  },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function ShellIcon({ name }: { name: NavIconName }) {
  const commonProps = {
    "aria-hidden": true,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...commonProps}>
          <rect height="7" rx="2" width="7" x="3" y="3" />
          <rect height="11" rx="2" width="7" x="14" y="3" />
          <rect height="7" rx="2" width="7" x="14" y="14" />
          <rect height="11" rx="2" width="7" x="3" y="10" />
        </svg>
      );
    case "roadmap":
      return (
        <svg {...commonProps}>
          <path d="M5 19V5" />
          <path d="M5 6c4-3 10 3 14 0v8c-4 3-10-3-14 0" />
        </svg>
      );
    case "practice":
      return (
        <svg {...commonProps}>
          <rect height="16" rx="3" width="16" x="4" y="4" />
          <path d="M8 9h8" />
          <path d="m8.5 13 2 2 5-5" />
        </svg>
      );
    case "reference":
      return (
        <svg {...commonProps}>
          <path d="M6 4.5h9a3 3 0 0 1 3 3V19H9a3 3 0 0 0-3 3Z" />
          <path d="M6 4.5V19a3 3 0 0 0 3 3" />
          <path d="M10 9h5" />
          <path d="M10 13h5" />
        </svg>
      );
    case "progress":
      return (
        <svg {...commonProps}>
          <path d="M4 19h16" />
          <path d="M7 16V9" />
          <path d="M12 16V5" />
          <path d="M17 16v-4" />
        </svg>
      );
    default:
      return null;
  }
}

function BrandGlyph() {
  return (
    <svg
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
      viewBox="0 0 24 24"
    >
      <path d="M4 18.5 12 5l8 13.5" />
      <path d="M8.5 12.5h7" />
      <path d="M10 16h4" />
      <circle cx="12" cy="5" fill="currentColor" r="1.2" stroke="none" />
    </svg>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentItem =
    navItems.find((item) => isActive(pathname, item.href)) ?? navItems[0];

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>

      <aside className={styles.sidebar}>
        <div className={styles.brandPanel}>
          <div className={styles.brandBlock}>
            <div className={styles.brandMark}>
              <BrandGlyph />
            </div>
            <div>
              <p className={styles.brandEyebrow}>NextInterview</p>
              <p className={styles.brandTitle}>Interview Prep Studio</p>
            </div>
          </div>
          <p className={styles.brandBody}>
            A steadier workspace for DSA and system design prep when you want
            clarity before speed.
          </p>
          <div className={styles.brandSignals}>
            <span className={styles.signalPill}>12-week roadmap</span>
            <span className={styles.signalPill}>84-day reps</span>
          </div>
        </div>

        <nav aria-label="Primary" className={styles.nav}>
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
                href={item.href}
              >
                <span className={styles.navIcon}>
                  <ShellIcon name={item.icon} />
                </span>
                <span>
                  <strong className={styles.navLabel}>{item.label}</strong>
                  <span className={styles.navCaption}>{item.caption}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarNotice}>
          <p className={styles.sidebarNoticeTitle}>A simple cadence</p>
          <ol className={styles.cadenceList}>
            {studyCadence.map((item) => (
              <li className={styles.cadenceItem} key={item.step}>
                <span className={styles.cadenceStep}>{item.step}</span>
                <div>
                  <strong className={styles.cadenceTitle}>{item.title}</strong>
                  <p className={styles.cadenceCopy}>{item.copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </aside>

      <div className={styles.mainColumn}>
        <header className={styles.desktopHeader}>
          <div>
            <p className={styles.desktopEyebrow}>Current space</p>
            <p className={styles.desktopTitle}>{currentItem.label}</p>
          </div>
          <span className={styles.desktopBadge}>{currentItem.caption}</span>
        </header>

        <header className={styles.mobileHeader}>
          <div className={styles.mobileBrandBlock}>
            <div className={`${styles.brandMark} ${styles.mobileBrandMark}`}>
              <BrandGlyph />
            </div>
            <div>
              <p className={styles.mobileEyebrow}>NextInterview</p>
              <p className={styles.mobileTitle}>Prep Studio</p>
            </div>
          </div>
          <div className={styles.mobileContext}>
            <p className={styles.mobileContextLabel}>Current space</p>
            <p className={styles.mobileContextTitle}>{currentItem.label}</p>
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
              key={item.href}
              className={`${styles.mobileNavItem} ${active ? styles.mobileNavItemActive : ""}`}
              href={item.href}
            >
              <span className={styles.mobileNavIcon}>
                <ShellIcon name={item.icon} />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
