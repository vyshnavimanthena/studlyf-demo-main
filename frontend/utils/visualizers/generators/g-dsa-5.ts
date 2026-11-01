import { LayoutNode, LayoutEdge } from '../layoutEngine';

export const longestIncreasingPathGenerator = (inputStr: string) => {
  let matrix = [
    [9, 9, 4],
    [6, 6, 8],
    [2, 1, 1]
  ];

  try {
    const match = inputStr.match(/matrix\s*=\s*(\[\[.*?\]\])/);
    if (match) {
      matrix = JSON.parse(match[1]);
    } else {
      const parsed = JSON.parse(inputStr.replace(/'/g, '"'));
      if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
        matrix = parsed;
      }
    }
  } catch (e) {
    // fallback to default matrix
  }

  if (!matrix || matrix.length === 0 || !matrix[0]) {
    return { nodes: [], edges: [], steps: [{ desc: 'Empty matrix.', finished: true }] };
  }

  const rows = matrix.length;
  const cols = matrix[0].length;

  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];
  const spacing = 80;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      nodes.push({
        id: `${r},${c}`,
        label: `${matrix[r][c]}`,
        x: 50 + c * spacing,
        y: 50 + r * spacing,
        state: 'normal'
      });
    }
  }

  const steps: any[] = [];
  const memo: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  const addedEdges = new Set<string>();
  const currentEdgesState: Record<string, string> = {};

  const getNodesState = (active: string | null = null, exploring: string[] = []) => {
    const state: Record<string, string> = {};
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const id = `${r},${c}`;
        if (memo[r][c] > 0) {
          state[id] = 'processed';
        } else {
          state[id] = 'normal';
        }
      }
    }
    for (const e of exploring) {
      state[e] = 'processing';
    }
    if (active) {
      state[active] = 'highlight'; // We use highlight for the current active node
    }
    return state;
  };

  steps.push({
    desc: `Initialized ${rows}x${cols} matrix. We will run DFS with memoization from each cell to find the longest increasing path.`,
    nodesState: getNodesState(),
    edgesState: { ...currentEdgesState },
  });

  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  let longest = 0;

  const dfs = (r: number, c: number, prevVal: number, pathNodes: string[], pathEdges: string[]): number => {
    const id = `${r},${c}`;
    
    if (memo[r][c] !== 0) {
      steps.push({
        desc: `Cell (${r},${c}) has value ${matrix[r][c]}. It is already memoized with max path length ${memo[r][c]}.`,
        nodesState: getNodesState(id, pathNodes),
        edgesState: { ...currentEdgesState },
      });
      return memo[r][c];
    }

    steps.push({
      desc: `Exploring cell (${r},${c}) with value ${matrix[r][c]}.`,
      nodesState: getNodesState(id, pathNodes),
      edgesState: { ...currentEdgesState },
    });

    let maxPath = 0;

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        if (matrix[nr][nc] > matrix[r][c]) {
          const nid = `${nr},${nc}`;
          const eid = `${id}-${nid}`;
          
          if (!addedEdges.has(eid)) {
            addedEdges.add(eid);
            edges.push({ from: id, to: nid });
            currentEdgesState[eid] = 'normal';
          }
          
          const prevEdgeState = currentEdgesState[eid];
          currentEdgesState[eid] = 'processing';
          
          steps.push({
            desc: `From (${r},${c}), moving to strictly increasing neighbor (${nr},${nc}) with value ${matrix[nr][nc]}.`,
            nodesState: getNodesState(nid, [...pathNodes, id]),
            edgesState: { ...currentEdgesState },
          });
          
          const pathLen = dfs(nr, nc, matrix[r][c], [...pathNodes, id], [...pathEdges, eid]);
          maxPath = Math.max(maxPath, pathLen);
          
          currentEdgesState[eid] = prevEdgeState;
          
          steps.push({
            desc: `Backtracking to (${r},${c}) from (${nr},${nc}). Current max path from (${r},${c}) is ${maxPath}.`,
            nodesState: getNodesState(id, pathNodes),
            edgesState: { ...currentEdgesState },
          });
        }
      }
    }

    memo[r][c] = maxPath + 1;

    steps.push({
      desc: `Finished exploring (${r},${c}). Longest path from here is ${memo[r][c]}. Saving to memo.`,
      nodesState: getNodesState(null, pathNodes),
      edgesState: { ...currentEdgesState },
    });

    return memo[r][c];
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (memo[r][c] === 0) {
         steps.push({
           desc: `Starting DFS from (${r},${c}) with value ${matrix[r][c]}.`,
           nodesState: getNodesState(`${r},${c}`),
           edgesState: { ...currentEdgesState },
         });
         const len = dfs(r, c, -Infinity, [], []);
         longest = Math.max(longest, len);
      }
    }
  }

  steps.push({
    desc: `DFS complete. The longest increasing path in the matrix has length ${longest}.`,
    nodesState: getNodesState(),
    edgesState: { ...currentEdgesState },
    finished: true
  });

  return { nodes, edges, steps };
};
