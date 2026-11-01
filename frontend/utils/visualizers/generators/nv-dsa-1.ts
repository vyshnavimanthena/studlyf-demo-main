export const taskSchedulingGenerator = (inputStr: string) => {
  // inputStr: 'tasks = ["A","A","A","B","B","B"], n = 2'
  let tasks = ["A","A","A","B","B","B"];
  let n = 2;

  try {
    const tasksMatch = inputStr.match(/tasks\s*=\s*\[(.*?)\]/);
    if (tasksMatch) {
      tasks = tasksMatch[1].split(',').map(s => s.replace(/['"\s]/g, ''));
    }
    const nMatch = inputStr.match(/n\s*=\s*(\d+)/);
    if (nMatch) {
      n = parseInt(nMatch[1], 10);
    }
  } catch (e) {
    // fallback
  }

  const steps: any[] = [];
  
  // calculate frequencies
  const freqMap: { [key: string]: number } = {};
  for (const t of tasks) {
    freqMap[t] = (freqMap[t] || 0) + 1;
  }
  
  const freqArray = Object.values(freqMap);
  steps.push({
    arr: [...freqArray],
    pivot: -1,
    active: [-1, -1],
    desc: `Step 1: Calculate frequencies of each task. Tasks: ${tasks.join(', ')} -> Frequencies: [${freqArray.join(', ')}]`
  });

  // Find max frequency
  let maxFreq = 0;
  for (let i = 0; i < freqArray.length; i++) {
    steps.push({
      arr: [...freqArray],
      pivot: -1,
      active: [i, i],
      desc: `Step 2: Find max frequency. Checking frequency ${freqArray[i]}...`
    });
    if (freqArray[i] > maxFreq) {
      maxFreq = freqArray[i];
      steps.push({
        arr: [...freqArray],
        pivot: i,
        active: [i, i],
        desc: `New max frequency found: ${maxFreq}`
      });
    }
  }

  // Count how many have max frequency
  let maxCount = 0;
  const activeMaxCountIndices: number[] = [];
  for (let i = 0; i < freqArray.length; i++) {
    steps.push({
      arr: [...freqArray],
      pivot: -1,
      active: [i, i],
      desc: `Step 3: Count how many tasks have the max frequency (${maxFreq}). Checking index ${i}...`
    });
    if (freqArray[i] === maxFreq) {
      maxCount++;
      activeMaxCountIndices.push(i);
      steps.push({
        arr: [...freqArray],
        pivot: -1,
        active: [...activeMaxCountIndices],
        desc: `Task has max frequency. Total tasks with max frequency is now ${maxCount}.`
      });
    }
  }

  // Calculate min length
  const minLength = (maxFreq - 1) * (n + 1) + maxCount;
  const result = Math.max(minLength, tasks.length);

  steps.push({
    arr: [...freqArray],
    pivot: -1,
    active: [...activeMaxCountIndices],
    desc: `Step 4: Calculate result using formula: max((maxFreq - 1) * (n + 1) + maxCount, len(tasks))`
  });

  steps.push({
    arr: [...freqArray],
    pivot: -1,
    active: [...activeMaxCountIndices],
    desc: `Result = max((${maxFreq} - 1) * (${n} + 1) + ${maxCount}, ${tasks.length}) = max(${minLength}, ${tasks.length}) = ${result}.`
  });

  return steps;
};
