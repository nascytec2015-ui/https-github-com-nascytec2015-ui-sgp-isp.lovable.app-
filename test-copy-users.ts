/// <reference types="node" />

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";

const { Pool } = pg;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Configuração do Supabase não encontrada.");
}

const supabase = createClient(
  supabaseUrl,
  supabaseKey,
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  console.log("🔄 Teste controlado: Supabase → PostgreSQL local\n");

  // --------------------------------------------------
  // 1. Ler usuários do Supabase
  // --------------------------------------------------

  const { data: users, error } = await supabase
    .from("users")
    .select("*");

  if (error) {
    throw error;
  }

  console.log(`📥 Supabase: ${users.length} usuários encontrados`);

  // --------------------------------------------------
  // 2. Verificar PostgreSQL local antes
  // --------------------------------------------------

  const before = await pool.query(
    `SELECT COUNT(*)::int AS total FROM public.users`,
  );

  console.log(
    `📊 PostgreSQL antes: ${before.rows[0].total} usuários`,
  );

  // --------------------------------------------------
  // 3. Inserir usuários no PostgreSQL local
  // --------------------------------------------------

  for (const user of users) {
    await pool.query(
      `
      INSERT INTO public.users
      (
        id,
        email,
        nome,
        ativo,
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
        $6
      )
      ON CONFLICT (id) DO NOTHING
      `,
      [
        user.id,
        user.email,
        user.nome ?? null,
        user.ativo ?? true,
        user.created_at ?? new Date(),
        user.updated_at ?? new Date(),
      ],
    );

    console.log(`✅ Usuário processado: ${user.email}`);
  }

  // --------------------------------------------------
  // 4. Verificar PostgreSQL depois
  // --------------------------------------------------

  const after = await pool.query(
    `SELECT COUNT(*)::int AS total FROM public.users`,
  );

  console.log(
    `\n📊 PostgreSQL depois: ${after.rows[0].total} usuários`,
  );

  // --------------------------------------------------
  // 5. Conferir IDs
  // --------------------------------------------------

  const local = await pool.query(
    `
    SELECT
      id,
      email,
      nome,
      ativo
    FROM public.users
    ORDER BY email
    `,
  );

  console.log("\n👥 Usuários no PostgreSQL local:");

  for (const row of local.rows) {
    console.log(row);
  }

  console.log("\n🎯 Teste concluído.");
}

main()
  .catch((error) => {
    console.error("\n❌ Erro:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });