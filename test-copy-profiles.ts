import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";

const { Pool } = pg;

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  console.log("🔄 Copiando profiles...");

  const { data, error } = await supabase
    .from("profiles")
    .select("*");

  if (error) {
    throw error;
  }

  console.log("Supabase:", data.length);

  const before = await pool.query(
    "SELECT COUNT(*)::int AS total FROM public.profiles",
  );

  console.log("Local antes:", before.rows[0].total);

  for (const profile of data) {
    const check = await pool.query(
      "SELECT id FROM public.users WHERE id = $1",
      [profile.id],
    );

    if (check.rowCount !== 1) {
      throw new Error(
        `User não encontrado: ${profile.id}`,
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
      ($1, $2, $3, $4)
      ON CONFLICT (id) DO NOTHING
      `,
      [
        profile.id,
        profile.full_name ?? null,
        profile.created_at ?? new Date(),
        profile.updated_at ?? new Date(),
      ],
    );

    console.log("OK:", profile.id);
  }

  const after = await pool.query(
    "SELECT COUNT(*)::int AS total FROM public.profiles",
  );

  console.log("Local depois:", after.rows[0].total);
}

main()
  .catch((error) => {
    console.error("ERRO:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });