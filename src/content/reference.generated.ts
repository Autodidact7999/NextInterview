import type { MindMapNodeDetailMap, ReferenceAccordionItem } from "@/lib/types";

export const typesReferenceEntries = [
  {
    title: 'Primitive Types',
    tag: 'int · long · char · boolean',
    tagBg: 'var(--green-bg)', tagC: 'var(--green-text)',
    body: 'Use <strong>int</strong> for indexes, values, counts. Use <strong>long</strong> whenever sum/product can exceed ~2.1 billion. Use <strong>char</strong> for string character work. Use <strong>boolean</strong> for visited arrays and flags.',
    code: `<span class="kw">byte</span>    <span class="cm">// 8-bit,   range ±127</span>
<span class="kw">short</span>   <span class="cm">// 16-bit</span>
<span class="kw">int</span>     <span class="cm">// 32-bit — default for indexes, values, counts</span>
<span class="kw">long</span>    <span class="cm">// 64-bit — use for large sums / counts / products</span>
<span class="kw">char</span>    <span class="cm">// 16-bit unicode character</span>
<span class="kw">boolean</span> <span class="cm">// true / false</span>
<span class="kw">double</span>  <span class="cm">// 64-bit float (avoid for exact integer logic)</span>

<span class="kw">long</span> x = <span class="nm">10000000000L</span>; <span class="cm">// must add L suffix for long literals</span>`,
    trap: 'Array values up to 10⁹ summed many times can exceed int. Use long. This causes silent wrong answers with no compile error.',
    edgeCases: 'Watch for int overflow when multiplying two large ints (e.g., 100000 * 100000 exceeds int). Sum of n values near 10⁹ needs long. Negative numbers in modulo operations behave differently than you expect.'
  },
  {
    title: 'Arrays — int[], char[], int[][]',
    tag: 'Fixed-size · O(1) index access',
    tagBg: 'var(--green-bg)', tagC: 'var(--green-text)',
    body: 'Fastest structure for index access. Best for: sliding window, two pointers, binary search, prefix sums, DP. Use <code>.length</code> (no parentheses).',
    code: `<span class="kw">int</span>[] arr = <span class="kw">new</span> <span class="kw">int</span>[<span class="nm">5</span>];
<span class="kw">int</span>[] nums = {<span class="nm">1</span>, <span class="nm">2</span>, <span class="nm">3</span>};
<span class="kw">int</span> n = nums.length;          <span class="cm">// NOT .length()</span>
Arrays.sort(nums);
Arrays.fill(arr, -<span class="nm">1</span>);
Arrays.equals(a, b);
Arrays.copyOf(arr, newLength);
Arrays.binarySearch(arr, target);

<span class="cm">// 2D array</span>
<span class="kw">int</span>[][] grid = <span class="kw">new</span> <span class="kw">int</span>[m][n];
<span class="kw">int</span> rows = grid.length;
<span class="kw">int</span> cols = grid[<span class="nm">0</span>].length;`,
    trap: 'arr.length for arrays (no parentheses). String uses s.length(). Mixing them is a very common compile error.',
    edgeCases: 'Empty array. Single-element array. Array with all zeros. Very large arrays (10⁶+ elements) — check for O(n²) bugs. 2D arrays with jagged rows (rows can have different lengths).'
  },
  {
    title: 'String — immutable, read-only',
    tag: 'Read-only · O(n) concat in loops!',
    tagBg: 'var(--purple-bg)', tagC: 'var(--purple-text)',
    body: 'String is <strong>immutable</strong> — every modification creates a new object. Use for read-only operations. Never use + in loops.',
    code: `<span class="tp">String</span> s = <span class="st">"hello"</span>;
<span class="kw">int</span> n = s.length();           <span class="cm">// parentheses required</span>
<span class="kw">char</span> c = s.charAt(<span class="nm">0</span>);
<span class="tp">String</span> sub = s.substring(<span class="nm">1</span>, <span class="nm">4</span>); <span class="cm">// [1, 4) — right exclusive</span>
s.equals(other);               <span class="cm">// always use equals, not ==</span>
s.compareTo(other);            <span class="cm">// lexicographic comparison</span>
s.indexOf(<span class="st">"ab"</span>);
s.toCharArray();
s.split(<span class="st">" "</span>);
s.startsWith(<span class="st">"ab"</span>);
s.endsWith(<span class="st">"yz"</span>);
s.toLowerCase();
s.trim();
s.contains(<span class="st">"xyz"</span>);`,
    trap: 'String += in a loop is O(n²) — each concatenation allocates a new String. Use StringBuilder. Also: always use .equals() not == for string comparison in Java.',
    edgeCases: 'Empty string. Single character. Null string (NPE — check before using). Unicode characters beyond ASCII. Very large strings (10⁶+ chars) — watch for O(n²) algorithms. String with only whitespace.'
  },
  {
    title: 'StringBuilder — mutable string builder',
    tag: 'O(1) append · mutable',
    tagBg: 'var(--purple-bg)', tagC: 'var(--purple-text)',
    body: 'Use whenever building a string across iterations. Essential for backtracking path building, loop concatenation, building reversed strings.',
    code: `<span class="tp">StringBuilder</span> sb = <span class="kw">new</span> <span class="tp">StringBuilder</span>();
sb.append(<span class="st">"hello"</span>);
sb.append(<span class="nm">123</span>);               <span class="cm">// auto-converts int</span>
sb.insert(<span class="nm">0</span>, <span class="st">'x'</span>);           <span class="cm">// insert at index</span>
sb.deleteCharAt(sb.length()-<span class="nm">1</span>); <span class="cm">// remove last</span>
sb.delete(<span class="nm">0</span>, <span class="nm">3</span>);             <span class="cm">// delete range [0,3)</span>
sb.reverse();
sb.charAt(i);
sb.length();
<span class="tp">String</span> result = sb.toString();`,
    trap: 'Common backtracking mistake: forgetting to call deleteCharAt or delete after recursion returns, leaving the path corrupted.',
    edgeCases: 'Building empty string. Very long result strings (10⁶+ chars). Reversing strings — make sure indices are correct. Multiple sequential insertions/deletions can be inefficient.'
  },
  {
    title: 'char[] — mutable character array',
    tag: 'In-place mutation · O(1) access',
    tagBg: 'var(--lime-bg)', tagC: 'var(--lime-text)',
    body: 'Use when you need to modify characters in-place. Faster than String for character-level work. Convert String → char[] with toCharArray(), back with new String(arr).',
    code: `<span class="kw">char</span>[] arr = s.toCharArray();
arr[i] = <span class="st">'x'</span>;                  <span class="cm">// direct mutation</span>
<span class="tp">String</span> result = <span class="kw">new</span> <span class="tp">String</span>(arr);

<span class="cm">// ─── Index tricks ─────────────────────────────</span>
<span class="kw">int</span> idx   = ch - <span class="st">'a'</span>;  <span class="cm">// 'a'=0, 'b'=1 … 'z'=25</span>
<span class="kw">int</span> idx   = ch - <span class="st">'A'</span>;  <span class="cm">// uppercase: 'A'=0 … 'Z'=25</span>
<span class="kw">int</span> digit = ch - <span class="st">'0'</span>;  <span class="cm">// digit char to int: '7' → 7</span>
<span class="kw">char</span> c    = (<span class="kw">char</span>)(d + <span class="st">'0'</span>); <span class="cm">// int digit to char</span>

<span class="cm">// Frequency array — lowercase letters</span>
<span class="kw">int</span>[] freq = <span class="kw">new</span> <span class="kw">int</span>[<span class="nm">26</span>];
<span class="kw">for</span> (<span class="kw">char</span> c : s.toCharArray()) freq[c - <span class="st">'a'</span>]++;

<span class="cm">// Frequency array — all ASCII</span>
<span class="kw">int</span>[] cnt = <span class="kw">new</span> <span class="kw">int</span>[<span class="nm">128</span>];
<span class="kw">for</span> (<span class="kw">char</span> c : s.toCharArray()) cnt[c]++;`,
    trap: null,
    edgeCases: 'Repeated characters. Very long char arrays. Index out of bounds (double-check iteration limits). Swapping at wrong indices.'
  },
  {
    title: 'Conversions, Wrappers & Math',
    tag: 'parseInt · valueOf · Integer constants',
    tagBg: 'var(--amber-bg)', tagC: 'var(--amber-text)',
    body: 'Java collections cannot store primitives — use Integer, Long, Character, Boolean wrappers. Autoboxing is automatic but can throw NullPointerException on unboxing null.',
    code: `<span class="cm">// String ↔ int</span>
<span class="kw">int</span> x = <span class="tp">Integer</span>.parseInt(<span class="st">"123"</span>);
<span class="tp">String</span> s = <span class="tp">String</span>.valueOf(<span class="nm">123</span>);

<span class="cm">// Useful constants</span>
<span class="tp">Integer</span>.MAX_VALUE   <span class="cm">// 2,147,483,647</span>
<span class="tp">Integer</span>.MIN_VALUE   <span class="cm">// -2,147,483,648</span>
<span class="tp">Long</span>.MAX_VALUE      <span class="cm">// 9.2 × 10¹⁸</span>

<span class="cm">// Math helpers</span>
Math.max(a, b);
Math.min(a, b);
Math.abs(x);
Math.sqrt(x);      <span class="cm">// returns double</span>
Math.pow(a, b);    <span class="cm">// returns double — avoid for exact int logic</span>`,
    trap: 'Autoboxing can throw NullPointerException when unboxing a null Integer to int. Use getOrDefault to avoid null values from maps.',
    edgeCases: 'Non-numeric strings in parseInt (NumberFormatException). Null pointer when unboxing. Values at Integer.MAX_VALUE and Integer.MIN_VALUE. Parsing leading zeros. Very large Long values.'
  }
] satisfies ReferenceAccordionItem[];

