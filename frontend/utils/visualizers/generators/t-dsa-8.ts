export const taskSchedulerGenerator = (inputStr: string) => {
  let tasks: string[] = ["A", "A", "A", "B", "B", "B"];
  let n = 2;

  try {
    const tasksMatch = inputStr.match(/tasks\s*=\s*\[(.*?)\]/);
    if (tasksMatch) {
      tasks = tasksMatch[1].split(',').map(s => s.replace(/['"\s]/g, '')).filter(s => s.length > 0);
    }
    const nMatch = inputStr.match(/n\s*=\s*(\d+)/);
    if (nMatch) {
      n = parseInt(nMatch[1]);
    }
  } catch (e) {
    // fallback
  }

  const steps: any[] = [];
  const freqMap = new Map<string, number>();

  for (const t of tasks) {
    freqMap.set(t, (freqMap.get(t) || 0) + 1);
  }

  const entries = Array.from(freqMap.entries());
  // Sort descending by frequency
  entries.sort((a, b) => b[1] - a[1]);

  const arr = entries.map(e => e[1]);
  const chars = entries.map(e => e[0]);

  // Initial step
  steps.push({
    arr: [...arr],
    pivot: -1,
    active: [],
    desc: `Calculate frequency of each task. Unique tasks found: ${chars.map((c, i) => c + ":" + arr[i]).join(', ')}.`
  });

  const max_freq = arr[0] || 0;
  steps.push({
    arr: [...arr],
    pivot: 0,
    active: [0],
    desc: `Find the maximum frequency. max_freq = ${max_freq} (Task '${chars[0]}').`
  });

  let max_count = 0;
  const activeIndices: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === max_freq) {
      max_count++;
      activeIndices.push(i);
    }
  }

  steps.push({
    arr: [...arr],
    pivot: -1,
    active: [...activeIndices],
    desc: `Count tasks with frequency equal to max_freq (${max_freq}). There are ${max_count} such task(s): ${activeIndices.map(i => chars[i]).join(', ')}.`
  });

  const min_length = (max_freq - 1) * (n + 1) + max_count;
  steps.push({
    arr: [...arr],
    pivot: -1,
    active: [...activeIndices],
    desc: `Calculate minimum length formula: (max_freq - 1) * (n + 1) + max_count. (${max_freq} - 1) * (${n} + 1) + ${max_count} = ${min_length}.`
  });

  const ans = Math.max(min_length, tasks.length);
  steps.push({
    arr: [...arr],
    pivot: -1,
    active: [],
    desc: `Return max(min_length, total tasks). max(${min_length}, ${tasks.length}) = ${ans}. Final answer is ${ans}.`,
    finished: true
  });

  return { initialArr: arr, steps };
};
