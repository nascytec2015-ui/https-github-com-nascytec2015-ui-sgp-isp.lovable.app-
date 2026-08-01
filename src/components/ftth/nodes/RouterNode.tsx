import React from "react";
import { Handle, Position, NodeProps } from "reactflow";

export default function RouterNode({ data }: NodeProps) {
    return (
        <div className="rounded-lg border-2 border-red-500 bg-white shadow-md min-w-[180px]">
            <div className="bg-red-500 text-white px-3 py-1 rounded-t-lg font-semibold">
                🌐 Router
            </div>

            <div className="p-2 text-sm">
                <div><strong>{data?.label ?? "Router"}</strong></div>
                <div>{data?.brand ?? "MikroTik"}</div>
                <div>{data?.model ?? "CCR2216"}</div>
            </div>

            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}