/// <reference types="node" />

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL não encontrada");
}

if (!supabaseKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY não encontrada");
}

const supabase = createClient(
  supabaseUrl,
  supabaseKey,
);

const tables = [
  "users",
  "profiles",
  "user_roles",
  "planos",
  "clientes",
  "ordens_servico",
  "os_materiais",
  "os_evidencias",
  "projetos_ftth",
];

async function main() {
  console.log("🔌 Testando leitura do Supabase...\n");

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });

    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
      continue;
    }

    console.log(`✅ ${table}: ${count ?? 0}`);
  }

  console.log("\n🔄 Tabelas de sincronização:\n");

  for (const table of [
    "sync_versions",
    "sync_logs",
    "sync_conflicts",
    "sync_status",
  ]) {
    const { count, error } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });

    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
      continue;
    }

    console.log(`✅ ${table}: ${count ?? 0}`);
  }
}

main().catch((error) => {
  console.error("❌ Erro:", error);
});