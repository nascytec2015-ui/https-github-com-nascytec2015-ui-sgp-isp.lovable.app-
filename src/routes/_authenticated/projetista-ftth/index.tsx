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
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  const selectedEdge = useMemo(
    () => edges.find((edge) => edge.id === selectedEdgeId) ?? null,
    [edges, selectedEdgeId],
  );

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
          ...(equipment.defaultData ?? {}),
          fabricante: equipment.manufacturer,
          modelo: equipment.model,
        },
      },
    ]);
  }, []);

  const handleSelectNode = useCallback((id: string) => {
    setSelectedNodeId(id);
    setSelectedEdgeId(null);
  }, []);

  const handleSelectEdge = useCallback((id: string) => {
    setSelectedEdgeId(id);
    setSelectedNodeId(null);
  }, []);

  const updateSelectedNodeData = useCallback(
    (patch: Partial<Node["data"]>) => {
      if (!selectedNodeId) return;
      setNodes((current) =>
        current.map((node) =>
          node.id === selectedNodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  ...patch,
                },
              }
            : node,
        ),
      );
    },
    [selectedNodeId],
  );

  const updateSelectedNodeLabel = useCallback(
    (label: string) => {
      updateSelectedNodeData({ label });
    },
    [updateSelectedNodeData],
  );

  const deleteSelectedNode = useCallback(() => {
    if (!selectedNodeId) return;
    setNodes((current) => current.filter((node) => node.id !== selectedNodeId));
    setEdges((current) =>
      current.filter((edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId),
    );
    setSelectedNodeId(null);
  }, [selectedNodeId]);

  const deleteSelectedEdge = useCallback(() => {
    if (!selectedEdgeId) return;
    setEdges((current) => current.filter((edge) => edge.id !== selectedEdgeId));
    setSelectedEdgeId(null);
  }, [selectedEdgeId]);

  return (
    <div className="flex flex-col h-[calc(100vh-70px)]">
      <Toolbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar onAddEquipment={handleAddEquipment} />

        <Card className="flex-1 rounded-none border-l border-r">
          <CardContent className="p-0 h-full">
            <Canvas
              nodes={nodes}
              edges={edges}
              setNodes={setNodes}
              setEdges={setEdges}
              onSelectNode={handleSelectNode}
              onSelectEdge={handleSelectEdge}
            />
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


