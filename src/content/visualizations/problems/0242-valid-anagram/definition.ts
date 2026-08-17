import type { TraceProblemDefinition } from "@/lib/visualizer/types";

export const definition = {
  lc: 242,
  slug: "valid-anagram",
  title: "Valid Anagram",
  difficulty: "E",
  area: "Arrays and hashing",
  pattern: "Frequency counting",
  summary:
    "Balance one counter per lowercase letter, then verify that every balance returns to zero.",
  fields: [
    {
      id: "s",
      label: "Source string",
      type: "text",
      placeholder: "anagram",
      help: "Up to 80 lowercase English letters. An empty string is allowed.",
      inputMode: "text",
    },
    {
      id: "t",
      label: "Candidate string",
      type: "text",
      placeholder: "nagaram",
      help: "Up to 80 lowercase English letters. An empty string is allowed.",
      inputMode: "text",
    },
  ],
  presets: [
    {
      id: "reordered",
      label: "Same letters",
      description:
        "The characters arrive in a different order but balance perfectly.",
      values: { s: "anagram", t: "nagaram" },
    },
    {
      id: "one-letter-off",
      label: "One letter off",
      description:
        "Equal lengths hide a frequency mismatch until the final scan.",
      values: { s: "rat", t: "car" },
    },
    {
      id: "empty-edge",
      label: "Empty strings",
      description:
        "Two empty strings are anagrams and leave every counter at zero.",
      values: { s: "", t: "" },
    },
  ],
  anchors: [
    {
      id: "check-length",
      label: "Reject different lengths",
      fragment: "if (s.length() != t.length()) return false;",
    },
    {
      id: "create-frequency-table",
      label: "Create 26 counters",
      fragment: "int[] freq = new int[26];",
    },
    {
      id: "count-source",
      label: "Add source characters",
      fragment: "for (char c : s.toCharArray()) freq[c - 'a']++;",
    },
    {
      id: "subtract-candidate",
      label: "Subtract candidate characters",
      fragment: "for (char c : t.toCharArray()) freq[c - 'a']--;",
    },
    {
      id: "inspect-balances",
      label: "Check every balance",
      fragment: "for (int f : freq) if (f != 0) return false;",
    },
    {
      id: "confirm-anagram",
      label: "Confirm the match",
      fragment: "return true;",
    },
  ],
  visualKinds: ["sequence", "bar-range"],
} as const satisfies TraceProblemDefinition;
