import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { definition } from "@/content/visualizations/problems/0242-valid-anagram/definition";
import { runtime } from "@/content/visualizations/problems/0242-valid-anagram/runtime";
import { validateTraceDefinition } from "@/lib/visualizer/validate";

function sortedCharacterOracle(s: string, t: string): boolean {
  return (
    s.length === t.length &&
    Array.from(s).sort().join("") === Array.from(t).sort().join("")
  );
}

const lowercaseString = fc
  .array(fc.integer({ min: 0, max: 25 }), { maxLength: 30 })
  .map((letters) =>
    letters.map((letter) => String.fromCharCode(97 + letter)).join(""),
  );

describe("LC 242 Valid Anagram trace", () => {
  it("has valid metadata and runs every authored preset", () => {
    expect(() => validateTraceDefinition(definition)).not.toThrow();

    for (const preset of definition.presets) {
      const result = runtime.run(preset.values);
      expect(result.ok, preset.id).toBe(true);
      if (!result.ok) continue;
      expect(result.value.output).toBe(
        sortedCharacterOracle(preset.values.s ?? "", preset.values.t ?? ""),
      );
      expect(
        result.value.frames.filter((frame) => frame.complete),
      ).toHaveLength(1);
      expect(result.value.frames.some((frame) => frame.checkpoint)).toBe(true);
      expect(result.value.frames.length).toBeLessThanOrEqual(500);
    }
  });

  it("rejects non-lowercase custom input at the field boundary", () => {
    const result = runtime.run({ s: "Listen", t: "silent" });
    expect(result).toMatchObject({
      ok: false,
      issues: [{ field: "s" }],
    });
  });

  it("focuses signed balances with one checkpoint and one successful scan frame", () => {
    const result = runtime.run({ s: "anagram", t: "nagaram" });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(
      result.value.frames.filter((frame) => frame.checkpoint),
    ).toHaveLength(1);
    expect(
      result.value.frames.filter((frame) => frame.phase === "Verify"),
    ).toHaveLength(1);
    expect(
      result.value.frames.every(
        (frame) => frame.focusSceneId === "frequency-balances",
      ),
    ).toBe(true);
    const balanceScenes = result.value.frames.flatMap((frame) =>
      frame.scenes.filter((scene) => scene.id === "frequency-balances"),
    );
    expect(
      balanceScenes.every(
        (scene) =>
          scene.kind === "bar-range" && scene.presentation === "signed",
      ),
    ).toBe(true);

    const unequal = runtime.run({ s: "a", t: "" });
    expect(unequal.ok).toBe(true);
    if (!unequal.ok) return;
    expect(
      unequal.value.frames.filter((frame) => frame.checkpoint),
    ).toHaveLength(1);
  });

  it("matches an independent sorted-character oracle for bounded inputs", () => {
    fc.assert(
      fc.property(lowercaseString, lowercaseString, (s, t) => {
        const first = runtime.run({ s, t });
        const second = runtime.run({ s, t });

        expect(first).toEqual(second);
        expect(first.ok).toBe(true);
        if (!first.ok) return;

        expect(first.value.output).toBe(sortedCharacterOracle(s, t));
        expect(JSON.parse(JSON.stringify(first.value))).toEqual(first.value);
      }),
      { numRuns: 100 },
    );
  });
});
