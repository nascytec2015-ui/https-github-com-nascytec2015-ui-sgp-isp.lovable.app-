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
    [x: string]: number;

    id: string;

    type: FTTHNodeType;

    label: string;

    x: number;
    y: number;

    tx?: number;
    rx?: number;

    ratio?: 2 | 4 | 8 | 16 | 32;

    extra_loss_db?: number;

    recog_confidence?: number;

    recog_source?: "text" | "shape";

    signalStatus?: SignalStatus;

    // ... os demais campos que você já possui
}

export interface FTTHEdgeData {
    id: string;

    from: string;
    to: string;

    tipo?: "feeder" | "distribuicao" | "drop";

    comprimento?: number;

    perda?: number;

    length_m: number;

    connectors: number;

    porta?: number;
}

export interface FTTHDiagram {
    nodes: FTTHNodeData[];
    edges: FTTHEdgeData[];
}