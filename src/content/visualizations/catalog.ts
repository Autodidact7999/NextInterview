import { traceDefinitions } from "@/content/visualizations/catalog.generated";
import { traceSlugByLc } from "@/content/visualizations/links.generated";
import { practiceDayPlan, practiceSolutions } from "@/content/practice";
import type {
  TraceCatalogItem,
  TraceCatalogSummary,
  TraceProblemDefinition,
  TraceSourceContext,
} from "@/lib/visualizer/types";

export { traceDefinitions, traceSlugByLc };

export function getTraceCatalogSummaries(): readonly TraceCatalogSummary[] {
  return traceDefinitions.map(
    ({ lc, slug, title, difficulty, area, pattern, summary, visualKinds }) => ({
      lc,
      slug,
      title,
      difficulty,
      area,
      pattern,
      summary,
      visualKinds,
    }),
  );
}

export function getTraceDefinitionBySlug(
  slug: string,
): TraceProblemDefinition | undefined {
  return traceDefinitions.find((definition) => definition.slug === slug);
}

export function getTraceCatalog(): readonly TraceCatalogItem[] {
  return traceDefinitions.map((definition) => {
    const solution = practiceSolutions[definition.lc];
    if (!solution)
      throw new Error(`Missing Java solution for LC ${definition.lc}.`);
    const days = practiceDayPlan
      .filter((day) =>
        day.problems.some((problem) => problem.lc === definition.lc),
      )
      .map((day) => ({ day: day.day, week: day.week }));
    return {
      ...definition,
      code: solution.code,
      time: solution.time,
      space: solution.space,
      days,
    };
  });
}

export function getTraceCatalogItemBySlug(
  slug: string,
): TraceCatalogItem | undefined {
  return getTraceCatalog().find((item) => item.slug === slug);
}

export function getValidatedTraceContext(
  lc: number,
  rawDay: string | string[] | undefined,
): TraceSourceContext | null {
  const dayNumber = Number(Array.isArray(rawDay) ? rawDay[0] : rawDay);
  if (!Number.isInteger(dayNumber)) return null;
  const day = practiceDayPlan.find((entry) => entry.day === dayNumber);
  return day?.problems.some((problem) => problem.lc === lc)
    ? { day: day.day, week: day.week }
    : null;
}
