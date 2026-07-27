import { FTTHDiagram, FTTHNodeData } from "../types/ftth";

export interface GraphNode {
    node: FTTHNodeData;
    parent?: string;
    children: string[];
}

export class Graph {

    ...

    getRootNodes() {
        return [...this.map.values()]
            .filter(n => !n.parent);
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

            const children = this.getChildren(nodeId);

            for (const child of children) {
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

            if (stack.has(id))
                return true;

            if (visited.has(id))
                return false;

            visited.add(id);

            stack.add(id);

            const children = this.getChildren(id);

            for (const child of children) {

                if (visit(child.node.id))
                    return true;

            }

            stack.delete(id);

            return false;

        };

        for (const node of this.getRootNodes()) {

            if (visit(node.node.id))
                return true;

        }

        return false;
    }

}
