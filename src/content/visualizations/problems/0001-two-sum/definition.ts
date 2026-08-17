import type { TraceProblemDefinition } from "@/lib/visualizer";

export const twoSumDefinition = {
  lc: 1,
  slug: "two-sum",
  title: "Two Sum",
  difficulty: "E",
  area: "Arrays and hashing",
  pattern: "Hash map",
  summary:
    "Watch a one-pass lookup table turn each complement check into a constant-time decision.",
  fields: [
    {
      id: "nums",
      label: "Numbers",
      type: "text",
      placeholder: "[2, 7, 11, 15]",
      help: "Enter 2–30 Java integers with exactly one pair that reaches the target.",
      inputMode: "text",
    },
    {
      id: "target",
      label: "Target",
      type: "integer",
      placeholder: "9",
      help: "Enter a Java integer from −2,147,483,648 to 2,147,483,647.",
      inputMode: "numeric",
    },
  ],
  presets: [
    {
      id: "classic",
      label: "Classic complement",
      description:
        "The first stored value becomes the complement of the next value.",
      values: { nums: "[2, 7, 11, 15]", target: "9" },
    },
    {
      id: "duplicate-edge",
      label: "Duplicate edge",
      description: "Two equal values must use two different indices.",
      values: { nums: "[3, 3]", target: "6" },
    },
  ],
  anchors: [
    {
      id: "create-map",
      label: "Create the lookup table",
      fragment: "Map<Integer, Integer> map = new HashMap<>();",
    },
    {
      id: "scan-index",
      label: "Scan the next index",
      fragment: "for (int i = 0; i < nums.length; i++) {",
    },
    {
      id: "compute-complement",
      label: "Compute the needed complement",
      fragment: "int comp = target - nums[i];",
    },
    {
      id: "lookup-complement",
      label: "Check for the complement",
      fragment: "if (map.containsKey(comp))",
    },
    {
      id: "return-pair",
      label: "Return the matching indices",
      fragment: "return new int[]{map.get(comp), i};",
    },
    {
      id: "remember-value",
      label: "Remember the current value",
      fragment: "map.put(nums[i], i);",
    },
  ],
  visualKinds: ["sequence", "associative"],
} satisfies TraceProblemDefinition;

export default twoSumDefinition;
