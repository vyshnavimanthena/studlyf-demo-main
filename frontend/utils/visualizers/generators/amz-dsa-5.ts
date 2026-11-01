import { LayoutEngine, LayoutNode, LayoutEdge } from '../layoutEngine';

export const serializeAndDeserializeBinaryTreeGenerator = (inputStr: string) => {
  const rawNodes: any[] = [
    { id: 1, val: 1, left: 2, right: 3, state: 'normal' },
    { id: 2, val: 2, state: 'normal' },
    { id: 3, val: 3, left: 4, right: 5, state: 'normal' },
    { id: 4, val: 4, state: 'normal' },
    { id: 5, val: 5, state: 'normal' }
  ];

  const edges: LayoutEdge[] = [];
  rawNodes.forEach(n => {
    if (n.left !== undefined) edges.push({ from: n.id, to: n.left });
    if (n.right !== undefined) edges.push({ from: n.id, to: n.right });
  });

  const nodes = LayoutEngine.generateTreeLayout(rawNodes, edges, 1, 400, 300);

  const steps: any[] = [];
  const queue: (number | null)[] = [1];
  const result: string[] = [];
  const highlight: number[] = [];

  steps.push({
    node: -1,
    desc: 'Starting Serialization (BFS level-order traversal).',
    highlight: [],
    queue: [...queue],
    result: [...result]
  });

  while(queue.length > 0) {
    let allNull = true;
    for (const q of queue) {
      if (q !== null) {
        allNull = false; break;
      }
    }
    if (allNull) {
       queue.length = 0;
       break;
    }
    
    const currId = queue.shift();
    if (currId !== null && currId !== undefined) {
      const node = rawNodes.find(n => n.id === currId);
      if (node) {
        result.push(node.val.toString());
        highlight.push(node.id);
        queue.push(node.left ?? null);
        queue.push(node.right ?? null);
        
        steps.push({
          node: node.id,
          desc: `Dequeue node (${node.val}). Append "${node.val}" to result. Enqueue left and right children.`,
          highlight: [...highlight],
          queue: [...queue],
          result: [...result]
        });
      }
    } else {
      result.push('null');
      steps.push({
        node: -1,
        desc: `Dequeue null node. Append "null" to result.`,
        highlight: [...highlight],
        queue: [...queue],
        result: [...result]
      });
    }
  }

  while(result.length > 0 && result[result.length - 1] === 'null') {
    result.pop();
  }

  steps.push({
    node: -1,
    desc: `Serialization complete! Serialized string: "${result.join(',')}"`,
    highlight: [],
    queue: [],
    result: [...result]
  });

  steps.push({
    node: -1,
    desc: `Starting Deserialization using string: "${result.join(',')}"`,
    highlight: [],
    queue: [],
    result: [...result]
  });

  const vals = [...result];
  if (vals.length > 0 && vals[0] !== 'null') {
    const rootVal = vals[0];
    const deq: number[] = [1];
    let i = 1;
    const currentHighlight: number[] = [1];
    
    steps.push({
      node: 1,
      desc: `Create root node (${rootVal}). Add to queue.`,
      highlight: [...currentHighlight],
      queue: [...deq],
      result: vals
    });

    while (deq.length > 0 && i < vals.length) {
      const currNodeId = deq.shift()!;
      const currNode = rawNodes.find(n => n.id === currNodeId)!;
      
      if (i < vals.length) {
        const leftVal = vals[i];
        if (leftVal !== 'null') {
          deq.push(currNode.left!);
          currentHighlight.push(currNode.left!);
          steps.push({
            node: currNode.left!,
            desc: `Read "${leftVal}". Create left child (${leftVal}) for node (${currNode.val}). Add to queue.`,
            highlight: [...currentHighlight],
            queue: [...deq],
            result: vals
          });
        } else {
           steps.push({
            node: currNodeId,
            desc: `Read "null". Left child for node (${currNode.val}) is null.`,
            highlight: [...currentHighlight],
            queue: [...deq],
            result: vals
          });
        }
        i++;
      }
      
      if (i < vals.length) {
        const rightVal = vals[i];
        if (rightVal !== 'null') {
          deq.push(currNode.right!);
          currentHighlight.push(currNode.right!);
          steps.push({
            node: currNode.right!,
            desc: `Read "${rightVal}". Create right child (${rightVal}) for node (${currNode.val}). Add to queue.`,
            highlight: [...currentHighlight],
            queue: [...deq],
            result: vals
          });
        } else {
          steps.push({
            node: currNodeId,
            desc: `Read "null". Right child for node (${currNode.val}) is null.`,
            highlight: [...currentHighlight],
            queue: [...deq],
            result: vals
          });
        }
        i++;
      }
    }
  }

  steps.push({
    node: -1,
    desc: 'Deserialization complete! Identical tree rebuilt successfully.',
    highlight: rawNodes.map(n => n.id),
    queue: [],
    result: [...result],
    success: true,
    finished: true
  });

  return { nodes, edges, steps };
};
