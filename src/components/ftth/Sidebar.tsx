import React from "react";
import EquipmentCard from "./EquipmentCard";
import { EQUIPMENTS, EquipmentItem } from "./data/equipments";

interface SidebarProps {
  onAddEquipment: (equipment: EquipmentItem) => void;
}

export default function Sidebar({ onAddEquipment }: SidebarProps) {
  const groups = {
    headend: EQUIPMENTS.filter((e) => e.category === "headend"),
    outside: EQUIPMENTS.filter((e) => e.category === "outside"),
    customer: EQUIPMENTS.filter((e) => e.category === "customer"),
  };

  return (
    <div className="w-80 bg-slate-950 border-r border-slate-800 overflow-y-auto">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-lg font-bold text-white">Equipamentos FTTH</h2>
      </div>

      <Section title="🏢 HeadEnd" equipments={groups.headend} onAddEquipment={onAddEquipment} />

      <Section
        title="🌐 Rede Externa"
        equipments={groups.outside}
        onAddEquipment={onAddEquipment}
      />

      <Section title="👤 Assinantes" equipments={groups.customer} onAddEquipment={onAddEquipment} />
    </div>
  );
}

interface SectionProps {
  title: string;
  equipments: EquipmentItem[];
  onAddEquipment: (equipment: EquipmentItem) => void;
}

function Section({ title, equipments, onAddEquipment }: SectionProps) {
  return (
    <div className="p-3">
      <h3 className="text-sm font-bold text-cyan-400 mb-2">{title}</h3>

      <div className="space-y-2">
        {equipments.map((equipment) => (
          <EquipmentCard key={equipment.id} equipment={equipment} onClick={onAddEquipment} />
        ))}
      </div>
    </div>
  );
}
