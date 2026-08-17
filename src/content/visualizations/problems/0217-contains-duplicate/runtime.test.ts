import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { containsDuplicateDefinition } from "@/content/visualizations/problems/0217-contains-duplicate/definition";
import { containsDuplicateRuntime } from "@/content/visualizations/problems/0217-contains-duplicate/runtime";
import { validateTraceDefinition } from "@/lib/visualizer/validate";

function pairwiseDuplicate(nums: readonly number[]): boolean {
  for (let left = 0; left < nums.length; left += 1) {
    for (let right = left + 1; right < nums.length; right += 1) {
      if (nums[left] === nums[right]) return true;
    }
  }
  return false;
}

function expectSuccessfulRun(nums: readonly number[]) {
  const result = containsDuplicateRuntime.run({ nums: JSON.stringify(nums) });
  expect(result.ok).toBe(true);
  if (!result.ok)
    throw new Error(result.issues.map((issue) => issue.message).join(", "));
  return result.value;
}

describe("LC 217 Contains Duplicate trace", () => {
  it("has valid metadata and valid, deterministic presets", () => {
    expect(() =>
      validateTraceDefinition(containsDuplicateDefinition),
    ).not.toThrow();

    for (const preset of containsDuplicateDefinition.presets) {
      const first = containsDuplicateRuntime.run(preset.values);
      const second = containsDuplicateRuntime.run(preset.values);
      expect(first).toEqual(second);
      expect(first.ok).toBe(true);
      if (!first.ok) continue;

      const nums = JSON.parse(preset.values.nums) as number[];
      expect(first.value.output).toBe(pairwiseDuplicate(nums));
      expect(first.value.frames.filter((frame) => frame.complete)).toHaveLength(
        1,
      );
      expect(first.value.frames.at(-1)?.complete).toBe(true);
      expect(first.value.frames.some((frame) => frame.checkpoint)).toBe(true);
      expect(JSON.parse(JSON.stringify(first.value))).toEqual(first.value);
    }
  });

  it("returns immediately when HashSet.add encounters the first duplicate", () => {
    const run = expectSuccessfulRun([5, 1, 5, 5]);

    expect(run.output).toBe(true);
    expect(run.frames.at(-1)?.id).toBe("complete-duplicate-2");
    expect(run.frames.some((frame) => frame.id === "inspect-3")).toBe(false);

    const complete = run.frames.at(-1);
    const input = complete?.scenes.find((scene) => scene.id === "input-array");
    expect(complete?.focusSceneId).toBe("input-array");
    expect(input?.kind).toBe("sequence");
    if (input?.kind !== "sequence") return;
    expect(input.items[0]).toMatchObject({
      role: "candidate",
      note: "first occurrence",
    });
    expect(input.items[2]).toMatchObject({
      role: "rejected",
      note: "duplicate here",
    });
  });

  it("rejects malformed, non-integer, and oversized inputs", () => {
    expect(containsDuplicateRuntime.run({ nums: "not-json" }).ok).toBe(false);
    expect(containsDuplicateRuntime.run({ nums: "[1, 1.5]" }).ok).toBe(false);
    expect(
      containsDuplicateRuntime.run({
        nums: JSON.stringify(Array.from({ length: 41 }, (_, index) => index)),
      }).ok,
    ).toBe(false);
  });

  it("matches an independent pairwise oracle for bounded arrays", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: -2_147_483_648, max: 2_147_483_647 }), {
          maxLength: 40,
        }),
        (nums) => {
          const run = expectSuccessfulRun(nums);
          expect(run.output).toBe(pairwiseDuplicate(nums));
          expect(run.frames.length).toBeLessThanOrEqual(500);
          expect(JSON.parse(JSON.stringify(run))).toEqual(run);
        },
      ),
      { numRuns: 100 },
    );
  });
});
