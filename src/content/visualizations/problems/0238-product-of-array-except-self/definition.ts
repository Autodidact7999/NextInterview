import type { TraceProblemDefinition } from "@/lib/visualizer/types";

export const productExceptSelfDefinition = {
  lc: 238,
  slug: "product-of-array-except-self",
  title: "Product of Array Except Self",
  difficulty: "M",
  area: "Arrays and hashing",
  pattern: "Prefix/suffix products",
  summary:
    "Build every left product first, then fold a rolling right product into the same output array.",
  fields: [
    {
      id: "nums",
      label: "Numbers",
      type: "textarea",
      placeholder: "[1, 2, 3, 4]",
      help: "Enter 2–20 integers from −10 to 10. Every product except self must fit in a Java int.",
      inputMode: "text",
    },
  ],
  presets: [
    {
      id: "classic",
      label: "Classic two-pass",
      description:
        "Distinct positive values make the left and right contributions easy to compare.",
      values: { nums: "[1, 2, 3, 4]" },
    },
    {
      id: "single-zero",
      label: "One zero",
      description:
        "Only the zero position can receive a non-zero final product.",
      values: { nums: "[-1, 1, 0, -3, 3]" },
    },
    {
      id: "two-zero-edge",
      label: "Two-zero edge",
      description:
        "Every output includes at least one zero, so the complete result is all zeroes.",
      values: { nums: "[0, 4, 0]" },
    },
  ],
  anchors: [
    {
      id: "read-length",
      label: "Read the input length",
      fragment: "int n = nums.length;",
    },
    {
      id: "create-result",
      label: "Allocate the result array",
      fragment: "int[] res = new int[n];",
    },
    {
      id: "seed-prefix",
      label: "Seed the empty left product",
      fragment: "res[0] = 1;",
    },
    {
      id: "build-prefixes",
      label: "Build products to the left",
      fragment: "for (int i = 1; i < n; i++) res[i] = res[i-1] * nums[i-1];",
    },
    {
      id: "seed-suffix",
      label: "Seed the empty right product",
      fragment: "int right = 1;",
    },
    {
      id: "scan-from-right",
      label: "Scan from right to left",
      fragment: "for (int i = n-1; i >= 0; i--) {",
    },
    {
      id: "combine-products",
      label: "Combine left and right products",
      fragment: "res[i] *= right;",
    },
    {
      id: "extend-suffix",
      label: "Extend the rolling right product",
      fragment: "right *= nums[i];",
    },
    {
      id: "return-result",
      label: "Return the completed products",
      fragment: "return res;",
    },
  ],
  visualKinds: ["sequence"],
} as const satisfies TraceProblemDefinition;

export default productExceptSelfDefinition;
