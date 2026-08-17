import { z } from "zod";

import { reverseLinkedListDefinition } from "@/content/visualizations/problems/0206-reverse-linked-list/definition";
import { parseIntegerArray } from "@/lib/visualizer/parsers";
import { createTraceRuntime, parseField } from "@/lib/visualizer/runtime";
import type {
  RawTraceInput,
  TraceCheckpoint,
  TraceFrame,
  TraceItemRole,
  TraceLinkedListScene,
  TraceRun,
  TraceVariable,
} from "@/lib/visualizer/types";

const JAVA_INT_MIN = -2_147_483_648;
const JAVA_INT_MAX = 2_147_483_647;

const reverseLinkedListInputSchema = z.object({
  values: z
    .array(
      z
        .number()
        .int("Each list value must be an integer.")
        .min(JAVA_INT_MIN, "Each value must fit in a Java int.")
        .max(JAVA_INT_MAX, "Each value must fit in a Java int."),
    )
    .max(25, "Use at most 25 list nodes."),
});

type ReverseLinkedListInput = z.infer<typeof reverseLinkedListInputSchema>;

function parseRawInput(raw: RawTraceInput): unknown {
  return {
    values: parseField(raw, "values", parseIntegerArray),
  };
}

function reverseOracle(input: ReverseLinkedListInput): number[] {
  return [...input.values].reverse();
}

function nodeId(index: number | null): string | null {
  return index === null ? null : `node-${index}`;
}

interface ListSceneState {
  values: readonly number[];
  nextIndices: readonly (number | null)[];
  prevIndex: number | null;
  currentIndex: number | null;
  nextIndex: number | null;
  focusIndex?: number | null;
  focusRole?: TraceItemRole;
  title: string;
  description: string;
  outputHead?: boolean;
  outputComplete?: boolean;
}

function linkedListScene(state: ListSceneState): TraceLinkedListScene {
  const {
    values,
    nextIndices,
    prevIndex,
    currentIndex,
    nextIndex,
    focusIndex = null,
    focusRole = "current",
    title,
    description,
    outputHead = false,
    outputComplete = false,
  } = state;

  return {
    id: "pointer-state",
    kind: "linked-list",
    title,
    description,
    nodes: values.map((value, index) => ({
      id: `node-${index}`,
      value,
      nextId: nodeId(nextIndices[index] ?? null),
      role: outputComplete
        ? "accepted"
        : index === focusIndex
          ? focusRole
          : currentIndex !== null && index < currentIndex
            ? "visited"
            : "default",
      label: `original index ${index}`,
    })),
    headId: outputHead ? nodeId(prevIndex) : nodeId(currentIndex),
    pointers: [
      { id: "prev-pointer", label: "prev", nodeId: nodeId(prevIndex) },
      {
        id: "current-pointer",
        label: "curr (head)",
        nodeId: nodeId(currentIndex),
      },
      { id: "next-pointer", label: "next", nodeId: nodeId(nextIndex) },
    ],
  };
}

function variables(
  values: readonly number[],
  prevIndex: number | null,
  currentIndex: number | null,
  nextIndex: number | null,
  changed: "setup" | "saved" | "rewired" | "advanced" | "complete",
): readonly TraceVariable[] {
  const valueAt = (index: number | null): number | null =>
    index === null ? null : (values[index] ?? null);

  return [
    {
      name: "prev",
      value: valueAt(prevIndex),
      changed: changed === "advanced" || changed === "complete",
    },
    {
      name: "curr (head)",
      value: valueAt(currentIndex),
      changed: changed === "advanced" || changed === "complete",
    },
    {
      name: "next",
      value: valueAt(nextIndex),
      changed: changed === "saved" || changed === "advanced",
    },
  ];
}

