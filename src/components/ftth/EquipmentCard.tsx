import React from "react";

import type { EquipmentItem } from "./data/equipments";

import { useDnD } from "./hooks/useDnD";

interface EquipmentCardProps {
  equipment: EquipmentItem;
  onClick: (equipment: EquipmentItem) => void;
}

export default function EquipmentCard({ equipment, onClick }: EquipmentCardProps) {
  const { setDraggedType } = useDnD();

  return (
    <button
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("application/reactflow", equipment.type);
        event.dataTransfer.effectAllowed = "move";
        setDraggedType(equipment.type);
      }}
      onClick={() => onClick(equipment)}
      className="
        w-full
        rounded-lg
        border
        border-slate-700
        bg-slate-900
        hover:bg-slate-800
        hover:border-cyan-500
        transition
        p-3
        text-left
    "
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">{equipment.icon}</div>

        <div className="flex-1">
          <div className="font-semibold text-white">{equipment.label}</div>

          {equipment.manufacturer && (
            <div className="text-xs text-slate-400">{equipment.manufacturer}</div>
          )}

          {equipment.model && <div className="text-xs text-cyan-400">{equipment.model}</div>}
        </div>
      </div>
    </button>
  );
}
