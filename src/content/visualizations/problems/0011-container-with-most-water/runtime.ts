import { z } from "zod";

import { containerWithMostWaterDefinition } from "@/content/visualizations/problems/0011-container-with-most-water/definition";
import {
  createTraceRuntime,
  parseField,
  parseIntegerArray,
} from "@/lib/visualizer";
import type {
  RawTraceInput,
  TraceBarRangeScene,
  TraceCheckpoint,
  TraceFrame,
  TraceItemRole,
  TraceRun,
} from "@/lib/visualizer";

const containerInputSchema = z.object({
  heights: z
    .array(
      z
        .number()
        .int()
        .min(0, "Heights cannot be negative.")
        .max(10_000, "Each height must be at most 10,000."),
    )
    .min(2, "Enter at least two wall heights.")
    .max(30, "Use at most 30 wall heights."),
});

type ContainerInput = z.infer<typeof containerInputSchema>;

interface BoundaryPair {
  left: number;
  right: number;
}

function parseRawInput(raw: RawTraceInput): unknown {
  return {
    heights: parseField(raw, "heights", parseIntegerArray),
  };
}

function bruteForceMaximumArea({ heights }: ContainerInput): number {
  let maximum = 0;
  for (let left = 0; left < heights.length - 1; left += 1) {
    for (let right = left + 1; right < heights.length; right += 1) {
      maximum = Math.max(
        maximum,
        Math.min(heights[left], heights[right]) * (right - left),
      );
    }
  }
  return maximum;
}

function barRole(
  index: number,
  current: BoundaryPair | null,
  best: BoundaryPair | null,
  currentAccepted: boolean,
): TraceItemRole {
  const isCurrent =
    current !== null && (index === current.left || index === current.right);
  const isBest = best !== null && (index === best.left || index === best.right);

  if (isCurrent && currentAccepted) return "accepted";
  if (isCurrent) return "candidate";
  if (isBest) return "accepted";
  return "default";
}

function containerScene(
  heights: readonly number[],
  current: BoundaryPair | null,
  best: BoundaryPair | null,
  currentArea: number | null,
  bestArea: number,
  currentAccepted = false,
): TraceBarRangeScene {
  const displayedPair = current ?? best;
  const rangeArea = current === null ? bestArea : currentArea;
  const markers: { id: string; label: string; index: number }[] = [];

  if (current) {
    markers.push(
      { id: "current-left", label: "current l", index: current.left },
      { id: "current-right", label: "current r", index: current.right },
    );
  }

  if (
    best &&
    (current === null ||
      best.left !== current.left ||
      best.right !== current.right)
  ) {
    markers.push(
      { id: "best-left", label: "best l", index: best.left },
      { id: "best-right", label: "best r", index: best.right },
    );
  }

  return {
    id: "container",
    kind: "bar-range",
    presentation: "container",
    title: "Container candidates",
    description:
      current === null
        ? `The accepted pair holds the maximum area of ${bestArea}.`
        : `The current walls make area ${currentArea ?? "—"}; the best measured area is ${bestArea}. The shorter current wall limits the water height.`,
    bars: heights.map((height, index) => ({
      id: `wall-${index}`,
      label: `index ${index}`,
      value: height,
      role: barRole(index, current, best, currentAccepted),
    })),
    ...(displayedPair
      ? {
          range: {
            start: displayedPair.left,
            end: displayedPair.right,
            label:
              rangeArea === null
                ? "Current range"
                : current === null
                  ? `Best area ${rangeArea}`
                  : `Current area ${rangeArea} · best ${bestArea}`,
          },
          markers,
        }
      : {}),
  };
}

function nextMoveCheckpoint(
  heights: readonly number[],
  left: number,
  right: number,
): TraceCheckpoint {
  const moveLeft = heights[left] < heights[right];
  return {
    prompt:
      "The width must shrink on the next step. Which boundary does this Java implementation move?",
    options: [
      { id: "move-left", label: "Move the left boundary" },
      { id: "move-right", label: "Move the right boundary" },
      { id: "move-both", label: "Move both boundaries" },
    ],
    answerId: moveLeft ? "move-left" : "move-right",
    explanation: moveLeft
      ? "The left wall is shorter, so keeping it cannot improve the area as the width shrinks."
      : "The right wall is no taller than the left wall, so the else branch discards the right boundary.",
  };
}

