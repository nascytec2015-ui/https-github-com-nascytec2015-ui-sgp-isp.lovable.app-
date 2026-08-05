import { useCallback } from "react";
import type { DragEvent, Dispatch, MouseEvent, SetStateAction } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
} from "reactflow";

import "reactflow/dist/style.css";

interface CanvasProps {
  nodes: Node[];
  edges: Edge[];
  setNodes: Dispatch<SetStateAction<Node[]>>;
  setEdges: Dispatch<SetStateAction<Edge[]>>;
  onSelectNode?: (id: string) => void;
  onSelectEdge?: (id: string) => void;
}


export default function Canvas({ nodes, edges, setNodes, setEdges, onSelectNode, onSelectEdge }: CanvasProps) {
  const handleNodeClick = useCallback(
    (_event: MouseEvent, node: Node) => {
      onSelectNode?.(node.id);
    },
    [onSelectNode],
  );

  const handleEdgeClick = useCallback(
    (_event: MouseEvent, edge: Edge) => {
      onSelectEdge?.(edge.id);
    },
    [onSelectEdge],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const tipo = event.dataTransfer.getData("application/reactflow");

      if (!tipo) return;

      const rect = (event.target as HTMLDivElement).getBoundingClientRect();

      const novoNode: Node = {
        id: crypto.randomUUID(),

        type: tipo as Node["type"],

        position: {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        },

        data: {
          label: tipo.toUpperCase(),
        },
      };

      setNodes((nds) => [...nds, novoNode]);
    },
    [setNodes],
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
      >
        <Background />

        <MiniMap />

        <Controls />
      </ReactFlow>
    </div>
  );
}



