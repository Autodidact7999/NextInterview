import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { binarySearchDefinition } from "@/content/visualizations/problems/0704-binary-search/definition";
import { binarySearchRuntime } from "@/content/visualizations/problems/0704-binary-search/runtime";
import { validateTraceDefinition } from "@/lib/visualizer";

const sortedDistinctIntegers = fc
  .uniqueArray(fc.integer({ min: -100_000, max: 100_000 }), {
    minLength: 0,
    maxLength: 40,
  })
  .map((nums) => nums.sort((left, right) => left - right));

describe("LC 704 Binary Search trace runtime", () => {
  it("has a valid definition and independently authored presets", () => {
    expect(() => validateTraceDefinition(binarySearchDefinition)).not.toThrow();

    for (const preset of binarySearchDefinition.presets) {
      const result = binarySearchRuntime.run(preset.values);
      expect(result.ok, preset.id).toBe(true);
      if (!result.ok) continue;

      const nums = JSON.parse(preset.values.nums) as number[];
      expect(result.value.output).toBe(
        nums.indexOf(Number(preset.values.target)),
      );
      expect(result.value.frames.some((frame) => frame.checkpoint)).toBe(true);
      expect(result.value.frames.at(-1)).toMatchObject({
        complete: true,
        output: result.value.output,
      });
    }
  });

  it("rejects arrays that are not strictly increasing", () => {
    const unsorted = binarySearchRuntime.run({
      nums: "[1, 4, 3, 8]",
      target: "3",
    });
    const duplicate = binarySearchRuntime.run({
      nums: "[1, 3, 3, 8]",
      target: "3",
    });

    expect(unsorted).toMatchObject({
      ok: false,
      issues: [{ field: "nums" }],
    });
    expect(duplicate).toMatchObject({
      ok: false,
      issues: [{ field: "nums" }],
    });
  });

  it("enforces the Java-int and array-size boundaries", () => {
    const tooMany = Array.from({ length: 41 }, (_, index) => index);

    expect(
      binarySearchRuntime.run({
        nums: JSON.stringify(tooMany),
        target: "4",
      }),
    ).toMatchObject({ ok: false, issues: [{ field: "nums" }] });
    expect(
      binarySearchRuntime.run({ nums: "[1, 2, 3]", target: "2147483648" }),
    ).toMatchObject({ ok: false, issues: [{ field: "target" }] });
  });

  it("renders every interval as the focused ordered scene", () => {
    const result = binarySearchRuntime.run({
      nums: "[-5,-1,3,8,13]",
      target: "8",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(
      result.value.frames.every(
        (frame) => frame.focusSceneId === "search-interval",
      ),
    ).toBe(true);
    expect(
      result.value.frames.every((frame) => {
        const scene = frame.scenes.find(
          (candidate) => candidate.id === "search-interval",
        );
        return scene?.kind === "bar-range" && scene.presentation === "ordered";
      }),
    ).toBe(true);
  });

  it("matches linear indexOf for bounded sorted inputs", () => {
    fc.assert(
      fc.property(
        sortedDistinctIntegers,
        fc.integer({ min: -100_001, max: 100_001 }),
        (nums, target) => {
          const raw = { nums: JSON.stringify(nums), target: String(target) };
          const first = binarySearchRuntime.run(raw);
          const second = binarySearchRuntime.run(raw);

          expect(first).toEqual(second);
          expect(first.ok).toBe(true);
          if (!first.ok) return;

          expect(first.value.output).toBe(nums.indexOf(target));
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
