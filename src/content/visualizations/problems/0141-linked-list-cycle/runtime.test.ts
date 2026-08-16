import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { linkedListCycleDefinition } from "@/content/visualizations/problems/0141-linked-list-cycle/definition";
import { linkedListCycleRuntime } from "@/content/visualizations/problems/0141-linked-list-cycle/runtime";
import { validateTraceDefinition } from "@/lib/visualizer";

function visitedNodeOracle(values: readonly number[], pos: number): boolean {
  const visited = new Set<number>();
  let current: number | null = values.length > 0 ? 0 : null;

  while (current !== null) {
    if (visited.has(current)) return true;
    visited.add(current);
    current = current + 1 < values.length ? current + 1 : pos >= 0 ? pos : null;
  }

  return false;
}

function expectSuccessfulRun(values: readonly number[], pos: number) {
  const result = linkedListCycleRuntime.run({
    values: JSON.stringify(values),
    pos: String(pos),
  });
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error(result.issues.map((issue) => issue.message).join(", "));
  }
  return result.value;
}

describe("LC 141 Linked List Cycle trace", () => {
  it("has valid metadata and deterministic, JSON-safe presets", () => {
    expect(() =>
      validateTraceDefinition(linkedListCycleDefinition),
    ).not.toThrow();

    for (const preset of linkedListCycleDefinition.presets) {
      const first = linkedListCycleRuntime.run(preset.values);
      const second = linkedListCycleRuntime.run(preset.values);

      expect(first).toEqual(second);
      expect(first.ok, preset.id).toBe(true);
      if (!first.ok) continue;

      const values = JSON.parse(preset.values.values) as number[];
      const pos = Number(preset.values.pos);
      expect(first.value.output).toBe(visitedNodeOracle(values, pos));
      expect(first.value.frames.filter((frame) => frame.complete)).toHaveLength(
        1,
      );
      expect(first.value.frames.at(-1)?.complete).toBe(true);
      expect(first.value.frames.some((frame) => frame.checkpoint)).toBe(true);
      expect(first.value.frames.length).toBeLessThanOrEqual(500);
      expect(JSON.parse(JSON.stringify(first.value))).toEqual(first.value);
    }
  });

  it("shows a back edge and completes when the pointers meet", () => {
    const run = expectSuccessfulRun([3, 2, 0, -4], 1);
    const terminal = run.frames.at(-1);
    const scene = terminal?.scenes[0];

    expect(run.output).toBe(true);
    expect(terminal?.codeRefs).toContain("compare-pointers");
    expect(scene?.kind).toBe("linked-list");
    if (scene?.kind !== "linked-list") return;
    expect(scene.cycleToId).toBe("node-1");
    expect(scene.nodes.at(-1)?.nextId).toBe("node-1");
    expect(scene.pointers?.[0]?.nodeId).toBe(scene.pointers?.[1]?.nodeId);
  });

  it("does not treat the untested starting overlap as a detected cycle", () => {
    const run = expectSuccessfulRun([3, 2, 0, -4], 1);
    const initial = run.frames[0];
    const initialScene = initial?.scenes[0];

    expect(initial?.focusSceneId).toBe("linked-list");
    expect(initialScene?.kind).toBe("linked-list");
    if (initialScene?.kind !== "linked-list") return;
    expect(initialScene.nodes[0]?.role).toBe("current");
    expect(initialScene.nodes[0]?.role).not.toBe("accepted");
    expect(run.frames.some((frame) => frame.phase === "Check guard")).toBe(
      false,
    );
    expect(
      run.frames.every((frame) => frame.focusSceneId === "linked-list"),
    ).toBe(true);
  });

  it("handles the empty no-cycle edge case before any advance", () => {
    const run = expectSuccessfulRun([], -1);
    const initialScene = run.frames[0]?.scenes[0];

    expect(run.output).toBe(false);
    expect(run.frames).toHaveLength(2);
    expect(run.frames[0]?.checkpoint?.answerId).toBe("stop");
    expect(initialScene?.kind).toBe("linked-list");
    if (initialScene?.kind !== "linked-list") return;
    expect(initialScene.headId).toBeNull();
    expect(initialScene.nodes).toHaveLength(0);
  });

  it("rejects malformed values and invalid cycle positions", () => {
    expect(
      linkedListCycleRuntime.run({ values: "[1, nope]", pos: "-1" }).ok,
    ).toBe(false);
    expect(
      linkedListCycleRuntime.run({ values: "[]", pos: "0" }),
    ).toMatchObject({ ok: false, issues: [{ field: "pos" }] });
    expect(
      linkedListCycleRuntime.run({ values: "[1, 2]", pos: "2" }),
    ).toMatchObject({ ok: false, issues: [{ field: "pos" }] });
    expect(
      linkedListCycleRuntime.run({
        values: JSON.stringify(Array.from({ length: 26 }, (_, index) => index)),
        pos: "-1",
      }),
    ).toMatchObject({ ok: false, issues: [{ field: "values" }] });
  });

  it("matches an independent visited-node oracle for bounded linked lists", () => {
    const linkedListInput = fc
      .array(fc.integer(), { maxLength: 25 })
      .chain((values) =>
        fc
          .integer({ min: -1, max: Math.max(-1, values.length - 1) })
          .map((pos) => ({ values, pos })),
      );

    fc.assert(
      fc.property(linkedListInput, ({ values, pos }) => {
        const before = [...values];
        const raw = { values: JSON.stringify(values), pos: String(pos) };
        const first = linkedListCycleRuntime.run(raw);
        const second = linkedListCycleRuntime.run(raw);

        expect(first).toEqual(second);
        expect(values).toEqual(before);
        expect(first.ok).toBe(true);
        if (!first.ok) return;

        expect(first.value.output).toBe(visitedNodeOracle(values, pos));
        expect(first.value.frames.length).toBeLessThanOrEqual(500);
        expect(
          first.value.frames.filter((frame) => frame.complete),
        ).toHaveLength(1);
        expect(JSON.parse(JSON.stringify(first.value))).toEqual(first.value);
      }),
      { numRuns: 100 },
    );
  });
});
