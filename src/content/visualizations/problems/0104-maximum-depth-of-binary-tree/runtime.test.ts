import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { maximumDepthOfBinaryTreeDefinition } from "@/content/visualizations/problems/0104-maximum-depth-of-binary-tree/definition";
import { maximumDepthOfBinaryTreeRuntime } from "@/content/visualizations/problems/0104-maximum-depth-of-binary-tree/runtime";
import { validateTraceDefinition } from "@/lib/visualizer/validate";

type LevelValue = number | null;

function expectSuccessfulRun(values: readonly LevelValue[]) {
  const result = maximumDepthOfBinaryTreeRuntime.run({
    root: JSON.stringify(values),
  });
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error(result.issues.map((issue) => issue.message).join(", "));
  }
  return result.value;
}

function bfsDepth(values: readonly LevelValue[]): number {
  if (values.length === 0) return 0;
  let cursor = 1;
  let levelSize = 1;
  let depth = 0;
  while (levelSize > 0) {
    depth += 1;
    let nextLevelSize = 0;
    for (let parent = 0; parent < levelSize; parent += 1) {
      for (let child = 0; child < 2 && cursor < values.length; child += 1) {
        if (values[cursor] !== null) nextLevelSize += 1;
        cursor += 1;
      }
    }
    levelSize = nextLevelSize;
  }
  return depth;
}

function canonicalize(values: readonly LevelValue[]): LevelValue[] {
  if (values.length === 0 || values[0] === null) return [];
  const result: LevelValue[] = [values[0]];
  let availableParents = 1;
  let cursor = 1;
  while (cursor < values.length && availableParents > 0) {
    availableParents -= 1;
    for (let child = 0; child < 2 && cursor < values.length; child += 1) {
      const value = values[cursor] ?? null;
      result.push(value);
      if (value !== null) availableParents += 1;
      cursor += 1;
    }
  }
  while (result.at(-1) === null) result.pop();
  return result;
}

function terminalTreeDepth(values: readonly LevelValue[]): number {
  if (values.length === 0) return 0;
  let depth = 0;
  let levelStart = 0;
  let levelSize = 1;
  let cursor = 1;
  while (levelSize > 0) {
    depth += 1;
    levelStart += levelSize;
    let children = 0;
    for (let index = 0; index < levelSize; index += 1) {
      for (let side = 0; side < 2 && cursor < values.length; side += 1) {
        if (values[cursor] !== null) children += 1;
        cursor += 1;
      }
    }
    if (levelStart >= values.filter((value) => value !== null).length) {
      return depth;
    }
    levelSize = children;
  }
  return depth;
}

describe("LC 104 Maximum Depth of Binary Tree trace", () => {
  it("has valid metadata and deterministic, JSON-safe presets", () => {
    expect(() =>
      validateTraceDefinition(maximumDepthOfBinaryTreeDefinition),
    ).not.toThrow();

    for (const preset of maximumDepthOfBinaryTreeDefinition.presets) {
      const first = maximumDepthOfBinaryTreeRuntime.run(preset.values);
      const second = maximumDepthOfBinaryTreeRuntime.run(preset.values);
      expect(first).toEqual(second);
      expect(first.ok).toBe(true);
      if (!first.ok) continue;

      const values = JSON.parse(preset.values.root) as LevelValue[];
      expect(first.value.output).toBe(bfsDepth(values));
      expect(first.value.frames.filter((frame) => frame.complete)).toHaveLength(
        1,
      );
      expect(first.value.frames.at(-1)?.complete).toBe(true);
      expect(first.value.frames.some((frame) => frame.checkpoint)).toBe(true);
      expect(JSON.parse(JSON.stringify(first.value))).toEqual(first.value);
    }
  });

  it("shows a rooted tree and a recursion stack throughout the run", () => {
    const run = expectSuccessfulRun([1, 2, 3, 4, null, null, 5]);
    for (const frame of run.frames) {
      expect(frame.scenes.map((scene) => scene.kind)).toEqual([
        "tree",
        "stack",
      ]);
    }

    const terminalTree = run.frames.at(-1)?.scenes[0];
    expect(terminalTree?.kind).toBe("tree");
    if (terminalTree?.kind !== "tree") {
      throw new Error("Expected a tree scene.");
    }
    expect(terminalTree.rootId).toBe("node-0");
    expect(terminalTree.nodes).toHaveLength(5);
    expect(
      terminalTree.nodes.every(
        (node) => node.id === "node-0" || node.parentId !== null,
      ),
    ).toBe(true);
    expect(
      run.frames.every((frame) => frame.focusSceneId === "tree-state"),
    ).toBe(true);
    expect(run.frames.some((frame) => frame.id.startsWith("base-"))).toBe(
      false,
    );
    expect(
      terminalTree.nodes.every((node) =>
        String(node.badge).startsWith("depth "),
      ),
    ).toBe(true);
  });

  it("handles the empty and skewed edge cases", () => {
    const empty = expectSuccessfulRun([]);
    expect(empty.output).toBe(0);
    expect(empty.frames).toHaveLength(2);
    expect(
      empty.frames.find((frame) => frame.checkpoint)?.checkpoint?.answerId,
    ).toBe("maximum-plus-one");

    const skewed = expectSuccessfulRun([1, null, 2, null, 3, null, 4]);
    expect(skewed.output).toBe(4);
    const predictionFrame = skewed.frames.find(
      (frame) => frame.checkpoint !== undefined,
    );
    expect(predictionFrame?.phase).toBe("Combine depths");
    expect(predictionFrame?.checkpoint?.answerId).toBe("maximum-plus-one");
  });

  it("rejects trailing nulls, orphan values, malformed values, and oversized trees", () => {
    expect(
      maximumDepthOfBinaryTreeRuntime.run({ root: "[1, 2, null]" }).ok,
    ).toBe(false);
    expect(
      maximumDepthOfBinaryTreeRuntime.run({ root: "[1, null, null, 2]" }).ok,
    ).toBe(false);
    expect(maximumDepthOfBinaryTreeRuntime.run({ root: "[null]" }).ok).toBe(
      false,
    );
    expect(maximumDepthOfBinaryTreeRuntime.run({ root: "[1, nope]" }).ok).toBe(
      false,
    );
    expect(
      maximumDepthOfBinaryTreeRuntime.run({ root: "[2147483648]" }).ok,
    ).toBe(false);
    expect(
      maximumDepthOfBinaryTreeRuntime.run({
        root: JSON.stringify(Array.from({ length: 32 }, (_, index) => index)),
      }).ok,
    ).toBe(false);
  });

  it("matches an independent BFS level count across 100 bounded trees", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(
            fc.integer({ min: -2_147_483_648, max: 2_147_483_647 }),
            fc.constant(null),
          ),
          { maxLength: 31 },
        ),
        (candidate) => {
          const values = canonicalize(candidate);
          const snapshot = structuredClone(values);
          const run = expectSuccessfulRun(values);
          expect(run.output).toBe(bfsDepth(values));
          expect(run.output).toBe(terminalTreeDepth(values));
          expect(values).toEqual(snapshot);
          expect(run.frames.length).toBeLessThanOrEqual(500);
          expect(JSON.parse(JSON.stringify(run))).toEqual(run);

          const repeated = maximumDepthOfBinaryTreeRuntime.run({
            root: JSON.stringify(values),
          });
          expect(repeated.ok).toBe(true);
          if (repeated.ok) expect(repeated.value).toEqual(run);
        },
      ),
      { numRuns: 100 },
    );
  });
});
