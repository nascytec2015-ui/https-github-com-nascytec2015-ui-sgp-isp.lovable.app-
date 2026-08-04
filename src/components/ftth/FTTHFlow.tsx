import React, { useCallback } from "react";

import ReactFlow, { Background, Controls, MiniMap, Node, Edge, } from "reactflow";

import "reactflow/dist/style.css";

import type { FTTHDiagram, FNode, FEdge } from "./types/ftth";

import RouterNode from "./nodes/RouterNode";
import OltNode from "./nodes/OltNode";
import DioNode from "./nodes/DioNode";
import CeoNode from "./nodes/CeoNode";
import SplitterNode from "./nodes/SplitterNode";
import CtoNode from "./nodes/CtoNode";
import ClienteNode from "./nodes/ClienteNode";
import EmendaNode from "./nodes/EmendaNode";

import { canConnect } from "./connectionRules";
import { signalColor } from "./utils/signalColor";

import { useDnD } from "./hooks/useDnD";

const nodeTypes = {
    router: RouterNode,
    olt: OltNode,
    dio: DioNode,
    ceo: CeoNode,
    splitter: SplitterNode,
    cto: CtoNode,
    cliente: ClienteNode,
    emenda: EmendaNode,
};

import type { OpticalResult } from "./OpticalEngine";


interface FTTHFlowProps {

    diagram: FTTHDiagram;

    setDiagram: React.Dispatch<
        React.SetStateAction<FTTHDiagram>
    >;

    powers: OpticalResult;

    onSelectNode?: (id: string) => void;

    onSelectEdge?: (id: string) => void;

}

export default function FTTHFlow({
    diagram,
    setDiagram,
    powers,
    onSelectNode,
    onSelectEdge,  
    
}: FTTHFlowProps) {

    const {
        draggedType,
        setDraggedType,
    } = useDnD();

    const nodes: Node[] = (diagram.nodes ?? []).map((n: FNode) => {
        const power = powers.rx[n.id] ?? 0;

        return {
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

                tx: powers.tx[n.id] ?? 0,
                power,
                status: signalColor(power),
            },
            type: n.type,
        };
    });

    const edges: Edge[] = (diagram.edges ?? []).map((e: FEdge) => ({
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

            const novaEdge: FEdge = {
                id: `${params.source}-${params.target}`,
                from: params.source,
                to: params.target,

                length_m: 0,
                connectors: 0,
            };

            setDiagram((old) => ({

                ...old,

                edges: [
                    ...(old.edges ?? []),
                    novaEdge,
                ],

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
                onNodeClick={(_, node) => onSelectNode?.(node.id)}
                onEdgeClick={(_, edge) => onSelectEdge?.(edge.id)}
            >
                <Background />
                <MiniMap />
                <Controls />
            </ReactFlow>
        </div>
    );
}
