import { z } from "zod";

import { mergeTwoSortedListsDefinition } from "@/content/visualizations/problems/0021-merge-two-sorted-lists/definition";
import {
  createTraceRuntime,
  javaInteger,
  parseField,
  parseIntegerArray,
} from "@/lib/visualizer";
import type {
  RawTraceInput,
  TraceCheckpoint,
  TraceFrame,
  TraceItemRole,
  TraceLinkedListScene,
  TraceRun,
} from "@/lib/visualizer";

function isNondecreasing(values: readonly number[]): boolean {
  return values.every(
    (value, index) => index === 0 || values[index - 1]! <= value,
  );
}

const sortedListSchema = z
  .array(javaInteger)
  .max(20, "Use at most 20 nodes in each list.");

const mergeTwoSortedListsInputSchema = z
  .object({
    list1: sortedListSchema,
    list2: sortedListSchema,
  })
  .superRefine(({ list1, list2 }, context) => {
    if (!isNondecreasing(list1)) {
      context.addIssue({
        code: "custom",
        path: ["list1"],
        message: "The first list must be in nondecreasing order.",
      });
    }
    if (!isNondecreasing(list2)) {
      context.addIssue({
        code: "custom",
        path: ["list2"],
        message: "The second list must be in nondecreasing order.",
      });
    }
    if (list1.length + list2.length > 30) {
      context.addIssue({
        code: "custom",
        path: ["list2"],
        message: "Use at most 30 nodes across both lists.",
      });
    }
  });

type MergeTwoSortedListsInput = z.infer<typeof mergeTwoSortedListsInputSchema>;

function parseRawInput(raw: RawTraceInput): unknown {
  return {
    list1: parseField(raw, "list1", parseIntegerArray),
    list2: parseField(raw, "list2", parseIntegerArray),
  };
}

function sortedConcatenationOracle({
  list1,
  list2,
}: MergeTwoSortedListsInput): readonly number[] {
  return [...list1, ...list2].sort((left, right) => left - right);
}

type SourceName = "list1" | "list2";

function sourceNodeId(source: SourceName, index: number): string {
  return `${source === "list1" ? "left" : "right"}-${index}`;
}

function initialNextPointers(
  list1: readonly number[],
  list2: readonly number[],
): Record<string, string | null> {
  const nextById: Record<string, string | null> = {};
  for (const [source, values] of [
    ["list1", list1],
    ["list2", list2],
  ] as const) {
    values.forEach((_, index) => {
      nextById[sourceNodeId(source, index)] =
        index + 1 < values.length ? sourceNodeId(source, index + 1) : null;
    });
  }
  return nextById;
}

interface MergeSceneState {
  list1: readonly number[];
  list2: readonly number[];
  left: number;
  right: number;
  nextById: Readonly<Record<string, string | null>>;
  dummyNextId: string | null;
  curId: string | null;
  mergedNodeIds: readonly string[];
  selected?: SourceName | null;
  latestId?: string | null;
  complete?: boolean;
  description: string;
}

function mergeScene(state: MergeSceneState): TraceLinkedListScene {
  const {
    list1,
    list2,
    left,
    right,
    nextById,
    dummyNextId,
    curId,
    mergedNodeIds,
    selected = null,
    latestId = null,
    complete = false,
    description,
  } = state;
  const mergedIds = new Set(mergedNodeIds);
  const selectedId =
    selected === "list1"
      ? sourceNodeId("list1", left)
      : selected === "list2"
        ? sourceNodeId("list2", right)
        : null;
  const liveLeftId = left < list1.length ? sourceNodeId("list1", left) : null;
  const liveRightId =
    right < list2.length ? sourceNodeId("list2", right) : null;

  const nodes = [
    ...list1.map((value, index) => ({
      source: "list1" as const,
      value,
      index,
    })),
    ...list2.map((value, index) => ({
      source: "list2" as const,
      value,
      index,
    })),
  ].map(({ source, value, index }) => {
    const id = sourceNodeId(source, index);
    let role: TraceItemRole = "default";
    if (complete || id === latestId) role = "accepted";
    else if (id === selectedId) role = "candidate";
    else if (mergedIds.has(id)) role = "visited";
    else if (id === liveLeftId || id === liveRightId) role = "current";
    return {
      id,
      value,
      nextId: nextById[id] ?? null,
      role,
      label: `${source}[${index}] · original node`,
    };
  });

  return {
    id: "merge-state",
    kind: "linked-list",
    title: "One set of nodes, rewired",
    description,
    nodes,
    headId: dummyNextId,
    pointers: [
      {
        id: "result-head-pointer",
        label: "dummy.next / result",
        nodeId: dummyNextId,
      },
      { id: "cur-pointer", label: "cur", nodeId: curId },
      { id: "list1-pointer", label: "list1", nodeId: liveLeftId },
      { id: "list2-pointer", label: "list2", nodeId: liveRightId },
    ],
  };
}

