"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import styles from "@/components/trace/trace-catalog.module.css";
import type { TraceCatalogSummary } from "@/lib/visualizer/types";

const difficulties = ["All", "E", "M", "H"] as const;

export function TraceCatalog({
  items,
}: {
  items: readonly TraceCatalogSummary[];
}) {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] =
    useState<(typeof difficulties)[number]>("All");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter(
      (item) =>
        (difficulty === "All" || item.difficulty === difficulty) &&
        (!needle ||
          `${item.lc} ${item.title} ${item.pattern} ${item.area}`
            .toLowerCase()
            .includes(needle)),
    );
  }, [difficulty, items, query]);
  const grouped = filtered.reduce((groups, item) => {
    groups.set(item.area, [...(groups.get(item.area) ?? []), item]);
    return groups;
  }, new Map<string, TraceCatalogSummary[]>());

  return (
    <>
      <div className={styles.filters}>
        <label className={styles.search}>
          <span>Find a trace</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, LC number, or pattern"
            type="search"
            value={query}
          />
        </label>
        <div
          aria-label="Filter by difficulty"
          className={styles.difficulty}
          role="group"
        >
          {difficulties.map((value) => (
            <button
              aria-pressed={difficulty === value}
              key={value}
              onClick={() => setDifficulty(value)}
              type="button"
            >
              {value === "All"
                ? "All levels"
                : value === "E"
                  ? "Easy"
                  : value === "M"
                    ? "Medium"
                    : "Hard"}
            </button>
          ))}
        </div>
      </div>

      <p aria-live="polite" className={styles.count}>
        {filtered.length} interactive traces
      </p>
      {filtered.length ? (
        <div className={styles.groups}>
          {[...grouped].map(([area, areaItems], groupIndex) => (
            <section
              aria-labelledby={`trace-group-${groupIndex}`}
              className={styles.group}
              key={area}
            >
              <div className={styles.groupHeading}>
                <span>{String(groupIndex + 1).padStart(2, "0")}</span>
                <h2 id={`trace-group-${groupIndex}`}>{area}</h2>
                <p>{areaItems.length} labs</p>
              </div>
              <div className={styles.rows}>
                {areaItems.map((item) => (
                  <Link
                    className={styles.row}
                    href={`/trace/${item.slug}`}
                    key={item.lc}
                  >
                    <span className={styles.lc}>LC {item.lc}</span>
                    <span className={styles.title}>
                      <strong>{item.title}</strong>
                      <small>{item.summary}</small>
                    </span>
                    <span className={styles.pattern}>{item.pattern}</span>
                    <span
                      className={`${styles.level} ${styles[`level${item.difficulty}`]}`}
                    >
                      {item.difficulty}
                    </span>
                    <span aria-hidden className={styles.arrow}>
                      ↗
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className={styles.noResults}>
          <strong>No trace matches that filter.</strong>
          <button
            onClick={() => {
              setQuery("");
              setDifficulty("All");
            }}
            type="button"
          >
            Reset filters
          </button>
        </div>
      )}
    </>
  );
}
