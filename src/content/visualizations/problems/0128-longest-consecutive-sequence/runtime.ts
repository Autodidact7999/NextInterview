import { z } from "zod";

import { longestConsecutiveSequenceDefinition } from "@/content/visualizations/problems/0128-longest-consecutive-sequence/definition";
import {
  createTraceRuntime,
  javaInteger,
  parseField,
  parseIntegerArray,
} from "@/lib/visualizer";
import type {
  RawTraceInput,
  TraceAssociativeScene,
  TraceCheckpoint,
  TraceFrame,
  TraceItemRole,
  TraceRun,
  TraceSequenceScene,
} from "@/lib/visualizer";

const JAVA_INT_MIN = -2_147_483_648;
const JAVA_INT_MAX = 2_147_483_647;

const longestConsecutiveSequenceInputSchema = z.object({
  nums: z
    .array(javaInteger)
    .max(40, "Use at most 40 integers.")
    .refine(
      (nums) => !nums.includes(JAVA_INT_MIN) && !nums.includes(JAVA_INT_MAX),
      "The Java solution subtracts or adds one, so use values strictly inside the Java int endpoints.",
    ),
});

type LongestConsecutiveSequenceInput = z.infer<
  typeof longestConsecutiveSequenceInputSchema
>;

function parseRawInput(raw: RawTraceInput): unknown {
  return {
    nums: parseField(raw, "nums", parseIntegerArray),
  };
}

function sortedUniqueRunOracle({
  nums,
}: LongestConsecutiveSequenceInput): number {
  const sorted = [...nums].sort((left, right) => left - right);
  let previous: number | null = null;
  let currentLength = 0;
  let bestLength = 0;

  for (const value of sorted) {
    if (value === previous) continue;
    currentLength =
      previous !== null && value === previous + 1 ? currentLength + 1 : 1;
    bestLength = Math.max(bestLength, currentLength);
    previous = value;
  }

  return bestLength;
}

function inputScene(
  nums: readonly number[],
  processedCount: number,
  activeIndex: number | null = null,
  activeValue: number | null = null,
  acceptedValues: readonly number[] = [],
): TraceSequenceScene {
  const accepted = new Set(acceptedValues);
  return {
    id: "input-values",
    kind: "sequence",
    title: "Original input",
    description:
      activeIndex !== null
        ? `Insert nums[${activeIndex}] into the set.`
        : activeValue !== null
          ? `Inspect unique value ${activeValue}; input order no longer controls the search.`
          : `${processedCount} of ${nums.length} input positions have been processed.`,
    items: nums.map((value, index) => {
      let role: TraceItemRole = "default";
      if (
        index === activeIndex ||
        (activeIndex === null && value === activeValue)
      ) {
        role = "current";
      } else if (accepted.has(value)) {
        role = "accepted";
      } else if (index < processedCount) {
        role = "visited";
      }

      return {
        id: `input-${index}`,
        label: `index ${index}`,
        value,
        role,
      };
    }),
    ...(activeIndex === null
      ? {}
      : {
          pointers: [{ id: "input-cursor", label: "n", index: activeIndex }],
        }),
  };
}

function setScene(
  values: readonly number[],
  current: number | null = null,
  candidate: number | null = null,
  acceptedValues: readonly number[] = [],
): TraceAssociativeScene {
  const accepted = new Set(acceptedValues);
  return {
    id: "unique-values",
    kind: "associative",
    title: "Hash set membership",
    description:
      current === null
        ? "Each entry records one distinct input value. Values are displayed in numeric order for a deterministic trace."
        : `Membership checks decide whether ${current} starts or extends a consecutive run.`,
    entries: values.map((value) => ({
      id: `member-${value}`,
      key: String(value),
      value: "present",
      role:
        value === candidate
          ? "candidate"
          : value === current
            ? "current"
            : accepted.has(value)
              ? "accepted"
              : "default",
    })),
    emptyLabel: "The input contains no values.",
  };
}

