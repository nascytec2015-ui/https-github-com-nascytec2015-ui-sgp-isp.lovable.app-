import { Handle, Position } from "reactflow";

export default function DioNode({ data }: any) {
    return (
        <div
            style={{
                width: 90,
                border: "2px solid #2563eb",
                borderRadius: 8,
                background: "#eff6ff",
                padding: 8,
                textAlign: "center",
            }}
        >
            <Handle type="target" position={Position.Left} />

            <strong>DIO</strong>

            <div style={{ fontSize: 11 }}>
                {data.label}
            </div>

            <Handle type="source" position={Position.Right} />
        </div>
    );
}