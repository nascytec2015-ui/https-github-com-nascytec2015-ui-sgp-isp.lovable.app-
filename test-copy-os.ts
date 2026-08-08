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
  console.log("🔄 Copiando ordens_servico...");

  const { data, error } = await supabase
    .from("ordens_servico")
    .select("*");

  if (error) {
    throw error;
  }

  console.log("Supabase:", data.length);

  const before = await pool.query(
    "SELECT COUNT(*)::int AS total FROM public.ordens_servico",
  );

  console.log("Local antes:", before.rows[0].total);

  for (const os of data) {
    const cliente = await pool.query(
      "SELECT id FROM public.clientes WHERE id = $1",
      [os.cliente_id],
    );

    if (cliente.rowCount !== 1) {
      throw new Error(
        `Cliente não encontrado: ${os.cliente_id}`,
      );
    }

    if (os.created_by) {
      const usuario = await pool.query(
        "SELECT id FROM public.users WHERE id = $1",
        [os.created_by],
      );

      if (usuario.rowCount !== 1) {
        throw new Error(
          `Usuário criador não encontrado: ${os.created_by}`,
        );
      }
    }

    if (os.tecnico_id) {
      const tecnico = await pool.query(
        "SELECT id FROM public.users WHERE id = $1",
        [os.tecnico_id],
      );

      if (tecnico.rowCount !== 1) {
        throw new Error(
          `Técnico não encontrado: ${os.tecnico_id}`,
        );
      }
    }

    if (os.projeto_ftth_id) {
      const projeto = await pool.query(
        "SELECT id FROM public.projetos_ftth WHERE id = $1",
        [os.projeto_ftth_id],
      );

      if (projeto.rowCount !== 1) {
        throw new Error(
          `Projeto FTTH não encontrado: ${os.projeto_ftth_id}`,
        );
      }
    }

    await pool.query(
      `
      INSERT INTO public.ordens_servico
      (
        id,
        numero,
        cliente_id,
        tipo,
        status,
        descricao,
        tecnico_id,
        projeto_ftth_id,
        cto_ref,
        porta_cto,
        endereco_atendimento,
        data_agendada,
        data_inicio,
        data_conclusao,
        valor,
        forma_pagamento,
        assinatura_cliente,
        observacoes_cliente,
        observacoes_internas,
        created_by,
        created_at,
        updated_at
      )
      VALUES
      (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19,
        $20, $21, $22
      )
      ON CONFLICT (id) DO NOTHING
      `,
      [
        os.id,
        os.numero,
        os.cliente_id,
        os.tipo,
        os.status,
        os.descricao,
        os.tecnico_id ?? null,
        os.projeto_ftth_id ?? null,
        os.cto_ref ?? null,
        os.porta_cto ?? null,
        os.endereco_atendimento ?? null,
        os.data_agendada ?? null,
        os.data_inicio ?? null,
        os.data_conclusao ?? null,
        os.valor ?? 0,
        os.forma_pagamento ?? null,
        os.assinatura_cliente ?? null,
        os.observacoes_cliente ?? null,
        os.observacoes_internas ?? null,
        os.created_by ?? null,
        os.created_at ?? new Date(),
        os.updated_at ?? new Date(),
      ],
    );

    console.log(`OK: OS #${os.numero}`);
  }

  const after = await pool.query(
    "SELECT COUNT(*)::int AS total FROM public.ordens_servico",
  );

  console.log("Local depois:", after.rows[0].total);

  const rows = await pool.query(
    `
    SELECT
      os.id,
      os.numero,
      os.tipo,
      os.status,
      os.cliente_id,
      c.nome AS cliente,
      os.created_by,
      u.email AS criado_por,
      os.tecnico_id,
      os.projeto_ftth_id
    FROM public.ordens_servico os
    JOIN public.clientes c
      ON c.id = os.cliente_id
    LEFT JOIN public.users u
      ON u.id = os.created_by
    ORDER BY os.numero
    `,
  );

  console.log("🛠️ Ordens de serviço no PostgreSQL:");

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