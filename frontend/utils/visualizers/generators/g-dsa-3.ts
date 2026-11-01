export const medianOfTwoSortedArraysGenerator = (inputStr: string) => {
  let nums1 = [1, 3];
  let nums2 = [2];

  try {
    const nums1Match = inputStr.match(/nums1\s*=\s*\[(.*?)\]/);
    if (nums1Match) {
      nums1 = nums1Match[1].split(',').filter(x => x.trim() !== '').map(x => parseInt(x.trim()));
    }
    const nums2Match = inputStr.match(/nums2\s*=\s*\[(.*?)\]/);
    if (nums2Match) {
      nums2 = nums2Match[1].split(',').filter(x => x.trim() !== '').map(x => parseInt(x.trim()));
    }
  } catch (e) {
    // fallback
  }

  const steps: any[] = [];
  
  let A = nums1;
  let B = nums2;
  
  steps.push({
    nums1: [...A],
    nums2: [...B],
    desc: `Initial arrays: nums1 = [${A.join(', ')}], nums2 = [${B.join(', ')}]`
  });

  if (A.length > B.length) {
    const temp = A;
    A = B;
    B = temp;
    steps.push({
      nums1: [...A],
      nums2: [...B],
      desc: `nums1 is longer than nums2, swapping them to ensure we binary search on the smaller array. nums1 = [${A.join(', ')}], nums2 = [${B.join(', ')}]`
    });
  }

  const m = A.length;
  const n = B.length;
  const half = Math.floor((m + n + 1) / 2);
  let lo = 0;
  let hi = m;

  steps.push({
    m, n, half, lo, hi,
    desc: `Length of smaller array m = ${m}, length of larger array n = ${n}. Total elements = ${m + n}. We need a left partition of size half = ${half}. Binary search range: lo = ${lo}, hi = ${hi}.`
  });

  while (lo <= hi) {
    const i = Math.floor((lo + hi) / 2);
    const j = half - i;

    steps.push({
      lo, hi, i, j,
      desc: `Current search space [lo: ${lo}, hi: ${hi}]. Try partition i = ${i} in nums1. Then partition j = half - i = ${half} - ${i} = ${j} in nums2.`
    });

    const left_max_1 = i === 0 ? -Infinity : A[i - 1];
    const right_min_1 = i === m ? Infinity : A[i];
    const left_max_2 = j === 0 ? -Infinity : B[j - 1];
    const right_min_2 = j === n ? Infinity : B[j];

    const formatInf = (val: number) => val === Infinity ? '∞' : val === -Infinity ? '-∞' : val;

    steps.push({
      left_max_1: formatInf(left_max_1),
      right_min_1: formatInf(right_min_1),
      left_max_2: formatInf(left_max_2),
      right_min_2: formatInf(right_min_2),
      desc: `Elements around partitions:\nnums1 left_max = ${formatInf(left_max_1)}, right_min = ${formatInf(right_min_1)}\nnums2 left_max = ${formatInf(left_max_2)}, right_min = ${formatInf(right_min_2)}`
    });

    if (left_max_1 <= right_min_2 && left_max_2 <= right_min_1) {
      // Found correct partition
      let median;
      if ((m + n) % 2 === 1) {
        median = Math.max(left_max_1, left_max_2);
        steps.push({
          found: true,
          median,
          desc: `Valid partition found! Total length is odd. Median is max(left_max_1, left_max_2) = max(${formatInf(left_max_1)}, ${formatInf(left_max_2)}) = ${median}.`,
          finished: true
        });
      } else {
        const leftMax = Math.max(left_max_1, left_max_2);
        const rightMin = Math.min(right_min_1, right_min_2);
        median = (leftMax + rightMin) / 2.0;
        steps.push({
          found: true,
          median,
          desc: `Valid partition found! Total length is even. Median is (max(left_max_1, left_max_2) + min(right_min_1, right_min_2)) / 2 = (${leftMax} + ${rightMin}) / 2 = ${median}.`,
          finished: true
        });
      }
      break;
    } else if (left_max_1 > right_min_2) {
      steps.push({
        condition: 'left_max_1 > right_min_2',
        lo, hi: i - 1,
        desc: `nums1 left_max (${left_max_1}) > nums2 right_min (${formatInf(right_min_2)}). Partition is too far right. Move hi to i - 1 = ${i - 1}.`
      });
      hi = i - 1;
    } else {
      steps.push({
        condition: 'left_max_2 > right_min_1',
        lo: i + 1, hi,
        desc: `nums2 left_max (${left_max_2}) > nums1 right_min (${formatInf(right_min_1)}). Partition is too far left. Move lo to i + 1 = ${i + 1}.`
      });
      lo = i + 1;
    }
  }

  return { nums1: A, nums2: B, steps };
};