function adjacencyScene(
  values: readonly number[],
  current: number | null = null,
  candidate: number | null = null,
  acceptedValues: readonly number[] = [],
): TraceSequenceScene {
  const accepted = new Set(acceptedValues);
  const activeValue =
    candidate !== null && values.includes(candidate) ? candidate : current;
  const activeIndex = activeValue === null ? -1 : values.indexOf(activeValue);
  const acceptedIndices = acceptedValues
    .map((value) => values.indexOf(value))
    .filter((index) => index >= 0);
  const rangeStart =
    acceptedIndices.length === 0 ? -1 : Math.min(...acceptedIndices);
  const rangeEnd =
    acceptedIndices.length === 0 ? -1 : Math.max(...acceptedIndices);

  return {
    id: "sorted-adjacency",
    kind: "sequence",
    title: "Consecutive-value strip",
    description:
      values.length === 0
        ? "There are no unique values to arrange."
        : "This numeric ordering is only a visual aid: neighboring cells connect a run only when their values differ by exactly one.",
    items: values.map((value, index) => ({
      id: `ordered-${value}`,
      label: `sorted ${index}`,
      value,
      role:
        value === candidate
          ? "candidate"
          : value === current
            ? "current"
            : accepted.has(value)
              ? "accepted"
              : "default",
      ...(index > 0 && value === values[index - 1]! + 1
        ? { note: `continues from ${values[index - 1]}` }
        : index > 0
          ? { note: "gap before" }
          : {}),
    })),
    ...(activeIndex >= 0
      ? {
          pointers: [
            {
              id: "membership-cursor",
              label: candidate !== null ? "next" : "n",
              index: activeIndex,
            },
          ],
        }
      : {}),
    ...(rangeStart >= 0
      ? {
          ranges: [
            {
              id: "measured-run",
              label: `Consecutive run ${acceptedValues[0]}–${acceptedValues.at(-1)}`,
              start: rangeStart,
              end: rangeEnd,
              role: "accepted" as const,
            },
          ],
        }
      : {}),
  };
}

function extendCheckpoint(
  start: number,
  candidate: number,
  willExtend: boolean,
): TraceCheckpoint {
  return {
    prompt: `The run starts at ${start}. What happens when the loop checks ${candidate}?`,
    options: [
      { id: "extend", label: "Increase len and continue" },
      { id: "stop", label: "Stop this run" },
      { id: "restart", label: "Restart from the input array" },
    ],
    answerId: willExtend ? "extend" : "stop",
    explanation: willExtend
      ? `${candidate} is in the set, so the while condition succeeds and len increases.`
      : `${candidate} is absent, so the while condition is false and this run is complete.`,
  };
}

function emptyCheckpoint(): TraceCheckpoint {
  return {
    prompt: "The set is empty. What value reaches the return statement?",
    options: [
      { id: "zero", label: "The initialized max, 0" },
      { id: "one", label: "A default run length, 1" },
    ],
    answerId: "zero",
    explanation:
      "The set loop has no iterations, so max is never changed from zero.",
  };
}

