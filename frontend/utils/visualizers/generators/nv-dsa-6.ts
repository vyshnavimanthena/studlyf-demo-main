import { LayoutEngine, LayoutNode, LayoutEdge } from '../layoutEngine';

export const findDuplicateGenerator = (inputStr: string) => {
  let nums = [1, 3, 4, 2, 2];
  try {
    const match = inputStr.match(/\[(.*?)\]/);
    if (match) {
      const parsed = match[1].split(',').map(s => parseInt(s.trim()));
      if (parsed.length > 0 && !parsed.some(isNaN)) {
        nums = parsed;
      }
    }
  } catch (e) {
    // fallback
  }

  const steps: any[] = [];
  const nodesMap = new Map<string, LayoutNode>();
  const edges: LayoutEdge[] = [];

  // Init nodes
  for (let i = 0; i < nums.length; i++) {
    const id = i.toString();
    if (!nodesMap.has(id)) {
      nodesMap.set(id, { id, label: id, state: 'normal' });
    }
  }

  const nodes = Array.from(nodesMap.values());

  // Init edges
  for (let i = 0; i < nums.length; i++) {
    const u = i.toString();
    const v = nums[i].toString();
    edges.push({ from: u, to: v });
  }

  steps.push({
    desc: `Treat array as a directed graph where index i points to nums[i]. nums = [${nums.join(', ')}]`,
    nodesState: Object.fromEntries(nodes.map(n => [n.id, 'normal'])),
    edgesState: Object.fromEntries(edges.map(e => [`${e.from}-${e.to}`, 'normal'])),
    queue: [],
    highlightNode: null
  });

  let slow = nums[0];
  let fast = nums[0];

  steps.push({
    desc: `Initialize slow and fast pointers at nums[0] = ${slow}.`,
    nodesState: Object.fromEntries(nodes.map(n => [n.id, n.id === slow.toString() ? 'processing' : 'normal'])),
    edgesState: Object.fromEntries(edges.map(e => [`${e.from}-${e.to}`, 'normal'])),
    queue: [],
    highlightNode: slow.toString()
  });

  // Phase 1
  while (true) {
    slow = nums[slow];
    fast = nums[nums[fast]];

    const stepNodesState = Object.fromEntries(nodes.map(n => [n.id, 'normal']));
    stepNodesState[slow.toString()] = 'processing';
    stepNodesState[fast.toString()] = 'processing';
    if (slow === fast) {
        stepNodesState[slow.toString()] = 'error'; // Meeting point
    }

    steps.push({
      desc: `Move slow 1 step to ${slow}, fast 2 steps to ${fast}.`,
      nodesState: { ...stepNodesState },
      edgesState: Object.fromEntries(edges.map(e => [`${e.from}-${e.to}`, 'normal'])),
      queue: [],
      highlightNode: null
    });

    if (slow === fast) {
      steps.push({
        desc: `Slow and fast pointers meet at ${slow}. Cycle detected!`,
        nodesState: { ...stepNodesState },
        edgesState: Object.fromEntries(edges.map(e => [`${e.from}-${e.to}`, 'normal'])),
        queue: [],
        highlightNode: slow.toString()
      });
      break;
    }
  }

  // Phase 2
  slow = nums[0];
  steps.push({
    desc: `Phase 2: Reset slow pointer to nums[0] = ${slow}. Fast remains at ${fast}.`,
    nodesState: Object.fromEntries(nodes.map(n => {
      if (n.id === slow.toString() || n.id === fast.toString()) return [n.id, 'processing'];
      return [n.id, 'normal'];
    })),
    edgesState: Object.fromEntries(edges.map(e => [`${e.from}-${e.to}`, 'normal'])),
    queue: [],
    highlightNode: null
  });

  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[fast];

    const stepNodesState = Object.fromEntries(nodes.map(n => [n.id, 'normal']));
    stepNodesState[slow.toString()] = 'processing';
    stepNodesState[fast.toString()] = 'processing';
    
    steps.push({
      desc: `Move slow to ${slow}, fast to ${fast}.`,
      nodesState: { ...stepNodesState },
      edgesState: Object.fromEntries(edges.map(e => [`${e.from}-${e.to}`, 'normal'])),
      queue: [],
      highlightNode: null
    });
  }

  steps.push({
    desc: `Pointers meet at ${slow}. The duplicate number is ${slow}!`,
    nodesState: Object.fromEntries(nodes.map(n => [n.id, n.id === slow.toString() ? 'processed' : 'normal'])),
    edgesState: Object.fromEntries(edges.map(e => [`${e.from}-${e.to}`, 'normal'])),
    queue: [],
    highlightNode: slow.toString(),
    finished: true
  });

  const layoutedNodes = LayoutEngine.generateForceDirectedLayout(nodes, edges);

  return { nodes: layoutedNodes, edges, steps };
};
