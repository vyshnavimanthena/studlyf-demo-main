export const lruCacheGenerator = (inputStr: string) => {
  // Parse capacity from input. Default 2.
  let capacity = 2;
  const capMatch = inputStr.match(/capacity\s*=\s*(\d+)/i);
  if (capMatch) {
    capacity = parseInt(capMatch[1], 10);
  }

  // Parse operations
  const opsRegex = /(put|get)\(\s*(\d+)(?:\s*,\s*(\d+))?\s*\)/gi;
  const operations: any[] = [];
  let match;
  while ((match = opsRegex.exec(inputStr)) !== null) {
    const type = match[1].toLowerCase();
    const key = parseInt(match[2], 10);
    const value = match[3] ? parseInt(match[3], 10) : undefined;
    operations.push({ type, key, value });
  }

  if (operations.length === 0) {
    // default
    operations.push(
      { type: 'put', key: 1, value: 1 },
      { type: 'put', key: 2, value: 2 },
      { type: 'get', key: 1 },
      { type: 'put', key: 3, value: 3 },
      { type: 'get', key: 2 },
      { type: 'put', key: 4, value: 4 },
      { type: 'get', key: 1 },
      { type: 'get', key: 3 },
      { type: 'get', key: 4 }
    );
  }

  const steps: any[] = [];
  
  // LRU Implementation for simulation
  class Node {
    key: number;
    val: number;
    prev: Node | null = null;
    next: Node | null = null;
    constructor(key: number, val: number) {
      this.key = key;
      this.val = val;
    }
  }

  const cache = new Map<number, Node>();
  const head = new Node(-1, -1);
  const tail = new Node(-1, -1);
  head.next = tail;
  tail.prev = head;

  const removeNode = (node: Node) => {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  };

  const addNodeToTail = (node: Node) => {
    node.prev = tail.prev;
    node.next = tail;
    tail.prev!.next = node;
    tail.prev = node;
  };

  // Helper to serialize current state to visualizer nodes
  const snapshotNodes = (activeKey?: number) => {
    const result = [];
    result.push({ id: 'dummy-head', val: 'HEAD', isHead: true, isTail: false });
    
    let curr = head.next;
    while (curr !== tail) {
      result.push({
        id: curr!.key,
        val: `${curr!.key}:${curr!.val}`,
        isHead: false,
        isTail: false
      });
      curr = curr!.next;
    }
    
    result.push({ id: 'dummy-tail', val: 'TAIL', isHead: false, isTail: true });
    return result;
  };

  steps.push({
    nodes: snapshotNodes(),
    desc: `Initialized LRU Cache with capacity = ${capacity} and dummy HEAD/TAIL pointers.`,
    curr: -1
  });

  for (const op of operations) {
    if (op.type === 'get') {
      const key = op.key;
      if (cache.has(key)) {
        const node = cache.get(key)!;
        removeNode(node);
        addNodeToTail(node);
        steps.push({
          nodes: snapshotNodes(),
          desc: `get(${key}) -> ${node.val}. Moved key ${key} to tail (most recently used).`,
          curr: key
        });
      } else {
        steps.push({
          nodes: snapshotNodes(),
          desc: `get(${key}) -> -1. Key ${key} not found in cache.`,
          curr: -1
        });
      }
    } else if (op.type === 'put') {
      const key = op.key;
      const val = op.value!;
      if (cache.has(key)) {
        const node = cache.get(key)!;
        node.val = val;
        removeNode(node);
        addNodeToTail(node);
        steps.push({
          nodes: snapshotNodes(),
          desc: `put(${key}, ${val}) -> Updated existing key. Moved ${key} to tail.`,
          curr: key
        });
      } else {
        const newNode = new Node(key, val);
        cache.set(key, newNode);
        addNodeToTail(newNode);
        
        if (cache.size > capacity) {
          const lru = head.next!;
          removeNode(lru);
          cache.delete(lru.key);
          steps.push({
            nodes: snapshotNodes(),
            desc: `put(${key}, ${val}) -> Inserted new key. Capacity exceeded. Evicted least recently used key ${lru.key}.`,
            curr: key
          });
        } else {
          steps.push({
            nodes: snapshotNodes(),
            desc: `put(${key}, ${val}) -> Inserted new key. Cache size is now ${cache.size}.`,
            curr: key
          });
        }
      }
    }
  }

  steps.push({
    nodes: snapshotNodes(),
    desc: 'All operations completed.',
    curr: -1,
    finished: true
  });

  return {
    nodes: [], // fallback, steps will provide the nodes dynamically
    isDoublyLinked: true,
    isReverseProblem: false,
    steps
  };
};
