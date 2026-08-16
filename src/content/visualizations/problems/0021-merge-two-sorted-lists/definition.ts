import type { TraceProblemDefinition } from "@/lib/visualizer";

export const mergeTwoSortedListsDefinition = {
  lc: 21,
  slug: "merge-two-sorted-lists",
  title: "Merge Two Sorted Lists",
  difficulty: "E",
  area: "Stack and linked lists",
  pattern: "Linked list merge",
  summary:
    "Follow two sorted head pointers as a dummy node and moving tail assemble one ordered chain.",
  fields: [
    {
      id: "list1",
      label: "First sorted list",
      type: "text",
      placeholder: "[1, 2, 4]",
      help: "Enter 0–20 Java integers in nondecreasing order.",
      inputMode: "text",
    },
    {
      id: "list2",
      label: "Second sorted list",
      type: "text",
      placeholder: "[1, 3, 4]",
      help: "Enter 0–20 Java integers in nondecreasing order; both lists may contain at most 30 nodes total.",
      inputMode: "text",
    },
  ],
  presets: [
    {
      id: "interleaved",
      label: "Interleaved values",
      description:
        "Equal heads exercise the left-first tie rule before the lists alternate.",
      values: { list1: "[1, 2, 4]", list2: "[1, 3, 4]" },
    },
    {
      id: "empty-first",
      label: "One list is empty",
      description:
        "The comparison loop is skipped and the second chain is attached in one step.",
      values: { list1: "[]", list2: "[-2, 0, 5]" },
    },
  ],
  anchors: [
    {
      id: "create-dummy",
      label: "Create dummy head and tail",
      fragment: "ListNode dummy = new ListNode(0), cur = dummy;",
    },
    {
      id: "both-heads-ready",
      label: "Continue while both heads exist",
      fragment: "while (list1 != null && list2 != null) {",
    },
    {
      id: "compare-heads",
      label: "Compare the two head values",
      fragment: "if (list1.val <= list2.val)",
    },
    {
      id: "take-list1",
      label: "Attach and advance list one",
      fragment: "cur.next = list1; list1 = list1.next;",
    },
    {
      id: "take-list2",
      label: "Attach and advance list two",
      fragment: "cur.next = list2; list2 = list2.next;",
    },
    {
      id: "advance-tail",
      label: "Move the merged tail",
      fragment: "cur = cur.next;",
    },
    {
      id: "attach-remainder",
      label: "Attach the remaining chain",
      fragment: "cur.next = (list1 != null) ? list1 : list2;",
    },
    {
      id: "return-merged-head",
      label: "Return after the dummy node",
      fragment: "return dummy.next;",
    },
  ],
  visualKinds: ["linked-list"],
} satisfies TraceProblemDefinition;

export default mergeTwoSortedListsDefinition;
