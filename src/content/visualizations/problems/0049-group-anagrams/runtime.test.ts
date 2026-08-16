import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { groupAnagramsDefinition } from "@/content/visualizations/problems/0049-group-anagrams/definition";
import { groupAnagramsRuntime } from "@/content/visualizations/problems/0049-group-anagrams/runtime";
import { validateTraceDefinition } from "@/lib/visualizer";

function frequencyKey(word: string): string {
  const counts = Array<number>(26).fill(0);
  for (const character of word) {
    const index = character.charCodeAt(0) - 97;
    counts[index] = (counts[index] ?? 0) + 1;
  }
  return counts.join(":");
}

function referencePartition(words: readonly string[]): string[][] {
  const groups = new Map<string, string[]>();
  for (const word of words) {
    const key = frequencyKey(word);
    const current = groups.get(key);
    if (current) current.push(word);
    else groups.set(key, [word]);
  }
  return Array.from(groups.values(), (group) => [...group]);
}

const lowercaseWord = fc
  .array(fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz"), {
    minLength: 0,
    maxLength: 20,
  })
  .map((characters) => characters.join(""));

const validWords = fc.array(lowercaseWord, { minLength: 1, maxLength: 20 });

describe("LC 49 Group Anagrams trace runtime", () => {
  it("has a valid definition and valid independently authored presets", () => {
    expect(() =>
      validateTraceDefinition(groupAnagramsDefinition),
    ).not.toThrow();

    for (const preset of groupAnagramsDefinition.presets) {
      const result = groupAnagramsRuntime.run(preset.values);
      expect(result.ok, preset.id).toBe(true);
      if (!result.ok) continue;

      const words = JSON.parse(preset.values.strs) as string[];
      expect(result.value.output).toEqual(referencePartition(words));
      expect(result.value.frames.some((frame) => frame.checkpoint)).toBe(true);
      expect(result.value.frames.at(-1)).toMatchObject({
        complete: true,
        output: result.value.output,
      });
    }
  });

  it("accepts comma-separated words and rejects invalid bounds", () => {
    const commaSeparated = groupAnagramsRuntime.run({
      strs: "eat, tea, tan",
    });
    expect(commaSeparated.ok).toBe(true);

    const uppercase = groupAnagramsRuntime.run({ strs: '["Tea"]' });
    const tooMany = groupAnagramsRuntime.run({
      strs: JSON.stringify(Array.from({ length: 21 }, () => "a")),
    });
    expect(uppercase).toMatchObject({
      ok: false,
      issues: [{ field: "strs" }],
    });
    expect(tooMany).toMatchObject({
      ok: false,
      issues: [{ field: "strs" }],
    });
  });

  it("focuses the changed bucket and keeps group members structured", () => {
    const result = groupAnagramsRuntime.run({ strs: '["eat", "tea"]' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const append = result.value.frames.find((frame) => frame.id === "append-1");
    const groups = append?.scenes.find((scene) => scene.id === "groups");
    expect(append?.focusSceneId).toBe("groups");
    expect(groups?.kind).toBe("associative");
    if (groups?.kind !== "associative") return;
    expect(groups.entries[0]?.value).toEqual(["eat", "tea"]);
  });

  it("matches an independent frequency-partition oracle", () => {
    fc.assert(
      fc.property(validWords, (words) => {
        const raw = { strs: JSON.stringify(words) };
        const first = groupAnagramsRuntime.run(raw);
        const second = groupAnagramsRuntime.run(raw);

        expect(first).toEqual(second);
        expect(first.ok).toBe(true);
        if (!first.ok) return;

        expect(first.value.output).toEqual(referencePartition(words));
        expect(JSON.parse(JSON.stringify(first.value))).toEqual(first.value);
        expect(first.value.frames.length).toBeLessThanOrEqual(500);
        expect(
          first.value.frames.filter((frame) => frame.complete),
        ).toHaveLength(1);
      }),
      { numRuns: 100 },
    );
  });
});
