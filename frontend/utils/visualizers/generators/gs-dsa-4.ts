export const gsDsa4Generator = (inputStr: string) => {
  let intervals = [[0, 30], [5, 10], [15, 20]];
  try {
    const startIdx = inputStr.indexOf('[');
    const endIdx = inputStr.lastIndexOf(']');
    if (startIdx !== -1 && endIdx !== -1) {
      const parsed = JSON.parse(inputStr.substring(startIdx, endIdx + 1));
      if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0])) {
        intervals = parsed;
      }
    }
  } catch (e) {}

  const steps: any[] = [];
  
  // Build standard Min-Heap tree skeleton (15 nodes for 4 levels)
  const maxNodes = 15;
  const nodes: any[] = [];
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

  const heap: number[] = [];

  const getHeapVals = () => {
    const vals: Record<number, any> = {};
    for (let i = 0; i < maxNodes; i++) {
      vals[i] = i < heap.length ? heap[i].toString() : '';
    }
    return vals;
  };

  steps.push({
    nodeVals: getHeapVals(),
    highlight: [],
    node: null,
    desc: `Input parsed. Intervals: ${JSON.stringify(intervals)}. Sorting by start time...`
  });

  const sortedIntervals = [...intervals].sort((a, b) => a[0] - b[0]);
  
  steps.push({
    nodeVals: getHeapVals(),
    highlight: [],
    node: null,
    desc: `Sorted intervals: ${JSON.stringify(sortedIntervals)}. Initializing a Min-Heap tree to track room end times.`
  });

  for (let i = 0; i < sortedIntervals.length; i++) {
    const [start, end] = sortedIntervals[i];
    
    steps.push({
      nodeVals: getHeapVals(),
      highlight: [],
      node: null,
      desc: `Processing meeting [${start}, ${end}]. Current heap (end times): [${heap.join(', ')}].`
    });

    if (heap.length === 0) {
      heap.push(end);
      steps.push({
        nodeVals: getHeapVals(),
        highlight: [0],
        node: 0,
        desc: `Heap is empty. Allocate new room. Pushed end time ${end} to root.`
      });
    } else {
      let minIdx = 0;
      for (let j = 1; j < heap.length; j++) {
        if (heap[j] < heap[minIdx]) {
          minIdx = j;
        }
      }
      const minEnd = heap[minIdx];

      if (start >= minEnd) {
        steps.push({
          nodeVals: getHeapVals(),
          highlight: [minIdx],
          node: minIdx,
          desc: `Meeting starts at ${start}, which is >= earliest ending room at ${minEnd}. Room freed! Reusing it.`
        });
        
        heap[minIdx] = end;
        
        steps.push({
          nodeVals: getHeapVals(),
          highlight: [minIdx],
          node: minIdx,
          desc: `Updated room end time to ${end}.`
        });
      } else {
        steps.push({
          nodeVals: getHeapVals(),
          highlight: [minIdx],
          node: minIdx,
          desc: `Meeting starts at ${start}, which is < earliest ending room at ${minEnd}. Need a new room.`
        });
        
        heap.push(end);
        
        steps.push({
          nodeVals: getHeapVals(),
          highlight: [heap.length - 1],
          node: heap.length - 1,
          desc: `Allocated new room. Pushed end time ${end} to heap.`
        });
      }
    }
  }

  steps.push({
    nodeVals: getHeapVals(),
    highlight: [],
    node: null,
    desc: `All meetings processed. Final heap size is ${heap.length}, so we need ${heap.length} meeting rooms.`,
    finished: true
  });

  return { nodes, steps };
};
