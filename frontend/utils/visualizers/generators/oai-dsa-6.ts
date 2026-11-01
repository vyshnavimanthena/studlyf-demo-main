export const oaiDsa6Generator = (inputStr: string) => {
  let nums = [1, 1, 1];
  let k = 2;

  try {
    const numsMatch = inputStr.match(/\[(.*?)\]/);
    const kMatch = inputStr.match(/k\s*=\s*(-?\d+)/);
    
    if (numsMatch) {
      nums = numsMatch[1].split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    }
    if (kMatch) {
      k = Number(kMatch[1]);
    }
    if (nums.length === 0) {
      nums = [1, 1, 1];
      k = 2;
    }
  } catch (e) {
    // fallback
  }

  const steps: any[] = [];
  const chars = nums.map(String);
  
  let count = 0;
  let prefixSum = 0;
  const sumMap: Record<number, number> = { 0: 1 };

  steps.push({
    left: 0,
    right: 0,
    conflictIdx: -1,
    statLabel: 'Valid Subarrays',
    statValue: count,
    desc: `Initialized prefix sum = 0, count = 0. Map stores prefix sums frequencies: {0: 1}. Target k = ${k}.`,
  });

  for (let i = 0; i < nums.length; i++) {
    prefixSum += nums[i];
    const target = prefixSum - k;
    
    steps.push({
      left: 0,
      right: i,
      conflictIdx: -1,
      statLabel: 'Current Prefix Sum',
      statValue: prefixSum,
      desc: `Add nums[${i}] (${nums[i]}) to prefix sum. New prefix sum = ${prefixSum}. Checking if target (prefixSum - k) = ${target} exists in map.`,
    });

    if (sumMap[target]) {
      count += sumMap[target];
      steps.push({
        left: 0,
        right: i,
        conflictIdx: -1,
        statLabel: 'Valid Subarrays',
        statValue: count,
        desc: `Target ${target} found in map with frequency ${sumMap[target]}! Found valid subarrays ending at index ${i}. Total count is now ${count}.`,
      });
    } else {
      steps.push({
        left: 0,
        right: i,
        conflictIdx: -1,
        statLabel: 'Valid Subarrays',
        statValue: count,
        desc: `Target ${target} not found in map. No valid subarrays ending at index ${i} with sum ${k}.`,
      });
    }

    sumMap[prefixSum] = (sumMap[prefixSum] || 0) + 1;
    
    steps.push({
      left: 0,
      right: i,
      conflictIdx: -1,
      statLabel: 'Valid Subarrays',
      statValue: count,
      desc: `Added/updated prefix sum ${prefixSum} in map. Map[${prefixSum}] is now ${sumMap[prefixSum]}.`,
    });
  }

  steps.push({
    left: 0,
    right: nums.length - 1,
    conflictIdx: -1,
    statLabel: 'Final Count',
    statValue: count,
    desc: `Finished array traversal. Total subarrays with sum ${k} is ${count}.`,
    finished: true
  });

  return { chars, steps };
};
