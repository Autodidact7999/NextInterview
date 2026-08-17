import { z } from "zod";

import { definition } from "@/content/visualizations/problems/0125-valid-palindrome/definition";
import { createTraceRuntime } from "@/lib/visualizer/runtime";
import type {
  TraceFrame,
  TraceItemRole,
  TraceRun,
  TraceSequenceScene,
} from "@/lib/visualizer/types";

const printableAscii = z
  .string()
  .max(120, "Use at most 120 characters.")
  .refine(
    (value) =>
      Array.from(value).every((character) => {
        const code = character.charCodeAt(0);
        return code >= 32 && code <= 126;
      }),
    "Use printable ASCII characters only.",
  );

const inputSchema = z.object({ s: printableAscii });

type ValidPalindromeInput = z.infer<typeof inputSchema>;
type CompletionRole = "accepted" | "rejected" | undefined;

function isAsciiAlphanumeric(character: string): boolean {
  const code = character.charCodeAt(0);
  return (
    (code >= 48 && code <= 57) ||
    (code >= 65 && code <= 90) ||
    (code >= 97 && code <= 122)
  );
}

function asciiLowercase(character: string): string {
  const code = character.charCodeAt(0);
  return code >= 65 && code <= 90 ? String.fromCharCode(code + 32) : character;
}

function sequenceScene(
  value: string,
  left: number,
  right: number,
  acceptedIndices: readonly number[] = [],
  rejectedIndices: readonly number[] = [],
  completionRole?: CompletionRole,
): TraceSequenceScene {
  const characters = Array.from(value);
  const accepted = new Set(acceptedIndices);
  const rejected = new Set(rejectedIndices);
  const pointers = [];
  if (left >= 0 && left < characters.length) {
    pointers.push({ id: "left-pointer", label: "l", index: left });
  }
  if (right >= 0 && right < characters.length) {
    pointers.push({ id: "right-pointer", label: "r", index: right });
  }

  return {
    id: "characters",
    kind: "sequence",
    title: "Input characters",
    description:
      characters.length === 0
        ? "The input is empty, so there are no character pairs to compare."
        : "Non-alphanumeric characters are dimmed because the Java loops skip them.",
    items: characters.map((character, index) => {
      let role: TraceItemRole = "default";
      if (!isAsciiAlphanumeric(character)) role = "dimmed";
      else if (rejected.has(index)) role = "rejected";
      else if (completionRole === "accepted" || accepted.has(index))
        role = "accepted";
      else if (index === left) role = "current";
      else if (index === right) role = "candidate";

      return {
        id: `character-${index}`,
        label: `s[${index}]`,
        value: character,
        role,
        ...(!isAsciiAlphanumeric(character)
          ? { note: "Ignored by the palindrome comparison" }
          : {}),
      };
    }),
    pointers,
    ...(left >= 0 && right >= left && right < characters.length
      ? {
          ranges: [
            {
              id: "unresolved-range",
              label: "Still unresolved",
              start: left,
              end: right,
              role: "candidate" as const,
            },
          ],
        }
      : {}),
  };
}

