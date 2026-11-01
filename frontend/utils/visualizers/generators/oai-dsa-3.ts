import { LayoutEngine, LayoutNode, LayoutEdge } from '../layoutEngine';

export const implementTrieWithAutocompleteGenerator = (inputStr: string) => {
  // Parse input
  // e.g., 'words = ["open", "openai", "opensource", "api"], autocomplete("open")'
  let words = ["open", "openai", "opensource", "api"];
  let searchPrefix = "open";

  try {
    const wordsMatch = inputStr.match(/words\s*=\s*\[(.*?)\]/);
    if (wordsMatch) {
      words = wordsMatch[1].split(',').map(s => s.replace(/['"\s]/g, ''));
    }
    const autocompleteMatch = inputStr.match(/autocomplete\(\s*['"](.*?)['"]\s*\)/);
    if (autocompleteMatch) {
      searchPrefix = autocompleteMatch[1];
    }
  } catch (e) {
    // fallback
  }

  const steps: any[] = [];
  const rawNodes: any[] = [{ id: 0, val: 'root', isEnd: false, state: 'normal' }];
  let nextId = 1;

  steps.push({
    node: -1,
    desc: `Initializing Trie root node.`,
    highlight: [0],
    results: []
  });

  // Build Trie in LC-RS (Left-Child Right-Sibling) to match binary tree visualization
  words.forEach(word => {
    steps.push({
      node: 0,
      desc: `Inserting word: "${word}"`,
      highlight: [0],
      results: []
    });

    let currId = 0;
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      let curr = rawNodes.find(n => n.id === currId);
      
      let childId = curr.left;
      let child = rawNodes.find(n => n.id === childId);
      let prev = null;
      
      steps.push({
        node: currId,
        desc: `Checking if '${char}' exists in children of node '${curr.val}'.`,
        highlight: [currId, childId].filter(id => id !== undefined),
        results: []
      });

      while (child && child.val !== char) {
        steps.push({
          node: child.id,
          desc: `Sibling '${child.val}' != '${char}', moving to next sibling.`,
          highlight: [child.id, child.right].filter(id => id !== undefined),
          results: []
        });
        prev = child;
        childId = child.right;
        child = rawNodes.find(n => n.id === childId);
      }

      if (child) {
        steps.push({
          node: child.id,
          desc: `Character '${char}' found. Moving to this node.`,
          highlight: [child.id],
          results: []
        });
        currId = child.id;
      } else {
        const newId = nextId++;
        const newNode = { id: newId, val: char, originalVal: char, isEnd: false, state: 'normal' };
        rawNodes.push(newNode);
        
        if (prev) {
          prev.right = newId;
          steps.push({
            node: prev.id,
            desc: `Adding new sibling '${char}' to '${prev.val}'.`,
            highlight: [prev.id, newId],
            results: []
          });
        } else {
          curr.left = newId;
          steps.push({
            node: curr.id,
            desc: `Adding new child '${char}' to '${curr.val}'.`,
            highlight: [curr.id, newId],
            results: []
          });
        }
        currId = newId;
      }
    }
    
    // mark isEnd
    const endNode = rawNodes.find(n => n.id === currId);
    endNode.isEnd = true;
    endNode.val = endNode.originalVal + '*'; // Visual indicator for end of word
    steps.push({
      node: currId,
      desc: `Finished inserting "${word}". Marking node '${endNode.originalVal}' as end of word.`,
      highlight: [currId],
      results: []
    });
  });

  // Autocomplete
  steps.push({
    node: 0,
    desc: `Autocompleting prefix: "${searchPrefix}"`,
    highlight: [0],
    results: []
  });

  let currId = 0;
  let found = true;
  for (let i = 0; i < searchPrefix.length; i++) {
    const char = searchPrefix[i];
    let curr = rawNodes.find(n => n.id === currId);
    
    let childId = curr.left;
    let child = rawNodes.find(n => n.id === childId);
    
    steps.push({
      node: currId,
      desc: `Looking for prefix character '${char}' in children of '${curr.originalVal || curr.val}'.`,
      highlight: [currId, childId].filter(id => id !== undefined),
      results: []
    });

    while (child && child.originalVal !== char) {
      steps.push({
        node: child.id,
        desc: `Sibling '${child.originalVal}' != '${char}', checking next sibling.`,
        highlight: [child.id, child.right].filter(id => id !== undefined),
        results: []
      });
      childId = child.right;
      child = rawNodes.find(n => n.id === childId);
    }
    
    if (child) {
      steps.push({
        node: child.id,
        desc: `Prefix character '${char}' matched.`,
        highlight: [child.id],
        results: []
      });
      currId = child.id;
    } else {
      steps.push({
        node: curr.id,
        desc: `Prefix character '${char}' not found. No autocomplete results.`,
        highlight: [curr.id],
        results: []
      });
      found = false;
      break;
    }
  }

  const results: string[] = [];
  if (found) {
    // DFS to find all words from this node
    steps.push({
      node: currId,
      desc: `Prefix found. Starting DFS to find all completions.`,
      highlight: [currId],
      results: [...results]
    });

    const dfs = (nodeId: number, currentWord: string) => {
      const node = rawNodes.find(n => n.id === nodeId);
      if (!node) return;

      steps.push({
        node: nodeId,
        desc: `Visiting node '${node.originalVal}'. Current prefix: "${currentWord}"`,
        highlight: [nodeId],
        results: [...results]
      });

      if (node.isEnd) {
        results.push(currentWord);
        steps.push({
          node: nodeId,
          desc: `Node '${node.originalVal}' is marked as end of word. Found completion: "${currentWord}"`,
          highlight: [nodeId],
          results: [...results]
        });
      }

      // Visit children (node.left and its siblings)
      let childId = node.left;
      while (childId !== undefined) {
        const child = rawNodes.find(n => n.id === childId);
        if (child) {
          dfs(child.id, currentWord + child.originalVal);
        }
        childId = child?.right;
      }
    };

    dfs(currId, searchPrefix);
    
    steps.push({
      node: currId,
      desc: `Autocomplete complete. Results: [${results.join(', ')}]`,
      highlight: [currId],
      results: [...results]
    });
  }

  const edges: LayoutEdge[] = [];
  rawNodes.forEach(n => {
    if (n.left !== undefined) edges.push({ from: n.id, to: n.left });
    if (n.right !== undefined) edges.push({ from: n.id, to: n.right });
  });

  // Custom LCRS Tree Layout for Trie
  const depths = new Map<number, any[]>();
  const getDepth = (nodeId: number, currentDepth: number) => {
    const node = rawNodes.find(n => n.id === nodeId);
    if (!node) return;
    if (!depths.has(currentDepth)) depths.set(currentDepth, []);
    depths.get(currentDepth)!.push(node);
    
    if (node.left !== undefined) getDepth(node.left, currentDepth + 1);
    if (node.right !== undefined) getDepth(node.right, currentDepth);
  };
  getDepth(0, 0);

  const maxDepth = Math.max(...Array.from(depths.keys()));
  const ySpacing = 300 / (maxDepth + 1.5);
  depths.forEach((nodesAtDepth, depth) => {
    const xSpacing = 400 / (nodesAtDepth.length + 1);
    nodesAtDepth.forEach((node, idx) => {
      node.x = xSpacing * (idx + 1);
      node.y = 30 + (depth * ySpacing);
    });
  });

  const layoutNodes = rawNodes;

  return {
    nodes: layoutNodes,
    edges,
    steps
  };
};
