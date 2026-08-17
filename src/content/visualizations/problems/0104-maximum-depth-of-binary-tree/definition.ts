import type { TraceProblemDefinition } from "@/lib/visualizer/types";

export const maximumDepthOfBinaryTreeDefinition = {
  lc: 104,
  slug: "maximum-depth-of-binary-tree",
  title: "Maximum Depth of Binary Tree",
  difficulty: "E",
  area: "Trees and trie",
  pattern: "Recursive DFS",
  summary:
    "Follow each recursive call as subtree depths return and combine into the longest root-to-leaf path.",
  fields: [
    {
      id: "root",
      label: "Tree (level order)",
      type: "textarea",
      placeholder: "[3, 9, 20, null, null, 15, 7]",
      help: "Enter a compact level-order Java int/null array with at most 31 non-null nodes. Use [] for an empty tree and omit trailing nulls.",
      inputMode: "text",
    },
  ],
  presets: [
    {
      id: "balanced-branches",
      label: "Uneven branches",
      description:
        "Compare two populated subtrees whose deepest leaves are on the same level.",
      values: { root: "[3, 9, 20, null, null, 15, 7]" },
    },
    {
      id: "right-skewed",
      label: "Right-skewed tree",
      description:
        "Watch each parent inherit one more level from its only child.",
      values: { root: "[1, null, 2, null, 3, null, 4]" },
    },
    {
      id: "empty-tree",
      label: "Empty edge case",
      description: "The base case returns depth zero without recursing.",
      values: { root: "[]" },
    },
  ],
  anchors: [
    {
      id: "base-case",
      label: "Return zero for null",
      fragment: "if (root == null) return 0;",
    },
    {
      id: "combine-depths",
      label: "Combine subtree depths",
      fragment:
        "return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));",
    },
  ],
  visualKinds: ["tree", "stack"],
} as const satisfies TraceProblemDefinition;

export default maximumDepthOfBinaryTreeDefinition;
