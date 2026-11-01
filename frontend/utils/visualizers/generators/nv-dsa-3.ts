import { LayoutNode, LayoutEdge } from '../layoutEngine';

export const numberOfIslandsIIGenerator = (inputStr: string) => {
  // Parse input
  let m = 3, n = 3;
  let positions: number[][] = [[0, 0], [0, 1], [1, 2], [2, 1]];

  try {
    const mMatch = inputStr.match(/m\s*=\s*(\d+)/);
    if (mMatch) m = parseInt(mMatch[1], 10);
    const nMatch = inputStr.match(/n\s*=\s*(\d+)/);
    if (nMatch) n = parseInt(nMatch[1], 10);
    const posMatch = inputStr.match(/positions\s*=\s*(\[\[.*?\]\])/);
    if (posMatch) {
      positions = JSON.parse(posMatch[1]);
    }
  } catch (e) {
    // fallback
  }

  const steps: any[] = [];
  
  // Create all grid nodes upfront for steady layout
  const nodes: LayoutNode[] = [];
  const spacing = 60;
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      nodes.push({
        id: `${r},${c}`,
        label: `${r},${c}`,
        x: 50 + c * spacing,
        y: 50 + r * spacing,
        state: 'hidden'
      });
    }
  }

  // We only track edges added by Union operations
  const edges: LayoutEdge[] = [];
  
  // State maps
  const parent = new Map<string, string>();
  const rank = new Map<string, number>();
  let count = 0;
  const grid = new Set<string>(); // "land" cells

  function find(i: string): string {
    if (parent.get(i) === i) {
      return i;
    }
    const p = find(parent.get(i)!);
    parent.set(i, p); // path compression
    return p;
  }

  function union(i: string, j: string, edgesList: LayoutEdge[]): boolean {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI !== rootJ) {
      const rankI = rank.get(rootI)!;
      const rankJ = rank.get(rootJ)!;
      
      if (rankI < rankJ) {
        parent.set(rootI, rootJ);
      } else if (rankI > rankJ) {
        parent.set(rootJ, rootI);
      } else {
        parent.set(rootJ, rootI);
        rank.set(rootI, rankI + 1);
      }
      count--;
      edgesList.push({ from: i, to: j }); // visualize the union
      return true;
    }
    return false;
  }

  const getNodesState = (highlightNode: string | null = null, processingNodes: string[] = []) => {
    const state: Record<string, string> = {};
    nodes.forEach(n => {
      if (!grid.has(n.id as string)) {
        state[n.id as string] = 'hidden';
      } else {
        state[n.id as string] = 'normal';
      }
    });
    if (highlightNode && state[highlightNode]) {
      state[highlightNode] = 'processing';
    }
    processingNodes.forEach(n => {
      if (state[n]) state[n] = 'processing';
    });
    return state;
  };

  const getEdgesState = (highlightEdges: string[] = []) => {
    const state: Record<string, string> = {};
    edges.forEach(e => {
      state[`${e.from}-${e.to}`] = 'normal';
    });
    highlightEdges.forEach(eid => {
      state[eid] = 'processing';
    });
    return state;
  };

  steps.push({
    desc: `Initial empty grid of size ${m}x${n}.`,
    nodesState: getNodesState(),
    edgesState: getEdgesState(),
    highlightNode: null,
    count: count
  });

  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  for (let i = 0; i < positions.length; i++) {
    const [r, c] = positions[i];
    const id = `${r},${c}`;
    
    if (grid.has(id)) {
      steps.push({
        desc: `Position (${r}, ${c}) is already land. Total islands: ${count}.`,
        nodesState: getNodesState(id),
        edgesState: getEdgesState(),
        highlightNode: id,
        count: count
      });
      continue;
    }
    
    // Add land
    grid.add(id);
    parent.set(id, id);
    rank.set(id, 0);
    count++;
    
    steps.push({
      desc: `Adding land at (${r}, ${c}). New island created. Total islands: ${count}.`,
      nodesState: getNodesState(id),
      edgesState: getEdgesState(),
      highlightNode: id,
      count: count
    });
    
    // Check neighbors
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      const nid = `${nr},${nc}`;
      
      if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid.has(nid)) {
        steps.push({
          desc: `Checking neighbor (${nr}, ${nc}) of (${r}, ${c}). It is land!`,
          nodesState: getNodesState(null, [id, nid]),
          edgesState: getEdgesState(),
          highlightNode: null,
          count: count
        });

        const root1 = find(id);
        const root2 = find(nid);
        
        if (root1 !== root2) {
          const oldEdgesLen = edges.length;
          union(id, nid, edges);
          // the edge could be {id}-{nid} or {nid}-{id} depending on how rank works. But we added {from: i, to: j} in union.
          const addedEdge = edges[edges.length - 1];
          const newEdgeId = `${addedEdge.from}-${addedEdge.to}`;
          steps.push({
            desc: `Union components of (${r}, ${c}) and (${nr}, ${nc}). Total islands: ${count}.`,
            nodesState: getNodesState(null, [id, nid]),
            edgesState: getEdgesState([newEdgeId]), // highlight new edge
            highlightNode: null,
            count: count
          });
        } else {
          steps.push({
            desc: `(${r}, ${c}) and (${nr}, ${nc}) are already in the same component.`,
            nodesState: getNodesState(null, [id, nid]),
            edgesState: getEdgesState(),
            highlightNode: null,
            count: count
          });
        }
      }
    }
    
    steps.push({
      desc: `Finished processing position (${r}, ${c}). Total islands: ${count}.`,
      nodesState: getNodesState(),
      edgesState: getEdgesState(),
      highlightNode: null,
      count: count
    });
  }

  // Mark finished in the last step
  if (steps.length > 0) {
    steps[steps.length - 1].finished = true;
  }

  return { nodes, edges, steps };
};
