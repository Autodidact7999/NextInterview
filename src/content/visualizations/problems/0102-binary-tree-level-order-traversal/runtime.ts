import { z } from "zod";

import { binaryTreeLevelOrderTraversalDefinition } from "@/content/visualizations/problems/0102-binary-tree-level-order-traversal/definition";
import {
  createTraceRuntime,
  javaInteger,
  parseField,
  parseNullableIntegerArray,
} from "@/lib/visualizer";
import type {
  RawTraceInput,
  TraceCheckpoint,
  TraceFrame,
  TraceRun,
  TraceSequenceItem,
  TraceSequenceScene,
  TraceTreeScene,
} from "@/lib/visualizer";

type CompactTree = readonly (number | null)[];

interface TreeNodeSnapshot {
  id: string;
  value: number;
  parentId: string | null;
  edgeLabel: "left" | "right" | null;
  leftId: string | null;
  rightId: string | null;
}

interface DecodedTree {
  nodes: readonly TreeNodeSnapshot[];
  rootId: string | null;
}

function treeShapeIssue(values: CompactTree): string | null {
  if (values.length === 0) return null;
  if (values[0] === null) {
    return "A non-empty level-order tree must begin with a non-null root.";
  }
  if (values.at(-1) === null) {
    return "Remove trailing null markers from the compact level-order input.";
  }

  let cursor = 1;
  let availableParents = 1;
  while (cursor < values.length && availableParents > 0) {
    availableParents -= 1;
    for (let child = 0; child < 2 && cursor < values.length; child += 1) {
      if (values[cursor] !== null) availableParents += 1;
      cursor += 1;
    }
  }

  return cursor === values.length
    ? null
    : "The input contains a node whose parent is null or missing.";
}

const binaryTreeLevelOrderInputSchema = z
  .object({
    root: z.array(javaInteger.nullable()),
  })
  .superRefine(({ root }, context) => {
    const nonNullCount = root.reduce<number>(
      (count, value) => count + (value === null ? 0 : 1),
      0,
    );
    if (nonNullCount > 31) {
      context.addIssue({
        code: "custom",
        path: ["root"],
        message: "Use at most 31 non-null tree nodes.",
      });
    }

    const shapeIssue = treeShapeIssue(root);
    if (shapeIssue) {
      context.addIssue({
        code: "custom",
        path: ["root"],
        message: shapeIssue,
      });
    }
  });

type BinaryTreeLevelOrderInput = z.infer<
  typeof binaryTreeLevelOrderInputSchema
>;

function parseRawInput(raw: RawTraceInput): unknown {
  return {
    root: parseField(raw, "root", parseNullableIntegerArray),
  };
}

function decodeTree(values: CompactTree): DecodedTree {
  if (values.length === 0) return { nodes: [], rootId: null };

  const nodes: TreeNodeSnapshot[] = [
    {
      id: "node-0",
      value: values[0]!,
      parentId: null,
      edgeLabel: null,
      leftId: null,
      rightId: null,
    },
  ];
  const queue: TreeNodeSnapshot[] = [nodes[0]!];
  let cursor = 1;

  while (cursor < values.length) {
    const parent = queue.shift()!;
    for (const side of ["left", "right"] as const) {
      if (cursor >= values.length) break;
      const value = values[cursor];
      const tokenIndex = cursor;
      cursor += 1;
      if (value === null) continue;

      const node: TreeNodeSnapshot = {
        id: `node-${tokenIndex}`,
        value,
        parentId: parent.id,
        edgeLabel: side,
        leftId: null,
        rightId: null,
      };
      if (side === "left") parent.leftId = node.id;
      else parent.rightId = node.id;
      nodes.push(node);
      queue.push(node);
    }
  }

  return { nodes, rootId: "node-0" };
}

function nodeById(tree: DecodedTree, id: string): TreeNodeSnapshot {
  const node = tree.nodes.find((candidate) => candidate.id === id);
  if (!node) throw new Error(`Unknown tree node ${id}.`);
  return node;
}

