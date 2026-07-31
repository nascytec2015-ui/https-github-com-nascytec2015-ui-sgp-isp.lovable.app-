export type NodeKind =
    | "olt"
    | "splitter"
    | "emenda"
    | "cto"
    | "cliente";

export type SplitterRatio = 2 | 4 | 8 | 16 | 32;

export interface RecognitionResult {
    type: NodeKind;
    confidence: number;
    ratio?: SplitterRatio;
}

const splitterLoss: Record<SplitterRatio, number> = {
    2: 3.5,
    4: 7.2,
    8: 10.5,
    16: 13.5,
    32: 17.0,
};

export function splitterLossDb(ratio: SplitterRatio) {
    return splitterLoss[ratio];
}

export function recognizeNode(text: string): RecognitionResult | null {
    const t = text.toLowerCase();

    if (t.includes("olt"))
        return {
            type: "olt",
            confidence: 0.99,
        };

    if (t.includes("cto"))
        return {
            type: "cto",
            confidence: 0.98,
        };

    if (
        t.includes("emenda") ||
        t.includes("splitter")
    )
        return {
            type: "splitter",
            confidence: 0.97,
        };

    if (
        t.includes("cliente") ||
        t.includes("onu")
    )
        return {
            type: "cliente",
            confidence: 0.96,
        };

    const match = t.match(/1[:x\/-]?(2|4|8|16|32)/);

    if (match) {
        return {
            type: "splitter",
            ratio: Number(match[1]) as SplitterRatio,
            confidence: 0.95,
        };
    }

    return null;
}
