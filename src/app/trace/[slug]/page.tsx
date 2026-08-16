import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { TraceWorkspace } from "@/components/trace/trace-workspace";
import {
  getTraceCatalogItemBySlug,
  traceDefinitions,
} from "@/content/visualizations/catalog";
import { prepareJavaCode } from "@/lib/visualizer/code";

export const dynamicParams = false;

interface TracePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return traceDefinitions.map((definition) => ({ slug: definition.slug }));
}

export async function generateMetadata({
  params,
}: TracePageProps): Promise<Metadata> {
  const { slug } = await params;
  const problem = getTraceCatalogItemBySlug(slug);
  return problem
    ? {
        title: `${problem.title} Trace | NextInterview`,
        description: `Trace LC ${problem.lc} ${problem.title} with custom input and Java code anchors.`,
      }
    : { title: "Trace not found | NextInterview" };
}

export default async function TraceProblemPage({ params }: TracePageProps) {
  const { slug } = await params;
  const problem = getTraceCatalogItemBySlug(slug);
  if (!problem) notFound();
  const codeLines = await prepareJavaCode(problem.code, problem.anchors);

  return (
    <div className="app-page page-stack trace-page">
      <header className="page-header">
        <div className="page-header-copy">
          <p className="eyebrow">
            LC {problem.lc} · {problem.area}
          </p>
          <h1 className="page-title">{problem.title}</h1>
          <p className="page-description">{problem.summary}</p>
        </div>
        <div className="header-actions">
          <span className="badge">
            {problem.difficulty === "E"
              ? "Easy"
              : problem.difficulty === "M"
                ? "Medium"
                : "Hard"}
          </span>
          <Link className="button-secondary" href="/trace">
            All traces
          </Link>
        </div>
      </header>
      <Suspense fallback={<p>Preparing the trace workspace…</p>}>
        <TraceWorkspace
          key={problem.slug}
          problem={{ ...problem, codeLines }}
        />
      </Suspense>
    </div>
  );
}
