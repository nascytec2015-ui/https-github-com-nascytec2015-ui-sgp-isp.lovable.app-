import { Handle, Position } from "reactflow";

export interface BaseNodeProps {
    title: string;
    subtitle?: string;

    power?: number;

    status?: "ok" | "warning" | "critical";

    icon?: React.ReactNode;

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
    power,
    status = "ok",
    icon,
    inputs = 1,
    outputs = 1,
    children,
}: BaseNodeProps) {
    return (
        <div
            style={{
                minWidth: 180,
                background: "#fff",
                border: `2px solid ${statusColors[status]}`,
                borderRadius: 12,
                boxShadow: "0 4px 10px rgba(0,0,0,.15)",
                overflow: "hidden",
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
                    background: "#1e293b",
                    color: "#fff",
                    padding: "8px",
                    fontWeight: 600,
                    textAlign: "center",
                }}
            >
                {title}
            </div>

            <div
                style={{
                    padding: 10,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: 8,
                    }}
                >
                    {icon}
                </div>

                {subtitle && (
                    <div
                        style={{
                            textAlign: "center",
                            fontSize: 12,
                            color: "#666",
                        }}
                    >
                        {subtitle}
                    </div>
                )}

                {power !== undefined && (
                    <div
                        style={{
                            marginTop: 10,
                            textAlign: "center",
                            fontWeight: 600,
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
