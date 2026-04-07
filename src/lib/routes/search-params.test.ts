import { describe, expect, it } from "vitest";

import {
  parsePracticeWeek,
  parseReferenceSection,
  parseRoadmapSection,
} from "@/lib/routes/search-params";

describe("search param parsing", () => {
  it("falls back safely for roadmap and reference sections", () => {
    expect(parseRoadmapSection("weekly")).toBe("weekly");
    expect(parseRoadmapSection("unknown")).toBe("overview");
    expect(parseReferenceSection("patterns")).toBe("patterns");
    expect(parseReferenceSection("bad")).toBe("mindmap");
  });

  it("normalizes the practice week filter", () => {
    expect(parsePracticeWeek("all")).toBe("all");
    expect(parsePracticeWeek("4")).toBe(4);
    expect(parsePracticeWeek("99")).toBe("all");
  });
});
