import { z } from "zod";

import { definition } from "@/content/visualizations/problems/0242-valid-anagram/definition";
import { createTraceRuntime } from "@/lib/visualizer/runtime";
import type {
  TraceBarRangeScene,
  TraceFrame,
  TraceItemRole,
  TraceSequenceScene,
} from "@/lib/visualizer/types";

const lowercaseString = z
  .string()
  .max(80, "Use at most 80 characters.")
  .regex(/^[a-z]*$/, "Use lowercase English letters only.");

const inputSchema = z.object({
  s: lowercaseString,
  t: lowercaseString,
});

type ValidAnagramInput = z.infer<typeof inputSchema>;

const alphabet = Array.from({ length: 26 }, (_, index) =>
  String.fromCharCode("a".charCodeAt(0) + index),
);

interface SceneState {
  sourceProcessed: number;
  candidateProcessed: number;
  activeSourceIndex?: number;
  activeCandidateIndex?: number;
  activeBucket?: number;
  checkedBuckets?: number;
  rejectedBucket?: number;
}

function sequenceScene(
  id: "source" | "candidate",
  value: string,
  processed: number,
  activeIndex: number | undefined,
): TraceSequenceScene {
  return {
    id,
    kind: "sequence",
    title: id === "source" ? "Source s" : "Candidate t",
    description:
      processed === 0
        ? "No characters from this string have changed the counters yet."
        : `${processed} of ${value.length} characters have changed the counters.`,
    items: Array.from(value, (character, index) => {
      let role: TraceItemRole = "default";
      if (index < processed) role = "visited";
      if (index === activeIndex) role = "current";
      return {
        id: `${id}-${index}`,
        label: `${id === "source" ? "s" : "t"}[${index}]`,
        value: character,
        role,
      };
    }),
    ...(activeIndex === undefined
      ? {}
      : {
          pointers: [
            {
              id: `${id}-cursor`,
              label: id === "source" ? "count" : "subtract",
              index: activeIndex,
            },
          ],
        }),
  };
}

function frequencyScene(
  frequencies: readonly number[],
  state: SceneState,
): TraceBarRangeScene {
  return {
    id: "frequency-balances",
    kind: "bar-range",
    presentation: "signed",
    title: "Letter balances",
    description:
      "Each bar is count in s minus count in t; every bar must finish at zero.",
    bars: frequencies.map((value, index) => {
      let role: TraceItemRole = "default";
      if (index < (state.checkedBuckets ?? 0)) role = "accepted";
      if (index === state.activeBucket) role = "candidate";
      if (index === state.rejectedBucket) role = "rejected";
      return {
        id: `letter-${alphabet[index]}`,
        label: alphabet[index] ?? "?",
        value,
        role,
      };
    }),
    range: { start: 0, end: 25, label: "a through z" },
    ...(state.activeBucket === undefined
      ? {}
      : {
          markers: [
            {
              id: "active-letter",
              label: `letter ${alphabet[state.activeBucket]}`,
              index: state.activeBucket,
            },
          ],
        }),
  };
}

function scenes(
  input: ValidAnagramInput,
  frequencies: readonly number[],
  state: SceneState,
) {
  return [
    sequenceScene(
      "source",
      input.s,
      state.sourceProcessed,
      state.activeSourceIndex,
    ),
    sequenceScene(
      "candidate",
      input.t,
      state.candidateProcessed,
      state.activeCandidateIndex,
    ),
    frequencyScene(frequencies, state),
  ] as const;
}

