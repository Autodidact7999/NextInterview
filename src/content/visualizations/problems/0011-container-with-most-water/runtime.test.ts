import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { containerWithMostWaterDefinition } from "@/content/visualizations/problems/0011-container-with-most-water/definition";
import { containerWithMostWaterRuntime } from "@/content/visualizations/problems/0011-container-with-most-water/runtime";
import { validateTraceDefinition } from "@/lib/visualizer";

function bruteForceMaximumArea(heights: readonly number[]): number {
  let maximum = 0;
  for (let left = 0; left < heights.length - 1; left += 1) {
    for (let right = left + 1; right < heights.length; right += 1) {
      maximum = Math.max(
        maximum,
        Math.min(heights[left], heights[right]) * (right - left),
      );
    }
  }
  return maximum;
}

describe("LC 11 Container With Most Water trace runtime", () => {
  it("has a valid definition and independently authored presets", () => {
    expect(() =>
      validateTraceDefinition(containerWithMostWaterDefinition),
    ).not.toThrow();

    for (const preset of containerWithMostWaterDefinition.presets) {
      const result = containerWithMostWaterRuntime.run(preset.values);
      expect(result.ok, preset.id).toBe(true);
      if (!result.ok) continue;

      const heights = JSON.parse(preset.values.heights) as number[];
      expect(result.value.output).toBe(bruteForceMaximumArea(heights));
      expect(result.value.frames.some((frame) => frame.checkpoint)).toBe(true);
      expect(result.value.frames.at(-1)).toMatchObject({
        complete: true,
        output: result.value.output,
      });
    }
  });

  it("attributes invalid lengths and heights to the heights field", () => {
    const tooShort = containerWithMostWaterRuntime.run({ heights: "[4]" });
    const negative = containerWithMostWaterRuntime.run({ heights: "[3, -1]" });
    const tooTall = containerWithMostWaterRuntime.run({
      heights: "[3, 10001]",
    });

    expect(tooShort).toMatchObject({
      ok: false,
      issues: [{ field: "heights" }],
    });
    expect(negative).toMatchObject({
      ok: false,
      issues: [{ field: "heights" }],
    });
    expect(tooTall).toMatchObject({
      ok: false,
      issues: [{ field: "heights" }],
    });
  });

  it("keeps the current container distinct from the best measured pair", () => {
    const result = containerWithMostWaterRuntime.run({
      heights: "[1,8,6,2,5,4,8,3,7]",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(
      result.value.frames.every((frame) => frame.focusSceneId === "container"),
    ).toBe(true);
    const measure = result.value.frames.find(
      (frame) => frame.id === "measure-2",
    );
    const scene = measure?.scenes[0];
    expect(scene?.kind).toBe("bar-range");
    if (scene?.kind !== "bar-range") return;

    expect(scene.presentation).toBe("container");
    expect(scene.range?.label).toContain("Current area");
    expect(scene.range?.label).toContain("best 49");
    expect(scene.markers?.map((marker) => marker.id)).toEqual([
      "current-left",
      "current-right",
      "best-left",
      "best-right",
    ]);
    expect(scene.bars[7]?.role).toBe("candidate");
    expect(scene.bars[8]?.role).toBe("accepted");
  });

  it("matches an all-pairs oracle for bounded height arrays", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 10_000 }), {
          minLength: 2,
          maxLength: 30,
        }),
        (heights) => {
          const raw = { heights: JSON.stringify(heights) };
          const first = containerWithMostWaterRuntime.run(raw);
          const second = containerWithMostWaterRuntime.run(raw);

          expect(first).toEqual(second);
          expect(first.ok).toBe(true);
          if (!first.ok) return;

          expect(first.value.output).toBe(bruteForceMaximumArea(heights));
          expect(JSON.parse(JSON.stringify(first.value))).toEqual(first.value);
          expect(first.value.frames.length).toBeLessThanOrEqual(500);
          expect(
            first.value.frames.filter((frame) => frame.complete),
          ).toHaveLength(1);
        },
      ),
      { numRuns: 100 },
    );
  });
});
