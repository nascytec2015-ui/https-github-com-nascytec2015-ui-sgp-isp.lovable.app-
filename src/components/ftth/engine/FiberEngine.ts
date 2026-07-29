import { FTTHDiagram } from "../types/ftth";

export class FiberEngine {

    static calculate(diagram: FTTHDiagram) {

        const result: Record<string, {
            entrada: number;
            saida: number;
            livres: number;
        }> = {};

        for (const node of diagram.nodes) {

            switch (node.type) {

                case "olt":

                    result[node.id] = {
                        entrada: 0,
                        saida: 1,
                        livres: (node.capacidade ?? 16) - 1
                    };

                    break;

                case "dio":

                    result[node.id] = {
                        entrada: 1,
                        saida: 1,
                        livres: (node.capacidade ?? 144) - 1
                    };

                    break;

                case "splitter":

                    const portas = node.ratio ?? 8;

                    result[node.id] = {
                        entrada: 1,
                        saida: portas,
                        livres: 0
                    };

                    break;

                case "emenda":

                    result[node.id] = {
                        entrada: 1,
                        saida: 1,
                        livres: 0
                    };

                    break;

                case "cto":

                    const usadas =
                        diagram.edges.filter(
                            e => e.from === node.id
                        ).length;

                    const total = node.capacidade ?? 16;

                    result[node.id] = {
                        entrada: 1,
                        saida: usadas,
                        livres: total - usadas
                    };

                    break;

                case "cliente":

                    result[node.id] = {
                        entrada: 1,
                        saida: 0,
                        livres: 0
                    };

                    break;
            }

        }

        return result;

    }

}