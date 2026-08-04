import React from "react";
import { Handle, Position, NodeProps } from "reactflow";

export default function EmendaNode({ data }: NodeProps) {
  return (
    <div className="rounded-lg border-2 border-yellow-500 bg-white shadow-md min-w-[150px]">
      <div className="bg-yellow-500 text-white px-3 py-1 rounded-t-lg font-semibold">🟡 Emenda</div>

      <div className="p-2 text-sm">
        <div>
          <strong>{data?.label ?? "Emenda"}</strong>
        </div>
      </div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
