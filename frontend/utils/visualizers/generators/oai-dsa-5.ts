export const oaiDsa5Generator = (inputStr: string) => {
  // Parse input
  let weights = [1, 3, 2, 1];
  try {
    const match = inputStr.match(/\[(.*?)\]/);
    if (match) {
      const parsed = match[1].split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      if (parsed.length > 0) weights = parsed;
    }
  } catch (e) {}

  const steps: any[] = [];
  
  steps.push({
    arr: [...weights],
    pivot: -1,
    active: [],
    desc: `Input weights: [${weights.join(', ')}]. We need to build a prefix sum array to enable proportional random sampling.`
  });

  const prefix: number[] = [];
  let total = 0;
  
  for (let i = 0; i < weights.length; i++) {
    total += weights[i];
    prefix.push(total);
    steps.push({
      arr: [...prefix, ...weights.slice(i + 1)],
      pivot: i,
      active: [i],
      desc: `Adding weight ${weights[i]} to total. Prefix sum at index ${i} is now ${total}.`
    });
  }

  steps.push({
    arr: [...prefix],
    pivot: -1,
    active: [],
    desc: `Prefix sum array built: [${prefix.join(', ')}]. Total sum is ${total}.`
  });

  // Simulate pickIndex
  // Pick a fixed target for deterministic visualization
  const target = Math.max(1, Math.floor(total * 0.6)); 

  steps.push({
    arr: [...prefix],
    pivot: -1,
    active: [],
    desc: `pickIndex() called. Generating random target between 0 and ${total}. Let's simulate target = ${target}.`
  });

  steps.push({
    arr: [...prefix],
    pivot: -1,
    active: [],
    desc: `Now using Binary Search (bisect_left) on prefix array to find the first index >= ${target}.`
  });

  let left = 0;
  let right = prefix.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    steps.push({
      arr: [...prefix],
      pivot: mid,
      active: [left, right],
      desc: `Binary Search: left = ${left}, right = ${right}, mid = ${mid}. prefix[${mid}] = ${prefix[mid]}.`
    });

    if (prefix[mid] >= target) {
      steps.push({
        arr: [...prefix],
        pivot: mid,
        active: [left, right],
        desc: `prefix[${mid}] (${prefix[mid]}) >= target (${target}). Move right boundary to mid - 1.`
      });
      right = mid - 1;
    } else {
      steps.push({
        arr: [...prefix],
        pivot: mid,
        active: [left, right],
        desc: `prefix[${mid}] (${prefix[mid]}) < target (${target}). Move left boundary to mid + 1.`
      });
      left = mid + 1;
    }
  }

  steps.push({
    arr: [...prefix],
    pivot: left,
    active: [left],
    desc: `Binary Search complete. Found index ${left} since prefix[${left}] (${prefix[left]}) >= ${target}. The random pick returns index ${left}.`,
    finished: true
  });

  return { initialArr: weights, steps };
};
