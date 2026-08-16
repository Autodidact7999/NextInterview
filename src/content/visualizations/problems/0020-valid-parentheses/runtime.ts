import { z } from "zod";

import { validParenthesesDefinition } from "@/content/visualizations/problems/0020-valid-parentheses/definition";
import { createTraceRuntime } from "@/lib/visualizer/runtime";
import type {
  RawTraceInput,
  TraceCheckpoint,
  TraceFrame,
  TraceItemRole,
  TraceRun,
  TraceSequenceScene,
  TraceStackScene,
  TraceVariable,
} from "@/lib/visualizer/types";

const bracketCharacters = "()[]{}";

const validParenthesesInputSchema = z.object({
  s: z
    .string()
    .max(80, "Use at most 80 bracket characters.")
    .refine(
      (value) =>
        Array.from(value).every((character) =>
          bracketCharacters.includes(character),
        ),
      "Use only parentheses, square brackets, and braces.",
    ),
});

type ValidParenthesesInput = z.infer<typeof validParenthesesInputSchema>;

interface StackEntry {
  character: string;
  inputIndex: number;
}

interface SceneState {
  currentIndex: number | null;
  matchedIndices?: readonly number[];
  rejectedIndices?: readonly number[];
  activeOpeningIndex?: number | null;
  currentRole?: TraceItemRole;
  stackTopRole?: TraceItemRole;
}

function parseRawInput(raw: RawTraceInput): unknown {
  return { s: raw.s ?? "" };
}

function isOpening(character: string): boolean {
  return character === "(" || character === "[" || character === "{";
}

function bracketsMatch(opening: string, closing: string): boolean {
  return (
    (closing === ")" && opening === "(") ||
    (closing === "]" && opening === "[") ||
    (closing === "}" && opening === "{")
  );
}

function reductionOracle(input: ValidParenthesesInput): boolean {
  let remaining = input.s;
  while (true) {
    const reduced = remaining.replace(/\(\)|\[\]|\{\}/g, "");
    if (reduced === remaining) return reduced.length === 0;
    remaining = reduced;
  }
}

function sequenceScene(value: string, state: SceneState): TraceSequenceScene {
  const matched = new Set(state.matchedIndices ?? []);
  const rejected = new Set(state.rejectedIndices ?? []);

  return {
    id: "bracket-sequence",
    kind: "sequence",
    title: "Bracket sequence",
    description:
      value.length === 0
        ? "The input contains no brackets."
        : "Accepted pairs are green; the current comparison or failure stays highlighted.",
    items: Array.from(value).map((character, index) => {
      let role: TraceItemRole = "default";
      if (rejected.has(index)) role = "rejected";
      else if (matched.has(index)) role = "accepted";
      else if (index === state.currentIndex)
        role = state.currentRole ?? "current";
      else if (index === state.activeOpeningIndex) role = "candidate";
      else if (state.currentIndex !== null && index < state.currentIndex)
        role = "visited";

      return {
        id: `character-${index}`,
        label: `s[${index}]`,
        value: character,
        role,
        ...(index === state.activeOpeningIndex
          ? { note: "stack top" }
          : index === state.currentIndex
            ? { note: "c" }
            : {}),
      };
    }),
    ...(state.currentIndex === null
      ? {}
      : {
          pointers: [
            { id: "character-pointer", label: "c", index: state.currentIndex },
          ],
        }),
  };
}

function stackScene(
  stack: readonly StackEntry[],
  topRole?: TraceItemRole,
): TraceStackScene {
  return {
    id: "opening-stack",
    kind: "stack",
    title: "Unmatched openings",
    description:
      stack.length === 0
        ? "The stack has no unmatched opening bracket."
        : "The most recently opened bracket is at the top and must close first.",
    items: stack.map((entry, index) => ({
      id: `opening-${entry.inputIndex}`,
      label: `s[${entry.inputIndex}]`,
      value: entry.character,
      role: index === stack.length - 1 ? (topRole ?? "current") : "default",
      ...(index === stack.length - 1 ? { note: "top" } : {}),
    })),
    topLabel: "top / st.peek()",
  };
}

function variables(
  index: number | null,
  character: string | null,
  stack: readonly StackEntry[],
  previousSize?: number,
): readonly TraceVariable[] {
  return [
    { name: "index", value: index, changed: index !== null },
    { name: "c", value: character, changed: character !== null },
    {
      name: "st.size()",
      value: stack.length,
      ...(previousSize === undefined
        ? {}
        : {
            previous: previousSize,
            changed: previousSize !== stack.length,
          }),
    },
    {
      name: "st.peek()",
      value: stack.at(-1)?.character ?? null,
    },
  ];
}