function choiceCheckpoint(
  leftValue: number,
  rightValue: number,
): TraceCheckpoint {
  const chooseLeft = leftValue <= rightValue;
  return {
    prompt: `The two heads are ${leftValue} and ${rightValue}. Which node is attached next?`,
    options: [
      { id: "append-list1", label: "The list1 head" },
      { id: "append-list2", label: "The list2 head" },
      { id: "append-both", label: "Both heads together" },
    ],
    answerId: chooseLeft ? "append-list1" : "append-list2",
    explanation: chooseLeft
      ? "The Java comparison uses <=, so list1 wins both a smaller value and an equal-value tie."
      : "The list2 head is smaller, so the else branch attaches it before advancing list2.",
  };
}

function remainderCheckpoint(
  list1Remaining: number,
  list2Remaining: number,
): TraceCheckpoint {
  const empty = list1Remaining === 0 && list2Remaining === 0;
  return {
    prompt: empty
      ? "Both source heads are null. What does the remainder assignment attach?"
      : "One source head is null. What is the next operation?",
    options: empty
      ? [
          { id: "attach-null", label: "Attach null" },
          { id: "create-node", label: "Create a zero node" },
        ]
      : [
          { id: "attach-rest", label: "Attach the non-null suffix" },
          { id: "copy-one", label: "Copy only one node" },
          { id: "compare-again", label: "Compare null values" },
        ],
    answerId: empty ? "attach-null" : "attach-rest",
    explanation: empty
      ? "The ternary expression chooses null, so dummy.next remains empty."
      : "Because the remaining suffix is already sorted, one pointer assignment links the whole suffix.",
  };
}

