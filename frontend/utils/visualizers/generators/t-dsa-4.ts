export const mincostToHireWorkersGenerator = (input: string) => {
  let quality = [10, 20, 5];
  let wage = [70, 50, 30];
  let k = 2;
  
  try {
    const qMatch = input.match(/quality\s*=\s*\[(.*?)\]/);
    if (qMatch) {
      quality = qMatch[1].split(',').map(s => Number(s.trim()));
    }
    const wMatch = input.match(/wage\s*=\s*\[(.*?)\]/);
    if (wMatch) {
      wage = wMatch[1].split(',').map(s => Number(s.trim()));
    }
    const kMatch = input.match(/k\s*=\s*(\d+)/);
    if (kMatch) {
      k = Number(kMatch[1]);
    }
  } catch (e) {}

  const steps: any[] = [];
  
  let workers = quality.map((q, i) => ({
    q,
    w: wage[i],
    ratio: Number((wage[i] / q).toFixed(2)),
    originalIdx: i
  }));
  
  const getArr = () => workers.map(w => w.ratio);
  
  steps.push({
    arr: getArr(),
    pivot: -1,
    active: [-1, -1],
    desc: `Initial array of wage/quality ratios. We need to hire ${k} workers.`
  });

  // Bubble sort to visualize sorting the workers by ratio
  for (let i = 0; i < workers.length - 1; i++) {
    for (let j = 0; j < workers.length - i - 1; j++) {
      steps.push({
        arr: getArr(),
        pivot: j + 1,
        active: [j, j + 1],
        desc: `Comparing ratios ${workers[j].ratio} and ${workers[j+1].ratio} to sort in ascending order.`
      });
      if (workers[j].ratio > workers[j+1].ratio) {
        const temp = workers[j];
        workers[j] = workers[j+1];
        workers[j+1] = temp;
        
        steps.push({
          arr: getArr(),
          pivot: j + 1,
          active: [j, j + 1],
          desc: `Swapped! Ratio ${workers[j].ratio} < ${workers[j+1].ratio}`
        });
      }
    }
  }

  steps.push({
    arr: getArr(),
    pivot: -1,
    active: [-1, -1],
    desc: `Sorted workers by their wage/quality ratio: [${getArr().join(', ')}]. Now we iterate through them.`
  });

  // Max-heap logic
  class MaxHeap {
    heap: number[] = [];
    push(val: number) {
      this.heap.push(val);
      this.heap.sort((a, b) => b - a);
    }
    pop() {
      return this.heap.shift();
    }
    size() {
      return this.heap.length;
    }
  }

  const maxHeap = new MaxHeap();
  let totalQuality = 0;
  let minCost = Infinity;

  for (let i = 0; i < workers.length; i++) {
    const w = workers[i];
    totalQuality += w.q;
    maxHeap.push(w.q);
    
    steps.push({
      arr: getArr(),
      pivot: i,
      active: [i],
      desc: `Processing worker ${i} (ratio ${w.ratio}, quality ${w.q}). Added quality to heap. Total Quality = ${totalQuality}. Heap = [${maxHeap.heap.join(', ')}].`
    });

    if (maxHeap.size() > k) {
      const removed = maxHeap.pop();
      totalQuality -= removed!;
      steps.push({
        arr: getArr(),
        pivot: i,
        active: [i],
        desc: `Heap size exceeds k=${k}. Removed highest quality ${removed} to minimize cost. New Total Quality = ${totalQuality}. Heap = [${maxHeap.heap.join(', ')}].`
      });
    }

    if (maxHeap.size() === k) {
      const cost = w.ratio * totalQuality;
      const prevCost = minCost;
      minCost = Math.min(minCost, cost);
      steps.push({
        arr: getArr(),
        pivot: i,
        active: [i],
        desc: `Valid group of ${k} workers found. Cost = ratio ${w.ratio} * total_quality ${totalQuality} = ${cost.toFixed(2)}. Min Cost updated from ${prevCost === Infinity ? 'Infinity' : prevCost.toFixed(2)} to ${minCost.toFixed(2)}.`
      });
    }
  }

  steps.push({
    arr: getArr(),
    pivot: -1,
    active: [-1, -1],
    desc: `Finished iterating. The minimum cost to hire ${k} workers is ${minCost.toFixed(2)}.`,
    finished: true
  });

  return { initialArr: workers.map(w => w.ratio), steps };
};
