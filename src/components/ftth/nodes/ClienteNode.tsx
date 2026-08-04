import React from "react";
import { Handle, Position } from "reactflow";

interface ClienteNodeProps {
  data: {
    label?: string;
    rx?: number;
  };
}

export default function ClienteNode({ data }: ClienteNodeProps) {
  return (
    <div
      style={{
        width: 150,
        padding: 12,
        borderRadius: 10,
        background: "#2563eb",
        color: "#fff",
        border: "2px solid #60a5fa",
      }}
    >
      <Handle type="target" position={Position.Left} />

      <strong>{data.label || "Cliente"}</strong>

      <div>RX: {data.rx ?? "--"} dBm</div>
    </div>
  );
}