function rewireCheckpoint(
  currentValue: number,
  prevValue: number | null,
  nextValue: number | null,
): TraceCheckpoint {
  return {
    prompt: `After head.next = prev, where will node ${currentValue} point?`,
    options: [
      {
        id: "previous",
        label:
          prevValue === null
            ? "null (the current prev)"
            : `node ${prevValue} (prev)`,
      },
      {
        id: "saved-next",
        label:
          nextValue === null
            ? "null (the saved next)"
            : `node ${nextValue} (next)`,
      },
      { id: "itself", label: `back to node ${currentValue}` },
    ],
    answerId: "previous",
    explanation:
      "The assignment replaces the current node's forward link with prev. The saved next variable keeps the untouched suffix reachable.",
  };
}

function emptyCheckpoint(): TraceCheckpoint {
  return {
    prompt: "The head pointer is null. What happens next?",
    options: [
      { id: "skip", label: "Skip the loop and return prev" },
      { id: "create", label: "Create a replacement node" },
    ],
    answerId: "skip",
    explanation:
      "The while condition is false, so the method returns the initial null prev pointer.",
  };
}

function traceReverseLinkedList(input: ReverseLinkedListInput): TraceRun {
  const values = [...input.values];
  const nextIndices: (number | null)[] = values.map((_, index) =>
    index + 1 < values.length ? index + 1 : null,
  );
  const frames: TraceFrame[] = [];
  let prevIndex: number | null = null;
  let currentIndex: number | null = values.length > 0 ? 0 : null;

  frames.push({
    id: "setup",
    phase: "Initialize",
    codeRefs: ["initialize-prev", "check-current"],
    explanation:
      currentIndex === null
        ? "prev and head both start at null, so there is no node to reverse."
        : "prev starts at null while head identifies the first node to process.",
    changed:
      "prev is initialized to null; the input links are still unchanged.",
    invariant:
      "prev heads the reversed prefix, and curr heads the untouched suffix; together they contain every original node exactly once.",
    variables: variables(values, prevIndex, currentIndex, null, "setup"),
    scenes: [
      linkedListScene({
        values,
        nextIndices,
        prevIndex,
        currentIndex,
        nextIndex: null,
        focusIndex: currentIndex,
        title: "Initial list",
        description:
          currentIndex === null
            ? "Both the reversed prefix and remaining suffix are empty."
            : "The reversed prefix is empty; curr heads the complete original list.",
      }),
    ],
    focusSceneId: "pointer-state",
    ...(currentIndex === null ? { checkpoint: emptyCheckpoint() } : {}),
  });

  while (currentIndex !== null) {
    const processingIndex = currentIndex;
    const nextIndex = nextIndices[processingIndex] ?? null;
    const iteration = processingIndex;

    frames.push({
      id: `save-next-${iteration}`,
      phase: "Protect suffix",
      codeRefs: ["check-current", "save-next"],
      explanation:
        nextIndex === null
          ? `Save null because node ${values[processingIndex]} is the end of the remaining suffix.`
          : `Save node ${values[nextIndex]} before replacing the current forward link.`,
      changed: `next now holds ${nextIndex === null ? "null" : `node ${values[nextIndex]}`}.`,
      invariant:
        "The saved next pointer keeps the entire untouched suffix reachable before any link is changed.",
      variables: variables(
        values,
        prevIndex,
        processingIndex,
        nextIndex,
        "saved",
      ),
      scenes: [
        linkedListScene({
          values,
          nextIndices,
          prevIndex,
          currentIndex: processingIndex,
          nextIndex,
          focusIndex: processingIndex,
          focusRole: "candidate",
          title: "Suffix protected",
          description:
            "prev heads the reversed prefix, curr is ready to move across the boundary, and next preserves the suffix.",
        }),
      ],
      focusSceneId: "pointer-state",
      ...(iteration === 0
        ? {
            checkpoint: rewireCheckpoint(
              values[processingIndex],
              prevIndex === null ? null : values[prevIndex],
              nextIndex === null ? null : values[nextIndex],
            ),
          }
        : {}),
    });

    nextIndices[processingIndex] = prevIndex;
    frames.push({
      id: `reverse-edge-${iteration}`,
      phase: "Reverse link",
      codeRefs: ["reverse-edge"],
      explanation:
        prevIndex === null
          ? `Point node ${values[processingIndex]} to null, making it the tail of the reversed prefix.`
          : `Point node ${values[processingIndex]} back to node ${values[prevIndex]}.`,
      changed: `The next edge from node ${values[processingIndex]} now targets ${prevIndex === null ? "null" : `node ${values[prevIndex]}`}.`,
      invariant:
        "The current node now leads into the correctly reversed prefix, while next still protects the untouched suffix.",
      variables: variables(
        values,
        prevIndex,
        processingIndex,
        nextIndex,
        "rewired",
      ),
      scenes: [
        linkedListScene({
          values,
          nextIndices,
          prevIndex,
          currentIndex: processingIndex,
          nextIndex,
          focusIndex: processingIndex,
          focusRole: "accepted",
          title: "One link reversed",
          description:
            "The current node has joined the reversed direction. The saved next pointer marks the detached suffix.",
        }),
      ],
      focusSceneId: "pointer-state",
    });

    prevIndex = processingIndex;
    currentIndex = nextIndex;
    frames.push({
      id: `advance-${iteration}`,
      phase: "Advance pointers",
      codeRefs: ["advance-prev", "advance-current"],
      explanation:
        currentIndex === null
          ? `Move prev to node ${values[prevIndex]}; curr reaches null because every node is reversed.`
          : `Move prev to node ${values[prevIndex]} and curr to saved node ${values[currentIndex]}.`,
      changed: `prev advances to node ${values[prevIndex]}; curr advances to ${currentIndex === null ? "null" : `node ${values[currentIndex]}`}.`,
      invariant:
        "prev heads a reversed prefix of the original list, and curr heads the still-original suffix.",
      variables: variables(values, prevIndex, currentIndex, null, "advanced"),
      scenes: [
        linkedListScene({
          values,
          nextIndices,
          prevIndex,
          currentIndex,
          nextIndex: null,
          focusIndex: prevIndex,
          focusRole: "visited",
          title: "Boundary advanced",
          description:
            currentIndex === null
              ? "The reversed prefix contains every node; the untouched suffix is empty."
              : "prev and curr now mark the boundary between the reversed prefix and untouched suffix.",
        }),
      ],
      focusSceneId: "pointer-state",
    });
  }

  const output = reverseOracle(input);
  frames.push({
    id: "complete",
    phase: "Complete",
    codeRefs: ["check-current", "return-new-head"],
    explanation:
      prevIndex === null
        ? "The empty list remains empty, so return null."
        : `head is null and prev points to node ${values[prevIndex]}, the new list head.`,
    changed: `Return the reversed list ${JSON.stringify(output)}.`,
    invariant:
      "Every original node appears exactly once, and every next edge now follows the reverse of the original order.",
    variables: variables(values, prevIndex, null, null, "complete"),
    scenes: [
      linkedListScene({
        values,
        nextIndices,
        prevIndex,
        currentIndex: null,
        nextIndex: null,
        focusIndex: prevIndex,
        focusRole: "accepted",
        title: "Reversed output",
        description:
          prevIndex === null
            ? "The output contains no nodes."
            : "prev is the new head, and following next pointers visits values in reverse order.",
        outputHead: true,
        outputComplete: true,
      }),
    ],
    focusSceneId: "pointer-state",
    complete: true,
    output,
  });

  return { input: { values }, output, frames };
}

export const reverseLinkedListRuntime = createTraceRuntime<
  ReverseLinkedListInput,
  number[]
>({
  definition: reverseLinkedListDefinition,
  schema: reverseLinkedListInputSchema,
  parseRaw: parseRawInput,
  trace: traceReverseLinkedList,
  oracle: reverseOracle,
});

export default reverseLinkedListRuntime;