function traceContainer({ heights: source }: ContainerInput): TraceRun {
  const heights = [...source];
  let left = 0;
  let right = heights.length - 1;
  let maximum = 0;
  let bestPair: BoundaryPair | null = null;

  const frames: TraceFrame[] = [
    {
      id: "initialize",
      phase: "Initialize",
      codeRefs: ["initialize-pointers"],
      explanation:
        "Place one pointer at each end to begin with the widest possible container.",
      changed: `Set l = 0, r = ${right}, and max = 0.`,
      invariant:
        "Every unmeasured candidate lies within the inclusive pointer range.",
      variables: [
        { name: "l", value: left },
        { name: "r", value: right },
        { name: "width", value: right - left },
        { name: "max", value: maximum },
      ],
      scenes: [
        containerScene(heights, { left, right }, bestPair, null, maximum),
      ],
      focusSceneId: "container",
    },
  ];

  let step = 0;
  while (left < right) {
    const currentPair = { left, right };
    const width = right - left;
    const limitingHeight = Math.min(heights[left], heights[right]);
    const currentArea = limitingHeight * width;
    const previousMaximum = maximum;
    const improvesMaximum = currentArea > maximum;
    const establishesBest = bestPair === null || improvesMaximum;
    if (improvesMaximum) {
      maximum = currentArea;
    }
    if (establishesBest) {
      bestPair = currentPair;
    }

    frames.push({
      id: `measure-${step}`,
      phase: "Measure area",
      codeRefs: ["scan-inward", "measure-container"],
      explanation: `Walls ${left} and ${right} give min(${heights[left]}, ${heights[right]}) × ${width} = ${currentArea}. ${improvesMaximum ? "This becomes the new maximum." : `The maximum stays ${maximum}.`}`,
      changed: improvesMaximum
        ? `Raised max from ${previousMaximum} to ${maximum}.`
        : `Measured area ${currentArea}; max did not change.`,
      invariant:
        "max is the largest area among every boundary pair measured so far.",
      variables: [
        { name: "l", value: left },
        { name: "r", value: right },
        { name: "width", value: width },
        { name: "limiting height", value: limitingHeight },
        { name: "current area", value: currentArea, changed: true },
        {
          name: "max",
          value: maximum,
          previous: previousMaximum,
          changed: improvesMaximum,
        },
      ],
      scenes: [
        containerScene(
          heights,
          currentPair,
          bestPair,
          currentArea,
          maximum,
          establishesBest,
        ),
      ],
      focusSceneId: "container",
      ...(step === 0
        ? { checkpoint: nextMoveCheckpoint(heights, left, right) }
        : {}),
    });

    const previousLeft = left;
    const previousRight = right;
    const discardedHeight = Math.min(heights[left], heights[right]);
    const movedLeft = heights[left] < heights[right];
    if (movedLeft) left += 1;
    else right -= 1;

    frames.push({
      id: `move-${step}`,
      phase: "Discard limiting wall",
      codeRefs: [movedLeft ? "move-left" : "move-right"],
      explanation: movedLeft
        ? `The left wall (${heights[previousLeft]}) is shorter, so move l inward and look for a taller limiting wall.`
        : `The right wall (${heights[previousRight]}) is no taller, so the Java else branch moves r inward.`,
      changed: movedLeft
        ? `Moved l from ${previousLeft} to ${left}.`
        : `Moved r from ${previousRight} to ${right}.`,
      invariant: `Any narrower container that kept the discarded height ${discardedHeight} could not beat the pair just measured; any unseen improvement must remain between l and r.`,
      variables: [
        {
          name: "l",
          value: left,
          previous: previousLeft,
          changed: movedLeft,
        },
        {
          name: "r",
          value: right,
          previous: previousRight,
          changed: !movedLeft,
        },
        { name: "max", value: maximum },
      ],
      scenes: [
        containerScene(
          heights,
          left < right ? { left, right } : null,
          bestPair,
          null,
          maximum,
        ),
      ],
      focusSceneId: "container",
    });
    step += 1;
  }

  frames.push({
    id: "complete",
    phase: "Complete",
    codeRefs: ["return-area"],
    explanation: `The pointers have met, so return the greatest measured area: ${maximum}.`,
    changed: `Finished the search with max = ${maximum}.`,
    invariant:
      "Every possible boundary pair is either measured or safely eliminated by a limiting-wall argument.",
    variables: [
      { name: "l", value: left },
      { name: "r", value: right },
      { name: "max", value: maximum },
    ],
    scenes: [containerScene(heights, null, bestPair, null, maximum, true)],
    focusSceneId: "container",
    complete: true,
    output: maximum,
  });

  return {
    input: { heights },
    output: maximum,
    frames,
  };
}

export const containerWithMostWaterRuntime = createTraceRuntime<
  ContainerInput,
  number
>({
  definition: containerWithMostWaterDefinition,
  schema: containerInputSchema,
  parseRaw: parseRawInput,
  trace: traceContainer,
  oracle: bruteForceMaximumArea,
});

export default containerWithMostWaterRuntime;
