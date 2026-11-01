export interface DSAQuestion {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Advanced' | 'Intermediate';
  frequency: number;
  tags: string[];
  input: string;
  output: string;
  approach: string;
  code: { [key: string]: string };
  time: string;
  space: string;
  acceptanceRate?: number;
  estimatedRounds?: string;
  visualizerType: 'tree' | 'sliding-window' | 'linked-list' | 'dp' | 'sorting' | 'graph' | 'array' | 'matrix' | 'binary-search' | 'two-pointers' | 'heap' | 'hashmap' | 'string' | 'trie' | 'stack' | 'queue' | 'circular' | 'cache' | 'timeline' | 'grid' | 'rain-water';
  explanation: {
    intuition: string;
    brute: string;
    optimized: string;
    dryRun: string[];
    edgeCases: string[];
    tips: string[];
  };
}

export interface TechQuestion {
  id: string;
  category: string;
  question: string;
  answer: string;
  keyPoints: string[];
  followUps: string[];
  difficulty: 'Basic' | 'Intermediate' | 'Advanced';
  frequency: number;
}

export interface HRQuestion {
  id: string;
  question: string;
  modelAnswer: string;
  aiTips: string;
  starTips: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  hiringRoles: string[];
  interviewRounds: string[];
  salaryRange: string;
  culture: string;
  difficulty: 'Moderate' | 'High' | 'Elite';
  completion: number;
  brandColor: string;
  founders?: { name: string; title: string; image: string; }[];
  focus?: string;
  motto?: string;
  hiringPhilosophy?: string;
  stats: {
    placed: string;
    avgpackage: string;
  };
  dsa: DSAQuestion[];
  technical: TechQuestion[];
  hr: HRQuestion[];
}

export const PREMIUM_COMPANIES: Company[] = [
  {
    id: 'google',
    name: 'Google',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    industry: 'Software & Cloud Technology',
    hiringRoles: ['SDE I', 'SDE II', 'Cloud Architect', 'ML Engineer'],
    interviewRounds: ['Online Assessment', '3x Technical (DSA/Systems)', 'Googliness & Leadership'],
    salaryRange: '₹32L - ₹65L+',
    brandColor: '#4285F4',
    culture: 'Googliness, Innovation, Openness, High Autonomy',
    difficulty: 'Elite',
    completion: 45,
    stats: { placed: '142', avgpackage: '34.8 LPA' },
    founders: [
      { name: 'Larry Page', title: 'Co-founder', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Larry_Page_in_the_European_Parliament%2C_17.06.2009_%28cropped_2%29.jpg/250px-Larry_Page_in_the_European_Parliament%2C_17.06.2009_%28cropped_2%29.jpg' },
      { name: 'Sergey Brin', title: 'Co-founder', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Sergey_Brin_Ted_2010_%28cropped%29.jpg/250px-Sergey_Brin_Ted_2010_%28cropped%29.jpg' }
    ],
    focus: 'Organizing the world\'s information, AI (Gemini), Cloud Computing, and Quantum Supremacy.',
    motto: '"Do the right thing" (Historically: "Don\'t be evil")',
    hiringPhilosophy: 'We look for \'Googley\' people—those who thrive in ambiguity, are intellectually humble, and possess strong general cognitive ability over deep specialized knowledge.',
    dsa: [
      {
        id: 'g-dsa-1',
        title: 'Alien Dictionary',
        difficulty: 'Hard',
        frequency: 95,
        tags: ['Graph', 'Topological Sort'],
        input: 'words = ["wrt","wrf","er","ett","rftt"]',
        output: '"wertf"',
        approach: 'Build a directed graph where each character is a node and an edge from char A to char B means A comes before B in the alien language. Then perform topological sort using DFS with cycle detection. If a cycle is found, the ordering is invalid.',
        time: 'O(C + V + E) where C is total chars in all words, V = unique chars, E = edges',
        space: 'O(V + E)',
        visualizerType: 'graph',
        code: {
          python: `def alienOrder(words):
    from collections import defaultdict, deque

    adj = defaultdict(set)
    in_degree = {c: 0 for word in words for c in word}

    for i in range(len(words) - 1):
        w1, w2 = words[i], words[i + 1]
        min_len = min(len(w1), len(w2))
        if len(w1) > len(w2) and w1[:min_len] == w2[:min_len]:
            return ""
        for j in range(min_len):
            if w1[j] != w2[j]:
                if w2[j] not in adj[w1[j]]:
                    adj[w1[j]].add(w2[j])
                    in_degree[w2[j]] += 1
                break

    queue = deque([c for c in in_degree if in_degree[c] == 0])
    order = []

    while queue:
        char = queue.popleft()
        order.append(char)
        for neighbor in adj[char]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(order) != len(in_degree):
        return ""
    return "".join(order)`,
          java: `import java.util.*;

public class Solution {
    public String alienOrder(String[] words) {
        Map<Character, Set<Character>> adj = new HashMap<>();
        Map<Character, Integer> inDegree = new HashMap<>();

        for (String word : words) {
            for (char c : word.toCharArray()) {
                adj.putIfAbsent(c, new HashSet<>());
                inDegree.putIfAbsent(c, 0);
            }
        }

        for (int i = 0; i < words.length - 1; i++) {
            String w1 = words[i], w2 = words[i + 1];
            int minLen = Math.min(w1.length(), w2.length());
            if (w1.length() > w2.length() && w1.startsWith(w2)) {
                return "";
            }
            for (int j = 0; j < minLen; j++) {
                char c1 = w1.charAt(j), c2 = w2.charAt(j);
                if (c1 != c2) {
                    if (adj.get(c1).add(c2)) {
                        inDegree.merge(c2, 1, Integer::sum);
                    }
                    break;
                }
            }
        }

        Queue<Character> queue = new LinkedList<>();
        for (var entry : inDegree.entrySet()) {
            if (entry.getValue() == 0) queue.add(entry.getKey());
        }

        StringBuilder sb = new StringBuilder();
        while (!queue.isEmpty()) {
            char c = queue.poll();
            sb.append(c);
            for (char next : adj.get(c)) {
                inDegree.merge(next, -1, Integer::sum);
                if (inDegree.get(next) == 0) queue.add(next);
            }
        }

        return sb.length() == inDegree.size() ? sb.toString() : "";
    }
}`
        },
        explanation: {
          intuition: 'Given a sorted list of words in an alien language, we infer character ordering from the first differing character between adjacent words. This gives us a directed graph. Topological sort of this graph yields the character order.',
          brute: 'Compare all pairs of words to build edges, then try brute-force permutations. Exponential time.',
          optimized: 'Compare only adjacent words to build a directed graph. Use Kahn\'s algorithm (BFS topological sort) with in-degree tracking to linearly produce the order and detect cycles.',
          dryRun: ['wrt vs wrf: first diff is t vs f, so edge t->f', 'wrf vs er: first diff is w vs e, so edge w->e', 'er vs ett: first diff is r vs t, so edge r->t', 'ett vs rftt: first diff is e vs r, so edge e->r', 'Topo sort: w -> e -> r -> t -> f = "wertf"'],
          edgeCases: ['Cycle in graph makes ordering impossible, return ""', 'Prefix word appears before longer word (invalid ordering)', 'Single character words', 'No conflicting orderings (any order valid)'],
          tips: ['Always check if a longer word appears before its prefix — that is an invalid dictionary.', 'Cycle detection is automatic in Kahn\'s: if processed count != unique characters, a cycle exists.']
        }
      },
      {
        id: 'g-dsa-2',
        title: 'Word Ladder II',
        difficulty: 'Hard',
        frequency: 88,
        tags: ['Graph', 'BFS', 'DFS'],
        input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]',
        output: '[["hit","hot","dot","dog","cog"],["hit","hot","lot","log","cog"]]',
        approach: 'First use BFS to build a DAG (adjacency list of shortest paths) from beginWord to endWord. Then use DFS on this DAG to enumerate all shortest transformation sequences. This avoids TLE that comes from doing BFS+DFS simultaneously.',
        time: 'O(N * L * 26) where N = word list size, L = word length',
        space: 'O(N * L)',
        visualizerType: 'graph',
        code: {
          python: `from collections import defaultdict, deque

def findLadders(beginWord, endWord, wordList):
    wordSet = set(wordList)
    if endWord not in wordSet:
        return []

    adj = defaultdict(list)
    visited = set()
    found = False
    queue = deque([beginWord])
    visited.add(beginWord)

    while queue and not found:
        level_size = len(queue)
        local_visited = set()
        for _ in range(level_size):
            word = queue.popleft()
            for i in range(len(word)):
                for c in 'abcdefghijklmnopqrstuvwxyz':
                    next_word = word[:i] + c + word[i+1:]
                    if next_word in wordSet:
                        if next_word == endWord:
                            found = True
                        if next_word not in visited:
                            local_visited.add(next_word)
                            queue.append(next_word)
                        adj[word].append(next_word)
        visited.update(local_visited)

    results = []

    def dfs(path, word):
        if word == endWord:
            results.append(list(path))
            return
        for next_word in adj[word]:
            path.append(next_word)
            dfs(path, next_word)
            path.pop()

    dfs([beginWord], beginWord)
    return results`,
          java: `import java.util.*;

public class Solution {
    public List<List<String>> findLadders(String beginWord, String endWord,
                                          List<String> wordList) {
        Set<String> wordSet = new HashSet<>(wordList);
        if (!wordSet.contains(endWord)) return Collections.emptyList();

        Map<String, List<String>> adj = new HashMap<>();
        Set<String> visited = new HashSet<>();
        Queue<String> queue = new LinkedList<>();
        queue.add(beginWord);
        visited.add(beginWord);
        boolean found = false;

        while (!queue.isEmpty() && !found) {
            int levelSize = queue.size();
            Set<String> localVisited = new HashSet<>();
            for (int i = 0; i < levelSize; i++) {
                String word = queue.poll();
                char[] chars = word.toCharArray();
                for (int j = 0; j < chars.length; j++) {
                    char original = chars[j];
                    for (char c = 'a'; c <= 'z'; c++) {
                        chars[j] = c;
                        String next = new String(chars);
                        if (wordSet.contains(next)) {
                            if (next.equals(endWord)) found = true;
                            if (!visited.contains(next)) {
                                localVisited.add(next);
                                queue.add(next);
                            }
                            adj.computeIfAbsent(word, k -> new ArrayList<>()).add(next);
                        }
                    }
                    chars[j] = original;
                }
            }
            visited.addAll(localVisited);
        }

        List<List<String>> results = new ArrayList<>();
        List<String> path = new ArrayList<>();
        path.add(beginWord);
        dfs(adj, endWord, beginWord, path, results);
        return results;
    }

    private void dfs(Map<String, List<String>> adj, String end,
                     String word, List<String> path,
                     List<List<String>> results) {
        if (word.equals(end)) {
            results.add(new ArrayList<>(path));
            return;
        }
        for (String next : adj.getOrDefault(word, Collections.emptyList())) {
            path.add(next);
            dfs(adj, end, next, path, results);
            path.remove(path.size() - 1);
        }
    }
}`
        },
        explanation: {
          intuition: 'BFS naturally finds shortest paths. By building the adjacency DAG level-by-level (discarding nodes already visited at previous levels), we ensure every edge in the DAG lies on some shortest path. DFS then enumerates all paths through this DAG.',
          brute: 'BFS for each path simultaneously. This explodes exponentially because the same node is visited from multiple paths, causing TLE.',
          optimized: 'Two-phase approach: BFS builds the shortest-path DAG in O(N*L*26). DFS traverses only this DAG. Visiting a node at the same BFS level from multiple parents is allowed (tracked with localVisited), but visiting from a previous level is not.',
          dryRun: ['BFS Level 0: hit', 'BFS Level 1: hot', 'BFS Level 2: dot, lot', 'BFS Level 3: dog, log', 'BFS Level 4: cog (found endWord)', 'DFS from hit: hit->hot->dot->dog->cog, hit->hot->lot->log->cog'],
          edgeCases: ['endWord not in wordList returns empty list', 'beginWord equals endWord', 'No path exists between words', 'Multiple shortest paths of same length'],
          tips: ['The key insight is using localVisited per BFS level instead of a global visited set, allowing multiple parents at the same depth.', 'Never add visited nodes to the queue, but DO add edges to the adjacency list.']
        }
      },
      {
        id: 'g-dsa-3',
        title: 'Median of Two Sorted Arrays',
        difficulty: 'Hard',
        frequency: 97,
        tags: ['Binary Search', 'Array'],
        input: 'nums1 = [1, 3], nums2 = [2]',
        output: '2.0',
        approach: 'Perform binary search on the smaller array to find a partition point. The correct partition divides the combined elements into two equal halves where every element on the left side is <= every element on the right side. We binary search for i in [0, m] such that the conditions are met.',
        time: 'O(log(min(m, n)))',
        space: 'O(1)',
        visualizerType: 'binary-search',
        code: {
          python: `def findMedianSortedArrays(nums1, nums2):
    if len(nums1) > len(nums2):
        nums1, nums2 = nums2, nums1

    m, n = len(nums1), len(nums2)
    half = (m + n + 1) // 2
    lo, hi = 0, m

    while lo <= hi:
        i = (lo + hi) // 2
        j = half - i

        left_max_1 = float('-inf') if i == 0 else nums1[i - 1]
        right_min_1 = float('inf') if i == m else nums1[i]
        left_max_2 = float('-inf') if j == 0 else nums2[j - 1]
        right_min_2 = float('inf') if j == n else nums2[j]

        if left_max_1 <= right_min_2 and left_max_2 <= right_min_1:
            if (m + n) % 2 == 1:
                return max(left_max_1, left_max_2)
            else:
                return (max(left_max_1, left_max_2) +
                        min(right_min_1, right_min_2)) / 2.0
        elif left_max_1 > right_min_2:
            hi = i - 1
        else:
            lo = i + 1

    raise ValueError("Input arrays are not sorted")`,
          java: `public class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        if (nums1.length > nums2.length) {
            int[] temp = nums1; nums1 = nums2; nums2 = temp;
        }

        int m = nums1.length, n = nums2.length;
        int half = (m + n + 1) / 2;
        int lo = 0, hi = m;

        while (lo <= hi) {
            int i = (lo + hi) / 2;
            int j = half - i;

            int leftMax1 = (i == 0) ? Integer.MIN_VALUE : nums1[i - 1];
            int rightMin1 = (i == m) ? Integer.MAX_VALUE : nums1[i];
            int leftMax2 = (j == 0) ? Integer.MIN_VALUE : nums2[j - 1];
            int rightMin2 = (j == n) ? Integer.MAX_VALUE : nums2[j];

            if (leftMax1 <= rightMin2 && leftMax2 <= rightMin1) {
                if ((m + n) % 2 == 1) {
                    return Math.max(leftMax1, leftMax2);
                } else {
                    return (Math.max(leftMax1, leftMax2) +
                            Math.min(rightMin1, rightMin2)) / 2.0;
                }
            } else if (leftMax1 > rightMin2) {
                hi = i - 1;
            } else {
                lo = i + 1;
            }
        }
        throw new IllegalArgumentException("Input arrays not sorted");
    }
}`
        },
        explanation: {
          intuition: 'We want to partition the combined sorted arrays into two equal halves. By binary searching on the smaller array, we find partition index i such that max(left) <= min(right). This gives us the median directly.',
          brute: 'Merge both arrays into one sorted array and pick the middle element. O(m+n) time.',
          optimized: 'Binary search on the smaller array partition index. We need: nums1[i-1] <= nums2[j] AND nums2[j-1] <= nums1[i]. Adjust lo/hi accordingly. O(log(min(m,n))) time.',
          dryRun: ['nums1=[1,3], nums2=[2], m=2, n=1, half=2', 'lo=0, hi=2, i=1, j=1', 'leftMax1=1, rightMin1=3, leftMax2=2, rightMin2=inf', '1<=inf and 2<=3: valid partition', 'm+n=3 odd: return max(1,2) = 2.0'],
          edgeCases: ['One array is empty', 'Both arrays have one element', 'All elements in one array are smaller than all in the other', 'Arrays of vastly different lengths'],
          tips: ['Always binary search on the smaller array to guarantee j >= 0.', 'Use Integer.MIN_VALUE/MAX_VALUE for edge partition boundaries instead of null checks.']
        }
      },
      {
        id: 'g-dsa-4',
        title: 'Trapping Rain Water',
        difficulty: 'Hard',
        frequency: 96,
        tags: ['Two Pointers', 'Array'],
        input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
        output: '6',
        approach: 'Use two pointers left and right starting from both ends. Track left_max and right_max as the maximum height seen from each side. At each step, move the pointer with the smaller max height inward. Water trapped at each position = max_height - height[pos].',
        time: 'O(N)',
        space: 'O(1)',
        visualizerType: 'rain-water',
        code: {
          python: `def trap(height):
    if not height:
        return 0

    left, right = 0, len(height) - 1
    left_max, right_max = height[left], height[right]
    water = 0

    while left < right:
        if left_max < right_max:
            left += 1
            left_max = max(left_max, height[left])
            water += left_max - height[left]
        else:
            right -= 1
            right_max = max(right_max, height[right])
            water += right_max - height[right]

    return water`,
          java: `public class Solution {
    public int trap(int[] height) {
        if (height == null || height.length == 0) return 0;

        int left = 0, right = height.length - 1;
        int leftMax = height[left], rightMax = height[right];
        int water = 0;

        while (left < right) {
            if (leftMax < rightMax) {
                left++;
                leftMax = Math.max(leftMax, height[left]);
                water += leftMax - height[left];
            } else {
                right--;
                rightMax = Math.max(rightMax, height[right]);
                water += rightMax - height[right];
            }
        }
        return water;
    }
}`
        },
        explanation: {
          intuition: 'Water at any position is bounded by the shorter of the maximum heights to its left and right. By using two pointers that converge inward, tracking left_max and right_max, we can compute trapped water in a single pass without storing arrays.',
          brute: 'For each position, scan left to find max_left and scan right to find max_right. O(N^2) time, O(1) space.',
          optimized: 'Two pointers with running max values. The key insight: if left_max < right_max, then the water at position left is determined by left_max (since some bar to the right is at least right_max >= left_max). So we can safely process left. O(N) time, O(1) space.',
          dryRun: ['left=0(right=11): left_max=0<right_max=1, process left', 'left=1(right=11): left_max=1, water+=1-1=0', 'left=2(right=11): left_max=1, water+=1-0=1 (trapped)', 'left=3(right=11): left_max=2, water+=2-2=0', 'Continuing until left meets right, total=6'],
          edgeCases: ['Empty array returns 0', 'Strictly increasing or decreasing arrays trap 0 water', 'All same height bars trap 0 water', 'Plateau heights at the edges'],
          tips: ['The two-pointer approach works because at each step, we are guaranteed that the water at the processed position is correct.', 'Never add negative water — the max tracking ensures left_max >= height[left].']
        }
      },
      {
        id: 'g-dsa-5',
        title: 'Longest Increasing Path in a Matrix',
        difficulty: 'Hard',
        frequency: 85,
        tags: ['DFS', 'Memoization', 'Matrix'],
        input: 'matrix = [[9,9,4],[6,6,8],[2,1,1]]',
        output: '4 (path: 1->2->6->9)',
        approach: 'For each cell, run DFS to find the longest increasing path starting from that cell. Memoize the result for each cell to avoid recomputation. At each cell, explore all 4 directions and take the maximum among valid increasing neighbors + 1.',
        time: 'O(M * N) where M and N are matrix dimensions',
        space: 'O(M * N) for memoization table',
        visualizerType: 'graph',
        code: {
          python: `def longestIncreasingPath(matrix):
    if not matrix or not matrix[0]:
        return 0

    rows, cols = len(matrix), len(matrix[0])
    memo = [[0] * cols for _ in range(rows)]

    def dfs(r, c, prev_val):
        if (r < 0 or r >= rows or c < 0 or c >= cols
                or matrix[r][c] <= prev_val):
            return 0
        if memo[r][c] != 0:
            return memo[r][c]

        max_path = 0
        directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]
        for dr, dc in directions:
            max_path = max(max_path, dfs(r + dr, c + dc, matrix[r][c]))

        memo[r][c] = max_path + 1
        return memo[r][c]

    longest = 0
    for r in range(rows):
        for c in range(cols):
            longest = max(longest, dfs(r, c, float('-inf')))

    return longest`,
          java: `public class Solution {
    private int rows, cols;
    private int[][] memo;
    private int[][] matrix;
    private int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};

    public int longestIncreasingPath(int[][] matrix) {
        if (matrix == null || matrix.length == 0) return 0;
        this.matrix = matrix;
        rows = matrix.length;
        cols = matrix[0].length;
        memo = new int[rows][cols];

        int longest = 0;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                longest = Math.max(longest, dfs(r, c, Integer.MIN_VALUE));
            }
        }
        return longest;
    }

    private int dfs(int r, int c, int prevVal) {
        if (r < 0 || r >= rows || c < 0 || c >= cols
                || matrix[r][c] <= prevVal) return 0;
        if (memo[r][c] != 0) return memo[r][c];

        int maxPath = 0;
        for (int[] d : dirs) {
            maxPath = Math.max(maxPath,
                    dfs(r + d[0], c + d[1], matrix[r][c]));
        }
        memo[r][c] = maxPath + 1;
        return memo[r][c];
    }
}`
        },
        explanation: {
          intuition: 'Every cell could be the start of a longest path. DFS explores all increasing paths. Without memoization, the same cells are recomputed many times. With memoization, each cell is computed exactly once, yielding O(M*N) complexity.',
          brute: 'Run DFS from every cell without memoization. Exponential time due to overlapping subproblems.',
          optimized: 'DFS + Memoization (top-down DP). Since each cell value is unique, the graph is a DAG (no cycles), making memoization safe. Each cell computes its longest path once. O(M*N) time and space.',
          dryRun: ['Start at (2,0) val=1: explore neighbors', '1->2 (r1,c0): 2->6 (r1,c0)->9 (r0,c0): path length 4', 'Memo[(2,0)]=4, Memo[(2,1)]=3, Memo[(1,0)]=2', 'Any cell reusing these memoized values avoids recomputation'],
          edgeCases: ['Empty matrix', 'Single cell matrix returns 1', 'All equal values (no increasing path, returns 1)', 'Matrix with only decreasing paths from every start'],
          tips: ['The memoization is valid because the path is strictly increasing — no cycles are possible.', 'Using a separate memo array is cleaner than modifying the input matrix in-place.']
        }
      },
      {
        id: 'g-dsa-6',
        title: 'Merge k Sorted Lists',
        difficulty: 'Hard',
        frequency: 93,
        tags: ['Heap', 'Linked List', 'Divide and Conquer'],
        input: 'lists = [[1,4,5],[1,3,4],[2,6]]',
        output: '[1,1,2,3,4,4,5,6]',
        approach: 'Use a min-heap (priority queue) initialized with the head of each list. Extract the minimum, add it to the result, and if the extracted node has a next node, push it into the heap. This processes all k lists simultaneously in sorted order.',
        time: 'O(N log k) where N is total nodes, k is number of lists',
        space: 'O(k) for the heap',
        visualizerType: 'graph',
        code: {
          python: `import heapq

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def mergeKLists(lists):
    heap = []
    for i, node in enumerate(lists):
        if node:
            heapq.heappush(heap, (node.val, i, node))

    dummy = ListNode(0)
    current = dummy

    while heap:
        val, idx, node = heapq.heappop(heap)
        current.next = node
        current = current.next

        if node.next:
            heapq.heappush(heap, (node.next.val, idx, node.next))

    return dummy.next`,
          java: `import java.util.*;

public class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        PriorityQueue<ListNode> pq = new PriorityQueue<>(
            Comparator.comparingInt(n -> n.val)
        );

        for (ListNode node : lists) {
            if (node != null) pq.add(node);
        }

        ListNode dummy = new ListNode(0);
        ListNode current = dummy;

        while (!pq.isEmpty()) {
            ListNode node = pq.poll();
            current.next = node;
            current = current.next;

            if (node.next != null) {
                pq.add(node.next);
            }
        }

        return dummy.next;
    }
}`
        },
        explanation: {
          intuition: 'A min-heap always gives us the smallest element across all k lists in O(log k). By maintaining one pointer per list in the heap, we efficiently merge without needing to compare all k elements each time.',
          brute: 'Compare heads of all k lists each time, pick min. O(N*k) time where N is total nodes.',
          optimized: 'Min-heap of size k. Each insert/extract is O(log k). We do this N times total. O(N log k) time, O(k) space for the heap.',
          dryRun: ['Initial heap: [(1,0,1->4->5), (1,1,1->3->4), (2,2,2->6)]', 'Pop (1,0,...): result=1, push (4,0,4->5)', 'Pop (1,1,...): result=1->1, push (3,1,3->4)', 'Pop (2,2,...): result=1->1->2, push (6,2,6)', 'Pop (3,1,...): result=1->1->2->3, push (4,1,4)', 'Continue until heap is empty'],
          edgeCases: ['Some or all lists are empty', 'Single list', 'Lists of vastly different lengths', 'All lists have identical values'],
          tips: ['The tuple (val, idx, node) uses idx as tiebreaker to avoid comparing ListNode objects in Python.', 'In Java, use Comparator.comparingInt instead of Comparable to avoid needing a custom compareTo.']
        }
      },
      {
        id: 'g-dsa-7',
        title: 'Course Schedule II',
        difficulty: 'Medium',
        frequency: 91,
        tags: ['Topological Sort', 'Graph', 'BFS'],
        input: 'numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]',
        output: '[0,1,2,3] or [0,2,1,3]',
        approach: 'Use Kahn\'s algorithm for topological sorting. Build an adjacency list and in-degree array. Start BFS with all nodes having in-degree 0. Process nodes level by level, decrementing in-degrees of neighbors. If processed count equals numCourses, return the order; otherwise a cycle exists.',
        time: 'O(V + E) where V = numCourses, E = prerequisites',
        space: 'O(V + E)',
        visualizerType: 'graph',
        code: {
          python: `from collections import deque

def findOrder(numCourses, prerequisites):
    adj = [[] for _ in range(numCourses)]
    in_degree = [0] * numCourses

    for course, prereq in prerequisites:
        adj[prereq].append(course)
        in_degree[course] += 1

    queue = deque()
    for i in range(numCourses):
        if in_degree[i] == 0:
            queue.append(i)

    order = []

    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in adj[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(order) == numCourses:
        return order
    return []`,
          java: `import java.util.*;

public class Solution {
    public int[] findOrder(int numCourses, int[][] prerequisites) {
        List<List<Integer>> adj = new ArrayList<>();
        int[] inDegree = new int[numCourses];

        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());

        for (int[] p : prerequisites) {
            adj.get(p[1]).add(p[0]);
            inDegree[p[0]]++;
        }

        Queue<Integer> queue = new LinkedList<>();
        for (int i = 0; i < numCourses; i++) {
            if (inDegree[i] == 0) queue.add(i);
        }

        int[] order = new int[numCourses];
        int idx = 0;

        while (!queue.isEmpty()) {
            int node = queue.poll();
            order[idx++] = node;
            for (int next : adj.get(node)) {
                if (--inDegree[next] == 0) queue.add(next);
            }
        }

        return idx == numCourses ? order : new int[0];
    }
}`
        },
        explanation: {
          intuition: 'Topological sort on a DAG gives a valid ordering where all prerequisites come before their dependents. Kahn\'s algorithm naturally handles this using BFS and in-degree tracking.',
          brute: 'DFS-based topological sort with cycle detection using WHITE/GRAY/BLACK coloring. More complex to implement.',
          optimized: 'Kahn\'s algorithm (BFS-based topo sort). Simpler, detects cycles automatically, and produces a valid ordering. O(V+E) time and space.',
          dryRun: ['In-degree: [0,1,1,2]', 'Queue: [0], process 0: decrement 1 and 2', 'Queue: [1,2], process 1: decrement 3', 'Queue: [2,3], process 2: decrement 3', 'Queue: [3], process 3: done', 'Order: [0,1,2,3], count=4=numCourses'],
          edgeCases: ['Cycle exists (prerequisites form a loop) — return empty array', 'No prerequisites (all courses can be taken in any order)', 'Single course with no prerequisites', 'Disconnected components'],
          tips: ['Always check if the final order length equals numCourses to detect cycles.', 'The order array can be returned directly since Kahn\'s guarantees a valid topological order when one exists.']
        }
      },
      {
        id: 'g-dsa-8',
        title: 'Best Time to Buy and Sell Stock IV',
        difficulty: 'Hard',
        frequency: 82,
        tags: ['Dynamic Programming', 'Array'],
        input: 'k = 2, prices = [3,2,6,5,0,3]',
        output: '7 (buy@2, sell@6 + buy@0, sell@3)',
        approach: 'Define dp[i][j] as max profit using at most j transactions up to day i. For each day and each transaction count, either skip the day or sell on this day (finding the optimal buy point). Optimize space by tracking the best buy value for each transaction level. When k >= n/2, it becomes unlimited transactions — use greedy.',
        time: 'O(n * k)',
        space: 'O(k)',
        visualizerType: 'dp',
        code: {
          python: `def maxProfit(k, prices):
    n = len(prices)
    if n <= 1 or k == 0:
        return 0

    if k >= n // 2:
        return sum(max(0, prices[i+1] - prices[i]) for i in range(n - 1))

    buy = [float('-inf')] * (k + 1)
    sell = [0] * (k + 1)

    for price in prices:
        for j in range(1, k + 1):
            buy[j] = max(buy[j], sell[j - 1] - price)
            sell[j] = max(sell[j], buy[j] + price)

    return sell[k]`,
          java: `public class Solution {
    public int maxProfit(int k, int[] prices) {
        int n = prices.length;
        if (n <= 1 || k == 0) return 0;

        if (k >= n / 2) {
            int profit = 0;
            for (int i = 1; i < n; i++) {
                if (prices[i] > prices[i - 1]) {
                    profit += prices[i] - prices[i - 1];
                }
            }
            return profit;
        }

        int[] buy = new int[k + 1];
        int[] sell = new int[k + 1];
        Arrays.fill(buy, Integer.MIN_VALUE);

        for (int price : prices) {
            for (int j = 1; j <= k; j++) {
                buy[j] = Math.max(buy[j], sell[j - 1] - price);
                sell[j] = Math.max(sell[j], buy[j] + price);
            }
        }
        return sell[k];
    }
}`
        },
        explanation: {
          intuition: 'For each transaction j, we track the best "buy" state (maximum value of having bought a stock for the j-th transaction) and the best "sell" state. On each day, we update both states. The greedy optimization handles the case where k is large enough to allow unlimited transactions.',
          brute: '3D DP: dp[day][transactions][holding]. O(n * k * 2) time and space.',
          optimized: 'Collapse the holding dimension by maintaining buy[j] and sell[j] arrays. Each day updates all k transaction levels. When k >= n/2, every profitable trade can be captured greedily. O(n*k) time, O(k) space.',
          dryRun: ['prices=[3,2,6,5,0,3], k=2', 'Day price=3: buy[1]=-3, sell[1]=0', 'Day price=2: buy[1]=-2, sell[1]=0', 'Day price=6: buy[1]=-2, sell[1]=4, buy[2]=-2, sell[2]=4', 'Day price=5: buy[2]=-2, sell[2]=4', 'Day price=0: buy[1]=4, sell[1]=4, buy[2]=4, sell[2]=4', 'Day price=3: sell[2]=7', 'Result: sell[2]=7'],
          edgeCases: ['k=0 returns 0', 'k=1 is single transaction Stock I', 'k >= n/2 triggers greedy', 'Strictly decreasing prices return 0', 'Single price returns 0'],
          tips: ['The greedy shortcut is critical for large k values — without it, you get TLE on test cases like k=10000 with n=10000.', 'buy[j] = max(buy[j], sell[j-1] - price) means: either keep previous buy or buy now using profit from j-1 transactions.']
        }
      }
    ],
    technical: [
      {
        id: 'g-t-1',
        category: 'System Design',
        difficulty: 'Advanced',
        frequency: 98,
        question: 'Design a Google Maps navigation system that provides real-time turn-by-turn directions for millions of concurrent users.',
        answer: 'The system needs three major components: (1) Graph representation of the road network where intersections are nodes and road segments are edges weighted by distance/travel time. Use contraction hierarchies or hierarchical graph partitioning to enable fast long-distance queries. (2) Real-time traffic ingestion via probe data from phones/GPS devices, aggregated into edge weights using exponential moving averages. Store in a distributed in-memory cache (like Bigtable) for sub-millisecond reads. (3) Route computation uses A* with landmarks (ALT algorithm) or contraction hierarchies for bidirectional search, achieving sub-second response times even for cross-country routes. The client periodically re-requests the route to account for traffic changes. Write the route to a persistent store for ETA tracking and analytics.',
        keyPoints: ['Graph Algorithms (Dijkstra, A*)', 'Contraction Hierarchies', 'Real-time Traffic Ingestion', 'Hierarchical Partitioning', 'Probe Data Aggregation'],
        followUps: ['How do you handle road closures or accidents in real-time?', 'How would you scale this to support pedestrian and cycling routes simultaneously?']
      },
      {
        id: 'g-t-2',
        category: 'System Design',
        difficulty: 'Advanced',
        frequency: 96,
        question: 'Design a YouTube recommendation system that personalizes video suggestions for billions of users.',
        answer: 'Architecture has three layers: (1) Candidate Generation — use collaborative filtering (user-item matrix factorization), content-based features (video embeddings from metadata, audio, thumbnails via CNNs), and graph-based signals (subscriptions, watch history). Approximate Nearest Neighbor (ANN) indexes like ScaNN retrieve top thousands of candidates from millions of videos. (2) Ranking — a deep neural network scores each candidate using features like watch history length, time of day, user demographics, video freshness, and engagement signals (likes, shares). Output a predicted watch probability and expected watch time. (3) Re-ranking — apply diversity constraints (avoid consecutive videos from same channel), freshness boosts, and policy filters. The system uses TensorFlow Extended (TFX) pipelines for training, with training data generated from impression logs. A/B testing evaluates candidate models against engagement metrics.',
        keyPoints: ['Collaborative Filtering', 'Content-Based Filtering', 'ANN (ScaNN)', 'Deep Ranking Models', 'A/B Testing Framework'],
        followUps: ['How do you handle the cold-start problem for new users or new videos?', 'How do you prevent filter bubbles and ensure content diversity?']
      },
      {
        id: 'g-t-3',
        category: 'System Design',
        difficulty: 'Advanced',
        frequency: 94,
        question: 'Design the Google Search autocomplete (typeahead) system.',
        answer: 'Architecture: (1) Trie-based prefix matching — each node in the trie stores top-10 completions ranked by frequency. The trie is distributed across shards by prefix range. (2) Query logging pipeline — every search query is streamed via Kafka into a MapReduce/Dataflow job that updates prefix frequencies and recomputes top-k lists. A background process periodically rebuilds the trie shards. (3) Serving layer — the user types a prefix, the frontend sends it to a load balancer which routes to the appropriate trie shard. The shard returns top-10 completions in <50ms. Results are cached at the CDN layer for popular prefixes. (4) Personalization — blend global popular completions with user-specific history using a weighted score. Filter offensive/blocked queries using a separate policy filter.',
        keyPoints: ['Trie Data Structure', 'Prefix Frequency Tracking', 'Distributed Sharding', 'CDN Caching', 'Real-time Query Logging'],
        followUps: ['How do you handle trending queries that spike suddenly?', 'How would you implement multilingual autocomplete?']
      },
      {
        id: 'g-t-4',
        category: 'System Design',
        difficulty: 'Advanced',
        frequency: 91,
        question: 'Design a distributed URL shortener like bit.ly that handles billions of URLs.',
        answer: 'Core design: (1) ID generation — use Base62 encoding of auto-incrementing IDs from a distributed ID generator (Snowflake-style or a dedicated ZooKeeper-backed counter). Alternatively, use MD5/SHA256 of the long URL and take the first 7 characters. (2) Storage — use a distributed KV store (Bigtable or Cassandra). Key = short URL code, Value = long URL + metadata (user, creation time, click count). Partition by hash of the short code for even distribution. (3) Read path — lookup is a single KV read, serving millions of QPS with in-memory caching (Memcached/Redis) for hot URLs. (4) Write path — generate unique ID, store mapping. Use a write-through cache. (5) Analytics — redirect clicks through a tracking service that logs to Kafka, processed by batch (BigQuery) and streaming (Dataflow) pipelines for real-time dashboards. (6) Custom aliases — allow user-provided short codes with uniqueness validation.',
        keyPoints: ['Base62 Encoding', 'Distributed ID Generation', 'KV Store Partitioning', 'Cache-Aside Pattern', 'Click Analytics Pipeline'],
        followUps: ['How do you prevent abuse (spam, phishing) on the shortener?', 'How do you handle URL expiration and cleanup?']
      },
      {
        id: 'g-t-5',
        category: 'Language / Core',
        difficulty: 'Advanced',
        frequency: 87,
        question: 'Explain MapReduce and how Google uses it for large-scale data processing.',
        answer: 'MapReduce is a programming model for parallel processing of massive datasets across commodity machines. The Map phase takes input key-value pairs and produces intermediate key-value pairs (map function applied independently to each input splits). The Shuffle phase groups all intermediate values by key and sends them to the same reducer. The Reduce phase processes each group of values for a key and produces output key-value pairs. Google pioneered this with GFS (Google File System) for distributed storage and MapReduce for computation. Example: word count — Map emits (word, 1) for each word, Reduce sums all values for each word. Fault tolerance is achieved by re-executing failed map/reduce tasks on other machines. The master node tracks task status and reassigns on failure. Modern successors include Dataflow (unified batch+stream) and Spanner for structured data.',
        keyPoints: ['Map Phase (parallel)', 'Shuffle & Sort Phase', 'Reduce Phase (aggregation)', 'Fault Tolerance via Re-execution', 'GFS Integration'],
        followUps: ['What are the limitations of MapReduce that led to Spark and Dataflow?', 'How does MapReduce handle data skew?']
      },
      {
        id: 'g-t-6',
        category: 'Language / Core',
        difficulty: 'Intermediate',
        frequency: 89,
        question: 'Explain the CAP theorem and its implications for Google distributed systems.',
        answer: 'CAP theorem states that a distributed system can provide at most two of three guarantees: Consistency (every read receives the most recent write), Availability (every request receives a response), and Partition Tolerance (system continues operating despite network partitions). Since network partitions are inevitable in distributed systems, the real choice is between CP and AP. Google examples: Spanner is CP (uses TrueTime for external consistency, sacrifices availability during partitions via Paxos). Bigtable is CP (strongly consistent reads within a tablet). Megastore is CP with high availability via cross-datacenter replication. DynamoDB-style systems are AP (eventual consistency, always available). In practice, Google uses hybrid approaches: strong consistency for financial/identity data, eventual consistency for analytics and caching layers.',
        keyPoints: ['Consistency, Availability, Partition Tolerance', 'CP vs AP Systems', 'Network Partition Inevitability', 'Google Spanner (CP)', 'Hybrid Consistency Models'],
        followUps: ['How does Google Spanner achieve external consistency with TrueTime?', 'When would you choose AP over CP in a Google-scale system?']
      },
      {
        id: 'g-t-7',
        category: 'DevOps',
        difficulty: 'Advanced',
        frequency: 85,
        question: 'How does Google handle CI/CD at scale for its monorepo with billions of lines of code?',
        answer: 'Google uses a monorepo (piper) with custom tooling: (1) Build system — Bazel (Blaze internally) provides hermetic, reproducible builds with fine-grained dependency tracking. Only affected targets are rebuilt. (2) CI pipeline — every commit triggers a presubmit that builds and tests affected targets. Results are cached; unchanged targets skip rebuild entirely. (3) Large-scale testing — TAP (Test Automation Platform) distributes tests across thousands of machines. Test results feed into a flakiness detection system that quarantines flaky tests. (4) Deployment — Spinnaker-like pipeline with canary releases. Changes roll out incrementally across datacenters. Automated rollback triggers on error rate spikes. (5) Code review — every change requires LGTM from a code owner. Critique (internal tool) integrates with build/test status. (6) Dependency management — versioned dependencies with hermetic builds prevent "dependency hell."',
        keyPoints: ['Bazel / Hermetic Builds', 'Monorepo Strategy', 'Incremental Builds', 'Flaky Test Detection', 'Canary Deployments'],
        followUps: ['How does Bazel achieve hermetic builds?', 'What happens when a breaking change slips into the monorepo?']
      },
      {
        id: 'g-t-8',
        category: 'Security',
        difficulty: 'Advanced',
        frequency: 86,
        question: 'How does Google protect its infrastructure and services against DDoS attacks?',
        answer: 'Google employs multi-layered DDoS defense: (1) Edge layer — Cloud Armor (formerly Google Shield) sits at the CDN edge. It uses ML-based anomaly detection to identify volumetric attacks (SYN floods, UDP amplification) and application-layer attacks (HTTP floods, slowloris). Rate limiting and IP reputation filtering at the edge. (2) Network layer — Google\'s global network fabric (Andromeda) absorbs volumetric attacks via anycast IP distribution across 30+ datacenters. Traffic is scrubbed at the nearest edge. (3) Application layer — BeyondCorp zero-trust architecture means every request is authenticated regardless of origin. Web Application Firewall (WAF) rules block common attack patterns. (4) Infrastructure — Borg (container orchestration) auto-scales services to handle legitimate traffic surges. Capacity headroom is maintained for burst absorption. (5) Response — automated systems detect attacks in <1 minute and activate mitigation. Human SRE oversight for novel attack patterns. Post-incident reviews improve detection models.',
        keyPoints: ['Cloud Armor / Edge Filtering', 'ML-based Anomaly Detection', 'Anycast Absorption', 'BeyondCorp Zero Trust', 'Auto-scaling with Borg'],
        followUps: ['How do you distinguish a DDoS attack from a legitimate traffic spike?', 'How does Google handle application-layer (Layer 7) DDoS differently from volumetric attacks?']
      }
    ],
    hr: [
      {
        id: 'g-hr-1',
        question: 'Tell me about a time you influenced a decision without having direct authority over the team.',
        modelAnswer: 'During my internship, the team was about to ship a feature using a synchronous REST API for a real-time dashboard, which I identified as a bottleneck under high load. Without authority, I built a quick proof-of-concept using WebSockets that demonstrated a 10x reduction in latency. I presented the data — latency benchmarks, cost projections, and scalability limits — in a team meeting. The tech lead agreed, and we pivoted. The feature shipped on time with significantly better performance.',
        aiTips: 'Focus on data-driven persuasion and building consensus rather than authority. Google values "influence without authority" as a core leadership signal.',
        starTips: {
          situation: 'A team was about to make a suboptimal architectural decision for a real-time feature.',
          task: 'I needed to convince the team to change direction without being the decision-maker.',
          action: 'I built a working prototype with benchmarks and presented a data-driven comparison to the team.',
          result: 'The team adopted the better approach, resulting in 10x latency improvement for the dashboard.'
        }
      },
      {
        id: 'g-hr-2',
        question: 'Tell me about a time you had to make an important decision with ambiguous or incomplete information.',
        modelAnswer: 'I was leading the migration of a legacy authentication service to OAuth 2.0 with a tight deadline and no complete documentation for the legacy system. I identified the critical integration points by analyzing network traffic logs, created a minimal viable migration plan that covered the most common auth flows first, and shipped a phased rollout. I set up monitoring for edge cases and iteratively fixed gaps discovered in production. The migration completed two weeks early with zero downtime.',
        aiTips: 'Google wants to see intellectual humility combined with bias-for-action. Acknowledge what you didn\'t know, show how you de-risked the decision, and iterate.',
        starTips: {
          situation: 'A critical service migration with incomplete documentation and a hard deadline.',
          task: 'Migrate the authentication system without disrupting production traffic.',
          action: 'Analyzed traffic patterns to identify critical paths, shipped a phased migration with monitoring, and iterated on gaps.',
          result: 'Completed migration two weeks early with zero downtime and full coverage of auth flows.'
        }
      },
      {
        id: 'g-hr-3',
        question: 'Describe a time you disagreed with your manager or a senior engineer. How did you handle it?',
        modelAnswer: 'My manager wanted to use a third-party payment provider to save development time, but I believed the vendor\'s API limitations would cause issues at scale. Instead of just disagreeing, I wrote a one-page design document outlining the limitations: rate limits, data portability concerns, and a cost analysis over 3 years showing the vendor would be more expensive beyond 100k transactions/month. I presented this respectfully and proposed a hybrid approach — use the vendor initially but build abstraction layers for future migration. My manager采纳了 the hybrid approach, and 18 months later we migrated to our own implementation exactly as I\'d anticipated.',
        aiTips: 'Show respect for the senior person\'s perspective while demonstrating you can advocate for your position with evidence. Google values constructive disagreement.',
        starTips: {
          situation: 'My manager proposed using a third-party service that I believed had scalability limitations.',
          task: 'Advocate for a better technical approach while maintaining a positive working relationship.',
          action: 'Wrote a design document with cost analysis and proposed a hybrid approach that addressed both concerns.',
          result: 'Adopted the hybrid approach; 18 months later migrated seamlessly to a custom solution as predicted.'
        }
      },
      {
        id: 'g-hr-4',
        question: 'Tell me about your biggest professional failure. What did you learn from it?',
        modelAnswer: 'During a hackathon, I insisted on building the backend with a database technology (Cassandra) I hadn\'t used before, instead of sticking with PostgreSQL which I knew well. Halfway through the 24-hour sprint, we hit severe configuration issues and lost 6 hours debugging infrastructure instead of building features. We missed the submission deadline. The lesson was profound: novelty is valuable but must be weighed against deadline risk. Since then, I always validate unfamiliar technology choices against time constraints and have a fallback plan. I now mentor juniors on this principle — prototype with what you know, innovate when you have margin.',
        aiTips: 'Take full ownership without deflecting. Focus on the systemic lesson and how it changed your future behavior. Google values extreme ownership and learning velocity.',
        starTips: {
          situation: 'I was leading a hackathon team with a 24-hour deadline.',
          task: 'Deliver a working MVP while pushing technical boundaries.',
          action: 'I chose an unfamiliar database technology without a fallback plan, costing us 6 hours of debugging.',
          result: 'We missed the deadline. I learned to balance innovation with deadline risk and now always have a fallback plan.'
        }
      },
      {
        id: 'g-hr-5',
        question: 'How do you handle a situation where everything on your plate feels urgent and you have to prioritize?',
        modelAnswer: 'During a critical sprint, I had three competing priorities: a production P1 bug affecting 10% of users, a feature deadline for a major client in 3 days, and tech debt that was blocking another team. I created a quick impact/effort matrix. The P1 bug had the highest impact-to-effort ratio — I fixed it in 2 hours. Then I scoped the client feature to an MVP that met their core requirement, deferring non-critical polish. For the tech debt, I delegated the fix to a junior engineer I mentored, providing a design doc and review. All three were resolved by end of week.',
        aiTips: 'Demonstrate structured prioritization under pressure. Google values clarity of thinking and the ability to communicate trade-offs to stakeholders.',
        starTips: {
          situation: 'Three high-priority items competing for limited time during a critical sprint.',
          task: 'Resolve all three without dropping any commitment.',
          action: 'Used impact/effort analysis to sequence work, scoped the feature to MVP, and delegated tech debt with support.',
          result: 'All three items resolved by end of week with zero dropped commitments.'
        }
      },
      {
        id: 'g-hr-6',
        question: 'Tell me about a time you made a decision with incomplete information that turned out well.',
        modelAnswer: 'Our team was deciding between two caching architectures for a new service. We had 1 week to decide but full performance data wouldn\'t be available for 3 weeks. I analyzed the failure modes of each option, assessed the reversibility (one was much easier to migrate away from), and chose the safer option with a clear migration path. I set up A/B testing infrastructure so we could validate the decision with production traffic within days. The decision proved correct — the chosen architecture handled 3x the expected load — and the migration path was never needed, but having it gave the team confidence.',
        aiTips: 'Show how you de-risk decisions by focusing on reversibility and setting up fast feedback loops. Google values decisiveness with intellectual humility.',
        starTips: {
          situation: 'A critical architecture decision with incomplete performance data and a tight deadline.',
          task: 'Make a decision that balances speed of execution with reversibility.',
          action: 'Analyzed failure modes and reversibility, chose the safer option, and set up A/B testing for fast validation.',
          result: 'The decision was correct; the architecture handled 3x expected load. The migration path was never needed but reduced team anxiety.'
        }
      },
      {
        id: 'g-hr-7',
        question: 'How do you approach mentoring junior engineers?',
        modelAnswer: 'I follow a structured approach: first, I understand their current skill level and goals through a 1:1. Then I assign progressively challenging tasks — starting with well-scoped bug fixes, moving to feature implementation, and eventually design ownership. For each task, I provide a design doc template and require them to write it before coding. I review code with a focus on teaching (explaining the "why" behind comments), not just correctness. I schedule weekly 30-min 1:1s where they drive the agenda. One mentee went from struggling with basic debugging to independently designing a microservice in 6 months using this approach.',
        aiTips: 'Show empathy, structured growth plans, and investment in others\' success. Google values "building those around you" as a leadership indicator.',
        starTips: {
          situation: 'A junior engineer joined the team struggling with debugging and system design.',
          task: 'Help them grow into an independent contributor capable of owning features end-to-end.',
          action: 'Created a structured growth plan with progressive task complexity, code review teaching sessions, and weekly 1:1s.',
          result: 'Within 6 months, the mentee independently designed and shipped a microservice, earning a strong performance review.'
        }
      },
      {
        id: 'g-hr-8',
        question: 'Why do you want to work at Google specifically?',
        modelAnswer: 'Three reasons. First, scale — I want to work on problems that affect billions of users. My current projects impact thousands; Google is the ultimate test of building at scale. Second, engineering culture — Google\'s emphasis on code review, testing, and documentation is legendary. I thrive in environments that prioritize engineering excellence over speed. Third, the specific challenge of Google Cloud and AI infrastructure — I\'m deeply interested in distributed systems and ML infrastructure, and Google is where these converge at the highest level. I\'ve been following the Spanner and Zanzibar papers closely, and I want to contribute to building the next generation of these systems.',
        aiTips: 'Be specific about what Google does that other companies don\'t. Reference specific projects, papers, or technical challenges. Avoid generic answers like "great company."',
        starTips: {
          situation: 'I am at a career inflection point where I want to maximize my impact as an engineer.',
          task: 'Find a company where I can work on hard distributed systems problems at global scale.',
          action: 'Researched Google\'s specific technical challenges (Spanner, Zanzibar, Cloud infrastructure) and aligned my skills and interests.',
          result: 'Google offers the unique combination of scale, engineering culture, and technical depth that matches my career goals.'
        }
      }
    ]
  },
  {
    id: 'amazon',
    name: 'Amazon',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    industry: 'E-commerce & Cloud Computing (AWS)',
    hiringRoles: ['SDE I', 'Cloud Support Associate', 'Data Engineer'],
    interviewRounds: ['Online Assessment', 'Technical Coding Screen', 'Onsite Bar Raiser (LP-focused)'],
    salaryRange: '₹28L - ₹50L',
    brandColor: '#FF9900',
    culture: 'Customer Obsession, Frugality, Bias for Action, Ownership',
    difficulty: 'High',
    completion: 12,
    stats: { placed: '89', avgpackage: '28.5 LPA' },
    founders: [
      { name: 'Jeff Bezos', title: 'Founder', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Jeff_Bezos_visits_the_Robot_Co-op_in_2005.jpg/250px-Jeff_Bezos_visits_the_Robot_Co-op_in_2005.jpg' }
    ],
    focus: 'Global E-commerce dominance, AWS infrastructure, and widespread AI integration.',
    motto: '"Work Hard. Have Fun. Make History."',
    hiringPhilosophy: 'Every hire must raise the bar. We index heavily on our 16 Leadership Principles, evaluated via behavioral STAR methodology.',
    dsa: [
      {
        id: 'amz-dsa-1',
        title: 'LRU Cache',
        difficulty: 'Medium',
        frequency: 97,
        tags: ['Hash Map', 'Linked List', 'Design'],
        input: 'capacity = 2\nput(1, 1)\nput(2, 2)\nget(1) → 1\nput(3, 3) → evicts key 2\nget(2) → -1\nput(4, 4) → evicts key 1\nget(1) → -1\nget(3) → 3\nget(4) → 4',
        output: 'Operations execute in O(1) time. Eviction removes least recently used item.',
        approach: 'Use a HashMap for O(1) key lookup paired with a doubly linked list for O(1) insertion/deletion to maintain access order. On every get/put, move the node to the tail (most recent). On capacity overflow, remove from head (least recent).',
        time: 'O(1) for both get and put',
        space: 'O(capacity)',
        visualizerType: 'linked-list',
        code: {
          python: `class Node:
    def __init__(self, key=0, val=0):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.cache = {}
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_to_tail(self, node):
        node.prev = self.tail.prev
        node.next = self.tail
        self.tail.prev.next = node
        self.tail.prev = node

    def get(self, key):
        if key in self.cache:
            node = self.cache[key]
            self._remove(node)
            self._add_to_tail(node)
            return node.val
        return -1

    def put(self, key, value):
        if key in self.cache:
            self._remove(self.cache[key])
        node = Node(key, value)
        self.cache[key] = node
        self._add_to_tail(node)
        if len(self.cache) > self.cap:
            lru = self.head.next
            self._remove(lru)
            del self.cache[lru.key]`,
          java: `class Node {
    int key, val;
    Node prev, next;
    Node(int k, int v) { key = k; val = v; }
}

class LRUCache {
    private int cap;
    private Map<Integer, Node> map = new HashMap<>();
    private Node head = new Node(0, 0), tail = new Node(0, 0);

    public LRUCache(int capacity) {
        this.cap = capacity;
        head.next = tail;
        tail.prev = head;
    }

    private void remove(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private void addToTail(Node node) {
        node.prev = tail.prev;
        node.next = tail;
        tail.prev.next = node;
        tail.prev = node;
    }

    public int get(int key) {
        if (!map.containsKey(key)) return -1;
        Node node = map.get(key);
        remove(node);
        addToTail(node);
        return node.val;
    }

    public void put(int key, int value) {
        if (map.containsKey(key)) remove(map.get(key));
        Node node = new Node(key, value);
        map.put(key, node);
        addToTail(node);
        if (map.size() > cap) {
            Node lru = head.next;
            remove(lru);
            map.remove(lru.key);
        }
    }
}`
        },
        explanation: {
          intuition: 'We need O(1) for both get and put. A hash map gives us O(1) lookup, and a doubly linked list gives us O(1) insertion/deletion. Combining both achieves constant-time operations for all cases.',
          brute: 'Use an OrderedDict or a simple array with linear scan on access. Get/Put would be O(n) due to shifting elements.',
          optimized: 'HashMap maps keys to nodes in a doubly linked list. On access, move node to tail. Evict from head when over capacity. All operations O(1).',
          dryRun: ['put(1,1): list=[1], map={1:node1}', 'put(2,2): list=[1,2], map={1:node1,2:node2}', 'get(1): move 1 to tail, list=[2,1]', 'put(3,3): evict head(2), list=[1,3], map={1:node1,3:node3}', 'get(2): -1 (evicted)', 'put(4,4): evict head(1), list=[3,4], map={3:node3,4:node4}'],
          edgeCases: ['capacity = 0', 'duplicate key put', 'single element capacity', 'get on empty cache'],
          tips: ['Store key in Node so you can delete from hashmap when evicting from linked list head.']
        }
      },
      {
        id: 'amz-dsa-2',
        title: 'Top K Frequent Elements',
        difficulty: 'Medium',
        frequency: 94,
        tags: ['Bucket Sort', 'Hash Map', 'Heap'],
        input: 'nums = [1,1,1,2,2,3], k = 2',
        output: '[1, 2]',
        approach: 'Count frequencies with a HashMap, then use bucket sort where index = frequency. Traverse buckets from highest frequency downward to collect top k elements. This avoids a heap and achieves linear time.',
        time: 'O(n)',
        space: 'O(n)',
        visualizerType: 'sorting',
        code: {
          python: `def top_k_frequent(nums, k):
    from collections import Counter
    count = Counter(nums)
    max_freq = max(count.values())
    buckets = [[] for _ in range(max_freq + 1)]

    for num, freq in count.items():
        buckets[freq].append(num)

    result = []
    for freq in range(max_freq, 0, -1):
        for num in buckets[freq]:
            result.append(num)
            if len(result) == k:
                return result
    return result

print(top_k_frequent([1,1,1,2,2,3], 2))
print(top_k_frequent([1], 1))
print(top_k_frequent([4,1,-1,2,-1,2,3], 2))`,
          java: `public int[] topKFrequent(int[] nums, int k) {
    Map<Integer, Integer> count = new HashMap<>();
    for (int num : nums) {
        count.put(num, count.getOrDefault(num, 0) + 1);
    }

    int maxFreq = 0;
    for (int freq : count.values()) {
        maxFreq = Math.max(maxFreq, freq);
    }

    List<List<Integer>> buckets = new ArrayList<>();
    for (int i = 0; i <= maxFreq; i++) {
        buckets.add(new ArrayList<>());
    }

    for (Map.Entry<Integer, Integer> entry : count.entrySet()) {
        buckets.get(entry.getValue()).add(entry.getKey());
    }

    int[] result = new int[k];
    int idx = 0;
    for (int freq = maxFreq; freq >= 0 && idx < k; freq--) {
        for (int num : buckets.get(freq)) {
            result[idx++] = num;
            if (idx == k) return result;
        }
    }
    return result;
}`
        },
        explanation: {
          intuition: 'Instead of a min-heap (O(n log k)), bucket sort gives O(n). Create buckets indexed by frequency. Elements at bucket index f appear exactly f times.',
          brute: 'Sort all elements by frequency using a comparator. Time: O(n log n).',
          optimized: 'Bucket sort: O(n) time. Count frequencies, place into frequency-indexed buckets, read from highest bucket down.',
          dryRun: ['Count: {1:3, 2:2, 3:1}', 'Buckets: [[], [3], [2], [1], [], []]', 'freq=3: result=[1]', 'freq=2: result=[1,2], len=2, return'],
          edgeCases: ['k equals number of unique elements', 'all elements are the same', 'k = 1 with multiple candidates'],
          tips: ['Bucket sort is optimal here because frequency cannot exceed n, so bucket count is bounded by n.']
        }
      },
      {
        id: 'amz-dsa-3',
        title: 'Course Schedule',
        difficulty: 'Medium',
        frequency: 96,
        tags: ['Graph', 'Topological Sort', 'BFS'],
        input: 'numCourses = 2, prerequisites = [[1,0]]',
        output: 'true — can finish all courses',
        approach: 'Model courses as a directed graph. Use Kahn\'s algorithm (BFS topological sort): compute in-degrees, enqueue zero in-degree nodes, repeatedly remove edges. If processed count equals numCourses, no cycle exists.',
        time: 'O(V + E)',
        space: 'O(V + E)',
        visualizerType: 'graph',
        code: {
          python: `from collections import deque

def can_finish(numCourses, prerequisites):
    adj = [[] for _ in range(numCourses)]
    in_degree = [0] * numCourses

    for course, prereq in prerequisites:
        adj[prereq].append(course)
        in_degree[course] += 1

    queue = deque()
    for i in range(numCourses):
        if in_degree[i] == 0:
            queue.append(i)

    completed = 0
    while queue:
        node = queue.popleft()
        completed += 1
        for neighbor in adj[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    return completed == numCourses

print(can_finish(2, [[1,0]]))
print(can_finish(2, [[1,0],[0,1]]))`,
          java: `public boolean canFinish(int numCourses, int[][] prerequisites) {
    List<List<Integer>> adj = new ArrayList<>();
    int[] inDegree = new int[numCourses];

    for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());

    for (int[] pre : prerequisites) {
        adj.get(pre[1]).add(pre[0]);
        inDegree[pre[0]]++;
    }

    Queue<Integer> queue = new LinkedList<>();
    for (int i = 0; i < numCourses; i++) {
        if (inDegree[i] == 0) queue.offer(i);
    }

    int completed = 0;
    while (!queue.isEmpty()) {
        int node = queue.poll();
        completed++;
        for (int neighbor : adj.get(node)) {
            inDegree[neighbor]--;
            if (inDegree[neighbor] == 0) queue.offer(neighbor);
        }
    }
    return completed == numCourses;
}`
        },
        explanation: {
          intuition: 'If the graph has a cycle, courses in the cycle can never be completed. Topological sort detects cycles: if we cannot process all nodes, a cycle exists.',
          brute: 'DFS from each unvisited node, tracking recursion stack. If we revisit a node in the current recursion stack, cycle detected. O(V*(V+E)) without visited set.',
          optimized: 'Kahn\'s BFS algorithm: compute in-degrees, process zero in-degree nodes. Single pass O(V+E).',
          dryRun: ['adj: {0:[1]}, inDegree: [0,1]', 'queue=[0], completed=0', 'Process 0: completed=1, inDegree[1]=0, queue=[1]', 'Process 1: completed=2', '2 == 2 → true'],
          edgeCases: ['no prerequisites (all courses finishable)', 'self-loop prerequisite', 'disconnected components', 'single course with self-prerequisite'],
          tips: ['Kahn\'s algorithm is cleaner than DFS for cycle detection and naturally produces topological order.']
        }
      },
      {
        id: 'amz-dsa-4',
        title: 'Clone Graph',
        difficulty: 'Medium',
        frequency: 89,
        tags: ['BFS', 'Hash Map', 'Graph'],
        input: 'Graph with nodes 1→[2,4], 2→[1,3], 3→[2,4], 4→[1,3]',
        output: 'Deep copy of the entire graph with no shared references',
        approach: 'Use BFS traversal. Maintain a visited map from original node to cloned node. For each node, clone its neighbors: if neighbor already cloned, reuse; otherwise create new clone and enqueue.',
        time: 'O(V + E)',
        space: 'O(V)',
        visualizerType: 'graph',
        code: {
          python: `class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors else []

def clone_graph(node):
    if not node:
        return None

    visited = {}
    queue = [node]
    visited[node] = Node(node.val)

    while queue:
        current = queue.pop(0)
        for neighbor in current.neighbors:
            if neighbor not in visited:
                visited[neighbor] = Node(neighbor.val)
                queue.append(neighbor)
            visited[current].neighbors.append(visited[neighbor])

    return visited[node]

# Build: 1-2, 1-4, 2-3, 3-4
n1, n2, n3, n4 = Node(1), Node(2), Node(3), Node(4)
n1.neighbors = [n2, n4]
n2.neighbors = [n1, n3]
n3.neighbors = [n2, n4]
n4.neighbors = [n1, n3]
cloned = clone_graph(n1)
print(f"Cloned head val: {cloned.val}")
print(f"Cloned neighbors: {[n.val for n in cloned.neighbors]}")`,
          java: `class Node {
    int val;
    List<Node> neighbors;
    Node(int val) { this.val = val; this.neighbors = new ArrayList<>(); }
}

public Node cloneGraph(Node node) {
    if (node == null) return null;

    Map<Node, Node> visited = new HashMap<>();
    Queue<Node> queue = new LinkedList<>();
    queue.offer(node);
    visited.put(node, new Node(node.val));

    while (!queue.isEmpty()) {
        Node current = queue.poll();
        for (Node neighbor : current.neighbors) {
            if (!visited.containsKey(neighbor)) {
                visited.put(neighbor, new Node(neighbor.val));
                queue.offer(neighbor);
            }
            visited.get(current).neighbors.add(visited.get(neighbor));
        }
    }
    return visited.get(node);
}`
        },
        explanation: {
          intuition: 'We need a deep copy, not a reference copy. BFS ensures we visit every node exactly once. The visited map guarantees each node is cloned exactly once and prevents infinite loops in cyclic graphs.',
          brute: 'DFS recursively, cloning each node on first visit. Works but risks stack overflow on deep graphs.',
          optimized: 'BFS with HashMap. Single traversal, O(V+E) time and O(V) space for the visited map.',
          dryRun: ['Start at node 1, clone it, queue=[1]', 'Process 1: clone neighbors 2,4. queue=[2,4]', 'Process 2: clone neighbor 3. queue=[4,3]', 'Process 4: both neighbors cloned. queue=[3]', 'Process 3: both neighbors cloned. Done.'],
          edgeCases: ['single node with no neighbors', 'null input', 'fully connected graph', 'linear chain of nodes'],
          tips: ['The HashMap stores original→cloned mapping. This is the key to O(1) clone reuse.']
        }
      },
      {
        id: 'amz-dsa-5',
        title: 'Serialize and Deserialize Binary Tree',
        difficulty: 'Hard',
        frequency: 92,
        tags: ['BFS', 'String', 'Tree', 'Design'],
        input: 'Tree:     1\n        /   \\\n       2     3\n            / \\\n           4   5',
        output: 'serialize → "1,2,null,null,3,4,null,null,5,null,null"\ndeserialize → identical tree structure',
        approach: 'Serialize using BFS (level-order traversal). Append each node\'s value, or "null" for None. Delimiter-separated string. Deserialize by reading values sequentially, using a queue index, placing children as left then right.',
        time: 'O(n) for both operations',
        space: 'O(n)',
        visualizerType: 'tree',
        code: {
          python: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def serialize(root):
    if not root:
        return ""
    result = []
    queue = [root]
    while queue:
        node = queue.pop(0)
        if node:
            result.append(str(node.val))
            queue.append(node.left)
            queue.append(node.right)
        else:
            result.append("null")
    return ",".join(result)

def deserialize(data):
    if not data:
        return None
    vals = data.split(",")
    root = TreeNode(int(vals[0]))
    queue = [root]
    i = 1
    while queue and i < len(vals):
        node = queue.pop(0)
        if vals[i] != "null":
            node.left = TreeNode(int(vals[i]))
            queue.append(node.left)
        i += 1
        if vals[i] != "null":
            node.right = TreeNode(int(vals[i]))
            queue.append(node.right)
        i += 1
    return root

tree = TreeNode(1, TreeNode(2), TreeNode(3, TreeNode(4), TreeNode(5)))
serialized = serialize(tree)
print(f"Serialized: {serialized}")
restored = deserialize(serialized)
print(f"Root: {restored.val}, Left: {restored.left.val}, Right: {restored.right.val}")`,
          java: `class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int v) { val = v; }
}

public class Codec {
    public String serialize(TreeNode root) {
        if (root == null) return "";
        StringBuilder sb = new StringBuilder();
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            TreeNode node = queue.poll();
            if (node != null) {
                sb.append(node.val).append(",");
                queue.offer(node.left);
                queue.offer(node.right);
            } else {
                sb.append("null,");
            }
        }
        return sb.substring(0, sb.length() - 1);
    }

    public TreeNode deserialize(String data) {
        if (data.isEmpty()) return null;
        String[] vals = data.split(",");
        TreeNode root = new TreeNode(Integer.parseInt(vals[0]));
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        int i = 1;
        while (!queue.isEmpty() && i < vals.length) {
            TreeNode node = queue.poll();
            if (!vals[i].equals("null")) {
                node.left = new TreeNode(Integer.parseInt(vals[i]));
                queue.offer(node.left);
            }
            i++;
            if (!vals[i].equals("null")) {
                node.right = new TreeNode(Integer.parseInt(vals[i]));
                queue.offer(node.right);
            }
            i++;
        }
        return root;
    }
}`
        },
        explanation: {
          intuition: 'BFS level-order naturally captures tree structure. Using null markers for missing children ensures we can reconstruct the exact tree shape during deserialization.',
          brute: 'Store pre-order traversal with null markers. Recursive deserialize. Works but uses O(h) stack space for recursion.',
          optimized: 'BFS iterative approach: serialize and deserialize without recursion. Queue-based, handles very deep/wide trees.',
          dryRun: ['Serialize BFS: 1 → 2,null,3,null,null,4,5,null,null,null,null', 'Deserialize: root=1, queue=[1]', 'i=1: 1.left=2, queue=[2]; 1.right=3, queue=[2,3]', 'i=3: 2.left=null, 2.right=null; 3.left=4, queue=[4]; 3.right=5, queue=[4,5]'],
          edgeCases: ['empty tree (null root)', 'single node tree', 'skewed tree (all left or all right)', 'very wide tree with many null children'],
          tips: ['Trim trailing nulls from serialization to save space. The delimiter comma is critical for parsing.']
        }
      },
      {
        id: 'amz-dsa-6',
        title: 'Product of Array Except Self',
        difficulty: 'Medium',
        frequency: 95,
        tags: ['Prefix Sum', 'Array'],
        input: 'nums = [1, 2, 3, 4]',
        output: '[24, 12, 8, 6]',
        approach: 'Compute prefix products (left pass) and suffix products (right pass) in two passes. The result at index i is prefix[i] * suffix[i]. No division needed, handles zeros naturally.',
        time: 'O(n)',
        space: 'O(1) extra (output array not counted)',
        visualizerType: 'array',
        code: {
          python: `def product_except_self(nums):
    n = len(nums)
    result = [1] * n

    prefix = 1
    for i in range(n):
        result[i] = prefix
        prefix *= nums[i]

    suffix = 1
    for i in range(n - 1, -1, -1):
        result[i] *= suffix
        suffix *= nums[i]

    return result

print(product_except_self([1, 2, 3, 4]))
print(product_except_self([-1, 1, 0, -3, 3]))
print(product_except_self([2, 3, 4, 5]))
print(product_except_self([0, 0]))
print(product_except_self([1, 0]))`,
          java: `public int[] productExceptSelf(int[] nums) {
    int n = nums.length;
    int[] result = new int[n];

    int prefix = 1;
    for (int i = 0; i < n; i++) {
        result[i] = prefix;
        prefix *= nums[i];
    }

    int suffix = 1;
    for (int i = n - 1; i >= 0; i--) {
        result[i] *= suffix;
        suffix *= nums[i];
    }
    return result;
}`
        },
        explanation: {
          intuition: 'Each position i needs the product of all elements before it (prefix) and all elements after it (suffix). Two passes compute these without division, naturally handling zeros.',
          brute: 'For each element, iterate through all others and multiply. O(n^2) time.',
          optimized: 'Two-pass prefix/suffix product. O(n) time, O(1) extra space.',
          dryRun: ['nums=[1,2,3,4]', 'Prefix pass: result=[1, 1, 2, 6]', 'Suffix pass: result=[24, 12, 8, 6]', 'result[0]=1*24=24, result[1]=1*12=12, result[2]=2*4=8, result[3]=6*1=6'],
          edgeCases: ['array with zeros', 'negative numbers', 'single element array', 'all elements are 1'],
          tips: ['The constraint "no division" is what makes this interesting. Prefix/suffix is the standard O(n) solution.']
        }
      },
      {
        id: 'amz-dsa-7',
        title: 'Find Median from Data Stream',
        difficulty: 'Hard',
        frequency: 91,
        tags: ['Two Heaps', 'Heap', 'Design'],
        input: 'addNum(1), addNum(2), findMedian() → 1.5\naddNum(3), findMedian() → 2',
        output: 'Median values as numbers are streamed in',
        approach: 'Maintain two heaps: a max-heap for the lower half and a min-heap for the upper half. Balance them so the max-heap has at most one more element. Median is the max of the lower half (odd count) or average of both heap tops (even count).',
        time: 'O(log n) addNum, O(1) findMedian',
        space: 'O(n)',
        visualizerType: 'sliding-window',
        code: {
          python: `import heapq

class MedianFinder:
    def __init__(self):
        self.lo = []  # max-heap (inverted)
        self.hi = []  # min-heap

    def add_num(self, num):
        heapq.heappush(self.lo, -num)
        heapq.heappush(self.hi, -heapq.heappop(self.lo))

        if len(self.hi) > len(self.lo):
            heapq.heappush(self.lo, -heapq.heappop(self.hi))

    def find_median(self):
        if len(self.lo) > len(self.hi):
            return -self.lo[0]
        return (-self.lo[0] + self.hi[0]) / 2.0

mf = MedianFinder()
mf.add_num(1)
mf.add_num(2)
print(f"Median: {mf.find_median()}")
mf.add_num(3)
print(f"Median: {mf.find_median()}")
mf.add_num(4)
print(f"Median: {mf.find_median()}")
mf.add_num(5)
print(f"Median: {mf.find_median()}")`,
          java: `class MedianFinder {
    private PriorityQueue<Integer> lo = new PriorityQueue<>(Collections.reverseOrder());
    private PriorityQueue<Integer> hi = new PriorityQueue<>();

    public void addNum(int num) {
        lo.offer(num);
        hi.offer(lo.poll());

        if (hi.size() > lo.size()) {
            lo.offer(hi.poll());
        }
    }

    public double findMedian() {
        if (lo.size() > hi.size()) {
            return lo.peek();
        }
        return (lo.peek() + hi.peek()) / 2.0;
    }
}`
        },
        explanation: {
          intuition: 'A max-heap stores the smaller half; a min-heap stores the larger half. The median is always at the tops of these heaps. Balancing ensures efficient median retrieval.',
          brute: 'Store all numbers in a sorted list. Insertion O(n), median O(1).',
          optimized: 'Two-heap approach: O(log n) insertion, O(1) median. Balancing keeps heaps within size 1 of each other.',
          dryRun: ['addNum(1): lo=[1], hi=[]', 'addNum(2): lo=[2], hi=[1] (swap keeps balance)', 'findMedian: lo.size=hi.size → (2+1)/2=1.5', 'addNum(3): lo=[2,3], hi=[1] → swap → lo=[2,3], hi=[1] → lo.size>hi.size', 'findMedian: lo.peek()=2'],
          edgeCases: ['single element', 'two elements (even count)', 'all same values', 'alternating very large and very small numbers'],
          tips: ['Python heapq is a min-heap. Negate values to simulate a max-heap for the lower half.']
        }
      },
      {
        id: 'amz-dsa-8',
        title: 'Binary Tree Zigzag Level Order Traversal',
        difficulty: 'Medium',
        frequency: 88,
        tags: ['BFS', 'Tree', 'Deque'],
        input: 'Tree:     3\n        /   \\\n       9    20\n           /  \\\n          15   7',
        output: '[[3], [20,9], [15,7]]',
        approach: 'Standard BFS level-order traversal, but alternate the direction of each level. Use a deque or reverse every other level\'s result list to achieve zigzag ordering.',
        time: 'O(n)',
        space: 'O(n)',
        visualizerType: 'tree',
        code: {
          python: `from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def zigzag_level_order(root):
    if not root:
        return []

    result = []
    queue = deque([root])
    left_to_right = True

    while queue:
        level_size = len(queue)
        level = deque()

        for _ in range(level_size):
            node = queue.popleft()
            if left_to_right:
                level.append(node.val)
            else:
                level.appendleft(node.val)

            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)

        result.append(list(level))
        left_to_right = not left_to_right

    return result

root = TreeNode(3, TreeNode(9), TreeNode(20, TreeNode(15), TreeNode(7)))
print(zigzag_level_order(root))
print(zigzag_level_order(TreeNode(1)))
print(zigzag_level_order(None))`,
          java: `class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int v) { val = v; }
}

public List<List<Integer>> zigzagLevelOrder(TreeNode root) {
    List<List<Integer>> result = new ArrayList<>();
    if (root == null) return result;

    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);
    boolean leftToRight = true;

    while (!queue.isEmpty()) {
        int size = queue.size();
        Deque<Integer> level = new LinkedList<>();

        for (int i = 0; i < size; i++) {
            TreeNode node = queue.poll();
            if (leftToRight) {
                level.addLast(node.val);
            } else {
                level.addFirst(node.val);
            }

            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }

        result.add(new ArrayList<>(level));
        leftToRight = !leftToRight;
    }
    return result;
}`
        },
        explanation: {
          intuition: 'Level-order BFS is natural for trees. Adding a direction flag that toggles each level creates the zigzag pattern. Using a deque allows O(1) insertion at both ends.',
          brute: 'Do normal BFS, then reverse every odd-indexed level. Two passes but simple.',
          optimized: 'Single-pass BFS with deque: insert from left or right based on direction flag. O(n) single pass.',
          dryRun: ['Level 0: queue=[3], left_to_right=true → [3]', 'Level 1: queue=[9,20], left_to_right=false → [20,9]', 'Level 2: queue=[15,7], left_to_right=true → [15,7]', 'Result: [[3],[20,9],[15,7]]'],
          edgeCases: ['empty tree', 'single node', 'skewed tree (all left or all right)', 'perfect binary tree'],
          tips: ['Deque is more efficient than list.reverse() for each level. Prepend is O(1) with deque vs O(n) with list.']
        }
      }
    ],
    technical: [
      {
        id: 'amz-tech-1',
        category: 'System Design',
        difficulty: 'Advanced',
        frequency: 98,
        question: "Design Amazon's shopping cart system that handles millions of concurrent users during Prime Day flash sales.",
        answer: 'The shopping cart must be highly available and eventually consistent. Use DynamoDB with partition keys based on user ID for horizontal scaling. Store cart items with TTL for session-based carts. Implement a write-behind cache using Redis to absorb write spikes during flash sales. For checkout, use a distributed transaction with DynamoDB Transactions or a saga pattern. Decouple inventory reservation from cart operations using SQS to handle peak load without losing data. Cart merging across devices uses a last-write-wins or timestamp-based conflict resolution. Deploy across multiple AZs with DynamoDB Global Tables for disaster recovery.',
        keyPoints: ['DynamoDB partitioning by userId', 'Redis write-behind cache', 'SQS for decoupling inventory reservation', 'DynamoDB Transactions for checkout', 'Multi-AZ deployment', 'Eventual consistency model'],
        followUps: ['How do you prevent overselling during a flash sale?', 'What happens if Redis goes down — how does the cart degrade gracefully?', 'How would you handle cart sync across mobile and web?']
      },
      {
        id: 'amz-tech-2',
        category: 'Cloud / AWS',
        difficulty: 'Advanced',
        frequency: 92,
        question: "When would you choose DynamoDB over RDS at Amazon's scale, and what are the trade-offs?",
        answer: 'DynamoDB is the right choice for key-value workloads with predictable access patterns and extreme scale (millions of QPS). It provides single-digit millisecond latency at any scale, automatic horizontal scaling, and built-in replication across 3 AZs. Use DynamoDB for session storage, shopping carts, and real-time bidding where the access pattern is known upfront. RDS (PostgreSQL/MySQL) is better for complex queries, joins, reporting workloads, and when the schema is relational. RDS supports ACID transactions across multiple tables natively. At Amazon, many services use DynamoDB for hot paths and RDS for analytics/reporting. DynamoDB Streams enable event-driven architectures. Global Tables provide multi-region replication. The trade-off is that DynamoDB requires careful key design — poor partition key choice causes hot partitions.',
        keyPoints: ['DynamoDB: key-value, predictable patterns, auto-scaling, single-digit ms latency', 'RDS: relational queries, joins, complex reporting', 'DynamoDB Streams for event-driven patterns', 'Global Tables for multi-region', 'Partition key design is critical'],
        followUps: ['How do you handle a hot partition in DynamoDB?', 'What is the difference between DynamoDB Streams and Kinesis?', 'How would you migrate an RDS workload to DynamoDB?']
      },
      {
        id: 'amz-tech-3',
        category: 'Language / Core',
        difficulty: 'Intermediate',
        frequency: 85,
        question: "How does Java garbage collection work, and how would you tune it for a high-throughput Amazon service?",
        answer: 'Java GC manages heap memory by reclaiming objects no longer referenced. The JVM divides heap into Young Generation (Eden + Survivor spaces) and Old Generation. Minor GC collects short-lived objects from Young Gen using a copying collector — fast but pauses. Major GC (Full GC) collects Old Gen — longer pauses. For Amazon services, use G1GC (default since Java 9) for balanced throughput/latency, or ZGC for ultra-low latency (<10ms pauses). Key tuning flags: -Xmx/-Xms for heap size, -XX:MaxGCPauseMillis for target pause, -XX:G1HeapRegionSize for region sizing. Monitor with jstat, GC logs, and CloudWatch. For latency-critical services, minimize object allocation rate, use object pooling, prefer primitives over boxed types, and enable TLAB (Thread Local Allocation Buffers) for fast allocation.',
        keyPoints: ['Young Gen vs Old Gen', 'G1GC for balanced, ZGC for low-latency', '-Xmx, -XX:MaxGCPauseMillis tuning', 'Object allocation rate affects GC frequency', 'TLAB for multi-threaded allocation', 'GC logging and monitoring'],
        followUps: ['What is a stop-the-world pause and how do you minimize it?', 'How does G1GC differ from CMS collector?', 'What tools do you use to diagnose GC issues in production?']
      },
      {
        id: 'amz-tech-4',
        category: 'Database',
        difficulty: 'Advanced',
        frequency: 90,
        question: "Design the data pipeline for Amazon's product recommendation engine.",
        answer: 'The recommendation pipeline has three stages: data collection, model training, and real-time serving. Data collection: stream user events (clicks, purchases, views) from the website via Kinesis Data Streams into S3 as raw data lake. Process with Spark/EMR to create user-item interaction matrices. Model training: use SageMaker to train collaborative filtering and deep learning models on historical data, storing model artifacts in S3. Real-time serving: deploy models as SageMaker endpoints or containerized inference services. The feature store (DynamoDB or ElastiCache) provides precomputed features. User requests hit the recommendation service which queries the feature store, runs inference, and returns results. A/B testing framework routes traffic between model variants. Retraining happens on a schedule (daily/weekly) with fresh data.',
        keyPoints: ['Kinesis for event streaming', 'S3 data lake for raw events', 'Spark/EMR for data processing', 'SageMaker for model training and serving', 'Feature store in DynamoDB/ElastiCache', 'A/B testing framework', 'Batch + real-time hybrid architecture'],
        followUps: ['How do you handle the cold-start problem for new users?', 'How would you ensure recommendations update in real-time as users browse?', 'How do you prevent feedback loops where popular items get over-recommended?']
      },
      {
        id: 'amz-tech-5',
        category: 'Cloud / AWS',
        difficulty: 'Intermediate',
        frequency: 88,
        question: "Explain how S3 achieves 11 9's of durability and how you would architect storage for critical data.",
        answer: 'S3 achieves 99.999999999% (11 9\'s) durability through data redundancy across multiple Availability Zones. Each object is automatically replicated across a minimum of 3 AZs within a region. S3 uses checksums (CRC32, SHA-256) to detect and repair bit rot. Objects are stored with data integrity verification on every PUT and GET. S3 Standard storage provides 11 9\'s durability and 99.99% availability. For critical data, use S3 Cross-Region Replication (CRR) to replicate to another region, S3 Object Lock for WORM compliance, and lifecycle policies to transition data to Glacier for cost optimization. Enable S3 versioning to protect against accidental deletions. Use S3 Access Points for fine-grained access control. Monitor with CloudWatch metrics and S3 Storage Lens for operational visibility.',
        keyPoints: ['3+ AZ replication', 'Checksums for bit rot detection', 'S3 Standard: 11 9\'s durability, 99.99% availability', 'CRR for cross-region redundancy', 'Object Lock for compliance', 'Versioning for deletion protection'],
        followUps: ['What is the difference between S3 Standard, IA, and Glacier?', 'How do you handle S3 costs at petabyte scale?', 'What happens if an entire AWS region goes down?']
      },
      {
        id: 'amz-tech-6',
        category: 'DevOps',
        difficulty: 'Advanced',
        frequency: 93,
        question: "How would you implement zero-downtime deployments for a critical Amazon microservice?",
        answer: 'Use rolling deployments with health checks on ECS/EKS. Deploy new task definition version alongside old version, use ALB target groups with weighted routing to gradually shift traffic. Monitor CloudWatch metrics (latency, error rate, 5xx count) during rollout. If metrics degrade, automatically roll back using CloudWatch alarms and CodeDeploy. For database migrations, use expand-contract pattern: add new column (expand), deploy code that writes to both, migrate reads, remove old column (contract). Use feature flags for risky changes so code can be deployed disabled and toggled without redeployment. Blue-green deployments via ALB for instant rollback capability. Canary deployments using weighted target groups for gradual exposure. Implement circuit breakers (Hystrix/Resilience4j) to prevent cascade failures during partial deployments.',
        keyPoints: ['Rolling deployment with ECS task definitions', 'ALB weighted target groups', 'CloudWatch alarm-based auto rollback', 'Expand-contract for DB migrations', 'Feature flags for safe rollouts', 'Circuit breakers for cascade protection'],
        followUps: ['How do you handle database schema changes during deployment?', 'What metrics do you watch to decide if a rollback is needed?', 'How do you test a deployment strategy before production?']
      },
      {
        id: 'amz-tech-7',
        category: 'System Design',
        difficulty: 'Advanced',
        frequency: 91,
        question: "Design a distributed task queue like Amazon SQS that guarantees at-least-once delivery.",
        answer: 'The queue uses a distributed log architecture. Messages are appended to a partitioned, ordered log (like Kafka or custom). Each partition has multiple replicas for durability. Producers write messages to the leader replica. Consumers poll via long-polling to reduce empty responses. Visibility timeout: when a consumer receives a message, it becomes invisible for a configured timeout (e.g., 30s). If the consumer fails to delete it within the timeout, the message becomes visible again (at-least-once). Use idempotency keys on the consumer side to handle duplicates. Dead-letter queue (DLQ) captures messages that fail processing after N retries. FIFO ordering is achieved per-partition using message group IDs. Scale partitions horizontally based on throughput. Use DynamoDB or a custom metadata store for queue attributes, permissions, and dead-letter configuration. Encryption at rest (KMS) and in transit (TLS).',
        keyPoints: ['Partitioned ordered log for throughput', 'Long-polling for efficient consumption', 'Visibility timeout for at-least-once', 'Idempotency keys for duplicate handling', 'Dead-letter queue for poison messages', 'FIFO per message group ID'],
        followUps: ['How do you achieve exactly-once processing semantics?', 'How would you handle a consumer that is slow and causes message backlog?', 'What happens when a message in the DLQ keeps failing?']
      },
      {
        id: 'amz-tech-8',
        category: 'Language / Core',
        difficulty: 'Intermediate',
        frequency: 87,
        question: "Compare REST and GraphQL for building Amazon APIs. When would you choose each?",
        answer: 'REST uses fixed endpoints (GET /users/123, POST /orders) with HTTP verbs defining actions. It is simple, cacheable, and well-understood. For Amazon\'s internal microservices with stable contracts, REST is excellent — easy to version, cache with CDN, and monitor. GraphQL uses a single endpoint with a query language that lets clients request exactly the data they need. For Amazon\'s mobile apps and product pages where different clients need different data shapes, GraphQL eliminates over-fetching and under-fetching. A product page might need name, price, reviews, and availability — GraphQL returns all in one request. REST would need 4 separate calls. However, GraphQL adds complexity: server-side query parsing, N+1 query risks, and caching is harder (POST requests bypass CDN caches). For Amazon\'s scale, use REST for internal service-to-service (high throughput, stable contracts) and GraphQL for client-facing APIs (flexible, reduced bandwidth). Apollo Federation can compose multiple GraphQL services.',
        keyPoints: ['REST: simple, cacheable, fixed endpoints', 'GraphQL: flexible queries, reduces over-fetching', 'REST better for internal microservices', 'GraphQL better for client-facing APIs', 'GraphQL caching is harder (POST bypasses CDN)', 'Apollo Federation for composed schemas'],
        followUps: ['How do you handle GraphQL N+1 query problems?', 'How would you version a GraphQL schema vs REST endpoints?', 'What are the security concerns with GraphQL query complexity?']
      }
    ],
    hr: [
      {
        id: 'amz-hr-1',
        question: "Tell me about a time you took on something outside your area of responsibility.",
        modelAnswer: 'In my previous role as a backend developer, I noticed that the on-call team was spending 2 hours per incident manually tracing logs across three services. This was outside my sprint work, but it was impacting the team\'s ability to respond to production issues quickly. I took Ownership and built a lightweight log aggregation dashboard that correlated trace IDs across services. I collaborated with the SRE team to define the right metrics, implemented it using ELK stack over two weekends, and presented it to the team. The tool reduced average incident triage time from 2 hours to 15 minutes. This demonstrated Bias for Action — I didn\'t wait for someone to assign it — and Customer Obsession because faster incident resolution meant better uptime for our users.',
        aiTips: 'Explicitly name the Amazon Leadership Principle (Ownership). Show proactive behavior — you acted without being asked. Quantify the impact.',
        starTips: {
          situation: 'The on-call team was spending 2 hours per incident manually correlating logs across three microservices, delaying production incident resolution.',
          task: 'I needed to reduce incident triage time without distracting from my sprint commitments. This was not my assigned work.',
          action: 'Proactively built a log correlation dashboard using ELK stack, collaborated with SRE to define relevant metrics, and iterated based on feedback. Demonstrated Ownership by taking responsibility beyond my role, and Frugality by using existing infrastructure.',
          result: 'Reduced average incident triage time from 2 hours to 15 minutes. The tool was adopted by the entire engineering team and became part of the standard on-call toolkit.'
        }
      },
      {
        id: 'amz-hr-2',
        question: "Tell me about a time you had to dive deep into data to solve a problem.",
        modelAnswer: 'Our e-commerce platform had a 12% cart abandonment rate that was higher than the industry average. Instead of guessing at causes, I Dive Deep into the data. I instrumented detailed funnel tracking across the checkout flow and analyzed session recordings for 500+ users. I discovered that 68% of abandoned carts occurred at the shipping cost disclosure step — users were surprised by high shipping costs at the final stage. I presented this data to the product team with a recommendation to show estimated shipping costs on the product page. After implementing this change, cart abandonment dropped to 7%, a 42% relative improvement. I didn\'t rely on assumptions; I let the data tell the story and drove a specific, measurable change.',
        aiTips: 'Demonstrate that you used data, not intuition, to diagnose the root cause. Show the specific methodology you used to collect and analyze data.',
        starTips: {
          situation: 'Cart abandonment rate was 12%, significantly above the industry benchmark of 8%, costing the business ~$2M annually in lost revenue.',
          task: 'Identify the root cause of cart abandonment and recommend a data-driven fix. Not a guessing game — I needed to find the actual friction point.',
          action: 'Implemented detailed funnel tracking, analyzed 500+ user session recordings, segmented abandonment by checkout step, and discovered 68% occurred at shipping cost disclosure. Used cohort analysis to validate the finding.',
          result: 'Recommended showing shipping estimates on the product page. Cart abandonment dropped to 7% (42% relative improvement), recovering an estimated $840K in annual revenue.'
        }
      },
      {
        id: 'amz-hr-3',
        question: "Tell me about a time you disagreed with your manager or a senior engineer. How did you handle it?",
        modelAnswer: 'My team lead wanted to ship a feature using a monolithic approach because it was faster to implement. I disagreed because I had seen similar patterns cause deployment bottlenecks and scaling issues in my previous team. Instead of just pushing back, I Disagreed and Committed — I first built a small proof-of-concept comparing both approaches with concrete metrics: build time, deployment frequency, and fault isolation. I presented the data showing the monolith would increase deployment time by 3x at our current growth rate. My lead acknowledged the data and we agreed on a modular monolith compromise. After alignment, I committed fully to the decision and we shipped on time. I maintained respect for my lead\'s authority while ensuring the technical decision was informed by evidence.',
        aiTips: 'Show you can respectfully push back with evidence, not just opinion. Highlight that you committed to the final decision regardless of outcome.',
        starTips: {
          situation: 'My team lead proposed a monolithic architecture for a new payment feature, prioritizing speed of delivery over architectural concerns.',
          task: 'I disagreed based on experience with monolith scaling issues, but needed to respect my lead\'s authority while ensuring the right technical choice.',
          action: 'Built a proof-of-concept comparing both approaches with metrics: build time, deployment frequency, and fault isolation. Presented data showing 3x deployment time increase at projected growth. Proposed a modular monolith as a compromise.',
          result: 'Team adopted the modular monolith approach. We shipped on time, and 6 months later the modular structure allowed us to extract two independent services without major refactoring. My lead recognized the value of data-driven disagreements.'
        }
      },
      {
        id: 'amz-hr-4',
        question: "Describe a time you simplified a process or system that was overly complex.",
        modelAnswer: 'Our team had a deployment process that required 14 manual steps across 4 different tools (Jira, GitHub, Jenkins, and a custom script). New engineers took 2 weeks to become comfortable with it. I noticed this was a recurring pain point in retrospectives. I took the initiative to Invent and Simplify by building a single CLI tool that orchestrated the entire deployment pipeline. It automated Jira ticket transitions, triggered the correct Jenkins pipeline, handled environment-specific configs, and posted Slack notifications. I documented it with interactive tutorials and ran brown-bag sessions. The deployment process went from 14 manual steps to 1 command. Average deployment time dropped from 45 minutes to 8 minutes. New engineer onboarding time for deployments went from 2 weeks to 2 days.',
        aiTips: 'Show you identified unnecessary complexity and created a simpler solution. Quantify time saved and impact on team productivity.',
        starTips: {
          situation: 'Deployment process required 14 manual steps across 4 tools, taking 45 minutes per deployment. New engineers needed 2 weeks to learn it, and it was a frequent source of human error.',
          task: 'Simplify the deployment pipeline without disrupting current workflows or introducing new risks. Make it accessible to all team members.',
          action: 'Built a CLI tool that automated the entire pipeline: Jira transitions, Jenkins triggers, environment configs, and Slack notifications. Created interactive docs and ran training sessions. Used Frugality by leveraging existing tool APIs.',
          result: 'Reduced deployment from 14 manual steps to 1 command (45 min → 8 min). New engineer onboarding for deployments: 2 weeks → 2 days. Deployment-related incidents dropped 80%.'
        }
      },
      {
        id: 'amz-hr-5',
        question: "Tell me about a time you delivered results under a tight deadline.",
        modelAnswer: 'We had a critical security vulnerability discovered in our authentication service on a Thursday, with a compliance deadline of Monday. The fix required refactoring the token validation logic across 3 microservices. I took Deliver Results by immediately triaging the scope: I identified the minimal viable fix that addressed the vulnerability without a full refactor, wrote the patch, and set up an expedited code review process. I coordinated with the security team for verification, the QA team for regression testing, and the SRE team for deployment. I worked late Thursday and Friday, got the fix merged by Saturday morning, ran full regression tests, and deployed to production Saturday night with SRE approval. We met the Monday compliance deadline with 2 days to spare. The follow-up refactor was planned for the next sprint.',
        aiTips: 'Show urgency and focus on the critical path. Demonstrate you can scope ruthlessly to meet deadlines without sacrificing quality.',
        starTips: {
          situation: 'Critical authentication vulnerability discovered Thursday with a Monday compliance deadline. Fix required changes across 3 microservices.',
          task: 'Deliver a secure fix by Monday while maintaining service stability. No room for scope creep or delays.',
          action: 'Triaged scope to minimal viable fix (not full refactor), coordinated cross-team reviews, wrote and reviewed code Thursday-Friday, ran regression tests Saturday, deployed Saturday night with SRE approval. Demonstrated Deliver Results and Bias for Action.',
          result: 'Met the Monday compliance deadline. The minimal fix reduced vulnerability exposure by 100%. Full refactor was completed in the following sprint without time pressure.'
        }
      },
      {
        id: 'amz-hr-6',
        question: "Tell me about a time you earned the trust of a difficult stakeholder or team member.",
        modelAnswer: 'A product manager on a cross-functional project was skeptical of my team\'s estimates because a previous team had consistently missed deadlines. I Earned Trust by being radically transparent. I created a shared tracking document with real-time progress updates, explained my estimation methodology (historical velocity plus risk buffer), and proactively flagged risks before they became issues. When we hit an unexpected API change from a third-party provider, I communicated the impact immediately with a revised timeline and mitigation plan. Over 6 weeks, the PM went from questioning every estimate to defending my team\'s estimates to their director. Trust was earned through consistent honesty, not through over-promising.',
        aiTips: 'Focus on consistency and transparency as the trust-building mechanism. Show the relationship evolved over time.',
        starTips: {
          situation: 'Product manager was skeptical of engineering estimates due to a previous team\'s history of missed deadlines. This created tension in sprint planning and cross-functional meetings.',
          task: 'Build trust with a skeptical stakeholder while delivering on commitments. Cannot force trust — must earn it through actions.',
          action: 'Created transparent shared tracking doc, explained estimation methodology, proactively flagged risks, and communicated setbacks immediately with mitigation plans. Demonstrated Earn Trust through radical transparency and consistency.',
          result: 'Over 6 weeks, the PM\'s skepticism transformed into advocacy. They began defending my team\'s estimates to their director. Subsequent cross-functional projects had significantly reduced coordination overhead.'
        }
      },
      {
        id: 'amz-hr-7',
        question: "Tell me about a time you failed. What did you learn?",
        modelAnswer: 'I was leading the migration of our monolithic application to microservices. I underestimated the complexity of data consistency across service boundaries and pushed the team to migrate the order service first. After launch, we discovered race conditions in inventory updates that caused double-selling of limited-stock items. I took responsibility — this was my failure in technical judgment. I Learn and Be Curious by studying distributed systems patterns (sagas, event sourcing) and implementing an event-driven architecture with idempotent consumers. We rolled back the order service migration, fixed the architecture, and re-migrated correctly. The lesson: in distributed systems, data consistency is not免费的 — you must design for it upfront. I now start every distributed system design by asking "what happens when two services disagree about shared state?"',
        aiTips: 'Own the failure fully — don\'t blame others. Show what you learned and how it changed your approach going forward.',
        starTips: {
          situation: 'Led microservices migration. Underestimated data consistency challenges. Pushed order service migration ahead of proper distributed transaction patterns.',
          action: 'Took full ownership of the failure. Studied distributed systems patterns (sagas, event sourcing). Designed event-driven architecture with idempotent consumers. Rolled back and re-migrated correctly.',
          result: 'Fixed the double-selling bug, implemented proper distributed transactions, and re-migrated successfully. The learning became a team standard: all distributed system designs now require a data consistency review upfront.',
          task: 'Recognize that my architectural decision caused production issues and customer impact. Need to fix the immediate problem and prevent recurrence.'
        }
      },
      {
        id: 'amz-hr-8',
        question: "Tell me about a time you went above and beyond for a customer.",
        modelAnswer: 'A small business seller on our platform contacted support because their inventory sync was failing intermittently, causing them to oversell products. The issue was not in our standard support scope — it was a misconfiguration in their third-party integration. Instead of closing the ticket, I Customer Obsess by investigating their specific setup. I analyzed their API logs, identified that their webhook endpoint was timing out under load, and worked with them to implement retry logic with exponential backoff. I also found that our API rate limit documentation was unclear for their use case and submitted a documentation improvement. The seller\'s overselling incidents dropped to zero, and they increased their monthly sales 30% because they could now reliably sync inventory. I followed up 2 weeks later to ensure stability.',
        aiTips: 'Show you went beyond the standard scope because the customer\'s success mattered. Connect to Customer Obsession explicitly.',
        starTips: {
          situation: 'A small business seller had intermittent inventory sync failures causing product overselling. Standard support closed the ticket as "third-party issue."',
          task: 'The seller was losing sales and customer trust due to overselling. I chose to go beyond standard support scope because their business success is our success.',
          action: 'Investigated their API logs, identified webhook timeout under load, helped implement retry with exponential backoff, and submitted documentation improvements for rate limit clarity. Demonstrated Customer Obsession by treating their problem as our problem.',
          result: 'Overselling incidents dropped to zero. Seller increased monthly sales 30% due to reliable inventory sync. Follow-up confirmed 3-month stability. Documentation improvement benefited 50+ other sellers with similar setups.'
        }
      }
    ]
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
    industry: 'Enterprise Software & OS',
    hiringRoles: ['Software Engineer', 'Program Manager', 'Security Researcher'],
    interviewRounds: ['Online Assessment', '2x Technical Coding', 'Hiring Manager Round'],
    salaryRange: '₹25L - ₹45L',
    brandColor: '#00A4EF',
    culture: 'Growth Mindset, Empathy, Diversity, Work-Life Balance',
    difficulty: 'High',
    completion: 80,
    stats: { placed: '115', avgpackage: '25.0 LPA' },
    founders: [
      { name: 'Bill Gates', title: 'Co-founder', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Bill_Gates_at_the_European_Commission_-_P067383-987995_%28cropped%29_5.jpg/250px-Bill_Gates_at_the_European_Commission_-_P067383-987995_%28cropped%29_5.jpg' },
      { name: 'Paul Allen', title: 'Co-founder', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Paul_G._Allen_%28cropped%29.jpg/250px-Paul_G._Allen_%28cropped%29.jpg' }
    ],
    focus: 'Enterprise productivity, Copilot & AI integration, and Azure Cloud solutions.',
    motto: '"Empower every person and every organization on the planet to achieve more."',
    hiringPhilosophy: 'We seek individuals with a \'growth mindset\' who are diverse and inclusive. Empathy and collaboration are just as vital as technical ability.',
    dsa: [
      {
        id: 'ms-dsa-1',
        title: 'Binary Tree Maximum Path Sum',
        difficulty: 'Hard',
        frequency: 92,
        tags: ['Depth-First Search', 'Binary Tree', 'Recursion'],
        input: 'root = [1,2,3]',
        output: '6',
        approach: 'Use DFS to compute the maximum gain from each node while tracking the global maximum path sum that passes through any node.',
        time: 'O(N)',
        space: 'O(H) where H is tree height',
        visualizerType: 'tree',
        code: {
          python: `class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        self.max_sum = float('-inf')

        def dfs(node):
            if not node:
                return 0
            left_gain = max(dfs(node.left), 0)
            right_gain = max(dfs(node.right), 0)
            price_newpath = node.val + left_gain + right_gain
            self.max_sum = max(self.max_sum, price_newpath)
            return node.val + max(left_gain, right_gain)

        dfs(root)
        return self.max_sum`,
          java: `class Solution {
    private int maxSum = Integer.MIN_VALUE;

    public int maxPathSum(TreeNode root) {
        dfs(root);
        return maxSum;
    }

    private int dfs(TreeNode node) {
        if (node == null) return 0;
        int leftGain = Math.max(dfs(node.left), 0);
        int rightGain = Math.max(dfs(node.right), 0);
        int priceNewPath = node.val + leftGain + rightGain;
        maxSum = Math.max(maxSum, priceNewPath);
        return node.val + Math.max(leftGain, rightGain);
    }
}`
        },
        explanation: {
          intuition: 'At each node, the maximum path either uses the node as a connector (left + node + right) or passes through to its parent. We track the global maximum for paths that use a node as the peak, and return the best single-branch gain to the parent.',
          brute: 'Try all possible pairs of nodes and compute path sum between them. O(N^2) time.',
          optimized: 'Single DFS pass: at each node compute path through it (left+node+right), update global max, return best branch upward. O(N) time, O(H) space.',
          dryRun: ['dfs(1): left_gain=2, right_gain=3, path=6, max_sum=6, return 1+3=4', 'dfs(2): left_gain=0, right_gain=0, path=2, max_sum=6, return 2', 'dfs(3): left_gain=0, right_gain=0, path=3, max_sum=6, return 3'],
          edgeCases: ['All negative values - must pick at least one node (the least negative)', 'Single node tree', 'Skewed tree (all left or all right)'],
          tips: ['The key insight is returning only the best single branch to the parent while considering both branches for the local maximum.']
        }
      },
      {
        id: 'ms-dsa-2',
        title: 'Word Search II',
        difficulty: 'Hard',
        frequency: 88,
        tags: ['Trie', 'Depth-First Search', 'Backtracking'],
        input: 'board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words = ["oath","pea","eat","rain"]',
        output: '["eat","oath"]',
        approach: 'Build a Trie from the word list, then run DFS on the board using the Trie to prune branches that cannot lead to valid words.',
        time: 'O(M * N * 4^L) where L is max word length',
        space: 'O(W * L) for the Trie, W = number of words',
        visualizerType: 'tree',
        code: {
          python: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.word = None

class Solution:
    def findWords(self, board, words):
        root = TrieNode()
        for word in words:
            node = root
            for ch in word:
                if ch not in node.children:
                    node.children[ch] = TrieNode()
                node = node.children[ch]
            node.word = word

        result = []
        for i in range(len(board)):
            for j in range(len(board[0])):
                if board[i][j] in root.children:
                    self.dfs(board, i, j, root, result)
        return result

    def dfs(self, board, i, j, parent, result):
        ch = board[i][j]
        node = parent.children[ch]
        if node.word:
            result.append(node.word)
            node.word = None
        board[i][j] = '#'
        for dx, dy in [(0,1),(0,-1),(1,0),(-1,0)]:
            ni, nj = i+dx, j+dy
            if 0<=ni<len(board) and 0<=nj<len(board[0]) and board[ni][nj] in node.children:
                self.dfs(board, ni, nj, node, result)
        board[i][j] = ch
        if not node.children:
            del parent.children[ch]`,
          java: `class Solution {
    class TrieNode {
        TrieNode[] children = new TrieNode[26];
        String word = null;
    }

    public List<String> findWords(char[][] board, String[] words) {
        TrieNode root = new TrieNode();
        for (String w : words) {
            TrieNode node = root;
            for (char c : w.toCharArray()) {
                int idx = c - 'a';
                if (node.children[idx] == null) node.children[idx] = new TrieNode();
                node = node.children[idx];
            }
            node.word = w;
        }
        List<String> res = new ArrayList<>();
        for (int i = 0; i < board.length; i++)
            for (int j = 0; j < board[0].length; j++)
                if (root.children[board[i][j]-'a'] != null)
                    dfs(board, i, j, root, res);
        return res;
    }

    void dfs(char[][] b, int i, int j, TrieNode p, List<String> res) {
        char c = b[i][j];
        TrieNode node = p.children[c-'a'];
        if (node.word != null) { res.add(node.word); node.word = null; }
        b[i][j] = '#';
        int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};
        for (int[] d : dirs) {
            int ni=i+d[0], nj=j+d[1];
            if (ni>=0&&ni<b.length&&nj>=0&&nj<b[0].length&&b[ni][nj]!='#')
                if (node.children[b[ni][nj]-'a']!=null)
                    dfs(b, ni, nj, node, res);
        }
        b[i][j] = c;
        if (node.children[0]==null && Arrays.stream(node.children).allMatch(n->n==null))
            p.children[c-'a'] = null;
    }
}`
        },
        explanation: {
          intuition: 'Instead of searching for each word independently on the board, build a Trie and traverse the board once. The Trie acts as a filter — we only continue DFS along paths that are prefixes of some word, massively pruning the search space.',
          brute: 'For each word, run DFS on every cell of the board to find it. O(W * M * N * 4^L) time where W = words count.',
          optimized: 'Build Trie from all words, then DFS the board once using the Trie to guide which branches to explore. Prune dead Trie nodes as words are found. O(M * N * 4^L) overall.',
          dryRun: ['Build Trie: oath -> o->a->t->h, eat -> e->a->t, etc.', 'Start DFS at (0,0) where board[0][0]=o. Follow Trie: o->a->a->n, no match.', 'Start DFS at (0,1) where board[0][1]=a. Try from a->t->h, find "oath".', 'Continue until all board cells explored.'],
          edgeCases: ['Empty board or empty words list', 'Words that share prefixes (Trie pruning is critical)', 'Board with single cell', 'Words longer than board dimensions'],
          tips: ['Mark visited cells with a sentinel character instead of a separate visited set. Clean up Trie nodes after finding a word to avoid duplicate results.']
        }
      },
      {
        id: 'ms-dsa-3',
        title: 'Minimum Window Substring',
        difficulty: 'Hard',
        frequency: 95,
        tags: ['Sliding Window', 'Hash Map', 'Two Pointers'],
        input: 's = "ADOBECODEBANC", t = "ABC"',
        output: '"BANC"',
        approach: 'Use a sliding window with two pointers. Expand the right pointer until all characters of t are included, then shrink from left to find the minimum window.',
        time: 'O(S + T) where S = len(s), T = len(t)',
        space: 'O(T) for character frequency map',
        visualizerType: 'sliding-window',
        code: {
          python: `from collections import Counter

class Solution:
    def minWindow(self, s: str, t: str) -> str:
        if not t or not s:
            return ""
        t_count = Counter(t)
        required = len(t_count)
        l, r = 0, 0
        formed = 0
        window_counts = {}
        ans = float('inf'), None, None

        while r < len(s):
            ch = s[r]
            window_counts[ch] = window_counts.get(ch, 0) + 1
            if ch in t_count and window_counts[ch] == t_count[ch]:
                formed += 1
            while l <= r and formed == required:
                ch = s[l]
                if r - l + 1 < ans[0]:
                    ans = (r - l + 1, l, r)
                window_counts[ch] -= 1
                if ch in t_count and window_counts[ch] < t_count[ch]:
                    formed -= 1
                l += 1
            r += 1
        return "" if ans[0] == float('inf') else s[ans[1]:ans[2]+1]`,
          java: `class Solution {
    public String minWindow(String s, String t) {
        if (t.isEmpty() || s.isEmpty()) return "";
        Map<Character, Integer> tCount = new HashMap<>();
        for (char c : t.toCharArray()) tCount.merge(c, 1, Integer::sum);
        int required = tCount.size();
        int l = 0, r = 0, formed = 0;
        Map<Character, Integer> window = new HashMap<>();
        int[] ans = {-1, 0, 0};
        while (r < s.length()) {
            char c = s.charAt(r);
            window.merge(c, 1, Integer::sum);
            if (tCount.containsKey(c) && window.get(c).equals(tCount.get(c))) formed++;
            while (l <= r && formed == required) {
                if (ans[0] == -1 || r - l + 1 < ans[0]) {
                    ans = new int[]{r - l + 1, l, r};
                }
                char lc = s.charAt(l);
                window.merge(lc, -1, Integer::sum);
                if (tCount.containsKey(lc) && window.get(lc) < tCount.get(lc)) formed--;
                l++;
            }
            r++;
        }
        return ans[0] == -1 ? "" : s.substring(ans[1], ans[2] + 1);
    }
}`
        },
        explanation: {
          intuition: 'We need a window in s that contains all characters of t. Expand right to include characters, shrink left to minimize. Track how many unique characters have reached their required count (formed == required means valid window).',
          brute: 'Check every possible substring of s. O(S^2 * T) time — generate all substrings, verify each contains all of t.',
          optimized: 'Sliding window with hash map. Expand right, contract left when valid. O(S + T) time since each character is visited at most twice.',
          dryRun: ['s="ADOBECODEBANC", t="ABC". t_count={A:1,B:1,C:1}', 'Expand r: ADOBEC -> valid window "ADOBEC" (len=6)', 'Shrink l: DOBEC (not valid), move on', 'Expand r: CODEBANC -> valid, shrink to BANC (len=4)', 'Answer: "BANC"'],
          edgeCases: ['t is longer than s (no valid window)', 's contains duplicate characters of t', 's == t (entire string is the answer)', 'No valid window exists'],
          tips: ['The "formed" counter tracks how many unique characters have their required frequency. This avoids checking the entire map each time.']
        }
      },
      {
        id: 'ms-dsa-4',
        title: 'Course Schedule III',
        difficulty: 'Hard',
        frequency: 75,
        tags: ['Greedy', 'Heap', 'Sorting'],
        input: 'courses = [[100,200],[200,1300],[1000,1250],[2000,3200]]',
        output: '3',
        approach: 'Sort courses by deadline, use a max-heap to track taken course durations. If total time exceeds current deadline, remove the longest course.',
        time: 'O(N log N)',
        space: 'O(N)',
        visualizerType: 'sorting',
        code: {
          python: `import heapq

class Solution:
    def scheduleCourse(self, courses: list[list[int]]) -> int:
        courses.sort(key=lambda x: x[1])
        max_heap = []
        total_time = 0

        for duration, last_day in courses:
            if total_time + duration <= last_day:
                heapq.heappush(max_heap, -duration)
                total_time += duration
            elif max_heap and -max_heap[0] > duration:
                total_time += duration + heapq.heappop(max_heap)
                heapq.heappush(max_heap, -duration)

        return len(max_heap)`,
          java: `class Solution {
    public int scheduleCourse(int[][] courses) {
        Arrays.sort(courses, (a, b) -> a[1] - b[1]);
        PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a, b) -> b - a);
        int totalTime = 0;
        for (int[] c : courses) {
            int dur = c[0], deadline = c[1];
            if (totalTime + dur <= deadline) {
                maxHeap.offer(dur);
                totalTime += dur;
            } else if (!maxHeap.isEmpty() && maxHeap.peek() > dur) {
                totalTime += dur - maxHeap.poll();
                maxHeap.offer(dur);
            }
        }
        return maxHeap.size();
    }
}`
        },
        explanation: {
          intuition: 'Sort courses by deadline. Greedily take each course. If we exceed the deadline, remove the longest course taken so far (it has the worst time-to-value ratio). This greedy swap always maintains or improves the count.',
          brute: 'Try all subsets of courses and check feasibility. O(2^N) — exponential and infeasible.',
          optimized: 'Sort by deadline, use max-heap. O(N log N). The heap allows efficient removal of the worst course when we exceed a deadline.',
          dryRun: ['Sorted: [[100,200],[200,1300],[1000,1250],[2000,3200]]', 'Take 100 (total=100, deadline=200) ✓', 'Take 200 (total=300, deadline=1300) ✓', 'Take 1000 (total=1300, deadline=1250) ✗, remove 1000 -> take 1000 instead of 200', 'Actually: remove 200 from heap, total=100+1000=1100 ≤ 1250 ✓', 'Take 2000 (total=3100, deadline=3200) ✓. Heap: [100, 1000, 2000]. Count=3'],
          edgeCases: ['All courses have the same deadline', 'Course duration exceeds its own deadline', 'Single course', 'No courses can be taken'],
          tips: ['The key insight: if we must drop a course, always drop the one with the longest duration. This leaves maximum room for future courses.']
        }
      },
      {
        id: 'ms-dsa-5',
        title: 'Design Add and Search Words Data Structure',
        difficulty: 'Medium',
        frequency: 82,
        tags: ['Trie', 'Depth-First Search', 'Design'],
        input: '["WordDictionary","addWord","addWord","addWord","search","search","search","search"]\n[[],["bad"],["dad"],["mad"],["pad"],["bad"],[".ad"],["b.."]]',
        output: '[null,null,null,null,false,true,true,true]',
        approach: 'Use a Trie for storage. During search, handle dots by branching into all children (DFS), and handle normal characters by following the Trie path.',
        time: 'addWord: O(L), search: O(26^L) worst case with dots, O(L) without',
        space: 'O(N * L) for the Trie',
        visualizerType: 'tree',
        code: {
          python: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class WordDictionary:
    def __init__(self):
        self.root = TrieNode()

    def addWord(self, word: str) -> None:
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end = True

    def search(self, word: str) -> bool:
        def dfs(node, i):
            if i == len(word):
                return node.is_end
            if word[i] == '.':
                for child in node.children.values():
                    if dfs(child, i + 1):
                        return True
                return False
            if word[i] not in node.children:
                return False
            return dfs(node.children[word[i]], i + 1)
        return dfs(self.root, 0)`,
          java: `class TrieNode {
    TrieNode[] children = new TrieNode[26];
    boolean isEnd = false;
}

class WordDictionary {
    private TrieNode root;

    public WordDictionary() { root = new TrieNode(); }

    public void addWord(String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            int idx = c - 'a';
            if (node.children[idx] == null) node.children[idx] = new TrieNode();
            node = node.children[idx];
        }
        node.isEnd = true;
    }

    public boolean search(String word) {
        return dfs(root, word, 0);
    }

    private boolean dfs(TrieNode node, String word, int i) {
        if (i == word.length()) return node.isEnd;
        char c = word.charAt(i);
        if (c == '.') {
            for (TrieNode child : node.children)
                if (child != null && dfs(child, word, i + 1)) return true;
            return false;
        }
        int idx = c - 'a';
        if (node.children[idx] == null) return false;
        return dfs(node.children[idx], word, i + 1);
    }
}`
        },
        explanation: {
          intuition: 'A standard Trie handles exact prefix matching. To support dots, we extend search to DFS: a dot matches any child, branching into up to 26 paths. For plain characters, we follow the single Trie edge as normal.',
          brute: 'For search with dots, generate all possible words by replacing dots with a-z and check each in the Trie. O(26^D) where D = number of dots.',
          optimized: 'DFS through the Trie, branching only at dots. Same worst case but much better average case since we prune early on mismatch. O(L) without dots, O(26^D * L) with D dots.',
          dryRun: ['addWord("bad"): root->b->a->d (isEnd=True)', 'addWord("dad"): root->d->a->d (isEnd=True)', 'search("pad"): p not in root.children -> False', 'search(".ad"): dot branches to all. b->a->d found, return True', 'search("b.."): b->a->d(isEnd) or b->a->? or b->d->d, all valid'],
          edgeCases: ['Word with all dots (worst case, branches everywhere)', 'Empty string search', 'Single character word with dot', 'Add same word twice'],
          tips: ['Prune early: if a TrieNode child is null during dot traversal, skip that branch. This avoids exploring dead paths.']
        }
      },
      {
        id: 'ms-dsa-6',
        title: 'LFU Cache',
        difficulty: 'Hard',
        frequency: 85,
        tags: ['Hash Map', 'Linked List', 'Design'],
        input: '["LFUCache","put","put","get","put","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[3]]',
        output: '[null,null,null,1,null,-1,2]',
        approach: 'Maintain a freq-to-keys mapping (ordered dict) and key-to-(value,freq) mapping. On access, move the key to the next frequency bucket. On eviction, remove the least recently used key from the lowest frequency bucket.',
        time: 'O(1) for get and put',
        space: 'O(capacity)',
        visualizerType: 'graph',
        code: {
          python: `from collections import defaultdict, OrderedDict

class LFUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.key_to_val_freq = {}
        self.freq_to_keys = defaultdict(OrderedDict)
        self.min_freq = 0

    def _update(self, key):
        val, freq = self.key_to_val_freq[key]
        del self.freq_to_keys[freq][key]
        if not self.freq_to_keys[freq]:
            del self.freq_to_keys[freq]
            if self.min_freq == freq:
                self.min_freq += 1
        self.freq_to_keys[freq + 1][key] = None
        self.key_to_val_freq[key] = (val, freq + 1)

    def get(self, key: int) -> int:
        if key not in self.key_to_val_freq:
            return -1
        self._update(key)
        return self.key_to_val_freq[key][0]

    def put(self, key: int, value: int) -> None:
        if self.cap <= 0:
            return
        if key in self.key_to_val_freq:
            self.key_to_val_freq[key] = (value, self.key_to_val_freq[key][1])
            self._update(key)
            return
        if len(self.key_to_val_freq) >= self.cap:
            k, _ = self.freq_to_keys[self.min_freq].popitem(last=False)
            del self.key_to_val_freq[k]
        self.key_to_val_freq[key] = (value, 1)
        self.freq_to_keys[1][key] = None
        self.min_freq = 1`,
          java: `class LFUCache {
    private int cap, minFreq;
    private Map<Integer, int[]> keyToValFreq;
    private Map<Integer, LinkedHashMap<Integer, Void>> freqToKeys;

    public LFUCache(int capacity) {
        this.cap = capacity;
        this.keyToValFreq = new HashMap<>();
        this.freqToKeys = new HashMap<>();
        this.minFreq = 0;
    }

    private void update(int key) {
        int[] vf = keyToValFreq.get(key);
        int val = vf[0], freq = vf[1];
        freqToKeys.get(freq).remove(key);
        if (freqToKeys.get(freq).isEmpty()) {
            freqToKeys.remove(freq);
            if (minFreq == freq) minFreq++;
        }
        freqToKeys.computeIfAbsent(freq + 1, k -> new LinkedHashMap<>()).put(key, null);
        keyToValFreq.put(key, new int[]{val, freq + 1});
    }

    public int get(int key) {
        if (!keyToValFreq.containsKey(key)) return -1;
        update(key);
        return keyToValFreq.get(key)[0];
    }

    public void put(int key, int value) {
        if (cap <= 0) return;
        if (keyToValFreq.containsKey(key)) {
            keyToValFreq.get(key)[0] = value;
            update(key);
            return;
        }
        if (keyToValFreq.size() >= cap) {
            LinkedHashMap<Integer, Void> lowest = freqToKeys.get(minFreq);
            int evict = lowest.keySet().iterator().next();
            lowest.remove(evict);
            keyToValFreq.remove(evict);
        }
        keyToValFreq.put(key, new int[]{value, 1});
        freqToKeys.computeIfAbsent(1, k -> new LinkedHashMap<>()).put(key, null);
        minFreq = 1;
    }
}`
        },
        explanation: {
          intuition: 'LFU needs both frequency tracking and recency tracking within each frequency. The freq_to_keys map groups keys by access count, and within each bucket, LinkedHashMap preserves insertion order (most recent at end). Eviction always targets the least-recently-used key in the lowest frequency bucket.',
          brute: 'On each access, scan all keys to find the one with lowest frequency and oldest access. O(N) per operation.',
          optimized: 'O(1) get/put using two hash maps. freq_to_keys uses OrderedDict (or LinkedHashMap) for O(1) eviction within each frequency bucket. min_freq tracks the current lowest frequency bucket.',
          dryRun: ['put(1,1): key_to_val={1:(1,1)}, freq_to={1:{1}}, min_freq=1', 'put(2,2): key_to_val={1:(1,1),2:(2,1)}, freq_to={1:{1,2}}, min_freq=1', 'get(1): return 1, update: freq_to={1:{2},2:{1}}, min_freq=2', 'put(3,3): evict key 2 (lowest freq, oldest). freq_to={2:{1},3:{3}}', 'get(2): not found, return -1', 'get(3): return 3'],
          edgeCases: ['Capacity 0 (no caching)', 'All keys at same frequency (evict LRU)', 'Get on non-existent key', 'Put existing key (update value, increment freq)'],
          tips: ['The min_freq variable is crucial: it only increases when the current min_freq bucket is emptied. This avoids scanning all frequencies.']
        }
      },
      {
        id: 'ms-dsa-7',
        title: 'Merge k Sorted Lists',
        difficulty: 'Hard',
        frequency: 90,
        tags: ['Heap', 'Linked List', 'Divide and Conquer'],
        input: 'lists = [[1,4,5],[1,3,4],[2,6]]',
        output: '[1,1,2,3,4,4,5,6]',
        approach: 'Use a min-heap of size k containing the head of each list. Extract the minimum, append it to the result, and push the next node from that list into the heap.',
        time: 'O(N log k) where N is total nodes, k is number of lists',
        space: 'O(k) for the heap',
        visualizerType: 'tree',
        code: {
          python: `import heapq

class Solution:
    def mergeKLists(self, lists):
        heap = []
        for i, node in enumerate(lists):
            if node:
                heapq.heappush(heap, (node.val, i, node))

        dummy = ListNode(0)
        curr = dummy
        idx = len(lists)

        while heap:
            val, i, node = heapq.heappop(heap)
            curr.next = node
            curr = curr.next
            if node.next:
                idx += 1
                heapq.heappush(heap, (node.next.val, idx, node.next))

        return dummy.next`,
          java: `class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> a[0] - b[0]);
        for (int i = 0; i < lists.length; i++) {
            if (lists[i] != null)
                heap.offer(new int[]{lists[i].val, i});
        }
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        int idx = lists.length;
        while (!heap.isEmpty()) {
            int[] top = heap.poll();
            int val = top[0], i = top[1];
            curr.next = lists[i];
            curr = curr.next;
            lists[i] = lists[i].next;
            if (lists[i] != null) {
                heap.offer(new int[]{lists[i].val, idx++});
            }
        }
        return dummy.next;
    }
}`
        },
        explanation: {
          intuition: 'At any point, the next smallest element must be the head of one of the k lists. A min-heap of size k lets us efficiently track which head is smallest. After extracting it, we advance that list and re-heapify.',
          brute: 'Compare all k heads repeatedly to find minimum. O(N*k) time — N total nodes, k comparisons per node.',
          optimized: 'Min-heap gives O(log k) extraction and insertion. Total O(N log k). Much better when k is large.',
          dryRun: ['Heap init: [(1,0), (1,1), (2,2)] from lists heads', 'Pop (1,0): append 1, push (4,0). Heap: [(1,1),(2,2),(4,0)]', 'Pop (1,1): append 1, push (3,1). Heap: [(2,2),(3,1),(4,0)]', 'Pop (2,2): append 2, push (6,2). Heap: [(3,1),(4,0),(6,2)]', 'Pop (3,1): append 3, push (4,1). Heap: [(4,0),(4,1),(6,2)]', 'Continue until heap empty. Result: 1->1->2->3->4->4->5->6'],
          edgeCases: ['Some or all lists are empty', 'Single list (k=1)', 'Lists of vastly different lengths', 'All lists have identical values'],
          tips: ['Using tuple (val, index, node) in the heap avoids comparing ListNode objects directly. The index acts as a tiebreaker.']
        }
      },
      {
        id: 'ms-dsa-8',
        title: 'Serialize and Deserialize BST',
        difficulty: 'Medium',
        frequency: 78,
        tags: ['Binary Search Tree', 'Recursion', 'Design'],
        input: 'root = [2,1,3]',
        output: 'serialize: "2,1,3" -> deserialize: [2,1,3]',
        approach: 'Serialize using preorder traversal. Deserialize by using BST bounds: each node must fall within a valid range, which allows us to reconstruct the tree without storing null markers.',
        time: 'Serialize: O(N), Deserialize: O(N)',
        space: 'O(N) for the string and recursion stack',
        visualizerType: 'tree',
        code: {
          python: `class Codec:
    def serialize(self, root):
        def preorder(node):
            if not node:
                return []
            return [str(node.val)] + preorder(node.left) + preorder(node.right)
        return ','.join(preorder(root))

    def deserialize(self, data):
        if not data:
            return None
        vals = iter(data.split(','))

        def build(lo, hi):
            val = next(vals, None)
            if val is None:
                return None
            val = int(val)
            if val < lo or val > hi:
                return None
            node = TreeNode(val)
            node.left = build(lo, val)
            node.right = build(val, hi)
            return node

        return build(float('-inf'), float('inf'))`,
          java: `class Codec {
    public String serialize(TreeNode root) {
        StringBuilder sb = new StringBuilder();
        preorder(root, sb);
        return sb.toString();
    }

    private void preorder(TreeNode node, StringBuilder sb) {
        if (node == null) return;
        if (sb.length() > 0) sb.append(",");
        sb.append(node.val);
        preorder(node.left, sb);
        preorder(node.right, sb);
    }

    public TreeNode deserialize(String data) {
        if (data.isEmpty()) return null;
        Queue<String> q = new LinkedList<>(Arrays.asList(data.split(",")));
        return build(q, Integer.MIN_VALUE, Integer.MAX_VALUE);
    }

    private TreeNode build(Queue<String> q, int lo, int hi) {
        if (q.isEmpty()) return null;
        int val = Integer.parseInt(q.peek());
        if (val < lo || val > hi) return null;
        q.poll();
        TreeNode node = new TreeNode(val);
        node.left = build(q, lo, val);
        node.right = build(q, val, hi);
        return node;
    }
}`
        },
        explanation: {
          intuition: 'BST property means left children < parent < right children. During deserialization, we use min/max bounds: if a value falls outside the current bounds, it cannot be part of this subtree, so return null. This eliminates the need for null markers in the serialized string.',
          brute: 'Serialize with preorder + markers for null nodes (like any binary tree). Works but produces longer strings and doesn\'t leverage BST property.',
          optimized: 'Serialize with preorder only (no null markers needed). Deserialize using BST bounds: each node must be within (lo, hi). This produces compact serialization and efficient reconstruction.',
          dryRun: ['Serialize [2,1,3]: preorder -> "2,1,3"', 'Deserialize "2,1,3":', 'build(-inf, inf): val=2, lo=-inf < 2 < inf ✓. Node(2)', 'build(-inf, 2): val=1, -inf < 1 < 2 ✓. Node(1)', 'build(-inf, 1): val=3, 3 > 1, return null (goes to right of 1)', 'build(1, 2): val=3, 3 > 2, return null (left of 2 done)', 'build(2, inf): val=3, 2 < 3 < inf ✓. Node(3)'],
          edgeCases: ['Empty tree', 'Single node', 'Skewed BST (all left or all right)', 'BST with duplicate values (depends on convention)'],
          tips: ['The bounds approach is unique to BST serialization. For a generic binary tree, you must include null markers. This is a common follow-up question.']
        }
      }
    ],
    technical: [
      {
        id: 'ms-t-1',
        category: 'System Design',
        difficulty: 'Advanced',
        frequency: 95,
        question: 'Design Azure Blob Storage. How do you ensure high availability and durability of the data?',
        answer: 'Azure Blob Storage is a distributed object storage system designed for massive scalability. The architecture separates the control plane (metadata) from the data plane (actual blob data). Metadata is managed by partitioned services backed by Azure SQL, while blob data is stored across fault domains using either 3-way replication or erasure coding (Locally Redundant Storage / Geo-Redundant Storage). Data is chunked into blocks (4MB for block blobs) and distributed via a consistent hashing ring across storage nodes. Write path: client -> load balancer -> partition resolver -> storage node -> replicate to 2 additional nodes -> ack. Read path supports range reads via block-level addressing. Azure uses a lease mechanism for optimistic concurrency on block blobs. Availability is ensured through health monitoring with heartbeats and automatic failover to secondary replicas. Durability is achieved via journaling (Write-Ahead Log) and periodic integrity checks (scrubbing). For large accounts, Azure uses a hierarchical namespace (Data Lake Storage Gen2) that maps blobs to a virtual file system backed by Azure Data Lake.',
        keyPoints: ['Control plane / data plane separation', 'Consistent hashing for data distribution', 'Erasure coding vs 3x replication trade-offs', 'Write-Ahead Log for durability', 'Health monitoring and automatic failover', 'Block blob chunking and range reads'],
        followUps: ['How do you handle small files efficiently without wasting storage on erasure coding overhead?', 'What happens when a storage node fails mid-write? How do you ensure consistency?', 'How does Azure handle the hot partition problem for very popular blobs?']
      },
      {
        id: 'ms-t-2',
        category: 'System Design',
        difficulty: 'Advanced',
        frequency: 92,
        question: 'Design a real-time collaborative text editor like Office 365 Word Online.',
        answer: 'The core challenge is resolving concurrent edits from multiple users without locks. I would use Operational Transformation (OT) for its proven track record in Google Docs and Office 365. Architecture: Client-side editor captures local operations and sends them to a central server via WebSockets. The server assigns a monotonically increasing version number and broadcasts the operation to all connected clients after transforming it against concurrent operations. Each client maintains an operation log and transforms incoming operations against their own pending local operations. The server persists document state snapshots to Azure Cosmos DB periodically and the full operation log to Azure Blob Storage. For offline support, operations are queued locally and synchronized when reconnected using a vector clock for conflict detection. Presence information (cursors, selections) is broadcast via a separate lightweight WebSocket channel and is not persisted. Scaling: shard documents across servers by document ID, use Redis pub/sub for cross-server broadcasting of operations within the same document.',
        keyPoints: ['Operational Transformation (OT) or CRDTs for conflict resolution', 'WebSocket full-duplex communication', 'Server as total-order authority', 'Operation log and periodic snapshots', 'Offline sync with vector clocks', 'Redis pub/sub for cross-server broadcast'],
        followUps: ['How does OT handle two operations targeting the exact same character position simultaneously?', 'How would you handle a user who has been offline for hours with thousands of pending operations?', 'What are the trade-offs between OT and CRDTs for this use case?']
      },
      {
        id: 'ms-t-3',
        category: 'Language / Core',
        difficulty: 'Advanced',
        frequency: 88,
        question: 'Explain the internals of Azure Active Directory (Entra ID) authentication and how it handles token lifecycle management.',
        answer: 'Azure AD uses OAuth 2.0 and OpenID Connect protocols. The authentication flow: User authenticates via identity provider (username/password, MFA, federated). Azure AD validates credentials against its user store (partitioned by tenant), evaluates conditional access policies (device compliance, location, risk score), and issues a JWT access token signed with Azure AD\'s private key. The token contains claims (user identity, tenant, scopes, expiry). Token lifecycle: Access tokens expire in 1 hour by default. Refresh tokens expire in 90 days (sliding window) and are stored in the client\'s browser session or mobile secure storage. On refresh, Azure AD validates the refresh token against its token store (backed by Azure Cosmos DB), checks revocation lists, and issues new token pairs. For confidential clients (web apps), Azure AD supports the client credentials flow with certificate-based authentication. Token revocation uses a distributed cache that propagates revocation events across Azure AD replicas within 5 minutes. Session management uses persistent browser sessions with conditional access re-evaluation on each token refresh.',
        keyPoints: ['OAuth 2.0 / OpenID Connect protocol flow', 'JWT token structure (header, payload, signature)', 'Access token vs refresh token lifecycle', 'Conditional access policy evaluation', 'Token revocation propagation', 'Certificate-based authentication for confidential clients'],
        followUps: ['How does Azure AD handle token replay attacks?', 'What happens when a user\'s password is changed while they have active tokens?', 'How does Azure AD achieve sub-100ms authentication latency globally?']
      },
      {
        id: 'ms-t-4',
        category: 'System Design',
        difficulty: 'Advanced',
        frequency: 90,
        question: 'Design the messaging backend for Microsoft Teams. How do you handle channels, DMs, and @mentions at scale?',
        answer: 'Teams messaging handles billions of messages daily. Architecture: Message ingestion uses Azure Event Hubs as a buffer for incoming messages. A set of stateless message processors consume from partitions, validate permissions, enrich messages (mentions, reactions, threads), and write to Azure Cosmos DB (partitioned by channel/thread ID) for persistence. Real-time delivery uses Azure Web PubSub (WebSocket service) with channels mapped to connection groups. Each client subscribes to their user-specific channel across all teams/channels they belong to. Thread model: Each channel has a root thread, and replies are threaded. Messages reference parent message IDs. @mentions are parsed at ingestion time; mentioned users receive push notifications via Azure Notification Hubs (mobile) or desktop toast notifications. Message ordering uses a per-partition sequence number. Deletion and editing use soft-delete with audit trail. Message search is handled by Azure Cognitive Search (full-text indexing) with near-real-time sync from Cosmos DB via Change Feed. File sharing uses Azure Blob Storage with Teams-specific metadata. Voice/video calling is routed through Azure Communication Services.',
        keyPoints: ['Event Hubs for ingestion buffering', 'Cosmos DB for message persistence (partition by channel)', 'WebSocket service for real-time delivery', 'Thread-based message model', 'Mention parsing and push notification routing', 'Azure Cognitive Search for message search'],
        followUps: ['How do you handle message ordering when a user sends messages from multiple devices simultaneously?', 'How does Teams handle the "last 50 messages" load for a channel with millions of messages?', 'What happens when a user is added to a channel mid-conversation?']
      },
      {
        id: 'ms-t-5',
        category: 'Cloud / Azure',
        difficulty: 'Advanced',
        frequency: 85,
        question: 'How would you design a disaster recovery strategy for an Azure application spanning multiple regions? Explain failover mechanisms.',
        answer: 'Multi-region DR strategy uses active-passive or active-active patterns. For active-passive: Primary region serves all traffic. Data is replicated asynchronously to the secondary region using Azure Cosmos DB multi-region writes or Azure SQL geo-replication. Traffic Manager (DNS-based) routes to primary. On failure detection (health probes fail for 3 consecutive checks, ~3 minutes), Traffic Manager updates DNS to point to secondary. Failover steps: 1) DNS TTL expires (5 min), 2) Traffic Manager redirects to secondary, 3) Secondary promotes read replicas to primary, 4) Application instances in secondary warm up connection pools and caches, 5) Clients reconnect. RPO (Recovery Point Objective) depends on replication lag (~seconds for Cosmos DB, ~5 min for SQL). RTO (Recovery Time Objective) is typically 5-15 minutes. For active-active: Both regions serve reads, writes are routed to the home region or handled with conflict resolution (last-writer-wins or custom merge). Azure Front Door provides global load balancing with path-based routing. Data consistency: use Azure Cosmos DB with multi-region writes and conflict resolution policy. For stateful services, use Azure Cache for Redis with geo-replication. Automated runbooks in Azure Automation trigger failover procedures. Regular DR drills are essential — Azure Chaos Studio can simulate region failures.',
        keyPoints: ['Active-passive vs active-active patterns', 'Azure Traffic Manager for DNS-based failover', 'Cosmos DB multi-region writes', 'RPO/RTO targets and replication lag', 'Azure Front Door for global load balancing', 'Chaos engineering for DR testing'],
        followUps: ['How do you handle split-brain scenarios when both regions think they are primary?', 'What is the impact on active WebSocket connections during a regional failover?', 'How do you ensure zero data loss during failover?']
      },
      {
        id: 'ms-t-6',
        category: 'DevOps',
        difficulty: 'Intermediate',
        frequency: 82,
        question: 'How would you design a CI/CD pipeline for a microservices application deployed on Azure Kubernetes Service (AKS)?',
        answer: 'Pipeline architecture using Azure DevOps or GitHub Actions: 1) Source stage: On PR, run linting (ESLint/flake8), unit tests, and security scanning (Snyk/Defender for containers). 2) Build stage: Build Docker images, push to Azure Container Registry (ACR) with unique tags (git SHA + semantic version). Run Trivy for container vulnerability scanning. 3) Integration test stage: Deploy to a staging AKS namespace using Helm charts. Run contract tests (Pact) and end-to-end tests (Cypress/Playwright). 4) Approval gate: Manual or automated approval based on test pass rate. 5) Canary deployment: Deploy new version to canary namespace (10% traffic). Monitor error rates, latency, and CPU/memory via Azure Monitor/Prometheus. 6) Full rollout: If canary passes (5 min soak), gradually increase traffic to 25%, 50%, 100%. Use Kubernetes rolling update strategy with maxSurge=1, maxUnavailable=0. 7) Rollback: If metrics degrade, automatically rollback to previous ReplicaSet. Infrastructure as Code: Terraform for AKS cluster provisioning, Helm for application deployment. Secrets managed via Azure Key Vault with CSI driver. GitOps approach: ArgoCD watches Git repo and syncs AKS state.',
        keyPoints: ['Container scanning and vulnerability assessment', 'Canary deployment strategy', 'Azure Monitor / Prometheus for health metrics', 'Helm charts for templated deployments', 'GitOps with ArgoCD', 'Automated rollback on metric degradation'],
        followUps: ['How do you handle database schema migrations in a zero-downtime deployment?', 'How do you manage secrets rotation without restarting pods?', 'What happens if the canary deployment causes data corruption?']
      },
      {
        id: 'ms-t-7',
        category: 'System Design',
        difficulty: 'Advanced',
        frequency: 87,
        question: 'Design Microsoft Graph API. How do you handle querying across multiple Microsoft 365 services with a single unified endpoint?',
        answer: 'Microsoft Graph is a unified REST API that aggregates data from Exchange, SharePoint, OneDrive, Teams, Azure AD, and more. Architecture: An API gateway handles authentication (OAuth 2.0 token validation), rate limiting, and request routing. Request parsing: The Graph query language (OData-based) is parsed into an internal AST. A query planner decomposes the request into sub-queries targeting individual service backends (e.g., /me/messages goes to Exchange, /me/drive goes to OneDrive). Each service backend has an adapter that translates Graph queries to native service API calls. Cross-service queries (e.g., /me/messages?$expand=attachments) require fan-out to multiple backends and result merging. Caching: Two-tier cache — L1 in-memory (per-Gateway instance, 30s TTL) for hot paths, L2 Azure Cache for Redis (clustered, 5 min TTL) for cross-instance sharing. Pagination uses delta tokens and skip/top for large result sets. Rate limiting uses a token bucket algorithm per-app/per-user. Response shaping: The Graph API supports $select, $expand, $filter, $orderby, and $search query parameters, which are translated to native API equivalents by each adapter. Error handling follows OData error format with machine-readable error codes.',
        keyPoints: ['Unified REST API gateway with OData query language', 'Service adapter pattern for backend integration', 'Two-tier caching (in-memory + Redis)', 'Token bucket rate limiting', 'Delta queries for incremental sync', 'Fan-out and merge for cross-service queries'],
        followUps: ['How do you handle eventual consistency when aggregating data from services with different consistency guarantees?', 'How does the Graph API handle batching of multiple operations in a single request?', 'What is the impact of adding a new Microsoft 365 service to the Graph API?']
      },
      {
        id: 'ms-t-8',
        category: 'Database',
        difficulty: 'Advanced',
        frequency: 80,
        question: 'How would you optimize query performance in SQL Server for a database serving millions of queries per day? Walk through your approach.',
        answer: 'Systematic optimization approach: 1) Identify slow queries: Enable Query Store to capture execution plans and runtime statistics. Focus on queries with high CPU, duration, or logical reads. 2) Index optimization: Analyze missing index DMVs (sys.dm_db_missing_index_details). Create covering indexes for frequently queried columns. Use filtered indexes for selective queries (e.g., WHERE Status = \'Active\'). Avoid over-indexing — each index adds write overhead. 3) Execution plan analysis: Look for key lookups (add covering index), table scans (add appropriate index), hash joins on large tables (consider temp table materialization), and parameter sniffing (use OPTIMIZE FOR hints or plan guides). 4) Statistics: Ensure AUTO_UPDATE_STATISTICS is enabled. For large tables, use incremental statistics. Update statistics weekly or after bulk operations. 5) Partitioning: Partition large tables by date range (e.g., orders by month). Partition-aligned indexes reduce scan scope. Use partition elimination in queries. 6) Query rewriting: Replace cursors with set-based operations. Use window functions instead of self-joins. Break complex queries into temp tables for intermediate materialization. 7) TempDB optimization: Multiple data files (1 per 4 CPU cores), place on fast storage. Monitor tempdb contention via PAGELATCH waits. 8) Memory: Set max server memory appropriately. Use memory-optimized tables for hot path tables. Monitor buffer cache hit ratio (target > 99%).',
        keyPoints: ['Query Store for identifying slow queries', 'Covering indexes and filtered indexes', 'Execution plan analysis (key lookups, table scans)', 'Statistics maintenance and parameter sniffing', 'Table partitioning for large tables', 'TempDB optimization and memory configuration'],
        followUps: ['How do you handle a query that is fast in dev but slow in production due to parameter sniffing?', 'How do you decide between a clustered columnstore index vs a traditional B-tree index for an analytics workload?', 'How do you minimize the impact of index maintenance on production workload?']
      }
    ],
    hr: [
      {
        id: 'ms-hr-1',
        question: 'Tell me about a time you demonstrated a growth mindset and learned something new to solve a problem.',
        modelAnswer: 'I was assigned to a project that required building a real-time data pipeline using Apache Kafka, which I had never used before. Instead of asking to be moved off the project, I dedicated two weeks to learning Kafka through Microsoft Learn modules and built a proof-of-concept. I then designed the production pipeline with exactly-once semantics, partitioned by customer ID for parallel processing. The pipeline processed 2 million events per minute with sub-second latency. My manager recognized this as embodying the growth mindset, and I later became the team\'s go-to person for event-driven architecture.',
        aiTips: 'Demonstrate intellectual curiosity and the willingness to step outside your comfort zone. Microsoft values people who say "I don\'t know yet" instead of "I can\'t." Show how learning new skills led to tangible business impact.',
        starTips: {
          situation: 'Our team needed to migrate from batch processing to real-time streaming, but nobody on the team had Kafka experience.',
          task: 'I volunteered to learn Apache Kafka from scratch and design the production pipeline architecture.',
          action: 'Completed Microsoft Learn Kafka modules, built a PoC with 3 brokers and topic partitioning, then iterated on the design with peer reviews.',
          result: 'Delivered the pipeline processing 2M events/min with exactly-once semantics. Reduced data latency from 15 minutes to under 1 second. Became the team\'s Kafka SME.'
        }
      },
      {
        id: 'ms-hr-2',
        question: 'Describe a time you had to collaborate across multiple teams to deliver a result. How did you ensure alignment?',
        modelAnswer: 'Our product required integration with Azure Active Directory for SSO, the Office 365 team for calendar sync, and the Teams team for notification delivery. I organized a weekly cross-team sync with a shared technical design document in Azure DevOps. I created an API contract first (OpenAPI spec) so teams could work in parallel. When the Teams notification service changed their API mid-sprint, I proposed an adapter pattern so our code was insulated from the change. We delivered the integration two weeks ahead of schedule.',
        aiTips: 'Microsoft operates in a matrix organization. Show that you can influence without authority, communicate technical decisions clearly, and keep multiple stakeholders aligned. Emphasize shared ownership of outcomes.',
        starTips: {
          situation: 'A new feature required coordination across three separate engineering teams (Identity, Office 365, Teams) with different sprint cadences.',
          task: 'I needed to align all three teams on a unified API contract and delivery timeline within 8 weeks.',
          action: 'Created a shared API specification, set up weekly syncs with representatives from each team, and introduced an adapter pattern to isolate teams from each other\'s API changes.',
          result: 'Delivered the integration 2 weeks early. The adapter pattern prevented 3 rework cycles when the Teams API changed. The cross-team process I established was adopted as a template for future integrations.'
        }
      },
      {
        id: 'ms-hr-3',
        question: 'Tell me about a time you worked on a project with ambiguous or incomplete requirements. How did you handle it?',
        modelAnswer: 'I was asked to "improve the performance of our internal dashboard" with no specific metrics or targets. I started by instrumenting the existing dashboard with Application Insights to gather baseline metrics: page load time, API call durations, and database query times. After one week of data collection, I discovered that 70% of the load time came from a single unindexed database query. I created a data-driven proposal with three options: add an index (1 day, 80% improvement), cache the query in Redis (2 days, 95% improvement), or redesign the API (2 weeks, 99% improvement). The team chose option 2, and I delivered it in 3 days.',
        aiTips: 'Show that you create structure from ambiguity rather than waiting for perfect information. Emphasize data-driven decision making and breaking vague problems into concrete, measurable sub-problems.',
        starTips: {
          situation: 'Product leadership asked to "make the dashboard faster" but gave no specific targets, timeline, or definition of "fast."',
          task: 'I needed to identify the actual performance bottleneck, define measurable goals, and propose a concrete solution.',
          action: 'Instrumented the dashboard with Application Insights, collected baseline metrics for one week, identified the root cause (unindexed query), and proposed three solutions with effort/impact trade-offs.',
          result: 'Delivered 95% load time reduction (from 8s to 0.4s) in 3 days using Redis caching. Established a performance baseline and monitoring dashboard that the team now uses for all performance work.'
        }
      },
      {
        id: 'ms-hr-4',
        question: 'Describe a time you had to push back on a technical decision or a leader\'s direction. How did you approach it?',
        modelAnswer: 'Our VP proposed migrating our monolithic application to microservices within one quarter. I prepared a risk assessment showing that a big-bang migration would take 6+ months and risked data consistency issues. I proposed an incremental "strangler fig" approach: extract 2 services first, prove the pattern, then scale. I presented this with a cost comparison and a phased timeline. The VP agreed to the phased approach. Six months later, all services were migrated with zero downtime, and the team had learned microservices patterns incrementally rather than all at once.',
        aiTips: 'Show respectful disagreement backed by data. Microsoft values people who challenge the status quo with evidence. Focus on the outcome for the customer and the team, not on being right.',
        starTips: {
          situation: 'Our VP directed an aggressive microservices migration timeline that I believed was technically risky and would compromise quality.',
          task: 'I needed to respectfully push back with a data-driven alternative while maintaining trust with leadership.',
          action: 'Prepared a risk assessment with migration complexity estimates, proposed a strangler fig incremental approach, and presented a cost-benefit analysis comparing both strategies.',
          result: 'Convinced leadership to adopt the phased approach. Migration completed in 6 months (vs. the proposed 1 quarter) with zero downtime. The incremental approach also served as a learning opportunity for the team.'
        }
      },
      {
        id: 'ms-hr-5',
        question: 'Tell me about a time you made a significant impact on customers through your work.',
        modelAnswer: 'I noticed that our SaaS application had a 23% churn rate in the first 30 days. I hypothesized that users were dropping off because the onboarding flow was too complex. I conducted user interviews with 15 churned customers, analyzed funnel analytics, and discovered that 60% dropped off at the "connect your data source" step. I redesigned the onboarding to include a guided wizard with pre-configured templates for common data sources. I also added in-app tooltips and a progress indicator. After A/B testing with 500 users, the new flow had a 40% higher completion rate. We rolled it out to all users, and 30-day churn dropped from 23% to 14% within two months.',
        aiTips: 'Microsoft\'s mission is to empower every person and every organization. Show that you connect your technical work to customer outcomes. Use data to validate your hypotheses and measure impact.',
        starTips: {
          situation: 'Our SaaS product had a 23% churn rate in the first 30 days, significantly impacting revenue and customer satisfaction.',
          task: 'I needed to identify the root cause of early churn and design a solution that would measurably improve customer retention.',
          action: 'Conducted 15 customer interviews, analyzed funnel analytics, identified the "connect data source" step as the drop-off point, and redesigned the onboarding with guided wizards and templates.',
          result: 'Reduced 30-day churn from 23% to 14% (39% improvement). The guided onboarding flow became the standard pattern for all new product features. Net Promoter Score increased by 12 points.'
        }
      },
      {
        id: 'ms-hr-6',
        question: 'Describe a time you made a mistake or failed at something. How did you handle it and what did you learn?',
        modelAnswer: 'I pushed a database migration to production that dropped a column used by a downstream reporting service. The reporting pipeline broke, and 3 dashboards went dark for 4 hours. I immediately rolled back the migration, restored the column, and verified all dashboards were back. In the post-mortem, I took full ownership and identified that I hadn\'t checked the dependency graph. I then proposed and implemented a pre-deployment checklist that includes querying the information schema for dependent objects, and I set up a schema change review process that requires sign-off from downstream service owners. We haven\'t had a similar incident since.',
        aiTips: 'Microsoft\'s culture encourages learning from mistakes. Show accountability without deflecting blame. Focus on the systemic improvements you made to prevent recurrence, not just the fix.',
        starTips: {
          situation: 'I deployed a database migration that dropped a column without verifying downstream dependencies, causing 3 reporting dashboards to fail for 4 hours.',
          task: 'I needed to restore service immediately and implement systemic safeguards to prevent this from happening again.',
          action: 'Rolled back the migration within 15 minutes, restored the column, verified dashboards. Led a blameless post-mortem, proposed a pre-deployment dependency check, and implemented a schema change review process.',
          result: 'Service restored in 4 hours. The pre-deployment checklist and review process have prevented 5 similar incidents over the next year. The process was adopted by 3 other teams.'
        }
      },
      {
        id: 'ms-hr-7',
        question: 'Tell me about a time you had to innovate or find a creative solution under constraints (time, budget, or resources).',
        modelAnswer: 'We needed to process 50 million historical records for a compliance audit, but our data engineering team was at capacity and the deadline was in 2 weeks. Instead of waiting, I built a serverless pipeline using Azure Functions and Azure Queue Storage. I wrote a Python function that processed records in batches of 1000, used Azure Queue for retry logic, and stored results in Cosmos DB. The entire pipeline cost $12 in Azure compute (vs. $50K for a dedicated Spark cluster). I ran it over a weekend and delivered the audit report 3 days early. This approach was later adopted as the standard pattern for ad-hoc data processing tasks.',
        aiTips: 'Show resourcefulness and creative problem-solving. Microsoft values people who can deliver results with constraints. Emphasize cost efficiency and reusability of your solution.',
        starTips: {
          situation: 'A compliance audit required processing 50 million records in 2 weeks, but our data engineering team was at full capacity on other critical projects.',
          task: 'I needed to deliver the audit data on time without adding headcount or waiting for team availability.',
          action: 'Designed a serverless pipeline using Azure Functions for compute, Queue Storage for retry/backoff, and Cosmos DB for results. Processed records in 1000-record batches with automatic retry on failure.',
          result: 'Delivered 3 days early at $12 total cost (vs. $50K estimated for Spark). The serverless pattern was adopted as the standard for ad-hoc processing. Saved the company $50K in infrastructure costs for similar tasks.'
        }
      },
      {
        id: 'ms-hr-8',
        question: 'Why do you want to work at Microsoft? How does our mission resonate with you?',
        modelAnswer: 'Microsoft\'s mission to "empower every person and every organization on the planet to achieve more" resonates deeply with me because I grew up in a community where access to technology transformed educational outcomes. I saw firsthand how tools like Microsoft 365 and Azure enabled small businesses to compete with larger enterprises. Specifically, I\'m drawn to Microsoft\'s growth mindset culture — the idea that abilities can be developed through dedication and learning. In my current role, I\'ve embodied this by learning Azure cloud services from scratch and leading our team\'s cloud migration. I want to be at a company where continuous learning is valued, where diverse perspectives drive better products, and where the technology I build can reach billions of users worldwide.',
        aiTips: 'Connect your personal values to Microsoft\'s mission. Show that you understand Microsoft\'s culture (growth mindset, empathy, diversity). Be specific about which Microsoft products or initiatives excite you and why.',
        starTips: {
          situation: 'Microsoft\'s mission to empower every person and every organization globally resonates with my personal experience growing up in an underserved community where technology access was transformative.',
          task: 'I want to contribute to a company whose mission aligns with my values and where I can have a global impact on billions of users.',
          action: 'I have actively embraced the growth mindset by learning Azure cloud services, leading a cloud migration, and mentoring junior engineers. I have also volunteered teaching coding to underserved students.',
          result: 'My growth mindset journey has prepared me to thrive at Microsoft. I am excited to contribute to products that empower organizations worldwide and to learn from Microsoft\'s culture of empathy and continuous improvement.'
        }
      }
    ]
  },
  {
    id: 'tesla',
    name: 'Tesla',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png',
    industry: 'Automotive & AI',
    hiringRoles: ['Embedded Engineer', 'AI/Vision Engineer', 'Firmware Engineer'],
    interviewRounds: ['Online Assessment', 'Core Systems/C++ Screen', 'Hardcore Technical Onsite'],
    salaryRange: '₹22L - ₹45L',
    brandColor: '#E82127',
    culture: 'Hardcore Engineering, First Principles, Fast Execution',
    difficulty: 'Elite',
    completion: 0,
    stats: { placed: '34', avgpackage: '30.0 LPA' },
    founders: [
      { name: 'Elon Musk', title: 'CEO & Product Architect', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/250px-Elon_Musk_Royal_Society_%28crop2%29.jpg' },
      { name: 'Martin Eberhard', title: 'Co-founder', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Martin_Eberhard_%28cropped%29.jpg/250px-Martin_Eberhard_%28cropped%29.jpg' }
    ],
    focus: 'Accelerating the world\'s transition to sustainable energy through EVs and AI-driven robotics.',
    motto: '"To accelerate the world\'s transition to sustainable energy."',
    hiringPhilosophy: 'We hire hardcore engineers who operate on First Principles thinking, possessing a track record of exceptional achievement and a willingness to solve impossible problems.',
    dsa: [
      {
        id: 't-dsa-1',
        title: 'LRU Cache for Vehicle Telemetry',
        difficulty: 'Intermediate',
        frequency: 85,
        tags: ['Linked List', 'Hash Map', 'Design'],
        input: 'capacity = 2, put(1, 1), put(2, 2), get(1), put(3, 3), get(2)',
        output: '1, -1',
        approach: 'Use a HashMap for O(1) key lookup and a Doubly Linked List for O(1) eviction of least recently used entries. The DLL maintains access order: every get or put moves the node to the head.',
        time: 'O(1) for both get and put',
        space: 'O(capacity)',
        visualizerType: 'linked-list',
        code: {
          python: `class Node:
    def __init__(self, key=0, val=0):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.cache = {}
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_to_head(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        if key not in self.cache:
            return -1
        node = self.cache[key]
        self._remove(node)
        self._add_to_head(node)
        return node.val

    def put(self, key, val):
        if key in self.cache:
            self._remove(self.cache[key])
        node = Node(key, val)
        self.cache[key] = node
        self._add_to_head(node)
        if len(self.cache) > self.cap:
            lru = self.tail.prev
            self._remove(lru)
            del self.cache[lru.key]

cache = LRUCache(2)
cache.put(1, 1)
cache.put(2, 2)
print(cache.get(1))
cache.put(3, 3)
print(cache.get(2))`,
          java: `class Node {
    int key, val;
    Node prev, next;
    Node(int k, int v) { key = k; val = v; }
}

class LRUCache {
    private int cap;
    private Map<Integer, Node> map = new HashMap<>();
    private Node head = new Node(0, 0);
    private Node tail = new Node(0, 0);

    public LRUCache(int capacity) {
        cap = capacity;
        head.next = tail;
        tail.prev = head;
    }

    private void remove(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private void addFirst(Node node) {
        node.next = head.next;
        node.prev = head;
        head.next.prev = node;
        head.next = node;
    }

    public int get(int key) {
        if (!map.containsKey(key)) return -1;
        Node node = map.get(key);
        remove(node);
        addFirst(node);
        return node.val;
    }

    public void put(int key, int val) {
        if (map.containsKey(key)) remove(map.get(key));
        Node node = new Node(key, val);
        map.put(key, node);
        addFirst(node);
        if (map.size() > cap) {
            Node lru = tail.prev;
            remove(lru);
            map.remove(lru.key);
        }
    }
}`
        },
        explanation: {
          intuition: 'Vehicle telemetry systems process thousands of sensor readings per second. An LRU cache ensures the most recently queried telemetry data stays in memory while stale data is evicted. HashMap gives O(1) access, DLL gives O(1) reordering.',
          brute: 'Use an array to store entries. On each access, scan the array to find and move the element. O(N) per operation.',
          optimized: 'HashMap maps keys to DLL nodes. DLL maintains order. Both get and put are O(1) since we can directly access and move nodes.',
          dryRun: [
            'put(1,1): cache={1:node1}, DLL: head->1->tail',
            'put(2,2): cache={1:node1,2:node2}, DLL: head->2->1->tail',
            'get(1): Found key 1, move to head. DLL: head->1->2->tail. Return 1.',
            'put(3,3): Cache full (cap=2), evict LRU (key 2). cache={1:node1,3:node3}. DLL: head->3->1->tail.',
            'get(2): Key 2 not in cache. Return -1.'
          ],
          edgeCases: ['Capacity 0 (should handle gracefully)', 'Updating an existing key (should move to head, update value)', 'Single capacity cache'],
          tips: ['Use dummy head and tail sentinel nodes to avoid null pointer edge cases. Always store the key in the DLL node so you can delete from the hashmap on eviction.']
        }
      },
      {
        id: 't-dsa-2',
        title: 'Sliding Window Maximum',
        difficulty: 'Hard',
        frequency: 92,
        tags: ['Deque', 'Sliding Window', 'Monotonic'],
        input: 'nums = [1,3,-1,-3,5,3,6,7], k = 3',
        output: '[3,3,5,5,6,7]',
        approach: 'Maintain a monotonic deque of indices where values are in decreasing order. The front of the deque is always the max for the current window. Remove indices outside the window from front, and remove smaller values from back.',
        time: 'O(N) - each element enters and leaves deque at most once',
        space: 'O(k) for the deque',
        visualizerType: 'sliding-window',
        code: {
          python: `from collections import deque

def max_sliding_window(nums, k):
    dq = deque()
    result = []
    for i in range(len(nums)):
        while dq and dq[0] < i - k + 1:
            dq.popleft()
        while dq and nums[dq[-1]] < nums[i]:
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            result.append(nums[dq[0]])
    return result

print(max_sliding_window([1,3,-1,-3,5,3,6,7], 3))
# Output: [3, 3, 5, 5, 6, 7]`,
          java: `import java.util.*;

public int[] maxSlidingWindow(int[] nums, int k) {
    Deque<Integer> dq = new ArrayDeque<>();
    int[] result = new int[nums.length - k + 1];
    for (int i = 0; i < nums.length; i++) {
        while (!dq.isEmpty() && dq.peekFirst() < i - k + 1) {
            dq.pollFirst();
        }
        while (!dq.isEmpty() && nums[dq.peekLast()] < nums[i]) {
            dq.pollLast();
        }
        dq.offerLast(i);
        if (i >= k - 1) {
            result[i - k + 1] = nums[dq.peekFirst()];
        }
    }
    return result;
}`
        },
        explanation: {
          intuition: 'For vehicle sensor windows, we need the max value in each k-element window efficiently. A monotonic deque stores only potentially useful candidates - elements that could become the max in future windows.',
          brute: 'For each window, scan all k elements to find max. O(N * k) time.',
          optimized: 'Monotonic deque maintains decreasing values. Front is always the current max. Each element enters and leaves deque once, giving O(N).',
          dryRun: [
            'i=0, val=1: deque=[0]. No window yet.',
            'i=1, val=3: Pop 0 (1<3), deque=[1]. No window yet.',
            'i=2, val=-1: -1 < 3, keep. deque=[1,2]. Window [1,3,-1]. Max=nums[1]=3.',
            'i=3, val=-3: -3 < -1, keep. deque=[1,2,3]. Window [3,-1,-3]. Max=nums[1]=3.',
            'i=4, val=5: Pop 3,2,1 (all <5). deque=[4]. Window [-1,-3,5]. Max=5.',
            'i=5, val=3: 3 < 5, keep. deque=[4,5]. Window [-3,5,3]. Max=5.',
            'i=6, val=6: Pop 5,4 (3<6, 5<6). deque=[6]. Window [5,3,6]. Max=6.',
            'i=7, val=7: Pop 6 (6<7). deque=[7]. Window [3,6,7]. Max=7.'
          ],
          edgeCases: ['k equals array length (return single max)', 'k = 1 (return original array)', 'All elements identical'],
          tips: ['The deque stores indices, not values, so you can check if the front index is still within the window. Never push an index if the value at the back is smaller - it will never be the max.']
        }
      },
      {
        id: 't-dsa-3',
        title: 'Trapping Rain Water',
        difficulty: 'Hard',
        frequency: 88,
        tags: ['Two Pointers', 'Array', 'Stack'],
        input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
        output: '6',
        approach: 'Use two pointers from both ends. Track left_max and right_max. At each step, process the pointer with the smaller max - water trapped = max - height at that position.',
        time: 'O(N) single pass',
        space: 'O(1)',
        visualizerType: 'rain-water',
        code: {
          python: `def trap(height):
    if not height:
        return 0
    left, right = 0, len(height) - 1
    left_max, right_max = height[left], height[right]
    water = 0
    while left < right:
        if left_max < right_max:
            left += 1
            left_max = max(left_max, height[left])
            water += left_max - height[left]
        else:
            right -= 1
            right_max = max(right_max, height[right])
            water += right_max - height[right]
    return water

print(trap([0,1,0,2,1,0,1,3,2,1,2,1]))  # Output: 6`,
          java: `public int trap(int[] height) {
    int left = 0, right = height.length - 1;
    int leftMax = height[left], rightMax = height[right];
    int water = 0;
    while (left < right) {
        if (leftMax < rightMax) {
            left++;
            leftMax = Math.max(leftMax, height[left]);
            water += leftMax - height[left];
        } else {
            right--;
            rightMax = Math.max(rightMax, height[right]);
            water += rightMax - height[right];
        }
    }
    return water;
}`
        },
        explanation: {
          intuition: 'Water trapped at any position is determined by the minimum of the tallest bars on its left and right. By using two pointers tracking left_max and right_max, we compute water without precomputing max arrays.',
          brute: 'For each bar, scan left and right to find max heights. O(N^2) time, O(N) space.',
          optimized: 'Two pointers with running left_max and right_max. Process the side with smaller max since it dictates the water level. O(N) time, O(1) space.',
          dryRun: [
            'left=0 (h=0), right=11 (h=1). left_max=0, right_max=1.',
            'left_max < right_max: left++ -> left=1 (h=1). left_max=max(0,1)=1. water+=0.',
            'left_max=1 < right_max=1? No. right-- -> right=10 (h=2). right_max=max(1,2)=2. water+=1.',
            'left_max=1 < right_max=2: left++ -> left=2 (h=0). left_max=1. water+=1. Total=2.',
            'left_max=1 < right_max=2: left++ -> left=3 (h=2). left_max=2. water+=0. Total=2.',
            'left_max=2 == right_max=2: right-- -> right=9 (h=1). right_max=2. water+=1. Total=3.',
            'Continue processing: remaining water = 3 more. Total = 6.'
          ],
          edgeCases: ['Empty array returns 0', 'Strictly increasing or decreasing array (0 water)', 'All same height (0 water)'],
          tips: ['The key insight is that we only need to process the side with the smaller maximum, because the water level is always bounded by the smaller of the two maximums.']
        }
      },
      {
        id: 't-dsa-4',
        title: 'Minimum Cost to Hire K Workers',
        difficulty: 'Hard',
        frequency: 78,
        tags: ['Greedy', 'Heap', 'Sorting'],
        input: 'quality = [10,20,5], wage = [70,50,30], k = 2',
        output: '105.0',
        approach: 'Sort workers by wage/quality ratio. For each worker as the ratio-setter, maintain a max-heap of k qualities. Total cost = ratio * (sum of qualities in heap). Minimize over all ratios.',
        time: 'O(N log N) for sort + O(N log K) for heap operations',
        space: 'O(N)',
        visualizerType: 'sorting',
        code: {
          python: `import heapq

def mincostToHireWorkers(quality, wage, k):
    workers = sorted([(w / q, q) for q, w in zip(quality, wage)])
    result = float('inf')
    total_quality = 0
    max_heap = []
    for ratio, q in workers:
        total_quality += q
        heapq.heappush(max_heap, -q)
        if len(max_heap) > k:
            total_quality += heapq.heappop(max_heap)
        if len(max_heap) == k:
            result = min(result, ratio * total_quality)
    return result

print(mincostToHireWorkers([10,20,5], [70,50,30], 2))  # 105.0`,
          java: `import java.util.*;

public double mincostToHireWorkers(int[] quality, int[] wage, int k) {
    int n = quality.length;
    double[][] workers = new double[n][2];
    for (int i = 0; i < n; i++) {
        workers[i] = new double[]{(double) wage[i] / quality[i], quality[i]};
    }
    Arrays.sort(workers, (a, b) -> Double.compare(a[0], b[0]));
    double result = Double.MAX_VALUE;
    int totalQuality = 0;
    PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());
    for (double[] w : workers) {
        totalQuality += (int) w[1];
        maxHeap.offer((int) w[1]);
        if (maxHeap.size() > k) {
            totalQuality -= maxHeap.poll();
        }
        if (maxHeap.size() == k) {
            result = Math.min(result, w[0] * totalQuality);
        }
    }
    return result;
}`
        },
        explanation: {
          intuition: 'To minimize cost, we want to set a wage ratio where all k workers get paid proportionally to quality. By fixing the ratio to the highest-ratio worker in our group, we ensure all workers get at least their minimum wage. Sorting by ratio and using a max-heap of qualities lets us efficiently find the optimal group.',
          brute: 'Try all C(N,k) combinations of k workers. For each, compute cost = max_ratio * sum_qualities. O(C(N,k) * N) time.',
          optimized: 'Sort by ratio. For each ratio, use max-heap to track k smallest qualities. O(N log N + N log K).',
          dryRun: [
            'Workers sorted by ratio: [(3.0, 5), (3.5, 10), (2.5, 20)] -> [(2.5,20), (3.0,5), (3.5,10)]',
            'ratio=2.5, q=20: heap=[-20], total=20. size=1 < 2.',
            'ratio=3.0, q=5: heap=[-20,-5], total=25. size=2 == k. cost=3.0*25=75.0. result=75.0.',
            'ratio=3.5, q=10: heap=[-20,-5,-10], total=35. size=3 > 2. Pop -20 (largest), total=15. cost=3.5*15=52.5. result=52.5.',
            'Wait - need to reconsider: ratio=3.0, heap has [-20,-5], total=25, cost=75. But actual answer should be 105.',
            'Re-check: For ratio=2.5, only 1 worker. For ratio=3.0, workers 20 and 5 at ratio 3.0: cost=3.0*25=75. But worker with ratio 3.0 and quality 5 needs wage=15, and worker with ratio 2.5 and quality 20 needs wage=50 at ratio 3.0 -> wage=60. Total=75. Actual min is 105 when hiring workers 10 and 5 at ratio 3.5.'
          ],
          edgeCases: ['k equals number of workers', 'All workers have same ratio', 'Single worker (k=1)'],
          tips: ['The key insight is that when we fix the ratio to worker i, all workers with ratio <= i can be hired at that ratio. Use a max-heap to keep only the k smallest qualities, minimizing total cost.']
        }
      },
      {
        id: 't-dsa-5',
        title: 'Reorganize String',
        difficulty: 'Medium',
        frequency: 72,
        tags: ['Greedy', 'Heap', 'String'],
        input: 's = "aab"',
        output: 'aba',
        approach: 'Count character frequencies. Use a max-heap to always place the most frequent remaining character that is not the previously placed character. Track the previous character to avoid adjacent duplicates.',
        time: 'O(N log 26) = O(N)',
        space: 'O(N) for the result',
        visualizerType: 'sorting',
        code: {
          python: `import heapq
from collections import Counter

def reorganizeString(s):
    count = Counter(s)
    max_heap = [(-cnt, char) for char, cnt in count.items()]
    heapq.heapify(max_heap)
    result = []
    prev = None
    while max_heap:
        cnt, char = heapq.heappop(max_heap)
        result.append(char)
        if prev:
            heapq.heappush(max_heap, prev)
        cnt += 1
        if cnt < 0:
            prev = (cnt, char)
        else:
            prev = None
    res = ''.join(result)
    return res if len(res) == len(s) else ""

print(reorganizeString("aab"))   # Output: aba
print(reorganizeString("aaab"))  # Output: ""`,
          java: `import java.util.*;

public String reorganizeString(String s) {
    int[] count = new int[26];
    for (char c : s.toCharArray()) count[c - 'a']++;
    PriorityQueue<int[]> maxHeap = new PriorityQueue<>((a, b) -> b[0] - a[0]);
    for (int i = 0; i < 26; i++) {
        if (count[i] > 0) maxHeap.offer(new int[]{count[i], i});
    }
    StringBuilder result = new StringBuilder();
    int[] prev = null;
    while (!maxHeap.isEmpty()) {
        int[] curr = maxHeap.poll();
        result.append((char) ('a' + curr[1]));
        if (prev != null) maxHeap.offer(prev);
        curr[0]--;
        prev = curr[0] > 0 ? curr : null;
    }
    return result.length() == s.length() ? result.toString() : "";
}`
        },
        explanation: {
          intuition: 'If any character appears more than (N+1)/2 times, reorganization is impossible. Otherwise, greedily place the most frequent character that is different from the last placed one.',
          brute: 'Try all permutations. O(N!) time - infeasible.',
          optimized: 'Max-heap greedily selects the most frequent available character. O(N log 26) = O(N) time.',
          dryRun: [
            'Count: a=2, b=1. Heap: [(-2,a), (-1,b)].',
            'Pop a: result="a", prev=None. a count=1, push prev later.',
            'Pop b: result="ab", prev=(-2,a). b count=0, no push.',
            'Push prev (-2,a): Heap: [(-1,a)].',
            'Pop a: result="aba", prev=None. a count=0.',
            'Heap empty. Result="aba". Length matches input. Return "aba".'
          ],
          edgeCases: ['Impossible case: "aaab" (a appears 3 times, > (4+1)/2=2)', 'Single character string', 'All characters unique'],
          tips: ['The condition for impossibility is: any character count > (len(s) + 1) // 2. The heap approach naturally handles this since we run out of valid characters.']
        }
      },
      {
        id: 't-dsa-6',
        title: 'Find Celebrity',
        difficulty: 'Medium',
        frequency: 70,
        tags: ['Graph', 'Two Pointers', 'Stack'],
        input: 'n = 4, knows(0,1)=true, knows(1,0)=false, ...',
        output: '1 (celebrity index)',
        approach: 'Candidate elimination: start with person 0 as candidate. For each person, if the candidate knows them, the candidate is not a celebrity. Otherwise, the candidate might be. After one pass, verify the candidate is known by everyone and knows nobody.',
        time: 'O(N) - 3N calls to knows()',
        space: 'O(1)',
        visualizerType: 'graph',
        code: {
          python: `def findCelebrity(n, knows):
    candidate = 0
    for i in range(1, n):
        if knows(candidate, i):
            candidate = i
    for i in range(n):
        if i == candidate:
            continue
        if knows(candidate, i) or not knows(i, candidate):
            return -1
    return candidate

def knows(a, b):
    matrix = [[0,1,1,0],[0,0,0,0],[0,1,0,0],[0,1,0,0]]
    return matrix[a][b]

print(findCelebrity(4, knows))  # Output: 1`,
          java: `public int findCelebrity(int n, int[][] knows) {
    int candidate = 0;
    for (int i = 1; i < n; i++) {
        if (knows(candidate, i) == 1) {
            candidate = i;
        }
    }
    for (int i = 0; i < n; i++) {
        if (i == candidate) continue;
        if (knows(candidate, i) == 1 || knows(i, candidate) == 0) {
            return -1;
        }
    }
    return candidate;
}`
        },
        explanation: {
          intuition: 'A celebrity is known by everyone but knows nobody. If A knows B, A cannot be a celebrity. If A does not know B, B cannot be a celebrity. This lets us eliminate candidates in O(N).',
          brute: 'Check every person as potential celebrity. For each, verify N-1 knows relationships. O(N^2) time.',
          optimized: 'First pass eliminates all non-celebrities in O(N). Second pass verifies the candidate in O(N). Total O(N).',
          dryRun: [
            'candidate=0. knows(0,1)=true -> candidate=1.',
            'knows(1,2)=false -> keep candidate=1. knows(1,3)=false -> keep candidate=1.',
            'Verify: For i=0: knows(0,1)=true but needs knows(1,0)=false. knows(1,0)=0 ok. Also needs knows(1,0)=1? No, need everyone knows candidate. knows(0,1)=1 ok.',
            'i=2: knows(1,2)=0 (candidate knows no one, ok). knows(2,1)=1 (everyone knows candidate, ok).',
            'i=3: knows(1,3)=0 ok. knows(3,1)=1 ok.',
            'Return 1.'
          ],
          edgeCases: ['No celebrity exists (return -1)', 'n = 1 (single person is celebrity)', 'Multiple potential candidates'],
          tips: ['The elimination works because there can be at most one celebrity. The first pass narrows it to one candidate, and the second pass confirms.']
        }
      },
      {
        id: 't-dsa-7',
        title: 'Gas Station',
        difficulty: 'Medium',
        frequency: 75,
        tags: ['Greedy', 'Array'],
        input: 'gas = [1,2,3,4,5], cost = [3,4,5,1,2]',
        output: '3',
        approach: 'Single pass tracking tank balance. If tank goes negative, reset start to next station and reset tank to 0. If total gas >= total cost, a solution exists at the final start candidate.',
        time: 'O(N)',
        space: 'O(1)',
        visualizerType: 'sliding-window',
        code: {
          python: `def canCompleteCircuit(gas, cost):
    total_tank = 0
    curr_tank = 0
    start = 0
    for i in range(len(gas)):
        total_tank += gas[i] - cost[i]
        curr_tank += gas[i] - cost[i]
        if curr_tank < 0:
            start = i + 1
            curr_tank = 0
    return start if total_tank >= 0 else -1

print(canCompleteCircuit([1,2,3,4,5], [3,4,5,1,2]))  # Output: 3`,
          java: `public int canCompleteCircuit(int[] gas, int[] cost) {
    int totalTank = 0, currTank = 0, start = 0;
    for (int i = 0; i < gas.length; i++) {
        int diff = gas[i] - cost[i];
        totalTank += diff;
        currTank += diff;
        if (currTank < 0) {
            start = i + 1;
            currTank = 0;
        }
    }
    return totalTank >= 0 ? start : -1;
}`
        },
        explanation: {
          intuition: 'If we can complete the circuit starting from some station, the tank never goes negative from that point. If tank goes negative at station i, no station from start to i can be the answer, so we skip to i+1.',
          brute: 'Try each station as starting point, simulate the full circuit. O(N^2) time.',
          optimized: 'Single pass with two accumulators: total_tank for feasibility check, curr_tank for tracking current attempt. O(N) time, O(1) space.',
          dryRun: [
            'i=0: diff=1-3=-2. total=-2, curr=-2. curr<0: start=1, curr=0.',
            'i=1: diff=2-4=-2. total=-4, curr=-2. curr<0: start=2, curr=0.',
            'i=2: diff=3-5=-2. total=-6, curr=-2. curr<0: start=3, curr=0.',
            'i=3: diff=4-1=3. total=-3, curr=3.',
            'i=4: diff=5-2=3. total=0, curr=6.',
            'total=0 >= 0. Return start=3.'
          ],
          edgeCases: ['No solution exists (total gas < total cost)', 'Single station', 'Solution at station 0'],
          tips: ['The greedy insight is that if you run out of gas between stations A and B, you cannot start from any station between A and B either, because you would have had more gas starting from A.']
        }
      },
      {
        id: 't-dsa-8',
        title: 'Task Scheduler',
        difficulty: 'Medium',
        frequency: 80,
        tags: ['Greedy', 'Heap', 'Math'],
        input: 'tasks = ["A","A","A","B","B","B"], n = 2',
        output: '8',
        approach: 'Calculate based on the most frequent task. Formula: (maxFreq-1)*(n+1) + countOfMaxFreqTasks. Take max of this and total tasks length.',
        time: 'O(N) for counting, O(1) for calculation',
        space: 'O(1) - only 26 possible tasks',
        visualizerType: 'sorting',
        code: {
          python: `from collections import Counter

def leastInterval(tasks, n):
    freq = Counter(tasks)
    max_freq = max(freq.values())
    max_count = sum(1 for v in freq.values() if v == max_freq)
    min_length = (max_freq - 1) * (n + 1) + max_count
    return max(min_length, len(tasks))

print(leastInterval(["A","A","A","B","B","B"], 2))  # Output: 8
print(leastInterval(["A","A","A","B","B","B"], 0))  # Output: 6`,
          java: `public int leastInterval(char[] tasks, int n) {
    int[] freq = new int[26];
    for (char c : tasks) freq[c - 'A']++;
    int maxFreq = 0, maxCount = 0;
    for (int f : freq) {
        if (f > maxFreq) {
            maxFreq = f;
            maxCount = 1;
        } else if (f == maxFreq) {
            maxCount++;
        }
    }
    int minLength = (maxFreq - 1) * (n + 1) + maxCount;
    return Math.max(minLength, tasks.length);
}`
        },
        explanation: {
          intuition: 'The most frequent task dictates the minimum intervals. Between each execution of the most frequent task, we need n idle slots or other tasks. The formula accounts for this spacing.',
          brute: 'Simulate the scheduling cycle by cycle using a queue. O(N * n) time.',
          optimized: 'Mathematical formula based on frequency analysis. O(N) counting + O(1) calculation.',
          dryRun: [
            'Freq: A=3, B=3. maxFreq=3, maxCount=2.',
            'Formula: (3-1)*(2+1) + 2 = 2*3 + 2 = 8.',
            'Total tasks = 6. max(8, 6) = 8.',
            'Schedule: A B _ A B _ A B (8 slots, 2 idle slots).'
          ],
          edgeCases: ['n = 0 (no cooldown, return task count)', 'All tasks unique (return task count)', 'Single task type'],
          tips: ['The formula (maxFreq-1)*(n+1) + countOfMaxFreq gives the minimum intervals when idle slots are needed. If there are enough different tasks to fill all slots, the answer is just the number of tasks.']
        }
      }
    ],
    technical: [
      {
        id: 't-t-1',
        category: 'System Design',
        difficulty: 'Advanced',
        frequency: 92,
        question: 'How would you design the real-time perception pipeline for Tesla Full Self-Driving (FSD)?',
        answer: 'The FSD perception pipeline processes data from 8 cameras, 12 ultrasonic sensors, and radar in real-time. The architecture uses a multi-stage pipeline: (1) Sensor ingestion layer captures raw data at 36 FPS with hardware timestamping for synchronization. (2) Preprocessing handles debayering, distortion correction, and normalization on dedicated ISP hardware. (3) The perception backbone uses a multi-scale feature pyramid network (FPN) running on Tesla\'s custom FSD chip, processing 2.5 billion pixels per second. (4) Multi-task heads perform 3D object detection, lane detection, drivable area segmentation, and depth estimation simultaneously. (5) Temporal fusion module aggregates features across time frames using 3D convolutions for velocity estimation. (6) The output feeds into the planning module as a unified occupancy grid. The key challenge is meeting the 50ms end-to-end latency requirement while running on power-constrained automotive hardware.',
        keyPoints: ['Multi-sensor fusion architecture', 'Real-time constraint (50ms latency)', 'Custom FSD chip utilization', 'Multi-task learning heads', 'Temporal fusion for velocity estimation'],
        followUps: ['How does Tesla handle sensor failure or occlusion?', 'What is the role of simulation data in training the perception model?']
      },
      {
        id: 't-t-2',
        category: 'Language / Core',
        difficulty: 'Advanced',
        frequency: 88,
        question: 'Explain C++ RAII and smart pointers. Why are they critical for automotive embedded systems?',
        answer: 'RAII (Resource Acquisition Is Initialization) binds resource lifecycle to object scope. When an object goes out of scope, its destructor automatically releases resources (memory, file handles, mutexes, hardware registers). In automotive embedded systems, RAII is critical because: (1) No garbage collector means deterministic cleanup - essential for real-time systems where GC pauses could miss safety deadlines. (2) Smart pointers (unique_ptr for exclusive ownership, shared_ptr for shared ownership, weak_ptr to break cycles) prevent memory leaks and dangling pointers. (3) std::lock_guard and std::unique_lock use RAII for exception-safe mutex management. (4) Custom deleters allow smart pointers to manage hardware resources like DMA buffers or memory-mapped registers. For Tesla\'s Autopilot firmware, RAII ensures that sensor buffers, neural network weights, and communication channels are properly released even in error paths, preventing resource exhaustion in safety-critical systems.',
        keyPoints: ['Deterministic destruction', 'unique_ptr vs shared_ptr vs weak_ptr', 'Exception safety', 'Custom deleters for hardware resources', 'No GC pauses in real-time systems'],
        followUps: ['How does std::shared_ptr achieve reference counting thread-safely?', 'What is the overhead of smart pointers compared to raw pointers?']
      },
      {
        id: 't-t-3',
        category: 'System Design',
        difficulty: 'Advanced',
        frequency: 85,
        question: 'Design the OTA (Over-the-Air) update system for Tesla\'s fleet of millions of vehicles.',
        answer: 'The OTA system must handle updates for 2M+ vehicles with zero downtime and guaranteed rollback. Architecture: (1) Delta updates: Use binary diffing (bsdiff/xdelta) to generate minimal patches (typically 100-500MB instead of 4GB full images). (2) Staged rollout: Updates deploy in waves - 1% internal fleet, 10% early adopters, 50%, 100% - with automated health monitoring between stages. (3) A/B partition scheme: Vehicles have two firmware partitions (A and B). The update writes to the inactive partition, verifies integrity, then switches the boot flag. If the new firmware fails health checks on startup, the bootloader automatically reverts to the previous partition. (4) Content delivery: Use a CDN with edge caching. Each vehicle downloads from the nearest edge node. Implement resume capability for interrupted downloads. (5) Cryptographic verification: Every update package is signed with Tesla\'s Ed25519 key. The vehicle verifies the signature before installation. (6) Telemetry pipeline: Each vehicle reports update status, boot time, error logs to a real-time dashboard. Automated alerts trigger rollback if error rates exceed thresholds.',
        keyPoints: ['Delta updates to minimize bandwidth', 'A/B partition scheme for rollback', 'Staged rollout with health gates', 'Ed25519 cryptographic signing', 'Resume capability for downloads'],
        followUps: ['How do you handle a vehicle that loses connectivity mid-update?', 'What happens if a vehicle has a hardware defect that makes the new firmware incompatible?']
      },
      {
        id: 't-t-4',
        category: 'Safety Critical',
        difficulty: 'Advanced',
        frequency: 90,
        question: 'How does Tesla handle edge cases in Autopilot where the perception system encounters scenarios not seen in training data?',
        answer: 'Tesla addresses out-of-distribution (OOD) scenarios through multiple layers: (1) Shadow mode: New neural network versions run silently alongside the active system, comparing outputs without controlling the vehicle. Discrepancies are logged and uploaded for analysis. (2) Uncertainty estimation: The perception network outputs confidence scores. When confidence drops below thresholds (e.g., detecting an object but uncertain about its classification), the system escalates to the human driver rather than making potentially wrong decisions. (3) Simulation gap analysis: Tesla\'s simulation engine generates rare scenarios (tire blowouts, unusual road debris, construction zones). The fleet collects real-world examples of these edge cases through auto-labeling. (4) Fleet learning: When a Tesla encounters a scenario where the driver takes over, that data point is uploaded and used to retrain the model. This creates a continuous feedback loop. (5) Safety fallback: If the perception system detects its own degradation (e.g., camera obstruction, excessive noise), it immediately requests driver takeover with progressive alerts (visual -> audible -> haptic).',
        keyPoints: ['Shadow mode for A/B comparison', 'Uncertainty-based escalation', 'Simulation-to-real transfer', 'Fleet learning from driver interventions', 'Graceful degradation with fallbacks'],
        followUps: ['How do you handle adversarial attacks on the camera system?', 'What is the minimum fleet coverage needed for safe deployment in a new region?']
      },
      {
        id: 't-t-5',
        category: 'System Design',
        difficulty: 'Advanced',
        frequency: 82,
        question: 'Design a real-time vehicle telemetry pipeline that processes data from 2M+ connected vehicles.',
        answer: 'The telemetry pipeline processes 10M+ data points per second from the fleet. Architecture: (1) On-vehicle collection: Each vehicle streams sensor data, diagnostic codes, and driving behavior at configurable rates (1-100 Hz). Edge aggregation reduces data volume by computing local statistics. (2) Ingestion layer: Use Apache Kafka with custom partitioning by vehicle ID for ordering guarantees. Each vehicle gets a dedicated partition to maintain event sequence. (3) Stream processing: Apache Flink processes events in real-time - anomaly detection (sudden battery temperature spikes), pattern recognition (unusual vibration signatures), and aggregation (hourly driving statistics). (4) Storage tier: Hot data (last 24h) in Apache Druid for real-time dashboards. Warm data (7-30 days) in TimescaleDB for trend analysis. Cold data (historical) in S3 with Parquet format for ML training. (5) Alerting: Real-time anomaly detection triggers alerts to engineering teams. ML models predict component failures 2-4 weeks in advance based on telemetry patterns. (6) Privacy: All telemetry is anonymized with k-anonymity (k=50) before storage. PII is stripped at the vehicle level.',
        keyPoints: ['Kafka partitioning by vehicle ID', 'Multi-tier storage (hot/warm/cold)', 'Real-time anomaly detection with Flink', 'Predictive maintenance from telemetry', 'Privacy-preserving aggregation'],
        followUps: ['How do you handle a sudden spike in telemetry data from a fleet-wide event?', 'What sampling strategy do you use for high-frequency sensor data?']
      },
      {
        id: 't-t-6',
        category: 'Embedded Systems',
        difficulty: 'Advanced',
        frequency: 80,
        question: 'Explain the CAN bus protocol and how Tesla uses it for inter-ECU communication.',
        answer: 'CAN (Controller Area Network) is a multi-master serial bus protocol designed for automotive environments. Key characteristics: (1) Message-based addressing: CAN uses message IDs (not node addresses) for priority arbitration. Lower ID = higher priority. Non-destructive arbitration means the highest-priority message always wins without data loss. (2) Data frame: Up to 8 bytes of payload (CAN FD extends to 64 bytes). The frame includes arbitration ID, DLC, data, and CRC for error detection. (3) Bit timing: CAN operates at 125 kbps to 1 Mbps. Tesla uses CAN FD at up to 8 Mbps for high-bandwidth data like camera feeds. (4) Error handling: CAN has robust error detection (CRC, ACK, bit stuffing) and fault confinement. Nodes that error too frequently are automatically disconnected from the bus. (5) Tesla\'s usage: Tesla replaced many CAN connections with Ethernet for high-bandwidth data (cameras, infotainment), but CAN remains for safety-critical systems (braking, steering, powertrain) due to its deterministic behavior and proven reliability in automotive environments.',
        keyPoints: ['Non-destructive priority arbitration', 'Message-based (not address-based) protocol', 'CAN FD for higher bandwidth', 'Automatic error confinement', 'Mixed CAN/Ethernet architecture'],
        followUps: ['Why has Tesla moved some systems from CAN to Ethernet?', 'How does CAN handle real-time guarantees for safety-critical messages?']
      },
      {
        id: 't-t-7',
        category: 'Robotics',
        difficulty: 'Advanced',
        frequency: 78,
        question: 'How would you approach motion planning for Tesla Bot (Optimus)?',
        answer: 'Tesla Bot motion planning combines classical robotics with neural network approaches: (1) Whole-body controller: A model-predictive controller (MPC) optimizes joint torques over a 1-second horizon, balancing between task objectives (reach target), stability (maintain center of mass over support polygon), and energy efficiency. (2) Perception-driven planning: The vision system provides a 3D scene understanding including object poses, surface geometry, and obstacles. The motion planner uses this to generate collision-free trajectories. (3) Reinforcement learning: Fine manipulation skills (grasping, tool use) are trained in simulation using massive parallel RL, then transferred to real hardware with domain randomization. (4) Trajectory optimization: For walking, use the simplified model (linear inverted pendulum) for coarse planning, then optimize with the full dynamics model. (5) Safety constraints: Joint velocity/torque limits, collision avoidance, and balance maintenance are hard constraints in the optimization. (6) Sim-to-real transfer: Tesla\'s simulation environment generates millions of training scenarios with randomized terrain, lighting, and perturbations to ensure robust real-world performance.',
        keyPoints: ['Model-predictive control for whole-body motion', 'RL for manipulation skills', 'Sim-to-real transfer with domain randomization', 'Multi-objective optimization (task, stability, energy)', 'Safety-constrained trajectory planning'],
        followUps: ['How do you handle sim-to-real gap for deformable objects?', 'What role does the Dojo supercomputer play in training the motion policy?']
      },
      {
        id: 't-t-8',
        category: 'Safety Critical',
        difficulty: 'Advanced',
        frequency: 86,
        question: 'Design a fail-safe system for Tesla\'s emergency braking that ensures correct operation even with sensor failures.',
        answer: 'Emergency braking must work even when sensors fail, requiring redundant design: (1) Triple modular redundancy: Three independent braking paths - camera-based (neural network), radar-based (traditional signal processing), and ultrasonic (proximity detection). Each path can independently trigger braking. (2) Voting logic: Use 2-out-of-3 voting to prevent false positives. If two or more sensors agree on an obstacle, braking is triggered. For safety-critical scenarios (like a child running into the road), a single high-confidence sensor can trigger braking. (3) Watchdog timers: A hardware watchdog monitors the main processor. If the software hangs (missing watchdog kick for >100ms), a dedicated safety processor takes over and initiates controlled braking. (4) Graceful degradation: If cameras are blocked (mud, glare), the system falls back to radar-only mode with reduced speed limits. If radar fails, the system uses camera-only with wider safety margins. If all sensors fail, the vehicle initiates a controlled stop and alerts the driver. (5) Hardware-level brake actuation: The brake-by-wire system has a mechanical override. Even if all electronics fail, the brake pedal mechanically connects to the hydraulic system through a redundant valve. (6) Self-test: On every startup, the system runs built-in tests (BIST) on all sensors, processors, and actuators. If any test fails, the vehicle refuses to enter Autopilot mode.',
        keyPoints: ['Triple modular redundancy', '2-out-of-3 voting logic', 'Hardware watchdog timer', 'Graceful degradation by sensor loss', 'Mechanical override for brake-by-wire', 'Startup self-test (BIST)'],
        followUps: ['How do you test the emergency braking system for false positive scenarios?', 'What is the maximum acceptable latency from obstacle detection to brake actuation?']
      }
    ],
    hr: [
      {
        id: 't-hr-1',
        question: 'Tell me about a time you solved an "impossible" problem by breaking it down to first principles.',
        modelAnswer: 'At my previous company, we had a real-time embedded system that was experiencing random watchdog resets every 72 hours. The team had spent weeks adding logging and increasing stack sizes without success. Instead of continuing down that path, I went back to first principles: What is actually happening at the hardware level? I wrote a custom memory allocator that logged every allocation to a circular buffer in NVRAM. After capturing 3 resets, I analyzed the dumps and found that a specific interrupt handler was allocating memory from a pool that was being corrupted by a DMA transfer from a different peripheral. The root cause was a missing memory barrier in the DMA controller driver. I fixed it by adding a volatile read to force the memory ordering, and the resets stopped completely.',
        aiTips: 'Tesla values First Principles thinking - showing you can decompose complex problems to fundamental truths rather than relying on conventional wisdom.',
        starTips: {
          situation: 'A critical real-time system experienced random watchdog resets that the team could not diagnose for weeks.',
          task: 'Identify and fix the root cause of the resets without access to standard debugging tools due to resource constraints.',
          action: 'Built a custom memory tracking allocator, captured hardware state at each reset, analyzed memory dumps to identify DMA corruption, and added a memory barrier to fix the ordering issue.',
          result: 'Eliminated the resets entirely, reducing system downtime by 100% and establishing a new debugging methodology for the team.'
        }
      },
      {
        id: 't-hr-2',
        question: 'Describe a time you had to work under an extreme deadline. How did you prioritize?',
        modelAnswer: 'Two weeks before a major product launch, we discovered that our firmware had a race condition that caused occasional data corruption in the sensor pipeline. The launch could not be delayed. I immediately identified the critical path: only 3 out of 12 sensor modules were affected, and the corruption only occurred under specific timing conditions. I created a prioritized fix plan: (1) First 24 hours: Write a hardware-level lock to prevent the race condition in the most critical sensor (the one used for braking decisions). (2) Next 48 hours: Deploy the fix to the 10% of production units that were most at risk based on telemetry data. (3) Remaining time: Develop and test the complete fix for all 12 modules. I worked 18-hour days, sleeping in the office, and coordinated with the hardware team to verify the fix under all timing conditions. We shipped the critical fix 3 days before launch and the complete fix 2 weeks after.',
        aiTips: 'Show extreme ownership and the ability to triage under pressure. Tesla wants to see that you can make hard prioritization decisions without compromising safety.',
        starTips: {
          situation: 'A critical firmware race condition was discovered two weeks before a major product launch.',
          task: 'Fix the issue without delaying the launch while maintaining safety guarantees.',
          action: 'Triage by criticality: fixed the most safety-critical module first (24h), deployed partial fix to highest-risk units (48h), then developed complete fix.',
          result: 'Launch proceeded on time with critical fix deployed. Complete fix shipped 2 weeks later. Zero data corruption incidents in production.'
        }
      },
      {
        id: 't-hr-3',
        question: 'Tell me about a time you had to learn a completely new technology very quickly.',
        modelAnswer: 'I was assigned to a project involving FPGA-based signal processing for a new sensor interface. I had no prior FPGA experience. The deadline was 6 weeks. I started by studying the fundamentals of hardware description languages (Verilog) and the specific FPGA architecture we were using. In the first week, I built a simple LED blinker to understand the toolchain. By week 2, I had implemented a basic FIR filter. I spent weeks 3-4 building the actual signal processing pipeline, referencing open-source implementations and asking targeted questions to the hardware team. By week 5, I had a working prototype that met the performance requirements. The key insight was that I did not try to learn everything - I focused on the specific subset of FPGA knowledge needed for signal processing, ignoring synthesis optimization and other advanced topics until after the prototype worked.',
        aiTips: 'Tesla operates at the bleeding edge - you will constantly need to learn new technologies. Show that you can learn fast and effectively.',
        starTips: {
          situation: 'Assigned to an FPGA project with zero prior FPGA experience and a 6-week deadline.',
          task: 'Deliver a working FPGA signal processing pipeline within 6 weeks.',
          action: 'Focused learning on only what was needed: Verilog fundamentals, FIR filter design, and the specific FPGA toolchain. Built incremental prototypes.',
          result: 'Delivered working prototype in 5 weeks that met all performance requirements. The approach became a template for onboarding new team members to FPGA work.'
        }
      },
      {
        id: 't-hr-4',
        question: 'Describe a situation where you had to make a critical decision with incomplete information.',
        modelAnswer: 'We were deploying a new firmware version to 50,000 vehicles when telemetry showed an anomaly in 0.1% of units - the battery management system was reporting slightly elevated temperatures. The data was incomplete: we did not know if it was a sensor calibration issue or a real thermal event. Waiting for complete data could take 48 hours, but if it was a real issue, delaying action could risk safety. I made the decision to immediately push a firmware update that reduced the charging rate for the affected units (a conservative but safe action) while continuing to collect data. This was a reversible action that maintained safety without causing significant user disruption. After 24 hours, we determined it was a sensor calibration drift in a specific hardware revision, and we pushed the proper calibration fix. The key was choosing an action that was safe under both possible interpretations of the incomplete data.',
        aiTips: 'Show your ability to take decisive action under uncertainty while maintaining safety as the top priority.',
        starTips: {
          situation: 'Telemetry showed anomalous battery temperatures in 0.1% of 50,000 vehicles during a firmware rollout, with incomplete data on the root cause.',
          task: 'Decide on immediate action to protect vehicle safety while data collection continued.',
          action: 'Pushed conservative firmware update to reduce charging rate (safe under both scenarios), continued data collection, then deployed proper calibration fix once root cause was confirmed.',
          result: 'No safety incidents. The conservative action protected vehicles while the proper fix was developed. Established a decision framework for future ambiguous telemetry situations.'
        }
      },
      {
        id: 't-hr-5',
        question: 'Tell me about a time you disagreed with a teammate or manager. How did you handle it?',
        modelAnswer: 'A senior engineer proposed using a complex distributed consensus algorithm for our sensor data aggregation system. I believed this was over-engineering for our use case - our sensors had inherent redundancy, and a simpler approach with checksums and retry logic would be more reliable and easier to maintain. Instead of just disagreeing, I built a proof-of-concept implementing both approaches. I measured latency, throughput, and failure recovery time under simulated network partitions. The data showed that the simpler approach had 3x lower latency and recovered from failures in 200ms vs 2 seconds for the consensus approach. I presented this in a design review with clear metrics. The senior engineer agreed the data supported the simpler approach. We shipped the simpler solution, which proved reliable over 18 months of production use.',
        aiTips: 'Show that you can disagree with evidence and data, not just opinions. Tesla values intellectual honesty and data-driven decisions.',
        starTips: {
          situation: 'Disagreed with a senior engineer about the architecture for a sensor data aggregation system.',
          task: 'Convince the team to choose the simpler, more reliable approach while maintaining a positive working relationship.',
          action: 'Built proof-of-concept for both approaches, measured performance metrics, presented data-driven analysis in design review.',
          result: 'Team chose the simpler approach backed by data. The senior engineer appreciated the rigorous analysis. System performed reliably for 18 months with zero downtime.'
        }
      },
      {
        id: 't-hr-6',
        question: 'Describe your biggest professional failure. What did you learn?',
        modelAnswer: 'I was leading the development of a new sensor fusion algorithm. I was so focused on optimizing accuracy that I neglected to test on edge cases involving sensor degradation. We deployed to production, and within a week, the algorithm produced incorrect outputs when one camera was partially occluded by dirt. The system was not designed to handle partial sensor failures gracefully. I took full responsibility. The immediate fix was adding a sensor health monitor that detected partial occlusions and switched to a degraded but safe mode. The deeper lesson was about testing methodology: I now always design test cases that specifically target degraded conditions, not just ideal scenarios. I also established a practice of asking "what happens when this component fails?" for every new feature. This failure made me a more robust engineer.',
        aiTips: 'Show genuine accountability and concrete changes to your engineering practices as a result.',
        starTips: {
          situation: 'Led development of a sensor fusion algorithm that failed in production when a camera was partially occluded.',
          task: 'Fix the production issue and prevent similar failures in the future.',
          action: 'Immediately added sensor health monitoring for degraded conditions. Established a new testing practice of always evaluating behavior under component failure scenarios.',
          result: 'Fixed the production issue within 24 hours. The new testing methodology has prevented 3 similar issues in subsequent projects.'
        }
      },
      {
        id: 't-hr-7',
        question: 'How do you handle working in a high-pressure environment with constantly shifting priorities?',
        modelAnswer: 'In my role at a startup, I was the sole embedded engineer responsible for 3 different hardware platforms. Priorities shifted weekly based on customer feedback and investor demos. I developed a system to manage this: (1) Every Monday, I categorized tasks into "must ship this week" (max 2), "should ship this week" (max 3), and "nice to have" (unlimited). (2) I time-boxed each task - if a task exceeded its time box, I made a conscious decision to either extend it or defer it. (3) I maintained a "context document" for each platform with current status, known issues, and next priorities, so I could switch between platforms without losing time re-orienting. (4) I communicated proactively with the team about trade-offs - when a new priority came in, I explicitly showed what would be delayed. This system allowed me to deliver consistently despite the chaos.',
        aiTips: 'Show structured thinking and clear communication under pressure. Tesla operates in a similarly fast-paced, shifting environment.',
        starTips: {
          situation: 'Sole embedded engineer managing 3 hardware platforms with weekly priority shifts from customer feedback.',
          task: 'Deliver consistently across all platforms while managing changing requirements.',
          action: 'Implemented prioritization framework with weekly must-ship limits, time-boxing, context documents for fast context switching, and proactive communication about trade-offs.',
          result: 'Delivered 12 features across 3 platforms in 3 months. Team adopted the prioritization framework as a company-wide practice.'
        }
      },
      {
        id: 't-hr-8',
        question: 'Why Tesla? How does your personal mission align with what we do?',
        modelAnswer: 'I have spent my career building embedded systems, and I have always been frustrated by the gap between what is technically possible and what ships in products. Tesla is the only company I have seen that consistently closes that gap - shipping real autonomy, real over-the-air updates, and real innovation in mass-production vehicles. My personal mission is to build technology that has direct, measurable impact on people\'s lives. At Tesla, I would be working on systems that save lives (Autopilot), reduce carbon emissions (energy products), and push the boundaries of what machines can do (Optimus). I am specifically drawn to Tesla\'s engineering culture of extreme ownership and first principles thinking - I thrive in environments where the best idea wins regardless of hierarchy. The opportunity to work on safety-critical systems where my code directly affects millions of vehicles is exactly the kind of high-stakes, high-impact work I want to do.',
        aiTips: 'Be specific about Tesla\'s technology and culture. Show genuine passion for the mission, not just excitement about the brand.',
        starTips: {
          situation: 'Motivated by Tesla\'s unique combination of cutting-edge technology and real-world impact at massive scale.',
          task: 'Articulate why your skills and values align with Tesla\'s mission and engineering culture.',
          action: 'Connected your experience in embedded systems and safety-critical development to Tesla\'s specific challenges in autonomy, OTA updates, and vehicle systems.',
          result: 'Demonstrated genuine alignment with Tesla\'s mission and readiness to contribute immediately to high-impact, safety-critical projects.'
        }
      }
    ]
  },
  {
    id: 'nvidia',
    name: 'Nvidia',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg',
    industry: 'Semiconductors & AI Hardware',
    hiringRoles: ['GPU Architect', 'CUDA Engineer', 'Deep Learning Researcher'],
    interviewRounds: ['Online Assessment', 'Computer Architecture Screen', 'Technical Onsite (C++/CUDA)'],
    salaryRange: '₹30L - ₹55L',
    brandColor: '#76B900',
    culture: 'Innovation, Speed of Light Execution, Intellectual Honesty',
    difficulty: 'Elite',
    completion: 0,
    stats: { placed: '56', avgpackage: '35.5 LPA' },
    founders: [
      { name: 'Jensen Huang', title: 'Co-founder & CEO', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Jensen_Huang_%28cropped%29.jpg/250px-Jensen_Huang_%28cropped%29.jpg' }
    ],
    focus: 'Pioneering GPU computing, AI accelerators, and building the Digital Twin Omniverse.',
    motto: '"The engine of artificial intelligence."',
    hiringPhilosophy: 'We look for speed-of-light execution and intellectual honesty, seeking people capable of tackling the hardest computing problems in a highly demanding culture.',
    dsa: [
      {
        id: 'nv-dsa-1',
        title: 'Task Scheduling for CUDA Threads',
        difficulty: 'Medium',
        frequency: 88,
        tags: ['Greedy', 'Priority Queue', 'Array'],
        input: 'tasks = ["A","A","A","B","B","B"], n = 2',
        output: '8',
        approach: 'Use a max-heap to always schedule the most frequent task first. After executing a task, it enters a cooldown period of n units. If no other task is available during cooldown, insert idle slots. The mathematical formula is: (maxFreq - 1) * (n + 1) + countOfMaxFreq.',
        time: 'O(N) for counting, O(1) for formula',
        space: 'O(1)',
        visualizerType: 'sorting',
        code: {
          python: `from collections import Counter

def leastInterval(tasks, n):
    freq = Counter(tasks)
    max_freq = max(freq.values())
    max_count = sum(1 for v in freq.values() if v == max_freq)
    min_length = (max_freq - 1) * (n + 1) + max_count
    return max(min_length, len(tasks))

print(leastInterval(["A","A","A","B","B","B"], 2))  # 8`,
          java: `public int leastInterval(char[] tasks, int n) {
    int[] freq = new int[26];
    for (char c : tasks) freq[c - 'A']++;
    int maxFreq = 0, maxCount = 0;
    for (int f : freq) {
        if (f > maxFreq) { maxFreq = f; maxCount = 1; }
        else if (f == maxFreq) maxCount++;
    }
    return Math.max((maxFreq - 1) * (n + 1) + maxCount, tasks.length);
}`
        },
        explanation: {
          intuition: 'The most frequent task dictates the minimum intervals. Between consecutive executions of the same task, we need n cooldown slots. Fill those slots with other tasks or idle cycles.',
          brute: 'Simulate scheduling cycle by cycle using a queue. O(N * n) time.',
          optimized: 'Mathematical formula based on frequency: (maxFreq-1)*(n+1) + countOfMaxFreq. O(N) counting + O(1) calculation.',
          dryRun: [
            'Freq: A=3, B=3. maxFreq=3, maxCount=2.',
            'Formula: (3-1)*(2+1) + 2 = 8.',
            'Schedule: A B _ A B _ A B (8 slots).'
          ],
          edgeCases: ['n=0 (no cooldown, return task count)', 'All tasks unique', 'Single task type'],
          tips: ['The formula gives the minimum length when idle slots are needed. If there are enough distinct tasks to fill all slots, the answer is just the task count.']
        }
      },
      {
        id: 'nv-dsa-2',
        title: 'Matrix Chain Multiplication',
        difficulty: 'Hard',
        frequency: 82,
        tags: ['Dynamic Programming', 'Matrix'],
        input: 'dims = [40, 20, 30, 10, 30]',
        output: '26000',
        approach: 'Use interval DP. dp[i][j] stores the minimum scalar multiplications to multiply matrices i through j. For each interval, try every possible split point k and take the minimum.',
        time: 'O(N^3)',
        space: 'O(N^2)',
        visualizerType: 'sorting',
        code: {
          python: `def matrixChainOrder(dims):
    n = len(dims) - 1
    dp = [[0] * n for _ in range(n)]
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = float('inf')
            for k in range(i, j):
                cost = dp[i][k] + dp[k+1][j] + dims[i]*dims[k+1]*dims[j+1]
                dp[i][j] = min(dp[i][j], cost)
    return dp[0][n-1]

print(matrixChainOrder([40, 20, 30, 10, 30]))  # 26000`,
          java: `public int matrixChainOrder(int[] dims) {
    int n = dims.length - 1;
    int[][] dp = new int[n][n];
    for (int len = 2; len <= n; len++) {
        for (int i = 0; i <= n - len; i++) {
            int j = i + len - 1;
            dp[i][j] = Integer.MAX_VALUE;
            for (int k = i; k < j; k++) {
                int cost = dp[i][k] + dp[k+1][j] + dims[i]*dims[k+1]*dims[j+1];
                dp[i][j] = Math.min(dp[i][j], cost);
            }
        }
    }
    return dp[0][n-1];
}`
        },
        explanation: {
          intuition: 'The order of matrix multiplication dramatically affects the number of scalar operations. By trying all possible parenthesizations via interval DP, we find the optimal order.',
          brute: 'Try all possible parenthesizations. Exponential time (Catalan number of possibilities).',
          optimized: 'Interval DP: dp[i][j] = min over all split points k of dp[i][k] + dp[k+1][j] + cost of multiplying the two resulting matrices.',
          dryRun: [
            'dims=[40,20,30,10,30]. Matrices: A(40x20), B(20x30), C(10x30) -> wait, need 5 dims for 4 matrices.',
            'Actually: A(40x20), B(20x30), C(30x10), D(10x30).',
            'dp[0][1] = 40*20*30 = 24000 (A*B).',
            'dp[1][2] = 20*30*10 = 6000 (B*C).',
            'dp[2][3] = 30*10*30 = 9000 (C*D).',
            'dp[0][2] = min(dp[0][1]+dp[1][2]+40*30*10, dp[0][0]+dp[1][2]+40*20*10) = min(24000+6000+12000, 0+6000+8000) = 14000.',
            'dp[1][3] = min(dp[1][2]+dp[2][3]+20*10*30, dp[1][1]+dp[2][3]+20*30*30) = min(6000+9000+6000, 0+9000+18000) = 21000.',
            'dp[0][3] = min over k=0,1,2. Best is k=1: dp[0][1]+dp[2][3]+40*30*30 = 24000+9000+36000 = 69000. Or k=0: dp[0][0]+dp[1][3]+40*20*30 = 0+21000+24000 = 45000. Min = 26000.'
          ],
          edgeCases: ['Two matrices (only one way to multiply)', 'All same dimensions', 'Very large dimension values causing integer overflow'],
          tips: ['The key insight is that dp[i][j] represents the optimal cost for the subchain from i to j. We build up from shorter chains to longer ones.']
        }
      },
      {
        id: 'nv-dsa-3',
        title: 'Number of Islands II',
        difficulty: 'Hard',
        frequency: 78,
        tags: ['Union-Find', 'Dynamic Connectivity'],
        input: 'm=3, n=3, positions=[[0,0],[0,1],[1,2],[2,1]]',
        output: '[1, 1, 2, 3]',
        approach: 'Use Union-Find (Disjoint Set Union) with path compression and union by rank. Each time a new land cell is added, check its 4 neighbors. If a neighbor is land, union them. Track the number of connected components.',
        time: 'O(K * alpha(M*N)) where K is number of operations, alpha is inverse Ackermann',
        space: 'O(M*N)',
        visualizerType: 'graph',
        code: {
          python: `class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
        self.count = 0
    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]
    def union(self, x, y):
        px, py = self.find(x), self.find(y)
        if px == py: return False
        if self.rank[px] < self.rank[py]: px, py = py, px
        self.parent[py] = px
        if self.rank[px] == self.rank[py]: self.rank[px] += 1
        self.count -= 1
        return True

def numIslands2(m, n, positions):
    uf = UnionFind(m * n)
    grid = [0] * (m * n)
    result = []
    for r, c in positions:
        idx = r * n + c
        if grid[idx]:
            result.append(uf.count)
            continue
        grid[idx] = 1
        uf.count += 1
        for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:
            nr, nc = r+dr, c+dc
            if 0<=nr<m and 0<=nc<n and grid[nr*n+nc]:
                uf.union(idx, nr*n+nc)
        result.append(uf.count)
    return result

print(numIslands2(3, 3, [[0,0],[0,1],[1,2],[2,1]]))`,
          java: `class UnionFind {
    int[] parent, rank;
    int count = 0;
    UnionFind(int n) {
        parent = new int[n]; rank = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    }
    boolean union(int x, int y) {
        int px = find(x), py = find(y);
        if (px == py) return false;
        if (rank[px] < rank[py]) { int t = px; px = py; py = t; }
        parent[py] = px;
        if (rank[px] == rank[py]) rank[px]++;
        count--;
        return true;
    }
}

public List<Integer> numIslands2(int m, int n, int[][] positions) {
    UnionFind uf = new UnionFind(m * n);
    int[] grid = new int[m * n];
    List<Integer> result = new ArrayList<>();
    int[][] dirs = {{-1,0},{1,0},{0,-1},{0,1}};
    for (int[] pos : positions) {
        int idx = pos[0] * n + pos[1];
        if (grid[idx] == 1) { result.add(uf.count); continue; }
        grid[idx] = 1; uf.count++;
        for (int[] d : dirs) {
            int nr = pos[0]+d[0], nc = pos[1]+d[1];
            if (nr>=0 && nr<m && nc>=0 && nc<n && grid[nr*n+nc]==1)
                uf.union(idx, nr*n+nc);
        }
        result.add(uf.count);
    }
    return result;
}`
        },
        explanation: {
          intuition: 'As new land cells appear, we need to efficiently track connected components. Union-Find with path compression and union by rank gives near-constant time operations.',
          brute: 'For each new cell, run BFS/DFS to count components. O(K * M * N) time.',
          optimized: 'Union-Find with path compression and union by rank. O(K * alpha(M*N)) where alpha is the very slowly growing inverse Ackermann function.',
          dryRun: [
            'Add (0,0): count=1. No neighbors.',
            'Add (0,1): count=2. Union with (0,0). count=1.',
            'Add (1,2): count=2. No land neighbors.',
            'Add (2,1): count=3. No land neighbors.',
            'Result: [1, 1, 2, 3].'
          ],
          edgeCases: ['Adding a cell that is already land', 'Positions outside grid bounds', 'All positions create separate islands'],
          tips: ['Path compression flattens the tree structure, making future find operations nearly O(1). Union by rank keeps the tree balanced.']
        }
      },
      {
        id: 'nv-dsa-4',
        title: 'Design Twitter',
        difficulty: 'Medium',
        frequency: 75,
        tags: ['Design', 'Hash Map', 'Heap', 'Linked List'],
        input: 'postTweet(1, "tweet1"), follow(1, 2), getNewsFeed(1)',
        output: '["tweet1"]',
        approach: 'Use a hash map for user tweets and follow relationships. For getNewsFeed, merge the most recent tweets from the user and their followees using a min-heap of size 10.',
        time: 'postTweet O(1), follow O(1), getNewsFeed O(K log 10) where K is followee count',
        space: 'O(N) for storing tweets',
        visualizerType: 'graph',
        code: {
          python: `import heapq
from collections import defaultdict
from datetime import datetime

class Twitter:
    def __init__(self):
        self.tweets = defaultdict(list)
        self.following = defaultdict(set)
        self.time = 0

    def postTweet(self, userId, tweetId):
        self.tweets[userId].append((self.time, tweetId))
        self.time += 1

    def follow(self, followerId, followeeId):
        self.following[followerId].add(followeeId)

    def unfollow(self, followerId, followeeId):
        self.following[followerId].discard(followeeId)

    def getNewsFeed(self, userId):
        min_heap = []
        users = self.following[userId] | {userId}
        for uid in users:
            if self.tweets[uid]:
                time, tid = self.tweets[uid][-1]
                heapq.heappush(min_heap, (time, tid, uid, len(self.tweets[uid])-1))
        result = []
        while min_heap and len(result) < 10:
            time, tid, uid, idx = heapq.heappop(min_heap)
            result.append(tid)
            if idx > 0:
                t, t_id = self.tweets[uid][idx-1]
                heapq.heappush(min_heap, (t, t_id, uid, idx-1))
        return result

tw = Twitter()
tw.postTweet(1, "tweet1")
tw.postTweet(2, "tweet2")
tw.follow(1, 2)
print(tw.getNewsFeed(1))`,
          java: `import java.util.*;

class Twitter {
    private int time = 0;
    private Map<Integer, List<int[]>> tweets = new HashMap<>();
    private Map<Integer, Set<Integer>> following = new HashMap<>();

    public void postTweet(int userId, int tweetId) {
        tweets.computeIfAbsent(userId, k -> new ArrayList<>()).add(new int[]{time++, tweetId});
    }

    public void follow(int followerId, int followeeId) {
        following.computeIfAbsent(followerId, k -> new HashSet<>()).add(followeeId);
    }

    public List<Integer> getNewsFeed(int userId) {
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
        Set<Integer> users = new HashSet<>(following.getOrDefault(userId, Collections.emptySet()));
        users.add(userId);
        for (int uid : users) {
            List<int[]> userTweets = tweets.getOrDefault(uid, Collections.emptyList());
            if (!userTweets.isEmpty()) {
                int idx = userTweets.size() - 1;
                pq.offer(new int[]{userTweets.get(idx)[0], userTweets.get(idx)[1], uid, idx});
            }
        }
        List<Integer> result = new ArrayList<>();
        while (!pq.isEmpty() && result.size() < 10) {
            int[] curr = pq.poll();
            result.add(curr[1]);
            if (curr[3] > 0) {
                List<int[]> userTweets = tweets.get(curr[2]);
                int idx = curr[3] - 1;
                pq.offer(new int[]{userTweets.get(idx)[0], userTweets.get(idx)[1], curr[2], idx});
            }
        }
        return result;
    }
}`
        },
        explanation: {
          intuition: 'Each user has a sorted list of tweets (by time). getNewsFeed merges the most recent tweets from all followees. A min-heap of size 10 efficiently finds the top 10 most recent tweets.',
          brute: 'Collect all tweets from user and followees, sort by time, return top 10. O(N log N) per query.',
          optimized: 'Min-heap of size 10. For each followee, push their most recent tweet. Pop the most recent, push the next from that user. O(K log 10) where K is followee count.',
          dryRun: [
            'postTweet(1, "tweet1"): tweets={1: [(0, "tweet1")]}, time=1.',
            'postTweet(2, "tweet2"): tweets={2: [(1, "tweet2")]}, time=2.',
            'follow(1, 2): following={1: {2}}.',
            'getNewsFeed(1): users={1, 2}. Push (1, "tweet2", 2, 0) and (0, "tweet1", 1, 0).',
            'Pop (1, "tweet2"). Result=["tweet2"]. No more from user 2.',
            'Pop (0, "tweet1"). Result=["tweet2", "tweet1"].',
            'Return ["tweet2", "tweet1"].'
          ],
          edgeCases: ['User with no tweets', 'User follows themselves', 'Unfollow then getNewsFeed'],
          tips: ['Use the index into the tweet list to avoid creating new objects. The tweets list is naturally sorted by time (append-only).']
        }
      },
      {
        id: 'nv-dsa-5',
        title: 'Basic Calculator II',
        difficulty: 'Medium',
        frequency: 80,
        tags: ['Stack', 'String', 'Math'],
        input: '"3+2*2"',
        output: '7',
        approach: 'Use a stack to handle operator precedence. Iterate through the string, pushing numbers onto the stack. When encountering * or /, pop the top, compute, and push the result. Finally, sum all values in the stack.',
        time: 'O(N)',
        space: 'O(N)',
        visualizerType: 'sliding-window',
        code: {
          python: `def calculate(s):
    stack = []
    num = 0
    sign = '+'
    for i, c in enumerate(s):
        if c.isdigit():
            num = num * 10 + int(c)
        if c in '+-*/' or i == len(s) - 1:
            if sign == '+': stack.append(num)
            elif sign == '-': stack.append(-num)
            elif sign == '*': stack.append(stack.pop() * num)
            elif sign == '/': stack.append(int(stack.pop() / num))
            sign = c
            num = 0
    return sum(stack)

print(calculate("3+2*2"))    # 7
print(calculate(" 3/2 "))    # 1
print(calculate("3+2*2"))    # 7`,
          java: `public int calculate(String s) {
    Deque<Integer> stack = new ArrayDeque<>();
    int num = 0;
    char sign = '+';
    for (int i = 0; i < s.length(); i++) {
        char c = s.charAt(i);
        if (Character.isDigit(c)) num = num * 10 + (c - '0');
        if ((c != ' ' && !Character.isDigit(c)) || i == s.length() - 1) {
            switch (sign) {
                case '+': stack.push(num); break;
                case '-': stack.push(-num); break;
                case '*': stack.push(stack.pop() * num); break;
                case '/': stack.push(stack.pop() / num); break;
            }
            sign = c; num = 0;
        }
    }
    int result = 0;
    for (int n : stack) result += n;
    return result;
}`
        },
        explanation: {
          intuition: 'Multiplication and division have higher precedence than addition and subtraction. By using a stack, we can handle * and / immediately when we see the next operator, deferring + and - to the end.',
          brute: 'Two passes: first handle * and /, then handle + and -. O(N) but two passes.',
          optimized: 'Single pass with stack. Push numbers for + and -, immediately compute for * and /. O(N) time, one pass.',
          dryRun: [
            'i=0: num=3, sign=+. Push 3. stack=[3].',
            'i=1: c=+. Push 3 (already pushed). sign=+, num=0.',
            'i=2: num=2.',
            'i=3: c=*. Push 2. sign=*, num=0.',
            'i=4: num=2.',
            'i=5: c=2 (end). sign=*, compute: stack.pop()*2 = 3*2=6. Push 6. stack=[6].',
            'Wait, need to re-trace: at i=3, sign becomes *, so at i=4 we start new num=2. At i=5 (digit 2), num=22? No.',
            'Re-trace: s="3+2*2". i=0: num=3. i=1: c=+, push 3, sign=+. i=2: num=2. i=3: c=*, push 2, sign=*. i=4: num=2. i=5: end, sign=*, push stack.pop()*2=2*2=4. stack=[3,4]. Sum=7.'
          ],
          edgeCases: ['Division truncation toward zero', 'Negative numbers', 'Spaces in expression', 'Multi-digit numbers'],
          tips: ['Handle the last number by checking i == len(s)-1. Use int() in Python for truncation toward zero (matches Java behavior).']
        }
      },
      {
        id: 'nv-dsa-6',
        title: 'Find the Duplicate Number',
        difficulty: 'Medium',
        frequency: 77,
        tags: ['Cycle Detection', 'Array', 'Two Pointers'],
        input: 'nums = [1,3,4,2,2]',
        output: '2',
        approach: 'Treat the array as a linked list where nums[i] is the next node. A duplicate creates a cycle. Use Floyd\'s cycle detection (slow/fast pointers) to find the cycle entrance, which is the duplicate number.',
        time: 'O(N)',
        space: 'O(1)',
        visualizerType: 'graph',
        code: {
          python: `def findDuplicate(nums):
    slow = nums[0]
    fast = nums[0]
    while True:
        slow = nums[slow]
        fast = nums[nums[fast]]
        if slow == fast:
            break
    slow = nums[0]
    while slow != fast:
        slow = nums[slow]
        fast = nums[fast]
    return slow

print(findDuplicate([1,3,4,2,2]))  # 2`,
          java: `public int findDuplicate(int[] nums) {
    int slow = nums[0], fast = nums[0];
    do {
        slow = nums[slow];
        fast = nums[nums[fast]];
    } while (slow != fast);
    slow = nums[0];
    while (slow != fast) {
        slow = nums[slow];
        fast = nums[fast];
    }
    return slow;
}`
        },
        explanation: {
          intuition: 'Since values are 1 to N and there are N+1 elements, by treating each value as a pointer to the next index, a duplicate creates a cycle. Floyd\'s algorithm finds the cycle entrance in O(N) time and O(1) space.',
          brute: 'Use a hash set to track seen values. O(N) time, O(N) space.',
          optimized: 'Floyd\'s cycle detection. O(N) time, O(1) space. No modification to the array.',
          dryRun: [
            'nums=[1,3,4,2,2]. Start at index 0.',
            'slow: 0->1->3->2->4->2->4... (cycle at 2)',
            'fast: 0->1->2->4->2->4... (meets slow at 4)',
            'Phase 2: slow=0, fast=4. slow: 0->1->3->2. fast: 4->2. Meet at 2.',
            'Return 2.'
          ],
          edgeCases: ['Duplicate at the first position', 'All elements the same', 'N+1 elements with values 1 to N'],
          tips: ['The key insight is that the array can be viewed as a functional graph where each node has exactly one outgoing edge. The duplicate is the entrance to the cycle.']
        }
      },
      {
        id: 'nv-dsa-7',
        title: 'Rotate Image',
        difficulty: 'Medium',
        frequency: 85,
        tags: ['Matrix', 'Array'],
        input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]',
        output: '[[7,4,1],[8,5,2],[9,6,3]]',
        approach: 'Two approaches: (1) Transpose the matrix (swap matrix[i][j] with matrix[j][i]), then reverse each row. (2) Layer-by-layer rotation: for each layer, rotate 4 cells at a time.',
        time: 'O(N^2)',
        space: 'O(1) in-place',
        visualizerType: 'sliding-window',
        code: {
          python: `def rotate(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    for row in matrix:
        row.reverse()

matrix = [[1,2,3],[4,5,6],[7,8,9]]
rotate(matrix)
print(matrix)  # [[7,4,1],[8,5,2],[9,6,3]]`,
          java: `public void rotate(int[][] matrix) {
    int n = matrix.length;
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            int temp = matrix[i][j];
            matrix[i][j] = matrix[j][i];
            matrix[j][i] = temp;
        }
    }
    for (int i = 0; i < n; i++) {
        int left = 0, right = n - 1;
        while (left < right) {
            int temp = matrix[i][left];
            matrix[i][left] = matrix[i][right];
            matrix[i][right] = temp;
            left++; right--;
        }
    }
}`
        },
        explanation: {
          intuition: 'A 90-degree clockwise rotation is equivalent to a transpose followed by a horizontal flip (row reversal). The transpose swaps elements across the diagonal, then reversing rows completes the rotation.',
          brute: 'Create a new N x N matrix and place each element in its rotated position. O(N^2) time, O(N^2) space.',
          optimized: 'In-place: transpose + reverse rows. O(N^2) time, O(1) space.',
          dryRun: [
            'Original: [[1,2,3],[4,5,6],[7,8,9]].',
            'Transpose: swap (0,1)<->(1,0): 2<->4. swap (0,2)<->(2,0): 3<->7. swap (1,2)<->(2,1): 6<->8.',
            'After transpose: [[1,4,7],[2,5,8],[3,6,9]].',
            'Reverse rows: [[7,4,1],[8,5,2],[9,6,3]].'
          ],
          edgeCases: ['1x1 matrix (no change)', '2x2 matrix', 'Non-square matrix (not valid for rotation)'],
          tips: ['The layer-by-layer approach rotates 4 elements at a time: top->right->bottom->left->top. Both approaches are O(N^2) but the transpose+reverse is simpler to implement.']
        }
      },
      {
        id: 'nv-dsa-8',
        title: 'Decode Ways',
        difficulty: 'Medium',
        frequency: 79,
        tags: ['Dynamic Programming', 'String'],
        input: 's = "226"',
        output: '3',
        approach: 'DP where dp[i] = number of ways to decode s[0:i]. At each position, check if the single digit (1-9) is valid, and if the two-digit number (10-26) is valid. dp[i] = dp[i-1] (if single digit valid) + dp[i-2] (if two digits valid).',
        time: 'O(N)',
        space: 'O(1) with rolling variables',
        visualizerType: 'dp',
        code: {
          python: `def numDecodings(s):
    if not s or s[0] == '0':
        return 0
    prev2, prev1 = 1, 1
    for i in range(1, len(s)):
        curr = 0
        if s[i] != '0':
            curr += prev1
        if 10 <= int(s[i-1:i+1]) <= 26:
            curr += prev2
        prev2, prev1 = prev1, curr
    return prev1

print(numDecodings("226"))  # 3
print(numDecodings("06"))   # 0`,
          java: `public int numDecodings(String s) {
    if (s == null || s.length() == 0 || s.charAt(0) == '0') return 0;
    int prev2 = 1, prev1 = 1;
    for (int i = 1; i < s.length(); i++) {
        int curr = 0;
        if (s.charAt(i) != '0') curr += prev1;
        int twoDigit = Integer.parseInt(s.substring(i-1, i+1));
        if (twoDigit >= 10 && twoDigit <= 26) curr += prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`
        },
        explanation: {
          intuition: 'Each digit or pair of digits can map to a letter. We count all valid decode paths using DP, similar to climbing stairs but with validation constraints.',
          brute: 'Try all possible splits recursively. O(2^N) time.',
          optimized: 'DP with two rolling variables. O(N) time, O(1) space.',
          dryRun: [
            's="226". prev2=1, prev1=1.',
            'i=1: s[1]=2 (!=0), curr+=prev1=1. "22"=22 (10-26), curr+=prev2=1. curr=2. prev2=1, prev1=2.',
            'i=2: s[2]=6 (!=0), curr+=prev1=2. "26"=26 (10-26), curr+=prev2=1. curr=3. prev2=2, prev1=3.',
            'Return 3. Decodings: "2 2 6", "22 6", "2 26".'
          ],
          edgeCases: ['Starts with 0 (no valid decoding)', 'Contains "00" (invalid)', 'Single digit', 'Numbers > 26'],
          tips: ['The trick is that 0 cannot be decoded alone (it must be part of 10 or 20). Handle the 0 case by checking s[i] != 0 before adding prev1.']
        }
      }
    ],
    technical: [
      {
        id: 'nv-t-1',
        category: 'GPU Architecture',
        difficulty: 'Advanced',
        frequency: 92,
        question: 'Explain CUDA memory hierarchy and how bank conflicts affect performance.',
        answer: 'CUDA has a hierarchical memory architecture: (1) Registers: Fastest (1 cycle), per-thread, limited数量 (256 per thread on modern GPUs). Used for local variables. (2) Shared Memory: ~5-30 cycles, shared within a thread block (up to 48KB per block). Acts as a user-managed cache. (3) L1/L2 Cache: Hardware-managed, shared across threads. (4) Global Memory: ~400-800 cycles, accessible by all threads, resides in DRAM. Bank conflicts occur in shared memory when multiple threads in a warp access different addresses that map to the same bank. Shared memory is divided into 32 banks (one per thread in a warp). Successive 32-bit words go to successive banks. If threads access words at addresses that are multiples of 32 apart, all 32 threads hit the same bank, causing a 32-way conflict that serializes access. Avoid by padding arrays (e.g., declaring float arr[33] instead of float arr[32] for a 32-element array) or restructuring access patterns so threads access consecutive addresses.',
        keyPoints: ['Register -> Shared -> Global memory hierarchy', 'Bank conflicts serialize shared memory access', 'Padding avoids bank conflicts', 'Memory coalescing for global access', '400x latency difference between shared and global'],
        followUps: ['How does memory coalescing work for global memory access?', 'What is the maximum shared memory per block on A100?']
      },
      {
        id: 'nv-t-2',
        category: 'GPU Architecture',
        difficulty: 'Advanced',
        frequency: 88,
        question: 'How do Tensor Cores accelerate matrix multiplication, and what are the implications for deep learning?',
        answer: 'Tensor Cores are specialized hardware units that perform mixed-precision matrix multiply-and-accumulate operations in a single clock cycle. A Tensor Core takes two 4x4 matrices in FP16 and produces a 4x4 result in FP32 (or FP16 with accumulation). This is fundamentally different from CUDA cores which perform one FP32 FMA per cycle. Key implications: (1) Throughput: An A100 Tensor Core achieves 312 TFLOPS for FP16 compared to 19.5 TFLOPS for FP32 on CUDA cores - a 16x improvement. (2) Mixed precision: Tensor Cores accept FP16 inputs but accumulate in FP32, maintaining numerical stability while gaining speed. (3) For deep learning: Matrix multiplication dominates transformer forward passes. Tensor Cores accelerate attention computation (Q*K^T and attention*V) and linear layers. (4) TF32: On Ampere GPUs, TF32 mode uses FP32 inputs but FP16-range internal precision, giving 8x speedup with minimal accuracy loss. (5) Sparsity: A100 Tensor Cores support structured sparsity (2:4 pattern), doubling throughput when 50% of weights are zero.',
        keyPoints: ['4x4 matrix FMA in one cycle', 'Mixed precision (FP16 in, FP32 accumulate)', '16x throughput over CUDA cores for matrix ops', 'TF32 for transparent FP32 acceleration', 'Structured sparsity support'],
        followUps: ['How does the 2:4 sparsity pattern work?', 'What is the difference between TF32 and FP16 for training?']
      },
      {
        id: 'nv-t-3',
        category: 'System Design',
        difficulty: 'Advanced',
        frequency: 85,
        question: 'Design a GPU-accelerated inference pipeline for serving a 70B parameter LLM.',
        answer: 'Serving a 70B model requires multi-GPU inference with careful optimization: (1) Model parallelism: Use tensor parallelism (TP=4) across 4 GPUs within a node via NVLink. Each GPU holds a shard of each weight matrix. For the attention layer, Q/K/V projections are split along the head dimension. For MLP layers, weights are split along the output dimension. (2) KV cache management: Use PagedAttention (vLLM) to avoid memory fragmentation. Allocate KV cache in 16-token blocks. This enables 3-4x larger batch sizes compared to contiguous allocation. (3) Continuous batching: Implement iteration-level scheduling where new requests join the batch at each decoding step. This improves GPU utilization from 30-40% (static batching) to 80-90%. (4) Quantization: Use INT8 weight-only quantization for the model weights (4x memory reduction), keeping activations in FP16. This reduces memory footprint from 140GB to ~35GB, fitting on 4x 80GB A100s. (5) Speculative decoding: Use a small draft model (1-3B parameters) to propose tokens, verified by the full model in parallel. This reduces latency by 2-3x for autoregressive generation. (6) Pipeline optimization: Overlap compute and communication using CUDA streams. Prefetch next-layer weights while computing current layer.',
        keyPoints: ['Tensor parallelism across NVLink-connected GPUs', 'PagedAttention for KV cache management', 'Continuous batching for 80-90% utilization', 'INT8 quantization to reduce memory 4x', 'Speculative decoding for 2-3x latency reduction'],
        followUps: ['How does continuous batching differ from dynamic batching?', 'What is the communication overhead of tensor parallelism across NVLink?']
      },
      {
        id: 'nv-t-4',
        category: 'CUDA Programming',
        difficulty: 'Advanced',
        frequency: 82,
        question: 'What is warp divergence, and how do you minimize it in CUDA kernels?',
        answer: 'Warp divergence occurs when threads within a warp (32 threads) take different execution paths through conditional branches. The GPU executes both paths serially, disabling threads that do not take each path. This can reduce throughput by up to 32x in the worst case. Example: if (threadIdx.x % 2 == 0) doA(); else doB(); - all even threads execute doA() with odd threads disabled, then all odd threads execute doB() with even threads disabled. Minimization strategies: (1) Restructure conditionals to group threads: sort data so threads in the same warp follow the same path. (2) Use predication for simple conditions: the compiler may convert if-else to predicated execution (both paths computed, results masked). (3) Separate kernels for different cases: launch one kernel for the common case, another for the rare case. (4) Use warp-level vote functions (__all(), __any()) to make branch decisions based on warp consensus. (5) For data-dependent branching (e.g., sparse matrices), use compaction to group active elements before processing.',
        keyPoints: ['Warp divergence serializes different execution paths', 'Up to 32x throughput reduction', 'Sort data to align threads with branch paths', 'Separate kernels for common vs rare cases', 'Use warp vote functions for consensus'],
        followUps: ['How does the NVIDIA compiler handle simple if-else statements?', 'What is the performance impact of divergence in a for loop vs a single if statement?']
      },
      {
        id: 'nv-t-5',
        category: 'System Design',
        difficulty: 'Advanced',
        frequency: 80,
        question: 'Design the Nvidia Omniverse rendering pipeline for real-time ray tracing at scale.',
        answer: 'The Omniverse rendering pipeline combines rasterization and ray tracing: (1) Scene representation: Use USD (Universal Scene Description) as the scene graph. Each frame, the scene graph is translated into an acceleration structure (BVH) for ray tracing. Build BVH using the SAH (Surface Area Heuristic) algorithm. (2) Hybrid rendering: Use rasterization for primary rays (camera view) to generate the initial image. Then launch ray tracing shaders for secondary rays (reflections, shadows, global illumination). This hybrid approach gets the speed of rasterization with the quality of ray tracing. (3) Denoising: Since tracing limited rays produces noisy images, use NVIDIA\'s AI denoiser (based on a temporal convolutional network). The denoiser takes the noisy image plus auxiliary buffers (normal, albedo, motion vectors) and produces a clean image. This allows rendering with 1-4 samples per pixel instead of hundreds. (4) Multi-GPU scaling: Partition the screen into tiles. Each GPU renders a tile using its own copy of the BVH. Composite tiles using a final compositing pass. NVLink enables fast tile exchange between GPUs. (5) Real-time feedback: For interactive editing, use a progressive rendering mode that starts with a low-sample image and refines over time. The denoiser produces usable results within 1-2 frames.',
        keyPoints: ['USD scene graph to BVH acceleration structure', 'Hybrid rasterization + ray tracing', 'AI denoiser enables 1-4 spp rendering', 'Tile-based multi-GPU scaling', 'Progressive refinement for interactivity'],
        followUps: ['How does the BVH construction algorithm affect rendering performance?', 'What is the trade-off between denoiser quality and latency?']
      },
      {
        id: 'nv-t-6',
        category: 'GPU Architecture',
        difficulty: 'Advanced',
        frequency: 78,
        question: 'Compare NVLink vs PCIe for multi-GPU communication. When would you use each?',
        answer: 'NVLink and PCIe serve different roles in multi-GPU systems: (1) Bandwidth: NVLink 4.0 (H100) provides 900 GB/s bidirectional bandwidth per GPU (18 links). PCIe 5.0 x16 provides 64 GB/s bidirectional. NVLink is 14x faster. (2) Latency: NVLink has ~1-2 microsecond latency vs ~5-10 microseconds for PCIe. This matters for fine-grained communication like gradient all-reduce. (3) Topology: NVLink connects GPUs in aNVSwitch fabric, enabling full bisection bandwidth between any two GPUs. PCIe goes through a CPU or PCIe switch, creating bottlenecks. (4) Use cases for NVLink: Tensor parallelism within a node (splitting weight matrices across GPUs), pipeline parallelism stages that require frequent communication, all-reduce for data parallelism gradient sync. (5) Use cases for PCIe: Communication between nodes (via InfiniBand), connecting GPUs to CPUs for data transfer, connecting storage devices. (6) Cost: NVSwitch adds significant cost (~$10K per switch). PCIe is commodity. (7) For training: NVLink is essential for tensor parallelism (sub-microsecond sync between layers). PCIe is sufficient for data parallelism where communication is overlapped with computation.',
        keyPoints: ['NVLink: 14x higher bandwidth than PCIe', '1-2 microsecond vs 5-10 microsecond latency', 'NVLink enables NVSwitch full bisection bandwidth', 'NVLink for intra-node tensor parallelism', 'PCIe for inter-node and storage communication'],
        followUps: ['How does NVLink affect the design of all-reduce algorithms?', 'What is the power consumption difference between NVLink and PCIe connections?']
      },
      {
        id: 'nv-t-7',
        category: 'CUDA Programming',
        difficulty: 'Advanced',
        frequency: 85,
        question: 'How would you optimize a CUDA kernel for matrix multiplication to approach peak GPU throughput?',
        answer: 'Optimizing GEMM (General Matrix Multiply) for peak throughput involves multiple techniques: (1) Tiling: Divide matrices into tiles that fit in shared memory (e.g., 32x32). Each thread block loads a tile of A and B into shared memory, then computes a portion of C using the tiles. This amortizes global memory loads. (2) Memory coalescing: Ensure threads in a warp access consecutive memory addresses. For matrix A (row-major), threads should access consecutive columns. For matrix B, access consecutive rows. (3) Register tiling: Each thread computes a small sub-tile of C (e.g., 8x8) using registers, performing 8x8xK multiply-accumulates before writing back. This maximizes arithmetic intensity. (4) Warp specialization: Assign different warps to different roles - some load tiles from global to shared memory, others compute. Overlap loading and computation using double-buffering. (5) Vectorized loads: Use float4 loads to fetch 4 elements at once, improving memory throughput. (6) Instruction-level parallelism: Unroll inner loops to hide arithmetic latency. Use #pragma unroll. (7) Mixed precision: Use Tensor Cores with FP16 inputs and FP32 accumulation for 8x-16x throughput boost. The cuBLAS library implements all these optimizations and typically achieves 80-90% of peak throughput.',
        keyPoints: ['Tiling for shared memory reuse', 'Memory coalescing for global access', 'Register tiling for arithmetic intensity', 'Double-buffering to overlap load and compute', 'Tensor Cores for mixed-precision throughput'],
        followUps: ['How does double-buffering hide memory latency?', 'What is the arithmetic intensity required to be compute-bound vs memory-bound?']
      },
      {
        id: 'nv-t-8',
        category: 'AI/ML Infrastructure',
        difficulty: 'Advanced',
        frequency: 83,
        question: 'How do you manage GPU memory efficiently when training a large model that does not fit in a single GPU?',
        answer: 'When model parameters, gradients, and optimizer states exceed GPU memory, several techniques help: (1) ZeRO (Zero Redundancy Optimizer): Partition optimizer states across data-parallel ranks. ZeRO Stage 1 partitions optimizer states (8x memory reduction for Adam). Stage 2 also partitions gradients (another 2x). Stage 3 also partitions parameters (another N-fold for N GPUs). (2) Activation checkpointing: Instead of storing all intermediate activations for backward pass, store only checkpoints every few layers. Recompute missing activations during backward pass. This trades ~30% more computation for significant memory savings. (3) Mixed precision training: Store parameters and activations in FP16 (2x memory savings). Keep a FP32 copy of master weights for gradient updates. (4) Gradient accumulation: Instead of synchronizing gradients every step, accumulate gradients over N micro-batches, then do one all-reduce. This reduces the peak memory for gradient buffers by Nx. (5) Offloading: For very large models, offload optimizer states or activations to CPU memory or NVMe storage. Use async transfers to overlap with computation. (6) Model parallelism: For models too large for any single GPU, combine tensor parallelism (split weight matrices) with pipeline parallelism (split layers). The choice depends on the model architecture and inter-GPU bandwidth.',
        keyPoints: ['ZeRO Stage 1/2/3 for progressive memory partitioning', 'Activation checkpointing trades compute for memory', 'Mixed precision halves memory for parameters and activations', 'Gradient accumulation reduces peak gradient memory', 'Offloading to CPU/NVMe for extreme cases'],
        followUps: ['How does ZeRO-3 affect communication volume?', 'What is the optimal checkpointing interval for a 100-layer transformer?']
      }
    ],
    hr: [
      {
        id: 'nv-hr-1',
        question: 'Tell me about a time you optimized something to run significantly faster. What was your approach?',
        modelAnswer: 'I was working on an ML training pipeline where the data loading step was bottlenecking GPU utilization at only 40%. I profiled the pipeline using NVIDIA Nsight Systems and discovered that the Python data preprocessing was serialized and not overlapping with GPU computation. I restructured the pipeline to use CUDA streams for async data transfers, implemented pinned memory for host-to-device copies, and rewrote the preprocessing in C++ with SIMD intrinsics. I also increased the number of data loader workers and implemented a pre-fetch buffer. The result was GPU utilization increasing from 40% to 92%, and training throughput improved by 2.3x. The key was understanding the full system - the bottleneck was not in the GPU kernel itself but in the data feeding pipeline.',
        aiTips: 'Nvidia values speed-of-light execution. Show that you can profile, identify bottlenecks, and optimize across the full stack, not just the obvious place.',
        starTips: {
          situation: 'ML training pipeline had 40% GPU utilization due to data loading bottleneck.',
          task: 'Optimize the pipeline to achieve near-peak GPU throughput.',
          action: 'Profiled with Nsight Systems, identified Python preprocessing as bottleneck. Implemented CUDA streams, pinned memory, C++ preprocessing with SIMD, and async prefetching.',
          result: 'GPU utilization increased from 40% to 92%. Training throughput improved 2.3x, reducing training time from 5 days to 2.2 days.'
        }
      },
      {
        id: 'nv-hr-2',
        question: 'Describe a situation where you had to push the absolute limits of performance. What did you learn?',
        modelAnswer: 'I was porting a computational physics simulation from CPU to GPU. The CPU version took 8 hours per simulation. My initial CUDA implementation was 10x faster (48 minutes), but the physics team needed it under 10 minutes for interactive parameter sweeps. I went through multiple optimization rounds: (1) Memory optimization: Changed from global memory to shared memory for stencil operations, reducing memory traffic by 8x. (2) Computation optimization: Replaced double-precision with single-precision where numerically stable, gaining 2x on Tesla K80. (3) Parallelism optimization: Increased occupancy by reducing register pressure through loop unrolling and thread coarsening. (4) Algorithmic optimization: Changed the time-stepping scheme to allow larger stable time steps, reducing total iterations by 3x. Final result: 7 minutes per simulation, a 68x speedup over CPU. The lesson was that performance optimization requires both low-level CUDA knowledge and high-level algorithmic thinking.',
        aiTips: 'Show that you understand performance optimization at multiple levels - from hardware architecture to algorithms. Nvidia values engineers who think at all levels of the stack.',
        starTips: {
          situation: 'Physics simulation took 8 hours on CPU, initial GPU port was 48 minutes, but needed under 10 minutes.',
          task: 'Achieve 10x further speedup through systematic optimization.',
          action: 'Optimized memory (shared memory for stencil), computation (mixed precision), parallelism (occupancy tuning), and algorithm (larger time steps).',
          result: 'Achieved 7 minutes per simulation (68x over CPU). The optimization methodology became the standard for all GPU ports in the team.'
        }
      },
      {
        id: 'nv-hr-3',
        question: 'Tell me about a time you had to solve a problem you had never seen before. How did you approach it?',
        modelAnswer: 'I was asked to implement a GPU-accelerated sparse matrix-vector multiplication (SpMV) for a new graph analytics framework. I had no prior experience with sparse matrix formats. I started by reading the CUDA sparse matrix library documentation and research papers on CSR, CSC, ELL, and COO formats. I benchmarked each format on our target hardware (V100) with representative graph datasets. I found that CSR worked well for power-law graphs but poorly for uniform随机 graphs. I designed a format-adaptive SpMV that selects the optimal format at runtime based on graph statistics (degree distribution, density). I implemented this using CUDA dynamic parallelism for format selection and kernel launch. The result was a 3-5x speedup over the baseline CSR implementation across diverse graph types. This taught me that the best approach often requires understanding both the algorithm and the hardware deeply.',
        aiTips: 'Show intellectual curiosity and the ability to learn complex topics quickly. Nvidia values engineers who can tackle novel problems.',
        starTips: {
          situation: 'Asked to implement GPU-accelerated SpMV for graph analytics with no prior sparse matrix experience.',
          task: 'Learn sparse matrix formats, benchmark on target hardware, and design an optimal solution.',
          action: 'Read research papers, benchmarked CSR/CSC/ELL/COO on V100, designed format-adaptive SpMV using CUDA dynamic parallelism.',
          result: '3-5x speedup over baseline across diverse graph types. The adaptive approach became the foundation for the graph analytics framework.'
        }
      },
      {
        id: 'nv-hr-4',
        question: 'How do you handle disagreements about technical architecture with senior engineers?',
        modelAnswer: 'I was designing the memory management system for a multi-GPU inference server. A senior architect proposed a simple pool allocator. I believed a more sophisticated system using CUDA unified memory with explicit prefetching would be better for our variable-length sequence workload. Instead of arguing theoretically, I built both implementations and benchmarked them on real workloads. The pool allocator was faster for fixed-size allocations but caused 30% more memory fragmentation with variable-length sequences, limiting batch size. My unified memory approach had slightly higher per-allocation overhead but allowed 2x larger batch sizes due to better memory utilization. I presented the data showing that for our specific workload (variable-length LLM sequences), the unified memory approach provided 40% higher throughput despite the per-allocation overhead. The senior architect agreed the data supported my approach. We shipped my design, and it handled 40% more concurrent users.',
        aiTips: 'Show that you can disagree with senior people constructively using data. Nvidia values intellectual honesty and evidence-based decisions.',
        starTips: {
          situation: 'Disagreed with senior architect about memory management for multi-GPU inference server.',
          task: 'Design the optimal memory management system for variable-length sequences.',
          action: 'Built both implementations (pool allocator vs unified memory), benchmarked on real workloads, presented data showing 40% higher throughput with unified memory approach.',
          result: 'Senior architect agreed based on data. Shipped unified memory approach, handling 40% more concurrent users than the pool allocator would have.'
        }
      },
      {
        id: 'nv-hr-5',
        question: 'Tell me about a time you failed. What did you learn and how did it change your approach?',
        modelAnswer: 'I was leading the optimization of a CUDA kernel for image processing. I focused exclusively on maximizing FLOPS - I had achieved 85% of peak compute throughput. I was proud of the result and deployed it to production. But when users tested it, the end-to-end application was only 10% faster, not the 5x I expected. The problem was that the kernel was compute-bound but the overall application was memory-bandwidth-bound. I had optimized the wrong bottleneck. The lesson fundamentally changed my approach: I now always start with roofline analysis to identify whether a workload is compute-bound or memory-bound before optimizing. I also learned to measure end-to-end performance, not just kernel performance. I now profile the entire application first, identify the top 3 bottlenecks, and address them in order of impact. This systematic approach has prevented similar mistakes.',
        aiTips: 'Show genuine learning from failure and concrete changes to your methodology. Nvidia values engineers who learn from mistakes and improve their process.',
        starTips: {
          situation: 'Optimized CUDA kernel to 85% peak FLOPS but application only saw 10% speedup.',
          task: 'Understand why kernel optimization did not translate to application speedup.',
          action: 'Discovered the workload was memory-bandwidth-bound, not compute-bound. Learned to use roofline analysis and measure end-to-end performance.',
          result: 'Adopted systematic optimization methodology: profile full application, identify bottleneck type, optimize in order of impact. Prevented similar mistakes in 3 subsequent projects.'
        }
      },
      {
        id: 'nv-hr-6',
        question: 'How did you learn GPU programming, and how do you stay current with rapid hardware evolution?',
        modelAnswer: 'I started GPU programming by implementing a simple matrix multiplication on my personal GPU using CUDA. I read the CUDA Programming Guide and the book "Programming Massively Parallel Processors." The turning point was when I implemented a complete N-body simulation - I learned by doing, hitting real performance problems and solving them. To stay current: (1) I follow NVIDIA\'s GTC presentations and technical blogs. (2) I benchmark new hardware as soon as it is available in cloud instances. (3) I contribute to open-source CUDA projects to see how experts solve problems. (4) I read papers from SC, IPDPS, and GTC conferences. The rapid evolution of GPU hardware means that performance assumptions can become outdated quickly. For example, the introduction of Tensor Cores made many hand-tuned CUDA kernels obsolete overnight. I stay adaptable by understanding the principles (memory hierarchy, parallelism, arithmetic intensity) rather than memorizing specific hardware parameters.',
        aiTips: 'Show passion for GPU computing and a systematic approach to learning. Nvidia values engineers who are deeply curious about the hardware.',
        starTips: {
          situation: 'Needed to learn GPU programming from scratch for a project.',
          task: 'Get productive with CUDA quickly while building deep understanding.',
          action: 'Started with simple projects, read CUDA Programming Guide, implemented N-body simulation. Stay current through GTC, benchmarking, and open-source contributions.',
          result: 'Became the team GPU expert within 6 months. Established a hardware evaluation process for new GPU architectures.'
        }
      },
      {
        id: 'nv-hr-7',
        question: 'Describe a time you debugged a complex system-level issue that was not obvious.',
        modelAnswer: 'We had intermittent CUDA kernel failures that only occurred when running on multi-node GPU clusters. The same code worked fine on single-node systems. The error was CUDA_ERROR_ILLEGAL_ADDRESS, but only happened after 2-3 hours of training. I started by enabling compute-sanitizer to track memory accesses, but it did not catch the issue because the error was non-deterministic. I added extensive CUDA error checking after every API call and logged thread block/warp indices at failure. The breakthrough came when I noticed the failures always occurred when a specific GPU (GPU 3 on node 2) was involved. I discovered that our communication library was using unified virtual addressing (UVA) and the GPU had a slightly different memory topology due to a firmware issue. The fix was to pin memory allocations to specific GPUs and use explicitcudaMemcpyPeer instead of relying on UVA. This taught me that multi-GPU debugging requires understanding the hardware topology, not just the software.',
        aiTips: 'Show systematic debugging methodology and the ability to investigate issues across hardware and software layers.',
        starTips: {
          situation: 'Intermittent CUDA_ERROR_ILLEGAL_ADDRESS on multi-node clusters after 2-3 hours, not reproducible on single-node.',
          task: 'Identify root cause of non-deterministic GPU memory error.',
          action: 'Enabled compute-sanitizer, added CUDA error checking with thread context logging, correlated failures with specific GPU topology, discovered firmware-related UVA issue.',
          result: 'Fixed by pinning memory and using explicit peer copy. Established multi-GPU debugging methodology for the team.'
        }
      },
      {
        id: 'nv-hr-8',
        question: 'Why do you want to work at Nvidia specifically?',
        modelAnswer: 'Nvidia is uniquely positioned at the intersection of hardware and software innovation. What excites me most is that the problems I would work on here do not exist anywhere else - optimizing CUDA kernels for next-generation architectures, designing memory hierarchies for trillion-parameter models, and pushing the boundaries of what is computationally possible. I am drawn to the speed-of-light execution culture - the idea that the best solution wins regardless of who proposed it. My experience optimizing GPU-accelerated ML pipelines has given me deep appreciation for the hardware-software co-design that Nvidia excels at. I want to work on the CUDA toolkit, TensorRT, or NCCL - the foundational software that enables the entire AI ecosystem. The opportunity to directly impact the performance of every AI application built on Nvidia hardware is exactly the kind of scale of impact I want to have in my career.',
        aiTips: 'Be specific about what draws you to Nvidia - mention specific products, technologies, or cultural aspects. Show deep technical understanding.',
        starTips: {
          situation: 'Motivated by Nvidia\'s unique position at the hardware-software intersection and the scale of impact.',
          task: 'Articulate why your GPU programming experience and optimization skills make you a strong fit.',
          action: 'Connected your experience with CUDA optimization, ML pipeline performance, and hardware-software co-design to Nvidia\'s specific technical challenges.',
          result: 'Demonstrated genuine passion for GPU computing and readiness to contribute to foundational CUDA/AI software from day one.'
        }
      }
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg',
    industry: 'Artificial Intelligence & Research',
    hiringRoles: ['Research Scientist', 'Machine Learning Engineer', 'Software Engineer (Infra)'],
    interviewRounds: ['Take-home Project', 'Technical Screen (ML/Systems)', 'Culture & Safety Fit'],
    salaryRange: '₹40L - ₹80L+',
    brandColor: '#10A37F',
    culture: 'AGI Focus, Safety First, Research Driven, High Density Talent',
    difficulty: 'Elite',
    completion: 0,
    stats: { placed: '12', avgpackage: '60.0 LPA' },
    founders: [
      { name: 'Sam Altman', title: 'CEO', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/SlavaBlazerPhotography-31.jpg/250px-SlavaBlazerPhotography-31.jpg' },
      { name: 'Greg Brockman', title: 'President', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Disrupt_SF_TechCrunch_Disrupt_San_Francisco_2019_-_Day_2_%2848838200316%29_%28cropped%29.jpg/250px-Disrupt_SF_TechCrunch_Disrupt_San_Francisco_2019_-_Day_2_%2848838200316%29_%28cropped%29.jpg' }
    ],
    focus: 'Developing and ensuring artificial general intelligence (AGI) benefits all of humanity.',
    motto: '"To ensure that AGI benefits all of humanity."',
    hiringPhilosophy: 'We seek incredibly high talent density. We hire mission-aligned individuals who prioritize safety and can operate at the bleeding edge of AI research.',
    dsa: [
      {
        id: 'oai-dsa-1',
        title: 'Design a Tokenizer using Trie',
        difficulty: 'Hard',
        frequency: 95,
        tags: ['Trie', 'String', 'Design', 'Data Structures'],
        input: 'words = ["hugging", "face", "hug"], prefix("hug")',
        output: '["hug", "hugging"]',
        approach: 'Implement a prefix tree where each node stores a character and a flag indicating end-of-word. This allows O(L) insertion and prefix matching for BPE-style tokenizers used in GPT models.',
        time: 'O(L) for insert/search, where L is token length',
        space: 'O(N * L) for N tokens of average length L',
        visualizerType: 'tree',
        code: {
          python: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class TokenizerTrie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end = True

    def search(self, word: str) -> bool:
        node = self.root
        for char in word:
            if char not in node.children:
                return False
            node = node.children[char]
        return node.is_end

    def starts_with(self, prefix: str) -> list:
        node = self.root
        for char in prefix:
            if char not in node.children:
                return []
            node = node.children[char]
        results = []
        self._collect(node, prefix, results)
        return results

    def _collect(self, node, current, results):
        if node.is_end:
            results.append(current)
        for char, child in node.children.items():
            self._collect(child, current + char, results)`,
          java: `class TrieNode {
    TrieNode[] children = new TrieNode[26];
    boolean isEnd = false;
}

class TokenizerTrie {
    private TrieNode root;

    public TokenizerTrie() {
        root = new TrieNode();
    }

    public void insert(String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            int idx = c - 'a';
            if (node.children[idx] == null) {
                node.children[idx] = new TrieNode();
            }
            node = node.children[idx];
        }
        node.isEnd = true;
    }

    public boolean search(String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            int idx = c - 'a';
            if (node.children[idx] == null) return false;
            node = node.children[idx];
        }
        return node.isEnd;
    }

    public List<String> startsWith(String prefix) {
        TrieNode node = root;
        for (char c : prefix.toCharArray()) {
            int idx = c - 'a';
            if (node.children[idx] == null) return new ArrayList<>();
            node = node.children[idx];
        }
        List<String> results = new ArrayList<>();
        collect(node, new StringBuilder(prefix), results);
        return results;
    }

    private void collect(TrieNode node, StringBuilder sb, List<String> results) {
        if (node.isEnd) results.add(sb.toString());
        for (int i = 0; i < 26; i++) {
            if (node.children[i] != null) {
                sb.append((char)('a' + i));
                collect(node.children[i], sb, results);
                sb.deleteCharAt(sb.length() - 1);
            }
        }
    }
}`
        },
        explanation: {
          intuition: 'GPT-style models use BPE tokenizers that need fast prefix lookups. A Trie enables O(L) token matching, critical for real-time inference pipelines where tokenization is on the hot path.',
          brute: 'Store all tokens in a hash set. For prefix matching, iterate through all tokens and check if they start with the prefix. O(N * L) per query.',
          optimized: 'Trie data structure navigates character by character. Insert and search are O(L). Prefix matching follows the trie branches to collect all completions in O(L + K) where K is the number of results.',
          dryRun: [
            'Insert "hugging": root -> h -> u -> g -> g -> i -> n -> g (isEnd=true)',
            'Insert "hug": root -> h -> u -> g (isEnd=true)',
            'Search "hug": Traverse h->u->g. Node exists and isEnd=true. Return true.',
            'startsWith("hug"): Traverse h->u->g, collect "hug" and continue to collect "hugging".'
          ],
          edgeCases: ['Empty string insertion', 'Case sensitivity (ensure consistent casing)', 'Prefix that matches no tokens returns empty list'],
          tips: ['For production tokenizers, consider using a HashMap instead of fixed array for children to handle Unicode characters. Memory-optimize by compressing chains of single-child nodes.']
        }
      },
      {
        id: 'oai-dsa-2',
        title: 'Kth Largest Element in a Stream',
        difficulty: 'Medium',
        frequency: 82,
        tags: ['Heap', 'Priority Queue', 'Stream Processing'],
        input: 'k = 3, nums = [4, 5, 8, 2], add(3) -> add(5) -> add(10)',
        output: '4, 5, 5',
        approach: 'Maintain a min-heap of size k. The root of the min-heap is always the kth largest element. For each new element, if it is larger than the root, replace the root and heapify.',
        time: 'O(N log k) for initialization, O(log k) per add operation',
        space: 'O(k) for the min-heap',
        visualizerType: 'tree',
        code: {
          python: `import heapq

class KthLargest:
    def __init__(self, k: int, nums: list):
        self.k = k
        self.min_heap = nums[:]
        heapq.heapify(self.min_heap)
        while len(self.min_heap) > k:
            heapq.heappop(self.min_heap)

    def add(self, val: int) -> int:
        if len(self.min_heap) < self.k:
            heapq.heappush(self.min_heap, val)
        elif val > self.min_heap[0]:
            heapq.heapreplace(self.min_heap, val)
        return self.min_heap[0]

    def stream_process(self, stream: list) -> list:
        results = []
        for val in stream:
            results.append(self.add(val))
        return results

kth = KthLargest(3, [4, 5, 8, 2])
print(kth.add(3))   # Output: 4
print(kth.add(5))   # Output: 5
print(kth.add(10))  # Output: 5`,
          java: `import java.util.PriorityQueue;

class KthLargest {
    private PriorityQueue<Integer> minHeap;
    private int k;

    public KthLargest(int k, int[] nums) {
        this.k = k;
        this.minHeap = new PriorityQueue<>(k);
        for (int num : nums) {
            add(num);
        }
    }

    public int add(int val) {
        if (minHeap.size() < k) {
            minHeap.offer(val);
        } else if (val > minHeap.peek()) {
            minHeap.poll();
            minHeap.offer(val);
        }
        return minHeap.peek();
    }

    public static void main(String[] args) {
        KthLargest kth = new KthLargest(3, new int[]{4, 5, 8, 2});
        System.out.println(kth.add(3));   // Output: 4
        System.out.println(kth.add(5));   // Output: 5
        System.out.println(kth.add(10));  // Output: 5
    }
}`
        },
        explanation: {
          intuition: 'For streaming data in LLM inference logs (token counts, latency metrics), finding the kth largest element efficiently requires maintaining only k elements rather than sorting the entire stream.',
          brute: 'Store all elements, sort them, and return the kth largest. O(N log N) for each query.',
          optimized: 'Use a min-heap of size k. The smallest element in the heap is the kth largest overall. Each insertion is O(log k).',
          dryRun: [
            'Initial heap with k=3: [4, 5, 8, 2] -> heapify -> [2, 4, 8] -> pop -> [4, 5, 8]',
            'add(3): 3 < 4 (heap root), skip. Return 4.',
            'add(5): 5 > 4 (heap root), replace. Heap becomes [5, 5, 8]. Return 5.',
            'add(10): 10 > 5 (heap root), replace. Heap becomes [5, 8, 10]. Return 5.'
          ],
          edgeCases: ['Stream with fewer than k elements', 'All identical elements', 'Negative numbers'],
          tips: ['Use PriorityQueue in Java (min-heap by default). In Python, heapq is a min-heap. For kth smallest, negate values or use a max-heap.']
        }
      },
      {
        id: 'oai-dsa-3',
        title: 'Implement Trie with Autocomplete',
        difficulty: 'Hard',
        frequency: 91,
        tags: ['Trie', 'DFS', 'Backtracking', 'Design'],
        input: 'words = ["open", "openai", "opensource", "api"], autocomplete("open")',
        output: '["open", "openai", "opensource"]',
        approach: 'Build a trie from the vocabulary. For autocomplete, navigate to the prefix node, then DFS to collect all words under that prefix. Rank results by frequency or relevance.',
        time: 'O(L) for insert, O(L + K) for autocomplete where K is results count',
        space: 'O(N * L) for the trie',
        visualizerType: 'tree',
        code: {
          python: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False
        self.frequency = 0

class AutocompleteTrie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str, freq: int = 1) -> None:
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end = True
        node.frequency += freq

    def autocomplete(self, prefix: str, max_results: int = 10) -> list:
        node = self.root
        for char in prefix:
            if char not in node.children:
                return []
            node = node.children[char]

        results = []
        self._dfs(node, prefix, results)
        results.sort(key=lambda x: -x[1])
        return [word for word, _ in results[:max_results]]

    def _dfs(self, node, current, results):
        if node.is_end:
            results.append((current, node.frequency))
        for char, child in node.children.items():
            self._dfs(child, current + char, results)

trie = AutocompleteTrie()
trie.insert("open", 100)
trie.insert("openai", 95)
trie.insert("opensource", 80)
trie.insert("api", 90)
print(trie.autocomplete("open"))  # ["open", "openai", "opensource"]`,
          java: `class TrieNode {
    Map<Character, TrieNode> children = new HashMap<>();
    boolean isEnd = false;
    int frequency = 0;
}

class AutocompleteTrie {
    private TrieNode root;

    public AutocompleteTrie() {
        root = new TrieNode();
    }

    public void insert(String word, int freq) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            node.children.putIfAbsent(c, new TrieNode());
            node = node.children.get(c);
        }
        node.isEnd = true;
        node.frequency += freq;
    }

    public List<String> autocomplete(String prefix, int maxResults) {
        TrieNode node = root;
        for (char c : prefix.toCharArray()) {
            if (!node.children.containsKey(c)) return new ArrayList<>();
            node = node.children.get(c);
        }
        List<int[]> results = new ArrayList<>();
        dfs(node, new StringBuilder(prefix), results);
        results.sort((a, b) -> b[1] - a[1]);
        List<String> answer = new ArrayList<>();
        for (int[] r : results) {
            if (answer.size() >= maxResults) break;
            answer.add(String.valueOf(r[0]));
        }
        return answer;
    }

    private void dfs(TrieNode node, StringBuilder sb, List<int[]> results) {
        if (node.isEnd) {
            results.add(new int[]{sb.toString().hashCode(), node.frequency});
        }
        for (Map.Entry<Character, TrieNode> entry : node.children.entrySet()) {
            sb.append(entry.getKey());
            dfs(entry.getValue(), sb, results);
            sb.deleteCharAt(sb.length() - 1);
        }
    }
}`
        },
        explanation: {
          intuition: 'GPT autocomplete and search suggestions require fast prefix matching with relevance ranking. A trie enables O(L) prefix lookup, and DFS collects all completions ranked by usage frequency.',
          brute: 'Linear scan through all words checking prefix match. O(N * L) per query.',
          optimized: 'Trie for O(L) prefix navigation, DFS for collecting completions, sort by frequency. Much faster for large vocabularies.',
          dryRun: [
            'Insert "open" (freq=100): root->o->p->e->n (isEnd=true, freq=100)',
            'Insert "openai" (freq=95): root->o->p->e->n->a->i (isEnd=true, freq=95)',
            'autocomplete("open"): Navigate to node "n" under "open"',
            'DFS from node: collect "open"(100), "openai"(95), "opensource"(80)',
            'Sort by frequency descending: ["open", "openai", "opensource"]'
          ],
          edgeCases: ['Prefix not found in trie returns empty list', 'Tie in frequency - use alphabetical ordering', 'Empty prefix returns top-k words overall'],
          tips: ['For production, add fuzzy matching (edit distance) for typo tolerance. Cache popular prefix results to reduce DFS overhead.']
        }
      },
      {
        id: 'oai-dsa-4',
        title: 'Sliding Window Median',
        difficulty: 'Hard',
        frequency: 87,
        tags: ['Sliding Window', 'Heap', 'Two Heaps', 'Ordered Set'],
        input: 'nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3',
        output: '[1, -1, -1, 3, 5, 6]',
        approach: 'Use two heaps (max-heap for lower half, min-heap for upper half) to maintain the sliding window. Balance the heaps so the median is always at the top of one or both heaps. Use lazy deletion with a hash map for elements leaving the window.',
        time: 'O(N log k) for k-size window',
        space: 'O(k) for storing the window',
        visualizerType: 'sliding-window',
        code: {
          python: `import heapq
from collections import defaultdict

class SlidingWindowMedian:
    def __init__(self):
        self.lo = []  # max-heap (negated values)
        self.hi = []  # min-heap
        self.delayed = defaultdict(int)
        self.lo_size = 0
        self.hi_size = 0

    def _make_balance(self):
        while self.lo_size > (self.lo_size + self.hi_size + 1) // 2:
            self._move_lo_to_hi()
        while self.lo_size < (self.lo_size + self.hi_size + 1) // 2:
            self._move_hi_to_lo()

    def _move_lo_to_hi(self):
        val = -heapq.heappop(self.lo)
        self.lo_size -= 1
        heapq.heappush(self.hi, val)
        self.hi_size += 1
        self._prune_lo()

    def _move_hi_to_lo(self):
        val = heapq.heappop(self.hi)
        self.hi_size -= 1
        heapq.heappush(self.lo, -val)
        self.lo_size += 1
        self._prune_hi()

    def _prune_lo(self):
        while self.lo and self.delayed[-self.lo[0]] > 0:
            self.delayed[-self.lo[0]] -= 1
            heapq.heappop(self.lo)

    def _prune_hi(self):
        while self.hi and self.delayed[self.hi[0]] > 0:
            self.delayed[self.hi[0]] -= 1
            heapq.heappop(self.hi)

    def _add(self, val):
        if not self.lo or val <= -self.lo[0]:
            heapq.heappush(self.lo, -val)
            self.lo_size += 1
        else:
            heapq.heappush(self.hi, val)
            self.hi_size += 1
        self._make_balance()

    def _remove(self, val):
        self.delayed[val] += 1
        if val <= -self.lo[0]:
            self.lo_size -= 1
            self._prune_lo()
        else:
            self.hi_size -= 1
            self._prune_hi()
        self._make_balance()

    def median_sliding_window(self, nums, k):
        result = []
        for i, num in enumerate(nums):
            self._add(num)
            if i >= k:
                self._remove(nums[i - k])
            if i >= k - 1:
                if self.lo_size > self.hi_size:
                    result.append(-self.lo[0])
                else:
                    result.append((-self.lo[0] + self.hi[0]) / 2.0)
        return result

sw = SlidingWindowMedian()
print(sw.median_sliding_window([1, 3, -1, -3, 5, 3, 6, 7], 3))`,
          java: `import java.util.*;

class SlidingWindowMedian {
    private PriorityQueue<Integer> lo;
    private PriorityQueue<Integer> hi;
    private Map<Integer, Integer> delayed;
    private int loSize, hiSize;

    public SlidingWindowMedian() {
        lo = new PriorityQueue<>(Collections.reverseOrder());
        hi = new PriorityQueue<>();
        delayed = new HashMap<>();
        loSize = hiSize = 0;
    }

    public double[] medianSlidingWindow(int[] nums, int k) {
        double[] result = new double[nums.length - k + 1];
        for (int i = 0; i < nums.length; i++) {
            add(nums[i]);
            if (i >= k) remove(nums[i - k]);
            if (i >= k - 1) {
                result[i - k + 1] = loSize > hiSize
                    ? (double) lo.peek()
                    : ((double) lo.peek() + (double) hi.peek()) / 2.0;
            }
        }
        return result;
    }

    private void add(int val) {
        if (lo.isEmpty() || val <= lo.peek()) {
            lo.offer(val); loSize++;
        } else { hi.offer(val); hiSize++; }
        balance();
    }

    private void remove(int val) {
        delayed.put(val, delayed.getOrDefault(val, 0) + 1);
        if (val <= lo.peek()) { loSize--; prune(lo); }
        else { hiSize--; prune(hi); }
        balance();
    }

    private void balance() {
        while (loSize > (loSize + hiSize + 1) / 2) move(lo, hi, true);
        while (loSize < (loSize + hiSize + 1) / 2) move(hi, lo, false);
    }

    private void move(PriorityQueue<Integer> from, PriorityQueue<Integer> to, boolean loToHi) {
        int val = from.poll();
        to.offer(val);
        if (loToHi) { loSize--; hiSize++; prune(from); }
        else { hiSize--; loSize++; prune(from); }
    }

    private void prune(PriorityQueue<Integer> heap) {
        while (!heap.isEmpty() && delayed.getOrDefault(heap.peek(), 0) > 0) {
            int val = heap.poll();
            delayed.put(val, delayed.get(val) - 1);
        }
    }
}`
        },
        explanation: {
          intuition: 'For monitoring LLM inference latency in real-time, computing a sliding window median helps detect performance anomalies. Two heaps maintain the lower and upper halves of the window.',
          brute: 'For each window position, sort the k elements and pick the median. O(N * k log k) time.',
          optimized: 'Two heaps with lazy deletion. Insert/remove in O(log k). Balance heaps to keep median at the root.',
          dryRun: [
            'Window [1,3,-1]: lo=[-1,-3], hi=[3]. Median = -1.',
            'Slide: Remove 1, Add 5. Window [3,-1,5]: lo=[-1], hi=[3,5]. Median = 3.',
            'Slide: Remove 3, Add 3. Window [-1,5,3]: lo=[-1], hi=[3,5]. Median = 3.',
            'Slide: Remove -1, Add 6. Window [5,3,6]: lo=[3], hi=[5,6]. Median = 5.',
            'Slide: Remove -3, Add 7. Window [3,6,7]: lo=[3], hi=[6,7]. Median = 6.'
          ],
          edgeCases: ['Window size equals array length', 'All elements identical', 'Negative numbers and zeros mixed'],
          tips: ['Lazy deletion with a HashMap avoids costly heap rebuilds. Always prune expired elements when accessing heap roots. Use Long or double to avoid integer overflow in comparisons.']
        }
      },
      {
        id: 'oai-dsa-5',
        title: 'Random Pick with Weight',
        difficulty: 'Medium',
        frequency: 78,
        tags: ['Binary Search', 'Prefix Sum', 'Random', 'Sampling'],
        input: 'weights = [1, 3, 2, 1], pickIndex()',
        output: 'Index 1 (40% probability), Index 2 (25%), Index 0 (16.6%), Index 3 (16.6%)',
        approach: 'Compute prefix sums of weights. Use binary search to find the index where a random number falls. This enables weighted random sampling critical for token sampling in LLM decoding.',
        time: 'O(N) init, O(log N) per pick',
        space: 'O(N) for prefix sum array',
        visualizerType: 'sorting',
        code: {
          python: `import random
import bisect

class WeightedSampler:
    def __init__(self, weights: list):
        self.prefix = []
        total = 0
        for w in weights:
            total += w
            self.prefix.append(total)
        self.total = total

    def pick_index(self) -> int:
        target = random.uniform(0, self.total)
        return bisect.bisect_left(self.prefix, target)

    def sample_multiple(self, n: int) -> list:
        return [self.pick_index() for _ in range(n)]

sampler = WeightedSampler([1, 3, 2, 1])
samples = sampler.sample_multiple(10000)
from collections import Counter
print(Counter(samples))
# ~1428:0, ~4285:1, ~2857:2, ~1428:3`,
          java: `import java.util.*;

class WeightedSampler {
    private int[] prefix;
    private int total;

    public WeightedSampler(int[] weights) {
        prefix = new int[weights.length];
        total = 0;
        for (int i = 0; i < weights.length; i++) {
            total += weights[i];
            prefix[i] = total;
        }
    }

    public int pickIndex() {
        double target = Math.random() * total;
        int lo = 0, hi = prefix.length - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (prefix[mid] < target) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }

    public static void main(String[] args) {
        WeightedSampler sampler = new WeightedSampler(new int[]{1, 3, 2, 1});
        int[] counts = new int[4];
        for (int i = 0; i < 10000; i++) {
            counts[sampler.pickIndex()]++;
        }
        System.out.println(Arrays.toString(counts));
    }
}`
        },
        explanation: {
          intuition: 'LLM token sampling uses probability distributions over vocabulary. Weighted random pick with prefix sums and binary search enables O(log N) sampling from any distribution, including top-k and nucleus sampling.',
          brute: 'Generate random number, iterate through weights accumulating sum until threshold. O(N) per pick.',
          optimized: 'Prefix sum array + binary search. O(log N) per pick. Critical for fast inference.',
          dryRun: [
            'weights = [1,3,2,1], prefix = [1,4,6,7], total = 7',
            'random() = 0.4 * 7 = 2.8. bisect_left([1,4,6,7], 2.8) = 1. Pick index 1.',
            'random() = 0.1 * 7 = 0.7. bisect_left([1,4,6,7], 0.7) = 0. Pick index 0.',
            'random() = 0.9 * 7 = 6.3. bisect_left([1,4,6,7], 6.3) = 3. Pick index 3.'
          ],
          edgeCases: ['Single element weights array', 'Zero weights (should be excluded)', 'Very large weights causing integer overflow'],
          tips: ['Use bisect in Python for clean binary search. For Java, implement manually with Arrays.binarySearch or custom binary search. Handle edge case where random exactly hits a boundary.']
        }
      },
      {
        id: 'oai-dsa-6',
        title: 'Subarray Sum Equals K',
        difficulty: 'Medium',
        frequency: 90,
        tags: ['Hash Map', 'Prefix Sum', 'Array'],
        input: 'nums = [1, 1, 1], k = 2',
        output: '2',
        approach: 'Use a hash map to store prefix sum frequencies. For each element, check if (current_sum - k) exists in the map. This counts subarrays with sum exactly equal to k.',
        time: 'O(N) single pass',
        space: 'O(N) for the hash map',
        visualizerType: 'sliding-window',
        code: {
          python: `from collections import defaultdict

def subarray_sum(nums: list, k: int) -> int:
    count = 0
    prefix_sum = 0
    sum_map = defaultdict(int)
    sum_map[0] = 1

    for num in nums:
        prefix_sum += num
        if (prefix_sum - k) in sum_map:
            count += sum_map[prefix_sum - k]
        sum_map[prefix_sum] += 1

    return count

print(subarray_sum([1, 1, 1], 2))          # Output: 2
print(subarray_sum([1, 2, 3], 3))          # Output: 2
print(subarray_sum([1, -1, 0], 0))         # Output: 3`,
          java: `import java.util.*;

class SubarraySumK {
    public static int subarraySum(int[] nums, int k) {
        Map<Integer, Integer> sumMap = new HashMap<>();
        sumMap.put(0, 1);
        int count = 0, prefixSum = 0;

        for (int num : nums) {
            prefixSum += num;
            if (sumMap.containsKey(prefixSum - k)) {
                count += sumMap.get(prefixSum - k);
            }
            sumMap.put(prefixSum, sumMap.getOrDefault(prefixSum, 0) + 1);
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(subarraySum(new int[]{1,1,1}, 2));    // 2
        System.out.println(subarraySum(new int[]{1,2,3}, 3));    // 2
        System.out.println(subarraySum(new int[]{1,-1,0}, 0));   // 3
    }
}`
        },
        explanation: {
          intuition: 'Prefix sum with hash map allows counting subarrays with a given sum in O(N). If prefix_sum[j] - prefix_sum[i] = k, then subarray from i+1 to j has sum k.',
          brute: 'Check every possible subarray with nested loops. O(N^2) time.',
          optimized: 'Hash map stores frequency of each prefix sum. For each position, check if (current_sum - k) was seen before.',
          dryRun: [
            'nums=[1,1,1], k=2. prefix_sum=0, map={0:1}',
            'i=0: prefix=1, 1-2=-1 not in map. map={0:1, 1:1}',
            'i=1: prefix=2, 2-2=0 in map (count=1). map={0:1, 1:1, 2:1}',
            'i=2: prefix=3, 3-2=1 in map (count=2). map={0:1, 1:1, 2:1, 3:1}',
            'Return count=2. Subarrays: [1,1] at indices 0-1, [1,1] at indices 1-2.'
          ],
          edgeCases: ['Negative numbers in array', 'k is zero', 'All elements are zero', 'Single element equals k'],
          tips: ['Initialize map with {0:1} to handle subarrays starting from index 0. This technique works for both positive and negative numbers unlike sliding window.']
        }
      },
      {
        id: 'oai-dsa-7',
        title: 'Find Median from Data Stream',
        difficulty: 'Hard',
        frequency: 94,
        tags: ['Heap', 'Two Heaps', 'Design', 'Stream Processing'],
        input: 'addNum(1), addNum(2), findMedian() -> 1.5, addNum(3), findMedian() -> 2',
        output: '1.5, 2.0',
        approach: 'Maintain two heaps: a max-heap for the lower half and a min-heap for the upper half. The median is either the top of the max-heap (odd count) or the average of both tops (even count).',
        time: 'O(log N) per addNum, O(1) per findMedian',
        space: 'O(N) for storing all elements',
        visualizerType: 'sliding-window',
        code: {
          python: `import heapq

class MedianFinder:
    def __init__(self):
        self.lo = []   # max-heap (negated)
        self.hi = []   # min-heap

    def add_num(self, num: int) -> None:
        heapq.heappush(self.lo, -num)
        heapq.heappush(self.hi, -heapq.heappop(self.lo))
        if len(self.hi) > len(self.lo):
            heapq.heappush(self.lo, -heapq.heappop(self.hi))

    def find_median(self) -> float:
        if len(self.lo) > len(self.hi):
            return -self.lo[0]
        return (-self.lo[0] + self.hi[0]) / 2.0

mf = MedianFinder()
mf.add_num(1)
mf.add_num(2)
print(mf.find_median())  # 1.5
mf.add_num(3)
print(mf.find_median())  # 2.0`,
          java: `import java.util.PriorityQueue;
import java.util.Collections;

class MedianFinder {
    private PriorityQueue<Integer> lo;
    private PriorityQueue<Integer> hi;

    public MedianFinder() {
        lo = new PriorityQueue<>(Collections.reverseOrder());
        hi = new PriorityQueue<>();
    }

    public void addNum(int num) {
        lo.offer(num);
        hi.offer(lo.poll());
        if (hi.size() > lo.size()) {
            lo.offer(hi.poll());
        }
    }

    public double findMedian() {
        if (lo.size() > hi.size()) {
            return (double) lo.peek();
        }
        return ((double) lo.peek() + (double) hi.peek()) / 2.0;
    }

    public static void main(String[] args) {
        MedianFinder mf = new MedianFinder();
        mf.addNum(1);
        mf.addNum(2);
        System.out.println(mf.findMedian()); // 1.5
        mf.addNum(3);
        System.out.println(mf.findMedian()); // 2.0
    }
}`
        },
        explanation: {
          intuition: 'For real-time monitoring of LLM inference metrics (token throughput, latency percentiles), finding the median from a stream requires O(1) lookup. Two heaps maintain balanced halves.',
          brute: 'Store all elements in a list, sort on each median query. O(N log N) per query.',
          optimized: 'Two heaps maintain lower and upper halves. Add in O(log N), median in O(1).',
          dryRun: [
            'addNum(1): lo=[1], hi=[]. Median = 1.',
            'addNum(2): Push lo->1, move to hi. lo=[1], hi=[2]. Median = (1+2)/2 = 1.5.',
            'addNum(3): Push lo->3, move to hi->2, move to lo. lo=[1,3], hi=[2]. Median = 3.',
            'Check balance: lo has 2 elements, hi has 1. Correct.'
          ],
          edgeCases: ['Single element stream', 'All elements identical', 'Stream with alternating large and small values'],
          tips: ['Always keep lo.size >= hi.size. The imbalance of at most 1 ensures O(1) median access. For streaming percentile calculations, extend with order-statistic tree.']
        }
      },
      {
        id: 'oai-dsa-8',
        title: 'Design Hit Counter',
        difficulty: 'Medium',
        frequency: 76,
        tags: ['Design', 'Queue', 'Binary Search', 'Circular Buffer'],
        input: 'hit(1), hit(2), hit(3), getHits(4), hit(300), getHits(300)',
        output: '3, 4',
        approach: 'Use a circular buffer or deque to store timestamps. For getHits, remove stale entries (older than 300 seconds) and return the count. Binary search can optimize for sparse hit patterns.',
        time: 'O(1) per hit, O(1) amortized for getHits with deque',
        space: 'O(N) where N is hits in 300-second window',
        visualizerType: 'linked-list',
        code: {
          python: `from collections import deque
import bisect

class HitCounter:
    def __init__(self):
        self.hits = deque()

    def hit(self, timestamp: int) -> None:
        self.hits.append(timestamp)

    def get_hits(self, timestamp: int) -> int:
        while self.hits and self.hits[0] <= timestamp - 300:
            self.hits.popleft()
        return len(self.hits)

counter = HitCounter()
counter.hit(1)
counter.hit(2)
counter.hit(3)
print(counter.get_hits(4))     # Output: 3
counter.hit(300)
print(counter.get_hits(300))   # Output: 4

class HitCounterBinarySearch:
    def __init__(self):
        self.timestamps = []

    def hit(self, timestamp: int) -> None:
        self.timestamps.append(timestamp)

    def get_hits(self, timestamp: int) -> int:
        cutoff = timestamp - 300
        left = bisect.bisect_right(self.timestamps, cutoff)
        return len(self.timestamps) - left

bs_counter = HitCounterBinarySearch()
bs_counter.hit(1)
bs_counter.hit(2)
bs_counter.hit(3)
print(bs_counter.get_hits(4))     # Output: 3
bs_counter.hit(300)
print(bs_counter.get_hits(300))   # Output: 4`,
          java: `import java.util.*;

class HitCounter {
    private Deque<Integer> hits;

    public HitCounter() {
        hits = new LinkedList<>();
    }

    public void hit(int timestamp) {
        hits.addLast(timestamp);
    }

    public int getHits(int timestamp) {
        while (!hits.isEmpty() && hits.peekFirst() <= timestamp - 300) {
            hits.pollFirst();
        }
        return hits.size();
    }
}

class HitCounterBinarySearch {
    private List<Integer> timestamps;

    public HitCounterBinarySearch() {
        timestamps = new ArrayList<>();
    }

    public void hit(int timestamp) {
        timestamps.add(timestamp);
    }

    public int getHits(int timestamp) {
        int cutoff = timestamp - 300;
        int left = upperBound(timestamps, cutoff);
        return timestamps.size() - left;
    }

    private int upperBound(List<Integer> list, int target) {
        int lo = 0, hi = list.size();
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (list.get(mid) <= target) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }
}`
        },
        explanation: {
          intuition: 'Rate limiting for OpenAI API endpoints requires tracking request counts over time windows. A hit counter efficiently counts requests in the last 300 seconds using either a queue or binary search.',
          brute: 'Store all hits, iterate through entire list on each getHits call. O(N) per query.',
          optimized: 'Deque with lazy cleanup: remove stale entries from front. O(1) amortized. Binary search variant: O(log N) per query, better for sparse hit patterns.',
          dryRun: [
            'hit(1): deque=[1]',
            'hit(2): deque=[1,2]',
            'hit(3): deque=[1,2,3]',
            'getHits(4): Remove <= 4-300=-296. None removed. Return 3.',
            'hit(300): deque=[1,2,3,300]',
            'getHits(300): Remove <= 0. None removed. Return 4.'
          ],
          edgeCases: ['Timestamps not in order', 'Exactly at 300-second boundary', 'No hits in window returns 0'],
          tips: ['For high-throughput systems, use a circular buffer with fixed-size buckets (one per second) to avoid memory growth. This is the approach used in production rate limiters.']
        }
      }
    ],
    technical: [
      {
        id: 'oai-t-1',
        category: 'AI/ML Infrastructure',
        difficulty: 'Advanced',
        frequency: 93,
        question: 'Explain PagedAttention and how vLLM uses it to serve LLMs efficiently.',
        answer: 'PagedAttention is a memory management technique introduced in the vLLM paper that treats KV cache memory like virtual memory in operating systems. During autoregressive generation, each token produces a Key and Value vector that must be cached. Traditional systems pre-allocate contiguous GPU memory for the maximum sequence length, leading to 60-80% memory waste due to internal and external fragmentation. PagedAttention divides the KV cache into fixed-size blocks (pages) of 16 tokens each. These blocks can be stored non-contiguously in GPU memory. A block table maps logical pages to physical GPU memory locations, similar to a page table in OS. This reduces memory waste to under 4%, enabling 2-4x larger batch sizes. It also enables efficient memory sharing for beam search and parallel sampling, where multiple sequences share common prefix pages.',
        keyPoints: ['KV Cache management', 'Virtual memory analogy for GPU', 'Non-contiguous block allocation', 'Memory efficiency gains (2-4x throughput)', 'Block table mapping for physical-to-logical translation'],
        followUps: ['How does PagedAttention handle memory sharing during beam search?', 'What is the GPU memory overhead of maintaining block tables?']
      },
      {
        id: 'oai-t-2',
        category: 'System Design',
        difficulty: 'Advanced',
        frequency: 88,
        question: 'How would you design the inference infrastructure to serve GPT-4 to millions of users simultaneously?',
        answer: 'Serving GPT-4 at scale requires a multi-layered architecture. At the model level, use Tensor Parallelism to shard the model across 8 GPUs within a single node (each GPU holds a portion of the weight matrices), and Pipeline Parallelism across nodes for the remaining layers. For scheduling, implement continuous batching (iteration-level scheduling) where new requests join the batch at each decoding step rather than waiting for the batch to complete - this improves throughput by 10-20x over static batching. Memory management uses PagedAttention to efficiently handle variable-length sequences without fragmentation. A global load balancer routes requests based on GPU utilization, queue depth, and region affinity. For reliability, implement speculative decoding where a smaller draft model proposes tokens verified by the full model, reducing latency by 2-3x. Finally, use quantization (FP8 or INT4) for non-critical layers to reduce memory footprint without significant quality loss.',
        keyPoints: ['Tensor Parallelism vs Pipeline Parallelism', 'Continuous batching vs static batching', 'Speculative decoding for latency reduction', 'Global load balancing with GPU utilization metrics', 'Quantization strategies for throughput'],
        followUps: ['How does continuous batching differ from dynamic batching?', 'What trade-offs exist between FP16 and INT8 quantization for GPT-4?']
      },
      {
        id: 'oai-t-3',
        category: 'AI/ML Infrastructure',
        difficulty: 'Advanced',
        frequency: 85,
        question: 'Design a RLHF (Reinforcement Learning from Human Feedback) training pipeline for a large language model.',
        answer: 'RLHF training has three phases. Phase 1: Supervised Fine-Tuning (SFT) - fine-tune the base model on high-quality human-written demonstrations to create an initial policy. Phase 2: Reward Model Training - collect human preference data where labelers rank multiple model outputs for the same prompt. Train a reward model (typically same architecture as policy, with a scalar output head) using Bradley-Terry ranking loss. Phase 3: RL Optimization - use Proximal Policy Optimization (PPO) to optimize the policy model against the reward model. The reward model scores generated outputs, and PPO updates the policy to maximize reward while staying close to the SFT model via KL divergence penalty. The infrastructure requires: distributed training across hundreds of GPUs, a replay buffer for experience storage, multiple model instances (policy, reward, reference, value) in GPU memory simultaneously, and careful hyperparameter tuning for the KL penalty coefficient to prevent reward hacking.',
        keyPoints: ['Three-phase pipeline (SFT, Reward Model, PPO)', 'Bradley-Terry ranking loss for reward model', 'KL divergence penalty for preventing reward hacking', 'Multi-model GPU orchestration (policy, reward, reference, value)', 'Distributed training infrastructure requirements'],
        followUps: ['What is reward hacking and how does KL penalty prevent it?', 'How would you scale this pipeline to train models with trillions of parameters?']
      },
      {
        id: 'oai-t-4',
        category: 'AI/ML Infrastructure',
        difficulty: 'Intermediate',
        frequency: 90,
        question: 'Explain tensor parallelism vs data parallelism. When would you use each for LLM training?',
        answer: 'Data Parallelism replicates the entire model on each GPU and splits the training data across GPUs. Each GPU computes gradients independently, then gradients are all-reduced across GPUs before updating weights. It scales well when the model fits in a single GPU but requires high inter-GPU bandwidth for gradient synchronization. Tensor Parallelism splits individual weight matrices across GPUs. For example, in a transformer attention layer, the query/key/value projections can be split along the output dimension across GPUs. Each GPU computes a portion of the matrix multiplication, then results are combined via all-reduce. Tensor parallelism is essential when the model is too large to fit on a single GPU (like GPT-4 with 1.8T parameters). For LLM training, we typically use both: Tensor Parallelism within a node (NVLink-connected GPUs) for low-latency communication, and Data Parallelism across nodes for scaling. Hybrid approaches like ZeRO (Zero Redundancy Optimizer) further reduce memory by partitioning optimizer states, gradients, and parameters across data-parallel ranks.',
        keyPoints: ['Data parallelism replicates model, splits data', 'Tensor parallelism splits weight matrices across GPUs', 'Tensor parallelism requires NVLink for low latency', 'Hybrid TP+DP is standard for large LLMs', 'ZeRO optimization for memory efficiency'],
        followUps: ['What is pipeline parallelism and how does it differ from tensor parallelism?', 'How does ZeRO Stage 3 partition optimizer states?']
      },
      {
        id: 'oai-t-5',
        category: 'System Design',
        difficulty: 'Advanced',
        frequency: 92,
        question: 'Design OpenAI\'s API rate limiting system that handles millions of RPM while being fair across tenants.',
        answer: 'The rate limiting system needs multiple layers. At the edge, use a distributed token bucket algorithm implemented in Redis for sub-millisecond latency. Each API key gets a bucket with tokens replenished at the allowed RPM/TPM rate. The system tracks both requests-per-minute (RPM) and tokens-per-minute (TPM) as independent dimensions. For fairness, implement a priority queue where free-tier users have lower priority than paid users during high load. Use a sliding window counter (not fixed window) to prevent boundary burst issues. The architecture: API Gateway -> Rate Limiter (Redis cluster) -> Queue (for throttled requests) -> Inference Workers. For burst tolerance, allow short bursts (1-2 seconds) up to 2x the rate limit. Implement circuit breakers that temporarily disable rate limiting for critical health check endpoints. Monitor per-tenant consumption in real-time with a streaming pipeline (Kafka -> Flink -> Dashboard). For global distribution, use consistent hashing to route requests to the nearest rate limiter instance, with cross-region synchronization every 100ms for accuracy.',
        keyPoints: ['Distributed token bucket in Redis', 'Dual dimension limiting (RPM + TPM)', 'Sliding window counter for burst prevention', 'Priority-based fair queuing during congestion', 'Circuit breakers and real-time monitoring'],
        followUps: ['How would you handle rate limiting during a sudden traffic spike from a single tenant?', 'What consistency guarantees do you need between rate limiter instances across regions?']
      },
      {
        id: 'oai-t-6',
        category: 'Safety',
        difficulty: 'Advanced',
        frequency: 87,
        question: 'How would you implement guardrails for GPT output safety at inference time?',
        answer: 'Output safety guardrails operate at multiple stages. First, a content classifier model (trained on labeled harmful content) runs on every generated token sequence. This classifier outputs categories like violence, sexual content, hate speech, self-harm, with confidence scores. If any category exceeds the threshold, the response is blocked. Second, implement a rule-based system that catches patterns the ML classifier might miss (regex for PII, phone numbers, addresses). Third, use the Moderation API as a pre-check before the model generates - if the input prompt itself is flagged, return a safe refusal immediately without consuming inference compute. For the output pipeline: generate response -> run classifier -> if safe, return to user; if flagged, return a generic safety message and log for review. The system must handle false positives gracefully - allow users to appeal blocked responses. For latency, run the classifier asynchronously in parallel with the last few tokens of generation. Store safety decisions in a feedback loop for continuous classifier improvement.',
        keyPoints: ['Multi-stage content classification', 'Moderation API as input pre-check', 'Parallel safety classification during generation', 'False positive handling and appeal mechanism', 'Feedback loop for classifier improvement'],
        followUps: ['How do you handle adversarial prompts designed to bypass safety classifiers?', 'What metrics do you track for false positive/negative rates?']
      },
      {
        id: 'oai-t-7',
        category: 'AI/ML Infrastructure',
        difficulty: 'Intermediate',
        frequency: 80,
        question: 'Explain the difference between model quantization techniques: FP16, INT8, and INT4. What are the trade-offs for LLM serving?',
        answer: 'FP16 (half-precision floating point) uses 16 bits per parameter, reducing memory by 2x compared to FP32 with negligible quality loss. It is the standard for LLM training and inference. INT8 quantization uses 8 bits per parameter (4x memory reduction vs FP32). It requires calibration data to determine scaling factors and zero points for mapping floating point ranges to integers. GPTQ and AWQ are popular INT8 quantization methods that minimize quality degradation. INT4 quantization uses only 4 bits per parameter (8x memory reduction), but introduces measurable quality loss, especially for smaller models or precise reasoning tasks. The trade-off triangle: Memory efficiency (INT4 > INT8 > FP16), Quality preservation (FP16 > INT8 > INT4), Compute speed (INT8/INT4 can be faster on Tensor Core hardware). For GPT-4 serving, INT8 is often used for the majority of layers, with FP16 reserved for sensitive layers like attention heads where precision matters most.',
        keyPoints: ['FP16: 2x memory reduction, negligible quality loss', 'INT8: 4x reduction, requires calibration', 'INT4: 8x reduction, measurable quality degradation', 'Mixed-precision strategies for optimal quality/memory trade-off', 'Hardware-specific optimization (Tensor Cores for INT8)'],
        followUps: ['How does post-training quantization differ from quantization-aware training?', 'What calibration dataset would you use for quantizing a code-generation model?']
      },
      {
        id: 'oai-t-8',
        category: 'Distributed Systems',
        difficulty: 'Advanced',
        frequency: 83,
        question: 'How would you design a distributed checkpointing system for LLM training that spans thousands of GPUs?',
        answer: 'Distributed checkpointing for LLM training must handle petabyte-scale model states efficiently. The design uses a hierarchical approach: each GPU writes its local shard to fast NVMe storage (tier 1), then an async process uploads to distributed object storage like S3 (tier 2). The checkpoint format stores optimizer states, gradients, and model parameters separately - optimizer states are the largest component (2x model size for Adam). Use a parallel file system like GPFS or Lustre for the NVMe tier with striping across drives. For coordination, a checkpoint coordinator sends a broadcast signal to all GPUs to freeze training, write state, and resume. The key optimization is asynchronous checkpointing: overlap writing with training by using double-buffered NVMe slots. For recovery, implement a warm-standby system that maintains a recent checkpoint and can resume training in minutes. The system tracks checkpoint metadata (step number, loss, learning rate) in a database for easy rollback. For fault tolerance, use erasure coding across nodes to handle disk failures without losing checkpoints.',
        keyPoints: ['Hierarchical storage (NVMe -> S3)', 'Separate storage for optimizer states, gradients, parameters', 'Asynchronous double-buffered checkpointing', 'Erasure coding for fault tolerance', 'Metadata tracking for easy rollback'],
        followUps: ['How does checkpoint size scale with model parameter count?', 'What happens if a GPU fails mid-checkpoint-write?']
      }
    ],
    hr: [
      {
        id: 'oai-hr-1',
        question: 'How do you think about AI safety vs capability?',
        modelAnswer: 'I believe AI safety and capability are not opposing forces but deeply interconnected. In my previous role working on an automated decision system, I found that investing in safety actually improved capability. By building robust test suites and adversarial testing for our model, we discovered edge cases that led to a 15% accuracy improvement. At OpenAI, I would approach this by treating safety as a first-class engineering requirement - not an afterthought. For example, implementing content classifiers that run in parallel with inference means safety checks add zero latency. The key is designing systems where safety constraints are architecturally enforced rather than bolted on. I also believe in the principle of iterative deployment - releasing models in controlled settings, gathering feedback, and improving safety measures before scaling. This aligns with OpenAI\'s approach of deploying GPT-4 gradually.',
        aiTips: 'OpenAI values candidates who view safety as enabling capability, not hindering it. Show concrete examples of how safety investments improved your systems.',
        starTips: {
          situation: 'Working on an automated system where safety failures could have significant consequences (financial, reputational, or user harm).',
          task: 'Balance the need to ship features quickly with implementing robust safety measures.',
          action: 'Designed safety as an architectural component - built adversarial test suites, implemented parallel content classifiers, and created a feedback loop for continuous safety improvement.',
          result: 'The safety investments actually improved model performance by 15% through discovering edge cases, and we achieved zero safety incidents in production.'
        }
      },
      {
        id: 'oai-hr-2',
        question: 'Tell me about a time you had to push back on a feature for ethical reasons.',
        modelAnswer: 'At my previous company, we were building a recommendation engine that used user browsing history. The product team wanted to track users across third-party sites to improve recommendations. I pushed back because this violated user privacy expectations and could enable manipulative targeting. I proposed an alternative: using only on-site behavior with differential privacy techniques to add noise to individual user data. I presented a data analysis showing that on-site signals alone captured 85% of the predictive power, making cross-site tracking unnecessary for our goals. The team agreed, and we shipped with the privacy-preserving approach. This experience taught me that ethical constraints often lead to better engineering solutions. At OpenAI, I would bring this same approach - questioning features that could enable misuse, proposing privacy-preserving alternatives, and using data to show that safety and business goals are aligned.',
        aiTips: 'Show that you can identify ethical concerns proactively and propose solutions, not just raise objections. Reference specific technical alternatives.',
        starTips: {
          situation: 'Product team proposed a feature that tracked users across sites without clear consent, raising privacy concerns.',
          task: 'Push back constructively while maintaining team relationships and finding an alternative path forward.',
          action: 'Analyzed data to show on-site signals were sufficient, proposed differential privacy alternative, presented business case showing 85% predictive power without cross-site tracking.',
          result: 'Team adopted privacy-preserving approach. Feature shipped successfully with zero privacy incidents, and the approach became a company-wide standard.'
        }
      },
      {
        id: 'oai-hr-3',
        question: 'Describe how you approach problems that might not have a right answer.',
        modelAnswer: 'When facing problems without clear right answers, I use a framework of structured exploration. In a previous role, we had to decide whether to use a complex distributed system or a simpler monolithic approach for a new service. I created a decision matrix weighing 8 factors including team expertise, time-to-market, scalability needs, and operational complexity. I then gathered input from 5 different team members, each bringing a different perspective. The key insight was that the right answer depended on our growth assumptions - if we scaled 10x, the distributed system was necessary, but if growth was moderate, the monolith was better. We decided to build the monolith first with clear interfaces, making future distribution possible. This taught me that for ambiguous problems, the goal isn\'t finding the perfect answer but making a well-reasoned decision you can defend and adjust as new information emerges. At OpenAI, where AGI safety involves deeply uncertain trade-offs, I would bring this same systematic approach.',
        aiTips: 'Show intellectual humility and systematic decision-making. OpenAI values people who can operate effectively in ambiguity while maintaining rigorous analysis.',
        starTips: {
          situation: 'Faced with a critical architectural decision with no clear right answer and significant long-term implications.',
          task: 'Make a decision that balances multiple competing priorities (speed, quality, scalability) while keeping future options open.',
          action: 'Created decision matrix with 8 factors, gathered diverse perspectives, identified that the answer depended on growth assumptions, proposed reversible decision.',
          result: 'Built a modular monolith that was simpler to operate, shipped 3x faster than the distributed alternative, and was later split into services when growth demanded it.'
        }
      },
      {
        id: 'oai-hr-4',
        question: 'Why do you want to work at OpenAI specifically, and how does our mission resonate with you?',
        modelAnswer: 'OpenAI\'s mission to ensure AGI benefits all of humanity resonates deeply with my belief that transformative technology must be developed responsibly. I\'ve spent my career building systems that prioritize user safety - from implementing content moderation in production ML pipelines to advocating for privacy-preserving approaches in data collection. What draws me to OpenAI specifically is the unique challenge of building infrastructure that serves billions of users while maintaining the highest safety standards. I\'m particularly excited about the technical challenges: optimizing inference at massive scale, building robust safety classifiers, and solving distributed systems problems that don\'t exist at smaller companies. I also admire OpenAI\'s iterative deployment approach - releasing GPT-4 gradually, gathering feedback, and improving. This mirrors my own engineering philosophy of shipping incrementally and learning from real-world usage. I want to contribute to a team where the stakes are high and the work directly impacts the trajectory of AI development.',
        aiTips: 'Be specific about what draws you to OpenAI\'s mission and how your experience aligns. Reference specific technical challenges, not just general AI excitement.',
        starTips: {
          situation: 'Motivated by OpenAI\'s mission and the unique technical challenges of building safe AI systems at scale.',
          task: 'Articulate why your specific skills and experience make you a strong fit for OpenAI\'s engineering challenges.',
          action: 'Connected your experience with content moderation, privacy engineering, and distributed systems to OpenAI\'s specific infrastructure needs.',
          result: 'Demonstrated genuine alignment with the mission and readiness to contribute from day one on critical safety and infrastructure projects.'
        }
      },
      {
        id: 'oai-hr-5',
        question: 'Tell me about a time you failed. What did you learn and how did it change your approach?',
        modelAnswer: 'Early in my career, I led a project to migrate a critical service from a monolithic architecture to microservices. I pushed the team to move fast, splitting the service into 8 microservices in 3 months. The migration was technically successful, but I underestimated the operational complexity. Within weeks, we had cascading failures across services, debugging became nearly impossible, and our mean time to recovery went from 10 minutes to 2 hours. I took full responsibility and led a post-mortem. The root cause was that I optimized for deployment velocity rather than operational readiness. We rolled back to the monolith, spent 2 months building proper observability (distributed tracing, centralized logging, service mesh), and then re-did the migration incrementally with proper runbooks. This failure fundamentally changed my approach: I now always start with observability and operational readiness before architectural changes. At OpenAI, where system failures can have safety implications, this lesson is even more critical.',
        aiTips: 'Show genuine accountability and demonstrate how the failure changed your engineering practices. OpenAI values learning velocity and self-awareness.',
        starTips: {
          situation: 'Led a microservices migration that was technically successful but operationally disastrous, causing cascading failures.',
          task: 'Take responsibility for the failure and lead the recovery while learning from the experience.',
          action: 'Conducted blameless post-mortem, identified that I prioritized speed over operational readiness, rolled back, built observability first, then re-migrated incrementally.',
          result: 'Service reliability improved to 99.99%, MTTR dropped to 5 minutes, and the new approach became the standard for all future migrations at the company.'
        }
      },
      {
        id: 'oai-hr-6',
        question: 'How do you handle disagreements with senior engineers about technical direction?',
        modelAnswer: 'I approach technical disagreements with data and structured analysis rather than arguments from authority. In a previous role, a senior architect and I disagreed about whether to use a message queue or direct API calls for inter-service communication. I created a proof-of-concept implementing both approaches, measuring latency, throughput, and error handling under load. The data showed that for our specific use case, direct API calls had 3x lower latency with acceptable error rates, while the message queue added complexity without clear benefits. I presented this analysis in a design review, acknowledging the senior architect\'s valid concerns about coupling. We ultimately chose API calls but added a retry mechanism that addressed the coupling concern. The key was transforming a subjective disagreement into an objective comparison. At OpenAI, where infrastructure decisions affect millions of users, I would bring this same evidence-based approach while being open to learning from more experienced colleagues.',
        aiTips: 'Show that you can disagree respectfully and use data to drive decisions. Demonstrate intellectual humility while maintaining conviction.',
        starTips: {
          situation: 'Disagreed with a senior architect about the fundamental communication pattern for a new service.',
          task: 'Find the best technical solution while maintaining a positive working relationship.',
          action: 'Built proof-of-concept for both approaches, measured latency/throughput/error rates, presented data-driven analysis in design review.',
          result: 'Team chose the lower-latency solution backed by data. The senior architect appreciated the rigorous analysis, and we maintained a strong collaborative relationship.'
        }
      },
      {
        id: 'oai-hr-7',
        question: 'Describe a situation where you had to learn a completely new technology quickly to solve a critical problem.',
        modelAnswer: 'During a production incident, our ML inference pipeline started returning corrupted outputs for 10% of requests. The root cause was identified as a memory leak in our custom CUDA kernel - something I had no experience with. I had 4 hours to fix it before the issue affected more users. I quickly studied CUDA memory management, using the NVIDIA documentation and open-source examples. I identified that we were allocating GPU memory in a loop without freeing it, causing the GPU to run out of memory and corrupt nearby memory regions. I implemented a memory pool pattern that pre-allocates and reuses GPU memory blocks. The fix was deployed within 3 hours, and I then spent the next week deeply learning CUDA optimization. This experience taught me that for critical issues, focused learning under pressure can be effective. It also reinforced the importance of having proper monitoring - we should have caught the memory leak earlier. At OpenAI, where inference pipeline reliability directly impacts user experience and safety, I would bring this same urgency to learning new technologies while advocating for better observability.',
        aiTips: 'Show your ability to learn rapidly under pressure and your commitment to understanding root causes, not just quick fixes.',
        starTips: {
          situation: 'Production ML pipeline returning corrupted outputs due to a CUDA memory leak - a technology I had no prior experience with.',
          task: 'Fix the critical production issue within hours while learning CUDA memory management from scratch.',
          action: 'Studied CUDA documentation, identified the memory leak pattern, implemented a memory pool to reuse GPU allocations, deployed fix in 3 hours.',
          result: 'Fixed the production issue, then spent a week mastering CUDA optimization. Established GPU memory monitoring to prevent similar issues in the future.'
        }
      },
      {
        id: 'oai-hr-8',
        question: 'How do you prioritize between multiple high-priority projects with competing deadlines?',
        modelAnswer: 'I use a framework that combines business impact with technical risk. At my previous company, I had three concurrent projects: a critical security patch, a new feature for a major client, and a performance optimization for our ML pipeline. I created a 2x2 matrix with axes of business impact and technical complexity. The security patch had highest impact (data breach risk) but low complexity - I handled it first. The client feature had high impact and high complexity - I broke it into phases. The performance optimization had moderate impact but required deep technical investigation - I time-boxed it. The key insight was communicating transparently with stakeholders about trade-offs. I presented the prioritization framework to the CTO and got alignment on the order. For OpenAI, where safety-critical work competes with feature development, I would apply the same framework: safety issues always have highest priority, followed by user-facing reliability, then performance, then new features.',
        aiTips: 'Show systematic prioritization and transparent communication. Reference how you would prioritize safety-critical work, which is central to OpenAI\'s mission.',
        starTips: {
          situation: 'Three high-priority projects with competing deadlines and limited engineering resources.',
          task: 'Prioritize work to maximize business impact while managing technical risk and stakeholder expectations.',
          action: 'Created 2x2 prioritization matrix (impact vs complexity), communicated transparently with stakeholders, broke complex work into phases.',
          result: 'Delivered security patch in 1 day, client feature in phases meeting their timeline, and completed performance optimization in parallel. Zero stakeholder complaints.'
        }
      }
    ]
  },
  {
    id: 'goldman-sachs',
    name: 'Goldman Sachs',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/61/Goldman_Sachs.svg',
    industry: 'Investment Banking & FinTech',
    hiringRoles: ['Software Engineer (Strats)', 'Quantitative Developer', 'Systems Engineer'],
    interviewRounds: ['Hackerrank OA', 'CoderPad Tech Screen', 'Superday (4-5 rounds Tech/HR)'],
    salaryRange: '₹20L - ₹35L',
    brandColor: '#7299C6',
    culture: 'Excellence, Teamwork, Client Focus, High Pressure',
    difficulty: 'High',
    completion: 0,
    stats: { placed: '185', avgpackage: '22.0 LPA' },
    founders: [
      { name: 'Marcus Goldman', title: 'Founder', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Goldman%2C_Marcus.jpg/250px-Goldman%2C_Marcus.jpg' },
      { name: 'Samuel Sachs', title: 'Co-founder', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Goldman%2C_Marcus.jpg/250px-Goldman%2C_Marcus.jpg' }
    ],
    focus: 'Investment banking, quantitative innovation, and resilient financial technology infrastructure.',
    motto: '"Our clients\' interests always come first."',
    hiringPhilosophy: 'We look for intense intellectual curiosity, quantitative rigor, and the ability to operate flawlessly under extreme pressure.',
    dsa: [
      {
        id: 'gs-dsa-1',
        title: 'Trapping Rain Water',
        difficulty: 'Hard',
        frequency: 89,
        tags: ['Array', 'Two Pointers', 'Stack'],
        input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
        output: '6',
        approach: 'Use two pointers from both ends. Track left_max and right_max. At each step, process the pointer with the smaller max - water trapped = max - height at that position.',
        time: 'O(N)',
        space: 'O(1)',
        visualizerType: 'sliding-window',
        code: {
          python: `def trap(height):
    if not height:
        return 0
    left, right = 0, len(height) - 1
    left_max, right_max = height[left], height[right]
    water = 0
    while left < right:
        if left_max < right_max:
            left += 1
            left_max = max(left_max, height[left])
            water += left_max - height[left]
        else:
            right -= 1
            right_max = max(right_max, height[right])
            water += right_max - height[right]
    return water

print(trap([0,1,0,2,1,0,1,3,2,1,2,1]))  # 6`,
          java: `public int trap(int[] height) {
    int left = 0, right = height.length - 1;
    int leftMax = height[left], rightMax = height[right];
    int water = 0;
    while (left < right) {
        if (leftMax < rightMax) {
            left++;
            leftMax = Math.max(leftMax, height[left]);
            water += leftMax - height[left];
        } else {
            right--;
            rightMax = Math.max(rightMax, height[right]);
            water += rightMax - height[right];
        }
    }
    return water;
}`
        },
        explanation: {
          intuition: 'Water trapped at any position equals min(max_left, max_right) - height[i]. Two pointers track running maximums from both ends, processing the side with the smaller maximum.',
          brute: 'For each element, scan left and right to find max heights. O(N^2) time.',
          optimized: 'Two pointers with running left_max and right_max. O(N) time, O(1) space.',
          dryRun: [
            'left=0 (h=0), right=11 (h=1). left_max=0, right_max=1.',
            'left_max < right_max: left++ -> left=1 (h=1). left_max=1. water+=0.',
            'left_max=1 == right_max=1: right-- -> right=10 (h=2). right_max=2. water+=1.',
            'Continue processing. Total = 6.'
          ],
          edgeCases: ['Empty array', 'Monotonically increasing/decreasing (0 water)', 'All same height'],
          tips: ['Process the side with the smaller maximum - it dictates the water level. Never need to store precomputed max arrays.']
        }
      },
      {
        id: 'gs-dsa-2',
        title: 'Maximum Profit in K Transactions',
        difficulty: 'Hard',
        frequency: 94,
        tags: ['Dynamic Programming', 'Array'],
        input: 'prices = [3,3,5,0,0,3,1,4], k = 2',
        output: '6',
        approach: '2D DP where dp[t][i] is max profit on day i with at most t transactions. Optimize to O(N*k) time, O(k) space using rolling array.',
        time: 'O(N * k)',
        space: 'O(k)',
        visualizerType: 'dp',
        code: {
          python: `def maxProfit(k, prices):
    if not prices or k == 0:
        return 0
    n = len(prices)
    if k >= n // 2:
        return sum(max(0, prices[i+1]-prices[i]) for i in range(n-1))
    dp = [[0] * n for _ in range(k+1)]
    for t in range(1, k+1):
        max_so_far = -prices[0]
        for i in range(1, n):
            dp[t][i] = max(dp[t][i-1], prices[i] + max_so_far)
            max_so_far = max(max_so_far, dp[t-1][i] - prices[i])
    return dp[k][n-1]

print(maxProfit(2, [3,3,5,0,0,3,1,4]))  # 6`,
          java: `public int maxProfit(int k, int[] prices) {
    int n = prices.length;
    if (n == 0 || k == 0) return 0;
    if (k >= n / 2) {
        int profit = 0;
        for (int i = 1; i < n; i++)
            if (prices[i] > prices[i-1]) profit += prices[i] - prices[i-1];
        return profit;
    }
    int[][] dp = new int[k+1][n];
    for (int t = 1; t <= k; t++) {
        int maxSoFar = -prices[0];
        for (int i = 1; i < n; i++) {
            dp[t][i] = Math.max(dp[t][i-1], prices[i] + maxSoFar);
            maxSoFar = Math.max(maxSoFar, dp[t-1][i] - prices[i]);
        }
    }
    return dp[k][n-1];
}`
        },
        explanation: {
          intuition: 'For each transaction count t and day i, we either do nothing (dp[t][i-1]) or sell on day i (prices[i] + best we could have before buying). Track max profit after buying as max_so_far.',
          brute: 'Try all combinations of k buys and sells. O(C(N,2k)) time.',
          optimized: 'DP with state tracking. O(N*k) time, O(k) space with rolling array.',
          dryRun: [
            'k=2, prices=[3,3,5,0,0,3,1,4].',
            't=1: max_so_far=-3. dp[1][1]=0, dp[1][2]=2, dp[1][3]=2, dp[1][4]=2, dp[1][5]=3, dp[1][6]=3, dp[1][7]=3.',
            't=2: max_so_far varies. dp[2][7]=6 (buy@0, sell@5=5, buy@1, sell@4=3, total=6? Actually buy@3 sell@5=2, buy@0 sell@4=4, total=6).',
            'Return 6.'
          ],
          edgeCases: ['k >= N/2 (infinite transactions)', 'Prices constantly dropping (0 profit)', 'Single price'],
          tips: ['When k >= N/2, the problem reduces to unlimited transactions (greedy). The max_so_far optimization avoids the inner loop over buy days.']
        }
      },
      {
        id: 'gs-dsa-3',
        title: 'Best Time to Buy and Sell Stock with Cooldown',
        difficulty: 'Medium',
        frequency: 82,
        tags: ['Dynamic Programming', 'State Machine'],
        input: 'prices = [1,2,3,0,2]',
        output: '3',
        approach: 'State machine DP with three states: hold (own stock), sold (just sold, in cooldown), rest (not holding, not in cooldown). Transition between states at each day.',
        time: 'O(N)',
        space: 'O(1)',
        visualizerType: 'dp',
        code: {
          python: `def maxProfit(prices):
    if len(prices) < 2:
        return 0
    hold = -prices[0]
    sold = 0
    rest = 0
    for i in range(1, len(prices)):
        prev_hold = hold
        hold = max(hold, rest - prices[i])
        rest = max(rest, sold)
        sold = prev_hold + prices[i]
    return max(sold, rest)

print(maxProfit([1,2,3,0,2]))  # 3`,
          java: `public int maxProfit(int[] prices) {
    int hold = -prices[0], sold = 0, rest = 0;
    for (int i = 1; i < prices.length; i++) {
        int prevHold = hold;
        hold = Math.max(hold, rest - prices[i]);
        rest = Math.max(rest, sold);
        sold = prevHold + prices[i];
    }
    return Math.max(sold, rest);
}`
        },
        explanation: {
          intuition: 'At each day, we are in one of three states: holding stock, just sold (cooldown), or resting. The cooldown state prevents immediate re-buying, creating a state machine.',
          brute: 'Try all possible buy/sell sequences with cooldown constraint. O(2^N).',
          optimized: 'Three-state DP: hold, sold, rest. O(N) time, O(1) space.',
          dryRun: [
            'prices=[1,2,3,0,2]. hold=-1, sold=0, rest=0.',
            'i=1: hold=max(-1, 0-2)=-1. rest=max(0,0)=0. sold=-1+2=1.',
            'i=2: hold=max(-1, 0-3)=-1. rest=max(0,1)=1. sold=-1+3=2.',
            'i=3: hold=max(-1, 1-0)=1. rest=max(1,2)=2. sold=-1+0=-1.',
            'i=4: hold=max(1, 2-2)=1. rest=max(2,-1)=2. sold=1+2=3.',
            'Return max(3,2)=3.'
          ],
          edgeCases: ['Single day (0 profit)', 'Strictly decreasing prices', 'Two days only'],
          tips: ['The key insight is that after selling, you must rest one day. This is modeled by the sold->rest transition. The rest state can come from either sold or previous rest.']
        }
      },
      {
        id: 'gs-dsa-4',
        title: 'Meeting Rooms II',
        difficulty: 'Medium',
        frequency: 85,
        tags: ['Heap', 'Sorting', 'Sweep Line'],
        input: 'intervals = [[0,30],[5,10],[15,20]]',
        output: '2',
        approach: 'Sort meetings by start time. Use a min-heap to track end times. For each meeting, if it starts after the earliest ending meeting, reuse that room. Otherwise, allocate a new room.',
        time: 'O(N log N)',
        space: 'O(N)',
        visualizerType: 'tree',
        code: {
          python: `import heapq

def minMeetingRooms(intervals):
    if not intervals:
        return 0
    intervals.sort(key=lambda x: x[0])
    heap = [intervals[0][1]]
    for start, end in intervals[1:]:
        if start >= heap[0]:
            heapq.heapreplace(heap, end)
        else:
            heapq.heappush(heap, end)
    return len(heap)

print(minMeetingRooms([[0,30],[5,10],[15,20]]))  # 2`,
          java: `public int minMeetingRooms(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
    PriorityQueue<Integer> heap = new PriorityQueue<>();
    heap.offer(intervals[0][1]);
    for (int i = 1; i < intervals.length; i++) {
        if (intervals[i][0] >= heap.peek()) {
            heap.poll();
        }
        heap.offer(intervals[i][1]);
    }
    return heap.size();
}`
        },
        explanation: {
          intuition: 'The minimum rooms needed equals the maximum number of overlapping meetings. A min-heap tracks the earliest ending meeting, allowing room reuse when possible.',
          brute: 'Try all room assignments. Exponential.',
          optimized: 'Sort by start time + min-heap of end times. O(N log N).',
          dryRun: [
            'Sorted: [[0,30],[5,10],[15,20]]. heap=[30].',
            'Meeting [5,10]: 5 < 30 (heap[0]). Push 10. heap=[10,30].',
            'Meeting [15,20]: 15 >= 10. Replace 10 with 20. heap=[20,30].',
            'Return heap size = 2.'
          ],
          edgeCases: ['No meetings (0 rooms)', 'All meetings overlap (N rooms)', 'No overlaps (1 room)'],
          tips: ['The heap size at the end is the answer. Each heap replacement means a room was reused. This is equivalent to the sweep line algorithm.']
        }
      },
      {
        id: 'gs-dsa-5',
        title: 'Insert Interval',
        difficulty: 'Medium',
        frequency: 78,
        tags: ['Array', 'Merge'],
        input: 'intervals = [[1,3],[6,9]], newInterval = [2,5]',
        output: '[[1,5],[6,9]]',
        approach: 'Three phases: (1) Add all intervals ending before newInterval starts. (2) Merge overlapping intervals with newInterval. (3) Add remaining intervals.',
        time: 'O(N)',
        space: 'O(N)',
        visualizerType: 'sliding-window',
        code: {
          python: `def insert(intervals, newInterval):
    result = []
    i = 0
    while i < len(intervals) and intervals[i][1] < newInterval[0]:
        result.append(intervals[i])
        i += 1
    while i < len(intervals) and intervals[i][0] <= newInterval[1]:
        newInterval[0] = min(newInterval[0], intervals[i][0])
        newInterval[1] = max(newInterval[1], intervals[i][1])
        i += 1
    result.append(newInterval)
    while i < len(intervals):
        result.append(intervals[i])
        i += 1
    return result

print(insert([[1,3],[6,9]], [2,5]))  # [[1,5],[6,9]]`,
          java: `public int[][] insert(int[][] intervals, int[] newInterval) {
    List<int[]> result = new ArrayList<>();
    int i = 0;
    while (i < intervals.length && intervals[i][1] < newInterval[0])
        result.add(intervals[i++]);
    while (i < intervals.length && intervals[i][0] <= newInterval[1]) {
        newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
        newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
        i++;
    }
    result.add(newInterval);
    while (i < intervals.length) result.add(intervals[i++]);
    return result.toArray(new int[0][]);
}`
        },
        explanation: {
          intuition: 'Since intervals are non-overlapping and sorted, we can process in three clear phases: before, merge, after.',
          brute: 'Append new interval, sort, merge all. O(N log N).',
          optimized: 'Three-phase linear scan. O(N) time.',
          dryRun: [
            'intervals=[[1,3],[6,9]], new=[2,5].',
            'Phase 1: [1,3] ends at 3 >= 2 (new start). Stop.',
            'Phase 2: [1,3] overlaps [2,5] (3 >= 2). Merge: [min(2,1), max(5,3)] = [1,5].',
            'Phase 2: [6,9] starts at 6 > 5. Stop.',
            'Phase 3: Add [6,9]. Result: [[1,5],[6,9]].'
          ],
          edgeCases: ['New interval at the beginning', 'New interval at the end', 'New interval spans all existing intervals', 'Empty intervals list'],
          tips: ['The three-phase approach is clean and efficient. No need to sort since input is already sorted.']
        }
      },
      {
        id: 'gs-dsa-6',
        title: 'Product of Array Except Self',
        difficulty: 'Medium',
        frequency: 88,
        tags: ['Array', 'Prefix Products'],
        input: 'nums = [1,2,3,4]',
        output: '[24,12,8,6]',
        approach: 'Compute prefix products (left to right) and suffix products (right to left). The answer at index i is prefix[i] * suffix[i].',
        time: 'O(N)',
        space: 'O(1) excluding output array',
        visualizerType: 'sliding-window',
        code: {
          python: `def productExceptSelf(nums):
    n = len(nums)
    result = [1] * n
    prefix = 1
    for i in range(n):
        result[i] = prefix
        prefix *= nums[i]
    suffix = 1
    for i in range(n-1, -1, -1):
        result[i] *= suffix
        suffix *= nums[i]
    return result

print(productExceptSelf([1,2,3,4]))  # [24,12,8,6]`,
          java: `public int[] productExceptSelf(int[] nums) {
    int n = nums.length;
    int[] result = new int[n];
    int prefix = 1;
    for (int i = 0; i < n; i++) {
        result[i] = prefix;
        prefix *= nums[i];
    }
    int suffix = 1;
    for (int i = n-1; i >= 0; i--) {
        result[i] *= suffix;
        suffix *= nums[i];
    }
    return result;
}`
        },
        explanation: {
          intuition: 'Each element in the result is the product of all elements to its left times all elements to its right. Two passes build these prefix and suffix products.',
          brute: 'For each element, multiply all others. O(N^2) time.',
          optimized: 'Two passes: prefix products left-to-right, suffix products right-to-left. O(N) time, O(1) extra space.',
          dryRun: [
            'nums=[1,2,3,4].',
            'Prefix pass: result=[1, 1, 2, 6] (1, 1*1, 1*2, 1*2*3).',
            'Suffix pass: result=[24, 12, 8, 6] (6*4, 2*6, 2*4, 6*1).',
            'Return [24, 12, 8, 6].'
          ],
          edgeCases: ['Zero in array', 'Single element', 'All ones'],
          tips: ['The result array is used as both the prefix and suffix buffer, achieving O(1) extra space. Handle zeros by counting them.']
        }
      },
      {
        id: 'gs-dsa-7',
        title: 'Container With Most Water',
        difficulty: 'Medium',
        frequency: 83,
        tags: ['Two Pointers', 'Array'],
        input: 'height = [1,8,6,2,5,4,8,3,7]',
        output: '49',
        approach: 'Start with two pointers at both ends. The area is min(height[left], height[right]) * (right - left). Move the pointer with the smaller height inward.',
        time: 'O(N)',
        space: 'O(1)',
        visualizerType: 'sliding-window',
        code: {
          python: `def maxArea(height):
    left, right = 0, len(height) - 1
    max_water = 0
    while left < right:
        area = min(height[left], height[right]) * (right - left)
        max_water = max(max_water, area)
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return max_water

print(maxArea([1,8,6,2,5,4,8,3,7]))  # 49`,
          java: `public int maxArea(int[] height) {
    int left = 0, right = height.length - 1;
    int maxWater = 0;
    while (left < right) {
        int area = Math.min(height[left], height[right]) * (right - left);
        maxWater = Math.max(maxWater, area);
        if (height[left] < height[right]) left++;
        else right--;
    }
    return maxWater;
}`
        },
        explanation: {
          intuition: 'Moving the taller line inward can never increase the area (width decreases, height is bounded by the shorter line). So we always move the shorter line.',
          brute: 'Check all pairs. O(N^2) time.',
          optimized: 'Two pointers from ends. O(N) time, O(1) space.',
          dryRun: [
            'left=0 (h=1), right=8 (h=7). area=min(1,7)*8=8. Move left.',
            'left=1 (h=8), right=8 (h=7). area=min(8,7)*7=49. Move right.',
            'left=1 (h=8), right=7 (h=3). area=min(8,3)*6=18. Move right.',
            'Continue. Max = 49.'
          ],
          edgeCases: ['Two elements only', 'All same height', 'Strictly increasing/decreasing'],
          tips: ['The key insight is that moving the pointer with the smaller height is safe because the area can only decrease (width shrinks, height bounded by shorter line).']
        }
      },
      {
        id: 'gs-dsa-8',
        title: 'Longest Increasing Subsequence',
        difficulty: 'Medium',
        frequency: 86,
        tags: ['Dynamic Programming', 'Binary Search'],
        input: 'nums = [10,9,2,5,3,7,101,18]',
        output: '4',
        approach: 'Maintain a "tails" array where tails[i] is the smallest ending element of all increasing subsequences of length i+1. Use binary search to find the position for each new element.',
        time: 'O(N log N)',
        space: 'O(N)',
        visualizerType: 'dp',
        code: {
          python: `import bisect

def lengthOfLIS(nums):
    tails = []
    for num in nums:
        pos = bisect.bisect_left(tails, num)
        if pos == len(tails):
            tails.append(num)
        else:
            tails[pos] = num
    return len(tails)

print(lengthOfLIS([10,9,2,5,3,7,101,18]))  # 4`,
          java: `import java.util.*;

public int lengthOfLIS(int[] nums) {
    List<Integer> tails = new ArrayList<>();
    for (int num : nums) {
        int pos = Collections.binarySearch(tails, num);
        if (pos < 0) pos = -(pos + 1);
        if (pos == tails.size()) tails.add(num);
        else tails.set(pos, num);
    }
    return tails.size();
}`
        },
        explanation: {
          intuition: 'The tails array is always sorted. For each new element, binary search finds where it fits. If larger than all tails, extend the LIS. Otherwise, replace the first tail >= num to keep tails minimal.',
          brute: 'DP: dp[i] = LIS ending at i. O(N^2) time.',
          optimized: 'Patience sorting with binary search. O(N log N) time.',
          dryRun: [
            'num=10: tails=[10].',
            'num=9: pos=0, tails=[9].',
            'num=2: pos=0, tails=[2].',
            'num=5: pos=1, tails=[2,5].',
            'num=3: pos=1, tails=[2,3].',
            'num=7: pos=2, tails=[2,3,7].',
            'num=101: pos=3, tails=[2,3,7,101].',
            'num=18: pos=3, tails=[2,3,7,18].',
            'Return 4.'
          ],
          edgeCases: ['All decreasing (LIS=1)', 'All same (LIS=1)', 'Already sorted (LIS=N)', 'Single element'],
          tips: ['The tails array does not store the actual LIS, only the length. To reconstruct the LIS, track predecessors. The binary search approach is sometimes called "patience sorting."']
        }
      }
    ],
    technical: [
      {
        id: 'gs-t-1',
        category: 'System Design',
        difficulty: 'Advanced',
        frequency: 95,
        question: 'Design a low-latency trading system that can execute orders in under 10 microseconds.',
        answer: 'Ultra-low-latency trading requires hardware-software co-design: (1) Network: Use kernel-bypass networking (DPDK/SPDK) to avoid OS overhead. FPGA-based network cards process market data at wire speed. Co-locate matching engines in the same data center as the exchange. (2) Matching engine: Implement the order book in cache-friendly data structures (arrays, not pointers). Use lock-free algorithms (compare-and-swap) for order insertion/cancellation. Avoid garbage collection entirely - use off-heap memory. (3) Order processing pipeline: Use a deterministic event-driven architecture. Each tick triggers a predefined sequence: validate -> risk check -> route to venue. Pre-compute risk checks where possible. (4) Hardware acceleration: Use FPGA for latency-critical operations (market data parsing, risk limit checks). FPGA can process a tick in 100 nanoseconds vs 5-10 microseconds for software. (5) Clock synchronization: Use PTP (Precision Time Protocol) for sub-microsecond clock synchronization across servers. (6) Monitoring: Non-intrusive monitoring using hardware taps on the network. Avoid logging in the hot path - sample at 1% or use asynchronous writes.',
        keyPoints: ['Kernel-bypass networking (DPDK)', 'Lock-free data structures', 'FPGA for latency-critical operations', 'Off-heap memory to avoid GC', 'PTP clock synchronization'],
        followUps: ['How do you handle market data spikes during high-volatility events?', 'What is the impact of TCP vs UDP for market data feeds?']
      },
      {
        id: 'gs-t-2',
        category: 'Language / Core',
        difficulty: 'Advanced',
        frequency: 90,
        question: 'How would you tune the JVM for a low-latency trading application?',
        answer: 'JVM tuning for trading requires eliminating Stop-the-World pauses: (1) Garbage Collector: Use ZGC or Shenandoah for sub-millisecond pauses. ZGC uses load barriers and colored pointers to compact the heap without stopping application threads. Configure with -XX:+UseZGC -XX:MaxGCPauseMillis=1. (2) Heap sizing: Set -Xms = -Xmx to avoid heap resizing. Use large pages (-XX:+UseLargePages) to reduce TLB misses. (3) JIT compilation: Use -XX:+TieredCompilation and warm up the application before trading starts. Pre-compile critical methods with -XX:CompileThreshold. (4) Lock optimization: Avoid synchronized blocks in the hot path. Use LockFreeQueues (LMAX Disruptor pattern) for inter-thread communication. (5) Memory layout: Use off-heap buffers (ByteBuffer.allocateDirect) for market data processing. Avoid autoboxing in hot paths. (6) GC logging: Enable GC logging with -Xlog:gc* to monitor pause times. Set up alerts for any pause > 1ms. (7) NUMA awareness: Use -XX:+UseNUMA to allocate memory on the local NUMA node. This reduces memory access latency by 30-50% on multi-socket servers.',
        keyPoints: ['ZGC/Shenandoah for sub-ms pauses', 'Large pages and NUMA awareness', 'Off-heap memory for market data', 'Lock-free inter-thread communication', 'JIT warmup before trading starts'],
        followUps: ['How does the LMAX Disruptor pattern achieve low-latency inter-thread communication?', 'What is the difference between ZGC and Shenandoah?']
      },
      {
        id: 'gs-t-3',
        category: 'Risk Management',
        difficulty: 'Advanced',
        frequency: 88,
        question: 'Design a real-time Value-at-Risk (VaR) calculation engine for a portfolio with 100K+ positions.',
        answer: 'Real-time VaR requires efficient computation across a large portfolio: (1) Data pipeline: Stream position data from the position management system. Use Apache Kafka for reliable event streaming. Each position update triggers VaR recalculation. (2) Factor model: Use a factor-based approach (100+ risk factors: interest rates, FX rates, equity indices, credit spreads). Map each position to its factor sensitivities (delta, gamma, vega). (3) Monte Carlo simulation: Generate 10K correlated scenarios using Cholesky decomposition of the correlation matrix. For each scenario, revalue the portfolio using factor sensitivities. VaR is the 1st percentile of the P&L distribution. (4) GPU acceleration: Use CUDA for parallel scenario generation and portfolio revaluation. Each GPU thread handles one scenario. A100 can generate 10K scenarios in < 1ms. (5) Incremental VaR: For position updates, compute the marginal contribution of the changed position rather than recalculating entire VaR. This reduces computation from O(N * scenarios) to O(changed_positions * scenarios). (6) Backtesting: Daily backtesting against actual P&L to validate model accuracy. Track exceptions (actual loss > VaR) and adjust confidence levels accordingly.',
        keyPoints: ['Factor-based risk model', 'Monte Carlo with Cholesky decomposition', 'GPU acceleration for scenario generation', 'Incremental VaR for position updates', 'Daily backtesting for model validation'],
        followUps: ['How do you handle correlation instability during market crises?', 'What is the difference between parametric and historical VaR?']
      },
      {
        id: 'gs-t-4',
        category: 'System Design',
        difficulty: 'Advanced',
        frequency: 86,
        question: 'Design a market data feed processing system that handles 1M+ messages per second.',
        answer: 'High-throughput market data requires careful system design: (1) Ingestion: Use multicast for market data distribution (Exchange -> Feed Handlers). Each feed handler parses the raw protocol (FIX/ITCH/Binary) into normalized objects. Use zero-copy parsing where possible. (2) Processing pipeline: Implement a chain-of-responsibility pattern: parse -> validate -> enrich -> persist -> distribute. Each stage runs in its own thread. Use lock-free ring buffers between stages (LMAX Disruptor pattern). (3) Order book management: Maintain an in-memory order book per symbol. Use a price-level tree (red-black tree) for sorted price levels. Each price level has a linked list of orders. Update the book incrementally (no full reconstruction). (4) Distribution: Fan out to subscribers via multicast or TCP. Use a publish-subscribe model where consumers register for specific symbol groups. (5) Persistence: Write to a time-series database (kdb+ or Apache Druid) for historical analysis. Use async writes to avoid blocking the processing pipeline. (6) Fault tolerance: Implement a hot standby feed handler. If the primary fails, the standby takes over within 100ms. Use TCP connection health checks and automatic failover. (7) Monitoring: Track end-to-end latency (exchange timestamp vs processing timestamp), message throughput, and order book staleness. Alert if latency exceeds SLA (typically < 10 microseconds for co-located systems).',
        keyPoints: ['Multicast for market data distribution', 'Lock-free ring buffers between stages', 'Incremental order book updates', 'Hot standby failover', 'End-to-end latency monitoring'],
        followUps: ['How do you handle a flash crash where message volume spikes 10x?', 'What is the impact of TCP head-of-line blocking for market data?']
      },
      {
        id: 'gs-t-5',
        category: 'System Design',
        difficulty: 'Advanced',
        frequency: 84,
        question: 'Design a position management system that tracks real-time positions across multiple asset classes and venues.',
        answer: 'Position management requires real-time accuracy across complex trading operations: (1) Data model: Each position tracks: instrument, quantity, average entry price, unrealized P&L, realized P&L, margin requirement, and settlement status. Support multiple asset classes (equities, fixed income, derivatives) with different settlement cycles (T+1 for equities, T+2 for bonds). (2) Event sourcing: Store all position changes as immutable events (order filled, dividend received, corporate action). Rebuild current state by replaying events. This provides full audit trail and enables point-in-time position queries. (3) Real-time aggregation: Aggregate positions across accounts, portfolios, and legal entities. Use a materialized view pattern: pre-compute aggregated positions and update incrementally as trades execute. (4) Corporate actions: Handle stock splits, dividends, mergers automatically. The system monitors a corporate actions feed and applies adjustments to affected positions. (5) Margin calculation: Real-time margin computation using exchange-specific rules (SPAN for options, VaR-based for portfolios). Cache margin requirements and invalidate on position changes. (6) Reconciliation: Nightly reconciliation against prime broker and custodian statements. Auto-match trades and flag discrepancies for manual review. (7) Regulatory reporting: Generate position reports for regulators (13F, PF) in real-time. Use the event store to produce historical snapshots.',
        keyPoints: ['Event sourcing for full audit trail', 'Multi-asset class support with different settlement cycles', 'Real-time aggregation across entities', 'Automated corporate actions processing', 'Nightly reconciliation with external parties'],
        followUps: ['How do you handle a trade that was executed but not yet confirmed by the exchange?', 'What happens when a corporate action affects a large number of positions simultaneously?']
      },
      {
        id: 'gs-t-6',
        category: 'Finance / Trading',
        difficulty: 'Advanced',
        frequency: 82,
        question: 'How would you design a margin calculation engine for a derivatives portfolio?',
        answer: 'Margin calculation for derivatives requires complex risk modeling: (1) Initial Margin (IM): Use the Standard Initial Margin Model (SIMM) based on ISDA SIMM. Calculate portfolio sensitivities (delta, gamma, vega, curvature) for each risk factor. Apply risk weights and aggregation rules. For options, compute Greeks using Black-Scholes or Monte Carlo. (2) Variation Margin (VM): Mark-to-market all positions using real-time market data. VM = current portfolio value - previous day portfolio value. Calculate in real-time as prices change. (3) Multi-currency: Convert margin requirements to a base currency using real-time FX rates. Handle margin calls across currencies with FX hedging. (4) Cross-margining: Offset margins across correlated products. For example, a long futures position partially offsets a short options position on the same underlying. Calculate net margin using portfolio margining rules. (5) Performance: The calculation must complete within 100ms for end-of-day processing. Use GPU acceleration for Monte Carlo simulations. Cache intermediate results (Greeks, risk weights) and invalidate only on position changes. (6) Regulatory compliance: Meet CCP (Central Counterparty) margin requirements. Support multiple CCPs (CME, LCH, Eurex) with different margin models. Generate margin reports in CCP-specific formats.',
        keyPoints: ['SIMM-based initial margin calculation', 'Real-time variation margin marking', 'Multi-currency margin aggregation', 'Cross-margining for portfolio offsets', 'GPU-accelerated Monte Carlo for Greeks'],
        followUps: ['How does back-testing work for margin models?', 'What happens when a CCP changes its margin methodology mid-day?']
      },
      {
        id: 'gs-t-7',
        category: 'System Design',
        difficulty: 'Advanced',
        frequency: 80,
        question: 'Design a smart order routing system that minimizes execution costs across multiple venues.',
        answer: 'Smart order routing optimizes execution across fragmented markets: (1) Venue analysis: Maintain real-time statistics for each venue: fill rate, average execution price, latency, fee structure. Update statistics every 5 minutes. (2) Order splitting: For large orders, split across venues to minimize market impact. Use VWAP (Volume-Weighted Average Price) or TWAP (Time-Weighted Average Price) algorithms. (3) Price improvement: For each venue, compute the expected price improvement based on the order book depth. Route to venues with the best combination of price and fill probability. (4) Fee optimization: Account for maker/taker fees, exchange rebates, and ECN fees. A venue with a slightly worse price but lower fees may be cheaper overall. (5) Latency-aware routing: For latency-sensitive orders (market orders), route to the venue with the lowest round-trip time. For limit orders, latency matters less. (6) Anti-gaming: Detect and prevent adverse selection by HFT firms. If a venue consistently fills at worse prices than quoted, reduce routing to that venue. (7) Smart fallback: If the primary venue fails, automatically reroute to the next-best venue within 50ms. Monitor venue health with heartbeat checks.',
        keyPoints: ['Real-time venue statistics tracking', 'Order splitting for market impact minimization', 'Fee-aware routing optimization', 'Latency-aware routing decisions', 'Anti-gaming detection for adverse selection'],
        followUps: ['How do you handle a venue going down during a market-moving event?', 'What is the impact of Reg NMS on smart order routing?']
      },
      {
        id: 'gs-t-8',
        category: 'Database',
        difficulty: 'Advanced',
        frequency: 78,
        question: 'How do you handle eventual consistency in a financial system where accuracy is critical?',
        answer: 'Financial systems require strong consistency for critical operations while tolerating eventual consistency for non-critical paths: (1) Two-phase commit (2PC): For cross-system transactions (e.g., transferring a position between accounts), use 2PC to ensure atomicity. The coordinator sends prepare requests to all participants, then commit if all agree. (2) Saga pattern: For long-running business processes (trade settlement), break into compensatable transactions. If a step fails, execute compensating transactions to undo previous steps. (3) Event sourcing with CQRS: Write operations go to an event store (strongly consistent). Read operations use materialized views (eventually consistent). The event store is the source of truth. (4) Conflict resolution: For concurrent updates to the same position, use last-writer-wins with logical timestamps, or application-level conflict resolution (merge position quantities). (5) Monitoring: Track replication lag between primary and replica databases. Alert if lag exceeds threshold (e.g., > 1 second for critical systems). (6) Read-your-writes: After a position update, subsequent reads must see the update. Use session affinity or read-after-write consistency guarantees. (7) Graceful degradation: If a replica is stale, serve reads from the primary for affected accounts. This trades availability for consistency for critical data.',
        keyPoints: ['Two-phase commit for cross-system transactions', 'Saga pattern for long-running processes', 'Event sourcing as source of truth', 'Read-your-writes consistency for critical data', 'Graceful degradation when replicas are stale'],
        followUps: ['How does the CAP theorem apply to financial systems?', 'What is the difference between strong consistency and linearizability for trading?']
      }
    ],
    hr: [
      {
        id: 'gs-hr-1',
        question: 'Tell me about a time you had to work with a difficult team member under pressure.',
        modelAnswer: 'During a critical project deadline, a senior developer on my team was consistently dismissive in code reviews and refused to approve my pull requests, even when the code was correct. Instead of escalating, I invited him for coffee and asked about his concerns. He revealed he was worried about a potential regression in the trading system that could cost millions. I understood his perspective - he was not being difficult, he was being thorough. I added comprehensive test cases covering his specific concerns, including edge cases he had not considered. He approved the PR and we developed a mutual respect. He later became my strongest advocate in design reviews.',
        aiTips: 'Show empathy, professionalism, and focus on team success. Goldman values teamwork and the ability to work with strong personalities.',
        starTips: {
          situation: 'A senior developer was blocking my PRs during a critical deadline due to unspoken concerns about system reliability.',
          task: 'Get the code approved while maintaining a productive working relationship.',
          action: 'Had a private conversation to understand concerns, added comprehensive test cases addressing his specific worries.',
          result: 'PR approved, developed mutual respect. He became my strongest advocate in future design reviews.'
        }
      },
      {
        id: 'gs-hr-2',
        question: 'Describe a time you had to make a critical decision with incomplete information.',
        modelAnswer: 'We discovered a potential data integrity issue in our risk calculation engine at 4 PM on a Friday. The issue could affect overnight risk reports sent to regulators. We had incomplete information: the bug was in production but we did not know how many calculations were affected. I had two options: (1) Halt the risk engine and recalculate everything (safe but could miss the regulatory deadline), or (2) Continue with potentially incorrect data and fix it Monday. I chose a third option: I identified the specific calculation path affected by the bug, ran a targeted recalculation on only those positions (about 5% of the portfolio), and produced corrected risk reports by 6 PM. The key was triaging the scope of the problem rather than treating it as all-or-nothing.',
        aiTips: 'Show decisive action under uncertainty and the ability to find creative solutions. Goldman values people who can operate under extreme pressure.',
        starTips: {
          situation: 'Discovered potential data integrity issue in risk calculations at 4 PM Friday, with regulatory deadline approaching.',
          task: 'Ensure accurate risk reports while meeting the regulatory deadline.',
          action: 'Triage the scope: identified affected calculation path, ran targeted recalculation on 5% of portfolio, produced corrected reports by 6 PM.',
          result: 'Met regulatory deadline with accurate data. Established a triage protocol for similar production issues.'
        }
      },
      {
        id: 'gs-hr-3',
        question: 'Tell me about a time you worked in a high-stakes environment where mistakes had significant consequences.',
        modelAnswer: 'I was responsible for deploying a new order routing algorithm that handled $500M+ in daily volume. The deployment had to happen during a 30-minute market close window. A misconfiguration could route orders to the wrong venue, potentially losing millions. I created a detailed deployment checklist with 47 items, each requiring sign-off. We rehearsed the deployment 3 times in staging. During the actual deployment, I noticed one of the configuration parameters was off by a factor of 10. I halted the deployment, corrected the parameter, and restarted. The entire process took 22 minutes. The key was that the checklist caught the error before it reached production. I learned that in high-stakes environments, checklists and rehearsals are not optional - they are the safety net.',
        aiTips: 'Show that you can handle extreme pressure with systematic approaches. Goldman values flawless execution under pressure.',
        starTips: {
          situation: 'Deploying a new order routing algorithm handling $500M+ daily volume during a 30-minute market close window.',
          task: 'Execute the deployment flawlessly with zero tolerance for errors.',
          action: 'Created 47-item deployment checklist, rehearsed 3 times in staging, caught a configuration error during deployment, halted and corrected.',
          result: 'Deployed successfully in 22 minutes. Established checklist and rehearsal protocol for all high-stakes deployments.'
        }
      },
      {
        id: 'gs-hr-4',
        question: 'How do you prioritize when everything seems urgent?',
        modelAnswer: 'In my role, I regularly face situations where multiple critical systems need attention simultaneously. I developed a framework based on business impact and reversibility: (1) Irreversible + high impact: Do immediately (e.g., trading system down = revenue loss). (2) Reversible + high impact: Do quickly but thoughtfully (e.g., new feature that can be rolled back). (3) Irreversible + low impact: Plan carefully (e.g., data migration). (4) Reversible + low impact: Batch and do when convenient. I communicate this framework to stakeholders so they understand the prioritization logic. For example, when asked to simultaneously fix a production issue and implement a new feature, I would explain: the production issue is irreversible (data corruption) and high impact, so it takes priority. The feature is reversible (can be rolled back) and can wait 2 hours. This structured approach has prevented me from making reactive decisions.',
        aiTips: 'Show structured thinking and clear communication. Goldman values people who can triage effectively under pressure.',
        starTips: {
          situation: 'Multiple critical requests arriving simultaneously with competing deadlines.',
          task: 'Prioritize work to maximize impact while managing stakeholder expectations.',
          action: 'Applied impact/reversibility framework, communicated prioritization logic to stakeholders, addressed highest-priority items first.',
          result: 'Delivered all items within deadlines. The framework became a team standard for prioritization discussions.'
        }
      },
      {
        id: 'gs-hr-5',
        question: 'Describe a time you disagreed with your manager about a technical decision. How did you handle it?',
        modelAnswer: 'My manager wanted to use a proprietary database for a new analytics platform due to its performance claims. I believed PostgreSQL with proper indexing would be more cost-effective and avoid vendor lock-in. Instead of just disagreeing, I built a proof-of-concept: I implemented the same query workload on both databases, measured performance with realistic data volumes (100M+ rows), and calculated 3-year TCO including licensing. The data showed PostgreSQL matched the proprietary database performance within 5% while costing 80% less. I presented this in a one-on-one with my manager, acknowledging the proprietary database had better support. He agreed the data supported PostgreSQL. We shipped on PostgreSQL and the cost savings funded two additional engineering hires.',
        aiTips: 'Show that you can disagree respectfully with data. Goldman values intellectual honesty and evidence-based decisions.',
        starTips: {
          situation: 'Manager preferred a proprietary database; I believed PostgreSQL was more cost-effective.',
          task: 'Present a data-driven case while maintaining a positive relationship.',
          action: 'Built PoC with both databases, measured performance and TCO, presented data in a one-on-one.',
          result: 'Manager agreed based on data. PostgreSQL saved 80% on licensing, funding two additional hires.'
        }
      },
      {
        id: 'gs-hr-6',
        question: 'Tell me about your biggest professional failure and what you learned.',
        modelAnswer: 'I was responsible for a data migration that moved our risk database from an on-premise system to the cloud. I underestimated the complexity of migrating stored procedures that contained business logic. During migration, some procedures silently produced different results due to subtle SQL dialect differences. We did not catch this until the next day when risk reports showed unusual numbers. The financial impact was contained (no trades were affected), but we had to revert the migration. I learned three things: (1) Always validate output equivalence, not just data count. (2) Test with production-like data volumes. (3) Have a rollback plan that can execute in minutes, not hours. I now apply these principles to every migration project.',
        aiTips: 'Show genuine accountability and concrete lessons learned. Goldman values people who learn from mistakes and improve their processes.',
        starTips: {
          situation: 'Led a database migration that silently produced incorrect results due to SQL dialect differences.',
          task: 'Identify the root cause and prevent similar issues in future migrations.',
          action: 'Discovered the issue through output validation, reverted the migration, established new validation protocols.',
          result: 'No financial impact. New validation protocol prevented similar issues in 3 subsequent migrations.'
        }
      },
      {
        id: 'gs-hr-7',
        question: 'How do you handle a situation where you are given an unreasonable deadline?',
        modelAnswer: 'I was asked to deliver a complete market data processing system in 4 weeks when my estimate was 8 weeks. Instead of simply pushing back or agreeing to an impossible deadline, I analyzed the requirements and identified that 60% of the features were essential for launch and 40% could be delivered in a follow-up release. I presented this to the stakeholder: "We can deliver the core functionality in 4 weeks if we defer the reporting module and the advanced analytics dashboard to v2. This gets you to market faster while maintaining quality." The stakeholder agreed. We delivered on time, and the follow-up features were delivered 3 weeks later. The key is to negotiate scope rather than quality or timeline.',
        aiTips: 'Show negotiation skills and the ability to deliver under pressure without compromising quality.',
        starTips: {
          situation: 'Given a 4-week deadline for an 8-week project.',
          task: 'Find a way to deliver value within the deadline without compromising quality.',
          action: 'Analyzed requirements, identified 60% essential features, negotiated scope reduction with stakeholder.',
          result: 'Delivered core functionality on time. Follow-up features delivered 3 weeks later. Stakeholder was satisfied with the phased approach.'
        }
      },
      {
        id: 'gs-hr-8',
        question: 'Why Goldman Sachs? How does your career goals align with what we do?',
        modelAnswer: 'Goldman Sachs sits at the intersection of finance and technology in a way that no other institution does. What draws me specifically is the scale of the technical challenges: processing billions of dollars in daily transactions with microsecond latency, building risk models that protect against systemic threats, and creating systems that must work flawlessly under extreme market conditions. My career goal is to build systems where the engineering directly impacts financial outcomes. At Goldman, my code does not just serve users - it manages risk, protects client assets, and enables markets to function. I am also drawn to the apprenticeship culture - the opportunity to learn from people who have built some of the most sophisticated financial systems in the world. The combination of intellectual rigor, real-world impact, and the collaborative culture is exactly what I am looking for.',
        aiTips: 'Be specific about Goldman\'s technology and culture. Show genuine understanding of what makes GS different from other financial institutions.',
        starTips: {
          situation: 'Motivated by Goldman\'s unique position at the intersection of finance and technology at massive scale.',
          task: 'Articulate why your engineering skills and career goals align with Goldman\'s mission.',
          action: 'Connected your experience with low-latency systems and risk management to Goldman\'s specific technical challenges.',
          result: 'Demonstrated genuine understanding of Goldman\'s technology and readiness to contribute to high-impact financial systems.'
        }
      }
    ]
  }
];
