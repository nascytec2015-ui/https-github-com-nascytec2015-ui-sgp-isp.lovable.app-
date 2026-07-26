export type FTTHNodeType =
    | "olt"
    | "splitter"
    | "cto"
    | "caixa"
    | "dio"
    | "ceo"
    | "cliente";

export interface FTTHNodeData {
    id: string;

    type: FTTHNodeType;

    label: string;

    modelo?: string;

    fabricante?: string;

    portas?: number;

    portasSaida?: number;

    portasUsadas?: number;

    tx?: number;

    rx?: number;

    status?: "ok" | "warning" | "critical";
}

export interface FTTHEdgeData {
    id: string;

    from: string;

    to: string;

    tipo?: "feeder" | "distribuicao" | "drop";

    comprimento?: number;

    perda?: number;
}