function depthFirstOracle({
  root,
}: BinaryTreeLevelOrderInput): readonly (readonly number[])[] {
  const tree = decodeTree(root);
  const levels: number[][] = [];

  const visit = (nodeId: string | null, depth: number): void => {
    if (nodeId === null) return;
    const node = nodeById(tree, nodeId);
    if (!levels[depth]) levels[depth] = [];
    levels[depth]!.push(node.value);
    visit(node.leftId, depth + 1);
    visit(node.rightId, depth + 1);
  };

  visit(tree.rootId, 0);
  return levels;
}

function treeScene(
  tree: DecodedTree,
  queueIds: readonly string[],
  processedIds: readonly string[],
  currentId: string | null,
): TraceTreeScene {
  return {
    id: "tree-state",
    kind: "tree",
    title: "Tree traversal state",
    description:
      tree.rootId === null
        ? "The tree has no root node."
        : "Current marks the polled node, candidates are queued, and visited nodes already belong to completed or active levels.",
    nodes: tree.nodes.map((node) => ({
      id: node.id,
      value: node.value,
      parentId: node.parentId,
      ...(node.edgeLabel === null ? {} : { edgeLabel: node.edgeLabel }),
      role:
        node.id === currentId
          ? "current"
          : processedIds.includes(node.id)
            ? "visited"
            : queueIds.includes(node.id)
              ? "candidate"
              : "default",
    })),
    rootId: tree.rootId,
  };
}

function queueScene(
  tree: DecodedTree,
  queueIds: readonly string[],
): TraceSequenceScene {
  return {
    id: "bfs-queue",
    kind: "sequence",
    title: "BFS queue",
    description:
      queueIds.length === 0
        ? "The queue is empty."
        : "The next poll is at the left; newly discovered children join at the right.",
    items: queueIds.map((id, index) => {
      const node = nodeById(tree, id);
      return {
        id: `queued-${id}`,
        label: index === 0 ? `front · ${id}` : id,
        value: node.value,
        role: index === 0 ? "current" : "candidate",
      };
    }),
    ...(queueIds.length > 0
      ? {
          pointers: [{ id: "queue-front", label: "front", index: 0 }],
        }
      : {}),
  };
}

function resultScene(
  levels: readonly (readonly number[])[],
  activeLevel: readonly number[] | null,
): TraceSequenceScene {
  const items: TraceSequenceItem[] = levels.map((level, index) => ({
    id: `result-level-${index}`,
    label: `level ${index}`,
    value: `[${level.join(", ")}]`,
    role: "accepted",
  }));

  if (activeLevel !== null) {
    items.push({
      id: `working-level-${levels.length}`,
      label: `level ${levels.length} · building`,
      value: `[${activeLevel.join(", ")}]`,
      role: "current",
    });
  }

  return {
    id: "result-levels",
    kind: "sequence",
    title: "Result by depth",
    description:
      activeLevel === null
        ? levels.length === 0
          ? "No levels have been recorded."
          : "Every displayed level is complete."
        : "Completed levels come first; the final row is the level currently being built.",
    items,
  };
}

function scenes(
  tree: DecodedTree,
  queueIds: readonly string[],
  processedIds: readonly string[],
  levels: readonly (readonly number[])[],
  activeLevel: readonly number[] | null,
  currentId: string | null = null,
) {
  return [
    treeScene(tree, queueIds, processedIds, currentId),
    queueScene(tree, queueIds),
    resultScene(levels, activeLevel),
  ] as const;
}

function emptyTreeCheckpoint(): TraceCheckpoint {
  return {
    prompt: "The root is null. How many nodes can enter the BFS queue?",
    options: [
      { id: "zero", label: "0 nodes" },
      { id: "one", label: "1 placeholder node" },
      { id: "unknown", label: "It depends on children" },
    ],
    answerId: "zero",
    explanation:
      "The Java null-root guard returns the empty result before the queue is created or seeded.",
  };
}

