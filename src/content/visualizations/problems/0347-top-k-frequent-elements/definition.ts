import type { TraceProblemDefinition } from "@/lib/visualizer";

export const topKFrequentElementsDefinition = {
  lc: 347,
  slug: "top-k-frequent-elements",
  title: "Top K Frequent Elements",
  difficulty: "M",
  area: "Arrays and hashing",
  pattern: "Frequency map + size-k min-heap",
  summary:
    "Count every value, then let a bounded min-heap keep only the k strongest frequency candidates.",
  fields: [
    {
      id: "nums",
      label: "Numbers",
      type: "text",
      placeholder: "[1, 1, 1, 2, 2, 3]",
      help: "Enter 1–30 Java integers. Frequencies at the k cutoff must not tie.",
      inputMode: "text",
    },
    {
      id: "k",
      label: "How many results?",
      type: "integer",
      placeholder: "2",
      help: "Choose an integer from 1 through the number of unique values.",
      inputMode: "numeric",
    },
  ],
  presets: [
    {
      id: "classic",
      label: "Classic top two",
      description:
        "Three frequency levels make each heap eviction decision visible.",
      values: { nums: "[1, 1, 1, 2, 2, 3]", k: "2" },
    },
    {
      id: "single-value-edge",
      label: "Single-value edge",
      description:
        "One unique value fills the heap without ever triggering an eviction.",
      values: { nums: "[7]", k: "1" },
    },
  ],
  anchors: [
    {
      id: "create-frequency-map",
      label: "Create the frequency map",
      fragment: "Map<Integer, Integer> freq = new HashMap<>();",
    },
    {
      id: "count-frequencies",
      label: "Count each value",
      fragment: "for (int n : nums) freq.put(n, freq.getOrDefault(n, 0) + 1);",
    },
    {
      id: "create-min-heap",
      label: "Create the frequency min-heap",
      fragment:
        "PriorityQueue<Integer> minHeap = new PriorityQueue<>((a, b) -> freq.get(a) - freq.get(b));",
    },
    {
      id: "scan-unique-values",
      label: "Visit a unique value",
      fragment: "for (int n : freq.keySet()) {",
    },
    {
      id: "offer-candidate",
      label: "Offer the value to the heap",
      fragment: "minHeap.offer(n);",
    },
    {
      id: "trim-minimum",
      label: "Evict the weakest candidate",
      fragment: "if (minHeap.size() > k) minHeap.poll();",
    },
    {
      id: "return-heap",
      label: "Return the retained values",
      fragment:
        "return minHeap.stream().mapToInt(Integer::intValue).toArray();",
    },
  ],
  visualKinds: ["sequence", "associative", "tree"],
} satisfies TraceProblemDefinition;

export default topKFrequentElementsDefinition;
