export type Difficulty = "E" | "M" | "H";

export interface WeekPlan {
  phase: string;
  week: number;
  title: string;
  color: string;
  bg: string;
  intro: string;
  days: string[];
  topics: string[];
}

export interface PatternCard {
  name: string;
  tag: string;
  bg: string;
  tc: string;
  desc: string;
  signal: string;
  edgeCases: string;
  ex: string;
}

export interface SystemDesignItem {
  concept: string;
  explanation: string;
}

export interface SystemDesignTopic {
  week: string;
  title: string;
  intro: string;
  items: SystemDesignItem[];
}

export interface ReferenceAccordionItem {
  title: string;
  tag: string;
  tagBg: string;
  tagC: string;
  body: string;
  code: string;
  trap: string | null;
  edgeCases: string | null;
}

export interface MindMapNodeDetail {
  desc: string;
  when: string;
  whyItWorks: string;
  example: string;
}

export type MindMapNodeDetailMap = Record<string, MindMapNodeDetail>;

export interface Problem {
  title: string;
  lc: number;
  diff: Difficulty;
}

export interface RevisionRef {
  title: string;
  day: number;
}

export interface DayPlanEntry {
  day: number;
  week: number;
  label: string;
  focus: string;
  problems: Problem[];
  revision: RevisionRef | null;
  mock?: boolean;
  review?: boolean;
}

export interface WeekMeta {
  title: string;
  color: string;
  bg: string;
}

export type WeekMetaMap = Record<number, WeekMeta>;

export interface SolutionSnippet {
  pattern: string;
  approach: string;
  insight: string;
  code: string;
  time: string;
  space: string;
}

export type SolutionMap = Record<number, SolutionSnippet>;

export interface QuickRefRow {
  need: string;
  tool: string;
  complexity: string;
}

export interface SyntaxBlock {
  title: string;
  code: string;
}

export interface TrapEntry {
  title: string;
  body: string;
}

export interface QuizEntry {
  question: string;
  answer: string;
}

export interface ReferenceNotice {
  title: string;
  body: string;
}

export interface RoutineBlock {
  label: string;
  title: string;
  description: string;
}

export interface RevisionInterval {
  interval: string;
  description: string;
}

export interface DecisionStep {
  question: string;
  ifYes: string;
  ifNo: string;
}

export type RoadmapSection =
  | "overview"
  | "weekly"
  | "patterns"
  | "system-design"
  | "routine";

export type ReferenceSection =
  | "mindmap"
  | "quick-ref"
  | "types"
  | "collections"
  | "patterns"
  | "traps"
  | "framework";

export type PracticeWeekFilter = "all" | number;

export type RoadmapDayStatus = "none" | "dsa" | "sd";

export interface ProgressState {
  startDate: string | null;
  completedProblems: Record<string, boolean>;
  roadmapStatuses: Record<string, RoadmapDayStatus>;
  legacyMigrated: boolean;
  updatedAt: string;
}

export interface PracticeStats {
  solved: number;
  total: number;
  currentStreak: number;
  remainingLabel: string;
}

export interface RoadmapStats {
  dsaDays: number;
  sdDays: number;
  streak: number;
  monthProgress: number[];
}

export interface DashboardSnapshot {
  todayPlan: DayPlanEntry | null;
  currentWeek: number | null;
  dayNumber: number | null;
  daysRemaining: number | null;
}

export interface MindMapNodeDefinition {
  id: string;
  label: string[];
  cx: number;
  cy: number;
  r: number;
  fill: string;
  stroke: string;
  textColor: string;
  fontSize?: number;
  fontWeight?: number;
}

export interface MindMapEdgeDefinition {
  type: "line" | "path";
  stroke: string;
  strokeWidth: number;
  opacity: number;
  path?: string;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}
