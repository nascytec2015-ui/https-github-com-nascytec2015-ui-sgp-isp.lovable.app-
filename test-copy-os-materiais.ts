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
  console.log("🔄 Copiando os_materiais...\n");

  const { data, error } = await supabase
    .from("os_materiais")
    .select("*");

  if (error) throw error;

  console.log(`Supabase: ${data.length}`);

  const antes = await pool.query(
    `SELECT COUNT(*)::int AS total FROM public.os_materiais`
  );

  console.log(`Local antes: ${antes.rows[0].total}`);

  for (const material of data) {
    await pool.query(
      `
      INSERT INTO public.os_materiais
      (
        id,
        os_id,
        descricao,
        quantidade,
        unidade,
        valor_unitario,
        created_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (id) DO UPDATE SET
        descricao = EXCLUDED.descricao,
        quantidade = EXCLUDED.quantidade,
        unidade = EXCLUDED.unidade,
        valor_unitario = EXCLUDED.valor_unitario
      `,
      [
        material.id,
        material.os_id,
        material.descricao,
        material.quantidade ?? 1,
        material.unidade ?? "un",
        material.valor_unitario ?? 0,
        material.created_at ?? new Date(),
      ]
    );

    console.log(`OK: ${material.descricao}`);
  }

  const depois = await pool.query(`
    SELECT
      m.id,
      m.os_id,
      m.descricao,
      m.quantidade,
      m.unidade,
      m.valor_unitario,
      os.numero AS os_numero
    FROM public.os_materiais m
    LEFT JOIN public.ordens_servico os
      ON os.id = m.os_id
    ORDER BY m.created_at
  `);

  console.log(`\nLocal depois: ${depois.rows.length}`);

  console.log("\n📦 Materiais no PostgreSQL:");

  for (const row of depois.rows) {
    console.log(row);
  }

  console.log("\n🎯 Teste concluído.");
}

main()
  .catch((err) => {
    console.error("❌ Erro:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });