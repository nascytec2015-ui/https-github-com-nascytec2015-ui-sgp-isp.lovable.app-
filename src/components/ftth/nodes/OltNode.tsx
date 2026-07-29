import React from "react";
import { Handle, Position, NodeProps } from "reactflow";

interface OltNodeData {
    label?: string;
    modelo?: string;
    portas?: number;
    tx?: number;
    rx?: number;
}

export default function OltNode({
    data,
    selected,
}: NodeProps<OltNodeData>) {

    const totalPortas = data.portas || 16;

    return (
        <div
            style={{
                width: 180,
                background: "#111827",
                borderRadius: 10,
                border: selected
                    ? "3px solid #22c55e"
                    : "2px solid #374151",
                color: "white",
                padding: 10,
                boxShadow:
                    "0 4px 12px rgba(0,0,0,.35)",
                fontFamily: "Arial",
            }}
        >

            {/* Entrada de fibra */}
            <Handle
                type="target"
                position={Position.Left}
                id="entrada"
                style={{
                    background: "#3b82f6",
                    width: 12,
                    height: 12
                }}
            />


            <div
                style={{
                    textAlign: "center",
                    marginBottom: 8
                }}
            >
                <strong>
                    {data.label || "OLT"}
                </strong>

                <div
                    style={{
                        fontSize: 12,
                        color: "#9ca3af"
                    }}
                >
                    {data.modelo || "Huawei MA5800"}
                </div>
            </div>


            {/* Display óptico */}
            <div
                style={{
                    background: "#020617",
                    padding: 6,
                    borderRadius: 6,
                    marginBottom: 10,
                    fontSize: 12
                }}
            >
                TX:
                <span style={{ color: "#22c55e" }}>
                    {" "}
                    {data.tx ?? 0} dBm
                </span>

                <br />

                RX:
                <span style={{ color: "#38bdf8" }}>
                    {" "}
                    {data.rx ?? 0} dBm
                </span>

            </div>


            {/* Portas PON */}
            <div>

                {
                    Array.from({
                        length: totalPortas
                    }).map((_, index) => {

                        const porta =
                            index + 1;

                        return (

                            <div
                                key={porta}
                                style={{
                                    position: "relative",
                                    height: 22,
                                    display: "flex",
                                    alignItems: "center",
                                    fontSize: 12,
                                    paddingLeft: 8
                                }}
                            >

                                PON {porta}


                                <Handle
                                    type="source"
                                    position={Position.Right}
                                    id={`pon-${porta}`}
                                    style={{
                                        right: -7,
                                        top: "50%",
                                        transform:
                                            "translateY(-50%)",
                                        background: "#22c55e",
                                        width: 10,
                                        height: 10
                                    }}
                                />

                            </div>

                        );
                    })
                }

            </div>


        </div>
    );
}