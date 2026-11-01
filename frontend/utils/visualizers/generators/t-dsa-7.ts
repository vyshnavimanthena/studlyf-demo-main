export const gasStationGenerator = (input: string) => {
  let gas = [1, 2, 3, 4, 5];
  let cost = [3, 4, 5, 1, 2];

  try {
    const gasMatch = input.match(/gas\s*=\s*\[(.*?)\]/);
    if (gasMatch) {
      gas = gasMatch[1].split(',').map(s => Number(s.trim()));
    }
    const costMatch = input.match(/cost\s*=\s*\[(.*?)\]/);
    if (costMatch) {
      cost = costMatch[1].split(',').map(s => Number(s.trim()));
    }
  } catch (e) {
    // fallback
  }

  // Fallback to default if parsed arrays have different lengths
  if (gas.length !== cost.length || gas.length === 0) {
    gas = [1, 2, 3, 4, 5];
    cost = [3, 4, 5, 1, 2];
  }

  const n = gas.length;
  const diffs = gas.map((g, i) => g - cost[i]);
  const steps: any[] = [];

  let total_tank = 0;
  let curr_tank = 0;
  let start = 0;

  steps.push({
    arr: [...diffs],
    pivot: -1,
    active: [0],
    desc: `Initial state. gas = [${gas.join(', ')}], cost = [${cost.join(', ')}]. We visualize the differences (gas - cost) as the array: [${diffs.join(', ')}]. start = 0, total_tank = 0, curr_tank = 0.`
  });

  for (let i = 0; i < n; i++) {
    const diff = diffs[i];
    total_tank += diff;
    curr_tank += diff;

    steps.push({
      arr: [...diffs],
      pivot: i,
      active: [start, i],
      desc: `Station ${i}: gas = ${gas[i]}, cost = ${cost[i]}, diff = ${diff}. total_tank becomes ${total_tank}. curr_tank becomes ${curr_tank}.`
    });

    if (curr_tank < 0) {
      const prevStart = start;
      start = i + 1;
      curr_tank = 0;
      
      steps.push({
        arr: [...diffs],
        pivot: i,
        active: [start > n - 1 ? -1 : start],
        desc: `curr_tank is negative (${curr_tank - diff} -> ${curr_tank - diff + diff}). Cannot reach station ${i + 1} from station ${prevStart}. Reset start to ${start} and curr_tank to 0.`
      });
    }
  }

  if (total_tank >= 0) {
    steps.push({
      arr: [...diffs],
      pivot: -1,
      active: [start],
      desc: `Loop finished. total_tank (${total_tank}) >= 0, so a valid circuit exists starting at index ${start}. Return ${start}.`,
      finished: true
    });
  } else {
    steps.push({
      arr: [...diffs],
      pivot: -1,
      active: [],
      desc: `Loop finished. total_tank (${total_tank}) < 0, so no valid circuit exists. Return -1.`,
      finished: true
    });
  }

  return { initialArr: diffs, steps };
};
