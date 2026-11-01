export const productOfArrayExceptSelfGenerator = (inputStr: string) => {
  let nums = [1, 2, 3, 4];
  try {
    const match = inputStr.match(/\[(.*?)\]/);
    if (match) {
      const parsed = match[1].split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      if (parsed.length > 0) nums = parsed;
    }
  } catch (e) {}

  const n = nums.length;
  const result = Array(n).fill(1);
  const steps: any[] = [];
  
  steps.push({
    arr: [...result],
    pivot: -1,
    active: [],
    desc: `Input nums: [${nums.join(', ')}]. Initialize result array with 1s.`
  });

  let prefix = 1;
  for (let i = 0; i < n; i++) {
    result[i] = prefix;
    steps.push({
      arr: [...result],
      pivot: i,
      active: [i],
      desc: `Left Pass (i=${i}): result[${i}] = prefix (${prefix}). nums[${i}] is ${nums[i]}.`
    });
    prefix *= nums[i];
    steps.push({
      arr: [...result],
      pivot: i,
      active: [],
      desc: `Update prefix: prefix = prefix * nums[${i}] = ${prefix}.`
    });
  }

  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    result[i] *= suffix;
    steps.push({
      arr: [...result],
      pivot: i,
      active: [i],
      desc: `Right Pass (i=${i}): result[${i}] = result[${i}] * suffix (${suffix}) = ${result[i]}. nums[${i}] is ${nums[i]}.`
    });
    suffix *= nums[i];
    steps.push({
      arr: [...result],
      pivot: i,
      active: [],
      desc: `Update suffix: suffix = suffix * nums[${i}] = ${suffix}.`
    });
  }

  steps.push({
    arr: [...result],
    pivot: -1,
    active: [],
    desc: `Algorithm complete! Final product array: [${result.join(', ')}].`,
    finished: true
  });

  return { initialArr: result, steps };
};
