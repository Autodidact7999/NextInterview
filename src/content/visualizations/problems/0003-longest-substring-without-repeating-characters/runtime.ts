import { z } from "zod";

import { longestSubstringWithoutRepeatingCharactersDefinition } from "@/content/visualizations/problems/0003-longest-substring-without-repeating-characters/definition";
import { createTraceRuntime } from "@/lib/visualizer";
import type {
  RawTraceInput,
  TraceAssociativeScene,
  TraceCheckpoint,
  TraceFrame,
  TraceItemRole,
  TraceRun,
  TraceSequenceScene,
} from "@/lib/visualizer";

const longestSubstringInputSchema = z.object({
  s: z
    .string()
    .max(80, "Use at most 80 characters.")
    .refine(
      (value) =>
        Array.from(value).every((character) => {
          const code = character.charCodeAt(0);
          return code >= 32 && code <= 126;
        }),
      "Use printable ASCII characters only.",
    ),
});

type LongestSubstringInput = z.infer<typeof longestSubstringInputSchema>;

function parseRawInput(raw: RawTraceInput): unknown {
  return { s: raw.s ?? "" };
}

function substringHasUniqueCharacters(
  value: string,
  start: number,
  end: number,
): boolean {
  for (let first = start; first <= end; first += 1) {
    for (let second = first + 1; second <= end; second += 1) {
      if (value[first] === value[second]) return false;
    }
  }
  return true;
}

function enumerateSubstringOracle({ s }: LongestSubstringInput): number {
  let longest = 0;
  for (let start = 0; start < s.length; start += 1) {
    for (let end = start; end < s.length; end += 1) {
      if (substringHasUniqueCharacters(s, start, end)) {
        longest = Math.max(longest, end - start + 1);
      }
    }
  }
  return longest;
}

interface WindowSceneState {
  left: number;
  right: number | null;
  duplicateIndex?: number;
  bestStart?: number;
  bestLength?: number;
  complete?: boolean;
}

function characterScene(
  value: string,
  state: WindowSceneState,
): TraceSequenceScene {
  const {
    left,
    right,
    duplicateIndex,
    bestStart = 0,
    bestLength = 0,
    complete,
  } = state;
  const bestEnd = bestStart + bestLength - 1;
  const candidateContainsDuplicate =
    duplicateIndex !== undefined &&
    right !== null &&
    duplicateIndex >= left &&
    duplicateIndex <= right;

  return {
    id: "characters",
    kind: "sequence",
    title: complete ? "Longest unique substring" : "Sliding window",
    description:
      value.length === 0
        ? "The input is empty, so there is no window to inspect."
        : complete
          ? "Accepted cells show one longest substring found by the scan."
          : right === null
            ? "The right edge has not started scanning yet."
            : `The active candidate window spans indices ${left} through ${right}.`,
    items: Array.from(value).map((character, index) => {
      let role: TraceItemRole = "default";
      if (complete && index >= bestStart && index <= bestEnd) {
        role = "accepted";
      } else if (index === right) {
        role = "current";
      } else if (index === duplicateIndex) {
        role = "rejected";
      } else if (right !== null && index >= left && index < right) {
        role = "candidate";
      } else if (right !== null && index < left) {
        role = "dimmed";
      }
      return {
        id: `character-${index}`,
        label: `index ${index}`,
        value: character,
        role,
        ...(index === duplicateIndex ? { note: "previous occurrence" } : {}),
      };
    }),
    pointers:
      value.length === 0 || right === null
        ? []
        : [
            { id: "left-edge", label: "l", index: left },
            { id: "right-edge", label: "r", index: right },
          ],
    ranges: [
      ...(right === null
        ? []
        : [
            {
              id: "active-window",
              label: candidateContainsDuplicate
                ? "candidate contains a repeat"
                : `active · ${right - left + 1}`,
              start: left,
              end: right,
              role: candidateContainsDuplicate
                ? ("rejected" as const)
                : ("candidate" as const),
            },
          ]),
      ...(bestLength === 0
        ? []
        : [
            {
              id: "best-window",
              label: `best · ${bestLength}`,
              start: bestStart,
              end: bestEnd,
              role: "accepted" as const,
            },
          ]),
    ],
  };
}

function characterLabel(character: string): string {
  if (character === " ") return "space";
  return character;
}

