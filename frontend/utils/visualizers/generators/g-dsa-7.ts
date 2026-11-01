import { LayoutEngine, LayoutNode, LayoutEdge } from '../layoutEngine';

export const courseScheduleIIGenerator = (inputStr: string) => {
  // Parse input
  // Default: 'numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]'
  let numCourses = 4;
  let prerequisites = [[1,0],[2,0],[3,1],[3,2]];
  
  try {
    const coursesMatch = inputStr.match(/numCourses\s*=\s*(\d+)/);
    if (coursesMatch) {
      numCourses = parseInt(coursesMatch[1], 10);
    }
    const prereqMatch = inputStr.match(/prerequisites\s*=\s*(\[\[.*?\]\])/);
    if (prereqMatch) {
      prerequisites = JSON.parse(prereqMatch[1]);
    }
  } catch (e) {
    // fallback
  }

  const steps: any[] = [];
  const nodesMap = new Map<number, LayoutNode>();
  const edgesMap = new Map<string, LayoutEdge>();

  // 1. Init nodes
  for (let i = 0; i < numCourses; i++) {
    nodesMap.set(i, { id: i.toString(), label: i.toString(), state: 'normal' });
  }

  const nodes = Array.from(nodesMap.values());
  const edges: LayoutEdge[] = [];

  steps.push({
    desc: `Initialized graph with ${numCourses} courses (nodes 0 to ${numCourses - 1}).`,
    nodesState: Object.fromEntries(nodes.map(n => [n.id, 'normal'])),
    edgesState: {},
    queue: [],
    highlightNode: null
  });

  // 2. Build graph and compute in-degrees
  const inDegree = new Map<number, number>();
  const adj = new Map<number, number[]>();
  for (let i = 0; i < numCourses; i++) {
    inDegree.set(i, 0);
    adj.set(i, []);
  }

  for (const [course, prereq] of prerequisites) {
    adj.get(prereq)!.push(course);
    inDegree.set(course, inDegree.get(course)! + 1);
    const edgeId = `${prereq}-${course}`;
    
    // Add only if edge doesn't already exist to avoid duplicates
    if (!edgesMap.has(edgeId)) {
      edges.push({ from: prereq.toString(), to: course.toString() });
      edgesMap.set(edgeId, { from: prereq.toString(), to: course.toString() });
      
      steps.push({
        desc: `Added prerequisite: Course ${prereq} -> Course ${course}. In-degree of ${course} becomes ${inDegree.get(course)}.`,
        nodesState: Object.fromEntries(nodes.map(n => [n.id, 'normal'])),
        edgesState: { [edgeId]: 'processing' },
        queue: [],
        highlightNode: null
      });
    }
  }

  // 3. Kahn's Topological Sort
  const queue: number[] = [];
  inDegree.forEach((deg, course) => {
    if (deg === 0) queue.push(course);
  });

  steps.push({
    desc: `Computed in-degrees for all courses. Courses with 0 in-degree (no prerequisites): [${queue.join(', ')}]. Adding to queue.`,
    nodesState: Object.fromEntries(nodes.map(n => [n.id, queue.includes(parseInt(n.id as string)) ? 'processing' : 'normal'])),
    edgesState: Object.fromEntries(edges.map(e => [`${e.from}-${e.to}`, 'normal'])),
    queue: [...queue],
    highlightNode: null
  });

  const order: number[] = [];
  const processedEdges = new Set<string>();

  while (queue.length > 0) {
    const course = queue.shift()!;
    order.push(course);

    const stepNodesState = Object.fromEntries(nodes.map(n => {
      const nid = parseInt(n.id as string);
      return [n.id, order.includes(nid) ? 'processed' : 'normal'];
    }));
    stepNodesState[course.toString()] = 'processing';

    steps.push({
      desc: `Processing course ${course}. Removing from queue and adding to order.`,
      nodesState: { ...stepNodesState },
      edgesState: Object.fromEntries(edges.map(e => [`${e.from}-${e.to}`, processedEdges.has(`${e.from}-${e.to}`) ? 'processed' : 'normal'])),
      queue: [...queue],
      highlightNode: course.toString()
    });

    const neighbors = adj.get(course) || [];
    for (const neighbor of neighbors) {
      inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
      const edgeId = `${course}-${neighbor}`;
      processedEdges.add(edgeId);

      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
        steps.push({
          desc: `Traversed edge ${course} -> ${neighbor}. In-degree of ${neighbor} is now 0. Added to queue.`,
          nodesState: { ...stepNodesState },
          edgesState: Object.fromEntries(edges.map(e => {
             const eid = `${e.from}-${e.to}`;
             if (eid === edgeId) return [eid, 'processing'];
             return [eid, processedEdges.has(eid) ? 'processed' : 'normal'];
          })),
          queue: [...queue],
          highlightNode: neighbor.toString()
        });
      } else {
        steps.push({
          desc: `Traversed edge ${course} -> ${neighbor}. In-degree of ${neighbor} decreased to ${inDegree.get(neighbor)}.`,
          nodesState: { ...stepNodesState },
          edgesState: Object.fromEntries(edges.map(e => {
             const eid = `${e.from}-${e.to}`;
             if (eid === edgeId) return [eid, 'processing'];
             return [eid, processedEdges.has(eid) ? 'processed' : 'normal'];
          })),
          queue: [...queue],
          highlightNode: neighbor.toString()
        });
      }
    }
  }

  if (order.length !== numCourses) {
    steps.push({
      desc: `Cycle detected! Only processed ${order.length}/${numCourses} courses. Cannot finish all courses.`,
      nodesState: Object.fromEntries(nodes.map(n => [n.id, 'error'])),
      edgesState: Object.fromEntries(edges.map(e => [`${e.from}-${e.to}`, 'error'])),
      queue: [],
      highlightNode: null,
      finished: true
    });
  } else {
    steps.push({
      desc: `Topological sort complete! Valid course order: [${order.join(', ')}].`,
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
