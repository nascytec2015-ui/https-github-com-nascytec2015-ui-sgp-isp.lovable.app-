import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import * as pg from "pg";

const { Pool } = pg;

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  console.log("🔄 Copiando planos...");

  const { data, error } = await supabase
    .from("planos")
    .select("*");

  if (error) {
    throw error;
  }

  console.log("Supabase:", data.length);

  const before = await pool.query(
    "SELECT COUNT(*)::int AS total FROM public.planos",
  );

  console.log("Local antes:", before.rows[0].total);

  for (const plano of data) {
    await pool.query(
      `
      INSERT INTO public.planos
      (
        id,
        nome,
        velocidade_down,
        velocidade_up,
        valor,
        ativo,
        created_at,
        updated_at
      )
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO NOTHING
      `,
      [
        plano.id,
        plano.nome,
        plano.velocidade_down ?? 0,
        plano.velocidade_up ?? 0,
        plano.valor ?? 0,
        plano.ativo ?? true,
        plano.created_at ?? new Date(),
        plano.updated_at ?? new Date(),
      ],
    );

    console.log(`OK: ${plano.nome}`);
  }

  const after = await pool.query(
    "SELECT COUNT(*)::int AS total FROM public.planos",
  );

  console.log("Local depois:", after.rows[0].total);

  const rows = await pool.query(
    `
    SELECT
      id,
      nome,
      velocidade_down,
      velocidade_up,
      valor,
      ativo
    FROM public.planos
    ORDER BY created_at
    `,
  );

  console.log("📦 Planos no PostgreSQL:");

  for (const row of rows.rows) {
    console.log(row);
  }
}

main()
  .catch((error) => {
    console.error("❌ ERRO:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });