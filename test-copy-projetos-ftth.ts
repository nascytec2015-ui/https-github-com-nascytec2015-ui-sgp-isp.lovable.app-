import "dotenv/config";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

const { Pool } = pg;

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const pool = new Pool({
  host: process.env.POSTGRES_HOST || "localhost",
  port: Number(process.env.POSTGRES_PORT || 5432),
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "",
  database: process.env.POSTGRES_DB || "sgp_isp",
});

async function main() {
  console.log("🔄 Copiando projetos_ftth...\n");

  // ============================
  // SUPABASE
  // ============================

  const { data, error } = await supabase
    .from("projetos_ftth")
    .select("*");

  if (error) {
    throw error;
  }

  const projetos = data || [];

  console.log(`Supabase: ${projetos.length}`);

  // ============================
  // POSTGRES LOCAL - ANTES
  // ============================

  const antes = await pool.query(
    `SELECT COUNT(*)::int AS total FROM public.projetos_ftth`
  );

  console.log(`Local antes: ${antes.rows[0].total}\n`);

  // ============================
  // COPIAR
  // ============================

  for (const projeto of projetos) {
    await pool.query(
      `
      INSERT INTO public.projetos_ftth
      (
        id,
        nome,
        descricao,
        olt_tx_dbm,
        data,
        created_by,
        created_at,
        updated_at
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8
      )
      ON CONFLICT (id)
      DO UPDATE SET
        nome = EXCLUDED.nome,
        descricao = EXCLUDED.descricao,
        olt_tx_dbm = EXCLUDED.olt_tx_dbm,
        data = EXCLUDED.data,
        created_by = EXCLUDED.created_by,
        updated_at = EXCLUDED.updated_at
      `,
      [
        projeto.id,
        projeto.nome,
        projeto.descricao ?? null,
        projeto.olt_tx_dbm ?? 3,
        projeto.data ?? { nodes: [], edges: [] },
        projeto.created_by ?? null,
        projeto.created_at ?? new Date(),
        projeto.updated_at ?? new Date(),
      ]
    );

    console.log(`OK: ${projeto.nome}`);
  }

  // ============================
  // POSTGRES LOCAL - DEPOIS
  // ============================

  const depois = await pool.query(
    `
    SELECT
      COUNT(*)::int AS total
    FROM public.projetos_ftth
    `
  );

  console.log(`\nLocal depois: ${depois.rows[0].total}`);

  // ============================
  // MOSTRAR PROJETOS
  // ============================

  const resultado = await pool.query(
    `
    SELECT
      id,
      nome,
      descricao,
      olt_tx_dbm,
      data,
      created_by
    FROM public.projetos_ftth
    ORDER BY created_at
    `
  );

  console.log("\n📡 Projetos FTTH no PostgreSQL:");

  for (const projeto of resultado.rows) {
    console.log(projeto);
  }

  console.log("\n🎯 Teste concluído.");
}

main()
  .catch((error) => {
    console.error("❌ Erro:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });