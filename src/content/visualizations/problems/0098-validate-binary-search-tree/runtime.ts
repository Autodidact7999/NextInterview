import { z } from "zod";

import { validateBinarySearchTreeDefinition } from "@/content/visualizations/problems/0098-validate-binary-search-tree/definition";
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
  TraceItemRole,
  TraceRun,
  TraceTreeScene,
} from "@/lib/visualizer";

const LONG_MIN = BigInt("-9223372036854775808");
const LONG_MAX = BigInt("9223372036854775807");

function hasValidCompactShape(values: readonly (number | null)[]): boolean {
  if (values.length === 0) return true;
  if (values[0] === null || values.at(-1) === null) return false;

  let availableParents = 1;
  let cursor = 1;
  while (cursor < values.length) {
    if (availableParents === 0) return false;
    availableParents -= 1;
    for (let child = 0; child < 2 && cursor < values.length; child += 1) {
      if (values[cursor] !== null) availableParents += 1;
      cursor += 1;
    }
  }
  return true;
}

const validateBinarySearchTreeInputSchema = z
  .object({
    root: z
      .array(javaInteger.nullable())
      .max(63, "The compact tree representation is too long."),
  })
  .superRefine(({ root }, context) => {
    if (root.filter((value) => value !== null).length > 31) {
      context.addIssue({
        code: "custom",
        path: ["root"],
        message: "Use at most 31 non-null tree nodes.",
      });
    }
    if (root.length > 0 && root[0] === null) {
      context.addIssue({
        code: "custom",
        path: ["root"],
        message: "Use [] for an empty tree; the root cannot be null.",
      });
      return;
    }
    if (root.at(-1) === null) {
      context.addIssue({
        code: "custom",
        path: ["root"],
        message: "Remove trailing null placeholders from the compact tree.",
      });
      return;
    }
    if (!hasValidCompactShape(root)) {
      context.addIssue({
        code: "custom",
        path: ["root"],
        message: "A value appears after every possible parent is already null.",
      });
    }
  });

type ValidateBinarySearchTreeInput = z.infer<
  typeof validateBinarySearchTreeInputSchema
>;

interface TreeNode {
  id: string;
  value: number;
  parentId: string | null;
  edgeLabel?: "left" | "right";
  left: TreeNode | null;
  right: TreeNode | null;
}

interface BuiltTree {
  root: TreeNode | null;
  nodes: readonly TreeNode[];
}

interface BoundContext {
  minimum: bigint;
  maximum: bigint;
  depth: number;
  status: "pending" | "valid" | "invalid";
}

function parseRawInput(raw: RawTraceInput): unknown {
  return {
    root: parseField(raw, "root", parseNullableIntegerArray),
  };
}

function buildTree(values: readonly (number | null)[]): BuiltTree {
  if (values.length === 0) return { root: null, nodes: [] };

  const root: TreeNode = {
    id: "node-0",
    value: values[0]!,
    parentId: null,
    left: null,
    right: null,
  };
  const nodes: TreeNode[] = [root];
  const parents: TreeNode[] = [root];
  let parentCursor = 0;
  let valueCursor = 1;

  while (valueCursor < values.length) {
    const parent = parents[parentCursor]!;
    parentCursor += 1;

    for (const side of ["left", "right"] as const) {
      if (valueCursor >= values.length) break;
      const value = values[valueCursor];
      const tokenIndex = valueCursor;
      valueCursor += 1;
      if (value === null) continue;

      const child: TreeNode = {
        id: `node-${tokenIndex}`,
        value,
        parentId: parent.id,
        edgeLabel: side,
        left: null,
        right: null,
      };
      parent[side] = child;
      nodes.push(child);
      parents.push(child);
    }
  }

  return { root, nodes };
}

