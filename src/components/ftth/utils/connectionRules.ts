import type { FTTHNodeType } from "../types/ftth";

export const connectionRules: Record<
    FTTHNodeType,
    FTTHNodeType[]
> = {

    olt: [
        "splitter"
    ],

    splitter: [
        "splitter",
        "caixa",
        "cto",
        "dio"
    ],

    caixa: [
        "cto",
        "dio"
    ],

    dio: [
        "splitter",
        "cto"
    ],

    cto: [
        "cliente"
    ],

    ceo: [],

    cliente: []

};

export function canConnect(
    source: FTTHNodeType,
    target: FTTHNodeType
) {
    return connectionRules[source]?.includes(target) ?? false;
}