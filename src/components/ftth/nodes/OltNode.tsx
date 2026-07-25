import { Handle, Position } from "reactflow";

export default function OltNode({ data }: any) {
    return (
        <div
            style={{
                background: "#fff",
                border: "2px solid #2563eb",
                borderRadius: 8,
                padding: 10,
                minWidth: 120,
                textAlign: "center",
            }}
        >
            <strong>{data.label}</strong>

            <div style={{ fontSize: 12 }}>
                TX: {data.tx} dBm
            </div>

            <Handle
                type="source"
                position={Position.Right}
            />
        </div>
    );
}