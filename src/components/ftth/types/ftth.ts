export type NodeType =
    | "olt"
    | "dio"
    | "splitter"
    | "cto"
    | "emenda"
    | "cliente";


export type SplitterRatio =
    | 2
    | 4
    | 8
    | 16
    | 32
    | 64;


export interface FNode {

    id: string;

    type: NodeType;

    label: string;

    x: number;
    y: number;

    tx?: number;


    // Splitter
    ratio?: SplitterRatio;
    portasSaida?: number;


    // Emenda
    extra_loss_db?: number;


    // CTO / DIO
    capacidade?: number;
    portas?: number;
    ocupadas?: number;


    // reconhecimento SVG
    recog_confidence?: number;
    recog_source?: string;
    recog_issues?: string[];
}



export interface FEdge {

    id: string;

    from: string;

    to: string;

    length_m: number;

    connectors: number;

    porta?: number | null;

}



export interface FTTHDiagram {

    nodes: FNode[];

    edges: FEdge[];

    background?: string | null;

}