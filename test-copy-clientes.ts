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
  console.log("🔄 Copiando clientes...");

  const { data, error } = await supabase
    .from("clientes")
    .select("*");

  if (error) {
    throw error;
  }

  console.log("Supabase:", data.length);

  const before = await pool.query(
    "SELECT COUNT(*)::int AS total FROM public.clientes",
  );

  console.log("Local antes:", before.rows[0].total);

  for (const cliente of data) {
    if (cliente.plano_id) {
      const plano = await pool.query(
        "SELECT id FROM public.planos WHERE id = $1",
        [cliente.plano_id],
      );

      if (plano.rowCount !== 1) {
        throw new Error(
          `Plano não encontrado: ${cliente.plano_id}`,
        );
      }
    }

    if (cliente.created_by) {
      const user = await pool.query(
        "SELECT id FROM public.users WHERE id = $1",
        [cliente.created_by],
      );

      if (user.rowCount !== 1) {
        throw new Error(
          `Usuário não encontrado: ${cliente.created_by}`,
        );
      }
    }

    await pool.query(
      `
      INSERT INTO public.clientes
      (
        id,
        nome,
        cpf_cnpj,
        email,
        telefone,
        endereco,
        numero,
        bairro,
        cidade,
        estado,
        cep,
        plano_id,
        ppoe_user,
        ppoe_pass,
        ip_fixo,
        observacoes,
        status,
        data_ativacao,
        data_cancelamento,
        created_by,
        created_at,
        updated_at
      )
      VALUES
      (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22
      )
      ON CONFLICT (id) DO NOTHING
      `,
      [
        cliente.id,
        cliente.nome,
        cliente.cpf_cnpj ?? null,
        cliente.email ?? null,
        cliente.telefone ?? null,
        cliente.endereco ?? null,
        cliente.numero ?? null,
        cliente.bairro ?? null,
        cliente.cidade ?? null,
        cliente.estado ?? null,
        cliente.cep ?? null,
        cliente.plano_id ?? null,
        cliente.ppoe_user ?? null,
        cliente.ppoe_pass ?? null,
        cliente.ip_fixo ?? null,
        cliente.observacoes ?? null,
        cliente.status,
        cliente.data_ativacao ?? null,
        cliente.data_cancelamento ?? null,
        cliente.created_by ?? null,
        cliente.created_at ?? new Date(),
        cliente.updated_at ?? new Date(),
      ],
    );

    console.log(`OK: ${cliente.nome}`);
  }

  const after = await pool.query(
    "SELECT COUNT(*)::int AS total FROM public.clientes",
  );

  console.log("Local depois:", after.rows[0].total);

  const rows = await pool.query(
    `
    SELECT
      c.id,
      c.nome,
      c.plano_id,
      p.nome AS plano,
      c.created_by,
      u.email AS criado_por
    FROM public.clientes c
    LEFT JOIN public.planos p
      ON p.id = c.plano_id
    LEFT JOIN public.users u
      ON u.id = c.created_by
    ORDER BY c.created_at
    `,
  );

  console.log("👥 Clientes no PostgreSQL:");

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