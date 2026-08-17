import { z } from "zod";

import { threeSumDefinition } from "@/content/visualizations/problems/0015-3sum/definition";
import {
  createTraceRuntime,
  parseField,
  parseIntegerArray,
} from "@/lib/visualizer";
import type {
  RawTraceInput,
  TraceAssociativeScene,
  TraceCheckpoint,
  TraceFrame,
  TraceRun,
  TraceSequenceScene,
} from "@/lib/visualizer";

const SAFE_TRIPLET_VALUE = 715_827_882;

const threeSumInputSchema = z.object({
  nums: z
    .array(
      z
        .number()
        .int("Every value must be a whole number.")
        .min(
          -SAFE_TRIPLET_VALUE,
          `Values must be at least −${SAFE_TRIPLET_VALUE.toLocaleString("en-US")}.`,
        )
        .max(
          SAFE_TRIPLET_VALUE,
          `Values must be at most ${SAFE_TRIPLET_VALUE.toLocaleString("en-US")}.`,
        ),
    )
    .min(3, "Enter at least three integers.")
    .max(20, "Use at most 20 integers."),
});

type ThreeSumInput = z.infer<typeof threeSumInputSchema>;
type Triplet = readonly [number, number, number];
type ThreeSumOutput = readonly Triplet[];

function parseRawInput(raw: RawTraceInput): unknown {
  return {
    nums: parseField(raw, "nums", parseIntegerArray).map((value) =>
      Object.is(value, -0) ? 0 : value,
    ),
  };
}

function compareTriplets(left: Triplet, right: Triplet): number {
  return left[0] - right[0] || left[1] - right[1] || left[2] - right[2];
}

function enumerateTriplets({ nums }: ThreeSumInput): ThreeSumOutput {
  const unique = new Map<string, Triplet>();

  for (let first = 0; first < nums.length - 2; first += 1) {
    for (let second = first + 1; second < nums.length - 1; second += 1) {
      for (let third = second + 1; third < nums.length; third += 1) {
        if (nums[first]! + nums[second]! + nums[third]! !== 0) continue;
        const values = [nums[first]!, nums[second]!, nums[third]!].sort(
          (left, right) => left - right,
        ) as [number, number, number];
        unique.set(values.join(","), values);
      }
    }
  }

  return Array.from(unique.values()).sort(compareTriplets);
}

function arrayScene(
  nums: readonly number[],
  fixed: number | null,
  left: number | null,
  right: number | null,
  accepted: boolean,
): TraceSequenceScene {
  const acceptedIndices = accepted
    ? new Set(
        [fixed, left, right].filter((index): index is number => index !== null),
      )
    : new Set<number>();
  const pointers: { id: string; label: string; index: number }[] = [];

  if (fixed !== null && fixed >= 0 && fixed < nums.length) {
    pointers.push({ id: "fixed", label: "i", index: fixed });
  }
  if (left !== null && left >= 0 && left < nums.length) {
    pointers.push({ id: "left", label: "l", index: left });
  }
  if (right !== null && right >= 0 && right < nums.length) {
    pointers.push({ id: "right", label: "r", index: right });
  }

  return {
    id: "sorted-numbers",
    kind: "sequence",
    title: "Sorted candidate space",
    description:
      fixed === null
        ? "Sorting places smaller values to the left so pointer moves have a predictable effect on the sum."
        : accepted
          ? "The three highlighted positions form the newly accepted zero-sum triplet."
          : left !== null && right !== null
            ? "The fixed value stays put while the left and right pointers test one remaining pair."
            : "The current fixed value is ready for its two-pointer scan.",
    items: nums.map((value, index) => ({
      id: `number-${index}`,
      label: `index ${index}`,
      value,
      role: acceptedIndices.has(index)
        ? "accepted"
        : index === fixed
          ? "current"
          : index === left || index === right
            ? "candidate"
            : fixed !== null && index < fixed
              ? "dimmed"
              : "default",
    })),
    pointers,
    ranges:
      left === null || right === null || left > right
        ? []
        : [
            {
              id: "pair-search",
              label: accepted ? "matched pair" : "remaining pair search",
              start: left,
              end: right,
              role: accepted ? "accepted" : "candidate",
            },
          ],
  };
}

function resultScene(
  triplets: ThreeSumOutput,
  newestIndex: number | null = null,
): TraceAssociativeScene {
  return {
    id: "result-tray",
    kind: "associative",
    title: "Accepted zero-sum triplets",
    description:
      triplets.length === 0
        ? "No zero-sum triplet has been accepted yet."
        : "Each row is one distinct answer; the three values are kept as a structured tuple.",
    entries: triplets.map((triplet, index) => ({
      id: `triplet-${index}`,
      key: `Triplet ${index + 1}`,
      value: [...triplet],
      role: index === newestIndex ? "accepted" : "default",
    })),
    emptyLabel: "No answers recorded yet.",
  };
}

