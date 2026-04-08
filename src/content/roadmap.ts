import {
  roadmapPatterns,
  roadmapWeeks,
  systemDesignTopics,
} from "@/content/roadmap.generated";
import type { RevisionInterval, RoutineBlock } from "@/lib/types";

export { roadmapPatterns, roadmapWeeks, systemDesignTopics };

export const roadmapHighlights = [
  { value: "230+", label: "LeetCode problems" },
  { value: "15", label: "DSA patterns" },
  { value: "12", label: "System design case studies" },
] as const;

export const weekdayRoutine: RoutineBlock[] = [
  {
    label: "30 min",
    title: "Revision (Anki / notes)",
    description:
      "Review yesterday's pattern, re-read your solution, and note the edge cases you missed.",
  },
  {
    label: "60 min",
    title: "New problem x 2",
    description:
      "Month 1 starts with one easy and one medium, then ramps into two mediums, then a medium plus a hard as the schedule matures.",
  },
  {
    label: "30 min",
    title: "Pattern study",
    description:
      "Study the week's pattern, write the template from memory, and keep the mental model tight.",
  },
  {
    label: "30 min",
    title: "System Design",
    description:
      "Month 1 is component literacy. Month 2 and beyond shift into paper designs, trade-offs, and speaking decisions aloud.",
  },
] satisfies RoutineBlock[];

export const weekendRoutine: RoutineBlock[] = [
  {
    label: "Saturday",
    title: "Timed mock set",
    description:
      "Three problems in 90 minutes with no hints, followed by a full review of optimal solution and alternatives.",
  },
  {
    label: "Sunday",
    title: "System Design deep-dive",
    description:
      "One 45-minute case study plus weak-area review from the week.",
  },
] satisfies RoutineBlock[];

export const revisionSchedule: RevisionInterval[] = [
  {
    interval: "Day 1",
    description:
      "Solve the problem and write the pattern insight in your notes.",
  },
  {
    interval: "Day 3",
    description: "Re-solve it from scratch without looking.",
  },
  {
    interval: "Day 7",
    description: "Do a similar problem and compare the trade-offs.",
  },
  {
    interval: "Day 21",
    description: "Full re-solve plus a verbal explanation.",
  },
  {
    interval: "Week 11-12",
    description: "Return to every flagged hard problem.",
  },
] satisfies RevisionInterval[];
