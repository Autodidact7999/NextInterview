import type { TraceProblemDefinition } from "@/lib/visualizer";

export const groupAnagramsDefinition = {
  lc: 49,
  slug: "group-anagrams",
  title: "Group Anagrams",
  difficulty: "M",
  area: "Arrays and hashing",
  pattern: "Hash map by signature",
  summary:
    "Follow each word from its original spelling to a canonical sorted signature, then into the matching hash-map bucket.",
  fields: [
    {
      id: "strs",
      label: "Words",
      type: "textarea",
      placeholder: '["eat", "tea", "tan", "ate", "nat", "bat"]',
      help: "Enter a JSON array or comma-separated list of 1–20 lowercase words, each at most 20 characters.",
      inputMode: "text",
    },
  ],
  presets: [
    {
      id: "mixed-families",
      label: "Three families",
      description:
        "Several words revisit existing signatures while two begin new groups.",
      values: {
        strs: '["eat", "tea", "tan", "ate", "nat", "bat"]',
      },
    },
    {
      id: "empty-word-edge",
      label: "Empty-word edge",
      description:
        "Empty strings share one valid empty signature beside a single-letter group.",
      values: { strs: '["", "a", ""]' },
    },
  ],
  anchors: [
    {
      id: "create-groups",
      label: "Create the groups map",
      fragment: "Map<String, List<String>> map = new HashMap<>();",
    },
    {
      id: "scan-word",
      label: "Visit the next word",
      fragment: "for (String w : strs) {",
    },
    {
      id: "copy-characters",
      label: "Copy the word's characters",
      fragment: "char[] ch = w.toCharArray();",
    },
    {
      id: "sort-characters",
      label: "Sort the signature",
      fragment: "Arrays.sort(ch);",
    },
    {
      id: "build-signature",
      label: "Build the canonical key",
      fragment: "String key = new String(ch);",
    },
    {
      id: "append-to-group",
      label: "Append to the matching group",
      fragment: "map.computeIfAbsent(key, k -> new ArrayList<>()).add(w);",
    },
    {
      id: "return-groups",
      label: "Return every group",
      fragment: "return new ArrayList<>(map.values());",
    },
  ],
  visualKinds: ["sequence", "associative"],
} satisfies TraceProblemDefinition;

export default groupAnagramsDefinition;
