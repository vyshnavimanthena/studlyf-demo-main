import { lfuCacheGenerator } from './generators/ms-dsa-6';
import { lruCacheGenerator } from './generators/amz-dsa-1';
import { amzDsa2Generator } from './generators/amz-dsa-2';
import { alienDictionaryGenerator } from './generators/g-dsa-1';
import { wordLadderIIGenerator } from './generators/g-dsa-2';
import { bestTimeToBuyAndSellStockWithCooldownGenerator } from './generators/gs-dsa-3';
import { gsDsa1Generator } from './generators/gs-dsa-1';
import { maximumProfitInKTransactionsGenerator } from './generators/gs-dsa-2';
import { serializeAndDeserializeBinaryTreeGenerator } from './generators/amz-dsa-5';
import { cloneGraphGenerator } from './generators/amz-dsa-4';
import { binaryTreeZigzagLevelOrderTraversalGenerator } from './generators/amz-dsa-8';
import { productOfArrayExceptSelfGenerator } from './generators/amz-dsa-6';
import { courseScheduleGenerator } from './generators/amz-dsa-3';
import { wordSearchIIGenerator } from './generators/ms-dsa-2';
import { LayoutEngine } from './layoutEngine';
import { binaryTreeMaximumPathSumGenerator } from './generators/ms-dsa-1';
import { designAddAndSearchWordsDataStructureGenerator } from './generators/ms-dsa-5';
import { designTokenizerTrieGenerator } from './generators/oai-dsa-1';
import { implementTrieWithAutocompleteGenerator } from './generators/oai-dsa-3';
import { slidingWindowMedianGenerator } from './generators/oai-dsa-4';
import { msDsa8Generator } from './generators/ms-dsa-8';
import { msDsa4Generator } from './generators/ms-dsa-4';
import { msDsa3Generator } from './generators/ms-dsa-3';
import { msDsa7Generator } from './generators/ms-dsa-7';
import { courseScheduleIIGenerator } from './generators/g-dsa-7';
import { findCelebrityGenerator } from './generators/t-dsa-6';
import { numberOfIslandsIIGenerator } from './generators/nv-dsa-3';
import { designTwitterGenerator } from './generators/nv-dsa-4';
import { decodeWaysGenerator } from './generators/nv-dsa-8';
import { gsDsa4Generator } from './generators/gs-dsa-4';
import { taskSchedulerGenerator } from './generators/t-dsa-8';
import { rotateImageGenerator } from './generators/nv-dsa-7';
import { matrixChainMultiplicationGenerator } from './generators/nv-dsa-2';
import { gDsa8Generator } from './generators/g-dsa-8';
import { oaiDsa5Generator } from './generators/oai-dsa-5';
import { oaiDsa6Generator } from './generators/oai-dsa-6';
import { taskSchedulingGenerator } from './generators/nv-dsa-1';
import { kthLargestElementInAStreamGenerator } from './generators/oai-dsa-2';
import { longestIncreasingSubsequenceGenerator } from './generators/gs-dsa-8';
import { mincostToHireWorkersGenerator } from './generators/t-dsa-4';
import { reorganizeStringGenerator } from './generators/t-dsa-5';
import { trappingRainWaterGenerator } from './generators/t-dsa-3';
import { slidingWindowMaximumGenerator } from './generators/t-dsa-2';
import { gasStationGenerator } from './generators/t-dsa-7';
import { findDuplicateGenerator } from './generators/nv-dsa-6';
import { insertIntervalGenerator } from './generators/gs-dsa-5';
import { designHitCounterGenerator } from './generators/oai-dsa-8';
import { findMedianFromDataStreamGenerator } from './generators/oai-dsa-7';
import { findMedianFromDataStreamGenerator as amzDsa7Generator } from './generators/amz-dsa-7';
import { basicCalculatorIIGenerator } from './generators/nv-dsa-5';
import { longestIncreasingPathGenerator } from './generators/g-dsa-5';
import { containerWithMostWaterGenerator } from './generators/gs-dsa-7';
import { gsDsa6Generator } from './generators/gs-dsa-6';
import { medianOfTwoSortedArraysGenerator } from './generators/g-dsa-3';
import { gDsa4Generator } from './generators/g-dsa-4';
import { gDsa6Generator } from './generators/g-dsa-6';
export class VisualizerEngine {
  static generate(questionId: string, visualizerType: string, customInput: string | null, defaultInput: string) {
    const input = customInput || defaultInput || '';
    
    // Attempt specific generators by question ID first
    if (questionId === 'g-dsa-4') return gDsa4Generator(input);
    if (questionId === 'g-dsa-6') return gDsa6Generator(input);
    if (questionId === 'ms-dsa-6') return lfuCacheGenerator(input);
    if (questionId === 'amz-dsa-2') return amzDsa2Generator(input);
    if (questionId === 'g-dsa-3') return medianOfTwoSortedArraysGenerator(input);
    if (questionId === 'g-dsa-5') return longestIncreasingPathGenerator(input);
    if (questionId === 'g-dsa-1') return alienDictionaryGenerator(input);
    if (questionId === 'g-dsa-2') return wordLadderIIGenerator(input);
    if (questionId === 'gs-dsa-1') return gsDsa1Generator(input);
    if (questionId === 'gs-dsa-3') return bestTimeToBuyAndSellStockWithCooldownGenerator(input);
    if (questionId === 'gs-dsa-2') return maximumProfitInKTransactionsGenerator(input);
    if (questionId === 'amz-dsa-4') return cloneGraphGenerator(input);
    if (questionId === 'amz-dsa-1') return lruCacheGenerator(input);
    if (questionId === 'amz-dsa-5') return serializeAndDeserializeBinaryTreeGenerator(input);
    if (questionId === 'amz-dsa-8') return binaryTreeZigzagLevelOrderTraversalGenerator(input);
    if (questionId === 'amz-dsa-6') return productOfArrayExceptSelfGenerator(input);
    if (questionId === 'amz-dsa-7') return amzDsa7Generator(input);
    if (questionId === 'amz-dsa-3') return courseScheduleGenerator(input);
    if (questionId === 'ms-dsa-1') return binaryTreeMaximumPathSumGenerator(input);
    if (questionId === 'ms-dsa-2') return wordSearchIIGenerator(input);
    if (questionId === 'ms-dsa-5') return designAddAndSearchWordsDataStructureGenerator(input);
    if (questionId === 'ms-dsa-3') return msDsa3Generator(input);
    if (questionId === 'ms-dsa-4') return msDsa4Generator(input);
    if (questionId === 'ms-dsa-7') return msDsa7Generator(input);
    if (questionId === 'ms-dsa-8') return msDsa8Generator(input);
    if (questionId === 'oai-dsa-1') return designTokenizerTrieGenerator(input);
    if (questionId === 'oai-dsa-2') return kthLargestElementInAStreamGenerator(input);
    if (questionId === 'oai-dsa-3') return implementTrieWithAutocompleteGenerator(input);
    if (questionId === 'oai-dsa-4') return slidingWindowMedianGenerator(input);
    if (questionId === 'oai-dsa-5') return oaiDsa5Generator(input);
    if (questionId === 'oai-dsa-6') return oaiDsa6Generator(input);
    if (questionId === 'oai-dsa-7') return findMedianFromDataStreamGenerator(input);
    if (questionId === 'oai-dsa-8') return designHitCounterGenerator(input);
    if (questionId === 'g-dsa-7') return courseScheduleIIGenerator(input);
    if (questionId === 't-dsa-6') return findCelebrityGenerator(input);
    if (questionId === 'nv-dsa-3') return numberOfIslandsIIGenerator(input);
    if (questionId === 'nv-dsa-4') return designTwitterGenerator(input);
    if (questionId === 'nv-dsa-6') return findDuplicateGenerator(input);
    if (questionId === 'nv-dsa-8') return decodeWaysGenerator(input);
    if (questionId === 'nv-dsa-7') return rotateImageGenerator(input);
    if (questionId === 'gs-dsa-4') return gsDsa4Generator(input);
    if (questionId === 't-dsa-8') return taskSchedulerGenerator(input);
    if (questionId === 'nv-dsa-2') return matrixChainMultiplicationGenerator(input);
    if (questionId === 'g-dsa-8') return gDsa8Generator(input);
    if (questionId === 'nv-dsa-1') return taskSchedulingGenerator(input);
    if (questionId === 't-dsa-4') return mincostToHireWorkersGenerator(input);
    if (questionId === 't-dsa-5') return reorganizeStringGenerator(input);
    if (questionId === 't-dsa-7') return gasStationGenerator(input);
    if (questionId === 'gs-dsa-8') return longestIncreasingSubsequenceGenerator(input);
    if (questionId === 't-dsa-3') return trappingRainWaterGenerator(input);
    if (questionId === 't-dsa-2') return slidingWindowMaximumGenerator(input);
    if (questionId === 'gs-dsa-5') return insertIntervalGenerator(input);
    if (questionId === 'nv-dsa-5') return basicCalculatorIIGenerator(input);
    if (questionId === 'gs-dsa-7') return containerWithMostWaterGenerator(input);
    if (questionId === 'gs-dsa-6') return gsDsa6Generator(input);
    if (questionId === 'g-dsa-4') return gDsa4Generator(input);

    // Otherwise fallback to generic visualizerType logic
    
    switch (visualizerType) {
      case 'sorting':
        return this.generateSortingSteps(input);
      case 'sliding-window':
        return this.generateSlidingWindowSteps(input);
      case 'linked-list':
        return this.generateLinkedListSteps(input);
      case 'dp':
        return this.generateDPSteps(input, questionId);
      case 'tree':
        return this.generateTreeSteps(input);
      case 'graph':
        return this.generateGraphSteps(input);
      default:
        return { unsupported: true, message: 'Visualizer for this problem is coming soon!' };
    }
  }

