import React from "react";
import { Handle, Position, NodeProps } from "reactflow";

export default function DioNode({ data }: NodeProps) {
    return (
        <div className="rounded-lg border-2 border-blue-600 bg-white shadow-md min-w-[170px]">
            <div className="bg-blue-600 text-white px-3 py-1 rounded-t-lg font-semibold">
                🔵 DIO
            </div>

            <div className="p-2 text-sm">
                <div><strong>{data?.label ?? "DIO Principal"}</strong></div>
                <div>{data?.fibers ?? 96} fibras</div>
            </div>

            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}