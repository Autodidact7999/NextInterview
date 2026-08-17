import { z } from "zod";

import { topKFrequentElementsDefinition } from "@/content/visualizations/problems/0347-top-k-frequent-elements/definition";
import {
  createTraceRuntime,
  javaInteger,
  parseField,
  parseInteger,
  parseIntegerArray,
} from "@/lib/visualizer";
import type {
  JsonValue,
  RawTraceInput,
  TraceAssociativeScene,
  TraceFrame,
  TraceRun,
  TraceSequenceScene,
  TraceTreeScene,
} from "@/lib/visualizer";

const topKFrequentElementsInputSchema = z
  .object({
    nums: z
      .array(javaInteger)
      .min(1, "Enter at least one number.")
      .max(30, "Use at most 30 numbers."),
    k: javaInteger.min(1, "Choose at least one result."),
  })
  .superRefine(({ nums, k }, context) => {
    if (nums.length === 0) return;

    const counts = new Map<number, number>();
    for (const value of nums) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }

    if (k > counts.size) {
      context.addIssue({
        code: "custom",
        path: ["k"],
        message: `Choose k at most ${counts.size}, the number of unique values.`,
      });
      return;
    }

    const frequencies = Array.from(counts.values()).sort(
      (left, right) => right - left,
    );
    if (k < frequencies.length && frequencies[k - 1] === frequencies[k]) {
      context.addIssue({
        code: "custom",
        path: ["k"],
        message:
          "Choose a k with a strict frequency cutoff so the result set is unambiguous.",
      });
    }
  });

type TopKFrequentElementsInput = z.infer<
  typeof topKFrequentElementsInputSchema
>;
type TopKFrequentElementsOutput = readonly number[];

interface HeapEntry {
  value: number;
  frequency: number;
}

function parseRawInput(raw: RawTraceInput): unknown {
  return {
    nums: parseField(raw, "nums", parseIntegerArray),
    k: parseField(raw, "k", parseInteger),
  };
}

function compareHeapEntries(left: HeapEntry, right: HeapEntry): number {
  if (left.frequency !== right.frequency) {
    return left.frequency - right.frequency;
  }
  return left.value < right.value ? -1 : left.value > right.value ? 1 : 0;
}

function offer(heap: HeapEntry[], entry: HeapEntry): void {
  heap.push(entry);
  let child = heap.length - 1;

  while (child > 0) {
    const parent = Math.floor((child - 1) / 2);
    const childEntry = heap[child];
    const parentEntry = heap[parent];
    if (
      childEntry === undefined ||
      parentEntry === undefined ||
      compareHeapEntries(parentEntry, childEntry) <= 0
    ) {
      break;
    }
    heap[parent] = childEntry;
    heap[child] = parentEntry;
    child = parent;
  }
}

function poll(heap: HeapEntry[]): HeapEntry | undefined {
  const minimum = heap[0];
  const last = heap.pop();
  if (heap.length === 0 || last === undefined) return minimum;

  heap[0] = last;
  let parent = 0;
  while (true) {
    const left = parent * 2 + 1;
    const right = left + 1;
    let smallest = parent;

    if (
      heap[left] !== undefined &&
      compareHeapEntries(heap[left], heap[smallest] as HeapEntry) < 0
    ) {
      smallest = left;
    }
    if (
      heap[right] !== undefined &&
      compareHeapEntries(heap[right], heap[smallest] as HeapEntry) < 0
    ) {
      smallest = right;
    }
    if (smallest === parent) break;

    const parentEntry = heap[parent] as HeapEntry;
    heap[parent] = heap[smallest] as HeapEntry;
    heap[smallest] = parentEntry;
    parent = smallest;
  }
  return minimum;
}

function stableValueId(value: number): string {
  return value < 0 ? `negative-${Math.abs(value)}` : `value-${value}`;
}

function inputScene(
  nums: readonly number[],
  processedCount: number,
  currentIndex: number | null,
): TraceSequenceScene {
  return {
    id: "input",
    kind: "sequence",
    title: "Input values",
    description:
      currentIndex === null
        ? `${processedCount} of ${nums.length} occurrences have been counted.`
        : `nums[${currentIndex}] is updating its frequency bucket.`,
    items: nums.map((value, index) => ({
      id: `input-${index}`,
      label: `nums[${index}]`,
      value,
      role:
        index === currentIndex
          ? "current"
          : index < processedCount
            ? "visited"
            : "default",
    })),
    pointers:
      currentIndex === null
        ? []
        : [{ id: "count-cursor", label: "n", index: currentIndex }],
  };
}

function frequencyScene(
  frequencies: ReadonlyMap<number, number>,
  activeValue: number | null,
  selectedValues: ReadonlySet<number> = new Set<number>(),
  rejectedValue: number | null = null,
): TraceAssociativeScene {
  return {
    id: "frequencies",
    kind: "associative",
    title: "Frequency table",
    description:
      "Each unique integer maps to the number of occurrences counted in the input.",
    entries: Array.from(frequencies.entries())
      .sort(([left], [right]) => left - right)
      .map(([value, frequency]) => ({
        id: `frequency-${stableValueId(value)}`,
        key: String(value),
        value: frequency,
        role:
          value === rejectedValue
            ? "rejected"
            : value === activeValue
              ? "candidate"
              : selectedValues.has(value)
                ? "accepted"
                : "default",
      })),
    emptyLabel: "No values have been counted yet.",
  };
}

