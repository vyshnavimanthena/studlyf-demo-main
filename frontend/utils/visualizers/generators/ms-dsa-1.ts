import { LayoutEngine, LayoutNode, LayoutEdge } from '../layoutEngine';

export const binaryTreeMaximumPathSumGenerator = (inputStr: string) => {
  let arr: (number | null)[] = [1, 2, 3];
  
  try {
    const match = inputStr.match(/\[(.*?)\]/);
    if (match) {
      arr = match[1].split(',').map(s => {
        const t = s.trim();
        return t === 'null' ? null : Number(t);
      });
      if (arr.length === 0) arr = [1, 2, 3];
    }
  } catch (e) {
    // fallback
  }

  if (arr[0] === null || arr.length === 0 || arr[0] === undefined) {
    return { nodes: [], edges: [], steps: [{ desc: "Empty tree", globalMax: 0 }] };
  }

  const rawNodes: any[] = [];
  const edges: LayoutEdge[] = [];
  
  const rootId = 0;
  rawNodes.push({ id: rootId, val: arr[0], state: 'normal' });
  
  const queue = [rawNodes[0]];
  let i = 1;
  let idCounter = 1;
  
  while (queue.length > 0 && i < arr.length) {
    const curr = queue.shift();
    
    if (i < arr.length && arr[i] !== null && arr[i] !== undefined) {
      const leftNode = { id: idCounter++, val: arr[i], state: 'normal' };
      curr.left = leftNode.id;
      rawNodes.push(leftNode);
      edges.push({ from: curr.id, to: leftNode.id });
      queue.push(leftNode);
    }
    i++;
    
    if (i < arr.length && arr[i] !== null && arr[i] !== undefined) {
      const rightNode = { id: idCounter++, val: arr[i], state: 'normal' };
      curr.right = rightNode.id;
      rawNodes.push(rightNode);
      edges.push({ from: curr.id, to: rightNode.id });
      queue.push(rightNode);
    }
    i++;
  }

  const nodes = LayoutEngine.generateTreeLayout(rawNodes, edges, rootId, 400, 300);
  const steps: any[] = [];
  
  let globalMax = -Infinity;
  const highlight: number[] = [];
  
  steps.push({
    node: -1,
    desc: `Started DFS to find Maximum Path Sum. Initialized globalMax = -Infinity.`,
    highlight: [],
    globalMax: '-Infinity'
  });

  const dfs = (nodeId: number): number => {
    const node = rawNodes.find(n => n.id === nodeId);
    if (!node) return 0;

    highlight.push(nodeId);
    
    steps.push({
      node: nodeId,
      desc: `DFS reached node (${node.val}). Computing left and right gains.`,
      highlight: [...highlight],
      globalMax: globalMax === -Infinity ? '-Infinity' : globalMax
    });

    const leftGain = node.left !== undefined ? Math.max(dfs(node.left), 0) : 0;
    const rightGain = node.right !== undefined ? Math.max(dfs(node.right), 0) : 0;

    const priceNewpath = node.val + leftGain + rightGain;
    const oldMax = globalMax;
    globalMax = Math.max(globalMax, priceNewpath);
    
    const returnVal = node.val + Math.max(leftGain, rightGain);

    steps.push({
      node: nodeId,
      desc: `At node (${node.val}): left_gain=${leftGain}, right_gain=${rightGain}. Path sum through node = ${priceNewpath}. ` +
            (globalMax > oldMax ? `Updated globalMax from ${oldMax === -Infinity ? '-Infinity' : oldMax} to ${globalMax}. ` : `globalMax remains ${globalMax}. `) + 
            `Returning branch sum ${returnVal} to parent.`,
      highlight: [...highlight],
      globalMax: globalMax
    });

    highlight.pop();

    return returnVal;
  };

  dfs(rootId);

  steps.push({
    node: -1,
    desc: `DFS complete. The Maximum Path Sum is ${globalMax}.`,
    highlight: [],
    globalMax: globalMax,
    finished: true,
    success: true
  });

  return { nodes, edges, steps };
};
