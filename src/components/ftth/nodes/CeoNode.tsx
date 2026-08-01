import React from "react";
import { Handle, Position, NodeProps } from "reactflow";

export default function CeoNode({ data }: NodeProps) {
    return (
        <div className="rounded-lg border-2 border-orange-500 bg-white shadow-md min-w-[170px]">
            <div className="bg-orange-500 text-white px-3 py-1 rounded-t-lg font-semibold">
                🟠 CEO
            </div>

            <div className="p-2 text-sm">
                <div><strong>{data?.label ?? "CEO"}</strong></div>
                <div>{data?.splices ?? 24} fusões</div>
            </div>

            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}