function heapScene(
  heap: readonly HeapEntry[],
  activeValue: number | null,
): TraceTreeScene {
  return {
    id: "min-heap",
    kind: "tree",
    title: "Size-k min-heap",
    description:
      heap.length === 0
        ? "The heap is empty."
        : "Every parent has no greater priority than its children, so the weakest retained frequency stays at the root.",
    rootId:
      heap[0] === undefined ? null : `heap-${stableValueId(heap[0].value)}`,
    nodes: heap.map((entry, index) => {
      const parentIndex = Math.floor((index - 1) / 2);
      const parentEntry = index === 0 ? undefined : heap[parentIndex];
      return {
        id: `heap-${stableValueId(entry.value)}`,
        value: entry.value,
        parentId:
          parentEntry === undefined
            ? null
            : `heap-${stableValueId(parentEntry.value)}`,
        ...(index === 0
          ? {}
          : { edgeLabel: index % 2 === 1 ? "left" : "right" }),
        badge: `${entry.value} × ${entry.frequency}`,
        note:
          index === 0
            ? "weakest retained · next to evict"
            : `heap position ${index}`,
        role: entry.value === activeValue ? "current" : "accepted",
      };
    }),
  };
}

function selectedValues(heap: readonly HeapEntry[]): ReadonlySet<number> {
  return new Set(heap.map((entry) => entry.value));
}

function fullSortOracle({
  nums,
  k,
}: TopKFrequentElementsInput): TopKFrequentElementsOutput {
  const frequencies = new Map<number, number>();
  for (const value of nums) {
    frequencies.set(value, (frequencies.get(value) ?? 0) + 1);
  }
  return Array.from(frequencies.entries())
    .sort(
      ([leftValue, leftFrequency], [rightValue, rightFrequency]) =>
        rightFrequency - leftFrequency || leftValue - rightValue,
    )
    .slice(0, k)
    .map(([value]) => value);
}

function equalAsNumberSet(
  actual: JsonValue,
  expected: TopKFrequentElementsOutput,
): boolean {
  if (
    !Array.isArray(actual) ||
    actual.length !== expected.length ||
    !actual.every((value) => typeof value === "number")
  ) {
    return false;
  }
  const sortedActual = [...actual].sort((left, right) => left - right);
  const sortedExpected = [...expected].sort((left, right) => left - right);
  return sortedActual.every((value, index) => value === sortedExpected[index]);
}

