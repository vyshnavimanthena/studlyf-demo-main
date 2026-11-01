import { LayoutEngine, LayoutEdge } from '../layoutEngine';

export const wordSearchIIGenerator = (inputStr: string) => {
  let board = [
    ["o","a","a","n"],
    ["e","t","a","e"],
    ["i","h","k","r"],
    ["i","f","l","v"]
  ];
  let words = ["oath","pea","eat","rain"];

  try {
    const boardMatch = inputStr.match(/board\s*=\s*(\[\[.*?\]\])/);
    if (boardMatch) {
      board = JSON.parse(boardMatch[1].replace(/'/g, '"'));
    }
    const wordsMatch = inputStr.match(/words\s*=\s*(\[.*?\])/);
    if (wordsMatch) {
      words = JSON.parse(wordsMatch[1].replace(/'/g, '"'));
    }
  } catch (e) {
    // fallback to defaults
  }

  const steps: any[] = [];
  let nodeIdCounter = 0;
  
  class TrieNode {
    id: number;
    children: Record<string, TrieNode> = {};
    word: string | null = null;
    char: string;
    
    constructor(char: string = '') {
      this.id = nodeIdCounter++;
      this.char = char;
    }
  }

  const root = new TrieNode('root');
  
  for (const word of words) {
    let node = root;
    for (const ch of word) {
      if (!node.children[ch]) {
        node.children[ch] = new TrieNode(ch);
      }
      node = node.children[ch];
    }
    node.word = word;
  }

  // Convert N-ary Trie to Left-Child Right-Sibling Binary Tree
  const rawNodes: any[] = [];
  const edges: LayoutEdge[] = [];
  
  const buildLCRS = (node: TrieNode): number => {
    const childrenKeys = Object.keys(node.children);
    let firstChildId: number | undefined = undefined;
    let prevSiblingId: number | undefined = undefined;
    
    for (const key of childrenKeys) {
      const childNode = node.children[key];
      const childLcrsId = buildLCRS(childNode);
      
      if (firstChildId === undefined) {
        firstChildId = childLcrsId;
      } else if (prevSiblingId !== undefined) {
        const prevSibling = rawNodes.find(n => n.id === prevSiblingId);
        if (prevSibling) {
          prevSibling.right = childLcrsId;
          edges.push({ from: prevSibling.id, to: childLcrsId });
        }
      }
      prevSiblingId = childLcrsId;
    }

    const nNode = {
      id: node.id,
      val: node.char,
      state: 'normal',
      left: firstChildId,
      right: undefined as number | undefined
    };

    if (firstChildId !== undefined) {
      edges.push({ from: node.id, to: firstChildId });
    }

    rawNodes.push(nNode);
    return node.id;
  };

  buildLCRS(root);

  const layoutedNodes = LayoutEngine.generateTreeLayout(rawNodes, edges, root.id, 400, 300);

  const getHighlight = (activeId: number) => {
    const h = [];
    if (activeId !== -1) h.push(activeId);
    return h;
  };

  steps.push({
    node: root.id,
    desc: `Trie built using Left-Child Right-Sibling structure with words: ${words.join(', ')}. Starting DFS.`,
    highlight: getHighlight(root.id)
  });

  const result = new Set<string>();
  const R = board.length;
  const C = board[0].length;
  const visited = Array(R).fill(0).map(() => Array(C).fill(false));

  const dfs = (r: number, c: number, node: TrieNode) => {
    if (r < 0 || c < 0 || r >= R || c >= C || visited[r][c]) return;
    
    const ch = board[r][c];
    if (!node.children[ch]) return;
    
    const nextNode = node.children[ch];
    visited[r][c] = true;
    
    if (nextNode.word) {
      result.add(nextNode.word);
      steps.push({
        node: nextNode.id,
        desc: `Found word "${nextNode.word}" at (${r},${c})! Added to results.`,
        highlight: getHighlight(nextNode.id)
      });
      nextNode.word = null; // Prevent duplicates
    } else {
      steps.push({
        node: nextNode.id,
        desc: `Matched char '${ch}' at (${r},${c}). Moving down Trie.`,
        highlight: getHighlight(nextNode.id)
      });
    }

    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
    for (const [dr, dc] of dirs) {
      dfs(r + dr, c + dc, nextNode);
    }
    
    visited[r][c] = false;
    
    steps.push({
      node: node.id,
      desc: `Backtracking from (${r},${c}).`,
      highlight: getHighlight(node.id)
    });
  };

  for (let i = 0; i < R; i++) {
    for (let j = 0; j < C; j++) {
      if (root.children[board[i][j]]) {
        dfs(i, j, root);
      }
    }
  }

  steps.push({
    node: -1,
    desc: `DFS complete. Words found: [${Array.from(result).join(', ')}].`,
    highlight: [],
    finished: true
  });

  return {
    nodes: layoutedNodes,
    edges,
    steps
  };
};
