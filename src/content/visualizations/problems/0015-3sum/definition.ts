import type { TraceProblemDefinition } from "@/lib/visualizer";

export const threeSumDefinition = {
  lc: 15,
  slug: "3sum",
  title: "3Sum",
  difficulty: "M",
  area: "Pointers and search",
  pattern: "Sort + two pointers",
  summary:
    "Fix one sorted value, then watch two pointers close in on its additive inverse while duplicate values are skipped.",
  fields: [
    {
      id: "nums",
      label: "Numbers",
      type: "text",
      placeholder: "[-1, 0, 1, 2, -1, -4]",
      help: "Enter 3–20 integers from −715,827,882 to 715,827,882 so every three-value sum fits in a Java int.",
      inputMode: "text",
    },
  ],
  presets: [
    {
      id: "classic",
      label: "Two triplets",
      description:
        "Sorting exposes two distinct zero-sum triplets and a repeated fixed value.",
      values: { nums: "[-1, 0, 1, 2, -1, -4]" },
    },
    {
      id: "duplicate-edge",
      label: "Duplicate edge",
      description:
        "Repeated zeroes produce one triplet, not several copies of the same answer.",
      values: { nums: "[0, 0, 0, 0]" },
    },
    {
      id: "no-solution",
      label: "No solution",
      description:
        "The pointers exhaust every candidate pair without finding a zero sum.",
      values: { nums: "[1, 2, 4, 8]" },
    },
  ],
  anchors: [
    {
      id: "sort-input",
      label: "Sort the input",
      fragment: "Arrays.sort(nums);",
    },
    {
      id: "create-results",
      label: "Create the result list",
      fragment: "List<List<Integer>> res = new ArrayList<>();",
    },
    {
      id: "select-fixed",
      label: "Choose the fixed value",
      fragment: "for (int i = 0; i < nums.length-2; i++) {",
    },
    {
      id: "skip-fixed-duplicate",
      label: "Skip a repeated fixed value",
      fragment: "if (i > 0 && nums[i] == nums[i-1]) continue;",
    },
    {
      id: "initialize-pointers",
      label: "Place the two pointers",
      fragment: "int l = i+1, r = nums.length-1;",
    },
    {
      id: "scan-pair",
      label: "Scan while pointers have not met",
      fragment: "while (l < r) {",
    },
    {
      id: "compute-sum",
      label: "Compute the candidate sum",
      fragment: "int sum = nums[i]+nums[l]+nums[r];",
    },
    {
      id: "check-zero",
      label: "Check for a zero sum",
      fragment: "if (sum == 0) {",
    },
    {
      id: "record-triplet",
      label: "Record a triplet",
      fragment: "res.add(Arrays.asList(nums[i],nums[l],nums[r]));",
    },
    {
      id: "skip-left-duplicates",
      label: "Skip repeated left values",
      fragment: "while (l<r&&nums[l]==nums[l+1]) l++;",
    },
    {
      id: "skip-right-duplicates",
      label: "Skip repeated right values",
      fragment: "while (l<r&&nums[r]==nums[r-1]) r--;",
    },
    {
      id: "move-after-match",
      label: "Move both pointers inward",
      fragment: "l++; r--;",
    },
    {
      id: "move-left",
      label: "Raise a small sum",
      fragment: "} else if (sum < 0) l++;",
    },
    {
      id: "move-right",
      label: "Lower a large sum",
      fragment: "else r--;",
    },
    {
      id: "return-results",
      label: "Return every unique triplet",
      fragment: "return res;",
    },
  ],
  visualKinds: ["sequence", "stack"],
} satisfies TraceProblemDefinition;

export default threeSumDefinition;
