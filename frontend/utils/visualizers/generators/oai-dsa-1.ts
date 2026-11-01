import { LayoutEngine, LayoutNode, LayoutEdge } from '../layoutEngine';

export const designTokenizerTrieGenerator = (inputStr: string) => {
  // Parse input
  // Default: 'words = ["hugging", "face", "hug"], prefix("hug")'
  let words = ["hugging", "face", "hug"];
  let prefix = "hug";

  try {
    const wordsMatch = inputStr.match(/\[(.*?)\]/);
    if (wordsMatch) {
      words = wordsMatch[1].split(',').map(s => s.replace(/['"\s]/g, ''));
    }
    const prefixMatch = inputStr.match(/prefix\((.*?)\)/);
    if (prefixMatch) {
      prefix = prefixMatch[1].replace(/['"\s]/g, '');
    }
  } catch (e) {
    // fallback
  }

  const rawNodes: any[] = [];
  const edges: LayoutEdge[] = [];
  const steps: any[] = [];

  const rootId = 0;
  rawNodes.push({ id: rootId, val: 'root', state: 'normal', is_end: false });
  let idCounter = 1;

  steps.push({
    node: rootId,
    desc: `Initialized Trie with root node.`,
    highlight: [rootId],
  });

  // Helper to find or add child using left-child right-sibling
  const insertChar = (parentId: number, char: string): number => {
    const parentNode = rawNodes.find(n => n.id === parentId);
    if (parentNode.left === undefined) {
      const newNodeId = idCounter++;
      const newNode = { id: newNodeId, val: char, state: 'normal', is_end: false };
      parentNode.left = newNodeId;
      rawNodes.push(newNode);
      edges.push({ from: parentId, to: newNodeId });
      return newNodeId;
    } else {
      let currId = parentNode.left;
      let prevId = -1;
      while (currId !== undefined) {
        const currNode = rawNodes.find(n => n.id === currId);
        if (currNode.val === char) {
          return currId;
        }
        prevId = currId;
        currId = currNode.right;
      }
      // Not found, add as sibling
      const newNodeId = idCounter++;
      const newNode = { id: newNodeId, val: char, state: 'normal', is_end: false };
      const prevNode = rawNodes.find(n => n.id === prevId);
      prevNode.right = newNodeId;
      rawNodes.push(newNode);
      edges.push({ from: prevId, to: newNodeId });
      return newNodeId;
    }
  };

  // 1. Insert words
  for (const word of words) {
    let currId = rootId;
    const highlight = [currId];
    
    steps.push({
      node: currId,
      desc: `Inserting word "${word}" into Trie.`,
      highlight: [...highlight],
    });

    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const nextId = insertChar(currId, char);
      
      highlight.push(nextId);
      
      steps.push({
        node: nextId,
        desc: `Character '${char}' -> Node(${nextId}). Moved to node.`,
        highlight: [...highlight],
      });
      
      currId = nextId;
    }
    
    const finalNode = rawNodes.find(n => n.id === currId);
    finalNode.is_end = true;
    finalNode.state = 'end';
    
    steps.push({
      node: currId,
      desc: `Finished inserting "${word}". Marked Node(${currId}) as end of word.`,
      highlight: [...highlight],
    });
  }

  // 2. Search prefix
  let currId = rootId;
  const prefixHighlight = [currId];
  let foundPrefix = true;
  
  steps.push({
    node: currId,
    desc: `Starting prefix search for "${prefix}".`,
    highlight: [...prefixHighlight],
  });

  for (let i = 0; i < prefix.length; i++) {
    const char = prefix[i];
    const parentNode = rawNodes.find(n => n.id === currId);
    
    let childId = parentNode.left;
    let matchedId = -1;
    while (childId !== undefined) {
      const childNode = rawNodes.find(n => n.id === childId);
      if (childNode.val === char) {
        matchedId = childId;
        break;
      }
      childId = childNode.right;
    }
    
    if (matchedId !== -1) {
      prefixHighlight.push(matchedId);
      currId = matchedId;
      steps.push({
        node: currId,
        desc: `Matched character '${char}' at Node(${currId}).`,
        highlight: [...prefixHighlight],
      });
    } else {
      foundPrefix = false;
      steps.push({
        node: currId,
        desc: `Could not find character '${char}'. Prefix "${prefix}" not in Trie.`,
        highlight: [...prefixHighlight],
        finished: true
      });
      break;
    }
  }

  if (foundPrefix) {
    steps.push({
      node: currId,
      desc: `Prefix "${prefix}" found! Node(${currId}) represents the end of the prefix.`,
      highlight: [...prefixHighlight],
    });

    // 3. Collect all words with this prefix
    const results: string[] = [];
    
    const collect = (nodeId: number, currentStr: string) => {
      const node = rawNodes.find(n => n.id === nodeId);
      if (node.is_end) {
        results.push(currentStr);
        steps.push({
          node: nodeId,
          desc: `Found end of word. Collected: "${currentStr}".`,
          highlight: [...prefixHighlight, nodeId],
        });
      }
      
      let childId = node.left;
      while (childId !== undefined) {
        const childNode = rawNodes.find(n => n.id === childId);
        steps.push({
          node: childId,
          desc: `Traversing to child '${childNode.val}' Node(${childId}).`,
          highlight: [...prefixHighlight, childId],
        });
        collect(childId, currentStr + childNode.val);
        childId = childNode.right;
      }
    };

    steps.push({
      node: currId,
      desc: `Collecting all words starting with prefix "${prefix}" from Node(${currId}).`,
      highlight: [...prefixHighlight],
    });
    
    const startNode = rawNodes.find(n => n.id === currId);
    if (startNode.is_end) {
      results.push(prefix);
      steps.push({
        node: currId,
        desc: `Prefix itself is a word. Collected: "${prefix}".`,
        highlight: [...prefixHighlight],
      });
    }
    
    let childId = startNode.left;
    while (childId !== undefined) {
      const childNode = rawNodes.find(n => n.id === childId);
      collect(childId, prefix + childNode.val);
      childId = childNode.right;
    }

    steps.push({
      node: -1,
      desc: `Prefix collection complete. Results: [${results.join(', ')}].`,
      highlight: [],
      finished: true,
      success: true
    });
  }

  const nodes = LayoutEngine.generateTreeLayout(rawNodes, edges, rootId, 400, 300);

  return { nodes, edges, steps };
};