function lastSeenScene(
  last: readonly number[],
  activeCode: number | null,
  activeRole: TraceItemRole = "current",
): TraceAssociativeScene {
  const entries = last.flatMap((index, code) =>
    index < 0
      ? []
      : [
          {
            id: `ascii-${code}`,
            key: characterLabel(String.fromCharCode(code)),
            value: index,
            role: code === activeCode ? activeRole : ("default" as const),
          },
        ],
  );

  return {
    id: "last-seen",
    kind: "associative",
    title: "Last-seen positions",
    description:
      "Each visible character maps to the latest index recorded for it; unseen ASCII entries remain −1.",
    entries,
    emptyLabel: "Every printable character is unseen (−1).",
  };
}

function findCheckpointIndex(value: string): number {
  if (value.length === 0) return -1;
  const last = Array<number>(128).fill(-1);
  let left = 0;
  for (let right = 0; right < value.length; right += 1) {
    const code = value.charCodeAt(right);
    if (last[code] >= left) return right;
    left = Math.max(left, last[code] + 1);
    last[code] = right;
  }
  return 0;
}

function windowCheckpoint(
  duplicateIndex: number,
  left: number,
): TraceCheckpoint {
  const duplicateIsActive = duplicateIndex >= left;
  return {
    prompt: duplicateIsActive
      ? `The same character was last seen at index ${duplicateIndex}. What should l do next?`
      : "The current character has no duplicate inside the active window. What should l do next?",
    options: duplicateIsActive
      ? [
          {
            id: "past-duplicate",
            label: `Move to ${duplicateIndex + 1}`,
          },
          { id: "stay", label: `Stay at ${left}` },
          { id: "restart", label: "Reset to 0" },
        ]
      : [
          { id: "stay", label: `Stay at ${left}` },
          { id: "advance", label: `Advance to ${left + 1}` },
          { id: "restart", label: "Reset to 0" },
        ],
    answerId: duplicateIsActive ? "past-duplicate" : "stay",
    explanation: duplicateIsActive
      ? "Moving just past the previous occurrence removes the duplicate while preserving the widest possible valid suffix."
      : "Only a duplicate at or after l can invalidate the current window, so l stays where it is.",
  };
}

function emptyCheckpoint(): TraceCheckpoint {
  return {
    prompt: "The string is empty. What value remains in max after the loop?",
    options: [
      { id: "zero", label: "0" },
      { id: "one", label: "1" },
      { id: "negative", label: "−1" },
    ],
    answerId: "zero",
    explanation:
      "The loop has no iterations, so max keeps its initialized value of zero.",
  };
}

