import { LayoutEngine, LayoutNode, LayoutEdge } from '../layoutEngine';

export const gDsa6Generator = (inputStr: string) => {
  let lists: number[][] = [[1, 4, 5], [1, 3, 4], [2, 6]];
  try {
    const cleaned = inputStr.replace(/lists\s*=\s*/, '').trim();
    // Wrap in brackets if not already wrapped properly, or just use JSON.parse
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && (parsed.length === 0 || Array.isArray(parsed[0]))) {
      lists = parsed;
    }
  } catch (e) {
    // fallback to default
  }

  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];
  const steps: any[] = [];

  // Build initial lists
  for (let i = 0; i < lists.length; i++) {
    for (let j = 0; j < lists[i].length; j++) {
      const id = `L${i}_${j}`;
      nodes.push({ id, label: String(lists[i][j]), state: 'normal', val: lists[i][j], listIdx: i, nodeIdx: j });
      if (j > 0) {
        const prevId = `L${i}_${j - 1}`;
        edges.push({ from: prevId, to: id });
      }
    }
  }

  let heap: any[] = [];
  
  steps.push({
    desc: `Parsed ${lists.length} sorted linked lists. Ready to initialize min-heap with their heads.`,
    nodesState: Object.fromEntries(nodes.map(n => [n.id, 'normal'])),
    edgesState: Object.fromEntries(edges.map(e => [`${e.from}-${e.to}`, 'normal'])),
    queue: [],
    highlightNode: null
  });

  for (let i = 0; i < lists.length; i++) {
    if (lists[i].length > 0) {
      heap.push({ val: lists[i][0], listIdx: i, nodeIdx: 0, id: `L${i}_0` });
    }
  }
  
  // Sort to simulate Min-Heap (O(k log k) for initial build, but sorting is fine for visualization logic)
  heap.sort((a, b) => a.val - b.val);

  steps.push({
    desc: `Added list heads to min-heap: [${heap.map(h => h.val).join(', ')}]. The min-heap dynamically maintains the smallest available element.`,
    nodesState: Object.fromEntries(nodes.map(n => [n.id, heap.find(h => h.id === n.id) ? 'processing' : 'normal'])),
    edgesState: Object.fromEntries(edges.map(e => [`${e.from}-${e.to}`, 'normal'])),
    queue: heap.map(h => h.id),
    highlightNode: null
  });

  const mergedList: number[] = [];
  const processedEdges = new Set<string>();
  const processedNodes = new Set<string>();

  while (heap.length > 0) {
    const minNode = heap.shift()!; // pop from sorted heap
    mergedList.push(minNode.val);
    processedNodes.add(minNode.id);

    if (minNode.nodeIdx > 0) {
        processedEdges.add(`L${minNode.listIdx}_${minNode.nodeIdx - 1}-L${minNode.listIdx}_${minNode.nodeIdx}`);
    }

    const desc = `Extracted min value ${minNode.val}. Merged list: [${mergedList.join(', ')}].`;
    
    const nextNodeIdx = minNode.nodeIdx + 1;
    let pushedDesc = '';
    if (nextNodeIdx < lists[minNode.listIdx].length) {
      const nextId = `L${minNode.listIdx}_${nextNodeIdx}`;
      heap.push({
        val: lists[minNode.listIdx][nextNodeIdx],
        listIdx: minNode.listIdx,
        nodeIdx: nextNodeIdx,
        id: nextId
      });
      heap.sort((a, b) => a.val - b.val);
      pushedDesc = ` Pushed next node ${lists[minNode.listIdx][nextNodeIdx]} into heap.`;
    } else {
      pushedDesc = ` List ${minNode.listIdx} is exhausted.`;
    }

    const stepNodesState = Object.fromEntries(nodes.map(n => {
       if (processedNodes.has(n.id as string)) return [n.id, 'processed'];
       if (heap.find(h => h.id === n.id)) return [n.id, 'processing'];
       return [n.id, 'normal'];
    }));

    steps.push({
      desc: desc + pushedDesc + ` Heap: [${heap.map(h => h.val).join(', ')}].`,
      nodesState: stepNodesState,
      edgesState: Object.fromEntries(edges.map(e => [`${e.from}-${e.to}`, processedEdges.has(`${e.from}-${e.to}`) ? 'processed' : 'normal'])),
      queue: heap.map(h => h.id),
      highlightNode: minNode.id
    });
  }

  steps.push({
    desc: `Heap is empty. All lists merged successfully! Final sorted list: [${mergedList.join(', ')}].`,
    nodesState: Object.fromEntries(nodes.map(n => [n.id, 'processed'])),
    edgesState: Object.fromEntries(edges.map(e => [`${e.from}-${e.to}`, 'processed'])),
    queue: [],
    highlightNode: null,
    finished: true
  });

  const layoutedNodes = LayoutEngine.generateForceDirectedLayout(nodes, edges);

  return { nodes: layoutedNodes, edges, steps };
};
