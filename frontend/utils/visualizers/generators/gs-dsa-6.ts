export const gsDsa6Generator = (inputStr: string) => {
  // Parse input
  // Default: 'nums = [1,2,3,4]'
  let nums = [1, 2, 3, 4];
  try {
    const match = inputStr.match(/\[(.*?)\]/);
    if (match) {
      nums = match[1].split(',').map(s => parseInt(s.trim()));
    }
  } catch (e) {
    // fallback
  }

  const chars = nums.map(String);
  const steps: any[] = [];
  const n = nums.length;
  const result = new Array(n).fill(1);

  steps.push({
    left: -1,
    right: -1,
    conflictIdx: -1,
    desc: `Initialized result array of size ${n} with 1s.`,
    statLabel: 'Result Array',
    statValue: JSON.stringify(result)
  });

  // Prefix pass
  let prefix = 1;
  steps.push({
    left: -1,
    right: -1,
    conflictIdx: -1,
    desc: `Starting left-to-right pass to compute prefix products. prefix = 1`,
    statLabel: 'Result Array',
    statValue: JSON.stringify(result)
  });

  for (let i = 0; i < n; i++) {
    result[i] = prefix;
    steps.push({
      left: 0,
      right: i,
      conflictIdx: -1,
      desc: `i=${i}: Assign prefix (${prefix}) to result[${i}].`,
      statLabel: `Result Array (prefix=${prefix})`,
      statValue: JSON.stringify(result)
    });

    prefix *= nums[i];
    steps.push({
      left: 0,
      right: i,
      conflictIdx: -1,
      desc: `i=${i}: Update prefix = prefix * nums[${i}] (${nums[i]}) = ${prefix}.`,
      statLabel: `Result Array (prefix=${prefix})`,
      statValue: JSON.stringify(result)
    });
  }

  // Suffix pass
  let suffix = 1;
  steps.push({
    left: -1,
    right: -1,
    conflictIdx: -1,
    desc: `Starting right-to-left pass to multiply suffix products. suffix = 1`,
    statLabel: 'Result Array',
    statValue: JSON.stringify(result)
  });

  for (let i = n - 1; i >= 0; i--) {
    result[i] *= suffix;
    steps.push({
      left: i,
      right: n - 1,
      conflictIdx: -1,
      desc: `i=${i}: Multiply result[${i}] by suffix (${suffix}). result[${i}] becomes ${result[i]}.`,
      statLabel: `Result Array (suffix=${suffix})`,
      statValue: JSON.stringify(result)
    });

    suffix *= nums[i];
    steps.push({
      left: i,
      right: n - 1,
      conflictIdx: -1,
      desc: `i=${i}: Update suffix = suffix * nums[${i}] (${nums[i]}) = ${suffix}.`,
      statLabel: `Result Array (suffix=${suffix})`,
      statValue: JSON.stringify(result)
    });
  }

  steps.push({
    left: 0,
    right: n - 1,
    conflictIdx: -1,
    desc: `Completed both passes! Final product array is computed.`,
    statLabel: 'Final Result',
    statValue: JSON.stringify(result),
    finished: true
  });

  return { chars, steps };
};
