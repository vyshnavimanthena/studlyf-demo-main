import { LayoutEngine, LayoutEdge } from '../layoutEngine';

export const kthLargestElementInAStreamGenerator = (inputStr: string) => {
  let k = 3;
  let nums = [4, 5, 8, 2];
  let adds = [3, 5, 10];

  try {
    const kMatch = inputStr.match(/k\s*=\s*(\d+)/);
    if (kMatch) k = parseInt(kMatch[1]);
    
    const numsMatch = inputStr.match(/nums\s*=\s*\[(.*?)\]/);
    if (numsMatch) {
      nums = numsMatch[1].split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    }

    const addsMatches = inputStr.match(/add\(\s*(-?\d+)\s*\)/g);
    if (addsMatches) {
      adds = addsMatches.map(s => {
        const m = s.match(/add\(\s*(-?\d+)\s*\)/);
        return m ? parseInt(m[1]) : 0;
      });
    }
  } catch(e) {}
  
  const steps: any[] = [];
  let heap: number[] = [];
  
  const recordStep = (desc: string, highlight: number[] = [], currentNode: number = -1, finished = false) => {
    const nodeVals: Record<number, string> = {};
    // Max nodes enough for standard K sizes up to 15
    const maxNodes = Math.max(nums.length, k + 2, 15);
    for(let i = 0; i < maxNodes; i++) {
       nodeVals[i] = '';
    }
    for(let i = 0; i < heap.length; i++) {
       nodeVals[i] = heap[i].toString();
    }
    
    steps.push({
      desc,
      highlight,
      node: currentNode,
      nodeVals,
      finished
    });
  };

  recordStep(`Initialize Min-Heap with k=${k}. Elements to process: [${nums.join(', ')}]. Stream additions: [${adds.join(', ')}]`);

  const push = (val: number) => {
    heap.push(val);
    let curr = heap.length - 1;
    recordStep(`Inserted ${val} at the end of the heap. Sifting up...`, [curr], curr);
    
    while(curr > 0) {
      const parent = Math.floor((curr - 1) / 2);
      if (heap[parent] > heap[curr]) {
        recordStep(`Node ${heap[curr]} is smaller than parent ${heap[parent]}. Swapping.`, [curr, parent], curr);
        const temp = heap[parent];
        heap[parent] = heap[curr];
        heap[curr] = temp;
        curr = parent;
        recordStep(`Swapped.`, [curr], curr);
      } else {
        recordStep(`Node ${heap[curr]} is >= parent ${heap[parent]}. Sift up complete.`, [curr, parent], curr);
        break;
      }
    }
  };
  
  const pop = () => {
    if (heap.length === 0) return;
    const removed = heap[0];
    const last = heap.pop()!;
    if (heap.length > 0) {
      heap[0] = last;
      recordStep(`Popped root (${removed}). Moved last element (${last}) to root. Sifting down...`, [0], 0);
      let curr = 0;
      while(true) {
        const left = 2 * curr + 1;
        const right = 2 * curr + 2;
        let smallest = curr;
        if (left < heap.length && heap[left] < heap[smallest]) smallest = left;
        if (right < heap.length && heap[right] < heap[smallest]) smallest = right;
        
        if (smallest !== curr) {
          recordStep(`Node ${heap[curr]} is greater than child ${heap[smallest]}. Swapping.`, [curr, smallest], curr);
          const temp = heap[curr];
          heap[curr] = heap[smallest];
          heap[smallest] = temp;
          curr = smallest;
          recordStep(`Swapped.`, [curr], curr);
        } else {
          recordStep(`Node ${heap[curr]} is <= children. Sift down complete.`, [curr], curr);
          break;
        }
      }
    } else {
      recordStep(`Popped the only element (${removed}). Heap is now empty.`);
    }
  };

  for (const num of nums) {
    push(num);
    if (heap.length > k) {
      recordStep(`Heap size (${heap.length}) exceeds k=${k}. Popping smallest element.`, [0]);
      pop();
    }
  }

  recordStep(`Initialization complete. The Min-Heap contains the ${k} largest elements from nums. Root is ${heap[0]}.`, [0]);

  for (let i = 0; i < adds.length; i++) {
    const val = adds[i];
    recordStep(`Processing add(${val})...`);
    if (heap.length < k) {
      recordStep(`Heap size < k. Pushing ${val}.`);
      push(val);
    } else if (val > heap[0]) {
      recordStep(`Value ${val} > root (${heap[0]}). Replacing root with ${val}.`, [0], 0);
      heap[0] = val;
      recordStep(`Replaced root. Sifting down...`, [0], 0);
      let curr = 0;
      while(true) {
        const left = 2 * curr + 1;
        const right = 2 * curr + 2;
        let smallest = curr;
        if (left < heap.length && heap[left] < heap[smallest]) smallest = left;
        if (right < heap.length && heap[right] < heap[smallest]) smallest = right;
        
        if (smallest !== curr) {
          recordStep(`Node ${heap[curr]} > child ${heap[smallest]}. Swapping.`, [curr, smallest], curr);
          const temp = heap[curr];
          heap[curr] = heap[smallest];
          heap[smallest] = temp;
          curr = smallest;
          recordStep(`Swapped.`, [curr], curr);
        } else {
          recordStep(`Node ${heap[curr]} <= children. Sift down complete.`, [curr], curr);
          break;
        }
      }
    } else {
      recordStep(`Value ${val} <= root (${heap[0]}). Ignored since it can't be in top ${k}.`);
    }
    
    recordStep(`add(${val}) returns ${heap[0]} (the ${k}th largest element).`, [0], 0);
  }
  
  recordStep(`Finished processing all stream additions!`, [], -1, true);

  const maxNodesCount = Math.max(nums.length, k + 2, 15);
  const rawNodes: any[] = [];
  const edges: LayoutEdge[] = [];
  for(let i = 0; i < maxNodesCount; i++) {
    const node: any = { id: i, val: '', state: 'normal' };
    if (2 * i + 1 < maxNodesCount) {
      node.left = 2 * i + 1;
      edges.push({ from: i, to: 2 * i + 1 });
    }
    if (2 * i + 2 < maxNodesCount) {
      node.right = 2 * i + 2;
      edges.push({ from: i, to: 2 * i + 2 });
    }
    rawNodes.push(node);
  }
  
  const nodes = LayoutEngine.generateTreeLayout(rawNodes, edges, 0, 400, 300);

  return { nodes, edges, steps };
};
