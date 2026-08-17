import type { TraceCodeAnchor } from "@/lib/visualizer/types";

export function resolveTraceAnchors(
  code: string,
  anchors: readonly TraceCodeAnchor[],
): Map<string, number> {
  const lines = code.split("\n");
  const resolved = new Map<string, number>();
  for (const anchor of anchors) {
    const matches = lines.flatMap((line, index) =>
      line.includes(anchor.fragment) ? [index + 1] : [],
    );
    if (matches.length !== 1) {
      throw new Error(
        `Code anchor ${anchor.id} must match exactly one line; found ${matches.length}.`,
      );
    }
    resolved.set(anchor.id, matches[0]);
  }
  return resolved;
}
