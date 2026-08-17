import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { practiceSolutions } from "@/content/practice";
import { validateBinarySearchTreeDefinition } from "@/content/visualizations/problems/0098-validate-binary-search-tree/definition";
import { validateBinarySearchTreeRuntime } from "@/content/visualizations/problems/0098-validate-binary-search-tree/runtime";
import { resolveTraceAnchors, validateTraceDefinition } from "@/lib/visualizer";

type LevelValue = number | null;

interface OracleNode {
  value: number;
  left: OracleNode | null;
  right: OracleNode | null;
}

function decodeForOracle(values: readonly LevelValue[]): OracleNode | null {
  if (values.length === 0) return null;
  const root: OracleNode = { value: values[0]!, left: null, right: null };
  const queue: OracleNode[] = [root];
  let parentIndex = 0;
  let cursor = 1;

  while (cursor < values.length) {
    const parent = queue[parentIndex]!;
    parentIndex += 1;
    const left = values[cursor];
    cursor += 1;
    if (left !== undefined && left !== null) {
      parent.left = { value: left, left: null, right: null };
      queue.push(parent.left);
    }
    if (cursor >= values.length) break;
    const right = values[cursor];
    cursor += 1;
    if (right !== null) {
      parent.right = { value: right, left: null, right: null };
      queue.push(parent.right);
    }
  }
  return root;
}

function strictInorderOracle(values: readonly LevelValue[]): boolean {
  const stack: OracleNode[] = [];
  let current = decodeForOracle(values);
  let previous: number | undefined;

  while (current !== null || stack.length > 0) {
    while (current !== null) {
      stack.push(current);
      current = current.left;
    }
    const node = stack.pop()!;
    if (previous !== undefined && node.value <= previous) return false;
    previous = node.value;
    current = node.right;
  }
  return true;
}

function compactTree(
  rootValue: number | null,
  childPairs: readonly (readonly [number | null, number | null])[],
): LevelValue[] {
  if (rootValue === null) return [];
  const values: LevelValue[] = [rootValue];
  let availableParents = 1;
  let pairIndex = 0;

  while (availableParents > 0 && pairIndex < childPairs.length) {
    const [left, right] = childPairs[pairIndex]!;
    pairIndex += 1;
    availableParents -= 1;
    values.push(left, right);
    if (left !== null) availableParents += 1;
    if (right !== null) availableParents += 1;
  }

  while (values.at(-1) === null) values.pop();
  return values;
}

function expectSuccessfulRun(values: readonly LevelValue[]) {
  const result = validateBinarySearchTreeRuntime.run({
    root: JSON.stringify(values),
  });
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error(result.issues.map((issue) => issue.message).join(", "));
  }
  return result.value;
}

describe("LC 98 Validate Binary Search Tree trace", () => {
  it("validates its definition, presets, checkpoints, and terminal output", () => {
    expect(() =>
      validateTraceDefinition(validateBinarySearchTreeDefinition),
    ).not.toThrow();
    expect(() =>
      resolveTraceAnchors(
        practiceSolutions[98].code,
        validateBinarySearchTreeDefinition.anchors,
      ),
    ).not.toThrow();

    for (const preset of validateBinarySearchTreeDefinition.presets) {
      const first = validateBinarySearchTreeRuntime.run(preset.values);
      const second = validateBinarySearchTreeRuntime.run(preset.values);

      expect(first).toEqual(second);
      expect(first.ok, preset.id).toBe(true);
      if (!first.ok) continue;

      const values = JSON.parse(preset.values.root) as LevelValue[];
      expect(first.value.output).toBe(strictInorderOracle(values));
      expect(first.value.frames.some((frame) => frame.checkpoint)).toBe(true);
      expect(first.value.frames.filter((frame) => frame.complete)).toHaveLength(
        1,
      );
      expect(first.value.frames.at(-1)).toMatchObject({
        complete: true,
        output: first.value.output,
      });
      expect(JSON.parse(JSON.stringify(first.value))).toEqual(first.value);
    }
  });

  it("uses ancestor bounds and Java's strict duplicate rule", () => {
    expect(expectSuccessfulRun([5, 1, 6, null, null, 3, 7]).output).toBe(false);
    expect(expectSuccessfulRun([2, 1, 2]).output).toBe(false);
    expect(
      expectSuccessfulRun([-2_147_483_648, null, 2_147_483_647]).output,
    ).toBe(true);
  });

  it("keeps bound context on the tree without stepping through null children", () => {
    const run = expectSuccessfulRun([5, 1, 6, null, null, 3, 7]);
    expect(run.frames.some((frame) => frame.id.startsWith("base-"))).toBe(
      false,
    );
    expect(
      run.frames.every((frame) => frame.focusSceneId === "validation-tree"),
    ).toBe(true);

    const invalidFrame = run.frames.find(
      (frame) => frame.id === "check-node-5",
    );
    const scene = invalidFrame?.scenes[0];
    expect(scene?.kind).toBe("tree");
    if (scene?.kind !== "tree") return;
    expect(scene.nodes.find((node) => node.id === "node-5")).toMatchObject({
      badge: "depth 2",
      role: "rejected",
    });
    expect(scene.nodes.find((node) => node.id === "node-5")?.note).toContain(
      "fails",
    );
  });

  it("rejects trailing nulls, orphan values, null roots, and oversized trees", () => {
    expect(
      validateBinarySearchTreeRuntime.run({ root: "[1, null]" }),
    ).toMatchObject({ ok: false, issues: [{ field: "root" }] });
    expect(
      validateBinarySearchTreeRuntime.run({ root: "[1, null, null, 2]" }),
    ).toMatchObject({ ok: false, issues: [{ field: "root" }] });
    expect(
      validateBinarySearchTreeRuntime.run({ root: "[null]" }),
    ).toMatchObject({ ok: false, issues: [{ field: "root" }] });
    expect(
      validateBinarySearchTreeRuntime.run({
        root: JSON.stringify(Array.from({ length: 32 }, (_, index) => index)),
      }),
    ).toMatchObject({ ok: false, issues: [{ field: "root" }] });
  });

  it("matches a strict inorder oracle for 100 bounded compact trees", () => {
    const valueArbitrary = fc.integer({
      min: -2_147_483_648,
      max: 2_147_483_647,
    });
    const nullableValueArbitrary = fc.option(valueArbitrary, { nil: null });

    fc.assert(
      fc.property(
        fc.option(valueArbitrary, { nil: null }),
        fc.array(fc.tuple(nullableValueArbitrary, nullableValueArbitrary), {
          maxLength: 15,
        }),
        (rootValue, childPairs) => {
          const values = compactTree(rootValue, childPairs);
          const before = [...values];
          const raw = { root: JSON.stringify(values) };
          const first = validateBinarySearchTreeRuntime.run(raw);
          const second = validateBinarySearchTreeRuntime.run(raw);

          expect(first).toEqual(second);
          expect(values).toEqual(before);
          expect(first.ok).toBe(true);
          if (!first.ok) return;

          expect(first.value.output).toBe(strictInorderOracle(values));
          expect(first.value.frames.length).toBeLessThanOrEqual(500);
          expect(JSON.parse(JSON.stringify(first.value))).toEqual(first.value);
        },
      ),
      { numRuns: 100 },
    );
  });
});
