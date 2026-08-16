import type { TraceProblemDefinition } from "@/lib/visualizer";

export const longestConsecutiveSequenceDefinition = {
  lc: 128,
  slug: "longest-consecutive-sequence",
  title: "Longest Consecutive Sequence",
  difficulty: "M",
  area: "Arrays and hashing",
  pattern: "Hash set / sequence starts",
  summary:
    "Turn an unordered input into sequence-start checks, then grow only the runs that cannot have been counted earlier.",
  fields: [
    {
      id: "nums",
      label: "Numbers",
      type: "textarea",
      placeholder: "[100, 4, 200, 1, 3, 2]",
      help: "Enter up to 40 Java integers. The two int endpoints are excluded so the Java ±1 checks cannot overflow.",
      inputMode: "text",
    },
  ],
  presets: [
    {
      id: "unordered-run",
      label: "Unordered run",
      description:
        "The values 1 through 4 arrive out of order but form the longest sequence.",
      values: { nums: "[100, 4, 200, 1, 3, 2]" },
    },
    {
      id: "duplicates-and-negatives",
      label: "Duplicates and negatives",
      description:
        "A duplicate disappears in the set while the run from −1 through 2 remains.",
      values: { nums: "[2, -1, 0, 1, 2, 9]" },
    },
    {
      id: "empty",
      label: "Empty edge case",
      description:
        "No sequence exists, so the initialized maximum is returned.",
      values: { nums: "[]" },
    },
  ],
  anchors: [
    {
      id: "create-set",
      label: "Create the value set",
      fragment: "Set<Integer> set = new HashSet<>();",
    },
    {
      id: "fill-set",
      label: "Deduplicate the input",
      fragment: "for (int n : nums) set.add(n);",
    },
    {
      id: "initialize-max",
      label: "Initialize the best length",
      fragment: "int max = 0;",
    },
    {
      id: "scan-set",
      label: "Inspect each unique value",
      fragment: "for (int n : set) {",
    },
    {
      id: "find-start",
      label: "Recognize a sequence start",
      fragment: "if (!set.contains(n - 1)) {",
    },
    {
      id: "initialize-length",
      label: "Start a new run",
      fragment: "int len = 1;",
    },
    {
      id: "grow-run",
      label: "Grow through consecutive values",
      fragment: "while (set.contains(n + len)) len++;",
    },
    {
      id: "update-max",
      label: "Keep the longest run",
      fragment: "max = Math.max(max, len);",
    },
    {
      id: "return-max",
      label: "Return the best length",
      fragment: "return max;",
    },
  ],
  visualKinds: ["sequence", "associative"],
} satisfies TraceProblemDefinition;

export default longestConsecutiveSequenceDefinition;
