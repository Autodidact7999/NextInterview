import type { TraceProblemDefinition } from "@/lib/visualizer";

export const containerWithMostWaterDefinition = {
  lc: 11,
  slug: "container-with-most-water",
  title: "Container With Most Water",
  difficulty: "M",
  area: "Pointers and search",
  pattern: "Two pointers",
  summary:
    "Measure the widest remaining container, preserve the best area, and discard the wall that limits the current pair.",
  fields: [
    {
      id: "heights",
      label: "Wall heights",
      type: "text",
      placeholder: "[1, 8, 6, 2, 5, 4, 8, 3, 7]",
      help: "Enter 2–30 non-negative integers. Each height may be at most 10,000.",
      inputMode: "text",
    },
  ],
  presets: [
    {
      id: "wide-winner",
      label: "Wide winner",
      description:
        "The best container appears after the shorter outside wall is discarded.",
      values: { heights: "[1, 8, 6, 2, 5, 4, 8, 3, 7]" },
    },
    {
      id: "zero-edge",
      label: "Two zero walls",
      description:
        "The smallest valid input demonstrates an area that remains zero.",
      values: { heights: "[0, 0]" },
    },
  ],
  anchors: [
    {
      id: "initialize-pointers",
      label: "Place both pointers",
      fragment: "int l = 0, r = height.length - 1, max = 0;",
    },
    {
      id: "scan-inward",
      label: "Continue while walls differ",
      fragment: "while (l < r) {",
    },
    {
      id: "measure-container",
      label: "Measure and retain the area",
      fragment:
        "max = Math.max(max, Math.min(height[l], height[r]) * (r - l));",
    },
    {
      id: "move-left",
      label: "Discard the shorter left wall",
      fragment: "if (height[l] < height[r]) l++;",
    },
    {
      id: "move-right",
      label: "Discard the right wall",
      fragment: "else r--;",
    },
    {
      id: "return-area",
      label: "Return the maximum area",
      fragment: "return max;",
    },
  ],
  visualKinds: ["bar-range"],
} satisfies TraceProblemDefinition;

export default containerWithMostWaterDefinition;
