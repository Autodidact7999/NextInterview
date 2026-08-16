import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { definition } from "@/content/visualizations/problems/0125-valid-palindrome/definition";
import { runtime } from "@/content/visualizations/problems/0125-valid-palindrome/runtime";
import { validateTraceDefinition } from "@/lib/visualizer/validate";

function isAsciiAlphanumeric(character: string): boolean {
  return /^[0-9A-Za-z]$/.test(character);
}

function normalizedReverseOracle(value: string): boolean {
  const normalized = Array.from(value)
    .filter(isAsciiAlphanumeric)
    .map((character) => character.toLowerCase())
    .join("");
  return normalized === Array.from(normalized).reverse().join("");
}

const printableAsciiString = fc
  .array(fc.integer({ min: 32, max: 126 }), {
    minLength: 0,
    maxLength: 70,
  })
  .map((codes) => String.fromCharCode(...codes));

describe("LC 125 Valid Palindrome trace runtime", () => {
  it("has a valid definition and independently authored presets", () => {
    expect(() => validateTraceDefinition(definition)).not.toThrow();

    for (const preset of definition.presets) {
      const result = runtime.run(preset.values);
      expect(result.ok, preset.id).toBe(true);
      if (!result.ok) continue;

      expect(result.value.output).toBe(
        normalizedReverseOracle(preset.values.s),
      );
      expect(result.value.frames.some((frame) => frame.checkpoint)).toBe(true);
      expect(result.value.frames.at(-1)).toMatchObject({
        complete: true,
        output: result.value.output,
      });
    }
  });

  it("accepts the empty edge and dims ignored punctuation semantically", () => {
    const empty = runtime.run({ s: "" });
    const punctuation = runtime.run({ s: " .,!?:; " });

    expect(empty).toMatchObject({ ok: true, value: { output: true } });
    expect(punctuation).toMatchObject({ ok: true, value: { output: true } });
    if (!punctuation.ok) return;

    const scene = punctuation.value.frames[0]?.scenes[0];
    expect(scene?.kind).toBe("sequence");
    if (scene?.kind !== "sequence") return;
    expect(scene.items.every((item) => item.role === "dimmed")).toBe(true);
  });

  it("persists matched pairs and batches contiguous ignored characters", () => {
    const matched = runtime.run({ s: "abba" });
    const punctuated = runtime.run({ s: "  Aa  " });

    expect(matched.ok).toBe(true);
    expect(punctuated.ok).toBe(true);
    if (!matched.ok || !punctuated.ok) return;

    const matchFrames = matched.value.frames.filter(
      (frame) => frame.phase === "Match and move",
    );
    expect(matchFrames).toHaveLength(2);
    const finalMatchScene = matchFrames.at(-1)?.scenes[0];
    expect(
      finalMatchScene?.kind === "sequence"
        ? finalMatchScene.items.filter((item) => item.role === "accepted")
            .length
        : 0,
    ).toBe(4);
    expect(
      matched.value.frames.some((frame) => frame.phase === "Move inward"),
    ).toBe(false);

    const skipFrames = punctuated.value.frames.filter(
      (frame) => frame.phase === "Skip ignored",
    );
    expect(skipFrames).toHaveLength(1);
    expect(
      skipFrames[0]?.variables.find(
        (variable) => variable.name === "ignored count",
      )?.value,
    ).toBe(4);
  });

  it("rejects non-printable or overly long text with field attribution", () => {
    expect(runtime.run({ s: "line\nbreak" })).toMatchObject({
      ok: false,
      issues: [{ field: "s" }],
    });
    expect(runtime.run({ s: "a".repeat(121) })).toMatchObject({
      ok: false,
      issues: [{ field: "s" }],
    });
  });

  it("matches a normalized reverse oracle for bounded printable ASCII", () => {
    fc.assert(
      fc.property(printableAsciiString, (s) => {
        const raw = { s };
        const first = runtime.run(raw);
        const second = runtime.run(raw);

        expect(first).toEqual(second);
        expect(first.ok).toBe(true);
        if (!first.ok) return;

        expect(first.value.output).toBe(normalizedReverseOracle(s));
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
