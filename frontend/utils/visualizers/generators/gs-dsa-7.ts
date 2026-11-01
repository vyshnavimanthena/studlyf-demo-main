export const containerWithMostWaterGenerator = (inputStr: string) => {
  let height = [1, 8, 6, 2, 5, 4, 8, 3, 7];

  try {
    const match = inputStr.match(/\[(.*?)\]/);
    if (match) {
      height = match[1].split(',').map(s => parseInt(s.trim()));
    }
  } catch (e) {
    // fallback
  }

  const chars = height.map(h => String(h));
  const steps: any[] = [];
  
  let left = 0;
  let right = height.length - 1;
  let maxWater = 0;

  steps.push({
    left,
    right,
    conflictIdx: -1,
    desc: `Initialize two pointers: left=${left} (height ${height[left]}), right=${right} (height ${height[right]}).`,
    statLabel: 'Max Water Area',
    statValue: maxWater
  });

  while (left < right) {
    const currentHeight = Math.min(height[left], height[right]);
    const currentWidth = right - left;
    const area = currentHeight * currentWidth;
    
    let updated = false;
    if (area > maxWater) {
      maxWater = area;
      updated = true;
    }

    steps.push({
      left,
      right,
      conflictIdx: -1,
      desc: `Area = min(${height[left]}, ${height[right]}) * ${currentWidth} = ${area}. ${updated ? 'New maximum!' : 'Current max is higher or equal.'}`,
      statLabel: 'Max Water Area',
      statValue: maxWater
    });

    if (height[left] < height[right]) {
      steps.push({
        left,
        right,
        conflictIdx: left,
        desc: `height[left] (${height[left]}) < height[right] (${height[right]}). Moving left pointer inward.`,
        statLabel: 'Max Water Area',
        statValue: maxWater
      });
      left++;
    } else {
      steps.push({
        left,
        right,
        conflictIdx: right,
        desc: `height[left] (${height[left]}) >= height[right] (${height[right]}). Moving right pointer inward.`,
        statLabel: 'Max Water Area',
        statValue: maxWater
      });
      right--;
    }
  }

  steps.push({
    left,
    right,
    conflictIdx: -1,
    desc: `Pointers met. Maximum water area found is ${maxWater}.`,
    statLabel: 'Max Water Area',
    statValue: maxWater,
    finished: true
  });

  return { chars, steps };
};
