export const slidingWindowMaximumGenerator = (inputStr: string) => {
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
  const deque: number[] = [];
  const result: number[] = [];

  steps.push({
    left: 0,
    right: 0,
    conflictIdx: -1,
    statLabel: 'Current Max',
    statValue: 'N/A',
    desc: `Input array initialized. Window size k = ${k}. Deque stores indices.`,
  });

  for (let r = 0; r < nums.length; r++) {
    let l = Math.max(0, r - k + 1);
    const windowStart = r >= k - 1 ? r - k + 1 : 0;

    while (deque.length > 0 && deque[0] < windowStart) {
      const poppedIdx = deque.shift()!;
      steps.push({
        left: l,
        right: r,
        conflictIdx: poppedIdx,
        statLabel: 'Current Max',
        statValue: result.length > 0 ? result[result.length - 1] : 'N/A',
        desc: `Index ${poppedIdx} is out of current window [${windowStart}, ${r}]. Popped from front of deque.`,
      });
    }

    while (deque.length > 0 && nums[deque[deque.length - 1]] < nums[r]) {
      const poppedIdx = deque.pop()!;
      steps.push({
        left: l,
        right: r,
        conflictIdx: poppedIdx,
        statLabel: 'Current Max',
        statValue: result.length > 0 ? result[result.length - 1] : 'N/A',
        desc: `Value ${nums[poppedIdx]} at index ${poppedIdx} is smaller than ${nums[r]}. Popped from back of deque.`,
      });
    }

    deque.push(r);
    
    steps.push({
      left: l,
      right: r,
      conflictIdx: -1,
      statLabel: 'Current Max',
      statValue: nums[deque[0]],
      desc: `Add index ${r} (value ${nums[r]}) to deque. Deque values: [${deque.map(idx => nums[idx]).join(', ')}].`,
    });

    if (r >= k - 1) {
      result.push(nums[deque[0]]);
      steps.push({
        left: l,
        right: r,
        conflictIdx: -1,
        statLabel: 'Current Max',
        statValue: nums[deque[0]],
        desc: `Window [${l}, ${r}] complete. Max is ${nums[deque[0]]}. Appended to result.`,
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
