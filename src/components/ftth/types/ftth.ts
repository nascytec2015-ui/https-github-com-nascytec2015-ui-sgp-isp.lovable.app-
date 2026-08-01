export type FTTHNodeType =
    | "router"
    | "olt"
    | "dio"
    | "ceo"
    | "splitter"
    | "emenda"
    | "cto"
    | "cliente";

export type SplitterRatio = 2 | 4 | 8 | 16 | 32 | 64;

export type SignalStatus =
    | "ok"
    | "warning"
    | "critical";

export type RecognitionSource =
    | "manual"
    | "text"
    | "shape";

export interface FTTHNodeData {
    id: string;

    type: FTTHNodeType;

    label: string;

    x: number;
    y: number;

    tx?: number;
    rx?: number;

    ratio?: SplitterRatio;

    capacidade?: number;

    portasSaida?: number;

    extra_loss_db?: number;

    signalStatus?: SignalStatus;

    recog_confidence?: number;

    recog_source?: RecognitionSource;

    // Equipamentos

    fabricante?: string;

    modelo?: string;

    ip?: string;

    status?: "online" | "offline";

    latitude?: number;

    longitude?: number;

    observacoes?: string;
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