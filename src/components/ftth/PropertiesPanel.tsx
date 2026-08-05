import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Edge, Node } from "reactflow";

interface PropertiesPanelProps {
  selectedNode?: Node<Record<string, any>> | null;
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
  onUpdateNodeData,
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

            {selectedNode?.type === "splitter" && (
              <div className="space-y-2">
                <Label htmlFor="splitter-ratio">Relação do splitter</Label>
                <Input
                  id="splitter-ratio"
                  type="number"
                  min={2}
                  step={2}
                  value={selectedNode.data?.ratio ?? 8}
                  onChange={(event) => onUpdateNodeData?.({ ratio: Number(event.target.value) })}
                />
              </div>
            )}

            {selectedNode?.type === "cto" && (
              <div className="space-y-2">
                <Label htmlFor="cto-capacidade">Capacidade da CTO</Label>
                <Input
                  id="cto-capacidade"
                  type="number"
                  min={1}
                  value={selectedNode.data?.capacidade ?? 8}
                  onChange={(event) => onUpdateNodeData?.({ capacidade: Number(event.target.value) })}
                />
              </div>
            )}

            {selectedNode?.type === "emenda" && (
              <div className="space-y-2">
                <Label htmlFor="emenda-extra-loss">Perda extra (dB)</Label>
                <Input
                  id="emenda-extra-loss"
                  type="number"
                  min={0}
                  step={0.1}
                  value={selectedNode.data?.extra_loss_db ?? 0.1}
                  onChange={(event) => onUpdateNodeData?.({ extra_loss_db: Number(event.target.value) })}
                />
              </div>
            )}

            {selectedNode?.data?.fabricante && (
              <div className="space-y-2">
                <Label htmlFor="node-fabricante">Fabricante</Label>
                <Input
                  id="node-fabricante"
                  value={String(selectedNode.data.fabricante)}
                  onChange={(event) => onUpdateNodeData?.({ fabricante: event.target.value })}
                />
              </div>
            )}

            {selectedNode?.data?.modelo && (
              <div className="space-y-2">
                <Label htmlFor="node-modelo">Modelo</Label>
                <Input
                  id="node-modelo"
                  value={String(selectedNode.data.modelo)}
                  onChange={(event) => onUpdateNodeData?.({ modelo: event.target.value })}
                />
              </div>
            )}

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