function strictInorderOracle(input: ValidateBinarySearchTreeInput): boolean {
  const tree = buildTree(input.root);
  const stack: TreeNode[] = [];
  let current = tree.root;
  let previous: number | undefined;

  while (current !== null || stack.length > 0) {
    while (current !== null) {
      stack.push(current);
      current = current.left;
    }
    const node = stack.pop()!;
    if (previous !== undefined && node.value <= previous) return false;
    previous = node.value;
    current = node.right;
  }

  return true;
}

function boundLabel(bound: bigint): string {
  return bound.toString();
}

function visualBoundLabel(bound: bigint): string {
  if (bound === LONG_MIN) return "−∞";
  if (bound === LONG_MAX) return "+∞";
  return bound.toString();
}

function treeScene(
  tree: BuiltTree,
  visited: ReadonlySet<string>,
  currentId: string | null,
  currentRole: TraceItemRole = "current",
  boundsByNode: Readonly<Record<string, BoundContext>> = {},
): TraceTreeScene {
  return {
    id: "validation-tree",
    kind: "tree",
    title: "Inherited bound checks",
    description:
      currentId === null
        ? tree.root === null
          ? "The tree has no nodes, so the recursive base case succeeds immediately."
          : `${visited.size} node${visited.size === 1 ? " has" : "s have"} been checked against inherited bounds.`
        : "The active node is checked against the strict range inherited from all of its ancestors.",
    rootId: tree.root?.id ?? null,
    nodes: tree.nodes.map((node) => {
      const context = boundsByNode[node.id];
      return {
        id: node.id,
        value: node.value,
        parentId: node.parentId,
        ...(node.edgeLabel ? { edgeLabel: node.edgeLabel } : {}),
        ...(context
          ? {
              badge: `depth ${context.depth}`,
              note: `${visualBoundLabel(context.minimum)} < ${node.value} < ${visualBoundLabel(context.maximum)}${context.status === "invalid" ? " · fails" : context.status === "valid" ? " · valid" : ""}`,
            }
          : {}),
        role:
          node.id === currentId
            ? currentRole
            : context?.status === "invalid"
              ? "rejected"
              : visited.has(node.id)
                ? "visited"
                : "default",
      };
    }),
  };
}

function boundCheckpoint(
  node: TreeNode,
  minimum: bigint,
  maximum: bigint,
): TraceCheckpoint {
  const inside = BigInt(node.value) > minimum && BigInt(node.value) < maximum;
  return {
    prompt: `Does ${node.value} satisfy its inherited strict bounds (${minimum.toString()}, ${maximum.toString()})?`,
    options: [
      { id: "inside", label: "Yes — continue DFS" },
      { id: "outside", label: "No — return false" },
    ],
    answerId: inside ? "inside" : "outside",
    explanation: inside
      ? `${node.value} is strictly greater than the lower bound and strictly less than the upper bound.`
      : `A BST node must satisfy min < value < max; equality with either bound also fails.`,
  };
}

