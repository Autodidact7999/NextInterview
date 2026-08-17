import { z } from "zod";

import { maximumDepthOfBinaryTreeDefinition } from "@/content/visualizations/problems/0104-maximum-depth-of-binary-tree/definition";
import { parseNullableIntegerArray } from "@/lib/visualizer/parsers";
import { createTraceRuntime, parseField } from "@/lib/visualizer/runtime";
import type {
  RawTraceInput,
  TraceCheckpoint,
  TraceFrame,
  TraceItemRole,
  TraceRun,
  TraceStackScene,
  TraceTreeNode,
  TraceTreeScene,
  TraceVariable,
} from "@/lib/visualizer/types";

const JAVA_INT_MIN = -2_147_483_648;
const JAVA_INT_MAX = 2_147_483_647;

function compactTreeIssue(values: readonly (number | null)[]): string | null {
  if (values.length === 0) return null;
  if (values[0] === null) {
    return "Use [] for an empty tree; a null root cannot have descendants.";
  }
  if (values.at(-1) === null) {
    return "Omit trailing null entries from the compact level-order form.";
  }

  let availableParents = 1;
  let cursor = 1;
  while (cursor < values.length) {
    if (availableParents === 0) {
      return "A value appears after every available parent slot was closed.";
    }
    availableParents -= 1;
    for (let child = 0; child < 2 && cursor < values.length; child += 1) {
      if (values[cursor] !== null) availableParents += 1;
      cursor += 1;
    }
  }
  return null;
}

const maximumDepthInputSchema = z
  .object({
    root: z.array(
      z
        .number()
        .int("Each node value must be an integer.")
        .min(JAVA_INT_MIN, "Each node value must fit in a Java int.")
        .max(JAVA_INT_MAX, "Each node value must fit in a Java int.")
        .nullable(),
    ),
  })
  .superRefine(({ root }, context) => {
    if (root.filter((value) => value !== null).length > 31) {
      context.addIssue({
        code: "custom",
        path: ["root"],
        message: "Use at most 31 non-null tree nodes.",
      });
    }
    const issue = compactTreeIssue(root);
    if (issue !== null) {
      context.addIssue({ code: "custom", path: ["root"], message: issue });
    }
  });

type MaximumDepthInput = z.infer<typeof maximumDepthInputSchema>;

interface DepthTreeNode {
  id: string;
  tokenIndex: number;
  value: number;
  parentId: string | null;
  edgeLabel: "left" | "right" | null;
  left: DepthTreeNode | null;
  right: DepthTreeNode | null;
}

interface CallState {
  id: string;
  nodeId: string | null;
  nodeValue: number | null;
  stage: "checking" | "waiting-left" | "waiting-right" | "returning";
  leftDepth: number | null;
  rightDepth: number | null;
  result: number | null;
}

function parseRawInput(raw: RawTraceInput): unknown {
  return {
    root: parseField(raw, "root", parseNullableIntegerArray),
  };
}

function buildTree(values: readonly (number | null)[]): DepthTreeNode | null {
  const rootValue = values[0];
  if (rootValue === undefined || rootValue === null) return null;

  const root: DepthTreeNode = {
    id: "node-0",
    tokenIndex: 0,
    value: rootValue,
    parentId: null,
    edgeLabel: null,
    left: null,
    right: null,
  };
  const queue: DepthTreeNode[] = [root];
  let parentIndex = 0;
  let cursor = 1;

  while (cursor < values.length) {
    const parent = queue[parentIndex];
    if (parent === undefined) break;
    parentIndex += 1;

    const leftValue = values[cursor];
    if (leftValue !== undefined && leftValue !== null) {
      parent.left = {
        id: `node-${cursor}`,
        tokenIndex: cursor,
        value: leftValue,
        parentId: parent.id,
        edgeLabel: "left",
        left: null,
        right: null,
      };
      queue.push(parent.left);
    }
    cursor += 1;

    const rightValue = values[cursor];
    if (rightValue !== undefined && rightValue !== null) {
      parent.right = {
        id: `node-${cursor}`,
        tokenIndex: cursor,
        value: rightValue,
        parentId: parent.id,
        edgeLabel: "right",
        left: null,
        right: null,
      };
      queue.push(parent.right);
    }
    cursor += 1;
  }

  return root;
}

