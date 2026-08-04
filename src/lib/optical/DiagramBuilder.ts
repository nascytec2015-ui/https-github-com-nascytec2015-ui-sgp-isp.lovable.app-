import { FTTHNodeData, FTTHEdgeData, FTTHDiagram } from "../../components/ftth/types/ftth";
import { RecognitionResult } from "./OpticalRecognizer";

export interface DetectedNode extends RecognitionResult {
  id: string;
  x: number;
  y: number;
  label: string;
}

export function buildDiagram(nodes: DetectedNode[]) {
  const fNodes: FTTHNodeData[] = [];
  const fEdges: FTTHEdgeData[] = [];

  nodes.forEach((n) => {
    fNodes.push({
      id: n.id,
      type: n.type,
      label: n.label,
      x: n.x,
      y: n.y,

      ratio: n.ratio,

      recog_confidence: n.confidence,
      recog_source: "text",
    });
  });

  for (let i = 0; i < nodes.length - 1; i++) {
    fEdges.push({
      id: `e${i}`,

      from: nodes[i].id,
      to: nodes[i + 1].id,

      length_m: 0,
      connectors: 0,
    });
  }

  return {
    nodes: fNodes,
    edges: fEdges,
  };
}