function predictionCheckpoint(
  character: string,
  top: string | null,
): TraceCheckpoint {
  const answerId = isOpening(character)
    ? "push"
    : top !== null && bracketsMatch(top, character)
      ? "match"
      : "reject";

  return {
    prompt: `Predict the next move for ${JSON.stringify(character)}.`,
    options: [
      { id: "push", label: "Push it as an opener" },
      { id: "match", label: "Pop a matching opener" },
      { id: "reject", label: "Return false" },
    ],
    answerId,
    explanation:
      answerId === "push"
        ? "An opening bracket is saved so a later closing bracket can match it."
        : answerId === "match"
          ? `${JSON.stringify(character)} matches the most recent opener, ${JSON.stringify(top)}, so that opener is popped.`
          : top === null
            ? "A closing bracket cannot be matched when the stack is empty."
            : `${JSON.stringify(character)} does not match the most recent opener, ${JSON.stringify(top)}.`,
  };
}

function emptyCheckpoint(): TraceCheckpoint {
  return {
    prompt: "What does the final empty-stack check return?",
    options: [
      { id: "true", label: "true — no opener is unmatched" },
      { id: "false", label: "false — a pair is missing" },
    ],
    answerId: "true",
    explanation:
      "The loop has no iterations and the newly created stack remains empty.",
  };
}

