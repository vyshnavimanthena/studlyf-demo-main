import { LayoutEngine, LayoutNode, LayoutEdge } from '../layoutEngine';

export const cloneGraphGenerator = (inputStr: string) => {
  // Default adjList for amz-dsa-4
  let adjList: number[][] = [[2, 4], [1, 3], [2, 4], [1, 3]];
  
  try {
    const match = inputStr.match(/\[\[(.*?)\]\]/);
    if (match) {
      adjList = JSON.parse(`[[${match[1]}]]`);
    } else {
        const parsed = JSON.parse(inputStr);
        if (Array.isArray(parsed) && (parsed.length === 0 || Array.isArray(parsed[0]))) {
            adjList = parsed;
        }
    }
  } catch (e) {
    // fallback to default
  }

  const steps: any[] = [];
  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];

  // Init nodes (1-indexed based on standard LeetCode clone graph representation)
  for (let i = 0; i < adjList.length; i++) {
    const id = (i + 1).toString();
    nodes.push({ id, label: id, state: 'normal' });
  }

  // Init undirected edges
  const addedEdges = new Set<string>();
  for (let i = 0; i < adjList.length; i++) {
    const u = (i + 1).toString();
    for (const vNum of adjList[i]) {
      const v = vNum.toString();
      const edgeId1 = `${u}-${v}`;
      const edgeId2 = `${v}-${u}`;
      
      if (!addedEdges.has(edgeId1) && !addedEdges.has(edgeId2)) {
        edges.push({ from: u, to: v });
        addedEdges.add(edgeId1);
      }
    }
  }

  steps.push({
    desc: `Initialized original graph with ${nodes.length} nodes. Ready to clone.`,
    nodesState: Object.fromEntries(nodes.map(n => [n.id, 'normal'])),
    edgesState: Object.fromEntries(edges.map(e => [`${e.from}-${e.to}`, 'normal'])),
    queue: [],
    highlightNode: null
  });

  if (nodes.length === 0) {
      steps.push({
        desc: `Graph is empty. Cloned graph is also empty.`,
        nodesState: {},
        edgesState: {},
        queue: [],
        highlightNode: null,
        finished: true
      });
      return { nodes, edges, steps };
  }

  const visited = new Set<string>();
  const queue: string[] = [];
  const startNode = '1';
  
  visited.add(startNode);
  queue.push(startNode);

  steps.push({
    desc: `Created clone for node ${startNode}. Added node ${startNode} to queue.`,
    nodesState: { ...Object.fromEntries(nodes.map(n => [n.id, 'normal'])), [startNode]: 'processed' },
    edgesState: Object.fromEntries(edges.map(e => [`${e.from}-${e.to}`, 'normal'])),
    queue: [...queue],
    highlightNode: startNode
  });

  const processedEdges = new Set<string>();
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    steps.push({
      desc: `Dequeue node ${current}. Processing its neighbors.`,
      nodesState: { ...Object.fromEntries(nodes.map(n => [n.id, visited.has(n.id as string) ? 'processed' : 'normal'])), [current]: 'processing' },
      edgesState: Object.fromEntries(edges.map(e => {
        const id = `${e.from}-${e.to}`;
        return [id, processedEdges.has(id) ? 'processed' : 'normal'];
      })),
      queue: [...queue],
      highlightNode: current
    });

    const currentIdx = parseInt(current) - 1;
    const neighbors = adjList[currentIdx] || [];

    for (const neighborNum of neighbors) {
      const neighbor = neighborNum.toString();
      
      const edge = edges.find(e => (e.from === current && e.to === neighbor) || (e.from === neighbor && e.to === current));
      const eId = edge ? `${edge.from}-${edge.to}` : '';

      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
        
        steps.push({
          desc: `Neighbor ${neighbor} not visited yet. Created clone for ${neighbor}, linked it to ${current}, and added to queue.`,
          nodesState: { ...Object.fromEntries(nodes.map(n => [n.id, visited.has(n.id as string) ? 'processed' : 'normal'])), [current]: 'processing', [neighbor]: 'processing' },
          edgesState: { ...Object.fromEntries(edges.map(e => {
            const id = `${e.from}-${e.to}`;
            return [id, processedEdges.has(id) ? 'processed' : 'normal'];
          })), [eId]: 'processing' },
          queue: [...queue],
          highlightNode: neighbor
        });
      } else {
          steps.push({
          desc: `Neighbor ${neighbor} already visited. Linked cloned node ${current} to cloned node ${neighbor}.`,
          nodesState: { ...Object.fromEntries(nodes.map(n => [n.id, visited.has(n.id as string) ? 'processed' : 'normal'])), [current]: 'processing' },
          edgesState: { ...Object.fromEntries(edges.map(e => {
            const id = `${e.from}-${e.to}`;
            return [id, processedEdges.has(id) ? 'processed' : 'normal'];
          })), [eId]: 'processing' },
          queue: [...queue],
          highlightNode: neighbor
        });
      }
      
      if (eId) {
          processedEdges.add(eId);
      }
    }
  }

  steps.push({
    desc: `Graph cloned successfully! All nodes and edges copied deep-linked.`,
    nodesState: Object.fromEntries(nodes.map(n => [n.id, 'processed'])),
    edgesState: Object.fromEntries(edges.map(e => [`${e.from}-${e.to}`, 'processed'])),
    queue: [],
    highlightNode: null,
    finished: true
  });

  const layoutedNodes = LayoutEngine.generateForceDirectedLayout(nodes, edges);

  return {
    nodes: layoutedNodes,
    edges,
    steps
  };
};
