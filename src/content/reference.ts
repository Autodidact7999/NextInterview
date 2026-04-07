import {
  collectionsReferenceEntries,
  mindMapNodeDetails as rawMindMapNodeDetails,
  patternReferenceEntries,
  typesReferenceEntries,
} from "@/content/reference.generated";
import type {
  MindMapNodeDetailMap,
  QuickRefRow,
  QuizEntry,
  ReferenceNotice,
  SyntaxBlock,
  TrapEntry,
} from "@/lib/types";

export {
  collectionsReferenceEntries,
  patternReferenceEntries,
  typesReferenceEntries,
};

export const mindMapNodeDetails: MindMapNodeDetailMap = rawMindMapNodeDetails;

export const quickRefRows: QuickRefRow[] = [
  {
    need: "int[]",
    tool: "Fixed-size data, binary search, DP, prefix sum",
    complexity: "O(1) access",
  },
  {
    need: "char[]",
    tool: "In-place character mutation",
    complexity: "O(1) access",
  },
  { need: "String", tool: "Read-only string ops", complexity: "O(n) concat!" },
  {
    need: "StringBuilder",
    tool: "Repeated string construction, backtracking",
    complexity: "O(1) append",
  },
  {
    need: "ArrayList<>",
    tool: "Dynamic list, result storage, adjacency list",
    complexity: "O(1) end ops",
  },
  {
    need: "HashMap<>",
    tool: "Frequency count, key to value lookup, prefix sum map",
    complexity: "O(1) avg",
  },
  {
    need: "HashSet<>",
    tool: "Fast membership, visited, duplicate detection",
    complexity: "O(1) avg",
  },
  {
    need: "Queue + ArrayDeque<>",
    tool: "BFS, level-order traversal",
    complexity: "O(1) both ends",
  },
  {
    need: "Deque + ArrayDeque<>",
    tool: "Stack, monotonic stack, sliding window deque",
    complexity: "O(1) both ends",
  },
  {
    need: "PriorityQueue<>",
    tool: "Top K, heap, Dijkstra, greedy min/max retrieval",
    complexity: "O(log n)",
  },
  {
    need: "TreeMap<>",
    tool: "Sorted order, floor/ceiling key lookups",
    complexity: "O(log n)",
  },
  {
    need: "TreeSet<>",
    tool: "Sorted unique values, nearest-value lookups",
    complexity: "O(log n)",
  },
  {
    need: "int[][]",
    tool: "Grid, matrix, intervals",
    complexity: "O(1) access",
  },
  { need: "int[26]", tool: "Lowercase letter frequency", complexity: "O(1)" },
  { need: "int[128]", tool: "Full ASCII frequency", complexity: "O(1)" },
  {
    need: "List<List<Integer>>",
    tool: "Graph adjacency list (unweighted)",
    complexity: "-",
  },
  {
    need: "List<List<int[]>>",
    tool: "Graph adjacency list (weighted)",
    complexity: "-",
  },
  {
    need: "int[] {x, y}",
    tool: "Pair / tuple storage in PQ or list",
    complexity: "-",
  },
] satisfies QuickRefRow[];

export const syntaxBlocks: SyntaxBlock[] = [
  {
    title: "Array & Sort",
    code: `int[] arr = new int[n];
int[] nums = {1, 2, 3};
long x = 10000000000L; // L suffix!
Arrays.sort(arr);
Arrays.fill(arr, -1);
Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));`,
  },
  {
    title: "List & Map",
    code: `List<Integer> list = new ArrayList<>();
list.add(x); list.get(i); list.size();
Map<Integer, Integer> map = new HashMap<>();
map.put(x, map.getOrDefault(x, 0) + 1);
Set<Integer> set = new HashSet<>();
set.add(x); set.contains(x);`,
  },
  {
    title: "Queue & Stack",
    code: `Queue<Integer> q = new ArrayDeque<>();
q.offer(x); q.poll(); q.peek();

Deque<Integer> stack = new ArrayDeque<>();
stack.push(x); stack.pop(); stack.peek();

Deque<Integer> dq = new ArrayDeque<>();
dq.addFirst(x); dq.addLast(x);
dq.pollFirst(); dq.pollLast();`,
  },
  {
    title: "PriorityQueue (Heap)",
    code: `PriorityQueue<Integer> min = new PriorityQueue<>();
PriorityQueue<Integer> max = new PriorityQueue<>(Comparator.reverseOrder());
PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));`,
  },
  {
    title: "String & StringBuilder",
    code: `StringBuilder sb = new StringBuilder();
sb.append("x"); sb.append(123);
sb.deleteCharAt(sb.length() - 1);
sb.reverse();
String res = sb.toString();

char[] arr = s.toCharArray();
int idx = ch - 'a';
int digit = ch - '0';`,
  },
  {
    title: "TreeMap / TreeSet",
    code: `TreeMap<Integer, Integer> tm = new TreeMap<>();
tm.ceilingKey(k);
tm.floorKey(k);

TreeSet<Integer> ts = new TreeSet<>();
ts.ceiling(k);
ts.floor(k);`,
  },
] satisfies SyntaxBlock[];

