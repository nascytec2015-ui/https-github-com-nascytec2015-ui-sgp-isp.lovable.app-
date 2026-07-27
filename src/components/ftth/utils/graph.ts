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
        diagram.nodes.forEach(node => {

            this.map.set(node.id, {
                node,
                children: []
            });

        });

        // Liga os nós
        diagram.edges.forEach(edge => {

            const source = this.map.get(edge.from);
            const target = this.map.get(edge.to);

            if (!source || !target)
                return;

            source.children.push(target.node.id);

            target.parent = source.node.id;

        });

    }

    getNode(id: string) {
        return this.map.get(id);
    }

    getChildren(id: string) {

        return this.map
            .get(id)
            ?.children
            .map(child => this.map.get(child))
            .filter(Boolean) as GraphNode[];

    }

    getParent(id: string) {

        const node = this.map.get(id);

        if (!node?.parent)
            return undefined;

        return this.map.get(node.parent);

    }

    getRootNodes() {

        return [...this.map.values()]
            .filter(n => !n.parent);

    }

}