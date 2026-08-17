import type { z } from "zod";

import type {
  JsonValue,
  RawTraceInput,
  TraceInputIssue,
  TraceProblemDefinition,
  TraceProblemRuntime,
  TraceRun,
  ValidationResult,
} from "@/lib/visualizer/types";
import { validateTraceRun } from "@/lib/visualizer/validate";

interface RuntimeConfig<Input, Output extends JsonValue> {
  definition: TraceProblemDefinition;
  schema: z.ZodType<Input>;
  parseRaw(raw: RawTraceInput): unknown;
  trace(input: Input): TraceRun;
  oracle(input: Input): Output;
  equals?: (actual: JsonValue, expected: Output) => boolean;
}

function issuePath(path: readonly PropertyKey[]): string {
  const field = path[0];
  return typeof field === "string" || typeof field === "number"
    ? String(field)
    : "form";
}

export function createTraceRuntime<Input, Output extends JsonValue>(
  config: RuntimeConfig<Input, Output>,
): TraceProblemRuntime {
  return {
    lc: config.definition.lc,
    slug: config.definition.slug,
    run(raw) {
      let candidate: unknown;
      try {
        candidate = config.parseRaw(raw);
      } catch (error) {
        const issue: TraceInputIssue = {
          field:
            error instanceof Error && error.message.includes(":")
              ? error.message.slice(0, error.message.indexOf(":"))
              : "form",
          message:
            error instanceof Error
              ? error.message.replace(/^[^:]+:\s*/, "")
              : "Unable to parse this input.",
        };
        return { ok: false, issues: [issue] };
      }

      const parsed = config.schema.safeParse(candidate);
      if (!parsed.success) {
        return {
          ok: false,
          issues: parsed.error.issues.map((issue) => ({
            field: issuePath(issue.path),
            message: issue.message,
          })),
        };
      }

      const input = structuredClone(parsed.data);
      const before = JSON.stringify(input);
      const run = validateTraceRun(config.definition, config.trace(input));
      if (JSON.stringify(input) !== before) {
        throw new Error(
          `Trace mutated its input for LC ${config.definition.lc}.`,
        );
      }
      const expected = config.oracle(structuredClone(parsed.data));
      const equals =
        config.equals ??
        ((actual, wanted) => JSON.stringify(actual) === JSON.stringify(wanted));
      if (!equals(run.output, expected)) {
        throw new Error(
          `Trace oracle mismatch for LC ${config.definition.lc}.`,
        );
      }
      return { ok: true, value: run } satisfies ValidationResult<TraceRun>;
    },
  };
}

export function parseField<T>(
  raw: RawTraceInput,
  field: string,
  parser: (value: string) => T,
): T {
  try {
    return parser(raw[field] ?? "");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid value.";
    throw new Error(`${field}: ${message}`);
  }
}
