import { z } from "zod";

import { productExceptSelfDefinition } from "@/content/visualizations/problems/0238-product-of-array-except-self/definition";
import {
  createTraceRuntime,
  javaInteger,
  parseField,
  parseIntegerArray,
} from "@/lib/visualizer";
import type {
  RawTraceInput,
  TraceFrame,
  TraceItemRole,
  TraceRun,
  TraceSequenceScene,
  TraceVariable,
} from "@/lib/visualizer";

const JAVA_INT_MIN = BigInt(-2_147_483_648);
const JAVA_INT_MAX = BigInt(2_147_483_647);

const productExceptSelfInputSchema = z
  .object({
    nums: z
      .array(javaInteger.min(-10).max(10))
      .min(2, "Enter at least two numbers.")
      .max(20, "Use at most 20 numbers."),
  })
  .superRefine(({ nums }, context) => {
    for (let omitted = 0; omitted < nums.length; omitted += 1) {
      let product = BigInt(1);
      for (let index = 0; index < nums.length; index += 1) {
        if (index !== omitted) product *= BigInt(nums[index]);
      }
      if (product < JAVA_INT_MIN || product > JAVA_INT_MAX) {
        context.addIssue({
          code: "custom",
          path: ["nums"],
          message:
            "Every product except self must fit between Java int limits.",
        });
        return;
      }
    }
  });

type ProductExceptSelfInput = z.infer<typeof productExceptSelfInputSchema>;
type ProductExceptSelfOutput = readonly number[];
type Pass = "setup" | "prefix" | "suffix" | "complete";

function parseRawInput(raw: RawTraceInput): unknown {
  return {
    nums: parseField(raw, "nums", parseIntegerArray),
  };
}

function bruteProducts(input: ProductExceptSelfInput): ProductExceptSelfOutput {
  return input.nums.map((_, omitted) => {
    let product = BigInt(1);
    for (let index = 0; index < input.nums.length; index += 1) {
      if (index !== omitted) product *= BigInt(input.nums[index]);
    }
    return Number(product);
  });
}

function inputRoleForIndex(
  index: number,
  currentIndex: number | null,
  pass: Pass,
): TraceItemRole {
  if (pass === "complete") return "accepted";
  if (index === currentIndex) return "current";
  if (pass === "prefix" && currentIndex !== null && index < currentIndex) {
    return "visited";
  }
  if (pass === "suffix" && currentIndex !== null && index > currentIndex) {
    return "visited";
  }
  return "default";
}

function resultRoleForIndex(
  index: number,
  currentIndex: number | null,
  pass: Pass,
): TraceItemRole {
  if (pass === "complete") return "accepted";
  if (index === currentIndex) return "current";
  if (pass === "prefix" && currentIndex !== null && index < currentIndex) {
    return "visited";
  }
  if (pass === "suffix" && currentIndex !== null && index > currentIndex) {
    return "accepted";
  }
  return "default";
}

function inputScene(
  nums: readonly number[],
  currentIndex: number | null,
  pointerLabel: string | null,
  pass: Pass,
): TraceSequenceScene {
  return {
    id: "input-array",
    kind: "sequence",
    title: "Input values",
    description:
      pass === "prefix"
        ? "The prefix pass reads the value immediately left of i."
        : pass === "suffix"
          ? "The suffix pass folds nums[i] into right after updating res[i]."
          : "The input remains unchanged throughout both passes.",
    items: nums.map((value, index) => ({
      id: `input-${index}`,
      label: `index ${index}`,
      value,
      role: inputRoleForIndex(index, currentIndex, pass),
    })),
    ...(currentIndex === null
      ? {}
      : {
          pointers: [
            {
              id: "input-index",
              label: pointerLabel ?? "read",
              index: currentIndex,
            },
          ],
        }),
  };
}

function resultScene(
  result: readonly number[],
  currentIndex: number | null,
  pointerLabel: string | null,
  pass: Pass,
): TraceSequenceScene {
  return {
    id: "result-array",
    kind: "sequence",
    title: "Result workspace",
    description:
      pass === "setup"
        ? "Java initializes the array to zero, then seeds res[0] with the empty product 1."
        : pass === "prefix"
          ? "Each filled cell contains the product strictly to its left."
          : pass === "suffix"
            ? "Accepted cells now contain their left product times their right product."
            : "Every cell contains the product of all input values except its own.",
    items: result.map((value, index) => ({
      id: `result-${index}`,
      label: `res[${index}]`,
      value,
      role: resultRoleForIndex(index, currentIndex, pass),
      ...(pass === "prefix" && currentIndex !== null && index > currentIndex
        ? { note: "not built yet" }
        : {}),
    })),
    ...(currentIndex === null
      ? {}
      : {
          pointers: [
            {
              id: "result-index",
              label: pointerLabel ?? "write",
              index: currentIndex,
            },
          ],
        }),
  };
}

interface ProductSceneState {
  pass: Pass;
  inputIndex: number | null;
  inputLabel?: string;
  resultIndex: number | null;
  resultLabel?: string;
}

function scenes(
  nums: readonly number[],
  result: readonly number[],
  state: ProductSceneState,
): readonly TraceSequenceScene[] {
  return [
    inputScene(nums, state.inputIndex, state.inputLabel ?? null, state.pass),
    resultScene(
      result,
      state.resultIndex,
      state.resultLabel ?? null,
      state.pass,
    ),
  ];
}

function commonVariables(
  index: number | null,
  resultValue: number | null,
  right: number | null,
): readonly TraceVariable[] {
  return [
    { name: "i", value: index, changed: index !== null },
    { name: "res[i]", value: resultValue },
    { name: "right", value: right },
  ];
}

