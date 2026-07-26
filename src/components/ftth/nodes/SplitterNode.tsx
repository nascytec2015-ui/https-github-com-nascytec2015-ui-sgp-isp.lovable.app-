import React from "react";
import BaseNode from "./BaseNode";

interface SplitterNodeProps {
    data: {
        label?: string;
        modelo?: string;
        power?: number;
        status?: "ok" | "warning" | "critical";
        portasSaida?: number;
    };
}

export default function SplitterNode({ data }: SplitterNodeProps) {
    return (
        <BaseNode
            title="Splitter"
            subtitle={data.modelo ?? data.label ?? "1x8"}
            power={data.power}
            status={data.status ?? "ok"}
            inputs={1}
            outputs={data.portasSaida ?? 8}
        >
            <div
                style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: "#475569",
                    textAlign: "center",
                }}
            >
                Saídas: {data.portasSaida ?? 8}
            </div>
        </BaseNode>
    );
}