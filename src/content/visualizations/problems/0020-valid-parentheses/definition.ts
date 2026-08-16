import type { TraceProblemDefinition } from "@/lib/visualizer/types";

export const validParenthesesDefinition = {
  lc: 20,
  slug: "valid-parentheses",
  title: "Valid Parentheses",
  difficulty: "E",
  area: "Stack and linked lists",
  pattern: "Stack",
  summary:
    "Pair each closing bracket with the most recent unmatched opening bracket, exactly as a stack requires.",
  fields: [
    {
      id: "s",
      label: "Bracket string",
      type: "text",
      placeholder: "{[()]}",
      help: "Use up to 80 bracket characters: ( ) [ ] { }.",
      inputMode: "text",
    },
  ],
  presets: [
    {
      id: "nested-pairs",
      label: "Nested pairs",
      description:
        "Close three bracket types in last-opened, first-closed order.",
      values: { s: "{[()]}" },
    },
    {
      id: "crossed-pair",
      label: "Mismatched close",
      description: "The first closing bracket conflicts with the stack top.",
      values: { s: "([)]" },
    },
    {
      id: "empty-input",
      label: "Empty edge case",
      description:
        "No unmatched opening brackets remain because no characters are read.",
      values: { s: "" },
    },
  ],
  anchors: [
    {
      id: "initialize-stack",
      label: "Create the bracket stack",
      fragment: "Deque<Character> st = new ArrayDeque<>();",
    },
    {
      id: "scan-characters",
      label: "Read the next character",
      fragment: "for (char c : s.toCharArray()) {",
    },
    {
      id: "push-opening",
      label: "Push an opening bracket",
      fragment: "if (c == '(' || c == '[' || c == '{') st.push(c);",
    },
    {
      id: "reject-empty-stack",
      label: "Reject a closing bracket without an opener",
      fragment: "if (st.isEmpty()) return false;",
    },
    {
      id: "pop-opening",
      label: "Pop the most recent opener",
      fragment: "char top = st.pop();",
    },
    {
      id: "reject-mismatch",
      label: "Check that the bracket types match",
      fragment:
        "if ((c == ')' && top != '(') || (c == ']' && top != '[') || (c == '}' && top != '{')) return false;",
    },
    {
      id: "return-stack-empty",
      label: "Require every opener to be matched",
      fragment: "return st.isEmpty();",
    },
  ],
  visualKinds: ["sequence", "stack"],
} as const satisfies TraceProblemDefinition;

export const definition = validParenthesesDefinition;
export default validParenthesesDefinition;
