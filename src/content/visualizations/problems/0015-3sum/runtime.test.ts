import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { threeSumDefinition } from "@/content/visualizations/problems/0015-3sum/definition";
import { threeSumRuntime } from "@/content/visualizations/problems/0015-3sum/runtime";
import { validateTraceDefinition } from "@/lib/visualizer";

type Triplet = readonly [number, number, number];

function compareTriplets(left: Triplet, right: Triplet): number {
  return left[0] - right[0] || left[1] - right[1] || left[2] - right[2];
}

function bruteForceTriplets(nums: readonly number[]): Triplet[] {
  const unique = new Map<string, Triplet>();
  for (let first = 0; first < nums.length - 2; first += 1) {
    for (let second = first + 1; second < nums.length - 1; second += 1) {
      for (let third = second + 1; third < nums.length; third += 1) {
        if (nums[first]! + nums[second]! + nums[third]! !== 0) continue;
        const triplet = [nums[first]!, nums[second]!, nums[third]!].sort(
          (left, right) => left - right,
        ) as [number, number, number];
        unique.set(triplet.join(","), triplet);
      }
    }
  }
  return Array.from(unique.values()).sort(compareTriplets);
}

describe("LC 15 3Sum trace runtime", () => {
  it("has a valid definition and independently verified presets", () => {
    expect(() => validateTraceDefinition(threeSumDefinition)).not.toThrow();

    for (const preset of threeSumDefinition.presets) {
      const result = threeSumRuntime.run(preset.values);
      expect(result.ok, preset.id).toBe(true);
      if (!result.ok) continue;

      const nums = JSON.parse(preset.values.nums) as number[];
      expect(result.value.output).toEqual(bruteForceTriplets(nums));
      expect(result.value.frames.some((frame) => frame.checkpoint)).toBe(true);
      expect(result.value.frames.at(-1)).toMatchObject({
        complete: true,
        output: result.value.output,
      });
    }
  });

  it("deduplicates triplets and rejects unsafe or oversized inputs", () => {
    const duplicates = threeSumRuntime.run({ nums: "[-2, 0, 0, 2, 2]" });
    expect(duplicates.ok).toBe(true);
    if (duplicates.ok) expect(duplicates.value.output).toEqual([[-2, 0, 2]]);

    expect(threeSumRuntime.run({ nums: "[1, 2]" })).toMatchObject({
      ok: false,
      issues: [{ field: "nums" }],
    });
    const unsafe = threeSumRuntime.run({
      nums: "[715827883, 0, -715827883]",
    });
    expect(unsafe).toMatchObject({ ok: false });
    if (!unsafe.ok) {
      expect(unsafe.issues.every((issue) => issue.field === "nums")).toBe(true);
    }
    expect(
      threeSumRuntime.run({
        nums: JSON.stringify(Array.from({ length: 21 }, (_, index) => index)),
      }),
    ).toMatchObject({ ok: false, issues: [{ field: "nums" }] });
  });

  it("keeps pointer work on the array and presents structured results", () => {
    const result = threeSumRuntime.run({ nums: "[-1, 0, 1, 2, -1, -4]" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const workingFrames = result.value.frames.filter(
      (frame) => !frame.complete,
    );
    expect(
      workingFrames.every((frame) => frame.focusSceneId === "sorted-numbers"),
    ).toBe(true);
    const complete = result.value.frames.at(-1);
    const resultScene = complete?.scenes[0];
    expect(complete?.focusSceneId).toBe("result-tray");
    expect(resultScene?.kind).toBe("associative");
    if (resultScene?.kind !== "associative") return;
    expect(resultScene.entries[0]?.value).toEqual([-1, -1, 2]);
  });

  it("matches an independent triple-enumeration oracle on bounded inputs", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: -30, max: 30 }), {
          minLength: 3,
          maxLength: 20,
        }),
        (nums) => {
          const raw = { nums: JSON.stringify(nums) };
          const first = threeSumRuntime.run(raw);
          const second = threeSumRuntime.run(raw);

          expect(first).toEqual(second);
          expect(first.ok).toBe(true);
          if (!first.ok) return;

          expect(first.value.output).toEqual(bruteForceTriplets(nums));
          expect(JSON.parse(JSON.stringify(first.value))).toEqual(first.value);
          expect(first.value.frames.length).toBeLessThanOrEqual(500);
          expect(
            first.value.frames.filter((frame) => frame.complete),
          ).toHaveLength(1);
          expect(first.value.frames.some((frame) => frame.checkpoint)).toBe(
            true,
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});
