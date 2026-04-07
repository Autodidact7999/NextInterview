import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProgressView } from "@/components/progress/progress-view";

const cycleRoadmapDayStatus = vi.fn();

vi.mock("@/lib/progress/context", () => ({
  useProgress: () => ({
    hydrated: true,
    progress: {
      startDate: null,
      completedProblems: {},
      roadmapStatuses: {
        "roadmap-1": "dsa",
      },
      legacyMigrated: true,
      updatedAt: "2026-04-01T00:00:00.000Z",
    },
    cycleRoadmapDayStatus,
  }),
}));

describe("ProgressView", () => {
  it("cycles tracker days through the progress action", async () => {
    const user = userEvent.setup();

    render(<ProgressView />);

    await user.click(screen.getByRole("button", { name: "Roadmap day 1" }));

    expect(cycleRoadmapDayStatus).toHaveBeenCalledWith(1);
  });
});
