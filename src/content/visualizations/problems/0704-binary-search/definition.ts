import type { TraceProblemDefinition } from "@/lib/visualizer";

export const binarySearchDefinition = {
  lc: 704,
  slug: "binary-search",
  title: "Binary Search",
  difficulty: "E",
  area: "Pointers and search",
  pattern: "Binary search",
  summary:
    "Shrink an inclusive search interval by comparing its overflow-safe midpoint with the target.",
  fields: [
    {
      id: "nums",
      label: "Sorted numbers",
      type: "text",
      placeholder: "[-1, 0, 3, 5, 9, 12]",
      help: "Enter up to 40 strictly increasing Java integers.",
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
      id: "classic-found",
      label: "Classic hit",
      description:
        "The target survives two interval cuts before becoming the midpoint.",
      values: { nums: "[-1, 0, 3, 5, 9, 12]", target: "9" },
    },
    {
      id: "missing-between",
      label: "Missing between values",
      description:
        "The interval closes after the target falls between two neighbors.",
      values: { nums: "[2, 5, 8, 12, 16]", target: "9" },
    },
    {
      id: "empty-edge",
      label: "Empty input",
      description:
        "An empty array skips the loop and returns the not-found sentinel.",
      values: { nums: "[]", target: "4" },
    },
  ],
  anchors: [
    {
      id: "initialize-range",
      label: "Initialize the inclusive interval",
      fragment: "int lo = 0, hi = nums.length - 1;",
    },
    {
      id: "check-range",
      label: "Check whether the interval remains",
      fragment: "while (lo <= hi) {",
    },
    {
      id: "choose-middle",
      label: "Choose an overflow-safe midpoint",
      fragment: "int mid = lo + (hi - lo) / 2;",
    },
    {
      id: "return-found",
      label: "Return a matching midpoint",
      fragment: "if (nums[mid] == target) return mid;",
    },
    {
      id: "discard-left",
      label: "Move the lower bound right",
      fragment: "else if (nums[mid] < target) lo = mid + 1;",
    },
    {
      id: "discard-right",
      label: "Move the upper bound left",
      fragment: "else hi = mid - 1;",
    },
    {
      id: "return-missing",
      label: "Return the not-found sentinel",
      fragment: "return -1;",
    },
  ],
  visualKinds: ["bar-range"],
} satisfies TraceProblemDefinition;

export default binarySearchDefinition;
