import { FTTHDiagram, FTTHNodeData } from "./types/ftth";

import { Graph } from "./utils/graph";

const SPLITTER_LOSS: Record<number, number> = {
  2: 3.5,
  4: 7.2,
  8: 10.5,
  16: 13.5,
  32: 17.0,
};

const EMENDA_LOSS = 0.1;
const CONNECTOR_LOSS = 0.2;
const DIO_LOSS = 0.2;

export interface OpticalResult {
  input: Record<string, number>;
  output: Record<string, number>;
  rx: Record<string, number>;
  tx: Record<string, number>;
}

export class OpticalEngine {
  static calculate(diagram: FTTHDiagram): OpticalResult {
    const graph = new Graph(diagram);

    const input: Record<string, number> = {};
    const output: Record<string, number> = {};

    for (const root of graph.getRootNodes()) {
      this.walk(graph, root.node.id, root.node.tx ?? 3, input, output);
    }

    return {
      input,
      output,
      rx: input,
      tx: output,
    };
  }

  private static walk(
    graph: Graph,
    nodeId: string,
    power: number,
    input: Record<string, number>,
    output: Record<string, number>,
  ) {
    input[nodeId] = power;

    const graphNode = graph.getNode(nodeId);

    if (!graphNode) {
      return;
    }

    const node = graphNode.node;

    let outPower = power;

    switch (node.type) {
      case "splitter":
        outPower -= SPLITTER_LOSS[node.ratio ?? 8] ?? 0;

        break;

      case "dio":
        outPower -= DIO_LOSS;

        break;

      case "emenda":
        outPower -= EMENDA_LOSS;

        break;

      case "cto":
        outPower -= CONNECTOR_LOSS;

        break;

      case "cliente":
        outPower -= CONNECTOR_LOSS;

        break;
    }

    output[nodeId] = outPower;

    for (const child of graph.getChildren(nodeId)) {
      this.walk(graph, child.node.id, outPower, input, output);
    }
  }
}
