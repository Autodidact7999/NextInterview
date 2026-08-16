import type { TraceProblemDefinition } from "@/lib/visualizer";

export const longestSubstringWithoutRepeatingCharactersDefinition = {
  lc: 3,
  slug: "longest-substring-without-repeating-characters",
  title: "Longest Substring Without Repeating Characters",
  difficulty: "M",
  area: "Pointers and search",
  pattern: "Sliding window",
  summary:
    "Follow a left boundary that jumps past in-window duplicates while the right boundary scans each character once.",
  fields: [
    {
      id: "s",
      label: "Text",
      type: "text",
      placeholder: "abcabcbb",
      help: "Enter up to 80 printable ASCII characters. Spaces and punctuation are allowed.",
      inputMode: "text",
    },
  ],
  presets: [
    {
      id: "overlapping-windows",
      label: "Overlapping windows",
      description:
        "Repeated characters make the left edge jump while later windows compete with the first best window.",
      values: { s: "abcabcbb" },
    },
    {
      id: "repeated-character",
      label: "Repeated character",
      description:
        "A single repeated character keeps every valid window at length one.",
      values: { s: "bbbbb" },
    },
    {
      id: "empty-edge",
      label: "Empty edge",
      description:
        "With no characters, the scan never enters the loop and returns zero.",
      values: { s: "" },
    },
  ],
  anchors: [
    {
      id: "create-last-seen",
      label: "Create the last-seen table",
      fragment: "int[] last = new int[128];",
    },
    {
      id: "mark-unseen",
      label: "Mark every character unseen",
      fragment: "Arrays.fill(last, -1);",
    },
    {
      id: "initialize-window",
      label: "Initialize the window",
      fragment: "int l = 0, max = 0;",
    },
    {
      id: "scan-right",
      label: "Advance the right edge",
      fragment: "for (int r = 0; r < s.length(); r++) {",
    },
    {
      id: "read-character",
      label: "Read the current character",
      fragment: "char c = s.charAt(r);",
    },
    {
      id: "move-left",
      label: "Move past an in-window duplicate",
      fragment: "if (last[c] >= l) l = last[c] + 1;",
    },
    {
      id: "remember-character",
      label: "Remember the latest position",
      fragment: "last[c] = r;",
    },
    {
      id: "update-maximum",
      label: "Measure the valid window",
      fragment: "max = Math.max(max, r - l + 1);",
    },
    {
      id: "return-maximum",
      label: "Return the maximum length",
      fragment: "return max;",
    },
  ],
  visualKinds: ["sequence", "associative"],
} satisfies TraceProblemDefinition;

export default longestSubstringWithoutRepeatingCharactersDefinition;