function traceLongestSubstring(input: LongestSubstringInput): TraceRun {
  const value = input.s;
  const last = Array<number>(128).fill(-1);
  const frames: TraceFrame[] = [];
  const checkpointIndex = findCheckpointIndex(value);
  let left = 0;
  let max = 0;
  let bestStart = 0;

  frames.push({
    id: "initialize",
    phase: "Initialize",
    codeRefs: ["create-last-seen", "mark-unseen", "initialize-window"],
    explanation:
      "Mark every printable ASCII character unseen, then place the empty window at the start of the string.",
    changed: "Initialized l and max to 0 and every last-seen position to −1.",
    invariant:
      "Before scanning begins, the active window is empty and therefore contains no repeated character.",
    variables: [
      { name: "l", value: left },
      { name: "max", value: max },
      { name: "recorded characters", value: 0 },
    ],
    scenes: [
      characterScene(value, { left, right: null }),
      lastSeenScene(last, null),
    ],
    focusSceneId: "characters",
    ...(value.length === 0 ? { checkpoint: emptyCheckpoint() } : {}),
  });

  for (let right = 0; right < value.length; right += 1) {
    const character = value[right];
    const code = value.charCodeAt(right);
    const previousIndex = last[code];
    const duplicateIsActive = previousIndex >= left;
    const previousLeft = left;

    if (duplicateIsActive) {
      frames.push({
        id: `inspect-duplicate-${right}`,
        phase: "Spot duplicate",
        codeRefs: ["scan-right", "read-character", "move-left"],
        explanation: `${JSON.stringify(character)} last appeared at index ${previousIndex}, inside the active window. The candidate range now contains a repeat.`,
        changed: `Moved r to ${right}; l is still ${left} until the duplicate is removed.`,
        invariant:
          "Before including s[r], the substring from l through r − 1 has no repeated characters.",
        variables: [
          { name: "l", value: left },
          {
            name: "r",
            value: right,
            previous: right === 0 ? null : right - 1,
            changed: true,
          },
          { name: "c", value: character, changed: true },
          { name: "previous occurrence", value: previousIndex },
          { name: "max", value: max },
        ],
        scenes: [
          characterScene(value, {
            left,
            right,
            duplicateIndex: previousIndex,
            bestStart,
            bestLength: max,
          }),
          lastSeenScene(last, code, "rejected"),
        ],
        focusSceneId: "characters",
        ...(right === checkpointIndex
          ? { checkpoint: windowCheckpoint(previousIndex, left) }
          : {}),
      });

      left = previousIndex + 1;
    }

    const previousMax = max;
    const previousRecordedIndex = last[code];
    last[code] = right;
    const windowLength = right - left + 1;
    if (windowLength > max) {
      max = windowLength;
      bestStart = left;
    }

    frames.push({
      id: duplicateIsActive ? `resolve-${right}` : `extend-${right}`,
      phase: duplicateIsActive ? "Move past duplicate" : "Extend window",
      codeRefs: duplicateIsActive
        ? ["move-left", "remember-character", "update-maximum"]
        : [
            "scan-right",
            "read-character",
            "move-left",
            "remember-character",
            "update-maximum",
          ],
      explanation: duplicateIsActive
        ? `Move l from ${previousLeft} to ${left}, then record ${JSON.stringify(character)} at index ${right}. The repaired window has length ${windowLength}.`
        : previousIndex < 0
          ? `${JSON.stringify(character)} is new. Keep l at ${left}, record index ${right}, and extend the unique window to length ${windowLength}.`
          : `${JSON.stringify(character)} was last seen at index ${previousIndex}, before the active window. Keep l at ${left} and extend to length ${windowLength}.`,
      changed: duplicateIsActive
        ? `Moved l to ${left} and updated last[c] to ${right}${max !== previousMax ? `; max grew to ${max}` : ""}.`
        : max !== previousMax
          ? `Updated last[c] to ${right} and max from ${previousMax} to ${max}.`
          : `Updated last[c] from ${previousRecordedIndex} to ${right}; max remains ${max}.`,
      invariant:
        "The substring s[l..r] has unique characters, last[c] equals r, and max is the longest valid window seen so far.",
      variables: [
        {
          name: "l",
          value: left,
          previous: previousLeft,
          changed: left !== previousLeft,
        },
        {
          name: "r",
          value: right,
          previous: right === 0 ? null : right - 1,
          changed: true,
        },
        { name: "c", value: character, changed: true },
        { name: "window length", value: windowLength, changed: true },
        {
          name: "last[c]",
          value: right,
          previous: previousRecordedIndex,
          changed: true,
        },
        {
          name: "max",
          value: max,
          previous: previousMax,
          changed: max !== previousMax,
        },
      ],
      scenes: [
        characterScene(value, {
          left,
          right,
          ...(duplicateIsActive ? { duplicateIndex: previousIndex } : {}),
          bestStart,
          bestLength: max,
        }),
        lastSeenScene(last, code, "current"),
      ],
      focusSceneId: "characters",
      ...(!duplicateIsActive && right === checkpointIndex
        ? { checkpoint: windowCheckpoint(previousIndex, left) }
        : {}),
    });
  }

  frames.push({
    id: "complete",
    phase: "Complete",
    codeRefs: ["return-maximum"],
    explanation:
      max === 0
        ? "No character was scanned, so return 0."
        : `Return ${max}, the greatest unique-window length observed during the scan.`,
    changed: `Finalized the result as ${max}.`,
    invariant:
      "Every possible right edge was processed once, so no longer valid substring can remain undiscovered.",
    variables: [
      { name: "max", value: max, changed: true },
      {
        name: "best substring",
        value: value.slice(bestStart, bestStart + max),
      },
    ],
    scenes: [
      characterScene(value, {
        left,
        right: null,
        bestStart,
        bestLength: max,
        complete: true,
      }),
      lastSeenScene(last, null),
    ],
    focusSceneId: "characters",
    complete: true,
    output: max,
  });

  return {
    input: { s: value },
    output: max,
    frames,
  };
}

export const longestSubstringWithoutRepeatingCharactersRuntime =
  createTraceRuntime<LongestSubstringInput, number>({
    definition: longestSubstringWithoutRepeatingCharactersDefinition,
    schema: longestSubstringInputSchema,
    parseRaw: parseRawInput,
    trace: traceLongestSubstring,
    oracle: enumerateSubstringOracle,
  });

export const runtime = longestSubstringWithoutRepeatingCharactersRuntime;

export default longestSubstringWithoutRepeatingCharactersRuntime;