  static parseArrayInput(input: string): number[] {
    try {
      const cleaned = input.replace(/[\[\]]/g, '').trim();
      if (!cleaned) return [4, 2, 7, 3, 1, 6];
      const parsed = cleaned.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
      return parsed.length > 0 ? parsed : [4, 2, 7, 3, 1, 6];
    } catch {
      return [4, 2, 7, 3, 1, 6];
    }
  }

  static generateSortingSteps(input: string) {
    const arr = this.parseArrayInput(input);
    const steps: any[] = [];
    steps.push({ arr: [...arr], pivot: -1, active: [-1, -1], desc: 'Initial array loaded. Prepare Quick Sort partitioning.' });

    const quickSort = (array: number[], low: number, high: number) => {
      if (low < high) {
        const pi = partition(array, low, high);
        quickSort(array, low, pi - 1);
        quickSort(array, pi + 1, high);
      }
    };

    const partition = (array: number[], low: number, high: number) => {
      const pivot = array[high];
      steps.push({ arr: [...array], pivot: high, active: [low, high], desc: `Selected element "${pivot}" as pivot. Iterate to partition.` });
      
      let i = low - 1;
      for (let j = low; j < high; j++) {
        if (array[j] <= pivot) {
          i++;
          steps.push({ arr: [...array], pivot: high, active: [j, high], desc: `Value "${array[j]}" <= pivot "${pivot}". Place in left partition.` });
          if (i !== j) {
            [array[i], array[j]] = [array[j], array[i]];
            steps.push({ arr: [...array], pivot: high, active: [i, high], desc: `Swap "${array[j]}" and "${array[i]}". Array: [${array.join(',')}]` });
          }
        } else {
          steps.push({ arr: [...array], pivot: high, active: [j, high], desc: `Value "${array[j]}" > pivot "${pivot}". Keep in right partition.` });
        }
      }
      if (i + 1 !== high) {
        [array[i + 1], array[high]] = [array[high], array[i + 1]];
        steps.push({ arr: [...array], pivot: i + 1, active: [i + 1, high], desc: `Swap pivot "${pivot}" into sorted partition index. Pivot is in final position!` });
      }
      return i + 1;
    };

    const workingArr = [...arr];
    quickSort(workingArr, 0, workingArr.length - 1);
    steps.push({ arr: [...workingArr], pivot: -1, active: [-1, -1], desc: 'Quick Sort recursive division sorted all subsets! Sorting complete.', finished: true });

    return { initialArr: arr, steps };
  }

