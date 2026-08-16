import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TraceSceneDeck, TraceSceneView } from "@/components/trace/trace-scene";
import type { TraceScene } from "@/lib/visualizer/types";

const base = { id: "scene", title: "State", description: "Semantic state" };
const scenes: readonly TraceScene[] = [
  {
    ...base,
    id: "sequence",
    kind: "sequence",
    items: [{ id: "a", label: "0", value: 4 }],
    pointers: [{ id: "p", label: "left", index: 0 }],
    ranges: [{ id: "window", label: "active window", start: 0, end: 0 }],
  },
  {
    ...base,
    id: "map",
    kind: "associative",
    entries: [{ id: "e", key: "four", value: [0, 1], role: "current" }],
  },
  {
    ...base,
    id: "stack",
    kind: "stack",
    items: [{ id: "s", label: "0", value: "(", role: "candidate" }],
  },
  {
    ...base,
    id: "list",
    kind: "linked-list",
    nodes: [{ id: "n0", value: 4, nextId: null, role: "current" }],
    headId: "n0",
    pointers: [
      { id: "head", label: "curr", nodeId: "n0" },
      { id: "next", label: "next", nodeId: null },
    ],
  },
  {
    ...base,
    id: "tree",
    kind: "tree",
    nodes: [
      {
        id: "root",
        value: 4,
        parentId: null,
        role: "visited",
        badge: "depth 1",
      },
    ],
    rootId: "root",
  },
  {
    ...base,
    id: "trie",
    kind: "trie",
    nodes: [{ id: "root", value: "root", parentId: null }],
    rootId: "root",
  },
  {
    ...base,
    id: "bars",
    kind: "bar-range",
    bars: [{ id: "b", label: "a", value: 4 }],
    range: { start: 0, end: 0, label: "active" },
    markers: [{ id: "mid", label: "mid", index: 0 }],
    presentation: "signed",
  },
];

describe("TraceSceneView", () => {
  it.each(scenes)("renders $kind scenes with semantic content", (scene) => {
    const { unmount } = render(<TraceSceneView scene={scene} />);
    expect(screen.getByRole("heading", { name: "State" })).toBeInTheDocument();
    expect(screen.getByText("Semantic state")).toBeInTheDocument();
    unmount();
  });

  it("exposes sequence roles, pointers, and ranges without relying on color", () => {
    render(<TraceSceneView scene={scenes[0]!} />);
    const table = screen.getByRole("table", { name: "State" });
    const row = within(table).getByRole("row", {
      name: /0 4 unchanged left active window/,
    });
    expect(row).toBeInTheDocument();
  });

  it("describes linked topology, head, and null pointers", () => {
    render(<TraceSceneView scene={scenes[3]!} />);
    expect(screen.getByText("Head points to n0.")).toBeInTheDocument();
    expect(
      screen.getByText(/n0, value 4, current, points to null/),
    ).toBeInTheDocument();
    expect(screen.getByText("next points to null.")).toBeInTheDocument();
  });

  it("exposes bar markers, signed values, and range membership", () => {
    render(<TraceSceneView scene={scenes[6]!} />);
    const table = screen.getByRole("table", { name: "State" });
    expect(
      within(table).getByRole("row", { name: /a 4 unchanged mid active/ }),
    ).toBeInTheDocument();
  });

  it("lets a learner focus one supporting scene without hiding desktop semantics", () => {
    render(<TraceSceneDeck focusSceneId="map" scenes={scenes.slice(0, 3)} />);
    const buttons = screen.getAllByRole("button", { name: "State" });
    expect(buttons[1]).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(buttons[0]!);
    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
  });
});
