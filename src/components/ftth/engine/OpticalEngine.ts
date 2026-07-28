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

const FIBER_LOSS_PER_KM = 0.35;
const SPLICE_LOSS = 0.1;
const CONNECTOR_LOSS = 0.2;

export class OpticalEngine {
    static calculate(diagram: FTTHDiagram) {

        const graph = new Graph(diagram);

        const powers: Record<string, number> = {};

        for (const root of graph.getRootNodes()) {

            this.walk(
                graph,
                root.node.id,
                root.node.tx ?? 3,
                powers
            );

        }

        return powers;
    }

    private static walk(
        graph: Graph,
        nodeId: string,
        currentPower: number,
        powers: Record<string, number>
    ) {

        powers[nodeId] = currentPower;

        const children = graph.getChildren(nodeId);

        for (const child of children) {

            let power = currentPower;

            switch (child.node.type) {

                case "splitter":

                    power -= SPLITTER_LOSS[
                        child.node.portasSaida ?? 8
                    ] ?? 10.5;

                    break;

                case "caixa":

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
                powers
            );

        }

    }
}