  static generateSlidingWindowSteps(input: string) {
    const chars = input.replace(/"/g, '').split('');
    const steps: any[] = [];
    const seen: { [key: string]: number } = {};
    let left = 0;
    let maxLen = 0;

    for (let r = 0; r < chars.length; r++) {
      const char = chars[r];
      let conflictIdx = -1;
      
      if (seen[char] !== undefined && seen[char] >= left) {
        conflictIdx = seen[char];
        left = seen[char] + 1;
      }
      
      seen[char] = r;
      maxLen = Math.max(maxLen, r - left + 1);

      steps.push({
        left,
        right: r,
        conflictIdx,
        c: char,
        desc: conflictIdx !== -1
          ? `Character "${char}" repeated at index ${conflictIdx}. Shrink left boundary to ${left} to resolve collision.`
          : `Add character "${char}" to window. Boundaries: [${left} to ${r}]. Window is unique.`,
        maxLen
      });
    }

    if (steps.length === 0) {
      steps.push({ left: 0, right: 0, conflictIdx: -1, c: '', desc: 'Empty input string.', maxLen: 0 });
    }

    return { chars, steps };
  }

  static generateLinkedListSteps(input: string) {
    const nodes = this.parseArrayInput(input);
    if (nodes.length === 0) nodes.push(1, 2, 3, 4, 5);
    
    const steps: any[] = [];
    steps.push({ curr: 0, prev: -1, desc: `Initialize prev = null, curr = ${nodes[0]}. nextNode pointer holds reference to ${nodes[1] || 'NULL'}.` });
    
    for (let i = 0; i < nodes.length; i++) {
      const isLast = i === nodes.length - 1;
      steps.push({ 
        curr: i + 1 > nodes.length - 1 ? -1 : i + 1, 
        prev: i, 
        desc: `Reverse link: Node(${nodes[i]}) now points back to ${i === 0 ? 'NULL' : nodes[i-1]} (prev). Shift prev to ${nodes[i]}, curr to ${isLast ? 'NULL' : nodes[i+1]}.` 
      });
    }
    
    steps.push({ curr: -1, prev: nodes.length - 1, desc: `List fully reversed! Return Node(${nodes[nodes.length - 1]}) as the new head.`, finished: true });
    
    return { nodes, steps };
  }

  static generateDPSteps(input: string, questionId: string) {
    const chars = (input || 'babad').replace(/"/g, '').split('');
    const n = chars.length;
    const matrix = Array(n).fill(null).map(() => Array(n).fill(false));
    const steps: any[] = [];

    for (let i = 0; i < n; i++) {
      matrix[i][i] = true;
      steps.push({
        row: i, col: i, val: true,
        desc: `Base Case (Len 1): Substring "${chars[i]}" is a palindrome. Mark DP[${i}][${i}] = True.`
      });
    }

    for (let i = 0; i < n - 1; i++) {
      const isPal = chars[i] === chars[i + 1];
      matrix[i][i + 1] = isPal;
      steps.push({
        row: i, col: i + 1, val: isPal,
        desc: `Check Len 2 Substring "${chars[i]}${chars[i + 1]}": s[${i}] ${isPal ? '==' : '!='} s[${i + 1}]. DP[${i}][${i + 1}] = ${isPal ? 'True' : 'False'}.`
      });
    }

    for (let len = 3; len <= n; len++) {
      for (let i = 0; i < n - len + 1; i++) {
        const j = i + len - 1;
        const isPal = chars[i] === chars[j] && matrix[i + 1][j - 1];
        matrix[i][j] = isPal;
        steps.push({
          row: i, col: j, val: isPal,
          desc: `Check Len ${len} "${chars.slice(i, j + 1).join('')}": s[${i}] == s[${j}] && inner DP[${i + 1}][${j - 1}] is ${matrix[i + 1][j - 1] ? 'True' : 'False'}. DP[${i}][${j}] = ${isPal ? 'True' : 'False'}.`
        });
      }
    }

    return { chars, n, steps };
  }

  static generateTreeSteps(input: string) {
    const rawNodes = [
      { id: 0, val: 10, left: 1, right: 2, state: 'normal' },
      { id: 1, val: 5, left: 3, right: 4, state: 'normal' },
      { id: 2, val: 15, left: 5, right: 6, state: 'normal' },
      { id: 3, val: 2, state: 'normal' },
      { id: 4, val: 7, state: 'normal' },
      { id: 5, val: 12, state: 'normal' },
      { id: 6, val: 20, state: 'normal' }
    ];
    
    const edges: any[] = [];
    rawNodes.forEach(n => {
      if (n.left !== undefined) edges.push({ from: n.id, to: n.left });
      if (n.right !== undefined) edges.push({ from: n.id, to: n.right });
    });

    // Use dynamic hierarchical tree layout! No more dummy x, y!
    const nodes = LayoutEngine.generateTreeLayout(rawNodes, edges, 0, 400, 300);

    return {
      nodes,
      steps: [
        { node: 0, desc: 'Starting validation at root node (10). Range: (-∞, +∞). Node 10 is within range.', highlight: [0] },
        { node: 1, desc: 'Moving Left to node (5). Bound updates: (-∞, 10). Node 5 is within range.', highlight: [0, 1] },
        { node: 3, desc: 'Moving Left to node (2). Bound updates: (-∞, 5). Node 2 is valid.', highlight: [0, 1, 3] },
        { node: 4, desc: 'Backtrack to 5, moving Right to node (7). Bound updates: (5, 10). Node 7 is valid.', highlight: [0, 1, 3, 4] },
        { node: 2, desc: 'Backtrack to root, moving Right to node (15). Bound updates: (10, +∞). Node 15 is valid.', highlight: [0, 1, 3, 4, 2] },
        { node: 5, desc: 'Moving Left to node (12). Bound updates: (10, 15). Node 12 is valid.', highlight: [0, 1, 3, 4, 2, 5] },
        { node: 6, desc: 'Moving Right to node (20). Bound updates: (15, +∞). Node 20 is valid.', highlight: [0, 1, 3, 4, 2, 5, 6] },
        { node: -1, desc: 'Validation complete. All nodes recursively meet boundary constraints. Returns TRUE.', highlight: [0, 1, 2, 3, 4, 5, 6], success: true }
      ]
    };
  }

  static generateGraphSteps(input: string) {
    const rawNodes = [
      { id: 0, label: '0', state: 'normal' },
      { id: 1, label: '1', state: 'normal' },
      { id: 2, label: '2', state: 'normal' },
      { id: 3, label: '3', state: 'normal' }
    ];
    const edges = [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 3 }
    ];

    // Use authentic dynamic Force-Directed graph layout simulation! No dummy x, y!
    const nodes = LayoutEngine.generateForceDirectedLayout(rawNodes, edges, 400, 300);

    return {
      nodes,
      edges: [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 3 }
      ],
      steps: [
        { desc: 'Initialize adjacency list and compute in-degrees. In-degrees: {0:0, 1:1, 2:1, 3:2}. Queue: [0].', queue: [0], highlightNode: 0, activeEdge: null },
        { desc: 'Pop node 0. Add to sorted order. Traverse neighbors [1, 2].', queue: [], highlightNode: 0, activeEdge: null },
        { desc: 'Process edge 0->1. Decrease in-degree of 1 to 0. Add 1 to queue.', queue: [1], highlightNode: 1, activeEdge: { from: 0, to: 1 } },
        { desc: 'Process edge 0->2. Decrease in-degree of 2 to 0. Add 2 to queue.', queue: [1, 2], highlightNode: 2, activeEdge: { from: 0, to: 2 } },
        { desc: 'Pop node 1. Add to sorted order. Traverse neighbors [3].', queue: [2], highlightNode: 1, activeEdge: null },
        { desc: 'Process edge 1->3. Decrease in-degree of 3 to 1.', queue: [2], highlightNode: 3, activeEdge: { from: 1, to: 3 } },
        { desc: 'Pop node 2. Add to sorted order. Traverse neighbors [3].', queue: [], highlightNode: 2, activeEdge: null },
        { desc: 'Process edge 2->3. Decrease in-degree of 3 to 0. Add 3 to queue.', queue: [3], highlightNode: 3, activeEdge: { from: 2, to: 3 } },
        { desc: 'Pop node 3. Add to sorted order. No neighbors.', queue: [], highlightNode: 3, activeEdge: null },
        { desc: 'Queue is empty. Topological Sort complete: [0, 1, 2, 3].', queue: [], highlightNode: -1, activeEdge: null, finished: true }
      ]
    };
  }
}
