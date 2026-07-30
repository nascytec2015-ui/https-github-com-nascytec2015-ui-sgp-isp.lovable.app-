import { FTTHNodeData, FTTHEdgeData, FTTHNodeType } from "../types/ftth";
import { canConnect } from "../utils/connectionRules";

export class ConnectionEngine {

    static validateConnection(
        source: FTTHNodeData,
        target: FTTHNodeData
    ): boolean {

        return canConnect(
            source.type,
            target.type
        );

    }

    static createConnection(
        source: FTTHNodeData,
        target: FTTHNodeData
    ): FTTHEdgeData {

        return {
    id: crypto.randomUUID(),

    from: source.id,

    to: target.id,

    tipo: "distribuicao",

    comprimento: 0,

    perda: 0,
   
    length_m: 0,
    
    connectors: 0
};

    }

    static removeConnection(
        edges: FTTHEdgeData[],
        edgeId: string
    ) {

        return edges.filter(
            edge => edge.id !== edgeId
        );

    }

}