function breadthFirstNodes(root: DepthTreeNode | null): DepthTreeNode[] {
  if (root === null) return [];
  const result: DepthTreeNode[] = [];
  const queue = [root];
  for (let index = 0; index < queue.length; index += 1) {
    const node = queue[index];
    if (node === undefined) continue;
    result.push(node);
    if (node.left !== null) queue.push(node.left);
    if (node.right !== null) queue.push(node.right);
  }
  return result;
}

function breadthFirstDepth(input: MaximumDepthInput): number {
  const root = buildTree(input.root);
  if (root === null) return 0;
  let depth = 0;
  let level: DepthTreeNode[] = [root];
  while (level.length > 0) {
    depth += 1;
    const next: DepthTreeNode[] = [];
    for (const node of level) {
      if (node.left !== null) next.push(node.left);
      if (node.right !== null) next.push(node.right);
    }
    level = next;
  }
  return depth;
}

function treeScene(
  root: DepthTreeNode | null,
  stack: readonly CallState[],
  returnedDepths: Readonly<Record<string, number>>,
  title: string,
  description: string,
): TraceTreeScene {
  const activeIds = new Set(
    stack.flatMap((call) => (call.nodeId === null ? [] : [call.nodeId])),
  );
  const currentId = stack.at(-1)?.nodeId ?? null;
  const nodes: TraceTreeNode[] = breadthFirstNodes(root).map((node) => {
    const activeIndex = stack.findIndex((call) => call.nodeId === node.id);
    const returnedDepth = returnedDepths[node.id];
    let role: TraceItemRole = "default";
    if (node.id === currentId) role = "current";
    else if (returnedDepth !== undefined) role = "visited";
    else if (activeIds.has(node.id)) role = "candidate";

    return {
      id: node.id,
      value: node.value,
      parentId: node.parentId,
      role,
      ...(node.edgeLabel === null ? {} : { edgeLabel: node.edgeLabel }),
      ...(returnedDepth !== undefined
        ? {
            badge: `depth ${returnedDepth}`,
            note: `This subtree has resolved depth ${returnedDepth}.`,
          }
        : activeIndex >= 0
          ? {
              badge: `level ${activeIndex + 1}`,
              note: "This recursive call is still waiting for child depths.",
            }
          : {}),
    };
  });

  return {
    id: "tree-state",
    kind: "tree",
    title,
    description,
    nodes,
    rootId: root?.id ?? null,
  };
}

function callLabel(call: CallState): string {
  const target = call.nodeValue === null ? "null" : String(call.nodeValue);
  if (call.result !== null) return `maxDepth(${target}) → ${call.result}`;
  if (call.stage === "waiting-right") {
    return `maxDepth(${target}) · left = ${call.leftDepth ?? 0}`;
  }
  if (call.stage === "waiting-left") {
    return `maxDepth(${target}) · explore left`;
  }
  return `maxDepth(${target}) · check base case`;
}

function stackScene(
  stack: readonly CallState[],
  title: string,
  description: string,
): TraceStackScene {
  return {
    id: "call-stack",
    kind: "stack",
    title,
    description,
    items: stack.map((call, index) => ({
      id: call.id,
      label: `call ${index + 1}`,
      value: callLabel(call),
      role: index === stack.length - 1 ? "current" : "candidate",
    })),
    topLabel: "active call",
  };
}

function variables(
  stack: readonly CallState[],
  changed: readonly string[],
): readonly TraceVariable[] {
  const call = stack.at(-1);
  const changedSet = new Set(changed);
  return [
    {
      name: "root",
      value: call?.nodeValue ?? null,
      changed: changedSet.has("root"),
    },
    {
      name: "leftDepth",
      value: call?.leftDepth ?? null,
      changed: changedSet.has("leftDepth"),
    },
    {
      name: "rightDepth",
      value: call?.rightDepth ?? null,
      changed: changedSet.has("rightDepth"),
    },
    {
      name: "returnDepth",
      value: call?.result ?? null,
      changed: changedSet.has("returnDepth"),
    },
    {
      name: "stackHeight",
      value: stack.length,
      changed: changedSet.has("stackHeight"),
    },
  ];
}

