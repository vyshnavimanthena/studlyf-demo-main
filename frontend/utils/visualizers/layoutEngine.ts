export interface LayoutNode {
  id: string | number;
  label?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  depth?: number;
  state?: string;
  [key: string]: any;
}

export interface LayoutEdge {
  from: string | number;
  to: string | number;
  [key: string]: any;
}

export class LayoutEngine {
  /**
   * Generates a clean, deterministic topological/sequential 2D layout for DAGs and Graphs.
   * Nodes are arranged systematically in layers.
   */
  static generateTopologicalLayout(
    nodes: LayoutNode[],
    edges: LayoutEdge[],
    width: number = 400,
    height: number = 260
  ): LayoutNode[] {
    const n = nodes.length;
    if (n === 0) return nodes;

    const inDegree = new Map<string | number, number>();
    const adj = new Map<string | number, (string | number)[]>();
    nodes.forEach(node => {
      inDegree.set(node.id, 0);
      adj.set(node.id, []);
    });

    edges.forEach(edge => {
      if (inDegree.has(edge.to)) {
        inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
      }
      if (adj.has(edge.from)) {
        adj.get(edge.from)!.push(edge.to);
      }
    });

    const layers: (string | number)[][] = [];
    let currentLayer: (string | number)[] = [];
    const tempInDegree = new Map(inDegree);

    nodes.forEach(node => {
      if ((tempInDegree.get(node.id) || 0) === 0) {
        currentLayer.push(node.id);
      }
    });

    const visited = new Set<string | number>();
    while (currentLayer.length > 0) {
      layers.push(currentLayer);
      currentLayer.forEach(id => visited.add(id));

      const nextLayer: (string | number)[] = [];
      currentLayer.forEach(u => {
        (adj.get(u) || []).forEach(v => {
          tempInDegree.set(v, (tempInDegree.get(v) || 0) - 1);
          if (tempInDegree.get(v) === 0 && !visited.has(v)) {
            nextLayer.push(v);
          }
        });
      });
      currentLayer = nextLayer;
    }

    const unvisited = nodes.filter(node => !visited.has(node.id)).map(node => node.id);
    if (unvisited.length > 0) {
      layers.push(unvisited);
    }

    const totalLayers = layers.length;
    const xStep = width / (totalLayers + 1);

    layers.forEach((layerNodes, layerIdx) => {
      const x = xStep * (layerIdx + 1);
      const layerSize = layerNodes.length;
      const yStep = height / (layerSize + 1);

      layerNodes.forEach((nodeId, idx) => {
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
          node.x = x;
          const offset = (idx % 2 === 1) ? 12 : -12;
          node.y = yStep * (idx + 1) + (layerSize > 1 ? offset : 0);
        }
      });
    });

    return nodes;
  }

  /**
   * Generates an automatic 2D force-directed layout for a generic graph.
   * Eliminates the need for dummy x/y coordinates.
   */
  static generateForceDirectedLayout(
    nodes: LayoutNode[],
    edges: LayoutEdge[],
    width: number = 400,
    height: number = 300,
    iterations: number = 100
  ): LayoutNode[] {
    // If graph is small or DAG, prefer topological layout
    if (nodes.length <= 12) {
      return LayoutEngine.generateTopologicalLayout(nodes, edges, width, height);
    }

    const K = Math.sqrt((width * height) / (nodes.length || 1));
    const repulsion = (distance: number) => (K * K) / (distance || 1);
    const attraction = (distance: number) => (distance * distance) / K;

    // Deterministic initial positions based on index
    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI;
      node.x = node.x ?? (width / 2 + (width * 0.35) * Math.cos(angle));
      node.y = node.y ?? (height / 2 + (height * 0.35) * Math.sin(angle));
      node.vx = 0;
      node.vy = 0;
    });

    for (let iter = 0; iter < iterations; iter++) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = 0; j < nodes.length; j++) {
          if (i !== j) {
            const dx = nodes[i].x! - nodes[j].x!;
            const dy = nodes[i].y! - nodes[j].y!;
            const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
            const force = repulsion(distance);
            nodes[i].vx! += (dx / distance) * force;
            nodes[i].vy! += (dy / distance) * force;
          }
        }
      }

      edges.forEach((edge) => {
        const u = nodes.find(n => n.id === edge.from);
        const v = nodes.find(n => n.id === edge.to);
        if (u && v) {
          const dx = v.x! - u.x!;
          const dy = v.y! - u.y!;
          const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const force = attraction(distance);
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;
          
          u.vx! += fx;
          u.vy! += fy;
          v.vx! -= fx;
          v.vy! -= fy;
        }
      });

      const temperature = Math.max(10, 50 * Math.pow(0.9, iter));
      nodes.forEach((node) => {
        const vLength = Math.sqrt(node.vx! * node.vx! + node.vy! * node.vy!);
        if (vLength > 0) {
          node.x! += (node.vx! / vLength) * Math.min(vLength, temperature);
          node.y! += (node.vy! / vLength) * Math.min(vLength, temperature);
        }
        
        node.x = Math.max(30, Math.min(width - 30, node.x!));
        node.y = Math.max(30, Math.min(height - 30, node.y!));
        
        node.vx = 0;
        node.vy = 0;
      });
    }

    return nodes;
  }

  /**
   * Generates a hierarchical tree layout given a set of nodes and root.
   */
  static generateTreeLayout(
    nodes: LayoutNode[],
    edges: LayoutEdge[],
    rootId: string | number,
    width: number = 400,
    height: number = 300
  ): LayoutNode[] {
    const adj = new Map<string | number, (string | number)[]>();
    edges.forEach(e => {
      if (!adj.has(e.from)) adj.set(e.from, []);
      adj.get(e.from)!.push(e.to);
    });

    const depths = new Map<number, (string | number)[]>();
    const nodeDepth = new Map<string | number, number>();
    
    // BFS to assign depths
    const queue: { id: string | number, d: number }[] = [{ id: rootId, d: 0 }];
    const visited = new Set<string | number>();

    while (queue.length > 0) {
      const { id, d } = queue.shift()!;
      if (!visited.has(id)) {
        visited.add(id);
        nodeDepth.set(id, d);
        if (!depths.has(d)) depths.set(d, []);
        depths.get(d)!.push(id);
        
        (adj.get(id) || []).forEach(child => {
          if (!visited.has(child)) {
            queue.push({ id: child, d: d + 1 });
          }
        });
      }
    }

    const maxDepth = Math.max(...Array.from(depths.keys()));
    const availableHeight = Math.max(120, height - 100);
    const ySpacing = maxDepth > 0 ? availableHeight / maxDepth : 0;

    depths.forEach((nodesAtDepth, depth) => {
      const xSpacing = width / (nodesAtDepth.length + 1);
      nodesAtDepth.forEach((nodeId, idx) => {
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
          node.x = xSpacing * (idx + 1);
          node.y = 55 + (depth * ySpacing);
        }
      });
    });

    // Handle disjoint nodes (if any)
    let disjointX = 30;
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        node.x = disjointX;
        node.y = height - 30;
        disjointX += 40;
      }
    });

    return nodes;
  }
}
