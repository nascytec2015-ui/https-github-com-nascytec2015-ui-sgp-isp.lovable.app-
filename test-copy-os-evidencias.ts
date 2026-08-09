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
  console.log("🔄 Copiando os_evidencias...\n");

  // Buscar evidências no Supabase
  const { data, error } = await supabase
    .from("os_evidencias")
    .select("*");

  if (error) {
    throw error;
  }

  console.log(`Supabase: ${data.length}`);

  // Quantidade local antes
  const antes = await pool.query(`
    SELECT COUNT(*)::int AS total
    FROM public.os_evidencias
  `);

  console.log(`Local antes: ${antes.rows[0].total}`);

  // Copiar registros
  for (const evidencia of data) {
    // Verificar se a OS relacionada existe localmente
    const osCheck = await pool.query(
      `
      SELECT id
      FROM public.ordens_servico
      WHERE id = $1
      `,
      [evidencia.os_id]
    );

    if (osCheck.rowCount === 0) {
      console.warn(
        `⚠️ Pulando evidência ${evidencia.id}: OS ${evidencia.os_id} não existe localmente`
      );

      continue;
    }

    await pool.query(
      `
      INSERT INTO public.os_evidencias
      (
        id,
        os_id,
        tipo,
        url,
        descricao,
        tamanho_bytes,
        mime_type,
        criado_por,
        created_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT (id) DO UPDATE SET
        os_id = EXCLUDED.os_id,
        tipo = EXCLUDED.tipo,
        url = EXCLUDED.url,
        descricao = EXCLUDED.descricao,
        tamanho_bytes = EXCLUDED.tamanho_bytes,
        mime_type = EXCLUDED.mime_type,
        criado_por = EXCLUDED.criado_por
      `,
      [
        evidencia.id,
        evidencia.os_id,
        evidencia.tipo,
        evidencia.url,
        evidencia.descricao ?? null,
        evidencia.tamanho_bytes ?? null,
        evidencia.mime_type ?? null,
        evidencia.criado_por ?? null,
        evidencia.created_at ?? new Date(),
      ]
    );

    console.log(`OK: ${evidencia.tipo} → OS ${evidencia.os_id}`);
  }

  // Quantidade local depois
  const depois = await pool.query(`
    SELECT COUNT(*)::int AS total
    FROM public.os_evidencias
  `);

  console.log(`\nLocal depois: ${depois.rows[0].total}`);

  // Mostrar evidências com relacionamento
  const resultado = await pool.query(`
    SELECT
      e.id,
      e.os_id,
      e.tipo,
      e.url,
      e.descricao,
      e.tamanho_bytes,
      e.mime_type,
      e.criado_por,
      os.numero AS os_numero,
      c.nome AS cliente
    FROM public.os_evidencias e
    LEFT JOIN public.ordens_servico os
      ON os.id = e.os_id
    LEFT JOIN public.clientes c
      ON c.id = os.cliente_id
    ORDER BY e.created_at
  `);

  console.log("\n📸 Evidências no PostgreSQL:");

  for (const row of resultado.rows) {
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