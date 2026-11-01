import { LayoutEngine, LayoutNode, LayoutEdge } from '../layoutEngine';

export const designTwitterGenerator = (inputStr: string) => {
  const commandsStr = inputStr || 'postTweet(1, "tweet1"), follow(1, 2), getNewsFeed(1)';
  const matches = [...commandsStr.matchAll(/(\w+)\(([^)]*)\)/g)];
  
  const steps: any[] = [];
  const nodesMap = new Map<string, LayoutNode>();
  const edgesMap = new Map<string, LayoutEdge>();
  
  let time = 0;
  const tweets = new Map<string, {time: number, tweetId: string, id: string}[]>();
  const following = new Map<string, Set<string>>();
  
  const ensureUserNode = (userId: string) => {
    const id = `U${userId}`;
    if (!nodesMap.has(id)) {
      nodesMap.set(id, { id, label: `U${userId}`, state: 'normal' });
    }
    if (!tweets.has(userId)) tweets.set(userId, []);
    if (!following.has(userId)) following.set(userId, new Set());
    return id;
  };
  
  steps.push({
    desc: `Initialized Twitter system.`,
    nodesState: {},
    edgesState: {}
  });

  const getNodesState = () => Object.fromEntries(Array.from(nodesMap.keys()).map(k => [k, 'normal']));
  const getEdgesState = () => Object.fromEntries(Array.from(edgesMap.keys()).map(k => [k, 'normal']));
  
  matches.forEach(match => {
    const cmd = match[1];
    const args = match[2].split(',').map(s => s.trim().replace(/['"]/g, ''));
    
    if (cmd === 'postTweet') {
      const [userId, tweetStr] = args;
      const uId = ensureUserNode(userId);
      const tId = `T${tweetStr}`; // use T prefix for uniqueness
      
      nodesMap.set(tId, { id: tId, label: tweetStr, state: 'normal' });
      tweets.get(userId)!.push({ time: time++, tweetId: tweetStr, id: tId });
      
      const edgeId = `${uId}-${tId}`;
      edgesMap.set(edgeId, { from: uId, to: tId });
      
      steps.push({
        desc: `User ${userId} posted tweet '${tweetStr}'.`,
        nodesState: { ...getNodesState(), [uId]: 'processing', [tId]: 'processed' },
        edgesState: { ...getEdgesState(), [edgeId]: 'processed' }
      });
      
    } else if (cmd === 'follow') {
      const [followerId, followeeId] = args;
      const fId1 = ensureUserNode(followerId);
      const fId2 = ensureUserNode(followeeId);
      
      following.get(followerId)!.add(followeeId);
      
      const edgeId = `${fId1}-${fId2}`;
      edgesMap.set(edgeId, { from: fId1, to: fId2 });
      
      steps.push({
        desc: `User ${followerId} started following User ${followeeId}.`,
        nodesState: { ...getNodesState(), [fId1]: 'processing', [fId2]: 'processed' },
        edgesState: { ...getEdgesState(), [edgeId]: 'processed' }
      });
      
    } else if (cmd === 'unfollow') {
      const [followerId, followeeId] = args;
      const fId1 = ensureUserNode(followerId);
      const fId2 = ensureUserNode(followeeId);
      
      following.get(followerId)!.delete(followeeId);
      
      const edgeId = `${fId1}-${fId2}`;
      edgesMap.delete(edgeId);
      
      steps.push({
        desc: `User ${followerId} unfollowed User ${followeeId}.`,
        nodesState: { ...getNodesState(), [fId1]: 'processing', [fId2]: 'normal' },
        edgesState: getEdgesState()
      });
      
    } else if (cmd === 'getNewsFeed') {
      const [userId] = args;
      const uId = ensureUserNode(userId);
      
      steps.push({
        desc: `Fetching news feed for User ${userId}.`,
        nodesState: { ...getNodesState(), [uId]: 'processing' },
        edgesState: getEdgesState()
      });
      
      const users = new Set([userId]);
      following.get(userId)?.forEach(f => users.add(f));
      
      const nState = { ...getNodesState() };
      users.forEach(u => nState[`U${u}`] = 'processing');
      
      steps.push({
        desc: `User ${userId} follows: ${Array.from(users).join(', ')}. Collecting their most recent tweets...`,
        nodesState: nState,
        edgesState: getEdgesState()
      });
      
      const heap: any[] = [];
      users.forEach(u => {
        const userTweets = tweets.get(u) || [];
        if (userTweets.length > 0) {
          const idx = userTweets.length - 1;
          const tw = userTweets[idx];
          heap.push({ time: tw.time, tweetId: tw.tweetId, uId: u, idx, id: tw.id });
        }
      });
      
      const result: string[] = [];
      
      while (heap.length > 0 && result.length < 10) {
        heap.sort((a, b) => b.time - a.time); // Max heap (most recent first)
        const curr = heap.shift()!;
        
        result.push(curr.tweetId);
        
        steps.push({
          desc: `Adding most recent tweet '${curr.tweetId}' (from User ${curr.uId}) to feed.`,
          nodesState: { ...getNodesState(), [uId]: 'processing', [curr.id]: 'processed' },
          edgesState: { ...getEdgesState(), [`U${curr.uId}-${curr.id}`]: 'processed' }
        });
        
        if (curr.idx > 0) {
          const prevTw = tweets.get(curr.uId)![curr.idx - 1];
          heap.push({ time: prevTw.time, tweetId: prevTw.tweetId, uId: curr.uId, idx: curr.idx - 1, id: prevTw.id });
        }
      }
      
      steps.push({
        desc: `News feed for User ${userId}: [${result.join(', ')}].`,
        nodesState: { ...getNodesState(), [uId]: 'processed' },
        edgesState: getEdgesState()
      });
    }
  });
  
  const nodes = Array.from(nodesMap.values());
  const edges = Array.from(edgesMap.values());
  const layoutedNodes = LayoutEngine.generateForceDirectedLayout(nodes, edges);

  return { nodes: layoutedNodes, edges, steps };
};
