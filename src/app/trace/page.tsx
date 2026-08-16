import type { Metadata } from "next";

import { TraceCatalog } from "@/components/trace/trace-catalog";
import { getTraceCatalogSummaries } from "@/content/visualizations/catalog";

export const metadata: Metadata = {
  title: "Trace Lab | NextInterview",
  description:
    "Practice interview algorithms by predicting and inspecting each state change.",
};

export default function TraceCatalogPage() {
  const catalog = getTraceCatalogSummaries();
  return (
    <div className="app-page page-stack">
      <header className="page-header">
        <div className="page-header-copy">
          <p className="eyebrow">Trace Lab · 20 Java walkthroughs</p>
          <h1 className="page-title">See the invariant move.</h1>
          <p className="page-description">
            Bring your own input, predict the next decision, and inspect every
            state change against the exact Java solution in your practice plan.
          </p>
        </div>
      </header>
      <TraceCatalog items={catalog} />
    </div>
  );
}
