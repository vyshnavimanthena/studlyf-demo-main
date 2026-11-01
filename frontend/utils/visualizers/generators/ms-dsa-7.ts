export const msDsa7Generator = (inputStr: string) => {
  let lists: number[][] = [[1, 4, 5], [1, 3, 4], [2, 6]];
  try {
    let cleanStr = inputStr;
    if (inputStr.includes('=')) {
      cleanStr = inputStr.split('=')[1].trim();
    }
    const parsed = JSON.parse(cleanStr);
    if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
      lists = parsed;
    }
  } catch (e) {
    // fallback
  }

  const steps: any[] = [];
  const k = lists.length;
  const maxNodes = Math.max(15, k + 5);

  const nodes = [];
  for (let i = 0; i < maxNodes; i++) {
    const level = Math.floor(Math.log2(i + 1));
    const offset = i - (Math.pow(2, level) - 1);
    const width = 400;
    const y = 50 + level * 60;
    const itemsInLevel = Math.pow(2, level);
    const spacing = width / itemsInLevel;
    const x = spacing / 2 + offset * spacing;

    nodes.push({
      id: i,
      val: '', 
      x,
      y,
      left: 2 * i + 1 < maxNodes ? 2 * i + 1 : undefined,
      right: 2 * i + 2 < maxNodes ? 2 * i + 2 : undefined
    });
  }

  let heap: { val: number, listIdx: number, nodeIdx: number }[] = [];
  const result: number[] = [];

  const getHeapVals = () => {
    const vals: Record<number, any> = {};
    for (let i = 0; i < maxNodes; i++) {
      vals[i] = i < heap.length ? heap[i].val : '';
    }
    return vals;
  };

  const getDesc = (msg: string) => {
    return `${msg}\nResult: [${result.join(', ')}]`;
  };

  steps.push({
    nodeVals: getHeapVals(),
    highlight: [],
    node: null,
    desc: getDesc('Initialized empty Min-Heap (size k) and result list.')
  });

  const swap = (i: number, j: number) => {
    const temp = heap[i];
    heap[i] = heap[j];
    heap[j] = temp;
    steps.push({
      nodeVals: getHeapVals(),
      highlight: [i, j],
      node: null,
      desc: getDesc(`Heapify: Swapped ${heap[i].val} and ${heap[j].val} to maintain Min-Heap.`)
    });
  };

  const bubbleUp = (idx: number) => {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (heap[parent].val > heap[idx].val) {
        swap(parent, idx);
        idx = parent;
      } else {
        break;
      }
    }
  };

  const bubbleDown = (idx: number) => {
    const len = heap.length;
    while (true) {
      let smallest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;

      if (left < len && heap[left].val < heap[smallest].val) smallest = left;
      if (right < len && heap[right].val < heap[smallest].val) smallest = right;

      if (smallest !== idx) {
        swap(idx, smallest);
        idx = smallest;
      } else {
        break;
      }
    }
  };

  const heappush = (item: { val: number, listIdx: number, nodeIdx: number }) => {
    heap.push(item);
    steps.push({
      nodeVals: getHeapVals(),
      highlight: [heap.length - 1],
      node: heap.length - 1,
      desc: getDesc(`Pushed ${item.val} from List ${item.listIdx} into heap.`)
    });
    bubbleUp(heap.length - 1);
  };

  const heappop = () => {
    if (heap.length === 0) return null;
    const min = heap[0];
    const end = heap.pop();

    if (heap.length === 0) {
      steps.push({
        nodeVals: getHeapVals(),
        highlight: [0],
        node: 0,
        desc: getDesc(`Extracted minimum ${min.val} from heap. Heap is now empty.`)
      });
      return min;
    }

    steps.push({
      nodeVals: getHeapVals(),
      highlight: [0],
      node: 0,
      desc: getDesc(`Extracted minimum ${min.val} from heap.`)
    });

    if (end) {
      heap[0] = end;
      steps.push({
        nodeVals: getHeapVals(),
        highlight: [0],
        node: 0,
        desc: getDesc(`Moved last element ${end.val} to root to maintain tree shape.`)
      });
      bubbleDown(0);
    }
    return min;
  };

  for (let i = 0; i < lists.length; i++) {
    if (lists[i].length > 0) {
      heappush({ val: lists[i][0], listIdx: i, nodeIdx: 0 });
    }
  }

  while (heap.length > 0) {
    const min = heappop();
    if (min) {
      result.push(min.val);
      steps.push({
        nodeVals: getHeapVals(),
        highlight: [],
        node: null,
        desc: getDesc(`Appended ${min.val} to result list.`)
      });

      const nextIdx = min.nodeIdx + 1;
      if (nextIdx < lists[min.listIdx].length) {
        heappush({ val: lists[min.listIdx][nextIdx], listIdx: min.listIdx, nodeIdx: nextIdx });
      }
    }
  }

  steps.push({
    nodeVals: getHeapVals(),
    highlight: [],
    node: null,
    desc: getDesc('All lists merged successfully!'),
    finished: true
  });

  return { nodes, steps };
};
