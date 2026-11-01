import { LayoutEngine, LayoutNode, LayoutEdge } from '../layoutEngine';

export const designAddAndSearchWordsDataStructureGenerator = (inputStr: string) => {
  let ops: string[] = [];
  let args: any[][] = [];
  try {
    const lines = inputStr.trim().split('\n');
    ops = JSON.parse(lines[0]);
    args = JSON.parse(lines[1]);
  } catch (e) {
    ops = ["WordDictionary","addWord","addWord","addWord","search","search","search","search"];
    args = [[],["bad"],["dad"],["mad"],["pad"],["bad"],[".ad"],["b.."]];
  }

  class TrieNode {
    id: number;
    val: string;
    isEnd: boolean;
    children: Map<string, TrieNode>;
    constructor(id: number, val: string) {
      this.id = id;
      this.val = val;
      this.isEnd = false;
      this.children = new Map();
    }
  }

  let nodeIdCounter = 1;
  const finalRoot = new TrieNode(nodeIdCounter++, "R");

  // Build the full Trie first
  for (let i = 0; i < ops.length; i++) {
    if (ops[i] === "addWord" && args[i] && args[i].length > 0) {
      const word = args[i][0];
      let curr = finalRoot;
      for (const char of word) {
        if (!curr.children.has(char)) {
          curr.children.set(char, new TrieNode(nodeIdCounter++, char));
        }
        curr = curr.children.get(char)!;
      }
      curr.isEnd = true;
    }
  }

  // Convert Trie to Left-Child Right-Sibling (LCRS) Binary Tree format for layout
  const rawNodes: any[] = [];
  const edges: LayoutEdge[] = [];

  function buildLCRS(node: TrieNode) {
    const rawNode: any = { 
      id: node.id, 
      val: node.isEnd ? `${node.val}*` : node.val, 
      state: 'normal' 
    };
    rawNodes.push(rawNode);

    const childrenKeys = Array.from(node.children.keys()).sort();
    if (childrenKeys.length > 0) {
      const firstChild = node.children.get(childrenKeys[0])!;
      rawNode.left = firstChild.id;
      edges.push({ from: node.id, to: firstChild.id });

      buildLCRS(firstChild);

      let prevChild = firstChild;
      for (let i = 1; i < childrenKeys.length; i++) {
        const currChild = node.children.get(childrenKeys[i])!;
        const prevRawNode = rawNodes.find(n => n.id === prevChild.id)!;
        prevRawNode.right = currChild.id;
        edges.push({ from: prevChild.id, to: currChild.id });

        buildLCRS(currChild);
        prevChild = currChild;
      }
    }
  }

  buildLCRS(finalRoot);

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
  getDepth(1, 0);

  const maxDepth = Math.max(...Array.from(depths.keys()));
  const ySpacing = 300 / (maxDepth + 1.5);
  depths.forEach((nodesAtDepth, depth) => {
    const xSpacing = 400 / (nodesAtDepth.length + 1);
    nodesAtDepth.forEach((node, idx) => {
      node.x = xSpacing * (idx + 1);
      node.y = 30 + (depth * ySpacing);
    });
  });

  const nodes = rawNodes;

  const steps: any[] = [];
  steps.push({
    node: -1,
    desc: 'Initialized WordDictionary. Trie mapped to Left-Child (child) Right-Sibling (sibling) Binary Tree format.',
    highlight: [],
  });

  // Re-run simulation to generate steps
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    const arg = args[i] && args[i].length > 0 ? args[i][0] : null;

    if (op === "addWord" && arg !== null) {
      let curr = finalRoot;
      const highlight: number[] = [curr.id];
      steps.push({
        node: curr.id,
        desc: `addWord("${arg}"): Start at root.`,
        highlight: [...highlight],
      });

      for (const char of arg) {
        curr = curr.children.get(char)!;
        highlight.push(curr.id);
        steps.push({
          node: curr.id,
          desc: `addWord("${arg}"): Traverse to '${char}'.`,
          highlight: [...highlight],
        });
      }
      steps.push({
        node: curr.id,
        desc: `addWord("${arg}"): Reached end of word. Marked as end (*).`,
        highlight: [...highlight],
      });
    } else if (op === "search" && arg !== null) {
      const word = arg;
      let found = false;

      function dfs(node: TrieNode, idx: number, highlightPath: number[]): boolean {
        steps.push({
          node: node.id,
          desc: `search("${word}"): Checking node '${node.val}' at depth ${idx}.`,
          highlight: [...highlightPath, node.id],
        });

        if (idx === word.length) {
          if (node.isEnd) {
            steps.push({
              node: node.id,
              desc: `search("${word}"): Reached end of word, node is marked as end. Match found!`,
              highlight: [...highlightPath, node.id],
            });
            return true;
          } else {
            steps.push({
              node: node.id,
              desc: `search("${word}"): Reached end of word but node is not marked as end. Backtrack.`,
              highlight: [...highlightPath, node.id],
            });
            return false;
          }
        }

        const char = word[idx];
        if (char === '.') {
          steps.push({
            node: node.id,
            desc: `search("${word}"): Character is '.', exploring all children.`,
            highlight: [...highlightPath, node.id],
          });

          // Sort keys to explore consistently
          const childrenKeys = Array.from(node.children.keys()).sort();
          for (const ch of childrenKeys) {
            const child = node.children.get(ch)!;
            steps.push({
              node: node.id,
              desc: `search("${word}"): '.' matches '${ch}', recursing.`,
              highlight: [...highlightPath, node.id],
            });
            if (dfs(child, idx + 1, [...highlightPath, node.id])) {
              return true;
            }
          }
          steps.push({
            node: node.id,
            desc: `search("${word}"): No children matched for '.', backtracking.`,
            highlight: [...highlightPath, node.id],
          });
          return false;
        } else {
          if (!node.children.has(char)) {
            steps.push({
              node: node.id,
              desc: `search("${word}"): Character '${char}' not found in children. Backtrack.`,
              highlight: [...highlightPath, node.id],
            });
            return false;
          }
          return dfs(node.children.get(char)!, idx + 1, [...highlightPath, node.id]);
        }
      }

      found = dfs(finalRoot, 0, []);

      steps.push({
        node: -1,
        desc: `search("${word}"): Finished search. Result: ${found}`,
        highlight: [],
      });
    }
  }

  steps.push({
    node: -1,
    desc: 'All operations completed successfully.',
    highlight: [],
    finished: true,
  });

  return { nodes, edges, steps };
};
