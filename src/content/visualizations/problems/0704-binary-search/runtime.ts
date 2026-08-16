import { z } from "zod";

import { binarySearchDefinition } from "@/content/visualizations/problems/0704-binary-search/definition";
import {
  createTraceRuntime,
  javaInteger,
  parseField,
  parseInteger,
  parseIntegerArray,
} from "@/lib/visualizer";
import type {
  RawTraceInput,
  TraceBarRangeScene,
  TraceCheckpoint,
  TraceFrame,
  TraceRun,
} from "@/lib/visualizer";

const binarySearchInputSchema = z.object({
  nums: z
    .array(javaInteger)
    .max(40, "Use at most 40 integers.")
    .refine(
      (nums) =>
        nums.every((value, index) => index === 0 || value > nums[index - 1]!),
      "Numbers must be in strictly increasing order with no duplicates.",
    ),
  target: javaInteger,
});

type BinarySearchInput = z.infer<typeof binarySearchInputSchema>;

function parseRawInput(raw: RawTraceInput): unknown {
  return {
    nums: parseField(raw, "nums", parseIntegerArray),
    target: parseField(raw, "target", parseInteger),
  };
}

function linearSearchOracle({ nums, target }: BinarySearchInput): number {
  return nums.indexOf(target);
}

function intervalScene(
  nums: readonly number[],
  lo: number,
  hi: number,
  mid: number | null,
  acceptedIndex: number | null = null,
): TraceBarRangeScene {
  const hasRange = nums.length > 0 && lo >= 0 && hi < nums.length && lo <= hi;
  const markers: { id: string; label: string; index: number }[] = [];

  if (hasRange) {
    markers.push({ id: "lower-bound", label: "lo", index: lo });
    markers.push({ id: "upper-bound", label: "hi", index: hi });
  }
  if (mid !== null) {
    markers.push({ id: "midpoint", label: "mid", index: mid });
  }

  return {
    id: "search-interval",
    kind: "bar-range",
    presentation: "ordered",
    title: "Inclusive search interval",
    description:
      acceptedIndex !== null
        ? `Index ${acceptedIndex} contains the target.`
        : hasRange
          ? `Only indices ${lo} through ${hi} can still contain the target.`
          : "No indices remain in the search interval.",
    bars: nums.map((value, index) => ({
      id: `value-${index}`,
      label: `index ${index}`,
      value,
      role:
        index === acceptedIndex
          ? "accepted"
          : index === mid
            ? "current"
            : hasRange && index >= lo && index <= hi
              ? "candidate"
              : "rejected",
    })),
    ...(hasRange
      ? { range: { start: lo, end: hi, label: "Possible target indices" } }
      : {}),
    ...(markers.length > 0 ? { markers } : {}),
  };
}

function comparisonCheckpoint(
  midValue: number,
  target: number,
): TraceCheckpoint {
  const answerId =
    midValue === target ? "return" : midValue < target ? "move-lo" : "move-hi";

  return {
    prompt: `nums[mid] is ${midValue} and target is ${target}. What does the Java code do next?`,
    options: [
      { id: "return", label: "Return mid" },
      { id: "move-lo", label: "Set lo to mid + 1" },
      { id: "move-hi", label: "Set hi to mid − 1" },
    ],
    answerId,
    explanation:
      answerId === "return"
        ? "The midpoint value equals the target, so its index is the answer."
        : answerId === "move-lo"
          ? "The midpoint value is smaller than the target, so sorted order rules out mid and everything left of it."
          : "The midpoint value is larger than the target, so sorted order rules out mid and everything right of it.",
  };
}

function emptyCheckpoint(): TraceCheckpoint {
  return {
    prompt: "With lo = 0 and hi = −1, what happens at the while condition?",
    options: [
      { id: "skip", label: "Skip the loop" },
      { id: "mid", label: "Compute mid = 0" },
      { id: "expand", label: "Expand the interval" },
    ],
    answerId: "skip",
    explanation:
      "The inclusive interval is already empty because lo is greater than hi, so execution proceeds to return −1.",
  };
}

