import { z } from "zod";

import { linkedListCycleDefinition } from "@/content/visualizations/problems/0141-linked-list-cycle/definition";
import {
  createTraceRuntime,
  javaInteger,
  parseField,
  parseInteger,
  parseIntegerArray,
} from "@/lib/visualizer";
import type {
  RawTraceInput,
  TraceCheckpoint,
  TraceFrame,
  TraceItemRole,
  TraceLinkedListScene,
  TraceRun,
  TraceVariable,
} from "@/lib/visualizer";

const linkedListCycleInputSchema = z
  .object({
    values: z.array(javaInteger).max(25, "Use at most 25 nodes."),
    pos: z.number().int("Cycle position must be an integer."),
  })
  .superRefine(({ values, pos }, context) => {
    const maximumPosition = values.length - 1;
    if (pos < -1 || pos > maximumPosition) {
      context.addIssue({
        code: "custom",
        path: ["pos"],
        message:
          values.length === 0
            ? "An empty list must use -1 for the cycle position."
            : `Use -1 or an index from 0 through ${maximumPosition}.`,
      });
    }
  });

type LinkedListCycleInput = z.infer<typeof linkedListCycleInputSchema>;

function parseRawInput(raw: RawTraceInput): unknown {
  return {
    values: parseField(raw, "values", parseIntegerArray),
    pos: parseField(raw, "pos", parseInteger),
  };
}

function nextIndex(
  index: number | null,
  length: number,
  cyclePosition: number,
): number | null {
  if (index === null) return null;
  if (index + 1 < length) return index + 1;
  return cyclePosition >= 0 ? cyclePosition : null;
}

function visitedNodeOracle({ values, pos }: LinkedListCycleInput): boolean {
  const visited = new Set<number>();
  let current: number | null = values.length > 0 ? 0 : null;

  while (current !== null) {
    if (visited.has(current)) return true;
    visited.add(current);
    current = nextIndex(current, values.length, pos);
  }

  return false;
}

function nodeLabel(
  index: number,
  slow: number | null,
  fast: number | null,
  slowTrail: ReadonlySet<number>,
  fastTrail: ReadonlySet<number>,
  meetingConfirmed: boolean,
): string | undefined {
  if (index === slow && index === fast)
    return meetingConfirmed ? "slow + fast · cycle found" : "slow + fast";
  if (index === slow) return "slow";
  if (index === fast) return "fast";
  if (slowTrail.has(index) && fastTrail.has(index)) return "both visited";
  if (slowTrail.has(index)) return "slow visited";
  if (fastTrail.has(index)) return "fast visited";
  return undefined;
}

function nodeRole(
  index: number,
  slow: number | null,
  fast: number | null,
  slowTrail: ReadonlySet<number>,
  fastTrail: ReadonlySet<number>,
  meetingConfirmed: boolean,
): TraceItemRole {
  if (index === slow && index === fast)
    return meetingConfirmed ? "accepted" : "current";
  if (index === slow) return "current";
  if (index === fast) return "candidate";
  if (slowTrail.has(index) || fastTrail.has(index)) return "visited";
  return "default";
}

function listScene(
  values: readonly number[],
  pos: number,
  slow: number | null,
  fast: number | null,
  slowTrail: ReadonlySet<number>,
  fastTrail: ReadonlySet<number>,
  description: string,
  meetingConfirmed = false,
): TraceLinkedListScene {
  return {
    id: "linked-list",
    kind: "linked-list",
    title: "Pointer race",
    description,
    nodes: values.map((value, index) => ({
      id: `node-${index}`,
      value,
      nextId:
        index + 1 < values.length
          ? `node-${index + 1}`
          : pos >= 0
            ? `node-${pos}`
            : null,
      role: nodeRole(index, slow, fast, slowTrail, fastTrail, meetingConfirmed),
      ...(nodeLabel(index, slow, fast, slowTrail, fastTrail, meetingConfirmed)
        ? {
            label: nodeLabel(
              index,
              slow,
              fast,
              slowTrail,
              fastTrail,
              meetingConfirmed,
            ),
          }
        : {}),
    })),
    headId: values.length > 0 ? "node-0" : null,
    cycleToId: pos >= 0 ? `node-${pos}` : null,
    pointers: [
      {
        id: "slow-pointer",
        label: "slow",
        nodeId: slow === null ? null : `node-${slow}`,
      },
      {
        id: "fast-pointer",
        label: "fast",
        nodeId: fast === null ? null : `node-${fast}`,
      },
    ],
  };
}

