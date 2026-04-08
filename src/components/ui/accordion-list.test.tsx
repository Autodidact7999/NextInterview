import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AccordionList } from "@/components/ui/accordion-list";

describe("AccordionList", () => {
  it("opens accordion content on interaction", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AccordionList
        items={[
          {
            title: "Primitive Types",
            tag: "Java",
            tagBg: "var(--green-bg)",
            tagC: "var(--green-text)",
            body: "Useful for indexes and counters",
            code: "int value = 1;",
            trap: "Use long for big sums.",
            edgeCases: null,
          },
        ]}
      />,
    );

    const details = container.querySelector("details");
    expect(details?.open).toBe(false);

    await user.click(screen.getByText("Primitive Types"));

    expect(details?.open).toBe(true);
    expect(screen.getByText(/Use long for big sums/)).toBeVisible();
  });
});
