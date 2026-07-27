export type FTTHNodeType =
    | "olt"
    | "splitter"
    | "cto"
    | "caixa"
    | "dio"
    | "ceo"
    | "cliente";

export type SignalStatus =
    | "ok"
    | "warning"
    | "critical";

export interface FTTHNodeData {
    id: string;
    type: FTTHNodeType;

    label: string;

    modelo?: string;
    fabricante?: string;

    x: number;
    y: number;

    portas?: number;
    portasUsadas?: number;
    portasSaida?: number;

    tx?: number;
    rx?: number;

    perda?: number;

    status?: SignalStatus;
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