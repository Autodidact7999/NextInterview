import { z } from "zod";

import { containsDuplicateDefinition } from "@/content/visualizations/problems/0217-contains-duplicate/definition";
import { createTraceRuntime, parseField } from "@/lib/visualizer/runtime";
import type {
  RawTraceInput,
  TraceCheckpoint,
  TraceFrame,
  TraceItemRole,
  TraceRun,
  TraceScene,
  TraceVariable,
} from "@/lib/visualizer/types";

const JAVA_INT_MIN = -2_147_483_648;
const JAVA_INT_MAX = 2_147_483_647;

const containsDuplicateInputSchema = z.object({
  nums: z
    .array(
      z
        .number()
        .int("Each value must be an integer.")
        .min(JAVA_INT_MIN, "Values must fit in a Java int.")
        .max(JAVA_INT_MAX, "Values must fit in a Java int."),
    )
    .max(40, "Use at most 40 integers."),
});

type ContainsDuplicateInput = z.infer<typeof containsDuplicateInputSchema>;

interface SeenValue {
  value: number;
  firstIndex: number;
}

function parseRawInput(raw: RawTraceInput): unknown {
  return {
    nums: parseField(raw, "nums", (value) => {
      if (!value.trim()) throw new Error("Enter a JSON array of integers.");
      let parsed: unknown;
      try {
        parsed = JSON.parse(value);
      } catch {
        throw new Error("Use valid JSON, for example [4, 7, 2, 4].");
      }
      if (!Array.isArray(parsed))
        throw new Error("Enter the numbers as a JSON array.");
      return parsed;
    }),
  };
}

function pairwiseDuplicateOracle(input: ContainsDuplicateInput): boolean {
  for (let left = 0; left < input.nums.length; left += 1) {
    for (let right = left + 1; right < input.nums.length; right += 1) {
      if (input.nums[left] === input.nums[right]) return true;
    }
  }
  return false;
}

function sequenceScene(
  nums: readonly number[],
  currentIndex: number | null,
  currentRole: TraceItemRole = "current",
  duplicateOfIndex: number | null = null,
): TraceScene {
  return {
    id: "input-array",
    kind: "sequence",
    title: "Input scan",
    description:
      currentIndex === null
        ? nums.length === 0
          ? "The input has no values."
          : "No value has been inspected yet."
        : duplicateOfIndex === null
          ? `The scan is inspecting index ${currentIndex}.`
          : `${nums[currentIndex]} repeats: first at index ${duplicateOfIndex}, now at index ${currentIndex}.`,
    items: nums.map((value, index) => ({
      id: `index-${index}`,
      label: String(index),
      value,
      role:
        index === currentIndex
          ? currentRole
          : index === duplicateOfIndex
            ? "candidate"
            : currentIndex !== null && index < currentIndex
              ? "visited"
              : "default",
      ...(index === currentIndex
        ? {
            note:
              duplicateOfIndex === null ? "current value" : "duplicate here",
          }
        : index === duplicateOfIndex
          ? { note: "first occurrence" }
          : {}),
    })),
    ...(currentIndex === null
      ? {}
      : {
          pointers: [{ id: "scan-index", label: "n", index: currentIndex }],
        }),
  };
}

function seenScene(
  seenValues: readonly SeenValue[],
  activeValue: number | null,
  activeRole: TraceItemRole = "current",
): TraceScene {
  return {
    id: "seen-set",
    kind: "associative",
    title: "Hash set: seen",
    description:
      seenValues.length === 0
        ? "The set is empty."
        : "Each retained value shows the first input index where it appeared.",
    entries: seenValues.map(({ value, firstIndex }) => ({
      id: `seen-${value}`,
      key: String(value),
      value: firstIndex,
      role: value === activeValue ? activeRole : "default",
    })),
    emptyLabel: "No visited values yet",
  };
}

function variables(
  index: number | null,
  current: number | null,
  seenSize: number,
  previousSeenSize?: number,
): readonly TraceVariable[] {
  return [
    { name: "index", value: index, changed: index !== null },
    { name: "n", value: current, changed: current !== null },
    previousSeenSize === undefined
      ? { name: "seen.size", value: seenSize }
      : {
          name: "seen.size",
          value: seenSize,
          previous: previousSeenSize,
          changed: seenSize !== previousSeenSize,
        },
  ];
}

function predictionCheckpoint(isDuplicate: boolean): TraceCheckpoint {
  return {
    prompt: "What will seen.add(n) do for this value?",
    options: [
      { id: "insert", label: "Insert it and return true" },
      { id: "duplicate", label: "Leave the set unchanged and return false" },
      { id: "replace", label: "Replace the earlier value" },
    ],
    answerId: isDuplicate ? "duplicate" : "insert",
    explanation: isDuplicate
      ? "HashSet already contains this value, so add returns false and the method returns true immediately."
      : "This value is not present, so HashSet inserts it and add returns true.",
  };
}

function emptyCheckpoint(): TraceCheckpoint {
  return {
    prompt: "With an empty input, which return statement runs?",
    options: [
      { id: "true", label: "return true inside the loop" },
      { id: "false", label: "return false after the loop" },
    ],
    answerId: "false",
    explanation:
      "The loop has no iterations, so execution reaches return false.",
  };
}

