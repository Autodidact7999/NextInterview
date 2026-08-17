import type { TraceProblemDefinition } from "@/lib/visualizer/types";

export const reverseLinkedListDefinition = {
  lc: 206,
  slug: "reverse-linked-list",
  title: "Reverse Linked List",
  difficulty: "E",
  area: "Stack and linked lists",
  pattern: "Iterative pointer rewiring",
  summary:
    "Follow prev, curr, and next as one pointer is safely reversed on each pass.",
  fields: [
    {
      id: "values",
      label: "List values",
      type: "textarea",
      placeholder: "[1, 2, 3, 4, 5]",
      help: "Enter up to 25 Java integers in list order. An empty array is allowed.",
      inputMode: "text",
    },
  ],
  presets: [
    {
      id: "five-nodes",
      label: "Five-node list",
      description:
        "Reverse a typical list while keeping the unprocessed suffix visible.",
      values: { values: "[1, 2, 3, 4, 5]" },
    },
    {
      id: "single-node",
      label: "Single-node edge",
      description: "One rewire leaves the only node pointing to null.",
      values: { values: "[42]" },
    },
    {
      id: "empty-list",
      label: "Empty edge case",
      description: "The loop is skipped and null is returned immediately.",
      values: { values: "[]" },
    },
  ],
  anchors: [
    {
      id: "initialize-prev",
      label: "Initialize the reversed prefix",
      fragment: "ListNode prev = null;",
    },
    {
      id: "check-current",
      label: "Check the current node",
      fragment: "while (head != null) {",
    },
    {
      id: "save-next",
      label: "Save the remaining suffix",
      fragment: "ListNode next = head.next;",
    },
    {
      id: "reverse-edge",
      label: "Reverse one link",
      fragment: "head.next = prev;",
    },
    {
      id: "advance-prev",
      label: "Grow the reversed prefix",
      fragment: "prev = head;",
    },
    {
      id: "advance-current",
      label: "Move to the saved suffix",
      fragment: "head = next;",
    },
    {
      id: "return-new-head",
      label: "Return the new head",
      fragment: "return prev;",
    },
  ],
  visualKinds: ["linked-list"],
} as const satisfies TraceProblemDefinition;

export default reverseLinkedListDefinition;
