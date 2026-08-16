import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { validParenthesesDefinition } from "@/content/visualizations/problems/0020-valid-parentheses/definition";
import { validParenthesesRuntime } from "@/content/visualizations/problems/0020-valid-parentheses/runtime";
import { validateTraceDefinition } from "@/lib/visualizer/validate";

function reductionOracle(value: string): boolean {
  let remaining = value;
  while (true) {
    const reduced = remaining.replace(/\(\)|\[\]|\{\}/g, "");
    if (reduced === remaining) return reduced.length === 0;
    remaining = reduced;
  }
}

function successfulRun(value: string) {
  const result = validParenthesesRuntime.run({ s: value });
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error(result.issues.map((issue) => issue.message).join(", "));
  }
  return result.value;
}

describe("LC 20 Valid Parentheses trace runtime", () => {
  it("validates its metadata and every deterministic preset", () => {
    expect(() =>
      validateTraceDefinition(validParenthesesDefinition),
    ).not.toThrow();

    for (const preset of validParenthesesDefinition.presets) {
      const first = validParenthesesRuntime.run(preset.values);
      const second = validParenthesesRuntime.run(preset.values);

      expect(first, preset.id).toEqual(second);
      expect(first.ok, preset.id).toBe(true);
      if (!first.ok) continue;

      expect(first.value.output).toBe(reductionOracle(preset.values.s));
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

  it("shows successful nested pairs and rejects the first crossed pair", () => {
    const nested = successfulRun("{[()]}");
    const crossed = successfulRun("([)]");

    expect(nested.output).toBe(true);
    expect(
      nested.frames.some((frame) =>
        frame.scenes.some(
          (scene) =>
            scene.kind === "sequence" &&
            scene.items.filter((item) => item.role === "accepted").length >= 2,
        ),
      ),
    ).toBe(true);

    expect(crossed.output).toBe(false);
    expect(crossed.frames.at(-1)?.codeRefs).toContain("reject-mismatch");
    const finalSequence = crossed.frames
      .at(-1)
      ?.scenes.find((scene) => scene.kind === "sequence");
    expect(
      finalSequence?.kind === "sequence"
        ? finalSequence.items.filter((item) => item.role === "rejected").length
        : 0,
    ).toBe(2);
  });

  it("handles empty input, unmatched closes, and leftover opens", () => {
    expect(successfulRun("").output).toBe(true);
    expect(successfulRun("]").output).toBe(false);
    expect(successfulRun("((").output).toBe(false);
  });

  it("keeps unmatched openers active and checkpoints the first closer", () => {
    const run = successfulRun("{[()]}");
    const pushFrames = run.frames.filter(
      (frame) => frame.phase === "Push opening",
    );

    for (const frame of pushFrames) {
      const sequence = frame.scenes.find((scene) => scene.kind === "sequence");
      const stack = frame.scenes.find((scene) => scene.kind === "stack");
      expect(
        sequence?.kind === "sequence"
          ? sequence.items.some((item) => item.role === "accepted")
          : true,
      ).toBe(false);
      expect(
        stack?.kind === "stack" ? stack.items.at(-1)?.role : undefined,
      ).toBe("current");
    }

    const checkpointFrames = run.frames.filter((frame) => frame.checkpoint);
    expect(checkpointFrames).toHaveLength(1);
    expect(
      checkpointFrames[0]?.variables.find(
        (variable) => variable.name === "index",
      )?.value,
    ).toBe(3);
    expect(checkpointFrames[0]?.checkpoint?.answerId).toBe("match");
  });

  it("rejects non-bracket text and inputs longer than 80 characters", () => {
    expect(validParenthesesRuntime.run({ s: "(a)" })).toMatchObject({
      ok: false,
      issues: [{ field: "s" }],
    });
    expect(validParenthesesRuntime.run({ s: "()".repeat(41) })).toMatchObject({
      ok: false,
      issues: [{ field: "s" }],
    });
  });

  it("matches an independent repeated-reduction oracle", () => {
    const bracketString = fc
      .array(fc.constantFrom("(", ")", "[", "]", "{", "}"), {
        minLength: 0,
        maxLength: 80,
      })
      .map((characters) => characters.join(""));

    fc.assert(
      fc.property(bracketString, (s) => {
        const raw = { s };
        const first = validParenthesesRuntime.run(raw);
        const second = validParenthesesRuntime.run(raw);

        expect(first).toEqual(second);
        expect(first.ok).toBe(true);
        if (!first.ok) return;

        expect(first.value.output).toBe(reductionOracle(s));
        expect(first.value.frames.length).toBeLessThanOrEqual(500);
        expect(JSON.parse(JSON.stringify(first.value))).toEqual(first.value);
        expect(
          first.value.frames.filter((frame) => frame.complete),
        ).toHaveLength(1);
      }),
      { numRuns: 100 },
    );
  });
});
