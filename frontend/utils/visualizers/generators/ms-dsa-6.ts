import { LayoutNode, LayoutEdge, LayoutEngine } from '../layoutEngine';

export const lfuCacheGenerator = (inputStr: string) => {
  let ops: string[] = ["LFUCache","put","put","get","put","get","get"];
  let args: any[][] = [[2],[1,1],[2,2],[1],[3,3],[2],[3]];

  try {
    const lines = inputStr.trim().split('\n');
    if (lines.length >= 2) {
      ops = JSON.parse(lines[0]);
      args = JSON.parse(lines[1]);
    }
  } catch (e) {
    // fallback to defaults if parsing fails
  }

  const steps: any[] = [];
  
  // LFU Cache internal state
  const keyToValFreq = new Map<number, { val: number, freq: number }>();
  const freqToKeys = new Map<number, number[]>(); // array represents doubly linked list
  let minFreq = 0;
  let cap = args[0] ? args[0][0] : 2;

  const getNodesAndEdges = () => {
    const nodes: LayoutNode[] = [];
    const edges: LayoutEdge[] = [];
    
    let yFreq = 100;
    const sortedFreqs = Array.from(freqToKeys.entries()).sort((a,b) => a[0] - b[0]);
    
    for (const [freq, keys] of sortedFreqs) {
      if (keys.length === 0) continue;
      
      const freqNodeId = `freq-${freq}`;
      nodes.push({ 
        id: freqNodeId, 
        label: `Freq ${freq}`, 
        state: freq === minFreq ? 'highlight' : 'normal', 
        x: 100, 
        y: yFreq 
      });
      
      let prevId: string | number = freqNodeId;
      let xKey = 200;
      for (const key of keys) {
        const valFreq = keyToValFreq.get(key);
        const label = valFreq ? `${key}:${valFreq.val}` : `${key}`;
        nodes.push({ 
          id: key, 
          label: label, 
          state: 'normal', 
          x: xKey, 
          y: yFreq 
        });
        edges.push({ from: prevId, to: key });
        prevId = key;
        xKey += 80;
      }
      yFreq += 70;
    }
    
    return { nodes, edges };
  };

  const snapshot = (desc: string) => {
    const { nodes, edges } = getNodesAndEdges();
    steps.push({
      desc,
      nodesState: Object.fromEntries(nodes.map(n => [n.id, n.state])),
      edgesState: Object.fromEntries(edges.map(e => [`${e.from}-${e.to}`, 'normal'])),
      nodes, // Include nodes with updated positions
      edges,
    });
  };

  snapshot(`Initialize LFU Cache with capacity ${cap}`);

  for (let i = 1; i < ops.length; i++) {
    const op = ops[i];
    const arg = args[i];

    if (op === 'put') {
      const key = arg[0];
      const value = arg[1];
      
      if (cap <= 0) {
        snapshot(`Put (${key}, ${value}) ignored due to capacity 0`);
        continue;
      }

      if (keyToValFreq.has(key)) {
        // Update existing key
        const oldFreq = keyToValFreq.get(key)!.freq;
        keyToValFreq.set(key, { val: value, freq: oldFreq + 1 });
        
        // Remove from old freq bucket
        const list = freqToKeys.get(oldFreq)!;
        freqToKeys.set(oldFreq, list.filter(k => k !== key));
        if (freqToKeys.get(oldFreq)!.length === 0) {
           freqToKeys.delete(oldFreq);
           if (minFreq === oldFreq) {
             minFreq += 1;
           }
        }
        
        // Add to new freq bucket (append to end as most recently used)
        if (!freqToKeys.has(oldFreq + 1)) freqToKeys.set(oldFreq + 1, []);
        freqToKeys.get(oldFreq + 1)!.push(key);

        snapshot(`Put (${key}, ${value}): updated existing key, moved to frequency ${oldFreq + 1}`);
      } else {
        // Add new key
        if (keyToValFreq.size >= cap) {
           // Evict least frequently used, least recently used
           const list = freqToKeys.get(minFreq)!;
           const evictKey = list[0]; 
           list.shift(); // remove from start
           keyToValFreq.delete(evictKey);
           
           if (list.length === 0) {
              freqToKeys.delete(minFreq);
           }
           snapshot(`Put (${key}, ${value}): Capacity reached. Evicted LRU key ${evictKey} from frequency ${minFreq}`);
        }
        
        keyToValFreq.set(key, { val: value, freq: 1 });
        if (!freqToKeys.has(1)) freqToKeys.set(1, []);
        freqToKeys.get(1)!.push(key);
        minFreq = 1;
        snapshot(`Put (${key}, ${value}): Added new key with frequency 1`);
      }
    } else if (op === 'get') {
      const key = arg[0];
      if (!keyToValFreq.has(key)) {
        snapshot(`Get (${key}): Key not found (returned -1)`);
      } else {
        const { val, freq } = keyToValFreq.get(key)!;
        
        // Update frequency
        keyToValFreq.set(key, { val, freq: freq + 1 });
        
        // Remove from old freq bucket
        const list = freqToKeys.get(freq)!;
        freqToKeys.set(freq, list.filter(k => k !== key));
        if (freqToKeys.get(freq)!.length === 0) {
           freqToKeys.delete(freq);
           if (minFreq === freq) {
             minFreq += 1;
           }
        }
        
        // Add to new freq bucket
        if (!freqToKeys.has(freq + 1)) freqToKeys.set(freq + 1, []);
        freqToKeys.get(freq + 1)!.push(key);

        snapshot(`Get (${key}): Found value ${val}. Moved to frequency ${freq + 1}`);
      }
    }
  }

  const { nodes, edges } = getNodesAndEdges();
  return { nodes, edges, steps };
};
