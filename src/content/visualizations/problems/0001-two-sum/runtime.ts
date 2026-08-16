import { z } from "zod";

import { twoSumDefinition } from "@/content/visualizations/problems/0001-two-sum/definition";
import {
  createTraceRuntime,
  javaInteger,
  parseField,
  parseInteger,
  parseIntegerArray,
} from "@/lib/visualizer";
import type {
  RawTraceInput,
  TraceAssociativeScene,
  TraceFrame,
  TraceRun,
  TraceSequenceScene,
} from "@/lib/visualizer";

const JAVA_INT_MIN = -2_147_483_648;
const JAVA_INT_MAX = 2_147_483_647;

const twoSumInputSchema = z
  .object({
    nums: z
      .array(javaInteger)
      .min(2, "Enter at least two numbers.")
      .max(30, "Use at most 30 numbers."),
    target: javaInteger,
  })
  .superRefine(({ nums, target }, context) => {
    if (
      nums.some(
        (value) =>
          target - value < JAVA_INT_MIN || target - value > JAVA_INT_MAX,
      )
    ) {
      context.addIssue({
        code: "custom",
        path: ["target"],
        message: "The target minus every number must fit in a Java int.",
      });
    }

    let pairCount = 0;
    for (let left = 0; left < nums.length; left += 1) {
      for (let right = left + 1; right < nums.length; right += 1) {
        if (nums[left] + nums[right] === target) pairCount += 1;
      }
    }
    if (pairCount !== 1) {
      context.addIssue({
        code: "custom",
        path: ["nums"],
        message:
          "Enter numbers with exactly one valid index pair for this target.",
      });
    }
  });

type TwoSumInput = z.infer<typeof twoSumInputSchema>;
type TwoSumOutput = readonly [number, number];

function parseRawInput(raw: RawTraceInput): unknown {
  return {
    nums: parseField(raw, "nums", parseIntegerArray),
    target: parseField(raw, "target", parseInteger),
  };
}

function bruteForcePair({ nums, target }: TwoSumInput): TwoSumOutput {
  for (let left = 0; left < nums.length; left += 1) {
    for (let right = left + 1; right < nums.length; right += 1) {
      if (nums[left] + nums[right] === target) return [left, right];
    }
  }
  throw new Error("Validated Two Sum input did not contain a pair.");
}

function numberScene(
  nums: readonly number[],
  currentIndex: number | null,
  complementIndex: number | null,
  accepted: TwoSumOutput | null = null,
  complementValue: number | null = null,
): TraceSequenceScene {
  const acceptedIndices = new Set<number>(accepted ?? []);
  return {
    id: "numbers",
    kind: "sequence",
    title: "Input numbers",
    description: accepted
      ? "The two accepted indices form the requested sum."
      : currentIndex === null || complementValue === null
        ? "Scan left to right; each number asks whether its complement was seen earlier."
        : complementIndex === null
          ? `nums[${currentIndex}] needs ${complementValue}, but that value has not appeared earlier.`
          : `nums[${currentIndex}] needs ${complementValue}, found earlier at index ${complementIndex}.`,
    items: nums.map((value, index) => ({
      id: `number-${index}`,
      label: `index ${index}`,
      value,
      role: acceptedIndices.has(index)
        ? "accepted"
        : index === currentIndex
          ? "current"
          : index === complementIndex
            ? "candidate"
            : "default",
      ...(index === currentIndex && complementValue !== null
        ? { note: `needs ${complementValue}` }
        : index === complementIndex
          ? { note: "complement found here" }
          : {}),
    })),
    pointers:
      currentIndex === null
        ? []
        : [{ id: "current-index", label: "i", index: currentIndex }],
  };
}

function lookupScene(
  seen: ReadonlyMap<number, number>,
  candidateValue: number | null = null,
): TraceAssociativeScene {
  const candidateIndex =
    candidateValue === null ? undefined : seen.get(candidateValue);

  return {
    id: "lookup",
    kind: "associative",
    title: "Seen values",
    description:
      candidateValue === null
        ? "Each stored number points to its earlier input index."
        : candidateIndex === undefined
          ? `Lookup ${candidateValue}: absent. The current number must be remembered instead.`
          : `Lookup ${candidateValue}: found at index ${candidateIndex}. The pair is complete.`,
    entries: Array.from(seen.entries()).map(([value, index]) => ({
      id: `entry-${index}`,
      key: String(value),
      value: index,
      role: value === candidateValue ? "candidate" : "default",
    })),
    emptyLabel: "No numbers have been processed yet.",
  };
}

