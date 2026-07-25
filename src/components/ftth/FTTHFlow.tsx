import React from "react";
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    Node,
    Edge,
} from "reactflow";

import "reactflow/dist/style.css";

import OltNode from "./nodes/OltNode";

const nodeTypes = {
    olt: OltNode,
};

interface FTTHFlowProps {
    diagram: any;
    setDiagram: React.Dispatch<React.SetStateAction<any>>;
    powers: any;
    onSelectNode: (id: string | null) => void;
    onSelectEdge: (id: string | null) => void;
}

export default function FTTHFlow({
    diagram,
    powers,
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
            tx: powers?.tx?.[n.id] ?? 3,
        },
        type: n.type,
    }));

    return (
        <div style={{ width: "100%", height: "72vh" }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
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
