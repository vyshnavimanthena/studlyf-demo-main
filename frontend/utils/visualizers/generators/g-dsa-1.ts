import { LayoutEngine, LayoutNode, LayoutEdge } from '../layoutEngine';

export const alienDictionaryGenerator = (inputStr: string) => {
  // Parse input
  // Default: 'words = ["wrt","wrf","er","ett","rftt"]'
  let words = ["wrt", "wrf", "er", "ett", "rftt"];
  try {
    const match = inputStr.match(/\[(.*?)\]/);
    if (match) {
      words = match[1].split(',').map(s => s.replace(/['"\s]/g, ''));
    }
  } catch (e) {
    // fallback
  }

  const steps: any[] = [];
  const nodesMap = new Map<string, LayoutNode>();
  const edgesMap = new Map<string, LayoutEdge>();

  // 1. Init nodes
  for (const word of words) {
    for (const char of word) {
      if (!nodesMap.has(char)) {
        nodesMap.set(char, { id: char, label: char, state: 'normal' });
      }
    }
  }

  const nodes = Array.from(nodesMap.values());
  const edges: LayoutEdge[] = [];

  steps.push({
    desc: `Extracted unique characters from words array: [${nodes.map(n => n.id).join(', ')}].`,
    nodesState: Object.fromEntries(nodes.map(n => [n.id, 'normal'])),
    edgesState: {},
    queue: [],
    highlightNode: null
  });

  // 2. Build graph
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();
  nodes.forEach(n => {
    inDegree.set(n.id as string, 0);
    adj.set(n.id as string, []);
  });

  let cycleDetected = false;
  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i];
    const w2 = words[i + 1];
    const minLen = Math.min(w1.length, w2.length);

    if (w1.length > w2.length && w1.startsWith(w2)) {
      cycleDetected = true;
      steps.push({
        desc: `Invalid dictionary! '${w1}' is longer than '${w2}' but comes first.`,
        nodesState: Object.fromEntries(nodes.map(n => [n.id, 'error'])),
        edgesState: {},
        queue: [],
        highlightNode: null,
        finished: true
      });
      break;
    }

    for (let j = 0; j < minLen; j++) {
      if (w1[j] !== w2[j]) {
        const u = w1[j];
        const v = w2[j];
        if (!adj.get(u)!.includes(v)) {
          adj.get(u)!.push(v);
          inDegree.set(v, inDegree.get(v)! + 1);
          const edgeId = `${u}-${v}`;
          edges.push({ from: u, to: v });
          edgesMap.set(edgeId, { from: u, to: v });
          
          steps.push({
            desc: `Found differing characters '${u}' and '${v}' between "${w1}" and "${w2}". Adding directed edge ${u} -> ${v}.`,
            nodesState: Object.fromEntries(nodes.map(n => [n.id, 'normal'])),
            edgesState: { [edgeId]: 'processing' },
            queue: [],
            highlightNode: null
          });
        }
        break;
      }
    }
  }

  if (cycleDetected) {
    const layoutedNodes = LayoutEngine.generateForceDirectedLayout(nodes, edges);
    return { nodes: layoutedNodes, edges, steps };
  }

  // 3. Kahn's Topological Sort
  const queue: string[] = [];
  inDegree.forEach((deg, char) => {
    if (deg === 0) queue.push(char);
  });

  steps.push({
    desc: `Computed in-degrees. Characters with 0 in-degree: [${queue.join(', ')}]. Adding to queue.`,
    nodesState: Object.fromEntries(nodes.map(n => [n.id, queue.includes(n.id as string) ? 'processing' : 'normal'])),
    edgesState: Object.fromEntries(edges.map(e => [`${e.from}-${e.to}`, 'normal'])),
    queue: [...queue],
    highlightNode: null
  });

  const order: string[] = [];
  const processedEdges = new Set<string>();

  while (queue.length > 0) {
    const char = queue.shift()!;
    order.push(char);

    const stepNodesState = Object.fromEntries(nodes.map(n => [n.id, order.includes(n.id as string) ? 'processed' : 'normal']));
    stepNodesState[char] = 'processing';

    steps.push({
      desc: `Processing character '${char}'. Removing from queue and adding to order.`,
      nodesState: { ...stepNodesState },
      edgesState: Object.fromEntries(edges.map(e => [`${e.from}-${e.to}`, processedEdges.has(`${e.from}-${e.to}`) ? 'processed' : 'normal'])),
      queue: [...queue],
      highlightNode: char
    });

    const neighbors = adj.get(char) || [];
    for (const neighbor of neighbors) {
      inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
      const edgeId = `${char}-${neighbor}`;
      processedEdges.add(edgeId);

      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
        steps.push({
          desc: `Traversed edge ${char} -> ${neighbor}. In-degree of '${neighbor}' is now 0. Added to queue.`,
          nodesState: { ...stepNodesState },
          edgesState: Object.fromEntries(edges.map(e => {
             const eid = `${e.from}-${e.to}`;
             if (eid === edgeId) return [eid, 'processing'];
             return [eid, processedEdges.has(eid) ? 'processed' : 'normal'];
          })),
          queue: [...queue],
          highlightNode: neighbor
        });
      } else {
        steps.push({
          desc: `Traversed edge ${char} -> ${neighbor}. In-degree of '${neighbor}' decreased to ${inDegree.get(neighbor)}.`,
          nodesState: { ...stepNodesState },
          edgesState: Object.fromEntries(edges.map(e => {
             const eid = `${e.from}-${e.to}`;
             if (eid === edgeId) return [eid, 'processing'];
             return [eid, processedEdges.has(eid) ? 'processed' : 'normal'];
          })),
          queue: [...queue],
          highlightNode: neighbor
        });
      }
    }
  }

  if (order.length !== nodes.length) {
    steps.push({
      desc: `Cycle detected! Only processed ${order.length}/${nodes.length} characters. Valid dictionary impossible.`,
      nodesState: Object.fromEntries(nodes.map(n => [n.id, 'error'])),
      edgesState: Object.fromEntries(edges.map(e => [`${e.from}-${e.to}`, 'error'])),
      queue: [],
      highlightNode: null,
      finished: true
    });
  } else {
    steps.push({
      desc: `Topological sort complete! Valid ordering: "${order.join('')}".`,
      nodesState: Object.fromEntries(nodes.map(n => [n.id, 'processed'])),
      edgesState: Object.fromEntries(edges.map(e => [`${e.from}-${e.to}`, 'processed'])),
      queue: [],
      highlightNode: null,
      finished: true
    });
  }

  // Calculate dynamic force-directed layout instead of dummy positions
  const layoutedNodes = LayoutEngine.generateForceDirectedLayout(nodes, edges);

  return {
    nodes: layoutedNodes,
    edges,
    steps
  };
};
