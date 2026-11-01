export const findMedianFromDataStreamGenerator = (inputStr: string) => {
  let nums = [1, 2, 3];
  
  try {
    const addMatches = Array.from(inputStr.matchAll(/addNum\((\-?\d+)\)/g));
    if (addMatches.length > 0) {
      nums = addMatches.map(m => Number(m[1]));
    } else {
      const arrMatch = inputStr.match(/\[(.*?)\]/);
      if (arrMatch) {
        nums = arrMatch[1].split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
      }
    }
    if (nums.length === 0) nums = [1, 2, 3];
  } catch (e) {
    // fallback
  }

  const steps: any[] = [];
  const chars = nums.map(String);
  
  const lo: number[] = []; // Max-Heap (simulated with sorted array)
  const hi: number[] = []; // Min-Heap (simulated with sorted array)

  steps.push({
    left: 0,
    right: 0,
    conflictIdx: -1,
    statLabel: 'Median',
    statValue: 'N/A',
    desc: 'Stream initialized. Using Max-Heap (lower half) and Min-Heap (upper half).'
  });

  const getMedian = () => {
    if (lo.length === 0) return 'N/A';
    if (lo.length > hi.length) {
      return (lo[lo.length - 1]).toFixed(1);
    }
    return ((lo[lo.length - 1] + hi[0]) / 2).toFixed(1);
  };

  for (let r = 0; r < nums.length; r++) {
    const num = nums[r];
    
    lo.push(num);
    lo.sort((a, b) => a - b);
    
    steps.push({
      left: 0,
      right: r,
      conflictIdx: -1,
      statLabel: 'Median',
      statValue: r > 0 ? getMedian() : 'N/A',
      desc: `Read ${num}. Added to Max-Heap (lower half). Max-Heap: [${lo.join(', ')}], Min-Heap: [${hi.join(', ')}].`
    });

    const maxLo = lo.pop()!;
    hi.push(maxLo);
    hi.sort((a, b) => a - b);

    steps.push({
      left: 0,
      right: r,
      conflictIdx: -1,
      statLabel: 'Median',
      statValue: 'Balancing...',
      desc: `Moved max of Max-Heap (${maxLo}) to Min-Heap. Max-Heap: [${lo.join(', ')}], Min-Heap: [${hi.join(', ')}].`
    });

    if (hi.length > lo.length) {
      const minHi = hi.shift()!;
      lo.push(minHi);
      lo.sort((a, b) => a - b);
      
      steps.push({
        left: 0,
        right: r,
        conflictIdx: -1,
        statLabel: 'Median',
        statValue: 'Balancing...',
        desc: `Min-Heap larger. Moved min of Min-Heap (${minHi}) to Max-Heap. Max-Heap: [${lo.join(', ')}], Min-Heap: [${hi.join(', ')}].`
      });
    }

    const currentMedian = getMedian();
    steps.push({
      left: 0,
      right: r,
      conflictIdx: -1,
      statLabel: 'Median',
      statValue: currentMedian,
      desc: `Balanced. Current median is ${currentMedian}.`
    });
  }

  steps.push({
    left: 0,
    right: Math.max(0, nums.length - 1),
    conflictIdx: -1,
    statLabel: 'Final Median',
    statValue: getMedian(),
    desc: `Stream fully processed. Final median: ${getMedian()}.`,
    finished: true
  });

  return { chars, steps };
};
