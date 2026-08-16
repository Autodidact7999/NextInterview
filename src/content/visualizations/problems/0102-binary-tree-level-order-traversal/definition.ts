import type { TraceProblemDefinition } from "@/lib/visualizer";

export const binaryTreeLevelOrderTraversalDefinition = {
  lc: 102,
  slug: "binary-tree-level-order-traversal",
  title: "Binary Tree Level Order Traversal",
  difficulty: "M",
  area: "Trees and trie",
  pattern: "Breadth-first search",
  summary:
    "Freeze the queue size at the start of each layer, then collect exactly that many nodes before advancing to the next depth.",
  fields: [
    {
      id: "root",
      label: "Tree (level order)",
      type: "textarea",
      placeholder: "[3, 9, 20, null, null, 15, 7]",
      help: "Enter a compact level-order Java integer/null array with at most 31 non-null nodes. Use [] for an empty tree.",
      inputMode: "text",
    },
  ],
  presets: [
    {
      id: "two-full-levels",
      label: "Branching tree",
      description:
        "The root branches unevenly before the third level fills from one parent.",
      values: { root: "[3, 9, 20, null, null, 15, 7]" },
    },
    {
      id: "right-skewed-edge",
      label: "Right-skewed edge",
      description:
        "Every queue-size snapshot is one as the traversal follows a single right child.",
      values: { root: "[1, null, 2, null, 3, null, 4]" },
    },
    {
      id: "empty-edge",
      label: "Empty tree",
      description:
        "A null root returns an empty result before a queue is populated.",
      values: { root: "[]" },
    },
  ],
  anchors: [
    {
      id: "initialize-result",
      label: "Create the result",
      fragment: "List<List<Integer>> res = new ArrayList<>();",
    },
    {
      id: "return-empty",
      label: "Return for a null root",
      fragment: "if (root == null) return res;",
    },
    {
      id: "create-queue",
      label: "Create the BFS queue",
      fragment: "Queue<TreeNode> q = new LinkedList<>();",
    },
    {
      id: "offer-root",
      label: "Seed the queue",
      fragment: "q.offer(root);",
    },
    {
      id: "check-queue",
      label: "Continue while work remains",
      fragment: "while (!q.isEmpty()) {",
    },
    {
      id: "snapshot-size",
      label: "Freeze the current level size",
      fragment: "int sz = q.size();",
    },
    {
      id: "create-level",
      label: "Create the current level",
      fragment: "List<Integer> level = new ArrayList<>();",
    },
    {
      id: "iterate-level",
      label: "Consume the frozen level",
      fragment: "for (int i = 0; i < sz; i++) {",
    },
    {
      id: "poll-node",
      label: "Remove the queue front",
      fragment: "TreeNode node = q.poll();",
    },
    {
      id: "record-value",
      label: "Record the node value",
      fragment: "level.add(node.val);",
    },
    {
      id: "enqueue-left",
      label: "Enqueue a left child",
      fragment: "q.offer(node.left);",
    },
    {
      id: "enqueue-right",
      label: "Enqueue a right child",
      fragment: "q.offer(node.right);",
    },
    {
      id: "finish-level",
      label: "Append the completed level",
      fragment: "res.add(level);",
    },
  ],
  visualKinds: ["tree", "sequence"],
} satisfies TraceProblemDefinition;

export default binaryTreeLevelOrderTraversalDefinition;
