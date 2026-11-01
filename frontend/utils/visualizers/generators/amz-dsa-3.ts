import { LayoutEngine, LayoutNode, LayoutEdge } from '../layoutEngine';

export const courseScheduleGenerator = (inputStr: string) => {
  // Default parsing
  let numCourses = 2;
  let prerequisites: [number, number][] = [[1,0]];

  try {
    const numMatch = inputStr.match(/numCourses\s*=\s*(\d+)/);
    if (numMatch) {
      numCourses = parseInt(numMatch[1], 10);
    }
    const preMatch = inputStr.match(/prerequisites\s*=\s*(\[\[.*?\]\])/);
    if (preMatch) {
      prerequisites = JSON.parse(preMatch[1]);
    }
  } catch (e) {
    // fallback
  }

  const steps: any[] = [];
  const nodesMap = new Map<string, LayoutNode>();
  const edgesMap = new Map<string, LayoutEdge>();
  const edges: LayoutEdge[] = [];

  // 1. Init nodes
  for (let i = 0; i < numCourses; i++) {
    const id = i.toString();
    nodesMap.set(id, { id, label: id, state: 'normal' });
  }

  const nodes = Array.from(nodesMap.values());

  steps.push({
    desc: `Initialized ${numCourses} course nodes: [${nodes.map(n => n.id).join(', ')}].`,
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

  for (const [course, prereq] of prerequisites) {
    const u = prereq.toString();
    const v = course.toString();
    if (!nodesMap.has(u) || !nodesMap.has(v)) continue;

    adj.get(u)!.push(v);
    inDegree.set(v, inDegree.get(v)! + 1);
    
    const edgeId = `${u}-${v}`;
    edges.push({ from: u, to: v });
    edgesMap.set(edgeId, { from: u, to: v });

    steps.push({
      desc: `Added prerequisite edge: ${u} -> ${v} (Course ${v} requires ${u}).`,
      nodesState: Object.fromEntries(nodes.map(n => [n.id, 'normal'])),
      edgesState: { [edgeId]: 'processing' },
      queue: [],
      highlightNode: null
    });
  }

  // 3. Kahn's Topological Sort
  const queue: string[] = [];
  inDegree.forEach((deg, nodeStr) => {
    if (deg === 0) queue.push(nodeStr);
  });

  steps.push({
    desc: `Computed in-degrees. Courses with 0 prerequisites: [${queue.join(', ')}]. Adding to queue.`,
    nodesState: Object.fromEntries(nodes.map(n => [n.id, queue.includes(n.id as string) ? 'processing' : 'normal'])),
    edgesState: Object.fromEntries(edges.map(e => [`${e.from}-${e.to}`, 'normal'])),
    queue: [...queue],
    highlightNode: null
  });

  let completed = 0;
  const processedEdges = new Set<string>();
  const processedNodes = new Set<string>();

  while (queue.length > 0) {
    const node = queue.shift()!;
    completed += 1;
    processedNodes.add(node);

    const stepNodesState = Object.fromEntries(nodes.map(n => [n.id, processedNodes.has(n.id as string) ? 'processed' : 'normal']));
    stepNodesState[node] = 'processing';

    steps.push({
      desc: `Processing course ${node}. Removing from queue and marking as completed. Total completed: ${completed}.`,
      nodesState: { ...stepNodesState },
      edgesState: Object.fromEntries(edges.map(e => [`${e.from}-${e.to}`, processedEdges.has(`${e.from}-${e.to}`) ? 'processed' : 'normal'])),
      queue: [...queue],
      highlightNode: node
    });

    const neighbors = adj.get(node) || [];
    for (const neighbor of neighbors) {
      inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
      const edgeId = `${node}-${neighbor}`;
      processedEdges.add(edgeId);

      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
        steps.push({
          desc: `Traversed edge ${node} -> ${neighbor}. Remaining prerequisites of ${neighbor} is now 0. Added to queue.`,
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
          desc: `Traversed edge ${node} -> ${neighbor}. Remaining prerequisites of ${neighbor} decreased to ${inDegree.get(neighbor)}.`,
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
    
    // Mark processing node as processed
    stepNodesState[node] = 'processed';
  }

  if (completed !== numCourses) {
    steps.push({
      desc: `Cycle detected! Only completed ${completed}/${numCourses} courses. Cannot finish all courses.`,
      nodesState: Object.fromEntries(nodes.map(n => [n.id, processedNodes.has(n.id as string) ? 'processed' : 'error'])),
      edgesState: Object.fromEntries(edges.map(e => {
         const eid = `${e.from}-${e.to}`;
         return [eid, processedEdges.has(eid) ? 'processed' : 'error'];
      })),
      queue: [],
      highlightNode: null,
      finished: true
    });
  } else {
    steps.push({
      desc: `Successfully completed all ${numCourses} courses!`,
      nodesState: Object.fromEntries(nodes.map(n => [n.id, 'processed'])),
      edgesState: Object.fromEntries(edges.map(e => [`${e.from}-${e.to}`, 'processed'])),
      queue: [],
      highlightNode: null,
      finished: true
    });
  }

  const layoutedNodes = LayoutEngine.generateForceDirectedLayout(nodes, edges);

  return {
    nodes: layoutedNodes,
    edges,
    steps
  };
};
