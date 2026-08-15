import type {
  PracticeWeekFilter,
  ReferenceSection,
  RoadmapSection,
} from "@/lib/types";

export const roadmapSectionOptions: { label: string; value: RoadmapSection }[] =
  [
    { label: "Overview", value: "overview" },
    { label: "Weekly Plan", value: "weekly" },
    { label: "DSA Patterns", value: "patterns" },
    { label: "System Design", value: "system-design" },
    { label: "Daily Routine", value: "routine" },
  ];

export const referenceSectionOptions: {
  label: string;
  value: ReferenceSection;
}[] = [
  { label: "Mind Map", value: "mindmap" },
  { label: "Quick Ref", value: "quick-ref" },
  { label: "Framework", value: "framework" },
  { label: "Types & Strings", value: "types" },
  { label: "Collections", value: "collections" },
  { label: "Patterns", value: "patterns" },
  { label: "Traps", value: "traps" },
];

export function parseRoadmapSection(
  value: string | null | undefined,
): RoadmapSection {
  return roadmapSectionOptions.some((option) => option.value === value)
    ? (value as RoadmapSection)
    : "overview";
}

export function parseReferenceSection(
  value: string | null | undefined,
): ReferenceSection {
  return referenceSectionOptions.some((option) => option.value === value)
    ? (value as ReferenceSection)
    : "mindmap";
}

export function parsePracticeWeek(
  value: string | null | undefined,
): PracticeWeekFilter {
  if (value == null || value.length === 0) {
    return 1;
  }

  if (value === "all") {
    return "all";
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 12
    ? parsed
    : "all";
}