export const collectionsReferenceEntries = [
  {
    title: 'ArrayList — dynamic array',
    tag: 'Dynamic · O(1) index access',
    tagBg: 'var(--green-bg)', tagC: 'var(--green-text)',
    body: 'Use when size changes. Best for result storage, collecting answers, adjacency lists. <strong>Not</strong> ideal for frequent front insertions — use ArrayDeque for that.',
    code: `List&lt;<span class="tp">Integer</span>&gt; list = <span class="kw">new</span> ArrayList&lt;&gt;();
list.add(<span class="nm">10</span>);                  <span class="cm">// add at end:   O(1) amortized</span>
list.add(<span class="nm">0</span>, <span class="nm">5</span>);             <span class="cm">// add at index: O(n)</span>
list.get(<span class="nm">0</span>);                  <span class="cm">// O(1)</span>
list.set(<span class="nm">0</span>, <span class="nm">20</span>);             <span class="cm">// O(1)</span>
list.remove(list.size()-<span class="nm">1</span>);  <span class="cm">// remove last:  O(1)</span>
list.remove(Integer.valueOf(<span class="nm">1</span>)); <span class="cm">// remove VALUE</span>
list.remove(<span class="nm">1</span>);               <span class="cm">// remove by INDEX</span>
list.size();
list.contains(<span class="nm">5</span>);
Collections.sort(list);
list.sort((a, b) -&gt; Integer.compare(b, a)); <span class="cm">// descending</span>`,
    trap: 'list.remove(1) removes by index. list.remove(Integer.valueOf(1)) removes by value. With List<Integer> this is a common silent bug.',
    edgeCases: 'Empty list. Single-element list. Removing while iterating (ConcurrentModificationException). Adding/removing at front (O(n) cost). Null elements in list. Sorting with custom comparator on Integer list.'
  },
  {
    title: 'HashMap — key-value lookup',
    tag: 'O(1) avg · most used in DSA',
    tagBg: 'var(--purple-bg)', tagC: 'var(--purple-text)',
    body: 'The most important collection for DSA. Frequency counting, index lookup, prefix sum maps, grouping, cycle detection.',
    code: `Map&lt;<span class="tp">Integer</span>,<span class="tp">Integer</span>&gt; map = <span class="kw">new</span> HashMap&lt;&gt;();
map.put(k, v);
map.get(k);                    <span class="cm">// null if missing — dangerous!</span>
map.getOrDefault(k, <span class="nm">0</span>);      <span class="cm">// safe — always prefer this</span>
map.containsKey(k);
map.containsValue(v);
map.remove(k);
map.size();

<span class="cm">// ─── Frequency count pattern ──────────────────</span>
map.put(x, map.getOrDefault(x, <span class="nm">0</span>) + <span class="nm">1</span>);

<span class="cm">// ─── Store first index ────────────────────────</span>
<span class="kw">if</span> (!map.containsKey(x)) map.put(x, i);

<span class="cm">// ─── Iterate entries ──────────────────────────</span>
<span class="kw">for</span> (Map.Entry&lt;<span class="tp">Integer</span>,<span class="tp">Integer</span>&gt; e : map.entrySet()) {
    <span class="kw">int</span> key = e.getKey();
    <span class="kw">int</span> val = e.getValue();
}
<span class="kw">for</span> (<span class="kw">int</span> k : map.keySet()) { ... }`,
    trap: 'map.get(key) returns null if not found. Unboxing null to int throws NullPointerException. Always use getOrDefault or check containsKey first.',
    edgeCases: 'Empty map. Single entry map. Keys that hash to the same bucket (rare in interviews but explains O(n) worst case). Null keys are allowed but avoid them. Null values (distinct from missing keys). Iterating while modifying (ConcurrentModificationException).'
  },
  {
    title: 'HashSet — fast membership',
    tag: 'O(1) avg · unique elements',
    tagBg: 'var(--purple-bg)', tagC: 'var(--purple-text)',
    body: 'Use for "have I seen this?" checks, duplicate removal, fast visited tracking. Only stores keys, no values.',
    code: `Set&lt;<span class="tp">Integer</span>&gt; set = <span class="kw">new</span> HashSet&lt;&gt;();
set.add(<span class="nm">1</span>);
set.contains(<span class="nm">1</span>);             <span class="cm">// O(1) average</span>
set.remove(<span class="nm">1</span>);
set.size();

<span class="cm">// Build from array</span>
Set&lt;<span class="tp">Integer</span>&gt; seen =
    <span class="kw">new</span> HashSet&lt;&gt;(Arrays.asList(nums));

<span class="cm">// Common visited pattern</span>
Set&lt;<span class="tp">Integer</span>&gt; visited = <span class="kw">new</span> HashSet&lt;&gt;();
<span class="kw">if</span> (visited.add(node)) {   <span class="cm">// add returns false if already present</span>
    <span class="cm">// process node</span>
}`,
    trap: null,
    edgeCases: 'Empty set. Single-element set. Iterating order is unpredictable (hash-based). Adding duplicates (silently ignored). Large sets (10⁶+ elements) with hash collisions.'
  },
  {
    title: 'Queue (BFS) — ArrayDeque',
    tag: 'FIFO · O(1) offer/poll · BFS',
    tagBg: 'var(--green-bg)', tagC: 'var(--green-text)',
    body: 'Use for BFS, level-order tree traversal, shortest path in unweighted graphs. Always use <strong>ArrayDeque</strong> as implementation, not LinkedList.',
    code: `Queue&lt;<span class="tp">Integer</span>&gt; q = <span class="kw">new</span> ArrayDeque&lt;&gt;();
q.offer(x);  <span class="cm">// add to tail — prefer over add()</span>
q.poll();    <span class="cm">// remove from head (null if empty)</span>
q.peek();    <span class="cm">// see head without removing</span>
q.isEmpty();
q.size();

<span class="cm">// ─── BFS level-order template ─────────────────</span>
Queue&lt;<span class="tp">TreeNode</span>&gt; q = <span class="kw">new</span> ArrayDeque&lt;&gt;();
q.offer(root);
<span class="kw">while</span> (!q.isEmpty()) {
    <span class="kw">int</span> size = q.size();       <span class="cm">// snapshot this level</span>
    <span class="kw">for</span> (<span class="kw">int</span> i = <span class="nm">0</span>; i &lt; size; i++) {
        <span class="tp">TreeNode</span> node = q.poll();
        <span class="kw">if</span> (node.left  != <span class="kw">null</span>) q.offer(node.left);
        <span class="kw">if</span> (node.right != <span class="kw">null</span>) q.offer(node.right);
    }
}`,
    trap: null,
    edgeCases: 'Empty queue. Single-element queue. Multiple levels with the same size (level-order tree). Calling poll/peek on empty queue (returns null, doesn\'t throw). Very deep trees causing large queue sizes.'
  },
  {
    title: 'Deque / Stack — ArrayDeque',
    tag: 'O(1) both ends · replaces Stack class',
    tagBg: 'var(--green-bg)', tagC: 'var(--green-text)',
    body: 'Use ArrayDeque for both stack and deque operations. The legacy <code>Stack</code> class is slow (synchronized) and outdated. Always prefer ArrayDeque.',
    code: `<span class="cm">// ─── As a stack ───────────────────────────────</span>
Deque&lt;<span class="tp">Integer</span>&gt; stack = <span class="kw">new</span> ArrayDeque&lt;&gt;();
stack.push(x);   <span class="cm">// add to front — O(1)</span>
stack.pop();     <span class="cm">// remove from front — O(1)</span>
stack.peek();    <span class="cm">// see front without removing</span>
stack.isEmpty();

<span class="cm">// ─── As a double-ended queue ──────────────────</span>
Deque&lt;<span class="tp">Integer</span>&gt; dq = <span class="kw">new</span> ArrayDeque&lt;&gt;();
dq.addFirst(x);   dq.addLast(x);
dq.pollFirst();   dq.pollLast();   <span class="cm">// null if empty</span>
dq.peekFirst();   dq.peekLast();

<span class="cm">// ─── Monotonic stack (store INDICES) ──────────</span>
Deque&lt;<span class="tp">Integer</span>&gt; mono = <span class="kw">new</span> ArrayDeque&lt;&gt;();
<span class="kw">for</span> (<span class="kw">int</span> i = <span class="nm">0</span>; i &lt; n; i++) {
    <span class="kw">while</span> (!mono.isEmpty() &amp;&amp; nums[mono.peek()] &lt; nums[i])
        res[mono.pop()] = nums[i]; <span class="cm">// found next greater</span>
    mono.push(i);                  <span class="cm">// push INDEX</span>
}`,
    trap: 'Do NOT use Stack<> (legacy, synchronized, slow) or LinkedList<>. ArrayDeque is always faster for stack/deque use.',
    edgeCases: 'Empty stack/deque. Single element. Calling pop/peek on empty deque (throws NoSuchElementException). Very deep recursion causing stack overflow. Monotonic stack with very long input array.'
  },
  {
    title: 'PriorityQueue — Heap',
    tag: 'O(log n) insert/remove · O(1) peek',
    tagBg: 'var(--amber-bg)', tagC: 'var(--amber-text)',
    body: 'Default is <strong>min-heap</strong> (smallest element at top). For K largest → use min-heap of size K. For K smallest → use max-heap of size K. Use in Dijkstra, Top K, greedy problems.',
    code: `<span class="cm">// Min-heap (default) — smallest at top</span>
PriorityQueue&lt;<span class="tp">Integer</span>&gt; minPQ = <span class="kw">new</span> PriorityQueue&lt;&gt;();

<span class="cm">// Max-heap — largest at top</span>
PriorityQueue&lt;<span class="tp">Integer</span>&gt; maxPQ = <span class="kw">new</span>
    PriorityQueue&lt;&gt;(Comparator.reverseOrder());

minPQ.offer(x);   <span class="cm">// insert:     O(log n)</span>
minPQ.poll();     <span class="cm">// remove top: O(log n)</span>
minPQ.peek();     <span class="cm">// see top:    O(1)</span>
minPQ.size();

<span class="cm">// Custom: sort int[] by first element</span>
PriorityQueue&lt;<span class="kw">int</span>[]&gt; pq = <span class="kw">new</span> PriorityQueue&lt;&gt;(
    (a, b) -&gt; Integer.compare(a[<span class="nm">0</span>], b[<span class="nm">0</span>]));
pq.offer(<span class="kw">new</span> <span class="kw">int</span>[]{dist, node});

<span class="cm">// K largest elements — min-heap of size K</span>
<span class="kw">for</span> (<span class="kw">int</span> num : nums) {
    minPQ.offer(num);
    <span class="kw">if</span> (minPQ.size() &gt; k) minPQ.poll();
}
<span class="cm">// top of minPQ is now the Kth largest</span>`,
    trap: 'Comparator subtraction (a-b) can overflow with large negatives. Always use Integer.compare(a, b). Also: PriorityQueue<int[]> needs a comparator — no default exists for arrays.',
    edgeCases: 'Empty heap. Single-element heap. K = 0 (edge case in Top K). K > array size. Duplicate values in heap. Very large K values causing heap to grow unbounded. Comparator returning 0 for all elements (all equal priority).'
  },
  {
    title: 'TreeMap — sorted key-value map',
    tag: 'O(log n) · floor/ceiling · ordered',
    tagBg: 'var(--blue-bg)', tagC: 'var(--blue-text)',
    body: 'Use when you need keys in sorted order or nearest-key lookups. Slower than HashMap but maintains order. Great for interval-style problems.',
    code: `TreeMap&lt;<span class="tp">Integer</span>,<span class="tp">Integer</span>&gt; tm = <span class="kw">new</span> TreeMap&lt;&gt;();
tm.put(k, v);
tm.get(k);
tm.getOrDefault(k, <span class="nm">0</span>);
tm.firstKey();             <span class="cm">// smallest key</span>
tm.lastKey();              <span class="cm">// largest key</span>
tm.ceilingKey(k);          <span class="cm">// smallest key &gt;= k</span>
tm.floorKey(k);            <span class="cm">// largest  key &lt;= k</span>
tm.higherKey(k);           <span class="cm">// strictly &gt; k</span>
tm.lowerKey(k);            <span class="cm">// strictly &lt; k</span>
tm.remove(k);
tm.size();

<span class="cm">// Iterate in sorted key order</span>
<span class="kw">for</span> (<span class="kw">int</span> key : tm.keySet()) { ... }
<span class="kw">for</span> (Map.Entry&lt;<span class="tp">Integer</span>,<span class="tp">Integer</span>&gt; e : tm.entrySet()) { ... }`,
    trap: null,
    edgeCases: 'Empty map. Single entry. Querying for key that doesn\'t exist (returns null). floor/ceiling on boundary values. Very large maps (10⁶+ entries) causing slow iteration.'
  },
  {
    title: 'TreeSet — sorted unique elements',
    tag: 'O(log n) · sorted set · floor/ceiling',
    tagBg: 'var(--blue-bg)', tagC: 'var(--blue-text)',
    body: 'Use when you need a sorted collection of unique values with nearest-value lookups. Think of it as a sorted HashSet with floor/ceiling.',
    code: `TreeSet&lt;<span class="tp">Integer</span>&gt; ts = <span class="kw">new</span> TreeSet&lt;&gt;();
ts.add(<span class="nm">5</span>);
ts.contains(<span class="nm">5</span>);
ts.first();               <span class="cm">// smallest element</span>
ts.last();                <span class="cm">// largest element</span>
ts.ceiling(k);            <span class="cm">// smallest element &gt;= k</span>
ts.floor(k);              <span class="cm">// largest  element &lt;= k</span>
ts.higher(k);             <span class="cm">// strictly &gt; k</span>
ts.lower(k);              <span class="cm">// strictly &lt; k</span>
ts.remove(k);
ts.size();

<span class="cm">// Iterate in sorted order</span>
<span class="kw">for</span> (<span class="kw">int</span> x : ts) { ... }`,
    trap: null,
    edgeCases: 'Empty set. Single element. Querying for value that doesn\'t exist (returns null). floor/ceiling on boundary values. Duplicates (silently ignored on add). Very large sorted sets causing slow operations.'
  }
] satisfies ReferenceAccordionItem[];