function traceContainsDuplicate(input: ContainsDuplicateInput): TraceRun {
  const nums = [...input.nums];
  const frames: TraceFrame[] = [];
  const firstIndices = new Map<number, number>();
  const seenValues: SeenValue[] = [];
  const firstDuplicateIndex = nums.findIndex((value, index) =>
    nums.slice(0, index).includes(value),
  );
  const checkpointIndex = firstDuplicateIndex >= 0 ? firstDuplicateIndex : 0;

  frames.push({
    id: "setup",
    phase: "Initialize",
    codeRefs: ["create-seen"],
    explanation: "Create an empty HashSet before scanning the array.",
    changed: "seen is initialized with no entries.",
    invariant: "Before the first iteration, no input values have been visited.",
    variables: variables(null, null, 0),
    scenes: [sequenceScene(nums, null), seenScene(seenValues, null)],
    focusSceneId: "input-array",
    ...(nums.length === 0 ? { checkpoint: emptyCheckpoint() } : {}),
  });

  for (let index = 0; index < nums.length; index += 1) {
    const current = nums[index];
    const duplicateOfIndex = firstIndices.get(current) ?? null;
    const duplicate = duplicateOfIndex !== null;

    frames.push({
      id: `inspect-${index}`,
      phase: "Check value",
      codeRefs: ["scan-values", "add-or-return"],
      explanation: duplicate
        ? `${current} first appeared at index ${duplicateOfIndex}; seeing it again at index ${index} makes HashSet.add report a duplicate.`
        : `${current} is not in seen, so HashSet.add can insert it.`,
      changed: `n now refers to nums[${index}] (${current}); seen has not changed yet.`,
      invariant:
        "seen contains every distinct value before the current index and no later values.",
      variables: variables(index, current, firstIndices.size),
      scenes: [
        sequenceScene(
          nums,
          index,
          duplicate ? "rejected" : "candidate",
          duplicateOfIndex,
        ),
        seenScene(
          seenValues,
          duplicate ? current : null,
          duplicate ? "rejected" : "current",
        ),
      ],
      focusSceneId: "input-array",
      ...(index === checkpointIndex
        ? { checkpoint: predictionCheckpoint(duplicate) }
        : {}),
    });

    if (duplicate) {
      const output = true;
      frames.push({
        id: `complete-duplicate-${index}`,
        phase: "Complete",
        codeRefs: ["add-or-return"],
        explanation: `Indices ${duplicateOfIndex} and ${index} both contain ${current}. Adding it again returns false, so the method returns true without inspecting later values.`,
        changed: "The result becomes true; seen stays unchanged.",
        invariant: "A repeated value has been proven by two visited positions.",
        variables: [
          ...variables(index, current, firstIndices.size),
          {
            name: "first index",
            value: duplicateOfIndex,
            changed: true,
          },
          { name: "result", value: true, previous: null, changed: true },
        ],
        scenes: [
          sequenceScene(nums, index, "rejected", duplicateOfIndex),
          seenScene(seenValues, current, "rejected"),
        ],
        focusSceneId: "input-array",
        complete: true,
        output,
      });
      return { input: { nums }, output, frames };
    }

    const previousSeenSize = firstIndices.size;
    firstIndices.set(current, index);
    seenValues.push({ value: current, firstIndex: index });
    frames.push({
      id: `accept-${index}`,
      phase: "Record value",
      codeRefs: ["add-or-return"],
      explanation: `HashSet.add returns true and records ${current} for later checks.`,
      changed: `${current} is added to seen with first index ${index}; its size grows to ${firstIndices.size}.`,
      invariant:
        "seen contains every distinct value through the current index.",
      variables: variables(index, current, firstIndices.size, previousSeenSize),
      scenes: [
        sequenceScene(nums, index, "accepted"),
        seenScene(seenValues, current, "accepted"),
      ],
      focusSceneId: "seen-set",
    });
  }

  const output = false;
  frames.push({
    id: "complete-distinct",
    phase: "Complete",
    codeRefs: ["no-duplicate"],
    explanation: "Every insertion succeeded, so no duplicate exists.",
    changed: "The result becomes false after the loop finishes.",
    invariant:
      "Every input value has been visited and all values are distinct.",
    variables: [
      ...variables(
        nums.length === 0 ? null : nums.length - 1,
        null,
        firstIndices.size,
      ),
      { name: "result", value: false, previous: null, changed: true },
    ],
    scenes: [sequenceScene(nums, null), seenScene(seenValues, null)],
    focusSceneId: "input-array",
    complete: true,
    output,
  });

  return { input: { nums }, output, frames };
}

export const containsDuplicateRuntime = createTraceRuntime<
  ContainsDuplicateInput,
  boolean
>({
  definition: containsDuplicateDefinition,
  schema: containsDuplicateInputSchema,
  parseRaw: parseRawInput,
  trace: traceContainsDuplicate,
  oracle: pairwiseDuplicateOracle,
});

export default containsDuplicateRuntime;
