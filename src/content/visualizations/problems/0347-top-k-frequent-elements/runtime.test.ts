import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { topKFrequentElementsDefinition } from "@/content/visualizations/problems/0347-top-k-frequent-elements/definition";
import { topKFrequentElementsRuntime } from "@/content/visualizations/problems/0347-top-k-frequent-elements/runtime";
import { validateTraceDefinition } from "@/lib/visualizer";

function referenceTopK(nums: readonly number[], k: number): number[] {
  const counts = new Map<number, number>();
  for (const value of nums) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort(
      ([leftValue, leftCount], [rightValue, rightCount]) =>
        rightCount - leftCount || leftValue - rightValue,
    )
    .slice(0, k)
    .map(([value]) => value);
}

function sorted(values: readonly number[]): number[] {
  return [...values].sort((left, right) => left - right);
}

const validTopKCase = fc
  .array(fc.integer({ min: -12, max: 12 }), {
    minLength: 1,
    maxLength: 30,
  })
  .chain((nums) => {
    const counts = new Map<number, number>();
    for (const value of nums) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    const frequencies = Array.from(counts.values()).sort(
      (left, right) => right - left,
    );
    const validK = frequencies.flatMap((frequency, index) =>
      index === frequencies.length - 1 ||
      frequency > (frequencies[index + 1] ?? 0)
        ? [index + 1]
        : [],
    );
    return fc
      .integer({ min: 0, max: validK.length - 1 })
      .map((index) => ({ nums, k: validK[index] as number }));
  });

describe("LC 347 Top K Frequent Elements trace runtime", () => {
  it("has a valid definition and valid independently authored presets", () => {
    expect(() =>
      validateTraceDefinition(topKFrequentElementsDefinition),
    ).not.toThrow();

    for (const preset of topKFrequentElementsDefinition.presets) {
      const result = topKFrequentElementsRuntime.run(preset.values);
      expect(result.ok, preset.id).toBe(true);
      if (!result.ok) continue;

      const nums = JSON.parse(preset.values.nums) as number[];
      expect(sorted(result.value.output as readonly number[])).toEqual(
        sorted(referenceTopK(nums, Number(preset.values.k))),
      );
      expect(result.value.frames.some((frame) => frame.checkpoint)).toBe(true);
      expect(result.value.frames.at(-1)).toMatchObject({
        complete: true,
        output: result.value.output,
      });
    }
  });

  it("rejects invalid k values, tied cutoffs, and input bounds", () => {
    expect(
      topKFrequentElementsRuntime.run({ nums: "[]", k: "1" }),
    ).toMatchObject({ ok: false, issues: [{ field: "nums" }] });
    expect(
      topKFrequentElementsRuntime.run({ nums: "[1, 1, 2]", k: "0" }),
    ).toMatchObject({ ok: false, issues: [{ field: "k" }] });
    expect(
      topKFrequentElementsRuntime.run({ nums: "[1, 1, 2]", k: "3" }),
    ).toMatchObject({ ok: false, issues: [{ field: "k" }] });
    expect(
      topKFrequentElementsRuntime.run({
        nums: "[1, 1, 2, 2, 3]",
        k: "1",
      }),
    ).toMatchObject({ ok: false, issues: [{ field: "k" }] });
  });

  it("moves focus from counting to the heap and labels value-frequency nodes", () => {
    const result = topKFrequentElementsRuntime.run({
      nums: "[1, 1, 1, 2, 2, 3]",
      k: "2",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const countFrame = result.value.frames.find((frame) =>
      frame.id.startsWith("count-"),
    );
    const offerFrame = result.value.frames.find((frame) =>
      frame.id.startsWith("offer-"),
    );
    const heap = offerFrame?.scenes.find((scene) => scene.id === "min-heap");
    expect(countFrame?.focusSceneId).toBe("frequencies");
    expect(offerFrame?.focusSceneId).toBe("min-heap");
    expect(heap?.kind).toBe("tree");
    if (heap?.kind !== "tree") return;
    expect(heap.nodes[0]?.badge).toMatch(/-?\d+ × \d+/);
    expect(heap.nodes[0]?.note).toContain("next to evict");
  });

  it("matches an independent full-sort oracle on bounded valid cases", () => {
    fc.assert(
      fc.property(validTopKCase, ({ nums, k }) => {
        const raw = { nums: JSON.stringify(nums), k: String(k) };
        const first = topKFrequentElementsRuntime.run(raw);
        const second = topKFrequentElementsRuntime.run(raw);

        expect(first).toEqual(second);
        expect(first.ok).toBe(true);
        if (!first.ok) return;

        expect(sorted(first.value.output as readonly number[])).toEqual(
          sorted(referenceTopK(nums, k)),
        );
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