function trace(input: ValidPalindromeInput): TraceRun {
  const frames: TraceFrame[] = [];
  let frameNumber = 0;
  let left = 0;
  let right = input.s.length - 1;
  const matchedIndices: number[] = [];

  const addFrame = (frame: Omit<TraceFrame, "id">): void => {
    frames.push({
      ...frame,
      id: `frame-${String(frameNumber).padStart(3, "0")}`,
    });
    frameNumber += 1;
  };

  const willEnterLoop = left < right;
  addFrame({
    phase: "Initialize",
    codeRefs: ["initialize-pointers", "scan-inward"],
    explanation:
      input.s.length === 0
        ? "Place l at 0 and r at −1. Because l is not less than r, the scan is already finished."
        : `Place l at index ${left} and r at index ${right}, the two ends of the string.`,
    changed: `Initialized l = ${left} and r = ${right}.`,
    invariant:
      "Characters outside the inclusive pointer range have either been ignored or matched in normalized pairs.",
    variables: [
      { name: "l", value: left },
      { name: "r", value: right },
      { name: "l < r", value: willEnterLoop },
    ],
    scenes: [sequenceScene(input.s, left, right)],
    focusSceneId: "characters",
    checkpoint: {
      prompt: "What does the l < r guard do next?",
      options: [
        { id: "scan", label: "Scan inward from both ends" },
        { id: "confirm", label: "Return true without another pair" },
      ],
      answerId: willEnterLoop ? "scan" : "confirm",
      explanation: willEnterLoop
        ? "At least two positions remain, so the Java loop must normalize and compare the next pair."
        : "Fewer than two positions remain, so no unmatched pair can disprove the palindrome.",
    },
  });

  while (left < right) {
    const beforeSkipLeft = left;
    const beforeSkipRight = right;
    const skippedLeft: string[] = [];
    const skippedRight: string[] = [];

    while (left < right && !isAsciiAlphanumeric(input.s[left] ?? "")) {
      skippedLeft.push(input.s[left] ?? "");
      left += 1;
    }

    while (left < right && !isAsciiAlphanumeric(input.s[right] ?? "")) {
      skippedRight.unshift(input.s[right] ?? "");
      right -= 1;
    }

    if (left !== beforeSkipLeft || right !== beforeSkipRight) {
      const movedLeft = left !== beforeSkipLeft;
      const movedRight = right !== beforeSkipRight;
      const skippedParts = [
        ...(movedLeft
          ? [
              `left skipped ${JSON.stringify(skippedLeft.join(""))} at ${beforeSkipLeft}–${left - 1}`,
            ]
          : []),
        ...(movedRight
          ? [
              `right skipped ${JSON.stringify(skippedRight.join(""))} at ${right + 1}–${beforeSkipRight}`,
            ]
          : []),
      ];

      addFrame({
        phase: "Skip ignored",
        codeRefs: [
          ...(movedLeft ? ["skip-left"] : []),
          ...(movedRight ? ["skip-right"] : []),
        ],
        explanation: `Ignore the contiguous non-alphanumeric characters: ${skippedParts.join("; ")}.`,
        changed: `Moved the comparison window from [${beforeSkipLeft}, ${beforeSkipRight}] to [${left}, ${right}].`,
        invariant:
          "Skipping punctuation cannot change the normalized text being tested for palindromicity.",
        variables: [
          {
            name: "l",
            value: left,
            previous: beforeSkipLeft,
            changed: movedLeft,
          },
          {
            name: "r",
            value: right,
            previous: beforeSkipRight,
            changed: movedRight,
          },
          {
            name: "ignored count",
            value: skippedLeft.length + skippedRight.length,
          },
        ],
        scenes: [sequenceScene(input.s, left, right, matchedIndices)],
        focusSceneId: "characters",
      });
    }

    const leftCharacter = input.s[left] ?? "";
    const rightCharacter = input.s[right] ?? "";
    const normalizedLeft = asciiLowercase(leftCharacter);
    const normalizedRight = asciiLowercase(rightCharacter);
    const matches = normalizedLeft === normalizedRight;

    if (!matches) {
      addFrame({
        phase: "Complete",
        codeRefs: ["compare-normalized"],
        explanation: `${JSON.stringify(leftCharacter)} and ${JSON.stringify(rightCharacter)} normalize to different characters, so the method returns false.`,
        changed:
          "Found the first mismatched normalized pair and set the result to false.",
        invariant:
          "One mismatched mirrored pair is sufficient to disprove a palindrome.",
        variables: [
          { name: "l", value: left },
          { name: "r", value: right },
          { name: "left normalized", value: normalizedLeft },
          { name: "right normalized", value: normalizedRight },
          { name: "result", value: false, changed: true },
        ],
        scenes: [
          sequenceScene(input.s, left, right, matchedIndices, [left, right]),
        ],
        focusSceneId: "characters",
        complete: true,
        output: false,
      });
      return {
        input: { s: input.s },
        output: false,
        frames,
      };
    }

    const previousLeft = left;
    const previousRight = right;
    matchedIndices.push(previousLeft);
    if (previousRight !== previousLeft) matchedIndices.push(previousRight);
    left += 1;
    right -= 1;

    addFrame({
      phase: "Match and move",
      codeRefs: ["compare-normalized", "move-inward", "scan-inward"],
      explanation:
        previousLeft === previousRight
          ? "After skipping ignored characters, both pointers meet on the same position, which necessarily matches itself."
          : `${JSON.stringify(leftCharacter)} and ${JSON.stringify(rightCharacter)} both normalize to ${JSON.stringify(normalizedLeft)}, so accept the pair and move inward.`,
      changed: `Accepted indices ${previousLeft} and ${previousRight}; moved the window to [${left}, ${right}].`,
      invariant:
        "Every normalized pair outside the next pointer range matches symmetrically.",
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
        { name: "left normalized", value: normalizedLeft },
        { name: "right normalized", value: normalizedRight },
        { name: "l < r", value: left < right },
      ],
      scenes: [sequenceScene(input.s, left, right, matchedIndices)],
      focusSceneId: "characters",
    });
  }

  addFrame({
    phase: "Complete",
    codeRefs: ["confirm-palindrome"],
    explanation:
      "The pointers met or crossed without a mismatch, so the normalized text is a palindrome.",
    changed: "Set the result to true.",
    invariant:
      "Every alphanumeric character has a matching normalized character at its mirrored position.",
    variables: [
      { name: "l", value: left },
      { name: "r", value: right },
      { name: "result", value: true, changed: true },
    ],
    scenes: [
      sequenceScene(input.s, left, right, matchedIndices, [], "accepted"),
    ],
    focusSceneId: "characters",
    complete: true,
    output: true,
  });

  return {
    input: { s: input.s },
    output: true,
    frames,
  };
}

function normalizedReverseOracle(input: ValidPalindromeInput): boolean {
  const normalized = Array.from(input.s)
    .filter(isAsciiAlphanumeric)
    .map(asciiLowercase)
    .join("");
  return normalized === Array.from(normalized).reverse().join("");
}

export const runtime = createTraceRuntime({
  definition,
  schema: inputSchema,
  parseRaw: (raw) => ({ s: raw.s ?? "" }),
  trace,
  oracle: normalizedReverseOracle,
});

export default runtime;