function comparisonCheckpoint(sum: number): TraceCheckpoint {
  const answerId = sum === 0 ? "record" : sum < 0 ? "left" : "right";
  return {
    prompt: `The current three values total ${sum}. What does the Java code do next?`,
    options: [
      { id: "record", label: "Record the triplet" },
      { id: "left", label: "Move l to the right" },
      { id: "right", label: "Move r to the left" },
    ],
    answerId,
    explanation:
      answerId === "record"
        ? "A zero sum is a valid answer, so the triplet is recorded before duplicate values are skipped."
        : answerId === "left"
          ? "The sum is too small. Because the array is sorted, moving l right is the only pointer move that can increase it."
          : "The sum is too large. Because the array is sorted, moving r left is the only pointer move that can decrease it.",
  };
}

function traceThreeSum(input: ThreeSumInput): TraceRun {
  const original = [...input.nums];
  const nums = [...input.nums].sort((left, right) => left - right);
  const results: Triplet[] = [];
  const frames: TraceFrame[] = [
    {
      id: "initialize",
      phase: "Sort",
      codeRefs: ["sort-input", "create-results"],
      explanation:
        "Sort the numbers and create an empty result list. Sorted order makes every later pointer move directional.",
      changed: `Reordered the input as [${nums.join(", ")}].`,
      invariant:
        "The working array is nondecreasing, and the result list contains no duplicate triplets.",
      variables: [
        { name: "length", value: nums.length },
        { name: "result count", value: 0 },
      ],
      scenes: [arrayScene(nums, null, null, null, false)],
      focusSceneId: "sorted-numbers",
    },
  ];

  let step = 0;
  let checkpointAdded = false;

  for (let fixed = 0; fixed < nums.length - 2; fixed += 1) {
    frames.push({
      id: `select-fixed-${fixed}`,
      phase: "Fix one value",
      codeRefs: ["select-fixed", "skip-fixed-duplicate"],
      explanation: `Fix nums[${fixed}] = ${nums[fixed]} and decide whether this value starts a new search.`,
      changed: `Moved i to index ${fixed}.`,
      invariant:
        "All triplets beginning with a smaller fixed value have already been considered.",
      variables: [
        {
          name: "i",
          value: fixed,
          previous: fixed === 0 ? null : fixed - 1,
          changed: true,
        },
        { name: "nums[i]", value: nums[fixed]! },
        { name: "result count", value: results.length },
      ],
      scenes: [arrayScene(nums, fixed, null, null, false)],
      focusSceneId: "sorted-numbers",
    });

    if (fixed > 0 && nums[fixed] === nums[fixed - 1]) {
      frames.push({
        id: `skip-fixed-${fixed}`,
        phase: "Skip duplicate",
        codeRefs: ["skip-fixed-duplicate"],
        explanation: `${nums[fixed]} already served as the fixed value at index ${fixed - 1}, so using it again could only repeat triplets.`,
        changed: `Skipped duplicate fixed index ${fixed}.`,
        invariant:
          "Each distinct value is used as the first value of a triplet at most once.",
        variables: [
          { name: "i", value: fixed },
          { name: "nums[i]", value: nums[fixed]! },
          { name: "previous value", value: nums[fixed - 1]! },
        ],
        scenes: [arrayScene(nums, fixed, null, null, false)],
        focusSceneId: "sorted-numbers",
      });
      continue;
    }

    let left = fixed + 1;
    let right = nums.length - 1;
    frames.push({
      id: `initialize-pointers-${fixed}`,
      phase: "Open pair search",
      codeRefs: ["initialize-pointers"],
      explanation: `Place l immediately after i and r at the end of the array to search for a pair totaling ${-nums[fixed]!}.`,
      changed: `Initialized l = ${left} and r = ${right}.`,
      invariant:
        "For this fixed value, every untested candidate pair lies between l and r, inclusive.",
      variables: [
        { name: "i", value: fixed },
        { name: "l", value: left, changed: true },
        { name: "r", value: right, changed: true },
        {
          name: "pair target",
          value: nums[fixed] === 0 ? 0 : -nums[fixed]!,
        },
      ],
      scenes: [arrayScene(nums, fixed, left, right, false)],
      focusSceneId: "sorted-numbers",
    });

    while (left < right) {
      const sum = nums[fixed]! + nums[left]! + nums[right]!;
      frames.push({
        id: `compare-${step}`,
        phase: "Compare sum",
        codeRefs: ["scan-pair", "compute-sum", "check-zero"],
        explanation: `${nums[fixed]} + ${nums[left]} + ${nums[right]} = ${sum}. Compare that total with zero.`,
        changed: `Computed sum = ${sum} from indices ${fixed}, ${left}, and ${right}.`,
        invariant:
          "Sorted order means moving l right can only raise the candidate sum, while moving r left can only lower it.",
        variables: [
          { name: "i", value: fixed },
          { name: "l", value: left },
          { name: "r", value: right },
          { name: "sum", value: sum, changed: true },
        ],
        scenes: [arrayScene(nums, fixed, left, right, false)],
        focusSceneId: "sorted-numbers",
        ...(!checkpointAdded ? { checkpoint: comparisonCheckpoint(sum) } : {}),
      });
      checkpointAdded = true;

      if (sum === 0) {
        const triplet: Triplet = [nums[fixed]!, nums[left]!, nums[right]!];
        results.push(triplet);
        frames.push({
          id: `record-${step}`,
          phase: "Record triplet",
          codeRefs: ["record-triplet"],
          explanation: `[${triplet.join(", ")}] totals zero, so append it to the result list.`,
          changed: `Added unique triplet [${triplet.join(", ")}].`,
          invariant:
            "The result list remains lexicographically ordered and contains no duplicate triplets.",
          variables: [
            { name: "sum", value: sum },
            {
              name: "result count",
              value: results.length,
              previous: results.length - 1,
              changed: true,
            },
          ],
          scenes: [
            arrayScene(nums, fixed, left, right, true),
            resultScene(results, results.length - 1),
          ],
          focusSceneId: "sorted-numbers",
        });

        const previousLeft = left;
        const previousRight = right;
        while (left < right && nums[left] === nums[left + 1]) left += 1;
        while (left < right && nums[right] === nums[right - 1]) right -= 1;
        left += 1;
        right -= 1;
        frames.push({
          id: `advance-match-${step}`,
          phase: "Skip duplicates",
          codeRefs: [
            "skip-left-duplicates",
            "skip-right-duplicates",
            "move-after-match",
          ],
          explanation:
            "Skip equal neighbors on both sides, then move both pointers inward so this triplet cannot be recorded again.",
          changed: `Moved l from ${previousLeft} to ${left} and r from ${previousRight} to ${right}.`,
          invariant:
            "No future pointer pair for this fixed value can recreate the triplet just recorded.",
          variables: [
            {
              name: "l",
              value: left,
              previous: previousLeft,
              changed: true,
            },
            {
              name: "r",
              value: right,
              previous: previousRight,
              changed: true,
            },
            { name: "result count", value: results.length },
          ],
          scenes: [arrayScene(nums, fixed, left, right, false)],
          focusSceneId: "sorted-numbers",
        });
      } else if (sum < 0) {
        const previousLeft = left;
        left += 1;
        frames.push({
          id: `move-left-${step}`,
          phase: "Raise sum",
          codeRefs: ["move-left"],
          explanation: `${sum} is below zero, so move l right to the next value, which is at least as large.`,
          changed: `Moved l from ${previousLeft} to ${left}.`,
          invariant:
            "Every pair using the old left value with a right index no larger than r is too small or has already been tested.",
          variables: [
            {
              name: "l",
              value: left,
              previous: previousLeft,
              changed: true,
            },
            { name: "r", value: right },
            { name: "sum", value: sum },
          ],
          scenes: [arrayScene(nums, fixed, left, right, false)],
          focusSceneId: "sorted-numbers",
        });
      } else {
        const previousRight = right;
        right -= 1;
        frames.push({
          id: `move-right-${step}`,
          phase: "Lower sum",
          codeRefs: ["move-right"],
          explanation: `${sum} is above zero, so move r left to the previous value, which is no larger.`,
          changed: `Moved r from ${previousRight} to ${right}.`,
          invariant:
            "Every pair using the old right value with a left index no smaller than l is too large or has already been tested.",
          variables: [
            { name: "l", value: left },
            {
              name: "r",
              value: right,
              previous: previousRight,
              changed: true,
            },
            { name: "sum", value: sum },
          ],
          scenes: [arrayScene(nums, fixed, left, right, false)],
          focusSceneId: "sorted-numbers",
        });
      }

      step += 1;
    }
  }

  const output: ThreeSumOutput = results.map(
    (triplet) => [triplet[0], triplet[1], triplet[2]] as const,
  );
  frames.push({
    id: "complete",
    phase: "Complete",
    codeRefs: ["return-results"],
    explanation:
      output.length === 0
        ? "Every fixed value and candidate pair has been exhausted, so return an empty result list."
        : `Every fixed value and candidate pair has been exhausted; return ${output.length} unique zero-sum triplet${output.length === 1 ? "" : "s"}.`,
    changed: `Finalized ${output.length} triplet${output.length === 1 ? "" : "s"}.`,
    invariant:
      "Every returned triplet is sorted, totals zero, appears once, and every possible index triple has been covered or ruled out.",
    variables: [
      { name: "result count", value: output.length, changed: true },
      { name: "result", value: output },
    ],
    scenes: [resultScene(output)],
    focusSceneId: "result-tray",
    complete: true,
    output,
  });

  return {
    input: { nums: original },
    output,
    frames,
  };
}

export const threeSumRuntime = createTraceRuntime<
  ThreeSumInput,
  ThreeSumOutput
>({
  definition: threeSumDefinition,
  schema: threeSumInputSchema,
  parseRaw: parseRawInput,
  trace: traceThreeSum,
  oracle: enumerateTriplets,
});

export default threeSumRuntime;
