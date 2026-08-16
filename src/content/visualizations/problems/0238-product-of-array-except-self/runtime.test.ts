import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { productExceptSelfDefinition } from "@/content/visualizations/problems/0238-product-of-array-except-self/definition";
import { productExceptSelfRuntime } from "@/content/visualizations/problems/0238-product-of-array-except-self/runtime";
import { validateTraceDefinition } from "@/lib/visualizer";

function bruteProducts(nums: readonly number[]): number[] {
  return nums.map((_, omitted) => {
    let product = BigInt(1);
    for (let index = 0; index < nums.length; index += 1) {
      if (index !== omitted) product *= BigInt(nums[index]);
    }
    return Number(product);
  });
}

const boundedSafeArray = fc.array(fc.integer({ min: -4, max: 4 }), {
  minLength: 2,
  maxLength: 10,
});

describe("LC 238 Product of Array Except Self trace", () => {
  it("has valid metadata and independently authored presets", () => {
    expect(() =>
      validateTraceDefinition(productExceptSelfDefinition),
    ).not.toThrow();

    for (const preset of productExceptSelfDefinition.presets) {
      const result = productExceptSelfRuntime.run(preset.values);
      expect(result.ok, preset.id).toBe(true);
      if (!result.ok) continue;

      const nums = JSON.parse(preset.values.nums) as number[];
      expect(result.value.output).toEqual(bruteProducts(nums));
      expect(result.value.frames.some((frame) => frame.checkpoint)).toBe(true);
      expect(
        result.value.frames.filter((frame) => frame.complete),
      ).toHaveLength(1);
      expect(result.value.frames.at(-1)).toMatchObject({
        complete: true,
        output: result.value.output,
      });
    }
  });

  it("rejects out-of-range values and mathematically unsafe Java-int outputs", () => {
    expect(productExceptSelfRuntime.run({ nums: "[1, 11]" })).toMatchObject({
      ok: false,
      issues: [{ field: "nums" }],
    });
    expect(
      productExceptSelfRuntime.run({
        nums: "[10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]",
      }),
    ).toMatchObject({ ok: false, issues: [{ field: "nums" }] });
  });

  it("accepts a two-zero case even when an unused intermediate Java product can wrap", () => {
    const nums = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 0, 0];
    const result = productExceptSelfRuntime.run({ nums: JSON.stringify(nums) });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.output).toEqual(new Array(nums.length).fill(0));
  });

  it("separates input reads from result writes and uses one suffix frame per index", () => {
    const result = productExceptSelfRuntime.run({ nums: "[1,2,3,4]" });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const prefix = result.value.frames.find((frame) => frame.id === "prefix-1");
    const prefixInput = prefix?.scenes.find(
      (scene) => scene.id === "input-array",
    );
    const prefixResult = prefix?.scenes.find(
      (scene) => scene.id === "result-array",
    );
    expect(prefixInput?.kind).toBe("sequence");
    expect(prefixResult?.kind).toBe("sequence");
    if (prefixInput?.kind !== "sequence" || prefixResult?.kind !== "sequence")
      return;

    expect(prefixInput.pointers?.[0]).toMatchObject({
      index: 0,
      label: "read nums[i−1]",
    });
    expect(prefixResult.pointers?.[0]).toMatchObject({
      index: 1,
      label: "write res[i]",
    });

    expect(
      result.value.frames.filter((frame) => frame.id.startsWith("suffix-")),
    ).toHaveLength(4);
    expect(
      result.value.frames.some((frame) => frame.id.startsWith("extend-right-")),
    ).toBe(false);
    expect(
      result.value.frames
        .filter((frame) => frame.id.startsWith("suffix-"))
        .every((frame) => frame.focusSceneId === "result-array"),
    ).toBe(true);
  });

  it("matches an independent BigInt brute-force oracle on bounded arrays", () => {
    fc.assert(
      fc.property(boundedSafeArray, (nums) => {
        const raw = { nums: JSON.stringify(nums) };
        const first = productExceptSelfRuntime.run(raw);
        const second = productExceptSelfRuntime.run(raw);

        expect(first).toEqual(second);
        expect(first.ok).toBe(true);
        if (!first.ok) return;

        expect(first.value.output).toEqual(bruteProducts(nums));
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
