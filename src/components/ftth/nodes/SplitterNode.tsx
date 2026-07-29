import React from "react";
import { Handle, Position } from "reactflow";

interface SplitterNodeProps {
    data: {
        label?: string;
        ratio?: number;
        loss?: number;
    };
}

export default function SplitterNode({
    data
}: SplitterNodeProps) {

    const ratio = data.ratio || 8;

    const loss = data.loss ??
        ({
            2: 3.5,
            4: 7.2,
            8: 10.5,
            16: 13.5,
            32: 17
        }[ratio]);


    return (
        <div
            style={{
                width: 160,
                padding: 12,
                borderRadius: 10,
                background: "#111827",
                color: "#fff",
                border: "2px solid #22c55e"
            }}
        >

            <Handle
                type="target"
                position={Position.Left}
            />


            <strong>
                {data.label || "Splitter"}
            </strong>


            <div>
                Divisão: 1:{ratio}
            </div>


            <div>
                Perda: -{loss} dB
            </div>


            <Handle
                type="source"
                position={Position.Right}
            />

        </div>
    );
}