function traceProductExceptSelf(input: ProductExceptSelfInput): TraceRun {
  const nums = [...input.nums];
  const result = new Array<number>(nums.length).fill(0);
  result[0] = 1;

  const firstPrefix = Math.imul(result[0], nums[0]);
  const frames: TraceFrame[] = [
    {
      id: "initialize",
      phase: "Initialize",
      codeRefs: ["read-length", "create-result", "seed-prefix"],
      explanation:
        "Allocate res and seed its first cell with 1, the product of the empty range to the left of index zero.",
      changed: "Created res and set res[0] from Java's default 0 to 1.",
      invariant:
        "At the start of the prefix pass, res[0] is the product of every value strictly left of index zero.",
      variables: [
        { name: "n", value: nums.length },
        { name: "res[0]", value: 1, previous: 0, changed: true },
      ],
      scenes: scenes(nums, result, {
        pass: "setup",
        inputIndex: null,
        resultIndex: 0,
        resultLabel: "seed res[0]",
      }),
      focusSceneId: "result-array",
      checkpoint: {
        prompt: "What value will the first prefix step write into res[1]?",
        options: [
          { id: "left-product", label: String(firstPrefix) },
          { id: "current-value", label: String(nums[1]) },
          { id: "empty-product", label: "1, regardless of nums[0]" },
        ],
        answerId: "left-product",
        explanation:
          "res[1] equals res[0] × nums[0], so it contains exactly the product to the left of index 1.",
      },
    },
  ];

  for (let index = 1; index < nums.length; index += 1) {
    const previous = result[index];
    result[index] = Math.imul(result[index - 1], nums[index - 1]);
    frames.push({
      id: `prefix-${index}`,
      phase: "Build left products",
      codeRefs: ["build-prefixes"],
      explanation: `res[${index}] becomes res[${index - 1}] × nums[${index - 1}], or ${result[index - 1]} × ${nums[index - 1]} = ${result[index]}.`,
      changed: `Wrote the product left of index ${index} into res[${index}].`,
      invariant: `For every position from 0 through ${index}, res holds the product of values strictly to its left.`,
      variables: [
        { name: "i", value: index, previous: index - 1, changed: true },
        { name: "res[i - 1]", value: result[index - 1] },
        { name: "nums[i - 1]", value: nums[index - 1] },
        {
          name: "res[i]",
          value: result[index],
          previous,
          changed: result[index] !== previous,
        },
      ],
      scenes: scenes(nums, result, {
        pass: "prefix",
        inputIndex: index - 1,
        inputLabel: "read nums[i−1]",
        resultIndex: index,
        resultLabel: "write res[i]",
      }),
      focusSceneId: "result-array",
    });
  }

  let right = 1;
  frames.push({
    id: "initialize-right",
    phase: "Initialize suffix",
    codeRefs: ["seed-suffix"],
    explanation:
      "Set right to 1, the product of the empty range to the right of the last index.",
    changed: "Initialized the rolling right product to 1.",
    invariant:
      "Before the reverse scan begins, res contains every left product and right represents no values yet.",
    variables: commonVariables(null, null, right),
    scenes: scenes(nums, result, {
      pass: "suffix",
      inputIndex: null,
      resultIndex: null,
    }),
    focusSceneId: "result-array",
  });

  for (let index = nums.length - 1; index >= 0; index -= 1) {
    const previousResult = result[index];
    const previousRight = right;
    result[index] = Math.imul(result[index], right);
    right = Math.imul(right, nums[index]);
    frames.push({
      id: `suffix-${index}`,
      phase: "Finalize from right",
      codeRefs: ["scan-from-right", "combine-products", "extend-suffix"],
      explanation: `Use right = ${previousRight} to finalize res[${index}] as ${previousResult} × ${previousRight} = ${result[index]}, then include nums[${index}] (${nums[index]}) for the next step.`,
      changed: `Finalized res[${index}] and advanced right from ${previousRight} to ${right}.`,
      invariant: `Results from index ${index} onward are final, and right now equals the product from index ${index} through the end.`,
      variables: [
        { name: "i", value: index, changed: true },
        { name: "nums[i]", value: nums[index] },
        {
          name: "res[i]",
          value: result[index],
          previous: previousResult,
          changed: result[index] !== previousResult,
        },
        {
          name: "right",
          value: right,
          previous: previousRight,
          changed: right !== previousRight,
        },
      ],
      scenes: scenes(nums, result, {
        pass: "suffix",
        inputIndex: index,
        inputLabel: "read nums[i]",
        resultIndex: index,
        resultLabel: "finalize res[i]",
      }),
      focusSceneId: "result-array",
    });
  }

  const output: ProductExceptSelfOutput = [...result];
  frames.push({
    id: "complete",
    phase: "Complete",
    codeRefs: ["return-result"],
    explanation:
      "Return res now that each stored left product has been multiplied by its matching right product.",
    changed: "The complete result is ready to return.",
    invariant:
      "For every index i, res[i] equals the product of all nums[j] where j is not i.",
    variables: [
      { name: "processed", value: nums.length },
      { name: "right", value: right },
    ],
    scenes: scenes(nums, result, {
      pass: "complete",
      inputIndex: null,
      resultIndex: null,
    }),
    focusSceneId: "result-array",
    complete: true,
    output,
  });

  return {
    input: { nums },
    output,
    frames,
  };
}

export const productExceptSelfRuntime = createTraceRuntime<
  ProductExceptSelfInput,
  ProductExceptSelfOutput
>({
  definition: productExceptSelfDefinition,
  schema: productExceptSelfInputSchema,
  parseRaw: parseRawInput,
  trace: traceProductExceptSelf,
  oracle: bruteProducts,
});

export default productExceptSelfRuntime;
