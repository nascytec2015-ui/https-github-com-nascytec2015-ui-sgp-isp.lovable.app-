require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

async function main() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .limit(1);

  if (error) {
    console.error("ERRO SUPABASE:", error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log("Nenhum registro encontrado em clientes no Supabase.");
    return;
  }

  console.log("Colunas existentes no Supabase:");
  console.table(
    Object.keys(data[0]).map(column_name => ({
      column_name
    }))
  );

  console.log("Primeiro registro:");
  console.dir(data[0], { depth: null });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