function nextQueueNodeCheckpoint(
  tree: DecodedTree,
  queueIds: readonly string[],
  levelSize: number,
): TraceCheckpoint {
  const front = nodeById(tree, queueIds[0]!);
  return {
    prompt: `The code freezes sz = ${levelSize}. Which node does q.poll() remove first?`,
    options: [
      { id: "front", label: `Queue front (${front.value})` },
      { id: "back", label: "Queue back" },
      { id: "recount", label: "Recount after enqueues" },
    ],
    answerId: "front",
    explanation:
      "A queue removes its front node. The frozen size controls how many nodes belong to this level, even while their children are appended behind them.",
  };
}

function traceLevelOrder(input: BinaryTreeLevelOrderInput): TraceRun {
  const root = [...input.root];
  const tree = decodeTree(root);
  const outputLevels: number[][] = [];
  const queueIds: string[] = [];
  const processedIds: string[] = [];
  const frames: TraceFrame[] = [
    {
      id: "initialize-result",
      phase: "Initialize",
      codeRefs: ["initialize-result"],
      explanation: "Create an empty outer list for the level-by-level result.",
      changed: "Initialized res as an empty list.",
      invariant:
        "res contains every fully completed tree level in increasing depth order.",
      variables: [
        { name: "res", value: [] },
        { name: "root", value: tree.rootId === null ? null : root[0]! },
      ],
      scenes: scenes(tree, queueIds, processedIds, outputLevels, null),
      focusSceneId: "tree-state",
      ...(tree.rootId === null ? { checkpoint: emptyTreeCheckpoint() } : {}),
    },
  ];

  if (tree.rootId === null) {
    const output: readonly (readonly number[])[] = [];
    frames.push({
      id: "complete-empty",
      phase: "Complete",
      codeRefs: ["return-empty"],
      explanation:
        "The null-root guard returns immediately, so the traversal has no levels.",
      changed: "Returned the unchanged empty result.",
      invariant: "An empty tree has exactly zero levels.",
      variables: [
        { name: "root", value: null },
        { name: "result", value: output, changed: true },
      ],
      scenes: scenes(tree, queueIds, processedIds, outputLevels, null),
      focusSceneId: "tree-state",
      complete: true,
      output,
    });
    return { input: { root }, output, frames };
  }

  queueIds.push(tree.rootId);
  frames.push({
    id: "seed-queue",
    phase: "Initialize queue",
    codeRefs: ["create-queue", "offer-root"],
    explanation:
      "Create the FIFO queue and seed it with the root, the only node at depth zero.",
    changed: `Enqueued root value ${nodeById(tree, tree.rootId).value}.`,
    invariant:
      "The queue stores discovered, unprocessed nodes in breadth-first order.",
    variables: [
      { name: "queue size", value: 1, previous: 0, changed: true },
      { name: "queue front", value: nodeById(tree, tree.rootId).value },
    ],
    scenes: scenes(tree, queueIds, processedIds, outputLevels, null),
    focusSceneId: "tree-state",
  });

  let depth = 0;
  let checkpointAdded = false;

  while (queueIds.length > 0) {
    const levelSize = queueIds.length;
    const level: number[] = [];

    frames.push({
      id: `level-${depth}-start`,
      phase: "Freeze level",
      codeRefs: ["check-queue", "snapshot-size", "create-level"],
      explanation: `Snapshot sz = ${levelSize}. Exactly ${levelSize} queued node${levelSize === 1 ? "" : "s"} belong${levelSize === 1 ? "s" : ""} to depth ${depth}.`,
      changed: `Started level ${depth} with a fixed size of ${levelSize}.`,
      invariant:
        "Only the nodes present when sz is captured belong to the active level; children enqueued later belong to the next level.",
      variables: [
        { name: "depth", value: depth },
        { name: "sz", value: levelSize, changed: true },
        { name: "level", value: [] },
        {
          name: "queue",
          value: queueIds.map((id) => nodeById(tree, id).value),
        },
      ],
      scenes: scenes(tree, queueIds, processedIds, outputLevels, level),
      focusSceneId: "tree-state",
      ...(!checkpointAdded
        ? {
            checkpoint: nextQueueNodeCheckpoint(tree, queueIds, levelSize),
          }
        : {}),
    });
    checkpointAdded = true;

    for (let index = 0; index < levelSize; index += 1) {
      const queueBefore = queueIds.map((id) => nodeById(tree, id).value);
      const currentId = queueIds.shift()!;
      const current = nodeById(tree, currentId);
      const previousLevel = [...level];
      level.push(current.value);
      const discovered: { side: "left" | "right"; value: number }[] = [];
      const codeRefs = ["iterate-level", "poll-node", "record-value"];
      for (const [side, childId, anchor] of [
        ["left", current.leftId, "enqueue-left"],
        ["right", current.rightId, "enqueue-right"],
      ] as const) {
        if (childId === null) continue;
        queueIds.push(childId);
        discovered.push({ side, value: nodeById(tree, childId).value });
        codeRefs.push(anchor);
      }

      const discoveredText =
        discovered.length === 0
          ? "It has no children to enqueue."
          : `Enqueue ${discovered.map(({ side, value }) => `${side} ${value}`).join(" and ")} for the next level.`;
      const queueAfter = queueIds.map((id) => nodeById(tree, id).value);
      frames.push({
        id: `level-${depth}-visit-${index}`,
        phase: "Visit node",
        codeRefs,
        explanation: `Poll ${current.value} as node ${index + 1} of ${levelSize}, append it to level ${depth}. ${discoveredText}`,
        changed: `Recorded ${current.value}; the queue is now [${queueAfter.join(", ")}].`,
        invariant:
          "The frozen sz keeps newly enqueued children out of the active level, while FIFO order preserves left-to-right traversal.",
        variables: [
          { name: "i", value: index },
          { name: "node.val", value: current.value, changed: true },
          {
            name: "level",
            value: [...level],
            previous: previousLevel,
            changed: true,
          },
          {
            name: "queue",
            value: queueAfter,
            previous: queueBefore,
            changed: true,
          },
        ],
        scenes: scenes(
          tree,
          queueIds,
          processedIds,
          outputLevels,
          level,
          currentId,
        ),
        focusSceneId: "tree-state",
      });

      processedIds.push(currentId);
    }

    outputLevels.push([...level]);
    frames.push({
      id: `level-${depth}-complete`,
      phase: "Finish level",
      codeRefs: ["finish-level"],
      explanation: `All ${levelSize} nodes captured by sz have been processed. Append [${level.join(", ")}] to res.`,
      changed: `Committed level ${depth}; res now contains ${outputLevels.length} level${outputLevels.length === 1 ? "" : "s"}.`,
      invariant:
        "res contains every completed depth in order, while the queue contains only nodes for the next depth.",
      variables: [
        { name: "completed depth", value: depth, changed: true },
        { name: "level", value: [...level] },
        {
          name: "res",
          value: outputLevels.map((row) => [...row]),
          changed: true,
        },
        { name: "queue size", value: queueIds.length },
      ],
      scenes: scenes(tree, queueIds, processedIds, outputLevels, null),
      focusSceneId: "tree-state",
    });

    depth += 1;
  }

  const output = outputLevels.map((level) => [...level]);
  frames.push({
    id: "complete",
    phase: "Complete",
    codeRefs: ["check-queue", "finish-level"],
    explanation:
      "The queue is empty, so every reachable node has been recorded at its breadth-first depth.",
    changed: `Returned ${output.length} completed level${output.length === 1 ? "" : "s"}.`,
    invariant:
      "Every tree node appears exactly once, and rows are ordered from the root depth downward.",
    variables: [
      { name: "queue size", value: 0 },
      { name: "result", value: output, changed: true },
    ],
    scenes: scenes(tree, queueIds, processedIds, outputLevels, null),
    focusSceneId: "tree-state",
    complete: true,
    output,
  });

  return { input: { root }, output, frames };
}

export const binaryTreeLevelOrderTraversalRuntime = createTraceRuntime<
  BinaryTreeLevelOrderInput,
  readonly (readonly number[])[]
>({
  definition: binaryTreeLevelOrderTraversalDefinition,
  schema: binaryTreeLevelOrderInputSchema,
  parseRaw: parseRawInput,
  trace: traceLevelOrder,
  oracle: depthFirstOracle,
});

export default binaryTreeLevelOrderTraversalRuntime;
