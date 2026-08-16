import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { longestSubstringWithoutRepeatingCharactersDefinition } from "@/content/visualizations/problems/0003-longest-substring-without-repeating-characters/definition";
import { longestSubstringWithoutRepeatingCharactersRuntime } from "@/content/visualizations/problems/0003-longest-substring-without-repeating-characters/runtime";
import { validateTraceDefinition } from "@/lib/visualizer";

function hasUniqueCharacters(
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

function enumerateLongestUniqueSubstring(value: string): number {
  let best = 0;
  for (let start = 0; start < value.length; start += 1) {
    for (let end = start; end < value.length; end += 1) {
      if (hasUniqueCharacters(value, start, end)) {
        best = Math.max(best, end - start + 1);
      }
    }
  }
  return best;
}

function expectSuccessfulRun(value: string) {
  const result = longestSubstringWithoutRepeatingCharactersRuntime.run({
    s: value,
  });
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error(result.issues.map((issue) => issue.message).join(", "));
  }
  return result.value;
}

const printableAsciiString = fc
  .array(fc.integer({ min: 32, max: 126 }), { maxLength: 28 })
  .map((codes) => String.fromCharCode(...codes));

describe("LC 3 Longest Substring Without Repeating Characters trace", () => {
  it("has valid metadata and independently authored deterministic presets", () => {
    expect(() =>
      validateTraceDefinition(
        longestSubstringWithoutRepeatingCharactersDefinition,
      ),
    ).not.toThrow();

    for (const preset of longestSubstringWithoutRepeatingCharactersDefinition.presets) {
      const first = longestSubstringWithoutRepeatingCharactersRuntime.run(
        preset.values,
      );
      const second = longestSubstringWithoutRepeatingCharactersRuntime.run(
        preset.values,
      );

      expect(first).toEqual(second);
      expect(first.ok, preset.id).toBe(true);
      if (!first.ok) continue;

      expect(first.value.output).toBe(
        enumerateLongestUniqueSubstring(preset.values.s),
      );
      expect(first.value.frames.some((frame) => frame.checkpoint)).toBe(true);
      expect(first.value.frames.filter((frame) => frame.complete)).toHaveLength(
        1,
      );
      expect(first.value.frames.at(-1)).toMatchObject({
        complete: true,
        output: first.value.output,
      });
      expect(JSON.parse(JSON.stringify(first.value))).toEqual(first.value);
    }
  });

  it("never moves the left boundary backward after an old duplicate", () => {
    const run = expectSuccessfulRun("abba");
    const leftValues = run.frames.flatMap((frame) => {
      const left = frame.variables.find((variable) => variable.name === "l");
      return typeof left?.value === "number" ? [left.value] : [];
    });

    expect(run.output).toBe(2);
    expect(
      leftValues.every(
        (left, index) => index === 0 || left >= leftValues[index - 1],
      ),
    ).toBe(true);
    expect(
      run.frames.find((frame) => frame.id === "extend-3")?.explanation,
    ).toContain("before the active window");
  });

  it("shows active and best windows without splitting every character into redundant frames", () => {
    const run = expectSuccessfulRun("abcba");
    const extension = run.frames.find((frame) => frame.id === "extend-2");
    const scene = extension?.scenes.find(
      (candidate) => candidate.id === "characters",
    );

    expect(extension?.focusSceneId).toBe("characters");
    expect(scene?.kind).toBe("sequence");
    if (scene?.kind !== "sequence") return;
    expect(scene.ranges?.map((range) => range.id)).toEqual([
      "active-window",
      "best-window",
    ]);
    expect(run.frames.some((frame) => frame.id === "inspect-2")).toBe(false);
    expect(run.frames.some((frame) => frame.id === "inspect-duplicate-3")).toBe(
      true,
    );
  });

  it("rejects non-printable, non-ASCII, and oversized strings", () => {
    expect(
      longestSubstringWithoutRepeatingCharactersRuntime.run({ s: "a\nb" }),
    ).toMatchObject({ ok: false, issues: [{ field: "s" }] });
    expect(
      longestSubstringWithoutRepeatingCharactersRuntime.run({ s: "café" }),
    ).toMatchObject({ ok: false, issues: [{ field: "s" }] });
    expect(
      longestSubstringWithoutRepeatingCharactersRuntime.run({
        s: "x".repeat(81),
      }),
    ).toMatchObject({ ok: false, issues: [{ field: "s" }] });
  });

  it("matches an independent exhaustive substring oracle", () => {
    fc.assert(
      fc.property(printableAsciiString, (value) => {
        const first = expectSuccessfulRun(value);
        const second = expectSuccessfulRun(value);

        expect(first).toEqual(second);
        expect(first.output).toBe(enumerateLongestUniqueSubstring(value));
        expect(first.frames.length).toBeLessThanOrEqual(500);
        expect(first.frames.filter((frame) => frame.complete)).toHaveLength(1);
        expect(JSON.parse(JSON.stringify(first))).toEqual(first);
      }),
      { numRuns: 100 },
    );
  });
});
