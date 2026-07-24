import React from "react";
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    Node,
    Edge,
} from "reactflow";

import "reactflow/dist/style.css";

interface FTTHFlowProps {
    diagram: any;
    setDiagram: React.Dispatch<React.SetStateAction<any>>;
    powers: any;
    onSelectNode: (id: string | null) => void;
    onSelectEdge: (id: string | null) => void;
}

export default function FTTHFlow({
    diagram,
    onSelectNode,
    onSelectEdge,
}: FTTHFlowProps) {
    const nodes: Node[] = (diagram.nodes ?? []).map((n: any) => ({
        id: n.id,
        position: {
            x: n.x,
            y: n.y,
        },
        data: {
            label: n.label,
        },
        type: "default",
    }));

    const edges: Edge[] = (diagram.edges ?? []).map((e: any) => ({
        id: e.id,
        source: e.from,
        target: e.to,
    }));

    return (
        <div style={{ width: "100%", height: "72vh" }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
                onNodeClick={(_, node) => onSelectNode(node.id)}
                onEdgeClick={(_, edge) => onSelectEdge(edge.id)}
            >
                <Background />
                <MiniMap />
                <Controls />
            </ReactFlow>
        </div>
    );
}