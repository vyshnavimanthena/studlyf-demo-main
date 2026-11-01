import { LayoutEngine, LayoutNode, LayoutEdge } from '../layoutEngine';

export const binaryTreeZigzagLevelOrderTraversalGenerator = (inputStr: string) => {
  // We'll parse a basic array representation if provided, otherwise use the default tree from the problem.
  let rawNodes: any[] = [
    { id: 0, val: 3, left: 1, right: 2, state: 'normal' },
    { id: 1, val: 9, state: 'normal' },
    { id: 2, val: 20, left: 3, right: 4, state: 'normal' },
    { id: 3, val: 15, state: 'normal' },
    { id: 4, val: 7, state: 'normal' }
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
    // fallback to default tree
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
    return { nodes: [], edges: [], steps: [{ desc: "Empty tree. Return []." }] };
  }

  let queue: number[] = [rootId];
  let leftToRight = true;
  let result: number[][] = [];
  let visited: number[] = [];

  steps.push({
    node: rootId,
    desc: `Initialize queue with root node. left_to_right = True.`,
    highlight: [...visited],
  });

  while (queue.length > 0) {
    const levelSize = queue.length;
    const levelArr: number[] = [];

    steps.push({
      node: queue[0],
      desc: `Processing new level. Queue size is ${levelSize}. Direction: ${leftToRight ? 'Left to Right' : 'Right to Left'}.`,
      highlight: [...visited, ...queue],
    });

    for (let i = 0; i < levelSize; i++) {
      const currId = queue.shift()!;
      const currNode = rawNodes.find(n => n.id === currId)!;
      
      visited.push(currId);

      if (leftToRight) {
        levelArr.push(currNode.val);
        steps.push({
          node: currId,
          desc: `Pop ${currNode.val} and append to level array. level: [${levelArr.join(', ')}].`,
          highlight: [...visited],
        });
      } else {
        levelArr.unshift(currNode.val);
        steps.push({
          node: currId,
          desc: `Pop ${currNode.val} and prepend to level array (because left_to_right is False). level: [${levelArr.join(', ')}].`,
          highlight: [...visited],
        });
      }

      if (currNode.left !== undefined) {
        queue.push(currNode.left as number);
      }
      if (currNode.right !== undefined) {
        queue.push(currNode.right as number);
      }

      if (currNode.left !== undefined || currNode.right !== undefined) {
        steps.push({
          node: currId,
          desc: `Add children of ${currNode.val} to queue. Queue: [${queue.map(id => rawNodes.find(n => n.id === id)!.val).join(', ')}].`,
          highlight: [...visited],
        });
      }
    }

    result.push([...levelArr]);
    
    steps.push({
      node: -1,
      desc: `Finished level. Append level to result: ${JSON.stringify(result)}. Toggle direction. left_to_right is now ${!leftToRight}.`,
      highlight: [...visited],
    });
    
    leftToRight = !leftToRight;
  }

  steps.push({
    node: -1,
    desc: `Queue is empty. Traversal complete. Final Result: ${JSON.stringify(result)}.`,
    highlight: [...visited],
    finished: true
  });

  return { nodes, edges, steps };
};
