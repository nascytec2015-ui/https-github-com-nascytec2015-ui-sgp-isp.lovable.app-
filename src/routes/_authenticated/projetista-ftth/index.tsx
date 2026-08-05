import { useCallback, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { type Edge, type Node } from "reactflow";
import { Card, CardContent } from "@/components/ui/card";

import Toolbar from "@/components/ftth/Toolbar";
import Sidebar from "@/components/ftth/Sidebar";
import Canvas from "@/components/ftth/Canvas";
import PropertiesPanel from "@/components/ftth/PropertiesPanel";
import type { EquipmentItem } from "@/components/ftth/data/equipments";

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export const Route = createFileRoute("/_authenticated/projetista-ftth/")({
  component: ProjetistaFTTHPage,
});

function ProjetistaFTTHPage() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const handleAddEquipment = useCallback((equipment: EquipmentItem) => {
    setNodes((currentNodes) => [
      ...currentNodes,
      {
        id: crypto.randomUUID(),
        type: equipment.type,
        position: {
          x: 280,
          y: 140 + currentNodes.length * 90,
        },
        data: {
          label: equipment.label,
        },
      },
    ]);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-70px)]">
      <Toolbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar onAddEquipment={handleAddEquipment} />

        <Card className="flex-1 rounded-none border-l border-r">

          <CardContent className="p-0 h-full">
            <Canvas nodes={nodes} edges={edges} setNodes={setNodes} setEdges={setEdges} />
          </CardContent>
        </Card>

        <PropertiesPanel
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            onUpdateNodeLabel={updateSelectedNodeLabel}
            onDeleteNode={deleteSelectedNode}
            onDeleteEdge={deleteSelectedEdge}
          />
      </div>
    </div>
  );
}

