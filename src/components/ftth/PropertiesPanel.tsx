import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Edge, Node } from "reactflow";

interface PropertiesPanelProps {
  selectedNode?: Node<{ label?: string }> | null;
  selectedEdge?: Edge | null;
  onUpdateNodeLabel?: (label: string) => void;
  onUpdateNodeData?: (patch: Partial<Node["data"]>) => void;
  onDeleteNode?: () => void;
  onDeleteEdge?: () => void;
}


export default function PropertiesPanel({
  selectedNode,
  selectedEdge,
  onUpdateNodeLabel,
  onDeleteNode,
  onDeleteEdge,
}: PropertiesPanelProps) {
  const [label, setLabel] = useState(selectedNode?.data?.label ?? "");

  useEffect(() => {
    setLabel(selectedNode?.data?.label ?? "");
  }, [selectedNode]);

  if (!selectedNode && !selectedEdge) {
    return (
      <aside className="w-72 border-l bg-background">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Propriedades</h2>
        </div>

        <div className="p-4 text-sm text-muted-foreground">Nenhum equipamento selecionado.</div>
      </aside>
    );
  }

  return (
    <aside className="w-72 border-l bg-background">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Propriedades</h2>
      </div>

      <div className="p-4 space-y-4">
        {selectedNode ? (
          <div className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Nó selecionado</div>
              <div className="font-semibold">{selectedNode.data?.label ?? "Sem rótulo"}</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="node-label">Rótulo</Label>
              <Input
                id="node-label"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                onBlur={() => onUpdateNodeLabel?.(label)}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              Tipo: <span className="font-medium text-foreground">{selectedNode.type}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              ID: <span className="font-medium text-foreground break-all">{selectedNode.id}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Posição:{" "}
              <span className="font-medium text-foreground">
                {Math.round(selectedNode.position?.x ?? 0)},{" "}
                {Math.round(selectedNode.position?.y ?? 0)}
              </span>
            </div>

            <Button variant="destructive" onClick={() => onDeleteNode?.()}>
              Excluir nó
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Conexão selecionada</div>
              <div className="font-semibold">{selectedEdge?.id}</div>
            </div>

            <div className="text-sm text-muted-foreground">
              Origem: <span className="font-medium text-foreground">{selectedEdge?.source}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Destino: <span className="font-medium text-foreground">{selectedEdge?.target}</span>
            </div>

            <Button variant="destructive" onClick={() => onDeleteEdge?.()}>
              Excluir conexão
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}


