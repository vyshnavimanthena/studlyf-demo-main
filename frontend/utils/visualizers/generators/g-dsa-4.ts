export const gDsa4Generator = (input: string) => {
  // default input: height = [0,1,0,2,1,0,1,3,2,1,2,1]
  let height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];
  try {
    const match = input.match(/\[(.*?)\]/);
    if (match) {
      const parsed = match[1].split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
      if (parsed.length > 0) {
        height = parsed;
      }
    }
  } catch (e) {
    // fallback to default
  }

  const chars = height.map(String);
  const steps: any[] = [];
  
  if (height.length === 0) {
    steps.push({
      left: 0, right: 0, conflictIdx: -1, c: '',
      desc: 'Empty height array.',
      maxLen: 0
    });
    return { chars, steps };
  }

  let left = 0;
  let right = height.length - 1;
  let left_max = height[left];
  let right_max = height[right];
  let water = 0;

  steps.push({
    left, right, conflictIdx: -1, c: '',
    desc: `Initialize left=0, right=${right}. left_max=${left_max}, right_max=${right_max}, water=0.`,
    maxLen: water
  });

  while (left < right) {
    if (left_max < right_max) {
      left++;
      left_max = Math.max(left_max, height[left]);
      const trapped = left_max - height[left];
      water += trapped;
      steps.push({
        left, right, conflictIdx: left, c: String(height[left]),
        desc: `left_max (${left_max}) < right_max (${right_max}). Move left pointer to ${left}. New left_max=${left_max}. Trapped water at this position: ${left_max} - ${height[left]} = ${trapped}. Total water=${water}.`,
        maxLen: water
      });
    } else {
      right--;
      right_max = Math.max(right_max, height[right]);
      const trapped = right_max - height[right];
      water += trapped;
      steps.push({
        left, right, conflictIdx: right, c: String(height[right]),
        desc: `left_max (${left_max}) >= right_max (${right_max}). Move right pointer to ${right}. New right_max=${right_max}. Trapped water at this position: ${right_max} - ${height[right]} = ${trapped}. Total water=${water}.`,
        maxLen: water
      });
    }
  }

  steps.push({
    left, right, conflictIdx: -1, c: '',
    desc: `Pointers met at index ${left}. Total water trapped is ${water} units.`,
    maxLen: water,
    finished: true
  });

  return { chars, steps };
};
