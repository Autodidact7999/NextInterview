import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SettingsModal } from "@/components/practice/settings-modal";

const setStartDate = vi.fn();

vi.mock("@/lib/progress/context", () => ({
  useProgress: () => ({
    progress: {
      startDate: "2026-04-01",
    },
    setStartDate,
  }),
}));

describe("SettingsModal", () => {
  it("saves the chosen start date", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<SettingsModal onClose={onClose} open />);

    await user.clear(screen.getByLabelText("Start date"));
    await user.type(screen.getByLabelText("Start date"), "2026-04-06");
    await user.click(screen.getByRole("button", { name: "Save start date" }));

    expect(setStartDate).toHaveBeenCalledWith("2026-04-06");
    expect(onClose).toHaveBeenCalled();
  });
});
