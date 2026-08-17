import type { TraceProblemDefinition } from "@/lib/visualizer/types";

export const containsDuplicateDefinition = {
  lc: 217,
  slug: "contains-duplicate",
  title: "Contains Duplicate",
  difficulty: "E",
  area: "Arrays and hashing",
  pattern: "Hash set",
  summary:
    "Watch a hash set turn each visited value into a constant-time duplicate check.",
  fields: [
    {
      id: "nums",
      label: "Numbers",
      type: "textarea",
      placeholder: "[4, 7, 2, 4]",
      help: "Enter a JSON array of up to 40 Java integers.",
      inputMode: "text",
    },
  ],
  presets: [
    {
      id: "duplicate-after-gap",
      label: "Duplicate after a gap",
      description: "The scan stops when 4 appears for the second time.",
      values: { nums: "[4, 7, 2, 4]" },
    },
    {
      id: "all-distinct",
      label: "All distinct",
      description: "Every insertion succeeds, so the entire array is scanned.",
      values: { nums: "[-3, 0, 8, 12]" },
    },
    {
      id: "empty",
      label: "Empty edge case",
      description:
        "With no values to inspect, the answer is immediately false.",
      values: { nums: "[]" },
    },
  ],
  anchors: [
    {
      id: "create-seen",
      label: "Create the seen set",
      fragment: "Set<Integer> seen = new HashSet<>();",
    },
    {
      id: "scan-values",
      label: "Scan each value",
      fragment: "for (int n : nums) {",
    },
    {
      id: "add-or-return",
      label: "Insert or detect a duplicate",
      fragment: "if (!seen.add(n)) return true;",
    },
    {
      id: "no-duplicate",
      label: "Finish without a duplicate",
      fragment: "return false;",
    },
  ],
  visualKinds: ["sequence", "associative"],
} as const satisfies TraceProblemDefinition;

export default containsDuplicateDefinition;
