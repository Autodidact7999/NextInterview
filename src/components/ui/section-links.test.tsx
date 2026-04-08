import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SectionLinks } from "@/components/ui/section-links";

describe("SectionLinks", () => {
  it("marks the active tab and builds search-param links", () => {
    render(
      <SectionLinks
        activeValue="patterns"
        basePath="/reference"
        options={[
          { label: "Mind Map", value: "mindmap" },
          { label: "Patterns", value: "patterns" },
        ]}
        paramName="section"
      />,
    );

    expect(screen.getByRole("tab", { name: "Patterns" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "Mind Map" })).toHaveAttribute(
      "href",
      "/reference?section=mindmap",
    );
  });
});
