import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { practiceSolutions } from "@/content/practice";
import { binaryTreeLevelOrderTraversalDefinition } from "@/content/visualizations/problems/0102-binary-tree-level-order-traversal/definition";
import { binaryTreeLevelOrderTraversalRuntime } from "@/content/visualizations/problems/0102-binary-tree-level-order-traversal/runtime";
import { resolveTraceAnchors, validateTraceDefinition } from "@/lib/visualizer";

type CompactTree = readonly (number | null)[];

interface TestNode {
  value: number;
  left: TestNode | null;
  right: TestNode | null;
}

function decodeForOracle(values: CompactTree): TestNode | null {
  if (values.length === 0) return null;
  const root: TestNode = { value: values[0]!, left: null, right: null };
  const queue = [root];
  let cursor = 1;

  while (cursor < values.length) {
    const parent = queue.shift()!;
    for (const side of ["left", "right"] as const) {
      if (cursor >= values.length) break;
      const value = values[cursor];
      cursor += 1;
      if (value === null) continue;
      const child: TestNode = { value, left: null, right: null };
      parent[side] = child;
      queue.push(child);
    }
  }

  return root;
}

function depthIndexedDfsOracle(values: CompactTree): number[][] {
  const levels: number[][] = [];
  const visit = (node: TestNode | null, depth: number): void => {
    if (node === null) return;
    if (!levels[depth]) levels[depth] = [];
    levels[depth]!.push(node.value);
    visit(node.left, depth + 1);
    visit(node.right, depth + 1);
  };
  visit(decodeForOracle(values), 0);
  return levels;
}

function makeValidCompactTree(
  values: readonly number[],
  decisions: readonly boolean[],
): (number | null)[] {
  if (values.length === 0) return [];
  const result: (number | null)[] = [values[0]!];
  let remainingParents = 1;
  let valueIndex = 1;
  let decisionIndex = 0;

  while (valueIndex < values.length) {
    remainingParents -= 1;
    let attachLeft = decisions[decisionIndex % decisions.length] ?? true;
    const attachRight =
      decisions[(decisionIndex + 1) % decisions.length] ?? false;
    decisionIndex += 2;

    if (remainingParents === 0 && !attachLeft && !attachRight) {
      attachLeft = true;
    }

    if (attachLeft) {
      result.push(values[valueIndex]!);
      valueIndex += 1;
      remainingParents += 1;
      if (valueIndex >= values.length) break;
    } else {
      result.push(null);
    }

    if (attachRight) {
      result.push(values[valueIndex]!);
      valueIndex += 1;
      remainingParents += 1;
    } else {
      result.push(null);
    }
  }

  return result;
}

const validCompactTree = fc
  .tuple(
    fc.array(fc.integer({ min: -10_000, max: 10_000 }), {
      minLength: 0,
      maxLength: 31,
    }),
    fc.array(fc.boolean(), { minLength: 1, maxLength: 64 }),
  )
  .map(([values, decisions]) => makeValidCompactTree(values, decisions));

describe("LC 102 Binary Tree Level Order Traversal trace runtime", () => {
  it("has a valid definition and valid independently authored presets", () => {
    expect(() =>
      validateTraceDefinition(binaryTreeLevelOrderTraversalDefinition),
    ).not.toThrow();
    expect(() =>
      resolveTraceAnchors(
        practiceSolutions[102].code,
        binaryTreeLevelOrderTraversalDefinition.anchors,
      ),
    ).not.toThrow();

    for (const preset of binaryTreeLevelOrderTraversalDefinition.presets) {
      const result = binaryTreeLevelOrderTraversalRuntime.run(preset.values);
      expect(result.ok, preset.id).toBe(true);
      if (!result.ok) continue;

      const root = JSON.parse(preset.values.root) as (number | null)[];
      expect(result.value.output).toEqual(depthIndexedDfsOracle(root));
      expect(result.value.frames.some((frame) => frame.checkpoint)).toBe(true);
      expect(result.value.frames.at(-1)).toMatchObject({
        complete: true,
        output: result.value.output,
      });
    }
  });

  it("rejects non-compact, orphaned, rootless, and oversized trees", () => {
    expect(
      binaryTreeLevelOrderTraversalRuntime.run({ root: "[1, 2, null]" }),
    ).toMatchObject({ ok: false, issues: [{ field: "root" }] });
    expect(
      binaryTreeLevelOrderTraversalRuntime.run({
        root: "[1, null, null, 2]",
      }),
    ).toMatchObject({ ok: false, issues: [{ field: "root" }] });
    expect(
      binaryTreeLevelOrderTraversalRuntime.run({ root: "[null]" }),
    ).toMatchObject({ ok: false, issues: [{ field: "root" }] });

    const tooMany = Array.from({ length: 32 }, (_, index) => index);
    expect(
      binaryTreeLevelOrderTraversalRuntime.run({
        root: JSON.stringify(tooMany),
      }),
    ).toMatchObject({ ok: false, issues: [{ field: "root" }] });
  });

  it("rejects malformed tokens and Java integer overflow", () => {
    expect(
      binaryTreeLevelOrderTraversalRuntime.run({ root: "[1, nope]" }),
    ).toMatchObject({ ok: false, issues: [{ field: "root" }] });
    expect(
      binaryTreeLevelOrderTraversalRuntime.run({ root: "[2147483648]" }),
    ).toMatchObject({ ok: false, issues: [{ field: "root" }] });
  });

  it("keeps the tree primary and condenses each node into one visit step", () => {
    const result = binaryTreeLevelOrderTraversalRuntime.run({
      root: "[1, 2, 3, 4, 5]",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(
      result.value.frames.every((frame) => frame.focusSceneId === "tree-state"),
    ).toBe(true);
    expect(
      result.value.frames.filter((frame) => frame.phase === "Visit node"),
    ).toHaveLength(5);
    expect(
      result.value.frames.some((frame) =>
        ["Poll node", "Record value", "Discover child"].includes(frame.phase),
      ),
    ).toBe(false);
  });

  it("matches an independent depth-indexed DFS for bounded valid trees", () => {
    fc.assert(
      fc.property(validCompactTree, (root) => {
        const raw = { root: JSON.stringify(root) };
        const first = binaryTreeLevelOrderTraversalRuntime.run(raw);
        const second = binaryTreeLevelOrderTraversalRuntime.run(raw);

        expect(first).toEqual(second);
        expect(first.ok).toBe(true);
        if (!first.ok) return;

        expect(first.value.output).toEqual(depthIndexedDfsOracle(root));
        expect(JSON.parse(JSON.stringify(first.value))).toEqual(first.value);
        expect(first.value.frames.length).toBeLessThanOrEqual(500);
        expect(
          first.value.frames.filter((frame) => frame.complete),
        ).toHaveLength(1);
        expect(first.value.frames.some((frame) => frame.checkpoint)).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});
