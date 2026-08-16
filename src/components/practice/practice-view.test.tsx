import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PracticeView } from "@/components/practice/practice-view";

const setProblemCompletion = vi.fn();

vi.mock("@/lib/progress/context", () => ({
  useProgress: () => ({
    hydrated: true,
    progress: {
      startDate: "2026-04-01",
      completedProblems: {},
      roadmapStatuses: {},
      legacyMigrated: true,
      updatedAt: "2026-04-01T00:00:00.000Z",
    },
    setProblemCompletion,
  }),
}));

describe("PracticeView", () => {
  it("reveals solution insights and updates completion", async () => {
    const user = userEvent.setup();

    render(<PracticeView selectedWeek={1} />);

    expect(
      screen.getByRole("link", { name: "Visualize Two Sum" }),
    ).toHaveAttribute("href", "/trace/two-sum?day=1");

    await user.click(
      screen.getAllByRole("button", { name: "See approach" })[0],
    );

    expect(screen.getByText(/Store each number with its index/)).toBeVisible();

    await user.click(screen.getByLabelText("Mark Two Sum complete for Day 1"));

    expect(setProblemCompletion).toHaveBeenCalledWith(1, 1, true);
  });

  it("shows contextual trace links only for supported problems", () => {
    render(<PracticeView selectedWeek={2} />);

    expect(
      screen.getByRole("link", {
        name: "Visualize Longest Consecutive Sequence",
      }),
    ).toHaveAttribute("href", "/trace/longest-consecutive-sequence?day=9");
    expect(
      screen.queryByRole("link", {
        name: "Visualize Encode and Decode Strings",
      }),
    ).not.toBeInTheDocument();
  });
});
