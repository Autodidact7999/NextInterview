import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { mergeTwoSortedListsDefinition } from "@/content/visualizations/problems/0021-merge-two-sorted-lists/definition";
import { mergeTwoSortedListsRuntime } from "@/content/visualizations/problems/0021-merge-two-sorted-lists/runtime";
import { validateTraceDefinition } from "@/lib/visualizer";

function sortedConcatenation(
  list1: readonly number[],
  list2: readonly number[],
): number[] {
  return [...list1, ...list2].sort((left, right) => left - right);
}

function frequencies(values: readonly number[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

const sortedListPair = fc
  .tuple(
    fc.array(fc.integer({ min: -500, max: 500 }), { maxLength: 15 }),
    fc.array(fc.integer({ min: -500, max: 500 }), { maxLength: 15 }),
  )
  .map(([list1, list2]) => ({
    list1: [...list1].sort((left, right) => left - right),
    list2: [...list2].sort((left, right) => left - right),
  }));

describe("LC 21 Merge Two Sorted Lists trace runtime", () => {
  it("has a valid definition and valid independently authored presets", () => {
    expect(() =>
      validateTraceDefinition(mergeTwoSortedListsDefinition),
    ).not.toThrow();

    for (const preset of mergeTwoSortedListsDefinition.presets) {
      const result = mergeTwoSortedListsRuntime.run(preset.values);
      expect(result.ok, preset.id).toBe(true);
      if (!result.ok) continue;

      const list1 = JSON.parse(preset.values.list1) as number[];
      const list2 = JSON.parse(preset.values.list2) as number[];
      expect(result.value.output).toEqual(sortedConcatenation(list1, list2));
      expect(result.value.frames.some((frame) => frame.checkpoint)).toBe(true);
      expect(result.value.frames.at(-1)).toMatchObject({
        complete: true,
        output: result.value.output,
      });
    }
  });

  it("rejects unsorted lists, per-list overflow, and combined overflow", () => {
    expect(
      mergeTwoSortedListsRuntime.run({ list1: "[2, 1]", list2: "[]" }),
    ).toMatchObject({ ok: false, issues: [{ field: "list1" }] });

    const twentyOne = Array.from({ length: 21 }, (_, index) => index);
    expect(
      mergeTwoSortedListsRuntime.run({
        list1: JSON.stringify(twentyOne),
        list2: "[]",
      }),
    ).toMatchObject({ ok: false, issues: [{ field: "list1" }] });

    const sixteen = Array.from({ length: 16 }, (_, index) => index);
    expect(
      mergeTwoSortedListsRuntime.run({
        list1: JSON.stringify(sixteen),
        list2: JSON.stringify(sixteen),
      }),
    ).toMatchObject({ ok: false });
  });

  it("rewires the original source node identities in one focused scene", () => {
    const result = mergeTwoSortedListsRuntime.run({
      list1: "[1, 2, 4]",
      list2: "[1, 3, 4]",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(
      result.value.frames.every((frame) => frame.scenes.length === 1),
    ).toBe(true);
    expect(
      result.value.frames.every(
        (frame) => frame.focusSceneId === "merge-state",
      ),
    ).toBe(true);

    const scene = result.value.frames.at(-1)?.scenes[0];
    expect(scene?.kind).toBe("linked-list");
    if (scene?.kind !== "linked-list") return;
    expect(scene.nodes.map((node) => node.id)).toEqual([
      "left-0",
      "left-1",
      "left-2",
      "right-0",
      "right-1",
      "right-2",
    ]);
    expect(scene.nodes.some((node) => node.id.startsWith("merged-"))).toBe(
      false,
    );

    const byId = new Map(scene.nodes.map((node) => [node.id, node]));
    const values: number[] = [];
    const seen = new Set<string>();
    let id = scene.headId;
    while (id !== null) {
      expect(seen.has(id)).toBe(false);
      seen.add(id);
      const node = byId.get(id);
      expect(node).toBeDefined();
      if (!node || typeof node.value !== "number") break;
      values.push(node.value);
      id = node.nextId;
    }
    expect(values).toEqual([1, 1, 2, 3, 4, 4]);
    expect(seen.size).toBe(scene.nodes.length);
  });

  it("matches sorted concatenation and preserves every input count", () => {
    fc.assert(
      fc.property(sortedListPair, ({ list1, list2 }) => {
        const raw = {
          list1: JSON.stringify(list1),
          list2: JSON.stringify(list2),
        };
        const first = mergeTwoSortedListsRuntime.run(raw);
        const second = mergeTwoSortedListsRuntime.run(raw);

        expect(first).toEqual(second);
        expect(first.ok).toBe(true);
        if (!first.ok) return;

        const output = first.value.output as readonly number[];
        expect(output).toEqual(sortedConcatenation(list1, list2));
        expect(frequencies(output)).toEqual(frequencies([...list1, ...list2]));
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
