import type { TraceProblemDefinition } from "@/lib/visualizer/types";

export const definition = {
  lc: 125,
  slug: "valid-palindrome",
  title: "Valid Palindrome",
  difficulty: "E",
  area: "Pointers and search",
  pattern: "Two pointers",
  summary:
    "Move inward from both ends, skipping punctuation before comparing normalized characters.",
  fields: [
    {
      id: "s",
      label: "Text",
      type: "text",
      placeholder: "A man, a plan, a canal: Panama",
      help: "Enter up to 120 printable ASCII characters. An empty string is allowed.",
      inputMode: "text",
    },
  ],
  presets: [
    {
      id: "phrase",
      label: "Phrase with punctuation",
      description:
        "Spaces, punctuation, and letter case disappear from the comparison.",
      values: { s: "A man, a plan, a canal: Panama" },
    },
    {
      id: "mismatch",
      label: "Early mismatch",
      description:
        "The first normalized pair proves this short phrase is not a palindrome.",
      values: { s: "race a car" },
    },
    {
      id: "punctuation-edge",
      label: "Punctuation only",
      description:
        "With no alphanumeric characters, the two pointers have nothing meaningful to reject.",
      values: { s: " .,!?:; " },
    },
  ],
  anchors: [
    {
      id: "initialize-pointers",
      label: "Place both pointers",
      fragment: "int l = 0, r = s.length() - 1;",
    },
    {
      id: "scan-inward",
      label: "Continue while pointers differ",
      fragment: "while (l < r) {",
    },
    {
      id: "skip-left",
      label: "Skip a non-alphanumeric left character",
      fragment: "while (l < r && !Character.isLetterOrDigit(s.charAt(l))) l++;",
    },
    {
      id: "skip-right",
      label: "Skip a non-alphanumeric right character",
      fragment: "while (l < r && !Character.isLetterOrDigit(s.charAt(r))) r--;",
    },
    {
      id: "compare-normalized",
      label: "Compare lowercase characters",
      fragment:
        "if (Character.toLowerCase(s.charAt(l)) != Character.toLowerCase(s.charAt(r))) return false;",
    },
    {
      id: "move-inward",
      label: "Advance both pointers",
      fragment: "l++; r--;",
    },
    {
      id: "confirm-palindrome",
      label: "Confirm the palindrome",
      fragment: "return true;",
    },
  ],
  visualKinds: ["sequence"],
} as const satisfies TraceProblemDefinition;

export default definition;