export const patternReferenceEntries = [
  {
    title: 'Frequency Counting',
    tag: 'HashMap · int[26] · int[128]',
    tagBg: 'var(--green-bg)', tagC: 'var(--green-text)',
    body: 'When value range is small and bounded, an array beats HashMap every time — simpler, faster, less memory. Use <code>int[26]</code> for lowercase, <code>int[128]</code> for ASCII.',
    code: `<span class="cm">// HashMap — arbitrary keys</span>
Map&lt;<span class="tp">Integer</span>,<span class="tp">Integer</span>&gt; freq = <span class="kw">new</span> HashMap&lt;&gt;();
<span class="kw">for</span> (<span class="kw">int</span> x : nums)
    freq.put(x, freq.getOrDefault(x, <span class="nm">0</span>) + <span class="nm">1</span>);

<span class="cm">// int[26] — lowercase letters (PREFER this)</span>
<span class="kw">int</span>[] cnt = <span class="kw">new</span> <span class="kw">int</span>[<span class="nm">26</span>];
<span class="kw">for</span> (<span class="kw">char</span> c : s.toCharArray()) cnt[c - <span class="st">'a'</span>]++;

<span class="cm">// int[128] — any ASCII</span>
<span class="kw">int</span>[] cnt = <span class="kw">new</span> <span class="kw">int</span>[<span class="nm">128</span>];
<span class="kw">for</span> (<span class="kw">char</span> c : s.toCharArray()) cnt[c]++;`,
    trap: null,
    edgeCases: 'Empty input string or array. Single element. All elements are the same. Uppercase vs. lowercase letters (different ranges). Non-ASCII characters for int[128] (IndexOutOfBoundsException).'
  },
  {
    title: 'Binary Search',
    tag: 'Sorted arrays · answer-space search',
    tagBg: 'var(--purple-bg)', tagC: 'var(--purple-text)',
    body: 'Classic: search in sorted array. Advanced: search on the answer space when the function is monotonic. Always use <code>left + (right - left) / 2</code> to avoid overflow.',
    code: `<span class="cm">// ─── Classic: find target ─────────────────────</span>
<span class="kw">int</span> left = <span class="nm">0</span>, right = arr.length - <span class="nm">1</span>;
<span class="kw">while</span> (left &lt;= right) {
    <span class="kw">int</span> mid = left + (right - left) / <span class="nm">2</span>; <span class="cm">// avoid overflow</span>
    <span class="kw">if</span>      (arr[mid] == target) <span class="kw">return</span> mid;
    <span class="kw">else if</span> (arr[mid] &lt;  target) left  = mid + <span class="nm">1</span>;
    <span class="kw">else</span>                         right = mid - <span class="nm">1</span>;
}
<span class="kw">return</span> -<span class="nm">1</span>;

<span class="cm">// ─── Lower bound (first index &gt;= target) ──────</span>
<span class="kw">int</span> left = <span class="nm">0</span>, right = arr.length;
<span class="kw">while</span> (left &lt; right) {
    <span class="kw">int</span> mid = left + (right - left) / <span class="nm">2</span>;
    <span class="kw">if</span> (arr[mid] &lt; target) left  = mid + <span class="nm">1</span>;
    <span class="kw">else</span>                   right = mid;
}
<span class="kw">return</span> left;`,
    trap: 'Use left + (right - left) / 2, not (left + right) / 2. The latter overflows if both are near Integer.MAX_VALUE.',
    edgeCases: 'Empty array. Single-element array. Target not in array. Duplicates in array (which index to return?). All elements equal. Negative numbers mixed with positive. Array with Integer.MAX_VALUE/MIN_VALUE.'
  },
  {
    title: 'Monotonic Stack',
    tag: 'Next greater/smaller · O(n)',
    tagBg: 'var(--amber-bg)', tagC: 'var(--amber-text)',
    body: 'Maintain an increasing or decreasing stack. <strong>Store indices, not values</strong>. Solves next greater element, daily temperatures, histogram problems in O(n) total.',
    code: `<span class="cm">// Next greater element to the right</span>
Deque&lt;<span class="tp">Integer</span>&gt; stack = <span class="kw">new</span> ArrayDeque&lt;&gt;();
<span class="kw">int</span>[] res = <span class="kw">new</span> <span class="kw">int</span>[n];
Arrays.fill(res, -<span class="nm">1</span>);
<span class="kw">for</span> (<span class="kw">int</span> i = <span class="nm">0</span>; i &lt; n; i++) {
    <span class="cm">// pop while current is greater → found answer for those</span>
    <span class="kw">while</span> (!stack.isEmpty() &amp;&amp; nums[stack.peek()] &lt; nums[i])
        res[stack.pop()] = nums[i];
    stack.push(i);  <span class="cm">// push index, not value</span>
}

<span class="cm">// For decreasing stack: flip comparison to &gt;</span>
<span class="cm">// For circular array: loop i from 0 to 2n-1, use i%n</span>`,
    trap: 'Always push indices, not values. You need the index to compute spans, distances, or look up values in the original array.',
    edgeCases: 'Empty array. Single element. All elements strictly increasing (all stay in stack). All elements strictly decreasing (all pop immediately). Circular array variation. Very large array causing stack to grow.'
  },
  {
    title: 'Monotonic Deque — Sliding Window Max/Min',
    tag: 'O(n) sliding max · Deque of indices',
    tagBg: 'var(--amber-bg)', tagC: 'var(--amber-text)',
    body: 'Maintain a deque of indices in decreasing value order. Front is always the max of the current window. Evict front when out of window; evict back when current value is larger.',
    code: `<span class="cm">// Sliding window maximum of size k</span>
Deque&lt;<span class="tp">Integer</span>&gt; dq = <span class="kw">new</span> ArrayDeque&lt;&gt;();
<span class="kw">int</span>[] res = <span class="kw">new</span> <span class="kw">int</span>[n - k + <span class="nm">1</span>];

<span class="kw">for</span> (<span class="kw">int</span> i = <span class="nm">0</span>; i &lt; n; i++) {
    <span class="cm">// remove indices outside the window</span>
    <span class="kw">while</span> (!dq.isEmpty() &amp;&amp; dq.peekFirst() &lt; i - k + <span class="nm">1</span>)
        dq.pollFirst();
    <span class="cm">// keep deque decreasing — remove smaller from back</span>
    <span class="kw">while</span> (!dq.isEmpty() &amp;&amp; nums[dq.peekLast()] &lt; nums[i])
        dq.pollLast();
    dq.addLast(i);
    <span class="kw">if</span> (i &gt;= k - <span class="nm">1</span>)
        res[i - k + <span class="nm">1</span>] = nums[dq.peekFirst()];
}`,
    trap: null,
    edgeCases: 'Window size k = 1 (just return the array). Window size k > array size. Array of all equal elements. Strictly increasing or decreasing array. Very large window size. Integer.MIN_VALUE in window (comparison trickiness).'
  },
  {
    title: 'Backtracking',
    tag: 'Subsets · Permutations · Combinations',
    tagBg: 'var(--purple-bg)', tagC: 'var(--purple-text)',
    body: 'Recursive exploration with undo. Track a mutable path list. <strong>Always add a copy</strong> to results at the base case, never the path itself.',
    code: `List&lt;List&lt;<span class="tp">Integer</span>&gt;&gt; res = <span class="kw">new</span> ArrayList&lt;&gt;();
List&lt;<span class="tp">Integer</span>&gt; path = <span class="kw">new</span> ArrayList&lt;&gt;();

<span class="kw">void</span> backtrack(<span class="kw">int</span> start) {
    res.add(<span class="kw">new</span> ArrayList&lt;&gt;(path)); <span class="cm">// COPY — critical!</span>
    <span class="kw">for</span> (<span class="kw">int</span> i = start; i &lt; nums.length; i++) {
        path.add(nums[i]);           <span class="cm">// choose</span>
        backtrack(i + <span class="nm">1</span>);           <span class="cm">// explore</span>
        path.remove(path.size()-<span class="nm">1</span>); <span class="cm">// undo</span>
    }
}

<span class="cm">// For permutations: use a boolean visited[] instead of start</span>
<span class="cm">// For combinations with duplicates: sort first, skip duplicates</span>`,
    trap: 'CRITICAL: res.add(new ArrayList<>(path)) — NOT res.add(path). path is mutable; adding it directly means every result entry points to the same list, which keeps getting modified.',
    edgeCases: 'Empty input array. Array with all duplicate elements. Single-element array. Very large branching factor causing TLE — check if pruning is sufficient. Array with negative numbers or zeros.'
  },
  {
    title: 'BFS — Graphs & Trees',
    tag: 'Shortest path (unweighted) · Level order',
    tagBg: 'var(--blue-bg)', tagC: 'var(--blue-text)',
    body: 'Use Queue + visited array/set. For graphs: mark visited <strong>when offering to queue</strong>, not on poll. Level-order: snapshot <code>q.size()</code> at the start of each level.',
    code: `<span class="cm">// ─── Graph BFS (shortest path) ────────────────</span>
Queue&lt;<span class="tp">Integer</span>&gt; q = <span class="kw">new</span> ArrayDeque&lt;&gt;();
<span class="kw">boolean</span>[] visited = <span class="kw">new</span> <span class="kw">boolean</span>[n];
q.offer(start);
visited[start] = <span class="kw">true</span>;  <span class="cm">// mark on OFFER, not poll</span>
<span class="kw">int</span> dist = <span class="nm">0</span>;
<span class="kw">while</span> (!q.isEmpty()) {
    <span class="kw">int</span> size = q.size();
    <span class="kw">for</span> (<span class="kw">int</span> i = <span class="nm">0</span>; i &lt; size; i++) {
        <span class="kw">int</span> node = q.poll();
        <span class="kw">if</span> (node == target) <span class="kw">return</span> dist;
        <span class="kw">for</span> (<span class="kw">int</span> nei : graph.get(node)) {
            <span class="kw">if</span> (!visited[nei]) {
                visited[nei] = <span class="kw">true</span>;
                q.offer(nei);
            }
        }
    }
    dist++;
}`,
    trap: 'Mark visited when you ADD to the queue, not when you poll. Marking on poll allows the same node to be added multiple times, wasting work and giving wrong distances.',
    edgeCases: 'Disconnected graph — BFS from one node won\'t reach all nodes. Single node graph. Graph with self-loops. Start node equals target node. Empty adjacency list. Very large graph (10⁶+ nodes) causing memory issues.'
  },
  {
    title: 'DFS — Graphs & Trees',
    tag: 'Explore all paths · Recursion or Stack',
    tagBg: 'var(--blue-bg)', tagC: 'var(--blue-text)',
    body: 'Recursive DFS is cleanest. Use iterative with ArrayDeque if recursion depth is a concern. Always track visited for graphs (not needed for trees).',
    code: `<span class="cm">// ─── Graph DFS (recursive) ────────────────────</span>
<span class="kw">void</span> dfs(<span class="kw">int</span> node, <span class="kw">boolean</span>[] visited) {
    visited[node] = <span class="kw">true</span>;
    <span class="kw">for</span> (<span class="kw">int</span> nei : graph.get(node)) {
        <span class="kw">if</span> (!visited[nei]) dfs(nei, visited);
    }
}

<span class="cm">// ─── Tree DFS — max depth ─────────────────────</span>
<span class="kw">int</span> maxDepth(<span class="tp">TreeNode</span> root) {
    <span class="kw">if</span> (root == <span class="kw">null</span>) <span class="kw">return</span> <span class="nm">0</span>;
    <span class="kw">return</span> <span class="nm">1</span> + Math.max(maxDepth(root.left),
                         maxDepth(root.right));
}

<span class="cm">// ─── Tree DFS — collect path sums ─────────────</span>
<span class="kw">void</span> dfs(<span class="tp">TreeNode</span> node, <span class="kw">int</span> curSum) {
    <span class="kw">if</span> (node == <span class="kw">null</span>) <span class="kw">return</span>;
    curSum += node.val;
    <span class="kw">if</span> (node.left == <span class="kw">null</span> &amp;&amp; node.right == <span class="kw">null</span>) {
        <span class="cm">// leaf — process curSum</span>
        <span class="kw">return</span>;
    }
    dfs(node.left,  curSum);
    dfs(node.right, curSum);
}`,
    trap: null,
    edgeCases: 'Null/empty tree. Single-node tree. Tree with only left or only right children (skewed). Very deep tree causing stack overflow. Tree with all node values equal. Large tree (10⁵+ nodes) causing slow recursion.'
  },
  {
    title: 'Graph — Building Adjacency Lists',
    tag: 'List<List<Integer>> · weighted int[][]',
    tagBg: 'var(--lime-bg)', tagC: 'var(--lime-text)',
    body: 'Build once before BFS/DFS. For unweighted, use List of Integer lists. For weighted, store int[] {neighbor, weight} pairs.',
    code: `<span class="cm">// ─── Unweighted graph ─────────────────────────</span>
List&lt;List&lt;<span class="tp">Integer</span>&gt;&gt; graph = <span class="kw">new</span> ArrayList&lt;&gt;();
<span class="kw">for</span> (<span class="kw">int</span> i = <span class="nm">0</span>; i &lt; n; i++) graph.add(<span class="kw">new</span> ArrayList&lt;&gt;());
graph.get(u).add(v);
graph.get(v).add(u); <span class="cm">// undirected — add both directions</span>

<span class="cm">// ─── Weighted graph ───────────────────────────</span>
List&lt;List&lt;<span class="kw">int</span>[]&gt;&gt; wg = <span class="kw">new</span> ArrayList&lt;&gt;();
<span class="kw">for</span> (<span class="kw">int</span> i = <span class="nm">0</span>; i &lt; n; i++) wg.add(<span class="kw">new</span> ArrayList&lt;&gt;());
wg.get(u).add(<span class="kw">new</span> <span class="kw">int</span>[]{v, weight});

<span class="cm">// ─── Dijkstra starter ─────────────────────────</span>
<span class="kw">int</span>[] dist = <span class="kw">new</span> <span class="kw">int</span>[n];
Arrays.fill(dist, <span class="tp">Integer</span>.MAX_VALUE);
dist[src] = <span class="nm">0</span>;
PriorityQueue&lt;<span class="kw">int</span>[]&gt; pq = <span class="kw">new</span> PriorityQueue&lt;&gt;(
    (a, b) -&gt; Integer.compare(a[<span class="nm">0</span>], b[<span class="nm">0</span>]));
pq.offer(<span class="kw">new</span> <span class="kw">int</span>[]{<span class="nm">0</span>, src}); <span class="cm">// {dist, node}</span>`,
    trap: null,
    edgeCases: 'Empty graph. Single node. Disconnected components (unreachable nodes). Graph with cycles. Self-loops and multi-edges. Very large graph (10⁶+ nodes). Negative edge weights (use Dijkstra only for non-negative).'
  },
  {
    title: 'Union Find (DSU)',
    tag: 'Connectivity · cycle detection · O(α)',
    tagBg: 'var(--red-bg)', tagC: 'var(--red-text)',
    body: 'Path compression + union by rank gives nearly O(1) per operation. Use for connected components, cycle detection, Kruskal MST. Memorize this template.',
    code: `<span class="kw">class</span> DSU {
    <span class="kw">int</span>[] parent, rank;

    DSU(<span class="kw">int</span> n) {
        parent = <span class="kw">new</span> <span class="kw">int</span>[n];
        rank   = <span class="kw">new</span> <span class="kw">int</span>[n];
        <span class="kw">for</span> (<span class="kw">int</span> i = <span class="nm">0</span>; i &lt; n; i++) parent[i] = i;
    }

    <span class="kw">int</span> find(<span class="kw">int</span> x) {
        <span class="kw">if</span> (parent[x] != x) parent[x] = find(parent[x]); <span class="cm">// compress</span>
        <span class="kw">return</span> parent[x];
    }

    <span class="kw">boolean</span> union(<span class="kw">int</span> a, <span class="kw">int</span> b) {
        <span class="kw">int</span> pa = find(a), pb = find(b);
        <span class="kw">if</span> (pa == pb) <span class="kw">return false</span>; <span class="cm">// already connected = cycle</span>
        <span class="kw">if</span>      (rank[pa] &lt; rank[pb]) parent[pa] = pb;
        <span class="kw">else if</span> (rank[pa] &gt; rank[pb]) parent[pb] = pa;
        <span class="kw">else</span>  { parent[pb] = pa; rank[pa]++; }
        <span class="kw">return true</span>;
    }
}`,
    trap: null,
    edgeCases: 'Already connected nodes (cycle — union returns false). Disconnected graph (multiple components). Single node (everything is its own component). Very large number of nodes (10⁶+). Union by rank vs. path compression trade-offs.'
  },
  {
    title: 'Trie (Prefix Tree)',
    tag: 'Prefix search · O(L) per operation',
    tagBg: 'var(--lime-bg)', tagC: 'var(--lime-text)',
    body: 'Use for prefix search, word dictionary, autocomplete. L = word length. Only needed for specific string/prefix problems.',
    code: `<span class="kw">class</span> TrieNode {
    <span class="tp">TrieNode</span>[] children = <span class="kw">new</span> <span class="tp">TrieNode</span>[<span class="nm">26</span>];
    <span class="kw">boolean</span> isWord;
}

<span class="kw">class</span> Trie {
    <span class="tp">TrieNode</span> root = <span class="kw">new</span> <span class="tp">TrieNode</span>();

    <span class="kw">void</span> insert(<span class="tp">String</span> word) {
        <span class="tp">TrieNode</span> cur = root;
        <span class="kw">for</span> (<span class="kw">char</span> c : word.toCharArray()) {
            <span class="kw">int</span> i = c - <span class="st">'a'</span>;
            <span class="kw">if</span> (cur.children[i] == <span class="kw">null</span>)
                cur.children[i] = <span class="kw">new</span> <span class="tp">TrieNode</span>();
            cur = cur.children[i];
        }
        cur.isWord = <span class="kw">true</span>;
    }

    <span class="kw">boolean</span> search(<span class="tp">String</span> word) {
        <span class="tp">TrieNode</span> cur = root;
        <span class="kw">for</span> (<span class="kw">char</span> c : word.toCharArray()) {
            <span class="kw">int</span> i = c - <span class="st">'a'</span>;
            <span class="kw">if</span> (cur.children[i] == <span class="kw">null</span>) <span class="kw">return false</span>;
            cur = cur.children[i];
        }
        <span class="kw">return</span> cur.isWord;
    }

    <span class="kw">boolean</span> startsWith(<span class="tp">String</span> prefix) {
        <span class="tp">TrieNode</span> cur = root;
        <span class="kw">for</span> (<span class="kw">char</span> c : prefix.toCharArray()) {
            <span class="kw">int</span> i = c - <span class="st">'a'</span>;
            <span class="kw">if</span> (cur.children[i] == <span class="kw">null</span>) <span class="kw">return false</span>;
            cur = cur.children[i];
        }
        <span class="kw">return true</span>;
    }
}`,
    trap: null,
    edgeCases: 'Empty trie. Single word. Prefix longer than any word (returns false). Searching with uppercase letters (assumes lowercase). Trie with many words sharing same prefix. Very large word count causing memory issues.'
  },
  {
    title: 'Top K — Heap Direction',
    tag: 'K largest → min-heap · K smallest → max-heap',
    tagBg: 'var(--amber-bg)', tagC: 'var(--amber-text)',
    body: 'Counter-intuitive but correct: to track the <strong>K largest</strong>, keep a <em>min</em>-heap of size K (the top is the smallest of the K largest = Kth largest). Evict whenever size exceeds K.',
    code: `<span class="cm">// K largest — min-heap of size K</span>
PriorityQueue&lt;<span class="tp">Integer</span>&gt; pq = <span class="kw">new</span> PriorityQueue&lt;&gt;();
<span class="kw">for</span> (<span class="kw">int</span> num : nums) {
    pq.offer(num);
    <span class="kw">if</span> (pq.size() &gt; k) pq.poll(); <span class="cm">// evict smallest</span>
}
<span class="cm">// pq.peek() = Kth largest; pq = all K largest</span>

<span class="cm">// K smallest — max-heap of size K</span>
PriorityQueue&lt;<span class="tp">Integer</span>&gt; pq =
    <span class="kw">new</span> PriorityQueue&lt;&gt;(Comparator.reverseOrder());
<span class="kw">for</span> (<span class="kw">int</span> num : nums) {
    pq.offer(num);
    <span class="kw">if</span> (pq.size() &gt; k) pq.poll(); <span class="cm">// evict largest</span>
}
<span class="cm">// pq.peek() = Kth smallest</span>`,
    trap: 'This direction is backwards from what feels natural. K LARGEST uses min-heap. K SMALLEST uses max-heap. Memorise once and never second-guess it.',
    edgeCases: 'K = 0 (edge case). K > array size. K = 1 (just return min or max). Array with all equal elements. Array with duplicates. Very large K values causing memory issues.'
  },
  {
    title: 'Comparator & Sorting Patterns',
    tag: 'Arrays.sort · lambda · multi-field',
    tagBg: 'var(--green-bg)', tagC: 'var(--green-text)',
    body: 'Use <code>Arrays.sort()</code> for arrays, <code>Collections.sort()</code> or <code>list.sort()</code> for lists. Always use <code>Integer.compare</code> inside lambdas — never subtraction.',
    code: `<span class="cm">// Sort int[][] by first column</span>
Arrays.sort(intervals, (a, b) -&gt; Integer.compare(a[<span class="nm">0</span>], b[<span class="nm">0</span>]));

<span class="cm">// Sort by first, break ties by second</span>
Arrays.sort(arr, (a, b) -&gt; {
    <span class="kw">if</span> (a[<span class="nm">0</span>] != b[<span class="nm">0</span>]) <span class="kw">return</span> Integer.compare(a[<span class="nm">0</span>], b[<span class="nm">0</span>]);
    <span class="kw">return</span> Integer.compare(a[<span class="nm">1</span>], b[<span class="nm">1</span>]);
});

<span class="cm">// Sort List&lt;Integer&gt; descending</span>
list.sort((a, b) -&gt; Integer.compare(b, a));

<span class="cm">// Sort String[] by length</span>
Arrays.sort(strs, (a, b) -&gt; a.length() - b.length());

<span class="cm">// Sort custom objects</span>
students.sort((a, b) -&gt; Integer.compare(a.age, b.age));

<span class="cm">// Reverse sorted order on Object array</span>
Arrays.sort(boxed, Comparator.reverseOrder());`,
    trap: 'Primitive int[] cannot use a custom Comparator. Convert to Integer[] first, or use int[][] (which works fine with lambdas).',
    edgeCases: 'Empty array/list. Single element. All elements equal. Sorting with null comparator (default natural order). Integer overflow in custom comparator (use Integer.compare). Multi-field sorting edge cases (ties on first field).'
  },
  {
    title: 'Bit Manipulation',
    tag: 'XOR · masks · subset enumeration',
    tagBg: 'var(--blue-bg)', tagC: 'var(--blue-text)',
    body: 'XOR cancels duplicate numbers (single number problem). Bitmask for subset enumeration. Shifts for power-of-2 logic.',
    code: `x &amp; <span class="nm">1</span>          <span class="cm">// check last bit: odd=1, even=0</span>
x &gt;&gt; <span class="nm">1</span>         <span class="cm">// right shift = divide by 2</span>
x &lt;&lt; <span class="nm">1</span>         <span class="cm">// left shift  = multiply by 2</span>
x ^ y          <span class="cm">// XOR: cancels duplicate pairs</span>
x &amp; y          <span class="cm">// AND</span>
x | y          <span class="cm">// OR</span>
x &amp; (x - <span class="nm">1</span>)   <span class="cm">// remove lowest set bit (count set bits)</span>
x &amp; (-x)       <span class="cm">// isolate lowest set bit</span>

<span class="cm">// XOR trick — single number in duplicates</span>
<span class="kw">int</span> res = <span class="nm">0</span>;
<span class="kw">for</span> (<span class="kw">int</span> x : nums) res ^= x; <span class="cm">// all others cancel</span>

<span class="cm">// Enumerate all subsets of n elements</span>
<span class="kw">for</span> (<span class="kw">int</span> mask = <span class="nm">0</span>; mask &lt; (<span class="nm">1</span> &lt;&lt; n); mask++) {
    <span class="kw">for</span> (<span class="kw">int</span> j = <span class="nm">0</span>; j &lt; n; j++) {
        <span class="kw">if</span> ((mask &amp; (<span class="nm">1</span> &lt;&lt; j)) != <span class="nm">0</span>) { <span class="cm">// j-th element included</span> }
    }
}`,
    trap: null,
    edgeCases: 'Zero value (all bits off). Negative numbers (two\'s complement representation). Single bit set. All bits set (Integer.MAX_VALUE or -1). Very large bit positions (32+ for int). Shift amounts >= 32 (undefined behavior).'
  }
] satisfies ReferenceAccordionItem[];

