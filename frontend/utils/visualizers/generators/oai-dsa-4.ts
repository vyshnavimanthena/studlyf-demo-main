export const slidingWindowMedianGenerator = (inputStr: string) => {
  let nums = [1, 3, -1, -3, 5, 3, 6, 7];
  let k = 3;

  try {
    const numsMatch = inputStr.match(/\[(.*?)\]/);
    const kMatch = inputStr.match(/k\s*=\s*(\d+)/);
    
    if (numsMatch) {
      nums = numsMatch[1].split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    }
    if (kMatch) {
      k = Number(kMatch[1]);
    }
    if (nums.length === 0) {
      nums = [1, 3, -1, -3, 5, 3, 6, 7];
      k = 3;
    }
  } catch (e) {
    // fallback
  }

  const steps: any[] = [];
  const chars = nums.map(String);
  const result: number[] = [];

  class Heap {
    data: number[];
    isMin: boolean;
    constructor(isMin: boolean) {
      this.data = [];
      this.isMin = isMin;
    }
    push(val: number) {
      this.data.push(val);
      this.data.sort((a, b) => this.isMin ? a - b : b - a);
    }
    pop() {
      return this.data.shift();
    }
    peek() {
      return this.data[0];
    }
    remove(val: number) {
      const idx = this.data.indexOf(val);
      if (idx !== -1) {
        this.data.splice(idx, 1);
      }
    }
  }

  // To simulate lazy deletion but for the visualizer to be clear we can just show the effective sizes
  const lo = new Heap(false); // Max heap for lower half
  const hi = new Heap(true);  // Min heap for upper half
  const delayed: Record<number, number> = {};
  let loSize = 0;
  let hiSize = 0;

  const getHeapsStr = () => {
    return `lo:[${lo.data.join(',')}] hi:[${hi.data.join(',')}]`;
  };

  steps.push({
    left: 0, right: 0, conflictIdx: -1,
    statLabel: 'Median', statValue: 'N/A',
    desc: `Input initialized. Window size k = ${k}. Using two heaps: lo (max-heap) and hi (min-heap).`
  });

  const pruneLo = () => {
    while (lo.data.length > 0 && delayed[lo.peek()] > 0) {
      const val = lo.peek();
      delayed[val]--;
      lo.pop();
    }
  };

  const pruneHi = () => {
    while (hi.data.length > 0 && delayed[hi.peek()] > 0) {
      const val = hi.peek();
      delayed[val]--;
      hi.pop();
    }
  };

  const makeBalance = (l: number, r: number) => {
    let balanced = false;
    while (loSize > Math.floor((loSize + hiSize + 1) / 2)) {
      const val = lo.pop()!;
      loSize--;
      hi.push(val);
      hiSize++;
      pruneLo();
      balanced = true;
      steps.push({
        left: l, right: r, conflictIdx: -1,
        statLabel: 'Rebalancing', statValue: 'Moving lo -> hi',
        desc: `lo had too many elements. Moved ${val} to hi. ${getHeapsStr()}`
      });
    }
    while (loSize < Math.floor((loSize + hiSize + 1) / 2)) {
      const val = hi.pop()!;
      hiSize--;
      lo.push(val);
      loSize++;
      pruneHi();
      balanced = true;
      steps.push({
        left: l, right: r, conflictIdx: -1,
        statLabel: 'Rebalancing', statValue: 'Moving hi -> lo',
        desc: `lo had too few elements. Moved ${val} to lo. ${getHeapsStr()}`
      });
    }
  };

  for (let i = 0; i < nums.length; i++) {
    const l = Math.max(0, i - k + 1);
    const num = nums[i];

    if (lo.data.length === 0 || num <= lo.peek()) {
      lo.push(num);
      loSize++;
      steps.push({
        left: l, right: i, conflictIdx: -1,
        statLabel: 'Adding', statValue: num.toString(),
        desc: `Added ${num} to lo (max-heap). lo_size=${loSize}, hi_size=${hiSize}. ${getHeapsStr()}`
      });
    } else {
      hi.push(num);
      hiSize++;
      steps.push({
        left: l, right: i, conflictIdx: -1,
        statLabel: 'Adding', statValue: num.toString(),
        desc: `Added ${num} to hi (min-heap). lo_size=${loSize}, hi_size=${hiSize}. ${getHeapsStr()}`
      });
    }

    makeBalance(l, i);

    if (i >= k) {
      const outNum = nums[i - k];
      delayed[outNum] = (delayed[outNum] || 0) + 1;
      if (lo.data.length > 0 && outNum <= lo.peek()) {
        loSize--;
        if (outNum === lo.peek()) pruneLo();
      } else {
        hiSize--;
        if (hi.data.length > 0 && outNum === hi.peek()) pruneHi();
      }
      makeBalance(l, i);
      steps.push({
        left: l, right: i, conflictIdx: i - k,
        statLabel: 'Removing', statValue: outNum.toString(),
        desc: `Element ${outNum} slid out of window. Marked as delayed deletion. lo_size=${loSize}, hi_size=${hiSize}. ${getHeapsStr()}`
      });
    }

    if (i >= k - 1) {
      let median;
      if (loSize > hiSize) {
        median = lo.peek();
      } else {
        median = (lo.peek() + hi.peek()) / 2.0;
      }
      result.push(median);
      steps.push({
        left: l, right: i, conflictIdx: -1,
        statLabel: 'Current Median', statValue: median.toString(),
        desc: `Window [${l}, ${i}] complete. Median is ${median}. Appended to result.`
      });
    }
  }

  steps.push({
    left: nums.length >= k ? nums.length - k : 0,
    right: nums.length - 1,
    conflictIdx: -1,
    statLabel: 'Final Result',
    statValue: `[${result.join(', ')}]`,
    desc: `Sliding window completed. Final result: [${result.join(', ')}]`,
    finished: true
  });

  return { chars, steps };
};
