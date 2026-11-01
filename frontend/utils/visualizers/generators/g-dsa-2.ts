import { LayoutEngine, LayoutNode, LayoutEdge } from '../layoutEngine';

export const wordLadderIIGenerator = (inputStr: string) => {
  // Default parsing for: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]'
  let beginWord = "hit";
  let endWord = "cog";
  let wordList = ["hot", "dot", "dog", "lot", "log", "cog"];

  try {
    const beginMatch = inputStr.match(/beginWord\s*=\s*"([^"]+)"/);
    const endMatch = inputStr.match(/endWord\s*=\s*"([^"]+)"/);
    const listMatch = inputStr.match(/wordList\s*=\s*\[(.*?)\]/);
    
    if (beginMatch) beginWord = beginMatch[1];
    if (endMatch) endWord = endMatch[1];
    if (listMatch) {
      wordList = listMatch[1].split(',').map(s => s.replace(/['"\s]/g, ''));
    }
  } catch (e) {
    // fallback to default
  }

  const steps: any[] = [];
  const nodesMap = new Map<string, LayoutNode>();
  const edges: LayoutEdge[] = [];

  const wordSet = new Set(wordList);
  wordSet.add(beginWord);
  
  Array.from(wordSet).forEach(w => {
    nodesMap.set(w, { id: w, label: w, state: 'normal' });
  });

  steps.push({
    desc: `Initialized nodes for all words in the dictionary + beginWord. Target is '${endWord}'.`,
    nodesState: Object.fromEntries(Array.from(nodesMap.keys()).map(w => [w, 'normal'])),
    edgesState: {},
    queue: [beginWord],
    highlightNode: beginWord
  });

  if (!wordSet.has(endWord)) {
    steps.push({
      desc: `endWord '${endWord}' is not in wordList. No path possible.`,
      nodesState: Object.fromEntries(Array.from(nodesMap.keys()).map(w => [w, 'error'])),
      edgesState: {},
      queue: [],
      highlightNode: null,
      finished: true
    });
    const nodes = Array.from(nodesMap.values());
    const layoutedNodes = LayoutEngine.generateForceDirectedLayout(nodes, edges);
    return { nodes: layoutedNodes, edges, steps };
  }

  // BFS to build DAG of shortest paths
  let queue: string[] = [beginWord];
  const distance = new Map<string, number>();
  distance.set(beginWord, 0);

  const adj = new Map<string, string[]>();
  Array.from(wordSet).forEach(w => adj.set(w, []));

  let found = false;
  let currentLevel = 0;

  while (queue.length > 0 && !found) {
    const nextQueue: string[] = [];
    const levelVisited = new Set<string>();

    for (const word of queue) {
      const charArray = word.split('');
      for (let i = 0; i < charArray.length; i++) {
        const original = charArray[i];
        for (let c = 97; c <= 122; c++) { // 'a' to 'z'
          const newChar = String.fromCharCode(c);
          if (newChar === original) continue;
          
          charArray[i] = newChar;
          const newWord = charArray.join('');
          
          if (wordSet.has(newWord)) {
            // If it's not visited or visited in the current level
            if (!distance.has(newWord)) {
              distance.set(newWord, currentLevel + 1);
              nextQueue.push(newWord);
              levelVisited.add(newWord);
              
              adj.get(word)!.push(newWord);
              edges.push({ from: word, to: newWord });
              
              steps.push({
                desc: `BFS: Changed '${original}' to '${newChar}' -> found '${newWord}'. Distance = ${currentLevel + 1}.`,
                nodesState: Object.fromEntries(Array.from(nodesMap.keys()).map(w => [w, distance.has(w) ? 'processed' : 'normal'])),
                edgesState: {},
                queue: [...nextQueue],
                highlightNode: newWord
              });

              if (newWord === endWord) found = true;
            } else if (distance.get(newWord) === currentLevel + 1) {
              adj.get(word)!.push(newWord);
              edges.push({ from: word, to: newWord });
              
              steps.push({
                desc: `BFS: Edge to '${newWord}' found. Distance matches shortest path level.`,
                nodesState: Object.fromEntries(Array.from(nodesMap.keys()).map(w => [w, distance.has(w) ? 'processed' : 'normal'])),
                edgesState: {},
                queue: [...nextQueue],
                highlightNode: newWord
              });
            }
          }
        }
        charArray[i] = original; // backtrack
      }
    }
    queue = nextQueue;
    currentLevel++;
  }

  steps.push({
    desc: found ? `Shortest path DAG built! Target '${endWord}' found at level ${currentLevel}. BFS complete.` : `BFS exhausted without reaching '${endWord}'.`,
    nodesState: Object.fromEntries(Array.from(nodesMap.keys()).map(w => [w, w === endWord && found ? 'processing' : (distance.has(w) ? 'processed' : 'normal')])),
    edgesState: {},
    queue: [],
    highlightNode: found ? endWord : null,
    finished: true
  });

  const nodes = Array.from(nodesMap.values());
  const layoutedNodes = LayoutEngine.generateForceDirectedLayout(nodes, edges);

  return { nodes: layoutedNodes, edges, steps };
};
