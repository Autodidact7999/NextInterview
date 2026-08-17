import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { longestConsecutiveSequenceDefinition } from "@/content/visualizations/problems/0128-longest-consecutive-sequence/definition";
import { longestConsecutiveSequenceRuntime } from "@/content/visualizations/problems/0128-longest-consecutive-sequence/runtime";
import { validateTraceDefinition } from "@/lib/visualizer";

const JAVA_INT_MIN = -2_147_483_648;
const JAVA_INT_MAX = 2_147_483_647;

function sortedUniqueRunOracle(nums: readonly number[]): number {
  const sorted = [...nums].sort((left, right) => left - right);
  let previous: number | null = null;
  let runLength = 0;
  let bestLength = 0;

  for (const value of sorted) {
    if (value === previous) continue;
    runLength = previous !== null && value === previous + 1 ? runLength + 1 : 1;
    bestLength = Math.max(bestLength, runLength);
    previous = value;
  }

  return bestLength;
}

function expectSuccessfulRun(nums: readonly number[]) {
  const result = longestConsecutiveSequenceRuntime.run({
    nums: JSON.stringify(nums),
  });
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error(result.issues.map((issue) => issue.message).join(", "));
  }
  return result.value;
}

describe("LC 128 Longest Consecutive Sequence trace", () => {
  it("has valid metadata and deterministic, JSON-safe presets", () => {
    expect(() =>
      validateTraceDefinition(longestConsecutiveSequenceDefinition),
    ).not.toThrow();

    for (const preset of longestConsecutiveSequenceDefinition.presets) {
      const first = longestConsecutiveSequenceRuntime.run(preset.values);
      const second = longestConsecutiveSequenceRuntime.run(preset.values);

      expect(first).toEqual(second);
      expect(first.ok, preset.id).toBe(true);
      if (!first.ok) continue;

      const nums = JSON.parse(preset.values.nums) as number[];
      expect(first.value.output).toBe(sortedUniqueRunOracle(nums));
      expect(first.value.frames.filter((frame) => frame.complete)).toHaveLength(
        1,
      );
      expect(first.value.frames.at(-1)?.complete).toBe(true);
      expect(first.value.frames.some((frame) => frame.checkpoint)).toBe(true);
      expect(first.value.frames.length).toBeLessThanOrEqual(500);
      expect(JSON.parse(JSON.stringify(first.value))).toEqual(first.value);
    }
  });

  it("counts a run once from its smallest value and ignores duplicates", () => {
    const run = expectSuccessfulRun([10, 5, 11, 12, 5, 13, 30]);

    expect(run.output).toBe(4);
    expect(
      run.frames.filter((frame) => frame.id.startsWith("start-run-")),
    ).toHaveLength(3);
    expect(
      run.frames.filter((frame) => frame.id.startsWith("extend-1-")),
    ).toHaveLength(3);
    expect(run.frames.some((frame) => frame.id === "start-run-2")).toBe(false);
    expect(
      run.frames.find((frame) => frame.id === "inspect-start-2")?.explanation,
    ).toContain("begins earlier");
  });

  it("returns zero with a prediction checkpoint for an empty input", () => {
    const run = expectSuccessfulRun([]);

    expect(run.output).toBe(0);
    expect(
      run.frames.find((frame) => frame.checkpoint)?.checkpoint?.answerId,
    ).toBe("zero");
  });

  it("shows numeric adjacency and the growing run as a focused range", () => {
    const run = expectSuccessfulRun([100, 4, 200, 1, 3, 2]);
    const finalExtension = run.frames.find(
      (frame) => frame.id === "extend-0-3",
    );
    const scene = finalExtension?.scenes.find(
      (candidate) => candidate.id === "sorted-adjacency",
    );

    expect(finalExtension?.focusSceneId).toBe("sorted-adjacency");
    expect(scene?.kind).toBe("sequence");
    if (scene?.kind !== "sequence") return;

    expect(scene.items.map((item) => item.value)).toEqual([
      1, 2, 3, 4, 100, 200,
    ]);
    expect(scene.ranges).toEqual([
      expect.objectContaining({ start: 0, end: 3, role: "accepted" }),
    ]);
    expect(scene.items[4]?.note).toBe("gap before");
  });

  it("rejects malformed, oversized, and overflow-edge inputs", () => {
    expect(
      longestConsecutiveSequenceRuntime.run({ nums: "[1, nope]" }).ok,
    ).toBe(false);
    expect(
      longestConsecutiveSequenceRuntime.run({
        nums: JSON.stringify(Array.from({ length: 41 }, (_, index) => index)),
      }).ok,
    ).toBe(false);
    expect(
      longestConsecutiveSequenceRuntime.run({ nums: `[${JAVA_INT_MIN}]` }).ok,
    ).toBe(false);
    expect(
      longestConsecutiveSequenceRuntime.run({ nums: `[${JAVA_INT_MAX}]` }).ok,
    ).toBe(false);
  });

  it("matches an independent sorted unique-run oracle for bounded arrays", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: JAVA_INT_MIN + 1, max: JAVA_INT_MAX - 1 }), {
          maxLength: 40,
        }),
        (nums) => {
          const before = [...nums];
          const first = longestConsecutiveSequenceRuntime.run({
            nums: JSON.stringify(nums),
          });
          const second = longestConsecutiveSequenceRuntime.run({
            nums: JSON.stringify(nums),
          });

          expect(first).toEqual(second);
          expect(nums).toEqual(before);
          expect(first.ok).toBe(true);
          if (!first.ok) return;

          expect(first.value.output).toBe(sortedUniqueRunOracle(nums));
          expect(first.value.frames.length).toBeLessThanOrEqual(500);
          expect(JSON.parse(JSON.stringify(first.value))).toEqual(first.value);
        },
      ),
      { numRuns: 100 },
    );
  });
});