function traceBinarySearch(input: BinarySearchInput): TraceRun {
  const nums = [...input.nums];
  let lo = 0;
  let hi = nums.length - 1;
  const frames: TraceFrame[] = [
    {
      id: "initialize",
      phase: "Initialize",
      codeRefs: ["initialize-range"],
      explanation:
        nums.length === 0
          ? "Set lo to 0 and hi to −1; the empty array creates an empty interval immediately."
          : `Set lo to the first index and hi to the last, making [${lo}, ${hi}] the inclusive search interval.`,
      changed: `Initialized lo = ${lo} and hi = ${hi}.`,
      invariant:
        "If the target occurs in the array, its index is inside the inclusive interval [lo, hi].",
      variables: [
        { name: "lo", value: lo },
        { name: "hi", value: hi },
        { name: "target", value: input.target },
      ],
      scenes: [intervalScene(nums, lo, hi, null)],
      focusSceneId: "search-interval",
      ...(nums.length === 0 ? { checkpoint: emptyCheckpoint() } : {}),
    },
  ];

  let step = 0;
  let checkpointAdded = nums.length === 0;

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const midValue = nums[mid]!;

    frames.push({
      id: `compare-${step}`,
      phase: "Compare midpoint",
      codeRefs: ["check-range", "choose-middle"],
      explanation: `The midpoint of [${lo}, ${hi}] is index ${mid}, whose value is ${midValue}. Compare it with ${input.target}.`,
      changed: `Computed mid = ${mid}.`,
      invariant:
        "The target, if present, remains inside [lo, hi]; mid divides that interval into two ordered halves.",
      variables: [
        { name: "lo", value: lo },
        { name: "hi", value: hi },
        { name: "mid", value: mid, changed: true },
        { name: "nums[mid]", value: midValue, changed: true },
        { name: "target", value: input.target },
      ],
      scenes: [intervalScene(nums, lo, hi, mid)],
      focusSceneId: "search-interval",
      ...(!checkpointAdded
        ? { checkpoint: comparisonCheckpoint(midValue, input.target) }
        : {}),
    });
    checkpointAdded = true;

    if (midValue === input.target) {
      const output = mid;
      frames.push({
        id: `complete-found-${step}`,
        phase: "Complete",
        codeRefs: ["return-found"],
        explanation: `nums[${mid}] equals ${input.target}, so return index ${mid}.`,
        changed: `Accepted index ${mid} as the result.`,
        invariant:
          "The returned index is in bounds and its array value equals the target.",
        variables: [
          { name: "mid", value: mid },
          { name: "nums[mid]", value: midValue },
          { name: "result", value: output, changed: true },
        ],
        scenes: [intervalScene(nums, lo, hi, mid, mid)],
        focusSceneId: "search-interval",
        complete: true,
        output,
      });
      return {
        input: { nums, target: input.target },
        output,
        frames,
      };
    }

    if (midValue < input.target) {
      const previousLo = lo;
      lo = mid + 1;
      frames.push({
        id: `discard-left-${step}`,
        phase: "Narrow interval",
        codeRefs: ["discard-left"],
        explanation: `${midValue} is smaller than ${input.target}. Discard indices ${previousLo} through ${mid} and continue to the right.`,
        changed: `Moved lo from ${previousLo} to ${lo}.`,
        invariant:
          "Sorted order proves every discarded value is smaller than the target; any match must remain inside [lo, hi].",
        variables: [
          { name: "lo", value: lo, previous: previousLo, changed: true },
          { name: "hi", value: hi },
          { name: "discarded through", value: mid },
        ],
        scenes: [intervalScene(nums, lo, hi, null)],
        focusSceneId: "search-interval",
      });
    } else {
      const previousHi = hi;
      hi = mid - 1;
      frames.push({
        id: `discard-right-${step}`,
        phase: "Narrow interval",
        codeRefs: ["discard-right"],
        explanation: `${midValue} is larger than ${input.target}. Discard indices ${mid} through ${previousHi} and continue to the left.`,
        changed: `Moved hi from ${previousHi} to ${hi}.`,
        invariant:
          "Sorted order proves every discarded value is larger than the target; any match must remain inside [lo, hi].",
        variables: [
          { name: "lo", value: lo },
          { name: "hi", value: hi, previous: previousHi, changed: true },
          { name: "discarded from", value: mid },
        ],
        scenes: [intervalScene(nums, lo, hi, null)],
        focusSceneId: "search-interval",
      });
    }

    step += 1;
  }

  const output = -1;
  frames.push({
    id: "complete-missing",
    phase: "Complete",
    codeRefs: ["check-range", "return-missing"],
    explanation:
      "lo is greater than hi, so no candidate index remains and the target is absent.",
    changed: "The interval became empty; set the result to −1.",
    invariant:
      "Every array index has been ruled out by a comparison justified by sorted order.",
    variables: [
      { name: "lo", value: lo },
      { name: "hi", value: hi },
      { name: "result", value: output, changed: true },
    ],
    scenes: [intervalScene(nums, lo, hi, null)],
    focusSceneId: "search-interval",
    complete: true,
    output,
  });

  return {
    input: { nums, target: input.target },
    output,
    frames,
  };
}

export const binarySearchRuntime = createTraceRuntime<
  BinarySearchInput,
  number
>({
  definition: binarySearchDefinition,
  schema: binarySearchInputSchema,
  parseRaw: parseRawInput,
  trace: traceBinarySearch,
  oracle: linearSearchOracle,
});

export default binarySearchRuntime;