function traceTwoSum(input: TwoSumInput): TraceRun {
  const nums = [...input.nums];
  const seen = new Map<number, number>();
  const frames: TraceFrame[] = [
    {
      id: "initialize",
      phase: "Initialize",
      codeRefs: ["create-map"],
      explanation:
        "Start with an empty lookup table before scanning the array from left to right.",
      changed: "Created an empty value-to-index table.",
      invariant:
        "Only indices strictly before the current scan position may enter the table.",
      variables: [
        { name: "target", value: input.target },
        { name: "seen size", value: 0 },
      ],
      scenes: [numberScene(nums, null, null), lookupScene(seen)],
      focusSceneId: "numbers",
    },
  ];

  for (let index = 0; index < nums.length; index += 1) {
    const value = nums[index];
    const complement = input.target - value;
    const complementIndex = seen.get(complement) ?? null;

    frames.push({
      id: `inspect-${index}`,
      phase: "Check complement",
      codeRefs: ["scan-index", "compute-complement", "lookup-complement"],
      explanation:
        complementIndex === null
          ? `At index ${index}, ${value} needs ${complement}; that complement is not stored yet.`
          : `At index ${index}, ${value} needs ${complement}; the table already maps it to index ${complementIndex}.`,
      changed: `Moved i to ${index} and computed complement = ${complement}.`,
      invariant:
        "Every lookup entry points to an index smaller than i, so a match always uses two distinct indices.",
      variables: [
        {
          name: "i",
          value: index,
          previous: index === 0 ? null : index - 1,
          changed: true,
        },
        { name: "nums[i]", value },
        { name: "complement", value: complement, changed: true },
        { name: "seen size", value: seen.size },
      ],
      scenes: [
        numberScene(nums, index, complementIndex, null, complement),
        lookupScene(seen, complement),
      ],
      focusSceneId: "numbers",
      ...(complementIndex === null
        ? {}
        : {
            checkpoint: {
              prompt:
                "The complement is already in the table. What happens next?",
              options: [
                { id: "return", label: "Return the two indices" },
                { id: "store", label: "Store this value and continue" },
                { id: "restart", label: "Restart from index zero" },
              ],
              answerId: "return",
              explanation:
                "The earlier index came from the lookup table, and the current index supplies the second value, so the pair is complete.",
            },
          }),
    });

    if (complementIndex !== null) {
      const output: TwoSumOutput = [complementIndex, index];
      frames.push({
        id: `complete-${index}`,
        phase: "Complete",
        codeRefs: ["return-pair"],
        explanation: `Return [${complementIndex}, ${index}] because nums[${complementIndex}] + nums[${index}] equals ${input.target}.`,
        changed: `Accepted indices ${complementIndex} and ${index}.`,
        invariant:
          "The returned indices are ascending, distinct, and their values sum to the target.",
        variables: [
          { name: "left index", value: complementIndex, changed: true },
          { name: "right index", value: index, changed: true },
          { name: "pair sum", value: nums[complementIndex] + nums[index] },
        ],
        scenes: [
          numberScene(nums, index, complementIndex, output, complement),
          lookupScene(seen, complement),
        ],
        focusSceneId: "numbers",
        complete: true,
        output,
      });
      return {
        input: { nums, target: input.target },
        output,
        frames,
      };
    }

    const priorSize = seen.size;
    seen.set(value, index);
    frames.push({
      id: `remember-${index}`,
      phase: "Remember value",
      codeRefs: ["remember-value"],
      explanation: `Store ${value} → ${index} so a later number can find this index in constant time.`,
      changed: `The lookup table now maps ${value} to index ${index}.`,
      invariant:
        "Each stored key maps to its most recent processed index, and every stored index is at most i.",
      variables: [
        { name: "i", value: index },
        { name: "stored value", value },
        {
          name: "seen size",
          value: seen.size,
          previous: priorSize,
          changed: seen.size !== priorSize,
        },
      ],
      scenes: [
        numberScene(nums, index, null, null, complement),
        lookupScene(seen),
      ],
      focusSceneId: "numbers",
    });
  }

  throw new Error("Validated Two Sum input did not produce a trace result.");
}

export const twoSumRuntime = createTraceRuntime<TwoSumInput, TwoSumOutput>({
  definition: twoSumDefinition,
  schema: twoSumInputSchema,
  parseRaw: parseRawInput,
  trace: traceTwoSum,
  oracle: bruteForcePair,
});

export default twoSumRuntime;
