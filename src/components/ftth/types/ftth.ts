export type FTTHNodeType =
  | "olt"
  | "dio"
  | "splitter"
  | "emenda"
  | "cto"
  | "cliente";

export type SignalStatus =
    | "ok"
    | "warning"
    | "critical";

export interface FTTHNodeData {
    id: string;

    type: FTTHNodeType;

    label: string;

    x: number;

    y: number;

    tx?: number;

    ratio?: number;

    portasEntrada?: number;

    portasSaida?: number;

    fibrasEntrada?: number;

    fibrasSaida?: number;

    fibrasLivres?: number;

    capacidade?: number;
}

export interface FTTHEdgeData {
    id: string;

    from: string;
    to: string;

    tipo?: "feeder" | "distribuicao" | "drop";

    comprimento?: number;

    perda?: number;
}

export interface FTTHDiagram {
    nodes: FTTHNodeData[];
    edges: FTTHEdgeData[];
}