export const mindMapNodeDetails = {
  "int[]": {desc:"Integer array — fixed size, contiguous memory",when:"Storing integers, fixed-size collections",whyItWorks:"Contiguous memory means O(1) random access by index. Fixed size avoids allocation overhead, making it the fastest structure for iteration-heavy problems.",example:"int[] nums = new int[n];"},
  "char[]": {desc:"Character array — for string manipulation",when:"String problems, char processing",whyItWorks:"Direct character access via index is faster than String substring operations. Arrays avoid immutability overhead when you need to modify characters in place.",example:"char[] chars = s.toCharArray();"},
  "int[][]": {desc:"2D integer array — matrix",when:"Grid problems, DP tables",whyItWorks:"2D contiguous layout allows O(1) access to any cell by row and column. Cache-friendly for iteration and maintains spatial locality.",example:"int[][] grid = new int[m][n];"},
  "Two Ptrs": {desc:"Two indices moving toward each other",when:"Sorted arrays, palindromes, partitions",whyItWorks:"Two pointers eliminate the need for nested loops by exploiting sorted order. They converge in O(n) time with two-pointer geometry reducing the search space.",example:"while(l<r){ if(ok) l++; else r--; }"},
  "Prefix Sum": {desc:"Cumulative sum array for range queries",when:"Subarray sum, range sum queries",whyItWorks:"Pre-computing cumulative sums trades O(n) space for O(1) range query time. Any subarray sum becomes a simple subtraction instead of iterating all elements.",example:"prefix[i] = prefix[i-1] + nums[i];"},
  "String": {desc:"Immutable string — use for lookups",when:"String problems, keys",whyItWorks:"Strings are immutable and optimized for hashing and comparison in Java. Using String as a key or lookup value is safer and faster than character arrays.",example:"String s = 'hello';"},
  "SB": {desc:"StringBuilder — mutable string buffer",when:"Building strings efficiently, O(1) append",whyItWorks:"StringBuilder builds a mutable character buffer with O(1) amortized append. String += creates a new String each iteration (O(n) per append), making StringBuilder O(n) total vs O(n²) overall.",example:"sb.append(c); String result = sb.toString();"},
  "Anagram": {desc:"Words with same letters rearranged",when:"Grouping anagrams, frequency matching",whyItWorks:"Words with identical letter counts are anagrams. Detecting this via sorting or frequency array lets you group words in one pass.",example:"Sort or compare letter counts"},
  "Palindrome": {desc:"String reads same forwards/backwards",when:"Palindrome checking, expansion",whyItWorks:"A palindrome mirrors around its center. Two pointers converging from both ends check the mirror property in O(n) time, exploiting the symmetry.",example:"while(l<r && s[l]==s[r]){ l++; r--; }"},
  "HashMap": {desc:"Key-value hash table, O(1) avg lookup",when:"Frequency count, prefix sum map, index storage",whyItWorks:"Hash function converts keys to array indices in O(1) average time. This turns any 'have I seen this before?' question from O(n) scan to O(1) lookup.",example:"map.put(x, map.getOrDefault(x,0)+1)"},
  "HashSet": {desc:"Unique elements, O(1) avg lookup",when:"Duplicate detection, existence checks",whyItWorks:"Set membership tested via hash function in O(1) average time. Duplicates are rejected automatically, making HashSet ideal for existence queries.",example:"set.add(x); set.contains(x);"},
  "ArrayList": {desc:"Dynamic array — O(1) append amortized",when:"Collections of unknown size",whyItWorks:"Amortized O(1) append means the cost per element is constant over many operations. Dynamic resizing (doubling capacity) spreads allocation cost across multiple additions.",example:"list.add(x); for(int v:list){}"},
  "PQ": {desc:"Priority queue (heap) — O(log n) operations",when:"Top K, frequency sorting, greedy",whyItWorks:"Heap structure maintains the smallest (or largest) element at the root, reachable in O(1). Heap property ensures O(log n) insertion and removal.",example:"pq.offer(x); x = pq.poll();"},
  "TM/TS": {desc:"TreeMap/TreeSet — sorted with O(log n) ops",when:"Sorted iteration, floor/ceiling",whyItWorks:"Tree structure (Red-Black internally in Java) maintains sorted order while keeping insertions and lookups at O(log n). This is slower than HashMap but enables range queries.",example:"tm.floorKey(k); ts.ceiling(v);"},
  "Sliding": {desc:"Sliding window pattern for substring/subarray",when:"Longest substring, window max/min",whyItWorks:"Window maintains a contiguous subarray and slides it forward. Tracking the window's sum or state incrementally avoids redundant O(n) recalculations.",example:"while(right<n){ expand; shrink if needed; }"},
  "Mono": {desc:"Monotonic stack/deque for next greater/smaller",when:"Next greater element, histogram problems",whyItWorks:"By maintaining a sorted invariant, each element enters and exits the stack exactly once, giving O(n) total. The stack naturally tracks unanswered questions about previous elements.",example:"while(!stk.empty()&&nums[stk.peek()]<nums[i])..."},
  "BT": {desc:"Backtracking — recursive exploration with undo",when:"Subsets, permutations, combinations",whyItWorks:"Recursion with undo explores all branches exhaustively. Backtracking prunes branches early and restores state, turning exponential problems into tractable searches.",example:"path.add(x); backtrack(); path.remove(x);"},
  "Top K": {desc:"Find K largest/smallest elements",when:"Top K frequent, closest points",whyItWorks:"Min-heap of size K maintains the K largest elements. New elements are compared against the smallest in the heap, updating in O(log K) time.",example:"Use min-heap for K largest"},
  "BFS": {desc:"Breadth-first search — level order traversal",when:"Shortest path unweighted, level order",whyItWorks:"Processing nodes level-by-level guarantees you find the shortest path first in unweighted graphs. Each level represents one more step from the source.",example:"Queue q; q.offer(start); while(!q.empty()){}"},
  "DFS": {desc:"Depth-first search — recursive exploration",when:"All paths, connected components, backtracking",whyItWorks:"Recursive exploration visits all reachable nodes and edges exactly once in O(V+E) time. The call stack naturally tracks the current path.",example:"void dfs(node){ visited[node]=true; for(nei)dfs(nei); }"},
  "BS": {desc:"Binary search on sorted arrays or answer space",when:"Searching, finding boundaries, monotonic predicates",whyItWorks:"Binary search eliminates half the search space with each comparison. This turns O(n) linear search into O(log n), or finds the boundary of a monotonic predicate.",example:"while(l<=r){ mid=l+(r-l)/2; if(arr[mid]==t)return mid; }"},
  "UF": {desc:"Union Find (DSU) — O(α) connectivity queries",when:"Connected components, cycle detection",whyItWorks:"Path compression and union by rank keep each find/union operation nearly O(1). This builds equivalence classes and detects cycles efficiently.",example:"find(x); union(a,b);"},
  "Dij": {desc:"Dijkstra's algorithm — shortest path weighted",when:"Shortest path in weighted graphs",whyItWorks:"Priority queue orders processing by distance; Dijkstra always expands the nearest unvisited node next. This greedy choice guarantees shortest paths in non-negative graphs.",example:"PriorityQueue<int[]> pq; int[] dist;"},
  "DP": {desc:"Dynamic programming — memoization or tabulation",when:"Optimization problems, overlapping subproblems",whyItWorks:"Overlapping subproblems mean the same computation repeats many times. Storing results in a table avoids recomputation, turning exponential recursion into polynomial time.",example:"dp[i] = Math.max(dp[i-1], current+dp[i-2]);"},
  "Deque": {desc:"Double-ended queue — ArrayDeque",when:"Stack, deque, sliding window max/min",whyItWorks:"Double-ended access in O(1) supports both stack (LIFO) and queue (FIFO) operations. ArrayDeque is faster than Stack or LinkedList for both.",example:"dq.addFirst(x); dq.pollLast();"}
} satisfies MindMapNodeDetailMap;
