export type NodeType =
    | "router"
    | "olt"
    | "dio"
    | "ceo"
    | "splitter"
    | "cto"
    | "emenda"
    | "cliente";


export type SplitterRatio =
    | 2
    | 4
    | 8
    | 16
    | 32;


export interface FNode {

    id: string;

    type: NodeType;

    label: string;

    x: number;
    y: number;

    tx?: number;
    rx?: number;

    // splitter
    ratio?: SplitterRatio;


    // caixas
    capacidade?: number;


    // emenda
    extra_loss_db?: number;


    // reconhecimento automático
    recog_confidence?: number;

    recog_source?: "text" | "shape" | "fallback";
    
    recog_issues?: string[];

    // extras
    fabricante?: string;

    modelo?: string;

    portas?: number;

    portasUsadas?: number;

    portasSaida?: number;

}



export interface FEdge {

    id: string;

    from: string;

    to: string;


    length_m?: number;

    connectors?: number;


    perda?: number;

    comprimento?: number;


    porta?: number;


    tipo?:
    | "alimentacao"
    | "distribuicao"
    | "drop";

}



export interface FTTHDiagram {

    nodes: FNode[];

    edges: FEdge[];

    background?: string | null;
}



export type FTTHNodeType = NodeType;

export type FTTHNodeData = FNode;

export type FTTHEdgeData = FEdge;