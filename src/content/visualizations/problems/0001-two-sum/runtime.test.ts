import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { twoSumDefinition } from "@/content/visualizations/problems/0001-two-sum/definition";
import { twoSumRuntime } from "@/content/visualizations/problems/0001-two-sum/runtime";
import { validateTraceDefinition } from "@/lib/visualizer";

function bruteForcePair(
  nums: readonly number[],
  target: number,
): [number, number] {
  for (let left = 0; left < nums.length; left += 1) {
    for (let right = left + 1; right < nums.length; right += 1) {
      if (nums[left] + nums[right] === target) return [left, right];
    }
  }
  throw new Error("Test generator produced an input without a solution.");
}

function pairCount(nums: readonly number[], target: number): number {
  let count = 0;
  for (let left = 0; left < nums.length; left += 1) {
    for (let right = left + 1; right < nums.length; right += 1) {
      if (nums[left] + nums[right] === target) count += 1;
    }
  }
  return count;
}

const validTwoSumCase = fc
  .uniqueArray(fc.integer({ min: -1_000, max: 1_000 }), {
    minLength: 2,
    maxLength: 12,
  })
  .chain((nums) =>
    fc.integer({ min: 0, max: nums.length - 2 }).chain((left) =>
      fc.integer({ min: left + 1, max: nums.length - 1 }).map((right) => ({
        nums,
        target: nums[left] + nums[right],
      })),
    ),
  )
  .filter(({ nums, target }) => pairCount(nums, target) === 1);

describe("LC 1 Two Sum trace runtime", () => {
  it("has a valid definition and valid independently authored presets", () => {
    expect(() => validateTraceDefinition(twoSumDefinition)).not.toThrow();

    for (const preset of twoSumDefinition.presets) {
      const result = twoSumRuntime.run(preset.values);
      expect(result.ok, preset.id).toBe(true);
      if (!result.ok) continue;

      const nums = JSON.parse(preset.values.nums) as number[];
      expect(result.value.output).toEqual(
        bruteForcePair(nums, Number(preset.values.target)),
      );
      expect(result.value.frames.some((frame) => frame.checkpoint)).toBe(true);
      expect(result.value.frames.at(-1)).toMatchObject({
        complete: true,
        output: result.value.output,
      });
    }
  });

  it("rejects inputs without exactly one pair and preserves field attribution", () => {
    const noPair = twoSumRuntime.run({ nums: "[1, 2, 3]", target: "99" });
    const severalPairs = twoSumRuntime.run({
      nums: "[1, 2, 3, 4]",
      target: "5",
    });

    expect(noPair).toMatchObject({ ok: false, issues: [{ field: "nums" }] });
    expect(severalPairs).toMatchObject({
      ok: false,
      issues: [{ field: "nums" }],
    });
  });

  it("keeps the input causal and explains the complement lookup", () => {
    const result = twoSumRuntime.run({ nums: "[2, 7, 11, 15]", target: "9" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(
      result.value.frames.every((frame) => frame.focusSceneId === "numbers"),
    ).toBe(true);
    const match = result.value.frames.find((frame) => frame.id === "inspect-1");
    const numbers = match?.scenes.find((scene) => scene.id === "numbers");
    const lookup = match?.scenes.find((scene) => scene.id === "lookup");

    expect(numbers?.description).toContain("found earlier at index 0");
    expect(lookup?.description).toContain("found at index 0");
  });

  it("matches a brute-force oracle for bounded valid arrays", () => {
    fc.assert(
      fc.property(validTwoSumCase, ({ nums, target }) => {
        const raw = { nums: JSON.stringify(nums), target: String(target) };
        const first = twoSumRuntime.run(raw);
        const second = twoSumRuntime.run(raw);

        expect(first).toEqual(second);
        expect(first.ok).toBe(true);
        if (!first.ok) return;

        expect(first.value.output).toEqual(bruteForcePair(nums, target));
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
