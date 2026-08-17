import type { TraceProblemDefinition } from "@/lib/visualizer";

export const validateBinarySearchTreeDefinition = {
  lc: 98,
  slug: "validate-binary-search-tree",
  title: "Validate Binary Search Tree",
  difficulty: "M",
  area: "Trees and trie",
  pattern: "DFS with strict bounds",
  summary:
    "Carry an exclusive lower and upper bound through the tree, then stop as soon as one node falls outside its inherited range.",
  fields: [
    {
      id: "root",
      label: "Level-order tree",
      type: "textarea",
      placeholder: "[8, 3, 10, 1, 6, null, 14]",
      help: "Enter a compact level-order array of Java integers and null gaps. Use [] for an empty tree; at most 31 non-null nodes.",
      inputMode: "text",
    },
  ],
  presets: [
    {
      id: "valid-nested-bounds",
      label: "Valid nested bounds",
      description:
        "A balanced search tree demonstrates how ancestor bounds narrow across several levels.",
      values: {
        root: "[8, 3, 10, 1, 6, null, 14, null, null, 4, 7, 13]",
      },
    },
    {
      id: "ancestor-violation",
      label: "Ancestor violation",
      description:
        "The right subtree contains a value that violates the root's lower bound.",
      values: { root: "[5, 1, 6, null, null, 3, 7]" },
    },
    {
      id: "empty-tree",
      label: "Empty tree",
      description: "The null-root base case is a valid binary search tree.",
      values: { root: "[]" },
    },
  ],
  anchors: [
    {
      id: "start-with-long-bounds",
      label: "Start with long bounds",
      fragment: "return validate(root, Long.MIN_VALUE, Long.MAX_VALUE);",
    },
    {
      id: "accept-null",
      label: "Accept an empty subtree",
      fragment: "if (n == null) return true;",
    },
    {
      id: "check-strict-bounds",
      label: "Require a strict range",
      fragment: "if (n.val <= min || n.val >= max) return false;",
    },
    {
      id: "validate-children",
      label: "Narrow bounds for both children",
      fragment:
        "return validate(n.left, min, n.val) && validate(n.right, n.val, max);",
    },
  ],
  visualKinds: ["tree"],
} satisfies TraceProblemDefinition;

export default validateBinarySearchTreeDefinition;
