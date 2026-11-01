import { LayoutEngine, LayoutNode, LayoutEdge } from '../layoutEngine';

export const designHitCounterGenerator = (inputStr: string) => {
  // Parse input
  // e.g., 'hit(1), hit(2), hit(3), getHits(4), hit(300), getHits(300)'
  
  let commands: {type: string, val: number}[] = [
    {type: 'hit', val: 1},
    {type: 'hit', val: 2},
    {type: 'hit', val: 3},
    {type: 'getHits', val: 4},
    {type: 'hit', val: 300},
    {type: 'getHits', val: 300},
  ];

  try {
    if (inputStr && inputStr.trim().length > 0) {
      const parsed: {type: string, val: number}[] = [];
      const regex = /(hit|getHits)\((\d+)\)/g;
      let match;
      while ((match = regex.exec(inputStr)) !== null) {
        parsed.push({ type: match[1], val: parseInt(match[2], 10) });
      }
      if (parsed.length > 0) {
        commands = parsed;
      }
    }
  } catch (e) {}

  const steps: any[] = [];
  const nodesMap = new Map<string, LayoutNode>();
  const edgesMap = new Map<string, LayoutEdge>();

  const edges: LayoutEdge[] = [];
  const queue: number[] = [];
  
  const allNodesCreated: string[] = []; 

  let x = 50;
  const y = 200;

  steps.push({
    desc: `Initialized HitCounter with an empty queue.`,
    nodesState: {},
    edgesState: {},
    queue: [],
    highlightNode: null
  });

  for (const cmd of commands) {
    if (cmd.type === 'hit') {
      const ts = cmd.val;
      const nodeId = `hit_${ts}_${allNodesCreated.length}`; 
      
      queue.push(ts);
      allNodesCreated.push(nodeId);
      
      nodesMap.set(nodeId, {
        id: nodeId,
        label: `${ts}`,
        x: x,
        y: y,
        state: 'normal'
      });
      x += 80;

      if (allNodesCreated.length > 1) {
        const prevNodeId = allNodesCreated[allNodesCreated.length - 2];
        const edgeId = `${prevNodeId}-${nodeId}`;
        edges.push({ from: prevNodeId, to: nodeId });
        edgesMap.set(edgeId, { from: prevNodeId, to: nodeId });
      }

      const currentNodesState: Record<string, string> = {};
      const currentEdgesState: Record<string, string> = {};
      
      const activeNodeIds = allNodesCreated.slice(allNodesCreated.length - queue.length);
      
      for (const id of allNodesCreated) {
        currentNodesState[id] = activeNodeIds.includes(id) ? 'normal' : 'processed';
      }
      for (const e of edges) {
        currentEdgesState[`${e.from}-${e.to}`] = (activeNodeIds.includes(e.from as string) && activeNodeIds.includes(e.to as string)) ? 'normal' : 'processed';
      }

      currentNodesState[nodeId] = 'processing';

      steps.push({
        desc: `hit(${ts}): Added timestamp ${ts} to the queue.`,
        nodesState: currentNodesState,
        edgesState: currentEdgesState,
        queue: [...queue],
        highlightNode: nodeId
      });

    } else if (cmd.type === 'getHits') {
      const ts = cmd.val;
      const cutoff = ts - 300;
      
      let activeNodeIds = allNodesCreated.slice(allNodesCreated.length - queue.length);

      const initNodesState: Record<string, string> = {};
      for (const id of allNodesCreated) {
        initNodesState[id] = activeNodeIds.includes(id) ? 'normal' : 'processed';
      }
      const initEdgesState: Record<string, string> = {};
      for (const e of edges) {
         initEdgesState[`${e.from}-${e.to}`] = (activeNodeIds.includes(e.from as string) && activeNodeIds.includes(e.to as string)) ? 'normal' : 'processed';
      }

      steps.push({
        desc: `getHits(${ts}): Cutoff timestamp is ${ts} - 300 = ${cutoff}. We need to remove hits <= ${cutoff}.`,
        nodesState: initNodesState,
        edgesState: initEdgesState,
        queue: [...queue],
        highlightNode: null
      });

      while (queue.length > 0 && queue[0] <= cutoff) {
        const evictedTs = queue.shift()!;
        const evictedNodeId = activeNodeIds.shift()!;
        
        const currentNodesState: Record<string, string> = {};
        for (const id of allNodesCreated) {
          currentNodesState[id] = activeNodeIds.includes(id) ? 'normal' : 'processed';
        }
        currentNodesState[evictedNodeId] = 'error'; 
        
        const currentEdgesState: Record<string, string> = {};
        for (const e of edges) {
           currentEdgesState[`${e.from}-${e.to}`] = (activeNodeIds.includes(e.from as string) && activeNodeIds.includes(e.to as string)) ? 'normal' : 'processed';
        }

        steps.push({
          desc: `Hit at ${evictedTs} is <= ${cutoff}. Removing from queue.`,
          nodesState: currentNodesState,
          edgesState: currentEdgesState,
          queue: [...queue],
          highlightNode: evictedNodeId
        });
      }

      const finalNodesState: Record<string, string> = {};
      for (const id of allNodesCreated) {
        finalNodesState[id] = activeNodeIds.includes(id) ? 'normal' : 'processed';
      }
      const finalEdgesState: Record<string, string> = {};
      for (const e of edges) {
         finalEdgesState[`${e.from}-${e.to}`] = (activeNodeIds.includes(e.from as string) && activeNodeIds.includes(e.to as string)) ? 'normal' : 'processed';
      }

      steps.push({
        desc: `getHits(${ts}): Eviction complete. Current hit count is ${queue.length}.`,
        nodesState: finalNodesState,
        edgesState: finalEdgesState,
        queue: [...queue],
        highlightNode: null
      });
    }
  }
  
  steps.push({
    desc: `All commands executed.`,
    nodesState: steps[steps.length - 1].nodesState,
    edgesState: steps[steps.length - 1].edgesState,
    queue: [...queue],
    highlightNode: null,
    finished: true
  });

  const nodes = Array.from(nodesMap.values());
  const layoutedNodes = LayoutEngine.generateForceDirectedLayout(nodes, edges);

  return { nodes: layoutedNodes, edges, steps };
};
