import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TraceWorkspace } from "@/components/trace/trace-workspace";
import type { PreparedTraceProblem } from "@/lib/visualizer/types";

const push = vi.fn();
const setProblemCompletion = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/lib/progress/context", () => ({
  useProgress: () => ({ setProblemCompletion }),
}));
vi.mock("@/content/visualizations/loaders.generated", () => ({
  traceRuntimeLoaders: {
    demo: async () => ({
      runtime: {
        lc: 1,
        slug: "demo",
        run(raw: Readonly<Record<string, string>>) {
          if (raw.value === "bad")
            return {
              ok: false as const,
              issues: [{ field: "value", message: "Use a valid value." }],
            };
          if (raw.value === "crash") throw new Error("boom");
          return {
            ok: true as const,
            value: {
              input: { value: raw.value ?? "" },
              output: true,
              frames: [
                {
                  id: "start",
                  phase: "inspect",
                  codeRefs: ["return"],
                  explanation: "Start here.",
                  changed: "Read the value.",
                  invariant: "The value stays available.",
                  variables: [{ name: "value", value: raw.value ?? "" }],
                  scenes: [
                    {
                      id: "values",
                      kind: "sequence" as const,
                      title: "Values",
                      description: "Current values",
                      items: [{ id: "v", label: "0", value: raw.value ?? "" }],
                    },
                  ],
                  checkpoint: {
                    prompt: "What comes next?",
                    options: [
                      { id: "finish", label: "Finish" },
                      { id: "wait", label: "Wait" },
                    ],
                    answerId: "finish",
                    explanation: "The state is ready.",
                  },
                },
                {
                  id: "done",
                  phase: "complete",
                  codeRefs: ["return"],
                  explanation: "The trace is complete.",
                  changed: "Produced true.",
                  invariant: "The output is final.",
                  variables: [{ name: "result", value: true, changed: true }],
                  scenes: [
                    {
                      id: "values",
                      kind: "sequence" as const,
                      title: "Values",
                      description: "Final values",
                      items: [
                        {
                          id: "v",
                          label: "0",
                          value: raw.value ?? "",
                          role: "accepted" as const,
                        },
                      ],
                    },
                  ],
                  complete: true,
                  output: true,
                },
              ],
            },
          };
        },
      },
    }),
  },
}));

const problem: PreparedTraceProblem = {
  lc: 1,
  slug: "demo",
  title: "Demo trace",
  difficulty: "E",
  area: "Tests",
  pattern: "State machine",
  summary: "A test trace.",
  fields: [
    {
      id: "value",
      label: "Value",
      type: "text",
      placeholder: "ok",
      help: "Enter a value.",
    },
  ],
  presets: [
    {
      id: "default",
      label: "Default",
      description: "Default",
      values: { value: "ok" },
    },
    {
      id: "edge",
      label: "Edge",
      description: "Edge",
      values: { value: "edge" },
    },
  ],
  anchors: [{ id: "return", label: "Return", fragment: "return true;" }],
  visualKinds: ["sequence"],
  code: "return true;",
  codeLines: [
    {
      number: 1,
      anchorIds: ["return"],
      tokens: [{ content: "return true;", light: "#111111", dark: "#eeeeee" }],
    },
  ],
  time: "O(1)",
  space: "O(1)",
  days: [{ day: 1, week: 1 }],
};

describe("TraceWorkspace", () => {
  it("starts state-first with a quiet input bench and checkpoint-safe playback", async () => {
    const user = userEvent.setup();
    render(<TraceWorkspace problem={problem} source={null} />);

    expect(await screen.findByText("Start here.")).toBeVisible();
    expect(screen.queryByLabelText("Value")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit input" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.getByRole("button", { name: "Play trace" })).toBeDisabled();
    expect(
      screen.getByRole("combobox", { name: "Playback speed" }),
    ).toHaveValue("1");

    const stateButton = screen.getByRole("button", { name: "State" });
    const javaButton = screen.getByRole("button", { name: "Java" });
    expect(stateButton).toHaveAttribute("aria-pressed", "true");
    await user.click(javaButton);
    expect(javaButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("region", { name: "Java source" })).toHaveAttribute(
      "data-active",
      "true",
    );
    await user.click(stateButton);
    expect(stateButton).toHaveAttribute("aria-pressed", "true");
  });

  it("steps with safe keyboard controls and reveals checkpoint reasoning", async () => {
    const user = userEvent.setup();
    render(<TraceWorkspace problem={problem} source={{ day: 1, week: 1 }} />);
    expect(await screen.findByText("Start here.")).toBeVisible();
    await user.click(screen.getByLabelText("Finish"));
    await user.click(screen.getByRole("button", { name: "Reveal reasoning" }));
    expect(screen.getByText(/That’s it/)).toBeVisible();

    const workspace = screen.getByLabelText(/Demo trace trace workspace/);
    workspace.focus();
    fireEvent.keyDown(workspace, { key: "ArrowRight" });
    expect(screen.getByText("The trace is complete.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: /Mark complete/ }));
    expect(setProblemCompletion).toHaveBeenCalledWith(1, 1, true);
    expect(push).toHaveBeenCalledWith("/practice?week=1#day-1");
  });

  it("focuses invalid input and preserves the last valid trace", async () => {
    const user = userEvent.setup();
    render(<TraceWorkspace problem={problem} source={null} />);
    expect(await screen.findByText("Start here.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Edit input" }));
    const input = screen.getByLabelText("Value");
    await user.clear(input);
    await user.type(input, "bad");
    await user.click(screen.getByRole("button", { name: "Generate trace" }));
    expect(await screen.findByText("Use a valid value.")).toBeVisible();
    expect(input).toHaveFocus();
    expect(screen.getByText("Start here.")).toBeVisible();

    fireEvent.keyDown(input, { key: "ArrowRight" });
    expect(screen.getByText("Start here.")).toBeVisible();
  });

  it("offers a preset recovery after an unexpected tracer failure", async () => {
    const user = userEvent.setup();
    render(<TraceWorkspace problem={problem} source={null} />);
    await user.click(await screen.findByRole("button", { name: "Edit input" }));
    const input = await screen.findByLabelText("Value");
    await user.clear(input);
    await user.type(input, "crash");
    await user.click(screen.getByRole("button", { name: "Generate trace" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "could not be generated",
    );
    await user.click(screen.getByRole("button", { name: "Reset preset" }));
    await waitFor(() =>
      expect(
        screen.queryByText(/could not be generated/),
      ).not.toBeInTheDocument(),
    );
  });

  it("uses one cancellable timer and pauses when the tab is hidden", async () => {
    const view = render(<TraceWorkspace problem={problem} source={null} />);
    expect(await screen.findByText("Start here.")).toBeVisible();
    fireEvent.click(screen.getByLabelText("Finish"));
    fireEvent.click(screen.getByRole("button", { name: "Reveal reasoning" }));
    vi.useFakeTimers();
    try {
      fireEvent.click(screen.getByRole("button", { name: "Play trace" }));
      act(() => vi.advanceTimersByTime(901));
      expect(screen.getByText("The trace is complete.")).toBeVisible();

      fireEvent.click(screen.getByRole("button", { name: "Play trace" }));
      expect(screen.getByRole("button", { name: "Pause trace" })).toBeVisible();
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: true,
      });
      fireEvent(document, new Event("visibilitychange"));
      expect(screen.getByRole("button", { name: "Play trace" })).toBeVisible();
      act(() => vi.advanceTimersByTime(2_000));
      expect(screen.getByText("Start here.")).toBeVisible();
      view.unmount();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: false,
      });
      vi.useRealTimers();
    }
  });
});
