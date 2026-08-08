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
  console.log("🔄 Copiando user_roles...");

  const { data, error } = await supabase
    .from("user_roles")
    .select("*");

  if (error) {
    throw error;
  }

  console.log("Supabase:", data.length);

  const before = await pool.query(
    "SELECT COUNT(*)::int AS total FROM public.user_roles",
  );

  console.log("Local antes:", before.rows[0].total);

  for (const role of data) {
    const user = await pool.query(
      "SELECT id FROM public.users WHERE id = $1",
      [role.user_id],
    );

    if (user.rowCount !== 1) {
      throw new Error(
        `Usuário não encontrado: ${role.user_id}`,
      );
    }

    await pool.query(
      `
      INSERT INTO public.user_roles
      (
        id,
        user_id,
        role,
        created_at
      )
      VALUES
      ($1, $2, $3, $4)
      ON CONFLICT (id) DO NOTHING
      `,
      [
        role.id,
        role.user_id,
        role.role,
        role.created_at ?? new Date(),
      ],
    );

    console.log(
      `OK: ${role.role} → ${role.user_id}`,
    );
  }

  const after = await pool.query(
    "SELECT COUNT(*)::int AS total FROM public.user_roles",
  );

  console.log("Local depois:", after.rows[0].total);

  const rows = await pool.query(
    `
    SELECT
      ur.id,
      ur.user_id,
      ur.role,
      u.email
    FROM public.user_roles ur
    JOIN public.users u ON u.id = ur.user_id
    ORDER BY ur.created_at
    `,
  );

  console.log("👥 Roles no PostgreSQL:");

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