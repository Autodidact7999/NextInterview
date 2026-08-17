import type { DayPlanEntry, SolutionMap, WeekMetaMap } from "@/lib/types";

export const practiceDayPlan = [
{day:1, week:1, label:"Mon", focus:"int[] + Two Pointers", problems:[{title:"Two Sum",lc:1,diff:"E"},{title:"Valid Palindrome",lc:125,diff:"E"},{title:"Container With Most Water",lc:11,diff:"M"}], revision:null},
{day:2, week:1, label:"Tue", focus:"Sliding Window", problems:[{title:"Longest Substring Without Repeating",lc:3,diff:"M"},{title:"Max Consecutive Ones III",lc:1004,diff:"M"}], revision:null},
{day:3, week:1, label:"Wed", focus:"Prefix Sum", problems:[{title:"Subarray Sum Equals K",lc:560,diff:"M"},{title:"Product of Array Except Self",lc:238,diff:"M"}], revision:null},
{day:4, week:1, label:"Thu", focus:"String + char[]", problems:[{title:"Valid Anagram",lc:242,diff:"E"},{title:"Group Anagrams",lc:49,diff:"M"}], revision:{title:"Two Sum",day:1}},
{day:5, week:1, label:"Fri", focus:"StringBuilder", problems:[{title:"Reverse String",lc:344,diff:"E"},{title:"Reverse Words in a String",lc:151,diff:"M"}], revision:{title:"Longest Substring",day:2}},
{day:6, week:1, label:"Sat", focus:"Timed Mock", problems:[], revision:null, mock:true},
{day:7, week:1, label:"Sun", focus:"Review Day", problems:[], revision:null, review:true},
{day:8, week:2, label:"Mon", focus:"HashMap patterns", problems:[{title:"Top K Frequent Elements",lc:347,diff:"M"},{title:"Two Sum (HashMap)",lc:1,diff:"E"},{title:"Ransom Note",lc:383,diff:"E"}], revision:{title:"Valid Anagram",day:4}},
{day:9, week:2, label:"Tue", focus:"HashSet", problems:[{title:"Contains Duplicate",lc:217,diff:"E"},{title:"Longest Consecutive Sequence",lc:128,diff:"M"}], revision:{title:"Group Anagrams",day:4}},
{day:10, week:2, label:"Wed", focus:"Binary Search — classic", problems:[{title:"Binary Search",lc:704,diff:"E"},{title:"Search in Rotated Sorted Array",lc:33,diff:"M"},{title:"Find Minimum in Rotated Sorted Array",lc:153,diff:"M"}], revision:{title:"Subarray Sum Equals K",day:3}},
{day:11, week:2, label:"Thu", focus:"Binary Search — answer space", problems:[{title:"Koko Eating Bananas",lc:875,diff:"M"},{title:"Capacity to Ship Packages",lc:1011,diff:"M"}], revision:{title:"Container With Most Water",day:1}},
{day:12, week:2, label:"Fri", focus:"Review + BS hard", problems:[{title:"Find Peak Element",lc:162,diff:"M"},{title:"Search a 2D Matrix",lc:74,diff:"M"}], revision:{title:"Top K Frequent",day:8}},
{day:13, week:2, label:"Sat", focus:"Timed Mock", problems:[], revision:null, mock:true},
{day:14, week:2, label:"Sun", focus:"Review Day", problems:[], revision:null, review:true},
{day:15, week:3, label:"Mon", focus:"LinkedList — dummy node", problems:[{title:"Reverse Linked List",lc:206,diff:"E"},{title:"Merge Two Sorted Lists",lc:21,diff:"E"}], revision:{title:"Search in Rotated Array",day:10}},
{day:16, week:3, label:"Tue", focus:"Fast & Slow Pointers", problems:[{title:"Linked List Cycle",lc:141,diff:"E"},{title:"Find the Duplicate Number",lc:287,diff:"M"}], revision:{title:"Koko Eating Bananas",day:11}},
{day:17, week:3, label:"Wed", focus:"Stack — ArrayDeque", problems:[{title:"Valid Parentheses",lc:20,diff:"E"},{title:"Min Stack",lc:155,diff:"M"},{title:"Evaluate Reverse Polish Notation",lc:150,diff:"M"}], revision:{title:"Reverse Linked List",day:15}},
{day:18, week:3, label:"Thu", focus:"Monotonic Stack", problems:[{title:"Daily Temperatures",lc:739,diff:"M"},{title:"Next Greater Element I",lc:496,diff:"E"}], revision:{title:"Linked List Cycle",day:16}},
{day:19, week:3, label:"Fri", focus:"Monotonic Stack hard", problems:[{title:"Largest Rectangle in Histogram",lc:84,diff:"H"},{title:"Car Fleet",lc:853,diff:"M"}], revision:{title:"Valid Parentheses",day:17}},
{day:20, week:3, label:"Sat", focus:"Timed Mock", problems:[], revision:null, mock:true},
{day:21, week:3, label:"Sun", focus:"Review Day", problems:[], revision:null, review:true},
{day:22, week:4, label:"Mon", focus:"Tree DFS — recursion", problems:[{title:"Maximum Depth of Binary Tree",lc:104,diff:"E"},{title:"Diameter of Binary Tree",lc:543,diff:"E"}], revision:{title:"Daily Temperatures",day:18}},
{day:23, week:4, label:"Tue", focus:"Tree DFS — path problems", problems:[{title:"Path Sum",lc:112,diff:"E"},{title:"Lowest Common Ancestor",lc:236,diff:"M"}], revision:{title:"Largest Rectangle",day:19}},
{day:24, week:4, label:"Wed", focus:"Tree BFS — Queue", problems:[{title:"Binary Tree Level Order Traversal",lc:102,diff:"M"},{title:"Right Side View",lc:199,diff:"M"}], revision:{title:"Maximum Depth",day:22}},
{day:25, week:4, label:"Thu", focus:"BST", problems:[{title:"Validate Binary Search Tree",lc:98,diff:"M"},{title:"Kth Smallest Element in BST",lc:230,diff:"M"}], revision:{title:"LCA",day:23}},
{day:26, week:4, label:"Fri", focus:"Tree hard + Trie intro", problems:[{title:"Binary Tree Maximum Path Sum",lc:124,diff:"H"},{title:"Implement Trie",lc:208,diff:"M"}], revision:{title:"Level Order Traversal",day:24}},
{day:27, week:4, label:"Sat", focus:"Timed Mock", problems:[], revision:null, mock:true},
{day:28, week:4, label:"Sun", focus:"Review Day", problems:[], revision:null, review:true},
{day:29, week:5, label:"Mon", focus:"PriorityQueue — min/max heap", problems:[{title:"Kth Largest Element in Array",lc:215,diff:"M"},{title:"Last Stone Weight",lc:1046,diff:"E"}], revision:{title:"Validate BST",day:25}},
{day:30, week:5, label:"Tue", focus:"Top K pattern", problems:[{title:"K Closest Points to Origin",lc:973,diff:"M"},{title:"Top K Frequent Elements",lc:347,diff:"M"}], revision:{title:"Binary Tree Max Path Sum",day:26}},
{day:31, week:5, label:"Wed", focus:"Merge K sorted", problems:[{title:"Merge K Sorted Lists",lc:23,diff:"H"},{title:"Find Median from Data Stream",lc:295,diff:"H"}], revision:{title:"Kth Largest Element",day:29}},
{day:32, week:5, label:"Thu", focus:"Interval + heap", problems:[{title:"Meeting Rooms II",lc:253,diff:"M"},{title:"Task Scheduler",lc:621,diff:"M"}], revision:{title:"K Closest Points",day:30}},
{day:33, week:5, label:"Fri", focus:"Heap review", problems:[{title:"Reorganize String",lc:767,diff:"M"},{title:"Furthest Building You Can Reach",lc:1642,diff:"M"}], revision:{title:"Merge K Sorted Lists",day:31}},
{day:34, week:5, label:"Sat", focus:"Timed Mock", problems:[], revision:null, mock:true},
{day:35, week:5, label:"Sun", focus:"Review Day", problems:[], revision:null, review:true},
{day:36, week:6, label:"Mon", focus:"Graph DFS — visited[]", problems:[{title:"Number of Islands",lc:200,diff:"M"},{title:"Max Area of Island",lc:695,diff:"M"}], revision:{title:"Task Scheduler",day:32}},
{day:37, week:6, label:"Tue", focus:"Graph BFS — shortest path", problems:[{title:"Rotting Oranges",lc:994,diff:"M"},{title:"01 Matrix",lc:542,diff:"M"}], revision:{title:"Number of Islands",day:36}},
{day:38, week:6, label:"Wed", focus:"Union Find (DSU)", problems:[{title:"Number of Connected Components",lc:323,diff:"M"},{title:"Redundant Connection",lc:684,diff:"M"}], revision:{title:"Rotting Oranges",day:37}},
{day:39, week:6, label:"Thu", focus:"Topological Sort (Kahn's)", problems:[{title:"Course Schedule",lc:207,diff:"M"},{title:"Course Schedule II",lc:210,diff:"M"}], revision:{title:"Union Find",day:38}},
{day:40, week:6, label:"Fri", focus:"Graph hard", problems:[{title:"Word Ladder",lc:127,diff:"H"},{title:"Pacific Atlantic Water Flow",lc:417,diff:"M"}], revision:{title:"Course Schedule",day:39}},
{day:41, week:6, label:"Sat", focus:"Timed Mock", problems:[], revision:null, mock:true},
{day:42, week:6, label:"Sun", focus:"Review Day", problems:[], revision:null, review:true},
{day:43, week:7, label:"Mon", focus:"Dijkstra — PQ + dist[]", problems:[{title:"Network Delay Time",lc:743,diff:"M"},{title:"Path with Minimum Effort",lc:1631,diff:"M"}], revision:{title:"Word Ladder",day:40}},
{day:44, week:7, label:"Tue", focus:"Backtracking — subsets", problems:[{title:"Subsets",lc:78,diff:"M"},{title:"Subsets II",lc:90,diff:"M"}], revision:{title:"Network Delay Time",day:43}},
{day:45, week:7, label:"Wed", focus:"Backtracking — permutations", problems:[{title:"Permutations",lc:46,diff:"M"},{title:"Combination Sum",lc:39,diff:"M"}], revision:{title:"Subsets",day:44}},
{day:46, week:7, label:"Thu", focus:"Backtracking — hard", problems:[{title:"Word Search",lc:79,diff:"M"},{title:"Palindrome Partitioning",lc:131,diff:"M"}], revision:{title:"Permutations",day:45}},
{day:47, week:7, label:"Fri", focus:"Backtracking — pruning", problems:[{title:"N-Queens",lc:51,diff:"H"},{title:"Letter Combinations of a Phone Number",lc:17,diff:"M"}], revision:{title:"Word Search",day:46}},
{day:48, week:7, label:"Sat", focus:"Timed Mock", problems:[], revision:null, mock:true},
{day:49, week:7, label:"Sun", focus:"Review Day", problems:[], revision:null, review:true},
{day:50, week:8, label:"Mon", focus:"1D DP — Fibonacci pattern", problems:[{title:"Climbing Stairs",lc:70,diff:"E"},{title:"House Robber",lc:198,diff:"M"},{title:"House Robber II",lc:213,diff:"M"}], revision:{title:"Combination Sum",day:45}},
{day:51, week:8, label:"Tue", focus:"0/1 Knapsack", problems:[{title:"Partition Equal Subset Sum",lc:416,diff:"M"},{title:"Target Sum",lc:494,diff:"M"}], revision:{title:"Climbing Stairs",day:50}},
{day:52, week:8, label:"Wed", focus:"Unbounded Knapsack", problems:[{title:"Coin Change",lc:322,diff:"M"},{title:"Coin Change II",lc:518,diff:"M"}], revision:{title:"House Robber",day:50}},
{day:53, week:8, label:"Thu", focus:"LCS + LIS", problems:[{title:"Longest Common Subsequence",lc:1143,diff:"M"},{title:"Longest Increasing Subsequence",lc:300,diff:"M"}], revision:{title:"Coin Change",day:52}},
{day:54, week:8, label:"Fri", focus:"DP — strings", problems:[{title:"Word Break",lc:139,diff:"M"},{title:"Decode Ways",lc:91,diff:"M"}], revision:{title:"LCS",day:53}},
{day:55, week:8, label:"Sat", focus:"Timed Mock", problems:[], revision:null, mock:true},
{day:56, week:8, label:"Sun", focus:"Review Day", problems:[], revision:null, review:true},
{day:57, week:9, label:"Mon", focus:"2D DP — grids", problems:[{title:"Unique Paths",lc:62,diff:"M"},{title:"Minimum Path Sum",lc:64,diff:"M"}], revision:{title:"Word Break",day:54}},
{day:58, week:9, label:"Tue", focus:"DP — edit distance", problems:[{title:"Edit Distance",lc:72,diff:"M"},{title:"Longest Palindromic Substring",lc:5,diff:"M"}], revision:{title:"Unique Paths",day:57}},
{day:59, week:9, label:"Wed", focus:"Merge Intervals", problems:[{title:"Merge Intervals",lc:56,diff:"M"},{title:"Insert Interval",lc:57,diff:"M"}], revision:{title:"Edit Distance",day:58}},
{day:60, week:9, label:"Thu", focus:"Greedy — intervals", problems:[{title:"Non-overlapping Intervals",lc:435,diff:"M"},{title:"Meeting Rooms II (revisit)",lc:253,diff:"M"}], revision:{title:"Merge Intervals",day:59}},
{day:61, week:9, label:"Fri", focus:"Greedy — arrays", problems:[{title:"Jump Game",lc:55,diff:"M"},{title:"Jump Game II",lc:45,diff:"M"}], revision:{title:"Jump Game",day:61}},
{day:62, week:9, label:"Sat", focus:"Timed Mock", problems:[], revision:null, mock:true},
{day:63, week:9, label:"Sun", focus:"Review Day", problems:[], revision:null, review:true},
{day:64, week:10, label:"Mon", focus:"Bit manipulation", problems:[{title:"Single Number",lc:136,diff:"E"},{title:"Counting Bits",lc:338,diff:"E"},{title:"Missing Number",lc:268,diff:"E"}], revision:{title:"Jump Game II",day:61}},
{day:65, week:10, label:"Tue", focus:"Hard DP", problems:[{title:"Burst Balloons",lc:312,diff:"H"},{title:"Longest Valid Parentheses",lc:32,diff:"H"}], revision:{title:"Coin Change",day:52}},
{day:66, week:10, label:"Wed", focus:"Hard Graphs", problems:[{title:"Critical Connections in a Network",lc:1192,diff:"H"},{title:"Cheapest Flights Within K Stops",lc:787,diff:"M"}], revision:{title:"Course Schedule",day:39}},
{day:67, week:10, label:"Thu", focus:"Hard Mixed", problems:[{title:"Trapping Rain Water",lc:42,diff:"H"},{title:"Sliding Window Maximum",lc:239,diff:"H"}], revision:{title:"Merge Intervals",day:59}},
{day:68, week:10, label:"Fri", focus:"Spaced revision — full sweep", problems:[{title:"LRU Cache",lc:146,diff:"M"},{title:"Design Add and Search Words",lc:211,diff:"M"}], revision:{title:"Top K Frequent",day:8}},
{day:69, week:10, label:"Sat", focus:"Timed Mock", problems:[], revision:null, mock:true},
{day:70, week:10, label:"Sun", focus:"Review Day", problems:[], revision:null, review:true},
{day:71, week:11, label:"Mon", focus:"Identify weak areas", problems:[{title:"Minimum Window Substring",lc:76,diff:"H"},{title:"Serialize and Deserialize Binary Tree",lc:297,diff:"H"}], revision:{title:"Sliding Window Maximum",day:67}},
{day:72, week:11, label:"Tue", focus:"Weak area drill 1", problems:[{title:"Word Search II",lc:212,diff:"H"},{title:"Alien Dictionary",lc:269,diff:"H"}], revision:{title:"LCS",day:53}},
{day:73, week:11, label:"Wed", focus:"Weak area drill 2", problems:[{title:"Regular Expression Matching",lc:10,diff:"H"},{title:"Wildcard Matching",lc:44,diff:"H"}], revision:{title:"Edit Distance",day:58}},
{day:74, week:11, label:"Thu", focus:"Weak area drill 3", problems:[{title:"Median of Two Sorted Arrays",lc:4,diff:"H"},{title:"Find Minimum in Rotated Array II",lc:154,diff:"H"}], revision:{title:"Binary Search",day:10}},
{day:75, week:11, label:"Fri", focus:"Timed random set", problems:[{title:"Decode String",lc:394,diff:"M"},{title:"Number of Islands II",lc:305,diff:"H"}], revision:{title:"Backtracking: Subsets",day:44}},
{day:76, week:11, label:"Sat", focus:"Full Mock", problems:[], revision:null, mock:true},
{day:77, week:11, label:"Sun", focus:"Review Day", problems:[], revision:null, review:true},
{day:78, week:12, label:"Mon", focus:"Light review — patterns cheat sheet", problems:[{title:"Maximum Subarray",lc:53,diff:"M"},{title:"3Sum",lc:15,diff:"M"}], revision:{title:"Two Pointers review",day:1}},
{day:79, week:12, label:"Tue", focus:"3 familiar problems", problems:[{title:"Climbing Stairs",lc:70,diff:"E"},{title:"Number of Islands",lc:200,diff:"M"},{title:"Coin Change",lc:322,diff:"M"}], revision:{title:"Review all hard flags",day:65}},
{day:80, week:12, label:"Wed", focus:"SD mock + review notes", problems:[{title:"Meeting Rooms II",lc:253,diff:"M"},{title:"Design Hit Counter",lc:362,diff:"M"}], revision:{title:"Heap: Top K",day:30}},
{day:81, week:12, label:"Thu", focus:"Light review — rest", problems:[{title:"Two Sum",lc:1,diff:"E"},{title:"Valid Parentheses",lc:20,diff:"E"}], revision:{title:"Mono Stack review",day:18}},
{day:82, week:12, label:"Fri", focus:"Final review — no new problems", problems:[{title:"Longest Consecutive Sequence",lc:128,diff:"M"}], revision:{title:"Final sweep",day:53}},
{day:83, week:12, label:"Sat", focus:"Final Mock", problems:[], revision:null, mock:true},
{day:84, week:12, label:"Sun", focus:"REST — You are ready!", problems:[], revision:null, review:true},
] satisfies DayPlanEntry[];