function traceValidation(input: ValidateBinarySearchTreeInput): TraceRun {
  const values = [...input.root];
  const tree = buildTree(values);
  const visited = new Set<string>();
  const boundsByNode: Record<string, BoundContext> = {};
  const frames: TraceFrame[] = [];
  const checkpointNodeId =
    tree.nodes.find((node) => node.parentId !== null)?.id ??
    tree.root?.id ??
    null;
  if (tree.root !== null) {
    boundsByNode[tree.root.id] = {
      minimum: LONG_MIN,
      maximum: LONG_MAX,
      depth: 0,
      status: "pending",
    };
  }

  frames.push({
    id: "initialize",
    phase: "Initialize bounds",
    codeRefs: ["start-with-long-bounds"],
    explanation:
      "Begin at the root with Java long limits so every possible int value starts inside the allowed range.",
    changed: "Initialized the recursive lower and upper bounds.",
    invariant:
      "Each recursive call owns the complete strict range imposed by every ancestor.",
    variables: [
      { name: "root", value: tree.root?.value ?? null },
      { name: "min (long)", value: boundLabel(LONG_MIN) },
      { name: "max (long)", value: boundLabel(LONG_MAX) },
    ],
    scenes: [
      treeScene(tree, visited, tree.root?.id ?? null, "current", boundsByNode),
    ],
    focusSceneId: "validation-tree",
    ...(tree.root === null
      ? {
          checkpoint: {
            prompt: "What does validate(null, min, max) return?",
            options: [
              { id: "true", label: "true" },
              { id: "false", label: "false" },
            ],
            answerId: "true",
            explanation:
              "An empty subtree reaches the base case and is valid by definition.",
          },
        }
      : {}),
  });

  function validate(
    node: TreeNode | null,
    minimum: bigint,
    maximum: bigint,
    depth: number,
  ): boolean {
    if (node === null) return true;

    const value = BigInt(node.value);
    const inside = value > minimum && value < maximum;
    boundsByNode[node.id] = {
      minimum,
      maximum,
      depth,
      status: inside ? "valid" : "invalid",
    };
    frames.push({
      id: `check-${node.id}`,
      phase: "Check strict bounds",
      codeRefs: ["check-strict-bounds"],
      explanation: inside
        ? `${node.value} lies strictly between ${minimum.toString()} and ${maximum.toString()}, so this node may continue.`
        : `${node.value} is outside the exclusive range (${minimum.toString()}, ${maximum.toString()}), so this call returns false.`,
      changed: inside
        ? `Accepted ${node.value} for this position.`
        : `Rejected ${node.value} and stopped this subtree.`,
      invariant:
        "A valid BST node is greater than every inherited lower bound and less than every inherited upper bound; duplicates are rejected.",
      variables: [
        { name: "node", value: node.value, changed: true },
        { name: "min (long)", value: boundLabel(minimum) },
        { name: "max (long)", value: boundLabel(maximum) },
        { name: "inside bounds", value: inside, changed: true },
        { name: "depth", value: depth },
      ],
      scenes: [
        treeScene(
          tree,
          visited,
          node.id,
          inside ? "current" : "rejected",
          boundsByNode,
        ),
      ],
      focusSceneId: "validation-tree",
      ...(node.id === checkpointNodeId
        ? { checkpoint: boundCheckpoint(node, minimum, maximum) }
        : {}),
    });

    if (!inside) return false;
    visited.add(node.id);

    if (node.left !== null) {
      boundsByNode[node.left.id] = {
        minimum,
        maximum: BigInt(node.value),
        depth: depth + 1,
        status: "pending",
      };
      frames.push({
        id: `descend-left-${node.id}`,
        phase: "Validate left subtree",
        codeRefs: ["validate-children"],
        explanation: `Search the left subtree with ${node.value} as its new exclusive upper bound.`,
        changed: `Narrowed max from ${maximum.toString()} to ${node.value}.`,
        invariant: `Every value below this left edge must remain inside (${minimum.toString()}, ${node.value}).`,
        variables: [
          { name: "parent", value: node.value },
          { name: "next node", value: node.left.value },
          { name: "min (long)", value: boundLabel(minimum) },
          {
            name: "max (long)",
            value: node.value.toString(),
            previous: boundLabel(maximum),
            changed: true,
          },
          { name: "next depth", value: depth + 1 },
        ],
        scenes: [
          treeScene(tree, visited, node.left.id, "current", boundsByNode),
        ],
        focusSceneId: "validation-tree",
      });
    }

    const leftIsValid = validate(
      node.left,
      minimum,
      BigInt(node.value),
      depth + 1,
    );
    if (!leftIsValid) {
      frames.push({
        id: `short-circuit-${node.id}`,
        phase: "Short-circuit",
        codeRefs: ["validate-children"],
        explanation:
          "The left recursive call returned false, so Java's && does not evaluate the right subtree.",
        changed: `Resolved the subtree rooted at ${node.value} as false.`,
        invariant:
          "One invalid descendant is enough to invalidate the entire tree.",
        variables: [
          { name: "node", value: node.value },
          { name: "left valid", value: false, changed: true },
          { name: "right evaluated", value: false },
          { name: "returns", value: false, changed: true },
        ],
        scenes: [treeScene(tree, visited, node.id, "rejected", boundsByNode)],
        focusSceneId: "validation-tree",
      });
      return false;
    }

    if (node.right !== null) {
      boundsByNode[node.right.id] = {
        minimum: BigInt(node.value),
        maximum,
        depth: depth + 1,
        status: "pending",
      };
      frames.push({
        id: `descend-right-${node.id}`,
        phase: "Validate right subtree",
        codeRefs: ["validate-children"],
        explanation: `The left subtree passed. Search the right subtree with ${node.value} as its new exclusive lower bound.`,
        changed: `Narrowed min from ${minimum.toString()} to ${node.value}.`,
        invariant: `Every value below this right edge must remain inside (${node.value}, ${maximum.toString()}).`,
        variables: [
          { name: "parent", value: node.value },
          { name: "left valid", value: true },
          { name: "next node", value: node.right.value },
          {
            name: "min (long)",
            value: node.value.toString(),
            previous: boundLabel(minimum),
            changed: true,
          },
          { name: "max (long)", value: boundLabel(maximum) },
          { name: "next depth", value: depth + 1 },
        ],
        scenes: [
          treeScene(tree, visited, node.right.id, "current", boundsByNode),
        ],
        focusSceneId: "validation-tree",
      });
    }

    const rightIsValid = validate(
      node.right,
      BigInt(node.value),
      maximum,
      depth + 1,
    );
    frames.push({
      id: `return-${node.id}`,
      phase: "Resolve subtree",
      codeRefs: ["validate-children"],
      explanation: rightIsValid
        ? `Both child calls for ${node.value} returned true, so this subtree is valid.`
        : `The right child call for ${node.value} returned false, so this subtree is invalid.`,
      changed: `Resolved the subtree rooted at ${node.value} as ${rightIsValid}.`,
      invariant:
        "A subtree is valid only when its root fits its range and both recursive child checks succeed.",
      variables: [
        { name: "node", value: node.value },
        { name: "left valid", value: true },
        { name: "right valid", value: rightIsValid, changed: true },
        { name: "returns", value: rightIsValid, changed: true },
      ],
      scenes: [
        treeScene(
          tree,
          visited,
          node.id,
          rightIsValid ? "accepted" : "rejected",
          boundsByNode,
        ),
      ],
      focusSceneId: "validation-tree",
    });
    return rightIsValid;
  }

  const output = validate(tree.root, LONG_MIN, LONG_MAX, 0);
  frames.push({
    id: "complete",
    phase: "Complete",
    codeRefs: ["start-with-long-bounds"],
    explanation: output
      ? "Every evaluated node stayed within its inherited strict range, so the tree is a valid BST."
      : "A node violated an inherited strict range, so the tree is not a valid BST.",
    changed: `Returned ${output} for the complete tree.`,
    invariant: output
      ? "Strict ancestor bounds hold throughout the tree, which is equivalent to a strictly increasing inorder traversal."
      : "At least one node breaks the global ordering required by a binary search tree.",
    variables: [
      { name: "visited nodes", value: visited.size },
      { name: "result", value: output, changed: true },
    ],
    scenes: [
      treeScene(
        tree,
        visited,
        tree.root?.id ?? null,
        output ? "accepted" : "rejected",
        boundsByNode,
      ),
    ],
    focusSceneId: "validation-tree",
    complete: true,
    output,
  });

  return {
    input: { root: values },
    output,
    frames,
  };
}

export const validateBinarySearchTreeRuntime = createTraceRuntime<
  ValidateBinarySearchTreeInput,
  boolean
>({
  definition: validateBinarySearchTreeDefinition,
  schema: validateBinarySearchTreeInputSchema,
  parseRaw: parseRawInput,
  trace: traceValidation,
  oracle: strictInorderOracle,
});

export default validateBinarySearchTreeRuntime;
