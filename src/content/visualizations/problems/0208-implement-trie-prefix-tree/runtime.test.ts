import fc from "fast-check";
import { describe, expect, it } from "vitest";

import definition from "@/content/visualizations/problems/0208-implement-trie-prefix-tree/definition";
import runtime from "@/content/visualizations/problems/0208-implement-trie-prefix-tree/runtime";
import { validateTraceDefinition } from "@/lib/visualizer/validate";

type Operation = {
  op: "insert" | "search" | "startsWith";
  word: string;
};

function setOracle(operations: readonly Operation[]): (boolean | null)[] {
  const words = new Set<string>();
  return operations.map((operation) => {
    if (operation.op === "insert") {
      words.add(operation.word);
      return null;
    }
    if (operation.op === "search") return words.has(operation.word);
    return [...words].some((word) => word.startsWith(operation.word));
  });
}

const word = fc
  .array(fc.integer({ min: 0, max: 5 }), { minLength: 1, maxLength: 6 })
  .map((letters) =>
    letters.map((letter) => String.fromCharCode(97 + letter)).join(""),
  );
const operation = fc.record({
  op: fc.constantFrom("insert", "search", "startsWith"),
  word,
});

describe("LC 208 Implement Trie trace", () => {
  it("validates metadata and every authored preset", () => {
    expect(() => validateTraceDefinition(definition)).not.toThrow();
    for (const preset of definition.presets) {
      const result = runtime.run(preset.values);
      expect(result.ok, preset.id).toBe(true);
      if (!result.ok) continue;
      const operations = JSON.parse(preset.values.operations) as Operation[];
      expect(result.value.output).toEqual(setOracle(operations));
      expect(
        result.value.frames.filter((frame) => frame.complete),
      ).toHaveLength(1);
      expect(
        result.value.frames.filter((frame) => frame.checkpoint),
      ).toHaveLength(1);
      expect(result.value.frames.length).toBeLessThanOrEqual(500);
    }
  });

  it("rejects malformed sessions and non-lowercase words", () => {
    expect(runtime.run({ operations: "not json" })).toMatchObject({
      ok: false,
      issues: [{ field: "operations" }],
    });
    expect(
      runtime.run({
        operations: '[{"op":"insert","word":"Tree"}]',
      }),
    ).toMatchObject({ ok: false, issues: [{ field: "operations" }] });
  });

  it("uses one checkpoint and renders the exact missing edge as rejected", () => {
    const operations: Operation[] = [
      { op: "insert", word: "app" },
      { op: "search", word: "apt" },
      { op: "startsWith", word: "ap" },
    ];
    const result = runtime.run({ operations: JSON.stringify(operations) });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(
      result.value.frames.filter((frame) => frame.checkpoint),
    ).toHaveLength(1);
    expect(
      result.value.frames.every((frame) => frame.focusSceneId === "trie"),
    ).toBe(true);

    const failed = result.value.frames.find((frame) => frame.id === "query-1");
    const trie = failed?.scenes.find((scene) => scene.id === "trie");
    expect(trie?.kind).toBe("trie");
    if (trie?.kind !== "trie") return;
    expect(trie.nodes).toContainEqual(
      expect.objectContaining({
        id: "ghost-apt",
        parentId: "node-ap",
        edgeLabel: "t",
        badge: "missing",
        role: "rejected",
      }),
    );
  });

  it("matches an independent Set oracle for bounded sessions", () => {
    fc.assert(
      fc.property(
        fc.array(operation, { minLength: 1, maxLength: 10 }),
        (operations) => {
          const raw = { operations: JSON.stringify(operations) };
          const first = runtime.run(raw);
          const second = runtime.run(raw);
          expect(first).toEqual(second);
          expect(first.ok).toBe(true);
          if (!first.ok) return;
          expect(first.value.output).toEqual(setOracle(operations));
          expect(JSON.parse(JSON.stringify(first.value))).toEqual(first.value);
        },
      ),
      { numRuns: 100 },
    );
  });
});
