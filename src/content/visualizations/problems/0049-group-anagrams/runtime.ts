import { z } from "zod";

import { groupAnagramsDefinition } from "@/content/visualizations/problems/0049-group-anagrams/definition";
import {
  createTraceRuntime,
  parseField,
  parseStringArray,
} from "@/lib/visualizer";
import type {
  RawTraceInput,
  TraceAssociativeScene,
  TraceFrame,
  TraceRun,
  TraceSequenceScene,
} from "@/lib/visualizer";

const lowercaseWord = z
  .string()
  .max(20, "Each word may contain at most 20 characters.")
  .regex(/^[a-z]*$/, "Use lowercase English letters only.");

const groupAnagramsInputSchema = z.object({
  strs: z
    .array(lowercaseWord)
    .min(1, "Enter at least one word.")
    .max(20, "Use at most 20 words."),
});

type GroupAnagramsInput = z.infer<typeof groupAnagramsInputSchema>;
type GroupAnagramsOutput = readonly (readonly string[])[];

function parseRawInput(raw: RawTraceInput): unknown {
  return {
    strs: parseField(raw, "strs", parseStringArray),
  };
}

function sortedSignature(word: string): string {
  return Array.from(word).sort().join("");
}

function frequencySignature(word: string): string {
  const counts = Array<number>(26).fill(0);
  for (const character of word) {
    const bucket = character.charCodeAt(0) - "a".charCodeAt(0);
    counts[bucket] = (counts[bucket] ?? 0) + 1;
  }
  return counts.join("#");
}

function partitionByFrequency(input: GroupAnagramsInput): GroupAnagramsOutput {
  const groups = new Map<string, string[]>();
  for (const word of input.strs) {
    const signature = frequencySignature(word);
    const group = groups.get(signature);
    if (group) group.push(word);
    else groups.set(signature, [word]);
  }
  return Array.from(groups.values(), (group) => [...group]);
}

function wordsScene(
  words: readonly string[],
  processedCount: number,
  currentIndex: number | null,
): TraceSequenceScene {
  return {
    id: "words",
    kind: "sequence",
    title: "Input words",
    description:
      currentIndex === null
        ? `${processedCount} of ${words.length} words have been assigned to groups.`
        : `The word at index ${currentIndex} is the current grouping candidate.`,
    items: words.map((word, index) => ({
      id: `word-${index}`,
      label: `strs[${index}]`,
      value: word,
      role:
        index === currentIndex
          ? "current"
          : index < processedCount
            ? "visited"
            : "default",
      ...(word.length === 0 ? { note: "empty string" } : {}),
    })),
    pointers:
      currentIndex === null
        ? []
        : [{ id: "word-cursor", label: "w", index: currentIndex }],
  };
}

function groupsScene(
  groups: ReadonlyMap<string, readonly string[]>,
  activeSignature: string | null,
): TraceAssociativeScene {
  return {
    id: "groups",
    kind: "associative",
    title: "Signature buckets",
    description:
      "A signature key points to every processed word with those same sorted characters.",
    entries: Array.from(groups.entries(), ([signature, words], index) => ({
      id: `group-${index}`,
      key: signature.length === 0 ? "∅ (empty key)" : signature,
      value: [...words],
      role: signature === activeSignature ? "candidate" : "default",
    })),
    emptyLabel: "No signature buckets have been created yet.",
  };
}