export const practiceWeekMeta = {
  1:{title:"Arrays & Strings",color:"#1D9E75",bg:"#E1F5EE"},
  2:{title:"Hashing & Binary Search",color:"#1D9E75",bg:"#E1F5EE"},
  3:{title:"Linked Lists & Stacks",color:"#1D9E75",bg:"#E1F5EE"},
  4:{title:"Trees — BFS & DFS",color:"#1D9E75",bg:"#E1F5EE"},
  5:{title:"Heaps & Priority Queues",color:"#7F77DD",bg:"#EEEDFE"},
  6:{title:"Graphs I — DFS/BFS",color:"#7F77DD",bg:"#EEEDFE"},
  7:{title:"Graphs II + Backtracking",color:"#7F77DD",bg:"#EEEDFE"},
  8:{title:"Dynamic Programming I",color:"#7F77DD",bg:"#EEEDFE"},
  9:{title:"DP II + Intervals",color:"#7F77DD",bg:"#EEEDFE"},
  10:{title:"Hard Problems + Bits",color:"#D85A30",bg:"#FAECE7"},
  11:{title:"Mock Interviews",color:"#D85A30",bg:"#FAECE7"},
  12:{title:"Final Polish",color:"#D85A30",bg:"#FAECE7"},
} satisfies WeekMetaMap;