function returnCheckpoint(
  nodeValue: number | null,
  leftDepth: number,
  rightDepth: number,
): TraceCheckpoint {
  const answer = nodeValue === null ? 0 : 1 + Math.max(leftDepth, rightDepth);
  const distractor = nodeValue === null ? 1 : leftDepth + rightDepth;
  return {
    prompt:
      nodeValue === null
        ? "This call received null. Which depth will it return?"
        : `The call at node ${nodeValue} has left depth ${leftDepth} and right depth ${rightDepth}. What returns?`,
    options: [
      { id: "maximum-plus-one", label: String(answer) },
      { id: "sum", label: String(distractor) },
      { id: "maximum-only", label: String(Math.max(leftDepth, rightDepth)) },
    ].filter(
      (option, index, options) =>
        options.findIndex((candidate) => candidate.label === option.label) ===
        index,
    ),
    answerId: "maximum-plus-one",
    explanation:
      nodeValue === null
        ? "The Java base case returns 0 for a null subtree."
        : "The current node contributes one level above the deeper of its two subtrees.",
  };
}

function traceMaximumDepth(input: MaximumDepthInput): TraceRun {
  const root = buildTree(input.root);
  const frames: TraceFrame[] = [];
  const stack: CallState[] = [];
  const returnedDepths: Record<string, number> = {};
  let callNumber = 0;
  let checkpointAdded = false;

  frames.push({
    id: "setup",
    phase: "Prepare DFS",
    codeRefs: ["base-case", "combine-depths"],
    explanation:
      root === null
        ? "The tree has no root, so the first recursive call receives null."
        : `Begin at root ${root.value}; each call will ask both children for their depths.`,
    changed:
      "The recursion stack is ready and no subtree depth has returned yet.",
    invariant:
      "A call returns the number of nodes on the longest downward path beginning at its subtree root.",
    variables: variables(stack, ["stackHeight"]),
    scenes: [
      treeScene(
        root,
        stack,
        returnedDepths,
        "Input tree",
        "No node has returned a depth yet.",
      ),
      stackScene(
        stack,
        "Recursion stack",
        "The stack is empty before maxDepth(root) begins.",
      ),
    ],
    focusSceneId: "tree-state",
    ...(root === null ? { checkpoint: returnCheckpoint(null, 0, 0) } : {}),
  });

  const visit = (node: DepthTreeNode | null): number => {
    if (node === null) return 0;

    const call: CallState = {
      id: `call-${callNumber}`,
      nodeId: node.id,
      nodeValue: node.value,
      stage: "checking",
      leftDepth: null,
      rightDepth: null,
      result: null,
    };
    callNumber += 1;
    stack.push(call);

    frames.push({
      id: `enter-${call.id}`,
      phase: "Check base case",
      codeRefs: ["base-case"],
      explanation: `The call received node ${node.value}, so it continues to the recursive return expression. Null children return 0 without adding visual steps.`,
      changed: `Push node ${node.value} onto the recursion stack.`,
      invariant:
        "Every active call still owns exactly one subtree, and completed child calls return their exact subtree depths.",
      variables: variables(stack, ["root", "stackHeight"]),
      scenes: [
        treeScene(
          root,
          stack,
          returnedDepths,
          "Current subtree",
          `Node ${node.value} is the root of the active subtree.`,
        ),
        stackScene(
          stack,
          "Recursive descent",
          "The newest call is shown at the top.",
        ),
      ],
      focusSceneId: "tree-state",
    });

    call.stage = "waiting-left";
    const leftDepth = visit(node.left);
    call.leftDepth = leftDepth;
    call.stage = "waiting-right";
    if (node.left !== null || node.right !== null) {
      frames.push({
        id: `left-${node.id}`,
        phase: "Receive left depth",
        codeRefs: ["combine-depths"],
        explanation: `The left subtree of node ${node.value} returned depth ${leftDepth}; now evaluate the right subtree. A missing child contributes 0 without a separate frame.`,
        changed: `leftDepth for node ${node.value} becomes ${leftDepth}.`,
        invariant:
          "The stored left depth is final, while the right recursive call will independently measure the other subtree.",
        variables: variables(stack, ["leftDepth"]),
        scenes: [
          treeScene(
            root,
            stack,
            returnedDepths,
            "Left subtree complete",
            `Node ${node.value} retains left depth ${leftDepth} while DFS moves right.`,
          ),
          stackScene(
            stack,
            "Resume parent call",
            "The parent call holds its left result before descending right.",
          ),
        ],
        focusSceneId: "tree-state",
      });
    }

    const rightDepth = visit(node.right);
    call.rightDepth = rightDepth;
    call.result = 1 + Math.max(leftDepth, rightDepth);
    call.stage = "returning";
    returnedDepths[node.id] = call.result;
    const checkpoint = checkpointAdded
      ? null
      : returnCheckpoint(node.value, leftDepth, rightDepth);
    checkpointAdded = true;
    frames.push({
      id: `return-${node.id}`,
      phase: "Combine depths",
      codeRefs: ["combine-depths"],
      explanation: `Node ${node.value} adds its own level to max(${leftDepth}, ${rightDepth}), returning ${call.result}.`,
      changed: `rightDepth becomes ${rightDepth}; returnDepth becomes ${call.result}.`,
      invariant:
        "A non-null subtree depth is one plus the larger of its independently correct child depths.",
      variables: variables(stack, ["rightDepth", "returnDepth"]),
      scenes: [
        treeScene(
          root,
          stack,
          returnedDepths,
          "Subtree depth resolved",
          `The subtree rooted at ${node.value} is now known to have depth ${call.result}.`,
        ),
        stackScene(
          stack,
          "Return to caller",
          "The top call carries the resolved subtree depth back to its parent.",
        ),
      ],
      focusSceneId: "tree-state",
      ...(checkpoint === null ? {} : { checkpoint }),
    });
    stack.pop();
    return call.result;
  };

  const output = visit(root);
  frames.push({
    id: "complete",
    phase: "Complete",
    codeRefs: root === null ? ["base-case"] : ["combine-depths"],
    explanation:
      root === null
        ? "The root call returned the base depth 0."
        : `The root call returned ${output}, the longest root-to-leaf node count.`,
    changed: `Return the maximum depth ${output}.`,
    invariant:
      "Every reachable node was evaluated once, and the root result equals the tree's maximum level count.",
    variables: [
      { name: "root", value: root?.value ?? null, changed: false },
      { name: "leftDepth", value: null, changed: false },
      { name: "rightDepth", value: null, changed: false },
      { name: "returnDepth", value: output, changed: true },
      { name: "stackHeight", value: 0, changed: true },
    ],
    scenes: [
      treeScene(
        root,
        stack,
        returnedDepths,
        "Maximum depth found",
        root === null
          ? "The empty tree has zero levels."
          : `All subtree results combine into a maximum depth of ${output}.`,
      ),
      stackScene(
        stack,
        "Recursion complete",
        "Every call has returned, so the stack is empty.",
      ),
    ],
    focusSceneId: "tree-state",
    complete: true,
    output,
  });

  return {
    input: { root: [...input.root] },
    output,
    frames,
  };
}

export const maximumDepthOfBinaryTreeRuntime = createTraceRuntime<
  MaximumDepthInput,
  number
>({
  definition: maximumDepthOfBinaryTreeDefinition,
  schema: maximumDepthInputSchema,
  parseRaw: parseRawInput,
  trace: traceMaximumDepth,
  oracle: breadthFirstDepth,
});

export default maximumDepthOfBinaryTreeRuntime;
