/// <reference types="node" />

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Configuração do Supabase não encontrada");
}

const supabase = createClient(
  supabaseUrl,
  supabaseKey,
);

async function showTable(
  table: string,
  columns: string,
) {
  const { data, error } = await supabase
    .from(table)
    .select(columns);

  if (error) {
    console.log(`❌ ${table}: ${error.message}`);
    return;
  }

  console.log(`\n📋 ${table}: ${data?.length ?? 0} registros`);

  for (const row of data ?? []) {
    console.log(row);
  }
}

async function main() {
  console.log("🔎 Verificando relacionamentos do Supabase...\n");

  await showTable(
    "users",
    "id,email",
  );

  await showTable(
    "profiles",
    "id",
  );

  await showTable(
    "user_roles",
    "id,user_id,role",
  );

  await showTable(
    "planos",
    "id,nome",
  );

  await showTable(
    "clientes",
    "id,nome,plano_id,created_by",
  );

  await showTable(
    "projetos_ftth",
    "id,nome,created_by",
  );

  await showTable(
    "ordens_servico",
    "id,numero,cliente_id,tecnico_id,projeto_ftth_id,created_by",
  );
}

main().catch((error) => {
  console.error("❌ Erro:", error);
});