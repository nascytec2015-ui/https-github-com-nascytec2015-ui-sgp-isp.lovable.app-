import { FTTHDiagram, FTTHNodeData } from "../types/ftth";

export interface GraphNode {
  node: FTTHNodeData;
  parent?: string;
  children: string[];
}

export class Graph {
  private map = new Map<string, GraphNode>();

  constructor(diagram: FTTHDiagram) {
    // Cria os nós
    diagram.nodes.forEach((node) => {
      this.map.set(node.id, {
        node,
        children: [],
      });
    });

    // Cria as conexões
    diagram.edges.forEach((edge) => {
      const source = this.map.get(edge.from);
      const target = this.map.get(edge.to);

      if (!source || !target) return;

      source.children.push(target.node.id);
      target.parent = source.node.id;
    });
  }

  getNode(id: string): GraphNode | undefined {
    return this.map.get(id);
  }

  getChildren(id: string): GraphNode[] {
    return (
      this.map
        .get(id)
        ?.children.map((childId) => this.map.get(childId))
        .filter((n): n is GraphNode => n !== undefined) ?? []
    );
  }

  getParent(id: string): GraphNode | undefined {
    const node = this.map.get(id);

    if (!node?.parent) return undefined;

    return this.map.get(node.parent);
  }

  getRootNodes(): GraphNode[] {
    return [...this.map.values()].filter((n) => !n.parent);
  }

  findPath(startId: string, endId: string): string[] {
    const queue: string[][] = [[startId]];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const path = queue.shift()!;
      const current = path[path.length - 1];

      if (current === endId) {
        return path;
      }

      if (visited.has(current)) {
        continue;
      }

      visited.add(current);

      for (const child of this.getChildren(current)) {
        queue.push([...path, child.node.id]);
      }
    }

    return [];
  }

  getAncestors(id: string): string[] {
    const result: string[] = [];

    let current = this.getParent(id);

    while (current) {
      result.push(current.node.id);
      current = this.getParent(current.node.id);
    }

    return result;
  }

  getDescendants(id: string): string[] {
    const result: string[] = [];

    const visit = (nodeId: string) => {
      for (const child of this.getChildren(nodeId)) {
        result.push(child.node.id);
        visit(child.node.id);
      }
    };

    visit(id);

    return result;
  }

  detectCycles(): boolean {
    const visited = new Set<string>();
    const stack = new Set<string>();

    const visit = (id: string): boolean => {
      if (stack.has(id)) return true;

      if (visited.has(id)) return false;

      visited.add(id);
      stack.add(id);

      for (const child of this.getChildren(id)) {
        if (visit(child.node.id)) {
          return true;
        }
      }

      stack.delete(id);

      return false;
    };

    for (const root of this.getRootNodes()) {
      if (visit(root.node.id)) {
        return true;
      }
    }

    return false;
  }
}