function traceTopKFrequentElements(input: TopKFrequentElementsInput): TraceRun {
  const nums = [...input.nums];
  const frequencies = new Map<number, number>();
  const heap: HeapEntry[] = [];
  const frames: TraceFrame[] = [];

  frames.push({
    id: "initialize-frequencies",
    phase: "Initialize",
    codeRefs: ["create-frequency-map"],
    explanation:
      "Start with an empty frequency map before reading the input from left to right.",
    changed: "Created the empty value-to-count table.",
    invariant:
      "The map contains exact occurrence counts for the processed input prefix.",
    variables: [
      { name: "processed", value: 0 },
      { name: "unique values", value: 0 },
      { name: "k", value: input.k },
    ],
    scenes: [inputScene(nums, 0, null), frequencyScene(frequencies, null)],
    focusSceneId: "frequencies",
  });

  for (let index = 0; index < nums.length; index += 1) {
    const value = nums[index] as number;
    const previousFrequency = frequencies.get(value) ?? 0;
    const nextFrequency = previousFrequency + 1;
    frequencies.set(value, nextFrequency);

    frames.push({
      id: `count-${index}`,
      phase: "Count frequencies",
      codeRefs: ["count-frequencies"],
      explanation: `Read nums[${index}] = ${value} and raise its count from ${previousFrequency} to ${nextFrequency}.`,
      changed: `Frequency ${value} → ${nextFrequency}.`,
      invariant:
        "Every map count equals the number of occurrences in nums[0..index].",
      variables: [
        {
          name: "input index",
          value: index,
          previous: index === 0 ? null : index - 1,
          changed: true,
        },
        { name: "n", value, changed: true },
        {
          name: "freq[n]",
          value: nextFrequency,
          previous: previousFrequency,
          changed: true,
        },
        { name: "unique values", value: frequencies.size },
      ],
      scenes: [
        inputScene(nums, index + 1, index),
        frequencyScene(frequencies, value),
      ],
      focusSceneId: "frequencies",
    });
  }

  frames.push({
    id: "initialize-heap",
    phase: "Build heap",
    codeRefs: ["create-min-heap"],
    explanation:
      "Create a min-heap ordered by frequency. Its root will always be the easiest retained candidate to evict.",
    changed: "Created an empty min-heap.",
    invariant:
      "The heap is ordered by ascending frequency and will never remain larger than k after an iteration finishes.",
    variables: [
      { name: "heap size", value: 0 },
      { name: "capacity k", value: input.k },
      { name: "unique values", value: frequencies.size },
    ],
    scenes: [frequencyScene(frequencies, null), heapScene(heap, null)],
    focusSceneId: "min-heap",
  });

  // Java's HashMap iteration and equal-priority queue entries are unordered.
  // Ascending values provide reproducible teaching frames; the validated strict
  // frequency cutoff ensures that this tie-break never changes the result set.
  const candidates = Array.from(frequencies.entries())
    .sort(([left], [right]) => left - right)
    .map(([value, frequency]) => ({ value, frequency }));
  const checkpointIndex = Math.min(input.k, candidates.length - 1);

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index] as HeapEntry;
    const previousSize = heap.length;
    offer(heap, candidate);
    const willEvict = heap.length > input.k;

    frames.push({
      id: `offer-${index}`,
      phase: "Consider candidate",
      codeRefs: ["scan-unique-values", "offer-candidate"],
      explanation: `Offer ${candidate.value}, whose frequency is ${candidate.frequency}, to the min-heap.`,
      changed: `Heap size changed from ${previousSize} to ${heap.length}.`,
      invariant: willEvict
        ? "Immediately after an offer, the heap may exceed k by one; its root is the weakest candidate and will be removed next."
        : "The heap contains every candidate seen so far and remains no larger than k.",
      variables: [
        {
          name: "candidate index",
          value: index,
          previous: index === 0 ? null : index - 1,
          changed: true,
        },
        { name: "n", value: candidate.value, changed: true },
        { name: "freq[n]", value: candidate.frequency },
        {
          name: "heap size",
          value: heap.length,
          previous: previousSize,
          changed: true,
        },
      ],
      scenes: [
        frequencyScene(frequencies, candidate.value, selectedValues(heap)),
        heapScene(heap, candidate.value),
      ],
      focusSceneId: "min-heap",
      ...(index === checkpointIndex
        ? {
            checkpoint: {
              prompt: `The heap now holds ${heap.length} candidate${heap.length === 1 ? "" : "s"} with k = ${input.k}. What does the size guard do?`,
              options: [
                { id: "poll", label: "Poll the heap root" },
                { id: "keep", label: "Keep every candidate" },
              ],
              answerId: willEvict ? "poll" : "keep",
              explanation: willEvict
                ? "The offer made the heap larger than k, so polling removes its minimum-frequency root."
                : "The heap is still within its size-k limit, so no value is removed.",
            },
          }
        : {}),
    });

    if (willEvict) {
      const removed = poll(heap);
      if (removed === undefined) {
        throw new Error("A non-empty heap did not produce an eviction.");
      }

      frames.push({
        id: `evict-${index}`,
        phase: "Keep top k",
        codeRefs: ["trim-minimum"],
        explanation: `The heap exceeded k, so poll value ${removed.value} with frequency ${removed.frequency}.`,
        changed: `Removed ${removed.value}; heap size returned to ${heap.length}.`,
        invariant:
          "After every completed iteration, the heap contains the k strongest candidates seen so far, or all candidates when fewer than k exist.",
        variables: [
          { name: "evicted value", value: removed.value, changed: true },
          { name: "evicted frequency", value: removed.frequency },
          {
            name: "heap size",
            value: heap.length,
            previous: heap.length + 1,
            changed: true,
          },
          { name: "capacity k", value: input.k },
        ],
        scenes: [
          frequencyScene(
            frequencies,
            null,
            selectedValues(heap),
            removed.value,
          ),
          heapScene(heap, null),
        ],
        focusSceneId: "min-heap",
      });
    }
  }

  const output: TopKFrequentElementsOutput = heap.map((entry) => entry.value);
  frames.push({
    id: "complete",
    phase: "Complete",
    codeRefs: ["return-heap"],
    explanation:
      "Return the values left in the bounded heap. Their traversal order is not significant; membership is the answer.",
    changed: `Accepted ${output.length} top-frequency value${output.length === 1 ? "" : "s"}.`,
    invariant:
      "Every retained value has a frequency strictly greater than every excluded value.",
    variables: [
      { name: "result size", value: output.length, changed: true },
      { name: "k", value: input.k },
      { name: "result", value: output },
    ],
    scenes: [
      frequencyScene(frequencies, null, selectedValues(heap)),
      heapScene(heap, null),
    ],
    focusSceneId: "min-heap",
    complete: true,
    output,
  });

  return {
    input: { nums, k: input.k },
    output,
    frames,
  };
}

export const topKFrequentElementsRuntime = createTraceRuntime<
  TopKFrequentElementsInput,
  TopKFrequentElementsOutput
>({
  definition: topKFrequentElementsDefinition,
  schema: topKFrequentElementsInputSchema,
  parseRaw: parseRawInput,
  trace: traceTopKFrequentElements,
  oracle: fullSortOracle,
  equals: equalAsNumberSet,
});

export default topKFrequentElementsRuntime;
