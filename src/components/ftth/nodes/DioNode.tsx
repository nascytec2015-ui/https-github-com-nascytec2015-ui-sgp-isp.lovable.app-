import React from "react";
import { Handle, Position, NodeProps } from "reactflow";

interface DioNodeData {
    label?: string;
    fibras?: number;
}

export default function DioNode({
    data,
    selected,
}: NodeProps<DioNodeData>) {

    const totalFibras = data.fibras || 48;

    return (
        <div
            style={{
                width: 200,
                background: "#111827",
                color: "white",
                borderRadius: 10,
                padding: 10,
                border: selected
                    ? "3px solid #22c55e"
                    : "2px solid #374151",
                boxShadow:
                    "0 4px 12px rgba(0,0,0,.35)",
                fontFamily: "Arial"
            }}
        >

            {/* Entrada da fibra */}
            <Handle
                type="target"
                position={Position.Left}
                id="entrada"
                style={{
                    background: "#2563eb",
                    width: 12,
                    height: 12
                }}
            />

            <div
                style={{
                    textAlign: "center",
                    marginBottom: 10
                }}
            >

                <strong>
                    {data.label || "DIO"}
                </strong>

                <div
                    style={{
                        fontSize: 12,
                        color: "#9ca3af"
                    }}
                >
                    Distribuidor Óptico
                </div>

            </div>

            <div
                style={{
                    background: "#020617",
                    borderRadius: 6,
                    padding: 6,
                    fontSize: 12,
                    marginBottom: 8
                }}
            >

                Fibras:
                <span style={{
                    color: "#22c55e"
                }}>
                    {" "}
                    {totalFibras}
                </span>

            </div>

            {
                Array.from({
                    length: totalFibras
                }).map((_, index) => {

                    const fibra =
                        index + 1;

                    return (

                        <div
                            key={fibra}
                            style={{
                                position: "relative",
                                height: 20,
                                display: "flex",
                                alignItems: "center",
                                fontSize: 12,
                                paddingLeft: 8
                            }}
                        >

                            Fibra {fibra}


                            <Handle
                                type="source"
                                position={Position.Right}
                                id={`fibra-${fibra}`}
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
    );
}