function pointerVariables(
  slow: number | null,
  fast: number | null,
  previousSlow?: number | null,
  previousFast?: number | null,
): readonly TraceVariable[] {
  return [
    previousSlow === undefined
      ? { name: "slow index", value: slow }
      : {
          name: "slow index",
          value: slow,
          previous: previousSlow,
          changed: slow !== previousSlow,
        },
    previousFast === undefined
      ? { name: "fast index", value: fast }
      : {
          name: "fast index",
          value: fast,
          previous: previousFast,
          changed: fast !== previousFast,
        },
  ];
}

function nextMoveCheckpoint(
  slow: number | null,
  fast: number | null,
  length: number,
  pos: number,
): TraceCheckpoint {
  const fastFirstStep = nextIndex(fast, length, pos);
  const canAdvance = fast !== null && fastFirstStep !== null;
  const nextSlow = canAdvance ? nextIndex(slow, length, pos) : null;
  const nextFast = canAdvance ? nextIndex(fastFirstStep, length, pos) : null;
  const willMeet = canAdvance && nextSlow === nextFast;

  return {
    prompt: "Predict the next control-flow result for slow and fast.",
    options: [
      { id: "meet", label: "They advance and meet" },
      { id: "separate", label: "They advance but stay apart" },
      { id: "stop", label: "The guard stops the loop" },
    ],
    answerId: !canAdvance ? "stop" : willMeet ? "meet" : "separate",
    explanation: !canAdvance
      ? "fast is null or has no next node, so the while guard fails before either pointer moves."
      : willMeet
        ? `slow and fast both land on node ${nextSlow} after moving one and two links respectively.`
        : `slow lands on node ${nextSlow}, while fast lands on ${nextFast === null ? "null" : `node ${nextFast}`}.`,
  };
}

