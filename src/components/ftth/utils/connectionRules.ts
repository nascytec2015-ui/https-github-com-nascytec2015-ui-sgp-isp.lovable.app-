export type FTTHNodeType =
    | "olt"
    | "splitter"
    | "caixa"
    | "cto"
    | "cliente";


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
        "cto"
    ],


    caixa: [
        "cto"
    ],


    cto: [
        "cliente"
    ],


    cliente: []

};


export function canConnect(
    source: FTTHNodeType,
    target: FTTHNodeType
) {

    return connectionRules[source]
        ?.includes(target);

}