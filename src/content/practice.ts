import {
  practiceDayPlan,
  practiceSolutions as rawPracticeSolutions,
  practiceWeekMeta as rawPracticeWeekMeta,
} from "@/content/practice.generated";
import type { SolutionMap, WeekMetaMap } from "@/lib/types";

export { practiceDayPlan };

export const practiceWeekMeta: WeekMetaMap = rawPracticeWeekMeta;
export const practiceSolutions: SolutionMap = rawPracticeSolutions;

export const practiceWeekFilters = [
  { label: "All Weeks", value: "all" },
  { label: "Week 1", value: "1" },
  { label: "Week 2", value: "2" },
  { label: "Week 3", value: "3" },
  { label: "Week 4", value: "4" },
  { label: "Week 5", value: "5" },
  { label: "Week 6", value: "6" },
  { label: "Week 7", value: "7" },
  { label: "Week 8", value: "8" },
  { label: "Week 9", value: "9" },
  { label: "Week 10", value: "10" },
  { label: "Week 11", value: "11" },
  { label: "Week 12", value: "12" },
] as const;