function traceLinkedListCycle(input: LinkedListCycleInput): TraceRun {
  const values = [...input.values];
  const pos = input.pos;
  const frames: TraceFrame[] = [];
  const slowTrail = new Set<number>();
  const fastTrail = new Set<number>();
  let slow: number | null = values.length > 0 ? 0 : null;
  let fast: number | null = values.length > 0 ? 0 : null;

  frames.push({
    id: "initialize",
    phase: "Initialize",
    codeRefs: ["initialize-pointers"],
    explanation:
      values.length === 0
        ? "Both pointers start at the null head of the empty list."
        : "Place slow and fast on the head before either pointer follows an edge.",
    changed: "slow and fast are initialized to head.",
    invariant:
      "Both pointers represent nodes reached from head, and no link has been traversed yet.",
    variables: [
      ...pointerVariables(slow, fast),
      { name: "cycle position", value: pos },
    ],
    scenes: [
      listScene(
        values,
        pos,
        slow,
        fast,
        slowTrail,
        fastTrail,
        values.length === 0
          ? "The list is empty, so both pointers are null."
          : "Both pointers begin at the head. The tail's curved back edge appears when pos is not -1.",
      ),
    ],
    focusSceneId: "linked-list",
    checkpoint: nextMoveCheckpoint(slow, fast, values.length, pos),
  });

  let iteration = 0;

  while (true) {
    const fastNext = nextIndex(fast, values.length, pos);
    const canAdvance = fast !== null && fastNext !== null;

    if (!canAdvance) {
      const output = false;
      frames.push({
        id: "complete-no-cycle",
        phase: "Complete",
        codeRefs: ["check-room-to-advance", "return-no-cycle"],
        explanation:
          fast === null
            ? "fast reached null, so the loop ends and the method returns false."
            : "fast has no next node, so it cannot take two steps; the loop ends and the method returns false.",
        changed:
          "The while guard becomes false and the result is finalized as false.",
        invariant:
          "Reaching the end of a finite next-chain proves no reachable node points back into that chain.",
        variables: [
          ...pointerVariables(slow, fast),
          { name: "fast.next index", value: fastNext },
          { name: "guard", value: false, previous: true, changed: true },
          { name: "result", value: output, previous: null, changed: true },
        ],
        scenes: [
          listScene(
            values,
            pos,
            slow,
            fast,
            slowTrail,
            fastTrail,
            "The faster pointer has reached the end condition without meeting slow.",
          ),
        ],
        focusSceneId: "linked-list",
        complete: true,
        output,
      });
      return { input: { values, pos }, output, frames };
    }

    const previousSlow = slow;
    const previousFast = fast;
    if (previousSlow !== null) slowTrail.add(previousSlow);
    if (previousFast !== null) fastTrail.add(previousFast);
    fastTrail.add(fastNext);

    slow = nextIndex(previousSlow, values.length, pos);
    fast = nextIndex(fastNext, values.length, pos);

    frames.push({
      id: `advance-${iteration}`,
      phase: "Advance pointers",
      codeRefs: ["check-room-to-advance", "advance-slow", "advance-fast"],
      explanation: `The guard confirms two fast steps are safe. slow follows one link to ${slow === null ? "null" : `node ${slow}`}; fast follows two links to ${fast === null ? "null" : `node ${fast}`}.`,
      changed: "The guard passes; slow advances once and fast advances twice.",
      invariant:
        "After this iteration, slow has taken one new step while fast has taken two new steps from its prior position.",
      variables: [
        ...pointerVariables(slow, fast, previousSlow, previousFast),
        {
          name: "iteration",
          value: iteration + 1,
          previous: iteration,
          changed: true,
        },
        { name: "guard", value: true },
      ],
      focusSceneId: "linked-list",
      scenes: [
        listScene(
          values,
          pos,
          slow,
          fast,
          slowTrail,
          fastTrail,
          "Pointer labels show the new positions; visited styling records their trails.",
        ),
      ],
    });

    const met = slow === fast;
    if (met) {
      const output = true;
      frames.push({
        id: `compare-${iteration}`,
        phase: "Complete",
        codeRefs: ["compare-pointers"],
        explanation: `slow and fast refer to the same node ${slow}, so the method returns true immediately.`,
        changed:
          "The pointer comparison matches and the result is finalized as true.",
        invariant:
          "A faster pointer can catch a slower pointer only when reachable next links repeat inside a cycle.",
        variables: [
          ...pointerVariables(slow, fast),
          { name: "slow == fast", value: true, previous: false, changed: true },
          { name: "result", value: output, previous: null, changed: true },
        ],
        scenes: [
          listScene(
            values,
            pos,
            slow,
            fast,
            slowTrail,
            fastTrail,
            `Both pointers occupy node ${slow}; the cycle has been detected.`,
            true,
          ),
        ],
        focusSceneId: "linked-list",
        complete: true,
        output,
      });
      return { input: { values, pos }, output, frames };
    }

    frames.push({
      id: `compare-${iteration}`,
      phase: "Compare pointers",
      codeRefs: ["compare-pointers"],
      explanation:
        "The pointers are on different nodes, so the method cannot return true yet.",
      changed:
        "The equality check is false; execution continues to the next guard.",
      invariant:
        "No repeated pointer position has proved a cycle yet; every current pointer is still reachable from head.",
      variables: [
        ...pointerVariables(slow, fast),
        { name: "slow == fast", value: false },
      ],
      focusSceneId: "linked-list",
      scenes: [
        listScene(
          values,
          pos,
          slow,
          fast,
          slowTrail,
          fastTrail,
          "slow and fast remain apart after this advance.",
        ),
      ],
    });

    iteration += 1;
  }
}

export const linkedListCycleRuntime = createTraceRuntime<
  LinkedListCycleInput,
  boolean
>({
  definition: linkedListCycleDefinition,
  schema: linkedListCycleInputSchema,
  parseRaw: parseRawInput,
  trace: traceLinkedListCycle,
  oracle: visitedNodeOracle,
});

export default linkedListCycleRuntime;
