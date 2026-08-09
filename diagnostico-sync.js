require("dotenv").config();

const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  await client.connect();

  console.log("\n=== ESTRUTURA sync_status ===");

  const status = await client.query(`
    SELECT
      column_name,
      data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'sync_status'
    ORDER BY ordinal_position
  `);

  console.table(status.rows);

  console.log("\n=== ÚLTIMOS CONFLITOS user_roles ===");

  const conflicts = await client.query(`
    SELECT
      id,
      tabela,
      registro_id,
      supabase_data,
      local_data,
      resolucao,
      resolvido_em,
      created_at
    FROM public.sync_conflicts
    WHERE tabela = 'user_roles'
    ORDER BY created_at DESC
    LIMIT 4
  `);

  for (const row of conflicts.rows) {
    console.log("\n----------------------------------------");
    console.log("ID:", row.id);
    console.log("Tabela:", row.tabela);
    console.log("Registro:", row.registro_id);
    console.log("Resolução:", row.resolucao);
    console.log("Resolvido em:", row.resolvido_em);
    console.log("Criado em:", row.created_at);

    console.log("\nSUPABASE:");
    console.dir(row.supabase_data, { depth: null });

    console.log("\nLOCAL:");
    console.dir(row.local_data, { depth: null });
  }

  await client.end();
}

main().catch(async (error) => {
  console.error("\nERRO:", error);
  try {
    await client.end();
  } catch {}
  process.exit(1);
});