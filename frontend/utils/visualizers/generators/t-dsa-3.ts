export const trappingRainWaterGenerator = (input: string) => {
  let height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];
  try {
    const match = input.match(/\[(.*?)\]/);
    if (match) {
      const parsed = match[1].split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
      if (parsed.length > 0) {
        height = parsed;
      }
    }
  } catch (e) {}

  const steps: any[] = [];
  const n = height.length;
  if (n === 0) return { height: [], steps: [] };

  let left = 0;
  let right = n - 1;
  let left_max = height[left];
  let right_max = height[right];
  let water = 0;
  const trappedWater = new Array(n).fill(0);

  steps.push({
    left,
    right,
    leftMax: left_max,
    rightMax: right_max,
    activeIdx: -1,
    trappedWater: [...trappedWater],
    totalWater: 0,
    desc: `Initialize left=0 (height ${height[0]}), right=${n - 1} (height ${height[n - 1]}). left_max=${left_max}, right_max=${right_max}.`
  });

  while (left < right) {
    if (left_max < right_max) {
      left++;
      left_max = Math.max(left_max, height[left]);
      const trapped = Math.max(0, left_max - height[left]);
      trappedWater[left] = trapped;
      water += trapped;
      steps.push({
        left,
        right,
        leftMax: left_max,
        rightMax: right_max,
        activeIdx: left,
        trappedWater: [...trappedWater],
        totalWater: water,
        desc: `left_max (${left_max}) < right_max (${right_max}). Moved left to idx ${left} (height ${height[left]}). Trapped ${trapped} unit(s) of water.`
      });
    } else {
      right--;
      right_max = Math.max(right_max, height[right]);
      const trapped = Math.max(0, right_max - height[right]);
      trappedWater[right] = trapped;
      water += trapped;
      steps.push({
        left,
        right,
        leftMax: left_max,
        rightMax: right_max,
        activeIdx: right,
        trappedWater: [...trappedWater],
        totalWater: water,
        desc: `right_max (${right_max}) >= left_max (${left_max}). Moved right to idx ${right} (height ${height[right]}). Trapped ${trapped} unit(s) of water.`
      });
    }
  }

  steps.push({
    left,
    right,
    leftMax: left_max,
    rightMax: right_max,
    activeIdx: -1,
    trappedWater: [...trappedWater],
    totalWater: water,
    desc: `Pointers met at index ${left}. Total water trapped is ${water} units.`,
    finished: true
  });

  return { height, steps };
};
