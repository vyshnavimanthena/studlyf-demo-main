import { LayoutEngine, LayoutEdge } from '../layoutEngine';

export const msDsa8Generator = (inputStr: string) => {
  // Parse input
  let rawNodes: any[] = [
    { id: 0, val: 2, left: 1, right: 2, state: 'normal' },
    { id: 1, val: 1, state: 'normal' },
    { id: 2, val: 3, state: 'normal' }
  ];

  try {
    const match = inputStr.match(/\[(.*?)\]/);
    if (match) {
      const parts = match[1].split(',').map(s => s.trim().replace(/['"]/g, ''));
      if (parts.length > 0 && parts[0] !== '') {
        const parsedNodes: any[] = parts.map((val, idx) => (val !== 'null' ? { id: idx, val: parseInt(val, 10), state: 'normal' } : null));
        let head = 0;
        let tail = 1;
        while (head < parsedNodes.length && tail < parsedNodes.length) {
          if (parsedNodes[head] !== null) {
            if (tail < parsedNodes.length && parsedNodes[tail] !== null) {
              parsedNodes[head].left = parsedNodes[tail].id;
            }
            tail++;
            if (tail < parsedNodes.length && parsedNodes[tail] !== null) {
              parsedNodes[head].right = parsedNodes[tail].id;
            }
            tail++;
          }
          head++;
        }
        rawNodes = parsedNodes.filter(n => n !== null);
      }
    }
  } catch (e) {
    // fallback
  }

  const edges: LayoutEdge[] = [];
  rawNodes.forEach(n => {
    if (n.left !== undefined) edges.push({ from: n.id, to: n.left });
    if (n.right !== undefined) edges.push({ from: n.id, to: n.right });
  });

  const rootId = rawNodes.length > 0 ? rawNodes[0].id : 0;
  const nodes = LayoutEngine.generateTreeLayout(rawNodes, edges, rootId, 400, 300);

  const steps: any[] = [];
  
  if (rawNodes.length === 0) {
    return { nodes: [], edges: [], steps: [{ desc: "Empty tree. Return empty string for serialize and None for deserialize." }] };
  }

  // Phase 1: Serialize
  steps.push({
    node: -1,
    desc: `Phase 1: Serialize using preorder traversal.`,
    highlight: []
  });

  const serializedList: string[] = [];
  const serializeVisited: number[] = [];

  const preorder = (nodeId: number | undefined) => {
    if (nodeId === undefined) {
      return;
    }
    const node = rawNodes.find(n => n.id === nodeId);
    if (!node) return;

    serializeVisited.push(nodeId);
    serializedList.push(node.val.toString());

    steps.push({
      node: nodeId,
      desc: `Preorder visit node ${node.val}. Append to list. Current list: [${serializedList.join(', ')}]`,
      highlight: [...serializeVisited]
    });

    if (node.left !== undefined) {
      steps.push({
        node: nodeId,
        desc: `Traverse left child of ${node.val}.`,
        highlight: [...serializeVisited]
      });
      preorder(node.left);
    }
    
    if (node.right !== undefined) {
      steps.push({
        node: nodeId,
        desc: `Traverse right child of ${node.val}.`,
        highlight: [...serializeVisited]
      });
      preorder(node.right);
    }
    
    steps.push({
      node: nodeId,
      desc: `Finished subtree for node ${node.val}. Backtracking.`,
      highlight: [...serializeVisited]
    });
  };

  preorder(rootId);
  
  const serializedString = serializedList.join(',');
  steps.push({
    node: -1,
    desc: `Serialization complete. Result string: "${serializedString}"`,
    highlight: [...serializeVisited]
  });

  // Phase 2: Deserialize
  steps.push({
    node: -1,
    desc: `Phase 2: Deserialize from string: "${serializedString}". Splitting by comma to get values.`,
    highlight: []
  });

  const vals = serializedString.split(',');
  let valIdx = 0;
  const deserializeVisited: number[] = [];

  const build = (lo: number, hi: number, parentIdStr?: string): number | null => {
    if (valIdx >= vals.length) {
      return null;
    }

    const currentVal = parseInt(vals[valIdx], 10);
    
    steps.push({
      node: -1,
      desc: `build(lo=${lo === -Infinity ? '-∞' : lo}, hi=${hi === Infinity ? '∞' : hi}). Next value from iterator: ${currentVal}. Checking if ${currentVal} falls in valid range.`,
      highlight: [...deserializeVisited]
    });

    if (currentVal < lo || currentVal > hi) {
      steps.push({
        node: -1,
        desc: `Value ${currentVal} is NOT in range [${lo === -Infinity ? '-∞' : lo}, ${hi === Infinity ? '∞' : hi}]. Does not belong to this subtree. Return None.`,
        highlight: [...deserializeVisited]
      });
      return null;
    }

    // It belongs here! We "consume" it and find its original node ID to highlight
    valIdx++;
    const nodeObj = rawNodes.find(n => n.val === currentVal);
    const nodeId = nodeObj ? nodeObj.id : -1;
    deserializeVisited.push(nodeId);

    steps.push({
      node: nodeId,
      desc: `Value ${currentVal} is in range. Create TreeNode(${currentVal}). Recursing to build left child.`,
      highlight: [...deserializeVisited]
    });

    const leftChild = build(lo, currentVal, nodeId.toString());
    
    steps.push({
      node: nodeId,
      desc: `Returned from left child of ${currentVal}. Recursing to build right child.`,
      highlight: [...deserializeVisited]
    });
    
    const rightChild = build(currentVal, hi, nodeId.toString());

    steps.push({
      node: nodeId,
      desc: `Returned from right child of ${currentVal}. Node ${currentVal} successfully built.`,
      highlight: [...deserializeVisited]
    });

    return nodeId;
  };

  build(-Infinity, Infinity);

  steps.push({
    node: -1,
    desc: `Deserialization complete. The BST has been fully reconstructed.`,
    highlight: [...deserializeVisited],
    finished: true
  });

  return { nodes, edges, steps };
};