function traceValidParentheses(input: ValidParenthesesInput): TraceRun {
  const characters = Array.from(input.s);
  const stack: StackEntry[] = [];
  const matchedIndices: number[] = [];
  const frames: TraceFrame[] = [];
  let frameNumber = 0;
  const firstCloserIndex = characters.findIndex(
    (character) => !isOpening(character),
  );
  const predictionIndex =
    firstCloserIndex >= 0
      ? firstCloserIndex
      : Math.max(0, characters.length - 1);

  const addFrame = (frame: Omit<TraceFrame, "id">): void => {
    frames.push({
      ...frame,
      id: `frame-${String(frameNumber).padStart(3, "0")}`,
    });
    frameNumber += 1;
  };

  addFrame({
    phase: "Initialize",
    codeRefs: ["initialize-stack", "scan-characters"],
    explanation:
      characters.length === 0
        ? "Create an empty stack. There are no characters for the loop to visit."
        : "Create an empty stack before scanning the string from left to right.",
    changed: "st is initialized with no unmatched opening brackets.",
    invariant:
      "Before the scan begins, the stack exactly represents the unmatched openings in the empty prefix.",
    variables: variables(null, null, stack),
    scenes: [sequenceScene(input.s, { currentIndex: null }), stackScene(stack)],
    focusSceneId: "bracket-sequence",
    ...(characters.length === 0 ? { checkpoint: emptyCheckpoint() } : {}),
  });

  for (let index = 0; index < characters.length; index += 1) {
    const character = characters[index] ?? "";
    const top = stack.at(-1) ?? null;

    addFrame({
      phase: "Read character",
      codeRefs: [
        "scan-characters",
        isOpening(character) ? "push-opening" : "reject-empty-stack",
      ],
      explanation: isOpening(character)
        ? `${JSON.stringify(character)} is an opening bracket, so it will be pushed.`
        : top === null
          ? `${JSON.stringify(character)} is a closing bracket, but there is no opening bracket available.`
          : `${JSON.stringify(character)} must match the stack top, ${JSON.stringify(top.character)}.`,
      changed: `c now refers to s[${index}] (${JSON.stringify(character)}); the stack has not changed yet.`,
      invariant:
        "Before processing c, the stack contains exactly the unmatched opening brackets from the earlier prefix.",
      variables: variables(index, character, stack),
      scenes: [
        sequenceScene(input.s, {
          currentIndex: index,
          matchedIndices,
          activeOpeningIndex: top?.inputIndex ?? null,
          currentRole: "candidate",
        }),
        stackScene(stack, top === null ? undefined : "candidate"),
      ],
      focusSceneId: top === null ? "bracket-sequence" : "opening-stack",
      ...(index === predictionIndex
        ? {
            checkpoint: predictionCheckpoint(character, top?.character ?? null),
          }
        : {}),
    });

    if (isOpening(character)) {
      const previousSize = stack.length;
      stack.push({ character, inputIndex: index });
      addFrame({
        phase: "Push opening",
        codeRefs: ["push-opening"],
        explanation: `Push ${JSON.stringify(character)} so it becomes the next opening bracket that must be matched.`,
        changed: `st grows from ${previousSize} to ${stack.length}; its top is now ${JSON.stringify(character)}.`,
        invariant:
          "The stack contains every unmatched opening bracket in the processed prefix, with the newest one on top.",
        variables: variables(index, character, stack, previousSize),
        scenes: [
          sequenceScene(input.s, {
            currentIndex: index,
            matchedIndices,
            activeOpeningIndex: index,
            currentRole: "current",
          }),
          stackScene(stack, "current"),
        ],
        focusSceneId: "opening-stack",
      });
      continue;
    }

    if (top === null) {
      const output = false;
      addFrame({
        phase: "Complete",
        codeRefs: ["reject-empty-stack"],
        explanation: `${JSON.stringify(character)} has no opening bracket to match, so the method returns false immediately.`,
        changed: "The result becomes false; the empty stack remains unchanged.",
        invariant:
          "A prefix with more closing brackets than opening brackets can never become valid later.",
        variables: [
          ...variables(index, character, stack),
          { name: "result", value: false, previous: null, changed: true },
        ],
        scenes: [
          sequenceScene(input.s, {
            currentIndex: index,
            matchedIndices,
            rejectedIndices: [index],
            currentRole: "rejected",
          }),
          stackScene(stack),
        ],
        focusSceneId: "bracket-sequence",
        complete: true,
        output,
      });
      return { input: { s: input.s }, output, frames };
    }

    const previousSize = stack.length;
    const opening = stack.pop();
    if (!opening)
      throw new Error("Expected a stack entry after the empty check.");
    const matches = bracketsMatch(opening.character, character);

    if (!matches) {
      const output = false;
      addFrame({
        phase: "Complete",
        codeRefs: ["pop-opening", "reject-mismatch"],
        explanation: `${JSON.stringify(character)} closes a different bracket type than ${JSON.stringify(opening.character)}, so the method returns false.`,
        changed: `Popped ${JSON.stringify(opening.character)} from st, then rejected the mismatched pair.`,
        invariant:
          "A closing bracket must match the most recent unmatched opener; this pair violates that requirement.",
        variables: [
          ...variables(index, character, stack, previousSize),
          { name: "top", value: opening.character, changed: true },
          { name: "result", value: false, previous: null, changed: true },
        ],
        scenes: [
          sequenceScene(input.s, {
            currentIndex: index,
            matchedIndices,
            rejectedIndices: [opening.inputIndex, index],
            activeOpeningIndex: opening.inputIndex,
            currentRole: "rejected",
          }),
          stackScene(stack),
        ],
        focusSceneId: "bracket-sequence",
        complete: true,
        output,
      });
      return { input: { s: input.s }, output, frames };
    }

    matchedIndices.push(opening.inputIndex, index);
    addFrame({
      phase: "Match pair",
      codeRefs: ["pop-opening", "reject-mismatch"],
      explanation: `${JSON.stringify(character)} matches ${JSON.stringify(opening.character)}, so the opening bracket is removed from the stack.`,
      changed: `Popped the matching opener at s[${opening.inputIndex}]; st shrinks from ${previousSize} to ${stack.length}.`,
      invariant:
        "All completed pairs are correctly nested, and the stack holds exactly the unmatched openings that remain.",
      variables: [
        ...variables(index, character, stack, previousSize),
        { name: "top", value: opening.character, changed: true },
        { name: "pair matches", value: true, changed: true },
      ],
      scenes: [
        sequenceScene(input.s, {
          currentIndex: index,
          matchedIndices,
          activeOpeningIndex: opening.inputIndex,
          currentRole: "accepted",
        }),
        stackScene(stack),
      ],
      focusSceneId: "bracket-sequence",
    });
  }

  const output = stack.length === 0;
  const unmatchedIndices = stack.map((entry) => entry.inputIndex);
  addFrame({
    phase: "Complete",
    codeRefs: ["return-stack-empty"],
    explanation: output
      ? "The scan finishes with an empty stack, so every opening bracket was matched."
      : `The scan finishes with ${stack.length} unmatched opening bracket${stack.length === 1 ? "" : "s"}, so the method returns false.`,
    changed: `The final empty-stack check sets the result to ${String(output)}.`,
    invariant: output
      ? "Every bracket belongs to one correctly nested, type-matched pair."
      : "Any opening bracket left on the stack lacks a closing partner.",
    variables: [
      ...variables(
        characters.length === 0 ? null : characters.length - 1,
        null,
        stack,
      ),
      { name: "result", value: output, previous: null, changed: true },
    ],
    scenes: [
      sequenceScene(input.s, {
        currentIndex: null,
        matchedIndices,
        rejectedIndices: unmatchedIndices,
      }),
      stackScene(stack, output ? undefined : "rejected"),
    ],
    focusSceneId: output ? "bracket-sequence" : "opening-stack",
    complete: true,
    output,
  });

  return { input: { s: input.s }, output, frames };
}

export const validParenthesesRuntime = createTraceRuntime<
  ValidParenthesesInput,
  boolean
>({
  definition: validParenthesesDefinition,
  schema: validParenthesesInputSchema,
  parseRaw: parseRawInput,
  trace: traceValidParentheses,
  oracle: reductionOracle,
});

export const runtime = validParenthesesRuntime;
export default validParenthesesRuntime;
