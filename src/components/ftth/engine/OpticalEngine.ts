import { FTTHDiagram } from "../types/ftth";
import { Graph } from "../utils/graph";

const SPLITTER_LOSS: Record<number, number> = {
    2: 3.5,
    4: 7.2,
    8: 10.5,
    16: 13.5,
    32: 17,
    64: 20.5,
};

const SPLICE_LOSS = 0.1;
const CONNECTOR_LOSS = 0.2;

export interface OpticalResult {
    tx: Record<string, number>;
    rx: Record<string, number>;
}

export class OpticalEngine {
    static calculate(diagram: FTTHDiagram): OpticalResult {

        const graph = new Graph(diagram);

        const tx: Record<string, number> = {};
        const rx: Record<string, number> = {};

        for (const root of graph.getRootNodes()) {
            this.walk(
                graph,
                root.node.id,
                root.node.tx ?? 3,
                tx,
                rx
            );
        }

        return {
            tx,
            rx,
        };
    }

    private static walk(
        graph: Graph,
        nodeId: string,
        currentPower: number,
        tx: Record<string, number>,
        rx: Record<string, number>
    ) {

        rx[nodeId] = currentPower;
        tx[nodeId] = currentPower;

        const children = graph.getChildren(nodeId);

        for (const child of children) {

            let power = currentPower;

            switch (child.node.type) {

                case "splitter":
                    power -= SPLITTER_LOSS[
                        child.node.portasSaida ?? 8
                    ] ?? 10.5;
                    break;

                case "dio":
                    power -= CONNECTOR_LOSS;
                    break;

                case "emenda":
                    power -= SPLICE_LOSS;
                    break;

                case "cto":
                    power -= CONNECTOR_LOSS;
                    break;

                case "cliente":
                    power -= CONNECTOR_LOSS;
                    break;
            }

            this.walk(
                graph,
                child.node.id,
                power,
                tx,
                rx
            );
        }
    }
}
