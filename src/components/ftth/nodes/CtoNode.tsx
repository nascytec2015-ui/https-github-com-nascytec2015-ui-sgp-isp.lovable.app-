import React from "react";
import BaseNode from "./BaseNode";

interface CtoNodeProps {
  data: {
    label?: string;
    modelo?: string;
    power?: number;
    status?: "ok" | "warning" | "critical";
    portas?: number;
    portasUsadas?: number;
  };
}

export default function CtoNode({ data }: CtoNodeProps) {
  const total = data.portas ?? 16;
  const usadas = data.portasUsadas ?? 0;
  const livres = total - usadas;

  return (
    <BaseNode
      title="CTO"
      subtitle={data.modelo ?? data.label ?? "CTO 16 Portas"}
      power={data.power}
      status={data.status ?? "ok"}
      inputs={1}
      outputs={1}
    >
      <div
        style={{
          marginTop: 8,
          fontSize: 12,
          color: "#475569",
        }}
      >
        <div>Total: {total}</div>
        <div>Usadas: {usadas}</div>
        <div>Livres: {livres}</div>
      </div>
    </BaseNode>
  );
}
