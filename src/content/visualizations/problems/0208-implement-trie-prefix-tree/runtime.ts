import { z } from "zod";

import definition from "@/content/visualizations/problems/0208-implement-trie-prefix-tree/definition";
import { createTraceRuntime, parseField } from "@/lib/visualizer";
import type {
  RawTraceInput,
  TraceCheckpoint,
  TraceFrame,
  TraceRun,
  TraceSequenceScene,
  TraceTrieScene,
} from "@/lib/visualizer";

const operationSchema = z.object({
  op: z.enum(["insert", "search", "startsWith"]),
  word: z
    .string()
    .min(1, "Words cannot be empty.")
    .max(20, "Words may contain at most 20 letters.")
    .regex(/^[a-z]+$/, "Words may contain only lowercase a–z letters."),
});

const inputSchema = z.object({
  operations: z
    .array(operationSchema)
    .min(1, "Enter at least one operation.")
    .max(40, "Use at most 40 operations."),
});

type TrieInput = z.infer<typeof inputSchema>;
type TrieOperation = TrieInput["operations"][number];
type TrieOutput = readonly (boolean | null)[];

interface TrieNode {
  id: string;
  path: string;
  terminal: boolean;
  children: Map<string, TrieNode>;
}

function parseOperations(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error("Enter a valid JSON array of operations.");
  }
}

function parseRaw(raw: RawTraceInput): unknown {
  return {
    operations: parseField(raw, "operations", parseOperations),
  };
}

function createNode(path: string): TrieNode {
  return {
    id: path ? `node-${path}` : "root",
    path,
    terminal: false,
    children: new Map(),
  };
}

