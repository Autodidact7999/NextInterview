import type { Difficulty } from "@/lib/types";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  | JsonPrimitive
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

export type TraceItemRole =
  | "default"
  | "current"
  | "candidate"
  | "accepted"
  | "rejected"
  | "visited"
  | "dimmed";

export interface TraceInputIssue {
  field: string;
  message: string;
}

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: readonly TraceInputIssue[] };

export type RawTraceInput = Readonly<Record<string, string>>;

export interface TraceInputField {
  id: string;
  label: string;
  type: "text" | "integer" | "textarea";
  placeholder: string;
  help: string;
  inputMode?: "text" | "numeric";
}

export interface TracePreset {
  id: string;
  label: string;
  description: string;
  values: RawTraceInput;
}

export interface TraceCodeAnchor {
  id: string;
  label: string;
  fragment: string;
}

export type TraceSceneKind =
  | "sequence"
  | "associative"
  | "stack"
  | "linked-list"
  | "tree"
  | "trie"
  | "bar-range";

interface TraceSceneBase {
  id: string;
  title: string;
  description: string;
}

export interface TraceSequenceItem {
  id: string;
  label: string;
  value: JsonPrimitive;
  role?: TraceItemRole;
  note?: string;
}

export interface TraceSequenceScene extends TraceSceneBase {
  kind: "sequence";
  items: readonly TraceSequenceItem[];
  pointers?: readonly { id: string; label: string; index: number }[];
  ranges?: readonly {
    id: string;
    label: string;
    start: number;
    end: number;
    role?: TraceItemRole;
  }[];
}

export interface TraceAssociativeEntry {
  id: string;
  key: string;
  value: JsonValue;
  role?: TraceItemRole;
}

export interface TraceAssociativeScene extends TraceSceneBase {
  kind: "associative";
  entries: readonly TraceAssociativeEntry[];
  emptyLabel?: string;
}

export interface TraceStackScene extends TraceSceneBase {
  kind: "stack";
  items: readonly TraceSequenceItem[];
  topLabel?: string;
}

export interface TraceLinkedListNode {
  id: string;
  value: JsonPrimitive;
  nextId: string | null;
  role?: TraceItemRole;
  label?: string;
}

export interface TraceLinkedListScene extends TraceSceneBase {
  kind: "linked-list";
  nodes: readonly TraceLinkedListNode[];
  headId: string | null;
  cycleToId?: string | null;
  pointers?: readonly { id: string; label: string; nodeId: string | null }[];
}

export interface TraceTreeNode {
  id: string;
  value: JsonPrimitive;
  parentId: string | null;
  edgeLabel?: string;
  badge?: JsonPrimitive;
  note?: string;
  role?: TraceItemRole;
}

export interface TraceTreeScene extends TraceSceneBase {
  kind: "tree";
  nodes: readonly TraceTreeNode[];
  rootId: string | null;
}

export interface TraceTrieScene extends TraceSceneBase {
  kind: "trie";
  nodes: readonly TraceTreeNode[];
  rootId: string | null;
}

export interface TraceBar {
  id: string;
  label: string;
  value: number;
  role?: TraceItemRole;
}

export interface TraceBarRangeScene extends TraceSceneBase {
  kind: "bar-range";
  bars: readonly TraceBar[];
  presentation?: "magnitude" | "signed" | "ordered" | "container";
  range?: { start: number; end: number; label: string };
  markers?: readonly { id: string; label: string; index: number }[];
}

export type TraceScene =
  | TraceSequenceScene
  | TraceAssociativeScene
  | TraceStackScene
  | TraceLinkedListScene
  | TraceTreeScene
  | TraceTrieScene
  | TraceBarRangeScene;

export interface TraceVariable {
  name: string;
  value: JsonValue;
  previous?: JsonValue;
  changed?: boolean;
}

export interface TraceCheckpointOption {
  id: string;
  label: string;
}

export interface TraceCheckpoint {
  prompt: string;
  options: readonly TraceCheckpointOption[];
  answerId: string;
  explanation: string;
}

export interface TraceFrame {
  id: string;
  phase: string;
  codeRefs: readonly string[];
  explanation: string;
  changed: string;
  invariant: string;
  variables: readonly TraceVariable[];
  scenes: readonly TraceScene[];
  focusSceneId?: string;
  checkpoint?: TraceCheckpoint;
  complete?: boolean;
  output?: JsonValue;
}

export interface TraceRun {
  input: JsonValue;
  output: JsonValue;
  frames: readonly TraceFrame[];
}

export interface TraceProblemDefinition {
  lc: number;
  slug: string;
  title: string;
  difficulty: Difficulty;
  area: string;
  pattern: string;
  summary: string;
  fields: readonly TraceInputField[];
  presets: readonly TracePreset[];
  anchors: readonly TraceCodeAnchor[];
  visualKinds: readonly TraceSceneKind[];
}

export interface TraceProblemRuntime {
  lc: number;
  slug: string;
  run(raw: RawTraceInput): ValidationResult<TraceRun>;
}

export interface ResolvedTraceCodeLine {
  number: number;
  anchorIds: readonly string[];
  tokens: readonly {
    content: string;
    light: string;
    dark: string;
    fontStyle?: number;
  }[];
}

export interface TraceCatalogItem extends TraceProblemDefinition {
  code: string;
  time: string;
  space: string;
  days: readonly { day: number; week: number }[];
}

export type TraceCatalogSummary = Pick<
  TraceProblemDefinition,
  | "lc"
  | "slug"
  | "title"
  | "difficulty"
  | "area"
  | "pattern"
  | "summary"
  | "visualKinds"
>;

export interface PreparedTraceProblem extends TraceCatalogItem {
  codeLines: readonly ResolvedTraceCodeLine[];
}

export interface TraceSourceContext {
  day: number;
  week: number;
}