function trace(input: ValidAnagramInput) {
  const frames: TraceFrame[] = [];
  const frequencies = Array<number>(26).fill(0);
  let frameNumber = 0;

  const addFrame = (frame: Omit<TraceFrame, "id">) => {
    frames.push({
      ...frame,
      id: `frame-${String(frameNumber).padStart(3, "0")}`,
    });
    frameNumber += 1;
  };

  const sameLength = input.s.length === input.t.length;
  addFrame({
    phase: "Guard",
    codeRefs: ["check-length"],
    explanation: sameLength
      ? "The strings have the same length, so frequency balancing can continue."
      : "Different lengths cannot contain exactly the same characters.",
    changed: "Compared the two string lengths.",
    invariant: "Anagrams must have equal lengths.",
    variables: [
      { name: "s.length", value: input.s.length },
      { name: "t.length", value: input.t.length },
    ],
    scenes: scenes(input, frequencies, {
      sourceProcessed: 0,
      candidateProcessed: 0,
    }),
    focusSceneId: "frequency-balances",
    ...(!sameLength
      ? {
          checkpoint: {
            prompt: "What will the length guard do?",
            options: [
              { id: "continue", label: "Continue to the counters" },
              { id: "return-false", label: "Return false immediately" },
            ],
            answerId: "return-false",
            explanation:
              "A different length proves the character multisets cannot match.",
          },
        }
      : {}),
  });

  if (!sameLength) {
    addFrame({
      phase: "Complete",
      codeRefs: ["check-length"],
      explanation: "The length guard returns false before allocating counters.",
      changed: "Set the result to false.",
      invariant: "A rejected length pair never enters the counting loops.",
      variables: [{ name: "result", value: false, changed: true }],
      scenes: scenes(input, frequencies, {
        sourceProcessed: 0,
        candidateProcessed: 0,
      }),
      focusSceneId: "frequency-balances",
      complete: true,
      output: false,
    });
    return {
      input: { s: input.s, t: input.t },
      output: false,
      frames,
    };
  }

  addFrame({
    phase: "Initialize",
    codeRefs: ["create-frequency-table"],
    explanation: "Create one zeroed counter for each lowercase English letter.",
    changed: "Initialized 26 balances to zero.",
    invariant: "Before counting, every letter has a net balance of zero.",
    variables: [{ name: "buckets", value: 26 }],
    scenes: scenes(input, frequencies, {
      sourceProcessed: 0,
      candidateProcessed: 0,
    }),
    focusSceneId: "frequency-balances",
  });

  for (let index = 0; index < input.s.length; index += 1) {
    const character = input.s[index] ?? "";
    const bucket = character.charCodeAt(0) - 97;
    const previous = frequencies[bucket] ?? 0;
    frequencies[bucket] = previous + 1;
    addFrame({
      phase: "Count s",
      codeRefs: ["count-source"],
      explanation: `s[${index}] is '${character}', so its balance increases by one.`,
      changed: `${character}: ${previous} → ${frequencies[bucket]}`,
      invariant: `The counters equal the frequencies in s[0..${index}].`,
      variables: [
        { name: "index", value: index, previous: index - 1, changed: true },
        { name: "c", value: character, changed: true },
        {
          name: `freq['${character}']`,
          value: frequencies[bucket] ?? 0,
          previous,
          changed: true,
        },
      ],
      scenes: scenes(input, frequencies, {
        sourceProcessed: index + 1,
        candidateProcessed: 0,
        activeSourceIndex: index,
        activeBucket: bucket,
      }),
      focusSceneId: "frequency-balances",
    });
  }

  for (let index = 0; index < input.t.length; index += 1) {
    const character = input.t[index] ?? "";
    const bucket = character.charCodeAt(0) - 97;
    const previous = frequencies[bucket] ?? 0;
    frequencies[bucket] = previous - 1;
    addFrame({
      phase: "Subtract t",
      codeRefs: ["subtract-candidate"],
      explanation: `t[${index}] is '${character}', so its balance decreases by one.`,
      changed: `${character}: ${previous} → ${frequencies[bucket]}`,
      invariant: `Each balance is count(s) minus count(t[0..${index}]).`,
      variables: [
        { name: "index", value: index, previous: index - 1, changed: true },
        { name: "c", value: character, changed: true },
        {
          name: `freq['${character}']`,
          value: frequencies[bucket] ?? 0,
          previous,
          changed: true,
        },
      ],
      scenes: scenes(input, frequencies, {
        sourceProcessed: input.s.length,
        candidateProcessed: index + 1,
        activeCandidateIndex: index,
        activeBucket: bucket,
      }),
      focusSceneId: "frequency-balances",
    });
  }

  const mismatchBucket = frequencies.findIndex((value) => value !== 0);
  addFrame({
    phase: "Predict",
    codeRefs: ["inspect-balances"],
    explanation:
      "Counting is complete. The final loop now asks whether every letter returned to zero.",
    changed: "Moved from updating counters to verifying them.",
    invariant:
      "The strings are anagrams exactly when all 26 balances are zero.",
    variables: [
      {
        name: "nonzero buckets",
        value: frequencies.filter((value) => value !== 0).length,
      },
    ],
    scenes: scenes(input, frequencies, {
      sourceProcessed: input.s.length,
      candidateProcessed: input.t.length,
    }),
    focusSceneId: "frequency-balances",
    checkpoint: {
      prompt: "What will the balance scan return?",
      options: [
        { id: "true", label: "true — every balance is zero" },
        { id: "false", label: "false — a nonzero balance remains" },
      ],
      answerId: mismatchBucket === -1 ? "true" : "false",
      explanation:
        mismatchBucket === -1
          ? "Every increment was canceled by a matching decrement."
          : `The '${alphabet[mismatchBucket]}' bucket is ${frequencies[mismatchBucket]}, not zero.`,
    },
  });

  if (mismatchBucket !== -1) {
    addFrame({
      phase: "Verify",
      codeRefs: ["inspect-balances"],
      explanation: `The '${alphabet[mismatchBucket]}' balance is nonzero, so the scan returns false.`,
      changed: `Found the first mismatch at '${alphabet[mismatchBucket]}'.`,
      invariant: "One nonzero balance is enough to disprove an anagram.",
      variables: [
        { name: "letter", value: alphabet[mismatchBucket] ?? "" },
        { name: "f", value: frequencies[mismatchBucket] ?? 0 },
      ],
      scenes: scenes(input, frequencies, {
        sourceProcessed: input.s.length,
        candidateProcessed: input.t.length,
        activeBucket: mismatchBucket,
        checkedBuckets: mismatchBucket,
        rejectedBucket: mismatchBucket,
      }),
      focusSceneId: "frequency-balances",
    });
    addFrame({
      phase: "Complete",
      codeRefs: ["inspect-balances"],
      explanation:
        "A remaining letter imbalance proves the strings are not anagrams.",
      changed: "Set the result to false.",
      invariant: "The first nonzero bucket terminates the Java scan.",
      variables: [{ name: "result", value: false, changed: true }],
      scenes: scenes(input, frequencies, {
        sourceProcessed: input.s.length,
        candidateProcessed: input.t.length,
        checkedBuckets: mismatchBucket,
        rejectedBucket: mismatchBucket,
      }),
      focusSceneId: "frequency-balances",
      complete: true,
      output: false,
    });
  } else {
    addFrame({
      phase: "Verify",
      codeRefs: ["inspect-balances"],
      explanation:
        "The scan checks all 26 buckets and finds zero in every one; there is no mismatch to stop on.",
      changed: "Verified all letter balances in one completed scan.",
      invariant: "Every bucket from 'a' through 'z' has balance zero.",
      variables: [
        { name: "buckets checked", value: 26, changed: true },
        { name: "nonzero buckets", value: 0 },
      ],
      scenes: scenes(input, frequencies, {
        sourceProcessed: input.s.length,
        candidateProcessed: input.t.length,
        checkedBuckets: 26,
      }),
      focusSceneId: "frequency-balances",
    });
    addFrame({
      phase: "Complete",
      codeRefs: ["confirm-anagram"],
      explanation:
        "Every balance is zero, so the strings contain identical character counts.",
      changed: "Set the result to true.",
      invariant:
        "Equal lengths and equal character frequencies are sufficient for anagrams.",
      variables: [{ name: "result", value: true, changed: true }],
      scenes: scenes(input, frequencies, {
        sourceProcessed: input.s.length,
        candidateProcessed: input.t.length,
        checkedBuckets: 26,
      }),
      focusSceneId: "frequency-balances",
      complete: true,
      output: true,
    });
  }

  const output = mismatchBucket === -1;
  return {
    input: { s: input.s, t: input.t },
    output,
    frames,
  };
}

function sortedCharacterOracle(input: ValidAnagramInput): boolean {
  if (input.s.length !== input.t.length) return false;
  const sortedS = Array.from(input.s).sort().join("");
  const sortedT = Array.from(input.t).sort().join("");
  return sortedS === sortedT;
}

export const runtime = createTraceRuntime({
  definition,
  schema: inputSchema,
  parseRaw: (raw) => ({ s: raw.s ?? "", t: raw.t ?? "" }),
  trace,
  oracle: sortedCharacterOracle,
});