function collectNodes(root: TrieNode): TrieNode[] {
  const nodes: TrieNode[] = [];
  const visit = (node: TrieNode) => {
    nodes.push(node);
    [...node.children.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .forEach(([, child]) => visit(child));
  };
  visit(root);
  return nodes;
}

function trieScene(
  root: TrieNode,
  activeWord = "",
  rejectedPath: string | null = null,
): TraceTrieScene {
  const nodes = collectNodes(root);
  const missingNode =
    rejectedPath === null
      ? null
      : {
          id: `ghost-${rejectedPath}`,
          parentId:
            rejectedPath.length === 1
              ? root.id
              : `node-${rejectedPath.slice(0, -1)}`,
          edgeLabel: rejectedPath.at(-1) ?? "",
          value: rejectedPath.at(-1) ?? "?",
          badge: "missing",
          note: `No edge continues the matched prefix to “${rejectedPath}”.`,
          role: "rejected" as const,
        };
  return {
    id: "trie",
    kind: "trie",
    title: "Prefix tree",
    description:
      "A word badge marks a terminal node; shared prefixes reuse the same character path, and a rejected missing node explains failed traversal.",
    rootId: root.id,
    nodes: [
      ...nodes.map((node) => {
        const parentPath = node.path.slice(0, -1);
        const onActivePath =
          node.path.length > 0 && activeWord.startsWith(node.path);
        return {
          id: node.id,
          parentId:
            node === root ? null : parentPath ? `node-${parentPath}` : root.id,
          ...(node === root ? {} : { edgeLabel: node.path.at(-1) ?? "" }),
          value: node === root ? "root" : (node.path.at(-1) ?? ""),
          ...(node.terminal ? { badge: "word" } : {}),
          ...(node === root
            ? { note: "All words share this root." }
            : {
                note: node.terminal
                  ? `“${node.path}” is a complete stored word.`
                  : `“${node.path}” is a stored prefix.`,
              }),
          role:
            node.path === activeWord
              ? ("current" as const)
              : onActivePath
                ? ("visited" as const)
                : ("default" as const),
        };
      }),
      ...(missingNode === null ? [] : [missingNode]),
    ],
  };
}

function operationScene(
  operations: readonly TrieOperation[],
  current: number,
): TraceSequenceScene {
  return {
    id: "operations",
    kind: "sequence",
    title: "Operation session",
    description:
      "The cursor advances once each operation has produced its result.",
    items: operations.map((operation, index) => ({
      id: `operation-${index}`,
      label: String(index),
      value: `${operation.op}(“${operation.word}”)`,
      role:
        index === current ? "current" : index < current ? "visited" : "default",
    })),
    pointers:
      current >= 0 && current < operations.length
        ? [{ id: "operation-cursor", label: "next", index: current }]
        : [],
  };
}

function outputScene(outputs: TrieOutput): TraceSequenceScene {
  return {
    id: "outputs",
    kind: "sequence",
    title: "Returned values",
    description: "Insert returns null; query operations return a boolean.",
    items: outputs.map((value, index) => ({
      id: `output-${index}`,
      label: String(index),
      value,
      role: index === outputs.length - 1 ? "accepted" : "visited",
    })),
  };
}

function inspectPath(
  root: TrieNode,
  word: string,
): { node: TrieNode | null; matched: string; missing: string | null } {
  let node = root;
  let matched = "";
  for (const character of word) {
    const next = node.children.get(character);
    if (!next)
      return { node: null, matched, missing: `${matched}${character}` };
    node = next;
    matched += character;
  }
  return { node, matched, missing: null };
}

function checkpointFor(
  operation: TrieOperation,
  path: ReturnType<typeof inspectPath>,
): TraceCheckpoint {
  if (operation.op === "insert") {
    return {
      prompt: `What must insertion guarantee after walking “${operation.word}”?`,
      options: [
        { id: "terminal", label: "Mark the final node terminal" },
        { id: "erase", label: "Erase the shared prefix" },
        { id: "query", label: "Return a search boolean" },
      ],
      answerId: "terminal",
      explanation:
        "Insertion creates only missing edges, preserves shared prefixes, and marks the final node as a complete word.",
    };
  }
  const success =
    path.node !== null && (operation.op === "startsWith" || path.node.terminal);
  return {
    prompt: `What does ${operation.op}(“${operation.word}”) return?`,
    options: [
      { id: "true", label: "true" },
      { id: "false", label: "false" },
    ],
    answerId: success ? "true" : "false",
    explanation:
      path.node === null
        ? `The edge for “${path.missing?.at(-1)}” is missing, so traversal stops with false.`
        : operation.op === "startsWith"
          ? "Every prefix edge exists, so startsWith returns true without requiring a terminal marker."
          : path.node.terminal
            ? "The path exists and its final node is terminal, so this exact word was inserted."
            : "The path exists only as a prefix; exact search requires a terminal marker.",
  };
}

function trace(input: TrieInput): TraceRun {
  const operations = input.operations.map((operation) => ({ ...operation }));
  const root = createNode("");
  const outputs: (boolean | null)[] = [];
  const firstQueryIndex = operations.findIndex(
    (operation) => operation.op !== "insert",
  );
  const checkpointIndex = firstQueryIndex === -1 ? 0 : firstQueryIndex;
  const frames: TraceFrame[] = [
    {
      id: "initialize",
      phase: "Initialize",
      codeRefs: ["create-root"],
      explanation:
        "Create one empty root shared by every word in this session.",
      changed: "Created the trie root.",
      invariant: "Every stored word begins at the same root.",
      variables: [
        { name: "operations", value: operations.length },
        { name: "stored words", value: 0 },
      ],
      scenes: [
        trieScene(root),
        operationScene(operations, 0),
        outputScene(outputs),
      ],
      focusSceneId: "trie",
    },
  ];
  let storedWords = 0;

  operations.forEach((operation, index) => {
    const before = inspectPath(root, operation.word);
    frames.push({
      id: `predict-${index}`,
      phase: "Predict",
      codeRefs:
        operation.op === "insert"
          ? ["insert-word"]
          : operation.op === "search"
            ? ["search-word"]
            : ["search-prefix", "walk-prefix"],
      explanation: `${operation.op}(“${operation.word}”) follows one character edge at a time from the root.`,
      changed: `Selected operation ${index + 1} of ${operations.length}.`,
      invariant:
        "Traversal may reuse existing nodes, but only insertion may create a missing edge.",
      variables: [
        { name: "operation", value: operation.op, changed: true },
        { name: "word", value: operation.word, changed: true },
        { name: "matched prefix", value: before.matched },
      ],
      scenes: [
        trieScene(
          root,
          operation.word,
          operation.op === "insert" ? null : before.missing,
        ),
        operationScene(operations, index),
        outputScene(outputs),
      ],
      focusSceneId: "trie",
      ...(index === checkpointIndex
        ? { checkpoint: checkpointFor(operation, before) }
        : {}),
    });

    if (operation.op === "insert") {
      let node = root;
      let path = "";
      let created = 0;
      for (const character of operation.word) {
        path += character;
        let next = node.children.get(character);
        if (!next) {
          next = createNode(path);
          node.children.set(character, next);
          created += 1;
        }
        node = next;
      }
      if (!node.terminal) storedWords += 1;
      node.terminal = true;
      outputs.push(null);
      frames.push({
        id: `insert-${index}`,
        phase: "Update trie",
        codeRefs: ["create-child", "mark-terminal"],
        explanation: `Reused the shared prefix, created ${created} missing ${created === 1 ? "node" : "nodes"}, and marked “${operation.word}” terminal.`,
        changed: `Inserted “${operation.word}”; output[${index}] is null.`,
        invariant:
          "Every terminal marker denotes a complete inserted word; nonterminal nodes may still represent valid prefixes.",
        variables: [
          { name: "created nodes", value: created, changed: created > 0 },
          { name: "stored words", value: storedWords, changed: true },
          { name: "output", value: null, changed: true },
        ],
        scenes: [
          trieScene(root, operation.word),
          operationScene(operations, index),
          outputScene(outputs),
        ],
        focusSceneId: "trie",
      });
      return;
    }

    const result =
      before.node !== null &&
      (operation.op === "startsWith" || before.node.terminal);
    outputs.push(result);
    frames.push({
      id: `query-${index}`,
      phase: "Resolve query",
      codeRefs:
        operation.op === "search"
          ? ["return-terminal"]
          : ["walk-prefix", "return-prefix"],
      explanation:
        before.node === null
          ? `Traversal stopped at the missing path “${before.missing}”.`
          : operation.op === "search"
            ? `The full path exists and its terminal marker is ${before.node.terminal}.`
            : "The full prefix path exists; a terminal marker is not required.",
      changed: `${operation.op}(“${operation.word}”) returned ${result}.`,
      invariant:
        operation.op === "search"
          ? "Exact search succeeds only when both the full path and terminal marker exist."
          : "Prefix search succeeds as soon as the full prefix path exists.",
      variables: [
        { name: "matched prefix", value: before.matched, changed: true },
        { name: "result", value: result, changed: true },
        { name: "terminal", value: before.node?.terminal ?? false },
      ],
      scenes: [
        trieScene(root, operation.word, before.missing),
        operationScene(operations, index),
        outputScene(outputs),
      ],
      focusSceneId: "trie",
    });
  });

  const output: TrieOutput = [...outputs];
  frames.push({
    id: "complete",
    phase: "Complete",
    codeRefs: ["return-prefix"],
    explanation: `Completed all ${operations.length} operations without rebuilding shared prefixes.`,
    changed: "Finalized the ordered operation results.",
    invariant:
      "The trie contains exactly the inserted words, and every query result reflects the final state at its own operation.",
    variables: [
      { name: "stored words", value: storedWords },
      { name: "results", value: output.length },
    ],
    scenes: [
      trieScene(root),
      operationScene(operations, operations.length),
      outputScene(outputs),
    ],
    focusSceneId: "trie",
    complete: true,
    output,
  });
  return { input: { operations }, output, frames };
}

function oracle(input: TrieInput): TrieOutput {
  const words = new Set<string>();
  return input.operations.map((operation) => {
    if (operation.op === "insert") {
      words.add(operation.word);
      return null;
    }
    if (operation.op === "search") return words.has(operation.word);
    return [...words].some((word) => word.startsWith(operation.word));
  });
}

export const runtime = createTraceRuntime<TrieInput, TrieOutput>({
  definition,
  schema: inputSchema,
  parseRaw,
  trace,
  oracle,
});

export default runtime;
