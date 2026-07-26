import React from "react";
import BaseNode from "./BaseNode";

interface OltNodeProps {
    data: {
        label?: string;
        modelo?: string;
        fabricante?: string;
        tx?: number;
        power?: number;
    };
}

export default function OltNode({ data }: OltNodeProps) {
    return (
        <BaseNode
            title="OLT"
            subtitle={data.modelo ?? data.label ?? "Huawei"}
            power={data.tx ?? data.power ?? 3}
            status="ok"
            inputs={0}
            outputs={16}
        >
            <div
                style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: "#475569",
                    textAlign: "center",
                }}
            >
                Fabricante: {data.fabricante ?? "Huawei"}
            </div>
        </BaseNode>
    );
}