function traceGroupAnagrams(input: GroupAnagramsInput): TraceRun {
  const words = [...input.strs];
  const groups = new Map<string, string[]>();
  const frames: TraceFrame[] = [];
  const checkpointIndex = Math.min(1, words.length - 1);

  frames.push({
    id: "initialize",
    phase: "Initialize",
    codeRefs: ["create-groups"],
    explanation:
      "Start with an empty map. Each new sorted signature will own one output group.",
    changed: "Created an empty signature-to-words map.",
    invariant:
      "Every map entry represents exactly one character multiset, and output order follows the first appearance of each signature.",
    variables: [
      { name: "words", value: words.length },
      { name: "groups", value: 0 },
    ],
    scenes: [wordsScene(words, 0, null), groupsScene(groups, null)],
    focusSceneId: "words",
  });

  for (let index = 0; index < words.length; index += 1) {
    const word = words[index] ?? "";
    const signature = sortedSignature(word);
    const existingGroup = groups.get(signature);
    const groupAlreadyExists = existingGroup !== undefined;

    frames.push({
      id: `signature-${index}`,
      phase: "Build signature",
      codeRefs: [
        "scan-word",
        "copy-characters",
        "sort-characters",
        "build-signature",
      ],
      explanation:
        word.length === 0
          ? "The empty word sorts to the empty signature, which is still a valid hash-map key."
          : `Sorting the characters in “${word}” produces the canonical signature “${signature}”.`,
      changed: `Derived signature ${signature.length === 0 ? "∅" : `“${signature}”`} for strs[${index}].`,
      invariant:
        "Two lowercase words are anagrams exactly when their sorted signatures are identical.",
      variables: [
        {
          name: "word index",
          value: index,
          previous: index === 0 ? null : index - 1,
          changed: true,
        },
        { name: "w", value: word, changed: true },
        { name: "key", value: signature, changed: true },
        { name: "group exists", value: groupAlreadyExists },
      ],
      scenes: [wordsScene(words, index, index), groupsScene(groups, signature)],
      focusSceneId: "words",
      ...(index === checkpointIndex
        ? {
            checkpoint: {
              prompt: `Before “${word}” is inserted, what will computeIfAbsent do for this signature?`,
              options: [
                { id: "reuse", label: "Reuse the existing group" },
                { id: "create", label: "Create a new group" },
              ],
              answerId: groupAlreadyExists ? "reuse" : "create",
              explanation: groupAlreadyExists
                ? "That sorted signature is already a key, so this word joins its existing list."
                : "No matching signature has appeared yet, so the map creates a new list.",
            },
          }
        : {}),
    });

    const priorGroupSize = existingGroup?.length ?? 0;
    const nextGroup = existingGroup ?? [];
    if (!groupAlreadyExists) groups.set(signature, nextGroup);
    nextGroup.push(word);

    frames.push({
      id: `append-${index}`,
      phase: "Place word",
      codeRefs: ["append-to-group"],
      explanation: groupAlreadyExists
        ? `Append “${word}” to the existing “${signature || "empty"}” signature group.`
        : `Create the “${signature || "empty"}” signature group and add “${word}” as its first member.`,
      changed: `Group size for ${signature.length === 0 ? "∅" : `“${signature}”`} changed from ${priorGroupSize} to ${nextGroup.length}.`,
      invariant:
        "Every processed word appears once, in the bucket matching its sorted signature.",
      variables: [
        { name: "w", value: word },
        { name: "key", value: signature },
        {
          name: "current group size",
          value: nextGroup.length,
          previous: priorGroupSize,
          changed: true,
        },
        { name: "total groups", value: groups.size },
      ],
      scenes: [
        wordsScene(words, index + 1, index),
        groupsScene(groups, signature),
      ],
      focusSceneId: "groups",
    });
  }

  const output: GroupAnagramsOutput = Array.from(groups.values(), (group) => [
    ...group,
  ]);
  frames.push({
    id: "complete",
    phase: "Complete",
    codeRefs: ["return-groups"],
    explanation:
      "Collect the map's groups in first-signature order to produce the grouped result.",
    changed: `Finished with ${output.length} anagram group${output.length === 1 ? "" : "s"}.`,
    invariant:
      "Each input word appears exactly once, and words share a result group only when their character counts match.",
    variables: [
      { name: "processed words", value: words.length },
      { name: "result groups", value: output.length, changed: true },
    ],
    scenes: [wordsScene(words, words.length, null), groupsScene(groups, null)],
    focusSceneId: "groups",
    complete: true,
    output,
  });

  return {
    input: { strs: words },
    output,
    frames,
  };
}

export const groupAnagramsRuntime = createTraceRuntime<
  GroupAnagramsInput,
  GroupAnagramsOutput
>({
  definition: groupAnagramsDefinition,
  schema: groupAnagramsInputSchema,
  parseRaw: parseRawInput,
  trace: traceGroupAnagrams,
  oracle: partitionByFrequency,
});

export default groupAnagramsRuntime;
