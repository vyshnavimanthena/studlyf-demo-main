export const amzDsa2Generator = (inputStr: string) => {
  let nums = [1, 1, 1, 2, 2, 3];
  let k = 2;

  try {
    const numsMatch = inputStr.match(/\[(.*?)\]/);
    if (numsMatch) {
      nums = numsMatch[1].split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    }
    const kMatch = inputStr.match(/k\s*=\s*(\d+)/);
    if (kMatch) {
      k = parseInt(kMatch[1]);
    }
  } catch (e) {
    // fallback
  }

  const steps: any[] = [];
  
  steps.push({
    arr: [...nums],
    pivot: -1,
    active: [],
    desc: `Input array: [${nums.join(', ')}]. We need to find the top ${k} frequent elements.`
  });

  const count = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    count.set(num, (count.get(num) || 0) + 1);
    steps.push({
      arr: [...nums],
      pivot: i,
      active: [],
      desc: `Counting frequencies: Element ${num} appears ${count.get(num)} time(s).`
    });
  }

  const uniqueNums = Array.from(count.keys());
  const frequencies = uniqueNums.map(n => count.get(n)!);
  
  steps.push({
    arr: [...frequencies],
    pivot: -1,
    active: [],
    desc: `Frequency map created. Unique elements: [${uniqueNums.join(', ')}]. Their frequencies: [${frequencies.join(', ')}].`
  });

  const maxFreq = Math.max(...frequencies, 0);
  const bucketSizes = new Array(maxFreq + 1).fill(0);
  for (const freq of frequencies) {
    bucketSizes[freq]++;
  }

  steps.push({
    arr: [...bucketSizes],
    pivot: -1,
    active: [],
    desc: `Created buckets array of size ${maxFreq + 1} (max frequency is ${maxFreq}). Index represents frequency, value represents number of elements.`
  });

  const buckets: number[][] = Array.from({ length: maxFreq + 1 }, () => []);
  for (let i = 0; i < uniqueNums.length; i++) {
    const num = uniqueNums[i];
    const freq = frequencies[i];
    buckets[freq].push(num);
    
    steps.push({
      arr: [...bucketSizes],
      pivot: freq,
      active: [],
      desc: `Placed element ${num} into bucket at index ${freq} (appears ${freq} times).`
    });
  }

  const result: number[] = [];
  for (let freq = maxFreq; freq >= 0; freq--) {
    steps.push({
      arr: [...bucketSizes],
      pivot: freq,
      active: [],
      desc: `Checking bucket at frequency ${freq}. It contains ${buckets[freq].length} element(s).`
    });

    if (buckets[freq].length > 0) {
      for (const num of buckets[freq]) {
        result.push(num);
        steps.push({
          arr: [...bucketSizes],
          pivot: freq,
          active: [],
          desc: `Added element ${num} (freq ${freq}) to result. Current result: [${result.join(', ')}].`
        });
        if (result.length === k) {
          steps.push({
            arr: [...bucketSizes],
            pivot: -1,
            active: [],
            desc: `Found top ${k} frequent elements! Final result: [${result.join(', ')}].`
          });
          return { steps, initialArr: nums };
        }
      }
    }
  }

  steps.push({
    arr: [...bucketSizes],
    pivot: -1,
    active: [],
    desc: `Finished searching. Final result: [${result.join(', ')}].`
  });

  return { steps, initialArr: nums };
};
