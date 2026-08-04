import type { FTTHNodeType } from "./types/ftth";

export const connectionRules: Record<FTTHNodeType, FTTHNodeType[]> = {
  olt: ["dio"],

  dio: ["emenda", "splitter"],

  emenda: ["splitter", "cto"],

  splitter: ["splitter", "cto"],

  cto: ["cliente"],

  cliente: [],
  router: [],
  ceo: [],
};

export function canConnect(source: FTTHNodeType, target: FTTHNodeType) {
  return connectionRules[source]?.includes(target) ?? false;
}
