import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { MindMap } from "@/components/reference/mind-map";

describe("MindMap", () => {
  it("supports keyboard selection and shows node details", async () => {
    const user = userEvent.setup();

    render(<MindMap />);

    const hashMapNode = screen.getByRole("button", { name: "HashMap" });
    hashMapNode.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByText("Selected node")).toBeVisible();
    expect(screen.getByText("HashMap")).toBeVisible();
    expect(screen.getByText(/Key-value hash table/)).toBeVisible();
  });
});
