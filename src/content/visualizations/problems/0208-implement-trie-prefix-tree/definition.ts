import type { TraceProblemDefinition } from "@/lib/visualizer";

export const definition = {
  lc: 208,
  slug: "implement-trie-prefix-tree",
  title: "Implement Trie (Prefix Tree)",
  difficulty: "M",
  area: "Trees and trie",
  pattern: "Trie",
  summary:
    "Follow character edges as insert, exact search, and prefix search share one growing dictionary.",
  fields: [
    {
      id: "operations",
      label: "Operations",
      type: "textarea",
      placeholder:
        '[{"op":"insert","word":"code"},{"op":"search","word":"code"}]',
      help: "Enter 1–40 JSON operations using insert, search, or startsWith and lowercase words.",
      inputMode: "text",
    },
  ],
  presets: [
    {
      id: "shared-prefix",
      label: "Shared prefix",
      description: "Insert a word, then compare exact and prefix lookups.",
      values: {
        operations:
          '[{"op":"insert","word":"apple"},{"op":"search","word":"apple"},{"op":"search","word":"app"},{"op":"startsWith","word":"app"}]',
      },
    },
    {
      id: "missing-branch",
      label: "Missing branch",
      description: "A lookup leaves the trie as soon as an edge is absent.",
      values: {
        operations:
          '[{"op":"insert","word":"car"},{"op":"search","word":"cat"},{"op":"startsWith","word":"ca"}]',
      },
    },
    {
      id: "word-and-extension",
      label: "Word and extension",
      description:
        "A terminal node can also remain the prefix of a longer word.",
      values: {
        operations:
          '[{"op":"insert","word":"a"},{"op":"insert","word":"at"},{"op":"search","word":"a"},{"op":"search","word":"at"}]',
      },
    },
  ],
  anchors: [
    {
      id: "create-root",
      label: "Create the root",
      fragment: "TrieNode root = new TrieNode();",
    },
    {
      id: "insert-word",
      label: "Begin insertion",
      fragment: "void insert(String word) {",
    },
    {
      id: "create-child",
      label: "Create a missing edge",
      fragment: "if (cur.ch[i] == null) cur.ch[i] = new TrieNode();",
    },
    {
      id: "mark-terminal",
      label: "Mark the complete word",
      fragment: "cur.end = true;",
    },
    {
      id: "search-word",
      label: "Begin exact search",
      fragment: "boolean search(String word) {",
    },
    {
      id: "return-terminal",
      label: "Require a terminal node",
      fragment: "return cur.end;",
    },
    {
      id: "search-prefix",
      label: "Begin prefix search",
      fragment: "boolean startsWith(String prefix) {",
    },
    {
      id: "walk-prefix",
      label: "Walk the prefix path",
      fragment: "for (char c : prefix.toCharArray()) {",
    },
    {
      id: "return-prefix",
      label: "Accept the complete prefix",
      fragment: "return true;",
    },
  ],
  visualKinds: ["trie", "sequence"],
} as const satisfies TraceProblemDefinition;

export default definition;
