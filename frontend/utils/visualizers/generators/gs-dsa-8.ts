export const longestIncreasingSubsequenceGenerator = (inputStr: string) => {
  let nums = [10, 9, 2, 5, 3, 7, 101, 18];
  try {
    const match = inputStr.match(/\[(.*?)\]/);
    if (match) {
      nums = match[1].split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
      if (nums.length === 0) nums = [10, 9, 2, 5, 3, 7, 101, 18];
    }
  } catch (e) {
    // fallback
  }

  const steps: any[] = [];
  const tails: number[] = [];
  const n = nums.length;

  steps.push({
    row: -1,
    col: -1,
    val: null,
    desc: `Input array: [${nums.join(', ')}]. Init empty tails array of max capacity ${n}.`
  });

  // bisect_left implementation in JS
  const bisectLeft = (arr: number[], x: number) => {
    let l = 0, r = arr.length;
    while (l < r) {
      let m = Math.floor((l + r) / 2);
      if (arr[m] < x) {
        l = m + 1;
      } else {
        r = m;
      }
    }
    return l;
  };

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    const pos = bisectLeft(tails, num);
    
    if (pos === tails.length) {
      tails.push(num);
      steps.push({
        row: 0,
        col: pos,
        val: num,
        desc: `Element ${num} is greater than all elements in tails. Append ${num} at index ${pos}. Tails: [${tails.join(', ')}]`
      });
    } else {
      const oldVal = tails[pos];
      tails[pos] = num;
      steps.push({
        row: 0,
        col: pos,
        val: num,
        desc: `Element ${num} replaces ${oldVal} at index ${pos} via binary search. Tails: [${tails.join(', ')}]`
      });
    }
  }

  steps.push({
    row: -1,
    col: -1,
    val: null,
    desc: `Finished processing. Length of LIS is ${tails.length}.`,
    finished: true
  });

  return {
    rows: 1,
    cols: n,
    steps
  };
};