function traceLongestConsecutiveSequence(
  input: LongestConsecutiveSequenceInput,
): TraceRun {
  const nums = [...input.nums];
  const valueSet = new Set<number>();
  const frames: TraceFrame[] = [
    {
      id: "create-set",
      phase: "Build set",
      codeRefs: ["create-set"],
      explanation:
        "Create an empty HashSet so later predecessor and successor checks are constant time.",
      changed: "Initialized set with zero members.",
      invariant: "No input positions have been processed yet.",
      variables: [
        { name: "input length", value: nums.length },
        { name: "set.size", value: 0 },
      ],
      scenes: [inputScene(nums, 0), setScene([])],
      focusSceneId: "input-values",
    },
  ];

  for (let index = 0; index < nums.length; index += 1) {
    const value = nums[index]!;
    const previousSize = valueSet.size;
    valueSet.add(value);
    const sortedValues = [...valueSet].sort((left, right) => left - right);
    const inserted = valueSet.size !== previousSize;

    frames.push({
      id: `insert-${index}`,
      phase: "Build set",
      codeRefs: ["fill-set"],
      explanation: inserted
        ? `Insert ${value}; it becomes a new membership key.`
        : `${value} is already present, so HashSet keeps one copy.`,
      changed: inserted
        ? `set.size grew from ${previousSize} to ${valueSet.size}.`
        : `set.size remains ${valueSet.size}; the duplicate changes nothing.`,
      invariant:
        "The set contains exactly the distinct values from the processed input prefix.",
      variables: [
        { name: "input index", value: index, changed: true },
        { name: "n", value, changed: true },
        {
          name: "set.size",
          value: valueSet.size,
          previous: previousSize,
          changed: inserted,
        },
      ],
      scenes: [
        inputScene(nums, index + 1, index),
        setScene(sortedValues, value),
      ],
      focusSceneId: "unique-values",
    });
  }

  const sortedValues = [...valueSet].sort((left, right) => left - right);
  let max = 0;
  let bestRun: number[] = [];
  frames.push({
    id: "initialize-max",
    phase: "Find starts",
    codeRefs: ["initialize-max"],
    explanation:
      "Initialize the best length to zero before scanning the distinct values.",
    changed: "max is initialized to 0.",
    invariant:
      "No candidate sequence has been measured, so zero is the correct best length so far.",
    variables: [
      { name: "set.size", value: valueSet.size },
      { name: "max", value: max },
    ],
    scenes: [adjacencyScene(sortedValues), setScene(sortedValues)],
    focusSceneId: "sorted-adjacency",
    ...(nums.length === 0 ? { checkpoint: emptyCheckpoint() } : {}),
  });

  let checkpointAdded = nums.length === 0;

  for (let scanIndex = 0; scanIndex < sortedValues.length; scanIndex += 1) {
    const start = sortedValues[scanIndex]!;
    const predecessor = start - 1;
    const hasPredecessor = valueSet.has(predecessor);

    frames.push({
      id: `inspect-start-${scanIndex}`,
      phase: "Find starts",
      codeRefs: ["scan-set", "find-start"],
      explanation: hasPredecessor
        ? `${predecessor} is present, so ${start} belongs to a run that begins earlier and must not be recounted.`
        : `${predecessor} is absent, so ${start} is the first value of a new run.`,
      changed: `n moved to ${start}; the predecessor check is ${hasPredecessor ? "present" : "absent"}.`,
      invariant:
        "A run is measured only at its smallest value, preventing the same consecutive values from being scanned repeatedly.",
      variables: [
        { name: "n", value: start, changed: true },
        { name: "n - 1", value: predecessor, changed: true },
        { name: "has predecessor", value: hasPredecessor },
        { name: "max", value: max },
      ],
      scenes: [
        adjacencyScene(
          sortedValues,
          start,
          hasPredecessor ? predecessor : null,
        ),
        setScene(sortedValues, start, hasPredecessor ? predecessor : null),
      ],
      focusSceneId: "sorted-adjacency",
    });

    if (hasPredecessor) continue;

    let length = 1;
    const runValues = [start];
    const firstCandidate = start + length;
    const willExtend = valueSet.has(firstCandidate);
    frames.push({
      id: `start-run-${scanIndex}`,
      phase: "Grow run",
      codeRefs: ["find-start", "initialize-length"],
      explanation: `Begin a run at ${start} with len = 1, counting the starting value itself.`,
      changed: `Initialized len to 1 for the run beginning at ${start}.`,
      invariant:
        "runValues contains every consecutive member from n through n + len - 1.",
      variables: [
        { name: "n", value: start },
        { name: "len", value: length, previous: null, changed: true },
        { name: "next candidate", value: firstCandidate },
        { name: "max", value: max },
      ],
      scenes: [
        adjacencyScene(sortedValues, start, firstCandidate, runValues),
        setScene(sortedValues, start, firstCandidate, runValues),
      ],
      focusSceneId: "sorted-adjacency",
      ...(!checkpointAdded
        ? {
            checkpoint: extendCheckpoint(start, firstCandidate, willExtend),
          }
        : {}),
    });
    checkpointAdded = true;

    while (valueSet.has(start + length)) {
      const candidate = start + length;
      const previousLength = length;
      runValues.push(candidate);
      length += 1;

      frames.push({
        id: `extend-${scanIndex}-${previousLength}`,
        phase: "Grow run",
        codeRefs: ["grow-run"],
        explanation: `${candidate} is present, so the consecutive run grows to length ${length}.`,
        changed: `len increased from ${previousLength} to ${length}.`,
        invariant:
          "Every integer from n through n + len - 1 is present in the set.",
        variables: [
          { name: "n", value: start },
          {
            name: "len",
            value: length,
            previous: previousLength,
            changed: true,
          },
          { name: "matched value", value: candidate, changed: true },
          { name: "max", value: max },
        ],
        scenes: [
          adjacencyScene(sortedValues, start, candidate, runValues),
          setScene(sortedValues, start, candidate, runValues),
        ],
        focusSceneId: "sorted-adjacency",
      });
    }

    const missingCandidate = start + length;
    frames.push({
      id: `stop-run-${scanIndex}`,
      phase: "Grow run",
      codeRefs: ["grow-run"],
      explanation: `${missingCandidate} is absent, so the run beginning at ${start} stops at length ${length}.`,
      changed: `No value was added; len remains ${length}.`,
      invariant:
        "The measured run is maximal: its predecessor and its next successor are both absent.",
      variables: [
        { name: "n", value: start },
        { name: "len", value: length },
        { name: "missing candidate", value: missingCandidate, changed: true },
        { name: "max", value: max },
      ],
      scenes: [
        adjacencyScene(sortedValues, start, null, runValues),
        setScene(sortedValues, start, null, runValues),
      ],
      focusSceneId: "sorted-adjacency",
    });

    const previousMax = max;
    if (length > max) {
      max = length;
      bestRun = [...runValues];
    }
    frames.push({
      id: `update-max-${scanIndex}`,
      phase: "Keep best",
      codeRefs: ["update-max"],
      explanation:
        length > previousMax
          ? `This length ${length} beats ${previousMax}, so it becomes the new maximum.`
          : `This length ${length} does not beat the current maximum ${previousMax}.`,
      changed:
        max === previousMax
          ? `max remains ${max}.`
          : `max increased from ${previousMax} to ${max}.`,
      invariant:
        "max is the greatest length among every sequence start processed so far.",
      variables: [
        { name: "run start", value: start },
        { name: "len", value: length },
        {
          name: "max",
          value: max,
          previous: previousMax,
          changed: max !== previousMax,
        },
      ],
      scenes: [
        adjacencyScene(sortedValues, start, null, bestRun),
        setScene(sortedValues, start, null, bestRun),
      ],
      focusSceneId: "sorted-adjacency",
    });
  }

  const output = max;
  frames.push({
    id: "complete",
    phase: "Complete",
    codeRefs: ["return-max"],
    explanation: `Return ${output}, the longest consecutive sequence length.`,
    changed: `The result is finalized as ${output}.`,
    invariant:
      "Every possible sequence start has been measured exactly once, so max is globally correct.",
    variables: [
      { name: "unique values", value: valueSet.size },
      { name: "max", value: output, changed: true },
    ],
    scenes: [
      adjacencyScene(sortedValues, null, null, bestRun),
      setScene(sortedValues, null, null, bestRun),
    ],
    focusSceneId: "sorted-adjacency",
    complete: true,
    output,
  });

  return {
    input: { nums },
    output,
    frames,
  };
}

export const longestConsecutiveSequenceRuntime = createTraceRuntime<
  LongestConsecutiveSequenceInput,
  number
>({
  definition: longestConsecutiveSequenceDefinition,
  schema: longestConsecutiveSequenceInputSchema,
  parseRaw: parseRawInput,
  trace: traceLongestConsecutiveSequence,
  oracle: sortedUniqueRunOracle,
});

export default longestConsecutiveSequenceRuntime;
