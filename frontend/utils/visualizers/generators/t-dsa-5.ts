export const reorganizeStringGenerator = (input: string) => {
  let str = "aab";
  try {
    const cleaned = input.replace(/["']/g, '').trim();
    if (cleaned.startsWith('s = ')) {
      str = cleaned.substring(4);
    } else if (cleaned.startsWith('s=')) {
      str = cleaned.substring(2);
    } else if (cleaned) {
      str = cleaned;
    }
  } catch (e) {
    // fallback
  }

  const steps: any[] = [];
  
  const counts = new Map<string, number>();
  for (const c of str) {
    counts.set(c, (counts.get(c) || 0) + 1);
  }
  
  const maxAllowed = Math.floor((str.length + 1) / 2);
  let possible = true;
  for (const count of counts.values()) {
    if (count > maxAllowed) possible = false;
  }
  
  let heap = Array.from(counts.entries()).map(([char, cnt]) => ({ char, cnt }));
  heap.sort((a, b) => b.cnt - a.cnt);
  
  const getArr = () => heap.map(h => h.cnt);
  const getDescHeap = () => heap.map(h => `${h.char}:${h.cnt}`).join(', ');
  
  steps.push({
    arr: getArr(),
    pivot: -1,
    active: [],
    desc: `Initial character frequencies: [${getDescHeap()}]. Max allowed frequency for length ${str.length} is ${maxAllowed}.`
  });
  
  if (!possible) {
    steps.push({
      arr: getArr(),
      pivot: -1,
      active: [],
      desc: `A character exceeds the max allowed frequency ${maxAllowed}. Reorganization is impossible. Return "".`,
      finished: true
    });
    return { initialArr: getArr(), steps };
  }
  
  let result = "";
  let prev: { char: string, cnt: number } | null = null;
  
  while (heap.length > 0) {
    const curr = heap.shift()!;
    steps.push({
      arr: [curr.cnt, ...heap.map(h => h.cnt)], 
      pivot: 0,
      active: [0],
      desc: `Popped most frequent char '${curr.char}' (count: ${curr.cnt}). Appending to result: "${result + curr.char}".`
    });
    
    result += curr.char;
    curr.cnt -= 1;
    
    if (prev && prev.cnt > 0) {
      heap.push(prev);
      heap.sort((a, b) => b.cnt - a.cnt);
      steps.push({
        arr: getArr(),
        pivot: -1,
        active: [heap.findIndex(h => h.char === prev!.char)],
        desc: `Pushed previous char '${prev!.char}' back to heap with count ${prev!.cnt}. Heap: [${getDescHeap()}].`
      });
    }
    
    if (curr.cnt > 0) {
      prev = curr;
    } else {
      prev = null;
    }
  }
  
  steps.push({
    arr: getArr().length > 0 ? getArr() : [0], // fallback if empty
    pivot: -1,
    active: [],
    desc: `Finished reorganizing string! Final result: "${result}".`,
    finished: true
  });
  
  return {
    initialArr: steps[0].arr,
    steps
  };
};
