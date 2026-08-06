export type EquipmentCategory = "headend" | "outside" | "customer";

export interface EquipmentItem {
  id: string;
  label: string;
  type: "router" | "olt" | "dio" | "ceo" | "emenda" | "splitter" | "cto" | "cliente";

  category: EquipmentCategory;

  icon: string;

  manufacturer?: string;

  model?: string;

  defaultData?: Record<string, unknown>;
}

export const EQUIPMENTS: EquipmentItem[] = [
  {
    id: "router-mikrotik",
    label: "Router MikroTik",
    type: "router",
    category: "headend",
    icon: "🌐",
    manufacturer: "MikroTik",
    model: "CCR2216",
  },

  {
    id: "router-cisco",
    label: "Router Cisco",
    type: "router",
    category: "headend",
    icon: "🌐",
    manufacturer: "Cisco",
    model: "ASR1001",
  },

  {
    id: "router-huawei",
    label: "Router Huawei",
    type: "router",
    category: "headend",
    icon: "🌐",
    manufacturer: "Huawei",
    model: "NE8000",
  },

  {
    id: "olt-huawei",
    label: "OLT Huawei",
    type: "olt",
    category: "headend",
    icon: "📡",
    manufacturer: "Huawei",
    model: "MA5800",
  },

  {
    id: "dio24",
    label: "DIO 24FO",
    type: "dio",
    category: "headend",
    icon: "🔷",
  },

  {
    id: "ceo24",
    label: "CEO 24FO",
    type: "ceo",
    category: "outside",
    icon: "🟦",
  },

  {
    id: "emenda",
    label: "Caixa de Emenda",
    type: "emenda",
    category: "outside",
    icon: "🟨",
  },

  {
    id: "splitter8",
    label: "Splitter 1:8",
    type: "splitter",
    category: "outside",
    icon: "🟪",
    defaultData: {
      ratio: 8,
    },
  },

  {
    id: "splitter16",
    label: "Splitter 1:16",
    type: "splitter",
    category: "outside",
    icon: "🟪",
    defaultData: {
      ratio: 16,
    },
  },

  {
    id: "cto8",
    label: "CTO 8 Portas",
    type: "cto",
    category: "outside",
    icon: "🟩",
    defaultData: {
      capacidade: 8,
    },
  },

  {
    id: "cto16",
    label: "CTO 16 Portas",
    type: "cto",
    category: "outside",
    icon: "🟩",
    defaultData: {
      capacidade: 16,
    },
  },

  {
    id: "cliente",
    label: "Cliente",
    type: "cliente",
    category: "customer",
    icon: "👤",
  },
];