function traceMergeTwoSortedLists(input: MergeTwoSortedListsInput): TraceRun {
  const list1 = [...input.list1];
  const list2 = [...input.list2];
  const merged: number[] = [];
  const mergedNodeIds: string[] = [];
  const nextById = initialNextPointers(list1, list2);
  let dummyNextId: string | null = null;
  let curId: string | null = null;
  let left = 0;
  let right = 0;
  const frames: TraceFrame[] = [
    {
      id: "initialize-dummy",
      phase: "Initialize",
      codeRefs: ["create-dummy"],
      explanation:
        "Create a dummy node and point cur at it, giving every real output node the same attachment path.",
      changed: "Initialized an empty merged chain behind dummy.",
      invariant:
        "dummy.next is the start of the result, and cur is the final node in the merged prefix.",
      variables: [
        { name: "list1 index", value: 0 },
        { name: "list2 index", value: 0 },
        { name: "cur", value: "dummy" },
        { name: "merged length", value: 0 },
      ],
      scenes: [
        mergeScene({
          list1,
          list2,
          left,
          right,
          nextById,
          dummyNextId,
          curId,
          mergedNodeIds,
          description:
            "These are the original list1 and list2 node objects. The algorithm will relink them after dummy; it never copies their values into replacement nodes.",
        }),
      ],
      focusSceneId: "merge-state",
    },
  ];

  let iteration = 0;

  while (left < list1.length && right < list2.length) {
    const leftValue = list1[left]!;
    const rightValue = list2[right]!;
    const selected = leftValue <= rightValue ? "list1" : "list2";

    frames.push({
      id: `compare-${iteration}`,
      phase: "Compare heads",
      codeRefs: ["both-heads-ready", "compare-heads"],
      explanation: `${leftValue} ${leftValue <= rightValue ? "is not greater than" : "is greater than"} ${rightValue}, so ${selected} supplies the next node.`,
      changed: `Compared the live heads at source indices ${left} and ${right}.`,
      invariant:
        "The smaller live head is the smallest value not yet attached from either sorted source.",
      variables: [
        { name: "list1.val", value: leftValue },
        { name: "list2.val", value: rightValue },
        { name: "selected source", value: selected, changed: true },
        { name: "merged length", value: merged.length },
      ],
      scenes: [
        mergeScene({
          list1,
          list2,
          left,
          right,
          nextById,
          dummyNextId,
          curId,
          mergedNodeIds,
          selected,
          description:
            "The highlighted source head is the same node object that cur.next will reference next; no node is cloned.",
        }),
      ],
      focusSceneId: "merge-state",
      ...(iteration === 0
        ? { checkpoint: choiceCheckpoint(leftValue, rightValue) }
        : {}),
    });

    const previousLeft = left;
    const previousRight = right;
    const selectedValue = selected === "list1" ? leftValue : rightValue;
    const selectedId = sourceNodeId(
      selected,
      selected === "list1" ? left : right,
    );
    if (curId === null) dummyNextId = selectedId;
    else nextById[curId] = selectedId;
    curId = selectedId;
    mergedNodeIds.push(selectedId);
    merged.push(selectedValue);
    if (selected === "list1") left += 1;
    else right += 1;

    frames.push({
      id: `append-${iteration}`,
      phase: "Attach node",
      codeRefs: [
        selected === "list1" ? "take-list1" : "take-list2",
        "advance-tail",
      ],
      explanation: `Attach ${selectedValue} from ${selected}, advance that source pointer, then move cur to the appended node.`,
      changed: `The merged prefix gained ${selectedValue}; its length is now ${merged.length}.`,
      invariant:
        "The chain after dummy is sorted and contains exactly the nodes consumed from both source prefixes.",
      variables: [
        {
          name: "list1 index",
          value: left,
          previous: previousLeft,
          changed: left !== previousLeft,
        },
        {
          name: "list2 index",
          value: right,
          previous: previousRight,
          changed: right !== previousRight,
        },
        { name: "cur.val", value: selectedValue, changed: true },
        {
          name: "merged length",
          value: merged.length,
          previous: merged.length - 1,
          changed: true,
        },
      ],
      scenes: [
        mergeScene({
          list1,
          list2,
          left,
          right,
          nextById,
          dummyNextId,
          curId,
          mergedNodeIds,
          latestId: selectedId,
          description:
            "dummy.next reaches the sorted prefix. cur is the last node explicitly linked, while list1 and list2 point at their remaining original nodes.",
        }),
      ],
      focusSceneId: "merge-state",
    });

    iteration += 1;
  }

  const list1Remainder = list1.slice(left);
  const list2Remainder = list2.slice(right);
  const remainder = list1Remainder.length > 0 ? list1Remainder : list2Remainder;
  const remainderSource =
    list1Remainder.length > 0
      ? "list1"
      : list2Remainder.length > 0
        ? "list2"
        : "neither list";
  const beforeRemainder = merged.length;
  const remainderIds =
    list1Remainder.length > 0
      ? list1Remainder.map((_, index) => sourceNodeId("list1", left + index))
      : list2Remainder.map((_, index) => sourceNodeId("list2", right + index));
  const remainderHeadId = remainderIds[0] ?? null;
  if (curId === null) dummyNextId = remainderHeadId;
  else nextById[curId] = remainderHeadId;
  mergedNodeIds.push(...remainderIds);
  merged.push(...remainder);

  frames.push({
    id: "attach-remainder",
    phase: "Attach remainder",
    codeRefs: ["attach-remainder"],
    explanation:
      remainder.length > 0
        ? `The comparison loop stops when one head becomes null. Attach all ${remainder.length} remaining node${remainder.length === 1 ? "" : "s"} from ${remainderSource}.`
        : "Both heads are null, so the remainder assignment attaches null and leaves the merged chain unchanged.",
    changed:
      remainder.length > 0
        ? `Added the sorted suffix [${remainder.join(", ")}] in one pointer assignment.`
        : "No nodes remained to attach.",
    invariant:
      "The remaining non-null suffix, if any, is already sorted and no smaller unattached node exists in the other list.",
    variables: [
      { name: "remaining source", value: remainderSource },
      { name: "remaining nodes", value: remainder.length },
      {
        name: "merged length",
        value: merged.length,
        previous: beforeRemainder,
        changed: merged.length !== beforeRemainder,
      },
    ],
    scenes: [
      mergeScene({
        list1,
        list2,
        left,
        right,
        nextById,
        dummyNextId,
        curId,
        mergedNodeIds,
        latestId: remainderHeadId,
        description:
          remainderHeadId === null
            ? "Both source pointers are null, so cur.next becomes null."
            : "One pointer assignment splices the untouched suffix into the result. Its source identity and internal next links stay intact.",
      }),
    ],
    focusSceneId: "merge-state",
    ...(iteration === 0
      ? {
          checkpoint: remainderCheckpoint(
            list1Remainder.length,
            list2Remainder.length,
          ),
        }
      : {}),
  });

  const output = [...merged];
  frames.push({
    id: "complete-merge",
    phase: "Complete",
    codeRefs: ["return-merged-head"],
    explanation:
      output.length === 0
        ? "Return dummy.next, which is null and corresponds to an empty output list."
        : `Return dummy.next, the head of the sorted chain [${output.join(", ")}].`,
    changed: "Exposed the first real node after dummy as the result.",
    invariant:
      "The output is nondecreasing and preserves every input node exactly once.",
    variables: [
      { name: "output length", value: output.length },
      { name: "first value", value: output[0] ?? null },
      { name: "last value", value: output.at(-1) ?? null },
    ],
    scenes: [
      mergeScene({
        list1,
        list2,
        left,
        right,
        nextById,
        dummyNextId,
        curId,
        mergedNodeIds,
        complete: true,
        description:
          "Following dummy.next visits the sorted result through the original list1/list2 node IDs. Every node was reused exactly once.",
      }),
    ],
    focusSceneId: "merge-state",
    complete: true,
    output,
  });

  return {
    input: { list1, list2 },
    output,
    frames,
  };
}

export const mergeTwoSortedListsRuntime = createTraceRuntime<
  MergeTwoSortedListsInput,
  readonly number[]
>({
  definition: mergeTwoSortedListsDefinition,
  schema: mergeTwoSortedListsInputSchema,
  parseRaw: parseRawInput,
  trace: traceMergeTwoSortedLists,
  oracle: sortedConcatenationOracle,
});

export default mergeTwoSortedListsRuntime;
