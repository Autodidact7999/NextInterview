import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { reverseLinkedListDefinition } from "@/content/visualizations/problems/0206-reverse-linked-list/definition";
import { reverseLinkedListRuntime } from "@/content/visualizations/problems/0206-reverse-linked-list/runtime";
import { validateTraceDefinition } from "@/lib/visualizer/validate";

function expectSuccessfulRun(values: readonly number[]) {
  const result = reverseLinkedListRuntime.run({
    values: JSON.stringify(values),
  });
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error(result.issues.map((issue) => issue.message).join(", "));
  }
  return result.value;
}

function followOutputLinks(
  run: ReturnType<typeof expectSuccessfulRun>,
): number[] {
  const scene = run.frames.at(-1)?.scenes[0];
  if (!scene || scene.kind !== "linked-list") {
    throw new Error("Expected a linked-list scene in the terminal frame.");
  }

  const byId = new Map(scene.nodes.map((node) => [node.id, node]));
  const result: number[] = [];
  const visited = new Set<string>();
  let currentId = scene.headId;
  while (currentId !== null) {
    expect(visited.has(currentId)).toBe(false);
    visited.add(currentId);
    const node = byId.get(currentId);
    if (!node || typeof node.value !== "number") {
      throw new Error(`Missing numeric node ${currentId}.`);
    }
    result.push(node.value);
    currentId = node.nextId;
  }
  expect(visited.size).toBe(scene.nodes.length);
  return result;
}

describe("LC 206 Reverse Linked List trace", () => {
  it("has valid metadata and deterministic, JSON-safe presets", () => {
    expect(() =>
      validateTraceDefinition(reverseLinkedListDefinition),
    ).not.toThrow();

    for (const preset of reverseLinkedListDefinition.presets) {
      const first = reverseLinkedListRuntime.run(preset.values);
      const second = reverseLinkedListRuntime.run(preset.values);
      expect(first).toEqual(second);
      expect(first.ok).toBe(true);
      if (!first.ok) continue;

      const values = JSON.parse(preset.values.values) as number[];
      expect(first.value.output).toEqual([...values].reverse());
      expect(first.value.frames.filter((frame) => frame.complete)).toHaveLength(
        1,
      );
      expect(first.value.frames.at(-1)?.complete).toBe(true);
      expect(first.value.frames.some((frame) => frame.checkpoint)).toBe(true);
      expect(followOutputLinks(first.value)).toEqual([...values].reverse());
      expect(JSON.parse(JSON.stringify(first.value))).toEqual(first.value);
    }
  });

  it("shows the saved suffix before replacing the current next edge", () => {
    const run = expectSuccessfulRun([10, 20, 30]);
    const saved = run.frames.find((frame) => frame.id === "save-next-0");
    const rewired = run.frames.find((frame) => frame.id === "reverse-edge-0");

    expect(saved?.checkpoint?.answerId).toBe("previous");
    expect(saved?.scenes[0]?.kind).toBe("linked-list");
    expect(rewired?.scenes[0]?.kind).toBe("linked-list");
    if (
      saved?.scenes[0]?.kind !== "linked-list" ||
      rewired?.scenes[0]?.kind !== "linked-list"
    ) {
      throw new Error("Expected linked-list frames.");
    }
    expect(
      saved.scenes[0].nodes.find((node) => node.id === "node-0")?.nextId,
    ).toBe("node-1");
    expect(
      rewired.scenes[0].nodes.find((node) => node.id === "node-0")?.nextId,
    ).toBeNull();
    expect(
      rewired.scenes[0].pointers?.find(
        (pointer) => pointer.id === "next-pointer",
      )?.nodeId,
    ).toBe("node-1");
  });

  it("focuses the list and accepts the complete output chain", () => {
    const run = expectSuccessfulRun([10, 20, 30]);
    const terminalScene = run.frames.at(-1)?.scenes[0];

    expect(
      run.frames.every((frame) => frame.focusSceneId === "pointer-state"),
    ).toBe(true);
    expect(terminalScene?.kind).toBe("linked-list");
    if (terminalScene?.kind !== "linked-list") return;
    expect(terminalScene.nodes).toHaveLength(3);
    expect(terminalScene.nodes.every((node) => node.role === "accepted")).toBe(
      true,
    );
  });

  it("handles empty and single-node lists", () => {
    const empty = expectSuccessfulRun([]);
    expect(empty.output).toEqual([]);
    expect(empty.frames).toHaveLength(2);
    expect(empty.frames[0]?.checkpoint?.answerId).toBe("skip");

    const single = expectSuccessfulRun([7]);
    expect(single.output).toEqual([7]);
    expect(followOutputLinks(single)).toEqual([7]);
  });

  it("rejects malformed, fractional, out-of-range, and oversized inputs", () => {
    expect(reverseLinkedListRuntime.run({ values: "[1, nope]" }).ok).toBe(
      false,
    );
    expect(reverseLinkedListRuntime.run({ values: "[1, 1.5]" }).ok).toBe(false);
    expect(reverseLinkedListRuntime.run({ values: "[2147483648]" }).ok).toBe(
      false,
    );
    expect(
      reverseLinkedListRuntime.run({
        values: JSON.stringify(Array.from({ length: 26 }, (_, index) => index)),
      }).ok,
    ).toBe(false);
  });

  it("matches array reversal across 100 bounded cases", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: -2_147_483_648, max: 2_147_483_647 }), {
          maxLength: 25,
        }),
        (values) => {
          const run = expectSuccessfulRun(values);
          const reversed = [...values].reverse();
          expect(run.output).toEqual(reversed);
          expect(followOutputLinks(run)).toEqual(reversed);
          expect([...reversed].reverse()).toEqual(values);
          expect(run.frames.length).toBeLessThanOrEqual(500);
          expect(JSON.parse(JSON.stringify(run))).toEqual(run);
        },
      ),
      { numRuns: 100 },
    );
  });
});