export const practiceSolutions = {
  // ── WEEK 1 ─────────────────────────────────────
  1: {
    pattern: "Hash Map",
    approach: "The brute force is O(n²) checking every pair. The key insight is that for each number, you already know what complement you need (target - num). A HashMap lets you check if that complement exists in O(1), turning this into a single-pass problem.",
    insight: "Store each number with its index. Before storing the current value, look up target - nums[i]; if it is already present, return both indices.",
    code: `Map<Integer, Integer> map = new HashMap<>();
for (int i = 0; i < nums.length; i++) {
  int comp = target - nums[i];
  if (map.containsKey(comp)) return new int[]{map.get(comp), i};
  map.put(nums[i], i);
}
return new int[]{};`,
    time: "O(n)", space: "O(n)"
  },
  125: {
    pattern: "Two Pointers",
    approach: "A palindrome check ignores non-alphanumeric chars. Reading from both ends signals two-pointer approach. Skip non-relevant chars and compare lowercase versions.",
    insight: "Skip non-alphanumeric chars from both ends, compare lowercase. No extra space needed.",
    code: `int l = 0, r = s.length() - 1;
while (l < r) {
  while (l < r && !Character.isLetterOrDigit(s.charAt(l))) l++;
  while (l < r && !Character.isLetterOrDigit(s.charAt(r))) r--;
  if (Character.toLowerCase(s.charAt(l)) != Character.toLowerCase(s.charAt(r))) return false;
  l++; r--;
}
return true;`,
    time: "O(n)", space: "O(1)"
  },
  11: {
    pattern: "Two Pointers",
    approach: "You need to maximize area between two lines. Brute force checks all pairs O(n²). Notice that starting from the widest container (both ends) and moving inward is optimal — you only shrink width, so you must move the shorter side hoping for a taller one.",
    insight: "Area = min(left, right) * distance. Always move the shorter side — moving the taller can never help.",
    code: `int l = 0, r = height.length - 1, max = 0;
while (l < r) {
  max = Math.max(max, Math.min(height[l], height[r]) * (r - l));
  if (height[l] < height[r]) l++;
  else r--;
}
return max;`,
    time: "O(n)", space: "O(1)"
  },
  3: {
    pattern: "Sliding Window",
    approach: "The problem asks for the longest substring with unique characters — 'longest subarray/substring with a constraint' is the classic sliding window signal. Expand right to include chars, and when you hit a duplicate, shrink left past the previous occurrence. Track positions with a map or array.",
    insight: "Track last-seen index of each char. When duplicate found, slide left past its previous position.",
    code: `int[] last = new int[128];
Arrays.fill(last, -1);
int l = 0, max = 0;
for (int r = 0; r < s.length(); r++) {
  char c = s.charAt(r);
  if (last[c] >= l) l = last[c] + 1;
  last[c] = r;
  max = Math.max(max, r - l + 1);
}
return max;`,
    time: "O(n)", space: "O(1)"
  },
  1004: {
    pattern: "Sliding Window",
    approach: "A 'longest subarray with at most k flips' signals sliding window. Expand right, count flips, shrink left when flips exceed k. The max window size is your answer.",
    insight: "Expand right freely; when zeroes flipped exceeds k, shrink left. Max window = answer.",
    code: `int l = 0, flips = 0, max = 0;
for (int r = 0; r < nums.length; r++) {
  if (nums[r] == 0) flips++;
  while (flips > k) { if (nums[l++] == 0) flips--; }
  max = Math.max(max, r - l + 1);
}
return max;`,
    time: "O(n)", space: "O(1)"
  },
  560: {
    pattern: "Prefix Sum + Hash Map",
    approach: "You're counting subarrays with a specific sum. Brute force checks all O(n²) subarrays. The insight: prefixSum[j] - prefixSum[i] = k tells you which subarrays work. Use a map to track prefix sums seen so far and look back in O(1).",
    insight: "prefixSum[j] - prefixSum[i] == k means subarray [i+1..j] sums to k. Store prefix sums in map as you go.",
    code: `Map<Integer, Integer> map = new HashMap<>();
map.put(0, 1);
int sum = 0, count = 0;
for (int num : nums) {
  sum += num;
  count += map.getOrDefault(sum - k, 0);
  map.put(sum, map.getOrDefault(sum, 0) + 1);
}
return count;`,
    time: "O(n)", space: "O(n)"
  },
  238: {
    pattern: "Prefix Product",
    approach: "Without division, you need the product of everything left and right of each index. Two-pass approach: first pass accumulates left products, second pass accumulates right products and multiplies.",
    insight: "res[i] = product of everything left × product of everything right. Do two passes: left-to-right, right-to-left.",
    code: `int n = nums.length;
int[] res = new int[n];
res[0] = 1;
for (int i = 1; i < n; i++) res[i] = res[i-1] * nums[i-1];
int right = 1;
for (int i = n-1; i >= 0; i--) {
  res[i] *= right;
  right *= nums[i];
}
return res;`,
    time: "O(n)", space: "O(1)"
  },
  242: {
    pattern: "Frequency Count",
    approach: "Two anagrams have identical character frequencies. Brute force sorts both strings O(n log n). The faster way: count character frequencies and compare, using int[26] for English letters in O(n).",
    insight: "Count chars in s, subtract chars in t. If any slot != 0, not an anagram. Use int[26] — faster than HashMap.",
    code: `if (s.length() != t.length()) return false;
int[] freq = new int[26];
for (char c : s.toCharArray()) freq[c - 'a']++;
for (char c : t.toCharArray()) freq[c - 'a']--;
for (int f : freq) if (f != 0) return false;
return true;`,
    time: "O(n)", space: "O(1)"
  },
  49: {
    pattern: "Hash Map + Sort Key",
    approach: "Grouping anagrams means finding words with the same character frequencies. Sorting the characters of each word creates a canonical key — all anagrams map to the same sorted key.",
    insight: "Anagrams share the same sorted-char key. Group words by that key.",
    code: `Map<String, List<String>> map = new HashMap<>();
for (String w : strs) {
  char[] ch = w.toCharArray();
  Arrays.sort(ch);
  String key = new String(ch);
  map.computeIfAbsent(key, k -> new ArrayList<>()).add(w);
}
return new ArrayList<>(map.values());`,
    time: "O(n * k log k)", space: "O(n * k)"
  },
  344: {
    pattern: "Two Pointers",
    approach: "Reversing a string in-place with O(1) space signals two-pointer approach. Swap from both ends toward the center.",
    insight: "Swap chars from both ends toward center. Classic in-place reversal.",
    code: `int l = 0, r = s.length - 1;
while (l < r) {
  char tmp = s[l]; s[l] = s[r]; s[r] = tmp;
  l++; r--;
}`,
    time: "O(n)", space: "O(1)"
  },
  151: {
    pattern: "String Split + Reverse",
    approach: "String reversal at the word level, not character level. Split on whitespace, iterate backwards, and rebuild with single spaces.",
    insight: "Trim, split on whitespace, iterate words in reverse, join with single space.",
    code: `String[] words = s.trim().split("\\s+");
StringBuilder sb = new StringBuilder();
for (int i = words.length - 1; i >= 0; i--) {
  sb.append(words[i]);
  if (i > 0) sb.append(' ');
}
return sb.toString();`,
    time: "O(n)", space: "O(n)"
  },

  // ── WEEK 2 ─────────────────────────────────────
  347: {
    pattern: "Top K Heap",
    approach: "Top K problems with frequencies signal min-heap of size K. Keep the K most frequent, evicting the least frequent when size exceeds K.",
    insight: "Count frequencies; keep a min-heap of size k by frequency. When heap > k, poll smallest. Remaining k = answer.",
    code: `Map<Integer, Integer> freq = new HashMap<>();
for (int n : nums) freq.put(n, freq.getOrDefault(n, 0) + 1);
PriorityQueue<Integer> minHeap = new PriorityQueue<>((a, b) -> freq.get(a) - freq.get(b));
for (int n : freq.keySet()) {
  minHeap.offer(n);
  if (minHeap.size() > k) minHeap.poll();
}
return minHeap.stream().mapToInt(Integer::intValue).toArray();`,
    time: "O(n log k)", space: "O(n)"
  },
  383: {
    pattern: "Frequency Count",
    approach: "Each letter in ransom note must be available in the magazine. Count available letters and check if we can 'spend' each one we need.",
    insight: "Count available letters in magazine. For each letter in ransom note, decrement — return false if 0.",
    code: `int[] freq = new int[26];
for (char c : magazine.toCharArray()) freq[c - 'a']++;
for (char c : ransomNote.toCharArray()) {
  if (--freq[c - 'a'] < 0) return false;
}
return true;`,
    time: "O(m + n)", space: "O(1)"
  },
  217: {
    pattern: "Hash Set",
    approach: "Detecting duplicates in O(1) lookup per element signals HashSet. If add() returns false, we found a duplicate.",
    insight: "If element already in set when we try to add it, we found a duplicate.",
    code: `Set<Integer> seen = new HashSet<>();
for (int n : nums) {
  if (!seen.add(n)) return true;
}
return false;`,
    time: "O(n)", space: "O(n)"
  },
  128: {
    pattern: "Hash Set",
    approach: "Finding longest consecutive sequence O(n) requires avoiding redundant work. Only start counting when num-1 is absent — this guarantees we count each sequence exactly once.",
    insight: "Only start a sequence when num-1 is not in set (avoid recount). Walk forward counting length.",
    code: `Set<Integer> set = new HashSet<>();
for (int n : nums) set.add(n);
int max = 0;
for (int n : set) {
  if (!set.contains(n - 1)) {
    int len = 1;
    while (set.contains(n + len)) len++;
    max = Math.max(max, len);
  }
}
return max;`,
    time: "O(n)", space: "O(n)"
  },
  704: {
    pattern: "Binary Search",
    approach: "Classic binary search on a sorted array. Initialize lo=0, hi=n-1, use mid to eliminate half the space each iteration.",
    insight: "Classic: lo=0, hi=n-1. Mid = lo + (hi-lo)/2. Adjust bounds based on comparison.",
    code: `int lo = 0, hi = nums.length - 1;
while (lo <= hi) {
  int mid = lo + (hi - lo) / 2;
  if (nums[mid] == target) return mid;
  else if (nums[mid] < target) lo = mid + 1;
  else hi = mid - 1;
}
return -1;`,
    time: "O(log n)", space: "O(1)"
  },
  33: {
    pattern: "Binary Search (Rotated)",
    approach: "In a rotated sorted array, one half is always sorted. Check which half contains the target and search there.",
    insight: "One half is always sorted. Check if target lies in the sorted half, else search the other.",
    code: `int lo = 0, hi = nums.length - 1;
while (lo <= hi) {
  int mid = lo + (hi - lo) / 2;
  if (nums[mid] == target) return mid;
  if (nums[lo] <= nums[mid]) {          // left half sorted
    if (target >= nums[lo] && target < nums[mid]) hi = mid - 1;
    else lo = mid + 1;
  } else {                               // right half sorted
    if (target > nums[mid] && target <= nums[hi]) lo = mid + 1;
    else hi = mid - 1;
  }
}
return -1;`,
    time: "O(log n)", space: "O(1)"
  },
  153: {
    pattern: "Binary Search",
    approach: "Finding the minimum in a rotated array is binary search. Compare mid with the right endpoint to determine which side holds the minimum.",
    insight: "If nums[mid] > nums[hi], min is in right half. Otherwise it's in left half (or is mid).",
    code: `int lo = 0, hi = nums.length - 1;
while (lo < hi) {
  int mid = lo + (hi - lo) / 2;
  if (nums[mid] > nums[hi]) lo = mid + 1;
  else hi = mid;
}
return nums[lo];`,
    time: "O(log n)", space: "O(1)"
  },
  875: {
    pattern: "Binary Search (Answer Space)",
    approach: "Binary search on answer space: the answer is a speed (not an index). For each candidate speed, check if Koko finishes in time, then narrow the range.",
    insight: "Binary search on speed [1..max(piles)]. For each speed, compute hours. Find min speed that fits within h.",
    code: `int lo = 1, hi = 0;
for (int p : piles) hi = Math.max(hi, p);
while (lo < hi) {
  int mid = lo + (hi - lo) / 2;
  long hours = 0;
  for (int p : piles) hours += (p + mid - 1) / mid;
  if (hours <= h) hi = mid;
  else lo = mid + 1;
}
return lo;`,
    time: "O(n log(max))", space: "O(1)"
  },
  1011: {
    pattern: "Binary Search (Answer Space)",
    approach: "Binary search on ship capacity (answer space). For each capacity, simulate the number of days needed and check if it's achievable.",
    insight: "Search on capacity [max(weights)..sum(weights)]. For each capacity, simulate days needed.",
    code: `int lo = 0, hi = 0;
for (int w : weights) { lo = Math.max(lo, w); hi += w; }
while (lo < hi) {
  int mid = lo + (hi - lo) / 2;
  int days = 1, cur = 0;
  for (int w : weights) {
    if (cur + w > mid) { days++; cur = 0; }
    cur += w;
  }
  if (days <= d) hi = mid;
  else lo = mid + 1;
}
return lo;`,
    time: "O(n log(sum))", space: "O(1)"
  },
  162: {
    pattern: "Binary Search",
    approach: "Finding a peak in an unsorted array signals binary search on position. If nums[mid] < nums[mid+1], peak is right; else it's left or at mid.",
    insight: "If nums[mid] < nums[mid+1], a peak is to the right. Else peak is at mid or left.",
    code: `int lo = 0, hi = nums.length - 1;
while (lo < hi) {
  int mid = lo + (hi - lo) / 2;
  if (nums[mid] < nums[mid + 1]) lo = mid + 1;
  else hi = mid;
}
return lo;`,
    time: "O(log n)", space: "O(1)"
  },
  74: {
    pattern: "Binary Search (2D as 1D)",
    approach: "A 2D matrix that's row-sorted and column-sorted can be treated as a 1D sorted array. Map indices: row = i/cols, col = i%cols.",
    insight: "Treat m×n matrix as sorted 1D array. Index i → row = i/n, col = i%n.",
    code: `int m = matrix.length, n = matrix[0].length;
int lo = 0, hi = m * n - 1;
while (lo <= hi) {
  int mid = lo + (hi - lo) / 2;
  int val = matrix[mid / n][mid % n];
  if (val == target) return true;
  else if (val < target) lo = mid + 1;
  else hi = mid - 1;
}
return false;`,
    time: "O(log(m*n))", space: "O(1)"
  },

  // ── WEEK 3 ─────────────────────────────────────
  206: {
    pattern: "Linked List Reversal",
    approach: "Reversing a linked list requires pointer manipulation. Iterate forward, flipping each node's 'next' pointer before moving to the next node.",
    insight: "Reverse pointers in one pass: prev ← curr → next. Save next before breaking the link.",
    code: `ListNode prev = null;
while (head != null) {
  ListNode next = head.next;
  head.next = prev;
  prev = head;
  head = next;
}
return prev;`,
    time: "O(n)", space: "O(1)"
  },
  21: {
    pattern: "Two Pointers Merge",
    approach: "Merging two sorted lists is a classic two-pointer merge. Use a dummy head to simplify edge cases, always take the smaller node.",
    insight: "Dummy head simplifies edge cases. Walk both lists, always take the smaller node.",
    code: `ListNode dummy = new ListNode(0), cur = dummy;
while (list1 != null && list2 != null) {
  if (list1.val <= list2.val) { cur.next = list1; list1 = list1.next; }
  else { cur.next = list2; list2 = list2.next; }
  cur = cur.next;
}
cur.next = (list1 != null) ? list1 : list2;
return dummy.next;`,
    time: "O(n + m)", space: "O(1)"
  },
  141: {
    pattern: "Fast & Slow Pointers",
    approach: "Cycle detection in a linked list: fast pointer moves 2 steps, slow moves 1. If they meet, a cycle exists.",
    insight: "If a cycle exists, fast (2 steps) will eventually lap slow (1 step) — they'll meet inside the cycle.",
    code: `ListNode slow = head, fast = head;
while (fast != null && fast.next != null) {
  slow = slow.next;
  fast = fast.next.next;
  if (slow == fast) return true;
}
return false;`,
    time: "O(n)", space: "O(1)"
  },
  287: {
    pattern: "Floyd Cycle Detection",
    approach: "The array is a functional graph (each index points to another). Cycle detection via Floyd's algorithm finds the cycle entry point, which is the duplicate.",
    insight: "Array indices form a linked list where nums[i] is the next node. The duplicate is the cycle entry point.",
    code: `int slow = nums[0], fast = nums[0];
do {
  slow = nums[slow];
  fast = nums[nums[fast]];
} while (slow != fast);
slow = nums[0];
while (slow != fast) {
  slow = nums[slow];
  fast = nums[fast];
}
return slow;`,
    time: "O(n)", space: "O(1)"
  },
  20: {
    pattern: "Stack",
    approach: "Parentheses matching is a classic stack problem. Push opening brackets, pop and match on closing. Valid if stack is empty at end.",
    insight: "Push opens; on close, pop and check match. Empty stack at close or non-empty at end = invalid.",
    code: `Deque<Character> st = new ArrayDeque<>();
for (char c : s.toCharArray()) {
  if (c == '(' || c == '[' || c == '{') st.push(c);
  else {
    if (st.isEmpty()) return false;
    char top = st.pop();
    if ((c == ')' && top != '(') || (c == ']' && top != '[') || (c == '}' && top != '{')) return false;
  }
}
return st.isEmpty();`,
    time: "O(n)", space: "O(n)"
  },
  155: {
    pattern: "Stack with Min Tracking",
    approach: "Min stack requires tracking the running minimum at every step. Maintain two stacks in parallel — one for values, one for running mins.",
    insight: "Two stacks: one for values, one for running minimum. Every push records the current min.",
    code: `Deque<Integer> st = new ArrayDeque<>(), minSt = new ArrayDeque<>();

void push(int val) {
  st.push(val);
  minSt.push(minSt.isEmpty() ? val : Math.min(minSt.peek(), val));
}
void pop()   { st.pop(); minSt.pop(); }
int top()    { return st.peek(); }
int getMin() { return minSt.peek(); }`,
    time: "O(1) per op", space: "O(n)"
  },
  150: {
    pattern: "Stack",
    approach: "Evaluating RPN (postfix notation) signals stack usage. Push operands, pop two and compute on operators, maintaining correct order.",
    insight: "Push numbers; on operator, pop two, compute, push result. Order matters: b = first pop, a = second.",
    code: `Deque<Integer> st = new ArrayDeque<>();
for (String t : tokens) {
  if ("+-*/".contains(t)) {
    int b = st.pop(), a = st.pop();
    if (t.equals("+")) st.push(a + b);
    else if (t.equals("-")) st.push(a - b);
    else if (t.equals("*")) st.push(a * b);
    else st.push(a / b);
  } else st.push(Integer.parseInt(t));
}
return st.pop();`,
    time: "O(n)", space: "O(n)"
  },
  739: {
    pattern: "Monotonic Stack",
    approach: "Daily Temperatures: finding the next warmer day. Monotonic stack stores indices in decreasing temperature order — when you find a warmer day, pop and record distance.",
    insight: "Stack holds indices of temperatures in decreasing order. When a warmer day comes, pop all cooler days — answer is distance.",
    code: `int n = temperatures.length;
int[] res = new int[n];
Deque<Integer> st = new ArrayDeque<>();
for (int i = 0; i < n; i++) {
  while (!st.isEmpty() && temperatures[st.peek()] < temperatures[i]) {
    int j = st.pop();
    res[j] = i - j;
  }
  st.push(i);
}
return res;`,
    time: "O(n)", space: "O(n)"
  },
  496: {
    pattern: "Monotonic Stack + Hash Map",
    approach: "Next Greater Element: process nums2 with a monotonic stack to build a map, then answer queries from nums1 in O(1).",
    insight: "Process nums2 with monotonic stack to build a next-greater map. Then answer each query in nums1 in O(1).",
    code: `Map<Integer, Integer> map = new HashMap<>();
Deque<Integer> st = new ArrayDeque<>();
for (int n : nums2) {
  while (!st.isEmpty() && st.peek() < n) map.put(st.pop(), n);
  st.push(n);
}
int[] res = new int[nums1.length];
for (int i = 0; i < nums1.length; i++) res[i] = map.getOrDefault(nums1[i], -1);
return res;`,
    time: "O(m + n)", space: "O(m)"
  },
  84: {
    pattern: "Monotonic Stack",
    approach: "Largest Rectangle in Histogram: for each bar, find how far left and right it extends. Monotonic stack of indices tracks the extending boundary efficiently.",
    insight: "Stack holds bar indices in non-decreasing height. When shorter bar arrives, pop taller bars and compute area: height × (i - stack.peek() - 1).",
    code: `Deque<Integer> st = new ArrayDeque<>();
int max = 0;
for (int i = 0; i <= heights.length; i++) {
  int h = (i == heights.length) ? 0 : heights[i];
  while (!st.isEmpty() && heights[st.peek()] > h) {
    int height = heights[st.pop()];
    int width = st.isEmpty() ? i : i - st.peek() - 1;
    max = Math.max(max, height * width);
  }
  st.push(i);
}
return max;`,
    time: "O(n)", space: "O(n)"
  },
  853: {
    pattern: "Monotonic Stack / Greedy",
    approach: "Car Fleet: sort by position (closest to target first). Each car either catches the fleet ahead or forms a new fleet. Track via monotonic stack of arrival times.",
    insight: "Sort by position descending. Compute each car's time to reach target. If current car is slower (larger time) than fleet ahead, it starts a new fleet.",
    code: `int n = position.length;
int[][] cars = new int[n][2];
for (int i = 0; i < n; i++) cars[i] = new int[]{position[i], speed[i]};
Arrays.sort(cars, (a, b) -> b[0] - a[0]); // closest to target first
Deque<Double> st = new ArrayDeque<>();
for (int[] car : cars) {
  double time = (double)(target - car[0]) / car[1];
  if (st.isEmpty() || time > st.peek()) st.push(time);
}
return st.size();`,
    time: "O(n log n)", space: "O(n)"
  },

  // ── WEEK 4 ─────────────────────────────────────
  104: {
    pattern: "DFS / Tree Recursion",
    approach: "Maximum tree depth is a classic recursion: depth = 1 + max(left depth, right depth). Base case: null = 0.",
    insight: "Depth = 1 + max(left depth, right depth). Base case: null node = 0.",
    code: `if (root == null) return 0;
return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));`,
    time: "O(n)", space: "O(h)"
  },
  543: {
    pattern: "DFS + Diameter Tracking",
    approach: "Tree diameter is the longest path through any node. At each node, candidate = left height + right height. Return 1 + max(left, right) for parent.",
    insight: "At each node, diameter candidate = left height + right height. Return 1 + max(left, right) to parent.",
    code: `int[] max = {0};
dfs(root, max);
return max[0];

int dfs(TreeNode node, int[] max) {
  if (node == null) return 0;
  int l = dfs(node.left, max), r = dfs(node.right, max);
  max[0] = Math.max(max[0], l + r);
  return 1 + Math.max(l, r);
}`,
    time: "O(n)", space: "O(h)"
  },
  112: {
    pattern: "DFS / Tree Recursion",
    approach: "Path sum from root to leaf: subtract node value from target as you go. At a leaf, check if remaining equals 0.",
    insight: "Subtract node value from target. At a leaf, check if remaining == 0.",
    code: `if (root == null) return false;
if (root.left == null && root.right == null) return targetSum == root.val;
return hasPathSum(root.left, targetSum - root.val)
    || hasPathSum(root.right, targetSum - root.val);`,
    time: "O(n)", space: "O(h)"
  },
  236: {
    pattern: "DFS LCA",
    approach: "Lowest Common Ancestor: if both subtrees have p and q, current is LCA. If only one side, bubble that result up.",
    insight: "If both subtrees return non-null, current node is LCA. If only one side, bubble that up.",
    code: `if (root == null || root == p || root == q) return root;
TreeNode left  = lowestCommonAncestor(root.left, p, q);
TreeNode right = lowestCommonAncestor(root.right, p, q);
if (left != null && right != null) return root;
return left != null ? left : right;`,
    time: "O(n)", space: "O(h)"
  },
  102: {
    pattern: "BFS Level Order",
    approach: "Level-order tree traversal (BFS). Track level size to process layer-by-layer.",
    insight: "Queue with level-size snapshot: snapshot size = nodes in current level. Enqueue children for next level.",
    code: `List<List<Integer>> res = new ArrayList<>();
if (root == null) return res;
Queue<TreeNode> q = new LinkedList<>();
q.offer(root);
while (!q.isEmpty()) {
  int sz = q.size();
  List<Integer> level = new ArrayList<>();
  for (int i = 0; i < sz; i++) {
    TreeNode node = q.poll();
    level.add(node.val);
    if (node.left != null)  q.offer(node.left);
    if (node.right != null) q.offer(node.right);
  }
  res.add(level);
}
return res;`,
    time: "O(n)", space: "O(w)"
  },
  199: {
    pattern: "BFS Right View",
    approach: "Right side view: level-order traversal capturing the last node of each level.",
    insight: "Level-order traversal; capture the last node in each level.",
    code: `List<Integer> res = new ArrayList<>();
Queue<TreeNode> q = new LinkedList<>();
if (root != null) q.offer(root);
while (!q.isEmpty()) {
  int sz = q.size();
  for (int i = 0; i < sz; i++) {
    TreeNode node = q.poll();
    if (i == sz - 1) res.add(node.val);
    if (node.left != null)  q.offer(node.left);
    if (node.right != null) q.offer(node.right);
  }
}
return res;`,
    time: "O(n)", space: "O(w)"
  },
  98: {
    pattern: "DFS BST Validation",
    approach: "BST validation requires bounds checking: left < node < right. Pass (min, max) bounds down recursively.",
    insight: "Pass (min, max) bounds. Left child must be < node; right child must be > node. Use Long to handle Integer edge values.",
    code: `return validate(root, Long.MIN_VALUE, Long.MAX_VALUE);

boolean validate(TreeNode n, long min, long max) {
  if (n == null) return true;
  if (n.val <= min || n.val >= max) return false;
  return validate(n.left, min, n.val) && validate(n.right, n.val, max);
}`,
    time: "O(n)", space: "O(h)"
  },
  230: {
    pattern: "Inorder BST Traversal",
    approach: "Kth smallest in BST: inorder traversal visits nodes in sorted order. Count nodes and return the kth one.",
    insight: "Inorder of BST = sorted order. Count nodes; when count == k, that's the answer.",
    code: `int[] cnt = {0}, res = {0};
inorder(root, k, cnt, res);
return res[0];

void inorder(TreeNode n, int k, int[] cnt, int[] res) {
  if (n == null) return;
  inorder(n.left, k, cnt, res);
  if (++cnt[0] == k) res[0] = n.val;
  inorder(n.right, k, cnt, res);
}`,
    time: "O(n)", space: "O(h)"
  },
  124: {
    pattern: "DFS Max Path Sum",
    approach: "Binary tree maximum path sum: at each node, compute through-path = node + max(0,left) + max(0,right). Return node + max one branch to parent.",
    insight: "At each node, max through-path = node + max(0, left) + max(0, right). Return node + max(0, one branch) to parent.",
    code: `int[] max = {Integer.MIN_VALUE};
gain(root, max);
return max[0];

int gain(TreeNode n, int[] max) {
  if (n == null) return 0;
  int l = Math.max(0, gain(n.left, max));
  int r = Math.max(0, gain(n.right, max));
  max[0] = Math.max(max[0], l + r + n.val);
  return n.val + Math.max(l, r);
}`,
    time: "O(n)", space: "O(h)"
  },
  208: {
    pattern: "Trie",
    approach: "Trie: a tree of characters. Each node has 26 child pointers and an isEnd flag. Insert/search/startsWith walk the path, creating nodes on insert.",
    insight: "Tree of chars. Each node has 26 children + isEnd flag. Walk path on insert/search, create nodes as needed.",
    code: `class TrieNode {
  TrieNode[] ch = new TrieNode[26];
  boolean end;
}
TrieNode root = new TrieNode();

void insert(String word) {
  TrieNode cur = root;
  for (char c : word.toCharArray()) {
    int i = c - 'a';
    if (cur.ch[i] == null) cur.ch[i] = new TrieNode();
    cur = cur.ch[i];
  }
  cur.end = true;
}
boolean search(String word) {
  TrieNode cur = root;
  for (char c : word.toCharArray()) {
    int i = c - 'a';
    if (cur.ch[i] == null) return false;
    cur = cur.ch[i];
  }
  return cur.end;
}
boolean startsWith(String prefix) {
  TrieNode cur = root;
  for (char c : prefix.toCharArray()) {
    int i = c - 'a';
    if (cur.ch[i] == null) return false;
    cur = cur.ch[i];
  }
  return true;
}`,
    time: "O(m) per op", space: "O(26 * N)"
  },

  // ── WEEK 5 ─────────────────────────────────────
  215: {
    pattern: "Top K Heap (min-heap)",
    approach: "Kth largest: min-heap of size k maintains the k largest elements. The heap min is the kth largest.",
    insight: "K largest → min-heap of size k. When heap exceeds k, evict the smallest. The heap peek is the kth largest.",
    code: `PriorityQueue<Integer> minHeap = new PriorityQueue<>();
for (int n : nums) {
  minHeap.offer(n);
  if (minHeap.size() > k) minHeap.poll();
}
return minHeap.peek();`,
    time: "O(n log k)", space: "O(k)"
  },
  1046: {
    pattern: "Max Heap",
    approach: "Last Stone Weight: repeatedly smash the two heaviest stones. Max-heap naturally gives you the heaviest.",
    insight: "Repeatedly smash the two heaviest stones. Push the difference if they're unequal. Return last stone.",
    code: `PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a, b) -> b - a);
for (int s : stones) maxHeap.offer(s);
while (maxHeap.size() > 1) {
  int diff = maxHeap.poll() - maxHeap.poll();
  if (diff > 0) maxHeap.offer(diff);
}
return maxHeap.isEmpty() ? 0 : maxHeap.peek();`,
    time: "O(n log n)", space: "O(n)"
  },
  973: {
    pattern: "Top K Heap (max-heap for K closest)",
    approach: "K Closest Points: Top K closest distances. Max-heap of size k, evicting the farthest when size > k.",
    insight: "K smallest distances → max-heap of size k. Evict farthest when size > k.",
    code: `PriorityQueue<int[]> maxHeap = new PriorityQueue<>(
  (a, b) -> (b[0]*b[0]+b[1]*b[1]) - (a[0]*a[0]+a[1]*a[1]));
for (int[] p : points) {
  maxHeap.offer(p);
  if (maxHeap.size() > k) maxHeap.poll();
}
return maxHeap.toArray(new int[0][]);`,
    time: "O(n log k)", space: "O(k)"
  },
  23: {
    pattern: "Min Heap (Merge K Sorted)",
    approach: "Merge K Sorted Lists: min-heap of list heads. Poll the smallest, attach to result, push its next.",
    insight: "Push all list heads into min-heap. Poll smallest, attach to result, push its next. Repeat.",
    code: `PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> a.val - b.val);
for (ListNode l : lists) if (l != null) pq.offer(l);
ListNode dummy = new ListNode(0), cur = dummy;
while (!pq.isEmpty()) {
  cur.next = pq.poll();
  cur = cur.next;
  if (cur.next != null) pq.offer(cur.next);
}
return dummy.next;`,
    time: "O(n log k)", space: "O(k)"
  },
  295: {
    pattern: "Two Heaps",
    approach: "Find Median: max-heap (left half) + min-heap (right half) kept balanced. Median is top of larger heap or average of both tops.",
    insight: "Max-heap (left half) + min-heap (right half). Keep sizes balanced (differ by at most 1). Median = top of larger heap or average of both tops.",
    code: `PriorityQueue<Integer> lo = new PriorityQueue<>((a, b) -> b - a); // max-heap
PriorityQueue<Integer> hi = new PriorityQueue<>();                   // min-heap

void addNum(int num) {
  lo.offer(num);
  hi.offer(lo.poll());
  if (lo.size() < hi.size()) lo.offer(hi.poll());
}
double findMedian() {
  return lo.size() > hi.size() ? lo.peek() : (lo.peek() + hi.peek()) / 2.0;
}`,
    time: "O(log n) add, O(1) median", space: "O(n)"
  },
  253: {
    pattern: "Greedy + Min Heap",
    approach: "Meeting Rooms II: sort meetings by start time. Min-heap of end times tracks when rooms become available. Heap size = rooms needed.",
    insight: "Sort by start time. Min-heap of end times. Reuse a room if its end <= current start. Heap size = rooms needed.",
    code: `Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
PriorityQueue<Integer> pq = new PriorityQueue<>();
for (int[] iv : intervals) {
  if (!pq.isEmpty() && pq.peek() <= iv[0]) pq.poll();
  pq.offer(iv[1]);
}
return pq.size();`,
    time: "O(n log n)", space: "O(n)"
  },
  621: {
    pattern: "Greedy + Max Heap",
    approach: "Task Scheduler: always schedule the most frequent remaining task. If cooldown forces gaps, track with a temporary list and cycle.",
    insight: "Always schedule the most frequent remaining task. If cooldown forces idle, track with a temp list.",
    code: `Map<Character, Integer> freq = new HashMap<>();
for (char c : tasks) freq.put(c, freq.getOrDefault(c, 0) + 1);
PriorityQueue<Integer> pq = new PriorityQueue<>((a, b) -> b - a);
pq.addAll(freq.values());
int time = 0;
while (!pq.isEmpty()) {
  List<Integer> temp = new ArrayList<>();
  for (int i = 0; i < n + 1 && !pq.isEmpty(); i++) temp.add(pq.poll() - 1);
  for (int f : temp) if (f > 0) pq.offer(f);
  time += pq.isEmpty() ? temp.size() : n + 1;
}
return time;`,
    time: "O(n log k)", space: "O(k)"
  },
  767: {
    pattern: "Greedy + Max Heap",
    approach: "Reorganize String: place the most frequent character first, alternating between top-2 most frequent to avoid adjacency.",
    insight: "Always place the most frequent char. Alternate between top-2 most frequent to avoid adjacency.",
    code: `Map<Character, Integer> freq = new HashMap<>();
for (char c : s.toCharArray()) freq.put(c, freq.getOrDefault(c, 0) + 1);
PriorityQueue<Character> pq = new PriorityQueue<>((a, b) -> freq.get(b) - freq.get(a));
pq.addAll(freq.keySet());
StringBuilder sb = new StringBuilder();
while (pq.size() >= 2) {
  char a = pq.poll(), b = pq.poll();
  sb.append(a).append(b);
  if (freq.merge(a, -1, Integer::sum) > 0) pq.offer(a);
  if (freq.merge(b, -1, Integer::sum) > 0) pq.offer(b);
}
if (!pq.isEmpty()) {
  char c = pq.poll();
  if (freq.get(c) > 1) return "";
  sb.append(c);
}
return sb.toString();`,
    time: "O(n log k)", space: "O(k)"
  },
  1642: {
    pattern: "Greedy + Min Heap",
    approach: "Furthest Building: assign climbs to ladders greedily. When out of ladders, swap the smallest climb for bricks instead.",
    insight: "Assign climbs greedily to ladders. When we run out of ladders, swap the cheapest ladder use (smallest climb) for bricks.",
    code: `PriorityQueue<Integer> pq = new PriorityQueue<>(); // min-heap of climbs assigned to ladders
int bricksUsed = 0;
for (int i = 0; i < heights.length - 1; i++) {
  int diff = heights[i + 1] - heights[i];
  if (diff <= 0) continue;
  pq.offer(diff);
  if (pq.size() > ladders) bricksUsed += pq.poll(); // use bricks for smallest climb
  if (bricksUsed > bricks) return i;
}
return heights.length - 1;`,
    time: "O(n log ladders)", space: "O(ladders)"
  },

  // ── WEEK 6 ─────────────────────────────────────
  200: {
    pattern: "DFS Graph (Flood Fill)",
    approach: "Number of Islands: flood-fill via DFS. For each unvisited land cell, DFS to mark the entire island, increment count.",
    insight: "For each unvisited '1', DFS to mark the whole island. Count how many times you start a new DFS.",
    code: `int count = 0;
for (int i = 0; i < grid.length; i++)
  for (int j = 0; j < grid[0].length; j++)
    if (grid[i][j] == '1') { count++; dfs(grid, i, j); }
return count;

void dfs(char[][] g, int i, int j) {
  if (i < 0 || i >= g.length || j < 0 || j >= g[0].length || g[i][j] != '1') return;
  g[i][j] = '0';
  dfs(g, i+1, j); dfs(g, i-1, j); dfs(g, i, j+1); dfs(g, i, j-1);
}`,
    time: "O(m*n)", space: "O(m*n)"
  },
  695: {
    pattern: "DFS Graph",
    approach: "Max Area of Island: same flood-fill, but accumulate and track the size of each island.",
    insight: "Same flood-fill as islands, but accumulate size during DFS and track max.",
    code: `int max = 0;
for (int i = 0; i < grid.length; i++)
  for (int j = 0; j < grid[0].length; j++)
    if (grid[i][j] == 1) max = Math.max(max, dfs(grid, i, j));
return max;

int dfs(int[][] g, int i, int j) {
  if (i < 0 || i >= g.length || j < 0 || j >= g[0].length || g[i][j] == 0) return 0;
  g[i][j] = 0;
  return 1 + dfs(g,i+1,j) + dfs(g,i-1,j) + dfs(g,i,j+1) + dfs(g,i,j-1);
}`,
    time: "O(m*n)", space: "O(m*n)"
  },
  994: {
    pattern: "Multi-Source BFS",
    approach: "Rotting Oranges: multi-source BFS from all rotten oranges simultaneously. Level-by-level expansion simulates each minute.",
    insight: "Seed queue with all rotten oranges at t=0. BFS level-by-level = each minute. Count fresh left at the end.",
    code: `Queue<int[]> q = new LinkedList<>();
int fresh = 0, m = grid.length, n = grid[0].length;
for (int i = 0; i < m; i++)
  for (int j = 0; j < n; j++) {
    if (grid[i][j] == 2) q.offer(new int[]{i, j});
    else if (grid[i][j] == 1) fresh++;
  }
int time = 0;
int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};
while (!q.isEmpty() && fresh > 0) {
  time++;
  for (int sz = q.size(); sz > 0; sz--) {
    int[] pos = q.poll();
    for (int[] d : dirs) {
      int ni = pos[0]+d[0], nj = pos[1]+d[1];
      if (ni>=0&&ni<m&&nj>=0&&nj<n&&grid[ni][nj]==1) { grid[ni][nj]=2; q.offer(new int[]{ni,nj}); fresh--; }
    }
  }
}
return fresh == 0 ? time : -1;`,
    time: "O(m*n)", space: "O(m*n)"
  },
  542: {
    pattern: "Multi-Source BFS",
    approach: "01 Matrix: find shortest distance to 0. Multi-source BFS from all 0 cells simultaneously.",
    insight: "Start BFS from all 0-cells simultaneously. Each wave expands distance by 1.",
    code: `int m = grid.length, n = grid[0].length;
Queue<int[]> q = new LinkedList<>();
for (int i = 0; i < m; i++)
  for (int j = 0; j < n; j++)
    if (grid[i][j] == 0) q.offer(new int[]{i, j});
    else grid[i][j] = Integer.MAX_VALUE;
int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};
while (!q.isEmpty()) {
  int[] p = q.poll();
  for (int[] d : dirs) {
    int ni = p[0]+d[0], nj = p[1]+d[1];
    if (ni>=0&&ni<m&&nj>=0&&nj<n && grid[ni][nj] > grid[p[0]][p[1]]+1) {
      grid[ni][nj] = grid[p[0]][p[1]] + 1;
      q.offer(new int[]{ni, nj});
    }
  }
}
return grid;`,
    time: "O(m*n)", space: "O(m*n)"
  },
  323: {
    pattern: "Union Find (DSU)",
    approach: "Number of Connected Components: Union-Find efficiently counts components. For each edge, union the two nodes.",
    insight: "Start with n components. Each successful union (different roots) reduces count by 1.",
    code: `int[] parent = new int[n];
for (int i = 0; i < n; i++) parent[i] = i;
int components = n;
for (int[] e : edges) {
  int p1 = find(parent, e[0]), p2 = find(parent, e[1]);
  if (p1 != p2) { parent[p1] = p2; components--; }
}
return components;

int find(int[] p, int x) {
  if (p[x] != x) p[x] = find(p, p[x]); // path compression
  return p[x];
}`,
    time: "O(n + m * α(n))", space: "O(n)"
  },
  684: {
    pattern: "Union Find (DSU)",
    approach: "Redundant Connection: build a graph with Union-Find. The first edge that would create a cycle is the redundant one.",
    insight: "If adding an edge connects two nodes already in the same component, that edge is redundant.",
    code: `int[] parent = new int[n + 1];
for (int i = 0; i <= n; i++) parent[i] = i;
for (int[] e : edges) {
  int p1 = find(parent, e[0]), p2 = find(parent, e[1]);
  if (p1 == p2) return e;
  parent[p1] = p2;
}
return new int[]{};

int find(int[] p, int x) {
  if (p[x] != x) p[x] = find(p, p[x]);
  return p[x];
}`,
    time: "O(n * α(n))", space: "O(n)"
  },
  207: {
    pattern: "Topological Sort (Kahn's BFS)",
    approach: "Course Schedule (cycle detection): topological sort via Kahn's BFS. If all nodes are processed, no cycle exists.",
    insight: "Build indegree array. Process nodes with indegree 0 (no prerequisites). If all processed = no cycle.",
    code: `List<List<Integer>> adj = new ArrayList<>();
int[] indegree = new int[numCourses];
for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
for (int[] p : prerequisites) { adj.get(p[1]).add(p[0]); indegree[p[0]]++; }
Queue<Integer> q = new LinkedList<>();
for (int i = 0; i < numCourses; i++) if (indegree[i] == 0) q.offer(i);
int count = 0;
while (!q.isEmpty()) {
  int node = q.poll(); count++;
  for (int next : adj.get(node)) if (--indegree[next] == 0) q.offer(next);
}
return count == numCourses;`,
    time: "O(V + E)", space: "O(V + E)"
  },
  210: {
    pattern: "Topological Sort (Kahn's BFS)",
    approach: "Course Schedule II (topological order): Kahn's BFS returns the topological order.",
    insight: "Same as Course Schedule I, but record the order of processing to get the actual topological ordering.",
    code: `List<List<Integer>> adj = new ArrayList<>();
int[] indegree = new int[numCourses], order = new int[numCourses];
for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
for (int[] p : prerequisites) { adj.get(p[1]).add(p[0]); indegree[p[0]]++; }
Queue<Integer> q = new LinkedList<>();
for (int i = 0; i < numCourses; i++) if (indegree[i] == 0) q.offer(i);
int idx = 0;
while (!q.isEmpty()) {
  int node = q.poll(); order[idx++] = node;
  for (int next : adj.get(node)) if (--indegree[next] == 0) q.offer(next);
}
return idx == numCourses ? order : new int[]{};`,
    time: "O(V + E)", space: "O(V + E)"
  },
  127: {
    pattern: "BFS + Word Neighbor Generation",
    approach: "Word Ladder: shortest path between two words with one-letter changes. Multi-source BFS from start word.",
    insight: "BFS from beginWord. At each step, try changing every character to a-z. If result is in wordSet, that's a neighbor. Track distance.",
    code: `Set<String> wordSet = new HashSet<>(wordList);
if (!wordSet.contains(endWord)) return 0;
Queue<String> q = new LinkedList<>();
q.offer(beginWord); wordSet.remove(beginWord);
int dist = 1;
while (!q.isEmpty()) {
  for (int sz = q.size(); sz > 0; sz--) {
    char[] arr = q.poll().toCharArray();
    for (int i = 0; i < arr.length; i++) {
      char orig = arr[i];
      for (char c = 'a'; c <= 'z'; c++) {
        arr[i] = c;
        String next = new String(arr);
        if (next.equals(endWord)) return dist + 1;
        if (wordSet.remove(next)) q.offer(next);
      }
      arr[i] = orig;
    }
  }
  dist++;
}
return 0;`,
    time: "O(n * L * 26)", space: "O(n * L)"
  },
  417: {
    pattern: "Reverse DFS from Borders",
    approach: "Pacific Atlantic Water Flow: water flows from high to low. DFS from borders backward to find cells reaching both oceans.",
    insight: "Reverse the flow: DFS from ocean borders inward (uphill). Cells reachable from both oceans = answer.",
    code: `int m = matrix.length, n = matrix[0].length;
boolean[][] pac = new boolean[m][n], atl = new boolean[m][n];
for (int i = 0; i < m; i++) { dfs(matrix, i, 0, pac); dfs(matrix, i, n-1, atl); }
for (int j = 0; j < n; j++) { dfs(matrix, 0, j, pac); dfs(matrix, m-1, j, atl); }
List<List<Integer>> res = new ArrayList<>();
for (int i = 0; i < m; i++)
  for (int j = 0; j < n; j++)
    if (pac[i][j] && atl[i][j]) res.add(Arrays.asList(i, j));
return res;

void dfs(int[][] g, int i, int j, boolean[][] visited) {
  if (i<0||i>=g.length||j<0||j>=g[0].length||visited[i][j]) return;
  visited[i][j] = true;
  int h = g[i][j];
  if (i>0&&g[i-1][j]>=h) dfs(g,i-1,j,visited);
  if (i<g.length-1&&g[i+1][j]>=h) dfs(g,i+1,j,visited);
  if (j>0&&g[i][j-1]>=h) dfs(g,i,j-1,visited);
  if (j<g[0].length-1&&g[i][j+1]>=h) dfs(g,i,j+1,visited);
}`,
    time: "O(m*n)", space: "O(m*n)"
  },

  // ── WEEK 7 ─────────────────────────────────────
  743: {
    pattern: "Dijkstra",
    approach: "You need the shortest path from a source to every other node (classic single-source shortest path). This screams Dijkstra. Build an adjacency list, use a min-heap ordered by distance, and greedily pick the next closest unvisited node.",
    insight: "Min-heap of (distance, node). Skip stale entries (dist > known best). Return max of all distances.",
    code: `Map<Integer, List<int[]>> graph = new HashMap<>();
for (int[] t : times) graph.computeIfAbsent(t[0], x -> new ArrayList<>()).add(new int[]{t[1], t[2]});
int[] dist = new int[n + 1];
Arrays.fill(dist, Integer.MAX_VALUE);
dist[k] = 0;
PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
pq.offer(new int[]{0, k});
while (!pq.isEmpty()) {
  int[] cur = pq.poll();
  int d = cur[0], u = cur[1];
  if (d > dist[u]) continue;
  for (int[] edge : graph.getOrDefault(u, new ArrayList<>())) {
    if (dist[u] + edge[1] < dist[edge[0]]) {
      dist[edge[0]] = dist[u] + edge[1];
      pq.offer(new int[]{dist[edge[0]], edge[0]});
    }
  }
}
int max = 0;
for (int i = 1; i <= n; i++) { if (dist[i] == Integer.MAX_VALUE) return -1; max = Math.max(max, dist[i]); }
return max;`,
    time: "O((V+E) log V)", space: "O(V + E)"
  },
  1631: {
    pattern: "Dijkstra (Minimax Path)",
    approach: "You're finding a path that minimizes the maximum effort, not the sum. This is a variant of Dijkstra where the 'distance' is the worst obstacle seen so far. Use the same min-heap strategy but track max(current_max_effort, next_edge_effort).",
    insight: "Dijkstra where the 'cost' is max effort encountered so far. Use min-heap on (maxEffort, row, col).",
    code: `int m = heights.length, n = heights[0].length;
int[][] dist = new int[m][n];
for (int[] row : dist) Arrays.fill(row, Integer.MAX_VALUE);
dist[0][0] = 0;
PriorityQueue<int[]> pq = new PriorityQueue<>((a,b) -> a[0]-b[0]);
pq.offer(new int[]{0, 0, 0});
int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};
while (!pq.isEmpty()) {
  int[] cur = pq.poll();
  int d = cur[0], r = cur[1], c = cur[2];
  if (r == m-1 && c == n-1) return d;
  if (d > dist[r][c]) continue;
  for (int[] dir : dirs) {
    int nr = r+dir[0], nc = c+dir[1];
    if (nr>=0&&nr<m&&nc>=0&&nc<n) {
      int nd = Math.max(d, Math.abs(heights[nr][nc] - heights[r][c]));
      if (nd < dist[nr][nc]) { dist[nr][nc] = nd; pq.offer(new int[]{nd, nr, nc}); }
    }
  }
}
return dist[m-1][n-1];`,
    time: "O(m*n*log(m*n))", space: "O(m*n)"
  },
  78: {
    pattern: "Backtracking (Subsets)",
    approach: "You need all subsets — the decision tree branches on 'include or exclude each element'. Generate them recursively: at every node, snapshot the current path into results, then try extending with each remaining element. Pass the next index to avoid duplicates.",
    insight: "Add current path to result at every node. Then extend by each remaining element in order.",
    code: `List<List<Integer>> res = new ArrayList<>();
bt(nums, 0, new ArrayList<>(), res);
return res;

void bt(int[] nums, int idx, List<Integer> path, List<List<Integer>> res) {
  res.add(new ArrayList<>(path));       // snapshot current subset
  for (int i = idx; i < nums.length; i++) {
    path.add(nums[i]);
    bt(nums, i + 1, path, res);
    path.remove(path.size() - 1);
  }
}`,
    time: "O(2^n)", space: "O(n)"
  },
  90: {
    pattern: "Backtracking (Subsets with Dups)",
    approach: "Same as subsets, but duplicates will create duplicate results. Sort first, then on each recursion level, skip an element if it's identical to the previous one AND we skipped the previous one at this level (i > start). This avoids the same subset appearing twice.",
    insight: "Sort first. Skip nums[i] if nums[i]==nums[i-1] AND we didn't use nums[i-1] in this call (i > start).",
    code: `Arrays.sort(nums);
List<List<Integer>> res = new ArrayList<>();
bt(nums, 0, new ArrayList<>(), res);
return res;

void bt(int[] nums, int start, List<Integer> path, List<List<Integer>> res) {
  res.add(new ArrayList<>(path));
  for (int i = start; i < nums.length; i++) {
    if (i > start && nums[i] == nums[i-1]) continue; // skip dup at same level
    path.add(nums[i]);
    bt(nums, i + 1, path, res);
    path.remove(path.size() - 1);
  }
}`,
    time: "O(2^n)", space: "O(n)"
  },
  46: {
    pattern: "Backtracking (Permutations)",
    approach: "You need all orderings of elements — each position can be any unused element. Use a boolean[] to track which elements are already used in the current path. Once path reaches full length, you've found a permutation.",
    insight: "Use boolean[] used to avoid reusing elements. Add to result when path length == nums length.",
    code: `List<List<Integer>> res = new ArrayList<>();
bt(nums, new boolean[nums.length], new ArrayList<>(), res);
return res;

void bt(int[] nums, boolean[] used, List<Integer> path, List<List<Integer>> res) {
  if (path.size() == nums.length) { res.add(new ArrayList<>(path)); return; }
  for (int i = 0; i < nums.length; i++) {
    if (!used[i]) {
      used[i] = true;
      path.add(nums[i]);
      bt(nums, used, path, res);
      path.remove(path.size() - 1);
      used[i] = false;
    }
  }
}`,
    time: "O(n!)", space: "O(n)"
  },
  39: {
    pattern: "Backtracking (Combination Sum)",
    approach: "You need combos that sum to target, and elements can be reused. Brute force tries every subset; backtracking prunes by stopping when the remaining sum goes negative. Key: pass the same index i (not i+1) so each element can be picked multiple times.",
    insight: "Pass same index i (not i+1) to allow reuse. Prune when remaining < 0.",
    code: `List<List<Integer>> res = new ArrayList<>();
bt(candidates, target, 0, new ArrayList<>(), res);
return res;

void bt(int[] c, int remain, int start, List<Integer> path, List<List<Integer>> res) {
  if (remain == 0) { res.add(new ArrayList<>(path)); return; }
  for (int i = start; i < c.length && c[i] <= remain; i++) {
    path.add(c[i]);
    bt(c, remain - c[i], i, path, res); // i, not i+1 → allow reuse
    path.remove(path.size() - 1);
  }
}`,
    time: "O(N^(T/M))", space: "O(T/M)"
  },
  79: {
    pattern: "Backtracking (DFS on Grid)",
    approach: "Search in a 2D grid — from each cell, try moving in 4 directions if the next char matches. Mark cells as visited (by replacing with '#') to avoid revisiting, then unmark on backtrack. It's a path-finding problem with state restoration.",
    insight: "Mark cell visited before recursing, unmark after. Return true if full word matched.",
    code: `for (int i = 0; i < board.length; i++)
  for (int j = 0; j < board[0].length; j++)
    if (dfs(board, word, 0, i, j)) return true;
return false;

boolean dfs(char[][] b, String word, int idx, int r, int c) {
  if (idx == word.length()) return true;
  if (r<0||r>=b.length||c<0||c>=b[0].length||b[r][c]!=word.charAt(idx)) return false;
  char tmp = b[r][c]; b[r][c] = '#'; // mark visited
  boolean found = dfs(b,word,idx+1,r+1,c)||dfs(b,word,idx+1,r-1,c)
               ||dfs(b,word,idx+1,r,c+1)||dfs(b,word,idx+1,r,c-1);
  b[r][c] = tmp; // restore
  return found;
}`,
    time: "O(m*n*4^L)", space: "O(L)"
  },
  131: {
    pattern: "Backtracking (Palindrome Check)",
    approach: "Partition the string into palindromes. From each position, try cutting at every possible point — if that substring is a palindrome, recurse on the remainder. The decision tree explores all partition points, with backtracking ensuring we try all valid paths.",
    insight: "At each start index, try every end position. If substring is palindrome, recurse on the rest.",
    code: `List<List<String>> res = new ArrayList<>();
bt(s, 0, new ArrayList<>(), res);
return res;

void bt(String s, int start, List<String> path, List<List<String>> res) {
  if (start == s.length()) { res.add(new ArrayList<>(path)); return; }
  for (int end = start + 1; end <= s.length(); end++) {
    if (isPalin(s, start, end - 1)) {
      path.add(s.substring(start, end));
      bt(s, end, path, res);
      path.remove(path.size() - 1);
    }
  }
}
boolean isPalin(String s, int l, int r) {
  while (l < r) if (s.charAt(l++) != s.charAt(r--)) return false;
  return true;
}`,
    time: "O(2^n)", space: "O(n)"
  },
  51: {
    pattern: "Backtracking (N-Queens)",
    approach: "Place one queen per row. For each row, try each column — but skip columns and diagonals where queens already exist. The signal: placement constraints (no two queens on same row/col/diagonal) require pruning. Track used sets for instant lookup.",
    insight: "Track used columns, diagonals (row-col), anti-diagonals (row+col). One queen per row.",
    code: `List<List<String>> res = new ArrayList<>();
bt(0, n, new HashSet<>(), new HashSet<>(), new HashSet<>(), new ArrayList<>(), res);
return res;

void bt(int row, int n, Set<Integer> cols, Set<Integer> diag, Set<Integer> anti,
        List<String> board, List<List<String>> res) {
  if (row == n) { res.add(new ArrayList<>(board)); return; }
  for (int col = 0; col < n; col++) {
    if (cols.contains(col)||diag.contains(row-col)||anti.contains(row+col)) continue;
    char[] line = new char[n]; Arrays.fill(line, '.'); line[col] = 'Q';
    cols.add(col); diag.add(row-col); anti.add(row+col);
    board.add(new String(line));
    bt(row+1, n, cols, diag, anti, board, res);
    board.remove(board.size()-1);
    cols.remove(col); diag.remove(row-col); anti.remove(row+col);
  }
}`,
    time: "O(n!)", space: "O(n)"
  },
  17: {
    pattern: "Backtracking (Digit Mapping)",
    approach: "Each digit maps to multiple letters (like a phone keypad). At each step, you choose one letter from that digit's options — this creates a tree of all possible letter combos. Recurse through each digit, branching on all choices at that level.",
    insight: "Map each digit to its letters. At each step, branch on all letters for current digit.",
    code: `String[] map = {"","","abc","def","ghi","jkl","mno","pqrs","tuv","wxyz"};
List<String> res = new ArrayList<>();
if (!digits.isEmpty()) bt(digits, 0, new StringBuilder(), res, map);
return res;

void bt(String digits, int idx, StringBuilder sb, List<String> res, String[] map) {
  if (idx == digits.length()) { res.add(sb.toString()); return; }
  for (char c : map[digits.charAt(idx) - '0'].toCharArray()) {
    sb.append(c);
    bt(digits, idx + 1, sb, res, map);
    sb.deleteCharAt(sb.length() - 1);
  }
}`,
    time: "O(4^n)", space: "O(n)"
  },

  // ── WEEK 8 ─────────────────────────────────────
  70: {
    pattern: "DP (Fibonacci)",
    approach: "At step n, you could have come from step n-1 (take 1 step) or step n-2 (take 2 steps). So ways[n] = ways[n-1] + ways[n-2]. This recurrence is the signal for DP. You only need the previous two values, so optimize to O(1) space.",
    insight: "You can arrive from 1 step or 2 steps below. dp[i] = dp[i-1] + dp[i-2].",
    code: `if (n <= 2) return n;
int a = 1, b = 2;
for (int i = 3; i <= n; i++) { int c = a + b; a = b; b = c; }
return b;`,
    time: "O(n)", space: "O(1)"
  },
  198: {
    pattern: "DP (House Robber)",
    approach: "You can't rob adjacent houses — this 'skip or rob' decision at each step screams DP. At each house, choose: rob it (can't rob the previous one, so add it to the best from 2 back) or skip it (keep the best from the previous house). Recurrence: dp[i] = max(dp[i-1], nums[i] + dp[i-2]).",
    insight: "At each house: rob it (+ 2-back) or skip (1-back). dp[i] = max(dp[i-1], nums[i] + dp[i-2]).",
    code: `int prev2 = 0, prev1 = 0;
for (int n : nums) {
  int cur = Math.max(prev1, n + prev2);
  prev2 = prev1;
  prev1 = cur;
}
return prev1;`,
    time: "O(n)", space: "O(1)"
  },
  213: {
    pattern: "DP (House Robber Circular)",
    approach: "Houses form a circle: robbing the first excludes the last, and vice versa. So you can't solve it directly. Break it into two linear subproblems: one skipping the last house, one skipping the first. Solve each with standard House Robber DP and return the max.",
    insight: "Can't rob first and last together. Split into two ranges: [0..n-2] and [1..n-1], return max.",
    code: `if (nums.length == 1) return nums[0];
return Math.max(rob(nums, 0, nums.length - 2), rob(nums, 1, nums.length - 1));

int rob(int[] nums, int l, int r) {
  int p2 = 0, p1 = 0;
  for (int i = l; i <= r; i++) { int c = Math.max(p1, nums[i]+p2); p2=p1; p1=c; }
  return p1;
}`,
    time: "O(n)", space: "O(1)"
  },
  416: {
    pattern: "DP (0/1 Knapsack — Subset Sum)",
    approach: "Partition into two equal sets — classic knapsack translation. Can any subset sum to total/2? Use DP: dp[j] = true if j-sum is achievable. Iterate backwards through each number to avoid using it twice (0/1 constraint). The recurrence: dp[j] |= dp[j - num].",
    insight: "Check if subset sums to total/2. 1D DP: iterate backwards to avoid reusing same element.",
    code: `int sum = 0;
for (int n : nums) sum += n;
if (sum % 2 != 0) return false;
int target = sum / 2;
boolean[] dp = new boolean[target + 1];
dp[0] = true;
for (int n : nums)
  for (int j = target; j >= n; j--)
    dp[j] |= dp[j - n];
return dp[target];`,
    time: "O(n * sum)", space: "O(sum)"
  },
  494: {
    pattern: "DP (Target Sum → Subset Sum Count)",
    approach: "Assign + or - to each number to reach the target. Brute force tries all 2^n sign combos. Instead, realize: P - N = target and P + N = sum, so P = (sum + target) / 2. Now it's: count subsets that sum to P. Use unbounded DP: dp[j] += dp[j - num] for each number, iterating forward.",
    insight: "Assign + and - to reach target. Let P = sum of positives, N = sum of negatives. P - N = target, P + N = sum → P = (sum+target)/2. Count subsets with sum P.",
    code: `int sum = 0;
for (int n : nums) sum += n;
if ((sum + target) % 2 != 0 || Math.abs(target) > sum) return 0;
int t = (sum + target) / 2;
int[] dp = new int[t + 1];
dp[0] = 1;
for (int n : nums)
  for (int j = t; j >= n; j--)
    dp[j] += dp[j - n];
return dp[t];`,
    time: "O(n * sum)", space: "O(sum)"
  },
  322: {
    pattern: "DP (Unbounded Knapsack — Min Coins)",
    approach: "Find the minimum coins to make each amount — unbounded knapsack (coins can be reused). For each amount j, try deducting every coin: if you used coin c, you need dp[j - c] coins to make the remainder, so dp[j] = min(dp[j], dp[j - c] + 1). Iterate forward (not backwards) to allow reuse.",
    insight: "dp[i] = min coins to make amount i. For each coin, dp[i] = min(dp[i], dp[i-coin]+1). Iterate forward (unbounded).",
    code: `int[] dp = new int[amount + 1];
Arrays.fill(dp, amount + 1); // infinity
dp[0] = 0;
for (int coin : coins)
  for (int i = coin; i <= amount; i++)
    dp[i] = Math.min(dp[i], dp[i - coin] + 1);
return dp[amount] > amount ? -1 : dp[amount];`,
    time: "O(amount * n)", space: "O(amount)"
  },
  518: {
    pattern: "DP (Unbounded Knapsack — Count Ways)",
    approach: "Count the ways to make each amount using coins (unbounded). Naively, looping amount then coins counts permutations multiple times. Instead, loop coins in the outer loop — for each coin, update all amounts. This ensures each combo is counted once. Recurrence: dp[j] += dp[j - coin].",
    insight: "dp[i] = ways to make amount i. Outer loop = coins (not amount!) to avoid counting permutations.",
    code: `int[] dp = new int[amount + 1];
dp[0] = 1;
for (int coin : coins)
  for (int i = coin; i <= amount; i++)
    dp[i] += dp[i - coin];
return dp[amount];`,
    time: "O(amount * n)", space: "O(amount)"
  },
  1143: {
    pattern: "DP (LCS — 2D)",
    approach: "Find the longest common subsequence between two strings — a classic interval DP problem. For each pair of characters at (i, j): if they match, extend the LCS from (i-1, j-1) by 1. If they don't, take the better of (skip one from first string) or (skip one from second string). Recurrence: dp[i][j] = dp[i-1][j-1] + 1 or max(dp[i-1][j], dp[i][j-1]).",
    insight: "dp[i][j] = LCS of first i chars and first j chars. Match → dp[i-1][j-1]+1. No match → max(up, left).",
    code: `int m = text1.length(), n = text2.length();
int[][] dp = new int[m+1][n+1];
for (int i = 1; i <= m; i++)
  for (int j = 1; j <= n; j++)
    dp[i][j] = (text1.charAt(i-1) == text2.charAt(j-1))
               ? dp[i-1][j-1] + 1
               : Math.max(dp[i-1][j], dp[i][j-1]);
return dp[m][n];`,
    time: "O(m*n)", space: "O(m*n)"
  },
  300: {
    pattern: "DP (LIS)",
    approach: "Find the longest increasing subsequence. For each position i, scan all earlier positions j: if nums[j] < nums[i], you can extend the LIS ending at j by appending nums[i]. So dp[i] = max over all valid j of (dp[j] + 1). The recurrence reveals this is a local optimization problem solvable with DP.",
    insight: "dp[i] = length of longest increasing subsequence ending at i. For each j < i where nums[j] < nums[i], dp[i] = max(dp[i], dp[j]+1).",
    code: `int[] dp = new int[nums.length];
Arrays.fill(dp, 1);
int max = 1;
for (int i = 1; i < nums.length; i++) {
  for (int j = 0; j < i; j++)
    if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
  max = Math.max(max, dp[i]);
}
return max;`,
    time: "O(n²)", space: "O(n)"
  },
  139: {
    pattern: "DP (Word Break)",
    approach: "Can the string be segmented using words from a dictionary? Use DP: dp[i] = true if s[0..i-1] is segmentable. For each position i, check all split points j where dp[j] is true — if s[j..i-1] is a word, then dp[i] = true. The recurrence: dp[i] = OR over valid j of (dp[j] AND s[j..i-1] in dict).",
    insight: "dp[i] = true if s[0..i-1] can be segmented. For each i, scan all j where dp[j]=true and s[j..i-1] is in dict.",
    code: `Set<String> dict = new HashSet<>(wordDict);
boolean[] dp = new boolean[s.length() + 1];
dp[0] = true;
for (int i = 1; i <= s.length(); i++)
  for (int j = 0; j < i; j++)
    if (dp[j] && dict.contains(s.substring(j, i))) { dp[i] = true; break; }
return dp[s.length()];`,
    time: "O(n² * m)", space: "O(n)"
  },
  91: {
    pattern: "DP (Decode Ways)",
    approach: "Each digit (1-9) decodes to a letter; two-digit codes (10-26) also decode. At each position, you can decode one or two digits — these are your choices. So dp[i] = dp[i-1] (decode 1 digit) + dp[i-2] (decode 2 digits, if valid). This branching at each step is the DP signal.",
    insight: "dp[i] = decode ways for s[0..i-1]. One-digit decode: add dp[i-1] if valid. Two-digit decode: add dp[i-2] if 10-26.",
    code: `if (s.charAt(0) == '0') return 0;
int n = s.length();
int[] dp = new int[n + 1];
dp[0] = 1; dp[1] = 1;
for (int i = 2; i <= n; i++) {
  int one = s.charAt(i-1) - '0';
  int two = Integer.parseInt(s.substring(i-2, i));
  if (one >= 1) dp[i] += dp[i-1];
  if (two >= 10 && two <= 26) dp[i] += dp[i-2];
}
return dp[n];`,
    time: "O(n)", space: "O(n)"
  },

  // ── WEEK 9 ─────────────────────────────────────
  62: {
    pattern: "DP (2D Grid)",
    approach: "Count paths to the bottom-right corner. You can only move right or down — so each cell is reachable only from the cell above or the cell to the left. Recurrence: ways[i][j] = ways[i-1][j] + ways[i][j-1]. This grid-based recurrence is a standard 2D DP pattern.",
    insight: "Each cell reachable only from top or left. dp[i][j] = dp[i-1][j] + dp[i][j-1].",
    code: `int[][] dp = new int[m][n];
for (int i = 0; i < m; i++) dp[i][0] = 1;
for (int j = 0; j < n; j++) dp[0][j] = 1;
for (int i = 1; i < m; i++)
  for (int j = 1; j < n; j++)
    dp[i][j] = dp[i-1][j] + dp[i][j-1];
return dp[m-1][n-1];`,
    time: "O(m*n)", space: "O(m*n)"
  },
  64: {
    pattern: "DP (2D Grid — Min Cost)",
    approach: "Find the minimum-cost path from top-left to bottom-right, moving only right/down. At each cell, you take the grid value plus the best path from either the cell above or the cell to the left. Recurrence: dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1]). This is a cost optimization with constrained movement.",
    insight: "dp[i][j] = min cost to reach (i,j) = grid[i][j] + min(from top, from left).",
    code: `int m = grid.length, n = grid[0].length;
int[][] dp = new int[m][n];
dp[0][0] = grid[0][0];
for (int i = 1; i < m; i++) dp[i][0] = dp[i-1][0] + grid[i][0];
for (int j = 1; j < n; j++) dp[0][j] = dp[0][j-1] + grid[0][j];
for (int i = 1; i < m; i++)
  for (int j = 1; j < n; j++)
    dp[i][j] = grid[i][j] + Math.min(dp[i-1][j], dp[i][j-1]);
return dp[m-1][n-1];`,
    time: "O(m*n)", space: "O(m*n)"
  },
  72: {
    pattern: "DP (Edit Distance)",
    approach: "Convert one string to another with insert/delete/replace — a classic edit-distance problem. At each position (i, j): if characters match, use the result from (i-1, j-1). Otherwise, try all three operations (replace, insert, delete) on the previous states and pick the minimum. Recurrence: dp[i][j] = min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]) + 1.",
    insight: "dp[i][j] = min edits to convert s1[0..i-1] to s2[0..j-1]. Match → dp[i-1][j-1]. Else min(replace, insert, delete) + 1.",
    code: `int m = word1.length(), n = word2.length();
int[][] dp = new int[m+1][n+1];
for (int i = 0; i <= m; i++) dp[i][0] = i;
for (int j = 0; j <= n; j++) dp[0][j] = j;
for (int i = 1; i <= m; i++)
  for (int j = 1; j <= n; j++)
    dp[i][j] = (word1.charAt(i-1) == word2.charAt(j-1))
               ? dp[i-1][j-1]
               : 1 + Math.min(dp[i-1][j-1], Math.min(dp[i-1][j], dp[i][j-1]));
return dp[m][n];`,
    time: "O(m*n)", space: "O(m*n)"
  },
  5: {
    pattern: "Expand Around Center",
    approach: "A palindrome expands symmetrically from a center. Brute force checks all substrings; instead, iterate each possible center (every char for odd-length, every pair for even-length) and expand outward while characters match. Track the longest found. This leverages the palindrome structure to avoid redundant checks.",
    insight: "For each center (single char or between two chars), expand while chars match. Track longest.",
    code: `int start = 0, maxLen = 1;
for (int i = 0; i < s.length(); i++) {
  int odd  = expand(s, i, i);
  int even = expand(s, i, i+1);
  int len  = Math.max(odd, even);
  if (len > maxLen) { maxLen = len; start = i - (len-1)/2; }
}
return s.substring(start, start + maxLen);

int expand(String s, int l, int r) {
  while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) { l--; r++; }
  return r - l - 1;
}`,
    time: "O(n²)", space: "O(1)"
  },
  56: {
    pattern: "Greedy (Sort + Merge)",
    approach: "Merging overlapping intervals — sort by start position first. Then greedily: keep the current interval, and if the next one overlaps (start <= current.end), extend the end. Otherwise, the current interval is complete, so save it and move to the next.",
    insight: "Sort by start. Extend current interval if next one overlaps. Otherwise push and move on.",
    code: `Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
List<int[]> res = new ArrayList<>();
int[] cur = intervals[0];
for (int i = 1; i < intervals.length; i++) {
  if (intervals[i][0] <= cur[1]) cur[1] = Math.max(cur[1], intervals[i][1]);
  else { res.add(cur); cur = intervals[i]; }
}
res.add(cur);
return res.toArray(new int[0][]);`,
    time: "O(n log n)", space: "O(n)"
  },
  57: {
    pattern: "Greedy (Three-Phase Insert)",
    approach: "Insert a new interval into a sorted list while keeping it merged. Split into three phases: (1) add intervals completely before the new one, (2) merge overlapping intervals, expanding the new interval's bounds, (3) add remaining intervals after. This avoids re-sorting.",
    insight: "Three phases: add all non-overlapping before new interval, merge all overlapping, add rest.",
    code: `List<int[]> res = new ArrayList<>();
int i = 0, n = intervals.length;
while (i < n && intervals[i][1] < newInterval[0]) res.add(intervals[i++]);
while (i < n && intervals[i][0] <= newInterval[1]) {
  newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
  newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
  i++;
}
res.add(newInterval);
while (i < n) res.add(intervals[i++]);
return res.toArray(new int[0][]);`,
    time: "O(n)", space: "O(n)"
  },
  435: {
    pattern: "Greedy (Activity Selection)",
    approach: "Remove the minimum number of conflicting intervals — classic activity selection. Sort by end time (finish earliest first). Greedily select intervals that don't conflict with the last selected one. This maximizes non-overlapping intervals, so removed = total - kept.",
    insight: "Sort by end time. Greedily keep intervals that don't conflict. Count removed = total - kept.",
    code: `Arrays.sort(intervals, (a, b) -> a[1] - b[1]);
int kept = 0, lastEnd = Integer.MIN_VALUE;
for (int[] iv : intervals) {
  if (iv[0] >= lastEnd) { kept++; lastEnd = iv[1]; }
}
return intervals.length - kept;`,
    time: "O(n log n)", space: "O(1)"
  },
  55: {
    pattern: "Greedy",
    approach: "Can you reach the last index by jumping? Greedily track the farthest index you can reach so far. Iterate through each position: if you've already gone past it (i > maxReach), you're stuck. Otherwise, update maxReach with the farthest you can jump from here.",
    insight: "Track the farthest index reachable. If current index exceeds it, we're stuck.",
    code: `int maxReach = 0;
for (int i = 0; i < nums.length; i++) {
  if (i > maxReach) return false;
  maxReach = Math.max(maxReach, i + nums[i]);
}
return true;`,
    time: "O(n)", space: "O(1)"
  },
  45: {
    pattern: "Greedy (BFS Levels)",
    approach: "Minimum jumps to reach the end — think of it as BFS levels. Each jump extends your reachable range. Greedily: track curEnd (farthest reachable within current jump count) and farthest (farthest we can reach with one more jump). When i reaches curEnd, increment jumps and update curEnd to farthest.",
    insight: "Treat each 'jump' as a BFS level. Track current level's reach and next level's reach.",
    code: `int jumps = 0, curEnd = 0, farthest = 0;
for (int i = 0; i < nums.length - 1; i++) {
  farthest = Math.max(farthest, i + nums[i]);
  if (i == curEnd) { jumps++; curEnd = farthest; }
}
return jumps;`,
    time: "O(n)", space: "O(1)"
  },

  // ── WEEK 10 ─────────────────────────────────────
  136: {
    pattern: "Bit Manipulation (XOR)",
    approach: "Find the single number appearing once when all others appear twice. XOR has two key properties: a ^ a = 0 (same numbers cancel) and a ^ 0 = a (identity). XOR all elements — pairs cancel out, leaving only the single number.",
    insight: "a ^ a = 0, a ^ 0 = a. XOR all elements — duplicates cancel, single remains.",
    code: `int res = 0;
for (int n : nums) res ^= n;
return res;`,
    time: "O(n)", space: "O(1)"
  },
  338: {
    pattern: "DP + Bit Trick",
    approach: "Count the number of 1-bits in each number from 0 to n. Brute force checks each bit; instead, use a DP insight: removing the last bit (i >> 1) gives a smaller number whose bit count you've already computed. Recurrence: ans[i] = ans[i >> 1] + (i & 1), where (i & 1) is the last bit.",
    insight: "ans[i] = ans[i >> 1] + (i & 1). Right-shift removes last bit; the bit count differs by at most 1.",
    code: `int[] ans = new int[num + 1];
for (int i = 1; i <= num; i++) ans[i] = ans[i >> 1] + (i & 1);
return ans;`,
    time: "O(n)", space: "O(n)"
  },
  268: {
    pattern: "Math / XOR",
    approach: "Find the missing number in [1..n] — brute force uses a set or array. Instead, XOR all given numbers with all [1..n]: pairs cancel (a ^ a = 0), leaving only the missing number. Recurrence: xor ^= all nums, then xor ^= all [1..n].",
    insight: "XOR all nums with all [1..n]. The missing number cancels out every other pair.",
    code: `int xor = 0;
for (int i = 0; i <= nums.length; i++) xor ^= i;
for (int n : nums) xor ^= n;
return xor;`,
    time: "O(n)", space: "O(1)"
  },
  312: {
    pattern: "DP (Interval — Burst Balloons)",
    approach: "Bursting balloons affects neighbors, making order matter — a hard DP problem. Instead of thinking forward (which balloon to burst first), think backward: pick the LAST balloon to burst in a range (l, r). When it's last, its neighbors are fixed at positions l and r (since they're never burst between). This re-frames the problem as interval DP with a clean recurrence.",
    insight: "Pick the LAST balloon to burst in range (l, r). It uses its left and right neighbors (l, r). Build dp bottom-up by interval length.",
    code: `int n = balloons.length;
int[] nums = new int[n+2];
nums[0] = nums[n+1] = 1;
System.arraycopy(balloons, 0, nums, 1, n);
int[][] dp = new int[n+2][n+2];
for (int len = 2; len <= n+1; len++) {
  for (int l = 0; l+len <= n+1; l++) {
    int r = l + len;
    for (int k = l+1; k < r; k++)
      dp[l][r] = Math.max(dp[l][r], dp[l][k]+nums[l]*nums[k]*nums[r]+dp[k][r]);
  }
}
return dp[0][n+1];`,
    time: "O(n³)", space: "O(n²)"
  },
  32: {
    pattern: "Stack (Longest Valid Parens)",
    approach: "Find the longest valid parentheses substring — a string matching problem. Use a stack to track indices. Push '(' indices; on ')', pop the matching '(' (or record the unmatched ')'). The stack always stores the base of the current sequence, so the length = current_index - base_index.",
    insight: "Stack stores base indices. Push '(' index; on ')', pop and compute length to new top. Push unmatched ')' as new base.",
    code: `Deque<Integer> st = new ArrayDeque<>();
st.push(-1);
int max = 0;
for (int i = 0; i < s.length(); i++) {
  if (s.charAt(i) == '(') st.push(i);
  else {
    st.pop();
    if (st.isEmpty()) st.push(i); // new base
    else max = Math.max(max, i - st.peek());
  }
}
return max;`,
    time: "O(n)", space: "O(n)"
  },
  1192: {
    pattern: "Tarjan Bridge Detection",
    approach: "Find all bridge edges (cutting one disconnects the graph). Use DFS with Tarjan's algorithm: track discovery time (disc) and the lowest discovery time reachable (low) from each node. An edge (u,v) is a bridge if low[v] > disc[u] — meaning v can't reach any ancestor of u without that edge.",
    insight: "Bridge edge (u,v) exists when low[v] > disc[u] — meaning v cannot reach back to u's subtree without using edge (u,v).",
    code: `// Build adjacency list from connections, then DFS
int[] disc = new int[n], low = new int[n];
boolean[] visited = new boolean[n];
List<List<Integer>> res = new ArrayList<>();
// DFS tracking discovery time and low-link values
dfs(0, -1, disc, low, visited, adj, res, new int[]{0});
return res;

void dfs(int u, int par, int[] disc, int[] low, boolean[] vis,
         List<List<Integer>> adj, List<List<Integer>> res, int[] timer) {
  vis[u] = true; disc[u] = low[u] = timer[0]++;
  for (int v : adj.get(u)) {
    if (!vis[v]) {
      dfs(v, u, disc, low, vis, adj, res, timer);
      low[u] = Math.min(low[u], low[v]);
      if (low[v] > disc[u]) res.add(Arrays.asList(u, v)); // bridge
    } else if (v != par) low[u] = Math.min(low[u], disc[v]);
  }
}`,
    time: "O(V + E)", space: "O(V)"
  },
  787: {
    pattern: "DP (Bellman-Ford K Stops)",
    approach: "Shortest path with at most k stops — a constrained shortest path. Standard Dijkstra ignores the stop limit. Instead, use Bellman-Ford iterated k+1 times: each iteration relaxes edges, representing one more flight option. After i iterations, dist[v] = min cost to reach v using ≤ i flights.",
    insight: "Run Bellman-Ford exactly k+1 times. dp[i][v] = min cost to reach v using exactly i flights.",
    code: `int[] dist = new int[n];
Arrays.fill(dist, Integer.MAX_VALUE / 2);
dist[src] = 0;
for (int i = 0; i < k + 1; i++) {
  int[] tmp = Arrays.copyOf(dist, n);
  for (int[] f : flights) {
    int u = f[0], v = f[1], p = f[2];
    if (dist[u] != Integer.MAX_VALUE / 2 && dist[u] + p < tmp[v])
      tmp[v] = dist[u] + p;
  }
  dist = tmp;
}
return dist[dst] == Integer.MAX_VALUE / 2 ? -1 : dist[dst];`,
    time: "O(k * E)", space: "O(n)"
  },
  42: {
    pattern: "Two Pointers",
    approach: "Trap rainwater — the brute force precomputes leftMax and rightMax. Instead, use two pointers: water at i = min(leftMax[i], rightMax[i]) - height[i]. Move the pointer with smaller maxHeight (since the limiting factor is the smaller side). This avoids precomputation.",
    insight: "Water at index i = min(leftMax, rightMax) - height[i]. Use two pointers: expand from the smaller side.",
    code: `int l = 0, r = height.length-1, lmax = 0, rmax = 0, water = 0;
while (l < r) {
  if (height[l] < height[r]) {
    lmax = Math.max(lmax, height[l]);
    water += lmax - height[l++];
  } else {
    rmax = Math.max(rmax, height[r]);
    water += rmax - height[r--];
  }
}
return water;`,
    time: "O(n)", space: "O(1)"
  },
  239: {
    pattern: "Monotonic Deque",
    approach: "Sliding window maximum — brute force scans the window each time. A monotonic deque maintains indices in decreasing order of their values: the front is always the max. When a new element arrives, remove smaller elements from the back (they're now irrelevant), and remove expired elements from the front. The front index's value is the current window max.",
    insight: "Deque stores indices in decreasing order of value. Front = current max. Remove from front if out of window, from back if smaller than new element.",
    code: `int n = nums.length;
int[] res = new int[n - k + 1];
Deque<Integer> dq = new ArrayDeque<>();
for (int i = 0; i < n; i++) {
  if (!dq.isEmpty() && dq.peekFirst() < i - k + 1) dq.pollFirst();
  while (!dq.isEmpty() && nums[dq.peekLast()] < nums[i]) dq.pollLast();
  dq.offerLast(i);
  if (i >= k - 1) res[i - k + 1] = nums[dq.peekFirst()];
}
return res;`,
    time: "O(n)", space: "O(k)"
  },
  146: {
    pattern: "HashMap + Doubly Linked List",
    approach: "LRU cache with O(1) get and put — needs fast lookup and eviction. HashMap stores key -> value; a doubly-linked list orders by recency. On access, move the node to the tail (most recent). On put to a full cache, evict the head (least recent). LinkedHashMap with access-order simplifies this.",
    insight: "HashMap for O(1) lookup; doubly-linked list for O(1) eviction. Move accessed node to tail (most recent). Evict from head (least recent).",
    code: `Map<Integer,int[]> map = new LinkedHashMap<>();
// Using LinkedHashMap with access order for brevity:
map = new LinkedHashMap<>(capacity, 0.75f, true) {
  protected boolean removeEldestEntry(Map.Entry e) {
    return size() > capacity;
  }
};
int get(int key) { return map.containsKey(key) ? map.get(key) : -1; }
void put(int key, int value) { map.put(key, value); }`,
    time: "O(1) per op", space: "O(capacity)"
  },
  211: {
    pattern: "Trie + DFS (Wildcard Search)",
    approach: "Search a dictionary with '.' as a wildcard. Build a Trie from all words. On search, '.' means 'try any letter at this position' — use DFS to branch through all children. Regular letters narrow to one child. Once you reach a marked end node, the pattern matched.",
    insight: "Build Trie. For search, '.' triggers DFS through all children at that node level.",
    code: `class TrieNode { TrieNode[] ch = new TrieNode[26]; boolean end; }
TrieNode root = new TrieNode();

void addWord(String word) {
  TrieNode cur = root;
  for (char c : word.toCharArray()) {
    if (cur.ch[c-'a'] == null) cur.ch[c-'a'] = new TrieNode();
    cur = cur.ch[c-'a'];
  }
  cur.end = true;
}
boolean search(String word) { return dfs(root, word, 0); }

boolean dfs(TrieNode node, String word, int i) {
  if (i == word.length()) return node.end;
  char c = word.charAt(i);
  if (c == '.') {
    for (TrieNode child : node.ch) if (child != null && dfs(child, word, i+1)) return true;
    return false;
  }
  return node.ch[c-'a'] != null && dfs(node.ch[c-'a'], word, i+1);
}`,
    time: "O(m) insert, O(26^m) worst search", space: "O(26 * N)"
  },

  // ── WEEK 11-12 ─────────────────────────────────
  76: {
    pattern: "Sliding Window (Variable)",
    approach: "Find the minimum substring containing all characters of t — a constrained search. Use a sliding window: expand right until all required characters are present, then shrink from the left while maintaining coverage. The shrinking finds the minimum length.",
    insight: "Expand right until all chars of t are covered. Then shrink left until coverage breaks. Track min window.",
    code: `Map<Character,Integer> need = new HashMap<>(), have = new HashMap<>();
for (char c : t.toCharArray()) need.put(c, need.getOrDefault(c,0)+1);
int formed=0, required=need.size(), l=0, minLen=Integer.MAX_VALUE, minL=0;
for (int r = 0; r < s.length(); r++) {
  char c = s.charAt(r);
  have.put(c, have.getOrDefault(c,0)+1);
  if (need.containsKey(c) && have.get(c).equals(need.get(c))) formed++;
  while (formed == required) {
    if (r-l+1 < minLen) { minLen=r-l+1; minL=l; }
    char lc = s.charAt(l);
    have.put(lc, have.get(lc)-1);
    if (need.containsKey(lc) && have.get(lc) < need.get(lc)) formed--;
    l++;
  }
}
return minLen==Integer.MAX_VALUE ? "" : s.substring(minL, minL+minLen);`,
    time: "O(|s| + |t|)", space: "O(|t|)"
  },
  297: {
    pattern: "DFS Tree Serialization",
    approach: "Convert a binary tree to/from a string. Use pre-order DFS: process each node, serialize its value, then recurse left and right. Null nodes become 'N'. Deserialize by reversing: consume tokens from a queue, build nodes, and recurse in the same pre-order.",
    insight: "Pre-order DFS: serialize each node as 'value,' and null nodes as 'N,'. Deserialize by consuming a queue of tokens.",
    code: `// Serialize
void ser(TreeNode n, StringBuilder sb) {
  if (n == null) { sb.append("N,"); return; }
  sb.append(n.val).append(',');
  ser(n.left, sb); ser(n.right, sb);
}
String serialize(TreeNode root) { StringBuilder sb = new StringBuilder(); ser(root, sb); return sb.toString(); }

// Deserialize
TreeNode des(Queue<String> q) {
  String s = q.poll();
  if (s.equals("N")) return null;
  TreeNode n = new TreeNode(Integer.parseInt(s));
  n.left = des(q); n.right = des(q);
  return n;
}
TreeNode deserialize(String data) {
  return des(new LinkedList<>(Arrays.asList(data.split(","))));
}`,
    time: "O(n) both", space: "O(n)"
  },
  212: {
    pattern: "Trie + DFS (Grid Search)",
    approach: "Find all words from a list that appear in a 2D grid. Build a Trie from all words. DFS from each cell: at each position, check if the current character matches the Trie (prune if not). When you reach a marked end node, add that word to results. Mark nodes as found to avoid duplicates.",
    insight: "Build Trie from all words. DFS from each cell, prune when Trie prefix doesn't match. Mark node.word when found.",
    code: `class TrieNode { TrieNode[] ch = new TrieNode[26]; String word; }
// Insert all words into Trie...
List<String> res = new ArrayList<>();
for (int i=0;i<board.length;i++)
  for (int j=0;j<board[0].length;j++) dfs(board,i,j,root,res);
return res;

void dfs(char[][] b, int i, int j, TrieNode node, List<String> res) {
  if (i<0||i>=b.length||j<0||j>=b[0].length) return;
  char c = b[i][j];
  if (c=='#'||node.ch[c-'a']==null) return;
  node = node.ch[c-'a'];
  if (node.word != null) { res.add(node.word); node.word=null; } // deduplicate
  b[i][j] = '#';
  dfs(b,i+1,j,node,res); dfs(b,i-1,j,node,res);
  dfs(b,i,j+1,node,res); dfs(b,i,j-1,node,res);
  b[i][j] = c;
}`,
    time: "O(m*n*4^L)", space: "O(Trie)"
  },
  269: {
    pattern: "Topological Sort (Kahn's BFS)",
    approach: "Find the alien dictionary order — a topological sort problem. Compare adjacent words to extract character ordering constraints (edges). Build a graph and use Kahn's BFS to find a valid ordering. If we visit fewer than 26 characters, a cycle exists (invalid).",
    insight: "Compare adjacent words to extract char ordering edges. Kahn's BFS finds topological order. Cycle = invalid.",
    code: `Map<Character, Set<Character>> adj = new HashMap<>();
int[] indegree = new int[26]; boolean[] present = new boolean[26];
for (String w : words) for (char c : w.toCharArray()) { present[c-'a']=true; adj.putIfAbsent(c, new HashSet<>()); }
for (int i = 0; i < words.length-1; i++) {
  String a=words[i], b=words[i+1];
  if (a.length()>b.length()&&a.startsWith(b)) return "";
  for (int j=0;j<Math.min(a.length(),b.length());j++)
    if (a.charAt(j)!=b.charAt(j)) { if (adj.get(a.charAt(j)).add(b.charAt(j))) indegree[b.charAt(j)-'a']++; break; }
}
Queue<Character> q = new LinkedList<>();
for (char c='a';c<='z';c++) if (present[c-'a']&&indegree[c-'a']==0) q.offer(c);
StringBuilder sb = new StringBuilder();
while (!q.isEmpty()) { char c=q.poll(); sb.append(c); for (char nb:adj.get(c)) if (--indegree[nb-'a']==0) q.offer(nb); }
return sb.length()==adj.size() ? sb.toString() : "";`,
    time: "O(C) C=total chars", space: "O(1) 26 chars"
  },
  10: {
    pattern: "DP (Regex Matching)",
    approach: "Match a string against a regex with '.' (any char) and '*' (0+ of preceding char). Use 2D DP: dp[i][j] = does s[0..i-1] match p[0..j-1]? '.' and regular chars require a char match. '*' can match 0 (skip both) or 1+ (skip pattern, repeat match).",
    insight: "dp[i][j] = s[0..i-1] matches p[0..j-1]. '.' matches any char; '*' matches 0+ of preceding char.",
    code: `int m=s.length(), n=p.length();
boolean[][] dp = new boolean[m+1][n+1];
dp[0][0] = true;
for (int j=2;j<=n;j++) if (p.charAt(j-1)=='*') dp[0][j]=dp[0][j-2];
for (int i=1;i<=m;i++) for (int j=1;j<=n;j++) {
  if (p.charAt(j-1)!='*') {
    dp[i][j] = dp[i-1][j-1] && (s.charAt(i-1)==p.charAt(j-1)||p.charAt(j-1)=='.');
  } else {
    dp[i][j] = dp[i][j-2]; // zero occurrences
    if (p.charAt(j-2)==s.charAt(i-1)||p.charAt(j-2)=='.') dp[i][j] |= dp[i-1][j]; // one more
  }
}
return dp[m][n];`,
    time: "O(m*n)", space: "O(m*n)"
  },
  44: {
    pattern: "DP (Wildcard Matching)",
    approach: "Match a string against a wildcard pattern ('?' for any char, '*' for any sequence). Use 2D DP: dp[i][j] = does s[0..i-1] match p[0..j-1]? '?' and regular chars need a char match. '*' matches 0 chars (dp[i][j-1]) or extends by consuming one string char (dp[i-1][j]).",
    insight: "Similar to regex. '*' matches empty string (dp[i][j-1]) or extends match one more char (dp[i-1][j]).",
    code: `int m=s.length(), n=p.length();
boolean[][] dp = new boolean[m+1][n+1];
dp[0][0] = true;
for (int j=1;j<=n;j++) if (p.charAt(j-1)=='*') dp[0][j]=dp[0][j-1];
for (int i=1;i<=m;i++) for (int j=1;j<=n;j++) {
  if (p.charAt(j-1)=='*') dp[i][j] = dp[i-1][j] || dp[i][j-1];
  else dp[i][j] = dp[i-1][j-1] && (s.charAt(i-1)==p.charAt(j-1)||p.charAt(j-1)=='?');
}
return dp[m][n];`,
    time: "O(m*n)", space: "O(m*n)"
  },
  4: {
    pattern: "Binary Search (Median)",
    approach: "Find the median of two sorted arrays without merging — a partition problem. Binary search on the shorter array for a cut position: the median is where the left-max equals the right-min (or the average if even total length). Cuts partition both arrays; expand/shrink until the condition is met.",
    insight: "Binary search on the shorter array to find the partition point where max(left) <= min(right).",
    code: `if (nums1.length > nums2.length) return findMedianSortedArrays(nums2, nums1);
int x=nums1.length, y=nums2.length;
int lo=0, hi=x;
while (lo <= hi) {
  int cut1=(lo+hi)/2, cut2=(x+y+1)/2-cut1;
  int l1=cut1==0?Integer.MIN_VALUE:nums1[cut1-1];
  int r1=cut1==x?Integer.MAX_VALUE:nums1[cut1];
  int l2=cut2==0?Integer.MIN_VALUE:nums2[cut2-1];
  int r2=cut2==y?Integer.MAX_VALUE:nums2[cut2];
  if (l1<=r2&&l2<=r1) {
    return (x+y)%2==0 ? (Math.max(l1,l2)+Math.min(r1,r2))/2.0 : Math.max(l1,l2);
  } else if (l1>r2) hi=cut1-1;
  else lo=cut1+1;
}
return -1;`,
    time: "O(log min(m,n))", space: "O(1)"
  },
  154: {
    pattern: "Binary Search (with Duplicates)",
    approach: "Find the minimum in a rotated array with duplicates — a tricky binary search. If nums[mid] < nums[hi], minimum is in the right half. If nums[mid] > nums[hi], minimum is in the left. If they're equal, you can't tell which side — shrink hi by 1 to eliminate ambiguity.",
    insight: "Same as LC 153 but when nums[mid]==nums[hi], we can't determine which half — just shrink hi by 1.",
    code: `int lo=0, hi=nums.length-1;
while (lo < hi) {
  int mid = lo + (hi-lo)/2;
  if      (nums[mid] > nums[hi]) lo = mid + 1;
  else if (nums[mid] < nums[hi]) hi = mid;
  else                           hi--;  // duplicates — can't tell, shrink
}
return nums[lo];`,
    time: "O(n) worst, O(log n) avg", space: "O(1)"
  },
  394: {
    pattern: "Stack (Decode String)",
    approach: "Decode a string with nested brackets and multipliers (e.g., '2[abc]' = 'abcabc'). Use a stack: when '[' is seen, push the current string and multiplier; on ']', pop and expand. This handles nesting by pausing the current layer and resuming after expansion.",
    insight: "Stack saves (partialString, multiplier) when '[' seen. On ']', pop and repeat current string by multiplier.",
    code: `Deque<String> strs = new ArrayDeque<>();
Deque<Integer> nums = new ArrayDeque<>();
String cur = ""; int num = 0;
for (char c : s.toCharArray()) {
  if (Character.isDigit(c)) num = num*10 + (c-'0');
  else if (c == '[') { strs.push(cur); nums.push(num); cur=""; num=0; }
  else if (c == ']') {
    int k = nums.pop();
    String prev = strs.pop();
    cur = prev + cur.repeat(k);
  } else cur += c;
}
return cur;`,
    time: "O(n)", space: "O(n)"
  },
  305: {
    pattern: "Union Find (Online)",
    approach: "Add islands to a grid one at a time and track the number of components. Each time you add a cell, it's a new component; then union it with any existing land neighbors (up, down, left, right). Each union decrements the count. Union-Find (DSU) gives O(α) union/find operations.",
    insight: "Process add-island queries one by one with DSU. When adding, check 4 neighbors and union if land. Track component count.",
    code: `int[] parent = new int[m*n]; Arrays.fill(parent,-1);
int[] rank = new int[m*n];
int[] count = {0};
int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};
List<Integer> res = new ArrayList<>();
for (int[] pos : positions) {
  int idx = pos[0]*n + pos[1];
  if (parent[idx] != -1) { res.add(count[0]); continue; }
  parent[idx] = idx; count[0]++;
  for (int[] d : dirs) {
    int ni=pos[0]+d[0], nj=pos[1]+d[1];
    int nidx = ni*n+nj;
    if (ni>=0&&ni<m&&nj>=0&&nj<n&&parent[nidx]!=-1) {
      int p1=find(parent,idx), p2=find(parent,nidx);
      if (p1!=p2) { parent[p1]=p2; count[0]--; }
    }
  }
  res.add(count[0]);
}
return res;`,
    time: "O(k * α(m*n))", space: "O(m*n)"
  },
  53: {
    pattern: "Kadane's Algorithm",
    approach: "Find the maximum sum subarray — brute force checks all subarrays. Kadane's insight: at each position, you either start fresh (just nums[i]) or extend the previous max (prevMax + nums[i]). Choose the better option. Recurrence: maxEnd[i] = max(nums[i], maxEnd[i-1] + nums[i]).",
    insight: "Max subarray ending at i = max(nums[i], prevMax + nums[i]). Track global max.",
    code: `int maxEnd = nums[0], maxAll = nums[0];
for (int i = 1; i < nums.length; i++) {
  maxEnd = Math.max(nums[i], maxEnd + nums[i]);
  maxAll = Math.max(maxAll, maxEnd);
}
return maxAll;`,
    time: "O(n)", space: "O(1)"
  },
  15: {
    pattern: "Two Pointers + Sort",
    approach: "Find all unique triplets that sum to zero — a multi-target problem. Sort first, then fix one element and use two pointers for the remaining pair (classic two-sum). The sorting lets you skip duplicates and move pointers toward the target sum efficiently.",
    insight: "Sort, fix one element, use two pointers for the remaining pair. Skip duplicates at each level.",
    code: `Arrays.sort(nums);
List<List<Integer>> res = new ArrayList<>();
for (int i = 0; i < nums.length-2; i++) {
  if (i > 0 && nums[i] == nums[i-1]) continue;
  int l = i+1, r = nums.length-1;
  while (l < r) {
    int sum = nums[i]+nums[l]+nums[r];
    if (sum == 0) {
      res.add(Arrays.asList(nums[i],nums[l],nums[r]));
      while (l<r&&nums[l]==nums[l+1]) l++;
      while (l<r&&nums[r]==nums[r-1]) r--;
      l++; r--;
    } else if (sum < 0) l++;
    else r--;
  }
}
return res;`,
    time: "O(n²)", space: "O(1)"
  },
  362: {
    pattern: "Queue",
    approach: "Track hits in a rolling 300-second window. Store timestamps in a queue. On recordHit, add the timestamp. On getHits, remove all timestamps older than (current - 300), then return the size. A queue naturally maintains temporal order.",
    insight: "Queue of timestamps. On getHits, evict all timestamps older than 300 seconds, return remaining size.",
    code: `Queue<Integer> q = new LinkedList<>();

void recordHit(int timestamp) {
  q.offer(timestamp);
}
int getHits(int timestamp) {
  while (!q.isEmpty() && q.peek() <= timestamp - 300) q.poll();
  return q.size();
}`,
    time: "O(n) worst getHits", space: "O(n)"
  }
} satisfies SolutionMap;
