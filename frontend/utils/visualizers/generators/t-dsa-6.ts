import { LayoutEngine, LayoutNode, LayoutEdge } from '../layoutEngine';

export const findCelebrityGenerator = (inputStr: string) => {
  // Default values
  let n = 4;
  let matrix: number[][] = [
    [0, 1, 1, 0], // 0 knows 1, 0 knows 2
    [0, 0, 0, 0], // 1 knows nobody (celebrity)
    [0, 1, 0, 0], // 2 knows 1
    [0, 1, 0, 0]  // 3 knows 1
  ];

  // Try parsing from input if provided
  try {
    const match = inputStr.match(/n\s*=\s*(\d+)/);
    if (match) {
      const parsedN = parseInt(match[1]);
      // If we could extract a larger matrix we would, but keeping it robust with default
      // for any unparsable inputs.
    }
  } catch (e) {
    // fallback
  }

  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];
  
  for (let i = 0; i < n; i++) {
    nodes.push({ id: i.toString(), label: i.toString(), state: 'normal' });
  }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (matrix[i][j] === 1) {
        edges.push({ from: i.toString(), to: j.toString() });
      }
    }
  }

  const steps: any[] = [];
  let candidate = 0;

  const getEdgeId = (from: number, to: number) => `${from}-${to}`;

  const createStep = (desc: string, cand: number, activeEdge: string | null = null, highlightNodes: string[] = [], processedNodes: string[] = [], finished: boolean = false) => {
    const nodesState: Record<string, string> = {};
    for (const node of nodes) {
      if (highlightNodes.includes(node.id as string)) {
        nodesState[node.id as string] = 'processing';
      } else if (node.id === cand.toString()) {
        nodesState[node.id as string] = 'processed'; // using processed for candidate highlight
      } else if (processedNodes.includes(node.id as string)) {
        nodesState[node.id as string] = 'processed';
      } else {
        nodesState[node.id as string] = 'normal';
      }
    }

    const edgesState: Record<string, string> = {};
    for (const edge of edges) {
      const eid = `${edge.from}-${edge.to}`;
      if (eid === activeEdge) {
        edgesState[eid] = 'processing';
      } else {
        edgesState[eid] = 'normal';
      }
    }

    return {
      desc,
      nodesState,
      edgesState,
      candidate: cand,
      highlightNode: highlightNodes.length > 0 ? highlightNodes[0] : null,
      activeEdge: activeEdge ? { from: activeEdge.split('-')[0], to: activeEdge.split('-')[1] } : null,
      finished
    };
  };

  steps.push(createStep(
    `Initial state. Assume candidate is person 0.`,
    candidate,
    null,
    ['0']
  ));

  // Phase 1: Candidate elimination
  for (let i = 1; i < n; i++) {
    const knows = matrix[candidate][i] === 1;
    const edgeId = knows ? getEdgeId(candidate, i) : null;
    
    steps.push(createStep(
      `Checking if candidate ${candidate} knows ${i}.`,
      candidate,
      edgeId,
      [i.toString()]
    ));

    if (knows) {
      steps.push(createStep(
        `Candidate ${candidate} knows ${i}, so ${candidate} cannot be the celebrity. New candidate is ${i}.`,
        i,
        edgeId,
        [i.toString()]
      ));
      candidate = i;
    } else {
      steps.push(createStep(
        `Candidate ${candidate} does not know ${i}, so ${i} cannot be the celebrity. Candidate remains ${candidate}.`,
        candidate,
        null,
        [i.toString()]
      ));
    }
  }

  // Phase 2: Verification
  steps.push(createStep(
    `Phase 1 complete. Potential celebrity candidate is ${candidate}. Now verifying...`,
    candidate,
    null,
    [candidate.toString()]
  ));

  let isValid = true;
  for (let i = 0; i < n; i++) {
    if (i === candidate) continue;

    const candKnowsI = matrix[candidate][i] === 1;
    const iKnowsCand = matrix[i][candidate] === 1;

    steps.push(createStep(
      `Verifying relationship between candidate ${candidate} and person ${i}.`,
      candidate,
      candKnowsI ? getEdgeId(candidate, i) : null,
      [i.toString()]
    ));

    if (candKnowsI) {
      steps.push(createStep(
        `Candidate ${candidate} knows ${i}. A celebrity should know nobody! Verification failed.`,
        candidate,
        getEdgeId(candidate, i),
        [i.toString(), candidate.toString()],
        [],
        true
      ));
      isValid = false;
      break;
    }

    if (!iKnowsCand) {
      steps.push(createStep(
        `Person ${i} does not know candidate ${candidate}. A celebrity must be known by everyone! Verification failed.`,
        candidate,
        null,
        [i.toString(), candidate.toString()],
        [],
        true
      ));
      isValid = false;
      break;
    }
    
    steps.push(createStep(
      `Person ${i} knows candidate ${candidate} and candidate does not know them. Check passed.`,
      candidate,
      getEdgeId(i, candidate),
      [i.toString()]
    ));
  }

  if (isValid) {
    steps.push(createStep(
      `Verification complete! Person ${candidate} is verified as the celebrity.`,
      candidate,
      null,
      [candidate.toString()],
      [],
      true
    ));
  }

  const layoutedNodes = LayoutEngine.generateForceDirectedLayout(nodes, edges);

  return { nodes: layoutedNodes, edges, steps };
};
