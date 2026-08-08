```ts
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
  console.log("🔄 Teste controlado: profiles Supabase → PostgreSQL local\n");

  // --------------------------------------------------
  // 1. Ler profiles do Supabase
  // --------------------------------------------------

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*");

  if (error) {
    throw error;
  }

  console.log(`📥 Supabase: ${profiles.length} profiles encontrados`);

  // --------------------------------------------------
  // 2. Verificar users locais
  // --------------------------------------------------

  const users = await pool.query(
    `SELECT COUNT(*)::int AS total FROM public.users`,
  );

  console.log(
    `👥 PostgreSQL: ${users.rows[0].total} users existentes`,
  );

  // --------------------------------------------------
  // 3. Verificar profiles locais antes
  // --------------------------------------------------

  const before = await pool.query(
    `SELECT COUNT(*)::int AS total FROM public.profiles`,
  );

  console.log(
    `📊 Profiles antes: ${before.rows[0].total}`,
  );

  // --------------------------------------------------
  // 4. Inserir profiles
  // --------------------------------------------------

  for (const profile of profiles) {
    // Confirmar que o usuário existe
    const userCheck = await pool.query(
      `SELECT 1 FROM public.users WHERE id = $1`,
      [profile.id],
    );

    if (userCheck.rowCount === 0) {
      throw new Error(
        `Usuário ${profile.id} não existe no PostgreSQL local.`,
      );
    }

    await pool.query(
      `
      INSERT INTO public.profiles
      (
        id,
        full_name,
        created_at,
        updated_at
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4
      )
      ON CONFLICT (id) DO NOTHING
      `,
      [
        profile.id,
        profile.full_name ?? null,
        profile.created_at ?? new Date(),
        profile.updated_at ?? new Date(),
      ],
    );

    console.log(`✅ Profile processado: ${profile.id}`);
  }

  // --------------------------------------------------
  // 5. Verificar resultado
  // --------------------------------------------------

  const after = await pool.query(
    `SELECT COUNT(*)::int AS total FROM public.profiles`,
  );

  console.log(
    `\n📊 Profiles depois: ${after.rows[0].total}`,
  );

  // --------------------------------------------------
  // 6. Conferir dados locais
  // --------------------------------------------------

  const local = await pool.query(
    `
    SELECT
      p.id,
      p.full_name,
      p.created_at,
      p.updated_at
    FROM public.profiles p
    ORDER BY p.id
    `,
  );

  console.log("\n👤 Profiles no PostgreSQL local:");

  for (const row of local.rows) {
    console.log(row);
  }

  console.log("\n🎯 Teste de profiles concluído com sucesso.");
}

main()
  .catch((error) => {
    console.error("\n❌ Erro:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
```
