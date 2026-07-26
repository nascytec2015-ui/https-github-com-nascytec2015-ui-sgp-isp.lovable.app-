import React from "react";
import { Handle, Position } from "reactflow";

export interface BaseNodeProps {
    title: string;
    subtitle?: string;

    icon?: React.ReactNode;

    power?: number;

    status?: "ok" | "warning" | "critical";

    inputs?: number;
    outputs?: number;

    children?: React.ReactNode;
}

const statusColors = {
    ok: "#22c55e",
    warning: "#eab308",
    critical: "#ef4444",
};

export default function BaseNode({
    title,
    subtitle,
    icon,
    power,
    status = "ok",
    inputs = 1,
    outputs = 1,
    children,
}: BaseNodeProps) {
    return (
        <div
            style={{
                minWidth: 180,
                borderRadius: 12,
                overflow: "hidden",
                background: "#ffffff",
                border: `2px solid ${statusColors[status]}`,
                boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
            }}
        >
            {inputs > 0 && (
                <Handle
                    type="target"
                    position={Position.Left}
                />
            )}

            <div
                style={{
                    background: "#0f172a",
                    color: "#fff",
                    textAlign: "center",
                    padding: 8,
                    fontWeight: 600,
                }}
            >
                {title}
            </div>

            <div
                style={{
                    padding: 12,
                }}
            >
                {icon && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            marginBottom: 10,
                        }}
                    >
                        {icon}
                    </div>
                )}

                {subtitle && (
                    <div
                        style={{
                            textAlign: "center",
                            color: "#555",
                            fontSize: 12,
                            marginBottom: 8,
                        }}
                    >
                        {subtitle}
                    </div>
                )}

                {power !== undefined && (
                    <div
                        style={{
                            textAlign: "center",
                            fontWeight: "bold",
                            marginTop: 6,
                        }}
                    >
                        RX: {power.toFixed(2)} dBm
                    </div>
                )}

                {children}
            </div>

            {outputs > 0 && (
                <Handle
                    type="source"
                    position={Position.Right}
                />
            )}
        </div>
    );
}