export const referencePills = [
  "HashMap frequency count",
  "HashSet membership",
  "ArrayList add/get/remove",
  "Arrays.sort + custom comparator",
  "PriorityQueue min/max heap",
  "ArrayDeque as Queue (BFS)",
  "ArrayDeque as Stack",
  "StringBuilder",
  "s.toCharArray()",
  "ch - 'a' index trick",
  "long for overflow safety",
  "getOrDefault",
  "Integer.compare(a, b)",
  "Binary search template",
  "BFS level-order with size snapshot",
] as const;

export const trapEntries: TrapEntry[] = [
  {
    title: "Using LinkedList everywhere",
    body: "Use ArrayDeque for queue, stack, and deque behavior. LinkedList is almost never the best choice in LeetCode.",
  },
  {
    title: "String += in loops",
    body: "Every concatenation allocates a new String. Repeated + inside loops becomes O(n squared). Use StringBuilder.",
  },
  {
    title: "Forgetting long",
    body: "If sums or products can exceed roughly 2.1 billion, switch to long and add the L suffix on literals.",
  },
  {
    title: "Confusing .length and .length()",
    body: "Arrays use arr.length. Strings use s.length(). Mixing them causes noisy but avoidable mistakes.",
  },
  {
    title: "ArrayList remove index vs value",
    body: "list.remove(1) removes by index. list.remove(Integer.valueOf(1)) removes by value.",
  },
  {
    title: "Using HashMap when int[] is enough",
    body: "For lowercase letters or ASCII, fixed-size arrays are faster and simpler than HashMap.",
  },
  {
    title: "Storing values instead of indices in monotonic stack",
    body: "Most monotonic stack problems need positions to compute spans and distances, so store indices.",
  },
] satisfies TrapEntry[];

export const referenceNotices: ReferenceNotice[] = [
  {
    title: "Backtracking copy trap",
    body: "Always add new ArrayList<>(path) to results. Adding path directly stores a mutable reference that gets overwritten.",
  },
  {
    title: "Comparator overflow trap",
    body: "Never sort with a - b. Use Integer.compare(a, b) so large negative values do not overflow.",
  },
  {
    title: "PriorityQueue<int[]> requires a comparator",
    body: "Primitive arrays have no natural ordering, so custom object or tuple heaps need an explicit comparator.",
  },
  {
    title: "Map null trap",
    body: "map.get(key) can return null and unboxing null to int throws NullPointerException. Prefer getOrDefault.",
  },
  {
    title: "Primitive arrays cannot take a custom comparator",
    body: "If you need custom ordering on a 1D array, use Integer[] instead of int[]. int[][] works with lambdas.",
  },
  {
    title: "BFS visit timing",
    body: "Mark visited when you offer a node to the queue, not when you poll it, or you risk duplicate work and wrong distances.",
  },
  {
    title: "Heap direction for K largest vs K smallest",
    body: "K largest uses a min-heap of size K. K smallest uses a max-heap of size K. It feels backwards once and then sticks.",
  },
] satisfies ReferenceNotice[];

export const quizEntries: QuizEntry[] = [
  { question: "Max int value?", answer: "Integer.MAX_VALUE ≈ 2.1 × 10^9" },
  {
    question: "Sum of n numbers each up to 10^9?",
    answer: "Can exceed int, so use long",
  },
  {
    question: "Default PriorityQueue order?",
    answer: "Min-heap, with the smallest element at the top",
  },
  {
    question: "ArrayDeque vs LinkedList?",
    answer: "ArrayDeque is faster and should be the default choice",
  },
  {
    question: "Stack class legacy?",
    answer: "Yes. Prefer ArrayDeque instead.",
  },
  {
    question: "String is mutable?",
    answer: "No. Use StringBuilder when changes are needed.",
  },
  {
    question: "equals() vs == for strings?",
    answer: "Use .equals(). == compares references.",
  },
  {
    question: "list.remove(1) index or value?",
    answer: "Index. Use Integer.valueOf(1) for value removal.",
  },
  {
    question: "Binary search mid formula?",
    answer: "left + (right - left) / 2",
  },
] satisfies QuizEntry[];
