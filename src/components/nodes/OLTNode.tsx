import { Handle, Position } from "reactflow";
import { Cpu } from "lucide-react";

export default function OltNode({ data }: any) {
    return (
        <div className="min-w-[180px] rounded-lg border-2 border-blue-600 bg-white shadow-lg">

            <Handle type="source" position={Position.Right} />

            <div className="bg-blue-600 text-white px-3 py-2 rounded-t-lg flex items-center gap-2">
                <Cpu size={18} />
                <strong>OLT</strong>
            </div>

            <div className="p-3 text-sm">
                <div><b>{data.label}</b></div>
                <div>TX: {data.tx ?? 3} dBm</div>
            </div>

        </div>
    );
}