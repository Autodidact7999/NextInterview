import { readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { practiceSolutions } from "@/content/practice";
import { traceDefinitions } from "@/content/visualizations/catalog.generated";
import { traceRuntimeLoaders } from "@/content/visualizations/loaders.generated";
import { resolveTraceAnchors } from "@/lib/visualizer/anchors";
import {
  validateTraceDefinition,
  validateTraceRun,
} from "@/lib/visualizer/validate";

const expectedProblems = [
  [1, "two-sum"],
  [3, "longest-substring-without-repeating-characters"],
  [11, "container-with-most-water"],
  [15, "3sum"],
  [20, "valid-parentheses"],
  [21, "merge-two-sorted-lists"],
  [49, "group-anagrams"],
  [98, "validate-binary-search-tree"],
  [102, "binary-tree-level-order-traversal"],
  [104, "maximum-depth-of-binary-tree"],
  [125, "valid-palindrome"],
  [128, "longest-consecutive-sequence"],
  [141, "linked-list-cycle"],
  [206, "reverse-linked-list"],
  [208, "implement-trie-prefix-tree"],
  [217, "contains-duplicate"],
  [238, "product-of-array-except-self"],
  [242, "valid-anagram"],
  [347, "top-k-frequent-elements"],
  [704, "binary-search"],
] as const;

describe("Trace Lab problem contracts", () => {
  it("discovers exactly the intended clean-room problem set", () => {
    expect(traceDefinitions.map((item) => [item.lc, item.slug])).toEqual(
      expectedProblems,
    );
    expect(new Set(traceDefinitions.map((item) => item.slug)).size).toBe(20);
    expect(Object.keys(traceRuntimeLoaders).sort()).toEqual(
      traceDefinitions.map((item) => item.slug).sort(),
    );
  });

  it("keeps folder names and metadata aligned", () => {
    const folders = readdirSync(
      path.join(process.cwd(), "src/content/visualizations/problems"),
      { withFileTypes: true },
    )
      .filter(
        (entry) => entry.isDirectory() && /^\d{4}-[a-z0-9-]+$/.test(entry.name),
      )
      .map((entry) => entry.name)
      .sort();
    const expectedFolders = traceDefinitions
      .map((item) => `${String(item.lc).padStart(4, "0")}-${item.slug}`)
      .sort();
    expect(folders).toEqual(expectedFolders);
  });

  it("validates every preset, anchor, deterministic run, and checkpoint", async () => {
    for (const definition of traceDefinitions) {
      validateTraceDefinition(definition);
      const solution = practiceSolutions[definition.lc];
      expect(solution).toBeDefined();
      expect(() =>
        resolveTraceAnchors(solution.code, definition.anchors),
      ).not.toThrow();
      const { runtime } = await traceRuntimeLoaders[definition.slug]();
      expect(runtime.lc).toBe(definition.lc);
      let checkpointCount = 0;
      for (const preset of definition.presets) {
        const first = runtime.run(preset.values);
        const second = runtime.run(preset.values);
        expect(
          first.ok,
          `${definition.slug}/${preset.id} should be valid`,
        ).toBe(true);
        expect(second).toEqual(first);
        if (!first.ok) continue;
        validateTraceRun(definition, first.value);
        expect(JSON.parse(JSON.stringify(first.value))).toEqual(first.value);
        checkpointCount += first.value.frames.filter(
          (frame) => frame.checkpoint,
        ).length;
      }
      expect(
        checkpointCount,
        `${definition.slug} needs a checkpoint`,
      ).toBeGreaterThan(0);
    }
  });
});
