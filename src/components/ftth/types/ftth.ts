export type NodeType =
    | "router"
    | "olt"
    | "dio"
    | "ceo"
    | "splitter"
    | "cto"
    | "cliente"
    | "emenda";


export type FTTHNodeType = NodeType;


export type SplitterRatio =
    | 2
    | 4
    | 8
    | 16
    | 32;



export interface FNode {
    [x: string]: number;

    id: string;

    type: NodeType;

    label: string;

    x: number;

    y: number;


    modelo?: string;

    fabricante?: string;


    portas?: number;

    portasUsadas?: number;

    portasSaida?: number;


    splitterRatio?: SplitterRatio;


    tx?: number;

    rx?: number;
}



export interface FEdge {

    id: string;

    from: string;

    to: string;


    length_m?: number;

    connectors?: number;


    perda?: number;

    comprimento?: number;


    tipo?:
    | "backbone"
    | "distribuicao"
    | "drop";
}



export type FTTHNodeData = FNode;


export type FTTHEdgeData = FEdge;



export interface FTTHDiagram {

    nodes: FNode[];

    edges: FEdge[];

    background?: string | null;

}