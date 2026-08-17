import type { TraceProblemDefinition } from "@/lib/visualizer";

export const linkedListCycleDefinition = {
  lc: 141,
  slug: "linked-list-cycle",
  title: "Linked List Cycle",
  difficulty: "E",
  area: "Stack and linked lists",
  pattern: "Floyd's cycle detection",
  summary:
    "Race a one-step pointer against a two-step pointer: they separate on a finite list, but must eventually meet inside a cycle.",
  fields: [
    {
      id: "values",
      label: "Node values",
      type: "textarea",
      placeholder: "[3, 2, 0, -4]",
      help: "Enter up to 25 Java integers in linked-list order. Values identify content; positions identify nodes.",
      inputMode: "text",
    },
    {
      id: "pos",
      label: "Cycle position",
      type: "integer",
      placeholder: "1",
      help: "Use -1 for no cycle, or the zero-based index that the final node points back to.",
      inputMode: "numeric",
    },
  ],
  presets: [
    {
      id: "cycle-in-middle",
      label: "Cycle in the middle",
      description:
        "The tail points back to index 1, so the faster pointer eventually catches the slower pointer.",
      values: { values: "[3, 2, 0, -4]", pos: "1" },
    },
    {
      id: "two-node-cycle",
      label: "Cycle to the head",
      description:
        "Two nodes form a loop when the tail points back to the first node.",
      values: { values: "[1, 2]", pos: "0" },
    },
    {
      id: "empty-list",
      label: "Empty edge case",
      description:
        "An empty list has no edge to follow and therefore cannot contain a cycle.",
      values: { values: "[]", pos: "-1" },
    },
  ],
  anchors: [
    {
      id: "initialize-pointers",
      label: "Start both pointers at head",
      fragment: "ListNode slow = head, fast = head;",
    },
    {
      id: "check-room-to-advance",
      label: "Check whether fast can move twice",
      fragment: "while (fast != null && fast.next != null) {",
    },
    {
      id: "advance-slow",
      label: "Advance slow by one link",
      fragment: "slow = slow.next;",
    },
    {
      id: "advance-fast",
      label: "Advance fast by two links",
      fragment: "fast = fast.next.next;",
    },
    {
      id: "compare-pointers",
      label: "Detect a meeting",
      fragment: "if (slow == fast) return true;",
    },
    {
      id: "return-no-cycle",
      label: "Return after reaching the end",
      fragment: "return false;",
    },
  ],
  visualKinds: ["linked-list"],
} satisfies TraceProblemDefinition;

export default linkedListCycleDefinition;
