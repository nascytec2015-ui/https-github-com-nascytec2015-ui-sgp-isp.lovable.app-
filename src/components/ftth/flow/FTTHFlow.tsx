import React, { useCallback } from "react";

import ReactFlow, { Background, Controls, MiniMap, Node, Edge, } from "reactflow";

import "reactflow/dist/style.css";

import OltNode from "../nodes/OltNode";

import DioNode from "../nodes/DioNode";

import SplitterNode from "../nodes/SplitterNode";

import ClienteNode from "../nodes/ClienteNode";

const nodeTypes = {
    olt: OltNode,
    dio: DioNode,
    splitter: SplitterNode,
    cliente: ClienteNode,

};

import { canConnect } from "../utils/connectionRules";

import { signalColor } from "../utils/signalColor";

interface FTTHFlowProps {
    diagram: any;
    setDiagram: React.Dispatch<React.SetStateAction<any>>;
    powers: any;
    onSelectNode: (id: string | null) => void;
    onSelectEdge: (id: string | null) => void;
}

export default function FTTHFlow({
    diagram,
    setDiagram,
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
            tipo: n.type,
            modelo: n.modelo,
            fabricante: n.fabricante,
            portas: n.portas,
            portasUsadas: n.portasUsadas,
            portasSaida: n.portasSaida,
            tx: powers[n.id],
            power: powers[n.id],
            status: signalColor(
                powers[n.id]
            )
        },
        type: n.type,
    }));

    const edges: Edge[] = (diagram.edges ?? []).map((e: any) => ({
        id: e.id,
        source: e.from,
        target: e.to,
    }));

    const onConnect = useCallback(
        (params: any) => {

            const source =
                nodes.find(
                    n => n.id === params.source
                );

            const target =
                nodes.find(
                    n => n.id === params.target
                );

            if (!source || !target)
                return;

            const permitido =
                canConnect(
                    source.data.tipo,
                    target.data.tipo
                );

            if (!permitido) {

                console.warn(
                    "Conexão FTTH inválida",
                    source.data.tipo,
                    "->",
                    target.data.tipo
                );

                return;
            }

            const novaEdge = {

                id:
                    `${params.source}-${params.target}`,

                from:
                    params.source,

                to:
                    params.target,

            };

            setDiagram((old: any) => ({

                ...old,

                edges: [
                    ...(old.edges ?? []),
                    novaEdge
                ]

            }));
        },
        [
            nodes,
            setDiagram
        ]
    );

    return (
        <div style={{ width: "100%", height: "72vh" }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                onConnect={onConnect}
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
