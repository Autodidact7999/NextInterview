import "server-only";

import { codeToTokensWithThemes } from "shiki";

import { resolveTraceAnchors } from "@/lib/visualizer/anchors";
import type {
  ResolvedTraceCodeLine,
  TraceCodeAnchor,
} from "@/lib/visualizer/types";

export async function prepareJavaCode(
  code: string,
  anchors: readonly TraceCodeAnchor[],
): Promise<readonly ResolvedTraceCodeLine[]> {
  const resolved = resolveTraceAnchors(code, anchors);
  const anchorIdsByLine = new Map<number, string[]>();
  for (const [anchorId, line] of resolved) {
    anchorIdsByLine.set(line, [...(anchorIdsByLine.get(line) ?? []), anchorId]);
  }
  const tokenLines = await codeToTokensWithThemes(code, {
    lang: "java",
    themes: {
      light: "github-light-default",
      dark: "github-dark-default",
    },
  });
  return tokenLines.map((tokens, index) => ({
    number: index + 1,
    anchorIds: anchorIdsByLine.get(index + 1) ?? [],
    tokens: tokens.map((token) => ({
      content: token.content,
      light: token.variants.light?.color ?? "#24292f",
      dark: token.variants.dark?.color ?? "#f0f6fc",
    })),
  }));
}
